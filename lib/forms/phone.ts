/**
 * Phone number normalisation.
 *
 * Patients type "(516) 433-1100", "516.433.1100", "+1 516 433 1100" and
 * "5164331100". All four are the same number and all four must be findable by
 * one search in the admin inbox, so exactly one canonical form is stored:
 * E.164, e.g. `+15164331100`. Display formatting happens at the edges.
 *
 * Scope is US/Canada ten-digit numbers, which is what this practice's patients
 * have. `normalizePhone` returns null for anything else rather than guessing,
 * and the caller turns that into a field error.
 */

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

export function normalizePhone(value: string): string | null {
  const digits = digitsOnly(value)
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return null
}

/** `+15164331100` -> `(516) 433-1100`. Anything unexpected passes through. */
export function formatPhone(e164: string): string {
  const digits = digitsOnly(e164)
  const local = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits
  if (local.length !== 10) return e164
  return `(${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`
}

/** A `tel:` href for a stored number. */
export function telHref(e164: string): string {
  return `tel:${digitsOnly(e164)}`
}
