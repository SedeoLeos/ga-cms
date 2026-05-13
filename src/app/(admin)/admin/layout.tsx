import type { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: { template: '%s — Tatomir', default: 'Tatomir' },
}

// Synchronous outer shell required by PPR (cacheComponents: true).
// The auth check + sidebar live inside Suspense so the static skeleton
// can render immediately while the session resolves.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0e0e14' }}>
      <Suspense fallback={children}>
        <AuthenticatedShell>{children}</AuthenticatedShell>
      </Suspense>
    </div>
  )
}

// Async server component — only rendered after auth resolves.
async function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  const { connection } = await import('next/server')
  await connection()

  const { prisma } = await import('@/lib/db/client')
  const { redirect } = await import('next/navigation')

  const userCount = await prisma.user.count()
  if (userCount === 0) {
    redirect('/setup')
  }

  const { getSession } = await import('@/lib/auth/session')
  const { default: AdminSidebar } = await import('@/components/admin/layout/AdminSidebar')

  const session = await getSession()

  if (!session) {
    // Login page — no sidebar
    return <>{children}</>
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar userName={session.user.name ?? 'Admin'} userEmail={session.user.email ?? ''} />
      <main
        style={{
          flex: 1,
          minWidth: 0,
          overflowY: 'auto',
          color: 'var(--color-text-primary)',
        }}
      >
        {children}
      </main>
    </div>
  )
}
