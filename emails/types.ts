/**
 * The view model the email templates render.
 *
 * Deliberately NOT `Submission` from lib/submissions/types.ts. That type is
 * produced by a module chain that begins with `import 'server-only'`, and the
 * templates are also rendered by `npx react-email dev` and by the unit tests,
 * neither of which is a Next server context. Formatting — phone punctuation,
 * the long date, the time-window label — is resolved by the caller, so the
 * templates hold no logic that could disagree with what the admin inbox shows.
 */

export interface SubmissionEmailView {
  kind: 'appointment' | 'contact'
  reference: string
  fullName: string
  email: string
  /** E.164, for the `tel:` href. Null on an enquiry with no number given. */
  phone: string | null
  /** The same number, punctuated for reading aloud. */
  phoneDisplay: string | null
  /** Reason for visit, or the enquiry topic. */
  subject: string
  preferredDateLabel: string | null
  preferredTimeLabel: string | null
  referringPhysician: string | null
  insuranceCarrier: string | null
  /** The patient's free-text box. Office email only — never echoed back. */
  notes: string | null
  /** 'verified' | 'unverified' | 'skipped'. Shown to staff only when not clean. */
  botCheck: string | null
  submittedAtLabel: string
  /** Deep link into the admin inbox. Omitted when the site URL is unresolved. */
  adminUrl: string | null
}

export interface PracticeEmailContext {
  practiceName: string
  phoneDisplay: string
  phoneHref: string
  addressOneLine: string
  emergencyNotice: string
  /** Null until the practice commits to one — see `practice.callbackWindow`. */
  callbackWindow: string | null
  noMedicalDetail: string
}
