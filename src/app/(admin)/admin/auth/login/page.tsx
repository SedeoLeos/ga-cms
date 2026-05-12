import LoginForm from '@/components/admin/layout/LoginForm'
import { Shapes } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Sign in' }

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0e0e14',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div style={{ width: '100%', maxWidth: 360 }}>
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              background: '#4353ff',
              borderRadius: 9,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Shapes size={17} strokeWidth={2} color="#fff" />
          </div>
          <span
            style={{ fontSize: 18, fontWeight: 700, color: '#e8e8f0', letterSpacing: '-0.02em' }}
          >
            tatomir
          </span>
        </div>

        {/* Card */}
        <div
          style={{
            background: '#13131c',
            border: '1px solid #1f1f2e',
            borderRadius: 10,
            padding: 28,
          }}
        >
          <h1
            style={{
              margin: '0 0 4px',
              fontSize: 16,
              fontWeight: 600,
              color: '#e8e8f0',
              letterSpacing: '-0.01em',
            }}
          >
            Sign in to your workspace
          </h1>
          <p style={{ margin: '0 0 22px', fontSize: 13, color: '#5a5a78' }}>
            Enter your admin credentials to continue.
          </p>

          <LoginForm />
        </div>
      </div>
    </div>
  )
}
