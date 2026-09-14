import Link from 'next/link'
import { Glyph } from '@/components/site/Glyph'
import { UI } from '@/components/site/icons'
import { practice } from '@/content/practice'

export function SiteFooterA() {
  const { phone, address } = practice.contact

  return (
    <>
      {/* practice.emergencyNotice is rendered nowhere on the live site. It is
          real, existing copy and it belongs on a medical practice's homepage,
          so A surfaces it here as one ruled line rather than inventing
          anything new. */}
      <aside className="border-t border-hairline">
        <p className="measure flex items-center gap-2 py-4 font-[family-name:var(--pv-font-meta)] text-meta text-ink-muted">
          <Glyph as={UI.alert} />
          {practice.emergencyNotice}
        </p>
      </aside>

      <footer className="border-t border-hairline bg-sunken">
        <div className="measure grid gap-10 py-12 sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-display text-subtitle text-ink">{practice.name}</p>
            <p className="max-w-[34ch] pt-3 font-[family-name:var(--pv-font-meta)] text-meta text-ink-muted">
              {practice.shortDescription}
            </p>
          </div>

          <nav aria-label="Practice">
            <h2 className="font-[family-name:var(--pv-font-meta)] text-label text-ink-muted uppercase">
              Practice
            </h2>
            <ul className="pt-4">
              {practice.footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block py-1.5 font-[family-name:var(--pv-font-meta)] text-meta text-ink transition-state hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-[family-name:var(--pv-font-meta)] text-label text-ink-muted uppercase">
              Contact
            </h2>
            <address className="pt-4 font-[family-name:var(--pv-font-meta)] text-meta text-ink not-italic">
              {address.street}
              <br />
              {address.cityStateZip}
              <br />
              <a
                href={phone.href}
                className="inline-block py-1.5 font-semibold text-accent transition-state hover:text-accent-hover"
              >
                {phone.display}
              </a>
            </address>
            <p className="pt-1 font-[family-name:var(--pv-font-meta)] text-meta text-ink-muted">
              {practice.hours.summary}
            </p>
          </div>
        </div>

        <div className="border-t border-hairline">
          <p className="measure py-5 font-[family-name:var(--pv-font-meta)] text-meta text-ink-muted">
            © {new Date().getFullYear()} {practice.name}
          </p>
        </div>
      </footer>
    </>
  )
}
