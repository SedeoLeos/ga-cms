import EntriesList from '@/components/admin/collections/EntriesList'
import type { EntryRow } from '@/components/admin/collections/EntriesList'
import AdminSearchBar from '@/components/admin/shared/AdminSearchBar'
import type { SchemaField } from '@/lib/actions/collections'
import { createEntryAndRedirect } from '@/lib/actions/entries'
import { prisma } from '@/lib/db/client'
import { getSettings } from '@/lib/settings'
import { Plus } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

interface Props {
  params: Promise<{ collectionId: string }>
  searchParams: Promise<{ search?: string; status?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collectionId } = await params
  const col = await prisma.collection.findUnique({
    where: { id: collectionId },
    select: { name: true },
  })
  return { title: col ? `${col.name} — Entrées` : 'Entrées' }
}

export default function EntriesPage({ params, searchParams }: Props) {
  return (
    <Suspense>
      <EntriesContent params={params} searchParams={searchParams} />
    </Suspense>
  )
}

async function EntriesContent({ params, searchParams }: Props) {
  const { collectionId } = await params
  const { search, status } = await searchParams

  const [collection, settings] = await Promise.all([
    prisma.collection.findUnique({
      where: { id: collectionId },
      select: {
        id: true,
        name: true,
        slug: true,
        schema: true,
        entries: {
          orderBy: { updatedAt: 'desc' },
          select: {
            id: true,
            locale: true,
            status: true,
            data: true,
            updatedAt: true,
          },
        },
      },
    }),
    getSettings(),
  ])

  if (!collection) notFound()

  const schema = collection.schema as unknown as SchemaField[]
  const firstTextField = schema.find((f) => f.type === 'text')
  const defaultLocale = settings.defaultLocale

  const searchLower = search?.toLowerCase()

  let allRows: EntryRow[] = collection.entries.map((e, i) => {
    const data = e.data as Record<string, unknown>
    const label =
      firstTextField && typeof data[firstTextField.key] === 'string' && data[firstTextField.key]
        ? (data[firstTextField.key] as string)
        : `Entrée #${i + 1}`
    return {
      id: e.id,
      collectionId,
      label,
      locale: e.locale,
      status: e.status,
      updatedAt: e.updatedAt.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    }
  })

  if (searchLower) allRows = allRows.filter((r) => r.label.toLowerCase().includes(searchLower))
  if (status) allRows = allRows.filter((r) => r.status === status)

  const rows = allRows
  const createAction = createEntryAndRedirect.bind(null, collectionId, defaultLocale)

  return (
    <div style={{ padding: 32, maxWidth: 900 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <Link
          href="/admin/collections"
          style={{ fontSize: 13, color: '#52525b', textDecoration: 'none' }}
        >
          Collections
        </Link>
        <span style={{ fontSize: 13, color: '#2e2e42' }}>/</span>
        <Link
          href={`/admin/collections/${collectionId}`}
          style={{ fontSize: 13, color: '#52525b', textDecoration: 'none' }}
        >
          {collection.name}
        </Link>
        <span style={{ fontSize: 13, color: '#2e2e42' }}>/</span>
        <span style={{ fontSize: 13, color: '#f4f4f5' }}>Entrées</span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 600,
              color: '#f4f4f5',
              letterSpacing: '-0.01em',
            }}
          >
            {collection.name}
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#71717a' }}>
            {rows.length} entrée{rows.length !== 1 ? 's' : ''}
            {search ? ` pour "${search}"` : ''}
          </p>
        </div>
        <form action={createAction}>
          <button
            type="submit"
            style={{
              height: 32,
              padding: '0 14px',
              background: '#2563eb',
              border: 'none',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 500,
              color: '#fff',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Plus size={14} strokeWidth={2} />
            Nouvelle entrée
          </button>
        </form>
      </div>

      <div style={{ marginBottom: 16 }}>
        <AdminSearchBar placeholder="Rechercher une entrée…" showStatusFilter />
      </div>

      <EntriesList entries={rows} showLocale={settings.locales.length > 1} />
    </div>
  )
}
