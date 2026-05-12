import { jwtVerify } from 'jose'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

interface Props {
  params: Promise<{ token: string }>
}

interface PreviewToken {
  pageId: string
  siteId: string
  exp: number
}

// Outer page is a synchronous shell — required by PPR (cacheComponents: true).
// All async data access is inside <Suspense> via PreviewContent.
export default function PreviewPage({ params }: Props) {
  return (
    <Suspense fallback={<PreviewLoading />}>
      <PreviewContent params={params} />
    </Suspense>
  )
}

async function PreviewContent({ params }: Props) {
  const { token } = await params

  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) notFound()

  let payload: PreviewToken

  try {
    const { payload: p } = await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ['HS256'],
    })
    payload = p as unknown as PreviewToken
  } catch {
    return (
      <div
        style={{
          padding: 40,
          fontFamily: 'system-ui',
          color: '#ff4444',
          background: '#0e0e14',
          minHeight: '100vh',
        }}
      >
        <h1 style={{ fontSize: 24, marginBottom: 8 }}>Preview link expired or invalid</h1>
        <p style={{ color: '#9191a8' }}>Request a new preview link from the editor.</p>
      </div>
    )
  }

  return (
    <div>
      <PreviewBanner pageId={payload.pageId} siteId={payload.siteId} />
      <div id="preview-content" style={{ paddingTop: 36 }}>
        {/* Page renderer mounts here in Sprint S12 */}
        <div style={{ padding: 40, fontFamily: 'system-ui', color: '#9191a8' }}>
          Preview renderer — Sprint S12
        </div>
      </div>
    </div>
  )
}

function PreviewBanner({ pageId, siteId }: { pageId: string; siteId: string }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: '#4353ff',
        color: '#fff',
        fontSize: 12,
        fontFamily: 'system-ui',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <span style={{ fontWeight: 600 }}>Preview mode</span>
      <span style={{ opacity: 0.7 }}>Showing unpublished draft</span>
      <span style={{ marginLeft: 'auto', opacity: 0.5 }}>
        {siteId} / {pageId}
      </span>
    </div>
  )
}

function PreviewLoading() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#0e0e14',
        color: '#4e4e60',
        fontFamily: 'system-ui',
        fontSize: 13,
      }}
    >
      Loading preview…
    </div>
  )
}
