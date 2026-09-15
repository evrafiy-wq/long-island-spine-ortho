import { describe, expect, it } from 'vitest'
import { digitsOnly, formatPhone, normalizePhone, telHref } from '@/lib/forms/phone'

describe('normalizePhone', () => {
  it('reduces every way a patient writes one number to a single stored form', () => {
    // The admin inbox searches this column. If these diverged, one patient
    // would appear as four unfindable records.
    for (const input of [
      '(516) 433-1100',
      '516-433-1100',
      '516.433.1100',
      '5164331100',
      ' 516 433 1100 ',
      '+1 516 433 1100',
      '1-516-433-1100',
    ]) {
      expect(normalizePhone(input)).toBe('+15164331100')
    }
  })

  it('rejects anything that is not a US ten-digit number', () => {
    expect(normalizePhone('')).toBeNull()
    expect(normalizePhone('433-1100')).toBeNull()
    expect(normalizePhone('25164331100')).toBeNull()
    expect(normalizePhone('+44 20 7946 0958')).toBeNull()
  })
})

describe('formatPhone', () => {
  it('renders the stored form for reading aloud', () => {
    expect(formatPhone('+15164331100')).toBe('(516) 433-1100')
  })

  it('passes anything unexpected through rather than mangling it', () => {
    expect(formatPhone('unknown')).toBe('unknown')
  })
})

describe('telHref', () => {
  it('strips punctuation for the dialer', () => {
    expect(telHref('+15164331100')).toBe('tel:15164331100')
  })
})

describe('digitsOnly', () => {
  it('keeps only digits', () => {
    expect(digitsOnly('(516) 433-1100')).toBe('5164331100')
  })
})
