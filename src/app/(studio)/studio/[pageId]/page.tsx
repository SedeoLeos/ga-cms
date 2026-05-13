import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/db/client'
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { connection } from 'next/server'
import { Suspense } from 'react'
import StudioEditor from './StudioEditor'

interface Props {
  params: Promise<{ pageId: string }>
}

export const metadata: Metadata = { title: 'Studio' }

export default function StudioPage({ params }: Props) {
  return (
    <Suspense>
      <StudioContent params={params} />
    </Suspense>
  )
}

async function StudioContent({ params }: Props) {
  await connection()
  const { pageId } = await params

  // Validate session against DB (cookieCache disabled — no HMAC false-negative)
  let session = null
  try {
    session = await getSession()
  } catch {
    // ignore — middleware will redirect if cookie is absent
  }
  if (!session) {
    redirect(`/admin/auth/login?callbackUrl=${encodeURIComponent(`/studio/${pageId}`)}`)
  }

  const page = await prisma.page.findUnique({
    where: { id: pageId },
    select: {
      id: true,
      title: true,
      draftJson: true,
      publishedJson: true,
    },
  })

  if (!page) notFound()

  const initialData = page.draftJson ?? page.publishedJson

  return (
    <StudioEditor
      pageId={page.id}
      pageTitle={page.title}
      initialData={initialData as Record<string, unknown> | null}
    />
  )
}
