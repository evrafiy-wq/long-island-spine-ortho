import { Link, Section, Text } from '@react-email/components'
import { Shell } from '@/emails/Shell'
import { style } from '@/emails/theme'
import type { PracticeEmailContext } from '@/emails/types'

interface Props {
  url: string
  /** How long the link stays valid, already formatted, e.g. "10 minutes". */
  expiresIn: string
  context: PracticeEmailContext
}

/**
 * The staff magic link.
 *
 * Replaces Auth.js's default template for one substantive reason beyond
 * looking like the practice: the default says nothing about what to do if you
 * did not request it. A sign-in link arriving unbidden at an allowlisted
 * address means somebody knows a staff address and is trying the door, and the
 * person best placed to notice is the one reading this.
 */
export function AdminSignInEmail({ url, expiresIn, context }: Props) {
  return (
    <Shell preview={`Your sign-in link for the ${context.practiceName} inbox`} context={context}>
      <Text style={style.eyebrow}>Staff access</Text>
      <Text style={style.heading}>Sign in to the patient inbox</Text>

      <Text style={style.text}>
        Use the button below to sign in. The link works once and expires in {expiresIn}.
      </Text>

      <Section style={{ padding: '8px 0 20px' }}>
        <Link href={url} style={style.button}>
          Sign in
        </Link>
      </Section>

      <Text style={style.muted}>
        If the button does not work, copy this address into your browser:
        <br />
        {/* Deliberately rendered as plain text, not a link: a URL you have to
            move by hand is a URL you look at first. */}
        <span style={{ wordBreak: 'break-all' }}>{url}</span>
      </Text>

      <Text style={style.notice}>
        <strong>Did not ask for this?</strong> Do not use the link, and tell the practice. Someone
        knows a staff email address and is trying to reach patient records.
      </Text>
    </Shell>
  )
}

export default AdminSignInEmail
