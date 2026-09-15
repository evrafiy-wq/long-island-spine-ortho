'use client'

import Script from 'next/script'
import { useEffect } from 'react'
import { HONEYPOT_FIELD } from '@/lib/forms/appointment'

/**
 * The honeypot.
 *
 * Hidden from everyone who should not see it, and hidden in the way that
 * matters for each of them: `aria-hidden` for assistive technology,
 * `tabIndex={-1}` so it is not reachable by keyboard, `autoComplete="off"` so
 * a password manager does not helpfully fill it, and a wrapper that is
 * off-screen rather than `display: none` — a few bots skip anything with
 * `display: none` precisely because it is the obvious trap.
 *
 * A human cannot put anything in this. A form-filling bot fills every input it
 * can find. The server treats a non-empty value as a silent drop.
 */
export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
      <label htmlFor={HONEYPOT_FIELD}>Company</label>
      <input
        id={HONEYPOT_FIELD}
        name={HONEYPOT_FIELD}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        defaultValue=""
      />
    </div>
  )
}

declare global {
  interface Window {
    turnstile?: { reset: (widget?: string) => void }
  }
}

interface TurnstileProps {
  siteKey: string | undefined
  /** Bumped on a rejected submit so the spent token is exchanged for a fresh one. */
  attempt: number
}

/**
 * Cloudflare Turnstile.
 *
 * Renders nothing at all when `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is unset, which
 * is what lets the site run locally and under Playwright with an empty `.env`.
 * The server side mirrors that: with no secret key configured, the check
 * reports `skipped` rather than failing every submission.
 *
 * THIS IS THE ONE PART OF THE FORM THAT NEEDS JAVASCRIPT. The widget is the
 * only thing that can mint a token, so a visitor with scripting disabled
 * submits without one. That is handled rather than punished — see
 * lib/security/turnstile.ts: a tokenless submission is `unverified`, not
 * `failed`, and goes through on a much stricter rate-limit tier. Requiring the
 * token would have turned "works without JavaScript" into a lie.
 *
 * The reset on `attempt` matters: a Turnstile token is single-use. Without it,
 * a patient who fixes one field and resubmits sends the same spent token, the
 * server reports `failed`, and the form refuses them for something they did
 * not do.
 */
export function Turnstile({ siteKey, attempt }: TurnstileProps) {
  useEffect(() => {
    if (attempt > 0) window.turnstile?.reset()
  }, [attempt])

  if (!siteKey) return null

  return (
    <div className="pt-6">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="lazyOnload"
        // The widget needs no interaction in its default mode, so loading it
        // late costs nothing and keeps a third-party script off the critical
        // path of a page whose job is to be readable.
      />
      <div
        className="cf-turnstile"
        data-sitekey={siteKey}
        data-theme="light"
        data-refresh-expired="auto"
      />
      <noscript>
        <p className="max-w-reading pt-3 text-meta text-ink-muted">
          The automated spam check needs JavaScript. You can still send this form without it.
        </p>
      </noscript>
    </div>
  )
}
