import type { Metadata } from 'next'
import { LegalDocumentPage } from '@/components/site/LegalDocument'
import { privacyNotice } from '@/content/legal'
import { pageMetadata } from '@/lib/metadata'

export const metadata: Metadata = pageMetadata({
  title: privacyNotice.title,
  description: privacyNotice.description,
  path: '/privacy',
})

/**
 * NOT A FINISHED LEGAL DOCUMENT. Several sections are held awaiting review by
 * counsel familiar with NY healthcare marketing — see the header comment in
 * content/legal.ts and the launch blockers in docs/BACKEND.md. The sections
 * that ARE written describe what the code in app/actions/ and lib/ actually
 * does, and have to be revisited whenever that changes.
 */
export default function PrivacyPage() {
  return <LegalDocumentPage document={privacyNotice} />
}
