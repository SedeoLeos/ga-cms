'use client'

import { logoutAction } from '@/lib/auth/actions'
import {
  Database,
  FileText,
  Globe,
  Image,
  Layers,
  LayoutGrid,
  LogOut,
  Palette,
  Settings2,
  Shapes,
  Tag,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  href: string
  label: string
  // biome-ignore lint/suspicious/noExplicitAny: lucide component type
  icon: React.ComponentType<any>
}

const NAV_ITEMS: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutGrid },
  { href: '/admin/pages', label: 'Pages', icon: FileText },
  { href: '/admin/collections', label: 'Collections', icon: Database },
  { href: '/admin/post-types', label: 'Post Types', icon: Layers },
  { href: '/admin/taxonomies', label: 'Taxonomies', icon: Tag },
  { href: '/admin/media', label: 'Médiathèque', icon: Image },
  { href: '/admin/global-blocks', label: 'Blocs globaux', icon: Globe },
  { href: '/admin/design-system', label: 'Design System', icon: Palette },
]

const BOTTOM_ITEMS: NavItem[] = [
  { href: '/admin/members', label: 'Membres', icon: Users },
  { href: '/admin/settings', label: 'Paramètres', icon: Settings2 },
]

interface Props {
  userName: string
  userEmail: string
  siteName?: string
}

export default function AdminSidebar({ userName, userEmail, siteName = 'Mon Site' }: Props) {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  const initial = (userName[0] ?? 'A').toUpperCase()

  return (
    <aside
      style={{
        width: 232,
        height: '100vh',
        background: '#0a0a0f',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* ── Logo / site header ─────────────────────────────────────── */}
      <div
        style={{
          height: 52,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 16px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 26,
            height: 26,
            background: '#4353ff',
            borderRadius: 7,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Shapes size={13} strokeWidth={2} color="#fff" />
        </div>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#d8d8ec',
            letterSpacing: '-0.02em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
          }}
        >
          {siteName}
        </span>
      </div>

      {/* ── Navigation ─────────────────────────────────────────────── */}
      <nav style={{ flex: 1, padding: '10px 8px 8px', overflowY: 'auto' }} className="panel-scroll">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} />
        ))}
      </nav>

      {/* ── Bottom section ─────────────────────────────────────────── */}
      <div
        style={{
          flexShrink: 0,
          padding: '8px 8px 0',
          borderTop: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        {BOTTOM_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} />
        ))}

        {/* User row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            padding: '8px 10px',
            marginTop: 4,
            borderTop: '1px solid rgba(255,255,255,0.03)',
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: 'rgba(67,83,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
              color: '#6878ff',
              flexShrink: 0,
              letterSpacing: 0,
            }}
          >
            {initial}
          </div>

          {/* Name / email */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: '#9898b8',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {userName}
            </div>
            <div
              style={{
                fontSize: 10,
                color: '#3a3a5a',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                marginTop: 1,
              }}
            >
              {userEmail}
            </div>
          </div>

          {/* Logout */}
          <form action={logoutAction}>
            <button
              type="submit"
              title="Déconnexion"
              className="wf-sidebar-logout"
              style={{
                width: 26,
                height: 26,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 5,
                flexShrink: 0,
                padding: 0,
              }}
            >
              <LogOut size={13} strokeWidth={1.5} color="#3a3a5a" />
            </button>
          </form>
        </div>

        <div style={{ height: 8 }} />
      </div>
    </aside>
  )
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        height: 34,
        padding: '0 10px',
        borderRadius: 6,
        textDecoration: 'none',
        marginBottom: 1,
        outline: 'none',
        position: 'relative',
        // Active: left border + subtle blue bg
        background: active ? 'rgba(67,83,255,0.1)' : 'transparent',
        borderLeft: active ? '2px solid #4353ff' : '2px solid transparent',
        paddingLeft: active ? 8 : 10,
        transition: 'background 0.1s',
      }}
      className={active ? '' : 'wf-nav-link'}
    >
      <Icon
        size={14}
        strokeWidth={1.6}
        style={{
          color: active ? '#6878ff' : '#3a3a5e',
          flexShrink: 0,
          transition: 'color 0.1s',
        }}
      />
      <span
        style={{
          fontSize: 13,
          fontWeight: active ? 500 : 400,
          color: active ? '#b8bcff' : '#5a5a80',
          letterSpacing: active ? '-0.01em' : '0',
          transition: 'color 0.1s',
        }}
      >
        {item.label}
      </span>
    </Link>
  )
}
