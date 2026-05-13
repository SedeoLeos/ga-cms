'use client'

import { deleteGlobalBlockAction } from '@/lib/actions/global-blocks'
import { Blocks, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useTransition } from 'react'

export type GlobalBlockRow = {
  id: string
  name: string
  category: string | null
  updatedAt: string
}

function Row({ block }: { block: GlobalBlockRow }) {
  const [pending, start] = useTransition()

  function handleDelete() {
    if (!window.confirm(`Supprimer "${block.name}" ? Cette action est irréversible.`)) return
    start(async () => {
      await deleteGlobalBlockAction(block.id)
    })
  }

  return (
    <div
      className="site-row"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 140px 96px 60px',
        alignItems: 'center',
        gap: 12,
        padding: '9px 16px',
        borderBottom: '1px solid #1a1a24',
        opacity: pending ? 0.4 : 1,
        transition: 'opacity 0.15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        <Blocks size={13} strokeWidth={1.5} color="#4353ff" />
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
          {block.name}
        </span>
      </div>

      {block.category ? (
        <span
          style={{
            fontSize: 11,
            background: '#1a1a26',
            border: '1px solid #2a2a3e',
            borderRadius: 4,
            padding: '1px 7px',
            color: '#6868a8',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {block.category}
        </span>
      ) : (
        <span style={{ fontSize: 11, color: '#2e2e42' }}>—</span>
      )}

      <div style={{ fontSize: 11, color: '#3e3e52' }}>{block.updatedAt}</div>

      <div style={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Link
          href={`/admin/global-blocks/${block.id}`}
          title="Éditer le bloc"
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
          <Blocks size={13} strokeWidth={1.5} />
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

const COL_HEADERS = [
  { key: 'name', label: 'Nom' },
  { key: 'category', label: 'Catégorie' },
  { key: 'updated', label: 'Modifié' },
  { key: 'actions', label: '' },
]

interface Props {
  blocks: GlobalBlockRow[]
}

export default function GlobalBlocksList({ blocks }: Props) {
  return (
    <div>
      <div
        style={{
          background: '#13131c',
          border: '1px solid #1f1f2e',
          borderRadius: 10,
          overflow: 'hidden',
        }}
      >
        {blocks.length === 0 ? (
          <div style={{ padding: '60px 32px', textAlign: 'center' }}>
            <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 500, color: '#5a5a78' }}>
              Aucun bloc global pour l'instant
            </p>
            <p style={{ margin: 0, fontSize: 12, color: '#3a3a50' }}>
              Les blocs globaux sont des sections réutilisables éditables dans le studio.
            </p>
          </div>
        ) : (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 140px 96px 60px',
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
            {blocks.map((block) => (
              <Row key={block.id} block={block} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}
