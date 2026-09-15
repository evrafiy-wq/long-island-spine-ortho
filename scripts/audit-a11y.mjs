/**
 * axe-core accessibility audit, against the rendered DOM.
 *
 *   node scripts/audit-a11y.mjs                  # needs a server on :3000
 *   A11Y_BASE_URL=http://localhost:3100 node scripts/audit-a11y.mjs
 *
 * The complement to scripts/audit-contrast.mjs. That one reads the token file
 * and checks a hand-declared manifest of colour pairs; this one drives a real
 * browser over every public route and asks axe about everything else — names,
 * roles, landmarks, heading order, form labels, and the contrast pairs the
 * manifest does not know about because they are composed at runtime.
 *
 * Both matter. The token audit catches a bad colour before it renders; this
 * catches the pair nobody thought to declare.
 *
 * INTERACTIVE STATES ARE THE POINT. A scan of every page at rest misses the
 * markup most likely to be wrong: the mobile menu and the FAQ disclosures are
 * both closed on load. Each route entry below can open what it needs first,
 * and the same page is scanned once per state.
 *
 * Console and page errors are collected on the same pass, because loading
 * every route in a real browser is most of the cost and checking the console
 * is free once you are there.
 *
 * Exits non-zero on any violation so this can gate a commit.
 *
 * Kept as .mjs under scripts/ for the same reason audit-contrast.mjs is:
 * eslint.config.mjs ignores that path and tsc does not typecheck it.
 */

import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'
import { chromium, devices } from 'playwright'

const DIR = path.dirname(url.fileURLToPath(import.meta.url))
const AXE = path.join(DIR, '..', 'node_modules', 'axe-core', 'axe.min.js')
const BASE = (process.env.A11Y_BASE_URL ?? 'http://localhost:3000').replace(/\/+$/, '')

/**
 * The WCAG level the site claims. `best-practice` is included deliberately —
 * it is where landmark and heading-order rules live, and those are exactly the
 * regressions Phase 2 fixed and nobody wants back.
 *
 * `wcag22aa` matters more than it looks: `target-size` is a 2.2 rule, and the
 * 24px minimum target is one of the accessibility gates CLAUDE.md claims. Omit
 * the tag and axe never checks the thing the site promises.
 */
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa', 'best-practice']

/**
 * Every public route, plus the states worth opening.
 *
 * `open` runs in the page before the scan. It is written defensively — a
 * selector that stops matching should fail loudly here rather than silently
 * scanning the resting state and reporting a pass.
 */
const ROUTES = [
  { path: '/', name: 'home' },
  { path: '/about', name: 'about' },
  { path: '/services', name: 'services' },
  {
    path: '/patient-info',
    name: 'patient-info',
    states: [
      {
        label: 'all FAQ answers expanded',
        /**
         * Matched by id prefix, not by `button[aria-expanded]` — that also
         * catches the mobile nav toggle, which is display:none at desktop
         * width and hangs the click forever.
         */
        open: async (page) => {
          const triggers = page.locator('button[id^="faq-trigger-"]')
          const n = await triggers.count()
          if (n === 0) throw new Error('no FAQ disclosure buttons found')
          for (let i = 0; i < n; i++) await triggers.nth(i).click()
        },
      },
    ],
  },
  { path: '/visit', name: 'visit' },
  { path: '/contact', name: 'contact' },
  { path: '/privacy', name: 'privacy' },
  { path: '/terms', name: 'terms' },
  { path: '/nonexistent-page-for-404-scan', name: '404' },
]

/**
 * The condition guide has NO interactive state to open. It used to be a
 * tablist and is now plain `<section>`s — ConditionGuide.tsx explains why —
 * so every condition is in the DOM on load and the resting scan already
 * covers it. Nothing to add for / and /services.
 */

/** Viewports. The mobile pass also opens the nav, which only exists there. */
const VIEWPORTS = [
  { label: 'desktop', viewport: { width: 1440, height: 900 } },
  {
    label: 'mobile',
    ...devices['iPhone 13'],
    openNav: async (page) => {
      const toggle = page.locator('header button[aria-expanded]').first()
      if ((await toggle.count()) > 0) await toggle.click()
    },
  },
]

const axeSource = fs.readFileSync(AXE, 'utf8')

/* -- console / page error collection ------------------------------------ */

/**
 * Noise that is not the site's fault. Next's dev overlay and the Turnstile
 * script both log on a normal load; failing the audit on those would train
 * everyone to ignore it.
 */
const IGNORED_CONSOLE = [
  /Download the React DevTools/i,
  /\[Fast Refresh\]/i,
  /challenges\.cloudflare\.com/i,
  /Turnstile/i,
  /** The 404 route is REQUESTED as a 404. Chrome logs the status; not a bug. */
  /Failed to load resource: the server responded with a status of 404/i,
]

const violations = []
const consoleErrors = []

function recordConsole(page, where) {
  page.on('console', (msg) => {
    if (msg.type() !== 'error' && msg.type() !== 'warning') return
    const text = msg.text()
    if (IGNORED_CONSOLE.some((re) => re.test(text))) return
    consoleErrors.push({ where, type: msg.type(), text })
  })
  page.on('pageerror', (err) => {
    consoleErrors.push({ where, type: 'pageerror', text: String(err) })
  })
}

/* -- the run ------------------------------------------------------------- */

const browser = await chromium.launch()
let scans = 0

for (const vp of VIEWPORTS) {
  const { label: vpLabel, openNav, ...contextOptions } = vp
  const context = await browser.newContext(contextOptions)

  for (const route of ROUTES) {
    /** Every route is scanned at rest; `states` add extra passes on top. */
    const passes = [{ label: 'at rest', open: null }, ...(route.states ?? [])]

    for (const state of passes) {
      const where = `${vpLabel}  ${route.path}  (${state.label})`
      const page = await context.newPage()
      recordConsole(page, where)

      try {
        /**
         * `load`, not `networkidle`. The Google Maps embed on /visit and the
         * analytics beacon hold connections open long enough that networkidle
         * never settles, and the whole audit times out on pages that are
         * perfectly fine. `load` plus the explicit wait for <main> below is
         * both faster and a truer picture of what a visitor sees.
         */
        await page.goto(`${BASE}${route.path}`, { waitUntil: 'load' })
        await page.locator('main').first().waitFor({ state: 'attached' })
        if (openNav) await openNav(page)
        if (state.open) await state.open(page)

        await page.addScriptTag({ content: axeSource })
        const result = await page.evaluate(
          (tags) => window.axe.run(document, { runOnly: { type: 'tag', values: tags } }),
          TAGS,
        )
        scans++

        for (const v of result.violations) {
          violations.push({
            where,
            id: v.id,
            impact: v.impact,
            help: v.help,
            helpUrl: v.helpUrl,
            nodes: v.nodes.map((n) => ({
              target: n.target.join(' '),
              summary: n.failureSummary,
            })),
          })
        }

        const mark = result.violations.length === 0 ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m'
        console.log(`${mark} ${where}`)
      } catch (err) {
        violations.push({
          where,
          id: 'audit-error',
          impact: 'critical',
          help: `The audit itself failed: ${err.message}`,
          helpUrl: '',
          nodes: [],
        })
        console.log(`\x1b[31m✗\x1b[0m ${where}  — ${err.message}`)
      } finally {
        await page.close()
      }
    }
  }

  await context.close()
}

await browser.close()

/* -- report -------------------------------------------------------------- */

console.log(`\n${scans} scans across ${ROUTES.length} routes × ${VIEWPORTS.length} viewports.`)

if (violations.length > 0) {
  console.log(`\n\x1b[1m\x1b[31maxe violations\x1b[0m`)
  for (const v of violations) {
    console.log(`\n  \x1b[31m${v.id}\x1b[0m  [${v.impact}]  ${v.where}`)
    console.log(`    ${v.help}`)
    if (v.helpUrl) console.log(`    ${v.helpUrl}`)
    for (const n of v.nodes.slice(0, 5)) {
      console.log(`    → ${n.target}`)
      if (n.summary) console.log(`      ${n.summary.replace(/\n/g, '\n      ')}`)
    }
    if (v.nodes.length > 5) console.log(`    … and ${v.nodes.length - 5} more nodes`)
  }
}

if (consoleErrors.length > 0) {
  console.log(`\n\x1b[1m\x1b[33mconsole output\x1b[0m`)
  for (const c of consoleErrors) console.log(`  [${c.type}] ${c.where}\n    ${c.text}`)
}

const failed = violations.length > 0 || consoleErrors.length > 0
console.log(
  failed
    ? `\n\x1b[31m${violations.length} violation(s), ${consoleErrors.length} console message(s).\x1b[0m`
    : '\n\x1b[32mNo axe violations. No console errors.\x1b[0m',
)
process.exit(failed ? 1 : 0)
