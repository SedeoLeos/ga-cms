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
    <div style={{ padding: 32, maxWidth: 900 }}>
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
            Membres
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#5a5a78' }}>
            {total} membre{total !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <MembersList members={members} />
    </div>
  )
}
