import { Glyph } from '@/components/site/Glyph'
import { UI } from '@/components/site/icons'
import { practice } from '@/content/practice'

/**
 * Direction C's answer to "phone reachable in one tap from any viewport,
 * always": a 56px sticky dark bar at the very top, with the number visible at
 * every width including 375.
 *
 * It is the most prominent of the three solutions and the only one that puts
 * the phone in a persistent dark field. The header below it is deliberately
 * NOT sticky — two stacked sticky bars would eat 120px of a phone screen.
 *
 * Below 480px the practice name gives way to the city, which is the shorter
 * and more useful orienting fact for someone who just arrived from a search.
 */
export function ActionBar() {
  const { phone, address } = practice.contact

  return (
    <div className="sticky top-0 z-40 bg-dark text-ink-inv">
      <div className="measure flex h-14 items-center justify-between gap-4">
        <p className="text-label text-ink-inv-muted uppercase">
          <span className="hidden sm:inline">{practice.name}</span>
          <span className="sm:hidden">
            {address.city}, {address.state}
          </span>
        </p>
        <a
          href={phone.href}
          className="-mr-2 flex h-14 items-center gap-2 px-2 text-meta font-semibold text-ink-inv transition-state [--site-focus-color:var(--site-focus-color-on-dark)] hover:text-accent-inv"
        >
          <Glyph as={UI.phone} />
          {phone.display}
        </a>
      </div>
    </div>
  )
}
