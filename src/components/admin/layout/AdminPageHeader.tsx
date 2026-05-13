interface Props {
  title: string
  subtitle?: React.ReactNode
  action?: React.ReactNode
  border?: boolean
}

export default function AdminPageHeader({ title, subtitle, action, border = true }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: '18px 28px',
        borderBottom: border ? '1px solid rgba(255,255,255,0.06)' : 'none',
        flexShrink: 0,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <h1
          style={{
            margin: 0,
            fontSize: 15,
            fontWeight: 600,
            color: '#f4f4f5',
            letterSpacing: '-0.02em',
            lineHeight: 1.3,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              margin: '2px 0 0',
              fontSize: 12,
              color: '#52525b',
              lineHeight: 1.4,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  )
}
