import Link from 'next/link'
import { Glyph } from '@/components/site/Glyph'
import { UI } from '@/components/site/icons'
import { practice } from '@/content/practice'

/**
 * Direction B's answer to "phone reachable in one tap from any viewport,
 * always": a fixed bottom dock below 768px, with the phone moving into the
 * sticky header above it.
 *
 * A bottom dock rather than a top bar because thumb reach is the real
 * constraint on a phone, and this audience is holding the device one-handed
 * while in pain. Two targets, both 56px tall, side by side — call and request.
 *
 * Two details that are easy to get wrong:
 *  - `env(safe-area-inset-bottom)` so the dock clears the home indicator on a
 *    notched iPhone instead of sitting under it.
 *  - The page adds matching bottom padding (see the wrapper in page.tsx), so
 *    the dock never permanently covers the footer.
 *
 * It is the one element in B with a shadow, because a bar pinned over
 * scrolling content genuinely has to separate from it.
 */
export function CallDock() {
  const { phone } = practice.contact

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 bg-surface pb-[env(safe-area-inset-bottom)] elev-dock md:hidden"
      // Not a landmark: the same two actions exist in the header and the
      // closing CTA, so announcing a third navigation region would just add
      // noise for a screen-reader user.
    >
      {/* Both labels are existing copy — "Call {phone}" is on the current
          homepage and `navCta.label` is the site's own CTA. The appointment
          label wraps to two lines at 375px; that is deliberate, rather than
          inventing a shorter "Book now" that nobody approved. */}
      <div className="grid grid-cols-2 items-stretch gap-3 px-4 py-3">
        <a
          href={phone.href}
          className="flex min-h-[3.25rem] flex-col items-center justify-center gap-1 rounded-control border border-border-strong py-2 text-center font-[family-name:var(--pv-font-meta)] text-meta leading-tight font-semibold text-ink"
        >
          <Glyph as={UI.phone} />
          Call {phone.display}
        </a>
        <Link
          href={practice.navCta.href}
          className="flex min-h-[3.25rem] items-center justify-center rounded-control bg-accent px-2 py-2 text-center font-[family-name:var(--pv-font-meta)] text-meta leading-tight font-semibold text-on-accent"
        >
          {practice.navCta.label}
        </Link>
      </div>
    </div>
  )
}
