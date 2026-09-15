'use client'

import Link from 'next/link'
import { useActionState, useEffect, useState, type FocusEvent, type FormEvent } from 'react'
import { submitContactMessage } from '@/app/actions/contact'
import { ErrorSummary, type SummaryItem } from '@/components/site/form/ErrorSummary'
import { Honeypot, Turnstile } from '@/components/site/form/FormGuards'
import { SubmitButton } from '@/components/site/form/SubmitButton'
import { SelectField, TextAreaField, TextField } from '@/components/site/form/fields'
import { Glyph } from '@/components/site/Glyph'
import { UI } from '@/components/site/icons'
import { practice } from '@/content/practice'
import {
  MESSAGE_MAX_LENGTH,
  contactFields,
  contactFromFormData,
  contactLabels,
  contactSchema,
  validateContactField,
  type ContactField,
} from '@/lib/forms/contact'
import { fieldErrorsFromZod, type FieldErrors, type FormState } from '@/lib/forms/state'

const initialState: FormState<ContactField> = { status: 'idle' }

function isContactField(name: string): name is ContactField {
  return (contactFields as readonly string[]).includes(name)
}

/**
 * The general-enquiry form.
 *
 * Structurally identical to components/site/AppointmentForm.tsx — same
 * `useActionState` wiring, same shared-schema validation, same guards, same
 * error summary — over a five-field schema. The two are kept as separate
 * components rather than one parameterised form because the shared part is
 * already factored out into components/site/form/, and what remains is the
 * specific set of questions each one asks. A generic form driven by a field
 * descriptor array would make both harder to read to save nothing.
 */
export function ContactForm() {
  const { contactForm, forms } = practice.copy
  const [state, formAction] = useActionState(submitContactMessage, initialState)

  const [clientErrors, setClientErrors] = useState<FieldErrors<ContactField> | null>(null)
  const [focusKey, setFocusKey] = useState(0)

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
    const parsed = contactSchema.safeParse(contactFromFormData(new FormData(event.currentTarget)))
    if (parsed.success) {
      setClientErrors(null)
      return
    }
    event.preventDefault()
    setClientErrors(fieldErrorsFromZod<ContactField>(parsed.error))
    setFocusKey((key) => key + 1)
  }

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
    if (!isContactField(target.name)) return

    const message = validateContactField(target.name, target.value)
    const field = target.name
    setClientErrors((previous) => {
      const next = { ...(previous ?? serverErrors) }
      if (message) next[field] = message
      else delete next[field]
      return next
    })
  }

  const summaryItems: SummaryItem[] = contactFields
    .filter((field) => errors[field])
    .map((field) => ({ field, label: contactLabels[field], message: errors[field] as string }))

  if (state.status === 'success') {
    return <ContactSuccess reference={state.reference} />
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} onBlur={handleBlur} noValidate>
      <ErrorSummary
        attempt={focusKey}
        heading={
          formMessage
            ? contactForm.errorHeading
            : practice.copy.appointmentForm.validationSummaryHeading
        }
        message={formMessage}
        items={summaryItems}
      />

      <Honeypot />

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          name="fullName"
          label={contactLabels.fullName}
          type="text"
          autoComplete="name"
          defaultValue={values.fullName}
          error={errors.fullName}
          wide
        />
        <TextField
          name="email"
          label={contactLabels.email}
          type="email"
          autoComplete="email"
          defaultValue={values.email}
          error={errors.email}
        />
        <TextField
          name="phone"
          label={contactLabels.phone}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          optional
          defaultValue={values.phone}
          error={errors.phone}
        />
        <SelectField
          name="topic"
          label={contactLabels.topic}
          placeholder={contactForm.topicPlaceholder}
          options={practice.contactTopics.map((topic) => ({ value: topic, label: topic }))}
          defaultValue={values.topic}
          error={errors.topic}
          wide
        />
        <TextAreaField
          name="message"
          label={contactLabels.message}
          wide
          max={MESSAGE_MAX_LENGTH}
          hint={forms.noMedicalDetail}
          defaultValue={values.message ?? ''}
          error={errors.message}
        />
      </div>

      <Turnstile siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} attempt={focusKey} />

      <SubmitButton label={contactForm.submitLabel} pendingLabel={contactForm.submittingLabel} />

      <p className="pt-5 text-meta text-ink-muted">
        {forms.requiredLegend}{' '}
        <Link
          href="/privacy"
          className="font-semibold text-accent underline underline-offset-4 transition-state hover:text-accent-hover"
        >
          {forms.privacyLinkLabel}
        </Link>
      </p>
    </form>
  )
}

function ContactSuccess({ reference }: { reference: string }) {
  const { contactForm } = practice.copy
  const { phone } = practice.contact

  return (
    <div role="status" className="border border-l-4 border-accent px-6 py-7">
      <p className="flex items-center gap-2 font-display text-title tracking-tight text-ink">
        <Glyph as={UI.check} className="text-accent" />
        {contactForm.successHeading}
      </p>
      <p className="max-w-reading pt-4 text-body text-ink-muted">{contactForm.successBody}</p>

      {reference ? (
        <p className="mt-6 border-t border-hairline pt-5 text-meta text-ink-muted">
          Your reference:{' '}
          <span className="font-display text-subtitle tracking-tight text-ink">{reference}</span>
        </p>
      ) : null}

      <p className="mt-5 border-t border-hairline pt-5 text-meta text-ink-muted">
        {practice.copy.appointmentForm.successUrgent}{' '}
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
