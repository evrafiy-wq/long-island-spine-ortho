import type { Metadata } from 'next'
import { DM_Sans, DM_Serif_Display } from 'next/font/google'
import './globals.css'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { UtilityBar } from '@/components/layout/UtilityBar'
import { practice } from '@/content/practice'

// Self-hosted by next/font, replacing the render-blocking Google Fonts <link>
// the static site used. globals.css maps these onto --font-sans / --font-serif.
const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const dmSerifDisplay = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-dm-serif',
  display: 'swap',
})

/**
 * Every route is static, so the footer's copyright year would otherwise be
 * frozen at build time. Regenerating daily lets it roll over on its own
 * without shipping client JS just to render a number.
 */
export const revalidate = 86400

export const metadata: Metadata = {
  title: {
    default: `${practice.name} | ${practice.contact.address.city}, ${practice.contact.address.state}`,
    template: `%s | ${practice.name}`,
  },
  description:
    'Long Island Spine and Orthopedics provides patient-focused spine, orthopedic, and rehabilitation care with Dr. Philip M. Rafiy, MD in Hicksville, New York.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmSerifDisplay.variable}`}>
      <body>
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <UtilityBar />
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
