'use client'

import { logoutAction } from '@/lib/auth/actions'
import {
  Database,
  FileText,
  Globe,
  Image,
  Layers,
  LogOut,
  Palette,
  Settings2,
  Shapes,
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
    label: 'Content',
    items: [
      { href: '/admin/sites', label: 'Sites', icon: Globe },
      { href: '/admin/pages', label: 'Pages', icon: FileText },
      { href: '/admin/collections', label: 'Collections', icon: Database },
      { href: '/admin/post-types', label: 'Post Types', icon: Layers },
    ],
  },
  {
    label: 'Assets',
    items: [{ href: '/admin/media', label: 'Media', icon: Image }],
  },
  {
    label: 'Design',
    items: [{ href: '/admin/design-system', label: 'Design System', icon: Palette }],
  },
]

const BOTTOM_NAV: NavItem[] = [{ href: '/admin/settings', label: 'Settings', icon: Settings2 }]

interface Props {
  userName: string
  userEmail: string
}

export default function AdminSidebar({ userName, userEmail }: Props) {
  const pathname = usePathname()
  const isActive = (href: string) => pathname.startsWith(href)
  const initials = (userName[0] ?? 'A').toUpperCase()

  return (
    <aside
      style={{
        width: 220,
        height: '100vh',
        background: '#111118',
        borderRight: '1px solid #1f1f2e',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: 48,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '0 14px',
          borderBottom: '1px solid #1f1f2e',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            background: '#4353ff',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Shapes size={13} strokeWidth={2} color="#fff" />
        </div>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#e8e8f0', letterSpacing: '-0.01em' }}>
          tatomir
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '6px 0', overflowY: 'auto' }} className="panel-scroll">
        {NAV_SECTIONS.map((section, i) => (
          <div key={section.label}>
            {i > 0 && <div style={{ height: 1, background: '#1a1a24', margin: '4px 0' }} />}
            <p
              style={{
                margin: '6px 14px 2px',
                fontSize: 10,
                fontWeight: 600,
                color: '#3e3e52',
                letterSpacing: '0.07em',
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

      {/* Bottom */}
      <div style={{ flexShrink: 0, borderTop: '1px solid #1a1a24' }}>
        <div style={{ padding: '4px 0' }}>
          {BOTTOM_NAV.map((item) => (
            <SidebarItem key={item.href} item={item} active={isActive(item.href)} />
          ))}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 14px',
            borderTop: '1px solid #1a1a24',
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: '#1a1f4a',
              border: '1px solid #2d3580',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
              color: '#7080ff',
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: '#c8c8da',
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
                color: '#4a4a60',
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
              title="Sign out"
              className="sidebar-logout-btn"
              style={{
                width: 28,
                height: 28,
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
              <LogOut size={14} strokeWidth={1.5} color="#4a4a60" />
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
      className={active ? '' : 'sidebar-item'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        height: 30,
        padding: '0 10px',
        margin: '1px 6px',
        borderRadius: 5,
        textDecoration: 'none',
        background: active ? '#1e1e30' : 'transparent',
        outline: 'none',
      }}
    >
      <Icon size={15} strokeWidth={1.5} color={active ? '#8090f0' : '#4a4a68'} />
      <span
        style={{
          fontSize: 13,
          fontWeight: active ? 500 : 400,
          color: active ? '#ddddf0' : '#8a8aa8',
        }}
      >
        {item.label}
      </span>
    </Link>
  )
}
