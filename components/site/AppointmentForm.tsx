'use client'

import { useEffect, useRef, useState, type FocusEvent, type FormEvent } from 'react'
import { practice } from '@/content/practice'
import { cx } from '@/lib/cx'

/** How long the success state stays up before the form resets. */
const SUCCESS_MS = 3000

type Field = HTMLInputElement | HTMLSelectElement

const isField = (node: EventTarget | null): node is Field =>
  node instanceof HTMLInputElement || node instanceof HTMLSelectElement

/**
 * Validation deliberately drives an explicit `.is-invalid` class rather than
 * leaning on :invalid / :user-invalid — those match untouched <select> and
 * <input type="date"> fields on first paint, which makes the form look broken
 * before the patient has typed anything. `:user-invalid` looked like the fix
 * and still matched prematurely for those two field types in testing.
 */
const markValidity = (field: Field) => {
  field.classList.toggle('is-invalid', !field.checkValidity())
}

/** Today in the local timezone, formatted for an <input type="date"> min. */
const todayIso = () => {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

/* Field chrome, shared by the inputs and the select. `.is-invalid` is toggled
 * from JS above; the arbitrary selector is what lets a utility class react to
 * it without a stylesheet rule. */
const FIELD =
  'text-body text-ink border-border-strong bg-canvas rounded-control min-h-[3.25rem] w-full border px-4 ' +
  'focus-visible:border-accent [&.is-invalid]:border-danger'

const LABEL = 'text-label text-ink-muted uppercase'

export function AppointmentForm() {
  const { appointmentForm } = practice.copy
  const formRef = useRef<HTMLFormElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [minDate, setMinDate] = useState<string | undefined>(undefined)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Computed after mount: the server has no way to know the visitor's date,
  // and rendering it on the server produces a hydration mismatch.
  useEffect(() => setMinDate(todayIso()), [])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const fields = () => Array.from(formRef.current?.querySelectorAll<Field>('input, select') ?? [])

  const handleBlur = (event: FocusEvent<HTMLFormElement>) => {
    if (isField(event.target)) markValidity(event.target)
  }

  /** Once a field is showing an error, correct it live as the patient fixes it. */
  const handleRevalidate = (event: { target: EventTarget | null }) => {
    const field = event.target
    if (isField(field) && field.classList.contains('is-invalid')) markValidity(field)
  }

  /** The office is closed at weekends, so reject those dates at the field. */
  const handleDateInput = (event: FormEvent<HTMLInputElement>) => {
    const input = event.currentTarget
    const day = input.value ? new Date(`${input.value}T00:00:00`).getDay() : -1
    input.setCustomValidity(day === 0 || day === 6 ? appointmentForm.weekendMessage : '')
    if (input.classList.contains('is-invalid')) markValidity(input)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.checkValidity()) {
      form.reportValidity()
      fields().forEach(markValidity)
      return
    }

    // FRONT-END ONLY. Phase 4 of BUILD-BRIEF.md wires this to a Server Action;
    // nothing is transmitted anywhere today, which means the success message
    // below is not yet true. See the note in CLAUDE.md before shipping.
    const data = Object.fromEntries(new FormData(form))
    console.log('Appointment request:', data)

    setIsSubmitted(true)
    timerRef.current = setTimeout(() => {
      form.reset()
      fields().forEach((field) => field.classList.remove('is-invalid'))
      setIsSubmitted(false)
    }, SUCCESS_MS)
  }

  return (
    <section
      aria-labelledby="appointment-form-heading"
      id="appointment"
      className="border-t border-hairline block-y"
    >
      <div className="measure grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div>
          <p className={LABEL}>{appointmentForm.eyebrow}</p>
          <h2
            id="appointment-form-heading"
            className="pt-4 font-display text-title tracking-tight text-ink"
          >
            {appointmentForm.heading}
          </h2>
          <p className="max-w-reading pt-4 text-body text-ink-muted">{appointmentForm.body}</p>
        </div>

        <form
          ref={formRef}
          noValidate
          onSubmit={handleSubmit}
          onBlur={handleBlur}
          onInput={handleRevalidate}
          onChange={handleRevalidate}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={LABEL} htmlFor="fullName">
                Full name
              </label>
              <input
                className={cx(FIELD, 'mt-2')}
                id="fullName"
                name="fullName"
                type="text"
                required
                autoComplete="name"
              />
            </div>
            <div>
              <label className={LABEL} htmlFor="phone">
                Phone
              </label>
              <input
                className={cx(FIELD, 'mt-2')}
                id="phone"
                name="phone"
                type="tel"
                required
                autoComplete="tel"
              />
            </div>
            <div>
              <label className={LABEL} htmlFor="email">
                Email
              </label>
              <input
                className={cx(FIELD, 'mt-2')}
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className={LABEL} htmlFor="preferredDate">
                Preferred date
              </label>
              <input
                className={cx(FIELD, 'mt-2')}
                id="preferredDate"
                name="preferredDate"
                type="date"
                required
                min={minDate}
                onInput={handleDateInput}
              />
            </div>
            <div>
              <label className={LABEL} htmlFor="reason">
                Reason for visit
              </label>
              <select
                className={cx(FIELD, 'mt-2')}
                id="reason"
                name="reason"
                required
                defaultValue=""
              >
                <option value="" disabled>
                  {appointmentForm.reasonPlaceholder}
                </option>
                {practice.appointmentReasons.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitted}
            className="mt-7 flex min-h-[3.25rem] w-full items-center justify-center rounded-control bg-accent text-meta font-semibold text-on-accent transition-state hover:bg-accent-hover disabled:opacity-70"
          >
            {isSubmitted ? appointmentForm.successLabel : appointmentForm.submitLabel}
          </button>

          <p aria-live="polite" className="sr-only">
            {isSubmitted ? appointmentForm.successLabel : ''}
          </p>
        </form>
      </div>
    </section>
  )
}
