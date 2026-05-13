'use client'

import { deletePostTypeAction } from '@/lib/actions/post-types'
import { FileText, Settings2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useTransition } from 'react'

export type PostTypeRow = {
  id: string
  name: string
  slug: string
  description: string | null
  entryCount: number
  isBuiltIn: boolean
  updatedAt: string
}

function Row({ pt }: { pt: PostTypeRow }) {
  const [pending, start] = useTransition()

  function handleDelete() {
    if (
      !window.confirm(
        `Supprimer "${pt.name}" et toutes ses entrées ? Cette action est irréversible.`,
      )
    )
      return
    start(async () => {
      await deletePostTypeAction(pt.id)
    })
  }

  return (
    <div
      className="site-row"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 70px 96px 68px',
        alignItems: 'center',
        gap: 12,
        padding: '9px 16px',
        borderBottom: '1px solid #1a1a24',
        opacity: pending ? 0.4 : 1,
        transition: 'opacity 0.15s',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: '#e8e8f0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {pt.name}
          </span>
          {pt.isBuiltIn && (
            <span
              style={{
                fontSize: 10,
                background: '#1e1e2e',
                color: '#4a4a68',
                borderRadius: 3,
                padding: '1px 5px',
                flexShrink: 0,
              }}
            >
              built-in
            </span>
          )}
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
          {pt.description ?? `/${pt.slug}`}
        </div>
      </div>

      <div style={{ fontSize: 12, color: '#5a5a78', textAlign: 'right' }}>
        {pt.entryCount} entrée{pt.entryCount !== 1 ? 's' : ''}
      </div>

      <div style={{ fontSize: 11, color: '#3e3e52' }}>{pt.updatedAt}</div>

      <div style={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Link
          href={`/admin/post-types/${pt.id}`}
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
        <Link
          href={`/admin/post-types/${pt.id}/entries`}
          title="Voir les entrées"
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
          <FileText size={13} strokeWidth={1.5} />
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending || pt.isBuiltIn}
          title={pt.isBuiltIn ? 'Post type natif — non supprimable' : 'Supprimer'}
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
            cursor: pending || pt.isBuiltIn ? 'not-allowed' : 'pointer',
            color: pt.isBuiltIn ? '#2a2a3e' : '#4a4a68',
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
  { key: 'entries', label: 'Entrées' },
  { key: 'updated', label: 'Modifié' },
  { key: 'actions', label: '' },
]

interface Props {
  postTypes: PostTypeRow[]
}

export default function PostTypesList({ postTypes }: Props) {
  return (
    <div
      style={{
        background: '#13131c',
        border: '1px solid #1f1f2e',
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      {postTypes.length === 0 ? (
        <div style={{ padding: '60px 32px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 500, color: '#5a5a78' }}>
            Aucun post type pour l'instant
          </p>
          <p style={{ margin: 0, fontSize: 12, color: '#3a3a50' }}>
            Créez un post type pour structurer vos contenus.
          </p>
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 70px 96px 68px',
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
          {postTypes.map((pt) => (
            <Row key={pt.id} pt={pt} />
          ))}
        </>
      )}
    </div>
  )
}
