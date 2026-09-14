import type { Metadata } from 'next'
import './globals.css'
import { practice } from '@/content/practice'
import { fontVariables } from '@/lib/fonts'

export const metadata: Metadata = {
  title: {
    default: `${practice.name} | ${practice.contact.address.city}, ${practice.contact.address.state}`,
    template: `%s | ${practice.name}`,
  },
  description:
    'Long Island Spine and Orthopedics provides patient-focused spine, orthopedic, and rehabilitation care with Dr. Philip M. Rafiy, MD in Hicksville, New York.',
}

/**
 * Chrome and the `<main>` landmark live in the route groups, not here: the
 * five real pages share the site header/footer, and the two archived design
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
