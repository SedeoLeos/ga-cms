import { prisma } from '@/lib/db/client'
import { connection } from 'next/server'

export type SiteSettings = {
  name: string
  description: string | null
  url: string | null
  favicon: string | null
  logo: string | null
  locales: string[]
  defaultLocale: string
}

const DEFAULTS: SiteSettings = {
  name: 'Mon Site',
  description: null,
  url: null,
  favicon: null,
  logo: null,
  locales: ['fr'],
  defaultLocale: 'fr',
}

export async function getSettings(): Promise<SiteSettings> {
  // Signal to Next.js that this route is always dynamic (never prerendered)
  await connection()
  const row = await prisma.settings.findUnique({ where: { id: 1 } })
  if (!row) return DEFAULTS
  return {
    name: row.name,
    description: row.description,
    url: row.url,
    favicon: row.favicon,
    logo: row.logo,
    locales: typeof row.locales === 'string'
      ? (JSON.parse(row.locales) as string[])
      : DEFAULTS.locales,
    defaultLocale: row.defaultLocale,
  }
}
