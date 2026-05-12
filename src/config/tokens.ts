export const DEFAULT_DESIGN_TOKENS = {
  // Typography
  '--font-sans': 'Inter, ui-sans-serif, system-ui, sans-serif',
  '--font-mono': 'JetBrains Mono, ui-monospace, monospace',
  '--font-size-base': '16px',
  '--line-height-base': '1.6',
  '--letter-spacing-base': '0em',

  // Colour — brand
  '--color-primary': '#3b82f6',
  '--color-primary-hover': '#2563eb',
  '--color-primary-foreground': '#ffffff',

  // Colour — surface
  '--color-background': '#ffffff',
  '--color-foreground': '#111827',
  '--color-surface': '#f9fafb',
  '--color-border': '#e5e7eb',
  '--color-muted': '#6b7280',

  // Colour — feedback
  '--color-success': '#22c55e',
  '--color-warning': '#f59e0b',
  '--color-danger': '#f43f5e',

  // Spacing
  '--spacing-unit': '4px',

  // Border radius
  '--radius-sm': '4px',
  '--radius-md': '8px',
  '--radius-lg': '12px',
  '--radius-xl': '16px',
  '--radius-full': '9999px',

  // Shadows
  '--shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  '--shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  '--shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1)',
} as const

export type DesignTokenKey = keyof typeof DEFAULT_DESIGN_TOKENS
