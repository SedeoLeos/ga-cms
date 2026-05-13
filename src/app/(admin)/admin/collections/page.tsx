import CollectionsList from '@/components/admin/collections/CollectionsList'
import type { CollectionRow } from '@/components/admin/collections/CollectionsList'
import CreateCollectionDialog from '@/components/admin/collections/CreateCollectionDialog'
import { prisma } from '@/lib/db/client'
import type { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = { title: 'Collections' }

export default function CollectionsPage() {
  return (
    <Suspense>
      <CollectionsContent />
    </Suspense>
  )
}

async function CollectionsContent() {
  const rawCollections = await prisma.collection.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      updatedAt: true,
      _count: { select: { entries: true } },
    },
  })

  const collections: CollectionRow[] = rawCollections.map((c) => ({
    id: c.id,
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
          </p>
        </div>
        <CreateCollectionDialog />
      </div>

      <CollectionsList collections={collections} />
    </div>
  )
}
