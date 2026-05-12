export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="h-screen overflow-hidden"
      style={{ background: 'var(--color-editor-bg)', color: 'var(--color-text-primary)' }}
    >
      {children}
    </div>
  )
}
