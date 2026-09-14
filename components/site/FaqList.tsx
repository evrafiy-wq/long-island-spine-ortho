'use client'

import { useState } from 'react'
import { Glyph } from '@/components/site/Glyph'
import { UI } from '@/components/site/icons'
import { practice } from '@/content/practice'

/**
 * The FAQ accordion.
 *
 * This fixes an inherited bug rather than reproducing it. The old version
 * animated `grid-template-rows` from `0fr` to `1fr`; with the transition
 * applied the row computed to 0px, so the panel had zero height and the
 * answers NEVER opened — `aria-expanded` and the `hidden` attribute toggled
 * correctly, only the reveal was dead. There was also a 300ms setTimeout in
 * the component kept in sync with that CSS transition by hand.
 *
 * The reveal here is a plain `hidden` attribute toggle with no height
 * animation, which removes the whole class of bug and the timer with it. The
 * brief's motion rule wants state changes only, so there is nothing lost.
 */
export function FaqList() {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <ul className="max-w-reading border-t border-hairline">
      {practice.faq.map((item) => {
        const isOpen = item.id === openId
        return (
          <li key={item.id} className="border-b border-hairline">
            <h3>
              <button
                type="button"
                id={`faq-trigger-${item.id}`}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${item.id}`}
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className="flex min-h-14 w-full items-center justify-between gap-4 py-5 text-left font-display text-subtitle tracking-tight text-ink transition-state hover:text-accent"
              >
                {item.question}
                {/* A plus/minus swap rather than a rotating chevron: nothing to
                    animate, so the reduced-motion case is identical. */}
                <span className="text-[1.25rem] leading-none text-accent">
                  <Glyph as={isOpen ? UI.minus : UI.plus} />
                </span>
              </button>
            </h3>
            <div
              id={`faq-panel-${item.id}`}
              role="region"
              aria-labelledby={`faq-trigger-${item.id}`}
              hidden={!isOpen}
            >
              <p className="pr-8 pb-6 text-body text-ink-muted">{item.answer}</p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
