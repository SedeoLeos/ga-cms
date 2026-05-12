import EntryForm from '@/components/admin/collections/EntryForm'
import type { SchemaField } from '@/lib/actions/collections'
import { prisma } from '@/lib/db/client'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

interface Props {
  params: Promise<{ collectionId: string; entryId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { entryId } = await params
  const entry = await prisma.collectionEntry.findUnique({
    where: { id: entryId },
    select: { collection: { select: { name: true } } },
  })
  return { title: entry ? `Édition — ${entry.collection.name}` : 'Édition' }
}

export default function EntryEditPage({ params }: Props) {
  return (
    <Suspense>
      <EntryEditContent params={params} />
    </Suspense>
  )
}

async function EntryEditContent({ params }: Props) {
  const { collectionId, entryId } = await params

  const entry = await prisma.collectionEntry.findUnique({
    where: { id: entryId },
    select: {
      id: true,
      locale: true,
      status: true,
      data: true,
      createdAt: true,
      updatedAt: true,
      collection: {
        select: {
          id: true,
          name: true,
          slug: true,
          schema: true,
          site: {
            select: {
              locales: true,
              defaultLocale: true,
            },
          },
        },
      },
    },
  })

  if (!entry || entry.collection.id !== collectionId) notFound()

  const schema = entry.collection.schema as unknown as SchemaField[]
  const siteLocales = entry.collection.site.locales as string[]

  const createdAt = entry.createdAt.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  const updatedAt = entry.updatedAt.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div style={{ padding: 32, maxWidth: 1020 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
        <Link
          href="/admin/collections"
          style={{ fontSize: 13, color: '#4a4a68', textDecoration: 'none' }}
        >
          Collections
        </Link>
        <span style={{ fontSize: 13, color: '#2e2e42' }}>/</span>
        <Link
          href={`/admin/collections/${collectionId}`}
          style={{ fontSize: 13, color: '#4a4a68', textDecoration: 'none' }}
        >
          {entry.collection.name}
        </Link>
        <span style={{ fontSize: 13, color: '#2e2e42' }}>/</span>
        <Link
          href={`/admin/collections/${collectionId}/entries`}
          style={{ fontSize: 13, color: '#4a4a68', textDecoration: 'none' }}
        >
          Entrées
        </Link>
        <span style={{ fontSize: 13, color: '#2e2e42' }}>/</span>
        <span style={{ fontSize: 13, color: '#e8e8f0' }}>Édition</span>
      </div>

      <EntryForm
        entryId={entry.id}
        collectionId={collectionId}
        collectionName={entry.collection.name}
        schema={schema}
        initialData={entry.data as Record<string, unknown>}
        initialStatus={entry.status}
        initialLocale={entry.locale}
        siteLocales={siteLocales}
        createdAt={createdAt}
        updatedAt={updatedAt}
      />
    </div>
  )
}
