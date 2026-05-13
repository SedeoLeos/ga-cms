import CreateGlobalBlockDialog from '@/components/admin/global-blocks/CreateGlobalBlockDialog'
import GlobalBlocksList from '@/components/admin/global-blocks/GlobalBlocksList'
import type { GlobalBlockRow } from '@/components/admin/global-blocks/GlobalBlocksList'
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
    select: {
      id: true,
      name: true,
      category: true,
      updatedAt: true,
    },
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
    <div style={{ padding: 32, maxWidth: 1000 }}>
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
            Blocs globaux
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#5a5a78' }}>
            {total} bloc{total !== 1 ? 's' : ''}
          </p>
        </div>
        <CreateGlobalBlockDialog />
      </div>

      <GlobalBlocksList blocks={blocks} />
    </div>
  )
}
