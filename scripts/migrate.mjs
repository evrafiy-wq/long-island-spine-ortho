/**
 * Apply pending migrations to the database in DATABASE_URL.
 *
 *   npm run db:migrate
 *
 * Deliberately a script rather than `drizzle-kit push`. `push` diffs the
 * schema against the live database and applies the difference with no file to
 * review and no record of what ran; this replays the reviewed SQL in
 * lib/db/migrations and records each file in drizzle's own tracking table, so
 * a database holding patient contact details has a migration history someone
 * can read.
 *
 * Plain Node with no bundler: `drizzle-orm/neon-http/migrator` needs the
 * connection and the folder, not the TypeScript schema.
 */
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { migrate } from 'drizzle-orm/neon-http/migrator'

// Node's own loader — no dotenv dependency. Absent in CI, where the variables
// are already in the environment, so a missing file is not an error.
try {
  process.loadEnvFile('.env.local')
} catch {
  try {
    process.loadEnvFile('.env')
  } catch {
    /* Nothing to load; fall through to the check below. */
  }
}

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL is not set. See .env.example and docs/BACKEND.md.')
  process.exit(1)
}

const db = drizzle(neon(url))

console.log('Applying migrations from lib/db/migrations …')
await migrate(db, { migrationsFolder: './lib/db/migrations' })
console.log('Done.')
