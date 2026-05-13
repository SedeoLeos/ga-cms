import CreatePostTypeDialog from '@/components/admin/post-types/CreatePostTypeDialog'
import PostTypesList from '@/components/admin/post-types/PostTypesList'
import type { PostTypeRow } from '@/components/admin/post-types/PostTypesList'
import { prisma } from '@/lib/db/client'
import type { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = { title: 'Post Types' }

export default function PostTypesPage() {
  return (
    <Suspense>
      <PostTypesContent />
    </Suspense>
  )
}

async function PostTypesContent() {
  const rawPostTypes = await prisma.postType.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      isBuiltIn: true,
      updatedAt: true,
      _count: { select: { entries: true } },
    },
  })

  const postTypes: PostTypeRow[] = rawPostTypes.map((pt) => ({
    id: pt.id,
    name: pt.name,
    slug: pt.slug,
    description: pt.description,
    entryCount: pt._count.entries,
    isBuiltIn: pt.isBuiltIn,
    updatedAt: pt.updatedAt.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
  }))

  const total = postTypes.length

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
            Post Types
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#5a5a78' }}>
            {total} post type{total !== 1 ? 's' : ''}
          </p>
        </div>
        <CreatePostTypeDialog />
      </div>

      <PostTypesList postTypes={postTypes} />
    </div>
  )
}
