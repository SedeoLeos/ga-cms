'use client'

import '@measured/puck/puck.css'
import './studio-dark.css'
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
import { useCallback, useEffect, useRef, useState } from 'react'

// ─── Toolbar ─────────────────────────────────────────────────────────────────

interface HeaderProps {
  pageId: string
  pageTitle: string
}

function PuckHeader({ pageId, pageTitle }: HeaderProps) {
  const { appState } = usePuck()
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const dataRef = useRef(appState.data)
  dataRef.current = appState.data

  const showToast = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 2500)
  }, [])

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

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        setSaving(true)
        savePageDraftAction(pageId, dataRef.current as Record<string, unknown>).then((result) => {
          setSaving(false)
          showToast(
            'success' in result ? 'Brouillon enregistré' : result.error,
            'success' in result,
          )
        })
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [pageId, showToast])

  return (
    <div
      style={{
        height: 44,
        background: '#0a0a10',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        padding: '0 10px',
        flexShrink: 0,
        zIndex: 10,
      }}
    >
      {/* Back to pages */}
      <Link
        href="/admin/pages"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          height: 30,
          padding: '0 8px',
          borderRadius: 6,
          textDecoration: 'none',
          fontSize: 12,
          color: '#404060',
          transition: 'color 0.1s',
          flexShrink: 0,
        }}
        className="studio-back-link"
      >
        <ArrowLeft size={12} strokeWidth={2} />
        Pages
      </Link>

      {/* Divider */}
      <div
        style={{
          width: 1,
          height: 16,
          background: 'rgba(255,255,255,0.06)',
          margin: '0 6px',
          flexShrink: 0,
        }}
      />

      {/* Page title */}
      <span
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: '#9898b8',
          maxWidth: 220,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          letterSpacing: '-0.01em',
          flex: 1,
        }}
      >
        {pageTitle}
      </span>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexShrink: 0 }}>
        {/* Preview */}
        <button
          type="button"
          onClick={handlePreview}
          className="studio-btn-ghost"
          style={{
            height: 28,
            padding: '0 10px',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 6,
            fontSize: 12,
            color: '#5a5a80',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            letterSpacing: '-0.01em',
            fontFamily: 'inherit',
          }}
        >
          <Eye size={11} strokeWidth={1.5} />
          Aperçu
        </button>

        {/* Save */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="studio-btn-ghost"
          style={{
            height: 28,
            padding: '0 10px',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 6,
            fontSize: 12,
            color: saving ? '#3a3a5a' : '#7878a0',
            cursor: saving ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            letterSpacing: '-0.01em',
            fontFamily: 'inherit',
          }}
        >
          {saving ? <Loader2 size={11} className="spin" /> : <Save size={11} strokeWidth={1.5} />}
          Enregistrer
        </button>

        {/* Publish */}
        <button
          type="button"
          onClick={handlePublish}
          disabled={publishing}
          className={publishing ? '' : 'wf-btn-primary'}
          style={{
            height: 28,
            padding: '0 12px',
            background: publishing ? 'rgba(67,83,255,0.15)' : '#4353ff',
            border: 'none',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 500,
            color: publishing ? '#4a5a80' : '#ffffff',
            cursor: publishing ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            letterSpacing: '-0.01em',
            fontFamily: 'inherit',
          }}
        >
          {publishing ? (
            <Loader2 size={11} className="spin" />
          ) : (
            <Rocket size={11} strokeWidth={1.5} />
          )}
          Publier
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            background: toast.ok ? '#0a1a12' : '#1a0a0a',
            border: `1px solid ${toast.ok ? '#1a4028' : '#4a1818'}`,
            borderRadius: 8,
            padding: '9px 14px',
            fontSize: 12,
            color: toast.ok ? '#4ade80' : '#ff8080',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            zIndex: 9999,
            letterSpacing: '-0.01em',
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
    <div style={{ height: '100vh', overflow: 'hidden' }}>
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
