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
  DRAFT: { label: 'Brouillon', dot: '#444464', color: '#5a5a88' },
  PUBLISHED: { label: 'Publié', dot: '#22c55e', color: '#4ade80' },
  ARCHIVED: { label: 'Archivé', dot: '#f59e0b', color: '#fbbf24' },
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status] ?? STATUS.DRAFT ?? { dot: '#444464', color: '#5a5a88', label: status }
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
        borderBottom: '1px solid #161620',
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
            color: '#d8d8ec',
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
            color: '#3a3a58',
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
          color: '#404060',
          textAlign: 'center',
          background: '#161620',
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
      <span style={{ fontSize: 11, color: '#36364e' }}>{page.updatedAt}</span>

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
            color: '#404068',
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
            color: '#404068',
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
        background: '#0f0f18',
        border: '1px solid #1c1c28',
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
              background: '#141420',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileText size={18} strokeWidth={1.2} color="#2e2e48" />
          </div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: '#4a4a68' }}>
            Aucune page pour l'instant
          </p>
          <p style={{ margin: 0, fontSize: 12, color: '#2e2e48' }}>
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
              borderBottom: '1px solid #1c1c28',
              background: '#0c0c14',
            }}
          >
            {COLS.map((col) => (
              <span
                key={col.key}
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: '#30304a',
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
