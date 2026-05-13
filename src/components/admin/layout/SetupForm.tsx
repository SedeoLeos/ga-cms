'use client'

import { setupAction } from '@/lib/actions/setup'
import type { SetupActionState } from '@/lib/actions/setup'
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useActionState, useState } from 'react'

const INPUT_S: React.CSSProperties = {
  height: 34,
  padding: '0 10px',
  background: '#16161f',
  border: '1px solid #2a2a3e',
  borderRadius: 6,
  color: '#e8e8f0',
  fontSize: 13,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

const LABEL_S: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: '#7070a0',
}

export default function SetupForm() {
  const [state, action, pending] = useActionState<SetupActionState, FormData>(setupAction, null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {state?.error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 12px',
            background: '#2a1212',
            border: '1px solid #5a2020',
            borderRadius: 6,
            fontSize: 13,
            color: '#ff7070',
          }}
        >
          <AlertCircle size={14} strokeWidth={1.5} color="#ff7070" style={{ flexShrink: 0 }} />
          {state.error}
        </div>
      )}

      {/* Nom */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <label htmlFor="name" style={LABEL_S}>
          Nom
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          autoFocus
          disabled={pending}
          placeholder="Jean Dupont"
          style={INPUT_S}
          className="admin-input"
        />
      </div>

      {/* Email */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <label htmlFor="email" style={LABEL_S}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          disabled={pending}
          placeholder="admin@exemple.com"
          style={INPUT_S}
          className="admin-input"
        />
      </div>

      {/* Mot de passe */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <label htmlFor="password" style={LABEL_S}>
          Mot de passe
        </label>
        <div style={{ position: 'relative' }}>
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            minLength={8}
            autoComplete="new-password"
            disabled={pending}
            placeholder="8 caractères minimum"
            style={{ ...INPUT_S, padding: '0 36px 0 10px' }}
            className="admin-input"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
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
            }}
          >
            {showPassword ? (
              <EyeOff size={14} strokeWidth={1.5} color="#4a4a68" />
            ) : (
              <Eye size={14} strokeWidth={1.5} color="#4a4a68" />
            )}
          </button>
        </div>
      </div>

      {/* Confirmer le mot de passe */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <label htmlFor="confirmPassword" style={LABEL_S}>
          Confirmer le mot de passe
        </label>
        <div style={{ position: 'relative' }}>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirm ? 'text' : 'password'}
            required
            autoComplete="new-password"
            disabled={pending}
            style={{ ...INPUT_S, padding: '0 36px 0 10px' }}
            className="admin-input"
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
            }}
          >
            {showConfirm ? (
              <EyeOff size={14} strokeWidth={1.5} color="#4a4a68" />
            ) : (
              <Eye size={14} strokeWidth={1.5} color="#4a4a68" />
            )}
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={pending}
        style={{
          height: 34,
          marginTop: 4,
          background: pending ? '#2d3580' : '#4353ff',
          border: 'none',
          borderRadius: 6,
          color: '#fff',
          fontSize: 13,
          fontWeight: 600,
          cursor: pending ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          transition: 'background 0.15s',
        }}
        className={pending ? '' : 'admin-btn-primary'}
      >
        {pending && <Loader2 size={13} strokeWidth={2} color="#fff" className="spin" />}
        {pending ? 'Création en cours…' : 'Créer le compte admin'}
      </button>
    </form>
  )
}
