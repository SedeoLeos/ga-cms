'use client'

import {
  createMediaFolderAction,
  deleteMediaFileAction,
  deleteMediaFolderAction,
  updateMediaFileMetaAction,
} from '@/lib/actions/media'
import {
  File,
  FileText,
  Film,
  FolderOpen,
  FolderPlus,
  Music,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { useRef, useState, useTransition } from 'react'

export type MediaFileItem = {
  id: string
  filename: string
  url: string
  mimeType: string
  size: number
  width: number | null
  height: number | null
  alt: string | null
  createdAt: string
}

export type MediaFolderItem = {
  id: string
  name: string
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} o`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} Ko`
  return `${(n / 1024 / 1024).toFixed(1)} Mo`
}

function FileIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith('video/')) return <Film size={24} strokeWidth={1} color="#5a5a78" />
  if (mimeType.startsWith('audio/')) return <Music size={24} strokeWidth={1} color="#5a5a78" />
  if (mimeType.includes('pdf') || mimeType.includes('text'))
    return <FileText size={24} strokeWidth={1} color="#5a5a78" />
  return <File size={24} strokeWidth={1} color="#5a5a78" />
}

function FileCard({
  file,
  selected,
  onClick,
}: {
  file: MediaFileItem
  selected: boolean
  onClick: () => void
}) {
  const isImage = file.mimeType.startsWith('image/')

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: selected ? '#1a1a3a' : '#13131c',
        border: `1px solid ${selected ? '#4353ff' : '#1f1f2e'}`,
        borderRadius: 8,
        overflow: 'hidden',
        cursor: 'pointer',
        padding: 0,
        textAlign: 'left',
        width: '100%',
      }}
    >
      <div
        style={{
          height: 100,
          background: '#0e0e14',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={file.url}
            alt={file.alt ?? file.filename}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <FileIcon mimeType={file.mimeType} />
        )}
      </div>
      <div style={{ padding: '6px 8px' }}>
        <div
          style={{
            fontSize: 11,
            color: '#c8c8e0',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {file.filename}
        </div>
        <div style={{ fontSize: 10, color: '#3e3e52', marginTop: 2 }}>{formatBytes(file.size)}</div>
      </div>
    </button>
  )
}

interface Props {
  initialFiles: MediaFileItem[]
  initialFolders: MediaFolderItem[]
  mode?: 'page' | 'picker'
  onSelect?: (url: string) => void
  selectedUrl?: string
}

export default function MediaLibrary({
  initialFiles,
  initialFolders,
  mode = 'page',
  onSelect,
  selectedUrl,
}: Props) {
  const [folders, setFolders] = useState<MediaFolderItem[]>(initialFolders)
  const [files, setFiles] = useState<MediaFileItem[]>(initialFiles)
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null)
  const [activeFile, setActiveFile] = useState<MediaFileItem | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [newFolderName, setNewFolderName] = useState('')
  const [showFolderInput, setShowFolderInput] = useState(false)
  const [altValue, setAltValue] = useState('')
  const [captionValue, setCaptionValue] = useState('')
  const [metaPending, startMetaTransition] = useTransition()
  const [deletePending, startDeleteTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function fetchFolder(folderId: string | null) {
    const params = new URLSearchParams()
    if (folderId) params.set('folderId', folderId)
    const res = await fetch(`/api/media?${params}`)
    if (!res.ok) return
    const data = (await res.json()) as { files: MediaFileItem[]; folders: MediaFolderItem[] }
    setFiles(data.files)
    setFolders(data.folders)
    setActiveFile(null)
  }

  async function handleFolderClick(folderId: string | null) {
    setActiveFolderId(folderId)
    await fetchFolder(folderId)
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    if (!selected.length) return
    setUploading(true)
    setUploadError(null)
    try {
      for (const f of selected) {
        const fd = new FormData()
        fd.append('file', f)
        if (activeFolderId) fd.append('folderId', activeFolderId)
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        if (!res.ok) {
          const err = (await res.json()) as { error?: string }
          setUploadError(err.error ?? 'Erreur upload')
          break
        }
        const created = (await res.json()) as MediaFileItem
        setFiles((prev) => [created, ...prev])
      }
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleCreateFolder() {
    if (!newFolderName.trim()) return
    await createMediaFolderAction(newFolderName)
    setNewFolderName('')
    setShowFolderInput(false)
    await fetchFolder(activeFolderId)
  }

  function openFile(file: MediaFileItem) {
    if (mode === 'picker') {
      onSelect?.(file.url)
      return
    }
    setActiveFile(file)
    setAltValue(file.alt ?? '')
    setCaptionValue('')
  }

  function handleSaveMeta() {
    if (!activeFile) return
    startMetaTransition(async () => {
      await updateMediaFileMetaAction(activeFile.id, altValue, captionValue)
      setFiles((prev) =>
        prev.map((f) => (f.id === activeFile.id ? { ...f, alt: altValue || null } : f)),
      )
      setActiveFile((f) => (f ? { ...f, alt: altValue || null } : f))
    })
  }

  function handleDelete() {
    if (!activeFile) return
    if (!window.confirm('Supprimer ce fichier ? Action irréversible.')) return
    startDeleteTransition(async () => {
      await deleteMediaFileAction(activeFile.id)
      setFiles((prev) => prev.filter((f) => f.id !== activeFile.id))
      setActiveFile(null)
    })
  }

  async function handleDeleteFolder(folderId: string) {
    if (!window.confirm('Supprimer ce dossier ? Les fichiers seront déplacés à la racine.')) return
    await deleteMediaFolderAction(folderId)
    if (activeFolderId === folderId) {
      setActiveFolderId(null)
    }
    await fetchFolder(null)
  }

  const isPickerMode = mode === 'picker'

  return (
    <div
      style={{
        display: 'flex',
        height: isPickerMode ? 480 : 'calc(100vh - 160px)',
        minHeight: 360,
        gap: 0,
        background: '#0e0e14',
        border: '1px solid #1f1f2e',
        borderRadius: isPickerMode ? 10 : 0,
        overflow: 'hidden',
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: 200,
          flexShrink: 0,
          borderRight: '1px solid #1a1a24',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '10px 12px 8px',
            borderBottom: '1px solid #1a1a24',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#3e3e52',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Dossiers
          </span>
          {!isPickerMode && (
            <button
              type="button"
              onClick={() => setShowFolderInput((v) => !v)}
              title="Nouveau dossier"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#4a4a68',
                padding: 2,
                display: 'flex',
              }}
            >
              <FolderPlus size={14} strokeWidth={1.5} />
            </button>
          )}
        </div>

        {showFolderInput && (
          <div style={{ padding: '8px 12px', borderBottom: '1px solid #1a1a24' }}>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder()
              }}
              placeholder="Nom du dossier"
              style={{
                width: '100%',
                background: '#1e1e2e',
                border: '1px solid #2a2a3e',
                borderRadius: 4,
                padding: '4px 8px',
                fontSize: 12,
                color: '#e8e8f0',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
          <button
            type="button"
            onClick={() => handleFolderClick(null)}
            style={{
              width: '100%',
              padding: '6px 12px',
              background: activeFolderId === null ? '#1a1a2e' : 'none',
              border: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: 12,
              color: activeFolderId === null ? '#c8c8e0' : '#5a5a78',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <FolderOpen size={13} strokeWidth={1.5} />
            Tous les fichiers
          </button>
          {folders.map((f) => (
            <div
              key={f.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0 4px 0 12px',
                background: activeFolderId === f.id ? '#1a1a2e' : 'none',
              }}
            >
              <button
                type="button"
                onClick={() => handleFolderClick(f.id)}
                style={{
                  flex: 1,
                  padding: '6px 0',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: 12,
                  color: activeFolderId === f.id ? '#c8c8e0' : '#5a5a78',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <FolderOpen size={13} strokeWidth={1.5} />
                {f.name}
              </button>
              {!isPickerMode && (
                <button
                  type="button"
                  onClick={() => handleDeleteFolder(f.id)}
                  title="Supprimer le dossier"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#2a2a3e',
                    padding: '2px 4px',
                    display: 'flex',
                    flexShrink: 0,
                  }}
                >
                  <Trash2 size={11} strokeWidth={1.5} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Upload zone */}
        <div style={{ padding: 12, borderTop: '1px solid #1a1a24' }}>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.zip"
            onChange={handleUpload}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{
              width: '100%',
              height: 32,
              background: uploading ? '#1a1a26' : '#4353ff',
              border: 'none',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 500,
              color: uploading ? '#3e3e52' : '#fff',
              cursor: uploading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
            }}
          >
            <Upload size={13} strokeWidth={2} />
            {uploading ? 'Upload…' : 'Ajouter'}
          </button>
          {uploadError && (
            <p style={{ margin: '6px 0 0', fontSize: 11, color: '#ff6060' }}>{uploadError}</p>
          )}
        </div>
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {files.length === 0 ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}
          >
            <p style={{ fontSize: 13, color: '#3e3e52' }}>
              {uploading ? 'Upload en cours…' : 'Aucun fichier dans ce dossier.'}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: 10,
            }}
          >
            {files.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                selected={isPickerMode ? file.url === selectedUrl : activeFile?.id === file.id}
                onClick={() => openFile(file)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail panel (page mode only) */}
      {!isPickerMode && activeFile && (
        <div
          style={{
            width: 240,
            flexShrink: 0,
            borderLeft: '1px solid #1a1a24',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '10px 14px',
              borderBottom: '1px solid #1a1a24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 500, color: '#8a8aa8' }}>Détails</span>
            <button
              type="button"
              onClick={() => setActiveFile(null)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#4a4a68',
                padding: 2,
                display: 'flex',
              }}
            >
              <X size={14} strokeWidth={1.5} />
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
            {activeFile.mimeType.startsWith('image/') && (
              <div
                style={{
                  marginBottom: 12,
                  borderRadius: 6,
                  overflow: 'hidden',
                  background: '#0e0e14',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeFile.url}
                  alt={activeFile.alt ?? activeFile.filename}
                  style={{ width: '100%', display: 'block' }}
                />
              </div>
            )}

            <p
              style={{
                margin: '0 0 2px',
                fontSize: 11,
                fontWeight: 500,
                color: '#c8c8e0',
                wordBreak: 'break-all',
              }}
            >
              {activeFile.filename}
            </p>
            <p style={{ margin: '0 0 12px', fontSize: 11, color: '#3e3e52' }}>
              {formatBytes(activeFile.size)}
              {activeFile.width && activeFile.height
                ? ` · ${activeFile.width}×${activeFile.height}`
                : ''}
            </p>

            <div style={{ marginBottom: 10 }}>
              <label
                htmlFor="ml-alt"
                style={{ display: 'block', fontSize: 11, color: '#5a5a78', marginBottom: 4 }}
              >
                Texte alt
              </label>
              <input
                id="ml-alt"
                type="text"
                value={altValue}
                onChange={(e) => setAltValue(e.target.value)}
                style={{
                  width: '100%',
                  background: '#1e1e2e',
                  border: '1px solid #2a2a3e',
                  borderRadius: 4,
                  padding: '5px 8px',
                  fontSize: 12,
                  color: '#e8e8f0',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              type="button"
              onClick={handleSaveMeta}
              disabled={metaPending}
              style={{
                width: '100%',
                height: 28,
                background: '#1a1a3e',
                border: '1px solid #2a2a4e',
                borderRadius: 4,
                fontSize: 12,
                color: '#8090f0',
                cursor: metaPending ? 'not-allowed' : 'pointer',
                marginBottom: 8,
              }}
            >
              {metaPending ? 'Enregistrement…' : 'Enregistrer'}
            </button>

            <div
              style={{
                margin: '8px 0',
                padding: '8px 0',
                borderTop: '1px solid #1a1a24',
              }}
            >
              <p style={{ margin: '0 0 4px', fontSize: 10, color: '#3e3e52' }}>URL</p>
              <p
                style={{
                  margin: 0,
                  fontSize: 10,
                  color: '#5a5a78',
                  fontFamily: 'ui-monospace, monospace',
                  wordBreak: 'break-all',
                }}
              >
                {activeFile.url}
              </p>
            </div>
          </div>
          <div style={{ padding: 14, borderTop: '1px solid #1a1a24' }}>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deletePending}
              style={{
                width: '100%',
                height: 30,
                background: 'none',
                border: '1px solid #3e2020',
                borderRadius: 5,
                fontSize: 12,
                color: '#8a4040',
                cursor: deletePending ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
              }}
            >
              <Trash2 size={12} strokeWidth={1.5} />
              Supprimer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
