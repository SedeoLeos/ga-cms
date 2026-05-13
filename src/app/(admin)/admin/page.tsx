import { prisma } from '@/lib/db/client'
import { FileText, Image, Layers, Tag } from 'lucide-react'
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
    { label: 'Pages', value: pageCount, icon: FileText, color: '#4353ff', href: '/admin/pages' },
    {
      label: 'Collections',
      value: collectionCount,
      icon: Layers,
      color: '#22c55e',
      href: '/admin/collections',
    },
    {
      label: 'Post Types',
      value: postTypeCount,
      icon: Tag,
      color: '#f59e0b',
      href: '/admin/post-types',
    },
    {
      label: 'Médias',
      value: mediaCount,
      icon: Image,
      color: '#a855f7',
      href: '/admin/media',
    },
  ]

  return (
    <div style={{ padding: 32, maxWidth: 900 }}>
      {/* En-tête */}
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 600,
            color: '#e8e8f0',
            letterSpacing: '-0.01em',
          }}
        >
          Dashboard
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#5a5a78' }}>
          Bienvenue. Voici un aperçu de votre espace de travail.
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 12,
          marginBottom: 32,
        }}
      >
        {STATS.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.label} href={stat.href} style={{ textDecoration: 'none' }}>
              <div
                className="stat-card"
                style={{
                  background: '#13131c',
                  border: '1px solid #1f1f2e',
                  borderRadius: 8,
                  padding: '16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  transition: 'border-color 0.15s',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: `${stat.color}18`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={16} strokeWidth={1.5} color={stat.color} />
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#e8e8f0', lineHeight: 1 }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 12, color: '#5a5a78', marginTop: 4 }}>{stat.label}</div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Actions rapides */}
      <div>
        <h2
          style={{
            margin: '0 0 12px',
            fontSize: 13,
            fontWeight: 600,
            color: '#5a5a78',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Actions rapides
        </h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { label: 'Nouvelle page', href: '/admin/pages' },
            { label: 'Ajouter un média', href: '/admin/media' },
            { label: 'Nouveau post type', href: '/admin/post-types' },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="admin-quick-action"
              style={{
                height: 32,
                padding: '0 14px',
                background: '#1a1a28',
                border: '1px solid #2a2a3e',
                borderRadius: 6,
                fontSize: 13,
                color: '#b0b0d0',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
