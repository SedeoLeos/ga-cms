import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

interface Props {
  params: Promise<{ locale: string; slug: string[] }>
}

export default function SitePage({ params }: Props) {
  return (
    <Suspense>
      <SiteContent params={params} />
    </Suspense>
  )
}

async function SiteContent({ params }: Props) {
  const { locale, slug } = await params
  const headersList = await headers()
  const hostname = headersList.get('x-hostname') ?? ''

  // Sprint S12 — page resolver and renderer
  void hostname
  void locale
  void slug

  notFound()
  return null
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  return { title: slug.join('/') }
}
