import type { Metadata } from 'next'
import { LegalDocumentPage } from '@/components/site/LegalDocument'
import { termsOfUse } from '@/content/legal'
import { pageMetadata } from '@/lib/metadata'

export const metadata: Metadata = pageMetadata({
  title: termsOfUse.title,
  description: termsOfUse.description,
  path: '/terms',
})

/** See the note on the privacy page — the same review is outstanding here. */
export default function TermsPage() {
  return <LegalDocumentPage document={termsOfUse} />
}
