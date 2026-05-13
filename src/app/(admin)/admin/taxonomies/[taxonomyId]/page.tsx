import {
  createTermAction,
  deleteTaxonomyAction,
  togglePostTypeTaxonomyAction,
  updateTaxonomyAction,
} from '@/lib/actions/taxonomies'
import { prisma } from '@/lib/db/client'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import TaxonomyEditForm from './TaxonomyEditForm'
import TermManager from './TermManager'

interface Props {
  params: Promise<{ taxonomyId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { taxonomyId } = await params
  const tax = await prisma.taxonomy.findUnique({
    where: { id: taxonomyId },
    select: { name: true },
  })
  return { title: tax ? `${tax.name} — Taxonomie` : 'Taxonomie' }
}

export default function TaxonomyPage({ params }: Props) {
  return (
    <Suspense>
      <TaxonomyContent params={params} />
    </Suspense>
  )
}

async function TaxonomyContent({ params }: Props) {
  const { taxonomyId } = await params

  const [taxonomy, allPostTypes] = await Promise.all([
    prisma.taxonomy.findUnique({
      where: { id: taxonomyId },
      select: {
        id: true,
        name: true,
        slug: true,
        hierarchical: true,
        terms: {
          orderBy: [{ order: 'asc' }, { name: 'asc' }],
          select: {
            id: true,
            name: true,
            slug: true,
            parentId: true,
            order: true,
            _count: { select: { entries: true } },
          },
        },
        postTypes: { select: { postTypeId: true } },
      },
    }),
    prisma.postType.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
  ])

  if (!taxonomy) notFound()

  const attachedPostTypeIds = new Set(taxonomy.postTypes.map((pt) => pt.postTypeId))
  const createAction = createTermAction.bind(null, taxonomyId)
  const updateAction = updateTaxonomyAction.bind(null, taxonomyId)
  const deleteAction = deleteTaxonomyAction.bind(null, taxonomyId)

  return (
    <div style={{ padding: 32, maxWidth: 860 }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <Link
          href="/admin/taxonomies"
          style={{ fontSize: 13, color: '#52525b', textDecoration: 'none' }}
        >
          Taxonomies
        </Link>
        <span style={{ fontSize: 13, color: '#2e2e42' }}>/</span>
        <span style={{ fontSize: 13, color: '#f4f4f5' }}>{taxonomy.name}</span>
      </div>

      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'start' }}
      >
        {/* Terms manager */}
        <div>
          <h1
            style={{
              margin: '0 0 20px',
              fontSize: 18,
              fontWeight: 600,
              color: '#f4f4f5',
              letterSpacing: '-0.01em',
            }}
          >
            {taxonomy.name}
          </h1>
          <TermManager
            taxonomyId={taxonomyId}
            hierarchical={taxonomy.hierarchical}
            terms={taxonomy.terms}
            createAction={createAction}
          />
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Settings */}
          <div
            style={{
              background: '#111113',
              border: '1px solid #1f1f2e',
              borderRadius: 10,
              padding: 16,
            }}
          >
            <p
              style={{
                margin: '0 0 12px',
                fontSize: 11,
                fontWeight: 600,
                color: '#3e3e52',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Paramètres
            </p>
            <TaxonomyEditForm
              taxonomy={{
                id: taxonomy.id,
                name: taxonomy.name,
                slug: taxonomy.slug,
                hierarchical: taxonomy.hierarchical,
              }}
              updateAction={updateAction}
              deleteAction={deleteAction}
            />
          </div>

          {/* Post type associations */}
          {allPostTypes.length > 0 && (
            <div
              style={{
                background: '#111113',
                border: '1px solid #1f1f2e',
                borderRadius: 10,
                padding: 16,
              }}
            >
              <p
                style={{
                  margin: '0 0 12px',
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#3e3e52',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Post Types
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {allPostTypes.map((pt) => {
                  const attached = attachedPostTypeIds.has(pt.id)
                  return (
                    <form
                      key={pt.id}
                      action={togglePostTypeTaxonomyAction.bind(null, pt.id, taxonomyId, attached)}
                    >
                      <button
                        type="submit"
                        style={{
                          width: '100%',
                          height: 30,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0 8px',
                          background: attached ? 'rgba(37,99,235,0.1)' : '#1a1a26',
                          border: `1px solid ${attached ? '#1d4ed8' : '#27272a'}`,
                          borderRadius: 5,
                          fontSize: 12,
                          color: attached ? '#60a5fa' : '#71717a',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <span>{pt.name}</span>
                        <span>{attached ? '✓' : '+'}</span>
                      </button>
                    </form>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
