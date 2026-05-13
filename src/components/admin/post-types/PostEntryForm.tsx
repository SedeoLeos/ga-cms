'use client'

import MediaPickerField from '@/components/admin/media/MediaPickerField'
import type { FieldType, SchemaField } from '@/lib/actions/collections'
import type { PostEntryActionState } from '@/lib/actions/post-entries'
import {
  updatePostEntryAction,
  updatePostEntryStatusAction,
  updatePostEntryTermsAction,
} from '@/lib/actions/post-entries'
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

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

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
  background: '#1c1c1f',
  border: '1px solid #27272a',
  borderRadius: 6,
  padding: '0 10px',
  fontSize: 13,
  color: '#f4f4f5',
  outline: 'none',
  boxSizing: 'border-box',
  height: 34,
}

const LABEL_S: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 500,
  color: '#a1a1aa',
  marginBottom: 6,
}

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT: { label: 'Brouillon', color: '#71717a', bg: '#1c1c1f' },
  PUBLISHED: { label: 'Publié', color: '#4ade80', bg: '#0e2e1a' },
  ARCHIVED: { label: 'Archivé', color: '#a07840', bg: '#1e1a0e' },
}

function getDefaultValue(type: FieldType): unknown {
  if (type === 'boolean') return false
  return ''
}

export type TaxonomyWithTerms = {
  id: string
  name: string
  slug: string
  hierarchical: boolean
  terms: { id: string; name: string; slug: string; parentId: string | null }[]
}

interface Props {
  entryId: string
  postTypeId: string
  postTypeName: string
  schema: SchemaField[]
  initialTitle: string
  initialSlug: string
  initialData: Record<string, unknown>
  initialStatus: string
  initialLocale: string
  siteLocales: string[]
  taxonomies: TaxonomyWithTerms[]
  initialTermIds: string[]
  createdAt: string
  updatedAt: string
}

export default function PostEntryForm({
  entryId,
  postTypeId,
  schema,
  initialTitle,
  initialSlug,
  initialData,
  initialStatus,
  initialLocale,
  siteLocales,
  taxonomies,
  initialTermIds,
  createdAt,
  updatedAt,
}: Props) {
  const [title, setTitle] = useState(initialTitle)
  const [slug, setSlug] = useState(initialSlug)
  const [slugEdited, setSlugEdited] = useState(false)
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const init: Record<string, unknown> = {}
    for (const field of schema) {
      init[field.key] = initialData[field.key] ?? getDefaultValue(field.type)
    }
    return init
  })
  const [locale, setLocale] = useState(initialLocale)
  const [status, setStatus] = useState(initialStatus)
  const [termIds, setTermIds] = useState<Set<string>>(new Set(initialTermIds))
  const [termsPending, startTermsTransition] = useTransition()
  const [dirty, setDirty] = useState(false)

  const titleRef = useRef<HTMLInputElement>(null)
  const slugRef = useRef<HTMLInputElement>(null)
  const dataRef = useRef<HTMLInputElement>(null)
  const localeRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const boundAction = updatePostEntryAction.bind(null, entryId)
  const [state, formAction, pending] = useActionState<PostEntryActionState, FormData>(
    boundAction,
    null,
  )
  const [statusPending, startStatusTransition] = useTransition()

  function toggleTerm(termId: string) {
    const next = new Set(termIds)
    if (next.has(termId)) {
      next.delete(termId)
    } else {
      next.add(termId)
    }
    setTermIds(next)
    startTermsTransition(async () => {
      await updatePostEntryTermsAction(entryId, postTypeId, Array.from(next))
    })
  }

  useEffect(() => {
    if (state && 'success' in state) {
      setDirty(false)
    }
  }, [state])

  function handleTitleChange(val: string) {
    setTitle(val)
    setDirty(true)
    if (!slugEdited) {
      setSlug(slugify(val))
    }
  }

  function handleSlugChange(val: string) {
    setSlug(val)
    setSlugEdited(true)
    setDirty(true)
  }

  function set(key: string, val: unknown) {
    setValues((prev) => ({ ...prev, [key]: val }))
    setDirty(true)
  }

  function handleFormSubmit() {
    if (titleRef.current) titleRef.current.value = title
    if (slugRef.current) slugRef.current.value = slug
    if (dataRef.current) dataRef.current.value = JSON.stringify(values)
    if (localeRef.current) localeRef.current.value = locale
  }

  function handleStatusChange(newStatus: string) {
    startStatusTransition(async () => {
      await updatePostEntryStatusAction(entryId, postTypeId, newStatus)
      setStatus(newStatus)
      router.refresh()
    })
  }

  const sm = STATUS_META[status] ?? { label: 'Brouillon', color: '#71717a', bg: '#1c1c1f' }

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      {/* Main form */}
      <div style={{ flex: 1, minWidth: 0 }}>
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
              color: '#f4f4f5',
              letterSpacing: '-0.01em',
            }}
          >
            Édition du billet
          </h1>
          <form
            id="post-entry-form"
            action={formAction}
            onSubmit={handleFormSubmit}
            style={{ display: 'none' }}
          >
            <input type="hidden" name="title" ref={titleRef} />
            <input type="hidden" name="slug" ref={slugRef} />
            <input type="hidden" name="data" ref={dataRef} />
            <input type="hidden" name="locale" ref={localeRef} />
          </form>
          <button
            type="submit"
            form="post-entry-form"
            disabled={pending || !dirty}
            style={{
              height: 32,
              padding: '0 14px',
              background: dirty && !pending ? '#2563eb' : '#1a1a26',
              border: `1px solid ${dirty && !pending ? 'transparent' : '#27272a'}`,
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

        {/* Title + Slug */}
        <div
          style={{
            background: '#111113',
            border: '1px solid #1f1f2e',
            borderRadius: 10,
            padding: 20,
            marginBottom: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <div>
            <label htmlFor="pe-title" style={LABEL_S}>
              Titre
            </label>
            <input
              id="pe-title"
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Titre du billet…"
              className="admin-input"
              style={{ ...INPUT_S, fontSize: 15, height: 38 }}
            />
          </div>
          <div>
            <label htmlFor="pe-slug" style={LABEL_S}>
              Identifiant (slug)
            </label>
            <input
              id="pe-slug"
              type="text"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="identifiant-du-billet"
              className="admin-input"
              style={{ ...INPUT_S, fontFamily: 'ui-monospace, monospace', fontSize: 12 }}
            />
          </div>
        </div>

        {/* Schema-driven fields */}
        {schema.length > 0 && (
          <div
            style={{
              background: '#111113',
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
        {/* Status */}
        <div
          style={{
            background: '#111113',
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
                  border: '1px solid #27272a',
                  borderRadius: 5,
                  fontSize: 12,
                  color: '#a1a1aa',
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
                  border: '1px solid #27272a',
                  borderRadius: 5,
                  fontSize: 12,
                  color: '#71717a',
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
                  border: '1px solid #27272a',
                  borderRadius: 5,
                  fontSize: 12,
                  color: '#a1a1aa',
                  cursor: statusPending ? 'not-allowed' : 'pointer',
                }}
              >
                Restaurer
              </button>
            )}
          </div>
        </div>

        {/* Locale */}
        {siteLocales.length > 1 && (
          <div
            style={{
              background: '#111113',
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
                    background: locale === code ? '#2563eb' : '#1a1a26',
                    border: `1px solid ${locale === code ? '#2563eb' : '#27272a'}`,
                    borderRadius: 4,
                    fontSize: 11,
                    fontFamily: 'ui-monospace, monospace',
                    color: locale === code ? '#fff' : '#71717a',
                    cursor: 'pointer',
                  }}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Taxonomies */}
        {taxonomies.length > 0 &&
          taxonomies.map((tax) => (
            <div
              key={tax.id}
              style={{
                background: '#111113',
                border: '1px solid #1f1f2e',
                borderRadius: 10,
                padding: 16,
                opacity: termsPending ? 0.7 : 1,
                transition: 'opacity 0.15s',
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
                {tax.name}
              </p>
              {tax.terms.length === 0 ? (
                <p style={{ margin: 0, fontSize: 12, color: '#3e3e52', fontStyle: 'italic' }}>
                  Aucun terme
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {tax.terms.map((term) => {
                    const checked = termIds.has(term.id)
                    return (
                      <label
                        key={term.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 7,
                          cursor: 'pointer',
                          paddingLeft: term.parentId ? 14 : 0,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleTerm(term.id)}
                          style={{
                            width: 13,
                            height: 13,
                            cursor: 'pointer',
                            accentColor: '#2563eb',
                          }}
                        />
                        <span style={{ fontSize: 12, color: checked ? '#f4f4f5' : '#a1a1aa' }}>
                          {term.name}
                        </span>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          ))}

        {/* Dates */}
        <div
          style={{
            background: '#111113',
            border: '1px solid #1f1f2e',
            borderRadius: 10,
            padding: 16,
          }}
        >
          <div style={{ marginBottom: 8 }}>
            <p style={{ margin: '0 0 2px', fontSize: 11, color: '#3e3e52' }}>Créé le</p>
            <p style={{ margin: 0, fontSize: 12, color: '#71717a' }}>{createdAt}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 2px', fontSize: 11, color: '#3e3e52' }}>Modifié le</p>
            <p style={{ margin: 0, fontSize: 12, color: '#71717a' }}>{updatedAt}</p>
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
  const inputId = `pfi-${field.id}`

  return (
    <div>
      {field.type !== 'boolean' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <Icon size={12} strokeWidth={1.5} color="#52525b" />
          <label htmlFor={inputId} style={LABEL_S}>
            {field.name}
            {field.required && <span style={{ color: '#2563eb', marginLeft: 3 }}>*</span>}
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
          <Icon size={12} strokeWidth={1.5} color="#52525b" />
          <span style={{ fontSize: 12, fontWeight: 500, color: '#a1a1aa' }}>
            {field.name}
            {field.required && <span style={{ color: '#2563eb', marginLeft: 3 }}>*</span>}
          </span>
          <input
            id={inputId}
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            style={{ width: 14, height: 14, cursor: 'pointer' }}
          />
          {field.description && (
            <span style={{ fontSize: 12, color: '#71717a' }}>{field.description}</span>
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
        <MediaPickerField
          value={String(value ?? '')}
          onChange={(url) => onChange(url)}
          inputId={inputId}
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
