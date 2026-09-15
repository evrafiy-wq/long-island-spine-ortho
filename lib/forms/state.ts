import type { z } from 'zod'

/**
 * The shape a form Server Action returns, shared by both forms.
 *
 * Generic over the field-name union so `fieldErrors.fulName` is a compile
 * error rather than an error message that silently never renders.
 *
 * `values` exists for the no-JavaScript path. With JS, React re-renders after
 * `useActionState` and uncontrolled inputs keep whatever the patient typed.
 * Without it the browser does a full navigation and the form comes back empty
 * unless the server hands the values back — which, on a form with nine fields
 * and an older audience, is the difference between "fix one field" and "type
 * it all again".
 */

export type FieldErrors<Field extends string> = Partial<Record<Field, string>>

export interface FormErrorState<Field extends string> {
  status: 'error'
  /**
   * Form-level failure (rate limit, bot check, mail/database outage). Shown
   * above the field errors; either may be present without the other.
   */
  message?: string
  fieldErrors: FieldErrors<Field>
  values: Partial<Record<Field, string>>
  /**
   * Bumped on every rejected submit. The error summary is focused in an effect
   * keyed on this, so a second failed submit re-announces instead of sitting
   * silent because the state object looked unchanged.
   */
  attempt: number
}

export interface FormSuccessState {
  status: 'success'
  /**
   * Short human-readable handle for the submission, quotable over the phone.
   * Not a secret and not a lookup key — it is the first block of the row's
   * UUID, shown so a patient and the front desk can talk about the same
   * request.
   */
  reference: string
}

export type FormState<Field extends string> =
  { status: 'idle' } | FormErrorState<Field> | FormSuccessState

export function idleState<Field extends string>(): FormState<Field> {
  return { status: 'idle' }
}

/**
 * First issue per field.
 *
 * Only the first: a field that fails both "required" and "too short" should
 * say one thing. Zod reports issues in schema order, so the first is the most
 * fundamental one.
 */
export function fieldErrorsFromZod<Field extends string>(
  error: z.ZodError<unknown>,
): FieldErrors<Field> {
  const errors: FieldErrors<Field> = {}
  for (const issue of error.issues) {
    const key = issue.path[0]
    if (typeof key !== 'string') continue
    if (errors[key as Field] === undefined) {
      errors[key as Field] = issue.message
    }
  }
  return errors
}

/** FormData values are `string | File`; every field on these forms is a string. */
export function readString(formData: FormData, name: string): string {
  const value = formData.get(name)
  return typeof value === 'string' ? value : ''
}

/**
 * The values echoed back on failure.
 *
 * The honeypot is never echoed — re-rendering a bot's value into the markup
 * would hand it back a filled-in trap. Nothing else is filtered: it is all the
 * patient's own input.
 */
export function echoValues<Field extends string>(
  formData: FormData,
  fields: readonly Field[],
): Partial<Record<Field, string>> {
  const values: Partial<Record<Field, string>> = {}
  for (const field of fields) {
    values[field] = readString(formData, field)
  }
  return values
}
