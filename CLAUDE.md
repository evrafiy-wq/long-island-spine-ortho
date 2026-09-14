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
- `next/font/google` self-hosts DM Sans + DM Serif Display
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

## Layout

```
app/                    One folder per route; page.tsx holds page-specific prose only
  globals.css           Design system + Tailwind imports (read the header comment)
  layout.tsx            Fonts, metadata, chrome (utility bar / header / footer)
components/
  layout/               Site chrome
  sections/             Page sections; 'use client' only where there is real interactivity
  Icon.tsx              Every inline SVG, copied path-for-path from the static site
content/practice.ts     Single source of truth for all practice content
lib/cx.ts               Conditional className joiner
public/forms/           Patient PDFs, referenced via practice.forms
public/images/          Optimized image masters
scripts/                One-off maintenance scripts
```

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

## globals.css: things that will bite you

**Cascade layer order is `theme, base, legacy, components, utilities`.**

1. **Preflight is deliberately not imported.** The legacy design system relies
   on browser-default margins for `p` and `h3`. Tailwind's Preflight zeroes
   them, which collapses spacing on every page. Re-enable it in Phase 2 only
   together with explicit margins.

2. **`legacy` sits after `theme` on purpose.** The two define 11 of the same
   custom properties — `--font-sans`, `--font-serif`, `--radius`,
   `--radius-sm/md/lg/xl`, `--shadow-xs/sm/md/lg` — with different values. The
   practice's values must win. Side effect: `rounded-lg` resolves to the
   practice's 24px, not Tailwind's 0.5rem. Surprising but consistent.

3. **`.container` was renamed to `.site-container`.** `container` is a real
   Tailwind utility, so Tailwind emitted its own into the later `utilities`
   layer and won, stretching every section to full viewport width. If you add a
   legacy-style class that shares a name with a Tailwind utility, expect the
   same.

## Known pre-existing bugs (inherited, deliberately not fixed)

These were broken on the static site before the migration and were reproduced
faithfully, because Phase 1 was explicitly a structural migration with no design
changes. Fix them in Phase 2.

1. **FAQ answers never open.** `.faq-answer` animates `grid-template-rows` from
   `0fr` to `1fr`, but with the `transition` applied the row stays computed at
   `0px`, so the panel has zero height. `aria-expanded` and the `hidden`
   attribute toggle correctly — only the reveal is broken. Verified: removing
   the transition makes it open to the correct height.
2. **Several icons render wrong.** `.resource-icon svg`, `.resource-action svg`,
   `.faq-icon svg` and the map pin in `.location-photo-label` have no
   `fill: none; stroke: currentColor` rule, unlike `.care-icon svg` and
   `.nav-cta svg`. The document/download icons render as solid black
   silhouettes, and the `<line>`-based FAQ `+` icon is **completely invisible**.
3. **`npm audit`** reports a moderate + high advisory in `postcss`, reached only
   as a transitive dependency of Next 15. The only fix is Next 16, which is
   outside this phase's stated stack.

## Roadmap

`BUILD-BRIEF.md` holds the full phased plan. Phase 1 (this migration) is done.
Phase 2 is the redesign — the anti-AI-slop constraints in that document are
deliberate; keep them.
