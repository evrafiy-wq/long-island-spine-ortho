import type { Metadata } from 'next'
import { practice } from '@/content/practice'

interface PageMetadataInput {
  title: string
  description: string
  /** Route path, e.g. "/visit". Used for the canonical URL and og:url. */
  path: string
  /** Keep the page out of search results (the admin segment, legal drafts). */
  noindex?: boolean
}

/**
 * Per-page metadata.
 *
 * Next merges `title` and `description` from the root layout, but NOT
 * `openGraph`: a child that declares any openGraph field replaces the parent's
 * object wholesale, and only `title`/`description` are back-filled. Every page
 * that wants a correct `og:url` therefore has to restate type, locale and
 * siteName, which is exactly the kind of per-file repetition that drifts. One
 * helper, one shape.
 *
 * `alternates.canonical` is relative on purpose — `metadataBase` in the root
 * layout resolves it, so the canonical host comes from one place.
 */
export function pageMetadata({
  title,
  description,
  path,
  noindex = false,
}: PageMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      siteName: practice.name,
      title: `${title} | ${practice.name}`,
      description,
      url: path,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${practice.name}`,
      description,
    },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  }
}
