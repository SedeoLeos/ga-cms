'use client'

import { deleteEntryAction } from '@/lib/actions/entries'
import { Edit2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useTransition } from 'react'

export type EntryRow = {
  id: string
  collectionId: string
  label: string
  locale: string
  status: string
  updatedAt: string
}

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  DRAFT: { bg: '#1c1c1f', color: '#71717a', label: 'Brouillon' },
  PUBLISHED: { bg: '#0e2e1a', color: '#4ade80', label: 'Publié' },
  ARCHIVED: { bg: '#1e1a0e', color: '#a07840', label: 'Archivé' },
}

function EntryRowItem({ entry, showLocale }: { entry: EntryRow; showLocale: boolean }) {
  const [pending, start] = useTransition()
  const s = STATUS_STYLES[entry.status] ?? { bg: '#1c1c1f', color: '#71717a', label: 'Brouillon' }

  function handleDelete() {
    if (!window.confirm('Supprimer cette entrée ? Cette action est irréversible.')) return
    start(async () => {
      await deleteEntryAction(entry.id, entry.collectionId)
    })
  }

  return (
    <div
      className="site-row"
      style={{
        display: 'grid',
        gridTemplateColumns: showLocale ? '1fr 52px 90px 96px 60px' : '1fr 90px 96px 60px',
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
          color: '#f4f4f5',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {entry.label}
      </div>

      {showLocale && (
        <span
          style={{
            fontSize: 11,
            color: '#71717a',
            fontFamily: 'ui-monospace, monospace',
          }}
        >
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
          href={`/admin/collections/${entry.collectionId}/entries/${entry.id}`}
          title="Éditer"
          className="site-action-btn"
          style={{
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 5,
            color: '#52525b',
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

const HEADERS_WITH_LOCALE = ['Titre', 'Langue', 'Statut', 'Modifié', '']
const HEADERS_NO_LOCALE = ['Titre', 'Statut', 'Modifié', '']

interface Props {
  entries: EntryRow[]
  showLocale: boolean
}

export default function EntriesList({ entries, showLocale }: Props) {
  const headers = showLocale ? HEADERS_WITH_LOCALE : HEADERS_NO_LOCALE
  const cols = showLocale ? '1fr 52px 90px 96px 60px' : '1fr 90px 96px 60px'

  return (
    <div
      style={{
        background: '#111113',
        border: '1px solid #1f1f2e',
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      {entries.length === 0 ? (
        <div style={{ padding: '60px 32px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 500, color: '#71717a' }}>
            Aucune entrée pour l'instant
          </p>
          <p style={{ margin: 0, fontSize: 12, color: '#3a3a50' }}>
            Créez une première entrée avec le bouton ci-dessus.
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
            <EntryRowItem key={entry.id} entry={entry} showLocale={showLocale} />
          ))}
        </>
      )}
    </div>
  )
}
