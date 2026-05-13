import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AdminPageHeader title="Paramètres" subtitle="Configuration générale de votre site" />
      <div style={{ padding: '24px 28px', maxWidth: 860 }}>
        <SettingsForm initial={settings} />
      </div>
    </div>
  )
}
