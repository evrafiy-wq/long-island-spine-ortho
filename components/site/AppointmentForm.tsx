'use client'

import Link from 'next/link'
import { useActionState, useEffect, useState, type FocusEvent, type FormEvent } from 'react'
import { submitAppointmentRequest } from '@/app/actions/appointment'
import { ErrorSummary, type SummaryItem } from '@/components/site/form/ErrorSummary'
import { Honeypot, Turnstile } from '@/components/site/form/FormGuards'
import { SubmitButton } from '@/components/site/form/SubmitButton'
import { SelectField, TextAreaField, TextField } from '@/components/site/form/fields'
import { Glyph } from '@/components/site/Glyph'
import { UI } from '@/components/site/icons'
import { practice } from '@/content/practice'
import {
  NOTES_MAX_LENGTH,
  appointmentFields,
  appointmentFromFormData,
  appointmentLabels,
  appointmentSchema,
  validateAppointmentField,
  type AppointmentField,
} from '@/lib/forms/appointment'
import { maxRequestDate, practiceToday } from '@/lib/forms/dates'
import { fieldErrorsFromZod, type FieldErrors, type FormState } from '@/lib/forms/state'

const initialState: FormState<AppointmentField> = { status: 'idle' }

function isAppointmentField(name: string): name is AppointmentField {
  return (appointmentFields as readonly string[]).includes(name)
}

/**
 * The appointment request form.
 *
 * PROGRESSIVE ENHANCEMENT. The Server Action is handed straight to
 * `useActionState`, so React posts the form to it natively — there is no
 * `fetch`, no API route and no client submit path that a script failure can
 * break. With JavaScript off, the browser does a normal form POST, the same
 * action runs, and the page comes back with the same errors rendered from the
 * same state. That is also why `state.values` exists: without JS there is no
 * re-render to preserve what was typed, so the server hands it back.
 *
 * VALIDATION runs twice against ONE schema. The copy in the browser exists so
 * a patient sees an error beside the field instead of after a round trip; the
 * copy on the server is the one that decides. Because both import
 * `appointmentSchema`, they cannot disagree.
 *
 * WHY THIS REPLACED THE OLD COMPONENT. The previous version validated, called
 * `console.log`, and then showed "Request received ✓". Nothing was
 * transmitted. A patient could reasonably believe they had contacted a
 * surgeon's office when they had not — which is why the success panel below
 * now appears only after a row is committed, and why the catch path sends
 * people to the phone rather than showing success anyway.
 */
export function AppointmentForm() {
  const { appointmentForm, forms } = practice.copy
  const [state, formAction] = useActionState(submitAppointmentRequest, initialState)

  /**
   * Client-side errors, or null to defer to the server's.
   *
   * One nullable slot rather than merging two error maps: whichever check ran
   * most recently is the one that is right, and a merge would leave a stale
   * server error next to a field the patient has since fixed.
   */
  const [clientErrors, setClientErrors] = useState<FieldErrors<AppointmentField> | null>(null)

  /**
   * Monotonic, and separate from the server's own `attempt`. The error summary
   * re-focuses whenever this changes; a counter shared with the server would
   * collide on "first client rejection" and "first server rejection", and the
   * second one would not be announced.
   */
  const [focusKey, setFocusKey] = useState(0)

  // Computed after mount. The server cannot know the visitor's date, and
  // rendering one produces a hydration mismatch; these only bound the native
  // date picker, so arriving a tick late costs nothing.
  const [dateBounds, setDateBounds] = useState<{ min: string; max: string } | null>(null)
  useEffect(() => setDateBounds({ min: practiceToday(), max: maxRequestDate() }), [])

  useEffect(() => {
    if (state.status === 'error') {
      setClientErrors(null)
      setFocusKey((key) => key + 1)
    }
    if (state.status === 'success') setClientErrors(null)
  }, [state])

  const serverErrors = state.status === 'error' ? state.fieldErrors : {}
  const errors = clientErrors ?? serverErrors
  const values = state.status === 'error' ? state.values : {}
  const formMessage = clientErrors === null && state.status === 'error' ? state.message : undefined

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const parsed = appointmentSchema.safeParse(
      appointmentFromFormData(new FormData(event.currentTarget)),
    )
    if (parsed.success) {
      setClientErrors(null)
      return
    }
    event.preventDefault()
    setClientErrors(fieldErrorsFromZod<AppointmentField>(parsed.error))
    setFocusKey((key) => key + 1)
  }

  /**
   * Revalidate a field as the patient leaves it — but only once they have
   * tried to submit. Flagging an empty field the moment focus passes through
   * it tells someone working down a form that they have made nine mistakes.
   */
  const handleBlur = (event: FocusEvent<HTMLFormElement>) => {
    if (focusKey === 0) return
    const target = event.target
    if (!(
      target instanceof HTMLInputElement ||
      target instanceof HTMLSelectElement ||
      target instanceof HTMLTextAreaElement
    )) {
      return
    }
    if (!isAppointmentField(target.name)) return

    const message = validateAppointmentField(target.name, target.value)
    const field = target.name
    setClientErrors((previous) => {
      const next = { ...(previous ?? serverErrors) }
      if (message) next[field] = message
      else delete next[field]
      return next
    })
  }

  const summaryItems: SummaryItem[] = appointmentFields
    .filter((field) => errors[field])
    .map((field) => ({
      field,
      label: appointmentLabels[field],
      message: errors[field] as string,
    }))

  return (
    <section
      aria-labelledby="appointment-form-heading"
      id="appointment"
      className="border-t border-hairline block-y"
    >
      <div className="measure grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div>
          <p className="text-label text-ink-muted uppercase">{appointmentForm.eyebrow}</p>
          <h2
            id="appointment-form-heading"
            className="pt-4 font-display text-title tracking-tight text-ink"
          >
            {appointmentForm.heading}
          </h2>
          <p className="max-w-reading pt-4 text-body text-ink-muted">{appointmentForm.body}</p>

          <p className="mt-7 border-t border-hairline pt-5 text-meta text-ink-muted">
            {forms.requiredLegend}{' '}
            <Link
              href="/privacy"
              className="font-semibold text-accent underline underline-offset-4 transition-state hover:text-accent-hover"
            >
              {forms.privacyLinkLabel}
            </Link>
          </p>
        </div>

        <div>
          {state.status === 'success' ? (
            <AppointmentSuccess reference={state.reference} />
          ) : (
            <form action={formAction} onSubmit={handleSubmit} onBlur={handleBlur} noValidate>
              <ErrorSummary
                attempt={focusKey}
                heading={
                  formMessage
                    ? appointmentForm.errorHeading
                    : appointmentForm.validationSummaryHeading
                }
                message={formMessage}
                items={summaryItems}
              />

              <Honeypot />

              <div className="grid gap-5 sm:grid-cols-2">
                <TextField
                  name="fullName"
                  label={appointmentLabels.fullName}
                  type="text"
                  autoComplete="name"
                  defaultValue={values.fullName}
                  error={errors.fullName}
                  wide
                />
                <TextField
                  name="phone"
                  label={appointmentLabels.phone}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  defaultValue={values.phone}
                  error={errors.phone}
                />
                <TextField
                  name="email"
                  label={appointmentLabels.email}
                  type="email"
                  autoComplete="email"
                  defaultValue={values.email}
                  error={errors.email}
                />
                <TextField
                  name="preferredDate"
                  label={appointmentLabels.preferredDate}
                  type="date"
                  min={dateBounds?.min}
                  max={dateBounds?.max}
                  defaultValue={values.preferredDate}
                  error={errors.preferredDate}
                />
                <SelectField
                  name="preferredTimeWindow"
                  label={appointmentLabels.preferredTimeWindow}
                  placeholder={appointmentForm.timeWindowPlaceholder}
                  options={practice.appointmentTimeWindows.map((window) => ({
                    value: window.id,
                    label: window.label,
                  }))}
                  defaultValue={values.preferredTimeWindow}
                  error={errors.preferredTimeWindow}
                />
                <SelectField
                  name="reason"
                  label={appointmentLabels.reason}
                  placeholder={appointmentForm.reasonPlaceholder}
                  options={practice.appointmentReasons.map((reason) => ({
                    value: reason,
                    label: reason,
                  }))}
                  defaultValue={values.reason}
                  error={errors.reason}
                  wide
                />
                <TextField
                  name="referringPhysician"
                  label={appointmentLabels.referringPhysician}
                  type="text"
                  optional
                  defaultValue={values.referringPhysician}
                  error={errors.referringPhysician}
                />
                {/*
                  A free-text box, not a select of practice.insuranceCarriers.
                  That list is flagged UNVERIFIED in content/practice.ts — NYU
                  Langone's directory for Dr. Rafiy overlaps with it on Aetna
                  alone — and a dropdown of five carriers on a request form
                  reads as "these are the plans we take". CLAUDE.md is explicit
                  that the unverified claim must not be propagated into new
                  surfaces, and this is a new surface.
                */}
                <TextField
                  name="insuranceCarrier"
                  label={appointmentLabels.insuranceCarrier}
                  type="text"
                  optional
                  defaultValue={values.insuranceCarrier}
                  error={errors.insuranceCarrier}
                />
                <TextAreaField
                  name="notes"
                  label={appointmentLabels.notes}
                  optional
                  wide
                  max={NOTES_MAX_LENGTH}
                  hint={forms.noMedicalDetail}
                  defaultValue={values.notes ?? ''}
                  error={errors.notes}
                />
              </div>

              <Turnstile siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} attempt={focusKey} />

              <SubmitButton
                label={appointmentForm.submitLabel}
                pendingLabel={appointmentForm.submittingLabel}
              />
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

/**
 * The success panel.
 *
 * It replaces the form rather than sitting above it, so there is nothing left
 * to submit again, and it answers the three questions a patient has at this
 * moment: did it arrive, is anything booked, and what happens now. The middle
 * one is in bold because it is the one a confirmation screen is most likely to
 * be misread about.
 *
 * `role="status"` rather than `role="alert"`: this is not an error, and a
 * polite announcement lands after the focus move rather than interrupting it.
 */
function AppointmentSuccess({ reference }: { reference: string }) {
  const { appointmentForm } = practice.copy
  const { phone } = practice.contact

  const callbackLine = practice.callbackWindow
    ? `Our staff will contact you ${practice.callbackWindow} to confirm your visit.`
    : // PLACEHOLDER: callback window — see practice.callbackWindow. Falls back
      // to the copy the site has always used rather than inventing a timeframe.
      practice.copy.appointmentForm.body

  return (
    <div role="status" className="border border-l-4 border-accent px-6 py-7">
      <p className="flex items-center gap-2 font-display text-title tracking-tight text-ink">
        <Glyph as={UI.check} className="text-accent" />
        {appointmentForm.successHeading}
      </p>

      <p className="max-w-reading pt-4 text-body font-semibold text-ink">
        {appointmentForm.successNotAppointment}
      </p>

      <p className="max-w-reading pt-4 text-body text-ink-muted">{callbackLine}</p>
      <p className="max-w-reading pt-3 text-body text-ink-muted">
        {appointmentForm.successCheckEmail}
      </p>

      {reference ? (
        <p className="mt-6 border-t border-hairline pt-5 text-meta text-ink-muted">
          Your reference:{' '}
          <span className="font-display text-subtitle tracking-tight text-ink">{reference}</span>
        </p>
      ) : null}

      <p className="mt-5 border-t border-hairline pt-5 text-meta text-ink-muted">
        {appointmentForm.successUrgent}{' '}
        <a
          href={phone.href}
          className="font-semibold whitespace-nowrap text-accent underline underline-offset-4 transition-state hover:text-accent-hover"
        >
          {phone.display}
        </a>
      </p>
    </div>
  )
}
