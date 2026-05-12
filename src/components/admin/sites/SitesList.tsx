'use client'

import { deleteSiteAction } from '@/lib/actions/sites'
import { Globe, LayoutDashboard, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useTransition } from 'react'

export type SiteRow = {
  id: string
  name: string
  slug: string
  customDomain: string | null
  createdAt: string
  pageCount: number
}

const SITE_COLORS = [
  '#4353ff',
  '#22c55e',
  '#f59e0b',
  '#a855f7',
  '#ef4444',
  '#0ea5e9',
  '#f97316',
  '#14b8a6',
]

function colorForName(name: string): string {
  let hash = 0
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffffff
  return (SITE_COLORS[Math.abs(hash) % SITE_COLORS.length] ?? '#4353ff') as string
}

function Row({ site }: { site: SiteRow }) {
  const [pending, start] = useTransition()
  const color = colorForName(site.name)
  const initials = site.name.slice(0, 2).toUpperCase()

  function handleDelete() {
    if (!window.confirm(`Supprimer "${site.name}" ? Cette action est irréversible.`)) return
    start(async () => {
      await deleteSiteAction(site.id)
    })
  }

  return (
    <div
      className="site-row"
      style={{
        display: 'grid',
        gridTemplateColumns: '36px 1fr 90px 180px 96px 76px',
        alignItems: 'center',
        gap: 12,
        padding: '9px 16px',
        borderBottom: '1px solid #1a1a24',
        opacity: pending ? 0.4 : 1,
        transition: 'opacity 0.15s',
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 7,
          background: `${color}20`,
          border: `1px solid ${color}40`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 700,
          color,
          flexShrink: 0,
          letterSpacing: '0.02em',
        }}
      >
        {initials}
      </div>

      {/* Nom + slug */}
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: '#e8e8f0',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {site.name}
        </div>
        <div style={{ fontSize: 11, color: '#4a4a68', marginTop: 1 }}>/{site.slug}</div>
      </div>

      {/* Pages */}
      <div style={{ fontSize: 12, color: '#5a5a78', textAlign: 'right' }}>
        {site.pageCount} {site.pageCount === 1 ? 'page' : 'pages'}
      </div>

      {/* Domaine */}
      <div
        style={{
          fontSize: 12,
          color: site.customDomain ? '#8090f0' : '#2a2a3e',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {site.customDomain ?? '—'}
      </div>

      {/* Date */}
      <div style={{ fontSize: 11, color: '#3e3e52' }}>{site.createdAt}</div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Link
          href={`/studio/${site.id}/home`}
          title="Ouvrir l'éditeur"
          className="site-action-btn"
          style={{
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 5,
            color: '#4a4a68',
          }}
        >
          <LayoutDashboard size={14} strokeWidth={1.5} />
        </Link>
        <Link
          href={`/admin/sites/${site.id}`}
          title="Paramètres"
          className="site-action-btn"
          style={{
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 5,
            color: '#4a4a68',
          }}
        >
          <Globe size={14} strokeWidth={1.5} />
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          title="Supprimer"
          className="site-delete-btn"
          style={{
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 5,
            background: 'none',
            border: 'none',
            cursor: pending ? 'not-allowed' : 'pointer',
            color: '#4a4a68',
            padding: 0,
          }}
        >
          <Trash2 size={14} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}

const COL_HEADERS = [
  { key: 'avatar', label: '' },
  { key: 'name', label: 'Nom' },
  { key: 'pages', label: 'Pages' },
  { key: 'domain', label: 'Domaine' },
  { key: 'created', label: 'Créé le' },
  { key: 'actions', label: '' },
]

export default function SitesList({ sites }: { sites: SiteRow[] }) {
  if (sites.length === 0) {
    return (
      <div
        style={{
          background: '#13131c',
          border: '1px solid #1f1f2e',
          borderRadius: 10,
          padding: '64px 32px',
          textAlign: 'center',
        }}
      >
        <Globe size={36} strokeWidth={1} color="#2a2a3e" style={{ marginBottom: 14 }} />
        <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 500, color: '#5a5a78' }}>
          Aucun site pour l'instant
        </p>
        <p style={{ margin: 0, fontSize: 12, color: '#3a3a50' }}>
          Créez votre premier site pour commencer.
        </p>
      </div>
    )
  }

  return (
    <div
      style={{
        background: '#13131c',
        border: '1px solid #1f1f2e',
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      {/* En-tête */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '36px 1fr 90px 180px 96px 76px',
          gap: 12,
          padding: '8px 16px',
          borderBottom: '1px solid #1f1f2e',
        }}
      >
        {COL_HEADERS.map((col) => (
          <span
            key={col.key}
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#3e3e52',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              textAlign: col.key === 'pages' ? 'right' : 'left',
            }}
          >
            {col.label}
          </span>
        ))}
      </div>

      {sites.map((site) => (
        <Row key={site.id} site={site} />
      ))}
    </div>
  )
}
