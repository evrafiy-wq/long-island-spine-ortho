# Long Island Spine and Orthopedics

A marketing site and appointment-request system for a two-room orthopedic
practice in Hicksville, NY. Rebuilt from a static HTML skeleton into a
Next.js 15 application with a working backend.

**Live:** [PLACEHOLDER: production URL — see DEPLOY.md Step 4]

> **This is a portfolio deployment, not the practice's live website.** It runs
> with `NEXT_PUBLIC_SITE_MODE=portfolio`, which applies `noindex` at three
> layers, so the deployment cannot be found by a patient searching for care.
> The practice and physician details shown are real. See
> [`lib/siteMode.ts`](lib/siteMode.ts) for the reasoning, including why the
> visible disclosure band is on a separate flag and off by default.

---

## Stack

Next.js 15.5 (App Router, every public route statically prerendered) ·
React 19 · TypeScript 5.9 (`strict`, `noUncheckedIndexedAccess`) ·
Tailwind CSS v4 · Postgres (Neon) + Drizzle · Zod 4 · Auth.js v5 ·
Resend + React Email · Vitest + Playwright

```bash
npm install
npm run dev          # http://localhost:3000
npm run test         # 91 unit tests
npm run test:e2e     # Playwright, appointment flow end to end
npm run typecheck && npm run lint
```

Deployment, domain and service setup: [`DEPLOY.md`](DEPLOY.md).
Backend internals, every env var, launch blockers: [`docs/BACKEND.md`](docs/BACKEND.md).
Working conventions and the design-system footguns: [`CLAUDE.md`](CLAUDE.md).

---

## What's interesting here

This was built under one governing constraint: **every word on the site is
medical content about a real physician.** That turned out to shape the
architecture more than any technical decision.

### Content that cannot be invented

All practice-owned copy lives in [`content/practice.ts`](content/practice.ts)
and components read from it — no practice fact is ever hardcoded in JSX. Where
the design needed copy that did not exist, it was written as
`[PLACEHOLDER: …]` and surfaced rather than filled with something plausible.
Five remain, each with a fallback that degrades honestly: the appointment
success panel, for instance, omits a callback timeframe entirely rather than
guessing "within 24 hours."

Two inherited claims are flagged `UNVERIFIED` in that file because the
practice's own site and NYU Langone's provider directory disagree — the
languages spoken, and which insurance carriers are accepted. A wrong insurance
list produces surprise out-of-network bills, so neither claim was propagated
into the JSON-LD or the meta descriptions while it remains unresolved.

### A form that tells the truth about itself

The inherited appointment form validated input, called `console.log`, and
displayed "Request received ✓". A patient could reasonably have believed they
had contacted a surgeon's office when nothing had been sent anywhere.

The rewrite writes an encrypted row and sends two emails. More importantly, its
failure path says so and points at the telephone instead of reporting success,
and the success panel leads with the fact that a request is **not** a confirmed
appointment. The free-text notes field explicitly asks patients not to describe
symptoms, because that is the field where clinical detail would otherwise
accumulate.

It also works with JavaScript disabled, via a Server Action. That requirement
caught a real bug: a `loading.tsx` on the public routes wrapped each page in a
Suspense boundary, and under streaming SSR React emits the content into a
`<div hidden>` that only JavaScript reveals — so every page rendered an empty
`<main>` with scripting off. Found by the Playwright suite, reverted, and
documented in [`app/(site)/layout.tsx`](<app/(site)/layout.tsx>).

### Data handling scoped down rather than up

There is no patient portal, no accounts, and no medical record — the scope was
deliberately kept away from anything resembling a clinical data model. What
does get stored is encrypted per-field with AES-256-GCM, and
`lib/submissions/repository.ts` is the only module permitted to read or write a
submission row: plaintext exists above it, ciphertext below it, and
`grep -rn 'crypto/field' lib app` returning one file is the invariant.
Submissions purge after 90 days; the audit log that records they existed
deliberately does not.

### Accessibility as a functional requirement

The audience is 40–75 and often in pain, which makes legibility clinical rather
than aesthetic: 17px body minimum at 1.65 line-height, body copy held to WCAG
AAA (7:1) and everything else to AA, verified by
[`scripts/audit-contrast.mjs`](scripts/audit-contrast.mjs) as a build gate
rather than a checklist.

Four of the five inherited pages had no `<h1>` at all. The global focus ring
was 1.9:1, a straightforward 1.4.11 failure. The phone number vanished below
660px because it lived in a non-sticky bar. The FAQ accordion never opened —
its panel animated `grid-template-rows` from `0fr`, which computes to 0px. Each
is fixed and each is documented, because the interesting part of a bug is why
it survived review.

### A design system with documented failure modes

Everything visual derives from [`app/styles/tokens.css`](app/styles/tokens.css).
Tailwind v4's `@theme` has several behaviours that fail _silently_ — `@theme
inline` emits nothing to `:root` and kills downstream overrides;
`--shadow-*` and `--breakpoint-*` are build-time only and never reach
`:root`; registering `--spacing-md` shadows the `p-md` utility; Tailwind scans
CSS comments for class candidates, so the words "scroll container" were
emitting a real `.container` utility that outranked the design system's own.
Each is written up at the point where someone would otherwise rediscover it.

---

## Project history

Built in five phases, each a reviewable checkpoint. The pre-migration static
site is preserved at the `static-site-baseline` tag.

| Phase | Work                                                                  |
| ----- | --------------------------------------------------------------------- |
| 1     | Audit, cleanup, static HTML → Next.js migration                       |
| 2     | Three complete design directions built as working routes, one adopted |
| 3     | Four candidate wordmarks, one adopted, full favicon and OG asset set  |
| 4     | Appointment pipeline, staff inbox, encryption, SEO surfaces           |
| 5     | Pre-launch QA, accessibility audit, portfolio-mode deployment switch  |

The two rejected Phase 2 directions were kept as live routes for the duration
of the project and deleted in Phase 5 — [`BUILD-BRIEF.md`](BUILD-BRIEF.md) has
the constraints each was built against, including the list of visual clichés
they were explicitly forbidden from using.

---

## Known gaps

Documented rather than hidden, with the reasoning in
[`docs/BACKEND.md`](docs/BACKEND.md):

- No key-rotation path for `FIELD_ENCRYPTION_KEY`. The ciphertext is versioned
  (`v1.`) so a rotation _can_ read old rows; the migration is unwritten.
- Email delivery is not retried. A failure is logged and the submission
  survives, but nothing re-sends it.
- `/privacy` and `/terms` are not finished legal documents. Sections stating a
  legal position render a visible "not yet published" note and are marked
  `awaitingCounsel`, rather than containing invented terms.
- No HIPAA determination has been made. Whether appointment-request data is PHI
  for this practice is a question for their compliance advisor, and is a
  prerequisite for `production` mode.
- `npm audit` reports advisories in `postcss`, reachable only transitively via
  Next 15. Pinned via `overrides`; the real fix is Next 16.
