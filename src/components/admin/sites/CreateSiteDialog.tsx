'use client'

import type { SiteActionState } from '@/lib/actions/sites'
import { createSiteAction } from '@/lib/actions/sites'
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

export default function CreateSiteDialog() {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState<SiteActionState, FormData>(createSiteAction, null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (state && 'success' in state) {
      setOpen(false)
      setName('')
      setSlug('')
      setSlugTouched(false)
      router.refresh()
    }
  }, [state, router])

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => nameRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [open])

  function handleNameChange(v: string) {
    setName(v)
    if (!slugTouched) setSlug(slugify(v))
  }

  function handleClose() {
    setOpen(false)
    setName('')
    setSlug('')
    setSlugTouched(false)
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
        Nouveau site
      </button>
    )
  }

  return (
    <>
      {/* Fond */}
      <div
        role="presentation"
        onClick={handleClose}
        onKeyDown={(e) => e.key === 'Escape' && handleClose()}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          zIndex: 100,
        }}
      />

      {/* Dialogue */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 101,
          width: 420,
          background: '#16161f',
          border: '1px solid #2a2a3e',
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#e8e8f0' }}>
            Nouveau site
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
          {/* Nom */}
          <div style={{ marginBottom: 14 }}>
            <label
              htmlFor="site-name"
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 500,
                color: '#8a8aa8',
                marginBottom: 6,
              }}
            >
              Nom du site
            </label>
            <input
              id="site-name"
              ref={nameRef}
              name="name"
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Mon super site"
              required
              autoComplete="off"
              className="admin-input"
              style={INPUT_STYLE}
            />
          </div>

          {/* Slug */}
          <div style={{ marginBottom: 14 }}>
            <label
              htmlFor="site-slug"
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 500,
                color: '#8a8aa8',
                marginBottom: 6,
              }}
            >
              Identifiant
            </label>
            <input
              id="site-slug"
              name="slug"
              type="text"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true)
                setSlug(e.target.value)
              }}
              placeholder="mon-super-site"
              required
              pattern="[a-z0-9-]+"
              autoComplete="off"
              className="admin-input"
              style={{ ...INPUT_STYLE, fontFamily: 'ui-monospace, monospace', fontSize: 12 }}
            />
          </div>

          {/* Domaine */}
          <div style={{ marginBottom: 22 }}>
            <label
              htmlFor="site-domain"
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 500,
                color: '#8a8aa8',
                marginBottom: 6,
              }}
            >
              Domaine personnalisé{' '}
              <span style={{ color: '#3e3e52', fontWeight: 400 }}>(optionnel)</span>
            </label>
            <input
              id="site-domain"
              name="customDomain"
              type="text"
              placeholder="example.com"
              autoComplete="off"
              className="admin-input"
              style={INPUT_STYLE}
            />
          </div>

          {/* Erreur */}
          {state && 'error' in state && (
            <p style={{ margin: '-8px 0 16px', fontSize: 12, color: '#ff6060' }}>{state.error}</p>
          )}

          {/* Actions */}
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
              Créer le site
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
