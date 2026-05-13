'use client'

import type { PageActionState } from '@/lib/actions/pages'
import { createPageAction } from '@/lib/actions/pages'
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

interface Props {
  locales: string[]
  defaultLocale: string
}

export default function CreatePageDialog({ locales, defaultLocale }: Props) {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState<PageActionState, FormData>(createPageAction, null)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [locale, setLocale] = useState(defaultLocale)
  const titleRef = useRef<HTMLInputElement>(null)
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
      const t = setTimeout(() => titleRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [open])

  function resetForm() {
    setTitle('')
    setSlug('')
    setSlugTouched(false)
    setLocale(defaultLocale)
  }

  function handleClose() {
    setOpen(false)
    resetForm()
  }

  function handleTitleChange(v: string) {
    setTitle(v)
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
        Nouvelle page
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
            Nouvelle page
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
            <label htmlFor="page-title" style={LABEL_STYLE}>
              Titre de la page
            </label>
            <input
              id="page-title"
              ref={titleRef}
              name="title"
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="À propos"
              required
              autoComplete="off"
              className="admin-input"
              style={INPUT_STYLE}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label htmlFor="page-slug" style={LABEL_STYLE}>
              Identifiant
            </label>
            <input
              id="page-slug"
              name="slug"
              type="text"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true)
                setSlug(e.target.value)
              }}
              placeholder="a-propos"
              required
              pattern="[a-z0-9-/]+"
              autoComplete="off"
              className="admin-input"
              style={{ ...INPUT_STYLE, fontFamily: 'ui-monospace, monospace', fontSize: 12 }}
            />
          </div>

          {locales.length > 1 && (
            <div style={{ marginBottom: 20 }}>
              <p style={LABEL_STYLE}>Langue</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {locales.map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setLocale(code)}
                    style={{
                      height: 28,
                      padding: '0 12px',
                      background: locale === code ? '#4353ff' : '#1a1a26',
                      border: `1px solid ${locale === code ? '#4353ff' : '#2a2a3e'}`,
                      borderRadius: 5,
                      fontSize: 12,
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
          <input type="hidden" name="locale" value={locale} />

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
              Créer la page
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
