'use client'

import type { TaxonomyActionState } from '@/lib/actions/taxonomies'
import { Plus } from 'lucide-react'
import { useActionState, useRef, useState } from 'react'

const INPUT_S: React.CSSProperties = {
  background: '#1e1e2e',
  border: '1px solid #2a2a3e',
  borderRadius: 6,
  padding: '0 10px',
  fontSize: 13,
  color: '#e8e8f0',
  outline: 'none',
  height: 32,
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

interface Props {
  // biome-ignore lint/suspicious/noExplicitAny: server action type
  action: (...args: any[]) => Promise<TaxonomyActionState>
}

export default function TaxonomyCreateForm({ action }: Props) {
  const [state, formAction, pending] = useActionState<TaxonomyActionState, FormData>(action, null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const slugRef = useRef<HTMLInputElement>(null)

  function onName(val: string) {
    setName(val)
    if (!slugEdited) setSlug(slugify(val))
  }

  return (
    <form
      action={formAction}
      onSubmit={() => {
        if (slugRef.current) slugRef.current.value = slug
      }}
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 8,
        padding: 16,
        background: '#13131c',
        border: '1px solid #1f1f2e',
        borderRadius: 10,
      }}
    >
      <div style={{ flex: 1 }}>
        <label
          htmlFor="tax-create-name"
          style={{ display: 'block', fontSize: 11, color: '#5a5a78', marginBottom: 5 }}
        >
          Nom
        </label>
        <input
          id="tax-create-name"
          name="name"
          value={name}
          onChange={(e) => onName(e.target.value)}
          placeholder="ex: Catégories"
          required
          style={{ ...INPUT_S, width: '100%' }}
        />
      </div>
      <div style={{ flex: 1 }}>
        <label
          htmlFor="tax-create-slug"
          style={{ display: 'block', fontSize: 11, color: '#5a5a78', marginBottom: 5 }}
        >
          Identifiant
        </label>
        <input
          id="tax-create-slug"
          ref={slugRef}
          name="slug"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value)
            setSlugEdited(true)
          }}
          placeholder="ex: categories"
          required
          style={{ ...INPUT_S, width: '100%', fontFamily: 'ui-monospace, monospace', fontSize: 12 }}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingBottom: 1 }}>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 12,
            color: '#8a8aa8',
            cursor: 'pointer',
          }}
        >
          <input type="checkbox" name="hierarchical" style={{ width: 13, height: 13 }} />
          Hiérarchique
        </label>
      </div>
      <button
        type="submit"
        disabled={pending || !name}
        style={{
          height: 32,
          padding: '0 14px',
          background: name && !pending ? '#4353ff' : '#1a1a26',
          border: `1px solid ${name && !pending ? 'transparent' : '#2a2a3e'}`,
          borderRadius: 6,
          fontSize: 13,
          fontWeight: 500,
          color: name && !pending ? '#fff' : '#3e3e52',
          cursor: name && !pending ? 'pointer' : 'default',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          flexShrink: 0,
        }}
      >
        <Plus size={13} strokeWidth={2} />
        {pending ? 'Création…' : 'Créer'}
      </button>
      {state && 'error' in state && (
        <p style={{ margin: 0, fontSize: 12, color: '#ff6060', flexShrink: 0 }}>{state.error}</p>
      )}
    </form>
  )
}
