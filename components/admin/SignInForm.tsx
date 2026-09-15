'use client'

import { useActionState } from 'react'
import { requestSignInLink } from '@/app/actions/auth'
import { signInIdle } from '@/lib/admin/actionState'
import { SubmitButton } from '@/components/site/form/SubmitButton'
import { TextField } from '@/components/site/form/fields'

/**
 * The staff sign-in form.
 *
 * Reuses the patient forms' field components so the two surfaces cannot drift
 * apart on the accessibility details — `aria-invalid`, `aria-describedby` and
 * a real `<label>` are handled once, in components/site/form/fields.tsx.
 *
 * No password field, by design: the only credential is control of an
 * allowlisted mailbox. Nothing to phish, nothing to reuse, nothing to rotate,
 * and removing a departing member of staff is one environment variable rather
 * than a password reset nobody remembers to do.
 */
export function SignInForm({ from }: { from?: string }) {
  const [state, formAction] = useActionState(requestSignInLink, signInIdle)

  return (
    <form action={formAction} noValidate>
      {from ? <input type="hidden" name="from" value={from} /> : null}

      <TextField
        name="email"
        label="Work email"
        type="email"
        autoComplete="email"
        autoFocus
        error={state.status === 'error' ? state.message : undefined}
        hint="We will email you a link that signs you in. It works once and expires in 10 minutes."
      />

      <SubmitButton label="Email me a sign-in link" pendingLabel="Sending…" />
    </form>
  )
}
