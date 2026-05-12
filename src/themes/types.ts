export interface ThemeColorScale {
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900: string
  950: string
}

export interface ThemePalette {
  primary: ThemeColorScale
  neutral: ThemeColorScale
  success: ThemeColorScale
  warning: ThemeColorScale
  danger: ThemeColorScale
  background: string
  foreground: string
  surface: string
  border: string
  muted: string
}

export interface ThemeTypography {
  fontSans: string
  fontMono: string
  fontSerif?: string
  baseSize: string // e.g. "16px"
  lineHeight: string // e.g. "1.6"
  headingLineHeight: string // e.g. "1.2"
  letterSpacing: string // e.g. "0em"
}

export interface ThemeSpacing {
  unit: number // base unit in px (usually 4)
  scale: number[] // multipliers, e.g. [0, 0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 16, 24, 32]
}

export interface ThemeBorderRadius {
  none: string
  sm: string
  md: string
  lg: string
  xl: string
  full: string
}

export interface ThemeShadow {
  none: string
  sm: string
  md: string
  lg: string
  xl: string
}

export interface TatomirTheme {
  id: string
  name: string
  version: string
  description?: string
  author?: string
  thumbnail?: string
  palette: ThemePalette
  typography: ThemeTypography
  spacing: ThemeSpacing
  borderRadius: ThemeBorderRadius
  shadows: ThemeShadow
  /** Raw CSS injected in the site <head> for global overrides */
  globalCss?: string
  /** Extra CSS variables available in the editor design tokens panel */
  customTokens?: Record<string, string>
}
