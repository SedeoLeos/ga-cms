'use client'

import { logoutAction } from '@/lib/auth/actions'
import {
  ChevronDown,
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

const NAV_SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Contenu',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutGrid },
      { href: '/admin/pages', label: 'Pages', icon: FileText },
      { href: '/admin/collections', label: 'Collections', icon: Database },
      { href: '/admin/post-types', label: 'Post Types', icon: Layers },
      { href: '/admin/taxonomies', label: 'Taxonomies', icon: Tag },
    ],
  },
  {
    label: 'Médias',
    items: [{ href: '/admin/media', label: 'Médiathèque', icon: Image }],
  },
  {
    label: 'Apparence',
    items: [
      { href: '/admin/design-system', label: 'Design System', icon: Palette },
      { href: '/admin/global-blocks', label: 'Blocs globaux', icon: Globe },
    ],
  },
  {
    label: 'Accès',
    items: [{ href: '/admin/members', label: 'Membres', icon: Users }],
  },
]

interface Props {
  userName: string
  userEmail: string
  siteName?: string
}

export default function AdminSidebar({ userName, userEmail, siteName = 'Tatomir' }: Props) {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  const initials = (userName[0] ?? 'A').toUpperCase()

  return (
    <aside
      style={{
        width: 224,
        height: '100vh',
        background: '#0a0a10',
        borderRight: '1px solid #1c1c28',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
      }}
    >
      {/* Workspace selector */}
      <div
        style={{
          height: 52,
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          borderBottom: '1px solid #1c1c28',
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          className="wf-sidebar-ws"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            width: '100%',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '5px 8px',
            borderRadius: 7,
            textAlign: 'left',
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              background: '#4353ff',
              borderRadius: 7,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Shapes size={14} strokeWidth={2} color="#fff" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#e0e0ec',
                letterSpacing: '-0.01em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {siteName}
            </div>
            <div style={{ fontSize: 10, color: '#404058', marginTop: 1 }}>CMS Workspace</div>
          </div>
          <ChevronDown size={13} strokeWidth={2} color="#383852" />
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }} className="panel-scroll">
        {NAV_SECTIONS.map((section, i) => (
          <div key={section.label} style={{ marginBottom: 4 }}>
            {i > 0 && (
              <div
                style={{
                  height: 1,
                  background: '#14141e',
                  margin: '6px 12px',
                }}
              />
            )}
            <p
              style={{
                margin: '8px 16px 3px',
                fontSize: 10,
                fontWeight: 600,
                color: '#35354e',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              {section.label}
            </p>
            {section.items.map((item) => (
              <SidebarItem key={item.href} item={item} active={isActive(item.href)} />
            ))}
          </div>
        ))}
      </nav>

      {/* Bottom zone */}
      <div style={{ flexShrink: 0, borderTop: '1px solid #14141e', paddingTop: 4 }}>
        <SidebarItem
          item={{ href: '/admin/settings', label: 'Paramètres', icon: Settings2 }}
          active={isActive('/admin/settings')}
        />

        {/* User footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            padding: '8px 14px',
            marginTop: 2,
            borderTop: '1px solid #12121c',
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: '#1a1f4a',
              border: '1px solid #272d6a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
              color: '#6878ff',
              flexShrink: 0,
              letterSpacing: '-0.02em',
            }}
          >
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: '#c0c0d8',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {userName}
            </div>
            <div
              style={{
                fontSize: 11,
                color: '#3e3e56',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {userEmail}
            </div>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              title="Déconnexion"
              className="wf-btn-icon wf-sidebar-logout"
              style={{
                width: 28,
                height: 28,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 6,
                flexShrink: 0,
                padding: 0,
                color: '#3e3e56',
              }}
            >
              <LogOut size={14} strokeWidth={1.5} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}

function SidebarItem({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      className={active ? 'wf-sidebar-item--active' : 'wf-sidebar-item'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        height: 32,
        padding: '0 10px',
        margin: '1px 8px',
        borderRadius: 6,
        textDecoration: 'none',
        outline: 'none',
      }}
    >
      <Icon
        size={15}
        strokeWidth={1.6}
        className="wf-sidebar-icon"
        style={{ color: active ? '#7888ff' : '#45455e', flexShrink: 0 }}
      />
      <span
        style={{
          fontSize: 13,
          fontWeight: active ? 500 : 400,
          color: active ? '#c8ceff' : undefined,
          letterSpacing: '-0.01em',
        }}
      >
        {item.label}
      </span>
    </Link>
  )
}
