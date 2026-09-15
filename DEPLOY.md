# Deploying this site

Written for a Friday 18 September deadline. The ordering is deliberate: it gets
a working public link up **first**, then improves it. Every step after Step 3 is
an upgrade to a site that is already live, so nothing later can leave you with
no link at all.

Budget roughly 90 minutes of actual work, spread over two days because two
steps involve waiting on DNS.

> **This deploys in portfolio mode.** `NEXT_PUBLIC_SITE_MODE` defaults to
> `portfolio`, which applies `noindex` at three layers. Visually the site is
> identical to the real thing — no banner, no watermark — it simply cannot be
> found by search. That is correct for a resume project and it is why this can
> legitimately live on Vercel's free tier. See `lib/siteMode.ts` before
> changing it, and the launch blockers in [`docs/BACKEND.md`](docs/BACKEND.md)
> before ever setting it to `production`.

---

## Step 0 — Before you start (5 min)

Another session may have work in flight. Get to a clean tree first:

```bash
cd ~/Desktop/orthopedic-practice-site
git status
```

Resolve anything unexpected before continuing. Then verify the build, using a
scratch output directory so you don't kill a running dev server:

```bash
npm run typecheck
npm run lint
npm run test
NEXT_DIST_DIR=.next-verify npm run build
```

All four must pass. If `npm run build` complains about a missing environment
variable, that's a bug worth fixing rather than working around — `lib/env.ts`
is written so a build never needs production secrets.

---

## Step 1 — Buy the domain (15 min, ~$12)

Register at **[Cloudflare Registrar](https://domains.cloudflare.com)** or
**[Porkbun](https://porkbun.com)**. Both sell at cost with free WHOIS privacy.
Avoid GoDaddy — the first year is cheap and the renewals are not.

Candidates, best first:

| Domain                     | Notes                                |
| -------------------------- | ------------------------------------ |
| `lispineortho.com`         | Short, says what it is, easy to type |
| `rafiyortho.com`           | Easiest to say out loud              |
| `longislandspineortho.com` | Most descriptive, longest            |

`.com` only. Say it out loud before you buy — if you'd have to spell it for
someone, pick another.

Do this first because DNS and certificate issuance want a few hours of
slack, and Step 4 is the one step you cannot rush.

---

## Step 2 — Push to GitHub (10 min)

The repo is part of what you're being evaluated on. Ten commits from static
HTML through to a working backend is a better artifact than the site itself.

```bash
cd ~/Desktop/orthopedic-practice-site
git add -A
git commit -m "Phase 5: pre-launch QA and portfolio-mode deployment switch"
```

Then create the remote. With the `gh` CLI:

```bash
gh repo create long-island-spine-ortho --public --source=. --remote=origin --push
```

Or create an empty repo at github.com/new and:

```bash
git remote add origin git@github.com:YOUR_USERNAME/long-island-spine-ortho.git
git branch -M main
git push -u origin main
```

**Public or private?** Public, if you want anyone to read it — a private repo
on a resume is a dead link unless you grant access per reviewer. It contains no
secrets: `.env.local` is gitignored, and `git check-ignore -v .env.local`
confirms it.

Before you push, confirm no secret ever got committed:

```bash
git log --all --full-history -- .env .env.local
```

That must print nothing. If it prints anything, the values in `.env.local` are
compromised and have to be regenerated — the history keeps the old ones
forever.

---

## Step 3 — Deploy to Vercel (15 min) — **you have a live link after this**

1. Go to [vercel.com](https://vercel.com) and sign in **with GitHub**.
2. **Add New → Project**, import `long-island-spine-ortho`.
3. Framework detects as Next.js. Change no build settings.
4. Under **Environment Variables**, add the following for **Production _and_
   Preview**. Values come from your local `.env.local` — open it alongside.

   | Variable                | Value                  |
   | ----------------------- | ---------------------- |
   | `NEXT_PUBLIC_SITE_MODE` | `portfolio`            |
   | `FIELD_ENCRYPTION_KEY`  | copy from `.env.local` |
   | `IP_HASH_SALT`          | copy from `.env.local` |
   | `AUTH_SECRET`           | copy from `.env.local` |
   | `CRON_SECRET`           | copy from `.env.local` |
   | `ADMIN_EMAILS`          | your email address     |
   | `NEXT_PUBLIC_ANALYTICS` | `vercel`               |

   Leave `DATABASE_URL`, `RESEND_API_KEY`, `MAIL_FROM`, `OFFICE_EMAIL` and
   `NEXT_PUBLIC_SITE_URL` out for now. Steps 4–6 add them. The site builds and
   renders without them; only the appointment form is inert, and it says so
   rather than pretending to succeed.

5. **Deploy.** Two minutes later you have `your-project.vercel.app`.

**You now have a working link.** Open it on your phone. Click through all five
pages. If Friday went sideways from here, you would still have something to
put on the resume.

---

## Step 4 — Connect the domain (15 min + up to 48h of waiting)

In Vercel: **Settings → Domains → Add**. Add both:

- `lispineortho.com`
- `www.lispineortho.com`

Vercel shows you the records to create. Two paths:

**Simplest — hand DNS to Vercel.** At your registrar, replace the nameservers
with the two Vercel gives you. Vercel then manages every record, including the
email records in Step 6.

**Or keep DNS at your registrar** and add:

| Type    | Name  | Value                  |
| ------- | ----- | ---------------------- |
| `A`     | `@`   | `76.76.21.21`          |
| `CNAME` | `www` | `cname.vercel-dns.com` |

Then set the origin, which several subsystems read from one place
(`lib/siteUrl.ts` — canonicals, sitemap, JSON-LD, admin links in email):

- In Vercel, add `NEXT_PUBLIC_SITE_URL` = `https://lispineortho.com`
  (no trailing slash, no `www`)
- **Redeploy.** Environment variables are read at build time; an existing
  deployment will not pick this up on its own.

Pick one canonical host and let the other redirect — Vercel does this
automatically once both are added.

### On waiting

Check propagation:

```bash
dig lispineortho.com +short
dig www.lispineortho.com +short
```

Nothing is "spreading." Resolvers cached the previous answer with a
time-to-live and keep serving it until that expires. Usually under an hour,
occasionally 48. HTTPS appears on its own within minutes of DNS resolving —
Vercel provisions a Let's Encrypt certificate and renews it forever.

If the certificate is still pending after an hour with DNS resolving
correctly, remove the domain in Vercel and re-add it. That re-triggers
issuance and fixes it most of the time.

---

## Step 5 — Database, so the form actually works (20 min)

1. [neon.tech](https://neon.tech) → sign in with GitHub → **New Project**.
   Region `us-east-1` (closest to both Long Island and Vercel's default).
2. Copy the **pooled** connection string — it contains `-pooler`. The unpooled
   one exhausts connections under serverless, where each invocation is a new
   client.
3. Put it in `.env.local` as `DATABASE_URL`, then create the tables:

   ```bash
   npm run db:migrate
   ```

4. Add the same `DATABASE_URL` to Vercel (Production + Preview) and redeploy.

Check it end to end: submit a real appointment request on the live URL, then
sign in at `/admin` with your email and confirm the row is there. The magic
link needs Step 6 to arrive by email — until then, Neon's SQL editor will show
you the row directly.

---

## Step 6 — Email (30 min, plus DNS)

Two things have to be true: Resend has to hold an API key, and DNS has to prove
you're allowed to send as your domain. Skip the second and everything lands in
spam.

1. [resend.com](https://resend.com) → sign in → **API Keys** → create one.
   Add as `RESEND_API_KEY` in `.env.local` and in Vercel.
2. **Domains → Add Domain** → `lispineortho.com`. Resend gives you DKIM and
   SPF records. Add them at whoever holds your DNS (Vercel, if you moved
   nameservers in Step 4). Wait for Resend to show **Verified**.
3. Set `MAIL_FROM` to something on that domain:
   `Long Island Spine and Orthopedics <no-reply@lispineortho.com>`
4. Set `OFFICE_EMAIL` to your own address. On a portfolio deployment that is
   the honest answer, and it is why the disclosure band sends anyone actually
   seeking care to the telephone rather than the form.
5. Redeploy.

**Shortcut if Friday is close:** Resend's sandbox sender
`Acme <onboarding@resend.dev>` works with no DNS at all. It can only deliver to
the address that owns the Resend account — useless for real patients, perfectly
adequate to demonstrate that the pipeline works. Do this Thursday and the real
domain verification after the deadline.

Once the domain is verified, test at
[mail-tester.com](https://www.mail-tester.com) and aim for 10/10.

---

## Step 7 — Optional hardening (after Friday)

Neither of these blocks anything; both subsystems already degrade on purpose.

- **Cloudflare Turnstile** — free. `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and
  `TURNSTILE_SECRET_KEY`. Without it the bot check falls through to the rate
  limiter, which is a real if blunter defence.
- **Upstash Redis** — free tier. `UPSTASH_REDIS_REST_URL` and
  `UPSTASH_REDIS_REST_TOKEN`. Without it rate limiting uses an in-process
  fallback: correct within one serverless instance, weaker across many.

Also worth doing eventually: a cron trigger for `/api/cron/purge` (the 90-day
retention job), added in `vercel.json` or Vercel's Cron UI with the
`CRON_SECRET` as a bearer token.

---

## Friday checklist

- [ ] `https://lispineortho.com` loads over HTTPS with no certificate warning
- [ ] `www` redirects to the apex (or the reverse — just pick one)
- [ ] All five pages reachable from the nav; every footer link resolves
- [ ] Phone number tappable at 375px width — test on an actual phone
- [ ] Appointment form submits and the row appears in `/admin`
- [ ] Both emails arrive (or the sandbox sender demonstrably works)
- [ ] `/admin` redirects to sign-in when signed out
- [ ] `curl -sI https://lispineortho.com | grep -i x-robots-tag` returns
      `noindex` — portfolio mode is actually on
- [ ] `curl -s https://lispineortho.com/robots.txt` shows `Disallow: /`
- [ ] The 404 page renders with chrome and a phone number: visit `/nonsense`
- [ ] No console errors on any page
- [ ] The disclosure band is visible on first load
- [ ] README link at the top of the repo points at the live site

---

## What is _not_ on this list, and why

`BUILD-BRIEF.md` Part 6 has a long tail of post-launch marketing work — Google
Business Profile, insurance directories, Healthgrades and Vitals listings,
Zocdoc, a review pipeline, physician referral outreach, Google Workspace. All
of it is for an operating practice competing for patients.

**None of it applies here, and some of it would be actively wrong.** Claiming a
Google Business Profile for a practice you do not run, or listing a portfolio
deployment in a physician directory, creates exactly the confusion that
portfolio mode exists to prevent. Skip the entire section.

The legal items — a privacy policy and terms reviewed by counsel, and a HIPAA
determination — are also deferred, but for a different reason: they are
prerequisites for `production` mode, not for this deployment. `/privacy` and
`/terms` render an honest "not yet published" notice rather than invented legal
terms, which is the correct state for a site that is demonstrably not taking
real patients.
