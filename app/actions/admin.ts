'use server'

import { revalidatePath } from 'next/cache'
import type { AdminActionState } from '@/lib/admin/actionState'
import { requireAdmin } from '@/lib/admin/session'
import { isSubmissionStatus } from '@/lib/admin/status'
import { readString } from '@/lib/forms/state'
import { getSubmission, setInternalNotes, setSubmissionStatus } from '@/lib/submissions/repository'

/**
 * The two mutations available in the admin inbox.
 *
 * Both re-authorise through `requireAdmin()` even though the middleware has
 * already gated the segment. A Server Action is a POST to a URL, not a page
 * navigation — treating a middleware matcher as the only thing standing
 * between the internet and a patient record would be relying on a routing
 * config to be a security boundary.
 *
 * Both are audited, and the audit row is written in the SAME transaction as
 * the change — see `store.update` in lib/submissions/pgStore.ts. An audit
 * trail that can be half-written is not an audit trail.
 */

export async function updateSubmissionStatus(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const actor = await requireAdmin()

  const id = readString(formData, 'id')
  const status = readString(formData, 'status')

  if (!isSubmissionStatus(status)) {
    return { status: 'error', message: 'That is not a valid status.' }
  }

  const existing = await getSubmission(id)
  if (!existing) return { status: 'error', message: 'That submission no longer exists.' }

  if (existing.status === status) {
    return { status: 'saved', message: `Already ${status}. Nothing changed.` }
  }

  try {
    // `previousStatus` is passed through so the audit entry records the
    // transition, not just the destination. "Moved to closed" is far less
    // useful after the fact than "moved from new to closed".
    const updated = await setSubmissionStatus(id, status, actor, existing.status)
    if (!updated) return { status: 'error', message: 'That submission no longer exists.' }

    revalidatePath('/admin')
    revalidatePath(`/admin/${id}`)
    return { status: 'saved', message: `Status changed to ${status}.` }
  } catch (error) {
    console.error('[admin] Status change failed:', error)
    return { status: 'error', message: 'The change was not saved. Please try again.' }
  }
}

export async function updateInternalNotes(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const actor = await requireAdmin()

  const id = readString(formData, 'id')
  const notes = readString(formData, 'internalNotes')

  if (notes.length > 4000) {
    return { status: 'error', message: 'Notes are limited to 4000 characters.' }
  }

  try {
    const updated = await setInternalNotes(id, notes, actor)
    if (!updated) return { status: 'error', message: 'That submission no longer exists.' }

    revalidatePath(`/admin/${id}`)
    return { status: 'saved', message: 'Notes saved.' }
  } catch (error) {
    console.error('[admin] Note change failed:', error)
    return { status: 'error', message: 'The notes were not saved. Please try again.' }
  }
}
