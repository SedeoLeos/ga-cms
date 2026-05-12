import CreatePageDialog from '@/components/admin/pages/CreatePageDialog'
import type { SiteOption } from '@/components/admin/pages/CreatePageDialog'
import PagesList from '@/components/admin/pages/PagesList'
import type { PageRow, SiteTab } from '@/components/admin/pages/PagesList'
import { prisma } from '@/lib/db/client'
import type { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = { title: 'Pages' }

interface Props {
  searchParams: Promise<{ siteId?: string }>
}

export default function PagesPage({ searchParams }: Props) {
  return (
    <Suspense>
      <PagesContent searchParams={searchParams} />
    </Suspense>
  )
}

async function PagesContent({ searchParams }: Props) {
  const { siteId } = await searchParams

  const [rawSites, rawPages] = await Promise.all([
    prisma.site.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, locales: true, defaultLocale: true },
    }),
    prisma.page.findMany({
      where: siteId ? { siteId } : {},
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        siteId: true,
        title: true,
        slug: true,
        locale: true,
        status: true,
        updatedAt: true,
        site: { select: { name: true } },
      },
    }),
  ])

  const sites: SiteOption[] = rawSites.map((s) => ({
    id: s.id,
    name: s.name,
    locales: s.locales as string[],
    defaultLocale: s.defaultLocale,
  }))

  const pages: PageRow[] = rawPages.map((p) => ({
    id: p.id,
    siteId: p.siteId,
    siteName: p.site.name,
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

  // Compteur par site pour les onglets (toujours sur la totalité)
  const allPages = await prisma.page.groupBy({
    by: ['siteId'],
    _count: { id: true },
  })

  const tabs: SiteTab[] = rawSites
    .map((s) => ({
      id: s.id,
      name: s.name,
      count: allPages.find((g) => g.siteId === s.id)?._count.id ?? 0,
    }))
    .filter((t) => t.count > 0 || !siteId)

  const total = pages.length

  return (
    <div style={{ padding: 32, maxWidth: 1000 }}>
      {/* En-tête */}
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
            {total} page{total !== 1 ? 's' : ''}
            {siteId && rawSites.find((s) => s.id === siteId)
              ? ` — ${rawSites.find((s) => s.id === siteId)?.name}`
              : ''}
          </p>
        </div>
        {sites.length > 0 && <CreatePageDialog sites={sites} />}
      </div>

      <PagesList pages={pages} tabs={tabs} currentSiteId={siteId} />
    </div>
  )
}
