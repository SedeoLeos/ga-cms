import type { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: { template: '%s — Tatomir', default: 'Tatomir' },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0d0d12' }}>
      <Suspense fallback={children}>
        <AuthenticatedShell>{children}</AuthenticatedShell>
      </Suspense>
    </div>
  )
}

async function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  const { connection } = await import('next/server')
  await connection()

  const { prisma } = await import('@/lib/db/client')
  const { redirect } = await import('next/navigation')

  const userCount = await prisma.user.count()
  if (userCount === 0) {
    redirect('/')
  }

  const { getSession } = await import('@/lib/auth/session')
  const { default: AdminSidebar } = await import('@/components/admin/layout/AdminSidebar')
  const { getSettings } = await import('@/lib/settings')

  const [session, settings] = await Promise.all([getSession(), getSettings()])

  if (!session) {
    return <>{children}</>
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar
        userName={session.user.name ?? 'Admin'}
        userEmail={session.user.email ?? ''}
        siteName={settings.name}
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
