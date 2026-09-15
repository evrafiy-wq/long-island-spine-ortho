import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { practice } from '@/content/practice'
import {
  NOTES_MAX_LENGTH,
  appointmentFromFormData,
  appointmentSchema,
  timeWindowLabel,
  validateAppointmentField,
} from '@/lib/forms/appointment'
import { fieldErrorsFromZod } from '@/lib/forms/state'

/**
 * These tests pin the ONE schema that both the browser and the Server Action
 * parse against. A change here changes what the patient sees beside the field
 * and what the server accepts, together — which is the property the shared
 * schema exists to guarantee.
 *
 * Time is frozen so "in the past" and "is a weekday" are deterministic.
 * 2026-06-03 is a Wednesday; 2026-06-06 is a Saturday.
 */
const NOW = new Date('2026-06-01T14:00:00Z')

const valid = {
  fullName: 'Marta Alvarez',
  phone: '(516) 433-1100',
  email: 'marta@example.com',
  preferredDate: '2026-06-03',
  preferredTimeWindow: 'morning',
  reason: 'Spine Consultation',
  referringPhysician: '',
  insuranceCarrier: '',
  notes: '',
}

function parse(overrides: Partial<typeof valid> = {}) {
  return appointmentSchema.safeParse({ ...valid, ...overrides })
}

function errorsFor(overrides: Partial<typeof valid>) {
  const result = parse(overrides)
  if (result.success) throw new Error('Expected the parse to fail.')
  return fieldErrorsFromZod(result.error)
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(NOW)
})

afterEach(() => vi.useRealTimers())

describe('a complete request', () => {
  it('parses', () => {
    expect(parse().success).toBe(true)
  })

  it('normalises the phone number to the single stored form', () => {
    const result = parse({ phone: '516.433.1100' })
    expect(result.success && result.data.phone).toBe('+15164331100')
  })

  it('turns blank optional fields into undefined so the column stays NULL', () => {
    const result = parse()
    expect(result.success && result.data.referringPhysician).toBeUndefined()
    expect(result.success && result.data.insuranceCarrier).toBeUndefined()
    expect(result.success && result.data.notes).toBeUndefined()
  })

  it('trims surrounding whitespace off free text', () => {
    const result = parse({ fullName: '  Marta Alvarez  ', notes: '  mornings only  ' })
    expect(result.success && result.data.fullName).toBe('Marta Alvarez')
    expect(result.success && result.data.notes).toBe('mornings only')
  })
})

describe('required fields', () => {
  it('reports one message per empty field, not a cascade', () => {
    const errors = errorsFor({
      fullName: '',
      phone: '',
      email: '',
      preferredDate: '',
      preferredTimeWindow: '',
      reason: '',
    })

    expect(Object.keys(errors).sort()).toEqual([
      'email',
      'fullName',
      'phone',
      'preferredDate',
      'preferredTimeWindow',
      'reason',
    ])
    // Every message has to be something a patient can act on.
    for (const message of Object.values(errors)) {
      expect(message).toMatch(/[a-z]/)
      expect(message).not.toMatch(/invalid_/i)
    }
  })
})

describe('the preferred date', () => {
  it('rejects a date that has already passed', () => {
    expect(errorsFor({ preferredDate: '2026-05-30' }).preferredDate).toMatch(/already passed/i)
  })

  it('accepts today', () => {
    // 2026-06-01 is a Monday and is "today" at the frozen time.
    expect(parse({ preferredDate: '2026-06-01' }).success).toBe(true)
  })

  it('rejects a Saturday with the practice’s own closed-at-weekends message', () => {
    expect(errorsFor({ preferredDate: '2026-06-06' }).preferredDate).toBe(
      practice.copy.appointmentForm.weekendMessage,
    )
  })

  it('rejects a Sunday', () => {
    expect(errorsFor({ preferredDate: '2026-06-07' }).preferredDate).toBeDefined()
  })

  it('rejects a date more than twelve months out', () => {
    expect(errorsFor({ preferredDate: '2027-09-01' }).preferredDate).toMatch(/12 months/i)
  })

  it('reports only the first problem for one value', () => {
    // A past Saturday fails two rules; the patient should read one sentence.
    const errors = errorsFor({ preferredDate: '2026-05-30' })
    expect(Object.keys(errors)).toEqual(['preferredDate'])
  })
})

describe('the phone number', () => {
  it('rejects a number that is not ten digits, with an example', () => {
    expect(errorsFor({ phone: '433-1100' }).phone).toMatch(/\(516\) 433-1100/)
  })
})

describe('the email address', () => {
  it('rejects a malformed address', () => {
    expect(errorsFor({ email: 'marta@' }).email).toMatch(/valid email/i)
  })

  it('rejects an address over the RFC length limit', () => {
    expect(errorsFor({ email: `${'a'.repeat(250)}@example.com` }).email).toMatch(/too long/i)
  })
})

describe('the select fields', () => {
  it('rejects a value that is not on the practice’s own list', () => {
    // Guards against a tampered <option> reaching the database.
    expect(errorsFor({ reason: 'Cosmetic Surgery' }).reason).toMatch(/choose a reason/i)
    expect(errorsFor({ preferredTimeWindow: 'midnight' }).preferredTimeWindow).toMatch(
      /choose a preferred time/i,
    )
  })

  it('accepts every option the form actually offers', () => {
    for (const reason of practice.appointmentReasons) {
      expect(parse({ reason }).success).toBe(true)
    }
    for (const window of practice.appointmentTimeWindows) {
      expect(parse({ preferredTimeWindow: window.id }).success).toBe(true)
    }
  })
})

describe('the notes field', () => {
  it('accepts a short note', () => {
    expect(parse({ notes: 'I can only do mornings.' }).success).toBe(true)
  })

  it('caps the length and says why', () => {
    const message = errorsFor({ notes: 'x'.repeat(NOTES_MAX_LENGTH + 1) }).notes
    // The cap exists to discourage a case history, so the message has to point
    // at the phone rather than just stating a number.
    expect(message).toMatch(/by phone/i)
  })
})

describe('appointmentFromFormData', () => {
  it('reads every field and substitutes an empty string for anything absent', () => {
    const formData = new FormData()
    formData.set('fullName', 'Marta Alvarez')

    const raw = appointmentFromFormData(formData)
    expect(raw.fullName).toBe('Marta Alvarez')
    expect(raw.notes).toBe('')
    expect(raw.preferredDate).toBe('')
  })
})

describe('validateAppointmentField', () => {
  it('applies the same rule as the whole-form parse', () => {
    expect(validateAppointmentField('email', 'nope')).toMatch(/valid email/i)
    expect(validateAppointmentField('email', 'marta@example.com')).toBeUndefined()
    expect(validateAppointmentField('preferredDate', '2026-06-06')).toBe(
      practice.copy.appointmentForm.weekendMessage,
    )
  })
})

describe('timeWindowLabel', () => {
  it('resolves a stored id to its label', () => {
    expect(timeWindowLabel('morning')).toBe('Morning (9:00am–12:00pm)')
  })

  it('falls back to the raw id rather than rendering nothing', () => {
    expect(timeWindowLabel('retired-option')).toBe('retired-option')
  })
})
