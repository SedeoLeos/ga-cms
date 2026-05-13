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

  // Résoudre la page d'accueil (slug = 'index')
  const locale = await detectLocale()
  const homePage = await prisma.page.findFirst({
    where: { slug: 'index', locale, status: 'PUBLISHED' },
    select: { title: true, publishedJson: true },
  })

  if (homePage?.publishedJson) {
    return <PuckRenderer data={homePage.publishedJson} />
  }

  // Page d'accueil non encore créée
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
        background: '#0e0e14',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div style={{ width: '100%', maxWidth: 360 }}>
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
            Bienvenue sur Tatomir
          </h1>
          <p style={{ margin: '0 0 22px', fontSize: 13, color: '#5a5a78' }}>
            Créez votre compte administrateur pour commencer.
          </p>
          <SetupForm />
        </div>

        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: '#3a3a50' }}>
          Cette page disparaîtra une fois le compte créé.
        </p>
      </div>
    </div>
  )
}
