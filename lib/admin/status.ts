import type { SubmissionStatus } from '@/lib/db/schema'

/**
 * The status vocabulary, in workflow order.
 *
 * Order matters in two places that must agree: the filter chips across the top
 * of the inbox and the dropdown on the detail view. Deriving both from one
 * array is what keeps them in step.
 *
 * `closed` is the only status the ninety-day purge acts on, which is why its
 * description says so out loud in the dropdown — a member of staff choosing it
 * is starting a deletion clock, and that should not be a surprise.
 */
export const STATUS_ORDER = ['new', 'contacted', 'scheduled', 'closed'] as const

export const STATUS_LABELS: Record<SubmissionStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  scheduled: 'Scheduled',
  closed: 'Closed',
}

export const STATUS_DESCRIPTIONS: Record<SubmissionStatus, string> = {
  new: 'Nobody has picked this up yet.',
  contacted: 'Someone has spoken to, or left a message for, this patient.',
  scheduled: 'An appointment has been booked in the practice calendar.',
  closed: 'Finished. Deleted automatically 90 days from now.',
}

export function isSubmissionStatus(value: string | null | undefined): value is SubmissionStatus {
  return (
    value !== null && value !== undefined && (STATUS_ORDER as readonly string[]).includes(value)
  )
}

export const KIND_LABELS = {
  appointment: 'Appointment',
  contact: 'Enquiry',
} as const

export function isSubmissionKind(
  value: string | null | undefined,
): value is 'appointment' | 'contact' {
  return value === 'appointment' || value === 'contact'
}
