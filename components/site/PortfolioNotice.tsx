import { showPortfolioNotice } from '@/lib/siteMode'

/**
 * The band that says this deployment is not the practice's live site.
 *
 * OFF BY DEFAULT. Rendered only when `NEXT_PUBLIC_PORTFOLIO_NOTICE=1`, which
 * is deliberately separate from `NEXT_PUBLIC_SITE_MODE` — see the note in
 * lib/siteMode.ts. The short version: `noindex` is what actually prevents a
 * patient from reaching this deployment, and this band only speaks to someone
 * who already has. It is worth showing in exactly one case, an INDEXED
 * deployment whose appointment form is not yet staffed.
 *
 * Placed ABOVE the ActionBar and deliberately not sticky. The sticky element
 * on this site is the ActionBar, because it carries the telephone number at
 * every width down to 375px; a second sticky band would eat ~120px of a phone
 * screen, and this notice is not worth that. It scrolls away after it has been
 * read, which is the correct lifetime for a disclosure of this kind — unlike
 * the phone number, whose disappearance below 660px was a real bug on the old
 * site.
 *
 * Wording notes, since this text is load-bearing:
 *   - It says the site is a demonstration BEFORE it says anything else.
 *   - It states that the practice details are real, because they are, and a
 *     reader who assumed otherwise might dismiss a genuine phone number.
 *   - It routes anyone actually seeking care to the telephone rather than to
 *     the appointment form, which is the one path on this deployment whose
 *     other end is not guaranteed to be staffed.
 *
 * It is NOT sourced from content/practice.ts. Everything in that file is
 * practice-owned copy that the practice could be asked to approve; this is a
 * statement about the deployment, which is the developer's to make.
 */
export function PortfolioNotice() {
  if (!showPortfolioNotice) return null

  return (
    <aside aria-label="About this website" className="bg-dark text-ink-inv">
      <div className="measure flex flex-wrap items-baseline gap-x-3 gap-y-1 py-3">
        <p className="text-label text-accent-inv uppercase">Portfolio demonstration</p>
        <p className="text-meta text-ink-inv-muted">
          A student project, not the practice&rsquo;s live website. The practice and physician
          details shown are real; to reach the office, please call the telephone number below.
        </p>
      </div>
    </aside>
  )
}
