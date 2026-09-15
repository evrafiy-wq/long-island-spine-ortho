import 'server-only'
import { neon } from '@neondatabase/serverless'
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http'
import { requireEnv } from '@/lib/env'
import * as schema from '@/lib/db/schema'

/**
 * The Drizzle client, over Neon's HTTP driver.
 *
 * HTTP rather than the WebSocket pool because every query this app makes is a
 * single round trip from a short-lived serverless invocation. A pool would
 * spend its connection setup on one statement and then be torn down.
 *
 * The tradeoff, and it is a real one: the HTTP driver has no interactive
 * transactions. Where two writes must land together — a status change and its
 * audit row — `db.batch([...])` is used, which Neon executes as a single
 * server-side transaction. Anywhere `batch` is not used, the writes are
 * genuinely independent and the code says so.
 *
 * Lazily constructed. `next build` imports every server module while
 * prerendering, and a module-level `neon(requireEnv(...))` would fail the build
 * on any machine without DATABASE_URL — including CI that is only type-checking.
 */

let cached: NeonHttpDatabase<typeof schema> | null = null

export function db(): NeonHttpDatabase<typeof schema> {
  if (!cached) {
    cached = drizzle(neon(requireEnv('DATABASE_URL')), { schema })
  }
  return cached
}

export { schema }
