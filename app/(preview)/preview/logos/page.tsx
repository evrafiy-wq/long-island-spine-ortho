import type { Metadata } from 'next'
import Link from 'next/link'
import { ChromeInSitu } from '@/components/preview/logos/ChromeInSitu'
import { Lockup, widthAt } from '@/components/preview/logos/Lockup'
import {
  DIRECTIONS,
  HEADER_NAV_WIDTH,
  headerSpaceAt,
  minViewportForHeader,
} from '@/components/preview/logos/logoSet'
import { cx } from '@/lib/cx'

export const metadata: Metadata = {
  title: 'Logo directions',
  robots: { index: false, follow: false },
}

/**
 * Phase 3 review page. Four wordmark directions, at the sizes and on the
 * grounds they actually have to survive.
 *
 * Unlike the Phase 2 index this page uses the real token vocabulary rather than
 * literal arbitrary values, because two of its sections ARE the real chrome —
 * comparing a candidate against the site's own hairlines and greys is the point.
 *
 * Delete this route, components/preview/logos, and the unchosen files in
 * public/logos once a direction is picked.
 */

const HEADER_HEIGHT = 32

/**
 * A specimen ground. `overflow-x-auto` rather than a shrink-to-fit: a logo
 * shown at the wrong aspect ratio is worse than a logo you have to scroll,
 * and at 200px tall the widest lockup here is over 3,000px across.
 */
function Swatch({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div
      className={cx(
        'flex min-h-24 items-center overflow-x-auto px-6 py-6',
        dark ? 'bg-dark' : 'border border-hairline bg-canvas',
      )}
    >
      {children}
    </div>
  )
}

function Caption({ children }: { children: React.ReactNode }) {
  return <p className="pt-2 text-label text-ink-muted uppercase">{children}</p>
}

export default function LogoPreviewPage() {
  return (
    <main id="main-content" className="bg-canvas pb-[var(--spacing-block)]">
      <div className="measure pt-12">
        <p className="text-label text-ink-muted uppercase">Build brief · Phase 3</p>
        <h1 className="pt-4 font-display text-display text-ink">Four wordmark directions</h1>
        <p className="max-w-lede pt-6 text-lede text-ink-muted">
          All four set the name in full —{' '}
          <strong className="text-ink">Long Island Spine and Orthopedics</strong> — as you
          confirmed. None of them uses an abbreviation anywhere, in any lockup.
        </p>

        <p className="max-w-reading pt-6 text-body text-ink">
          <Link
            href="/preview/logos/marks"
            className="font-semibold underline decoration-accent underline-offset-4 hover:text-accent"
          >
            LISP lettermarks for Direction 3 &rarr;
          </Link>{' '}
          — six display serifs, four arrangements, with a favicon test and a look at what those four
          letters spell.
        </p>

        <div className="grid gap-x-10 gap-y-6 pt-10 md:grid-cols-2">
          <section aria-labelledby="what-changed">
            <h2 id="what-changed" className="text-subtitle text-ink">
              What this replaces
            </h2>
            <p className="max-w-reading pt-3 text-body text-ink-muted">
              The current <code className="text-meta">logo.svg</code> is a circular badge carrying a
              medical cross, a teal arc, four blue dots and a yellow wrench across five colours. It
              is still in place on every page; nothing here has been swapped in yet.
            </p>
          </section>
          <section aria-labelledby="licensing">
            <h2 id="licensing" className="text-subtitle text-ink">
              Typeface licensing
            </h2>
            <p className="max-w-reading pt-3 text-body text-ink-muted">
              Every typeface used here is under the{' '}
              <strong className="text-ink">SIL Open Font License 1.1</strong>, confirmed against the
              OFL.txt shipped in each font&rsquo;s own repository. The OFL permits commercial use
              and explicitly permits outlining glyphs into a logo; there is no royalty, no
              registration and no attribution requirement on the mark itself. All type below is
              already converted to paths, so no font file is needed to render it.
            </p>
          </section>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      <section aria-labelledby="compare" className="measure pt-[var(--spacing-block)]">
        <h2 id="compare" className="font-display text-title text-ink">
          Side by side
        </h2>
        <p className="max-w-reading pt-3 text-body text-ink-muted">
          Same rendered height, same ground. Widths differ because the lockups do — that difference
          is the single biggest practical distinction between them.
        </p>

        <h3 className="pt-10 text-subtitle text-ink">Horizontal lockup at 40px tall</h3>
        <div className="pt-4">
          {DIRECTIONS.map((direction) => (
            <div
              key={direction.id}
              className="flex items-center gap-x-8 overflow-x-auto border-t border-hairline py-6"
            >
              <span className="w-24 shrink-0 text-label text-ink-muted uppercase">
                {direction.n} · {direction.name}
              </span>
              <Lockup
                direction={direction}
                lockup="horizontal"
                height={40}
                alt={`Direction ${direction.n}, ${direction.name}, horizontal lockup`}
              />
              <span className="text-meta text-ink-muted">
                {widthAt(direction, 'horizontal', 40)}px wide
              </span>
            </div>
          ))}
        </div>

        <h3 className="pt-10 text-subtitle text-ink">Horizontal lockup at 24px tall</h3>
        <div className="pt-4">
          {DIRECTIONS.map((direction) => (
            <div
              key={direction.id}
              className="flex items-center gap-x-8 overflow-x-auto border-t border-hairline py-5"
            >
              <span className="w-24 shrink-0 text-label text-ink-muted uppercase">
                {direction.n} · {direction.name}
              </span>
              <Lockup
                direction={direction}
                lockup="horizontal"
                height={24}
                alt={`Direction ${direction.n} at 24 pixels tall`}
              />
            </div>
          ))}
        </div>

        <h3 className="pt-10 text-subtitle text-ink">Reversed, on the site&rsquo;s dark ground</h3>
        <div className="mt-4 bg-dark px-6 py-2">
          {DIRECTIONS.map((direction) => (
            <div
              key={direction.id}
              className="flex items-center gap-x-8 overflow-x-auto border-t border-ink-inv-muted/25 py-6 first:border-t-0"
            >
              <span className="w-24 shrink-0 text-label text-ink-inv-muted uppercase">
                {direction.n} · {direction.name}
              </span>
              <Lockup
                direction={direction}
                lockup="horizontal"
                variant="-reversed"
                height={40}
                alt={`Direction ${direction.n} reversed out of a dark ground`}
              />
            </div>
          ))}
        </div>

        <h3 className="pt-10 text-subtitle text-ink">Does it fit the header?</h3>
        <p className="max-w-reading pt-3 text-body text-ink-muted">
          The desktop nav appears at 1024px and is {HEADER_NAV_WIDTH}px wide, which leaves{' '}
          {headerSpaceAt(1024)}px for the wordmark there and {headerSpaceAt(1440)}px at 1440. Two of
          these lockups do not fit that gap at 32px until well past the breakpoint that introduces
          it.
        </p>
        <div className="overflow-x-auto pt-5">
          <table className="w-full min-w-[34rem] text-meta">
            <thead>
              <tr className="border-b border-hairline text-left text-label text-ink-muted uppercase">
                <th scope="col" className="py-3 pr-6 font-semibold">
                  Direction
                </th>
                <th scope="col" className="py-3 pr-6 font-semibold">
                  Width at 32px
                </th>
                <th scope="col" className="py-3 pr-6 font-semibold">
                  Fits beside the nav from
                </th>
              </tr>
            </thead>
            <tbody>
              {DIRECTIONS.map((direction) => {
                const min = minViewportForHeader(direction, HEADER_HEIGHT)
                return (
                  <tr key={direction.id} className="border-b border-hairline">
                    <th scope="row" className="py-3 pr-6 text-left font-semibold text-ink">
                      {direction.n} · {direction.name}
                    </th>
                    <td className="py-3 pr-6 text-ink">
                      {widthAt(direction, 'horizontal', HEADER_HEIGHT)}px
                    </td>
                    <td className={cx('py-3 pr-6', min > 1280 ? 'text-danger' : 'text-ink')}>
                      {min}px{min > 1280 ? ' — wide desktops only' : ''}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <h3 className="pt-10 text-subtitle text-ink">Monograms at favicon sizes</h3>
        <div className="flex flex-wrap gap-10 pt-6">
          {DIRECTIONS.map((direction) => (
            <div key={direction.id}>
              <div className="flex items-end gap-4 border border-hairline px-5 py-5">
                {[16, 32, 64].map((size) => (
                  <Lockup
                    key={size}
                    direction={direction}
                    lockup="mark"
                    height={size}
                    alt={`Direction ${direction.n} monogram at ${size} pixels`}
                  />
                ))}
              </div>
              <Caption>
                {direction.n} · {direction.name}
              </Caption>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {DIRECTIONS.map((direction) => (
        <section
          key={direction.id}
          aria-labelledby={direction.id}
          className="pt-[var(--spacing-block)]"
        >
          <div className="measure">
            <h2 id={direction.id} className="font-display text-title text-ink">
              {direction.n} — {direction.name}
            </h2>
            <p className="max-w-reading pt-4 text-body text-ink">{direction.thesis}</p>

            <dl className="grid gap-x-8 gap-y-3 pt-8 text-meta sm:grid-cols-[9rem_1fr]">
              {(
                [
                  ['Typeface', direction.typeface],
                  ['Licence', direction.license],
                  ['Instance', direction.instance],
                  [
                    'Lockup ratios',
                    `horizontal ${(direction.lockups.horizontal.w / direction.lockups.horizontal.h).toFixed(1)}:1 · stacked ${(direction.lockups.stacked.w / direction.lockups.stacked.h).toFixed(1)}:1`,
                  ],
                ] as const
              ).map(([term, value]) => (
                <div key={term} className="contents">
                  <dt className="text-ink-muted uppercase">{term}</dt>
                  <dd className="text-ink">{value}</dd>
                </div>
              ))}
            </dl>

            <h3 className="pt-10 text-subtitle text-ink">At size</h3>
            <div className="pt-4">
              <Swatch>
                <Lockup
                  direction={direction}
                  lockup="horizontal"
                  height={200}
                  alt={`Direction ${direction.n} horizontal lockup at 200 pixels tall`}
                />
              </Swatch>
              <Caption>
                Horizontal · 200px tall · {widthAt(direction, 'horizontal', 200)}px wide — scroll to
                read it all
              </Caption>
            </div>
            <div className="grid gap-6 pt-6 lg:grid-cols-2">
              <div>
                <Swatch>
                  <Lockup
                    direction={direction}
                    lockup="stacked"
                    height={140}
                    alt={`Direction ${direction.n} stacked lockup`}
                  />
                </Swatch>
                <Caption>Stacked · 140px tall · footer and print</Caption>
              </div>
              <div>
                <Swatch dark>
                  <Lockup
                    direction={direction}
                    lockup="stacked"
                    variant="-reversed"
                    height={96}
                    alt={`Direction ${direction.n} stacked lockup reversed`}
                  />
                </Swatch>
                <Caption>Stacked, reversed white</Caption>
              </div>
              <div>
                <Swatch>
                  <Lockup
                    direction={direction}
                    lockup="horizontal"
                    variant="-black"
                    height={44}
                    alt={`Direction ${direction.n} in monochrome black`}
                  />
                </Swatch>
                <Caption>Monochrome black — fax, stamp, single-colour print</Caption>
              </div>
            </div>

            <h3 className="pt-10 text-subtitle text-ink">Monogram</h3>
            <p className="max-w-reading pt-3 text-body text-ink-muted">{direction.markNote}</p>
            <div className="flex flex-wrap gap-6 pt-5">
              <div>
                <div className="flex items-end gap-5 border border-hairline px-6 py-6">
                  {[16, 32, 64, 120].map((size) => (
                    <Lockup
                      key={size}
                      direction={direction}
                      lockup="mark"
                      height={size}
                      alt={`Direction ${direction.n} monogram at ${size} pixels`}
                    />
                  ))}
                </div>
                <Caption>16 · 32 · 64 · 120px</Caption>
              </div>
              <div>
                <div className="flex items-end gap-5 bg-dark px-6 py-6">
                  {[16, 32, 64, 120].map((size) => (
                    <Lockup
                      key={size}
                      direction={direction}
                      lockup="mark"
                      variant="-reversed"
                      height={size}
                      alt={`Direction ${direction.n} monogram reversed at ${size} pixels`}
                    />
                  ))}
                </div>
                <Caption>Reversed</Caption>
              </div>
            </div>

            <h3 className="pt-10 text-subtitle text-ink">In the site header</h3>
            <p className="max-w-reading pt-3 text-body text-ink-muted">
              The real action bar and header chrome, wordmark at {HEADER_HEIGHT}px — which makes
              this lockup {widthAt(direction, 'horizontal', HEADER_HEIGHT)}px wide, against nav that
              needs roughly 640px.
            </p>
          </div>

          <div className="pt-5">
            <ChromeInSitu direction={direction} lockup="horizontal" height={HEADER_HEIGHT} />
          </div>

          <div className="measure pt-8">
            <p className="max-w-reading text-body text-ink-muted">
              At 375px the horizontal lockup cannot fit beside the menu button, so the narrow case
              uses the stacked lockup instead.
            </p>
            <div className="pt-5">
              <ChromeInSitu direction={direction} lockup="stacked" height={42} frame={375} />
            </div>

            <h3 className="pt-10 text-subtitle text-ink">What it gives up</h3>
            <p className="max-w-reading pt-3 text-body text-ink-muted">{direction.gives}</p>
          </div>
        </section>
      ))}

      {/* ------------------------------------------------------------------ */}
      <section aria-labelledby="after" className="measure pt-[var(--spacing-block)]">
        <h2 id="after" className="font-display text-title text-ink">
          Once you pick one
        </h2>
        <p className="max-w-reading pt-4 text-body text-ink-muted">
          Nothing below has been done yet — the site still ships the old badge.
        </p>
        <ul className="pt-6">
          {[
            'favicon.ico plus 32, 180, 192 and 512px PNGs, apple-touch-icon and site.webmanifest, generated from the chosen monogram.',
            'An OpenGraph image at 1200×630, and the OpenGraph and Twitter metadata to point at it — app/layout.tsx currently declares neither.',
            'practice.brand.logo repointed, and the header lockup rebuilt: the wordmark already contains the name, so the icon-plus-two-lines arrangement in SiteHeader becomes redundant.',
            'The unchosen candidates deleted from public/logos, along with this route and components/preview/logos.',
          ].map((item) => (
            <li
              key={item}
              className="max-w-reading border-t border-hairline py-4 text-body text-ink"
            >
              {item}
            </li>
          ))}
        </ul>

        <h3 className="pt-10 text-subtitle text-ink">Two things worth deciding at the same time</h3>
        <dl className="max-w-reading pt-4 text-body">
          <dt className="pt-4 font-semibold text-ink">The ampersand</dt>
          <dd className="text-ink-muted">
            Every lockup here spells out &ldquo;and&rdquo;, matching what the site displays today.
            The registered name in the CMS NPPES registry is{' '}
            <strong className="text-ink">Long Island Spine &amp; Orthopedics, PC</strong>. An
            ampersand would shorten the widest line by roughly a word and a half, which is worth
            something given how wide directions 1 and 4 are.
          </dd>
          <dt className="pt-5 font-semibold text-ink">The accent colour</dt>
          <dd className="text-ink-muted">
            The second colour in each lockup is the site&rsquo;s existing accent, #0b5c53, at 7.9:1
            on white. Every direction survives as pure black on white — that variant is built and
            shown above.
          </dd>
        </dl>
      </section>
    </main>
  )
}
