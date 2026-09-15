'use client'

import { useActionState } from 'react'
import { updateInternalNotes } from '@/app/actions/admin'
import { adminActionIdle } from '@/lib/admin/actionState'
import { SubmitButton } from '@/components/site/form/SubmitButton'

/**
 * Staff notes on a submission.
 *
 * Encrypted at rest with the same key and the same code path as the patient's
 * own free text — see lib/crypto/field.ts. Notes a receptionist writes after
 * ringing a patient back are, if anything, more likely to contain clinical
 * detail than what the patient typed into a box that told them not to.
 *
 * The audit entry for a change records its length and whether it was cleared,
 * never its contents. Logging the text would create a second, unencrypted copy
 * of the most sensitive field in the row, in the one table the ninety-day
 * purge deliberately leaves alone.
 */
export function NotesForm({ id, notes }: { id: string; notes: string | null }) {
  const [state, formAction] = useActionState(updateInternalNotes, adminActionIdle)

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />

      <label htmlFor="internalNotes" className="text-label text-ink-muted uppercase">
        Internal notes
      </label>
      <p id="internal-notes-hint" className="pt-2 text-meta text-ink-muted">
        Visible to practice staff only. Encrypted at rest, and deleted with the submission when it
        is purged.
      </p>
      <textarea
        id="internalNotes"
        name="internalNotes"
        rows={6}
        maxLength={4000}
        defaultValue={notes ?? ''}
        aria-describedby="internal-notes-hint notes-result"
        className="mt-3 min-h-40 w-full rounded-control border border-border-strong bg-canvas px-4 py-3 text-body leading-relaxed text-ink focus-visible:border-accent"
      />

      <SubmitButton label="Save notes" pendingLabel="Saving…" />

      <p
        id="notes-result"
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
