# Launch checklist — things only you can supply

Everything in this file needs a human decision or a fact from the practice.
None of it can be derived from the code, and none of it should be guessed:
this is a real physician's website, and an invented credential, phone number or
insurance list is a regulatory and patient-safety problem, not a typo. See the
content rule at the top of [`CLAUDE.md`](../CLAUDE.md).

The engineering side of Phase 5 is done — the audit results are at the bottom.
What is left is content, credentials, photography and legal review.

**The single most important line in this file** is the office email address. It
is the difference between a patient's appointment request reaching a human and
reaching a database nobody opens.

---

## 1. Blocking — the site should not go live without these

### 1.1 Office email address

|                   |                                                                                                                                                                                                                                     |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Where it goes** | `OFFICE_EMAIL` environment variable                                                                                                                                                                                                 |
| **Until then**    | Every appointment and contact request is saved and encrypted, and is visible in `/admin` — but **nobody is told it arrived.** The server logs `[email] OFFICE_EMAIL is not set; the office was not notified of <ref>` and moves on. |
| **Ask**           | The front desk. It needs to be a mailbox somebody actually reads daily.                                                                                                                                                             |

Verified during this audit: a contact submission stored correctly and produced
reference `D38E4FCE`, and the office notification was skipped with exactly that
log line. The patient still saw a success panel. That combination — patient
told "message received", office never told — is the risk this item closes.

### 1.2 Privacy notice and terms of use, written by counsel

`/privacy` and `/terms` are **not finished legal documents.** `content/legal.ts`
splits each page into two kinds of section:

- factual sections describing what the code actually does (accurate as of
  Phase 4, and must be revisited whenever the backend changes), and
- sections marked `awaitingCounsel`, which render a visible "not yet published"
  note rather than invented legal terms.

Six sections are currently `awaitingCounsel` — the HIPAA posture, patient
rights, liability, governing law and IP. These need counsel familiar with **New
York healthcare marketing**, not a generic template.

### 1.3 A HIPAA determination

The forms collect a name, a phone number, an email address and a free-text
reason for visit, against a named physician's office. **Whether that is PHI for
this practice is a question for the practice's compliance advisor or
malpractice carrier**, not for this repository.

The conservative path is business associate agreements with **Neon** (database),
**Resend** (email) and **Vercel** (hosting). Worth asking about before launch,
because retrofitting a BAA after data has been collected is harder.

### 1.4 The three patient PDFs are placeholders

All three files under `public/forms/` are generated stubs, not the practice's
real paperwork. Each one says so in its own body text:

| File                           | Current content                                                                                                                |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `new_patient_registration.pdf` | "[Placeholder Form] Please complete this prior to your first appointment." — field labels only, no practice letterhead         |
| `medical_history.pdf`          | "[Placeholder Form] Please record your prior surgeries, diagnoses, symptoms, and current medications." — section headings only |
| `hipaa_privacy_notice.pdf`     | "[Placeholder Form] … This is a placeholder Notice of Privacy Practices … attorney-reviewed privacy notice before use."        |

`/patient-info` tells visitors to download and fill these in before their first
visit. The HIPAA Notice of Privacy Practices in particular is a document
patients sign, so the placeholder must be replaced with the practice's real,
attorney-reviewed notice. Replace the files at the same paths and nothing else
changes.

### 1.5 Production domain

|                   |                                                                                                                                         |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Where it goes** | `NEXT_PUBLIC_SITE_URL`                                                                                                                  |
| **Until then**    | Canonical tags, the sitemap, the JSON-LD graph, OpenGraph URLs and the admin links inside office email all say `http://localhost:3000`. |

[`DEPLOY.md`](../DEPLOY.md) covers buying and connecting it.

> Note: set this to a real origin or leave it **absent entirely**. A present but
> empty value (`NEXT_PUBLIC_SITE_URL=""`) used to crash `next build` with
> `TypeError: Invalid URL` reported against `/_not-found`. That is fixed —
> empty and whitespace-only now fall back to localhost like an unset variable —
> but a real domain is still what you want here.

### 1.6 Flip the site out of portfolio mode

`NEXT_PUBLIC_SITE_MODE` defaults to `portfolio`, which applies `noindex` at
three layers and renders the "Portfolio demonstration" band. **That default is
correct and deliberate** — it means a misspelled or forgotten variable yields
the safe deployment.

Setting it to `production` is the last step, and only after 1.1–1.5 are done.
Until then the site is intentionally invisible to search engines (measured:
Lighthouse SEO 69 in portfolio mode vs 100 in production mode — the entire gap
is the intentional `noindex`).

---

## 2. Unverified claims — confirm or remove before they reach a patient

These are already on the site and are **contradicted by an external source.**
Do not propagate them into schema.org markup, meta descriptions or ad copy
until the practice confirms them directly. Both are flagged `UNVERIFIED` in
`content/practice.ts`.

| Claim                                                          | On the site                      | Conflicting source                                                                               | Risk if wrong                                                           |
| -------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| **Languages** — English, French, Spanish                       | 3 places, incl. a hero highlight | NYU Langone's provider directory lists **English only**                                          | Draws patients who will arrive needing an interpreter that is not there |
| **Insurance** — Aetna, BCBS, UnitedHealthcare, Cigna, Medicare | `/patient-info`                  | NYU Langone lists only Aetna, NYS Health Insurance Plan, Oxford — overlapping on **Aetna alone** | Surprise out-of-network bills                                           |

Resolve these with the practice's **front desk and billing office**, not a
directory listing. A directory can be stale; so can a website.

---

## 3. Credentials and registry identifiers

| Item                | Where it goes              | Until then                                                                                                                                                         |
| ------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **NPI number**      | `practice.identifiers.npi` | Omitted from the JSON-LD entirely. A _guessed_ NPI would attach the practice's search presence to a different clinician, so the builder omits rather than guesses. |
| **Geo coordinates** | `practice.identifiers.geo` | `geo` omitted from JSON-LD; `address` and `hasMap` carry the location on their own.                                                                                |

Take the coordinates off the practice's **own Google Business Profile** so the
pin the site claims and the pin Google already shows are the same point.

---

## 4. Copy decisions

### 4.1 Callback window

|                   |                                                                                                                                                                 |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Where it goes** | `practice.callbackWindow` (currently `null`)                                                                                                                    |
| **Until then**    | The appointment success panel and the patient confirmation email both say "our staff will contact you to confirm your visit" — true, but promises no timeframe. |

If the front desk commits to "within one business day", set the string and both
surfaces pick it up. **Do not set it to something nobody has agreed to** — this
is a promise made to a patient in writing.

### 4.2 Which name is the public one

The CMS NPPES registry has the legal name as **`Long Island Spine &
Orthopedics, PC`** (ampersand, `PC` suffix). The site displays "Long Island
Spine and Orthopedics" everywhere. The legal name is held as
`practice.legalName` and deliberately unused.

Worth knowing: **the building signage in the office photo reads "LONG ISLAND
SPINE & ORTHOPEDICS"** — the ampersand form. This is a branding decision, not a
code change.

---

## 5. Photography

| Asset                               | Status                                                                                                                                                        |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `public/images/dr-rafiy.webp`       | Real portrait, 1122×1402. Fine.                                                                                                                               |
| `public/images/office-exterior.jpg` | Real photo of the building, but only **597×335** (47 KB) — it appears on the homepage and `/visit`, and will look soft on any modern phone or retina display. |

Worth replacing the exterior shot with a higher-resolution photo if one exists.
Drop the new master in and run `node scripts/optimize-images.mjs`, which encodes
WebP and JPEG and keeps whichever is smallest.

Also confirm you have the **rights to use both photographs** — if either was
taken by a third party, that needs to be settled before publication.

---

## 6. Post-launch, once the domain resolves

- Submit the sitemap in **Google Search Console** and verify the property.
- Update the practice's **Google Business Profile** to point at the new domain,
  and make sure the address, hours and phone there match this site exactly.
- Check the **NPPES / insurance directory listings** that currently contradict
  the languages and insurance claims in section 2 — if the site is right and
  the directory is wrong, the directory should be corrected too.

---

## Audit results (Phase 5, engineering side)

Measured against a production build, not the dev server.

| Check                                 | Result                                                                                                                                    |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Lighthouse desktop**                | **100 / 100 / 100 / 100** on all 8 routes                                                                                                 |
| **Lighthouse mobile**                 | perf **97–99**, a11y **100**, best practices **100**, SEO **100** on all 8 routes                                                         |
| **axe-core**                          | **0 violations** — 20 scans, 9 routes × 2 viewports, WCAG 2.0/2.1/2.2 A+AA plus best-practice, including opened FAQ and mobile nav states |
| **Contrast**                          | All declared token pairs pass, including the two new PortfolioNotice pairs                                                                |
| **Cross-browser**                     | **0 problems** — 40 route loads across Chrome, Firefox, Safari/WebKit, iOS Safari (iPhone 13), Android Chrome (Pixel 7)                   |
| **Console / hydration**               | No console errors and no hydration warnings on any route, in dev or production                                                            |
| **Links / PDFs / tel:**               | Every internal link, asset, PDF and `tel:` resolves                                                                                       |
| **`npm audit`**                       | **0 vulnerabilities**                                                                                                                     |
| **Build / lint / typecheck / format** | All clean                                                                                                                                 |
| **Unit tests**                        | 91 passed                                                                                                                                 |
| **E2E (appointment flow)**            | 10 passed, including the no-JavaScript path                                                                                               |

Re-run the two gates after any visual change:

```bash
node scripts/audit-contrast.mjs
```

```bash
node scripts/audit-a11y.mjs
```

The a11y audit needs a server running; point it somewhere else with
`A11Y_BASE_URL=http://localhost:3100 node scripts/audit-a11y.mjs`.
