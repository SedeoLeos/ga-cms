import type { TatomirTheme } from './types'

class ThemeRegistry {
  private themes = new Map<string, TatomirTheme>()

  register(theme: TatomirTheme) {
    if (this.themes.has(theme.id)) {
      console.warn(`[themes] Theme "${theme.id}" already registered — skipping`)
      return
    }
    this.themes.set(theme.id, theme)
  }

  get(id: string): TatomirTheme | undefined {
    return this.themes.get(id)
  }

  getAll(): TatomirTheme[] {
    return Array.from(this.themes.values())
  }

  getDefault(): TatomirTheme | undefined {
    return this.themes.get('default') ?? this.themes.values().next().value
  }
}

const globalRegistry = globalThis as unknown as { __tatomirThemes?: ThemeRegistry }
export const themeRegistry = globalRegistry.__tatomirThemes ?? new ThemeRegistry()
if (process.env.NODE_ENV !== 'production') {
  globalRegistry.__tatomirThemes = themeRegistry
}
