# Questions for the practice

Everything here is a fact only the practice can confirm. Each one is currently
either unverified in `content/practice.ts` or a `[PLACEHOLDER]` in the code.

The site can go live **unindexed** without any of these answered. Going
indexed — findable by patients searching for care — needs the four items in
Part 1 first.

Print this, or read it off a phone at the front desk. Fifteen minutes of
someone's time answers all of it.

---

## Part 1 — Blocks indexing

### 1. Which insurance plans does the practice accept?

**This is the important one.** The site currently lists:

> Aetna · BlueCross BlueShield · UnitedHealthcare · Cigna · Medicare

NYU Langone's provider directory lists only **Aetna, NYS Health Insurance
Plan, and Oxford** — overlapping with our list on Aetna alone.

If the site's list is wrong, a patient checks it, books, arrives, and receives
an out-of-network bill they had every reason not to expect. Ask whoever handles
billing, not whoever answers the phone.

- [ ] Confirmed list: ______________________________________________
- [ ] Any plans accepted for some services but not others?
- [ ] Should the site list plans at all, or say "call to verify coverage"?
      (Many practices prefer the second — it never goes stale.)

### 2. Which languages are spoken in the office?

The site says **English, French, and Spanish**. Sources disagree:

| Source                | Says                     |
| --------------------- | ------------------------ |
| This site (inherited) | English, French, Spanish |
| NYU Langone directory | English only             |
| WebMD                 | English, Spanish         |
| Healthgrades          | English, Spanish         |

**French appears in no external source.** A patient who picks this practice
because the site says French is spoken, and then arrives to find it isn't, has
been misled about their own care.

- [ ] Languages actually spoken: __________________________________
- [ ] By the physician, or by front-desk staff, or both?

### 3. Where should appointment requests be emailed?

The appointment form saves every request and emails a notification. That
address is currently unset, which means requests are stored and **nobody is
told they arrived**.

- [ ] Office email address: _______________________________________
- [ ] Who checks it, and how often? _______________________________

From `docs/BACKEND.md`: _an appointment request nobody reads is worse than no
form at all._ Before going indexed, someone at the practice has to know the
form exists and own the inbox.

### 4. Is there more than one clinician?

A WebMD listing places **Leah Miriam Lieber, MD** at Long Island Spine and
Orthopedics, and the practice is categorized under both Orthopedic Surgery and
Physical Medicine & Rehabilitation. The site currently features only
Dr. Rafiy.

- [ ] Any other physicians, PAs, NPs or physical therapists to include?
- [ ] If yes, name, credentials, and role for each: ________________

---

## Part 2 — Needed soon, does not block

### 5. How long until a patient hears back?

The form's confirmation currently says only "our staff will contact you to
confirm your visit," with no timeframe, because guessing one would be inventing
a commitment the practice has to keep.

- [ ] "Within one business day"? "Within 48 hours"? _______________

### 6. NPI number

Public data, but worth confirming rather than guessing. Look up "Rafiy" at
[npiregistry.cms.hhs.gov](https://npiregistry.cms.hhs.gov). Feeds the
structured data Google reads to connect the site to the practice's existing
listings — which measurably helps local search.

- [ ] Individual NPI (Dr. Rafiy): _________________________________
- [ ] Group NPI (the PC), if different: ___________________________

### 7. Which name should the public see?

Three variants are in play:

- **Long Island Spine and Orthopedics** — what the site displays now
- **Long Island Spine & Orthopedics, PC** — the registered legal name per CMS
- **Long Island Orthopedics** — considered during design

Whichever is chosen has to match the Google Business Profile and every
directory listing _character for character_. Inconsistent naming across the web
actively suppresses local search ranking.

- [ ] Public-facing name: _________________________________________

### 8. Confirm the basics

- [ ] Address: 87 W Old Country Rd, Hicksville, NY 11801
- [ ] Phone: (516) 433-1100
- [ ] Fax: (516) 433-1342 _(found in directory listings — confirm)_
- [ ] Hours: Mon–Fri 9:00am–5:00pm, closed weekends
- [ ] Parking: free private onsite, behind the building
- [ ] Education: SUNY Downstate Medical Center College of Medicine
      _(directories are more specific than our "State University of New York")_
- [ ] Board certification: American Board of Orthopedic Surgery
- [ ] NYU Grossman Long Island School of Medicine — current title?

**Not being added without explicit confirmation:** directories state "38 years
of experience." Years of experience, procedure counts, and outcome statistics
are exactly the claims `CLAUDE.md` forbids inventing, and directory data is
frequently stale. Confirm it directly or the site stays silent on it.

---

## Part 3 — For whoever runs the practice

### 9. Sign-off

The site publishes Dr. Rafiy's name, credentials, hospital affiliation, and
telephone number, and invites patients to submit contact details. He should see
it before it becomes findable.

- [ ] Dr. Rafiy has seen the site and approves it going live

### 10. Privacy policy and terms of use

`/privacy` and `/terms` exist but are **not finished documents**. The sections
that state a legal position render a visible "not yet published" note rather
than invented terms. The factual sections accurately describe what the code
does with submitted data.

Before patients are submitting contact details, counsel familiar with New York
healthcare marketing should write the rest. The practice's malpractice carrier
often provides this or can recommend someone.

- [ ] Counsel identified: _________________________________________

### 11. HIPAA determination

The form collects a name, telephone number, email, and reason for visit against
a named physician's office. Whether that constitutes PHI for this practice is a
question for their compliance advisor or malpractice carrier — not one to
answer by reading a blog post.

Business associate agreements with Neon (database), Resend (email), and Vercel
(hosting) are the conservative path. `docs/BACKEND.md` describes exactly what
data is collected, where it is stored, how it is encrypted, and when it is
deleted — hand that document over rather than paraphrasing it.

- [ ] Advisor asked: ______________________________________________

### 12. Google Business Profile

**This matters more for getting patients than the website does.**

The practice is already listed on WebMD, Healthgrades, Vitals, Doximity and
others, which means Google has almost certainly auto-generated a Business
Profile from that data — unclaimed, and possibly with wrong details that nobody
can correct until it is claimed.

Search "Long Island Spine and Orthopedics Hicksville." If it says _"Own this
business?"_, it is unclaimed.

- [ ] Profile claimed and verified
- [ ] Website URL added, pointing at the new site
- [ ] Name, address, phone match the site exactly, character for character
- [ ] Hours, services, and accepted insurance filled in
- [ ] Real photos added: building exterior (so patients find the door),
      interior, and Dr. Rafiy
- [ ] Duplicate listings checked for — a practice listing and a separate
      practitioner listing are both fine, two of either splits the reviews
      and suppresses ranking

Once the site is live, the new URL also needs updating on each directory
listing above.
