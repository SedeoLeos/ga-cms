'use client'

import { deletePostEntryAction } from '@/lib/actions/post-entries'
import { Edit2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useTransition } from 'react'

export type PostEntryRow = {
  id: string
  postTypeId: string
  title: string
  slug: string
  locale: string
  status: string
  updatedAt: string
}

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  DRAFT: { bg: '#1e1e2e', color: '#5a5a78', label: 'Brouillon' },
  PUBLISHED: { bg: '#0e2e1a', color: '#4ade80', label: 'Publié' },
  ARCHIVED: { bg: '#1e1a0e', color: '#a07840', label: 'Archivé' },
}

function RowItem({ entry, showLocale }: { entry: PostEntryRow; showLocale: boolean }) {
  const [pending, start] = useTransition()
  const s = STATUS_STYLES[entry.status] ?? { bg: '#1e1e2e', color: '#5a5a78', label: 'Brouillon' }

  function handleDelete() {
    if (!window.confirm('Supprimer ce billet ? Cette action est irréversible.')) return
    start(async () => {
      await deletePostEntryAction(entry.id, entry.postTypeId)
    })
  }

  const cols = showLocale ? '1fr 120px 52px 90px 96px 60px' : '1fr 120px 90px 96px 60px'

  return (
    <div
      className="site-row"
      style={{
        display: 'grid',
        gridTemplateColumns: cols,
        alignItems: 'center',
        gap: 12,
        padding: '9px 16px',
        borderBottom: '1px solid #1a1a24',
        opacity: pending ? 0.4 : 1,
        transition: 'opacity 0.15s',
      }}
    >
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
        {entry.title}
      </div>

      <span
        style={{
          fontSize: 11,
          color: '#4a4a68',
          fontFamily: 'ui-monospace, monospace',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {entry.slug}
      </span>

      {showLocale && (
        <span style={{ fontSize: 11, color: '#5a5a78', fontFamily: 'ui-monospace, monospace' }}>
          {entry.locale}
        </span>
      )}

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

      <span style={{ fontSize: 11, color: '#3e3e52' }}>{entry.updatedAt}</span>

      <div style={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Link
          href={`/admin/post-types/${entry.postTypeId}/entries/${entry.id}`}
          title="Éditer"
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
          <Edit2 size={13} strokeWidth={1.5} />
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
          <Trash2 size={13} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}

interface Props {
  entries: PostEntryRow[]
  showLocale: boolean
}

export default function PostEntriesList({ entries, showLocale }: Props) {
  const headers = showLocale
    ? ['Titre', 'Identifiant', 'Langue', 'Statut', 'Modifié', '']
    : ['Titre', 'Identifiant', 'Statut', 'Modifié', '']
  const cols = showLocale ? '1fr 120px 52px 90px 96px 60px' : '1fr 120px 90px 96px 60px'

  return (
    <div
      style={{
        background: '#13131c',
        border: '1px solid #1f1f2e',
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      {entries.length === 0 ? (
        <div style={{ padding: '60px 32px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 500, color: '#5a5a78' }}>
            Aucun billet pour l'instant
          </p>
          <p style={{ margin: 0, fontSize: 12, color: '#3a3a50' }}>
            Créez un premier billet avec le bouton ci-dessus.
          </p>
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: cols,
              gap: 12,
              padding: '8px 16px',
              borderBottom: '1px solid #1f1f2e',
            }}
          >
            {headers.map((h) => (
              <span
                key={h}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#3e3e52',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {h}
              </span>
            ))}
          </div>
          {entries.map((entry) => (
            <RowItem key={entry.id} entry={entry} showLocale={showLocale} />
          ))}
        </>
      )}
    </div>
  )
}
