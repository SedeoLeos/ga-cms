import { FileText, Globe, Image, Layers } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard' }

const STATS = [
  { label: 'Sites', value: '—', icon: Globe, color: '#4353ff' },
  { label: 'Pages', value: '—', icon: FileText, color: '#22c55e' },
  { label: 'Collections', value: '—', icon: Layers, color: '#f59e0b' },
  { label: 'Media files', value: '—', icon: Image, color: '#a855f7' },
]

export default function DashboardPage() {
  return (
    <div style={{ padding: 32, maxWidth: 900 }}>
      {/* Header */}
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
          Welcome back. Here's an overview of your workspace.
        </p>
      </div>

      {/* Stats grid */}
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
            <div
              key={stat.label}
              style={{
                background: '#13131c',
                border: '1px solid #1f1f2e',
                borderRadius: 8,
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
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
          )
        })}
      </div>

      {/* Quick actions */}
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
          Quick actions
        </h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { label: 'New site', href: '/admin/sites/new' },
            { label: 'New page', href: '/admin/pages/new' },
            { label: 'Upload media', href: '/admin/media' },
          ].map((action) => (
            <a
              key={action.href}
              href={action.href}
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
              className="admin-quick-action"
            >
              {action.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
