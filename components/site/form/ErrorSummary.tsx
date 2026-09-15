'use client'

import { useEffect, useRef } from 'react'
import { Glyph } from '@/components/site/Glyph'
import { UI } from '@/components/site/icons'

export interface SummaryItem {
  /** The input's id, which is also its `name`. */
  field: string
  label: string
  message: string
}

interface ErrorSummaryProps {
  /** Bumped on every rejected submit; drives the re-focus. */
  attempt: number
  heading: string
  /** Form-level failure — rate limit, bot check, outage. */
  message?: string
  items: readonly SummaryItem[]
}

/**
 * The block that appears above the form when a submit is rejected.
 *
 * Three things make this work rather than merely exist:
 *
 *  1. It takes FOCUS on every rejected submit. Without that, a keyboard or
 *     screen-reader user presses the button, nothing appears to happen, and
 *     the errors sit silently above the viewport. `tabIndex={-1}` makes a
 *     non-interactive container focusable for exactly this.
 *  2. It re-focuses on EVERY attempt, not just the first. The effect keys on
 *     `attempt` rather than on the error list, because a second submit that
 *     fails the same way produces an identical list and would otherwise be
 *     announced once and never again.
 *  3. Each item is a link to its field. Browsers move focus to a focusable
 *     element targeted by a fragment, so activating one lands the caret in the
 *     input that needs fixing — the only part of this that helps a mouse user
 *     too, on a nine-field form where the failure may be off-screen.
 *
 * `role="alert"` rather than a polite region: a rejected submit is exactly the
 * case assertive announcement is for, and it fires once per attempt.
 */
export function ErrorSummary({ attempt, heading, message, items }: ErrorSummaryProps) {
  const ref = useRef<HTMLDivElement>(null)
  const hasContent = items.length > 0 || Boolean(message)

  /**
   * Focus, but only once something has actually been submitted. `attempt`
   * drives the effect and NOT whether the block renders — that distinction is
   * the whole of the no-JavaScript case, and getting it wrong was a real bug
   * caught by tests/e2e/appointment.spec.ts.
   *
   * `attempt` is client state seeded at 0. Without JavaScript nothing ever
   * increments it, so gating the RENDER on it meant a server-rejected
   * submission came back with its field errors in place and no summary at all
   * above them — the one element that tells a patient the form was refused.
   * Visibility now follows the errors, which the server sends; the counter
   * only decides whether to move focus, which is a thing only JavaScript can
   * do anyway.
   */
  useEffect(() => {
    if (attempt > 0) ref.current?.focus()
  }, [attempt])

  if (!hasContent) return null

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="alert"
      className="mb-7 border border-l-4 border-danger px-5 py-4 focus-visible:outline-2"
    >
      <p className="flex items-center gap-2 font-display text-subtitle tracking-tight text-danger">
        <Glyph as={UI.alert} />
        {heading}
      </p>

      {message ? <p className="max-w-reading pt-2 text-body text-ink">{message}</p> : null}

      {items.length > 0 ? (
        <ul className="pt-3">
          {items.map((item) => (
            <li key={item.field} className="py-1">
              <a
                href={`#${item.field}`}
                className="inline-flex min-h-6 items-center text-meta font-semibold text-danger underline underline-offset-4"
              >
                <span className="sr-only">{item.label}: </span>
                {item.message}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
