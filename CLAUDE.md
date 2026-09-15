# Long Island Spine and Orthopedics — website

Marketing site for a real, operating medical practice in Hicksville, NY.
Read the content rule below before writing a single line of copy.

---

## The content rule (non-negotiable)

**Every word on this site is medical content about a real physician and a real
practice. Never invent clinical claims, credentials, qualifications,
statistics, patient outcomes, procedure counts, years of experience, awards, or
testimonials — not as placeholder text, not as a "realistic example," not
temporarily, not ever.**

If a design needs copy that does not exist yet, write it as
`[PLACEHOLDER: description]` and surface it. An invented credential on a
surgeon's website is a regulatory and patient-safety problem, not a typo.

All practice-owned copy lives in [`content/practice.ts`](content/practice.ts).
Components read from it; they do not hardcode practice facts.

### Claims currently on the site that are NOT verified

Two patient-facing claims are unconfirmed. Do not treat them as settled, and do
not propagate them into new surfaces (schema.org markup, meta descriptions, ad
copy) until the practice confirms them directly.

| Claim     | On the site                                                    | Conflicting source                                                                               | Why it matters                                      |
| --------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| Languages | English, French, Spanish (3 places)                            | NYU Langone's provider directory lists **English only**                                          | Draws patients who will need an interpreter         |
| Insurance | Aetna, BlueCross BlueShield, UnitedHealthcare, Cigna, Medicare | NYU Langone lists only Aetna, NYS Health Insurance Plan, Oxford — overlapping on **Aetna alone** | A wrong list produces surprise out-of-network bills |

Resolve these with the practice's front desk / billing office, not a directory.
Both are marked with `UNVERIFIED` comments in `content/practice.ts`.

Also unresolved: the registered legal name is **`Long Island Spine &
Orthopedics, PC`** (ampersand, `PC` suffix) per the CMS NPPES registry, but the
site displays "Long Island Spine and Orthopedics" everywhere. Held as
`practice.legalName` and deliberately unused — picking the public-facing name is
a branding decision (Phase 3), not a migration change.

---

## Practice facts

| Field                        | Value                                                                    |
| ---------------------------- | ------------------------------------------------------------------------ |
| Practice name (as displayed) | Long Island Spine and Orthopedics                                        |
| Legal name (NPPES, unused)   | Long Island Spine & Orthopedics, PC                                      |
| Physician                    | Philip M. Rafiy, MD                                                      |
| Credentials                  | Board Certified, American Board of Orthopedic Surgery (ABOS)             |
| Education                    | MD, State University of New York                                         |
| Academic                     | Adjunct Assistant Professor, NYU Grossman Long Island School of Medicine |
| Languages                    | English, French, Spanish — **UNVERIFIED**                                |
| Address                      | 87 W Old Country Rd, Hicksville, NY 11801                                |
| Phone                        | (516) 433-1100                                                           |
| Hours                        | Mon–Fri 9:00am–5:00pm; Sat–Sun closed                                    |
| Parking                      | Free private onsite parking behind the building                          |

---

## Stack

- **Next.js 15.5** (App Router) — every route is statically prerendered
- **React 19**, **TypeScript 5.9** (`strict` + `noUncheckedIndexedAccess`)
- **Tailwind CSS v4** via `@tailwindcss/postcss`
- **ESLint 9** (flat config, `next/core-web-vitals` + `next/typescript`) and
  **Prettier** with `prettier-plugin-tailwindcss` class sorting
- `next/font/google` self-hosts **Instrument Sans** (display) + **IBM Plex Sans**
  (body). Declared in `lib/fonts.ts` and applied to `<html>` — see the note in
  that file, the placement is load-bearing
- **`lucide-react`** for every icon. One stroke weight, set once via
  `--site-icon-stroke` in the reset
- `sharp` for the one-off image pipeline

Backend (Phase 4 — see [`docs/BACKEND.md`](docs/BACKEND.md)):

- **Postgres via Neon** (`@neondatabase/serverless`) with **Drizzle ORM**, over
  the HTTP driver. No interactive transactions — `db.batch()` is used where two
  writes must land together
- **Zod 4** for validation. One schema per form, imported by both the browser
  and the Server Action so the rules cannot drift
- **Resend** + **React Email** for the four outgoing messages
- **Auth.js v5** (`next-auth@5`), magic link, env-var allowlist, guarding
  `/admin`
- **Upstash Redis** for per-IP rate limiting; **Cloudflare Turnstile** for the
  bot check
- **Vitest** for schemas, actions and crypto; **Playwright** for the
  appointment flow end to end

```bash
npm run dev          # http://localhost:3000
npm run build        # must pass before anything ships
npm run lint
npm run typecheck
npm run format       # writes; format:check for CI
npm run test         # Vitest — 91 tests
npm run test:e2e     # Playwright — starts its own dev server on :3100
npm run db:generate  # schema change -> SQL in lib/db/migrations
npm run db:migrate   # apply migrations to DATABASE_URL
```

Do not run `npm run build` while `npm run dev` is running — the build replaces
`.next/` underneath the dev server and it starts 500ing. Stop dev first, or
build somewhere else:

```bash
NEXT_DIST_DIR=.next-verify npm run build
```

`distDir` in `next.config.ts` reads that variable and defaults to `.next`, so a
verification build can leave a running dev server alone.

**There is no `index.html`.** This site only exists when the dev server is
running; there is no file you can open in a browser to see it. The
pre-migration static site that used to sit at the repo root — `index.html`,
`styles.css`, `script.js` and the rest — was deleted in Phase 3 precisely
because VS Code's Live Server picked it up and served the _old_ site, which
has nothing to do with this codebase. It is preserved in full at the
`static-site-baseline` git tag:

```bash
git show static-site-baseline:index.html   # look at one file
git checkout static-site-baseline -- .     # restore the lot
```

From VS Code: press **F5** and pick _Next.js: dev server + browser_. The
configs are in `.vscode/launch.json`, with build/lint/typecheck as tasks in
`.vscode/tasks.json`.

`rafiy.jpg` and `rafiy2.jpg` are still at the repo root on purpose — they are
the source masters `scripts/optimize-images.mjs` reads.

## Layout

```
app/
  layout.tsx            Root: <html>, fonts, shared metadata. No chrome.
  globals.css           Layer order, Tailwind imports, @source excludes, style imports
  styles/
    tokens.css          THE design token vocabulary (@theme) — start here
    reset.css           Base reset; replaces Tailwind Preflight
    preview-a.css       Archived Phase 2 direction A (scoped, inert elsewhere)
    preview-b.css       Archived Phase 2 direction B
  (site)/               The five real pages
    layout.tsx          Chrome: action bar, header, emergency notice, footer
    page.tsx  about/  services/  patient-info/  visit/
  (preview)/            Archived design comparison; safe to delete wholesale
    preview/page.tsx  preview/a/  preview/b/
  actions/              The three 'use server' modules. Async exports ONLY.
  admin/                Staff inbox. Dynamic, middleware-gated, noindex.
  api/auth/…            Auth.js endpoints
  api/cron/purge/       The 90-day retention job
  not-found.tsx         404 — renders SiteChrome itself; see the note inside
  global-error.tsx      Last resort. No design system, hardcoded phone number.
  sitemap.ts  robots.ts
components/
  site/                 Everything the real pages use
  site/form/            Field kit: labels, errors, honeypot, Turnstile, submit
  admin/                Inbox table, filters, status and notes forms
  preview/              Chrome for the two archived directions only
content/
  practice.ts           Single source of truth for all practice content
  legal.ts              /privacy and /terms — UNFINISHED, awaiting counsel
emails/                 React Email templates + their inline style vocabulary
lib/
  cx.ts                 Conditional className joiner
  fonts.ts              The site's next/font declarations
  pageTitle.ts          Derives each page's <h1> from the existing footer labels
  metadata.ts           pageMetadata() — canonical + OpenGraph, per page
  siteUrl.ts            The one origin every absolute URL is built from
  env.ts                Server env access. Never throws at import time.
  forms/                The shared Zod schemas. ISOMORPHIC — see Conventions.
  submissions/          repository.ts is the ONLY module that touches rows
  crypto/field.ts       AES-256-GCM for the two free-text columns
  security/             IP hashing, rate limiting, Turnstile
  email/                Composition, transport, plain-text bodies
  db/                   Drizzle schema, client, generated migrations
  seo/structuredData.ts The JSON-LD graph
  admin/                Allowlist, session, status vocabulary, query parsing
  preview-fonts/        Fonts for the two archived directions
auth.ts, auth.config.ts   Auth.js, split Node / Edge
middleware.ts             The /admin gate
public/forms/           Patient PDFs, referenced via practice.forms
public/images/          Optimized image masters
scripts/
  audit-contrast.mjs    WCAG contrast gate — run it after touching any colour
  optimize-images.mjs   One-off image pipeline
  migrate.mjs           Applies lib/db/migrations to DATABASE_URL
tests/unit/, tests/e2e/
docs/BACKEND.md         Data flow, every env var, how to add an admin user
```

Route groups do not affect URLs: `(site)/about/page.tsx` serves `/about`.

**To delete the archived Phase 2 explorations:** remove `app/(preview)/`,
`components/preview/`, `lib/preview-fonts/`, `app/styles/preview-{a,b}.css`,
their two `@import` lines in `globals.css`, and
`components/site/DirectionSwitcher.tsx`. Nothing on the real site imports any
of it.

### Conventions

- Server Components by default. Add `'use client'` only for real interactivity
  (tabs, accordion, forms, nav toggle, the admin forms).
- Practice facts and any repeated content go in `content/practice.ts`. One-off
  prose can live in its page. Nothing that is a _fact_ belongs in JSX. The one
  deliberate exception is the form field LABELS, which live beside their Zod
  schema in `lib/forms/` — see the header comment there.
- Build conditional classes with `cx()` from `lib/cx.ts`. **Never** write
  ``className={`base${cond ? ' active' : ''}`}`` — `prettier-plugin-tailwindcss`
  parses the inside of a className template literal as a class list and strips
  the leading space, silently yielding `baseactive`. This already broke the
  condition tabs, the location tabs, and the entire mobile menu once.
- Images go through `next/image`. Add new masters via
  `node scripts/optimize-images.mjs`, which encodes WebP and JPEG and keeps
  whichever is smallest — including the untouched original when re-encoding
  would only lose quality.

Added in Phase 4:

- **`lib/forms/*` must stay isomorphic.** Those modules are imported by client
  components. One `import 'server-only'` anywhere in their import graph — or an
  import of `lib/db`, `lib/env` or `node:crypto` — breaks the client bundle.
- **`lib/submissions/repository.ts` is the only module that reads or writes a
  submission**, and the only one that calls `lib/crypto/field.ts`. Plaintext
  exists above it and ciphertext below it. `grep -rn 'crypto/field' lib app`
  should return that file and nothing else.
- **No `loading.tsx` under `app/(site)/`.** One was added and reverted: it
  wraps the segment in a Suspense boundary, and under streaming SSR React emits
  the content into a `<div hidden>` that only JavaScript reveals — so every
  public page rendered an empty `<main>` with scripting off. The full note is
  in `app/(site)/layout.tsx`. `app/admin/loading.tsx` is fine; those routes are
  genuinely dynamic and staff have JavaScript.
- **A `'use server'` file may only export async functions.** Exporting a plain
  object (an initial-state constant, say) fails the build at page-data
  collection with an error that points at the route, not at the export. Those
  constants live in `lib/admin/actionState.ts`.
- **The phone number is hardcoded in exactly one place** besides
  `content/practice.ts`: `app/global-error.tsx`. That file replaces the root
  layout when the root layout has failed, so anything it imports could take it
  down — and its one job is to still show a phone number. Change both.

---

## The design system: things that will bite you

Everything visual comes from `app/styles/tokens.css`. Read its header comment
before changing a token — these were all verified against the
`tailwindcss@4.3.3` compiler, and every one of them fails **silently**.

**Cascade layer order is `theme, base, components, utilities`.**

1. **Never write `@theme inline`.** Plain `@theme` emits `:root { --x: … }` and
   utilities that read `var(--x)`. `inline` emits nothing to `:root` and bakes
   literals into the utilities, which kills every downstream override with no
   error.

2. **`--shadow-*` cannot be overridden downstream.** It is build-time only:
   Tailwind destructures the shadow at compile time to inject
   `--tw-shadow-color`, so the value never reaches `:root`. Same for
   `--inset-shadow-*`, `--text-shadow-*` and `--breakpoint-*`. Elevation goes
   through the `elev-*` `@utility` rules instead. `--breakpoint-*` being
   build-time is also why the whole site shares one breakpoint set — media
   queries cannot read custom properties.

3. **Do not register `--spacing-{xs,sm,md,…}` in `@theme`.** `--spacing-*` is a
   live Tailwind namespace, so `--spacing-md` would silently shadow a `p-md`
   utility. Hence `--spacing-gutter` / `--spacing-block`. Bare `--spacing`
   (Tailwind's 0.25rem multiplier behind `p-4`) is untouched, so numeric
   spacing works normally.

4. **`max-w-prose` is a hardcoded `65ch` built-in** and ignores a
   `--container-prose` token. The reading measure is `--container-reading` →
   `max-w-reading`.

5. **Font tokens must be declared where the `next/font` className lives.** A
   custom property resolves at computed-value time _on the element where it is
   declared_. `--font-display` is declared at `:root`, so
   `--site-font-display` has to exist at `:root` too — which is why
   `lib/fonts.ts`'s variables go on `<html>`. Put them on a wrapper `<div>`
   instead and every heading silently falls back to Times.

6. **Preflight is still not imported.** `styles/reset.css` does the job and
   more. Note `img { height: auto }` in there is load-bearing: without it every
   `next/image` renders at its literal `height` attribute and the aspect ratio
   is silently destroyed.

7. **Tailwind scans `.css` files too**, so English words in comments become
   class candidates — `border-collapse: collapse` and a comment reading
   "scroll container" were each emitting a real utility, including a
   `.container` that outranked the old design system's own. The `@source not`
   block in `globals.css` handles this; do not remove it.

8. **Never write ``className={`base${cond ? ' active' : ''}`}``** —
   `prettier-plugin-tailwindcss` parses the inside of a className template
   literal as a class list and strips the leading space, silently yielding
   `baseactive`. Use `cx()` from `lib/cx.ts`, which is registered in
   `.prettierrc.json`'s `tailwindFunctions` so its contents still get sorted.

## Accessibility gates

These are verified, not aspirational. Re-check after any visual change:

- `node scripts/audit-contrast.mjs` — WCAG contrast for every declared
  foreground/background pair. Exits non-zero on failure. Body copy is held to
  AAA (7:1), everything else to AA.
- Exactly one `<h1>` per page, no skipped heading levels, every heading inside
  a landmark.
- The phone number is reachable in one tap at every width — it lives in the
  sticky `ActionBar`, which is the only sticky element.
- Interactive targets are ≥24px tall.
- Body copy is 17px minimum at 1.65 line-height. This audience is 40–75;
  legibility is a clinical requirement, not a preference.

## Known issues

1. **Five unresolved `[PLACEHOLDER]`s block launch**, all of them content only
   the practice can supply: the office email address, the NPI, the office's geo
   coordinates, the callback window, and the production domain. Each has a
   defined fallback that degrades honestly rather than inventing a value —
   `docs/BACKEND.md` has the table. Find them with
   `grep -rn PLACEHOLDER --include='*.ts' --include='*.tsx' .`
2. **`/privacy` and `/terms` are not finished legal documents.** The sections
   stating a legal position render a visible "not yet published" note and are
   marked `awaitingCounsel` in `content/legal.ts`. Counsel familiar with NY
   healthcare marketing has to write them before launch. The factual sections
   describe what the code actually does and must be revisited whenever the
   backend changes.
3. **No HIPAA determination has been made.** The forms collect a name, a phone
   number and a reason for visit against a named physician's office. Whether
   that is PHI for this practice is a question for their compliance advisor.
   BAAs with Neon, Resend and Vercel are the conservative path. See
   `docs/BACKEND.md`.
4. **No key-rotation path for `FIELD_ENCRYPTION_KEY`.** The ciphertext is
   versioned (`v1.`) so a rotation can read old rows with the old key; the
   migration that would do it is not written. Losing the key makes every stored
   note permanently unreadable.
5. **The audit log grows without bound.** Never purged, deliberately — the
   purge deletes submissions and the log is what records that they existed.
6. **Email delivery is not retried.** A failed send is logged and the
   submission survives; nothing re-sends it.
7. **`npm audit`** reports a moderate + high advisory in `postcss`, reached
   only as a transitive dependency of Next 15. The only fix is Next 16.
8. **`next-auth` emits Edge-runtime build warnings** about `DecompressionStream`
   inside `jose`. Static-analysis noise from a path the middleware does not
   take; the build succeeds. Upstream.

### Fixed in Phase 2 (previously listed here as inherited bugs)

- Four of five pages had **no `<h1>`** — shared sections hardcoded `<h2>`.
  `components/site/PageHeader.tsx` now supplies one per page.
- **FAQ answers never opened.** The old panel animated `grid-template-rows`
  from `0fr`, which computed to 0px. `FaqList` toggles the `hidden` attribute
  with no height animation, which removes the whole class of bug along with the
  hand-synced 300ms timer.
- **Several icons rendered as black silhouettes** because four call sites
  lacked `fill: none; stroke: currentColor`, and the FAQ `+` was invisible.
  Lucide icons are stroke-based and inherit `--site-icon-stroke`.
- **The global focus ring was 1.9:1** (`3px solid #d6a752`), a real WCAG
  1.4.11 failure. It is now 7.9:1, and inverted surfaces raise
  `--site-focus-color` locally.
- **The phone number vanished below 660px** once the non-sticky utility bar
  scrolled away.

### Fixed in Phase 4

- **The appointment form submitted nowhere.** It validated, called
  `console.log`, and then showed "Request received ✓" — a patient could
  reasonably believe they had contacted a surgeon's office when they had not.
  It now writes an encrypted row and sends two emails, and the failure path
  says so and points at the phone instead of reporting success.
- **A `loading.tsx` on the public routes broke the no-JavaScript path** —
  caught by the Playwright suite. See Conventions above.
- **The error summary was gated on client-only state**, so a server-rejected
  submission came back with field errors and no summary above them. Visibility
  now follows the errors; the counter only decides whether to move focus.
- **`decryptField` rejected its own output for an empty string** — a falsy
  check on the ciphertext segment. Caught by a unit test.

## Roadmap

`BUILD-BRIEF.md` holds the full phased plan. Phases 1–4 are done: the
migration, the redesign, the identity, and the backend. Phase 2's
anti-AI-slop constraints are deliberate; keep them.

Phase 5 is the pre-launch QA pass. Before any of it, the launch blockers in
[`docs/BACKEND.md`](docs/BACKEND.md) need answers from the practice and from
their lawyer — most of them are content and legal review, not code.
