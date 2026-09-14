'use client'

import { useState } from 'react'
import Image from 'next/image'
import { practice } from '@/content/practice'
import { cx } from '@/lib/cx'

type Panel = 'photo' | 'map'

const TABS = [
  { id: 'photo', label: 'Photo' },
  { id: 'map', label: 'Map' },
] as const

/**
 * Photo / map switcher for /visit.
 *
 * Two behaviours worth keeping from the original: both panels stay mounted and
 * `hidden` controls visibility, and the Google Maps iframe is lazy so the
 * embed does not block the page. Unlike the original, the tablist implements
 * arrow-key navigation — `role="tablist"` promises Left/Right/Home/End to a
 * screen-reader user and the old version wired only onClick.
 */
export function LocationPanel() {
  const [active, setActive] = useState<Panel>('photo')
  const { contact, officeExterior } = practice

  const onKeyDown = (event: React.KeyboardEvent) => {
    const order: Panel[] = ['photo', 'map']
    const index = order.indexOf(active)
    let next: Panel | undefined
    if (event.key === 'ArrowRight') next = order[(index + 1) % order.length]
    if (event.key === 'ArrowLeft') next = order[(index - 1 + order.length) % order.length]
    if (event.key === 'Home') next = order[0]
    if (event.key === 'End') next = order[order.length - 1]
    if (next) {
      event.preventDefault()
      setActive(next)
      document.getElementById(`loc-tab-${next}`)?.focus()
    }
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Office location view"
        className="flex gap-1"
        onKeyDown={onKeyDown}
      >
        {TABS.map((tab) => {
          const isActive = tab.id === active
          return (
            <button
              key={tab.id}
              id={`loc-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`loc-panel-${tab.id}`}
              tabIndex={isActive ? undefined : -1}
              onClick={() => setActive(tab.id)}
              className={cx(
                'min-h-11 rounded-control px-4 text-label uppercase transition-state',
                isActive ? 'bg-ink text-ink-inv' : 'text-ink-muted hover:text-ink',
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div
        id="loc-panel-photo"
        role="tabpanel"
        aria-labelledby="loc-tab-photo"
        hidden={active !== 'photo'}
        className="pt-4"
      >
        <figure className="w-full max-w-[298px]">
          <Image
            src={officeExterior.src}
            alt={officeExterior.alt}
            width={officeExterior.width}
            height={officeExterior.height}
            sizes="298px"
            className="w-full rounded-plate"
          />
          <figcaption className="pt-3 text-meta text-ink-muted">
            {contact.address.street}
            <br />
            {contact.address.cityStateZip}
          </figcaption>
        </figure>
      </div>

      <div
        id="loc-panel-map"
        role="tabpanel"
        aria-labelledby="loc-tab-map"
        hidden={active !== 'map'}
        className="pt-4"
      >
        <iframe
          src={contact.mapEmbedUrl}
          title={`Map of ${practice.name}, ${contact.address.oneLine}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="aspect-[4/3] w-full border border-hairline"
        />
      </div>
    </div>
  )
}
