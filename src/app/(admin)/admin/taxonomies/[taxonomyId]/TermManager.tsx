'use client'

import type { TaxonomyActionState } from '@/lib/actions/taxonomies'
import { deleteTermAction, updateTermAction } from '@/lib/actions/taxonomies'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useActionState, useState, useTransition } from 'react'

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const INPUT_S: React.CSSProperties = {
  background: '#1c1c1f',
  border: '1px solid #27272a',
  borderRadius: 5,
  padding: '0 8px',
  fontSize: 12,
  color: '#f4f4f5',
  outline: 'none',
  height: 28,
  boxSizing: 'border-box',
}

type Term = {
  id: string
  name: string
  slug: string
  parentId: string | null
  order: number
  _count: { entries: number }
}

interface Props {
  taxonomyId: string
  hierarchical: boolean
  terms: Term[]
  // biome-ignore lint/suspicious/noExplicitAny: server action
  createAction: (...args: any[]) => Promise<TaxonomyActionState>
}

export default function TermManager({ taxonomyId, hierarchical, terms, createAction }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const rootTerms = terms.filter((t) => !t.parentId)
  const childTerms = terms.filter((t) => t.parentId)

  return (
    <div>
      {/* Add form */}
      <AddTermForm
        createAction={createAction}
        parentOptions={hierarchical ? rootTerms : []}
        hierarchical={hierarchical}
      />

      {/* Term list */}
      {terms.length > 0 && (
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 80px 56px',
              padding: '5px 10px',
              fontSize: 11,
              fontWeight: 600,
              color: '#3e3e52',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            <span>Terme</span>
            <span>Billets</span>
            <span />
          </div>

          {rootTerms.map((term) => (
            <div key={term.id}>
              <TermRow
                term={term}
                taxonomyId={taxonomyId}
                editing={editingId === term.id}
                onEdit={() => setEditingId(term.id)}
                onCancel={() => setEditingId(null)}
                onDone={() => setEditingId(null)}
                parentOptions={[]}
                indent={0}
              />
              {hierarchical &&
                childTerms
                  .filter((c) => c.parentId === term.id)
                  .map((child) => (
                    <TermRow
                      key={child.id}
                      term={child}
                      taxonomyId={taxonomyId}
                      editing={editingId === child.id}
                      onEdit={() => setEditingId(child.id)}
                      onCancel={() => setEditingId(null)}
                      onDone={() => setEditingId(null)}
                      parentOptions={rootTerms}
                      indent={1}
                    />
                  ))}
            </div>
          ))}
        </div>
      )}

      {terms.length === 0 && (
        <p style={{ marginTop: 16, fontSize: 13, color: '#3e3e52', fontStyle: 'italic' }}>
          Aucun terme. Ajoutez-en un ci-dessus.
        </p>
      )}
    </div>
  )
}

function AddTermForm({
  createAction,
  parentOptions,
  hierarchical,
}: {
  // biome-ignore lint/suspicious/noExplicitAny: server action
  createAction: (...args: any[]) => Promise<TaxonomyActionState>
  parentOptions: Term[]
  hierarchical: boolean
}) {
  const [state, formAction, pending] = useActionState<TaxonomyActionState, FormData>(
    createAction,
    null,
  )
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)

  return (
    <form
      action={formAction}
      onSubmit={() => {
        // reset after submit
        setTimeout(() => {
          setName('')
          setSlug('')
          setSlugEdited(false)
        }, 100)
      }}
      style={{
        display: 'flex',
        gap: 8,
        alignItems: 'flex-end',
        padding: 14,
        background: '#111113',
        border: '1px solid #1f1f2e',
        borderRadius: 10,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ flex: '1 1 140px' }}>
        <label
          htmlFor="add-term-name"
          style={{ display: 'block', fontSize: 11, color: '#71717a', marginBottom: 4 }}
        >
          Nom
        </label>
        <input
          id="add-term-name"
          name="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (!slugEdited) setSlug(slugify(e.target.value))
          }}
          placeholder="ex: Technologie"
          required
          style={{ ...INPUT_S, width: '100%' }}
        />
      </div>
      <div style={{ flex: '1 1 120px' }}>
        <label
          htmlFor="add-term-slug"
          style={{ display: 'block', fontSize: 11, color: '#71717a', marginBottom: 4 }}
        >
          Identifiant
        </label>
        <input
          id="add-term-slug"
          name="slug"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value)
            setSlugEdited(true)
          }}
          placeholder="technologie"
          required
          style={{ ...INPUT_S, width: '100%', fontFamily: 'ui-monospace, monospace', fontSize: 11 }}
        />
      </div>
      {hierarchical && parentOptions.length > 0 && (
        <div style={{ flex: '0 0 130px' }}>
          <label
            htmlFor="add-term-parent"
            style={{ display: 'block', fontSize: 11, color: '#71717a', marginBottom: 4 }}
          >
            Parent (optionnel)
          </label>
          <select
            id="add-term-parent"
            name="parentId"
            style={{ ...INPUT_S, width: '100%', appearance: 'auto' }}
            defaultValue=""
          >
            <option value="">Aucun</option>
            {parentOptions.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <button
        type="submit"
        disabled={pending || !name}
        style={{
          height: 28,
          padding: '0 12px',
          background: name && !pending ? '#2563eb' : '#1a1a26',
          border: `1px solid ${name && !pending ? 'transparent' : '#27272a'}`,
          borderRadius: 5,
          fontSize: 12,
          fontWeight: 500,
          color: name && !pending ? '#fff' : '#3e3e52',
          cursor: name && !pending ? 'pointer' : 'default',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          flexShrink: 0,
          alignSelf: 'flex-end',
        }}
      >
        <Plus size={12} strokeWidth={2} />
        {pending ? '…' : 'Ajouter'}
      </button>
      {state && 'error' in state && (
        <p style={{ margin: 0, fontSize: 11, color: '#ff6060', flexBasis: '100%' }}>
          {state.error}
        </p>
      )}
    </form>
  )
}

function TermRow({
  term,
  taxonomyId,
  editing,
  onEdit,
  onCancel,
  onDone,
  parentOptions,
  indent,
}: {
  term: Term
  taxonomyId: string
  editing: boolean
  onEdit: () => void
  onCancel: () => void
  onDone: () => void
  parentOptions: Term[]
  indent: number
}) {
  const [deletePending, startDelete] = useTransition()
  const boundUpdate = updateTermAction.bind(null, term.id, taxonomyId)
  const [state, formAction, updatePending] = useActionState<TaxonomyActionState, FormData>(
    boundUpdate,
    null,
  )

  if (editing) {
    return (
      <div
        style={{
          paddingLeft: indent * 20 + 10,
          paddingRight: 10,
          paddingBlock: 8,
          background: '#1a1a26',
          border: '1px solid #27272a',
          borderRadius: 7,
          marginLeft: indent * 16,
        }}
      >
        <form
          action={formAction}
          onSubmit={() => setTimeout(onDone, 100)}
          style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}
        >
          <input
            name="name"
            defaultValue={term.name}
            required
            placeholder="Nom"
            style={{ ...INPUT_S, flex: '1 1 100px' }}
          />
          <input
            name="slug"
            defaultValue={term.slug}
            required
            placeholder="slug"
            style={{
              ...INPUT_S,
              flex: '1 1 80px',
              fontFamily: 'ui-monospace, monospace',
              fontSize: 11,
            }}
          />
          {parentOptions.length > 0 && (
            <select
              name="parentId"
              defaultValue={term.parentId ?? ''}
              style={{ ...INPUT_S, flex: '0 0 100px', appearance: 'auto' }}
            >
              <option value="">Aucun parent</option>
              {parentOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          )}
          <button
            type="submit"
            disabled={updatePending}
            style={{
              width: 28,
              height: 28,
              background: '#0e2e1a',
              border: '1px solid #1a4a28',
              borderRadius: 5,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Check size={12} color="#4ade80" />
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{
              width: 28,
              height: 28,
              background: 'none',
              border: '1px solid #27272a',
              borderRadius: 5,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <X size={12} color="#71717a" />
          </button>
          {state && 'error' in state && (
            <p style={{ margin: 0, fontSize: 11, color: '#ff6060', flexBasis: '100%' }}>
              {state.error}
            </p>
          )}
        </form>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 80px 56px',
        alignItems: 'center',
        padding: '8px 10px',
        paddingLeft: indent * 16 + 10,
        background: '#111113',
        border: '1px solid #1f1f2e',
        borderRadius: 7,
      }}
    >
      <div>
        <span style={{ fontSize: 13, color: '#d4d4d8' }}>
          {indent > 0 && <span style={{ color: '#3e3e52', marginRight: 4 }}>└</span>}
          {term.name}
        </span>
        <span
          style={{
            marginLeft: 8,
            fontSize: 11,
            color: '#3e3e52',
            fontFamily: 'ui-monospace, monospace',
          }}
        >
          {term.slug}
        </span>
      </div>
      <span style={{ fontSize: 12, color: '#71717a' }}>{term._count.entries}</span>
      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onEdit}
          style={{
            width: 26,
            height: 26,
            background: 'none',
            border: '1px solid #27272a',
            borderRadius: 4,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Pencil size={11} color="#52525b" />
        </button>
        <button
          type="button"
          disabled={deletePending}
          onClick={() =>
            startDelete(async () => {
              await deleteTermAction(term.id, taxonomyId)
            })
          }
          style={{
            width: 26,
            height: 26,
            background: 'none',
            border: '1px solid #27272a',
            borderRadius: 4,
            cursor: deletePending ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Trash2 size={11} color="#6b3a3a" />
        </button>
      </div>
    </div>
  )
}
