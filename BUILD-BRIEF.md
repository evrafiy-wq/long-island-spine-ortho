# Long Island Spine & Orthopedics — Full Build Brief

Everything you need to take the current static skeleton to a live, professional site.

**How to use this:** Don't paste the whole thing at once. Run the prompts in order, in separate Claude Code sessions (or `/clear` between them). Each one has a clear stopping point where you review before moving on.

---

## Part 0 — Facts the site is built on

Verify these before you start. Anything wrong here propagates into every page.

| Field | Value |
|---|---|
| Practice name | Long Island Spine and Orthopedics |
| Physician | Philip M. Rafiy, MD |
| Credentials | Board Certified, American Board of Orthopedic Surgery (ABOS) |
| Education | MD, State University of New York |
| Academic | Adjunct Assistant Professor, NYU Grossman Long Island School of Medicine |
| Languages | English, French, Spanish |
| Address | 87 W Old Country Rd, Hicksville, NY 11801 |
| Phone | (516) 433-1100 |
| Hours | Mon–Fri 9:00am–5:00pm; Sat–Sun closed |
| Parking | Free private onsite parking behind the building |

**Still needed before launch** (gather these now, they block Phase 4):
- Office email address for appointment requests to route to
- Insurance plans accepted
- Fax number
- NPI number (for schema markup)
- Professional headshot of Dr. Rafiy — the current `rafiy.jpg` is 2MB and unoptimized
- Exterior/interior photos of the Hicksville office
- Google Business Profile claimed? (critical for local SEO)

---

## Phase 1 — Repo hygiene and stack migration

> **Prompt 1 — paste into Claude Code:**
>
> This is a static website for a medical practice that I'm rebuilding properly. Before any design work, do the cleanup and migration:
>
> **1. Audit and clean.** List every file in the repo with its purpose and a keep/delete recommendation. I already know these are junk: `poop.jpg`, `styles.css.backup`, `stitch-souce.html` (typo duplicate of `stitch-source.html`), `.DS_Store`. Don't delete anything until I confirm the list.
>
> **2. Migrate to Next.js 15 (App Router) + TypeScript + Tailwind CSS v4.** Scaffold in place, preserving all existing copy verbatim — I want a structural migration, not a rewrite of the content. Map the current pages to routes:
> - `index.html` → `/`
> - `services.html` → `/services`
> - `about.html` → `/about`
> - `patient-info.html` → `/patient-info`
> - `visit.html` → `/visit`
>
> **3. Set up the foundation properly:**
> - `git init`, a sensible `.gitignore` (node_modules, .next, .env*, .DS_Store)
> - ESLint + Prettier with Tailwind class sorting
> - A `CLAUDE.md` at the repo root documenting the stack, file conventions, the practice facts table above, and the rule that all content is medical — no invented clinical claims, credentials, statistics, or testimonials, ever
> - Move all practice info (name, address, phone, hours, services, conditions) into a single typed `content/practice.ts` config so nothing is hardcoded in JSX
> - Convert the PDFs in `/forms` into a `public/forms/` directory, referenced from the config
>
> **4. Images:** optimize `rafiy.jpg` (currently 2MB) into properly sized WebP variants and use `next/image` everywhere.
>
> Do NOT touch visual design yet. The output of this phase should look roughly like the current site, just running on Next.js with clean architecture. Run `npm run build` and confirm it passes before you tell me you're done.

**Review gate:** `npm run dev` should render all five pages with the current styling. Don't proceed until the build is clean.

---

## Phase 2 — Frontend redesign (three directions)

This is the prompt that matters most. The anti-slop constraints are doing the heavy lifting — keep them.

> **Prompt 2 — paste into Claude Code:**
>
> Now redesign the frontend. This is a medical practice site for a board-certified orthopedic spine surgeon on Long Island. The audience is adults 40–75 in pain, often anxious, many arriving from a Google search or a physician referral, a large share on mobile. The site's job is to establish clinical credibility in about four seconds and make "request an appointment" or "call" effortless.
>
> **Produce three complete, genuinely distinct design directions.** Build each as a fully working homepage route so I can click through and compare: `/preview/a`, `/preview/b`, `/preview/c`. Each direction needs its own design token set (colors, type scale, spacing, radii, shadows) defined in Tailwind theme config — not scattered utility classes.
>
> For each direction give me a one-paragraph rationale: who it's speaking to, what it's signaling, what it's deliberately giving up.
>
> Suggested territory, but push back if you have something stronger:
> - **A — Clinical Authority.** Restrained, academic. Think a top-tier hospital system or a medical journal. Serif headlines, generous whitespace, near-monochrome with one accent, photography used sparingly and only where it's real.
> - **B — Warm Practitioner.** Approachable and human without being soft. Signals "a real doctor who will explain things to you," not "a hospital network." Warmer neutrals, more photography, larger body text.
> - **C — Modern Precision.** Confident, contemporary, closer to a well-designed professional services firm. Strong typographic hierarchy, disciplined grid, restrained motion, deliberate use of scale contrast.
>
> **Hard constraints — these are non-negotiable:**
>
> *Banned outright* (these are the tells that make a site look AI-generated):
> - Purple/violet-to-blue gradients, or any gradient as a hero background
> - Glassmorphism, frosted-glass cards, blurred floating "orbs" (the current site has two — delete them)
> - Emoji as iconography
> - Generic three-across feature cards with a circle icon, bold title, two lines of gray text
> - Centered hero: eyebrow / huge headline / subtitle / two buttons, stacked
> - Stock photography of smiling people in scrubs, handshakes, or abstract "medical technology" imagery
> - Scroll-triggered fade-up animation on every section
> - Inter, Poppins, or Montserrat as the primary typeface
> - Drop shadows on everything; `rounded-2xl` on everything
> - Copy like "Empowering your journey," "Comprehensive solutions," "Excellence in care"
>
> *Required:*
> - Real typographic hierarchy — at least four distinct levels, sized with intent, not just three font sizes
> - Body text 17–18px minimum with 1.6+ line height. This audience is older; legibility is a clinical requirement, not a preference
> - WCAG AA contrast minimum throughout; AAA for body copy
> - Phone number reachable in one tap from any viewport, always
> - Every layout designed mobile-first and verified at 375px, 768px, 1280px, 1920px
> - Full keyboard navigation, visible focus states, correct heading order, semantic landmarks, `prefers-reduced-motion` respected
> - Font pairing chosen with a stated reason. Pull from Google Fonts but go past the defaults — e.g. Source Serif 4, Newsreader, Fraunces, Public Sans, IBM Plex Sans, Instrument Sans, Libre Franklin
> - All icons from a single consistent set (Lucide or Phosphor), one stroke weight, sized to the type scale
> - Any motion: under 250ms, easing-out, and purposeful — state changes only, never decoration
>
> **Content rules:** Use only the copy that exists in the current site and the practice facts in `content/practice.ts`. Where a direction needs copy that doesn't exist yet, write it as `[PLACEHOLDER: description]` and list every one at the end. Do not invent patient outcomes, statistics, testimonials, years of experience, procedure counts, or certifications.
>
> Build all three, then stop and wait for me to pick. Don't apply one to the rest of the site yet.

**Review gate:** Open all three at multiple widths, on your phone too. Pick one — or tell Claude Code to combine elements ("A's typography with B's photography treatment"). Then:

> **Prompt 2b:** I'm going with direction [X]. Apply it across all five pages. Delete the other two preview routes and any unused tokens. Every page should feel like it came from the same system — consistent spacing rhythm, consistent component vocabulary. Then run a self-audit: check contrast ratios, heading order, focus states, and responsive behavior at 375/768/1280/1920, and report anything that fails.

---

## Phase 3 — Logo and wordmark

You said "Long Island Orthopedics," but the site currently reads "Long Island Spine and Orthopedics." **Decide which is the legal/marketing name before this step** — it affects the logo, the domain, the Google Business Profile, and every page title. The longer name is more descriptive for SEO (spine is a high-value search term); the shorter one is cleaner as a mark. A common resolution: full name as the legal/wordmark, "LI Spine & Ortho" nowhere, and the spine emphasis carried in page titles instead.

> **Prompt 3 — paste into Claude Code:**
>
> Design a new logo. The current `logo.svg` is a circular badge with a medical cross, a teal arc, blue dots, and a yellow wrench — it's cluttered, uses five colors, and reads as clip art. Replace it.
>
> Practice name: **[Long Island Spine and Orthopedics / Long Island Orthopedics — pick one]**
>
> **Direction:** A typographic wordmark, primarily. Professional medical practices are identified by their name, not a symbol — think how a law firm or a hospital department marks itself. If a symbol is included at all it must be abstract, geometric, single-color, and able to stand alone as a favicon.
>
> Give me **four wordmark options as SVG**, each with:
> - A horizontal lockup for the header
> - A stacked lockup for the footer and print
> - A standalone mark/monogram for favicon and social (if the direction includes one)
> - Monochrome black and reversed-white variants
>
> Suggested typographic territory — use real, well-drawn typefaces, not system defaults:
> 1. **Transitional serif**, tight tracking, slight optical adjustment — institutional and established
> 2. **Grotesque sans**, medium weight, generous letterspacing on the "LONG ISLAND" line — modern and clinical
> 3. **Serif + sans lockup** — "Long Island" in sans caps as a small line above "Spine and Orthopedics" in serif, hierarchy doing the work
> 4. Your own strong alternative
>
> **Rules:**
> - Maximum two colors, and it must survive as pure black on white
> - Legible at 24px tall and at 200px tall — show me both
> - No caduceus, no rod of Asclepius, no generic medical cross, no bone/skeleton imagery, no swoosh, no abstract "person reaching upward," no gradient
> - Convert the final type to outlined paths in the SVG so it renders identically everywhere
> - Optimize with SVGO; each file should be under 4KB
>
> Render all four side by side on a `/preview/logos` route, shown at multiple sizes, on light and dark backgrounds, and in-situ inside the actual site header. Then stop and wait for me to choose.
>
> Once I pick: generate the full favicon set (`favicon.ico`, 32/180/192/512 PNGs, `apple-touch-icon`, `site.webmanifest`), an OpenGraph image at 1200×630, and replace the logo everywhere in the codebase.

**Note on fonts:** if a direction uses a commercial typeface, you need a license to use it in a logo. Google Fonts and other OFL-licensed faces are free for this. Ask Claude Code to confirm the license of whatever it picks.

---

## Phase 4 — Backend

> **Prompt 4 — paste into Claude Code:**
>
> Build the backend. Scope: appointment requests, contact form, staff notifications, and a simple admin inbox. **No patient portal, no accounts, no medical records** — I want to stay clearly outside HIPAA-regulated PHI storage where possible, and where I can't, I want it flagged.
>
> **Stack:** Next.js Route Handlers + Server Actions, Postgres via Neon, Drizzle ORM, Zod for validation, Resend for email.
>
> **1. Appointment request flow**
> - Fields: full name, phone, email, preferred date, preferred time window, reason for visit (select), referring physician (optional), insurance carrier (optional), free-text notes
> - **The notes field is the risk point** — patients will type symptoms into it. Label it explicitly: "Please do not include detailed medical information. Our staff will collect that by phone." Add this to the privacy notice too.
> - Zod schema shared between client and server so validation rules can't drift
> - Progressive enhancement: works with JavaScript disabled via Server Action
> - Inline field-level errors, accessible (`aria-invalid`, `aria-describedby`, error summary focus on submit), and a clear success state that tells the patient what happens next and how long it takes
> - Honeypot field + Cloudflare Turnstile + per-IP rate limiting (Upstash Redis)
>
> **2. Contact/general inquiry form** — same infrastructure, lighter fields.
>
> **3. Notifications**
> - Email to the office on every submission, with the request formatted for fast triage and a `mailto:`/`tel:` reply path
> - Confirmation email to the patient: acknowledges receipt, sets expectation for callback timing, states clearly that this is a *request* and not a confirmed appointment, and includes the 911 notice for emergencies
> - Both as React Email templates, plain-text fallback included
>
> **4. Admin inbox** at `/admin`
> - Auth via Auth.js, email magic link, allowlisted addresses only from an env var
> - Table of submissions: newest first, filter by status (new / contacted / scheduled / closed), search by name or phone
> - Detail view with a status dropdown and an internal notes field
> - CSV export
> - `noindex` header, and middleware protecting the whole route segment
>
> **5. Data handling**
> - Encrypt the notes field at rest
> - 90-day automatic purge of closed submissions via a cron route
> - Audit log of admin views and status changes
> - Full `.env.example` documenting every variable
>
> **6. Also build:**
> - Per-page metadata, OpenGraph tags, `sitemap.xml`, `robots.txt`
> - JSON-LD structured data: `MedicalBusiness` + `Physician` + `LocalBusiness` with the real NPI, address, hours, and geo coordinates — this materially affects local search
> - A 404 and a 500 page that match the design
> - Error boundaries and loading states on every route
> - Basic analytics (Vercel Analytics or Plausible — no Google Analytics; it complicates the privacy notice for a medical site)
>
> **7. Tests:** Vitest for the Zod schemas and server actions, Playwright for the appointment flow end to end including the validation failure paths.
>
> Write a `docs/BACKEND.md` explaining the data flow, every env var, and how to add an admin user.

**Legal review before launch — do not skip:**
- A privacy policy and terms of use reviewed by counsel familiar with NY healthcare marketing
- Confirmation from the practice's malpractice carrier / compliance advisor on whether the appointment form's data handling triggers HIPAA obligations. Getting a BAA with Neon and Resend is the conservative path and is worth asking about.
- Website accessibility is an active ADA litigation area for medical practices. The accessibility requirements in Phase 2 aren't optional polish.

---

## Phase 5 — Pre-launch QA

> **Prompt 5:** Run a full pre-launch audit and fix what you find:
> - Lighthouse on every route — target 95+ across all four categories
> - `axe-core` accessibility scan, zero violations
> - Every link, form, phone link, and PDF download manually verified
> - Cross-browser: Chrome, Safari, Firefox, iOS Safari, Android Chrome
> - All `[PLACEHOLDER]` content resolved or listed for me
> - No console errors, no hydration warnings
> - `npm audit` clean
> - Every image has meaningful alt text
> - Real content in every metadata field — no leftover defaults
>
> Produce a launch checklist of anything only I can do (content, photos, legal copy, credentials).

---

## Part 6 — Domain and publishing

### Step 1 — Buy the domain (~15 min, $12–20/yr)

Register at **Cloudflare Registrar** (at-cost pricing, free WHOIS privacy, no renewal price games) or **Porkbun**. Avoid GoDaddy — cheap first year, expensive renewals, aggressive upsells.

Candidates, in rough order of preference:

1. `longislandspineortho.com`
2. `lispineortho.com`
3. `rafiyortho.com` — physician-name domains work well when the doctor *is* the brand
4. `longislandspineandorthopedics.com` — exact match, but long to say over the phone

Rules of thumb: `.com` only. Test it out loud — if you can't say it over the phone without spelling it, pick another. Buy the obvious typo variants and redirect them. Buy 3–5 years upfront so it can't lapse.

Check the name isn't already in use by another NY practice: search the [NYS Division of Corporations](https://apps.dos.ny.gov/publicInquiry/) and [USPTO TESS](https://tmsearch.uspto.gov/) before committing.

### Step 2 — Push to GitHub (~10 min)

```bash
gh repo create long-island-spine-ortho --private --source=. --remote=origin
git add -A && git commit -m "Initial production build"
git push -u origin main
```

Private repo. Confirm no `.env` file was ever committed — if one was, rotate every key.

### Step 3 — Deploy to Vercel (~15 min)

1. vercel.com → sign in with GitHub → **Add New Project** → import the repo
2. Framework auto-detects as Next.js; leave build settings alone
3. Add every environment variable from `.env.example` under Settings → Environment Variables (Production + Preview)
4. Deploy. You get a `*.vercel.app` URL in about two minutes.

Set up the database first: neon.tech → new project → copy the connection string into Vercel → run migrations against production.

**Test everything on the `.vercel.app` URL before pointing the domain at it.** Submit a real appointment request. Confirm both emails arrive. Log into `/admin`.

### Step 4 — Connect the domain (~30 min, plus DNS propagation)

In Vercel: Settings → Domains → add both `longislandspineortho.com` and `www.longislandspineortho.com`. Vercel gives you DNS records.

If the domain is at Cloudflare, the cleanest path is to change the nameservers to Vercel's and let Vercel manage DNS. Otherwise add the records Vercel specifies at your registrar:

- `A` record, `@` → `76.76.21.21`
- `CNAME`, `www` → `cname.vercel-dns.com`

Pick one canonical version (apex or www) and 301 the other — Vercel does this automatically once both are added.

SSL is automatic via Let's Encrypt, usually within minutes of DNS resolving. DNS propagation is typically under an hour but can take up to 48. Check with `dig longislandspineortho.com` or whatsmydns.net.

### Step 5 — Email (~30 min)

You need two separate things:

**Transactional** (the site sending mail): verify your domain in Resend, add the DKIM/SPF/DMARC records it provides. Without these, appointment notifications land in spam. Non-negotiable.

**Office mailbox** (`info@` or `appointments@`): Google Workspace ($7/user/mo) or Microsoft 365. Add its MX records alongside the Resend records — they coexist fine.

Then send a test to mail-tester.com and aim for 10/10.

### Step 6 — Post-launch (first week)

- [ ] **Google Business Profile** — claim or update it. Verify the address, hours, phone, and website URL match the site *exactly*, character for character. For a local medical practice this drives more traffic than the website itself.
- [ ] Submit the sitemap in Google Search Console; request indexing on key pages
- [ ] Bing Webmaster Tools — small but free traffic
- [ ] Update NPI registry, Healthgrades, Vitals, Zocdoc, and insurance directory listings with the new URL
- [ ] Set up Vercel deployment notifications and an uptime monitor (UptimeRobot, free)
- [ ] Have three people who aren't you submit the appointment form from three different devices
- [ ] Confirm with the front desk that they know where requests arrive and who checks `/admin`

### Ongoing cost

| Item | Cost |
|---|---|
| Domain | ~$12–20/yr |
| Vercel Hobby | $0 (Pro $20/mo if you want a team or analytics) |
| Neon Postgres | $0 free tier is plenty at this volume |
| Resend | $0 up to 3,000 emails/mo |
| Cloudflare Turnstile | $0 |
| Google Workspace | $7/user/mo |
| **Realistic total** | **~$10/mo** |

---

## Sequencing summary

| Phase | Prompt | Review gate |
|---|---|---|
| 1 | Cleanup + Next.js migration | Build passes, all pages render |
| 2 | Three design directions | Pick one, then apply sitewide |
| 3 | Four logo options | Pick one, then generate assets |
| 4 | Backend + SEO + admin | Test the full appointment flow locally |
| 5 | QA audit | Lighthouse 95+, zero a11y violations |
| 6 | Domain + deploy | Test on `.vercel.app` before DNS |

Phases 2 and 3 can run in parallel in separate sessions if you're impatient. Phase 4 depends on 1 only, not on 2 or 3 — so you could start the backend while you're deciding on design.
