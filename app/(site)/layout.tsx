import { SiteChrome } from '@/components/site/SiteChrome'
import { StructuredData } from '@/components/site/StructuredData'

/**
 * Chrome for the public pages.
 *
 * The frame itself lives in components/site/SiteChrome.tsx so that
 * app/not-found.tsx can render the same one — see the note there.
 *
 * The JSON-LD graph is emitted here rather than per page: it describes the
 * practice, not the document, and Google reads structured data from any page
 * of a site. One definition in the chrome cannot drift from page to page the
 * way six copies would.
 */

/**
 * THERE IS NO `loading.tsx` IN THIS ROUTE GROUP, AND THAT IS DELIBERATE.
 *
 * Adding one was tried and reverted. A `loading.tsx` wraps its segment in a
 * Suspense boundary, and under streaming SSR React emits the real content into
 * a `<div hidden>` and relies on a script to move it into place. With
 * JavaScript disabled, that content is never revealed: every public page
 * rendered to an empty `<main>`, verified in the browser.
 *
 * These pages are statically prerendered, so in production the HTML is
 * complete and the boundary resolves at build time — but the failure is
 * exactly one `cookies()` call away from being real, and it fails silently and
 * totally. Section 1 of the brief requires the appointment form to work
 * without JavaScript; a loading skeleton on a page that renders instantly from
 * the edge is not worth putting that at risk.
 *
 * app/admin/loading.tsx is kept, because those routes are genuinely dynamic —
 * a session check plus a database round trip — and are used by staff on a
 * browser with scripting on.
 *
 * Error boundaries are unaffected and are present: app/(site)/error.tsx covers
 * every page below this layout, and app/global-error.tsx covers this layout.
 */

/**
 * The footer's copyright year is rendered on the server, so it would otherwise
 * freeze at build time. Regenerating daily lets it roll over without shipping
 * client JS to render a number.
 */
export const revalidate = 86400

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteChrome>
      <StructuredData />
      {children}
    </SiteChrome>
  )
}
