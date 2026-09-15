import type { PracticeEmailContext, SubmissionEmailView } from '@/emails/types'

/**
 * Plain-text bodies.
 *
 * Written by hand rather than machine-stripped from the React templates. An
 * automatic conversion produces something that reads like HTML with the tags
 * removed — link hrefs orphaned from their text, table rows run together — and
 * the plain part is what a screen reader in a text-preferring client actually
 * reads, what a spam filter scores, and what lands in a terminal mail client.
 *
 * Every message sends both parts. A multipart email with no text alternative
 * is a deliverability penalty on its own.
 */

const RULE = '—'.repeat(40)

function line(term: string, value: string | null | undefined): string {
  return `${term}: ${value && value !== '' ? value : 'Not given'}`
}

export function officeNotificationText(
  submission: SubmissionEmailView,
  context: PracticeEmailContext,
): string {
  const isAppointment = submission.kind === 'appointment'

  const rows = [
    line('Name', submission.fullName),
    line('Phone', submission.phoneDisplay),
    line('Email', submission.email),
    line(isAppointment ? 'Reason for visit' : 'Topic', submission.subject),
  ]

  if (isAppointment) {
    rows.push(
      line('Preferred date', submission.preferredDateLabel),
      line('Preferred time', submission.preferredTimeLabel),
      line('Referring physician', submission.referringPhysician),
      line('Insurance carrier', submission.insuranceCarrier),
    )
  }

  rows.push(
    line(isAppointment ? 'Notes from the patient' : 'Message', submission.notes),
    line('Submitted', submission.submittedAtLabel),
    line('Reference', submission.reference),
  )

  const parts = [
    isAppointment ? 'NEW APPOINTMENT REQUEST' : 'NEW ENQUIRY',
    RULE,
    rows.join('\n'),
    RULE,
  ]

  if (submission.botCheck === 'unverified') {
    parts.push(
      'NOTE: the automated spam check did not complete for this submission. It may have\n' +
        'come from a browser with JavaScript disabled, which is normal, or from an\n' +
        'automated sender.',
    )
  }

  if (submission.adminUrl) parts.push(`Open in the inbox: ${submission.adminUrl}`)

  parts.push(
    `Reply to this email and it goes to the patient. ${context.noMedicalDetail}`,
    '',
    `${context.practiceName}\n${context.addressOneLine}\n${context.phoneDisplay}`,
  )

  return parts.join('\n\n')
}

export function patientConfirmationText(
  submission: SubmissionEmailView,
  context: PracticeEmailContext,
): string {
  const isAppointment = submission.kind === 'appointment'

  const callbackLine = context.callbackWindow
    ? `Our staff will contact you ${context.callbackWindow} to confirm your visit.`
    : 'Our staff will contact you to confirm your visit.'

  const opening = isAppointment
    ? [
        `Thank you, ${submission.fullName}. Your appointment request has reached`,
        `${context.practiceName}. ${callbackLine}`,
        '',
        'THIS IS A REQUEST, NOT A CONFIRMED APPOINTMENT. Nothing is scheduled until',
        'our office has spoken with you.',
      ].join('\n')
    : [
        `Thank you, ${submission.fullName}. Your message has reached`,
        `${context.practiceName} and our staff will reply using the contact`,
        'details you gave us.',
      ].join('\n')

  const sent = [line(isAppointment ? 'Reason for visit' : 'Topic', submission.subject)]
  if (isAppointment) {
    sent.push(
      line('Preferred date', submission.preferredDateLabel),
      line('Preferred time', submission.preferredTimeLabel),
    )
  }
  sent.push(
    line(
      'We will reach you at',
      [submission.phoneDisplay, submission.email].filter(Boolean).join(' / '),
    ),
  )

  return [
    isAppointment ? 'WE HAVE YOUR REQUEST' : 'WE HAVE YOUR MESSAGE',
    `Reference ${submission.reference}`,
    RULE,
    opening,
    '',
    'WHAT YOU SENT US',
    sent.join('\n'),
    '',
    `If any of that is wrong, or you need to change it, call the office on ${context.phoneDisplay}.`,
    RULE,
    context.emergencyNotice.toUpperCase(),
    'This mailbox is not monitored continuously and is not a way to reach a doctor',
    `for medical advice. ${context.noMedicalDetail}`,
    '',
    `${context.practiceName}\n${context.addressOneLine}\n${context.phoneDisplay}`,
  ].join('\n')
}

export function adminSignInText(
  url: string,
  expiresIn: string,
  context: PracticeEmailContext,
): string {
  return [
    'SIGN IN TO THE PATIENT INBOX',
    RULE,
    `Open this link to sign in. It works once and expires in ${expiresIn}.`,
    '',
    url,
    '',
    'DID NOT ASK FOR THIS? Do not use the link, and tell the practice. Someone knows',
    'a staff email address and is trying to reach patient records.',
    RULE,
    `${context.practiceName}\n${context.addressOneLine}\n${context.phoneDisplay}`,
  ].join('\n')
}
