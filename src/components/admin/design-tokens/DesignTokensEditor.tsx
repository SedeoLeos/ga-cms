'use client'

import type { DesignTokenActionState } from '@/lib/actions/design-tokens'
import { deleteDesignTokenAction, upsertDesignTokenAction } from '@/lib/actions/design-tokens'
import { TOKEN_TYPES } from '@/lib/constants/design-tokens'
import { Check, Plus, Trash2 } from 'lucide-react'
import { useActionState, useEffect, useRef, useState, useTransition } from 'react'

export type TokenItem = {
  id: string
  name: string
  value: string
  type: string
}

const TYPE_LABELS: Record<string, string> = {
  color: 'Couleurs',
  spacing: 'Espacement',
  'font-size': 'Taille de police',
  'font-family': 'Famille de police',
  'border-radius': 'Arrondi',
  shadow: 'Ombre',
  opacity: 'Opacité',
}

const INPUT_S: React.CSSProperties = {
  height: 30,
  background: '#1e1e2e',
  border: '1px solid #2a2a3e',
  borderRadius: 5,
  padding: '0 8px',
  fontSize: 12,
  color: '#e8e8f0',
  outline: 'none',
  boxSizing: 'border-box',
}

function ColorSwatch({ value }: { value: string }) {
  const isColor = /^#|^rgb|^hsl|^oklch/.test(value.trim())
  if (!isColor) return null
  return (
    <span
      style={{
        display: 'inline-block',
        width: 16,
        height: 16,
        borderRadius: 3,
        background: value,
        border: '1px solid rgba(255,255,255,0.1)',
        flexShrink: 0,
      }}
    />
  )
}

function TokenRow({ token }: { token: TokenItem }) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(token.value)
  const [deletePending, startDelete] = useTransition()
  const [savePending, startSave] = useTransition()

  function handleDelete() {
    if (!window.confirm(`Supprimer "${token.name}" ?`)) return
    startDelete(async () => {
      await deleteDesignTokenAction(token.id)
    })
  }

  function handleSave() {
    if (!editValue.trim()) return
    startSave(async () => {
      const fd = new FormData()
      fd.set('name', token.name)
      fd.set('value', editValue)
      fd.set('type', token.type)
      await upsertDesignTokenAction(null, fd)
      setEditing(false)
    })
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 36px',
        alignItems: 'center',
        gap: 8,
        padding: '6px 12px',
        borderBottom: '1px solid #1a1a24',
        opacity: deletePending ? 0.4 : 1,
        transition: 'opacity 0.15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <code
          style={{
            fontSize: 11,
            fontFamily: 'ui-monospace, monospace',
            color: '#8090f0',
          }}
        >
          --token-{token.name}
        </code>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <ColorSwatch value={token.value} />
        {editing ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave()
                if (e.key === 'Escape') {
                  setEditValue(token.value)
                  setEditing(false)
                }
              }}
              style={{ ...INPUT_S, flex: 1 }}
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={savePending}
              style={{
                ...INPUT_S,
                width: 28,
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#4ade80',
                background: '#0e2e1a',
                border: '1px solid #1a4a28',
              }}
            >
              <Check size={12} strokeWidth={2} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: 12,
              color: '#c8c8e0',
              fontFamily: token.type === 'color' ? 'ui-monospace, monospace' : undefined,
            }}
          >
            {token.value}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={handleDelete}
        disabled={deletePending}
        title="Supprimer"
        style={{
          width: 28,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'none',
          border: 'none',
          cursor: deletePending ? 'not-allowed' : 'pointer',
          color: '#3a3a52',
          borderRadius: 4,
          padding: 0,
        }}
      >
        <Trash2 size={12} strokeWidth={1.5} />
      </button>
    </div>
  )
}

function AddTokenRow({ activeType }: { activeType: string }) {
  const [state, formAction, pending] = useActionState<DesignTokenActionState, FormData>(
    upsertDesignTokenAction,
    null,
  )
  const [open, setOpen] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (state && 'success' in state) {
      setOpen(false)
    }
  }, [state])

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => nameRef.current?.focus(), 30)
      return () => clearTimeout(t)
    }
  }, [open])

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          width: '100%',
          padding: '7px 12px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 12,
          color: '#3e3e52',
          textAlign: 'left',
        }}
      >
        <Plus size={12} strokeWidth={2} />
        Ajouter un token
      </button>
    )
  }

  return (
    <form
      action={formAction}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 36px',
        alignItems: 'center',
        gap: 8,
        padding: '6px 12px',
        borderTop: '1px solid #1a1a24',
      }}
    >
      <input type="hidden" name="type" value={activeType} />
      <input
        id="new-token-name"
        ref={nameRef}
        name="name"
        type="text"
        placeholder="nom-du-token"
        pattern="[a-z][a-z0-9-]*"
        required
        style={{ ...INPUT_S, fontFamily: 'ui-monospace, monospace', width: '100%' }}
      />
      <input
        id="new-token-value"
        name="value"
        type="text"
        placeholder={activeType === 'color' ? '#4353ff' : activeType === 'spacing' ? '16px' : ''}
        required
        style={{ ...INPUT_S, width: '100%' }}
      />
      <div style={{ display: 'flex', gap: 4 }}>
        <button
          type="submit"
          disabled={pending}
          style={{
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0e2e1a',
            border: '1px solid #1a4a28',
            borderRadius: 4,
            cursor: pending ? 'not-allowed' : 'pointer',
            color: '#4ade80',
            padding: 0,
          }}
        >
          <Check size={12} strokeWidth={2} />
        </button>
      </div>
      {state && 'error' in state && (
        <p
          style={{
            gridColumn: '1 / -1',
            margin: 0,
            fontSize: 11,
            color: '#ff6060',
          }}
        >
          {state.error}
        </p>
      )}
    </form>
  )
}

interface Props {
  tokens: TokenItem[]
}

export default function DesignTokensEditor({ tokens }: Props) {
  const [activeType, setActiveType] = useState<string>(TOKEN_TYPES[0])

  const grouped = TOKEN_TYPES.reduce<Record<string, TokenItem[]>>((acc, type) => {
    acc[type] = tokens.filter((t) => t.type === type)
    return acc
  }, {})

  const activeTokens = grouped[activeType] ?? []

  return (
    <div
      style={{
        display: 'flex',
        gap: 0,
        background: '#13131c',
        border: '1px solid #1f1f2e',
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      {/* Type tabs (left sidebar) */}
      <div
        style={{
          width: 180,
          flexShrink: 0,
          borderRight: '1px solid #1a1a24',
          paddingTop: 8,
          paddingBottom: 8,
        }}
      >
        {TOKEN_TYPES.map((type) => {
          const count = (grouped[type] ?? []).length
          const active = type === activeType
          return (
            <button
              key={type}
              type="button"
              onClick={() => setActiveType(type)}
              style={{
                width: '100%',
                padding: '7px 14px',
                background: active ? '#1a1a2e' : 'none',
                border: 'none',
                borderLeft: `2px solid ${active ? '#4353ff' : 'transparent'}`,
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 12,
                color: active ? '#ddddf0' : '#5a5a78',
                fontWeight: active ? 500 : 400,
              }}
            >
              <span>{TYPE_LABELS[type] ?? type}</span>
              {count > 0 && (
                <span
                  style={{
                    fontSize: 10,
                    background: active ? '#2a2a4a' : '#1a1a24',
                    color: active ? '#8090f0' : '#3e3e52',
                    borderRadius: 3,
                    padding: '1px 5px',
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tokens list */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 36px',
            gap: 8,
            padding: '7px 12px',
            borderBottom: '1px solid #1f1f2e',
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#3e3e52',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Variable CSS
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#3e3e52',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Valeur
          </span>
          <span />
        </div>

        {activeTokens.length === 0 ? (
          <div style={{ padding: '24px 12px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 12, color: '#3a3a50' }}>
              Aucun token de type «{TYPE_LABELS[activeType]}» pour l'instant.
            </p>
          </div>
        ) : (
          activeTokens.map((t) => <TokenRow key={t.id} token={t} />)
        )}

        <AddTokenRow activeType={activeType} />
      </div>
    </div>
  )
}
