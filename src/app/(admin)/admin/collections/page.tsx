import CollectionsList from '@/components/admin/collections/CollectionsList'
import type { CollectionRow } from '@/components/admin/collections/CollectionsList'
import CreateCollectionDialog from '@/components/admin/collections/CreateCollectionDialog'
import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AdminPageHeader
        title="Collections"
        subtitle={`${total} collection${total !== 1 ? 's' : ''}`}
        action={<CreateCollectionDialog />}
      />
      <div style={{ padding: '20px 28px', flex: 1 }}>
        <CollectionsList collections={collections} />
      </div>
    </div>
  )
}
