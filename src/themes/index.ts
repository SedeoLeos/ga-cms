import { defaultTheme } from './built-in/default'
import { minimalTheme } from './built-in/minimal'
import { modernTheme } from './built-in/modern'
import { themeRegistry } from './registry'

export function registerBuiltInThemes() {
  themeRegistry.register(defaultTheme)
  themeRegistry.register(minimalTheme)
  themeRegistry.register(modernTheme)
}

export { themeRegistry }
export * from './types'
