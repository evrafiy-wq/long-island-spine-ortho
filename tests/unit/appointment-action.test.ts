import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { FormState } from '@/lib/forms/state'
import type { AppointmentField } from '@/lib/forms/appointment'
import type { Submission } from '@/lib/submissions/types'

/**
 * The Server Action, with only its two outbound edges replaced.
 *
 * The repository and the mailer are mocked — those are Postgres and Resend.
 * Everything else runs for real: the honeypot, Turnstile (which reports
 * `skipped` with no secret configured), the in-process rate limiter, and the
 * Zod parse. Mocking the intake guard instead would have left the parts most
 * likely to break silently untested.
 *
 * Each test uses a different IP so the sliding-window limiter, which is shared
 * module state, does not carry over between them.
 */

let currentIp = '203.0.113.1'

vi.mock('next/headers', () => ({
  headers: async () => new Headers({ 'x-forwarded-for': currentIp }),
}))

const createSubmission = vi.fn()
const sendSubmissionNotifications = vi.fn()

vi.mock('@/lib/submissions/repository', () => ({
  createSubmission: (...args: unknown[]) => createSubmission(...args),
}))

vi.mock('@/lib/email/send', () => ({
  sendSubmissionNotifications: (...args: unknown[]) => sendSubmissionNotifications(...args),
}))

const { submitAppointmentRequest } = await import('@/app/actions/appointment')
const { practice } = await import('@/content/practice')

const NOW = new Date('2026-06-01T14:00:00Z')

const idle: FormState<AppointmentField> = { status: 'idle' }

function formData(overrides: Record<string, string> = {}): FormData {
  const data = new FormData()
  const base: Record<string, string> = {
    fullName: 'Marta Alvarez',
    phone: '(516) 433-1100',
    email: 'marta@example.com',
    preferredDate: '2026-06-03',
    preferredTimeWindow: 'morning',
    reason: 'Spine Consultation',
    referringPhysician: '',
    insuranceCarrier: '',
    notes: '',
    ...overrides,
  }
  for (const [key, value] of Object.entries(base)) data.set(key, value)
  return data
}

function storedSubmission(): Submission {
  return {
    id: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
    reference: 'AAAAAAAA',
    kind: 'appointment',
    status: 'new',
    fullName: 'Marta Alvarez',
    email: 'marta@example.com',
    phone: '+15164331100',
    subject: 'Spine Consultation',
    preferredDate: '2026-06-03',
    preferredTimeWindow: 'morning',
    referringPhysician: null,
    insuranceCarrier: null,
    notes: null,
    internalNotes: null,
    ipHash: 'hashed',
    botCheck: 'skipped',
    createdAt: NOW,
    updatedAt: NOW,
    closedAt: null,
  }
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(NOW)
  createSubmission.mockReset().mockResolvedValue(storedSubmission())
  sendSubmissionNotifications.mockReset().mockResolvedValue({ officeSent: true, patientSent: true })
})

afterEach(() => vi.useRealTimers())

describe('a valid submission', () => {
  beforeEach(() => {
    currentIp = '203.0.113.10'
  })

  it('stores it and reports the reference back', async () => {
    const result = await submitAppointmentRequest(idle, formData())

    expect(result).toEqual({ status: 'success', reference: 'AAAAAAAA' })
    expect(createSubmission).toHaveBeenCalledTimes(1)
  })

  it('stores the normalised phone number, not what was typed', async () => {
    await submitAppointmentRequest(idle, formData({ phone: '516.433.1100' }))
    expect(createSubmission.mock.calls[0]?.[0]).toMatchObject({ phone: '+15164331100' })
  })

  it('records a hashed IP and never the address itself', async () => {
    await submitAppointmentRequest(idle, formData())
    const input = createSubmission.mock.calls[0]?.[0]

    expect(input.ipHash).toEqual(expect.any(String))
    expect(input.ipHash).not.toContain('203.0.113')
  })

  it('maps the reason into `subject` and keeps the kind', async () => {
    await submitAppointmentRequest(idle, formData({ reason: 'Second Opinion' }))
    expect(createSubmission.mock.calls[0]?.[0]).toMatchObject({
      kind: 'appointment',
      subject: 'Second Opinion',
    })
  })

  it('notifies the office and the patient AFTER the row is written', async () => {
    await submitAppointmentRequest(idle, formData())

    expect(sendSubmissionNotifications).toHaveBeenCalledTimes(1)
    const writeOrder = createSubmission.mock.invocationCallOrder[0] ?? 0
    const mailOrder = sendSubmissionNotifications.mock.invocationCallOrder[0] ?? 0
    expect(writeOrder).toBeLessThan(mailOrder)
  })
})

describe('validation failures', () => {
  beforeEach(() => {
    currentIp = '203.0.113.20'
  })

  it('returns field errors and writes nothing', async () => {
    const result = await submitAppointmentRequest(idle, formData({ email: 'nope' }))

    expect(result.status).toBe('error')
    if (result.status !== 'error') return
    expect(result.fieldErrors.email).toMatch(/valid email/i)
    expect(createSubmission).not.toHaveBeenCalled()
    expect(sendSubmissionNotifications).not.toHaveBeenCalled()
  })

  it('hands back what was typed so the no-JavaScript path does not lose it', async () => {
    const result = await submitAppointmentRequest(
      idle,
      formData({ email: 'nope', notes: 'mornings only' }),
    )

    expect(result.status).toBe('error')
    if (result.status !== 'error') return
    expect(result.values.fullName).toBe('Marta Alvarez')
    expect(result.values.notes).toBe('mornings only')
  })

  it('increments `attempt` so a repeat failure is re-announced', async () => {
    const first = await submitAppointmentRequest(idle, formData({ email: 'nope' }))
    expect(first.status === 'error' && first.attempt).toBe(1)

    const second = await submitAppointmentRequest(first, formData({ email: 'nope' }))
    expect(second.status === 'error' && second.attempt).toBe(2)
  })

  it('rejects a weekend date on the server even if the browser allowed it', async () => {
    const result = await submitAppointmentRequest(idle, formData({ preferredDate: '2026-06-06' }))

    expect(result.status).toBe('error')
    if (result.status !== 'error') return
    expect(result.fieldErrors.preferredDate).toBe(practice.copy.appointmentForm.weekendMessage)
  })
})

describe('the honeypot', () => {
  beforeEach(() => {
    currentIp = '203.0.113.30'
  })

  it('discards the submission but reports success, so the trap stays hidden', async () => {
    const data = formData()
    data.set('company', 'Acme Marketing')

    const result = await submitAppointmentRequest(idle, data)

    expect(result).toEqual({ status: 'success', reference: '' })
    expect(createSubmission).not.toHaveBeenCalled()
    expect(sendSubmissionNotifications).not.toHaveBeenCalled()
  })
})

describe('rate limiting', () => {
  beforeEach(() => {
    currentIp = '203.0.113.40'
  })

  it('blocks a burst from one address and points at the phone number', async () => {
    // The verified tier allows eight in ten minutes; the ninth is refused.
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const allowed = await submitAppointmentRequest(idle, formData())
      expect(allowed.status).toBe('success')
    }

    const blocked = await submitAppointmentRequest(idle, formData())
    expect(blocked.status).toBe('error')
    if (blocked.status !== 'error') return
    expect(blocked.message).toContain(practice.contact.phone.display)
    expect(createSubmission).toHaveBeenCalledTimes(8)
  })
})

describe('when the database is unreachable', () => {
  beforeEach(() => {
    currentIp = '203.0.113.50'
  })

  it('does NOT report success, and sends the patient to the phone', async () => {
    // The pre-Phase-4 form showed "Request received" for a submission that
    // went nowhere. This is the test that stops that coming back.
    createSubmission.mockRejectedValueOnce(new Error('connection refused'))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const result = await submitAppointmentRequest(idle, formData())

    expect(result.status).toBe('error')
    if (result.status !== 'error') return
    expect(result.message).toContain(practice.contact.phone.display)
    expect(sendSubmissionNotifications).not.toHaveBeenCalled()
  })
})
