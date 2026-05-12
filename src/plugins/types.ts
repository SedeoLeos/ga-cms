// ─── Block ──────────────────────────────────────────────────────────

export interface PluginBlockDefinition {
  id: string
  label: string
  category: string
  icon: string // Lucide icon name
  description?: string
  component: React.ComponentType<Record<string, unknown>>
  defaultProps?: Record<string, unknown>
  schema?: import('zod').ZodType
  settingsPanel?: React.ComponentType<{
    props: Record<string, unknown>
    onChange: (props: Record<string, unknown>) => void
  }>
}

// ─── Field Type ─────────────────────────────────────────────────────

export interface PluginFieldTypeDefinition {
  type: string // unique identifier, e.g. "color-swatch"
  label: string
  icon: string
  editorComponent: React.ComponentType<{
    value: unknown
    onChange: (value: unknown) => void
    field: { label: string; required: boolean }
  }>
  defaultValue?: unknown
  validate?: (value: unknown) => string | null
}

// ─── Storage Adapter ────────────────────────────────────────────────

export interface StorageAdapter {
  id: string
  upload(file: Buffer, filename: string, mimeType: string): Promise<string>
  delete(url: string): Promise<void>
  getSignedUrl?(url: string, expiresInSeconds: number): Promise<string>
}

// ─── Admin Menu Item ────────────────────────────────────────────────

export interface PluginAdminMenuItem {
  id: string
  label: string
  icon: string
  href: string
  section?: 'main' | 'settings' | 'bottom'
}

// ─── Site Feature ───────────────────────────────────────────────────

export interface PluginSiteFeature {
  id: string
  // Server-side middleware injected into the site renderer
  onRequest?: (ctx: { siteId: string; pathname: string; locale: string }) => Promise<{
    redirect?: string
    headers?: Record<string, string>
  } | null>
  // Global components rendered in the site <head>
  headComponents?: React.ComponentType<{ siteId: string }>[]
  // Global components rendered at the bottom of <body>
  bodyComponents?: React.ComponentType<{ siteId: string }>[]
}

// ─── Plugin ─────────────────────────────────────────────────────────

export interface TatomirPlugin {
  id: string
  name: string
  version: string
  description?: string
  blocks?: PluginBlockDefinition[]
  fieldTypes?: PluginFieldTypeDefinition[]
  storageAdapters?: StorageAdapter[]
  adminMenuItems?: PluginAdminMenuItem[]
  siteFeatures?: PluginSiteFeature[]
  // Called once when the plugin is registered
  onInit?: (config: Record<string, unknown>) => void | Promise<void>
}
