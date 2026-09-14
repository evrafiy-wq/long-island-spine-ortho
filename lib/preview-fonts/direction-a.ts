import { Libre_Franklin, Source_Serif_4 } from 'next/font/google'

/**
 * Direction A — Source Serif 4 + Libre Franklin.
 *
 * Source Serif 4 is a text-first transitional serif with a real optical-size
 * axis, drawn for extended reading. It is the only face in this phase that
 * holds both 18px body copy and a 44px headline without either being a
 * compromise, which is exactly what a journal's single-family typography does.
 * Setting BODY copy in the serif — not just the headlines — is what makes A
 * read academic rather than merely serif-headlined.
 *
 * Libre Franklin is a Franklin Gothic revival, the American news and
 * institutional grotesque. It supplies the flat, unfashionable, form-and-
 * signage voice for labels, record-card terms, captions and the phone number,
 * and never competes with the serif.
 *
 * One module per direction, and deliberately NO lib/fonts/index.ts barrel:
 * next/font is a build-time transform whose CSS imports are side-effectful and
 * are not tree-shaken, so a barrel would ship all six families' @font-face
 * blocks and preload hints to every preview route, silently.
 */

const serif = Source_Serif_4({
  subsets: ['latin'],
  axes: ['opsz'],
  variable: '--pv-a-serif',
  display: 'swap',
})

const sans = Libre_Franklin({
  subsets: ['latin'],
  variable: '--pv-a-sans',
  display: 'swap',
})

/** Applied to the direction's wrapper element alongside `data-direction="a"`. */
export const fontsA = `${serif.variable} ${sans.variable}`
