'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Glyph } from '@/components/site/Glyph'
import { UI } from '@/components/site/icons'
import { practice } from '@/content/practice'
import { cx } from '@/lib/cx'

/**
 * Matches the `lg:` prefix used on the nav below. Five nav items plus the CTA
 * need ~780px of track; at 768 the measure is only 688 and every label wraps
 * to two or three lines, so the disclosure has to survive past the tablet
 * breakpoint. Kept in one place, unlike the live site's 930/931 pair split
 * across CSS and JS.
 */
const NAV_BREAKPOINT = 1024

export function SiteHeaderA() {
  const [isOpen, setIsOpen] = useState(false)
  const { prefix, emphasis } = practice.brand

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    const onResize = () => {
      if (window.innerWidth >= NAV_BREAKPOINT) setIsOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', onResize)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    // `relative` anchors the mobile nav dropdown, which is positioned against
    // the header rather than the viewport so it cannot cover the sticky rail.
    <header className="relative border-b border-hairline">
      <div className="measure flex items-center justify-between gap-6 py-5">
        <Link href="/preview/a" className="flex items-center gap-3">
          <span className="font-[family-name:var(--pv-font-meta)] text-meta leading-tight">
            <span className="block text-ink-muted">{prefix}</span>
            <strong className="block font-semibold text-ink">{emphasis}</strong>
          </span>
        </Link>

        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls="nav-a"
          onClick={() => setIsOpen((open) => !open)}
          className="flex items-center gap-2 border border-border-strong px-3 py-2 font-[family-name:var(--pv-font-meta)] text-meta text-ink lg:hidden"
        >
          <Glyph as={isOpen ? UI.close : UI.menu} />
          Menu
        </button>

        <nav
          id="nav-a"
          aria-label="Primary"
          className={cx(
            'font-[family-name:var(--pv-font-meta)] text-meta',
            'absolute inset-x-0 top-full z-30 flex-col gap-0 border-b border-hairline bg-canvas px-[var(--spacing-gutter)] py-2',
            'lg:static lg:z-auto lg:flex lg:flex-row lg:items-center lg:gap-7 lg:border-0 lg:bg-transparent lg:px-0 lg:py-0',
            isOpen ? 'flex' : 'hidden',
          )}
        >
          {practice.nav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block border-b border-hairline py-3 text-ink-muted transition-state hover:text-ink lg:border-0 lg:py-0"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={practice.navCta.href}
            onClick={() => setIsOpen(false)}
            className="mt-3 inline-flex items-center gap-2 rounded-control bg-accent px-4 py-3 font-semibold text-on-accent transition-state hover:bg-accent-hover lg:mt-0"
          >
            {practice.navCta.label}
            <Glyph as={UI.arrowRight} />
          </Link>
        </nav>
      </div>
    </header>
  )
}
