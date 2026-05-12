import { ImageResponse } from '@vercel/og'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const title = searchParams.get('title') ?? 'Untitled'
  const description = searchParams.get('description') ?? ''
  const siteName = searchParams.get('site') ?? 'Tatomir'
  const imageUrl = searchParams.get('image')

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#0e0e14',
        padding: 60,
        position: 'relative',
      }}
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.3,
          }}
        />
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, zIndex: 1 }}>
        <p style={{ color: '#9191a8', fontSize: 18, margin: 0 }}>{siteName}</p>
        <h1
          style={{
            color: '#e8e8f0',
            fontSize: 56,
            fontWeight: 700,
            margin: 0,
            lineHeight: 1.1,
            maxWidth: 900,
          }}
        >
          {title}
        </h1>
        {description && (
          <p
            style={{
              color: '#9191a8',
              fontSize: 24,
              margin: 0,
              maxWidth: 800,
              lineHeight: 1.4,
            }}
          >
            {description}
          </p>
        )}
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          right: 60,
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#4353ff',
          boxShadow: '0 0 40px 20px rgba(67,83,255,0.3)',
        }}
      />
    </div>,
    {
      width: 1200,
      height: 630,
    },
  )
}
