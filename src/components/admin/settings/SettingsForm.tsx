'use client'

import { updateSettingsAction } from '@/lib/actions/sites'
import type { SettingsActionState } from '@/lib/actions/sites'
import type { SiteSettings } from '@/lib/settings'
import { AlertCircle, Check, Loader2, Plus, X } from 'lucide-react'
import { useActionState, useEffect, useRef, useState } from 'react'

// ─── Shared styles ────────────────────────────────────────────────────────────

const INPUT_S: React.CSSProperties = {
  height: 34,
  padding: '0 10px',
  background: '#18181b',
  border: '1px solid #27272a',
  borderRadius: 6,
  color: '#f4f4f5',
  fontSize: 13,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

const LABEL_S: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: '#7070a0',
  display: 'block',
  marginBottom: 5,
}

const HINT_S: React.CSSProperties = {
  fontSize: 11,
  color: '#52525b',
  marginTop: 4,
}

const SECTION_S: React.CSSProperties = {
  background: '#111113',
  border: '1px solid #1f1f2e',
  borderRadius: 10,
  overflow: 'hidden',
  marginBottom: 20,
}

const SECTION_HEADER_S: React.CSSProperties = {
  padding: '12px 20px',
  borderBottom: '1px solid #1f1f2e',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
}

const SECTION_TITLE_S: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: '#e4e4e7',
  letterSpacing: '-0.01em',
  margin: 0,
}

const SECTION_BODY_S: React.CSSProperties = {
  padding: 20,
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
}

const ROW_S: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '200px 1fr',
  alignItems: 'start',
  gap: 24,
}

// ─── SUPPORTED_LOCALES ────────────────────────────────────────────────────────

const LOCALE_OPTIONS: { code: string; label: string }[] = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
  { code: 'pt', label: 'Português' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'ru', label: 'Русский' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
  { code: 'ar', label: 'العربية' },
]

// ─── LocalesEditor ────────────────────────────────────────────────────────────

function LocalesEditor({
  locales,
  defaultLocale,
  onChange,
  onDefaultChange,
}: {
  locales: string[]
  defaultLocale: string
  onChange: (l: string[]) => void
  onDefaultChange: (l: string) => void
}) {
  const [adding, setAdding] = useState(false)
  const selectRef = useRef<HTMLSelectElement>(null)

  const available = LOCALE_OPTIONS.filter((o) => !locales.includes(o.code))

  function addLocale(code: string) {
    if (!code) return
    onChange([...locales, code])
    setAdding(false)
  }

  function removeLocale(code: string) {
    const next = locales.filter((l) => l !== code)
    onChange(next)
    if (defaultLocale === code && next.length > 0) {
      onDefaultChange(next[0] ?? 'fr')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {locales.map((code) => {
          const label = LOCALE_OPTIONS.find((o) => o.code === code)?.label ?? code
          const isDefault = code === defaultLocale
          return (
            <div
              key={code}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                height: 28,
                padding: '0 8px 0 10px',
                background: isDefault ? 'rgba(37,99,235,0.1)' : '#18181b',
                border: `1px solid ${isDefault ? '#1d4ed8' : '#27272a'}`,
                borderRadius: 6,
                fontSize: 12,
                color: isDefault ? '#60a5fa' : '#e4e4e7',
                fontWeight: isDefault ? 600 : 400,
              }}
            >
              <span>{label}</span>
              <span
                style={{
                  fontSize: 10,
                  color: isDefault ? '#6070c8' : '#52525b',
                  fontFamily: 'monospace',
                }}
              >
                {code}
              </span>
              {isDefault && (
                <span
                  style={{
                    fontSize: 9,
                    background: '#1d4ed8',
                    color: '#60a5fa',
                    borderRadius: 3,
                    padding: '1px 4px',
                    marginLeft: 2,
                  }}
                >
                  défaut
                </span>
              )}
              {!isDefault && (
                <button
                  type="button"
                  onClick={() => onDefaultChange(code)}
                  title="Définir par défaut"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0 2px',
                    color: '#3a3a52',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Check size={10} strokeWidth={2} />
                </button>
              )}
              {locales.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLocale(code)}
                  title="Retirer"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0 2px',
                    color: '#3a3a52',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <X size={10} strokeWidth={2} />
                </button>
              )}
            </div>
          )
        })}

        {available.length > 0 && !adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              height: 28,
              padding: '0 8px',
              background: 'none',
              border: '1px dashed #27272a',
              borderRadius: 6,
              fontSize: 12,
              color: '#52525b',
              cursor: 'pointer',
            }}
          >
            <Plus size={11} strokeWidth={2} />
            Ajouter
          </button>
        )}

        {adding && (
          <select
            ref={selectRef}
            defaultValue=""
            onChange={(e) => addLocale(e.target.value)}
            onBlur={() => setAdding(false)}
            style={{
              height: 28,
              padding: '0 6px',
              background: '#18181b',
              border: '1px solid #2563eb',
              borderRadius: 6,
              fontSize: 12,
              color: '#f4f4f5',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="" disabled>
              Choisir…
            </option>
            {available.map((o) => (
              <option key={o.code} value={o.code}>
                {o.label} ({o.code})
              </option>
            ))}
          </select>
        )}
      </div>
      <p style={HINT_S}>
        Cliquez sur <Check size={9} strokeWidth={2} style={{ display: 'inline' }} /> pour définir la
        langue par défaut. La langue par défaut ne peut pas être retirée.
      </p>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface Props {
  initial: SiteSettings
}

export default function SettingsForm({ initial }: Props) {
  const [state, formAction, pending] = useActionState<SettingsActionState, FormData>(
    updateSettingsAction,
    null,
  )

  const [locales, setLocales] = useState<string[]>(initial.locales)
  const [defaultLocale, setDefaultLocale] = useState(initial.defaultLocale)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (state && 'success' in state) {
      setSaved(true)
      const t = setTimeout(() => setSaved(false), 3000)
      return () => clearTimeout(t)
    }
  }, [state])

  return (
    <form action={formAction}>
      {/* Hidden locale fields */}
      <input type="hidden" name="locales" value={JSON.stringify(locales)} />
      <input type="hidden" name="defaultLocale" value={defaultLocale} />

      {/* ── Section : Général ─────────────────────────────────────────── */}
      <div style={SECTION_S}>
        <div style={SECTION_HEADER_S}>
          <h2 style={SECTION_TITLE_S}>Général</h2>
        </div>
        <div style={SECTION_BODY_S}>
          <div style={ROW_S}>
            <div>
              <label style={LABEL_S} htmlFor="name">
                Titre du site
              </label>
              <p style={HINT_S}>Nom affiché dans les onglets et les résultats de recherche.</p>
            </div>
            <input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={initial.name}
              style={INPUT_S}
              className="admin-input"
            />
          </div>

          <div style={{ height: 1, background: '#1a1a24' }} />

          <div style={ROW_S}>
            <div>
              <label style={LABEL_S} htmlFor="description">
                Slogan
              </label>
              <p style={HINT_S}>Une courte phrase qui décrit votre site.</p>
            </div>
            <input
              id="description"
              name="description"
              type="text"
              defaultValue={initial.description ?? ''}
              placeholder="Ex : Juste un autre site WordPress"
              style={INPUT_S}
              className="admin-input"
            />
          </div>

          <div style={{ height: 1, background: '#1a1a24' }} />

          <div style={ROW_S}>
            <div>
              <label style={LABEL_S} htmlFor="url">
                Adresse du site (URL)
              </label>
              <p style={HINT_S}>
                L'adresse complète de votre site, utilisée pour les liens et la sitemap.
              </p>
            </div>
            <input
              id="url"
              name="url"
              type="url"
              defaultValue={initial.url ?? ''}
              placeholder="https://monsite.com"
              style={INPUT_S}
              className="admin-input"
            />
          </div>
        </div>
      </div>

      {/* ── Section : Langue ──────────────────────────────────────────── */}
      <div style={SECTION_S}>
        <div style={SECTION_HEADER_S}>
          <h2 style={SECTION_TITLE_S}>Langue</h2>
        </div>
        <div style={SECTION_BODY_S}>
          <div style={ROW_S}>
            <div>
              <p style={{ ...LABEL_S, margin: 0 }}>Langues actives</p>
              <p style={HINT_S}>
                Langues disponibles pour le contenu. Les URLs de vos pages seront préfixées par le
                code de langue.
              </p>
            </div>
            <LocalesEditor
              locales={locales}
              defaultLocale={defaultLocale}
              onChange={setLocales}
              onDefaultChange={setDefaultLocale}
            />
          </div>
        </div>
      </div>

      {/* ── Section : Médias ──────────────────────────────────────────── */}
      <div style={SECTION_S}>
        <div style={SECTION_HEADER_S}>
          <h2 style={SECTION_TITLE_S}>Médias</h2>
        </div>
        <div style={SECTION_BODY_S}>
          <div style={ROW_S}>
            <div>
              <label style={LABEL_S} htmlFor="logo">
                Logo
              </label>
              <p style={HINT_S}>URL de l'image du logo principal du site.</p>
            </div>
            <input
              id="logo"
              name="logo"
              type="url"
              defaultValue={initial.logo ?? ''}
              placeholder="https://monsite.com/logo.svg"
              style={INPUT_S}
              className="admin-input"
            />
          </div>

          <div style={{ height: 1, background: '#1a1a24' }} />

          <div style={ROW_S}>
            <div>
              <label style={LABEL_S} htmlFor="favicon">
                Favicon
              </label>
              <p style={HINT_S}>URL de l'icône affichée dans les onglets du navigateur.</p>
            </div>
            <input
              id="favicon"
              name="favicon"
              type="url"
              defaultValue={initial.favicon ?? ''}
              placeholder="https://monsite.com/favicon.ico"
              style={INPUT_S}
              className="admin-input"
            />
          </div>
        </div>
      </div>

      {/* ── Footer bar ────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        {state && 'error' in state && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              color: '#ff7070',
            }}
          >
            <AlertCircle size={14} strokeWidth={1.5} />
            {state.error}
          </div>
        )}
        {saved && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              color: '#4ade80',
            }}
          >
            <Check size={14} strokeWidth={2} />
            Paramètres enregistrés
          </div>
        )}
        {!saved && !(state && 'error' in state) && <div />}

        <button
          type="submit"
          disabled={pending}
          style={{
            height: 34,
            padding: '0 18px',
            background: pending ? '#1d4ed8' : '#2563eb',
            border: 'none',
            borderRadius: 6,
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            cursor: pending ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'background 0.15s',
            flexShrink: 0,
          }}
          className={pending ? '' : 'admin-btn-primary'}
        >
          {pending && <Loader2 size={13} strokeWidth={2} className="spin" />}
          {pending ? 'Enregistrement…' : 'Enregistrer les modifications'}
        </button>
      </div>
    </form>
  )
}
