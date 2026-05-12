import type { NextConfig } from 'next'

const config: NextConfig = {
  // 'standalone' for Docker — set NEXT_OUTPUT=standalone in Dockerfile
  // undefined for Vercel / Railway / Render (they handle output themselves)
  output: (process.env.NEXT_OUTPUT as 'standalone') ?? undefined,

  // Partial Pre-rendering — works on every platform that runs Next.js
  cacheComponents: true,

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: buildRemotePatterns(),
  },

  // next-intl
  i18n: undefined, // handled by next-intl app router integration

  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

function buildRemotePatterns(): { protocol: 'https' | 'http'; hostname: string }[] {
  const patterns: { protocol: 'https' | 'http'; hostname: string }[] = []

  patterns.push({ protocol: 'https', hostname: 'utfs.io' })

  if (process.env.SUPABASE_URL) {
    try {
      const url = new URL(process.env.SUPABASE_URL)
      patterns.push({ protocol: 'https', hostname: url.hostname })
    } catch {}
  }

  if (process.env.S3_PUBLIC_URL) {
    try {
      const url = new URL(process.env.S3_PUBLIC_URL)
      const proto = url.protocol.replace(':', '') as 'https' | 'http'
      patterns.push({ protocol: proto, hostname: url.hostname })
    } catch {}
  }

  return patterns
}

export default config
