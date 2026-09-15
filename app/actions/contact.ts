'use server'

import { practice } from '@/content/practice'
import { sendSubmissionNotifications } from '@/lib/email/send'
import {
  contactFields,
  contactFromFormData,
  contactSchema,
  type ContactField,
} from '@/lib/forms/contact'
import { echoValues, fieldErrorsFromZod, type FormState } from '@/lib/forms/state'
import { createSubmission } from '@/lib/submissions/repository'
import { runIntakeGuard } from '@/lib/submissions/intake'

/**
 * The general-enquiry Server Action.
 *
 * Same pipeline as the appointment action, same guards, same store, same
 * emails — only the schema and the `kind` differ. Keeping the two actions as
 * separate thin functions over shared machinery, rather than one action with a
 * `kind` parameter, means neither form can be made to write the other's shape
 * by tampering with a hidden input.
 */
export async function submitContactMessage(
  _previous: FormState<ContactField>,
  formData: FormData,
): Promise<FormState<ContactField>> {
  const attempt = _previous.status === 'error' ? _previous.attempt + 1 : 1

  const guard = await runIntakeGuard(formData)

  if (!guard.ok) {
    if (guard.reason === 'honeypot') return { status: 'success', reference: '' }

    return {
      status: 'error',
      message: guard.message,
      fieldErrors: {},
      values: echoValues(formData, contactFields),
      attempt,
    }
  }

  const parsed = contactSchema.safeParse(contactFromFormData(formData))

  if (!parsed.success) {
    return {
      status: 'error',
      fieldErrors: fieldErrorsFromZod<ContactField>(parsed.error),
      values: echoValues(formData, contactFields),
      attempt,
    }
  }

  const input = parsed.data

  try {
    const submission = await createSubmission({
      kind: 'contact',
      fullName: input.fullName,
      email: input.email,
      phone: input.phone ?? null,
      subject: input.topic,
      notes: input.message,
      ipHash: guard.ipHash,
      botCheck: guard.botCheck,
    })

    await sendSubmissionNotifications(submission)

    return { status: 'success', reference: submission.reference }
  } catch (error) {
    console.error('[contact] Submission failed:', error)
    return {
      status: 'error',
      message: `Something went wrong on our end and your message was not sent. Please call the office on ${practice.contact.phone.display}.`,
      fieldErrors: {},
      values: echoValues(formData, contactFields),
      attempt,
    }
  }
}
