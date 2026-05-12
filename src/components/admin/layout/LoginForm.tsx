'use client'

import { loginAction } from '@/lib/auth/actions'
import type { LoginState } from '@/lib/auth/actions'
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useActionState } from 'react'
import { useState } from 'react'

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, null)
  const [showPassword, setShowPassword] = useState(false)

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

      {/* Email */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <label htmlFor="email" style={{ fontSize: 12, fontWeight: 500, color: '#7070a0' }}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          disabled={pending}
          style={{
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
          }}
          className="admin-input"
        />
      </div>

      {/* Password */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <label htmlFor="password" style={{ fontSize: 12, fontWeight: 500, color: '#7070a0' }}>
          Password
        </label>
        <div style={{ position: 'relative' }}>
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            disabled={pending}
            style={{
              height: 34,
              padding: '0 36px 0 10px',
              background: '#16161f',
              border: '1px solid #2a2a3e',
              borderRadius: 6,
              color: '#e8e8f0',
              fontSize: 13,
              outline: 'none',
              width: '100%',
              boxSizing: 'border-box',
            }}
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
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
