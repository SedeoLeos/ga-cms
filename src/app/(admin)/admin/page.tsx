import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import { prisma } from '@/lib/db/client'
import { ArrowRight, Database, FileText, Image, Layers } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'

export const metadata: Metadata = { title: 'Dashboard' }

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  )
}

async function DashboardContent() {
  const [pageCount, collectionCount, postTypeCount, mediaCount] = await Promise.all([
    prisma.page.count(),
    prisma.collection.count(),
    prisma.postType.count(),
    prisma.mediaFile.count(),
  ])

  const STATS = [
    { label: 'Pages', value: pageCount, icon: FileText, color: '#2563eb', href: '/admin/pages' },
    {
      label: 'Collections',
      value: collectionCount,
      icon: Database,
      color: '#22c55e',
      href: '/admin/collections',
    },
    {
      label: 'Post Types',
      value: postTypeCount,
      icon: Layers,
      color: '#f59e0b',
      href: '/admin/post-types',
    },
    { label: 'Médias', value: mediaCount, icon: Image, color: '#a855f7', href: '/admin/media' },
  ]

  const QUICK: { label: string; href: string }[] = [
    { label: 'Nouvelle page', href: '/admin/pages' },
    { label: 'Ajouter un média', href: '/admin/media' },
    { label: 'Nouveau post type', href: '/admin/post-types' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AdminPageHeader title="Dashboard" subtitle="Vue d'ensemble de votre espace de travail" />

      <div style={{ padding: '24px 28px', flex: 1 }}>
        {/* Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 10,
            marginBottom: 28,
          }}
        >
          {STATS.map((stat) => {
            const Icon = stat.icon
            return (
              <Link key={stat.label} href={stat.href} style={{ textDecoration: 'none' }}>
                <div
                  className="stat-card"
                  style={{
                    background: '#10101a',
                    border: '1px solid #27272a',
                    borderRadius: 10,
                    padding: '16px 18px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 26,
                        fontWeight: 700,
                        color: '#f4f4f5',
                        lineHeight: 1,
                        letterSpacing: '-0.03em',
                        marginBottom: 6,
                      }}
                    >
                      {stat.value}
                    </div>
                    <div style={{ fontSize: 12, color: '#4e4e68' }}>{stat.label}</div>
                  </div>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      background: `${stat.color}16`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={16} strokeWidth={1.5} color={stat.color} />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Actions rapides */}
        <div>
          <p
            style={{
              margin: '0 0 10px',
              fontSize: 11,
              fontWeight: 600,
              color: '#35354e',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
            }}
          >
            Actions rapides
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {QUICK.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="admin-quick-action"
                style={{
                  height: 32,
                  padding: '0 14px',
                  background: '#10101a',
                  border: '1px solid #27272a',
                  borderRadius: 7,
                  fontSize: 12,
                  color: '#8a8aaa',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  letterSpacing: '-0.01em',
                }}
              >
                {a.label}
                <ArrowRight size={12} strokeWidth={1.5} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
