import { prisma } from '@/lib/db/client'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

interface Props {
  params: Promise<{ siteId: string }>
}

export const metadata: Metadata = { title: 'Paramètres du site' }

export default function SiteSettingsPage({ params }: Props) {
  return (
    <Suspense>
      <SiteSettingsContent params={params} />
    </Suspense>
  )
}

async function SiteSettingsContent({ params }: Props) {
  const { siteId } = await params
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    select: { id: true, name: true, slug: true, customDomain: true },
  })
  if (!site) notFound()

  return (
    <div style={{ padding: 32, maxWidth: 700 }}>
      <h1
        style={{
          margin: '0 0 4px',
          fontSize: 20,
          fontWeight: 600,
          color: '#e8e8f0',
          letterSpacing: '-0.01em',
        }}
      >
        {site.name}
      </h1>
      <p style={{ margin: '0 0 32px', fontSize: 13, color: '#5a5a78' }}>
        Paramètres du site · Sprint S3
      </p>
      <div
        style={{
          background: '#13131c',
          border: '1px solid #1f1f2e',
          borderRadius: 10,
          padding: 24,
          color: '#5a5a78',
          fontSize: 13,
        }}
      >
        <p style={{ margin: 0 }}>
          <strong style={{ color: '#8a8aa8' }}>ID :</strong> {site.id}
        </p>
        <p style={{ margin: '8px 0 0' }}>
          <strong style={{ color: '#8a8aa8' }}>Slug :</strong> /{site.slug}
        </p>
        {site.customDomain && (
          <p style={{ margin: '8px 0 0' }}>
            <strong style={{ color: '#8a8aa8' }}>Domaine :</strong> {site.customDomain}
          </p>
        )}
        <p style={{ margin: '20px 0 0', color: '#3e3e52' }}>
          La page de configuration complète (nom, domaine, locales, auth membres) arrive en Sprint
          S3.
        </p>
      </div>
    </div>
  )
}
