import SchemaBuilder from '@/components/admin/collections/SchemaBuilder'
import type { SchemaField } from '@/lib/actions/collections'
import { updatePostTypeSchemaAction } from '@/lib/actions/post-types'
import { prisma } from '@/lib/db/client'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

interface Props {
  params: Promise<{ postTypeId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { postTypeId } = await params
  const pt = await prisma.postType.findUnique({
    where: { id: postTypeId },
    select: { name: true },
  })
  return { title: pt ? `${pt.name} — Schéma` : 'Schéma' }
}

export default function PostTypeSchemaPage({ params }: Props) {
  return (
    <Suspense>
      <PostTypeSchemaContent params={params} />
    </Suspense>
  )
}

async function PostTypeSchemaContent({ params }: Props) {
  const { postTypeId } = await params

  const [postType, collections] = await Promise.all([
    prisma.postType.findUnique({
      where: { id: postTypeId },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        isBuiltIn: true,
        hasArchive: true,
        hasRss: true,
        schema: true,
      },
    }),
    prisma.collection.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ])

  if (!postType) notFound()

  return (
    <div style={{ padding: 32, maxWidth: 760 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <Link
          href="/admin/post-types"
          style={{ fontSize: 13, color: '#4a4a68', textDecoration: 'none' }}
        >
          Post Types
        </Link>
        <span style={{ fontSize: 13, color: '#2e2e42' }}>/</span>
        <span style={{ fontSize: 13, color: '#e8e8f0' }}>{postType.name}</span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 28,
          gap: 16,
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
            {postType.name}
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#5a5a78' }}>
            {postType.description ?? `/${postType.slug}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {postType.hasArchive && (
            <span
              style={{
                height: 22,
                padding: '0 8px',
                display: 'inline-flex',
                alignItems: 'center',
                background: '#1a1a26',
                border: '1px solid #2a2a3e',
                borderRadius: 4,
                fontSize: 11,
                color: '#5a5a78',
              }}
            >
              archive
            </span>
          )}
          {postType.hasRss && (
            <span
              style={{
                height: 22,
                padding: '0 8px',
                display: 'inline-flex',
                alignItems: 'center',
                background: '#1a1a26',
                border: '1px solid #2a2a3e',
                borderRadius: 4,
                fontSize: 11,
                color: '#5a5a78',
              }}
            >
              rss
            </span>
          )}
          {postType.isBuiltIn && (
            <span
              style={{
                height: 22,
                padding: '0 8px',
                display: 'inline-flex',
                alignItems: 'center',
                background: '#1e1e2e',
                border: '1px solid #2a2a3e',
                borderRadius: 4,
                fontSize: 11,
                color: '#4a4a68',
              }}
            >
              built-in
            </span>
          )}
        </div>
      </div>

      <SchemaBuilder
        saveAction={updatePostTypeSchemaAction.bind(null, postType.id)}
        initialSchema={(postType.schema as unknown as SchemaField[]) ?? []}
        siblingCollections={collections}
      />
    </div>
  )
}
