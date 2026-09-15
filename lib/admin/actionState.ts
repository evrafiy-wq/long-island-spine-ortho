/**
 * Return types and initial values for the admin Server Actions.
 *
 * Separate from app/actions/admin.ts and app/actions/auth.ts because a
 * `'use server'` module may only export async functions. Exporting
 * `adminActionIdle` — a plain object — from one of those files fails the build
 * with "A 'use server' file can only export async functions, found object",
 * and it fails at page-data collection rather than at type-check, so the error
 * points at the route rather than at the export.
 *
 * Types alone would have been fine, since they are erased. The `idle`
 * constants are the part that has to live somewhere else, and keeping the type
 * beside its initial value is worth more than splitting them across two files
 * to prove a point about erasure.
 */

export type AdminActionState =
  { status: 'idle' } | { status: 'saved'; message: string } | { status: 'error'; message: string }

export const adminActionIdle: AdminActionState = { status: 'idle' }

export type SignInState = { status: 'idle' } | { status: 'error'; message: string }

export const signInIdle: SignInState = { status: 'idle' }
