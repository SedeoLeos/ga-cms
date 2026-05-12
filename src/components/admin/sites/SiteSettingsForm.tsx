'use client'

import type { UpdateSiteState } from '@/lib/actions/sites'
import { deleteSiteAction, updateSiteAction } from '@/lib/actions/sites'
import { AlertTriangle, Check, ChevronLeft, Loader2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useState, useTransition } from 'react'

export interface SiteData {
  id: string
  name: string
  slug: string
  customDomain: string | null
  locales: string[]
  defaultLocale: string
}

const LOCALE_OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'de', label: 'Deutsch' },
  { code: 'pt', label: 'Português' },
  { code: 'it', label: 'Italiano' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'pl', label: 'Polski' },
  { code: 'ja', label: '日本語' },
  { code: 'zh', label: '中文' },
  { code: 'ar', label: 'العربية' },
  { code: 'ru', label: 'Русский' },
]

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  height: 34,
  background: '#1e1e2e',
  border: '1px solid #2a2a3e',
  borderRadius: 6,
  padding: '0 10px',
  fontSize: 13,
  color: '#e8e8f0',
  outline: 'none',
  boxSizing: 'border-box',
}

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 500,
  color: '#8a8aa8',
  marginBottom: 6,
}

const SECTION_STYLE: React.CSSProperties = {
  background: '#13131c',
  border: '1px solid #1f1f2e',
  borderRadius: 10,
  padding: '20px 24px',
  marginBottom: 16,
}

export default function SiteSettingsForm({ site }: { site: SiteData }) {
  const boundAction = updateSiteAction.bind(null, site.id)
  const [state, formAction, pending] = useActionState<UpdateSiteState, FormData>(boundAction, null)

  const [name, setName] = useState(site.name)
  const [slug, setSlug] = useState(site.slug)
  const [domain, setDomain] = useState(site.customDomain ?? '')
  const [locales, setLocales] = useState<string[]>(site.locales)
  const [defaultLocale, setDefaultLocale] = useState(site.defaultLocale)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [deletePending, startDelete] = useTransition()
  const router = useRouter()

  const slugChanged = slug !== site.slug

  useEffect(() => {
    if (state && 'success' in state) {
      const t = setTimeout(() => {}, 2000)
      return () => clearTimeout(t)
    }
  }, [state])

  function toggleLocale(code: string) {
    if (locales.includes(code)) {
      if (locales.length === 1) return
      const next = locales.filter((l) => l !== code)
      setLocales(next)
      if (defaultLocale === code) setDefaultLocale(next[0] ?? 'en')
    } else {
      setLocales([...locales, code])
    }
  }

  function handleDelete() {
    startDelete(async () => {
      await deleteSiteAction(site.id)
      router.push('/admin/sites')
    })
  }

  return (
    <div style={{ padding: 32, maxWidth: 680 }}>
      {/* En-tête */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 28,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link
            href="/admin/sites"
            style={{
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 5,
              color: '#4a4a68',
              textDecoration: 'none',
            }}
            className="site-action-btn"
          >
            <ChevronLeft size={16} strokeWidth={1.5} />
          </Link>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 600,
                color: '#e8e8f0',
                letterSpacing: '-0.01em',
              }}
            >
              {site.name}
            </h1>
            <p style={{ margin: 0, fontSize: 12, color: '#5a5a78' }}>Paramètres du site</p>
          </div>
        </div>

        <button
          type="submit"
          form="site-settings-form"
          disabled={pending}
          style={{
            height: 32,
            padding: '0 16px',
            background: pending ? '#2a2a4e' : '#4353ff',
            border: 'none',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 500,
            color: pending ? '#6a6a90' : '#fff',
            cursor: pending ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
          className="create-site-btn"
        >
          {pending ? (
            <Loader2 size={13} className="spin" />
          ) : state && 'success' in state ? (
            <Check size={13} />
          ) : null}
          Enregistrer
        </button>
      </div>

      {/* Feedback */}
      {state && 'error' in state && (
        <div
          style={{
            marginBottom: 16,
            padding: '10px 14px',
            background: '#2a1a1a',
            border: '1px solid #4a2020',
            borderRadius: 7,
            fontSize: 13,
            color: '#ff8080',
          }}
        >
          {state.error}
        </div>
      )}
      {state && 'success' in state && (
        <div
          style={{
            marginBottom: 16,
            padding: '10px 14px',
            background: '#0e2a1a',
            border: '1px solid #1a4a2a',
            borderRadius: 7,
            fontSize: 13,
            color: '#60c060',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Check size={14} />
          Modifications enregistrées.
        </div>
      )}

      <form id="site-settings-form" action={formAction}>
        {/* Section : Général */}
        <div style={SECTION_STYLE}>
          <p
            style={{
              margin: '0 0 16px',
              fontSize: 12,
              fontWeight: 600,
              color: '#5a5a78',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Général
          </p>

          <div style={{ marginBottom: 14 }}>
            <label htmlFor="s-name" style={LABEL_STYLE}>
              Nom du site
            </label>
            <input
              id="s-name"
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="admin-input"
              style={INPUT_STYLE}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label htmlFor="s-slug" style={LABEL_STYLE}>
              Identifiant (slug)
            </label>
            <input
              id="s-slug"
              name="slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              pattern="[a-z0-9-]+"
              className="admin-input"
              style={{ ...INPUT_STYLE, fontFamily: 'ui-monospace, monospace', fontSize: 12 }}
            />
            {slugChanged && (
              <p
                style={{
                  margin: '6px 0 0',
                  fontSize: 11,
                  color: '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <AlertTriangle size={11} />
                Modifier le slug peut casser des liens existants.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="s-domain" style={LABEL_STYLE}>
              Domaine personnalisé{' '}
              <span style={{ color: '#3e3e52', fontWeight: 400 }}>(optionnel)</span>
            </label>
            <input
              id="s-domain"
              name="customDomain"
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              className="admin-input"
              style={INPUT_STYLE}
            />
          </div>
        </div>

        {/* Section : Langues */}
        <div style={SECTION_STYLE}>
          <p
            style={{
              margin: '0 0 14px',
              fontSize: 12,
              fontWeight: 600,
              color: '#5a5a78',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Langues
          </p>

          {/* Grille de langues */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: 6,
              marginBottom: 16,
            }}
          >
            {LOCALE_OPTIONS.map((locale) => {
              const active = locales.includes(locale.code)
              const isOnly = locales.length === 1 && active
              return (
                <button
                  key={locale.code}
                  type="button"
                  onClick={() => toggleLocale(locale.code)}
                  disabled={isOnly}
                  style={{
                    height: 32,
                    padding: '0 10px',
                    background: active ? '#1e264a' : '#1a1a26',
                    border: `1px solid ${active ? '#4353ff60' : '#2a2a3e'}`,
                    borderRadius: 6,
                    fontSize: 12,
                    color: active ? '#8090f0' : '#5a5a78',
                    cursor: isOnly ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    textAlign: 'left',
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: 'ui-monospace, monospace',
                      color: active ? '#6070d0' : '#3e3e52',
                      minWidth: 20,
                    }}
                  >
                    {locale.code}
                  </span>
                  <span
                    style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {locale.label}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Langue par défaut */}
          <div>
            <p style={{ ...LABEL_STYLE, marginBottom: 8 }}>Langue par défaut</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {locales.map((code) => {
                const label = LOCALE_OPTIONS.find((l) => l.code === code)?.label ?? code
                const isDefault = code === defaultLocale
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setDefaultLocale(code)}
                    style={{
                      height: 28,
                      padding: '0 12px',
                      background: isDefault ? '#4353ff' : '#1a1a26',
                      border: `1px solid ${isDefault ? '#4353ff' : '#2a2a3e'}`,
                      borderRadius: 5,
                      fontSize: 12,
                      color: isDefault ? '#fff' : '#5a5a78',
                      cursor: 'pointer',
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Champs cachés pour la soumission */}
          <input type="hidden" name="locales" value={JSON.stringify(locales)} />
          <input type="hidden" name="defaultLocale" value={defaultLocale} />
        </div>
      </form>

      {/* Zone de danger */}
      <div
        style={{
          ...SECTION_STYLE,
          border: '1px solid #3a1a1a',
          marginBottom: 0,
        }}
      >
        <p
          style={{
            margin: '0 0 12px',
            fontSize: 12,
            fontWeight: 600,
            color: '#6a3030',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Zone de danger
        </p>

        {!showDeleteConfirm ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 500, color: '#c07070' }}>
                Supprimer ce site
              </p>
              <p style={{ margin: 0, fontSize: 12, color: '#5a3a3a' }}>
                Supprime définitivement le site, toutes ses pages et ses données.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                height: 32,
                padding: '0 14px',
                background: 'none',
                border: '1px solid #4a2020',
                borderRadius: 6,
                fontSize: 13,
                color: '#c07070',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                flexShrink: 0,
              }}
              className="delete-site-confirm-btn"
            >
              <Trash2 size={13} strokeWidth={1.5} />
              Supprimer
            </button>
          </div>
        ) : (
          <div>
            <p style={{ margin: '0 0 14px', fontSize: 13, color: '#ff8080' }}>
              Confirmer la suppression de{' '}
              <strong style={{ color: '#ffa0a0' }}>&quot;{site.name}&quot;</strong> ? Cette action
              est irréversible.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  height: 32,
                  padding: '0 14px',
                  background: 'none',
                  border: '1px solid #2a2a3e',
                  borderRadius: 6,
                  fontSize: 13,
                  color: '#8a8aa8',
                  cursor: 'pointer',
                }}
                className="dialog-cancel-btn"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deletePending}
                style={{
                  height: 32,
                  padding: '0 14px',
                  background: '#3a1010',
                  border: '1px solid #6a2020',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#ff8080',
                  cursor: deletePending ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {deletePending && <Loader2 size={13} className="spin" />}
                Oui, supprimer définitivement
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
