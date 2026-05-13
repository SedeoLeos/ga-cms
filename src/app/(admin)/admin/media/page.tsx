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
    <div style={{ padding: 32, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
          flexShrink: 0,
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
            Médiathèque
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#5a5a78' }}>
            {initialFiles.length} fichier{initialFiles.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <MediaLibrary initialFiles={initialFiles} initialFolders={initialFolders} mode="page" />
      </div>
    </div>
  )
}
