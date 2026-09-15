import 'server-only'
import { AdminSignInEmail } from '@/emails/AdminSignInEmail'
import { OfficeNotificationEmail } from '@/emails/OfficeNotificationEmail'
import { PatientConfirmationEmail } from '@/emails/PatientConfirmationEmail'
import type { PracticeEmailContext, SubmissionEmailView } from '@/emails/types'
import { practice } from '@/content/practice'
import { officeEmail } from '@/lib/env'
import { sendEmail } from '@/lib/email/client'
import { adminSignInText, officeNotificationText, patientConfirmationText } from '@/lib/email/text'
import { timeWindowLabel } from '@/lib/forms/appointment'
import { formatLongDate, formatTimestamp } from '@/lib/forms/dates'
import { formatPhone } from '@/lib/forms/phone'
import { absoluteUrl, siteUrlIsPlaceholder } from '@/lib/siteUrl'
import type { Submission } from '@/lib/submissions/types'

/**
 * Turns a stored submission into the two emails it produces.
 *
 * All formatting happens here, once, so the office email, the patient email
 * and the admin inbox cannot disagree about how a date or a phone number
 * reads.
 */

export const emailContext: PracticeEmailContext = {
  practiceName: practice.name,
  phoneDisplay: practice.contact.phone.display,
  phoneHref: practice.contact.phone.href,
  addressOneLine: practice.contact.address.oneLine,
  emergencyNotice: practice.emergencyNotice,
  callbackWindow: practice.callbackWindow,
  noMedicalDetail: practice.copy.forms.noMedicalDetail,
}

export function toEmailView(submission: Submission): SubmissionEmailView {
  return {
    kind: submission.kind,
    reference: submission.reference,
    fullName: submission.fullName,
    email: submission.email,
    phone: submission.phone,
    phoneDisplay: submission.phone ? formatPhone(submission.phone) : null,
    subject: submission.subject,
    preferredDateLabel: submission.preferredDate ? formatLongDate(submission.preferredDate) : null,
    preferredTimeLabel: submission.preferredTimeWindow
      ? timeWindowLabel(submission.preferredTimeWindow)
      : null,
    referringPhysician: submission.referringPhysician,
    insuranceCarrier: submission.insuranceCarrier,
    notes: submission.notes,
    botCheck: submission.botCheck,
    submittedAtLabel: formatTimestamp(submission.createdAt),
    /**
     * Omitted while the production domain is unresolved. A deep link to
     * `http://localhost:3000/admin/…` in a real office inbox is worse than no
     * button at all — it looks broken and teaches staff to ignore it.
     */
    adminUrl: siteUrlIsPlaceholder ? null : absoluteUrl(`/admin/${submission.id}`),
  }
}

export interface NotificationResult {
  officeSent: boolean
  patientSent: boolean
}

/**
 * Both notifications for one submission.
 *
 * Sent in parallel and NEVER allowed to throw. The caller has already
 * committed the row; an exception here would turn a saved request into an
 * error page and invite the patient to submit it again.
 *
 * Reply-To is crossed over on purpose. Office mail replies to the patient, so
 * hitting reply in the practice's inbox does the obvious thing. Patient mail
 * replies to the office rather than to the no-reply sender, so a patient who
 * answers the confirmation reaches a human.
 */
export async function sendSubmissionNotifications(
  submission: Submission,
): Promise<NotificationResult> {
  const view = toEmailView(submission)
  const isAppointment = view.kind === 'appointment'

  const officeSubject = isAppointment
    ? `Appointment request — ${view.fullName}${view.phoneDisplay ? ` (${view.phoneDisplay})` : ''}`
    : `Enquiry — ${view.fullName}: ${view.subject}`

  const patientSubject = isAppointment
    ? `We have your appointment request — ${practice.name}`
    : `We have your message — ${practice.name}`

  const officePromise = officeEmail
    ? sendEmail({
        to: officeEmail,
        subject: officeSubject,
        react: <OfficeNotificationEmail submission={view} context={emailContext} />,
        text: officeNotificationText(view, emailContext),
        replyTo: view.email,
      })
    : // [PLACEHOLDER: office email address] — BUILD-BRIEF.md Part 0 still lists
      // this as unresolved. Loud in the logs, harmless to the submission, and
      // the row is in the inbox either way.
      Promise.resolve({ ok: false, reason: 'OFFICE_EMAIL is not set' }).then((result) => {
        console.warn(`[email] ${result.reason}; the office was not notified of ${view.reference}.`)
        return result
      })

  const patientPromise = sendEmail({
    to: view.email,
    subject: patientSubject,
    react: <PatientConfirmationEmail submission={view} context={emailContext} />,
    text: patientConfirmationText(view, emailContext),
    replyTo: officeEmail,
  })

  const [office, patient] = await Promise.all([officePromise, patientPromise])
  return { officeSent: office.ok, patientSent: patient.ok }
}

/** The staff magic link, rendered by Auth.js's `sendVerificationRequest`. */
export async function sendAdminSignInEmail(to: string, url: string, expiresIn: string) {
  return sendEmail({
    to,
    subject: `Sign in to the ${practice.name} inbox`,
    react: <AdminSignInEmail url={url} expiresIn={expiresIn} context={emailContext} />,
    text: adminSignInText(url, expiresIn, emailContext),
  })
}
