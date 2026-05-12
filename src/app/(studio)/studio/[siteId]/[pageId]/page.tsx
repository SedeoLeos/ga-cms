import type { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = { title: 'Studio' }

interface Props {
  params: Promise<{ siteId: string; pageId: string }>
}

export default function StudioPage({ params }: Props) {
  return (
    <Suspense>
      <StudioContent params={params} />
    </Suspense>
  )
}

async function StudioContent({ params }: Props) {
  const { siteId, pageId } = await params
  return (
    <div
      style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}
    >
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
        Studio — site: {siteId} / page: {pageId} — Sprint S7
      </p>
    </div>
  )
}
