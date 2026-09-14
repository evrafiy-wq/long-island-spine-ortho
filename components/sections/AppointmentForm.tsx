'use client'

import { useEffect, useRef, useState, type FormEvent, type FocusEvent } from 'react'
import { practice } from '@/content/practice'

/** How long the success state stays up before the form resets. */
const SUCCESS_MS = 3000

type Field = HTMLInputElement | HTMLSelectElement

const isField = (node: EventTarget | null): node is Field =>
  node instanceof HTMLInputElement || node instanceof HTMLSelectElement

/**
 * Validation deliberately drives an explicit `.is-invalid` class rather than
 * leaning on :invalid / :user-invalid — those match untouched <select> and
 * <input type="date"> fields on first paint, which makes the form look broken
 * before the patient has typed anything.
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

export function AppointmentForm() {
  const { appointmentForm } = practice.copy
  const formRef = useRef<HTMLFormElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [minDate, setMinDate] = useState<string | undefined>(undefined)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Computed after mount: the server has no way to know the visitor's date.
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

  const handleDateInput = (event: FormEvent<HTMLInputElement>) => {
    const input = event.currentTarget
    const day = new Date(input.value).getUTCDay()
    if (day === 0 || day === 6) {
      input.setCustomValidity(appointmentForm.weekendMessage)
      input.reportValidity()
    } else {
      input.setCustomValidity('')
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = formRef.current
    if (!form) return

    if (!form.checkValidity()) {
      form.reportValidity()
      fields().forEach(markValidity)
      return
    }

    // Front-end only for now — Phase 4 of BUILD-BRIEF.md wires this to a
    // Server Action. Nothing is transmitted anywhere today.
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
    <section className="appointment-section" id="appointment">
      <div className="appointment-card site-container">
        <div>
          <p className="eyebrow eyebrow-light">{appointmentForm.eyebrow}</p>
          <h2>{appointmentForm.heading}</h2>
          <p>{appointmentForm.body}</p>
        </div>

        <div className="appointment-form-wrap">
          <form
            className="appointment-form"
            id="appointment-form"
            noValidate
            ref={formRef}
            onSubmit={handleSubmit}
            onBlur={handleBlur}
            onInput={handleRevalidate}
            onChange={handleRevalidate}
          >
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="full-name">Full Name</label>
                <input type="text" id="full-name" name="fullName" placeholder="Jane Doe" required />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input type="tel" id="phone" name="phone" placeholder="(516) 000-0000" required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" placeholder="jane@email.com" required />
              </div>
              <div className="form-group">
                <label htmlFor="appt-date">Preferred Date</label>
                <input
                  type="date"
                  id="appt-date"
                  name="preferredDate"
                  min={minDate}
                  onInput={handleDateInput}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="reason">Reason for Visit</label>
              <select id="reason" name="reason" defaultValue="" required>
                <option value="" disabled>
                  {appointmentForm.reasonPlaceholder}
                </option>
                {practice.appointmentReasons.map((reason) => (
                  <option key={reason}>{reason}</option>
                ))}
              </select>
            </div>
            <button
              className="button button-light"
              type="submit"
              disabled={isSubmitted}
              style={isSubmitted ? { opacity: 0.7 } : undefined}
            >
              {isSubmitted ? appointmentForm.successLabel : appointmentForm.submitLabel}
            </button>
            <p className="form-disclaimer">{practice.emergencyNotice}</p>
          </form>
        </div>
      </div>
    </section>
  )
}
