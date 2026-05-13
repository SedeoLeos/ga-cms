import CreatePageDialog from '@/components/admin/pages/CreatePageDialog'
import PagesList from '@/components/admin/pages/PagesList'
import type { PageRow } from '@/components/admin/pages/PagesList'
import { prisma } from '@/lib/db/client'
import { getSettings } from '@/lib/settings'
import type { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = { title: 'Pages' }

export default function PagesPage() {
  return (
    <Suspense>
      <PagesContent />
    </Suspense>
  )
}

async function PagesContent() {
  const [rawPages, settings] = await Promise.all([
    prisma.page.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        locale: true,
        status: true,
        updatedAt: true,
      },
    }),
    getSettings(),
  ])

  const pages: PageRow[] = rawPages.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    locale: p.locale,
    status: p.status,
    updatedAt: p.updatedAt.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
  }))

  return (
    <div style={{ padding: 32, maxWidth: 1000 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 600,
              color: '#e8e8f0',
              letterSpacing: '-0.01em',
            }}
          >
            Pages
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#5a5a78' }}>
            {pages.length} page{pages.length !== 1 ? 's' : ''}
          </p>
        </div>
        <CreatePageDialog locales={settings.locales} defaultLocale={settings.defaultLocale} />
      </div>

      <PagesList pages={pages} />
    </div>
  )
}
