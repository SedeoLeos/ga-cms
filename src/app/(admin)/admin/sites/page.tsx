import CreateSiteDialog from '@/components/admin/sites/CreateSiteDialog'
import SitesList from '@/components/admin/sites/SitesList'
import type { SiteRow } from '@/components/admin/sites/SitesList'
import { prisma } from '@/lib/db/client'
import type { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = { title: 'Sites' }

export default function SitesPage() {
  return (
    <Suspense>
      <SitesContent />
    </Suspense>
  )
}

async function SitesContent() {
  const raw = await prisma.site.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      slug: true,
      customDomain: true,
      createdAt: true,
      _count: { select: { pages: true } },
    },
  })

  const sites: SiteRow[] = raw.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    customDomain: s.customDomain,
    createdAt: s.createdAt.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    pageCount: s._count.pages,
  }))

  return (
    <div style={{ padding: 32, maxWidth: 1000 }}>
      {/* En-tête */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
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
            Sites
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#5a5a78' }}>
            {sites.length} site{sites.length !== 1 ? 's' : ''}
          </p>
        </div>
        <CreateSiteDialog />
      </div>

      <SitesList sites={sites} />
    </div>
  )
}
