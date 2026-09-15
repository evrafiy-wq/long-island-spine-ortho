import 'server-only'
import type { ReactElement } from 'react'
import { Resend } from 'resend'
import { hasResend, isE2E, mailFrom, optionalEnv } from '@/lib/env'

/**
 * The one place mail leaves the process.
 *
 * Every send goes through `sendEmail`, which means there is exactly one answer
 * to "can this deployment send email, and if not what happens" — and one place
 * that decides a failed send must never fail the submission that triggered it.
 *
 * DELIVERY IS NOT TRANSACTIONAL WITH THE WRITE. The submission row is
 * committed first and email is attempted afterwards, deliberately. If Resend
 * is down, the request is still in the database and still in the inbox; the
 * patient has lost a confirmation email, not their appointment request. The
 * reverse ordering would discard a real request because a third party had a
 * bad minute.
 */

export interface SentEmail {
  to: string
  subject: string
  text: string
  replyTo?: string
}

/**
 * Test outbox. Populated instead of sending whenever mail is not configured or
 * the Playwright harness is active, so the e2e suite can assert on what WOULD
 * have gone out without a network call or a real inbox.
 */
const outbox: SentEmail[] = []

export function readOutbox(): readonly SentEmail[] {
  return outbox
}

export function clearOutbox(): void {
  outbox.length = 0
}

let client: Resend | null = null

function resend(): Resend {
  if (!client) client = new Resend(optionalEnv('RESEND_API_KEY'))
  return client
}

export interface SendEmailInput {
  to: string
  subject: string
  react: ReactElement
  /** Always supplied. A message with no text part is a deliverability penalty. */
  text: string
  /** Where a reply goes — the patient on office mail, the office on patient mail. */
  replyTo?: string
}

export interface SendEmailResult {
  ok: boolean
  /** Why it did not send. Logged, never shown to a patient. */
  reason?: string
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  if (isE2E || !hasResend || !mailFrom) {
    outbox.push({
      to: input.to,
      subject: input.subject,
      text: input.text,
      replyTo: input.replyTo,
    })
    if (!isE2E) {
      console.warn(
        `[email] Not configured (RESEND_API_KEY / MAIL_FROM); "${input.subject}" to ${input.to} was not sent.`,
      )
    }
    return { ok: false, reason: 'not-configured' }
  }

  try {
    const { error } = await resend().emails.send({
      from: mailFrom,
      to: input.to,
      subject: input.subject,
      react: input.react,
      text: input.text,
      replyTo: input.replyTo,
    })

    if (error) {
      console.error('[email] Resend rejected the message:', error)
      return { ok: false, reason: error.message }
    }
    return { ok: true }
  } catch (error) {
    console.error('[email] Send failed:', error)
    return { ok: false, reason: error instanceof Error ? error.message : 'unknown' }
  }
}
