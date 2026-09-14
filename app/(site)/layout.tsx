import { ActionBar } from '@/components/site/ActionBar'
import { Glyph } from '@/components/site/Glyph'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { UI } from '@/components/site/icons'
import { practice } from '@/content/practice'

/**
 * Chrome for the five real pages.
 *
 * The sticky element is the ActionBar, not the header — it carries the phone
 * number at every width including 375, which is the "reachable in one tap from
 * any viewport" requirement. Before the redesign the phone number disappeared
 * entirely below 660px once the non-sticky utility bar scrolled away. Two
 * stacked sticky bars would eat 120px of a phone screen, so the header below
 * it scrolls normally.
 */

/**
 * The footer's copyright year is rendered on the server, so it would otherwise
 * freeze at build time. Regenerating daily lets it roll over without shipping
 * client JS to render a number.
 */
export const revalidate = 86400

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only bg-accent text-meta text-on-accent focus:not-sr-only focus:absolute focus:top-2 focus:left-1/2 focus:z-50 focus:measure focus:-translate-x-1/2 focus:px-4 focus:py-3"
      >
        Skip to main content
      </a>

      <ActionBar />
      <SiteHeader />

      <main id="main-content">{children}</main>

      {/* practice.emergencyNotice existed in the content file but was rendered
          nowhere on the old site. It belongs on every page of a medical
          practice, so it sits in the chrome rather than in one page. */}
      <aside className="border-t border-hairline">
        <p className="measure flex items-center gap-2 py-4 text-meta text-ink-muted">
          <Glyph as={UI.alert} />
          {practice.emergencyNotice}
        </p>
      </aside>

      <SiteFooter />
    </>
  )
}
