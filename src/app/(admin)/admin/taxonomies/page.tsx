import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AdminPageHeader
        title="Taxonomies"
        subtitle={`${taxonomies.length} taxonomie${taxonomies.length !== 1 ? 's' : ''}`}
      />
      <div style={{ padding: '20px 28px', maxWidth: 820 }}>
        <TaxonomyCreateForm action={createTaxonomyAction} />

        {taxonomies.length > 0 && (
          <div
            style={{
              marginTop: 20,
              background: '#111113',
              border: '1px solid #27272a',
              borderRadius: 10,
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 80px 140px 64px',
                padding: '0 16px',
                height: 34,
                alignItems: 'center',
                borderBottom: '1px solid #27272a',
                background: '#0f0f11',
              }}
            >
              {['Nom', 'Termes', 'Post Types', ''].map((h) => (
                <span
                  key={h}
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: '#3f3f46',
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                  }}
                >
                  {h}
                </span>
              ))}
            </div>
            {taxonomies.map((tax) => (
              <Link
                key={tax.id}
                href={`/admin/taxonomies/${tax.id}`}
                className="wf-table-row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 80px 140px 64px',
                  alignItems: 'center',
                  padding: '0 16px',
                  height: 42,
                  borderBottom: '1px solid #1c1c1f',
                  textDecoration: 'none',
                }}
              >
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: '#e4e4e7' }}>
                    {tax.name}
                  </p>
                  <p
                    style={{
                      margin: '1px 0 0',
                      fontSize: 11,
                      color: '#3f3f46',
                      fontFamily: 'ui-monospace, monospace',
                    }}
                  >
                    /{tax.slug}
                    {tax.hierarchical && (
                      <span style={{ marginLeft: 6, color: '#3f3f46' }}>hiérarchique</span>
                    )}
                  </p>
                </div>
                <span style={{ fontSize: 12, color: '#52525b' }}>{tax._count.terms}</span>
                <span style={{ fontSize: 12, color: '#3f3f46' }}>
                  {tax.postTypes.map((pt) => pt.postType.name).join(', ') || '—'}
                </span>
                <span style={{ fontSize: 12, color: '#2563eb' }}>Gérer →</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
