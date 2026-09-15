import { DrizzleAdapter } from '@auth/drizzle-adapter'
import NextAuth from 'next-auth'
import Resend from 'next-auth/providers/resend'
import { authConfig } from '@/auth.config'
import { isAllowlistedAdmin } from '@/lib/admin/allowlist'
import { db, schema } from '@/lib/db'
import { sendAdminSignInEmail } from '@/lib/email/send'
import { mailFrom, optionalEnv } from '@/lib/env'

/** How long a magic link stays usable. */
const LINK_MAX_AGE_SECONDS = 10 * 60

/**
 * The full Auth.js setup: everything in auth.config.ts, plus the two pieces
 * that need Node — the Drizzle adapter and the mail provider.
 *
 * The configuration is a FUNCTION, not an object. `next build` imports this
 * module while collecting the route handler under app/api/auth, and an object
 * literal would call `db()` — and therefore `requireEnv('DATABASE_URL')` — at
 * import time, failing every build on a machine without production secrets.
 * Auth.js evaluates the function per request, so the connection is opened when
 * it is first genuinely needed.
 */
export const { handlers, auth, signIn, signOut } = NextAuth(() => ({
  ...authConfig,

  adapter: DrizzleAdapter(db(), {
    usersTable: schema.users,
    accountsTable: schema.accounts,
    sessionsTable: schema.sessions,
    verificationTokensTable: schema.verificationTokens,
  }),

  providers: [
    Resend({
      apiKey: optionalEnv('RESEND_API_KEY'),
      // The provider requires a `from` at construction. The real one is used by
      // lib/email/client.ts; this value is never put on the wire because
      // `sendVerificationRequest` below is overridden.
      from: mailFrom ?? 'no-reply@invalid.localhost',
      maxAge: LINK_MAX_AGE_SECONDS,

      /**
       * Overridden for two reasons.
       *
       * The first is presentation: the default template is Auth.js branding on
       * an email asking a receptionist to open patient records.
       *
       * The second matters more. This is the earliest point at which the
       * allowlist can be enforced, and enforcing it HERE rather than only at
       * the `signIn` callback is what stops the sign-in form being used to
       * send mail to arbitrary addresses. Without it, anyone could type any
       * address into /admin/signin and have the practice's verified domain
       * deliver them a message.
       *
       * A rejected address returns quietly rather than throwing: the sign-in
       * page says "check your email" either way, so the form cannot be used to
       * enumerate which addresses are staff.
       */
      async sendVerificationRequest({ identifier, url, expires }) {
        if (!isAllowlistedAdmin(identifier)) {
          console.warn(`[auth] Sign-in requested for a non-allowlisted address; no email was sent.`)
          return
        }

        const minutes = Math.max(1, Math.round((expires.getTime() - Date.now()) / 60_000))
        await sendAdminSignInEmail(identifier, url, `${minutes} minutes`)
      },
    }),
  ],
}))
