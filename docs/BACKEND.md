# Backend

Phase 4 of `BUILD-BRIEF.md`: appointment requests, a general-enquiry form,
staff notifications, and an admin inbox. Plus the SEO surfaces, error pages and
analytics that shipped alongside them.

Read `CLAUDE.md` first — the content rule governs every string in here too.

---

## Scope, and what is deliberately absent

There is **no patient portal, no patient accounts, and no medical record**.
There is no clinical data model of any kind. The only place free clinical text
can land is a single encrypted column that the form actively tells patients not
to fill in.

That absence is the design. The brief set the goal as "clearly outside
HIPAA-regulated PHI storage where possible, and where I can't, flagged" — so
the structures that would hold regulated data were not built, rather than built
and then protected.

**What is flagged.** Even a name plus a phone number plus "Spine Consultation",
submitted to a specific physician's office, is information about an
individual's health. Whether that makes it PHI for this practice is a question
for their compliance advisor, not for this document. See
[Launch blockers](#launch-blockers).

---

## Data flow

### A patient submits the appointment form

```
 browser
   │  (1) Zod validates in the browser — advisory only
   ▼
 <form action={serverAction}>            ← native POST, no fetch, works with JS off
   │
   ▼
 app/actions/appointment.ts
   │
   ├─(2) lib/submissions/intake.ts
   │        honeypot        → filled?  discard, report success, stop
   │        Turnstile       → forged?  reject       ·  absent? mark "unverified"
   │        rate limit      → over?    reject with a "call the office" message
   │
   ├─(3) lib/forms/appointment.ts — the SAME Zod schema the browser used.
   │        fails → field errors + the submitted values, echoed back
   │
   ├─(4) lib/submissions/repository.ts → encrypt notes → pgStore → Postgres
   │        fails → error state pointing at the phone. NEVER "received".
   │
   └─(5) lib/email/send.tsx  (awaited, cannot throw)
            office   → triage email, Reply-To = patient
            patient  → confirmation, Reply-To = office, notes NOT echoed back
```

The order is deliberate: the free check first, the network call second, the
Redis round trip third, and the patient's actual data parsed last.

Step 5 runs **after** the row is committed and cannot fail the request. If
Resend is down the request is still in the database and still in the inbox —
the patient has lost a confirmation email, not their appointment request. The
reverse ordering would discard a real request because a third party had a bad
minute.

### Staff read it

```
 /admin/*  →  middleware.ts (Edge)
                 JWT valid?  AND  email still in ADMIN_EMAILS?
                 no  → redirect to /admin/signin
                 yes → continue, with X-Robots-Tag: noindex on every response
                          │
                          ▼
                    page  →  requireAdmin()  ← re-checked; a Server Action is a
                          │                    POST, not a navigation
                          ├─ listSubmissions / getSubmission → decrypt
                          └─ recordAudit(...)
```

### Retention

```
 Vercel Cron (daily, 04:17 UTC)
   → GET /api/cron/purge  with  Authorization: Bearer $CRON_SECRET
       → DELETE submissions WHERE status = 'closed' AND closed_at < now() - 90d
       → count submissions still open after a year, and report it
       → audit entry, every run, including runs that delete nothing
```

---

## Module map

| Path                                                             | What it is                                                                                                                                           |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lib/forms/appointment.ts`, `lib/forms/contact.ts`               | The Zod schemas. **Imported by both the browser and the server** — this is the "rules cannot drift" guarantee. Must not import anything server-only. |
| `lib/forms/state.ts`                                             | The `FormState` shape both Server Actions return.                                                                                                    |
| `lib/forms/dates.ts`, `lib/forms/phone.ts`                       | Isomorphic formatting and normalisation.                                                                                                             |
| `app/actions/appointment.ts`, `app/actions/contact.ts`           | The two public Server Actions. Thin; the machinery is shared.                                                                                        |
| `lib/submissions/intake.ts`                                      | Honeypot → Turnstile → rate limit.                                                                                                                   |
| `lib/submissions/repository.ts`                                  | **The only module that reads or writes submissions**, and the encryption boundary.                                                                   |
| `lib/submissions/pgStore.ts` / `memoryStore.ts`                  | The two implementations of `SubmissionStore`.                                                                                                        |
| `lib/crypto/field.ts`                                            | AES-256-GCM for the two free-text columns.                                                                                                           |
| `lib/security/hash.ts`                                           | HMAC of the client IP. The address itself is never stored.                                                                                           |
| `lib/security/rate-limit.ts`                                     | Upstash, two tiers, with an in-process fallback.                                                                                                     |
| `lib/security/turnstile.ts`                                      | Three-outcome bot check.                                                                                                                             |
| `lib/email/send.tsx`, `lib/email/client.ts`, `lib/email/text.ts` | Composition, transport, plain-text bodies.                                                                                                           |
| `emails/*.tsx`                                                   | React Email templates.                                                                                                                               |
| `auth.config.ts` / `auth.ts`                                     | Auth.js, split Edge / Node.                                                                                                                          |
| `middleware.ts`                                                  | The `/admin` gate.                                                                                                                                   |
| `lib/db/schema.ts`                                               | Six tables. Nothing else defines the shape of the database.                                                                                          |
| `lib/seo/structuredData.ts`                                      | The JSON-LD graph.                                                                                                                                   |

---

## Environment variables

`.env.example` is the authoritative list and explains each one inline. Summary:

| Variable                                                  | Required?           | Without it                                                                  |
| --------------------------------------------------------- | ------------------- | --------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                                    | Production          | Canonicals, sitemap, JSON-LD and email links all point at `localhost`       |
| `DATABASE_URL`                                            | **Yes**             | Submissions fail; the patient is sent to the phone                          |
| `FIELD_ENCRYPTION_KEY`                                    | **Yes**             | Submissions fail — the notes column cannot be written                       |
| `IP_HASH_SALT`                                            | Recommended         | A known development salt is used, so the hashes are reversible              |
| `RESEND_API_KEY`                                          | For any email       | Mail is skipped and logged; submissions still save                          |
| `MAIL_FROM`                                               | For any email       | As above                                                                    |
| `OFFICE_EMAIL`                                            | For office alerts   | The office is not notified; the row is still in `/admin`                    |
| `AUTH_SECRET`                                             | For `/admin`        | Nobody can sign in                                                          |
| `ADMIN_EMAILS`                                            | For `/admin`        | **Nobody is authorised** — it fails closed                                  |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` | Recommended         | The bot check reports `skipped`; honeypot and rate limiting still apply     |
| `UPSTASH_REDIS_REST_URL` + `_TOKEN`                       | Recommended         | Falls back to a per-instance limiter that is close to useless on serverless |
| `CRON_SECRET`                                             | For retention       | The purge refuses to run; closed submissions accumulate indefinitely        |
| `NEXT_PUBLIC_ANALYTICS`                                   | No                  | No analytics load at all                                                    |
| `E2E_TEST_MODE`                                           | Never in production | —                                                                           |

Nothing throws at import time. `next build` imports every server module while
prerendering, so a missing variable has to fail when it is used, not when it is
loaded — otherwise no one could build or type-check without production secrets.

---

## How to add an admin user

There is no user table to edit and no invitation flow. Access is one
environment variable.

1. Add the address to `ADMIN_EMAILS`, comma-separated:

   ```
   ADMIN_EMAILS="frontdesk@practice.com,manager@practice.com,newperson@practice.com"
   ```

   In Vercel: Settings → Environment Variables → edit `ADMIN_EMAILS` for
   **Production and Preview**.

2. Redeploy (Vercel requires a redeploy for an environment change to take).

3. Tell them to go to `/admin`, enter that address, and click the link they
   receive. No password is ever created.

**To remove someone**, delete their address and redeploy. The allowlist is read
on **every request**, so an existing session stops being authorised on that
person's next click rather than when their token expires.

Two notes:

- An **empty or unset** `ADMIN_EMAILS` authorises nobody. That is on purpose:
  the alternative is a deployment where forgetting one variable opens the
  patient inbox to anyone who can receive email.
- The sign-in form will **not** email a link to an address that is not on the
  list, and it shows the same "check your email" page either way — so it cannot
  be used to send mail to arbitrary addresses, or to discover which addresses
  are staff.

---

## Database

Neon Postgres over the HTTP driver (`drizzle-orm/neon-http`) — every query here
is a single round trip from a short-lived invocation, and a connection pool
would spend its setup on one statement.

The HTTP driver has **no interactive transactions**. Where two writes must land
together — a status change and its audit row — `db.batch([...])` is used, which
Neon executes as one server-side transaction. Everywhere else the writes are
genuinely independent.

```bash
npm run db:generate   # schema change -> a new SQL file in lib/db/migrations
npm run db:migrate    # apply pending migrations to DATABASE_URL
npm run db:studio     # browse the data
```

Migrations are applied by `scripts/migrate.mjs`, not `drizzle-kit push`. `push`
diffs against the live database and applies the difference with no file to
review and no record of what ran — fine on a scratch database, not on one
holding patient contact details.

Try a migration on a **Neon branch** first. Branches are cheap and a branch is
the only safe rehearsal for a schema change against real rows.

### Tables

| Table                                             | Purpose                                                                                                                                                                          |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `submissions`                                     | Both kinds of submission. One table, not two — they differ by four nullable columns and share the inbox, the workflow, search, export, audit and retention.                      |
| `admin_audit_log`                                 | Who viewed and who changed what.                                                                                                                                                 |
| `user`, `account`, `session`, `verificationToken` | Auth.js. Column names are its camelCase ones because the adapter maps by property name. `session` is unused day to day (sessions are JWTs) but the adapter requires it to exist. |

`admin_audit_log.submission_id` is deliberately **not** a foreign key: a cascade
would erase the record that a purged submission ever existed, which is the one
thing an audit trail has to survive.

---

## Encryption

`notes_encrypted` and `internal_notes_encrypted` are AES-256-GCM, keyed by
`FIELD_ENCRYPTION_KEY`. Format: `v1.<iv>.<tag>.<ciphertext>`, each part base64.

**What it protects against.** Neon encrypts at rest already, but with Neon's
key — that protects the disk, not the row. This protects the row from
everything that legitimately reaches the database: a `pg_dump` in a Downloads
folder, a leaked read-only connection string, a console session, a restored
backup. Ciphertext is all any of those yield.

**What it does not.** A running instance can decrypt, so it is no defence
against application compromise or a stolen key. It is also not, on its own,
HIPAA compliance.

### Key management

```bash
openssl rand -base64 32
```

- **Losing the key makes every stored note permanently unreadable.** There is
  no recovery and no escrow. The rest of each row still decodes and the notes
  render as unavailable, so a record degrades rather than disappearing — but
  the text is gone. Keep a copy somewhere that is not this repository and not
  the same password-manager entry as `DATABASE_URL`.
- Changing the key has the same effect on rows already written. The `v1.`
  prefix exists so a future rotation can read old rows with the old key while
  writing new ones with the new. **That migration does not exist yet** — write
  it before rotating.

---

## Bot protection, rate limiting, and the progressive-enhancement trade

Three layers: a honeypot field, Cloudflare Turnstile, and per-IP rate limiting.

Turnstile needs JavaScript — the widget is the only thing that can mint a
token — and section 1 of the brief requires the form to work without it. Those
two pull in opposite directions, so the check has **three** outcomes rather
than two:

| Outcome      | Meaning                                                                                           | What happens                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `verified`   | Token supplied and Cloudflare accepted it                                                         | Proceeds, generous rate limit (8 / 10 min)                                          |
| `unverified` | **No token at all** — almost always JavaScript disabled. Also used when Cloudflare is unreachable | Proceeds, strict rate limit (3 / 60 min), flagged in the inbox and the office email |
| `failed`     | Token supplied and rejected — replayed, forged or expired                                         | Hard rejection                                                                      |
| `skipped`    | No secret key configured (development)                                                            | Proceeds as `verified`                                                              |

Requiring a token outright would have made the no-JavaScript path a dead form.
Ignoring a missing token would have made the bot check opt-out. The tokenless
path pays in rate instead.

The rate limit is checked **before** Zod, which bounds the work an attacker can
force — no write, no email, no unbounded parsing — at the cost of a rejected
submission consuming a token. The verified allowance is sized for that: eight
in ten minutes is far past what a patient mistyping an email twice will use.

Without Upstash the limiter falls back to an in-process `Map`. Every instance
gets its own, so the effective limit is the configured rate times however many
are warm. It exists so `npm run dev` works with an empty `.env`, and it warns
on first use. **Configure Upstash in production.**

---

## Retention and the audit log

Closed submissions are deleted **90 days after they were closed**, not 90 days
after they arrived. Retention runs from the end of the practice's business with
a request, so a request someone is still working is never deleted underneath
them.

The cost: a submission nobody ever closes is never purged. The job therefore
also counts submissions still open after a year and returns the number, and
logs a warning. Watch that number — a retention policy with a silent hole is
worse than one with a visible one.

The audit log records `submission.view`, `submissions.list_view`,
`submission.status_change`, `submission.note_change`, `submissions.export` and
`submissions.purge`. List views are logged too: a page showing twenty-five
patients' names and phone numbers is patient-data access, and a log that
recorded only the deep links would miss most of it.

Audit entries record **that** notes changed and their length, never the text —
otherwise the log becomes a second, unencrypted copy of the most sensitive
field in the row, in the one table the purge deliberately leaves alone.

The audit log is **never purged**. If that becomes a retention question of its
own, it is a policy decision for the practice, not a default to pick here.

---

## The CSV export

`/admin/export` is the highest-risk feature in the application. It produces a
**decrypted, unencrypted** file of patient contact details and free text that
then lives in a Downloads folder, outside every control this application has.

Mitigations in place: it is audited before the file is generated; it is capped
at 5,000 rows; it honours the inbox's current filters exactly (same parser), so
"export these" means these; cells beginning `=`, `+`, `-` or `@` are prefixed
with an apostrophe so a patient cannot run a formula on a receptionist's
machine; and it is `no-store` and `noindex`.

Staff should be told to delete the file when they are done with it.

---

## Tests

```bash
npm run test       # Vitest — schemas, Server Actions, crypto, CSV, JSON-LD
npm run test:e2e   # Playwright — the appointment flow, with and without JS
```

91 unit tests and 10 end-to-end tests.

The Server Action tests mock only the repository and the mailer. The honeypot,
Turnstile, the rate limiter and Zod all run for real — mocking the intake guard
instead would have left the parts most likely to break silently untested.

### The E2E harness, and why it cannot leak into production

`E2E_TEST_MODE=1` swaps Postgres and Resend for in-process doubles so
Playwright can drive a **real** Server Action end to end with no external
services.

`lib/env.ts` honours that flag only when `NODE_ENV !== 'production'`. `next
build` sets `NODE_ENV=production`, so **a production bundle physically cannot
select the doubles**, whatever is in the environment. That is why Playwright
runs against `next dev` rather than a production build. The interlock is worth
more than the speed.

Two real defects were found by this suite and fixed:

- **`app/(site)/loading.tsx` broke the no-JavaScript path.** A `loading.tsx`
  wraps its segment in a Suspense boundary; under streaming SSR React emits the
  content into a `<div hidden>` and relies on a script to reveal it. With
  JavaScript off, every public page rendered an empty `<main>`. The file was
  removed — see the note in `app/(site)/layout.tsx`.
- **The error summary was gated on client-only state.** It only rendered once a
  `useState` counter had been incremented, which nothing does without
  JavaScript — so a server-rejected submission came back with field errors and
  no summary above them. Visibility now follows the errors; the counter only
  decides whether to move focus.

---

## SEO

- `app/sitemap.ts` derives its routes from `practice.footerLinks` and
  `practice.legalLinks` rather than restating them, so a new page cannot be
  silently left out.
- `app/robots.ts` disallows `/admin` and `/api`. That is advisory; the real
  protection is the middleware's `X-Robots-Tag`, which also covers the CSV
  export and the sign-in redirect.
- `lib/seo/structuredData.ts` emits one `@graph` with three linked nodes:
  `["MedicalBusiness","LocalBusiness"]`, `Physician`, and `WebSite`.

**What the markup deliberately omits**, each enforced by a test in
`tests/unit/structured-data.test.ts`:

- `knowsLanguage` — the English/French/Spanish claim is UNVERIFIED and
  contradicted by NYU Langone's directory. `CLAUDE.md` forbids propagating it
  into schema.org specifically.
- `identifier` (the NPI) and `geo` — both null in `practice.identifiers`. A
  guessed NPI attaches the practice's search presence to another clinician;
  guessed coordinates put the map pin somewhere the office is not. Both appear
  automatically the moment the values are filled in.
- Any `FAQPage` markup — the FAQ contains the same unverified languages answer,
  and marking it up would put the claim into a rich result.
- The five insurance carriers, also UNVERIFIED.

---

## Launch blockers

### Content the practice must supply

| Item                                                                  | Where it goes              | Until then                                                                                                                             |
| --------------------------------------------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Office email address**                                              | `OFFICE_EMAIL`             | No office notification. Requests are saved and visible in `/admin`, but nothing tells anyone they arrived.                             |
| **NPI number**                                                        | `practice.identifiers.npi` | Omitted from JSON-LD.                                                                                                                  |
| **Geo coordinates** (from the practice's own Google Business Profile) | `practice.identifiers.geo` | Omitted from JSON-LD.                                                                                                                  |
| **Callback window** ("within one business day"?)                      | `practice.callbackWindow`  | The success panel and the confirmation email fall back to "our staff will contact you to confirm your visit" — true, but no timeframe. |
| **Production domain**                                                 | `NEXT_PUBLIC_SITE_URL`     | Canonicals, sitemap, JSON-LD and the admin links in office email all say `localhost`.                                                  |

Find them all with `grep -rn PLACEHOLDER --include='*.ts' --include='*.tsx' .`

Still unresolved from before Phase 4 and **not** propagated into anything new:
the languages claim, the insurance carrier list, and which name is the public
one. See `CLAUDE.md`.

### Legal review — do not skip

1. **Privacy policy and terms of use, reviewed by counsel familiar with NY
   healthcare marketing.** `/privacy` and `/terms` exist and are **not finished
   documents**. `content/legal.ts` splits into factual sections describing what
   the code actually does — accurate as of Phase 4 — and sections marked
   `awaitingCounsel`, which render an honest "not yet published" note rather
   than invented legal terms. The HIPAA posture, patient rights, liability,
   governing law and IP sections are all still empty.

2. **A HIPAA determination from the practice's malpractice carrier or
   compliance advisor.** The specific question: does the handling of
   appointment-request data described in this document trigger HIPAA
   obligations for this practice? **Business associate agreements with Neon
   (storage), Resend (email) and Vercel (hosting) are the conservative path and
   are worth asking about.** Note that the patient confirmation email
   deliberately does not echo the free-text notes back, to keep the most
   sensitive field out of an unencrypted channel — but the office notification
   email does contain it, because staff need it to triage.

3. **Accessibility is an active ADA litigation area for medical practices.**
   The Phase 2 requirements are not optional polish. What this phase added is
   held to the same bar: shared field components that cannot forget
   `aria-invalid` / `aria-describedby`, an error summary that takes focus on
   every rejected submit, a real `<table>` in the inbox with a keyboard-
   reachable scroll region, and forms that work with JavaScript off. Re-run
   `node scripts/audit-contrast.mjs` after any visual change.

### Before the first real patient uses it

- [ ] `npm run db:migrate` against production
- [ ] Verify the sending domain in Resend and add its DKIM/SPF/DMARC records;
      test at mail-tester.com and aim for 10/10
- [ ] Submit a real request on the `.vercel.app` URL; confirm **both** emails
      arrive and the row appears in `/admin`
- [ ] Sign in to `/admin` as each member of staff who will use it
- [ ] Trigger the purge by hand and confirm a 200 and an audit entry:
      `curl -H "Authorization: Bearer $CRON_SECRET" https://…/api/cron/purge`
- [ ] Confirm `/admin` returns `X-Robots-Tag: noindex` — signed in and out
- [ ] Confirm with the front desk **who checks the inbox and how often**. An
      appointment request nobody reads is worse than no form at all.

---

## Known gaps

1. **No key-rotation path.** The ciphertext is versioned for it; the migration
   is not written.
2. **The audit log grows without bound.** Never purged, by design — see above.
3. **Email delivery is not retried.** A failure is logged and the submission
   survives, but nothing re-sends. Recovering means reading `/admin`.
4. **`npm audit`** still reports a moderate + high advisory in `postcss`,
   transitively via Next 15. The only fix is Next 16.
5. **`next-auth` emits Edge-runtime warnings at build time** about
   `DecompressionStream` inside `jose`. They are build-time static analysis
   warnings from a code path the middleware does not take; the build succeeds
   and the middleware works. Upstream issue, nothing to fix here.
6. **The in-process rate limiter is not a production limiter.** Configure
   Upstash.

---

## Two places the phone number lives

`content/practice.ts` is the source of truth, with exactly one exception:
`app/global-error.tsx` hardcodes it. That file replaces the root layout when
the root layout itself fails, so anything it imports is something that can take
the error page down with it — and the one job of that page is to still show a
phone number. If the number changes, change it in both.
