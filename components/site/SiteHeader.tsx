'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Glyph } from '@/components/site/Glyph'
import { UI } from '@/components/site/icons'
import { practice } from '@/content/practice'
import { cx } from '@/lib/cx'

const NAV_BREAKPOINT = 1024

/**
 * Static, not sticky — the ActionBar above it is the sticky element. The nav
 * CTA is bordered rather than filled, so the only filled button above the fold
 * is the one inside the hero's action block.
 */
export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const { wordmark } = practice.brand

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
    <header className="relative border-b border-hairline">
      <div className="measure flex items-center justify-between gap-6 py-4">
        {/* The wordmark carries the name, so the icon-plus-two-lines lockup this
            replaced is gone. The image is alt="" and the link names itself:
            otherwise a screen reader announces the practice twice.

            `max-w-none` cancels `img { max-width: 100% }` from the reset. A
            replaced element with a set height and a clamped width does not
            re-derive its height, it distorts — and at 6.7:1 this lockup has a
            lot of width to clamp.

            The step at xl is the nav, not taste: the desktop nav is 726px wide
            and appears at lg, which leaves 194px for the wordmark at 1024px and
            418px at 1280. 28px of lockup is 187px and clears the first; 36px is
            240px and only clears the second. */}
        <Link href="/" aria-label={`${practice.name} — home`} className="flex items-center">
          <Image
            src={wordmark.src}
            alt={wordmark.alt}
            width={wordmark.width}
            height={wordmark.height}
            unoptimized
            className="h-7 w-auto max-w-none xl:h-9"
          />
        </Link>

        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls="nav-c"
          onClick={() => setIsOpen((open) => !open)}
          className="flex min-h-11 items-center gap-2 border border-border-strong px-3 text-meta text-ink lg:hidden"
        >
          <Glyph as={isOpen ? UI.close : UI.menu} />
          Menu
        </button>

        <nav
          id="nav-c"
          aria-label="Primary"
          className={cx(
            'text-meta',
            'absolute inset-x-0 top-full z-30 flex-col border-b border-hairline bg-canvas px-[var(--spacing-gutter)] py-2',
            'lg:static lg:z-auto lg:flex lg:flex-row lg:items-center lg:gap-6 lg:border-0 lg:px-0 lg:py-0',
            isOpen ? 'flex' : 'hidden',
          )}
        >
          {practice.nav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block border-b border-hairline py-3 text-ink-muted transition-state hover:text-ink lg:border-0 lg:py-1 lg:whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={practice.navCta.href}
            onClick={() => setIsOpen(false)}
            className="mt-3 inline-flex items-center gap-2 rounded-control border border-ink px-4 py-2.5 font-semibold whitespace-nowrap text-ink transition-state hover:bg-ink hover:text-ink-inv lg:mt-0"
          >
            {practice.navCta.label}
            <Glyph as={UI.arrowRight} />
          </Link>
        </nav>
      </div>
    </header>
  )
}
