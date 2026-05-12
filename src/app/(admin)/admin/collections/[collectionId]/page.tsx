import SchemaBuilder from '@/components/admin/collections/SchemaBuilder'
import type { SchemaField } from '@/lib/actions/collections'
import { updateCollectionSchemaAction } from '@/lib/actions/collections'
import { prisma } from '@/lib/db/client'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

interface Props {
  params: Promise<{ collectionId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collectionId } = await params
  const col = await prisma.collection.findUnique({
    where: { id: collectionId },
    select: { name: true },
  })
  return { title: col ? `${col.name} — Schéma` : 'Schéma' }
}

export default function CollectionSchemaPage({ params }: Props) {
  return (
    <Suspense>
      <CollectionSchemaContent params={params} />
    </Suspense>
  )
}

async function CollectionSchemaContent({ params }: Props) {
  const { collectionId } = await params

  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      schema: true,
      site: {
        select: {
          id: true,
          name: true,
          collections: {
            where: { id: { not: collectionId } },
            select: { id: true, name: true },
            orderBy: { name: 'asc' },
          },
        },
      },
    },
  })

  if (!collection) notFound()

  return (
    <div style={{ padding: 32, maxWidth: 760 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <Link
          href="/admin/collections"
          style={{ fontSize: 13, color: '#4a4a68', textDecoration: 'none' }}
        >
          Collections
        </Link>
        <span style={{ fontSize: 13, color: '#2e2e42' }}>/</span>
        <span style={{ fontSize: 13, color: '#e8e8f0' }}>{collection.name}</span>
      </div>

      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 600,
            color: '#e8e8f0',
            letterSpacing: '-0.01em',
          }}
        >
          {collection.name}
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#5a5a78' }}>
          {collection.description ?? `/${collection.slug}`}
        </p>
      </div>

      <SchemaBuilder
        saveAction={updateCollectionSchemaAction.bind(null, collection.id)}
        initialSchema={(collection.schema as unknown as SchemaField[]) ?? []}
        siblingCollections={collection.site.collections}
      />
    </div>
  )
}
