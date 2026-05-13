import PostEntryForm from '@/components/admin/post-types/PostEntryForm'
import type { SchemaField } from '@/lib/actions/collections'
import { prisma } from '@/lib/db/client'
import { getSettings } from '@/lib/settings'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

interface Props {
  params: Promise<{ postTypeId: string; entryId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { entryId } = await params
  const entry = await prisma.postEntry.findUnique({
    where: { id: entryId },
    select: { title: true, postType: { select: { name: true } } },
  })
  return { title: entry ? `${entry.title} — ${entry.postType.name}` : 'Édition' }
}

export default function PostEntryEditPage({ params }: Props) {
  return (
    <Suspense>
      <PostEntryEditContent params={params} />
    </Suspense>
  )
}

async function PostEntryEditContent({ params }: Props) {
  const { postTypeId, entryId } = await params

  const entry = await prisma.postEntry.findUnique({
    where: { id: entryId },
    select: {
      id: true,
      title: true,
      slug: true,
      locale: true,
      status: true,
      data: true,
      createdAt: true,
      updatedAt: true,
      terms: { select: { termId: true } },
      postType: {
        select: {
          id: true,
          name: true,
          schema: true,
          taxonomies: {
            select: {
              taxonomy: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  hierarchical: true,
                  terms: {
                    select: { id: true, name: true, slug: true, parentId: true },
                    orderBy: { order: 'asc' },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  if (!entry || entry.postType.id !== postTypeId) notFound()

  const settings = await getSettings()
  const schema = entry.postType.schema as unknown as SchemaField[]
  const siteLocales = settings.locales
  const taxonomies = entry.postType.taxonomies.map((pt) => pt.taxonomy)
  const currentTermIds = entry.terms.map((t) => t.termId)

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
          href="/admin/post-types"
          style={{ fontSize: 13, color: '#52525b', textDecoration: 'none' }}
        >
          Post Types
        </Link>
        <span style={{ fontSize: 13, color: '#2e2e42' }}>/</span>
        <Link
          href={`/admin/post-types/${postTypeId}`}
          style={{ fontSize: 13, color: '#52525b', textDecoration: 'none' }}
        >
          {entry.postType.name}
        </Link>
        <span style={{ fontSize: 13, color: '#2e2e42' }}>/</span>
        <Link
          href={`/admin/post-types/${postTypeId}/entries`}
          style={{ fontSize: 13, color: '#52525b', textDecoration: 'none' }}
        >
          Billets
        </Link>
        <span style={{ fontSize: 13, color: '#2e2e42' }}>/</span>
        <span
          style={{
            fontSize: 13,
            color: '#f4f4f5',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: 220,
          }}
        >
          {entry.title}
        </span>
      </div>

      <PostEntryForm
        entryId={entry.id}
        postTypeId={postTypeId}
        postTypeName={entry.postType.name}
        schema={schema}
        initialTitle={entry.title}
        initialSlug={entry.slug}
        initialData={entry.data as Record<string, unknown>}
        initialStatus={entry.status}
        initialLocale={entry.locale}
        siteLocales={siteLocales}
        taxonomies={taxonomies}
        initialTermIds={currentTermIds}
        createdAt={createdAt}
        updatedAt={updatedAt}
      />
    </div>
  )
}
