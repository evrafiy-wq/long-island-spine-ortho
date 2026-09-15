import Image from 'next/image'
import Link from 'next/link'
import { practice } from '@/content/practice'

export function SiteFooter() {
  const { phone, address } = practice.contact
  const { wordmarkStacked } = practice.brand

  return (
    <>
      <footer className="border-t border-hairline bg-surface">
        <div className="measure grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
          <div>
            {/* Unlike the header's copy this one is not inside a link, so it
                supplies its own accessible name rather than the empty default. */}
            <Image
              src={wordmarkStacked.src}
              alt={practice.name}
              width={wordmarkStacked.width}
              height={wordmarkStacked.height}
              unoptimized
              className="h-16 w-auto max-w-none"
            />
            <p className="max-w-[40ch] pt-5 text-meta text-ink-muted">
              {practice.shortDescription}
            </p>
          </div>

          <nav aria-label="Practice">
            <h2 className="text-label text-ink-muted uppercase">Practice</h2>
            <ul className="pt-4">
              {practice.footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block py-1.5 text-meta text-ink transition-state hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-label text-ink-muted uppercase">Contact</h2>
            <address className="pt-4 text-meta text-ink not-italic">
              {address.street}
              <br />
              {address.cityStateZip}
            </address>
            <a
              href={phone.href}
              // whitespace-nowrap because without it this breaks after the
              // dash — "(516) 433-" over "1100" — in the 310px footer column at
              // 1440. A phone number split across two lines is a transcription
              // error waiting to happen, and this one is the practice's.
              className="inline-block pt-3 font-display text-subtitle font-semibold tracking-tight whitespace-nowrap text-accent transition-state hover:text-accent-hover"
            >
              {phone.display}
            </a>
            <p className="pt-2 text-meta text-ink-muted">{practice.hours.summary}</p>
          </div>
        </div>

        <div className="border-t border-hairline">
          {/* The legal links sit in the fine-print row rather than in the
              Practice navigation above: they are not somewhere a patient is
              being sent, they are somewhere a patient can always get to. They
              are also kept out of practice.footerLinks because that list is
              what lib/pageTitle.ts derives every inner page's <h1> from, and
              these two supply their own from content/legal.ts. */}
          <div className="measure flex flex-wrap items-center justify-between gap-x-8 gap-y-2 py-5">
            <p className="text-meta text-ink-muted">
              © {new Date().getFullYear()} {practice.name}
            </p>
            <ul className="flex flex-wrap gap-x-6">
              {practice.legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-block min-h-6 py-0.5 text-meta text-ink-muted transition-state hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </footer>
    </>
  )
}
