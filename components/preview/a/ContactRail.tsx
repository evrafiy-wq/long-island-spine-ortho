import { UI } from '@/components/site/icons'
import { Glyph } from '@/components/site/Glyph'
import { practice } from '@/content/practice'

/**
 * Direction A's answer to "phone reachable in one tap from any viewport,
 * always": a 44px sticky running head above a header that does NOT stick.
 *
 * It reads as a journal's running head rather than UI chrome, and at 44px it
 * is the least intrusive of the three solutions. Contents are locked to the
 * page measure even at 1920, so the number sits at the edge of the column
 * rather than drifting to the edge of the screen.
 *
 * Below 420px the hours text drops out and the phone link holds the rail
 * alone — the same hours appear in the visit section and the footer, so
 * nothing is lost. The tap target stays 44px tall at every width.
 */
export function ContactRail() {
  const { phone } = practice.contact

  return (
    <div className="sticky top-0 z-40 border-b border-hairline bg-sunken">
      <div className="measure flex h-11 items-center justify-between gap-4">
        <p className="font-[family-name:var(--pv-font-meta)] text-meta text-ink-muted max-[420px]:hidden">
          {practice.hours.summary}
        </p>
        <a
          href={phone.href}
          className="-mr-2 flex h-11 items-center gap-2 px-2 font-[family-name:var(--pv-font-meta)] text-meta font-semibold text-accent transition-state hover:text-accent-hover max-[420px]:ml-auto"
        >
          <Glyph as={UI.phone} />
          {phone.display}
        </a>
      </div>
    </div>
  )
}
