import LoginForm from '@/components/admin/layout/LoginForm'
import { Shapes } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Sign in' }

interface Props {
  searchParams: Promise<{ callbackUrl?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const { callbackUrl } = await searchParams

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0f0f11',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div style={{ width: '100%', maxWidth: 360 }}>
        {/* Logo mark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            marginBottom: 36,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              background: '#2563eb',
              borderRadius: 9,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Shapes size={17} strokeWidth={2} color="#fff" />
          </div>
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: '#f4f4f5',
              letterSpacing: '-0.03em',
            }}
          >
            tatomir
          </span>
        </div>

        {/* Card */}
        <div
          style={{
            background: '#111113',
            border: '1px solid #27272a',
            borderRadius: 12,
            padding: '28px 28px 24px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          }}
        >
          <h1
            style={{
              margin: '0 0 2px',
              fontSize: 15,
              fontWeight: 600,
              color: '#f4f4f5',
              letterSpacing: '-0.02em',
            }}
          >
            Connexion à votre espace
          </h1>
          <p style={{ margin: '0 0 24px', fontSize: 12, color: '#3f3f46' }}>
            Entrez vos identifiants administrateur pour continuer.
          </p>

          <LoginForm callbackUrl={callbackUrl} />
        </div>
      </div>
    </div>
  )
}
