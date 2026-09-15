import type { NextConfig } from 'next'

/**
 * Portfolio mode's `X-Robots-Tag` layer.
 *
 * Read directly from `process.env` rather than imported from lib/siteMode.ts:
 * next.config.ts is evaluated by the Next CLI as a standalone module, outside
 * the app's TypeScript path aliases, so `@/lib/siteMode` does not resolve
 * here. The default-to-portfolio rule is restated for that reason — keep the
 * two in step.
 *
 * A header rather than only a meta tag because `headers()` covers what a
 * `<meta>` cannot: /sitemap.xml, /robots.txt, /opengraph-image.png, the
 * manifest, and the patient PDFs under /forms. Google honours `X-Robots-Tag`
 * on any content type, which is the only way to keep a PDF out of an index.
 *
 * `source: '/:path*'` matches every route including `/`. The /admin segment
 * sets its own copy of this header in middleware.ts and is unaffected —
 * duplicate identical directives are harmless.
 */
const isPortfolioMode = process.env.NEXT_PUBLIC_SITE_MODE !== 'production'

const nextConfig: NextConfig = {
  async headers() {
    if (!isPortfolioMode) return []
    return [
      {
        source: '/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive, nosnippet' }],
      },
    ]
  },
  /**
   * Build output directory, overridable per-invocation.
   *
   * Defaults to `.next`, so nothing changes. It exists because `next build`
   * replaces that directory underneath any running `npm run dev`, which then
   * starts 500ing — the footgun CLAUDE.md warns about. With this,
   * `NEXT_DIST_DIR=.next-verify npm run build` verifies a build without
   * touching a dev server someone else is using.
   */
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
  reactStrictMode: true,
  images: {
    // Serve modern formats; next/image generates the responsive variants.
    formats: ['image/avif', 'image/webp'],
    /**
     * Trimmed from the default [640, 750, 828, 1080, 1200, 1920, 2048, 3840].
     *
     * The largest real source we have is the portrait at 1122px wide, and the
     * office exterior is only 597px. With the defaults, a `100vw` mobile
     * placement requests a 1200w variant and sharp upscales the portrait by
     * 7%. Capping at 1920 — and adding 375 for the phone case — means no
     * generated variant can exceed a source. 1920 is only reachable by
     * explicitly wide `sizes`, which nothing uses.
     */
    deviceSizes: [375, 640, 750, 828, 1080, 1280, 1920],
  },
}

export default nextConfig
