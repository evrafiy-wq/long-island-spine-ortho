import type { MetadataRoute } from 'next'
import { practice } from '@/content/practice'

/**
 * Emitted at /manifest.webmanifest — Next's filename for what is conventionally
 * called site.webmanifest. The link tag is added to every page automatically.
 *
 * Two 512px icons on purpose. `any` is the square artwork; `maskable` is the
 * same mark drawn smaller inside the tile, because Android crops a maskable
 * icon to whatever shape the launcher uses and only the inner 80% circle is
 * guaranteed. Shipping one icon as both gets the wordmark's edges shaved off.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: practice.name,
    short_name: practice.brand.prefix,
    description: practice.shortDescription,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0e1114',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
