import CreatePostTypeDialog from '@/components/admin/post-types/CreatePostTypeDialog'
import type { SiteOption } from '@/components/admin/post-types/CreatePostTypeDialog'
import PostTypesList from '@/components/admin/post-types/PostTypesList'
import type { PostTypeRow, SiteTab } from '@/components/admin/post-types/PostTypesList'
import { prisma } from '@/lib/db/client'
import type { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = { title: 'Post Types' }

interface Props {
  searchParams: Promise<{ siteId?: string }>
}

export default function PostTypesPage({ searchParams }: Props) {
  return (
    <Suspense>
      <PostTypesContent searchParams={searchParams} />
    </Suspense>
  )
}

async function PostTypesContent({ searchParams }: Props) {
  const { siteId } = await searchParams

  const [rawSites, rawPostTypes] = await Promise.all([
    prisma.site.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
    prisma.postType.findMany({
      where: siteId ? { siteId } : {},
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        siteId: true,
        name: true,
        slug: true,
        description: true,
        isBuiltIn: true,
        updatedAt: true,
        site: { select: { name: true } },
        _count: { select: { entries: true } },
      },
    }),
  ])

  const sites: SiteOption[] = rawSites.map((s) => ({ id: s.id, name: s.name }))

  const postTypes: PostTypeRow[] = rawPostTypes.map((pt) => ({
    id: pt.id,
    siteId: pt.siteId,
    siteName: pt.site.name,
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

  const allCounts = await prisma.postType.groupBy({
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
            {siteId && rawSites.find((s) => s.id === siteId)
              ? ` — ${rawSites.find((s) => s.id === siteId)?.name}`
              : ''}
          </p>
        </div>
        {sites.length > 0 && <CreatePostTypeDialog sites={sites} />}
      </div>

      <PostTypesList postTypes={postTypes} tabs={tabs} currentSiteId={siteId} />
    </div>
  )
}
