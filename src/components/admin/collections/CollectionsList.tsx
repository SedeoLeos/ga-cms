'use client'

import { deleteCollectionAction } from '@/lib/actions/collections'
import { Database, Settings2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useTransition } from 'react'

export type CollectionRow = {
  id: string
  siteId: string
  siteName: string
  name: string
  slug: string
  description: string | null
  entryCount: number
  updatedAt: string
}

export type SiteTab = {
  id: string
  name: string
  count: number
}

function Row({ col }: { col: CollectionRow }) {
  const [pending, start] = useTransition()

  function handleDelete() {
    if (
      !window.confirm(
        `Supprimer "${col.name}" et toutes ses entrées ? Cette action est irréversible.`,
      )
    )
      return
    start(async () => {
      await deleteCollectionAction(col.id)
    })
  }

  return (
    <div
      className="site-row"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 130px 70px 96px 68px',
        alignItems: 'center',
        gap: 12,
        padding: '9px 16px',
        borderBottom: '1px solid #1a1a24',
        opacity: pending ? 0.4 : 1,
        transition: 'opacity 0.15s',
      }}
    >
      {/* Nom + description */}
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
          {col.name}
        </div>
        <div
          style={{
            fontSize: 11,
            color: '#4a4a68',
            marginTop: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {col.description ?? `/${col.slug}`}
        </div>
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
        {col.siteName}
      </div>

      {/* Entrées */}
      <div style={{ fontSize: 12, color: '#5a5a78', textAlign: 'right' }}>
        {col.entryCount} entrée{col.entryCount !== 1 ? 's' : ''}
      </div>

      {/* Date */}
      <div style={{ fontSize: 11, color: '#3e3e52' }}>{col.updatedAt}</div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Link
          href={`/admin/collections/${col.id}`}
          title="Gérer le schéma"
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
          <Settings2 size={14} strokeWidth={1.5} />
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
  { key: 'name', label: 'Nom' },
  { key: 'site', label: 'Site' },
  { key: 'entries', label: 'Entrées' },
  { key: 'updated', label: 'Modifié' },
  { key: 'actions', label: '' },
]

interface Props {
  collections: CollectionRow[]
  tabs: SiteTab[]
  currentSiteId: string | undefined
}

export default function CollectionsList({ collections, tabs, currentSiteId }: Props) {
  return (
    <div>
      {tabs.length > 1 && (
        <div
          style={{
            display: 'flex',
            gap: 4,
            marginBottom: 16,
            borderBottom: '1px solid #1a1a24',
          }}
        >
          {[
            {
              id: '',
              name: 'Toutes',
              count: tabs.reduce((a, t) => a + t.count, 0),
            },
            ...tabs,
          ].map((tab) => {
            const active = (tab.id === '' && !currentSiteId) || tab.id === currentSiteId
            return (
              <Link
                key={tab.id || 'all'}
                href={tab.id ? `/admin/collections?siteId=${tab.id}` : '/admin/collections'}
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
          })}
        </div>
      )}

      <div
        style={{
          background: '#13131c',
          border: '1px solid #1f1f2e',
          borderRadius: 10,
          overflow: 'hidden',
        }}
      >
        {collections.length === 0 ? (
          <div style={{ padding: '60px 32px', textAlign: 'center' }}>
            <Database size={36} strokeWidth={1} color="#2a2a3e" style={{ marginBottom: 14 }} />
            <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 500, color: '#5a5a78' }}>
              Aucune collection pour l'instant
            </p>
            <p style={{ margin: 0, fontSize: 12, color: '#3a3a50' }}>
              Créez une collection pour structurer vos contenus.
            </p>
          </div>
        ) : (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 130px 70px 96px 68px',
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
                    textAlign: col.key === 'entries' ? 'right' : 'left',
                  }}
                >
                  {col.label}
                </span>
              ))}
            </div>
            {collections.map((col) => (
              <Row key={col.id} col={col} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}
