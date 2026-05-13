'use client'

import '@measured/puck/puck.css'
import {
  generatePreviewTokenAction,
  publishPageAction,
  savePageDraftAction,
} from '@/lib/actions/pages'
import { puckConfig } from '@/lib/puck/config'
import { Puck, usePuck } from '@measured/puck'
import type { Data } from '@measured/puck'
import { ArrowLeft, Eye, Loader2, Rocket, Save } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

// ─── Header override ──────────────────────────────────────────────────────────
// Must live inside the <Puck> tree to access usePuck()

interface HeaderProps {
  pageId: string
  pageTitle: string
}

function PuckHeader({ pageId, pageTitle }: HeaderProps) {
  const { appState } = usePuck()
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  // Stable ref so the keydown handler always reads the latest data without re-subscribing
  const dataRef = useRef(appState.data)
  dataRef.current = appState.data

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 2500)
  }

  async function handleSave() {
    setSaving(true)
    const result = await savePageDraftAction(pageId, dataRef.current as Record<string, unknown>)
    setSaving(false)
    showToast('success' in result ? 'Brouillon enregistré' : result.error, 'success' in result)
  }

  async function handlePublish() {
    setPublishing(true)
    await savePageDraftAction(pageId, dataRef.current as Record<string, unknown>)
    const result = await publishPageAction(pageId)
    setPublishing(false)
    showToast('success' in result ? 'Page publiée !' : result.error, 'success' in result)
  }

  async function handlePreview() {
    await savePageDraftAction(pageId, dataRef.current as Record<string, unknown>)
    const result = await generatePreviewTokenAction(pageId)
    if ('url' in result) window.open(result.url, '_blank')
    else showToast(result.error, false)
  }

  // Cmd+S / Ctrl+S — keydown uses dataRef (stable ref) so no dep on appState.data
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        setSaving(true)
        savePageDraftAction(pageId, dataRef.current as Record<string, unknown>).then((result) => {
          setSaving(false)
          setToast({
            msg: 'success' in result ? 'Brouillon enregistré' : result.error,
            ok: 'success' in result,
          })
          setTimeout(() => setToast(null), 2500)
        })
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [pageId])

  return (
    <div
      style={{
        height: 48,
        background: '#111118',
        borderBottom: '1px solid #1f1f2e',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '0 12px',
        flexShrink: 0,
        zIndex: 10,
      }}
    >
      <Link
        href="/admin/pages"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          height: 28,
          padding: '0 8px',
          borderRadius: 5,
          textDecoration: 'none',
          fontSize: 12,
          color: '#5a5a78',
        }}
      >
        <ArrowLeft size={13} strokeWidth={2} />
        Pages
      </Link>

      <div style={{ width: 1, height: 18, background: '#1f1f2e', margin: '0 2px' }} />

      <span
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: '#c8c8da',
          maxWidth: 240,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {pageTitle}
      </span>

      <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
        <button
          type="button"
          onClick={handlePreview}
          style={{
            height: 28,
            padding: '0 10px',
            background: 'none',
            border: '1px solid #2a2a3e',
            borderRadius: 5,
            fontSize: 12,
            color: '#8a8aa8',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Eye size={12} strokeWidth={1.5} />
          Aperçu
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={{
            height: 28,
            padding: '0 10px',
            background: '#1a1a26',
            border: '1px solid #2a2a3e',
            borderRadius: 5,
            fontSize: 12,
            color: saving ? '#4a4a68' : '#c8c8da',
            cursor: saving ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {saving ? <Loader2 size={12} className="spin" /> : <Save size={12} strokeWidth={1.5} />}
          Enregistrer
        </button>

        <button
          type="button"
          onClick={handlePublish}
          disabled={publishing}
          style={{
            height: 28,
            padding: '0 12px',
            background: publishing ? '#2a2a4e' : '#4353ff',
            border: 'none',
            borderRadius: 5,
            fontSize: 12,
            fontWeight: 500,
            color: publishing ? '#6a6a90' : '#fff',
            cursor: publishing ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {publishing ? (
            <Loader2 size={12} className="spin" />
          ) : (
            <Rocket size={12} strokeWidth={1.5} />
          )}
          Publier
        </button>
      </div>

      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            background: toast.ok ? '#0e2a1e' : '#2a0e0e',
            border: `1px solid ${toast.ok ? '#1a4a28' : '#4a1a1a'}`,
            borderRadius: 6,
            padding: '9px 14px',
            fontSize: 12,
            color: toast.ok ? '#4ade80' : '#ff8080',
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            zIndex: 9999,
          }}
        >
          {toast.msg}
        </div>
      )}
    </div>
  )
}

// ─── StudioEditor ─────────────────────────────────────────────────────────────

interface Props {
  pageId: string
  pageTitle: string
  initialData: Record<string, unknown> | null
}

const EMPTY_DATA: Data = { content: [], root: { props: {} } }

export default function StudioEditor({ pageId, pageTitle, initialData }: Props) {
  const data = (initialData as Data | null) ?? EMPTY_DATA

  return (
    <div style={{ height: '100vh' }}>
      <Puck
        config={puckConfig}
        data={data}
        iframe={{ enabled: false }}
        onPublish={async (d) => {
          await savePageDraftAction(pageId, d as Record<string, unknown>)
          await publishPageAction(pageId)
        }}
        overrides={{
          header: () => <PuckHeader pageId={pageId} pageTitle={pageTitle} />,
        }}
      />
    </div>
  )
}
