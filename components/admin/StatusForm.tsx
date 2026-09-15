'use client'

import { useActionState } from 'react'
import { updateSubmissionStatus } from '@/app/actions/admin'
import { adminActionIdle } from '@/lib/admin/actionState'
import { SubmitButton } from '@/components/site/form/SubmitButton'
import { STATUS_DESCRIPTIONS, STATUS_LABELS, STATUS_ORDER } from '@/lib/admin/status'
import type { SubmissionStatus } from '@/lib/submissions/types'

/**
 * The status dropdown.
 *
 * A select plus an explicit save button, not an auto-submitting select. A
 * change that fires on `onChange` is unrecoverable from the keyboard: arrowing
 * through the options in some browsers fires `change` for each one, so
 * reaching "Closed" from "New" would walk the record through two status
 * changes and two audit entries on the way.
 *
 * `aria-describedby` points at the description of the CURRENTLY SELECTED
 * option, which is how "Closed" gets to say that it starts a ninety-day
 * deletion clock at the moment someone is choosing it.
 */
export function StatusForm({ id, status }: { id: string; status: SubmissionStatus }) {
  const [state, formAction] = useActionState(updateSubmissionStatus, adminActionIdle)

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />

      <label htmlFor="status" className="text-label text-ink-muted uppercase">
        Status
      </label>
      <select
        id="status"
        name="status"
        defaultValue={status}
        aria-describedby="status-hint status-result"
        className="mt-2 min-h-[3.25rem] w-full rounded-control border border-border-strong bg-canvas px-4 text-body text-ink focus-visible:border-accent"
      >
        {STATUS_ORDER.map((value) => (
          <option key={value} value={value}>
            {STATUS_LABELS[value]}
          </option>
        ))}
      </select>

      <p id="status-hint" className="pt-2 text-meta text-ink-muted">
        {STATUS_DESCRIPTIONS[status]}
      </p>

      <SubmitButton label="Save status" pendingLabel="Saving…" />

      <p
        id="status-result"
        role="status"
        className={
          state.status === 'error'
            ? 'pt-3 text-meta font-semibold text-danger'
            : 'pt-3 text-meta text-ink-muted'
        }
      >
        {state.status === 'idle' ? '' : state.message}
      </p>
    </form>
  )
}
