'use client'

import { deletePageAction } from '@/lib/actions/pages'
import { FileText, LayoutDashboard, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useTransition } from 'react'

export type PageRow = {
  id: string
  title: string
  slug: string
  locale: string
  status: string
  updatedAt: string
}

const STATUS: Record<string, { label: string; dot: string; color: string }> = {
  DRAFT: { label: 'Brouillon', dot: '#3f3f46', color: '#71717a' },
  PUBLISHED: { label: 'Publié', dot: '#22c55e', color: '#4ade80' },
  ARCHIVED: { label: 'Archivé', dot: '#f59e0b', color: '#fbbf24' },
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status] ?? STATUS.DRAFT ?? { dot: '#3f3f46', color: '#71717a', label: status }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: s.dot,
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: 12, color: s.color }}>{s.label}</span>
    </span>
  )
}

function Row({ page }: { page: PageRow }) {
  const [pending, start] = useTransition()

  function handleDelete() {
    if (!window.confirm(`Supprimer "${page.title}" ?`)) return
    start(async () => {
      await deletePageAction(page.id)
    })
  }

  return (
    <div
      className="wf-table-row"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 48px 110px 100px 60px',
        alignItems: 'center',
        gap: 12,
        padding: '0 16px',
        height: 42,
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        opacity: pending ? 0.4 : 1,
        transition: 'opacity 0.15s, background 0.1s',
      }}
    >
      {/* Title + slug */}
      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: '#e4e4e7',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {page.title}
        </span>
        <span
          style={{
            fontSize: 11,
            color: '#3f3f46',
            fontFamily: 'ui-monospace, monospace',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          /{page.slug}
        </span>
      </div>

      {/* Locale */}
      <span
        style={{
          fontSize: 11,
          fontFamily: 'ui-monospace, monospace',
          color: '#52525b',
          textAlign: 'center',
          background: '#18181b',
          borderRadius: 4,
          padding: '2px 6px',
          width: 'fit-content',
        }}
      >
        {page.locale}
      </span>

      {/* Status */}
      <StatusBadge status={page.status} />

      {/* Date */}
      <span style={{ fontSize: 11, color: '#3f3f46' }}>{page.updatedAt}</span>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Link
          href={`/studio/${page.id}`}
          title="Ouvrir dans le studio"
          className="wf-btn-icon"
          style={{
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 6,
            color: '#52525b',
          }}
        >
          <LayoutDashboard size={13} strokeWidth={1.5} />
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          title="Supprimer"
          className="wf-btn-icon wf-btn-icon--danger"
          style={{
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 6,
            background: 'none',
            border: 'none',
            cursor: pending ? 'not-allowed' : 'pointer',
            color: '#52525b',
            padding: 0,
          }}
        >
          <Trash2 size={13} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}

const COLS = [
  { key: 'title', label: 'Titre' },
  { key: 'lang', label: 'Lang' },
  { key: 'status', label: 'Statut' },
  { key: 'updated', label: 'Modifié' },
  { key: 'actions', label: '' },
]

export default function PagesList({ pages }: { pages: PageRow[] }) {
  return (
    <div
      style={{
        background: '#0f0f11',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      {pages.length === 0 ? (
        <div
          style={{
            padding: '56px 32px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: '#18181b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileText size={18} strokeWidth={1.2} color="#3f3f46" />
          </div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: '#52525b' }}>
            Aucune page pour l'instant
          </p>
          <p style={{ margin: 0, fontSize: 12, color: '#3f3f46' }}>
            Créez votre première page pour commencer.
          </p>
        </div>
      ) : (
        <>
          {/* Header row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 48px 110px 100px 60px',
              gap: 12,
              padding: '0 16px',
              height: 34,
              alignItems: 'center',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              background: '#0a0a0c',
            }}
          >
            {COLS.map((col) => (
              <span
                key={col.key}
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: '#3f3f46',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                }}
              >
                {col.label}
              </span>
            ))}
          </div>
          {pages.map((page) => (
            <Row key={page.id} page={page} />
          ))}
        </>
      )}
    </div>
  )
}
