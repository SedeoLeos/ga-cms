import { prisma } from '@/lib/db/client'
import { getSettings } from '@/lib/settings'
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSettings()
  const base = settings.url?.replace(/\/$/, '') ?? ''

  const [pages, postTypes, taxonomies] = await Promise.all([
    prisma.page.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, locale: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.postType.findMany({
      select: {
        slug: true,
        hasArchive: true,
        entries: {
          where: { status: 'PUBLISHED' },
          select: { slug: true, locale: true, updatedAt: true, publishedAt: true },
          orderBy: { publishedAt: 'desc' },
        },
      },
    }),
    prisma.taxonomy.findMany({
      select: {
        slug: true,
        terms: {
          select: { slug: true },
        },
      },
    }),
  ])

  const items: MetadataRoute.Sitemap = []

  // Published pages
  for (const p of pages) {
    items.push({
      url: `${base}/${p.locale}/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  }

  // Post-type archives + individual entries
  for (const pt of postTypes) {
    if (pt.hasArchive) {
      for (const locale of settings.locales) {
        items.push({
          url: `${base}/${locale}/${pt.slug}`,
          changeFrequency: 'daily',
          priority: 0.7,
        })
      }
    }
    for (const entry of pt.entries) {
      items.push({
        url: `${base}/${entry.locale}/${pt.slug}/${entry.slug}`,
        lastModified: entry.publishedAt ?? entry.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.6,
      })
    }
  }

  // Taxonomy term pages
  for (const tax of taxonomies) {
    for (const term of tax.terms) {
      for (const locale of settings.locales) {
        items.push({
          url: `${base}/${locale}/${tax.slug}/${term.slug}`,
          changeFrequency: 'weekly',
          priority: 0.5,
        })
      }
    }
  }

  return items
}
