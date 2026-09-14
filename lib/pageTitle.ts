import { practice } from '@/content/practice'

/**
 * The page title for a route, taken from the existing footer link labels.
 *
 * Inner pages need an `<h1>` and the practice has not supplied page titles, so
 * rather than invent any this reuses the labels already on the site. A lookup
 * rather than `footerLinks[0].label` because `footerLinks` is declared with
 * `satisfies readonly NavLink[]`, which widens the tuple to an array and makes
 * every index possibly-undefined under `noUncheckedIndexedAccess`.
 *
 * Throwing on a miss is deliberate: every route is statically prerendered, so
 * a renamed href fails the build instead of shipping an empty heading.
 */
export function pageTitle(href: string): string {
  const link = practice.footerLinks.find((candidate) => candidate.href === href)
  if (!link) throw new Error(`No footer link label for "${href}" — cannot derive an <h1>.`)
  return link.label
}
