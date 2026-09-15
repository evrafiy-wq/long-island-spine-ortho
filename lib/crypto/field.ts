import 'server-only'
import { createCipheriv, createDecipheriv, randomBytes, timingSafeEqual } from 'node:crypto'
import { isE2E, optionalEnv } from '@/lib/env'

/**
 * Application-level encryption for the two free-text columns.
 *
 * AES-256-GCM. Authenticated, so a tampered ciphertext fails loudly instead of
 * decrypting to garbage — which matters when the plaintext is going in front of
 * a receptionist who will act on it.
 *
 * WHY THIS EXISTS. Neon encrypts at rest already, but that key is Neon's: it
 * protects the disk, not the row. This protects the row from everything that
 * legitimately reaches the database — a `pg_dump` in someone's Downloads
 * folder, a leaked read-only connection string, a console session, a restored
 * backup. The application holds the key, so ciphertext is all any of those
 * yield.
 *
 * WHAT IT DOES NOT DO. A running instance can decrypt, so it is no defence
 * against application compromise or a stolen `FIELD_ENCRYPTION_KEY`. It is
 * also not, on its own, HIPAA compliance — see docs/BACKEND.md.
 *
 * Only lib/submissions/repository.ts calls this. Keeping crypto at exactly one
 * boundary is what makes "is this column ever written in the clear?" a
 * question with a checkable answer.
 */

const VERSION = 'v1'
const IV_BYTES = 12 // 96-bit nonce, the GCM standard
const KEY_BYTES = 32

/**
 * Fixed key for the Playwright harness only.
 *
 * Reachable only when `isE2E` is true, which lib/env.ts pins to
 * `NODE_ENV !== 'production'`. A production bundle cannot select this branch,
 * so the constant being in the repository is not a disclosure.
 */
const E2E_KEY = Buffer.alloc(KEY_BYTES, 7)

let cachedKey: Buffer | null = null

function key(): Buffer {
  if (cachedKey) return cachedKey

  if (isE2E) {
    cachedKey = E2E_KEY
    return cachedKey
  }

  const raw = optionalEnv('FIELD_ENCRYPTION_KEY')
  if (!raw) {
    throw new Error(
      'FIELD_ENCRYPTION_KEY is not set. Generate one with `openssl rand -base64 32`. ' +
        'See .env.example and docs/BACKEND.md.',
    )
  }

  const decoded = Buffer.from(raw, 'base64')
  if (decoded.length !== KEY_BYTES) {
    throw new Error(
      `FIELD_ENCRYPTION_KEY must decode to ${KEY_BYTES} bytes (got ${decoded.length}). ` +
        'Generate one with `openssl rand -base64 32`.',
    )
  }

  cachedKey = decoded
  return cachedKey
}

/**
 * `v1.<iv>.<authTag>.<ciphertext>`, each part base64.
 *
 * The version prefix is what makes key rotation possible later without
 * guessing at the format of rows already in the table: a `v2` reader can keep
 * decrypting `v1` rows with the old key while writing new ones with the new.
 */
export function encryptField(plaintext: string): string {
  const iv = randomBytes(IV_BYTES)
  const cipher = createCipheriv('aes-256-gcm', key(), iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return [
    VERSION,
    iv.toString('base64'),
    tag.toString('base64'),
    ciphertext.toString('base64'),
  ].join('.')
}

export function decryptField(payload: string): string {
  const [version, ivPart, tagPart, ciphertextPart] = payload.split('.')

  /**
   * `=== undefined`, not a falsy check.
   *
   * Encrypting an empty string yields an empty ciphertext part, and `!part`
   * would reject that payload as malformed on the way back — losing a field
   * the application itself wrote. `encryptOptional` maps '' to NULL so the
   * repository never stores one, but `decryptField` must not depend on its
   * only caller continuing to do that.
   */
  if (
    version !== VERSION ||
    ivPart === undefined ||
    tagPart === undefined ||
    ciphertextPart === undefined
  ) {
    throw new Error('Encrypted field is malformed or written by an unknown version.')
  }

  const decipher = createDecipheriv('aes-256-gcm', key(), Buffer.from(ivPart, 'base64'))
  decipher.setAuthTag(Buffer.from(tagPart, 'base64'))
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextPart, 'base64')),
    decipher.final(),
  ]).toString('utf8')
}

/**
 * Null-tolerant wrappers, because both encrypted columns are optional and the
 * alternative is the same two-line guard at four call sites.
 *
 * `decryptOptional` does NOT rethrow. A submission whose notes cannot be
 * decrypted — a rotated key, a corrupted row — must still open in the inbox
 * with its name, phone and date intact, because a receptionist can act on
 * those. Failing the whole detail view over one unreadable column would turn a
 * degraded record into a lost one. The failure is logged and the field renders
 * as unavailable.
 */
export function encryptOptional(value: string | null | undefined): string | null {
  return value === null || value === undefined || value === '' ? null : encryptField(value)
}

export const UNREADABLE_FIELD = '[unreadable — this field could not be decrypted]'

export function decryptOptional(payload: string | null | undefined): string | null {
  if (payload === null || payload === undefined || payload === '') return null
  try {
    return decryptField(payload)
  } catch (error) {
    console.error('[crypto] Failed to decrypt a stored field:', error)
    return UNREADABLE_FIELD
  }
}

/** Constant-time compare for secrets arriving in headers (the cron route). */
export function safeCompare(a: string, b: string): boolean {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}
