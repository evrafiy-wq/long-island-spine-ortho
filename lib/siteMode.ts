/**
 * Portfolio mode vs. production mode, in one place.
 *
 * This site carries a real physician's name, credentials, street address and
 * telephone number. Deployed publicly and indexed, a person in Hicksville can
 * find it, submit an appointment request, and reasonably believe they have
 * contacted a surgeon's office. Whether that belief is TRUE depends on things
 * outside this repository — whether `OFFICE_EMAIL` reaches someone who reads
 * it, whether the front desk knows the form exists, whether counsel has seen
 * `/privacy`. See the launch blockers in docs/BACKEND.md.
 *
 * So the deployment carries a mode, and the mode has exactly one control:
 *
 *   NEXT_PUBLIC_SITE_MODE = "portfolio" (default) | "production"
 *
 * Portfolio mode does one thing and nothing else:
 *
 *   `noindex, nofollow` — as a meta tag (lib/metadata.ts, app/layout.tsx), as
 *   an `X-Robots-Tag` response header on every route (next.config.ts, because
 *   a header also covers the non-HTML routes), and as a blanket robots.txt
 *   disallow (app/robots.ts). Three layers because the meta tag is the only
 *   one crawlers actually honour, the header is the only one that covers the
 *   sitemap and the OG image, and robots.txt is the only one read before a
 *   fetch.
 *
 * Nothing else differs. The design, the copy, the forms and the backend are
 * byte-identical in both modes — a portfolio deployment that behaves
 * differently from the real thing is not evidence of anything.
 *
 * THIS IS THE CONTROL THAT MATTERS, and it is worth being clear about why.
 * The risk this file exists to manage is a patient submitting an appointment
 * request into a deployment whose other end nobody reads. `noindex` addresses
 * that at the only point where it is cheap to address: discovery. Nobody
 * arrives at an unindexed site by searching for an orthopedic surgeon, so the
 * only visitors are people who were handed the URL.
 *
 * The visible disclosure band below is a SEPARATE, WEAKER control, on its own
 * flag, defaulting to off. It only reaches someone who is already on the page
 * — which, with `noindex` on, is the author and whoever the author sent the
 * link to, neither of whom needs telling. It earns its keep only in the
 * combination this file cannot otherwise protect against: an INDEXED
 * deployment whose backend is not yet staffed.
 *
 * DEFAULTING TO PORTFOLIO IS THE POINT. An unset, misspelled or empty variable
 * yields the safe deployment; reaching production requires typing the word.
 * The failure mode of getting this backwards is a real patient sending a real
 * request into a database nobody reads, which is the one outcome
 * docs/BACKEND.md calls worse than having no form at all.
 *
 * Before flipping to "production", the launch blockers in docs/BACKEND.md have
 * to be answered — the office email, the legal review, and the HIPAA
 * determination. Note also that Vercel's Hobby plan is limited to personal,
 * non-commercial use, so a live practice site needs a paid plan.
 *
 * `NEXT_PUBLIC_` because the notice renders in the browser bundle. Isomorphic
 * for the same reason lib/siteUrl.ts is: robots.ts, the root layout's
 * metadata and a client component all have to agree on this value, and two of
 * those run where `import 'server-only'` would throw.
 */

export type SiteMode = 'portfolio' | 'production'

export const siteMode: SiteMode =
  process.env.NEXT_PUBLIC_SITE_MODE === 'production' ? 'production' : 'portfolio'

/** True unless the deployment has explicitly opted in to being the real site. */
export const isPortfolio = siteMode === 'portfolio'

/**
 * Whether to render the visible disclosure band in the site chrome.
 *
 * Independent of `siteMode`, and OFF unless explicitly set to "1". The two
 * were briefly one flag, which was wrong: it coupled a control that prevents
 * harm (`noindex`) to one that merely announces it, so removing the banner
 * would have silently removed the protection too. Splitting them means the
 * cosmetic decision cannot reach the safety one.
 *
 * Turn this ON for the one genuinely dangerous combination — an indexed
 * deployment carrying a real practice's real telephone number whose
 * appointment form does not yet reach a person who reads it. In that case the
 * band is the only thing standing between a patient and a false belief that
 * they have contacted a surgeon's office. See the launch blockers in
 * docs/BACKEND.md for what "reaches a person" requires.
 */
export const showPortfolioNotice = process.env.NEXT_PUBLIC_PORTFOLIO_NOTICE === '1'

/**
 * The `robots` value for Next's Metadata API, or `undefined` in production so
 * the field is omitted entirely rather than emitted as an explicit "index".
 *
 * Spread it — `...portfolioRobots` — so production adds no key at all.
 */
export const portfolioRobots = isPortfolio
  ? ({ robots: { index: false, follow: false } } as const)
  : ({} as const)
