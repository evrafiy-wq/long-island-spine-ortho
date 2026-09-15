import { z } from 'zod'
import { practice } from '@/content/practice'
import { isBefore, isIsoDate, isWeekend, maxRequestDate, practiceToday } from '@/lib/forms/dates'
import { normalizePhone } from '@/lib/forms/phone'

/**
 * The appointment request schema — ONE definition, imported by both sides.
 *
 * The client imports it to validate before submitting; the Server Action
 * imports the same object and re-parses. That is not belt and braces, it is
 * the only validation that counts: the client copy exists so a patient sees an
 * error next to a field instead of after a round trip, and it is discarded
 * entirely on the server side. Because there is one schema, the two cannot
 * drift — which was the requirement.
 *
 * Nothing in this module may import `server-only`, `@/lib/db`, `node:crypto`
 * or anything else that does, or the client bundle breaks.
 *
 * FIELD LABELS live here rather than in content/practice.ts, which is the one
 * deliberate exception to that file's remit. They are not practice facts; they
 * are part of the schema's contract, and the error summary, the office email,
 * the admin detail view and the CSV export all label the same value from this
 * map. Splitting the field name from its label across two files is how a
 * renamed field ends up exported under the old heading.
 */

const MAX_NOTES = 500

/** Ordered: the error summary lists failures in the order they appear on the form. */
export const appointmentFields = [
  'fullName',
  'phone',
  'email',
  'preferredDate',
  'preferredTimeWindow',
  'reason',
  'referringPhysician',
  'insuranceCarrier',
  'notes',
] as const

export type AppointmentField = (typeof appointmentFields)[number]

export const appointmentLabels: Record<AppointmentField, string> = {
  fullName: 'Full name',
  phone: 'Phone',
  email: 'Email',
  preferredDate: 'Preferred date',
  preferredTimeWindow: 'Preferred time',
  reason: 'Reason for visit',
  referringPhysician: 'Referring physician',
  insuranceCarrier: 'Insurance carrier',
  notes: 'Anything else we should know',
}

/**
 * The honeypot. Named `company` because it is a plausible field for a form
 * bot's heuristics to fill and an implausible one for a browser's autofill to
 * touch on a medical appointment form — `website` and `url` are both fields
 * password managers will happily populate, which would reject real patients.
 */
export const HONEYPOT_FIELD = 'company'

/** Cloudflare's own field name; the widget writes the token into it. */
export const TURNSTILE_FIELD = 'cf-turnstile-response'

export const NOTES_MAX_LENGTH = MAX_NOTES

const timeWindowIds = practice.appointmentTimeWindows.map((window) => window.id)
const appointmentReasons: readonly string[] = practice.appointmentReasons

/**
 * Membership check rather than `z.enum`.
 *
 * Both lists come from `content/practice.ts` through `.map()`/widening, so
 * their element type is `string` and `z.enum` would add nothing but a worse
 * message. The stored column is text either way, and the one message here
 * covers both "left blank" and "not one of the options", which is what a
 * patient needs to read next to a select they have not touched.
 */
function oneOf(values: readonly string[], message: string) {
  return z
    .string()
    .trim()
    .refine((value) => values.includes(value), { message })
}

/** Optional text: blank normalises to undefined so the column stays NULL. */
function optionalText(max: number, tooLong: string) {
  return z
    .string()
    .trim()
    .max(max, tooLong)
    .transform((value) => (value === '' ? undefined : value))
}

export const appointmentSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Enter your full name.')
    .max(100, 'Please keep your name under 100 characters.'),

  phone: z
    .string()
    .trim()
    .min(1, 'Enter a phone number so the office can reach you.')
    .transform((value, ctx) => {
      const normalized = normalizePhone(value)
      if (normalized === null) {
        ctx.addIssue({
          code: 'custom',
          message: 'Enter a 10-digit phone number, for example (516) 433-1100.',
        })
        return z.NEVER
      }
      return normalized
    }),

  email: z
    .string()
    .trim()
    .min(1, 'Enter an email address so we can send you a copy of your request.')
    .max(254, 'That email address is too long.')
    .pipe(z.email('Enter a valid email address, for example name@example.com.')),

  /**
   * Three separate rules, each with its own message, checked in order and
   * stopping at the first failure — `superRefine` with early returns rather
   * than three chained `.refine()`s, which would report "not a date", "in the
   * past" and "a weekend" all at once for one bad value.
   *
   * "Today" is read at parse time, not at module load. A serverless instance
   * can stay warm past midnight, and a module-level constant would start
   * rejecting the current day.
   */
  preferredDate: z
    .string()
    .trim()
    .superRefine((value, ctx) => {
      if (value === '' || !isIsoDate(value)) {
        ctx.addIssue({ code: 'custom', message: 'Choose a preferred date.' })
        return
      }
      if (isBefore(value, practiceToday())) {
        ctx.addIssue({ code: 'custom', message: 'Choose a date that has not already passed.' })
        return
      }
      if (isWeekend(value)) {
        ctx.addIssue({ code: 'custom', message: practice.copy.appointmentForm.weekendMessage })
        return
      }
      if (value > maxRequestDate()) {
        ctx.addIssue({
          code: 'custom',
          message: 'Choose a date within the next 12 months.',
        })
      }
    }),

  preferredTimeWindow: oneOf(timeWindowIds, 'Choose a preferred time of day.'),

  reason: oneOf(appointmentReasons, 'Choose a reason for your visit.'),

  referringPhysician: optionalText(100, 'Please keep this under 100 characters.'),

  insuranceCarrier: optionalText(80, 'Please keep this under 80 characters.'),

  /**
   * Capped deliberately short. This is the field a patient will use to
   * describe symptoms if nothing stops them, and every clinical sentence in it
   * pushes the practice further into territory that needs a HIPAA answer. 500
   * characters is enough for "I was referred by my GP and I can only do
   * mornings" and too short for a case history. The label above it says so
   * outright, and so does the privacy notice.
   */
  notes: optionalText(
    MAX_NOTES,
    `Please keep this under ${MAX_NOTES} characters — our staff will take the details by phone.`,
  ),
})

/** Post-transform: `phone` is E.164 and the optional fields are `string | undefined`. */
export type AppointmentInput = z.output<typeof appointmentSchema>

/** Pre-transform: what the form's raw string fields look like. */
export type AppointmentRawInput = z.input<typeof appointmentSchema>

/** Everything the schema reads, pulled out of a FormData in one place. */
export function appointmentFromFormData(formData: FormData): Record<AppointmentField, string> {
  const raw = {} as Record<AppointmentField, string>
  for (const field of appointmentFields) {
    const value = formData.get(field)
    raw[field] = typeof value === 'string' ? value : ''
  }
  return raw
}

/** The display label for a stored time-window id. */
export function timeWindowLabel(id: string): string {
  return practice.appointmentTimeWindows.find((window) => window.id === id)?.label ?? id
}

/**
 * One field, revalidated as the patient corrects it.
 *
 * Reaches into `.shape` so a single field is checked against the exact same
 * rule the whole-form parse uses. Writing a second, per-field copy of the
 * rules is the drift this module exists to prevent.
 */
export function validateAppointmentField(
  field: AppointmentField,
  value: string,
): string | undefined {
  const result = appointmentSchema.shape[field].safeParse(value)
  return result.success ? undefined : result.error.issues[0]?.message
}
