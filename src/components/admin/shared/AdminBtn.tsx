'use client'

import { Loader2 } from 'lucide-react'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
  loading?: boolean
  icon?: React.ReactNode
}

export default function AdminBtn({
  variant = 'primary',
  size = 'md',
  loading,
  icon,
  children,
  disabled,
  className = '',
  style,
  ...rest
}: Props) {
  const h = size === 'sm' ? 28 : 32
  const px = size === 'sm' ? 12 : 14
  const fs = size === 'sm' ? 12 : 13

  const base: React.CSSProperties = {
    height: h,
    padding: `0 ${px}px`,
    border: 'none',
    borderRadius: 7,
    fontSize: fs,
    fontWeight: 500,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    transition: 'background 0.12s, transform 0.08s',
    opacity: disabled ? 0.5 : 1,
    letterSpacing: '-0.01em',
    fontFamily: 'inherit',
    ...style,
  }

  if (variant === 'primary') {
    return (
      <button
        type="button"
        {...rest}
        disabled={disabled || loading}
        className={`wf-btn-primary ${className}`}
        style={{ ...base, background: '#2563eb', color: '#fff' }}
      >
        {loading ? <Loader2 size={12} className="spin" /> : icon}
        {children}
      </button>
    )
  }

  if (variant === 'ghost') {
    return (
      <button
        type="button"
        {...rest}
        disabled={disabled || loading}
        className={`wf-btn-ghost ${className}`}
        style={{
          ...base,
          background: 'transparent',
          border: '1px solid #27272a',
          color: '#7a7a98',
        }}
      >
        {loading ? <Loader2 size={12} className="spin" /> : icon}
        {children}
      </button>
    )
  }

  return (
    <button
      type="button"
      {...rest}
      disabled={disabled || loading}
      className={className}
      style={{
        ...base,
        background: 'transparent',
        border: '1px solid #4a1c1c',
        color: '#ff6868',
      }}
    >
      {loading ? <Loader2 size={12} className="spin" /> : icon}
      {children}
    </button>
  )
}
