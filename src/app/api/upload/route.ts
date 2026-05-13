import { prisma } from '@/lib/db/client'
import { localUpload } from '@/lib/storage/local'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const fd = await req.formData()
    const file = fd.get('file') as File | null
    const folderId = (fd.get('folderId') as string) || null

    if (!file) {
      return NextResponse.json({ error: 'file requis' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const url = await localUpload(buffer, file.name)

    let width: number | null = null
    let height: number | null = null

    if (file.type.startsWith('image/')) {
      try {
        const sharp = (await import('sharp')).default
        const meta = await sharp(buffer).metadata()
        width = meta.width ?? null
        height = meta.height ?? null
      } catch {
        // sharp optional
      }
    }

    const record = await prisma.mediaFile.create({
      data: {
        folderId,
        filename: file.name,
        url,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        width,
        height,
      },
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
    })

    return NextResponse.json(record)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
