import type { Config } from 'drizzle-kit'

/**
 * Drizzle Kit configuration.
 *
 * `generate` only reads lib/db/schema.ts and writes SQL — it never connects,
 * which is why `DATABASE_URL` falls back to an empty string rather than
 * throwing. Requiring a live database to produce a migration file would mean
 * nobody could review one without production credentials.
 *
 * Migrations are applied by `npm run db:migrate` (scripts/migrate.mjs), not by
 * `drizzle-kit push`. `push` diffs the schema against whatever is in the
 * database and applies the difference, with no file to review and no record of
 * what ran — acceptable on a scratch database, not on one holding patient
 * contact details.
 */
export default {
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL ?? '' },
  strict: true,
  verbose: true,
} satisfies Config
