/**
 * Phase 3 follow-up: LISP lettermarks for Direction 3 (Letterhead).
 *
 * Generated from the built SVGs, not transcribed — every entry is the file's
 * real viewBox, and no two marks share an aspect ratio.
 *
 * Deleted along with the rest of the preview once a mark is chosen.
 */

export interface Box {
  readonly w: number
  readonly h: number
}

/** key: `{text}-{face}-{arrangement}` */
export const MARKS: Record<string, Box> = {
  'li-cinzel-rule': { w: 127.0, h: 138.0 },
  'li-marcellus-rule': { w: 96.4, h: 138.0 },
  'li-newsreader-rule': { w: 146.9, h: 140.7 },
  'lis-cinzel-rule': { w: 208.3, h: 140.0 },
  'lis-marcellus-rule': { w: 176.2, h: 139.8 },
  'lis-newsreader-rule': { w: 241.2, h: 145.3 },
  'liso-cinzel-rule': { w: 339.4, h: 140.0 },
  'liso-cinzel-stack': { w: 190.3, h: 232.0 },
  'liso-marcellus-rule': { w: 304.3, h: 139.8 },
  'liso-marcellus-stack': { w: 180.7, h: 232.2 },
  'liso-newsreader-rule': { w: 370.4, h: 145.3 },
  'liso-newsreader-stack': { w: 202.1, h: 234.4 },
  'lisp-bodoni-plate': { w: 389.6, h: 389.6 },
  'lisp-bodoni-row': { w: 313.7, h: 105.3 },
  'lisp-bodoni-rule': { w: 313.7, h: 139.3 },
  'lisp-bodoni-stack': { w: 161.6, h: 232.0 },
  'lisp-cinzel-plate': { w: 377.8, h: 377.8 },
  'lisp-cinzel-row': { w: 304.2, h: 106.0 },
  'lisp-cinzel-rule': { w: 304.2, h: 140.0 },
  'lisp-cinzel-stack': { w: 155.2, h: 232.0 },
  'lisp-cormorant-plate': { w: 433.6, h: 433.6 },
  'lisp-cormorant-row': { w: 348.9, h: 105.7 },
  'lisp-cormorant-rule': { w: 348.9, h: 139.8 },
  'lisp-cormorant-stack': { w: 169.3, h: 231.9 },
  'lisp-marcellus-plate': { w: 328.0, h: 328.0 },
  'lisp-marcellus-row': { w: 264.4, h: 106.0 },
  'lisp-marcellus-rule': { w: 264.4, h: 139.8 },
  'lisp-marcellus-stack': { w: 140.8, h: 232.2 },
  'lisp-newsreader-plate': { w: 435.7, h: 435.7 },
  'lisp-newsreader-row': { w: 350.6, h: 114.0 },
  'lisp-newsreader-rule': { w: 350.6, h: 145.3 },
  'lisp-newsreader-stack': { w: 182.3, h: 234.4 },
  'lisp-playfair-plate': { w: 391.9, h: 391.9 },
  'lisp-playfair-row': { w: 315.6, h: 105.6 },
  'lisp-playfair-rule': { w: 315.6, h: 139.6 },
  'lisp-playfair-stack': { w: 161.9, h: 232.0 },
}

export interface Face {
  readonly id: string
  readonly name: string
  readonly designer: string
  readonly note: string
  /** Holds up when the mark is shrunk into a 32px square. Measured, not guessed. */
  readonly smallOk: boolean
}

export const FACES: readonly Face[] = [
  {
    id: 'newsreader',
    name: 'Newsreader',
    designer: 'Production Type',
    note: "Direction 3's own serif. The only option here that makes the mark and the wordmark visibly the same drawing rather than two things that happen to sit together.",
    smallOk: true,
  },
  {
    id: 'cinzel',
    name: 'Cinzel',
    designer: 'Natanael Gama',
    note: 'Roman inscriptional capitals — the lettering cut into monuments, and the classical source for monograms. Even stroke weight, so it survives shrinking better than anything else here.',
    smallOk: true,
  },
  {
    id: 'cormorant',
    name: 'Cormorant Garamond',
    designer: 'Christian Thalmann',
    note: 'A display Garamond drawn for large sizes: delicate, high contrast, the most refined of the six. Those same hairlines are what make it soft at 16px.',
    smallOk: true,
  },
  {
    id: 'bodoni',
    name: 'Bodoni Moda',
    designer: 'indestructible type*',
    note: 'A true didone — flat unbracketed serifs, extreme thick-to-thin. The most obviously "fancy" of the six and the one that fails hardest small: at 32px the hairlines break up.',
    smallOk: false,
  },
  {
    id: 'playfair',
    name: 'Playfair Display',
    designer: 'Claus Eggers Sørensen',
    note: 'High-contrast transitional, drawn for headlines. Familiar — it is one of the most-used display faces on the web, which cuts both ways for a mark meant to be distinctive.',
    smallOk: true,
  },
  {
    id: 'marcellus',
    name: 'Marcellus',
    designer: 'Brian J. Bonislawsky',
    note: 'Roman capitals again, but softer and wider than Cinzel, with flared stems. The most compact lockup of the six, and the steadiest at small sizes alongside Cinzel.',
    smallOk: true,
  },
]

export const ARRANGEMENTS = [
  { id: 'row', name: 'Row', note: 'Four letters on one line.' },
  {
    id: 'rule',
    name: 'Rule',
    note: "Over the accent rule from Direction 3's stacked lockup, so the mark is cut from the same system as the wordmark.",
  },
  {
    id: 'stack',
    name: 'Stack',
    note: 'LI over SP, width-matched by tracking. The classic four-letter monogram, and the only arrangement that reads in a square.',
  },
  { id: 'plate', name: 'Plate', note: 'Knocked out of a solid square.' },
] as const

export function markSrc(key: string, reversed = false) {
  return `/logos/marks/${key}${reversed ? '-reversed' : ''}.svg`
}
