import type { MetadataRoute } from 'next'
import { isPortfolio } from '@/lib/siteMode'
import { absoluteUrl } from '@/lib/siteUrl'

/**
 * Emitted at /robots.txt.
 *
 * `/admin` and `/api` are disallowed, but a robots.txt is a REQUEST, not a
 * control — it is advisory, publicly readable, and ignored by anything
 * malicious. The actual protection is the middleware; this exists so
 * well-behaved crawlers do not waste the site's crawl budget on routes that
 * will only ever redirect them to a sign-in page.
 *
 * Auth.js's own endpoints under /api/auth are covered by the /api rule.
 */
export default function robots(): MetadataRoute.Robots {
  /**
   * Portfolio mode disallows the whole origin and publishes no sitemap — a
   * sitemap's only purpose is to invite crawling, so advertising one while
   * disallowing everything is a contradiction a crawler resolves unhelpfully.
   *
   * This is the weakest of the three noindex layers and the least trusted: it
   * is advisory, publicly readable, and ignored by anything malicious. The
   * meta tag and the `X-Robots-Tag` header do the real work. It earns its
   * place by being the only one read BEFORE the fetch. See lib/siteMode.ts.
   */
  if (isPortfolio) {
    return {
      rules: { userAgent: '*', disallow: '/' },
    }
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/admin/', '/api/'],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
    /**
     * No `host` directive. It was only ever supported by Yandex, it is
     * deprecated there too, and Next emits whatever string it is given — which
     * produced `Host: http://localhost:3000/`, a full URL with a trailing
     * slash where the directive expects a bare hostname. A malformed line that
     * one search engine ignores and the rest never read is worth nothing.
     */
  }
}
