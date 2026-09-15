import { Analytics as VercelAnalytics } from '@vercel/analytics/next'

/**
 * Page-view measurement, off unless explicitly switched on.
 *
 * Vercel Analytics, and specifically NOT Google Analytics. That is a privacy
 * decision with a legal edge: GA sets identifying cookies, ships data to an
 * advertising company, and on a medical practice's site the pages a visitor
 * reads are themselves sensitive — "/services#spine" is a health signal. Using
 * it would drag advertising-purpose disclosures, cookie consent and a
 * defensible HIPAA answer about tracking technologies into the privacy notice.
 * Vercel Analytics is cookieless and does not build a cross-site profile,
 * which is why the privacy notice can describe it in two sentences.
 *
 * Gated on `NEXT_PUBLIC_ANALYTICS=vercel` rather than always-on. Nothing loads
 * in development or in a preview deploy, so local page views do not pollute
 * the numbers, and the practice can turn measurement off without a code change
 * if their compliance advice says to.
 */
export function Analytics() {
  if (process.env.NEXT_PUBLIC_ANALYTICS !== 'vercel') return null
  return <VercelAnalytics />
}
