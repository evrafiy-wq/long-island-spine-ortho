import { describe, expect, it } from 'vitest'
import { practice } from '@/content/practice'
import { MESSAGE_MAX_LENGTH, contactSchema, validateContactField } from '@/lib/forms/contact'
import { fieldErrorsFromZod } from '@/lib/forms/state'

const valid = {
  fullName: 'Marta Alvarez',
  email: 'marta@example.com',
  phone: '',
  topic: 'Billing or insurance',
  message: 'Could you confirm whether my plan is accepted before I book?',
}

function parse(overrides: Partial<typeof valid> = {}) {
  return contactSchema.safeParse({ ...valid, ...overrides })
}

function errorsFor(overrides: Partial<typeof valid>) {
  const result = parse(overrides)
  if (result.success) throw new Error('Expected the parse to fail.')
  return fieldErrorsFromZod(result.error)
}

describe('a complete enquiry', () => {
  it('parses without a phone number', () => {
    const result = parse()
    expect(result.success).toBe(true)
    expect(result.success && result.data.phone).toBeUndefined()
  })

  it('normalises a phone number when one is given', () => {
    const result = parse({ phone: '516-433-1100' })
    expect(result.success && result.data.phone).toBe('+15164331100')
  })
})

describe('the optional phone number', () => {
  it('is still validated when it is not blank', () => {
    // Optional must not mean unchecked — a mistyped number is worse than none,
    // because staff will try it.
    expect(errorsFor({ phone: '12345' }).phone).toMatch(/or leave this blank/i)
  })
})

describe('the topic', () => {
  it('accepts every option the form offers', () => {
    for (const topic of practice.contactTopics) {
      expect(parse({ topic }).success).toBe(true)
    }
  })

  it('rejects a value that is not on the list', () => {
    expect(errorsFor({ topic: 'Prescription refill' }).topic).toMatch(/choose a topic/i)
  })
})

describe('the message', () => {
  it('requires enough to route the enquiry', () => {
    expect(errorsFor({ message: 'hi' }).message).toMatch(/tell us a little more/i)
  })

  it('caps the length and points at the phone', () => {
    expect(errorsFor({ message: 'x'.repeat(MESSAGE_MAX_LENGTH + 1) }).message).toMatch(/by phone/i)
  })

  it('shares the appointment form’s cap, so neither becomes the soft option', () => {
    expect(MESSAGE_MAX_LENGTH).toBe(500)
  })
})

describe('validateContactField', () => {
  it('applies the same rule as the whole-form parse', () => {
    expect(validateContactField('email', 'nope')).toMatch(/valid email/i)
    expect(validateContactField('fullName', 'Marta Alvarez')).toBeUndefined()
  })
})
