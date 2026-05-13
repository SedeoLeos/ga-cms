import DesignTokensEditor from '@/components/admin/design-tokens/DesignTokensEditor'
import type { TokenItem } from '@/components/admin/design-tokens/DesignTokensEditor'
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
    <div style={{ padding: 32, maxWidth: 860 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
          gap: 16,
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
            Design Tokens
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#5a5a78' }}>
            Variables CSS globales du site — accessibles via{' '}
            <code
              style={{
                fontSize: 12,
                fontFamily: 'ui-monospace, monospace',
                background: '#1a1a26',
                padding: '1px 5px',
                borderRadius: 3,
                color: '#8090f0',
              }}
            >
              /api/tokens
            </code>
          </p>
        </div>
      </div>

      <DesignTokensEditor tokens={tokens} />
    </div>
  )
}
