import { prisma } from '@/lib/db/client'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'

// Platform-agnostic scheduled publish endpoint.
// Call it from any platform:
//   Vercel Cron  → vercel.json (see docs/DEPLOYMENT.md)
//   Railway      → HTTP cron pointing to this URL
//   Self-hosted  → crontab: * * * * * curl -s "http://localhost:3000/api/cron/publish?secret=..."
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')

  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  const scheduled = await prisma.page.findMany({
    where: {
      status: 'DRAFT',
      scheduledAt: { lte: now },
    },
    select: { id: true, slug: true, locale: true, draftJson: true },
  })

  if (scheduled.length === 0) {
    return NextResponse.json({ published: 0 })
  }

  let published = 0

  for (const page of scheduled) {
    await prisma.page.update({
      where: { id: page.id },
      data: {
        status: 'PUBLISHED',
        publishedJson: (page.draftJson as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        publishedAt: now,
        scheduledAt: null,
        revisions: {
          create: { json: (page.draftJson as Prisma.InputJsonValue) ?? {}, publishedBy: 'cron' },
        },
      },
    })

    revalidatePath(`/${page.locale}/${page.slug}`)
    published++
  }

  return NextResponse.json({ published })
}
