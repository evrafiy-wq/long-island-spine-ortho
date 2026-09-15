'use client'

import { useId, useState, type ReactNode, type SelectHTMLAttributes } from 'react'
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cx } from '@/lib/cx'
import { practice } from '@/content/practice'

/**
 * The form field vocabulary, shared by the appointment and contact forms.
 *
 * Every accessibility requirement for these forms is discharged HERE rather
 * than at each call site, because a field that forgets one of them looks
 * identical to one that does not:
 *
 *  - the label is a real `<label for>`, never a placeholder;
 *  - `aria-invalid` is set only when the field is actually in error, not
 *    pre-emptively — an input that announces itself invalid before it has been
 *    touched is noise;
 *  - `aria-describedby` points at the hint and the error together, in that
 *    order, so a screen reader reads "phone, edit text, we will call you on
 *    this number, enter a 10-digit phone number";
 *  - the error element carries the id the error summary links to, so
 *    activating a summary item lands focus on the input itself.
 *
 * The chrome is the same `FIELD` / `LABEL` pair the pre-Phase-4 form used, so
 * nothing about the page's appearance changes.
 */

export const FIELD =
  'text-body text-ink border-border-strong bg-canvas rounded-control min-h-[3.25rem] w-full border px-4 ' +
  'focus-visible:border-accent aria-invalid:border-danger aria-invalid:border-2'

export const LABEL = 'text-label text-ink-muted uppercase'

interface FieldShellProps {
  id: string
  label: string
  error?: string
  hint?: ReactNode
  optional?: boolean
  /** Spans both columns of the two-up grid. */
  wide?: boolean
  children: (ids: { describedBy: string | undefined; invalid: boolean }) => ReactNode
  /** Rendered under the control, right-aligned — the character counter. */
  trailing?: ReactNode
}

export function FieldShell({
  id,
  label,
  error,
  hint,
  optional,
  wide,
  children,
  trailing,
}: FieldShellProps) {
  const hintId = `${id}-hint`
  const errorId = `${id}-error`

  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ')

  return (
    <div className={cx(wide && 'sm:col-span-2')}>
      <label className={LABEL} htmlFor={id}>
        {label}
        {optional ? (
          <span className="pl-1 normal-case">{practice.copy.forms.optionalSuffix}</span>
        ) : null}
      </label>

      {hint ? (
        <p id={hintId} className="pt-1.5 text-meta text-ink-muted">
          {hint}
        </p>
      ) : null}

      {children({ describedBy: describedBy || undefined, invalid: Boolean(error) })}

      <div className="flex items-start justify-between gap-4">
        {/*
          The error lives in a container that is always in the DOM. Inserting
          the element only when there is an error means some screen readers
          miss the change entirely; swapping its text inside a live region is
          announced reliably.
        */}
        <p
          id={errorId}
          aria-live="polite"
          className={cx('pt-2 text-meta font-semibold text-danger', !error && 'hidden')}
        >
          {error}
        </p>
        {trailing}
      </div>
    </div>
  )
}

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'className'> & {
  name: string
  label: string
  error?: string
  hint?: ReactNode
  optional?: boolean
  wide?: boolean
}

export function TextField({ name, label, error, hint, optional, wide, ...input }: TextFieldProps) {
  return (
    <FieldShell id={name} label={label} error={error} hint={hint} optional={optional} wide={wide}>
      {({ describedBy, invalid }) => (
        <input
          {...input}
          id={name}
          name={name}
          className={cx(FIELD, 'mt-2')}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
        />
      )}
    </FieldShell>
  )
}

type SelectFieldProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'className'> & {
  name: string
  label: string
  error?: string
  hint?: ReactNode
  optional?: boolean
  wide?: boolean
  placeholder: string
  options: readonly { value: string; label: string }[]
}

export function SelectField({
  name,
  label,
  error,
  hint,
  optional,
  wide,
  placeholder,
  options,
  ...select
}: SelectFieldProps) {
  return (
    <FieldShell id={name} label={label} error={error} hint={hint} optional={optional} wide={wide}>
      {({ describedBy, invalid }) => (
        <select
          {...select}
          id={name}
          name={name}
          className={cx(FIELD, 'mt-2')}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </FieldShell>
  )
}

type TextAreaFieldProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id' | 'className'> & {
  name: string
  label: string
  error?: string
  hint?: ReactNode
  optional?: boolean
  wide?: boolean
  /** Shows a live "n of max characters" counter and caps input at `max`. */
  max: number
  defaultValue?: string
}

export function TextAreaField({
  name,
  label,
  error,
  hint,
  optional,
  wide,
  max,
  defaultValue = '',
  onChange,
  ...textarea
}: TextAreaFieldProps) {
  const [length, setLength] = useState(defaultValue.length)
  const counterId = useId()

  return (
    <FieldShell
      id={name}
      label={label}
      error={error}
      hint={hint}
      optional={optional}
      wide={wide}
      trailing={
        <p
          id={counterId}
          /*
           * Not a live region. A counter that announces on every keystroke
           * makes the field unusable with a screen reader; it is readable on
           * demand because it is in `aria-describedby`.
           */
          className="shrink-0 pt-2 text-meta text-ink-muted tabular-nums"
        >
          {length} / {max}
        </p>
      }
    >
      {({ describedBy, invalid }) => (
        <textarea
          {...textarea}
          id={name}
          name={name}
          rows={4}
          maxLength={max}
          defaultValue={defaultValue}
          onChange={(event) => {
            setLength(event.currentTarget.value.length)
            onChange?.(event)
          }}
          className={cx(FIELD, 'mt-2 min-h-32 py-3 leading-relaxed')}
          aria-invalid={invalid || undefined}
          aria-describedby={[describedBy, counterId].filter(Boolean).join(' ')}
        />
      )}
    </FieldShell>
  )
}
