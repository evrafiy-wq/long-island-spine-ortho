'use client'

import { useEffect, useRef, useState } from 'react'
import { Icon } from '@/components/Icon'
import { practice } from '@/content/practice'

/** Matches the 0.3s grid-template-rows transition on .faq-answer, so the panel
 *  is only hidden from assistive tech once it has finished collapsing. */
const COLLAPSE_MS = 300

type PanelState = { expanded: boolean; hidden: boolean }

const initialState = (): Record<string, PanelState> =>
  Object.fromEntries(practice.faq.map((item) => [item.id, { expanded: false, hidden: true }]))

export function FaqAccordion() {
  const [panels, setPanels] = useState<Record<string, PanelState>>(initialState)
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  useEffect(() => {
    const pending = timers.current
    return () => {
      pending.forEach(clearTimeout)
      pending.clear()
    }
  }, [])

  const toggle = (id: string) => {
    const existing = timers.current.get(id)
    if (existing) {
      clearTimeout(existing)
      timers.current.delete(id)
    }

    setPanels((current) => {
      const panel = current[id]
      if (!panel) return current
      const nextExpanded = !panel.expanded

      if (nextExpanded) {
        return { ...current, [id]: { expanded: true, hidden: false } }
      }

      timers.current.set(
        id,
        setTimeout(() => {
          timers.current.delete(id)
          setPanels((latest) => {
            const target = latest[id]
            // Another click may have re-opened it while we were waiting.
            if (!target || target.expanded) return latest
            return { ...latest, [id]: { expanded: false, hidden: true } }
          })
        }, COLLAPSE_MS),
      )

      return { ...current, [id]: { expanded: false, hidden: false } }
    })
  }

  return (
    <div className="faq-list">
      {practice.faq.map((item) => {
        const panel = panels[item.id] ?? { expanded: false, hidden: true }
        return (
          <div className="faq-item" key={item.id}>
            <button
              className="faq-trigger"
              type="button"
              aria-expanded={panel.expanded}
              aria-controls={`${item.id}-answer`}
              id={`${item.id}-trigger`}
              onClick={() => toggle(item.id)}
            >
              {item.question}
              <span className="faq-icon" aria-hidden="true">
                <Icon name="plus" />
              </span>
            </button>
            {/* Must stay the immediate next sibling: the open state is driven by
                `.faq-trigger[aria-expanded="true"] + .faq-answer` in globals.css. */}
            <div
              className="faq-answer"
              id={`${item.id}-answer`}
              role="region"
              aria-labelledby={`${item.id}-trigger`}
              hidden={panel.hidden}
            >
              <div className="faq-answer-content">
                <p>{item.answer}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
