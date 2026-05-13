'use client'

import MediaLibrary from '@/components/admin/media/MediaLibrary'
import type { MediaFileItem, MediaFolderItem } from '@/components/admin/media/MediaLibrary'
import { Image as ImageIcon, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface Props {
  value: string
  onChange: (url: string) => void
  inputId: string
}

export default function MediaPickerField({ value, onChange, inputId }: Props) {
  const [open, setOpen] = useState(false)
  const [folders, setFolders] = useState<MediaFolderItem[]>([])
  const [files, setFiles] = useState<MediaFileItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  const isImage = value && /\.(png|jpe?g|gif|webp|svg|avif)(\?|$)/i.test(value)

  async function load() {
    if (loaded) return
    const res = await fetch('/api/media')
    if (!res.ok) return
    const data = (await res.json()) as { files: MediaFileItem[]; folders: MediaFolderItem[] }
    setFiles(data.files)
    setFolders(data.folders)
    setLoaded(true)
  }

  async function handleOpen() {
    setOpen(true)
    await load()
  }

  function handleSelect(url: string) {
    onChange(url)
    setOpen(false)
  }

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) setOpen(false)
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
        {value && isImage && (
          <div
            style={{
              width: 56,
              height: 40,
              borderRadius: 4,
              overflow: 'hidden',
              flexShrink: 0,
              background: '#0e0e14',
              border: '1px solid #1f1f2e',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <input
            id={inputId}
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://…"
            style={{
              width: '100%',
              background: '#1e1e2e',
              border: '1px solid #2a2a3e',
              borderRadius: 6,
              padding: '0 10px',
              fontSize: 12,
              fontFamily: 'ui-monospace, monospace',
              color: '#e8e8f0',
              outline: 'none',
              boxSizing: 'border-box',
              height: 34,
            }}
          />
        </div>
        <button
          type="button"
          onClick={handleOpen}
          title="Choisir dans la médiathèque"
          style={{
            height: 34,
            padding: '0 10px',
            background: '#1a1a26',
            border: '1px solid #2a2a3e',
            borderRadius: 6,
            fontSize: 12,
            color: '#8a8aa8',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          <ImageIcon size={13} strokeWidth={1.5} />
          Choisir
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            title="Vider"
            style={{
              height: 34,
              width: 34,
              background: 'none',
              border: '1px solid #2a2a3e',
              borderRadius: 6,
              color: '#4a4a68',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <X size={13} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {open && (
        <div
          ref={overlayRef}
          onClick={handleOverlayClick}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false)
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 32,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 860,
              background: '#0e0e14',
              borderRadius: 12,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 20px',
                borderBottom: '1px solid #1a1a24',
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#e8e8f0',
                  letterSpacing: '-0.01em',
                }}
              >
                Médiathèque
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#4a4a68',
                  padding: 2,
                  display: 'flex',
                }}
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>
            <MediaLibrary
              initialFiles={files}
              initialFolders={folders}
              mode="picker"
              onSelect={handleSelect}
              selectedUrl={value}
            />
          </div>
        </div>
      )}
    </>
  )
}
