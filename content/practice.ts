/**
 * Single source of truth for everything the site says about the practice.
 *
 * RULES (see CLAUDE.md):
 *  - This is a real medical practice. Never add a clinical claim, credential,
 *    statistic, patient outcome or testimonial that is not supplied by the
 *    practice itself.
 *  - Every string here is copy that was already live on the static site, kept
 *    verbatim through the Next.js migration.
 *  - Components import from here. Do not hardcode practice facts in JSX.
 */

export type IconName =
  | 'arrowRight'
  | 'shield'
  | 'globe'
  | 'pulse'
  | 'plusCircle'
  | 'refresh'
  | 'search'
  | 'mapPin'
  | 'document'
  | 'download'
  | 'plus'

export type CareAccent = 'icon-teal' | 'icon-navy' | 'icon-gold'

export interface NavLink {
  label: string
  href: string
}

export interface Service {
  /** Stable key, also used as the React list key. */
  id: string
  title: string
  icon: IconName
  accent: CareAccent
  /** Short form, used on the homepage care grid. */
  summary: string
  /** Long form, used on /services. Identical to `summary` where the original
   *  site used the same sentence on both pages. */
  description: string
  /** Whether the homepage care grid includes this card. */
  onHomepage: boolean
}

export interface Condition {
  name: string
  description: string
  /** Rendered as "<term>: <value>" bullets under the description. */
  details: { term: string; value: string }[]
}

export interface ConditionCategory {
  id: string
  label: string
  conditions: Condition[]
}

export interface FaqItem {
  id: string
  question: string
  answer: string
}

export interface PatientForm {
  id: string
  title: string
  description: string
  /** Path under /public. */
  file: string
}

export interface Credential {
  term: string
  value: string
}

export interface TimeWindow {
  /** Stored value. Stable — it ends up in the database and in CSV exports. */
  id: string
  label: string
}

export interface HeroHighlight {
  icon: IconName
  text: string
}

export interface ApproachStep {
  number: string
  title: string
  description: string
}

const PHONE_DIGITS = '5164331100'

/**
 * Hoisted so `emergencyNotice` and `copy.forms.emergency` are the same string
 * rather than two copies that can drift. An object literal cannot reference
 * its own properties, hence the module-level const.
 */
const EMERGENCY_NOTICE = 'For medical emergencies, please call 911 immediately.'

export const practice = {
  /** Name as it appears on every page of the site today. */
  name: 'Long Island Spine and Orthopedics',
  /**
   * Registered legal name per the CMS NPPES registry: note the ampersand and
   * the "PC" suffix. UNUSED for now — changing the visible name is a Phase 3
   * branding decision, not a migration change. See CLAUDE.md.
   */
  legalName: 'Long Island Spine & Orthopedics, PC',
  shortDescription:
    'Patient-focused spine and orthopedic care in Hicksville, New York. Committed to clinical excellence and compassionate recovery.',

  /**
   * The Phase 3 identity: a typographic wordmark, not a symbol.
   *
   * Every lockup is outlined paths — no font file is needed to render one, and
   * they are pixel-identical wherever they land. Dimensions are the files' own
   * viewBoxes; no two share an aspect ratio, so anything rendering these must
   * pass both and let one axis stay `auto`.
   *
   * `alt` is empty for the wordmark on purpose. It is always inside a link to
   * the homepage whose accessible name already says the practice name, and a
   * second copy would make a screen reader announce it twice. The monogram
   * carries a real alt because it appears without that context.
   *
   * `prefix`/`emphasis` survive only for the two archived Phase 2 previews,
   * which set the name as text in their own typefaces. Nothing on the real
   * site uses them now — the wordmark contains the name.
   */
  brand: {
    prefix: 'Long Island',
    emphasis: 'Spine and Orthopedics',
    wordmark: {
      src: '/brand/wordmark.svg',
      width: 929.4,
      height: 139.2,
      alt: '',
    },
    wordmarkStacked: {
      src: '/brand/wordmark-stacked.svg',
      width: 501.8,
      height: 267.7,
      alt: '',
    },
    monogram: {
      src: '/brand/monogram.svg',
      width: 165.9,
      height: 165.9,
      alt: 'Long Island Spine and Orthopedics',
    },
  },

  physician: {
    name: 'Dr. Philip M. Rafiy, MD',
    shortName: 'Dr. Philip M. Rafiy',
    specialty: 'Spine and Orthopedic Surgery',
    bio: 'Dr. Philip M. Rafiy is an experienced orthopedic surgeon specializing in spine surgery and adult musculoskeletal care. He is committed to helping each patient understand their condition and take clear steps toward healing.',
    portrait: {
      src: '/images/dr-rafiy.webp',
      width: 1122,
      height: 1402,
      alt: 'Dr. Philip M. Rafiy, MD',
      /** The static site used a shorter alt for the two non-hero placements. */
      altShort: 'Dr. Philip M. Rafiy',
    },
  },

  credentials: [
    { term: 'Certification', value: 'American Board of Orthopedic Surgery (ABOS)' },
    { term: 'Education', value: 'MD, State University of New York' },
    {
      term: 'Academic Role',
      value: 'Adjunct Assistant Professor, NYU Grossman Long Island School of Medicine',
    },
    // UNVERIFIED: NYU Langone's provider directory lists English only. See CLAUDE.md.
    { term: 'Languages', value: 'English, French, and Spanish' },
  ] satisfies readonly Credential[],

  contact: {
    phone: {
      display: '(516) 433-1100',
      href: `tel:${PHONE_DIGITS}`,
    },
    address: {
      street: '87 W Old Country Rd',
      city: 'Hicksville',
      state: 'NY',
      zip: '11801',
      get cityStateZip() {
        return `${this.city}, ${this.state} ${this.zip}`
      },
      get oneLine() {
        return `${this.street}, ${this.city}, ${this.state} ${this.zip}`
      },
    },
    mapsUrl:
      'https://www.google.com/maps/search/?api=1&query=87+W+Old+Country+Rd%2C+Hicksville%2C+NY+11801',
    mapEmbedUrl:
      'https://www.google.com/maps?q=87+W+Old+Country+Rd,+Hicksville,+NY+11801&output=embed',
    parking: 'Free private onsite parking is available directly behind the building.',
  },

  hours: {
    rows: [
      { days: 'Monday–Friday', time: '9:00am–5:00pm' },
      { days: 'Saturday–Sunday', time: 'Closed' },
    ],
    /** Condensed form used in the footer. */
    summary: 'Office Hours: M–F 9am–5pm',
  },

  /**
   * [PLACEHOLDER: callback window] How long a patient waits for a call back
   * after submitting an appointment request — "within one business day", or
   * whatever the front desk actually commits to.
   *
   * NULL until the practice states it. The appointment form's success panel
   * and the patient confirmation email both branch on this: with a value they
   * say how long; without one they fall back to the copy the site has always
   * used ("our staff will contact you to confirm your visit"), which is true
   * without promising a timeframe nobody has agreed to. Setting it is a
   * one-line change here and both surfaces pick it up.
   */
  callbackWindow: null as string | null,

  officeExterior: {
    src: '/images/office-exterior.jpg',
    width: 597,
    height: 335,
    alt: 'Long Island Spine and Orthopedics office exterior in Hicksville, NY',
  },

  nav: [
    { label: 'Care and services', href: '/services' },
    { label: 'Meet Dr. Rafiy', href: '/about' },
    { label: 'Our practice', href: '/about#practice' },
    { label: 'FAQ', href: '/patient-info#faq' },
    { label: 'Visit us', href: '/visit' },
  ] satisfies readonly NavLink[],

  navCta: { label: 'Request an appointment', href: '/visit#appointment' },

  /**
   * Also the source of every inner page's `<h1>` — see lib/pageTitle.ts, which
   * throws at build time for a route with no label here. Adding a page means
   * adding its label to this list.
   */
  footerLinks: [
    { label: 'Care and Services', href: '/services' },
    { label: 'Meet Dr. Rafiy', href: '/about' },
    { label: 'Patient Resources', href: '/patient-info' },
    { label: 'Visit Hicksville', href: '/visit' },
    { label: 'Contact the Office', href: '/contact' },
  ] satisfies readonly NavLink[],

  /**
   * Kept out of `footerLinks` so they do not become `<h1>`s or sit in the
   * practice navigation — they render as a separate fine-print row. Their page
   * headings come from content/legal.ts instead.
   */
  legalLinks: [
    { label: 'Privacy Notice', href: '/privacy' },
    { label: 'Terms of Use', href: '/terms' },
  ] satisfies readonly NavLink[],

  trustStatements: [
    '“Evidence-based care for spine, orthopedic, and musculoskeletal needs.”',
    '“Clear communication from your first visit through recovery.”',
    '“Individualized treatment options built around your life.”',
  ],

  services: [
    {
      id: 'spine',
      title: 'Spine Care and Microsurgery',
      icon: 'pulse',
      accent: 'icon-teal',
      summary:
        'Specialized evaluation for complex spinal conditions, from herniated discs to spinal stenosis decompression.',
      description:
        'Specialized evaluation for complex spinal conditions. From herniated discs to spinal stenosis, we provide surgical and non-surgical pathways designed for your comfort and long-term function.',
      onHomepage: true,
    },
    {
      id: 'orthopedic',
      title: 'Orthopedic Medicine',
      icon: 'plusCircle',
      accent: 'icon-navy',
      summary:
        'Comprehensive care for knee and hip, shoulder repair, fracture care, and adult musculoskeletal conditions.',
      description:
        'Comprehensive care for adult musculoskeletal conditions and mobility concerns, including knee and hip, shoulder repair, and fracture care.',
      onHomepage: true,
    },
    {
      id: 'rehabilitation',
      title: 'Rehabilitation Planning',
      icon: 'refresh',
      accent: 'icon-gold',
      summary:
        'Safe recovery protocols built around post-operative milestones or conservative management strategies.',
      description:
        'Safe recovery protocols built around post-operative milestones or conservative management strategies.',
      onHomepage: true,
    },
    {
      id: 'second-opinions',
      title: 'Second Opinions',
      icon: 'search',
      accent: 'icon-teal',
      summary:
        'Seeking clarity before a major procedure? We review existing diagnostic imaging and treatment proposals to give you the confidence you deserve.',
      description:
        'Seeking clarity before a major procedure? We review existing diagnostic imaging and treatment proposals to give you the confidence you deserve.',
      onHomepage: false,
    },
  ] satisfies readonly Service[],

  conditionCategories: [
    {
      id: 'spine',
      label: 'Spine',
      conditions: [
        {
          name: 'Herniated Disc',
          description:
            'Soft center of a spinal disc pushes through a tear in the outer ring, compressing nerves.',
          details: [
            { term: 'Symptoms', value: 'Sciatica, leg pain, numbness' },
            { term: 'Approaches', value: 'PT, injections, microdiscectomy' },
          ],
        },
        {
          name: 'Spinal Stenosis',
          description: 'Narrowing of spinal spaces restricting the spinal cord and nerve roots.',
          details: [
            { term: 'Symptoms', value: 'Cramping when walking, stiffness' },
            { term: 'Approaches', value: 'Injections, surgical decompression' },
          ],
        },
        {
          name: 'Degenerative Disc Disease',
          description:
            'Gradual wearing down of spinal discs, resulting in loss of shock absorption.',
          details: [
            { term: 'Symptoms', value: 'Ache worse with sitting or bending' },
            { term: 'Approaches', value: 'Facet blocks, stabilization therapy' },
          ],
        },
      ],
    },
    {
      id: 'joints',
      label: 'Joints',
      conditions: [
        {
          name: 'Knee Osteoarthritis',
          description:
            'Cartilage breakdown in the knee joint leads to pain, stiffness, and reduced mobility.',
          details: [
            { term: 'Symptoms', value: 'Joint pain, swelling, stiffness after rest' },
            { term: 'Approaches', value: 'PT, injections, activity modification' },
          ],
        },
        {
          name: 'Rotator Cuff Injury',
          description: 'Strain or tearing of the shoulder tendons that stabilize the joint.',
          details: [
            { term: 'Symptoms', value: 'Shoulder weakness, pain with overhead motion' },
            { term: 'Approaches', value: 'PT, bracing, surgical repair' },
          ],
        },
        {
          name: 'Hip Impingement',
          description:
            'Abnormal contact between the hip ball and socket limits comfortable range of motion.',
          details: [
            { term: 'Symptoms', value: 'Groin pain, stiffness with hip flexion' },
            { term: 'Approaches', value: 'PT, activity modification, injections' },
          ],
        },
      ],
    },
    {
      id: 'nonsurgical',
      label: 'Non-Surgical',
      conditions: [
        {
          name: 'Physical Therapy & Bracing',
          description: 'Guided exercise and supportive bracing to restore strength and stability.',
          details: [{ term: 'Best for', value: 'Early-stage joint and spine conditions' }],
        },
        {
          name: 'Joint & Epidural Injections',
          description:
            'Targeted corticosteroid or anti-inflammatory injections to reduce pain and swelling.',
          details: [{ term: 'Best for', value: 'Localized inflammation or nerve irritation' }],
        },
        {
          name: 'Activity Modification',
          description:
            'A tailored home exercise and lifestyle plan to manage symptoms conservatively.',
          details: [{ term: 'Best for', value: 'Mild or chronic musculoskeletal concerns' }],
        },
      ],
    },
  ] satisfies readonly ConditionCategory[],

  approachSteps: [
    {
      number: '01',
      title: 'Start with a conversation',
      description:
        'Call our office to request an appointment and let us know how we can best support you.',
    },
    {
      number: '02',
      title: 'Get a focused evaluation',
      description:
        'We listen carefully, review your concerns, and work toward a clear understanding of your condition.',
    },
    {
      number: '03',
      title: 'Move forward with a plan',
      description:
        'Together, we discuss treatment options and identify practical next steps for recovery and mobility.',
    },
  ] satisfies readonly ApproachStep[],

  forms: [
    {
      id: 'new-patient-registration',
      title: 'New Patient Registration',
      description: 'Required demographic and insurance information for your first visit.',
      file: '/forms/new_patient_registration.pdf',
    },
    {
      id: 'medical-history',
      title: 'Medical History',
      description: 'Symptoms, prior surgeries, diagnoses, and current medications.',
      file: '/forms/medical_history.pdf',
    },
    {
      id: 'hipaa-privacy-notice',
      title: 'HIPAA Privacy Notice',
      description: 'How we handle and protect your patient records.',
      file: '/forms/hipaa_privacy_notice.pdf',
    },
  ] satisfies readonly PatientForm[],

  /**
   * UNVERIFIED. The site has asserted these five carriers since before the
   * migration, but NYU Langone's provider directory for Dr. Rafiy lists only
   * three, overlapping on Aetna alone. Confirm with the practice's billing
   * office before launch — a wrong list produces surprise out-of-network
   * bills. See CLAUDE.md.
   */
  insuranceCarriers: ['Aetna', 'BlueCross BlueShield', 'UnitedHealthcare', 'Cigna', 'Medicare'],

  faq: [
    {
      id: 'faq-hours',
      question: 'What are your office hours?',
      answer:
        'Our Hicksville office is open Monday through Friday, 9:00 AM to 5:00 PM. We are closed on weekends.',
    },
    {
      id: 'faq-insurance',
      question: 'Do you accept my insurance?',
      answer:
        'We accept most major plans, including Aetna, BlueCross BlueShield, UnitedHealthcare, Cigna, and Medicare. Call our office at (516) 433-1100 to confirm your specific coverage.',
    },
    {
      id: 'faq-first-appointment',
      question: 'What should I bring to my first appointment?',
      answer:
        'Please bring a photo ID, your insurance card, and any completed patient forms. You can download and fill out our New Patient Registration and Medical History forms above ahead of time.',
    },
    {
      id: 'faq-parking',
      question: 'Is parking available at your office?',
      answer:
        'Yes. There is free patient parking directly behind our Hicksville building at 87 W Old Country Rd.',
    },
    {
      id: 'faq-languages',
      question: 'What languages does your office speak?',
      answer: 'Dr. Rafiy and our staff can assist patients in English, French, and Spanish.',
    },
    {
      id: 'faq-second-opinion',
      question: 'Can I get a second opinion without switching doctors?',
      answer:
        'Yes. We regularly review outside imaging and treatment proposals to give patients clarity before a major procedure, with no obligation to transfer your ongoing care.',
    },
  ] satisfies readonly FaqItem[],

  appointmentReasons: [
    'Spine Consultation',
    'Orthopedic Evaluation',
    'Second Opinion',
    'Follow-up Care',
  ],

  /**
   * Preferred time windows offered on the appointment form.
   *
   * Derived arithmetically from the published office hours above (9:00am–5:00pm,
   * Monday–Friday) — these are not a claim about appointment availability, and
   * the form says so: a request is not a confirmed slot. `id` is the value that
   * reaches the database and the CSV export, so it must stay stable even if a
   * label is reworded.
   */
  appointmentTimeWindows: [
    { id: 'morning', label: 'Morning (9:00am–12:00pm)' },
    { id: 'midday', label: 'Midday (12:00pm–2:00pm)' },
    { id: 'afternoon', label: 'Afternoon (2:00pm–5:00pm)' },
    { id: 'any', label: 'No preference' },
  ] satisfies readonly TimeWindow[],

  /**
   * Topics on the general-inquiry form. Deliberately administrative: none of
   * them invites a clinical question, because nothing here is a clinical
   * channel. "Something else" is the catch-all rather than a medical option.
   */
  contactTopics: [
    'Appointment or scheduling',
    'Billing or insurance',
    'Patient forms or paperwork',
    'Something else',
  ],

  /**
   * Registry identifiers used by the JSON-LD in components/site/StructuredData.tsx.
   *
   * Both are NULL on purpose and both are launch blockers.
   *
   * [PLACEHOLDER: NPI] — BUILD-BRIEF.md Part 0 lists the NPI as "still needed
   * before launch". The CMS NPPES registry is where it comes from; the number
   * itself was never recorded in this repo. A wrong NPI in structured data
   * attaches the practice's search presence to another clinician, so the
   * builder OMITS the `identifier` property entirely while this is null rather
   * than emitting a guess or an empty string.
   *
   * [PLACEHOLDER: geo coordinates] — same rule. Coordinates for
   * 87 W Old Country Rd have to be read off the practice's own Google Business
   * Profile (Part 6, Step 6) so the pin the site claims and the pin Google
   * already shows are the same point. Until then `geo` is omitted from the
   * markup; `address` and `hasMap` carry the location on their own and are
   * enough for Google to geocode.
   */
  identifiers: {
    npi: null as string | null,
    geo: null as { latitude: number; longitude: number } | null,
  },

  /** UNVERIFIED language claim — see `credentials` above and CLAUDE.md. */
  heroHighlights: [
    { icon: 'shield', text: 'Board Certified — ABOS Orthopedic Surgery' },
    { icon: 'globe', text: 'English, French and Spanish Spoken' },
  ] satisfies readonly HeroHighlight[],

  emergencyNotice: EMERGENCY_NOTICE,

  /**
   * Section prose reused across more than one page. Page-specific one-off
   * prose lives with its page; anything repeated lives here so a redesign
   * changes it in exactly one place.
   */
  copy: {
    hero: {
      eyebrow: 'Patient-Centered Orthopedic Care',
      headingLead: 'Care that helps you return to ',
      headingEmphasis: 'what moves you.',
      intro:
        'Clear answers, thoughtful treatment, and a plan designed around your goals. Long Island Spine and Orthopedics provides focused spine and orthopedic care in Hicksville.',
      primaryCta: 'Request an appointment',
    },
    careSection: {
      eyebrow: 'Clinical Focus',
      heading: 'Expertise built for stability.',
      body: 'We take time to understand your symptoms, explain your options in plain language, and help you take the next step with confidence.',
      allServicesLink: 'See all care and services',
    },
    conditionsGuide: {
      eyebrow: 'Reference Guide',
      heading: 'Treated Conditions',
      body: 'Explore common musculoskeletal conditions and typical treatment approaches provided at our practice.',
      tablistLabel: 'Condition categories',
    },
    physicianSection: {
      eyebrow: 'The Physician',
      heading: 'Clinical experience you can trust.',
      cta: 'Meet Dr. Rafiy',
    },
    approachSection: {
      eyebrow: 'Our Approach',
      heading: 'A straightforward path to care.',
      body: 'You deserve to understand what is happening and what comes next. Our team is here to make each part of your care feel more manageable.',
      cta: 'Speak with our office',
    },
    visitSection: {
      eyebrow: 'Hicksville Clinic',
      heading: 'Convenient care, close to home.',
      homeBody:
        'Our office is easy to reach with free onsite patient parking behind the building. Visit our office page for hours, directions, and to request an appointment.',
      homeCta: 'Visit us in Hicksville',
    },
    appointmentCta: {
      eyebrow: 'Get Started',
      heading: 'Ready to schedule a consultation?',
      body: 'Request an appointment online or contact our Hicksville office to speak with our staff.',
      buttonLabel: 'Request an appointment',
      callPrefix: 'Or call us at',
    },
    appointmentForm: {
      eyebrow: 'Schedule Visit',
      heading: 'Request an appointment',
      body: 'Complete the form and our staff will contact you to confirm your visit.',
      submitLabel: 'Request Appointment',
      submittingLabel: 'Sending…',
      successLabel: 'Request received ✓',
      reasonPlaceholder: 'Select a reason…',
      timeWindowPlaceholder: 'Select a time…',
      weekendMessage: 'Office is closed on weekends. Please choose a weekday.',
      successHeading: 'Request received',
      /**
       * Deliberately explicit that this is not a booking. Before Phase 4 the
       * form showed `successLabel` while transmitting nothing at all, so a
       * patient could reasonably believe a request had been sent. It is now
       * true — and the "not a confirmed appointment" line is what keeps it
       * from over-promising in the other direction.
       */
      successNotAppointment:
        'This is a request, not a confirmed appointment. Nothing is scheduled until our office speaks with you.',
      successCheckEmail:
        'A confirmation of what you sent is on its way to the email address you gave us.',
      successUrgent: 'If your situation cannot wait, please call the office directly.',
      errorHeading: 'Your request was not sent',
      /** Shown when the submission fails for a reason the patient cannot fix. */
      errorFallback:
        'Something went wrong on our end and your request was not sent. Please call the office and we will take your request over the phone.',
      validationSummaryHeading: 'Please check the following before sending:',
    },

    /**
     * The general-inquiry form. Same pipeline as the appointment form, fewer
     * fields, and the same no-medical-detail rule on its free-text box.
     */
    contactForm: {
      eyebrow: 'General Enquiries',
      heading: 'Contact the office',
      body: 'For questions about scheduling, billing, insurance, or paperwork. Our staff will reply to the email address or phone number you provide.',
      topicPlaceholder: 'Select a topic…',
      submitLabel: 'Send Message',
      submittingLabel: 'Sending…',
      successHeading: 'Message received',
      successBody: 'Our staff will follow up using the contact details you provided.',
      errorHeading: 'Your message was not sent',
    },

    /**
     * Copy shared by both forms.
     *
     * `noMedicalDetail` is the single most important string in this file. The
     * free-text box is where a patient will type symptoms if nothing tells
     * them not to, and every extra clinical detail in that box moves the
     * practice further into territory that needs a HIPAA answer. The same
     * sentence is repeated verbatim in the privacy notice (content/legal.ts)
     * and in the office notification email, so all three cannot drift.
     */
    forms: {
      noMedicalDetail:
        'Please do not include detailed medical information. Our staff will collect that by phone.',
      emergency: EMERGENCY_NOTICE,
      optionalSuffix: '(optional)',
      requiredLegend: 'Required unless marked optional.',
      /**
       * Shown when Turnstile is configured but the browser never produced a
       * token — the JavaScript-disabled case. The patient gets a route that
       * works rather than a dead form.
       */
      unverifiedFallback:
        'We could not run the automated spam check in your browser, so this form is limited. If your request does not go through, please call the office.',
      privacyLinkLabel: 'How we handle what you send',
    },
    resourcesSection: {
      eyebrow: 'Patient Resources',
      heading: 'Patient Forms and Registration',
      body: 'Save time during your first visit by downloading and filling out our registration forms in advance.',
      downloadLabel: 'Download PDF',
    },
    insuranceSection: {
      eyebrow: 'Billing',
      heading: 'Insurance We Accept',
      body: 'We work with most major insurance plans. Please contact our office to verify your specific coverage before your visit.',
    },
    faqSection: {
      eyebrow: 'Questions',
      heading: 'Frequently Asked Questions',
      body: 'Answers to what patients ask us most before their first visit.',
    },
  },
} as const

export type Practice = typeof practice
