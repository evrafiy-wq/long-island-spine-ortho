# Phase 3 — logo and wordmark

**Adopted: Direction 3, "Letterhead."** LONG ISLAND in small letterspaced sans
caps (IBM Plex Sans 600) above the specialty in a display serif (Newsreader,
opsz 26). It is in the header and footer, the favicon set and the OpenGraph
image are generated from it, and the old `public/logo.svg` badge is deleted.

The four candidates remain at **`/preview/logos`** for reference.

## Where the files are

| Path                                  | What                                       |
| ------------------------------------- | ------------------------------------------ |
| `public/brand/wordmark*.svg`          | Horizontal lockup — brand, black, reversed |
| `public/brand/wordmark-stacked*.svg`  | Stacked lockup — brand, black, reversed    |
| `public/brand/monogram*.svg`          | LI monogram — brand, black, reversed       |
| `public/brand/opengraph*.svg`         | 1200×630 master, outlined                  |
| `app/favicon.ico`                     | 16 + 32 + 48, multi-resolution             |
| `app/icon.png` · `app/apple-icon.png` | 32 · 180                                   |
| `public/icons/icon-{192,512}.png`     | Referenced by `app/manifest.ts`            |
| `public/icons/icon-maskable-512.png`  | Android maskable, artwork inset to 46%     |
| `app/opengraph-image.png`             | Rasterised from the master                 |

Regenerate every raster from the SVG masters — no font files needed, they are
outlined:

```bash
node scripts/build-brand-assets.mjs
```

Two decisions worth knowing. **Every icon is the monogram reversed out of the
site's dark ground**, not ink on transparent: a transparent favicon carrying
`#0e1114` letterforms is invisible against a dark browser tab strip, and iOS
composites a transparent apple-touch-icon onto black. And **the header steps
the wordmark at `xl`, not `lg`** — the desktop nav is 726px wide and appears at
`lg`, leaving 194px at 1024px and 418px at 1280px; 28px of lockup is 187px and
clears the first, 36px is 240px and only clears the second.

## Still open

`metadataBase` is a `[PLACEHOLDER: production domain]`. The practice's real
domain is not recorded anywhere in this repo, and a wrong canonical URL on a
medical site points crawlers and share cards at someone else's address. Set
`NEXT_PUBLIC_SITE_URL` at build time; until then it falls back to localhost, so
share previews fail visibly in development rather than silently in production.

## The name

Settled: **Long Island Spine and Orthopedics**, spelled out in full in every
lockup of every direction. No abbreviation appears anywhere.

Still open, and worth deciding before the favicon set is generated:

- **The ampersand.** The registered name in the CMS NPPES registry is
  `Long Island Spine & Orthopedics, PC` (held as `practice.legalName`). Every
  lockup here uses "and", matching what the site displays today. An ampersand
  would take roughly a word and a half off the widest line, which matters for
  directions 1 and 4.

## The four directions

| #   | Name       | Structure                                | Typeface(s)                |
| --- | ---------- | ---------------------------------------- | -------------------------- |
| 1   | Register   | Whole name, one line, transitional serif | Source Serif 4             |
| 2   | Clinical   | All caps grotesque, letterspaced eyebrow | Archivo                    |
| 3   | Letterhead | Sans caps eyebrow over a display serif   | Newsreader + IBM Plex Sans |
| 4   | Emphasis   | One line, one face, two weights          | IBM Plex Sans              |

## Typeface licensing — checked, not assumed

All four are **SIL Open Font License 1.1**, verified against the `OFL.txt`
shipped in each font's own directory in `github.com/google/fonts`:

| Typeface       | Copyright holder                                 | Licence     |
| -------------- | ------------------------------------------------ | ----------- |
| Source Serif 4 | The Source Serif 4 Project Authors (Adobe)       | SIL OFL 1.1 |
| Archivo        | The Archivo Project Authors (Omnibus Type)       | SIL OFL 1.1 |
| Newsreader     | The Newsreader Project Authors (Production Type) | SIL OFL 1.1 |
| IBM Plex Sans  | IBM Corp., Reserved Font Name "Plex"             | SIL OFL 1.1 |

The OFL permits commercial use and explicitly permits outlining glyphs into a
logo. There is no royalty, no registration, and no attribution requirement on
the mark. The Reserved Font Name on Plex restricts naming a _modified font_,
not using the outlines in a wordmark.

## How the files were made

All type is converted to outlined paths — no font file is needed to render any
of them. Each was set by instancing the variable font at fixed axis values,
shaping with HarfBuzz so real GPOS kerning applies, then pulling each glyph
outline into SVG userspace.

| Direction | Instance                                         | Tracking                                    |
| --------- | ------------------------------------------------ | ------------------------------------------- |
| 1         | Source Serif 4 `wght 400, opsz 30`               | −0.014em, plus per-pair optical corrections |
| 2         | Archivo `wght 500, wdth 100`                     | +0.02em name, +0.32em eyebrow               |
| 3         | Newsreader `wght 400, opsz 26` · Plex `wght 600` | −0.004em name, +0.26em eyebrow              |
| 4         | IBM Plex Sans `wght 400` and `wght 600`          | −0.018em                                    |

**Optical size is a decision, not a default.** One file has to serve a 24px
header and a 200px sign, so the two serifs are instanced near the middle of
their `opsz` axis rather than at the display end — at `opsz 60`/`72` the
hairlines vanish at 24px. The monograms go the other way and instance at a text
optical size and a heavier weight, because they are only ever seen small.

## One finding worth weighing

The desktop nav appears at 1024px and measures **726px** wide (five links plus
the bordered CTA, all `whitespace-nowrap`). With the 24px `gap-6`, that leaves
194px for the wordmark at 1024 and 570px at 1440. At a 32px lockup height:

| #   | Width at 32px | Clears the nav from |
| --- | ------------- | ------------------- |
| 1   | 466px         | 1328px              |
| 2   | 291px         | 1122px              |
| 3   | 214px         | 1044px              |
| 4   | 500px         | 1362px              |

So directions 1 and 4 — the two single-line lockups — do not fit beside the nav
on anything narrower than a wide desktop, despite the nav being present from
1024px. Picking either means also deciding what the header does between 1024
and ~1350: a smaller wordmark, the stacked lockup, or a shorter nav. Directions
2 and 3 have no such gap. This is measured off the live header, not estimated.

## Lettermarks for Direction 3

`/preview/logos/marks` — "LISP" in six display serifs (Newsreader, Cinzel,
Cormorant Garamond, Bodoni Moda, Playfair Display, Marcellus), four
arrangements each, all SIL OFL 1.1. Files under `public/logos/marks/`, brand
and reversed only; the monochrome-black print variant gets generated for
whichever mark is chosen. Every one is under 1.9 KB.

Three things the build turned up:

- **"Lisp" is an English word for a speech impediment.** On a medical practice
  that association is immediate. The alternates section shows the identical
  treatment set as LISO, LIS and LI so the comparison is direct.
- **Bodoni Moda fails small.** It is the most obviously "fancy" of the six and
  its didone hairlines come apart at 32px, let alone 16px. Cinzel and Marcellus
  — Roman inscriptional capitals, far more even in stroke weight — hold up best.
- **Sizing a mark by height is the wrong favicon test**, and it gives the
  opposite answer. A two-line stack set to 16px _tall_ halves every letter, so
  the single row looks better. Letterboxed into a 16px _square_, which is what
  a favicon actually does, the row is four letters sharing sixteen pixels of
  width and the stack clearly wins. At 16px no four-letter mark is comfortable
  in any of the six faces, which is an argument for a two-letter favicon beside
  a four-letter lettermark used larger.

## Files

`public/logos/{d1..d4}-{horizontal,stacked,mark}[-black|-reversed].svg` — 36
files. Every direction has a horizontal lockup, a stacked lockup, a monogram,
and black and reversed-white variants of each.

Optimised with SVGO at `floatPrecision 1` (0.001em — a fifth of a pixel at the
200px size). Repeated glyph outlines are emitted once into `<defs>` and placed
with `<use>`; the wordmark is 32 glyphs but only 18 distinct ones.

**Sizes.** The monograms are 0.36–0.50 KB. The wordmarks are 4.9–7.2 KB on
disk, 2.2–3.1 KB gzipped — over the 4 KB target on disk, under it over the
wire. Getting a 33-character serif wordmark under 4 KB uncompressed means
coarsening the outlines: dropping to integer coordinates gets `d1-horizontal`
to 6.1 KB and raises mean pixel error from 0.7 to 11.4 out of 255, which is
visible. That trade was not made. Say the word if you want it anyway.

## Not done yet

- `favicon.ico`, 32/180/192/512 PNGs, `apple-touch-icon`, `site.webmanifest`
- OpenGraph image at 1200×630, plus the `openGraph`/`twitter` metadata —
  `app/layout.tsx` currently declares neither
- Repointing `practice.brand.logo` and rebuilding the header lockup: the
  wordmark already contains the name, so `SiteHeader`'s icon-plus-two-lines
  arrangement becomes redundant
- Deleting the losing candidates, `app/(preview)/preview/logos` and
  `components/preview/logos`
