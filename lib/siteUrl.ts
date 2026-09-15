/**
 * The site's absolute origin, in one place.
 *
 * Isomorphic on purpose — the sitemap, robots.txt, the JSON-LD graph, the
 * canonical tags and the links inside outgoing email all have to agree on this
 * string, and half of those run somewhere `import 'server-only'` would throw.
 *
 * [PLACEHOLDER: production domain] is still unresolved (BUILD-BRIEF.md Part 6
 * Step 1 picks it). Until `NEXT_PUBLIC_SITE_URL` is set this falls back to
 * localhost, which makes share previews and canonical tags fail VISIBLY in
 * development rather than silently pointing production at someone else's
 * address. Vercel's own `VERCEL_PROJECT_PRODUCTION_URL` is used ahead of the
 * fallback so a preview deploy is at least self-consistent.
 */

const fromEnv =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined)

/** No trailing slash, ever — every caller appends its own path. */
export const siteUrl = (fromEnv ?? 'http://localhost:3000').replace(/\/+$/, '')

/** True when the origin above is still the development fallback. */
export const siteUrlIsPlaceholder = fromEnv === undefined

export function absoluteUrl(path: string): string {
  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`
}
