import CreateGlobalBlockDialog from '@/components/admin/global-blocks/CreateGlobalBlockDialog'
import GlobalBlocksList from '@/components/admin/global-blocks/GlobalBlocksList'
import type { GlobalBlockRow } from '@/components/admin/global-blocks/GlobalBlocksList'
import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import { prisma } from '@/lib/db/client'
import type { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = { title: 'Blocs globaux' }

export default function GlobalBlocksPage() {
  return (
    <Suspense>
      <GlobalBlocksContent />
    </Suspense>
  )
}

async function GlobalBlocksContent() {
  const rawBlocks = await prisma.globalBlock.findMany({
    orderBy: { updatedAt: 'desc' },
    select: { id: true, name: true, category: true, updatedAt: true },
  })

  const blocks: GlobalBlockRow[] = rawBlocks.map((b) => ({
    id: b.id,
    name: b.name,
    category: b.category,
    updatedAt: b.updatedAt.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
  }))

  const total = blocks.length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AdminPageHeader
        title="Blocs globaux"
        subtitle={`${total} bloc${total !== 1 ? 's' : ''}`}
        action={<CreateGlobalBlockDialog />}
      />
      <div style={{ padding: '20px 28px', flex: 1 }}>
        <GlobalBlocksList blocks={blocks} />
      </div>
    </div>
  )
}
