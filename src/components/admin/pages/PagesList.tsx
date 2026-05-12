'use client'

import { deletePageAction } from '@/lib/actions/pages'
import { FileText, LayoutDashboard, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useTransition } from 'react'

export type PageRow = {
  id: string
  siteId: string
  siteName: string
  title: string
  slug: string
  locale: string
  status: string
  updatedAt: string
}

export type SiteTab = {
  id: string
  name: string
  count: number
}

const STATUS = {
  DRAFT: { label: 'Brouillon', bg: '#1a1a26', color: '#5a5a78' },
  PUBLISHED: { label: 'Publié', bg: '#0a2a14', color: '#50c060' },
  ARCHIVED: { label: 'Archivé', bg: '#2a1e0a', color: '#c09040' },
} as const

function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status as keyof typeof STATUS] ?? STATUS.DRAFT
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 20,
        padding: '0 7px',
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 500,
        background: s.bg,
        color: s.color,
        whiteSpace: 'nowrap',
      }}
    >
      {s.label}
    </span>
  )
}

function Row({ page }: { page: PageRow }) {
  const [pending, start] = useTransition()

  function handleDelete() {
    if (!window.confirm(`Supprimer "${page.title}" ? Cette action est irréversible.`)) return
    start(async () => {
      await deletePageAction(page.id)
    })
  }

  return (
    <div
      className="site-row"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 130px 52px 96px 96px 68px',
        alignItems: 'center',
        gap: 12,
        padding: '9px 16px',
        borderBottom: '1px solid #1a1a24',
        opacity: pending ? 0.4 : 1,
        transition: 'opacity 0.15s',
      }}
    >
      {/* Titre + slug */}
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
          {page.title}
        </div>
        <div style={{ fontSize: 11, color: '#4a4a68', marginTop: 1 }}>/{page.slug}</div>
      </div>

      {/* Site */}
      <div
        style={{
          fontSize: 11,
          color: '#5a5a78',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {page.siteName}
      </div>

      {/* Locale */}
      <div
        style={{
          fontSize: 11,
          fontFamily: 'ui-monospace, monospace',
          color: '#4a4a68',
          textAlign: 'center',
        }}
      >
        {page.locale}
      </div>

      {/* Statut */}
      <StatusBadge status={page.status} />

      {/* Date */}
      <div style={{ fontSize: 11, color: '#3e3e52' }}>{page.updatedAt}</div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Link
          href={`/studio/${page.siteId}/${page.id}`}
          title="Ouvrir dans l'éditeur"
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
  { key: 'title', label: 'Titre' },
  { key: 'site', label: 'Site' },
  { key: 'lang', label: 'Lang' },
  { key: 'status', label: 'Statut' },
  { key: 'updated', label: 'Modifié' },
  { key: 'actions', label: '' },
]

interface Props {
  pages: PageRow[]
  tabs: SiteTab[]
  currentSiteId: string | undefined
}

export default function PagesList({ pages, tabs, currentSiteId }: Props) {
  return (
    <div>
      {/* Onglets par site */}
      {tabs.length > 1 && (
        <div
          style={{
            display: 'flex',
            gap: 4,
            marginBottom: 16,
            borderBottom: '1px solid #1a1a24',
            paddingBottom: 0,
          }}
        >
          {[{ id: '', name: 'Tous', count: tabs.reduce((a, t) => a + t.count, 0) }, ...tabs].map(
            (tab) => {
              const active = (tab.id === '' && !currentSiteId) || tab.id === currentSiteId
              return (
                <Link
                  key={tab.id || 'all'}
                  href={tab.id ? `/admin/pages?siteId=${tab.id}` : '/admin/pages'}
                  style={{
                    height: 32,
                    padding: '0 12px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 13,
                    fontWeight: active ? 500 : 400,
                    color: active ? '#ddddf0' : '#5a5a78',
                    textDecoration: 'none',
                    borderBottom: active ? '2px solid #4353ff' : '2px solid transparent',
                    marginBottom: -1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab.name}
                  <span
                    style={{
                      fontSize: 11,
                      background: active ? '#2a2a4a' : '#1a1a24',
                      color: active ? '#8090f0' : '#3e3e52',
                      borderRadius: 3,
                      padding: '1px 5px',
                    }}
                  >
                    {tab.count}
                  </span>
                </Link>
              )
            },
          )}
        </div>
      )}

      {/* Table */}
      <div
        style={{
          background: '#13131c',
          border: '1px solid #1f1f2e',
          borderRadius: 10,
          overflow: 'hidden',
        }}
      >
        {pages.length === 0 ? (
          <div style={{ padding: '60px 32px', textAlign: 'center' }}>
            <FileText size={36} strokeWidth={1} color="#2a2a3e" style={{ marginBottom: 14 }} />
            <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 500, color: '#5a5a78' }}>
              Aucune page pour l'instant
            </p>
            <p style={{ margin: 0, fontSize: 12, color: '#3a3a50' }}>
              Créez votre première page pour commencer.
            </p>
          </div>
        ) : (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 130px 52px 96px 96px 68px',
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
    </div>
  )
}
