'use client'

import '@measured/puck/puck.css'
import './studio-dark.css'
import {
  generatePreviewTokenAction,
  publishPageAction,
  savePageDraftAction,
  saveSeoAction,
} from '@/lib/actions/pages'
import { puckConfig } from '@/lib/puck/config'
import { Puck, usePuck } from '@measured/puck'
import type { Data } from '@measured/puck'
import { ArrowLeft, Eye, Loader2, Rocket, Save, Search, X } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PageSeo {
  metaTitle: string | null
  metaDesc: string | null
  ogImage: string | null
  slug: string
}

// ─── SEO Panel ───────────────────────────────────────────────────────────────

interface SeoPanelProps {
  pageId: string
  pageTitle: string
  initialSeo: PageSeo
  onClose: () => void
}

function SeoPanel({ pageId, pageTitle, initialSeo, onClose }: SeoPanelProps) {
  const [metaTitle, setMetaTitle] = useState(initialSeo.metaTitle ?? '')
  const [metaDesc, setMetaDesc] = useState(initialSeo.metaDesc ?? '')
  const [ogImage, setOgImage] = useState(initialSeo.ogImage ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const previewTitle = metaTitle || pageTitle
  const previewDesc = metaDesc || 'Aucune description définie.'
  const previewSlug = initialSeo.slug === 'index' ? '' : `/${initialSeo.slug}`

  async function handleSave() {
    setSaving(true)
    await saveSeoAction(pageId, {
      metaTitle: metaTitle || null,
      metaDesc: metaDesc || null,
      ogImage: ogImage || null,
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    fontWeight: 600,
    color: '#6060a0',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: 6,
  }
  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#18181f',
    border: '1px solid #2a2a40',
    borderRadius: 7,
    padding: '8px 10px',
    fontSize: 13,
    color: '#d0d0e8',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  }
  const counterStyle = (len: number, max: number): React.CSSProperties => ({
    fontSize: 11,
    color: len > max ? '#ff6060' : len > max * 0.85 ? '#f5a623' : '#404060',
    marginTop: 4,
    textAlign: 'right',
  })

  return (
    <>
      {/* Backdrop */}
      <div
        role="button"
        tabIndex={-1}
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.35)',
          zIndex: 199,
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: 360,
          height: '100vh',
          background: '#0e0e18',
          borderLeft: '1px solid #1e1e30',
          zIndex: 200,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            height: 52,
            borderBottom: '1px solid #1a1a28',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            gap: 10,
            flexShrink: 0,
          }}
        >
          <Search size={14} color="#5050a0" strokeWidth={1.5} />
          <span
            style={{
              flex: 1,
              fontSize: 13,
              fontWeight: 600,
              color: '#9090c0',
              letterSpacing: '-0.01em',
            }}
          >
            SEO &amp; Métadonnées
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 26,
              height: 26,
              border: '1px solid #2a2a40',
              borderRadius: 6,
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#404060',
            }}
          >
            <X size={12} strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          {/* Meta Title */}
          <div>
            <label htmlFor="seo-title" style={labelStyle}>
              Titre SEO
            </label>
            <input
              id="seo-title"
              style={inputStyle}
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              maxLength={80}
              placeholder={pageTitle}
            />
            <p style={counterStyle(metaTitle.length, 60)}>
              {metaTitle.length}/60 caractères recommandés
            </p>
          </div>

          {/* Meta Description */}
          <div>
            <label htmlFor="seo-desc" style={labelStyle}>
              Description
            </label>
            <textarea
              id="seo-desc"
              style={{ ...inputStyle, resize: 'vertical', minHeight: 80, lineHeight: 1.5 }}
              value={metaDesc}
              onChange={(e) => setMetaDesc(e.target.value)}
              maxLength={200}
              placeholder="Une description courte et incitative (max 160 caractères recommandés)."
            />
            <p style={counterStyle(metaDesc.length, 160)}>
              {metaDesc.length}/160 caractères recommandés
            </p>
          </div>

          {/* OG Image */}
          <div>
            <label htmlFor="seo-og" style={labelStyle}>
              Image OG (URL)
            </label>
            <input
              id="seo-og"
              style={inputStyle}
              value={ogImage}
              onChange={(e) => setOgImage(e.target.value)}
              placeholder="https://monsite.fr/og-image.jpg"
            />
            {ogImage && (
              <div
                style={{
                  marginTop: 8,
                  borderRadius: 7,
                  overflow: 'hidden',
                  border: '1px solid #2a2a40',
                  height: 80,
                  background: '#18181f',
                }}
              >
                <img
                  src={ogImage}
                  alt="OG preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>

          {/* Google Search Preview — no associated control, intentional */}
          <div>
            <p style={{ ...labelStyle, margin: '0 0 6px' }}>Aperçu Google</p>
            <div
              style={{
                background: '#18181f',
                border: '1px solid #2a2a40',
                borderRadius: 8,
                padding: '12px 14px',
              }}
            >
              <p
                style={{
                  margin: '0 0 2px',
                  fontSize: 13,
                  color: '#8ab4f8',
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {previewTitle}
              </p>
              <p
                style={{
                  margin: '0 0 4px',
                  fontSize: 11,
                  color: '#34a853',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                monsite.fr{previewSlug}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: '#5a5a7a',
                  lineHeight: 1.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {previewDesc}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            height: 60,
            borderTop: '1px solid #1a1a28',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              flex: 1,
              height: 34,
              background: saved ? '#0a2a1a' : '#2563eb',
              border: 'none',
              borderRadius: 7,
              fontSize: 13,
              fontWeight: 600,
              color: saved ? '#4ade80' : '#fff',
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              fontFamily: 'inherit',
              letterSpacing: '-0.01em',
              transition: 'background 0.15s',
            }}
          >
            {saving ? <Loader2 size={12} className="spin" /> : null}
            {saving ? 'Enregistrement…' : saved ? 'Enregistré !' : 'Enregistrer le SEO'}
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Toolbar ─────────────────────────────────────────────────────────────────

interface HeaderProps {
  pageId: string
  pageTitle: string
  onSeoOpen: () => void
}

function PuckHeader({ pageId, pageTitle, onSeoOpen }: HeaderProps) {
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

  const ghostBtn: React.CSSProperties = {
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
  }

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
      {/* Back */}
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
          flexShrink: 0,
        }}
        className="studio-back-link"
      >
        <ArrowLeft size={12} strokeWidth={2} />
        Pages
      </Link>

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
          maxWidth: 200,
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
        {/* SEO */}
        <button
          type="button"
          onClick={onSeoOpen}
          className="studio-btn-ghost"
          style={ghostBtn}
          title="SEO & Métadonnées"
        >
          <Search size={11} strokeWidth={1.5} />
          SEO
        </button>

        {/* Preview */}
        <button type="button" onClick={handlePreview} className="studio-btn-ghost" style={ghostBtn}>
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
            ...ghostBtn,
            color: saving ? '#3a3a5a' : '#7878a0',
            cursor: saving ? 'not-allowed' : 'pointer',
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
            background: publishing ? 'rgba(37,99,235,0.15)' : '#2563eb',
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
  initialSeo: PageSeo
}

const EMPTY_DATA: Data = { content: [], root: { props: {} } }

export default function StudioEditor({ pageId, pageTitle, initialData, initialSeo }: Props) {
  const data = (initialData as Data | null) ?? EMPTY_DATA
  const [showSeo, setShowSeo] = useState(false)

  const headerOverride = useCallback(
    () => <PuckHeader pageId={pageId} pageTitle={pageTitle} onSeoOpen={() => setShowSeo(true)} />,
    [pageId, pageTitle],
  )

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
        overrides={{ header: headerOverride }}
      />

      {showSeo && (
        <SeoPanel
          pageId={pageId}
          pageTitle={pageTitle}
          initialSeo={initialSeo}
          onClose={() => setShowSeo(false)}
        />
      )}
    </div>
  )
}
