import Link from 'next/link'
import { Glyph } from '@/components/site/Glyph'
import { SiteChrome } from '@/components/site/SiteChrome'
import { UI } from '@/components/site/icons'
import { practice } from '@/content/practice'

export const metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
}

/**
 * 404.
 *
 * This file is at the ROOT of app/, not inside app/(site)/, because Next only
 * uses the root `not-found` for a URL that matched no route at all — and it
 * renders it inside the root layout only, with no route-group layout applied.
 * That is why it renders `SiteChrome` itself: without it, the one page a
 * visitor reaches by following a dead link from a stale directory listing
 * would be the only page on the site with no phone number on it.
 *
 * It offers real destinations rather than a "go back" button. Somebody who
 * arrived here from a search for an orthopedic surgeon wants the appointment
 * form or the phone, and the page should hand them both.
 */
export default function NotFound() {
  const { phone } = practice.contact

  return (
    <SiteChrome>
      <section className="block-y">
        <div className="measure">
          <p className="text-label text-ink-muted uppercase">Error 404</p>
          <h1 className="max-w-[20ch] pt-6 font-display text-display text-balance text-ink">
            We could not find that page.
          </h1>
          <p className="max-w-lede pt-7 text-lede text-ink-muted">
            The link may be out of date, or the address may have been mistyped. Everything on the
            site is reachable from the links below.
          </p>

          <div className="grid gap-10 pt-12 md:grid-cols-[1fr_1fr] xl:gap-20">
            <nav aria-label="Main pages">
              <h2 className="text-label text-ink-muted uppercase">Go to</h2>
              <ul className="pt-4">
                <li className="border-t border-hairline">
                  <Link
                    href="/"
                    className="flex min-h-14 items-center justify-between gap-4 py-4 font-display text-subtitle tracking-tight text-ink transition-state hover:text-accent"
                  >
                    Home
                    <Glyph as={UI.arrowRight} />
                  </Link>
                </li>
                {practice.footerLinks.map((link) => (
                  <li key={link.href} className="border-t border-hairline">
                    <Link
                      href={link.href}
                      className="flex min-h-14 items-center justify-between gap-4 py-4 font-display text-subtitle tracking-tight text-ink transition-state hover:text-accent"
                    >
                      {link.label}
                      <Glyph as={UI.arrowRight} />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="border border-hairline p-6 md:self-start">
              <Link
                href={practice.navCta.href}
                className="flex min-h-[3.25rem] items-center justify-between gap-3 rounded-control bg-accent px-5 text-meta font-semibold text-on-accent transition-state hover:bg-accent-hover"
              >
                {practice.navCta.label}
                <Glyph as={UI.arrowRight} />
              </Link>
              <a
                href={phone.href}
                className="mt-5 flex items-baseline justify-between gap-3 border-t border-hairline pt-5 transition-state hover:text-accent"
              >
                <span className="text-label text-ink-muted uppercase">Or call us at</span>
                <span className="font-display text-subtitle tracking-tight text-ink">
                  {phone.display}
                </span>
              </a>
              <p className="mt-5 border-t border-hairline pt-5 text-meta text-ink-muted">
                {practice.hours.summary}
              </p>
            </div>
          </div>
        </div>
      </section>
    </SiteChrome>
  )
}
