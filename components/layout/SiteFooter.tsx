import Link from 'next/link'
import { Brand } from './Brand'
import { practice } from '@/content/practice'

export function SiteFooter() {
  const { phone, address } = practice.contact

  return (
    <footer className="site-footer">
      <div className="footer-main site-container">
        <div className="footer-brand brand-footer">
          <Brand />
          <p>{practice.shortDescription}</p>
        </div>
        <div className="footer-links">
          <div>
            <p className="footer-label">Practice</p>
            {practice.footerLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
          <div>
            <p className="footer-label">Contact</p>
            <Link href="/visit">
              {address.street}
              <br />
              {address.cityStateZip}
            </Link>
            <a href={phone.href}>{phone.display}</a>
            <Link href="/patient-info#faq">{practice.hours.summary}</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom site-container">
        {/* Rendered on the server, so the year is correct without client JS —
            the original set this from script.js after hydration. */}
        <p>
          © {new Date().getFullYear()} {practice.name}
        </p>
        <Link href="/patient-info">Patient Resources</Link>
      </div>
    </footer>
  )
}
