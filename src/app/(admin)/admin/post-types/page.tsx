import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AdminPageHeader
        title="Post Types"
        subtitle={`${total} post type${total !== 1 ? 's' : ''}`}
        action={<CreatePostTypeDialog />}
      />
      <div style={{ padding: '20px 28px', flex: 1 }}>
        <PostTypesList postTypes={postTypes} />
      </div>
    </div>
  )
}
