import 'server-only'

/**
 * Server-side environment access.
 *
 * Nothing here throws at module load. A missing variable has to fail at the
 * moment it is needed, not at import time — otherwise `next build`, which
 * imports every server module while prerendering, dies on a machine that has
 * no production secrets. `.env.example` documents all of them.
 *
 * The `has*` flags are how each subsystem decides whether it is configured.
 * Unconfigured subsystems degrade to a documented development behaviour rather
 * than crashing, which is what lets the site run locally with an empty .env —
 * except for the database, which the submission pipeline genuinely cannot fake
 * outside the E2E harness below.
 */

export function optionalEnv(name: string): string | undefined {
  const value = process.env[name]
  return value === undefined || value === '' ? undefined : value
}

export function requireEnv(name: string): string {
  const value = optionalEnv(name)
  if (value === undefined) {
    throw new Error(
      `Missing required environment variable ${name}. See .env.example and docs/BACKEND.md.`,
    )
  }
  return value
}

/**
 * The end-to-end test harness switch.
 *
 * When this is on, the database and the mailer are replaced by in-process test
 * doubles (lib/db/testStore.ts, lib/email/client.ts) so Playwright can drive a
 * real submission through a real Server Action without Postgres or Resend.
 *
 * The `NODE_ENV` guard is the safety interlock and is deliberately not
 * configurable: `next build` sets NODE_ENV=production, so a production bundle
 * cannot resolve this to true no matter what is in the environment. Playwright
 * therefore runs against `next dev`. Slower, and worth it — the alternative is
 * an env var that silently turns a live medical form into a black hole.
 */
export const isE2E = process.env.E2E_TEST_MODE === '1' && process.env.NODE_ENV !== 'production'

/** Each subsystem's "am I wired up?" check. */
export const hasDatabase = optionalEnv('DATABASE_URL') !== undefined
export const hasResend = optionalEnv('RESEND_API_KEY') !== undefined
export const hasUpstash =
  optionalEnv('UPSTASH_REDIS_REST_URL') !== undefined &&
  optionalEnv('UPSTASH_REDIS_REST_TOKEN') !== undefined
export const hasTurnstile = optionalEnv('TURNSTILE_SECRET_KEY') !== undefined

/**
 * Where office notifications go. Still unrecorded — BUILD-BRIEF.md Part 0
 * lists "office email address for appointment requests to route to" as a
 * launch blocker. Unset means office mail is skipped, which is loud in the
 * logs and harmless in development.
 */
export const officeEmail = optionalEnv('OFFICE_EMAIL')

/** The verified Resend sender, e.g. "LI Spine and Orthopedics <no-reply@example.com>". */
export const mailFrom = optionalEnv('MAIL_FROM')

/**
 * The /admin allowlist lives in lib/admin/allowlist.ts, which imports nothing,
 * because the Edge middleware reads it and cannot safely import this module.
 * Re-exported here so server code has one obvious place to look.
 */
export { adminEmails, isAllowlistedAdmin } from '@/lib/admin/allowlist'
