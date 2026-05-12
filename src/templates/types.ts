import type { BlockNode } from '@/types/page'

export interface TemplatePageDef {
  slug: string
  label: string
  isHome?: boolean
  blocks: BlockNode[]
}

export interface TemplateSiteDef {
  pages: TemplatePageDef[]
  /** Design tokens to apply when installing the template */
  tokens?: Record<string, string>
  /** Theme id to activate */
  themeId?: string
}

export type TemplateCategory =
  | 'landing'
  | 'blog'
  | 'portfolio'
  | 'e-commerce'
  | 'saas'
  | 'agency'
  | 'personal'
  | 'other'

export interface TatomirTemplate {
  id: string
  name: string
  version: string
  description?: string
  category: TemplateCategory
  tags?: string[]
  thumbnail?: string
  /** Whether this is a single-page or full-site template */
  scope: 'page' | 'site'
  /** For page templates */
  page?: TemplatePageDef
  /** For site templates */
  site?: TemplateSiteDef
}
