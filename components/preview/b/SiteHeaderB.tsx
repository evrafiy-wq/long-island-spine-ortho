'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Glyph } from '@/components/site/Glyph'
import { UI } from '@/components/site/icons'
import { practice } from '@/content/practice'
import { cx } from '@/lib/cx'

const NAV_BREAKPOINT = 1024

/**
 * Sticky header. The phone number lives here from 768px up; below that the
 * fixed CallDock carries it, so it is never more than one tap away at any
 * width.
 */
export function SiteHeaderB() {
  const [isOpen, setIsOpen] = useState(false)
  const { prefix, emphasis } = practice.brand
  const { phone } = practice.contact

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
    <header className="sticky top-0 z-40 border-b border-hairline bg-surface">
      <div className="measure flex min-h-16 items-center justify-between gap-6">
        <Link href="/preview/b" className="flex items-center gap-3 py-3">
          <span className="text-meta leading-tight">
            <span className="block font-[family-name:var(--pv-font-meta)] text-ink-muted">
              {prefix}
            </span>
            <strong className="block font-display text-meta leading-tight font-semibold text-ink sm:text-subtitle">
              {emphasis}
            </strong>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {/* Phone in the header from 768 up. Below that the dock has it. */}
          <a
            href={phone.href}
            className="hidden min-h-[2.75rem] items-center gap-2 font-[family-name:var(--pv-font-meta)] text-meta font-semibold whitespace-nowrap text-accent transition-state hover:text-accent-hover md:flex"
          >
            <Glyph as={UI.phone} />
            {phone.display}
          </a>

          <button
            type="button"
            aria-expanded={isOpen}
            aria-controls="nav-b"
            onClick={() => setIsOpen((open) => !open)}
            className="flex min-h-[2.75rem] items-center gap-2 rounded-control border border-border-strong px-3 font-[family-name:var(--pv-font-meta)] text-meta text-ink lg:hidden"
          >
            <Glyph as={isOpen ? UI.close : UI.menu} />
            Menu
          </button>
        </div>

        <nav
          id="nav-b"
          aria-label="Primary"
          className={cx(
            'font-[family-name:var(--pv-font-meta)] text-meta',
            'absolute inset-x-0 top-full z-30 flex-col border-b border-hairline bg-surface px-[var(--spacing-gutter)] py-2',
            'lg:static lg:z-auto lg:order-2 lg:flex lg:flex-row lg:items-center lg:gap-6 lg:border-0 lg:px-0 lg:py-0',
            isOpen ? 'flex' : 'hidden',
          )}
        >
          {practice.nav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block border-b border-hairline py-3 text-ink-muted transition-state hover:text-ink lg:border-0 lg:py-0 lg:whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={practice.navCta.href}
            onClick={() => setIsOpen(false)}
            className="mt-3 inline-flex items-center gap-2 rounded-control bg-accent px-4 py-3 font-semibold whitespace-nowrap text-on-accent transition-state hover:bg-accent-hover lg:mt-0"
          >
            {practice.navCta.label}
            <Glyph as={UI.arrowRight} />
          </Link>
        </nav>
      </div>
    </header>
  )
}
