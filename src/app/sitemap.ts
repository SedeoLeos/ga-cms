import { prisma } from '@/lib/db/client'
import { getSettings } from '@/lib/settings'
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSettings()
  const base = settings.url?.replace(/\/$/, '') ?? ''

  const [pages, postTypes, taxonomies] = await Promise.all([
    prisma.page.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.postType.findMany({
      select: {
        slug: true,
        hasArchive: true,
        entries: {
          where: { status: 'PUBLISHED' },
          select: { slug: true, updatedAt: true, publishedAt: true },
          orderBy: { publishedAt: 'desc' },
        },
      },
    }),
    prisma.taxonomy.findMany({
      select: { slug: true, terms: { select: { slug: true } } },
    }),
  ])

  const items: MetadataRoute.Sitemap = []

  for (const p of pages) {
    const url = p.slug === 'index' ? base || '/' : `${base}/${p.slug}`
    items.push({ url, lastModified: p.updatedAt, changeFrequency: 'weekly', priority: 0.8 })
  }

  for (const pt of postTypes) {
    if (pt.hasArchive) {
      items.push({ url: `${base}/${pt.slug}`, changeFrequency: 'daily', priority: 0.7 })
    }
    for (const entry of pt.entries) {
      items.push({
        url: `${base}/${pt.slug}/${entry.slug}`,
        lastModified: entry.publishedAt ?? entry.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.6,
      })
    }
  }

  for (const tax of taxonomies) {
    for (const term of tax.terms) {
      items.push({
        url: `${base}/${tax.slug}/${term.slug}`,
        changeFrequency: 'weekly',
        priority: 0.5,
      })
    }
  }

  return items
}
