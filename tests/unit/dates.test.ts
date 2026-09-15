import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  formatLongDate,
  isIsoDate,
  isWeekend,
  maxRequestDate,
  practiceToday,
} from '@/lib/forms/dates'

describe('practiceToday', () => {
  afterEach(() => vi.useRealTimers())

  it('reports the date in the practice timezone, not the runtime timezone', () => {
    vi.useFakeTimers()
    // 03:30 UTC on 2 June is still 23:30 on 1 June in New York. A patient
    // requesting late at night must not have "tomorrow" rejected as past.
    vi.setSystemTime(new Date('2026-06-02T03:30:00Z'))
    expect(practiceToday()).toBe('2026-06-01')
  })
})

describe('isIsoDate', () => {
  it('accepts a real calendar date', () => {
    expect(isIsoDate('2026-06-03')).toBe(true)
  })

  it('rejects a date that does not exist rather than rolling it forward', () => {
    // `new Date('2026-02-31')` silently becomes 3 March. Accepting that would
    // put an impossible date in front of the front desk.
    expect(isIsoDate('2026-02-31')).toBe(false)
  })

  it('rejects anything that is not YYYY-MM-DD', () => {
    expect(isIsoDate('')).toBe(false)
    expect(isIsoDate('03/06/2026')).toBe(false)
    expect(isIsoDate('2026-6-3')).toBe(false)
  })
})

describe('isWeekend', () => {
  it('identifies Saturday and Sunday', () => {
    expect(isWeekend('2026-06-06')).toBe(true) // Saturday
    expect(isWeekend('2026-06-07')).toBe(true) // Sunday
  })

  it('does not misreport a Monday in a timezone west of Greenwich', () => {
    // The regression this guards: `getDay()` on a UTC-midnight Date converts
    // to local time and reports the previous day in US timezones, turning
    // every Monday request into a rejected "weekend".
    const previous = process.env.TZ
    process.env.TZ = 'America/Los_Angeles'
    expect(isWeekend('2026-06-08')).toBe(false)
    process.env.TZ = previous
  })
})

describe('maxRequestDate', () => {
  it('is twelve months out', () => {
    expect(maxRequestDate('2026-06-01')).toBe('2027-06-01')
  })
})

describe('formatLongDate', () => {
  it('renders a date-only string without shifting the day', () => {
    expect(formatLongDate('2026-06-03')).toBe('Wednesday, June 3, 2026')
  })

  it('passes unparseable input through untouched', () => {
    expect(formatLongDate('not a date')).toBe('not a date')
  })
})

beforeEach(() => {
  /* placeholder so `beforeEach` import stays meaningful if hooks are added */
})
