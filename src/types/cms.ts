export type FieldType =
  | 'short-text'
  | 'long-text'
  | 'rich-text'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'single-select'
  | 'multi-select'
  | 'relation-one'
  | 'relation-many'
  | 'media'
  | 'color'
  | 'json'
  | 'slug'
  | 'seo'

export interface FieldDefinition {
  id: string
  name: string
  label: string
  type: FieldType
  required: boolean
  unique?: boolean
  defaultValue?: unknown
  options?: string[]
  relationTo?: string
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
}

export interface AccessControl {
  type: 'public' | 'members' | 'group'
  groupIds?: string[]
  redirectTo?: string
}

export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
