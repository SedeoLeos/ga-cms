import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import MediaLibrary from '@/components/admin/media/MediaLibrary'
import type { MediaFileItem, MediaFolderItem } from '@/components/admin/media/MediaLibrary'
import { prisma } from '@/lib/db/client'
import type { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = { title: 'Médiathèque' }

interface Props {
  searchParams: Promise<{ folderId?: string }>
}

export default function MediaPage({ searchParams }: Props) {
  return (
    <Suspense>
      <MediaContent searchParams={searchParams} />
    </Suspense>
  )
}

async function MediaContent({ searchParams }: Props) {
  const { folderId: rawFolderId } = await searchParams
  const folderId = rawFolderId ?? null

  const [folders, files] = await Promise.all([
    prisma.mediaFolder.findMany({
      where: { parentId: null },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
    prisma.mediaFile.findMany({
      where: { folderId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        filename: true,
        url: true,
        mimeType: true,
        size: true,
        width: true,
        height: true,
        alt: true,
        createdAt: true,
      },
    }),
  ])

  const initialFolders: MediaFolderItem[] = folders
  const initialFiles: MediaFileItem[] = files.map((f) => ({
    ...f,
    createdAt: f.createdAt.toISOString(),
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AdminPageHeader
        title="Médiathèque"
        subtitle={`${initialFiles.length} fichier${initialFiles.length !== 1 ? 's' : ''}`}
      />
      <div style={{ flex: 1, minHeight: 0, padding: '20px 28px' }}>
        <MediaLibrary initialFiles={initialFiles} initialFolders={initialFolders} mode="page" />
      </div>
    </div>
  )
}
