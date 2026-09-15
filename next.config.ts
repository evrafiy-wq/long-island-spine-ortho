import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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
