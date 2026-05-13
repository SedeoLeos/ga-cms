import { prisma } from '@/lib/db/client'
import { getSettings } from '@/lib/settings'
import { NextResponse } from 'next/server'

interface Params {
  params: Promise<{ postTypeSlug: string }>
}

function escXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET(_req: Request, { params }: Params) {
  const { postTypeSlug } = await params

  const [postType, settings] = await Promise.all([
    prisma.postType.findFirst({
      where: { slug: postTypeSlug, hasRss: true },
      select: { id: true, name: true, slug: true, description: true },
    }),
    getSettings(),
  ])

  if (!postType) {
    return NextResponse.json({ error: 'Flux non disponible' }, { status: 404 })
  }

  const base = settings.url?.replace(/\/$/, '') ?? ''
  const locale = settings.defaultLocale

  const entries = await prisma.postEntry.findMany({
    where: { postTypeId: postType.id, status: 'PUBLISHED', locale },
    orderBy: { publishedAt: 'desc' },
    take: 50,
    select: {
      id: true,
      title: true,
      slug: true,
      publishedAt: true,
      data: true,
    },
  })

  const channelLink = `${base}/${locale}/${postType.slug}`
  const feedUrl = `${base}/api/rss/${postType.slug}`

  const items = entries
    .map((entry) => {
      const link = `${channelLink}/${entry.slug}`
      const pubDate = entry.publishedAt ? new Date(entry.publishedAt).toUTCString() : ''
      const data = entry.data as Record<string, unknown>
      const descRaw =
        Object.values(data).find((v) => typeof v === 'string' && (v as string).length > 0) ?? ''
      const desc = escXml(
        String(descRaw)
          .replace(/<[^>]+>/g, '')
          .slice(0, 300),
      )
      return `    <item>
      <title>${escXml(entry.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      ${pubDate ? `<pubDate>${pubDate}</pubDate>` : ''}
      ${desc ? `<description>${desc}</description>` : ''}
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escXml(postType.name)} — ${escXml(settings.name)}</title>
    <link>${channelLink}</link>
    <description>${escXml(postType.description ?? settings.description ?? postType.name)}</description>
    <language>${locale}</language>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
