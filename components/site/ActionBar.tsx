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
 *
 * It is a LABELLED `<section>`, not a `<div>`, and that is load-bearing. As a
 * bare div its contents belonged to no landmark, so a screen-reader user
 * moving through the page by landmarks — the normal way to navigate one —
 * skipped the bar entirely and never reached the phone number. The site's
 * accessibility claim is that the number is one tap away at every width; that
 * has to hold for landmark navigation too, not just for sighted users. Caught
 * by `scripts/audit-a11y.mjs` (axe `region`).
 *
 * `<section>` + an accessible name is what maps to a `region` landmark. It
 * cannot be a second `<header>`: SiteHeader already supplies the page's one
 * banner, and a duplicate is its own violation.
 */
export function ActionBar() {
  const { phone, address } = practice.contact

  return (
    <section aria-label="Office contact" className="sticky top-0 z-40 bg-dark text-ink-inv">
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
    </section>
  )
}
