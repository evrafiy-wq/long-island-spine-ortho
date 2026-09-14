import type { Direction } from '@/components/preview/logos/logoSet'
import { Lockup } from '@/components/preview/logos/Lockup'
import { Glyph } from '@/components/site/Glyph'
import { UI } from '@/components/site/icons'
import { practice } from '@/content/practice'
import { cx } from '@/lib/cx'

interface ChromeInSituProps {
  direction: Direction
  lockup: keyof Direction['lockups']
  height: number
  /** 375 renders the narrow case inside a fixed frame; 'full' uses the page width. */
  frame?: 375 | 'full'
}

/**
 * The real action bar and header, with a candidate wordmark in place of the
 * current icon-plus-two-lines lockup.
 *
 * This is a visual replica, not the live components. Two reasons: SiteHeader
 * is a client component whose only state is the mobile menu, which a static
 * specimen does not need; and rendering four copies of the real chrome would
 * put four <header> and four <nav aria-label="Primary"> landmarks on one page,
 * which wrecks the landmark tree of the review page itself. Every class below
 * is copied from the real components, so what you are looking at is accurate —
 * but nothing here is a landmark.
 *
 * The 375 frame overrides --spacing-gutter locally because the token is retuned
 * by a media query against the real viewport, and the real viewport is a
 * desktop one. The header only uses --text-meta and --text-label, neither of
 * which steps at a breakpoint, so the rest of the frame is faithful.
 */
export function ChromeInSitu({ direction, lockup, height, frame = 'full' }: ChromeInSituProps) {
  const { phone, address } = practice.contact
  const narrow = frame === 375

  return (
    <div
      className={cx('border border-hairline', narrow && 'w-[375px] max-w-full')}
      style={narrow ? ({ '--spacing-gutter': '1.25rem' } as React.CSSProperties) : undefined}
    >
      <div className="bg-dark text-ink-inv">
        <div className="measure flex h-14 items-center justify-between gap-4">
          <p className="text-label text-ink-inv-muted uppercase">
            {narrow ? `${address.city}, ${address.state}` : practice.name}
          </p>
          <span className="-mr-2 flex h-14 items-center gap-2 px-2 text-meta font-semibold text-ink-inv">
            <Glyph as={UI.phone} />
            {phone.display}
          </span>
        </div>
      </div>

      <div className="border-t border-hairline bg-canvas">
        <div className="measure flex items-center justify-between gap-6 py-4">
          <Lockup
            direction={direction}
            lockup={lockup}
            height={height}
            alt={`Direction ${direction.n} in the site header`}
          />

          {narrow ? (
            <span className="flex min-h-11 items-center gap-2 border border-border-strong px-3 text-meta text-ink">
              <Glyph as={UI.menu} />
              Menu
            </span>
          ) : (
            <div className="hidden items-center gap-6 text-meta lg:flex">
              {practice.nav.map((link) => (
                <span key={link.href} className="whitespace-nowrap text-ink-muted">
                  {link.label}
                </span>
              ))}
              <span className="inline-flex items-center gap-2 rounded-control border border-ink px-4 py-2.5 font-semibold whitespace-nowrap text-ink">
                {practice.navCta.label}
                <Glyph as={UI.arrowRight} />
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
