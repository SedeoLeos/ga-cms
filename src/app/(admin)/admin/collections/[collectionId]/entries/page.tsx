import EntriesList from '@/components/admin/collections/EntriesList'
import type { EntryRow } from '@/components/admin/collections/EntriesList'
import type { SchemaField } from '@/lib/actions/collections'
import { createEntryAndRedirect } from '@/lib/actions/entries'
import { prisma } from '@/lib/db/client'
import { Plus } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

interface Props {
  params: Promise<{ collectionId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collectionId } = await params
  const col = await prisma.collection.findUnique({
    where: { id: collectionId },
    select: { name: true },
  })
  return { title: col ? `${col.name} — Entrées` : 'Entrées' }
}

export default function EntriesPage({ params }: Props) {
  return (
    <Suspense>
      <EntriesContent params={params} />
    </Suspense>
  )
}

async function EntriesContent({ params }: Props) {
  const { collectionId } = await params

  const collection = await prisma.collection.findUnique({
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
      site: {
        select: {
          locales: true,
          defaultLocale: true,
        },
      },
    },
  })

  if (!collection) notFound()

  const schema = collection.schema as unknown as SchemaField[]
  const siteLocales = collection.site.locales as string[]
  const firstTextField = schema.find((f) => f.type === 'text')
  const defaultLocale = collection.site.defaultLocale

  const rows: EntryRow[] = collection.entries.map((e, i) => {
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

  const createAction = createEntryAndRedirect.bind(null, collectionId, defaultLocale)

  return (
    <div style={{ padding: 32, maxWidth: 900 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <Link
          href="/admin/collections"
          style={{ fontSize: 13, color: '#4a4a68', textDecoration: 'none' }}
        >
          Collections
        </Link>
        <span style={{ fontSize: 13, color: '#2e2e42' }}>/</span>
        <Link
          href={`/admin/collections/${collectionId}`}
          style={{ fontSize: 13, color: '#4a4a68', textDecoration: 'none' }}
        >
          {collection.name}
        </Link>
        <span style={{ fontSize: 13, color: '#2e2e42' }}>/</span>
        <span style={{ fontSize: 13, color: '#e8e8f0' }}>Entrées</span>
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
              color: '#e8e8f0',
              letterSpacing: '-0.01em',
            }}
          >
            {collection.name}
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#5a5a78' }}>
            {rows.length} entrée{rows.length !== 1 ? 's' : ''}
          </p>
        </div>
        <form action={createAction}>
          <button
            type="submit"
            style={{
              height: 32,
              padding: '0 14px',
              background: '#4353ff',
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

      <EntriesList entries={rows} showLocale={siteLocales.length > 1} />
    </div>
  )
}
