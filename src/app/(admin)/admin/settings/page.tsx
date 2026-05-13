import SettingsForm from '@/components/admin/settings/SettingsForm'
import { getSettings } from '@/lib/settings'
import type { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = { title: 'Paramètres' }

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsContent />
    </Suspense>
  )
}

async function SettingsContent() {
  const settings = await getSettings()

  return (
    <div style={{ padding: '28px 32px', maxWidth: 860 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 700,
            color: '#e8e8f0',
            letterSpacing: '-0.02em',
          }}
        >
          Paramètres
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#5a5a78' }}>
          Configuration générale de votre site.
        </p>
      </div>

      <SettingsForm initial={settings} />
    </div>
  )
}
