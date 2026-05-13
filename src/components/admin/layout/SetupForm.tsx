'use client'

import { setupAction } from '@/lib/actions/setup'
import type { SetupActionState } from '@/lib/actions/setup'
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useActionState, useState } from 'react'

const INPUT: React.CSSProperties = {
  height: 34,
  padding: '0 10px',
  background: '#18181b',
  border: '1px solid #27272a',
  borderRadius: 7,
  color: '#f4f4f5',
  fontSize: 13,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  letterSpacing: '-0.01em',
}

const LABEL: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 500,
  color: '#52525b',
  marginBottom: 5,
  letterSpacing: '0.02em',
  textTransform: 'uppercase',
}

export default function SetupForm() {
  const [state, action, pending] = useActionState<SetupActionState, FormData>(setupAction, null)
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {state && 'error' in state && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 12px',
            background: '#1c0a0a',
            border: '1px solid #7f1d1d',
            borderRadius: 7,
            fontSize: 12,
            color: '#fca5a5',
          }}
        >
          <AlertCircle size={13} strokeWidth={1.5} style={{ flexShrink: 0 }} />
          {state.error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <label htmlFor="setup-name" style={LABEL}>
          Nom
        </label>
        <input
          id="setup-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          disabled={pending}
          placeholder="Jean Dupont"
          className="admin-input"
          style={INPUT}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <label htmlFor="setup-email" style={LABEL}>
          Email
        </label>
        <input
          id="setup-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          disabled={pending}
          placeholder="admin@monsite.com"
          className="admin-input"
          style={INPUT}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <label htmlFor="setup-password" style={LABEL}>
          Mot de passe
        </label>
        <div style={{ position: 'relative' }}>
          <input
            id="setup-password"
            name="password"
            type={showPwd ? 'text' : 'password'}
            required
            minLength={8}
            autoComplete="new-password"
            disabled={pending}
            placeholder="8 caractères minimum"
            className="admin-input"
            style={{ ...INPUT, paddingRight: 36 }}
          />
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              height: 34,
              width: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              color: '#3f3f46',
            }}
          >
            {showPwd ? <EyeOff size={13} strokeWidth={1.5} /> : <Eye size={13} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <label htmlFor="setup-confirm" style={LABEL}>
          Confirmer le mot de passe
        </label>
        <div style={{ position: 'relative' }}>
          <input
            id="setup-confirm"
            name="confirmPassword"
            type={showConfirm ? 'text' : 'password'}
            required
            autoComplete="new-password"
            disabled={pending}
            className="admin-input"
            style={{ ...INPUT, paddingRight: 36 }}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              height: 34,
              width: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              color: '#3f3f46',
            }}
          >
            {showConfirm ? (
              <EyeOff size={13} strokeWidth={1.5} />
            ) : (
              <Eye size={13} strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className={pending ? '' : 'wf-btn-primary'}
        style={{
          height: 34,
          marginTop: 6,
          background: pending ? 'rgba(37,99,235,0.08)' : '#2563eb',
          border: 'none',
          borderRadius: 7,
          color: pending ? '#60a5fa' : '#fff',
          fontSize: 13,
          fontWeight: 600,
          cursor: pending ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 7,
          letterSpacing: '-0.01em',
          fontFamily: 'inherit',
        }}
      >
        {pending && <Loader2 size={13} strokeWidth={2} className="spin" />}
        {pending ? 'Création…' : 'Créer le compte'}
      </button>
    </form>
  )
}
