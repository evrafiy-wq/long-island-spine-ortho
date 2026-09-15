import { Link, Section, Text } from '@react-email/components'
import { Detail, Shell } from '@/emails/Shell'
import { color, style } from '@/emails/theme'
import type { PracticeEmailContext, SubmissionEmailView } from '@/emails/types'

interface Props {
  submission: SubmissionEmailView
  context: PracticeEmailContext
}

/**
 * What the office receives.
 *
 * Built for triage on a phone in under ten seconds: who, how to reach them,
 * when they want to come, then everything else. The name is the heading and
 * the phone number is the first row, because the action this email exists to
 * cause is "ring this person back".
 *
 * The reply path is real, not decorative — `tel:` and `mailto:` are live links
 * and the message's Reply-To is set to the patient, so hitting reply in any
 * mail client reaches them rather than a no-reply mailbox.
 */
export function OfficeNotificationEmail({ submission, context }: Props) {
  const isAppointment = submission.kind === 'appointment'
  const heading = isAppointment ? 'New appointment request' : 'New enquiry'

  return (
    <Shell
      preview={`${heading}: ${submission.fullName}${
        submission.phoneDisplay ? ` — ${submission.phoneDisplay}` : ''
      }`}
      context={context}
    >
      <Text style={style.eyebrow}>
        {heading} · {submission.reference}
      </Text>
      <Text style={style.heading}>{submission.fullName}</Text>

      <Section>
        {submission.phone && submission.phoneDisplay ? (
          <Detail term="Phone">
            <Link href={`tel:${submission.phone}`} style={style.link}>
              {submission.phoneDisplay}
            </Link>
          </Detail>
        ) : (
          <Detail term="Phone">Not provided</Detail>
        )}

        <Detail term="Email">
          <Link href={`mailto:${submission.email}`} style={style.link}>
            {submission.email}
          </Link>
        </Detail>

        <Detail term={isAppointment ? 'Reason for visit' : 'Topic'}>{submission.subject}</Detail>

        {isAppointment ? (
          <>
            <Detail term="Preferred date">{submission.preferredDateLabel ?? 'Not given'}</Detail>
            <Detail term="Preferred time">{submission.preferredTimeLabel ?? 'Not given'}</Detail>
            <Detail term="Referring physician">
              {submission.referringPhysician ?? 'Not given'}
            </Detail>
            <Detail term="Insurance carrier">{submission.insuranceCarrier ?? 'Not given'}</Detail>
          </>
        ) : null}

        <Detail term={isAppointment ? 'Notes from the patient' : 'Message'}>
          {submission.notes ?? 'None'}
        </Detail>

        <Detail term="Submitted">{submission.submittedAtLabel}</Detail>
      </Section>

      {/*
        Only surfaced when the check did NOT come back clean. Flagging every
        message would train staff to ignore the flag, which is the failure mode
        that matters — the whole value of this line is that it is rare.
      */}
      {submission.botCheck === 'unverified' ? (
        <Text style={{ ...style.muted, color: color.danger }}>
          The automated spam check did not complete for this submission. It may have come from a
          browser with JavaScript disabled, which is normal, or from an automated sender. Treat it
          with slightly more care than usual.
        </Text>
      ) : null}

      {submission.adminUrl ? (
        <Section style={{ paddingTop: '12px' }}>
          <Link href={submission.adminUrl} style={style.button}>
            Open in the inbox
          </Link>
        </Section>
      ) : null}

      <Text style={style.notice}>
        Reply to this email and it goes to the patient. {context.noMedicalDetail}
      </Text>
    </Shell>
  )
}

export default OfficeNotificationEmail
