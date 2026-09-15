import 'server-only'
import { createHmac } from 'node:crypto'
import { headers } from 'next/headers'
import { optionalEnv } from '@/lib/env'

/**
 * IP handling.
 *
 * The raw address is never stored. Abuse investigation only ever needs to ask
 * "did these come from the same place?", and an HMAC answers that without the
 * site holding a location-bearing identifier next to a health-adjacent
 * request. Nothing to disclose in a breach, nothing to hand over on request.
 *
 * HMAC-SHA256 with a server secret, not a bare SHA-256: the IPv4 space is 2^32
 * and a plain digest of it is exhaustively reversible in seconds on a laptop.
 * The secret is what makes it one-way in practice.
 */

const FALLBACK_SALT = 'development-only-ip-salt'

export function hashIp(ip: string | null): string | null {
  if (!ip) return null
  const salt = optionalEnv('IP_HASH_SALT') ?? FALLBACK_SALT
  return createHmac('sha256', salt).update(ip).digest('base64url').slice(0, 32)
}

/**
 * The client IP, read from proxy headers.
 *
 * `x-forwarded-for` is a comma-separated chain and the LEFTMOST entry is the
 * original client; the rest were appended by intermediaries. On Vercel the
 * platform normalises this, so the leftmost value is trustworthy there — behind
 * a different proxy it is spoofable, which is why this is used for rate
 * limiting and abuse signals and never for authorisation.
 */
export async function clientIp(): Promise<string | null> {
  const headerList = await headers()
  const forwarded = headerList.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  return headerList.get('x-real-ip')
}

export async function clientIpHash(): Promise<string | null> {
  return hashIp(await clientIp())
}
