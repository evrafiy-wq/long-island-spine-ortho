import Link from 'next/link'
import { practice } from '@/content/practice'

export function UtilityBar() {
  const { phone, address } = practice.contact

  return (
    <div className="utility-bar">
      <div className="utility-content site-container">
        <p>{practice.name}</p>
        <div className="utility-links">
          <a href={phone.href}>Call {phone.display}</a>
          <span>|</span>
          <Link href="/visit">
            {address.city}, {address.state}
          </Link>
        </div>
      </div>
    </div>
  )
}
