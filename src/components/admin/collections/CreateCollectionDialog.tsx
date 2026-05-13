'use client'

import type { CollectionActionState } from '@/lib/actions/collections'
import { createCollectionAction } from '@/lib/actions/collections'
import { Loader2, Plus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useRef, useState } from 'react'

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  height: 34,
  background: '#1e1e2e',
  border: '1px solid #2a2a3e',
  borderRadius: 6,
  padding: '0 10px',
  fontSize: 13,
  color: '#e8e8f0',
  outline: 'none',
  boxSizing: 'border-box',
}

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 500,
  color: '#8a8aa8',
  marginBottom: 6,
}

export default function CreateCollectionDialog() {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState<CollectionActionState, FormData>(
    createCollectionAction,
    null,
  )
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (state && 'success' in state) {
      setOpen(false)
      resetForm()
      router.refresh()
    }
  }, [state, router])

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => nameRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [open])

  function resetForm() {
    setName('')
    setSlug('')
    setSlugTouched(false)
  }

  function handleClose() {
    setOpen(false)
    resetForm()
  }

  function handleNameChange(v: string) {
    setName(v)
    if (!slugTouched) setSlug(slugify(v))
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="create-site-btn"
        style={{
          height: 32,
          padding: '0 14px',
          background: '#4353ff',
          border: 'none',
          borderRadius: 6,
          fontSize: 13,
          fontWeight: 500,
          color: '#fff',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <Plus size={14} strokeWidth={2} />
        Nouvelle collection
      </button>
    )
  }

  return (
    <>
      <div
        role="presentation"
        onClick={handleClose}
        onKeyDown={(e) => e.key === 'Escape' && handleClose()}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 100 }}
      />
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 101,
          width: 440,
          background: '#16161f',
          border: '1px solid #2a2a3e',
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#e8e8f0' }}>
            Nouvelle collection
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="dialog-close-btn"
            style={{
              width: 26,
              height: 26,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 5,
              padding: 0,
              color: '#4a4a68',
            }}
          >
            <X size={14} />
          </button>
        </div>

        <form action={action}>
          <div style={{ marginBottom: 14 }}>
            <label htmlFor="col-name" style={LABEL_STYLE}>
              Nom de la collection
            </label>
            <input
              id="col-name"
              ref={nameRef}
              name="name"
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Articles de blog"
              required
              autoComplete="off"
              className="admin-input"
              style={INPUT_STYLE}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label htmlFor="col-slug" style={LABEL_STYLE}>
              Identifiant
            </label>
            <input
              id="col-slug"
              name="slug"
              type="text"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true)
                setSlug(e.target.value)
              }}
              placeholder="articles-de-blog"
              required
              pattern="[a-z0-9-]+"
              autoComplete="off"
              className="admin-input"
              style={{ ...INPUT_STYLE, fontFamily: 'ui-monospace, monospace', fontSize: 12 }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label htmlFor="col-desc" style={LABEL_STYLE}>
              Description <span style={{ color: '#3e3e52', fontWeight: 400 }}>(optionnel)</span>
            </label>
            <input
              id="col-desc"
              name="description"
              type="text"
              placeholder="Une courte description…"
              autoComplete="off"
              className="admin-input"
              style={INPUT_STYLE}
            />
          </div>

          {state && 'error' in state && (
            <p style={{ margin: '0 0 14px', fontSize: 12, color: '#ff6060' }}>{state.error}</p>
          )}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleClose}
              className="dialog-cancel-btn"
              style={{
                height: 32,
                padding: '0 14px',
                background: 'none',
                border: '1px solid #2a2a3e',
                borderRadius: 6,
                fontSize: 13,
                color: '#8a8aa8',
                cursor: 'pointer',
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={pending}
              style={{
                height: 32,
                padding: '0 16px',
                background: pending ? '#2a2a4e' : '#4353ff',
                border: 'none',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 500,
                color: pending ? '#6a6a90' : '#fff',
                cursor: pending ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                transition: 'background 0.15s',
              }}
            >
              {pending && <Loader2 size={13} className="spin" />}
              Créer la collection
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
