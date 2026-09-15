/**
 * Copy for /privacy and /terms.
 *
 * READ THIS BEFORE THE SITE GOES LIVE.
 *
 * These two pages are NOT finished legal documents and must not be treated as
 * such. BUILD-BRIEF.md's pre-launch list requires "a privacy policy and terms
 * of use reviewed by counsel familiar with NY healthcare marketing", and that
 * review has not happened. What is written here splits into two kinds of text:
 *
 *  1. FACTUAL sections describing what this website actually does with what a
 *     visitor types into it. Those were written against the code in
 *     app/actions/, lib/db/ and lib/email/ and are accurate as of Phase 4. If
 *     the backend changes, these change with it — docs/BACKEND.md lists the
 *     pairs that have to move together.
 *
 *  2. `[PLACEHOLDER: …]` sections that state a legal position. Those are left
 *     empty on purpose. A privacy policy that makes up a retention commitment,
 *     a HIPAA posture or a patient-rights statement is worse than no policy at
 *     all, because the practice is then publicly bound to terms nobody chose.
 *
 * Placeholders render as a visible, plain-language "not yet published" note
 * rather than as the literal bracket text — a patient reading the page sees an
 * honest gap, and `grep -rn PLACEHOLDER` still finds every one of them.
 */

import { practice } from '@/content/practice'

export interface LegalSection {
  id: string
  heading: string
  /** Paragraphs. Rendered in order. */
  body?: readonly string[]
  /** Optional bullet list rendered after `body`. */
  bullets?: readonly string[]
  /**
   * When set, this section is awaiting counsel and renders the note instead of
   * `body`. The string is what the practice's lawyer needs to supply.
   */
  awaitingCounsel?: string
}

export interface LegalDocument {
  /** The page `<h1>`. These pages are not in `practice.footerLinks`, so they
   *  carry their own heading rather than going through lib/pageTitle.ts. */
  heading: string
  title: string
  description: string
  intro: readonly string[]
  sections: readonly LegalSection[]
}

/** Shown in place of any section still waiting on counsel. */
export const awaitingCounselNotice =
  'This section is not yet published. It is being prepared with the practice’s attorney and will appear here once it has been reviewed.'

export const privacyNotice: LegalDocument = {
  heading: 'Privacy Notice',
  title: 'Privacy Notice',
  description: `How ${practice.name} handles information submitted through this website.`,
  intro: [
    `This notice covers this website only — what happens to information you type into the forms at ${practice.name}.`,
    'It is separate from the HIPAA Notice of Privacy Practices that governs your medical record at the practice. That notice is available as a PDF on the Patient Resources page and at the front desk.',
  ],
  sections: [
    {
      id: 'do-not-send',
      heading: 'Do not send medical details through this website',
      body: [
        practice.copy.forms.noMedicalDetail,
        'The appointment request form and the contact form are scheduling and administrative tools. They are not a way to reach Dr. Rafiy for medical advice, they are not monitored continuously, and a message sent through them does not create a physician–patient relationship.',
        practice.emergencyNotice,
      ],
    },
    {
      id: 'what-we-collect',
      heading: 'What the forms collect',
      body: [
        'The appointment request form asks for your name, phone number, email address, preferred date, preferred time of day, and the reason for your visit. Referring physician, insurance carrier, and the free-text box are optional.',
        'The contact form asks for your name, email address, a topic, and your message. A phone number is optional.',
        'Both forms also record the time you submitted them and whether the automated spam check ran successfully.',
      ],
    },
    {
      id: 'what-we-do',
      heading: 'What happens to it',
      bullets: [
        'It is saved to the practice’s database so the office has a record of your request.',
        'An email goes to the office so staff can act on it.',
        'A confirmation email goes to the address you gave, so you have a copy of what you sent.',
        'The free-text box and any notes staff add afterwards are encrypted before they are stored.',
        'Office staff read submissions through a password-protected administrative page. Only addresses the practice has explicitly authorised can sign in, and each time a member of staff opens or updates a submission, that action is logged.',
      ],
    },
    {
      id: 'retention',
      heading: 'How long it is kept',
      body: [
        'Once the office marks a request as closed, it is automatically and permanently deleted ninety days later.',
        'Requests that have not been closed are kept until they are, because they are still being worked on.',
      ],
    },
    {
      id: 'third-parties',
      heading: 'Who else is involved',
      body: [
        'Running the website means a small number of service providers handle this information on the practice’s behalf. None of them are given it for their own purposes, and none of them sell it.',
      ],
      bullets: [
        'The website is hosted by Vercel.',
        'Submissions are stored in a Postgres database hosted by Neon.',
        'Email is sent by Resend.',
        'The spam check on the forms is Cloudflare Turnstile.',
        'Rate limiting, which stops the forms being flooded, uses Upstash.',
      ],
    },
    {
      id: 'ip-addresses',
      heading: 'IP addresses',
      body: [
        'To stop automated abuse, the site needs to know whether a lot of submissions are coming from one place. It does this without keeping your IP address: the address is converted into a one-way fingerprint that cannot be turned back into the original, and only the fingerprint is stored.',
      ],
    },
    {
      id: 'analytics',
      heading: 'Analytics',
      body: [
        'If page-view measurement is switched on, it is Vercel Analytics, which counts visits without cookies and without building a profile of you. This site does not use Google Analytics, advertising pixels, or third-party tracking cookies.',
      ],
    },
    {
      id: 'hipaa',
      heading: 'HIPAA and this website',
      awaitingCounsel:
        'Whether information submitted through this website is protected health information under HIPAA, and what that means for the practice’s obligations and for your rights. This depends on the practice’s compliance advice and on whether business associate agreements are in place with the hosting, database, and email providers named above.',
    },
    {
      id: 'your-rights',
      heading: 'Your choices and how to reach us',
      awaitingCounsel:
        'What a patient may ask the practice to do with information submitted through this website — see it, correct it, or have it deleted — and the New York State notification requirements that apply. Counsel should also confirm the correct address for these requests.',
    },
    {
      id: 'changes',
      heading: 'Changes to this notice',
      awaitingCounsel:
        'How the practice will tell visitors when this notice changes, and the effective-date convention to use.',
    },
    {
      id: 'contact',
      heading: 'Questions',
      body: [
        `Call the office at ${practice.contact.phone.display} during opening hours, or write to ${practice.name}, ${practice.contact.address.oneLine}.`,
      ],
    },
  ],
}

export const termsOfUse: LegalDocument = {
  heading: 'Terms of Use',
  title: 'Terms of Use',
  description: `Terms governing use of the ${practice.name} website.`,
  intro: ['These terms cover your use of this website.'],
  sections: [
    {
      id: 'not-medical-advice',
      heading: 'This website is not medical advice',
      body: [
        'Everything on this site is general information about the practice and the conditions it treats. It is not a diagnosis, not a treatment recommendation, and not a substitute for being examined by a physician. Reading it does not make you a patient of the practice.',
        'Never delay seeking care, or disregard advice you have already been given, because of something you read here.',
        practice.emergencyNotice,
      ],
    },
    {
      id: 'forms',
      heading: 'Appointment requests',
      body: [
        'Submitting the appointment request form sends a request. It does not book anything. No appointment exists until the office has spoken with you and confirmed it.',
        practice.copy.forms.noMedicalDetail,
      ],
    },
    {
      id: 'accuracy',
      heading: 'Accuracy',
      body: [
        'The practice works to keep hours, contact details, and service descriptions on this site current, but they can change. Call the office to confirm anything you are relying on — particularly insurance coverage, which should always be verified by phone before a visit.',
      ],
    },
    {
      id: 'links',
      heading: 'Links to other sites',
      body: [
        'Where this site links somewhere else, the practice does not control that destination and is not responsible for its content or its privacy practices.',
      ],
    },
    {
      id: 'content-ownership',
      heading: 'Ownership of site content',
      awaitingCounsel:
        'The practice’s copyright and trademark position on the site’s text, photography, and wordmark, and what visitors may do with it.',
    },
    {
      id: 'liability',
      heading: 'Limitation of liability and disclaimers',
      awaitingCounsel:
        'The warranty disclaimer and limitation of liability. New York has specific requirements here, and this is the section most likely to be unenforceable if it is copied from a generic template.',
    },
    {
      id: 'governing-law',
      heading: 'Governing law and disputes',
      awaitingCounsel:
        'Choice of law, venue, and whether the practice wants an arbitration or class-action-waiver clause at all.',
    },
    {
      id: 'accessibility',
      heading: 'Accessibility',
      body: [
        'This site is built to meet WCAG 2.1 AA, with body text held to the stricter AAA contrast level. If any part of it is difficult for you to use, call the office and staff will help you directly and pass the problem on so it can be fixed.',
      ],
    },
  ],
}
