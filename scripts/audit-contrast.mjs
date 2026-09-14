/**
 * WCAG 2.1 contrast audit.
 *
 *   node scripts/audit-contrast.mjs
 *
 * Reads the --color-* tokens out of app/styles/tokens.css — the live site's
 * palette — and then each app/styles/preview-*.css overlaid on top, and checks
 * the PAIRS MANIFEST below: the list of foreground / background combinations
 * the site actually uses.
 *
 * The manifest is the point. A script that just permutes every token against
 * every other token reports dozens of pairs nobody renders, which is how an
 * audit ends up green while the page fails. Declaring the real pairs by hand
 * is what makes the AA/AAA claim mean something. The rendered-DOM pass in the
 * browser is the complement: it catches pairs missing from this list.
 *
 * Exits non-zero on any failure so this can gate a commit.
 *
 * Kept as .mjs under scripts/ because eslint.config.mjs ignores that path and
 * tsc does not typecheck it — `const [r, g, b] = …` would otherwise trip
 * noUncheckedIndexedAccess.
 */

import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const DIR = path.dirname(url.fileURLToPath(import.meta.url))
const STYLES = path.join(DIR, '..', 'app', 'styles')

/* -- WCAG 2.1 relative luminance and contrast, on sRGB ------------------- */

const srgbToLinear = (channel) => {
  const c = channel / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

const luminance = ([r, g, b]) =>
  0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b)

const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

const parseHex = (hex) => {
  const h = hex.trim().replace('#', '')
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16))
}

/* -- Token extraction ----------------------------------------------------- */

/** Every `--color-x: #hex` in a file, last declaration wins. */
function readColorTokens(file) {
  const css = fs.readFileSync(file, 'utf8')
  const tokens = {}
  for (const m of css.matchAll(/--color-([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g)) {
    tokens[m[1]] = m[2]
  }
  return tokens
}

/* -- The manifest --------------------------------------------------------- */

/**
 * `level` is the bar this pair must clear.
 *   'AAA'   running prose. The brief requires AAA for body copy.
 *   'AA'    non-body text: labels, captions, metadata, button labels.
 *   'UI'    non-text boundaries and focus rings — WCAG 1.4.11, needs 3:1.
 */
const PAIRS = [
  { fg: 'ink', bg: 'canvas', use: 'body copy on page ground', level: 'AAA' },
  { fg: 'ink', bg: 'surface', use: 'body copy on raised panel', level: 'AAA' },
  { fg: 'ink', bg: 'sunken', use: 'body copy on full-bleed band', level: 'AAA' },
  { fg: 'ink-muted', bg: 'canvas', use: 'secondary prose, captions', level: 'AAA' },
  { fg: 'ink-muted', bg: 'surface', use: 'secondary prose on panel', level: 'AAA' },
  { fg: 'accent', bg: 'canvas', use: 'in-body links', level: 'AAA' },
  { fg: 'accent-hover', bg: 'canvas', use: 'in-body link hover', level: 'AAA' },
  { fg: 'on-accent', bg: 'accent', use: 'primary button label', level: 'AA' },
  { fg: 'ink-inv', bg: 'dark', use: 'body copy on inverted band', level: 'AAA' },
  { fg: 'ink-inv-muted', bg: 'dark', use: 'secondary text on inverted band', level: 'AA' },
  { fg: 'accent-inv', bg: 'dark', use: 'links on inverted band', level: 'AA' },
  { fg: 'border-strong', bg: 'canvas', use: 'field + control boundaries', level: 'UI' },
  { fg: 'border-strong', bg: 'surface', use: 'field boundaries on panel', level: 'UI' },
]

const THRESHOLD = { AAA: 7, AA: 4.5, UI: 3 }

/* -- Run ------------------------------------------------------------------ */

const siteTokens = readColorTokens(path.join(STYLES, 'tokens.css'))
const overlays = fs
  .readdirSync(STYLES)
  .filter((f) => /^preview-[a-z]\.css$/.test(f))
  .sort()

/** The live site first, then each archived preview overlaid on it. */
const palettes = [
  { name: 'Live site', file: 'styles/tokens.css', tokens: siteTokens },
  ...overlays.map((file) => ({
    name: `Archived preview ${file.replace('preview-', '').replace('.css', '').toUpperCase()}`,
    file: `styles/${file}`,
    tokens: { ...siteTokens, ...readColorTokens(path.join(STYLES, file)) },
  })),
]

let failures = 0

for (const { name, file, tokens } of palettes) {
  console.log(`\n\x1b[1m${name}\x1b[0m  (${file})`)
  console.log('  ' + 'pair'.padEnd(34) + 'ratio'.padEnd(9) + 'need'.padEnd(7) + 'use')

  for (const pair of PAIRS) {
    const fg = tokens[pair.fg]
    const bg = tokens[pair.bg]
    if (!fg || !bg) {
      console.log(
        `  \x1b[33m?\x1b[0m ${`${pair.fg} on ${pair.bg}`.padEnd(32)} missing token — skipped`,
      )
      continue
    }
    const ratio = contrast(parseHex(fg), parseHex(bg))
    const need = THRESHOLD[pair.level]
    const ok = ratio >= need
    if (!ok) failures++
    const mark = ok ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m'
    console.log(
      `  ${mark} ${`${pair.fg} on ${pair.bg}`.padEnd(32)}` +
        `${ratio.toFixed(2).padEnd(9)}${(pair.level + ' ' + need).padEnd(7)}${pair.use}`,
    )
  }
}

console.log(
  failures === 0
    ? '\n\x1b[32mAll declared pairs pass.\x1b[0m'
    : `\n\x1b[31m${failures} pair(s) below threshold.\x1b[0m`,
)
process.exit(failures === 0 ? 0 : 1)
