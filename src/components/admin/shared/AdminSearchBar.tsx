'use client'

import { Search, X } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useRef, useState } from 'react'

interface Props {
  placeholder?: string
  showStatusFilter?: boolean
}

const STATUSES = [
  { value: '', label: 'Tous les statuts' },
  { value: 'DRAFT', label: 'Brouillon' },
  { value: 'PUBLISHED', label: 'Publié' },
  { value: 'ARCHIVED', label: 'Archivé' },
]

export default function AdminSearchBar({
  placeholder = 'Rechercher…',
  showStatusFilter = false,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [status, setStatus] = useState(searchParams.get('status') ?? '')
  const debounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  function push(nextSearch: string, nextStatus: string) {
    const p = new URLSearchParams()
    if (nextSearch) p.set('search', nextSearch)
    if (nextStatus) p.set('status', nextStatus)
    const qs = p.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  function onSearch(val: string) {
    setSearch(val)
    clearTimeout(debounce.current)
    debounce.current = setTimeout(() => push(val, status), 300)
  }

  function onStatus(val: string) {
    setStatus(val)
    push(search, val)
  }

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 0 }}>
        <Search
          size={13}
          strokeWidth={1.5}
          color="#52525b"
          style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)' }}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            height: 32,
            paddingLeft: 30,
            paddingRight: search ? 28 : 10,
            background: '#1a1a26',
            border: '1px solid #27272a',
            borderRadius: 6,
            fontSize: 12,
            color: '#f4f4f5',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearch('')}
            style={{
              position: 'absolute',
              right: 6,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#52525b',
              padding: 0,
              display: 'flex',
            }}
          >
            <X size={12} />
          </button>
        )}
      </div>

      {showStatusFilter && (
        <select
          value={status}
          onChange={(e) => onStatus(e.target.value)}
          style={{
            height: 32,
            padding: '0 8px',
            background: '#1a1a26',
            border: '1px solid #27272a',
            borderRadius: 6,
            fontSize: 12,
            color: status ? '#f4f4f5' : '#52525b',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}
