import CreateCollectionDialog from '@/components/admin/collections/CreateCollectionDialog'
import type { SiteOption } from '@/components/admin/collections/CreateCollectionDialog'
import CollectionsList from '@/components/admin/collections/CollectionsList'
import type { CollectionRow, SiteTab } from '@/components/admin/collections/CollectionsList'
import { prisma } from '@/lib/db/client'
import type { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = { title: 'Collections' }

interface Props {
  searchParams: Promise<{ siteId?: string }>
}

export default function CollectionsPage({ searchParams }: Props) {
  return (
    <Suspense>
      <CollectionsContent searchParams={searchParams} />
    </Suspense>
  )
}

async function CollectionsContent({ searchParams }: Props) {
  const { siteId } = await searchParams

  const [rawSites, rawCollections] = await Promise.all([
    prisma.site.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
    prisma.collection.findMany({
      where: siteId ? { siteId } : {},
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        siteId: true,
        name: true,
        slug: true,
        description: true,
        updatedAt: true,
        site: { select: { name: true } },
        _count: { select: { entries: true } },
      },
    }),
  ])

  const sites: SiteOption[] = rawSites.map((s) => ({ id: s.id, name: s.name }))

  const collections: CollectionRow[] = rawCollections.map((c) => ({
    id: c.id,
    siteId: c.siteId,
    siteName: c.site.name,
    name: c.name,
    slug: c.slug,
    description: c.description,
    entryCount: c._count.entries,
    updatedAt: c.updatedAt.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
  }))

  const allCounts = await prisma.collection.groupBy({
    by: ['siteId'],
    _count: { id: true },
  })

  const tabs: SiteTab[] = rawSites
    .map((s) => ({
      id: s.id,
      name: s.name,
      count: allCounts.find((g) => g.siteId === s.id)?._count.id ?? 0,
    }))
    .filter((t) => t.count > 0 || !siteId)

  const total = collections.length

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
            Collections
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#5a5a78' }}>
            {total} collection{total !== 1 ? 's' : ''}
            {siteId && rawSites.find((s) => s.id === siteId)
              ? ` — ${rawSites.find((s) => s.id === siteId)?.name}`
              : ''}
          </p>
        </div>
        {sites.length > 0 && <CreateCollectionDialog sites={sites} />}
      </div>

      <CollectionsList collections={collections} tabs={tabs} currentSiteId={siteId} />
    </div>
  )
}
