export const TOKEN_TYPES = [
  'color',
  'spacing',
  'font-size',
  'font-family',
  'border-radius',
  'shadow',
  'opacity',
] as const

export type TokenType = (typeof TOKEN_TYPES)[number]
