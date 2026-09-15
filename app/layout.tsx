import type { Metadata } from 'next'
import './globals.css'
import { practice } from '@/content/practice'
import { fontVariables } from '@/lib/fonts'

/**
 * The absolute origin OpenGraph and Twitter cards need, because a crawler
 * cannot resolve a relative image URL.
 *
 * [PLACEHOLDER: production domain]. The practice's real domain is not recorded
 * anywhere in this repo and is not something to guess at — a wrong canonical
 * URL on a medical site sends crawlers and share cards to someone else's
 * address. Set NEXT_PUBLIC_SITE_URL at build time. Until it is set this falls
 * back to localhost, which makes share previews fail visibly in development
 * rather than fail silently in production.
 */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

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
      <body>{children}</body>
    </html>
  )
}
