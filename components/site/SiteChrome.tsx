import { ActionBar } from '@/components/site/ActionBar'
import { Glyph } from '@/components/site/Glyph'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { UI } from '@/components/site/icons'
import { practice } from '@/content/practice'

/**
 * The shared chrome: skip link, action bar, header, `<main>`, emergency
 * notice, footer.
 *
 * Extracted out of app/(site)/layout.tsx because app/not-found.tsx needs the
 * identical frame and cannot get it from that layout. For a URL that matches
 * no route at all, Next renders the ROOT not-found inside the ROOT layout
 * only — route-group layouts are not applied, because no route in the group
 * matched. Without this component the 404 page would be the one page on the
 * site with no header, no footer and, crucially, no phone number: the page
 * someone lands on after following a stale link from a directory listing.
 *
 * The sticky element is the ActionBar, not the header — it carries the phone
 * number at every width including 375. Two stacked sticky bars would eat 120px
 * of a phone screen, so the header below it scrolls normally.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
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
