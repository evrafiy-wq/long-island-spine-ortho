'use client'

import { useState } from 'react'
import { Glyph } from '@/components/site/Glyph'
import { UI } from '@/components/site/icons'
import { practice } from '@/content/practice'

/**
 * B's treatment of the services — a stacked disclosure list, not a grid of
 * cards with circle icons.
 *
 * The disclosure earns its place: it lets B use the LONG `service.description`
 * copy rather than the clipped `summary` the homepage grid uses, which is the
 * whole voice of this direction. Four rows the reader opens, not four cards
 * they skim.
 *
 * The reveal is a plain `hidden` attribute toggle with no height animation.
 * That is deliberate — the inherited FAQ bug on the live site comes from
 * animating `grid-template-rows` from `0fr`, which computes the row to 0px and
 * leaves the panel permanently collapsed. Not animating height sidesteps the
 * whole class of bug, and the brief's motion rule wants state changes only
 * anyway. The only motion here is the 140ms colour change on the trigger.
 */
export function ServiceDisclosures() {
  // `services` is declared with `satisfies readonly Service[]`, which widens
  // the tuple to an array, so noUncheckedIndexedAccess makes [0] possibly
  // undefined. The first row opens by default; `null` just means all closed.
  const [openId, setOpenId] = useState<string | null>(practice.services[0]?.id ?? null)

  return (
    <ul className="border-t border-hairline">
      {practice.services.map((service) => {
        const isOpen = service.id === openId
        return (
          <li key={service.id} className="border-b border-hairline">
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`panel-${service.id}`}
                id={`trigger-${service.id}`}
                onClick={() => setOpenId(isOpen ? null : service.id)}
                className="flex min-h-14 w-full items-center justify-between gap-4 py-5 text-left font-display text-subtitle text-ink transition-state hover:text-accent"
              >
                {service.title}
                {/* Plus/minus swap rather than a rotating chevron, so there is
                    nothing to animate and the reduced-motion case is identical
                    to the default one. */}
                <span className="text-[1.25rem] leading-none text-accent">
                  <Glyph as={isOpen ? UI.minus : UI.plus} />
                </span>
              </button>
            </h3>
            <div
              id={`panel-${service.id}`}
              role="region"
              aria-labelledby={`trigger-${service.id}`}
              hidden={!isOpen}
            >
              <p className="max-w-reading pr-8 pb-6 text-body text-ink-muted">
                {service.description}
              </p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
