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

  const INPUT: React.CSSProperties = {
    width: '100%',
    height: 34,
    background: '#111118',
    border: '1px solid #252535',
    borderRadius: 7,
    padding: '0 10px',
    fontSize: 13,
    color: '#e8e8f0',
    outline: 'none',
    boxSizing: 'border-box',
    letterSpacing: '-0.01em',
  }

  const LABEL: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    fontWeight: 500,
    color: '#5a5a80',
    marginBottom: 5,
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="wf-btn-primary"
        style={{
          height: 32,
          padding: '0 14px',
          background: '#4353ff',
          border: 'none',
          borderRadius: 7,
          fontSize: 13,
          fontWeight: 500,
          color: '#fff',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          letterSpacing: '-0.01em',
        }}
      >
        <Plus size={14} strokeWidth={2.2} />
        Nouvelle page
      </button>

      {open && (
        <>
          {/* Overlay */}
          <div
            role="presentation"
            onClick={handleClose}
            onKeyDown={(e) => e.key === 'Escape' && handleClose()}
            className="wf-dialog-overlay"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(5,5,10,0.75)',
              zIndex: 200,
            }}
          />

          {/* Dialog */}
          <div
            className="fade-in"
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 201,
              width: 440,
              background: '#111118',
              border: '1px solid #222232',
              borderRadius: 12,
              padding: '20px 24px 24px',
              boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
            }}
          >
            {/* Dialog header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#e0e0f0',
                  letterSpacing: '-0.02em',
                }}
              >
                Nouvelle page
              </h2>
              <button
                type="button"
                onClick={handleClose}
                className="wf-btn-icon"
                style={{
                  width: 26,
                  height: 26,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 6,
                  padding: 0,
                  color: '#3e3e5a',
                }}
              >
                <X size={14} />
              </button>
            </div>

            <form action={action}>
              <div style={{ marginBottom: 14 }}>
                <label htmlFor="page-title" style={LABEL}>
                  Titre
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
                  style={INPUT}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label htmlFor="page-slug" style={LABEL}>
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
                  style={{
                    ...INPUT,
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: 12,
                    color: '#9090c0',
                  }}
                />
              </div>

              {locales.length > 1 && (
                <div style={{ marginBottom: 20 }}>
                  <p style={LABEL}>Langue</p>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {locales.map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => setLocale(code)}
                        style={{
                          height: 26,
                          padding: '0 10px',
                          background: locale === code ? '#4353ff' : '#161620',
                          border: `1px solid ${locale === code ? '#4353ff' : '#252535'}`,
                          borderRadius: 6,
                          fontSize: 11,
                          fontFamily: 'ui-monospace, monospace',
                          color: locale === code ? '#fff' : '#4a4a70',
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
                <p style={{ margin: '0 0 14px', fontSize: 12, color: '#ff6868' }}>{state.error}</p>
              )}

              {/* Footer */}
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  justifyContent: 'flex-end',
                  paddingTop: 8,
                  borderTop: '1px solid #1a1a28',
                  marginTop: 8,
                }}
              >
                <button
                  type="button"
                  onClick={handleClose}
                  className="wf-btn-ghost"
                  style={{
                    height: 32,
                    padding: '0 14px',
                    background: 'transparent',
                    border: '1px solid #252535',
                    borderRadius: 7,
                    fontSize: 13,
                    color: '#6a6a90',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className={pending ? '' : 'wf-btn-primary'}
                  style={{
                    height: 32,
                    padding: '0 16px',
                    background: pending ? '#1e204a' : '#4353ff',
                    border: 'none',
                    borderRadius: 7,
                    fontSize: 13,
                    fontWeight: 500,
                    color: pending ? '#5060a0' : '#fff',
                    cursor: pending ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontFamily: 'inherit',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {pending && <Loader2 size={12} className="spin" />}
                  Créer
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </>
  )
}
