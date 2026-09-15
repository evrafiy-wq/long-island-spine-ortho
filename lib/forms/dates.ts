/**
 * Date helpers for the appointment form.
 *
 * Isomorphic — the same rules have to run in the browser (to show an error
 * before the patient submits) and on the server (because the browser's copy is
 * advisory only).
 *
 * Everything is computed in the PRACTICE's timezone, not the visitor's. The
 * question the form is really asking is "is this a day the Hicksville office
 * is open", and a patient requesting from California at 9pm Pacific must not
 * be told that tomorrow in New York is already in the past.
 */

export const PRACTICE_TIMEZONE = 'America/New_York'

/** How far ahead a request may be made. Beyond this it is not a real request. */
export const MAX_MONTHS_AHEAD = 12

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/**
 * Today in the practice's timezone as YYYY-MM-DD.
 *
 * `en-CA` is used for its formatting, not its locale: it is the one widely
 * available locale whose numeric date format is already ISO order, which
 * avoids reassembling the parts by hand.
 */
export function practiceToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: PRACTICE_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

export function isIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false
  const parsed = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime())) return false
  // Rejects 2026-02-31, which Date would otherwise roll forward to March.
  return parsed.toISOString().slice(0, 10) === value
}

/**
 * Saturday or Sunday.
 *
 * Deliberately parsed as UTC and read with `getUTCDay`. `new Date('2026-09-14')`
 * is already UTC midnight, but `getDay()` would then convert to the runtime's
 * local zone — west of Greenwich that lands on the previous calendar day, so a
 * Monday request is reported as a Sunday. Staying in UTC end to end keeps the
 * weekday the one the patient picked.
 */
export function isWeekend(isoDate: string): boolean {
  const day = new Date(`${isoDate}T00:00:00Z`).getUTCDay()
  return day === 0 || day === 6
}

/** The furthest date the form accepts, as YYYY-MM-DD. */
export function maxRequestDate(from: string = practiceToday()): string {
  const date = new Date(`${from}T00:00:00Z`)
  date.setUTCMonth(date.getUTCMonth() + MAX_MONTHS_AHEAD)
  return date.toISOString().slice(0, 10)
}

/** ISO date strings sort lexicographically, so no parsing is needed to compare. */
export function isBefore(isoDate: string, otherIsoDate: string): boolean {
  return isoDate < otherIsoDate
}

/** "Monday, 14 September 2026" — for emails and the admin inbox. */
export function formatLongDate(isoDate: string): string {
  if (!isIsoDate(isoDate)) return isoDate
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${isoDate}T00:00:00Z`))
}

/** Timestamps in the admin inbox, always shown in the practice's timezone. */
export function formatTimestamp(value: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: PRACTICE_TIMEZONE,
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value)
}
