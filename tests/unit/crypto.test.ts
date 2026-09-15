import { beforeAll, describe, expect, it, vi } from 'vitest'

/**
 * Field encryption.
 *
 * The key has to be in the environment before the module first derives it —
 * `key()` caches after the first call — so it is set here rather than in a
 * setup file.
 */
const TEST_KEY = Buffer.alloc(32, 3).toString('base64')

beforeAll(() => {
  process.env.FIELD_ENCRYPTION_KEY = TEST_KEY
})

const {
  decryptField,
  decryptOptional,
  encryptField,
  encryptOptional,
  safeCompare,
  UNREADABLE_FIELD,
} = await import('@/lib/crypto/field')

describe('round trip', () => {
  it('returns exactly what went in, including newlines and non-ASCII', () => {
    const plaintext = 'Referred by Dr. Nowak.\nI can only manage mornings — thank you. €'
    expect(decryptField(encryptField(plaintext))).toBe(plaintext)
  })

  it('handles an empty string', () => {
    expect(decryptField(encryptField(''))).toBe('')
  })
})

describe('the stored payload', () => {
  it('does not contain the plaintext', () => {
    const payload = encryptField('sciatica down the left leg')
    expect(payload).not.toContain('sciatica')
  })

  it('carries a version prefix so the format can be migrated later', () => {
    expect(encryptField('x').startsWith('v1.')).toBe(true)
  })

  it('is different every time, because the nonce is random', () => {
    // Deterministic ciphertext would leak that two patients wrote the same
    // thing, and GCM is catastrophically broken by a repeated nonce.
    expect(encryptField('same text')).not.toBe(encryptField('same text'))
  })
})

describe('tamper detection', () => {
  it('refuses a modified ciphertext rather than returning garbage', () => {
    const payload = encryptField('original')
    const parts = payload.split('.')
    const body = Buffer.from(parts[3] ?? '', 'base64')
    body[0] = (body[0] ?? 0) ^ 0xff
    const tampered = [parts[0], parts[1], parts[2], body.toString('base64')].join('.')

    expect(() => decryptField(tampered)).toThrow()
  })

  it('refuses a payload written by an unknown version', () => {
    expect(() => decryptField('v9.aaa.bbb.ccc')).toThrow(/unknown version/i)
  })

  it('refuses a malformed payload', () => {
    expect(() => decryptField('not-a-payload')).toThrow()
  })
})

describe('the optional wrappers', () => {
  it('map null, undefined and empty to null so the column stays NULL', () => {
    expect(encryptOptional(null)).toBeNull()
    expect(encryptOptional(undefined)).toBeNull()
    expect(encryptOptional('')).toBeNull()
    expect(decryptOptional(null)).toBeNull()
  })

  it('degrade to a placeholder instead of throwing, so one bad column cannot lose a record', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    // A receptionist still needs the name, phone and date on this record.
    expect(decryptOptional('v1.corrupt.corrupt.corrupt')).toBe(UNREADABLE_FIELD)
  })
})

describe('safeCompare', () => {
  it('matches identical strings and rejects everything else', () => {
    expect(safeCompare('Bearer abc', 'Bearer abc')).toBe(true)
    expect(safeCompare('Bearer abc', 'Bearer abd')).toBe(false)
    expect(safeCompare('short', 'much longer value')).toBe(false)
    expect(safeCompare('', '')).toBe(true)
  })
})

describe('with no key configured', () => {
  it('throws a message that says how to generate one', async () => {
    vi.resetModules()
    vi.stubEnv('FIELD_ENCRYPTION_KEY', '')
    const fresh = await import('@/lib/crypto/field')

    expect(() => fresh.encryptField('x')).toThrow(/openssl rand -base64 32/)
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('rejects a key of the wrong length rather than silently padding it', async () => {
    vi.resetModules()
    vi.stubEnv('FIELD_ENCRYPTION_KEY', Buffer.alloc(16, 1).toString('base64'))
    const fresh = await import('@/lib/crypto/field')

    expect(() => fresh.encryptField('x')).toThrow(/32 bytes/)
    vi.unstubAllEnvs()
    vi.resetModules()
  })
})
