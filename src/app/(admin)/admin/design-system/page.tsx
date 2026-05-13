import DesignTokensEditor from '@/components/admin/design-tokens/DesignTokensEditor'
import type { TokenItem } from '@/components/admin/design-tokens/DesignTokensEditor'
import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import { prisma } from '@/lib/db/client'
import type { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = { title: 'Design Tokens' }

export default function DesignSystemPage() {
  return (
    <Suspense>
      <DesignSystemContent />
    </Suspense>
  )
}

async function DesignSystemContent() {
  const rawTokens = await prisma.designToken.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, value: true, type: true },
  })

  const tokens: TokenItem[] = rawTokens

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AdminPageHeader
        title="Design System"
        subtitle={
          <>
            Variables CSS globales —{' '}
            <code
              style={{
                fontSize: 11,
                fontFamily: 'ui-monospace, monospace',
                background: '#16161f',
                padding: '1px 5px',
                borderRadius: 3,
                color: '#7080e8',
              }}
            >
              /api/tokens
            </code>
          </>
        }
      />
      <div style={{ padding: '20px 28px', maxWidth: 860 }}>
        <DesignTokensEditor tokens={tokens} />
      </div>
    </div>
  )
}
