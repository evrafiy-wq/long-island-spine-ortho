import { z } from 'zod'
import { practice } from '@/content/practice'
import { normalizePhone } from '@/lib/forms/phone'

/**
 * The general-inquiry schema.
 *
 * Same contract as lib/forms/appointment.ts — one definition, imported by the
 * client component and re-parsed by the Server Action — with fewer fields.
 * Phone is optional here because a billing or paperwork question can be
 * answered by email; on the appointment form it is required, because the whole
 * point of that form is that somebody rings the patient back.
 *
 * `message` carries the same 500-character cap and the same
 * no-medical-detail label as the appointment form's notes field, for the same
 * reason.
 */

const MAX_MESSAGE = 500

export const contactFields = ['fullName', 'email', 'phone', 'topic', 'message'] as const

export type ContactField = (typeof contactFields)[number]

export const contactLabels: Record<ContactField, string> = {
  fullName: 'Full name',
  email: 'Email',
  phone: 'Phone',
  topic: 'Topic',
  message: 'Message',
}

export const MESSAGE_MAX_LENGTH = MAX_MESSAGE

const topics: readonly string[] = practice.contactTopics

export const contactSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Enter your full name.')
    .max(100, 'Please keep your name under 100 characters.'),

  email: z
    .string()
    .trim()
    .min(1, 'Enter an email address so we can reply.')
    .max(254, 'That email address is too long.')
    .pipe(z.email('Enter a valid email address, for example name@example.com.')),

  /** Optional, but if something was typed it still has to be a real number. */
  phone: z
    .string()
    .trim()
    .transform((value, ctx) => {
      if (value === '') return undefined
      const normalized = normalizePhone(value)
      if (normalized === null) {
        ctx.addIssue({
          code: 'custom',
          message: 'Enter a 10-digit phone number, or leave this blank.',
        })
        return z.NEVER
      }
      return normalized
    }),

  topic: z
    .string()
    .trim()
    .refine((value) => topics.includes(value), { message: 'Choose a topic.' }),

  message: z
    .string()
    .trim()
    .min(10, 'Tell us a little more so we can route your message to the right person.')
    .max(
      MAX_MESSAGE,
      `Please keep your message under ${MAX_MESSAGE} characters — our staff will take the details by phone.`,
    ),
})

export type ContactInput = z.output<typeof contactSchema>

export function contactFromFormData(formData: FormData): Record<ContactField, string> {
  const raw = {} as Record<ContactField, string>
  for (const field of contactFields) {
    const value = formData.get(field)
    raw[field] = typeof value === 'string' ? value : ''
  }
  return raw
}

/** Per-field revalidation, against the same rule as the whole-form parse. */
export function validateContactField(field: ContactField, value: string): string | undefined {
  const result = contactSchema.shape[field].safeParse(value)
  return result.success ? undefined : result.error.issues[0]?.message
}
