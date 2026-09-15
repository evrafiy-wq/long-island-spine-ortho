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

```bash
npm run dev          # http://localhost:3000
npm run build        # must pass before anything ships
npm run lint
npm run typecheck
npm run format       # writes; format:check for CI
```

Do not run `npm run build` while `npm run dev` is running — the build replaces
`.next/` underneath the dev server and it starts 500ing. Stop dev first.

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
components/
  site/                 Everything the real pages use
  preview/              Chrome for the two archived directions only
content/practice.ts     Single source of truth for all practice content
lib/
  cx.ts                 Conditional className joiner
  fonts.ts              The site's next/font declarations
  pageTitle.ts          Derives each page's <h1> from the existing footer labels
  preview-fonts/        Fonts for the two archived directions
public/forms/           Patient PDFs, referenced via practice.forms
public/images/          Optimized image masters
scripts/
  audit-contrast.mjs    WCAG contrast gate — run it after touching any colour
  optimize-images.mjs   One-off image pipeline
```

Route groups do not affect URLs: `(site)/about/page.tsx` serves `/about`.

**To delete the archived Phase 2 explorations:** remove `app/(preview)/`,
`components/preview/`, `lib/preview-fonts/`, `app/styles/preview-{a,b}.css`,
their two `@import` lines in `globals.css`, and
`components/site/DirectionSwitcher.tsx`. Nothing on the real site imports any
of it.

### Conventions

- Server Components by default. Add `'use client'` only for real interactivity
  (tabs, accordion, form, nav toggle) — four components qualify today.
- Practice facts and any repeated content go in `content/practice.ts`. One-off
  prose can live in its page. Nothing that is a _fact_ belongs in JSX.
- Build conditional classes with `cx()` from `lib/cx.ts`. **Never** write
  ``className={`base${cond ? ' active' : ''}`}`` — `prettier-plugin-tailwindcss`
  parses the inside of a className template literal as a class list and strips
  the leading space, silently yielding `baseactive`. This already broke the
  condition tabs, the location tabs, and the entire mobile menu once.
- Images go through `next/image`. Add new masters via
  `node scripts/optimize-images.mjs`, which encodes WebP and JPEG and keeps
  whichever is smallest — including the untouched original when re-encoding
  would only lose quality.

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

1. **The appointment form submits nowhere.** `components/site/AppointmentForm.tsx`
   validates, then `console.log`s. There is no Server Action, no API route and
   no `action` attribute anywhere in the project. It still shows
   `practice.copy.appointmentForm.successLabel` ("Request received ✓") on
   submit, **which is not true** — a patient can reasonably believe a request
   was sent. Wiring this is Phase 4; until then treat the success message as a
   known defect, not a feature. An appointment request carries PHI, so plain
   email has HIPAA implications worth checking before choosing a transport.
2. **One `[PLACEHOLDER]` is live** on the homepage: the label for the hero's
   action block. Grep for `PLACEHOLDER`.
3. **`npm audit`** reports a moderate + high advisory in `postcss`, reached
   only as a transitive dependency of Next 15. The only fix is Next 16.

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

## Roadmap

`BUILD-BRIEF.md` holds the full phased plan. Phase 1 (this migration) is done.
Phase 2 is the redesign — the anti-AI-slop constraints in that document are
deliberate; keep them.
