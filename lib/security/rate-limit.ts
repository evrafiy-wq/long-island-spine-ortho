import 'server-only'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { hasUpstash } from '@/lib/env'

/**
 * Per-IP rate limiting for the public forms.
 *
 * TWO BUCKETS, not one. Which applies depends on whether Cloudflare Turnstile
 * actually ran:
 *
 *  - `verified`   — a Turnstile token came back and Cloudflare accepted it.
 *    A human with a browser. Generous enough that a patient who mistypes their
 *    email twice and resubmits is never blocked.
 *  - `unverified` — no token at all, which in practice means JavaScript is
 *    disabled. Still allowed through, because a Server Action form has to keep
 *    working without JavaScript, but at a rate that makes it useless for bulk
 *    abuse.
 *
 * That split is what lets progressive enhancement and a bot check coexist.
 * Requiring a token outright would have made the no-JavaScript path a dead
 * form; dropping the check for tokenless requests would have made the bot
 * check opt-out. Neither is acceptable, so the tokenless path pays in rate
 * instead.
 *
 * `slidingWindow`, not `fixedWindow`: a fixed window lets a burst land at
 * 11:59:59 and an identical burst at 12:00:01.
 */

export type RateLimitTier = 'verified' | 'unverified'

/**
 * The limit is checked BEFORE Zod validation, so a rejected submission still
 * costs a token. That ordering is what bounds the work an attacker can force —
 * no database write, no email, and no unbounded parsing of junk payloads —
 * and it is why the verified tier is eight rather than the two or three a
 * purely anti-spam number would be. Eight in ten minutes is well past what a
 * patient mistyping an email address twice will use, and nowhere near useful
 * for bulk submission.
 */
const LIMITS: Record<RateLimitTier, { tokens: number; window: `${number} ${'m' | 'h'}` }> = {
  verified: { tokens: 8, window: '10 m' },
  unverified: { tokens: 3, window: '60 m' },
}

export interface RateLimitResult {
  success: boolean
  /** Seconds until the caller may retry. Zero when they are not limited. */
  retryAfterSeconds: number
}

const limiters = new Map<RateLimitTier, Ratelimit>()

function limiter(tier: RateLimitTier): Ratelimit {
  const existing = limiters.get(tier)
  if (existing) return existing

  const { tokens, window } = LIMITS[tier]
  const created = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(tokens, window),
    prefix: `liso:form:${tier}`,
    analytics: false,
  })
  limiters.set(tier, created)
  return created
}

/**
 * In-process fallback for local development and the Playwright harness.
 *
 * NOT a substitute for Upstash in production, and deliberately not presented
 * as one: every serverless instance gets its own Map, so the effective limit
 * is the configured rate multiplied by however many instances are warm. It
 * exists so `npm run dev` works with an empty `.env`, and the startup warning
 * below is what stops it being mistaken for the real thing.
 */
const memoryHits = new Map<string, number[]>()
let warnedAboutMemory = false

function memoryLimit(key: string, tier: RateLimitTier): RateLimitResult {
  if (!warnedAboutMemory) {
    warnedAboutMemory = true
    console.warn(
      '[rate-limit] Upstash is not configured; using an in-process limiter. ' +
        'This is per-instance and must not be relied on in production. See docs/BACKEND.md.',
    )
  }

  const { tokens, window } = LIMITS[tier]
  const windowMs = Number(window.split(' ')[0]) * (window.endsWith('h') ? 3_600_000 : 60_000)
  const now = Date.now()
  const recent = (memoryHits.get(key) ?? []).filter((at) => now - at < windowMs)

  if (recent.length >= tokens) {
    const oldest = recent[0] ?? now
    memoryHits.set(key, recent)
    return { success: false, retryAfterSeconds: Math.ceil((windowMs - (now - oldest)) / 1000) }
  }

  recent.push(now)
  memoryHits.set(key, recent)
  return { success: true, retryAfterSeconds: 0 }
}

/**
 * @param identifier A hashed IP, or a stable string when there is no IP to
 * hash. Never a raw address — see lib/security/hash.ts.
 */
export async function checkRateLimit(
  identifier: string | null,
  tier: RateLimitTier,
): Promise<RateLimitResult> {
  // No IP at all (a direct server-side call, an unusual proxy) falls back to a
  // shared bucket rather than being waved through unlimited.
  const key = identifier ?? 'unknown-origin'

  if (!hasUpstash) return memoryLimit(key, tier)

  try {
    const { success, reset } = await limiter(tier).limit(key)
    return {
      success,
      retryAfterSeconds: success ? 0 : Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
    }
  } catch (error) {
    // Upstash being unreachable must not take the appointment form down with
    // it. Fail OPEN to the in-process limiter: a patient who cannot request an
    // appointment is a worse outcome than a spam window, and the honeypot and
    // Turnstile are both still in front of this.
    console.error(
      '[rate-limit] Upstash request failed; falling back to the in-process limiter.',
      error,
    )
    return memoryLimit(key, tier)
  }
}

/** Human-readable "try again in …" for the form's error message. */
export function retryAfterLabel(seconds: number): string {
  if (seconds <= 90) return 'in a minute or two'
  const minutes = Math.ceil(seconds / 60)
  if (minutes < 60) return `in about ${minutes} minutes`
  const hours = Math.ceil(minutes / 60)
  return hours === 1 ? 'in about an hour' : `in about ${hours} hours`
}
