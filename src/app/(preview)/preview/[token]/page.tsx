import { prisma } from '@/lib/db/client'
import { PuckRenderer } from '@/lib/puck/render'
import { jwtVerify } from 'jose'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

interface Props {
  params: Promise<{ token: string }>
}

interface PreviewToken {
  pageId: string
  exp: number
}

export const metadata: Metadata = { title: 'Preview' }

export default function PreviewPage({ params }: Props) {
  return (
    <Suspense fallback={<PreviewLoading />}>
      <PreviewContent params={params} />
    </Suspense>
  )
}

async function PreviewContent({ params }: Props) {
  const { token } = await params

  const secret = process.env.BETTER_AUTH_SECRET
  if (!secret) notFound()

  let payload: PreviewToken

  try {
    const { payload: p } = await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ['HS256'],
    })
    payload = p as unknown as PreviewToken
  } catch {
    return <PreviewError message="Lien de prévisualisation expiré ou invalide." />
  }

  const page = await prisma.page.findUnique({
    where: { id: payload.pageId },
    select: {
      id: true,
      title: true,
      draftJson: true,
      publishedJson: true,
    },
  })

  if (!page) notFound()

  const json = page.draftJson ?? page.publishedJson
  const isDraft = !!page.draftJson

  return (
    <>
      <PreviewBanner pageId={page.id} pageTitle={page.title} isDraft={isDraft} />
      {json ? (
        <div style={{ paddingTop: 36 }}>
          <PuckRenderer data={json} />
        </div>
      ) : (
        <div
          style={{
            padding: 40,
            fontFamily: 'system-ui',
            color: '#888',
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontSize: 28, fontWeight: 300, marginBottom: 8 }}>{page.title}</h1>
          <p style={{ fontSize: 13, color: '#aaa' }}>
            Cette page n'a pas encore de contenu à prévisualiser.
          </p>
        </div>
      )}
    </>
  )
}

function PreviewBanner({
  pageId,
  pageTitle,
  isDraft,
}: {
  pageId: string
  pageTitle: string
  isDraft: boolean
}) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: isDraft ? '#4353ff' : '#1a4a28',
        color: '#fff',
        fontSize: 12,
        fontFamily: 'system-ui',
        padding: '0 16px',
        height: 36,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <span style={{ fontWeight: 600 }}>
        {isDraft ? 'Prévisualisation — brouillon' : 'Prévisualisation — publié'}
      </span>
      <span
        style={{
          background: 'rgba(255,255,255,0.15)',
          borderRadius: 4,
          padding: '2px 8px',
          fontSize: 11,
        }}
      >
        {pageTitle}
      </span>
      <span style={{ marginLeft: 'auto', opacity: 0.5, fontSize: 11 }}>{pageId}</span>
    </div>
  )
}

function PreviewError({ message }: { message: string }) {
  return (
    <div
      style={{
        padding: 40,
        fontFamily: 'system-ui',
        color: '#ff6060',
        background: '#0e0e14',
        minHeight: '100vh',
      }}
    >
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>Prévisualisation indisponible</h1>
      <p style={{ color: '#9191a8', fontSize: 14 }}>{message}</p>
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
      Chargement de la prévisualisation…
    </div>
  )
}
