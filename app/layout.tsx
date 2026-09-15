import type { Metadata } from 'next'
import './globals.css'
import { Analytics } from '@/components/site/Analytics'
import { practice } from '@/content/practice'
import { fontVariables } from '@/lib/fonts'
import { portfolioRobots } from '@/lib/siteMode'
import { siteUrl } from '@/lib/siteUrl'

/**
 * The absolute origin OpenGraph and Twitter cards need, because a crawler
 * cannot resolve a relative image URL — now read from lib/siteUrl.ts, which is
 * the single source the sitemap, robots.txt, the JSON-LD graph, every
 * canonical tag and the links inside outgoing email all share. Those five have
 * to agree, and they cannot if each reads `process.env` for itself.
 *
 * [PLACEHOLDER: production domain] is still unresolved (BUILD-BRIEF.md Part 6,
 * Step 1). Until NEXT_PUBLIC_SITE_URL is set it falls back to localhost, which
 * makes share previews fail visibly in development rather than fail silently
 * in production.
 */

const description =
  'Long Island Spine and Orthopedics provides patient-focused spine, orthopedic, and rehabilitation care with Dr. Philip M. Rafiy, MD in Hicksville, New York.'

/**
 * The icon set and the OpenGraph image are NOT declared here. Next's file
 * conventions pick up app/favicon.ico, app/icon.png, app/apple-icon.png,
 * app/opengraph-image.png and app/manifest.ts on their own, emit the tags with
 * content-hashed URLs, and cannot drift out of sync with the files the way a
 * hand-written `icons` block does. Regenerate them all with
 * `node scripts/build-brand-assets.mjs`.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${practice.name} | ${practice.contact.address.city}, ${practice.contact.address.state}`,
    template: `%s | ${practice.name}`,
  },
  description,
  /**
   * The homepage's canonical. Inner pages override it through
   * `pageMetadata()` in lib/metadata.ts; a page that forgot to would inherit
   * this one and tell Google it is a duplicate of the homepage, so every
   * public route declares its own.
   */
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: practice.name,
    title: `${practice.name} | ${practice.contact.address.city}, ${practice.contact.address.state}`,
    description,
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: practice.name,
    description,
  },
  /**
   * The homepage's `noindex` in portfolio mode. Inner pages get theirs from
   * `pageMetadata()`; this layout is the only place the homepage's metadata is
   * declared, so it has to be restated here. Empty object in production.
   * See lib/siteMode.ts.
   */
  ...portfolioRobots,
}

/**
 * Chrome and the `<main>` landmark live in the route groups, not here: the
 * five real pages share the site header/footer, and the archived design
 * previews under app/(preview) supply their own. Next only requires <html>
 * and <body> at the root.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
