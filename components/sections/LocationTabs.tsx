'use client'

import { useState } from 'react'
import Image from 'next/image'
import { practice } from '@/content/practice'
import { cx } from '@/lib/cx'

type LocationTab = 'photo' | 'map'

export function LocationTabs() {
  const [activeTab, setActiveTab] = useState<LocationTab>('photo')
  const { officeExterior, contact } = practice

  const tabs: { id: LocationTab; label: string }[] = [
    { id: 'photo', label: 'Photo' },
    { id: 'map', label: 'Map' },
  ]

  return (
    <div className="location-visual-wrap">
      <div className="location-tabs" role="tablist" aria-label="Office photo or map">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab
          return (
            <button
              key={tab.id}
              className={cx('location-tab-btn', isActive && 'active')}
              type="button"
              role="tab"
              id={`loc-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`loc-panel-${tab.id}`}
              tabIndex={isActive ? undefined : -1}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div
        className={cx('location-panel', activeTab === 'photo' && 'active')}
        id="loc-panel-photo"
        role="tabpanel"
        aria-labelledby="loc-tab-photo"
      >
        <div className="location-map-container">
          <Image
            src={officeExterior.src}
            alt={officeExterior.alt}
            width={officeExterior.width}
            height={officeExterior.height}
            sizes="(max-width: 930px) 100vw, 600px"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      </div>

      <div
        className={cx('location-panel', activeTab === 'map' && 'active')}
        id="loc-panel-map"
        role="tabpanel"
        aria-labelledby="loc-tab-map"
      >
        <div className="location-map-container">
          <iframe
            src={contact.mapEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Map to Long Island Spine and Orthopedics"
          />
        </div>
      </div>
    </div>
  )
}
