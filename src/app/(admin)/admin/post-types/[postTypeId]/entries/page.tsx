import PostEntriesList from '@/components/admin/post-types/PostEntriesList'
import type { PostEntryRow } from '@/components/admin/post-types/PostEntriesList'
import AdminSearchBar from '@/components/admin/shared/AdminSearchBar'
import { createPostEntryAndRedirect } from '@/lib/actions/post-entries'
import { prisma } from '@/lib/db/client'
import { getSettings } from '@/lib/settings'
import { Plus } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

interface Props {
  params: Promise<{ postTypeId: string }>
  searchParams: Promise<{ search?: string; status?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { postTypeId } = await params
  const pt = await prisma.postType.findUnique({
    where: { id: postTypeId },
    select: { name: true },
  })
  return { title: pt ? `${pt.name} — Billets` : 'Billets' }
}

export default function PostEntriesPage({ params, searchParams }: Props) {
  return (
    <Suspense>
      <PostEntriesContent params={params} searchParams={searchParams} />
    </Suspense>
  )
}

async function PostEntriesContent({ params, searchParams }: Props) {
  const { postTypeId } = await params
  const { search, status } = await searchParams

  const [postType, settings] = await Promise.all([
    prisma.postType.findUnique({
      where: { id: postTypeId },
      select: { id: true, name: true },
    }),
    getSettings(),
  ])

  if (!postType) notFound()

  const allEntries = await prisma.postEntry.findMany({
    where: { postTypeId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      locale: true,
      status: true,
      updatedAt: true,
    },
  })

  const searchLower = search?.toLowerCase()
  const filtered = allEntries
    .filter((e) => !searchLower || e.title.toLowerCase().includes(searchLower))
    .filter((e) => !status || e.status === status)

  const rows: PostEntryRow[] = filtered.map((e) => ({
    id: e.id,
    postTypeId,
    title: e.title,
    slug: e.slug,
    locale: e.locale,
    status: e.status,
    updatedAt: e.updatedAt.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
  }))

  const siteLocales = settings.locales
  const createAction = createPostEntryAndRedirect.bind(null, postTypeId, settings.defaultLocale)

  return (
    <div style={{ padding: 32, maxWidth: 900 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <Link
          href="/admin/post-types"
          style={{ fontSize: 13, color: '#4a4a68', textDecoration: 'none' }}
        >
          Post Types
        </Link>
        <span style={{ fontSize: 13, color: '#2e2e42' }}>/</span>
        <Link
          href={`/admin/post-types/${postTypeId}`}
          style={{ fontSize: 13, color: '#4a4a68', textDecoration: 'none' }}
        >
          {postType.name}
        </Link>
        <span style={{ fontSize: 13, color: '#2e2e42' }}>/</span>
        <span style={{ fontSize: 13, color: '#e8e8f0' }}>Billets</span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
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
            {rows.length} billet{rows.length !== 1 ? 's' : ''}
            {search ? ` pour "${search}"` : ''}
          </p>
        </div>
        <form action={createAction}>
          <button
            type="submit"
            style={{
              height: 32,
              padding: '0 14px',
              background: '#4353ff',
              border: 'none',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 500,
              color: '#fff',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Plus size={14} strokeWidth={2} />
            Nouveau billet
          </button>
        </form>
      </div>

      <div style={{ marginBottom: 16 }}>
        <AdminSearchBar placeholder="Rechercher un billet…" showStatusFilter />
      </div>

      <PostEntriesList entries={rows} showLocale={siteLocales.length > 1} />
    </div>
  )
}
