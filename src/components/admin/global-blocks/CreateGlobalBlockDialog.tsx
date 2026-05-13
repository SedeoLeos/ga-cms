'use client'

import type { GlobalBlockActionState } from '@/lib/actions/global-blocks'
import { createGlobalBlockAction } from '@/lib/actions/global-blocks'
import { Loader2, Plus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useRef, useState } from 'react'

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  height: 34,
  background: '#1c1c1f',
  border: '1px solid #27272a',
  borderRadius: 6,
  padding: '0 10px',
  fontSize: 13,
  color: '#f4f4f5',
  outline: 'none',
  boxSizing: 'border-box',
}

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 500,
  color: '#a1a1aa',
  marginBottom: 6,
}

export default function CreateGlobalBlockDialog() {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState<GlobalBlockActionState, FormData>(
    createGlobalBlockAction,
    null,
  )
  const nameRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (state && 'success' in state) {
      setOpen(false)
      router.refresh()
    }
  }, [state, router])

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => nameRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [open])

  function handleClose() {
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          height: 32,
          padding: '0 14px',
          background: '#2563eb',
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
        Nouveau bloc
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
          width: 420,
          background: '#18181b',
          border: '1px solid #27272a',
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
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#f4f4f5' }}>
            Nouveau bloc global
          </h2>
          <button
            type="button"
            onClick={handleClose}
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
              color: '#52525b',
            }}
          >
            <X size={14} />
          </button>
        </div>

        <form action={action}>
          <div style={{ marginBottom: 14 }}>
            <label htmlFor="gb-name" style={LABEL_STYLE}>
              Nom du bloc
            </label>
            <input
              id="gb-name"
              ref={nameRef}
              name="name"
              type="text"
              placeholder="Header principal"
              required
              autoComplete="off"
              className="admin-input"
              style={INPUT_STYLE}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label htmlFor="gb-category" style={LABEL_STYLE}>
              Catégorie <span style={{ color: '#3e3e52', fontWeight: 400 }}>(optionnel)</span>
            </label>
            <input
              id="gb-category"
              name="category"
              type="text"
              placeholder="Navigation, Hero, Footer…"
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
              style={{
                height: 32,
                padding: '0 14px',
                background: 'none',
                border: '1px solid #27272a',
                borderRadius: 6,
                fontSize: 13,
                color: '#a1a1aa',
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
                background: pending ? 'rgba(37,99,235,0.12)' : '#2563eb',
                border: 'none',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 500,
                color: pending ? '#71717a' : '#fff',
                cursor: pending ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                transition: 'background 0.15s',
              }}
            >
              {pending && <Loader2 size={13} className="spin" />}
              Créer le bloc
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
