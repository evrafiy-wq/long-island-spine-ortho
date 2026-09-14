import { Fragment } from 'react'
import { practice } from '@/content/practice'

export function TrustBar() {
  return (
    <section className="trust-bar">
      <div className="trust-grid site-container">
        {practice.trustStatements.map((statement, index) => (
          <Fragment key={statement}>
            {index > 0 && <span aria-hidden="true" />}
            <p>{statement}</p>
          </Fragment>
        ))}
      </div>
    </section>
  )
}
