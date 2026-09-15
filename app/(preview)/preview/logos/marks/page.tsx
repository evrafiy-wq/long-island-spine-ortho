import type { Metadata } from 'next'
import Link from 'next/link'
import { ChromeInSitu } from '@/components/preview/logos/ChromeInSitu'
import { Mark, Square } from '@/components/preview/logos/Mark'
import { ARRANGEMENTS, FACES, MARKS } from '@/components/preview/logos/markSet'
import { DIRECTIONS } from '@/components/preview/logos/logoSet'

export const metadata: Metadata = {
  title: 'LISP lettermarks',
  robots: { index: false, follow: false },
}

/**
 * Follow-up to /preview/logos: four-letter lettermarks to sit alongside
 * Direction 3's wordmark. Deleted with the rest of the preview once chosen.
 */

const D3 = DIRECTIONS.find((d) => d.id === 'd3')!
const ALT_FACES = ['cinzel', 'newsreader', 'marcellus'] as const
const ALTERNATES = [
  {
    text: 'LISP',
    label: 'LISP',
    gloss: 'Long Island SPine — and an English word for a speech impediment.',
  },
  {
    text: 'LISO',
    label: 'LISO',
    gloss: 'Long Island Spine and Orthopedics. Same four letters of weight, no word.',
  },
  {
    text: 'LIS',
    label: 'LIS',
    gloss: 'Long Island Spine. Three letters read better small than four.',
  },
  { text: 'LI', label: 'LI', gloss: 'Long Island. What the four directions already use.' },
] as const

function Caption({ children }: { children: React.ReactNode }) {
  return <p className="pt-2 text-label text-ink-muted uppercase">{children}</p>
}

export default function LettermarksPage() {
  return (
    <main id="main-content" className="bg-canvas pb-[var(--spacing-block)]">
      <div className="measure pt-12">
        <p className="text-label text-ink-muted uppercase">
          <Link href="/preview/logos" className="underline underline-offset-4 hover:text-ink">
            Phase 3 · logo directions
          </Link>{' '}
          / lettermarks
        </p>
        <h1 className="pt-4 font-display text-display text-ink">LISP, in six serifs</h1>
        <p className="max-w-lede pt-6 text-lede text-ink-muted">
          Four-letter lettermarks to sit beside Direction 3&rsquo;s wordmark, in six display serifs,
          four arrangements each.
        </p>

        <div className="mt-10 border-l-4 border-danger bg-surface px-6 py-5">
          <h2 className="text-subtitle text-ink">Before you choose: the word</h2>
          <p className="max-w-reading pt-3 text-body text-ink">
            <strong>&ldquo;Lisp&rdquo; is an English word for a speech impediment</strong> — a
            difficulty producing /s/ and /z/. On a medical practice the association is immediate and
            not flattering, and it is the kind of thing a competitor or a patient notices without
            being told. The letters are also the name of a programming language, which is harmless
            but not helpful.
          </p>
          <p className="max-w-reading pt-3 text-body text-ink-muted">
            It is your call and the marks below are built properly either way. The last section
            shows the same treatment with three alternates so you can compare rather than take my
            word for it.
          </p>
        </div>
      </div>

      {/* ---------------- the six faces ---------------- */}
      <section aria-labelledby="faces" className="measure pt-[var(--spacing-block)]">
        <h2 id="faces" className="font-display text-title text-ink">
          Six faces
        </h2>
        <p className="max-w-reading pt-3 text-body text-ink-muted">
          All six are SIL OFL 1.1, same as the wordmark faces — free for commercial use and for
          outlining into a logo. Each is normalised to the same cap height, not the same em size:
          these range from 0.625 to 0.750 cap-to-em, so matching em sizes would have made Cormorant
          look a third smaller than Bodoni for no reason.
        </p>

        {FACES.map((face) => (
          <div key={face.id} className="border-t border-hairline pt-8 pb-10">
            <div className="flex flex-wrap items-baseline gap-x-4">
              <h3 className="text-subtitle text-ink">{face.name}</h3>
              <span className="text-meta text-ink-muted">{face.designer}</span>
              {!face.smallOk && (
                <span className="text-meta font-semibold text-danger">breaks up at 32px</span>
              )}
            </div>
            <p className="max-w-reading pt-3 text-body text-ink-muted">{face.note}</p>
            <div className="overflow-x-auto pt-6">
              <div className="flex items-end gap-12">
                {ARRANGEMENTS.map((a) => {
                  const id = `lisp-${face.id}-${a.id}`
                  if (!MARKS[id]) return null
                  return (
                    <div key={a.id}>
                      <Mark
                        id={id}
                        height={a.id === 'row' ? 74 : 110}
                        alt={`LISP in ${face.name}, ${a.name} arrangement`}
                      />
                      <Caption>{a.name}</Caption>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ))}

        <dl className="max-w-reading border-t border-hairline pt-8 text-body">
          {ARRANGEMENTS.map((a) => (
            <div key={a.id} className="pt-3">
              <dt className="font-semibold text-ink">{a.name}</dt>
              <dd className="text-ink-muted">{a.note}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ---------------- reversed ---------------- */}
      <section aria-labelledby="reversed" className="measure pt-[var(--spacing-block)]">
        <h2 id="reversed" className="font-display text-title text-ink">
          Reversed
        </h2>
        <div className="mt-6 overflow-x-auto bg-dark px-8 py-10">
          <div className="flex items-end gap-14">
            {FACES.map((face) => (
              <Mark
                key={face.id}
                id={`lisp-${face.id}-rule`}
                height={104}
                reversed
                alt={`LISP in ${face.name}, reversed`}
              />
            ))}
          </div>
        </div>
        <Caption>{FACES.map((f) => f.name).join(' · ')}</Caption>
      </section>

      {/* ---------------- the favicon test ---------------- */}
      <section aria-labelledby="favicon" className="measure pt-[var(--spacing-block)]">
        <h2 id="favicon" className="font-display text-title text-ink">
          The favicon test
        </h2>
        <p className="max-w-reading pt-3 text-body text-ink-muted">
          Each mark letterboxed into a real 16, 32 and 48px square — the constraint a favicon
          actually imposes. Sizing by height instead gives the opposite answer and is wrong: a
          two-line stack set to 16px <em>tall</em> halves every letter. In a 16px <em>square</em>,
          the row is four letters sharing sixteen pixels of width.
        </p>
        <p className="max-w-reading pt-3 text-body text-ink">
          <strong>What it shows:</strong> the stack wins at 32px and above; at 16px no four-letter
          mark is comfortable in any of the six; and Bodoni Moda comes apart at both sizes.
        </p>

        <div className="overflow-x-auto pt-8">
          <table className="min-w-[40rem] text-meta">
            <thead>
              <tr className="border-b border-hairline text-left text-label text-ink-muted uppercase">
                <th scope="col" className="py-3 pr-8 font-semibold">
                  Face
                </th>
                <th scope="col" className="py-3 pr-8 font-semibold">
                  Row 16 · 32 · 48
                </th>
                <th scope="col" className="py-3 font-semibold">
                  Stack 16 · 32 · 48
                </th>
              </tr>
            </thead>
            <tbody>
              {FACES.map((face) => (
                <tr key={face.id} className="border-b border-hairline align-middle">
                  <th scope="row" className="py-5 pr-8 text-left font-semibold text-ink">
                    {face.name}
                  </th>
                  {(['row', 'stack'] as const).map((arr) => (
                    <td key={arr} className="py-5 pr-8">
                      <div className="flex items-center gap-4">
                        {[16, 32, 48].map((size) => (
                          <Square
                            key={size}
                            id={`lisp-${face.id}-${arr}`}
                            size={size}
                            alt={`LISP in ${face.name}, ${arr}, at ${size} pixels square`}
                          />
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------------- alternates ---------------- */}
      <section aria-labelledby="alternates" className="measure pt-[var(--spacing-block)]">
        <h2 id="alternates" className="font-display text-title text-ink">
          The same treatment, without the word
        </h2>
        <p className="max-w-reading pt-3 text-body text-ink-muted">
          Three faces, four sets of initials, identical treatment. Nothing about the design changes
          — only what the letters spell.
        </p>

        {ALT_FACES.map((faceId) => {
          const face = FACES.find((f) => f.id === faceId)!
          return (
            <div key={faceId} className="border-t border-hairline pt-8 pb-8">
              <h3 className="text-subtitle text-ink">{face.name}</h3>
              <div className="overflow-x-auto pt-5">
                <div className="flex items-end gap-12">
                  {ALTERNATES.map((alt) => {
                    const id = `${alt.text.toLowerCase()}-${faceId}-rule`
                    if (!MARKS[id]) return null
                    return (
                      <div key={alt.text}>
                        <Mark id={id} height={96} alt={`${alt.label} in ${face.name}`} />
                        <Caption>{alt.label}</Caption>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}

        <dl className="max-w-reading pt-4 text-body">
          {ALTERNATES.map((alt) => (
            <div key={alt.text} className="pt-3">
              <dt className="font-semibold text-ink">{alt.label}</dt>
              <dd className="text-ink-muted">{alt.gloss}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ---------------- in situ ---------------- */}
      <section aria-labelledby="insitu" className="pt-[var(--spacing-block)]">
        <div className="measure">
          <h2 id="insitu" className="font-display text-title text-ink">
            Direction 3 in the header, unchanged
          </h2>
          <p className="max-w-reading pt-3 text-body text-ink-muted">
            For reference while you compare. The wordmark carries the name on its own, so a
            lettermark is for the favicon, social avatars and anywhere the full lockup will not fit
            — not for the header.
          </p>
        </div>
        <div className="pt-6">
          <ChromeInSitu direction={D3} lockup="horizontal" height={32} />
        </div>
      </section>
    </main>
  )
}
