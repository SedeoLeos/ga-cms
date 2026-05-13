import SetupForm from '@/components/admin/layout/SetupForm'
import { prisma } from '@/lib/db/client'
import { PuckRenderer } from '@/lib/puck/render'
import { getSettings } from '@/lib/settings'
import { Shapes } from 'lucide-react'
import { cookies, headers } from 'next/headers'
import { connection } from 'next/server'
import { Suspense } from 'react'

export default function RootPage() {
  return (
    <Suspense>
      <RootContent />
    </Suspense>
  )
}

async function detectLocale(): Promise<string> {
  const settings = await getSettings()
  const supported = settings.locales

  const cookieStore = await cookies()
  const fromCookie = cookieStore.get('locale')?.value
  if (fromCookie && supported.includes(fromCookie)) return fromCookie

  const headersList = await headers()
  const acceptLang = headersList.get('accept-language') ?? ''
  for (const part of acceptLang.split(',')) {
    const tag = (part.split(';')[0]?.trim() ?? '').substring(0, 2)
    if (tag && supported.includes(tag)) return tag
  }

  return settings.defaultLocale
}

async function RootContent() {
  await connection()

  const count = await prisma.user.count()

  if (count === 0) {
    return <SetupScreen />
  }

  const locale = await detectLocale()
  const homePage = await prisma.page.findFirst({
    where: { slug: 'index', locale, status: 'PUBLISHED' },
    select: { title: true, publishedJson: true },
  })

  if (homePage?.publishedJson) {
    return <PuckRenderer data={homePage.publishedJson} />
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
        background: '#fff',
        color: '#888',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 32, fontWeight: 300, marginBottom: 8 }}>
          {homePage?.title ?? 'Bienvenue'}
        </h1>
        <p style={{ fontSize: 14, color: '#aaa' }}>Contenu en cours de création.</p>
      </div>
    </div>
  )
}

function SetupScreen() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#09090b',
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
            border: '1px solid rgba(255,255,255,0.07)',
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
            Bienvenue sur Tatomir
          </h1>
          <p style={{ margin: '0 0 24px', fontSize: 12, color: '#3f3f46' }}>
            Créez votre compte administrateur pour commencer.
          </p>
          <SetupForm />
        </div>

        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 11, color: '#27272a' }}>
          Cette page disparaît une fois le compte créé.
        </p>
      </div>
    </div>
  )
}
