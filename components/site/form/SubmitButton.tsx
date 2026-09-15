'use client'

import { useFormStatus } from 'react-dom'

interface SubmitButtonProps {
  label: string
  pendingLabel: string
}

/**
 * The submit button, disabled while the action is in flight.
 *
 * Deliberately its own component so it can call `useFormStatus`, which only
 * reports the status of a form ABOVE it in the tree — called in the form
 * component itself it returns `pending: false` forever.
 *
 * Preferred to threading `isPending` down from `useActionState` because this
 * also covers the no-JavaScript-yet window: React tracks the pending state of
 * a form the moment it is submitted, including a submission that started
 * before hydration finished.
 *
 * `aria-disabled` rather than `disabled` would leave the button focusable, but
 * it would also let a second submit through. On a form that creates a record
 * and sends two emails, a duplicate is worse than a moment of lost focus.
 */
export function SubmitButton({ label, pendingLabel }: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-7 flex min-h-[3.25rem] w-full items-center justify-center rounded-control bg-accent text-meta font-semibold text-on-accent transition-state hover:bg-accent-hover disabled:opacity-70"
    >
      {pending ? pendingLabel : label}
    </button>
  )
}
