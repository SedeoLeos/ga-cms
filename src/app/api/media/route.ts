import { prisma } from '@/lib/db/client'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const folderId = searchParams.get('folderId') || null

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

  return NextResponse.json({ folders, files })
}
