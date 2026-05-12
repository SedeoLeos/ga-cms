'use client'

import type { FieldType, SchemaField } from '@/lib/actions/collections'
import type { EntryActionState } from '@/lib/actions/entries'
import { updateEntryAction, updateEntryStatusAction } from '@/lib/actions/entries'
import {
  AlignLeft,
  Calendar,
  Check,
  FileText,
  Hash,
  Image as ImageIcon,
  Link2,
  List,
  ToggleLeft,
  Type,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useRef, useState, useTransition } from 'react'

const FIELD_ICON: Record<FieldType, LucideIcon> = {
  text: Type,
  textarea: AlignLeft,
  richtext: FileText,
  number: Hash,
  boolean: ToggleLeft,
  date: Calendar,
  select: List,
  media: ImageIcon,
  relation: Link2,
}

const INPUT_S: React.CSSProperties = {
  width: '100%',
  background: '#1e1e2e',
  border: '1px solid #2a2a3e',
  borderRadius: 6,
  padding: '0 10px',
  fontSize: 13,
  color: '#e8e8f0',
  outline: 'none',
  boxSizing: 'border-box',
  height: 34,
}

const LABEL_S: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 500,
  color: '#8a8aa8',
  marginBottom: 6,
}

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT: { label: 'Brouillon', color: '#5a5a78', bg: '#1e1e2e' },
  PUBLISHED: { label: 'Publié', color: '#4ade80', bg: '#0e2e1a' },
  ARCHIVED: { label: 'Archivé', color: '#a07840', bg: '#1e1a0e' },
}

function getDefaultValue(type: FieldType): unknown {
  if (type === 'boolean') return false
  return ''
}

interface Props {
  entryId: string
  collectionId: string
  collectionName: string
  schema: SchemaField[]
  initialData: Record<string, unknown>
  initialStatus: string
  initialLocale: string
  siteLocales: string[]
  createdAt: string
  updatedAt: string
}

export default function EntryForm({
  entryId,
  collectionId,
  schema,
  initialData,
  initialStatus,
  initialLocale,
  siteLocales,
  createdAt,
  updatedAt,
}: Props) {
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const init: Record<string, unknown> = {}
    for (const field of schema) {
      init[field.key] = initialData[field.key] ?? getDefaultValue(field.type)
    }
    return init
  })
  const [locale, setLocale] = useState(initialLocale)
  const [status, setStatus] = useState(initialStatus)
  const [dirty, setDirty] = useState(false)
  const dataRef = useRef<HTMLInputElement>(null)
  const localeRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const boundAction = updateEntryAction.bind(null, entryId)
  const [state, formAction, pending] = useActionState<EntryActionState, FormData>(boundAction, null)
  const [statusPending, startStatusTransition] = useTransition()

  useEffect(() => {
    if (state && 'success' in state) {
      setDirty(false)
    }
  }, [state])

  function set(key: string, val: unknown) {
    setValues((prev) => ({ ...prev, [key]: val }))
    setDirty(true)
  }

  function handleFormSubmit() {
    if (dataRef.current) dataRef.current.value = JSON.stringify(values)
    if (localeRef.current) localeRef.current.value = locale
  }

  function handleStatusChange(newStatus: string) {
    startStatusTransition(async () => {
      await updateEntryStatusAction(entryId, collectionId, newStatus)
      setStatus(newStatus)
      router.refresh()
    })
  }

  const sm = STATUS_META[status] ?? { label: 'Brouillon', color: '#5a5a78', bg: '#1e1e2e' }

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      {/* Main form */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 600,
              color: '#e8e8f0',
              letterSpacing: '-0.01em',
            }}
          >
            Édition d'entrée
          </h1>
          <form
            id="entry-form"
            action={formAction}
            onSubmit={handleFormSubmit}
            style={{ display: 'none' }}
          >
            <input type="hidden" name="data" ref={dataRef} />
            <input type="hidden" name="locale" ref={localeRef} />
          </form>
          <button
            type="submit"
            form="entry-form"
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
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s',
            }}
          >
            {state && 'success' in state && !dirty && <Check size={13} />}
            {pending ? 'Enregistrement…' : dirty ? 'Enregistrer' : 'Enregistré'}
          </button>
        </div>

        {state && 'error' in state && (
          <p style={{ margin: '0 0 16px', fontSize: 12, color: '#ff6060' }}>{state.error}</p>
        )}

        {schema.length === 0 ? (
          <div
            style={{
              background: '#13131c',
              border: '1px solid #1f1f2e',
              borderRadius: 10,
              padding: '40px 24px',
              textAlign: 'center',
            }}
          >
            <p style={{ margin: 0, fontSize: 13, color: '#3e3e52' }}>
              Aucun champ défini dans le schéma.
            </p>
          </div>
        ) : (
          <div
            style={{
              background: '#13131c',
              border: '1px solid #1f1f2e',
              borderRadius: 10,
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
            }}
          >
            {schema.map((field) => (
              <FieldInput
                key={field.id}
                field={field}
                value={values[field.key]}
                onChange={(v) => set(field.key, v)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Status card */}
        <div
          style={{
            background: '#13131c',
            border: '1px solid #1f1f2e',
            borderRadius: 10,
            padding: 16,
          }}
        >
          <p
            style={{
              margin: '0 0 10px',
              fontSize: 11,
              fontWeight: 600,
              color: '#3e3e52',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Statut
          </p>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              height: 22,
              padding: '0 8px',
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 500,
              background: sm.bg,
              color: sm.color,
              marginBottom: 12,
            }}
          >
            {sm.label}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {status !== 'PUBLISHED' && (
              <button
                type="button"
                disabled={statusPending}
                onClick={() => handleStatusChange('PUBLISHED')}
                style={{
                  height: 30,
                  background: '#0e2e1a',
                  border: '1px solid #1a4a28',
                  borderRadius: 5,
                  fontSize: 12,
                  fontWeight: 500,
                  color: '#4ade80',
                  cursor: statusPending ? 'not-allowed' : 'pointer',
                }}
              >
                Publier
              </button>
            )}
            {status === 'PUBLISHED' && (
              <button
                type="button"
                disabled={statusPending}
                onClick={() => handleStatusChange('DRAFT')}
                style={{
                  height: 30,
                  background: 'none',
                  border: '1px solid #2a2a3e',
                  borderRadius: 5,
                  fontSize: 12,
                  color: '#8a8aa8',
                  cursor: statusPending ? 'not-allowed' : 'pointer',
                }}
              >
                Dépublier
              </button>
            )}
            {status !== 'ARCHIVED' && (
              <button
                type="button"
                disabled={statusPending}
                onClick={() => handleStatusChange('ARCHIVED')}
                style={{
                  height: 30,
                  background: 'none',
                  border: '1px solid #2a2a3e',
                  borderRadius: 5,
                  fontSize: 12,
                  color: '#5a5a78',
                  cursor: statusPending ? 'not-allowed' : 'pointer',
                }}
              >
                Archiver
              </button>
            )}
            {status === 'ARCHIVED' && (
              <button
                type="button"
                disabled={statusPending}
                onClick={() => handleStatusChange('DRAFT')}
                style={{
                  height: 30,
                  background: 'none',
                  border: '1px solid #2a2a3e',
                  borderRadius: 5,
                  fontSize: 12,
                  color: '#8a8aa8',
                  cursor: statusPending ? 'not-allowed' : 'pointer',
                }}
              >
                Restaurer
              </button>
            )}
          </div>
        </div>

        {/* Locale card */}
        {siteLocales.length > 1 && (
          <div
            style={{
              background: '#13131c',
              border: '1px solid #1f1f2e',
              borderRadius: 10,
              padding: 16,
            }}
          >
            <p
              style={{
                margin: '0 0 10px',
                fontSize: 11,
                fontWeight: 600,
                color: '#3e3e52',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Langue
            </p>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {siteLocales.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    setLocale(code)
                    setDirty(true)
                  }}
                  style={{
                    height: 26,
                    padding: '0 10px',
                    background: locale === code ? '#4353ff' : '#1a1a26',
                    border: `1px solid ${locale === code ? '#4353ff' : '#2a2a3e'}`,
                    borderRadius: 4,
                    fontSize: 11,
                    fontFamily: 'ui-monospace, monospace',
                    color: locale === code ? '#fff' : '#5a5a78',
                    cursor: 'pointer',
                  }}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dates card */}
        <div
          style={{
            background: '#13131c',
            border: '1px solid #1f1f2e',
            borderRadius: 10,
            padding: 16,
          }}
        >
          <div style={{ marginBottom: 8 }}>
            <p style={{ margin: '0 0 2px', fontSize: 11, color: '#3e3e52' }}>Créé le</p>
            <p style={{ margin: 0, fontSize: 12, color: '#5a5a78' }}>{createdAt}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 2px', fontSize: 11, color: '#3e3e52' }}>Modifié le</p>
            <p style={{ margin: 0, fontSize: 12, color: '#5a5a78' }}>{updatedAt}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: SchemaField
  value: unknown
  onChange: (v: unknown) => void
}) {
  const Icon = FIELD_ICON[field.type] ?? Type
  const inputId = `fi-${field.id}`

  return (
    <div>
      {field.type !== 'boolean' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <Icon size={12} strokeWidth={1.5} color="#4a4a68" />
          <label htmlFor={inputId} style={LABEL_S}>
            {field.name}
            {field.required && <span style={{ color: '#4353ff', marginLeft: 3 }}>*</span>}
          </label>
        </div>
      )}

      {field.type === 'text' && (
        <input
          id={inputId}
          type="text"
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.description ?? ''}
          className="admin-input"
          style={INPUT_S}
        />
      )}

      {field.type === 'textarea' && (
        <textarea
          id={inputId}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.description ?? ''}
          className="admin-input"
          rows={4}
          style={{
            ...INPUT_S,
            height: 'auto',
            padding: '8px 10px',
            resize: 'vertical',
            minHeight: 88,
          }}
        />
      )}

      {field.type === 'richtext' && (
        <textarea
          id={inputId}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.description ?? 'Contenu richtext…'}
          className="admin-input"
          rows={10}
          style={{
            ...INPUT_S,
            height: 'auto',
            padding: '8px 10px',
            resize: 'vertical',
            minHeight: 160,
            fontFamily: 'ui-monospace, monospace',
            fontSize: 12,
          }}
        />
      )}

      {field.type === 'number' && (
        <input
          id={inputId}
          type="number"
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          placeholder={field.description ?? '0'}
          className="admin-input"
          style={INPUT_S}
        />
      )}

      {field.type === 'boolean' && (
        <label
          htmlFor={inputId}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
        >
          <Icon size={12} strokeWidth={1.5} color="#4a4a68" />
          <span style={{ fontSize: 12, fontWeight: 500, color: '#8a8aa8' }}>
            {field.name}
            {field.required && <span style={{ color: '#4353ff', marginLeft: 3 }}>*</span>}
          </span>
          <input
            id={inputId}
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            style={{ width: 14, height: 14, cursor: 'pointer' }}
          />
          {field.description && (
            <span style={{ fontSize: 12, color: '#5a5a78' }}>{field.description}</span>
          )}
        </label>
      )}

      {field.type === 'date' && (
        <input
          id={inputId}
          type="date"
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          className="admin-input"
          style={{ ...INPUT_S, colorScheme: 'dark' }}
        />
      )}

      {field.type === 'select' && (
        <select
          id={inputId}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          className="admin-input"
          style={{ ...INPUT_S, appearance: 'auto' }}
        >
          <option value="">— Choisir —</option>
          {(field.options ?? []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )}

      {field.type === 'media' && (
        <input
          id={inputId}
          type="url"
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.description ?? 'https://…'}
          className="admin-input"
          style={INPUT_S}
        />
      )}

      {field.type === 'relation' && (
        <input
          id={inputId}
          type="text"
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.description ?? "ID de l'entrée liée"}
          className="admin-input"
          style={{ ...INPUT_S, fontFamily: 'ui-monospace, monospace', fontSize: 12 }}
        />
      )}

      {field.description && field.type !== 'boolean' && (
        <p style={{ margin: '4px 0 0', fontSize: 11, color: '#3e3e52' }}>{field.description}</p>
      )}
    </div>
  )
}
