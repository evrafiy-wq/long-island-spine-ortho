import 'server-only'
import { hasTurnstile, optionalEnv } from '@/lib/env'

/**
 * Cloudflare Turnstile verification.
 *
 * Three outcomes, not two, and the middle one is the point:
 *
 *  - `verified`   — a token was supplied and Cloudflare accepted it.
 *  - `unverified` — no token was supplied. Almost always JavaScript disabled,
 *    since the widget is the only thing that mints one. NOT a rejection: the
 *    submission continues on the stricter rate-limit tier. A Server Action
 *    form is supposed to work without JavaScript, and turning the bot check
 *    into a JavaScript requirement would quietly delete that.
 *  - `failed`     — a token was supplied and Cloudflare rejected it. That is a
 *    replayed, forged or expired token, which no real browser produces. Hard
 *    rejection.
 *
 * With `TURNSTILE_SECRET_KEY` unset the whole check reports `skipped`, so the
 * site runs locally with an empty `.env`.
 */

export type BotCheckOutcome = 'verified' | 'unverified' | 'failed' | 'skipped'

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const TIMEOUT_MS = 4000

export async function verifyTurnstile(
  token: string,
  remoteIp: string | null,
): Promise<BotCheckOutcome> {
  if (!hasTurnstile) return 'skipped'
  if (!token) return 'unverified'

  const body = new URLSearchParams({
    secret: optionalEnv('TURNSTILE_SECRET_KEY') ?? '',
    response: token,
  })
  // Cloudflare uses this to correlate the solve with the submission. It is the
  // one place the raw address leaves the process, and it is not stored here.
  if (remoteIp) body.set('remoteip', remoteIp)

  try {
    const response = await fetch(VERIFY_URL, {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!response.ok) throw new Error(`Turnstile responded ${response.status}`)

    const result = (await response.json()) as { success?: boolean }
    return result.success === true ? 'verified' : 'failed'
  } catch (error) {
    /**
     * Cloudflare unreachable or too slow. Treated as `unverified`, not
     * `failed`: the patient did nothing wrong and an outage at a third party
     * must not close the only online route into the practice. The submission
     * continues on the stricter rate-limit tier and the row records that the
     * check did not complete, so staff can see it in the inbox.
     */
    console.error('[turnstile] Verification request failed; treating as unverified.', error)
    return 'unverified'
  }
}

/** Whether the outcome allows the submission to proceed at all. */
export function botCheckPasses(outcome: BotCheckOutcome): boolean {
  return outcome !== 'failed'
}

/** Which rate-limit bucket an outcome belongs in. */
export function rateLimitTierFor(outcome: BotCheckOutcome): 'verified' | 'unverified' {
  return outcome === 'verified' || outcome === 'skipped' ? 'verified' : 'unverified'
}
