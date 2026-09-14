import type { Metadata } from 'next'

/**
 * Phase 2 preview routes.
 *
 * Intentionally thin. Each direction owns its own chrome, its own skip link
 * and its own `<main>`, because the point of the exercise is to compare three
 * complete pages — sharing a header here would hide exactly the differences
 * under review.
 */
export const metadata: Metadata = {
  title: 'Design preview',
  robots: { index: false, follow: false },
}

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return children
}
