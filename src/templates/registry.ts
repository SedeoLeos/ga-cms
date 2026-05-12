import type { TatomirTemplate } from './types'

class TemplateRegistry {
  private templates = new Map<string, TatomirTemplate>()

  register(template: TatomirTemplate) {
    if (this.templates.has(template.id)) {
      console.warn(`[templates] Template "${template.id}" already registered — skipping`)
      return
    }
    this.templates.set(template.id, template)
  }

  get(id: string): TatomirTemplate | undefined {
    return this.templates.get(id)
  }

  getAll(): TatomirTemplate[] {
    return Array.from(this.templates.values())
  }

  getByCategory(category: TatomirTemplate['category']): TatomirTemplate[] {
    return this.getAll().filter((t) => t.category === category)
  }

  getPages(): TatomirTemplate[] {
    return this.getAll().filter((t) => t.scope === 'page')
  }

  getSites(): TatomirTemplate[] {
    return this.getAll().filter((t) => t.scope === 'site')
  }
}

const globalRegistry = globalThis as unknown as { __tatomirTemplates?: TemplateRegistry }
export const templateRegistry = globalRegistry.__tatomirTemplates ?? new TemplateRegistry()
if (process.env.NODE_ENV !== 'production') {
  globalRegistry.__tatomirTemplates = templateRegistry
}
