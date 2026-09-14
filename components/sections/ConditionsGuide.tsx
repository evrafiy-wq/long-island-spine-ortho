'use client'

import { useState } from 'react'
import { practice } from '@/content/practice'
import { cx } from '@/lib/cx'

export function ConditionsGuide() {
  const { conditionsGuide } = practice.copy
  // `?? ''` rather than a non-null assertion: with no categories configured the
  // guide renders no tabs and no panel, which is the coherent outcome.
  const [activeId, setActiveId] = useState(practice.conditionCategories[0]?.id ?? '')

  return (
    <div className="conditions-guide" id="conditions-guide">
      <div className="conditions-intro">
        <p className="eyebrow eyebrow-sm" style={{ justifyContent: 'center' }}>
          {conditionsGuide.eyebrow}
        </p>
        <h3>{conditionsGuide.heading}</h3>
        <p>{conditionsGuide.body}</p>
      </div>

      <div className="conditions-tabs" role="tablist" aria-label={conditionsGuide.tablistLabel}>
        {practice.conditionCategories.map((category) => {
          const isActive = category.id === activeId
          return (
            <button
              key={category.id}
              className={cx('conditions-tab-btn', isActive && 'active')}
              type="button"
              role="tab"
              id={`tab-btn-${category.id}`}
              aria-selected={isActive}
              aria-controls={`tab-${category.id}`}
              tabIndex={isActive ? undefined : -1}
              onClick={() => setActiveId(category.id)}
            >
              {category.label}
            </button>
          )
        })}
      </div>

      {practice.conditionCategories.map((category) => {
        const isActive = category.id === activeId
        return (
          <div
            key={category.id}
            className={cx('tab-panel', isActive && 'active')}
            id={`tab-${category.id}`}
            role="tabpanel"
            aria-labelledby={`tab-btn-${category.id}`}
          >
            <div className="conditions-grid">
              {category.conditions.map((condition) => (
                <div className="condition-card" key={condition.name}>
                  <h4>{condition.name}</h4>
                  <p className="condition-desc">{condition.description}</p>
                  <ul className="condition-details">
                    {condition.details.map((detail) => (
                      <li key={detail.term}>
                        <strong>{detail.term}:</strong> {detail.value}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
