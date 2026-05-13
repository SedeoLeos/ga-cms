import { createTaxonomyAction } from '@/lib/actions/taxonomies'
import { prisma } from '@/lib/db/client'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import TaxonomyCreateForm from './TaxonomyCreateForm'

export const metadata: Metadata = { title: 'Taxonomies' }

export default function TaxonomiesPage() {
  return (
    <Suspense>
      <TaxonomiesContent />
    </Suspense>
  )
}

async function TaxonomiesContent() {
  const taxonomies = await prisma.taxonomy.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      hierarchical: true,
      _count: { select: { terms: true } },
      postTypes: { select: { postType: { select: { name: true } } } },
    },
  })

  return (
    <div style={{ padding: 32, maxWidth: 820 }}>
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
            Taxonomies
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#5a5a78' }}>
            {taxonomies.length} taxonomie{taxonomies.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Create form */}
      <TaxonomyCreateForm action={createTaxonomyAction} />

      {/* List */}
      {taxonomies.length > 0 && (
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 80px 120px 56px',
              padding: '6px 12px',
              fontSize: 11,
              fontWeight: 600,
              color: '#3e3e52',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            <span>Nom</span>
            <span>Termes</span>
            <span>Post Types</span>
            <span />
          </div>
          {taxonomies.map((tax) => (
            <Link
              key={tax.id}
              href={`/admin/taxonomies/${tax.id}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 80px 120px 56px',
                alignItems: 'center',
                padding: '10px 12px',
                background: '#13131c',
                border: '1px solid #1f1f2e',
                borderRadius: 8,
                textDecoration: 'none',
              }}
            >
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: '#e8e8f0' }}>
                  {tax.name}
                </p>
                <p
                  style={{
                    margin: '1px 0 0',
                    fontSize: 11,
                    color: '#4a4a68',
                    fontFamily: 'ui-monospace, monospace',
                  }}
                >
                  /{tax.slug}
                  {tax.hierarchical && (
                    <span style={{ marginLeft: 6, color: '#3e3e52' }}>hiérarchique</span>
                  )}
                </p>
              </div>
              <span style={{ fontSize: 13, color: '#5a5a78' }}>{tax._count.terms}</span>
              <span style={{ fontSize: 12, color: '#4a4a68' }}>
                {tax.postTypes.map((pt) => pt.postType.name).join(', ') || '—'}
              </span>
              <span style={{ fontSize: 12, color: '#4353ff' }}>Gérer →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
