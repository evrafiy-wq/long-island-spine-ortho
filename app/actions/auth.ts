'use server'

import { z } from 'zod'
import { signIn, signOut } from '@/auth'
import type { SignInState } from '@/lib/admin/actionState'
import { readString } from '@/lib/forms/state'

const emailSchema = z
  .string()
  .trim()
  .min(1, 'Enter your work email address.')
  .pipe(z.email('Enter a valid email address.'))

/**
 * Request a magic link.
 *
 * Deliberately gives the SAME answer for an allowlisted address and an
 * unknown one: Auth.js redirects to the "check your email" page either way,
 * and lib/../auth.ts quietly declines to send anything to an address that is
 * not on the list. Telling the visitor "that address is not authorised" would
 * turn this form into an oracle for which staff addresses exist.
 *
 * Only genuinely malformed input gets an error, because that one is about
 * their typing rather than about who they are.
 */
export async function requestSignInLink(
  _previous: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const parsed = emailSchema.safeParse(readString(formData, 'email'))

  if (!parsed.success) {
    return {
      status: 'error',
      message: parsed.error.issues[0]?.message ?? 'Enter a valid email address.',
    }
  }

  const from = readString(formData, 'from')
  // Only a same-site path is accepted as a post-sign-in destination. An
  // absolute URL here would make this an open redirect, and an open redirect
  // on a sign-in form is a phishing primitive.
  const redirectTo = from.startsWith('/admin') ? from : '/admin'

  /**
   * `signIn` completes by throwing a redirect, which Next unwinds. It must not
   * be swallowed, so there is no try/catch around it — an unexpected failure
   * should reach the error boundary rather than leave the visitor on a form
   * that appears to have done nothing.
   */
  await signIn('resend', { email: parsed.data, redirectTo })
  return { status: 'idle' }
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: '/admin/signin' })
}
