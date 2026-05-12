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
  const { auth } = await import('@/lib/auth/config')
  const { default: AdminSidebar } = await import('@/components/admin/layout/AdminSidebar')

  const session = await auth()

  if (!session) {
    // Login page — no sidebar
    return <>{children}</>
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar
        userName={session.user?.name ?? 'Admin'}
        userEmail={session.user?.email ?? ''}
      />
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
