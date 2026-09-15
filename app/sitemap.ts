import type { MetadataRoute } from 'next'
import { practice } from '@/content/practice'
import { absoluteUrl } from '@/lib/siteUrl'

/**
 * Emitted at /sitemap.xml.
 *
 * The route list is DERIVED from `practice.footerLinks` and
 * `practice.legalLinks` rather than written out again. A hand-kept list is a
 * list that silently loses a page — and a page missing from the sitemap on a
 * site with seven of them is a measurable share of the practice's search
 * surface.
 *
 * `lastModified` is the build time, which is honest for a statically
 * prerendered site: every page is regenerated on every deploy. Per-page dates
 * would need either a CMS or git plumbing, and Google treats an obviously
 * synthetic `lastModified` as noise anyway.
 *
 * /admin is absent by construction, since it appears in neither link list.
 * robots.ts disallows it and the middleware sets `X-Robots-Tag: noindex` on
 * every response from it — three independent layers, because a patient inbox
 * appearing in a search index is not a recoverable mistake.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return [
    /** The homepage outranks the rest; everything else is peer-level. */
    { url: absoluteUrl('/'), lastModified, changeFrequency: 'monthly', priority: 1 },

    ...practice.footerLinks.map((link) => ({
      url: absoluteUrl(link.href),
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),

    ...practice.legalLinks.map((link) => ({
      url: absoluteUrl(link.href),
      lastModified,
      changeFrequency: 'yearly' as const,
      priority: 0.2,
    })),
  ]
}
