import 'server-only'
import { practice } from '@/content/practice'
import { HONEYPOT_FIELD, TURNSTILE_FIELD } from '@/lib/forms/appointment'
import { readString } from '@/lib/forms/state'
import { clientIp, hashIp } from '@/lib/security/hash'
import { checkRateLimit, retryAfterLabel } from '@/lib/security/rate-limit'
import { botCheckPasses, rateLimitTierFor, verifyTurnstile } from '@/lib/security/turnstile'

/**
 * The abuse checks both public forms run before anything is parsed or stored.
 *
 * Three layers, in increasing cost, and the order is the point: the free check
 * runs first, the network call second, the Redis round trip third, and Zod —
 * the only one that touches the patient's actual data — last.
 *
 *  1. Honeypot. Free, and catches the naive majority.
 *  2. Turnstile. One outbound request, and only for submissions that got past
 *     the honeypot.
 *  3. Rate limit, on the tier Turnstile's verdict selects.
 *
 * Nothing here is allowed to reject a real patient without telling them what
 * to do instead, which is why every failure message ends at the phone number.
 */

export type IntakeGuard =
  | { ok: true; botCheck: string; ipHash: string | null }
  /** Honeypot tripped. The caller reports success and discards the payload. */
  | { ok: false; reason: 'honeypot' }
  | { ok: false; reason: 'rejected'; message: string }

export async function runIntakeGuard(formData: FormData): Promise<IntakeGuard> {
  /**
   * A browser leaves this empty because it is hidden and off the tab order; a
   * form-filling bot fills every input it finds. Tripping it returns SUCCESS
   * to the caller rather than an error — an error message is feedback, and
   * feedback is how a bot author finds the trap. The submission is dropped.
   */
  if (readString(formData, HONEYPOT_FIELD).trim() !== '') {
    console.warn('[intake] Honeypot tripped; submission discarded.')
    return { ok: false, reason: 'honeypot' }
  }

  const ip = await clientIp()
  const botCheck = await verifyTurnstile(readString(formData, TURNSTILE_FIELD), ip)

  if (!botCheckPasses(botCheck)) {
    return {
      ok: false,
      reason: 'rejected',
      message:
        'We could not verify that this came from a browser, so it was not sent. ' +
        `Please reload the page and try again, or call the office on ${practice.contact.phone.display}.`,
    }
  }

  const ipHash = hashIp(ip)
  const limit = await checkRateLimit(ipHash, rateLimitTierFor(botCheck))

  if (!limit.success) {
    return {
      ok: false,
      reason: 'rejected',
      message:
        `This form has been used several times from your connection already. ` +
        `Please try again ${retryAfterLabel(limit.retryAfterSeconds)}, or call the office on ` +
        `${practice.contact.phone.display} and our staff will take your request over the phone.`,
    }
  }

  return { ok: true, botCheck, ipHash }
}
