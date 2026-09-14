import { IBM_Plex_Sans, Instrument_Sans } from 'next/font/google'

/**
 * The site's typefaces.
 *
 * Instrument Sans has short extenders and a tight geometric-humanist build
 * that stays cohesive at 76px under negative tracking — a display face that
 * does not read as decorative, which is what a clinical page needs at the top.
 *
 * IBM Plex Sans carries the body. It was drawn for technical documentation:
 * flat, distinctive terminals and a tall x-height that holds up at 17px, and
 * an engineered register that reads *precise* rather than *friendly*. The two
 * come from different genealogies, so the contrast between a 76px headline and
 * a 12px label is a contrast of structure, not just of size.
 *
 * These are applied to <html> in app/layout.tsx rather than to a wrapper, and
 * that placement is load-bearing: a custom property's value is substituted at
 * computed-value time on the element where it is DECLARED. `--font-display` is
 * declared at :root by the @theme block, so `--site-font-display` has to exist
 * at :root too. Put the className on a <div> instead and every heading
 * silently falls back to Times.
 */

const display = Instrument_Sans({
  subsets: ['latin'],
  variable: '--site-font-display',
  display: 'swap',
})

const body = IBM_Plex_Sans({
  subsets: ['latin'],
  // IBM Plex Sans on Google Fonts is static, not variable, so only these
  // discrete weights exist. The `meta` type step uses 500 for that reason.
  weight: ['400', '500', '600'],
  variable: '--site-font-body',
  display: 'swap',
})

export const fontVariables = `${display.variable} ${body.variable}`
