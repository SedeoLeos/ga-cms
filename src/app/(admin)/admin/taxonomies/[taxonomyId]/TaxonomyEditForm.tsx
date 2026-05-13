'use client'

import type { TaxonomyActionState } from '@/lib/actions/taxonomies'
import { Check, Trash2 } from 'lucide-react'
import { useActionState, useState } from 'react'

const INPUT_S: React.CSSProperties = {
  width: '100%',
  background: '#1e1e2e',
  border: '1px solid #2a2a3e',
  borderRadius: 6,
  padding: '0 8px',
  fontSize: 12,
  color: '#e8e8f0',
  outline: 'none',
  height: 30,
  boxSizing: 'border-box',
}

const LABEL_S: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  color: '#5a5a78',
  marginBottom: 4,
}

interface Props {
  taxonomy: { id: string; name: string; slug: string; hierarchical: boolean }
  // biome-ignore lint/suspicious/noExplicitAny: server action
  updateAction: (...args: any[]) => Promise<TaxonomyActionState>
  deleteAction: () => Promise<void>
}

export default function TaxonomyEditForm({ taxonomy, updateAction, deleteAction }: Props) {
  const [state, formAction, pending] = useActionState<TaxonomyActionState, FormData>(
    updateAction,
    null,
  )
  const [dirty, setDirty] = useState(false)

  return (
    <div>
      <form
        action={formAction}
        onChange={() => setDirty(true)}
        style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
      >
        <div>
          <label htmlFor="tax-edit-name" style={LABEL_S}>
            Nom
          </label>
          <input
            id="tax-edit-name"
            name="name"
            defaultValue={taxonomy.name}
            required
            style={INPUT_S}
          />
        </div>
        <div>
          <label htmlFor="tax-edit-slug" style={LABEL_S}>
            Identifiant
          </label>
          <input
            id="tax-edit-slug"
            name="slug"
            defaultValue={taxonomy.slug}
            required
            style={{ ...INPUT_S, fontFamily: 'ui-monospace, monospace', fontSize: 11 }}
          />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <input
            type="checkbox"
            name="hierarchical"
            defaultChecked={taxonomy.hierarchical}
            style={{ width: 13, height: 13 }}
          />
          <span style={{ fontSize: 12, color: '#8a8aa8' }}>Hiérarchique</span>
        </label>
        {state && 'error' in state && (
          <p style={{ margin: 0, fontSize: 11, color: '#ff6060' }}>{state.error}</p>
        )}
        <button
          type="submit"
          disabled={pending || !dirty}
          style={{
            height: 28,
            background: dirty && !pending ? '#4353ff' : '#1a1a26',
            border: `1px solid ${dirty && !pending ? 'transparent' : '#2a2a3e'}`,
            borderRadius: 5,
            fontSize: 12,
            fontWeight: 500,
            color: dirty && !pending ? '#fff' : '#3e3e52',
            cursor: dirty && !pending ? 'pointer' : 'default',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
          }}
        >
          {state && 'success' in state && !dirty && <Check size={11} />}
          {pending ? 'Enregistrement…' : dirty ? 'Enregistrer' : 'Enregistré'}
        </button>
      </form>

      <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #1a1a24' }}>
        <form action={deleteAction}>
          <button
            type="submit"
            style={{
              width: '100%',
              height: 28,
              background: 'none',
              border: '1px solid #2a2a3e',
              borderRadius: 5,
              fontSize: 12,
              color: '#6b3a3a',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
            }}
          >
            <Trash2 size={11} />
            Supprimer la taxonomie
          </button>
        </form>
      </div>
    </div>
  )
}
