/**
 * Phase 3 logo candidates.
 *
 * Deliberately NOT in content/practice.ts: none of this is a practice fact.
 * It is design commentary on four proposals, and all of it gets deleted along
 * with app/(preview)/preview/logos once a direction is chosen.
 *
 * `w`/`h` are the exact viewBox dimensions of each file, needed because every
 * lockup is tight-cropped to its own ink and no two share an aspect ratio.
 * next/image wants the intrinsic size; the rendered size comes from a class.
 */

export interface Lockup {
  readonly w: number
  readonly h: number
}

export interface Direction {
  readonly id: 'd1' | 'd2' | 'd3' | 'd4'
  readonly n: number
  readonly name: string
  readonly thesis: string
  readonly typeface: string
  readonly license: string
  readonly instance: string
  readonly gives: string
  readonly markNote: string
  readonly lockups: {
    readonly horizontal: Lockup
    readonly stacked: Lockup
    readonly mark: Lockup
  }
}

export const DIRECTIONS: readonly Direction[] = [
  {
    id: 'd1',
    n: 1,
    name: 'Register',
    thesis:
      'The whole name on one line in a transitional serif, tightly tracked and optically corrected. No symbol, no second element, no colour. This is how a law firm or a hospital department signs itself: the name is the mark, and the only claim it makes is that it has been here a while.',
    typeface: 'Source Serif 4 — Frank Grießhammer for Adobe',
    license: 'SIL Open Font License 1.1',
    instance: 'wght 400, opsz 30',
    gives:
      'Everything modern. A serif at this width reads established, but it also reads older than the practice may want, and the one-line lockup is 14.6:1 — the widest of the four, which makes it the hardest to place on a phone.',
    markNote:
      'Letterforms cropped from the wordmark, not a symbol. Instanced heavier and at a text optical size so the hairlines survive 16px.',
    lockups: {
      horizontal: { w: 1464.8, h: 100.6 },
      stacked: { w: 952.2, h: 204.6 },
      mark: { w: 118.6, h: 118.6 },
    },
  },
  {
    id: 'd2',
    n: 2,
    name: 'Clinical',
    thesis:
      'All caps in a grotesque at medium weight, with LONG ISLAND letterspaced above the specialty. Flush left, no rule, no ornament. It matches the register of the rest of the site — hairlines, hard edges, no shadows — more exactly than any of the others.',
    typeface: 'Archivo — Omnibus Type',
    license: 'SIL Open Font License 1.1',
    instance: 'wght 500, wdth 100',
    gives:
      'Warmth, and any sense of a single physician. All-caps grotesque reads as an institution or a device manufacturer. It is also the least distinctive of the four: this is a very common register for clinical brands.',
    markNote:
      'The only direction whose mark is a shape rather than letters on paper. A solid plate with LI knocked out holds at 16px better than anything else here and is the strongest favicon of the set.',
    lockups: {
      horizontal: { w: 1322.8, h: 145.3 },
      stacked: { w: 747.9, h: 268.1 },
      mark: { w: 155.9, h: 155.9 },
    },
  },
  {
    id: 'd3',
    n: 3,
    name: 'Letterhead',
    thesis:
      'LONG ISLAND in small letterspaced sans caps above the specialty in a display serif. Two genealogies, one lockup, and the hierarchy is doing all the work — the horizontal version has no rule at all. It is the only direction that reads as a document rather than a logo.',
    typeface: 'Newsreader — Production Type · IBM Plex Sans — Mike Abbink, Bold Monday',
    license: 'SIL Open Font License 1.1 (both)',
    instance: 'Newsreader wght 400 opsz 26 · Plex wght 600',
    gives:
      'Simplicity. Two typefaces is two licences, two fallbacks and two things that can drift apart. It is also the most editorial of the four, which is a short distance from looking like a magazine masthead.',
    markNote:
      'Serif LI over the same rule the stacked lockup uses, so the monogram is recognisably from the same system rather than a separate drawing.',
    lockups: {
      horizontal: { w: 929.4, h: 139.2 },
      stacked: { w: 501.7, h: 267.7 },
      mark: { w: 165.9, h: 165.9 },
    },
  },
  {
    id: 'd4',
    n: 4,
    name: 'Emphasis',
    thesis:
      'One line, one typeface, two weights. The weight break falls exactly where "Long Island" ends and the specialty begins, so the lockup carries the spine-and-orthopedics emphasis itself instead of deferring it to page titles. It is set in IBM Plex Sans, which is already the site’s body face — the mark is made of the same material as the page under it.',
    typeface: 'IBM Plex Sans — Mike Abbink, Bold Monday',
    license: 'SIL Open Font License 1.1',
    instance: 'wght 400 and 600, wdth 100',
    gives:
      'Distinction. A logo set in the body typeface is coherent by construction and forgettable for the same reason — at a glance it can read as a heading rather than a mark. At 15.6:1 it is also the widest lockup of the four.',
    markNote:
      'The two-weight idea does not survive at 16px, so the monogram carries the split in colour instead.',
    lockups: {
      horizontal: { w: 1527.3, h: 97.8 },
      stacked: { w: 1008.8, h: 200.0 },
      mark: { w: 129.3, h: 129.3 },
    },
  },
]

/**
 * Measured, not estimated: the real header nav — five links plus the bordered
 * CTA, all `whitespace-nowrap` — occupies 726px, and `gap-6` puts 24px between
 * it and the lockup. Taken off a clone of the live header row at each width the
 * gutter token steps at, so it is the rendered width, not a guess from the copy.
 */
export const HEADER_NAV_WIDTH = 726
export const HEADER_GAP = 24

/** The page column: `measure` is min(--site-measure, 100% - 2 * gutter). */
function measureAt(viewport: number) {
  const gutter = viewport >= 1280 ? 56 : 40
  return Math.min(1320, viewport - 2 * gutter)
}

/** Space the header leaves for the wordmark at a given viewport width. */
export function headerSpaceAt(viewport: number) {
  return measureAt(viewport) - HEADER_NAV_WIDTH - HEADER_GAP
}

/**
 * The narrowest viewport at which this lockup fits beside the nav at `height`.
 * Inverts measureAt, then re-checks the gutter step the answer lands in — the
 * gutter grows at 1280, so a naive inversion can return a width whose own
 * gutter invalidates it.
 */
export function minViewportForHeader(direction: Direction, height: number) {
  const { w, h } = direction.lockups.horizontal
  const needed = (w / h) * height + HEADER_NAV_WIDTH + HEADER_GAP
  const narrow = needed + 80
  return narrow < 1280 ? Math.ceil(narrow) : Math.ceil(needed + 112)
}

export type Variant = '' | '-black' | '-reversed'

export function logoSrc(id: Direction['id'], lockup: keyof Direction['lockups'], v: Variant = '') {
  return `/logos/${id}-${lockup}${v}.svg`
}
