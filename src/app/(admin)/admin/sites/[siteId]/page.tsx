import SiteSettingsForm from '@/components/admin/sites/SiteSettingsForm'
import type { SiteData } from '@/components/admin/sites/SiteSettingsForm'
import { prisma } from '@/lib/db/client'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

interface Props {
  params: Promise<{ siteId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { siteId } = await params
  const site = await prisma.site.findUnique({ where: { id: siteId }, select: { name: true } })
  return { title: site ? `${site.name} — Paramètres` : 'Site introuvable' }
}

export default function SiteSettingsPage({ params }: Props) {
  return (
    <Suspense>
      <SiteSettingsContent params={params} />
    </Suspense>
  )
}

async function SiteSettingsContent({ params }: Props) {
  const { siteId } = await params

  const raw = await prisma.site.findUnique({
    where: { id: siteId },
    select: {
      id: true,
      name: true,
      slug: true,
      customDomain: true,
      locales: true,
      defaultLocale: true,
    },
  })

  if (!raw) notFound()

  const site: SiteData = {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    customDomain: raw.customDomain,
    locales: raw.locales as string[],
    defaultLocale: raw.defaultLocale,
  }

  return <SiteSettingsForm site={site} />
}
