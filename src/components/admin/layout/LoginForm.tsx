'use client'

import { loginAction } from '@/lib/auth/actions'
import type { LoginState } from '@/lib/auth/actions'
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useActionState, useState } from 'react'

const INPUT: React.CSSProperties = {
  height: 34,
  padding: '0 10px',
  background: '#111118',
  border: '1px solid #252535',
  borderRadius: 7,
  color: '#e8e8f0',
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
  color: '#4e4e70',
  marginBottom: 5,
  letterSpacing: '0.02em',
  textTransform: 'uppercase',
}

interface Props {
  callbackUrl?: string
}

export default function LoginForm({ callbackUrl }: Props) {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, null)
  const [showPwd, setShowPwd] = useState(false)

  return (
    <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Pass callbackUrl through the form */}
      {callbackUrl && <input type="hidden" name="callbackUrl" value={callbackUrl} />}

      {state?.error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 12px',
            background: '#1e0e0e',
            border: '1px solid #4a1e1e',
            borderRadius: 7,
            fontSize: 12,
            color: '#ff7070',
          }}
        >
          <AlertCircle size={13} strokeWidth={1.5} style={{ flexShrink: 0 }} />
          {state.error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <label htmlFor="login-email" style={LABEL}>
          Email
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          disabled={pending}
          className="admin-input"
          style={INPUT}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <label htmlFor="login-password" style={LABEL}>
          Mot de passe
        </label>
        <div style={{ position: 'relative' }}>
          <input
            id="login-password"
            name="password"
            type={showPwd ? 'text' : 'password'}
            required
            autoComplete="current-password"
            disabled={pending}
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
              color: '#3e3e58',
            }}
          >
            {showPwd ? <EyeOff size={13} strokeWidth={1.5} /> : <Eye size={13} strokeWidth={1.5} />}
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
          background: pending ? '#1e204a' : '#4353ff',
          border: 'none',
          borderRadius: 7,
          color: pending ? '#5060a0' : '#fff',
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
        {pending ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  )
}
