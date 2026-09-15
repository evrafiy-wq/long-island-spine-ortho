'use server'

import { practice } from '@/content/practice'
import { sendSubmissionNotifications } from '@/lib/email/send'
import {
  appointmentFields,
  appointmentFromFormData,
  appointmentSchema,
  type AppointmentField,
} from '@/lib/forms/appointment'
import { echoValues, fieldErrorsFromZod, type FormState } from '@/lib/forms/state'
import { createSubmission } from '@/lib/submissions/repository'
import { runIntakeGuard } from '@/lib/submissions/intake'

/**
 * The appointment request Server Action.
 *
 * Works with JavaScript disabled. It is passed straight to `useActionState` in
 * components/site/AppointmentForm.tsx, so React posts the form to this
 * function and re-renders with whatever it returns — no `fetch`, no API route,
 * no client-side submit handler in the path. With JavaScript the same code
 * runs without a navigation.
 *
 * ORDER OF OPERATIONS, and every step is where it is for a reason:
 *
 *   1. Abuse checks (lib/submissions/intake.ts) — cheapest first, and they
 *      bound the work an attacker can force before anything is parsed.
 *   2. Zod, against the SAME schema the browser used. The client's copy is
 *      advisory; this is the one that decides.
 *   3. Write. The row is committed before anything is emailed.
 *   4. Email, awaited but never fatal.
 *
 * `revalidatePath` is deliberately NOT called. The five public pages are
 * static and a submission changes none of them, and /admin is dynamic and
 * re-reads on every request.
 */
export async function submitAppointmentRequest(
  _previous: FormState<AppointmentField>,
  formData: FormData,
): Promise<FormState<AppointmentField>> {
  const attempt = _previous.status === 'error' ? _previous.attempt + 1 : 1

  const guard = await runIntakeGuard(formData)

  if (!guard.ok) {
    /**
     * A tripped honeypot gets a success state with no reference. Telling a bot
     * it was caught is how the trap stops working; the payload is discarded
     * and nothing is written or emailed.
     */
    if (guard.reason === 'honeypot') return { status: 'success', reference: '' }

    return {
      status: 'error',
      message: guard.message,
      fieldErrors: {},
      values: echoValues(formData, appointmentFields),
      attempt,
    }
  }

  const parsed = appointmentSchema.safeParse(appointmentFromFormData(formData))

  if (!parsed.success) {
    return {
      status: 'error',
      fieldErrors: fieldErrorsFromZod<AppointmentField>(parsed.error),
      values: echoValues(formData, appointmentFields),
      attempt,
    }
  }

  const input = parsed.data

  try {
    const submission = await createSubmission({
      kind: 'appointment',
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      subject: input.reason,
      preferredDate: input.preferredDate,
      preferredTimeWindow: input.preferredTimeWindow,
      referringPhysician: input.referringPhysician ?? null,
      insuranceCarrier: input.insuranceCarrier ?? null,
      notes: input.notes ?? null,
      ipHash: guard.ipHash,
      botCheck: guard.botCheck,
    })

    /**
     * Awaited, not fired and forgotten. A serverless function is frozen the
     * moment its response is returned, so an un-awaited promise here is a
     * coin flip over whether the office is ever told.
     *
     * It cannot throw — see lib/email/send.tsx — so a mail outage leaves the
     * request saved and visible in the inbox while the patient still sees
     * success. That is the honest outcome: their request DID arrive.
     */
    await sendSubmissionNotifications(submission)

    return { status: 'success', reference: submission.reference }
  } catch (error) {
    /**
     * The database was unreachable, or encryption is misconfigured. The
     * patient must not be told "received" — this is the exact failure the
     * pre-Phase-4 form had, where a success message was shown for a
     * submission that went nowhere. Send them to the phone instead.
     */
    console.error('[appointment] Submission failed:', error)
    return {
      status: 'error',
      message: `${practice.copy.appointmentForm.errorFallback} ${practice.contact.phone.display}`,
      fieldErrors: {},
      values: echoValues(formData, appointmentFields),
      attempt,
    }
  }
}
