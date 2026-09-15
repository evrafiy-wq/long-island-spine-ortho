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

/**
 * Present-but-EMPTY counts as absent.
 *
 * `??` alone does not do this, and the difference is a broken build. A `.env`
 * line reading `NEXT_PUBLIC_SITE_URL=""` — the ordinary way to blank a
 * variable you do not want — is still a string, so the localhost fallback
 * below never fires, `siteUrl` becomes `''`, and the root layout's
 * `new URL(siteUrl)` throws `TypeError: Invalid URL` during `next build`. Next
 * reports that against `/_not-found` and names neither the variable nor this
 * file, so the documented "falls back to localhost" behaviour is a fiction
 * exactly when someone needs it.
 *
 * The `process.env.X` reads stay LITERAL. Next inlines `NEXT_PUBLIC_*` by
 * textual substitution at build time; a dynamic `process.env[name]` lookup is
 * not substituted, and this module is isomorphic, so that would leave the
 * value undefined in the browser bundle.
 */
const present = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

const vercelHost = present(process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL)

const fromEnv =
  present(process.env.NEXT_PUBLIC_SITE_URL) ?? (vercelHost ? `https://${vercelHost}` : undefined)

/** No trailing slash, ever — every caller appends its own path. */
export const siteUrl = (fromEnv ?? 'http://localhost:3000').replace(/\/+$/, '')

/** True when the origin above is still the development fallback. */
export const siteUrlIsPlaceholder = fromEnv === undefined

export function absoluteUrl(path: string): string {
  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`
}
