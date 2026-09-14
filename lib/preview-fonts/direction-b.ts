import { Newsreader, Public_Sans } from 'next/font/google'

/**
 * Direction B — Newsreader + Public Sans.
 *
 * Newsreader was drawn for on-screen reading: low stroke contrast, open
 * apertures, a true optical-size axis, and a warm, unfussy letterform. Used
 * for BOTH headings and body, it makes the page feel written rather than
 * assembled — hierarchy comes from optical size and weight inside one voice,
 * which is what a letter does and what a brand system does not. Its italic is
 * loaded because B uses a real italic (not an oblique) on the hero's emphasis,
 * and that is the one place B lets type carry warmth.
 *
 * Public Sans is the US Web Design System's face, built against federal
 * accessibility requirements. It is deliberately plain, so it never competes
 * with the serif, and it gives the functional layer — phone, hours, buttons,
 * step numbers — an unglamorous, trustworthy register.
 */

const serif = Newsreader({
  subsets: ['latin'],
  axes: ['opsz'],
  style: ['normal', 'italic'],
  variable: '--pv-b-serif',
  display: 'swap',
})

const sans = Public_Sans({
  subsets: ['latin'],
  variable: '--pv-b-sans',
  display: 'swap',
})

export const fontsB = `${serif.variable} ${sans.variable}`
