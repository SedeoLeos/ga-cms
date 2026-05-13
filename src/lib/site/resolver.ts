import { getSettings } from '@/lib/settings'

export type ResolvedSite = {
  name: string
  locales: string[]
  defaultLocale: string
  favicon: string | null
}

export async function resolveSite(): Promise<ResolvedSite> {
  const settings = await getSettings()
  return {
    name: settings.name,
    locales: settings.locales,
    defaultLocale: settings.defaultLocale,
    favicon: settings.favicon,
  }
}
