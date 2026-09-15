import { Link, Section, Text } from '@react-email/components'
import { Detail, Shell } from '@/emails/Shell'
import { style } from '@/emails/theme'
import type { PracticeEmailContext, SubmissionEmailView } from '@/emails/types'

interface Props {
  submission: SubmissionEmailView
  context: PracticeEmailContext
}

/**
 * What the patient receives.
 *
 * Three things it must do, in order:
 *
 *  1. Confirm the message arrived, so nobody submits four times.
 *  2. Say plainly that this is a REQUEST and nothing is booked. This is the
 *     sentence the whole email exists for. A confirmation email that reads
 *     like a booking confirmation is how somebody turns up on a Tuesday the
 *     practice never agreed to.
 *  3. Give the 911 line and the office number, because the one patient whose
 *     situation is urgent must not sit waiting for a call back.
 *
 * Note what it does NOT contain: the free-text notes are not echoed back.
 * Email is not an encrypted channel, the patient already knows what they
 * wrote, and the one field most likely to hold clinical detail is the one with
 * the least reason to be copied into an unencrypted inbox.
 */
export function PatientConfirmationEmail({ submission, context }: Props) {
  const isAppointment = submission.kind === 'appointment'

  const callbackLine = context.callbackWindow
    ? `Our staff will contact you ${context.callbackWindow} to confirm your visit.`
    : // PLACEHOLDER: no callback window has been agreed — fall back to the copy
      // the site has always used, which is true without promising a timeframe.
      'Our staff will contact you to confirm your visit.'

  return (
    <Shell
      preview={
        isAppointment
          ? `We have your appointment request (${submission.reference})`
          : `We have your message (${submission.reference})`
      }
      context={context}
    >
      <Text style={style.eyebrow}>Reference {submission.reference}</Text>
      <Text style={style.heading}>
        {isAppointment ? 'We have your request' : 'We have your message'}
      </Text>

      {isAppointment ? (
        <>
          <Text style={style.text}>
            Thank you, {submission.fullName}. Your appointment request has reached{' '}
            {context.practiceName}. {callbackLine}
          </Text>
          <Text style={{ ...style.text, fontWeight: 600 }}>
            This is a request, not a confirmed appointment. Nothing is scheduled until our office
            has spoken with you.
          </Text>
        </>
      ) : (
        <Text style={style.text}>
          Thank you, {submission.fullName}. Your message has reached {context.practiceName} and our
          staff will reply using the contact details you gave us.
        </Text>
      )}

      <Text style={style.subheading}>What you sent us</Text>
      <Section>
        <Detail term={isAppointment ? 'Reason for visit' : 'Topic'}>{submission.subject}</Detail>
        {isAppointment ? (
          <>
            <Detail term="Preferred date">{submission.preferredDateLabel ?? 'Not given'}</Detail>
            <Detail term="Preferred time">{submission.preferredTimeLabel ?? 'Not given'}</Detail>
          </>
        ) : null}
        <Detail term="We will reach you at">
          {submission.phoneDisplay ? `${submission.phoneDisplay} · ` : ''}
          {submission.email}
        </Detail>
      </Section>

      <Text style={{ ...style.muted, paddingTop: '12px' }}>
        If any of that is wrong, or you need to change it, call the office on{' '}
        <Link href={context.phoneHref} style={style.link}>
          {context.phoneDisplay}
        </Link>
        .
      </Text>

      <Text style={style.notice}>
        <strong>{context.emergencyNotice}</strong>
        <br />
        This mailbox is not monitored continuously and is not a way to reach a doctor for medical
        advice. {context.noMedicalDetail}
      </Text>
    </Shell>
  )
}

export default PatientConfirmationEmail
