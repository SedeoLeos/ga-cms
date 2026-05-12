'use client'

import type { FieldType, SchemaActionState, SchemaField } from '@/lib/actions/collections'
import { updateCollectionSchemaAction } from '@/lib/actions/collections'
import type { LucideIcon } from 'lucide-react'
import {
  AlignLeft,
  Calendar,
  ChevronDown,
  ChevronUp,
  FileText,
  Hash,
  Image as ImageIcon,
  Link2,
  List,
  Plus,
  ToggleLeft,
  Trash2,
  Type,
  X,
} from 'lucide-react'
import { useActionState, useEffect, useRef, useState } from 'react'

const FIELD_TYPES: { type: FieldType; label: string; Icon: LucideIcon }[] = [
  { type: 'text', label: 'Texte', Icon: Type },
  { type: 'textarea', label: 'Texte long', Icon: AlignLeft },
  { type: 'richtext', label: 'Richtext', Icon: FileText },
  { type: 'number', label: 'Nombre', Icon: Hash },
  { type: 'boolean', label: 'Booléen', Icon: ToggleLeft },
  { type: 'date', label: 'Date', Icon: Calendar },
  { type: 'select', label: 'Sélection', Icon: List },
  { type: 'media', label: 'Média', Icon: ImageIcon },
  { type: 'relation', label: 'Relation', Icon: Link2 },
]

const FIELD_TYPE_MAP = Object.fromEntries(FIELD_TYPES.map((f) => [f.type, f])) as Record<
  FieldType,
  { type: FieldType; label: string; Icon: LucideIcon }
>

const INPUT_S: React.CSSProperties = {
  height: 32,
  background: '#1e1e2e',
  border: '1px solid #2a2a3e',
  borderRadius: 5,
  padding: '0 9px',
  fontSize: 12,
  color: '#e8e8f0',
  outline: 'none',
  boxSizing: 'border-box',
  width: '100%',
}

function keyify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^[^a-z]+/, '')
    .replace(/_+$/g, '')
}

function makeBlankField(type: FieldType): SchemaField {
  return {
    id: crypto.randomUUID(),
    type,
    name: '',
    key: '',
    required: false,
    description: '',
    options: type === 'select' ? [''] : [],
    multiple: false,
    relatedCollectionId: '',
  }
}

interface SiblingCollection {
  id: string
  name: string
}

interface Props {
  collectionId: string
  initialSchema: SchemaField[]
  siblingCollections: SiblingCollection[]
}

export default function SchemaBuilder({ collectionId, initialSchema, siblingCollections }: Props) {
  const [fields, setFields] = useState<SchemaField[]>(initialSchema)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showTypePicker, setShowTypePicker] = useState(false)
  const [dirty, setDirty] = useState(false)
  const schemaRef = useRef<HTMLInputElement>(null)

  const boundAction = updateCollectionSchemaAction.bind(null, collectionId)
  const [state, formAction, pending] = useActionState<SchemaActionState, FormData>(
    boundAction,
    null,
  )

  useEffect(() => {
    if (state && 'success' in state) setDirty(false)
  }, [state])

  function handleFormSubmit() {
    if (schemaRef.current) schemaRef.current.value = JSON.stringify(fields)
  }

  function mutate(fn: (prev: SchemaField[]) => SchemaField[]) {
    setFields(fn)
    setDirty(true)
  }

  function addField(type: FieldType) {
    const f = makeBlankField(type)
    mutate((prev) => [...prev, f])
    setExpandedId(f.id)
    setShowTypePicker(false)
  }

  function updateField(id: string, patch: Partial<SchemaField>) {
    mutate((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)))
  }

  function moveField(id: string, dir: -1 | 1) {
    mutate((prev) => {
      const idx = prev.findIndex((f) => f.id === id)
      if (idx < 0) return prev
      const next = idx + dir
      if (next < 0 || next >= prev.length) return prev
      const arr = [...prev]
      const a = arr[idx]
      const b = arr[next]
      if (!a || !b) return prev
      arr[idx] = b
      arr[next] = a
      return arr
    })
  }

  function deleteField(id: string) {
    mutate((prev) => prev.filter((f) => f.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <p style={{ margin: 0, fontSize: 13, color: '#5a5a78' }}>
          {fields.length} champ{fields.length !== 1 ? 's' : ''}
        </p>
        <form
          id="schema-form"
          action={formAction}
          onSubmit={handleFormSubmit}
          style={{ display: 'none' }}
        >
          <input type="hidden" name="schema" ref={schemaRef} />
        </form>
        <button
          type="submit"
          form="schema-form"
          disabled={pending || !dirty}
          style={{
            height: 32,
            padding: '0 14px',
            background: dirty && !pending ? '#4353ff' : '#1a1a26',
            border: `1px solid ${dirty && !pending ? 'transparent' : '#2a2a3e'}`,
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 500,
            color: dirty && !pending ? '#fff' : '#3e3e52',
            cursor: dirty && !pending ? 'pointer' : 'default',
            transition: 'all 0.15s',
          }}
        >
          {pending ? 'Enregistrement…' : dirty ? 'Enregistrer' : 'Enregistré'}
        </button>
      </div>

      {state && 'error' in state && (
        <p style={{ margin: '0 0 14px', fontSize: 12, color: '#ff6060' }}>{state.error}</p>
      )}

      <div
        style={{
          background: '#13131c',
          border: '1px solid #1f1f2e',
          borderRadius: 10,
          overflow: 'hidden',
          marginBottom: 10,
        }}
      >
        {fields.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 13, color: '#3e3e52' }}>
              Aucun champ — ajoutez-en un ci-dessous.
            </p>
          </div>
        ) : (
          fields.map((field, idx) => (
            <FieldRow
              key={field.id}
              field={field}
              idx={idx}
              total={fields.length}
              expanded={expandedId === field.id}
              onToggle={() => setExpandedId(expandedId === field.id ? null : field.id)}
              onUpdate={(patch) => updateField(field.id, patch)}
              onMove={(dir) => moveField(field.id, dir)}
              onDelete={() => deleteField(field.id)}
              siblingCollections={siblingCollections}
            />
          ))
        )}
      </div>

      {!showTypePicker ? (
        <button
          type="button"
          onClick={() => setShowTypePicker(true)}
          style={{
            height: 34,
            padding: '0 14px',
            background: 'none',
            border: '1px dashed #2a2a3e',
            borderRadius: 7,
            fontSize: 13,
            color: '#4a4a68',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            width: '100%',
            justifyContent: 'center',
          }}
        >
          <Plus size={13} />
          Ajouter un champ
        </button>
      ) : (
        <TypePicker onSelect={addField} onClose={() => setShowTypePicker(false)} />
      )}
    </div>
  )
}

function TypePicker({
  onSelect,
  onClose,
}: { onSelect: (t: FieldType) => void; onClose: () => void }) {
  return (
    <div
      style={{
        background: '#13131c',
        border: '1px solid #1f1f2e',
        borderRadius: 10,
        padding: 16,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 11,
            fontWeight: 600,
            color: '#5a5a78',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Type de champ
        </p>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#4a4a68',
            padding: 0,
            display: 'flex',
          }}
        >
          <X size={14} />
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        {FIELD_TYPES.map(({ type, label, Icon }) => (
          <button
            key={type}
            type="button"
            onClick={() => onSelect(type)}
            style={{
              height: 58,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              background: '#1a1a26',
              border: '1px solid #2a2a3e',
              borderRadius: 7,
              cursor: 'pointer',
              color: '#8a8aa8',
            }}
          >
            <Icon size={16} strokeWidth={1.5} />
            <span style={{ fontSize: 11 }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

interface FieldRowProps {
  field: SchemaField
  idx: number
  total: number
  expanded: boolean
  onToggle: () => void
  onUpdate: (patch: Partial<SchemaField>) => void
  onMove: (dir: -1 | 1) => void
  onDelete: () => void
  siblingCollections: SiblingCollection[]
}

function FieldRow({
  field,
  idx,
  total,
  expanded,
  onToggle,
  onUpdate,
  onMove,
  onDelete,
  siblingCollections,
}: FieldRowProps) {
  const [keyTouched, setKeyTouched] = useState(field.key !== '')
  const meta = FIELD_TYPE_MAP[field.type]
  const Icon = meta?.Icon ?? Type

  function handleNameChange(v: string) {
    onUpdate({ name: v, ...(!keyTouched ? { key: keyify(v) } : {}) })
  }

  function handleKeyChange(v: string) {
    setKeyTouched(true)
    onUpdate({ key: v })
  }

  return (
    <div style={{ borderBottom: '1px solid #1a1a24' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px' }}>
        {/* Toggle — icon + name + type badge */}
        <button
          type="button"
          onClick={onToggle}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            textAlign: 'left',
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: 28,
              flexShrink: 0,
              color: '#4a4a68',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Icon size={14} strokeWidth={1.5} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#e8e8f0' }}>
                {field.name || (
                  <span style={{ color: '#3e3e52', fontStyle: 'italic' }}>Sans nom</span>
                )}
              </span>
              {field.required && (
                <span
                  style={{
                    fontSize: 10,
                    background: '#1e264a',
                    color: '#8090f0',
                    borderRadius: 3,
                    padding: '1px 5px',
                  }}
                >
                  Requis
                </span>
              )}
            </div>
            <div
              style={{
                fontSize: 11,
                color: '#3e3e52',
                fontFamily: 'ui-monospace, monospace',
                marginTop: 1,
              }}
            >
              {field.key || '—'}
            </div>
          </div>

          <span style={{ fontSize: 11, color: '#5a5a78', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {meta?.label ?? field.type}
          </span>
        </button>

        {/* Move buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, flexShrink: 0 }}>
          <button
            type="button"
            disabled={idx === 0}
            onClick={() => onMove(-1)}
            style={{
              background: 'none',
              border: 'none',
              cursor: idx === 0 ? 'default' : 'pointer',
              color: idx === 0 ? '#2a2a3e' : '#4a4a68',
              padding: '1px 2px',
              lineHeight: 1,
              display: 'flex',
            }}
          >
            <ChevronUp size={11} />
          </button>
          <button
            type="button"
            disabled={idx === total - 1}
            onClick={() => onMove(1)}
            style={{
              background: 'none',
              border: 'none',
              cursor: idx === total - 1 ? 'default' : 'pointer',
              color: idx === total - 1 ? '#2a2a3e' : '#4a4a68',
              padding: '1px 2px',
              lineHeight: 1,
              display: 'flex',
            }}
          >
            <ChevronDown size={11} />
          </button>
        </div>

        {/* Delete */}
        <button
          type="button"
          onClick={onDelete}
          title="Supprimer"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#3e3e52',
            padding: '2px',
            display: 'flex',
            flexShrink: 0,
          }}
        >
          <Trash2 size={13} strokeWidth={1.5} />
        </button>
      </div>

      {expanded && (
        <FieldEditor
          field={field}
          onNameChange={handleNameChange}
          onKeyChange={handleKeyChange}
          onUpdate={onUpdate}
          onDone={onToggle}
          siblingCollections={siblingCollections}
        />
      )}
    </div>
  )
}

interface FieldEditorProps {
  field: SchemaField
  onNameChange: (v: string) => void
  onKeyChange: (v: string) => void
  onUpdate: (patch: Partial<SchemaField>) => void
  onDone: () => void
  siblingCollections: SiblingCollection[]
}

function FieldEditor({
  field,
  onNameChange,
  onKeyChange,
  onUpdate,
  onDone,
  siblingCollections,
}: FieldEditorProps) {
  const nameRef = useRef<HTMLInputElement>(null)
  const shouldFocus = useRef(!field.name)
  useEffect(() => {
    if (shouldFocus.current) nameRef.current?.focus()
  }, [])

  return (
    <div
      style={{
        padding: '12px 14px 14px',
        background: '#0f0f18',
        borderTop: '1px solid #1a1a24',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <div>
          <label
            htmlFor={`fn-${field.id}`}
            style={{ display: 'block', fontSize: 11, color: '#5a5a78', marginBottom: 4 }}
          >
            Nom
          </label>
          <input
            id={`fn-${field.id}`}
            ref={nameRef}
            type="text"
            value={field.name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Mon champ"
            className="admin-input"
            style={INPUT_S}
          />
        </div>
        <div>
          <label
            htmlFor={`fk-${field.id}`}
            style={{ display: 'block', fontSize: 11, color: '#5a5a78', marginBottom: 4 }}
          >
            Clé
          </label>
          <input
            id={`fk-${field.id}`}
            type="text"
            value={field.key}
            onChange={(e) => onKeyChange(e.target.value)}
            placeholder="mon_champ"
            pattern="[a-z][a-z0-9_]*"
            className="admin-input"
            style={{ ...INPUT_S, fontFamily: 'ui-monospace, monospace', fontSize: 11 }}
          />
        </div>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label
          htmlFor={`fd-${field.id}`}
          style={{ display: 'block', fontSize: 11, color: '#5a5a78', marginBottom: 4 }}
        >
          Description <span style={{ color: '#2e2e42', fontWeight: 400 }}>(optionnel)</span>
        </label>
        <input
          id={`fd-${field.id}`}
          type="text"
          value={field.description ?? ''}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Texte d'aide affiché sous le champ"
          className="admin-input"
          style={INPUT_S}
        />
      </div>

      <label
        htmlFor={`fr-${field.id}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          cursor: 'pointer',
          marginBottom: 12,
        }}
      >
        <input
          id={`fr-${field.id}`}
          type="checkbox"
          checked={field.required}
          onChange={(e) => onUpdate({ required: e.target.checked })}
          style={{ width: 13, height: 13, cursor: 'pointer' }}
        />
        <span style={{ fontSize: 12, color: '#8a8aa8' }}>Champ requis</span>
      </label>

      {field.type === 'select' && <SelectOptions field={field} onUpdate={onUpdate} />}

      {(field.type === 'media' || field.type === 'relation') && (
        <label
          htmlFor={`fm-${field.id}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            cursor: 'pointer',
            marginBottom: 12,
          }}
        >
          <input
            id={`fm-${field.id}`}
            type="checkbox"
            checked={field.multiple ?? false}
            onChange={(e) => onUpdate({ multiple: e.target.checked })}
            style={{ width: 13, height: 13, cursor: 'pointer' }}
          />
          <span style={{ fontSize: 12, color: '#8a8aa8' }}>Sélection multiple</span>
        </label>
      )}

      {field.type === 'relation' && siblingCollections.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <label
            htmlFor={`frel-${field.id}`}
            style={{ display: 'block', fontSize: 11, color: '#5a5a78', marginBottom: 4 }}
          >
            Collection liée
          </label>
          <select
            id={`frel-${field.id}`}
            value={field.relatedCollectionId ?? ''}
            onChange={(e) => onUpdate({ relatedCollectionId: e.target.value })}
            style={{ ...INPUT_S, appearance: 'auto' }}
          >
            <option value="">— Choisir —</option>
            {siblingCollections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onDone}
          style={{
            height: 28,
            padding: '0 12px',
            background: 'none',
            border: '1px solid #2a2a3e',
            borderRadius: 5,
            fontSize: 12,
            color: '#5a5a78',
            cursor: 'pointer',
          }}
        >
          Terminé
        </button>
      </div>
    </div>
  )
}

type SelectOptionItem = { id: string; value: string }

function SelectOptions({
  field,
  onUpdate,
}: { field: SchemaField; onUpdate: (patch: Partial<SchemaField>) => void }) {
  const [items, setItems] = useState<SelectOptionItem[]>(() =>
    (field.options ?? ['']).map((v) => ({ id: crypto.randomUUID(), value: v })),
  )

  function sync(next: SelectOptionItem[]) {
    setItems(next)
    onUpdate({ options: next.map((i) => i.value) })
  }

  function setVal(id: string, val: string) {
    sync(items.map((item) => (item.id === id ? { ...item, value: val } : item)))
  }

  function addItem() {
    sync([...items, { id: crypto.randomUUID(), value: '' }])
  }

  function removeItem(id: string) {
    if (items.length <= 1) return
    sync(items.filter((item) => item.id !== id))
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <p style={{ margin: '0 0 6px', fontSize: 11, color: '#5a5a78' }}>Options</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {items.map(({ id, value }) => (
          <div key={id} style={{ display: 'flex', gap: 5 }}>
            <input
              type="text"
              value={value}
              onChange={(e) => setVal(id, e.target.value)}
              placeholder="Valeur"
              className="admin-input"
              style={INPUT_S}
            />
            <button
              type="button"
              onClick={() => removeItem(id)}
              disabled={items.length <= 1}
              style={{
                width: 28,
                height: 32,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none',
                border: '1px solid #2a2a3e',
                borderRadius: 5,
                cursor: items.length <= 1 ? 'not-allowed' : 'pointer',
                color: items.length <= 1 ? '#2a2a3e' : '#4a4a68',
              }}
            >
              <X size={11} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          style={{
            height: 28,
            padding: '0 10px',
            background: 'none',
            border: '1px dashed #2a2a3e',
            borderRadius: 5,
            fontSize: 11,
            color: '#4a4a68',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            alignSelf: 'flex-start',
          }}
        >
          <Plus size={10} />
          Option
        </button>
      </div>
    </div>
  )
}
