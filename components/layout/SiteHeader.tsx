'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Brand } from './Brand'
import { Icon } from '@/components/Icon'
import { practice } from '@/content/practice'
import { cx } from '@/lib/cx'

/** The width at which the nav stops collapsing — matches the 930px media query
 *  in globals.css, and the value the original script.js used. */
const NAV_BREAKPOINT = 931

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false)

  // The original toggled this on <body> to lock scrolling behind the open menu.
  useEffect(() => {
    document.body.classList.toggle('nav-open', isOpen)
    return () => document.body.classList.remove('nav-open')
  }, [isOpen])

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

  const closeOnMobile = () => {
    if (window.innerWidth < NAV_BREAKPOINT) setIsOpen(false)
  }

  return (
    <header className="site-header">
      <div className="header-content site-container">
        <Brand />

        <button
          className="nav-toggle"
          id="nav-toggle"
          type="button"
          aria-expanded={isOpen}
          aria-controls="site-nav"
          onClick={() => setIsOpen((open) => !open)}
        >
          <span>Menu</span>
          <span className="nav-toggle-icon" aria-hidden="true">
            <i />
            <i />
          </span>
        </button>

        <nav
          className={cx('site-nav', isOpen && 'is-open')}
          id="site-nav"
          aria-label="Primary navigation"
        >
          {practice.nav.map((link) => (
            <Link key={link.href} href={link.href} onClick={closeOnMobile}>
              {link.label}
            </Link>
          ))}
          <Link className="nav-cta" href={practice.navCta.href} onClick={closeOnMobile}>
            {practice.navCta.label}
            <Icon name="arrowRight" />
          </Link>
        </nav>
      </div>
    </header>
  )
}
