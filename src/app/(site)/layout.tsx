import { prisma } from '@/lib/db/client'
import Link from 'next/link'

const NAV = [
  { href: '/', label: 'Accueil' },
  { href: '/about', label: 'À propos' },
  { href: '/contact', label: 'Contact' },
]

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await prisma.settings.findUnique({ where: { id: 1 } }).catch(() => null)
  const siteName = settings?.name ?? 'Mon Site'
  const year = new Date().getFullYear()

  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          color: '#111827',
          background: '#fff',
          WebkitFontSmoothing: 'antialiased',
        }}
      >
        {/* ── Nav ── */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid #f3f4f6',
          }}
        >
          <div
            style={{
              maxWidth: 1200,
              margin: '0 auto',
              padding: '0 24px',
              height: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Link
              href="/"
              style={{
                fontWeight: 800,
                fontSize: 17,
                color: '#111827',
                textDecoration: 'none',
                letterSpacing: '-0.025em',
              }}
            >
              {siteName}
            </Link>
            <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {NAV.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#374151',
                    textDecoration: 'none',
                  }}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        {/* ── Content ── */}
        <main>{children}</main>

        {/* ── Footer ── */}
        <footer
          style={{
            borderTop: '1px solid #f3f4f6',
            padding: '52px 24px',
            background: '#fafafa',
          }}
        >
          <div
            style={{
              maxWidth: 1200,
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <span
              style={{ fontWeight: 800, fontSize: 16, color: '#111827', letterSpacing: '-0.02em' }}
            >
              {siteName}
            </span>
            <nav style={{ display: 'flex', gap: 24 }}>
              {NAV.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none' }}
                >
                  {label}
                </Link>
              ))}
            </nav>
            <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>
              © {year} {siteName}. Tous droits réservés.
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
