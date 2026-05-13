import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import MembersList from '@/components/admin/sites/MembersList'
import type { MemberRow } from '@/components/admin/sites/MembersList'
import { prisma } from '@/lib/db/client'
import type { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = { title: 'Membres' }

export default function MembersPage() {
  return (
    <Suspense>
      <MembersContent />
    </Suspense>
  )
}

async function MembersContent() {
  const rawMembers = await prisma.siteMember.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      emailVerified: true,
      createdAt: true,
      lastLoginAt: true,
    },
  })

  const members: MemberRow[] = rawMembers.map((m) => ({
    id: m.id,
    email: m.email,
    name: m.name,
    emailVerified: m.emailVerified,
    createdAt: m.createdAt.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    lastLoginAt: m.lastLoginAt
      ? m.lastLoginAt.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : null,
  }))

  const total = members.length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AdminPageHeader title="Membres" subtitle={`${total} membre${total !== 1 ? 's' : ''}`} />
      <div style={{ padding: '20px 28px', flex: 1, maxWidth: 900 }}>
        <MembersList members={members} />
      </div>
    </div>
  )
}
