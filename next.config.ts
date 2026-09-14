import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Serve modern formats; next/image generates the responsive variants.
    formats: ['image/avif', 'image/webp'],
  },
}

export default nextConfig
