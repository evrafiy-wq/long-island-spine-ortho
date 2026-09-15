import type { Metadata } from 'next'
import { practice } from '@/content/practice'
import { isPortfolio } from '@/lib/siteMode'

interface PageMetadataInput {
  title: string
  description: string
  /** Route path, e.g. "/visit". Used for the canonical URL and og:url. */
  path: string
  /** Keep the page out of search results (the admin segment, legal drafts). */
  noindex?: boolean
}

/**
 * The share card, restated.
 *
 * `app/opengraph-image.png` is a Next file convention: it attaches itself to
 * the ROOT layout's metadata, and the homepage — which exports no metadata of
 * its own — inherits it intact. Every other page calls `pageMetadata()` below,
 * and because a declared `openGraph` object replaces the parent's wholesale
 * (see the note on the helper), the inherited image went with it. Seven of the
 * eight public routes were shipping share cards with no image at all.
 *
 * Restating it here is the fix. The URL is the static route Next generates for
 * that file — visible as `○ /opengraph-image.png` in the build output — and
 * `metadataBase` makes it absolute. It carries no content hash, unlike the
 * homepage's inherited copy; the route is immutable and cache-headed by Next,
 * so the only cost is a weaker cache key on a file that changes ~never.
 *
 * The alt text is BUILT FROM `practice` rather than typed out, so it cannot
 * state an address or a phone number the rest of the site disagrees with.
 * `app/opengraph-image.alt.txt` is the homepage's copy of this same sentence
 * and Next reads it off disk, so it cannot import this one: the two are a
 * documented pair, like the phone number in `app/global-error.tsx`. Change
 * both.
 */
const OG_IMAGE = {
  url: '/opengraph-image.png',
  width: 1200,
  height: 630,
  alt:
    `${practice.name} — Spine and orthopedic care at ` +
    `${practice.contact.address.oneLine}. ` +
    `Telephone ${practice.contact.phone.display}.`,
} as const

/**
 * Per-page metadata.
 *
 * Next merges `title` and `description` from the root layout, but NOT
 * `openGraph`: a child that declares any openGraph field replaces the parent's
 * object wholesale, and only `title`/`description` are back-filled. Every page
 * that wants a correct `og:url` therefore has to restate type, locale,
 * siteName AND the image, which is exactly the kind of per-file repetition
 * that drifts. One helper, one shape.
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
      images: [OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${practice.name}`,
      description,
      images: [OG_IMAGE],
    },
    /**
     * `noindex` is per-page (the admin segment, the legal drafts).
     * `isPortfolio` is per-deployment and covers everything — see
     * lib/siteMode.ts. Either one is enough to suppress the page, so they
     * are OR'd rather than layered, and production with no per-page flag
     * emits no `robots` key at all.
     */
    ...(noindex || isPortfolio ? { robots: { index: false, follow: false } } : {}),
  }
}
