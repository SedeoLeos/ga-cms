import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
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
      select: { id: true, title: true, slug: true, locale: true, status: true, updatedAt: true },
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AdminPageHeader
        title="Pages"
        subtitle={`${pages.length} page${pages.length !== 1 ? 's' : ''}`}
        action={
          <CreatePageDialog locales={settings.locales} defaultLocale={settings.defaultLocale} />
        }
      />
      <div style={{ padding: '20px 28px', flex: 1 }}>
        <PagesList pages={pages} />
      </div>
    </div>
  )
}
