import Link from 'next/link'

/**
 * Review index for Phase 2. Deliberately unstyled by any direction token — it
 * uses literal arbitrary values so it cannot be mistaken for one of the three
 * designs, and so it stays legible whichever direction wins.
 *
 * Deleted at Prompt 2b along with the rest of app/(preview).
 */

const DIRECTIONS = [
  {
    id: 'a',
    name: 'Clinical Authority',
    type: 'Source Serif 4 + Libre Franklin',
    body: '18px / 1.67',
    phone: 'Sticky 44px running-head rail above a static header',
    move: 'A ruled record card in the hero, set like a journal’s author-affiliation box',
    rationale:
      'Speaks to the referred patient and to the patient’s adult child doing the vetting — people who arrived with a name in hand and need to confirm, without persuasion, that this is a legitimate academic-affiliated surgeon, then find the phone number. It signals institutional seriousness by behaving like a document rather than a brochure: a fixed 1080px measure on a wide sheet, hairline rules instead of cards, zero box-shadows anywhere, radius 0 on everything including the photographs, and body copy set in the serif rather than just the headlines. The hero has no portrait at all; its right-hand element is a ruled record card carrying the physician, specialty, all three verifiable credentials, the address, the hours and the telephone — the densest credibility object constructible from the practice’s own content, and an answer to having only one good photograph that does not require a second one. What it deliberately gives up is warmth and any sense that this is a small, personal practice: it reads as a department, not a person. It also gives up the headline’s emotional pull, because the emphasis on “what moves you.” is kept semantically but rendered in the same colour and near-same weight — A does not let a marketing gesture sit at the top of a clinical document. If the practice’s real differentiator is that Dr. Rafiy personally explains things to you, A is the wrong direction.',
  },
  {
    id: 'b',
    name: 'Warm Practitioner',
    type: 'Newsreader + Public Sans',
    body: '19px / 1.68 — the largest of the three',
    phone: 'Header at ≥768; fixed bottom call dock below that',
    move: 'Full-bleed portrait first, and the practice’s own three-step “how care proceeds” promoted onto the homepage',
    rationale:
      'Speaks to the person who already tried one practice, felt processed, and is now choosing on whether they will be listened to — and to the first-timer whose real fear is not incompetence but being rushed through fifteen minutes with no explanation. It signals a person rather than a network: the doctor’s face is the first thing on the screen at full bleed with a solid caption bar beneath it instead of a gradient scrim, the prose is set at 19px in a serif that carries both the headings and the body so the page reads as written rather than assembled, the services are a disclosure list you open rather than a grid you skim, and the practice’s own description of how care actually proceeds — currently buried on the About page — is promoted to the homepage, because that section *is* the “a doctor who will explain things to you” promise in the practice’s own words. What it deliberately gives up is institutional scale: B reads unmistakably as a single-doctor office, which loses the “part of something larger” reassurance that some referred patients specifically want. It also gives up above-the-fold density, because the portrait owns most of the first mobile screen. And it gives up the hedge — B stakes the page on one photograph, and therefore on that photograph being good.',
  },
  {
    id: 'c',
    name: 'Modern Precision',
    type: 'Instrument Sans + IBM Plex Sans',
    body: '17px / 1.65',
    phone: 'Sticky 56px dark action bar, visible at every width',
    move: 'A typographic index of all nine treated conditions, one scroll down',
    rationale:
      'Speaks to the visitor who arrived from a search with a condition name already in their head, and to the referred patient comparing two surgeons in adjacent browser tabs. It signals current competence and organisational rigour — that this practice is run precisely — through a visible grid, hairline structure, no ornament and no shadows at all, and a deliberate scale contrast between a 12px index label and a 76px headline. Its structural argument, and the reason it differs most from the brief as written, is that the fastest route to credibility for this particular visitor is not a brand statement but their own condition, named back to them with symptoms and treatment approaches attached, inside the first scroll: all nine real conditions are laid out as a server-rendered index rather than hidden behind the tab widget they currently live in on the Services page. What it deliberately gives up is warmth and human presence — the portrait is small and arrives late, and C gives photography the least room of the three — along with any editorial or venerable connotation. C reads as well-run, not as established. If the practice’s real edge is Dr. Rafiy personally, C undersells it.',
  },
] as const

const PLACEHOLDERS = [
  {
    direction: 'A',
    text: '[PLACEHOLDER: address row label, e.g. "Office"]',
    note: 'Record card row label. Non-clinical field name, no claim risk.',
  },
  {
    direction: 'A',
    text: '[PLACEHOLDER: phone row label, e.g. "Telephone"]',
    note: 'Record card row label. Non-clinical field name, no claim risk.',
  },
  {
    direction: 'C',
    text: '[PLACEHOLDER: hero action-block label, e.g. "New and current patients"]',
    note: 'Labels the bordered CTA box in the hero. Nothing in the existing copy fills this slot.',
  },
] as const

export default function PreviewIndexPage() {
  return (
    <div className="min-h-dvh bg-[#fafafa] font-sans text-[#18181b]">
      <main id="main-content" className="mx-auto max-w-[54rem] px-6 py-16">
        <p className="text-[0.75rem] font-semibold tracking-[0.1em] text-[#71717a] uppercase">
          Build brief · Phase 2
        </p>
        <h1 className="pt-4 text-[2rem] leading-[1.15] font-semibold tracking-[-0.02em]">
          Three homepage directions
        </h1>
        <p className="max-w-[62ch] pt-4 text-[1.0625rem] leading-[1.65] text-[#3f3f46]">
          Each is a complete homepage with its own token set, font pairing and chrome, verified at
          375, 768, 1280 and 1920. Pick one, or ask for a combination — the three share one semantic
          token vocabulary, so swapping, say, A’s typography onto B’s layout is a values change, not
          a rewrite.
        </p>

        <ul className="pt-14">
          {DIRECTIONS.map((direction) => (
            <li key={direction.id} className="border-t border-[#e4e4e7] py-10">
              <h2 className="text-[1.5rem] leading-[1.3] font-semibold tracking-[-0.015em]">
                <Link
                  href={`/preview/${direction.id}`}
                  className="underline decoration-[#a1a1aa] decoration-1 underline-offset-[6px] hover:decoration-[#18181b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#18181b]"
                >
                  {direction.id.toUpperCase()} — {direction.name}
                </Link>
              </h2>

              <dl className="grid gap-x-8 gap-y-3 pt-5 text-[0.9375rem] leading-[1.5] sm:grid-cols-[7rem_1fr]">
                {(
                  [
                    ['Type', direction.type],
                    ['Body text', direction.body],
                    ['Phone', direction.phone],
                    ['Distinctive move', direction.move],
                  ] as const
                ).map(([term, value]) => (
                  <div key={term} className="contents">
                    <dt className="font-semibold text-[#71717a]">{term}</dt>
                    <dd className="text-[#18181b]">{value}</dd>
                  </div>
                ))}
              </dl>

              <p className="max-w-[68ch] pt-6 text-[1.0625rem] leading-[1.7] text-[#3f3f46]">
                {direction.rationale}
              </p>
            </li>
          ))}
        </ul>

        <section aria-labelledby="placeholders" className="border-t border-[#e4e4e7] pt-10">
          <h2 id="placeholders" className="text-[1.25rem] font-semibold tracking-[-0.01em]">
            Copy that does not exist yet
          </h2>
          <p className="max-w-[62ch] pt-3 text-[1.0625rem] leading-[1.65] text-[#3f3f46]">
            Three strings across all three directions. Every one is a non-clinical field label, so
            none carries a claim risk — they are marked only because they are not copy the practice
            has approved. Direction B needs none.
          </p>
          <ul className="pt-6">
            {PLACEHOLDERS.map((placeholder) => (
              <li key={placeholder.text} className="border-t border-[#e4e4e7] py-4">
                <p className="font-mono text-[0.875rem] leading-[1.5] text-[#18181b]">
                  <span className="mr-2 font-sans font-semibold text-[#71717a]">
                    {placeholder.direction}
                  </span>
                  {placeholder.text}
                </p>
                <p className="pt-1 text-[0.9375rem] leading-[1.5] text-[#71717a]">
                  {placeholder.note}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="held-back" className="mt-10 border-t border-[#e4e4e7] pt-10">
          <h2 id="held-back" className="text-[1.25rem] font-semibold tracking-[-0.01em]">
            Content held back on purpose
          </h2>
          <p className="max-w-[68ch] pt-3 text-[1.0625rem] leading-[1.65] text-[#3f3f46]">
            All three directions render{' '}
            <code className="font-mono text-[0.9375rem]">credentials</code> 0–2 and never index 3,
            drop <code className="font-mono text-[0.9375rem]">heroHighlights</code> entirely, and
            show no insurance carriers. The languages claim and the five-carrier insurance list are
            both flagged UNVERIFIED in{' '}
            <code className="font-mono text-[0.9375rem]">content/practice.ts</code>, and{' '}
            <code className="font-mono text-[0.9375rem]">heroHighlights[1]</code> <em>is</em> the
            languages claim — so rather than relying on remembering to avoid them, the directions
            are built so they cannot appear. Verified against the rendered HTML of all three routes:
            zero occurrences.
          </p>
        </section>
      </main>
    </div>
  )
}
