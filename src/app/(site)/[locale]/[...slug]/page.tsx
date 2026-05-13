import { prisma } from '@/lib/db/client'
import { PuckRenderer } from '@/lib/puck/render'
import { resolveSite } from '@/lib/site/resolver'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface SchemaField {
  id: string
  type:
    | 'text'
    | 'textarea'
    | 'richtext'
    | 'number'
    | 'boolean'
    | 'date'
    | 'select'
    | 'media'
    | 'relation'
  name: string
  key: string
  required: boolean
  options?: string[]
  multiple?: boolean
}

type TermEntry = {
  id: string
  title: string
  slug: string
  publishedAt: Date | null
  readingTime: number | null
  data: unknown
  postType: { slug: string; name: string }
}

type ContentData =
  | {
      type: 'page'
      page: {
        id: string
        title: string
        metaTitle: string | null
        metaDesc: string | null
        ogImage: string | null
        robots: string | null
        canonicalUrl: string | null
        publishedJson: unknown
      }
    }
  | {
      type: 'archive'
      postType: {
        id: string
        name: string
        slug: string
        description: string | null
        schema: unknown
      }
      entries: {
        id: string
        title: string
        slug: string
        publishedAt: Date | null
        readingTime: number | null
        data: unknown
      }[]
      total: number
      currentPage: number
    }
  | {
      type: 'post'
      postType: { id: string; name: string; slug: string; schema: unknown }
      entry: {
        id: string
        title: string
        slug: string
        publishedAt: Date | null
        readingTime: number | null
        data: unknown
        terms: {
          term: { id: string; name: string; slug: string; taxonomy: { name: string; slug: string } }
        }[]
      }
    }
  | {
      type: 'term'
      taxonomy: { id: string; name: string; slug: string }
      term: { id: string; name: string; slug: string }
      entries: TermEntry[]
      total: number
      currentPage: number
    }

interface Props {
  params: Promise<{ locale: string; slug: string[] }>
  searchParams: Promise<{ page?: string }>
}

const PER_PAGE = 12

// ─── Content resolution ───────────────────────────────────────────────────────

async function resolveContent(
  locale: string,
  slugParts: string[],
  pageNum: number,
): Promise<ContentData | null> {
  const slug = slugParts.join('/')

  // 1. Published page
  const page = await prisma.page.findFirst({
    where: { slug, locale, status: 'PUBLISHED' },
    select: {
      id: true,
      title: true,
      metaTitle: true,
      metaDesc: true,
      ogImage: true,
      robots: true,
      canonicalUrl: true,
      publishedJson: true,
    },
  })
  if (page) return { type: 'page', page }

  // 2. Post-type archive (single segment)
  if (slugParts.length === 1) {
    const postType = await prisma.postType.findFirst({
      where: { slug: slugParts[0], hasArchive: true },
      select: { id: true, name: true, slug: true, description: true, schema: true },
    })
    if (postType) {
      const skip = (pageNum - 1) * PER_PAGE
      const [entries, total] = await Promise.all([
        prisma.postEntry.findMany({
          where: { postTypeId: postType.id, locale, status: 'PUBLISHED' },
          orderBy: { publishedAt: 'desc' },
          skip,
          take: PER_PAGE,
          select: {
            id: true,
            title: true,
            slug: true,
            publishedAt: true,
            readingTime: true,
            data: true,
          },
        }),
        prisma.postEntry.count({ where: { postTypeId: postType.id, locale, status: 'PUBLISHED' } }),
      ])
      return { type: 'archive', postType, entries, total, currentPage: pageNum }
    }
  }

  // 3. Single post (two segments: postTypeSlug/postSlug)
  if (slugParts.length === 2) {
    const postType = await prisma.postType.findFirst({
      where: { slug: slugParts[0] },
      select: { id: true, name: true, slug: true, schema: true },
    })
    if (postType) {
      const entry = await prisma.postEntry.findFirst({
        where: { postTypeId: postType.id, slug: slugParts[1], locale, status: 'PUBLISHED' },
        select: {
          id: true,
          title: true,
          slug: true,
          publishedAt: true,
          readingTime: true,
          data: true,
          terms: {
            select: {
              term: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  taxonomy: { select: { name: true, slug: true } },
                },
              },
            },
          },
        },
      })
      if (entry) return { type: 'post', entry, postType }
    }
  }

  // 4. Taxonomy term archive (two segments: taxonomySlug/termSlug)
  if (slugParts.length === 2) {
    const taxonomy = await prisma.taxonomy.findFirst({
      where: { slug: slugParts[0] },
      select: { id: true, name: true, slug: true },
    })
    if (taxonomy) {
      const term = await prisma.term.findFirst({
        where: { taxonomyId: taxonomy.id, slug: slugParts[1] },
        select: { id: true, name: true, slug: true },
      })
      if (term) {
        const skip = (pageNum - 1) * PER_PAGE
        const [entries, total] = await Promise.all([
          prisma.postEntry.findMany({
            where: {
              status: 'PUBLISHED',
              locale,
              terms: { some: { termId: term.id } },
            },
            orderBy: { publishedAt: 'desc' },
            skip,
            take: PER_PAGE,
            select: {
              id: true,
              title: true,
              slug: true,
              publishedAt: true,
              readingTime: true,
              data: true,
              postType: { select: { slug: true, name: true } },
            },
          }),
          prisma.postEntry.count({
            where: { status: 'PUBLISHED', locale, terms: { some: { termId: term.id } } },
          }),
        ])
        return { type: 'term', taxonomy, term, entries, total, currentPage: pageNum }
      }
    }
  }

  return null
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const { page: pageStr } = await searchParams
  const pageNum = Math.max(1, Number(pageStr ?? 1))
  const site = await resolveSite()
  const content = await resolveContent(locale, slug, pageNum)

  if (!content) return { title: site.name }

  if (content.type === 'page') {
    const { page } = content
    return {
      title: page.metaTitle ?? `${page.title} — ${site.name}`,
      description: page.metaDesc ?? undefined,
      robots: page.robots ?? undefined,
      openGraph: page.ogImage
        ? { images: [{ url: page.ogImage }], title: page.metaTitle ?? page.title }
        : undefined,
      alternates: page.canonicalUrl ? { canonical: page.canonicalUrl } : undefined,
    }
  }

  if (content.type === 'archive') {
    return {
      title: `${content.postType.name} — ${site.name}`,
      description: content.postType.description ?? undefined,
    }
  }

  if (content.type === 'term') {
    return {
      title: `${content.term.name} — ${content.taxonomy.name} — ${site.name}`,
    }
  }

  return { title: `${content.entry.title} — ${site.name}` }
}

// ─── Page shell ───────────────────────────────────────────────────────────────

export default function SitePage({ params, searchParams }: Props) {
  return (
    <Suspense>
      <SiteContent params={params} searchParams={searchParams} />
    </Suspense>
  )
}

async function SiteContent({ params, searchParams }: Props) {
  const { locale, slug } = await params
  const { page: pageStr } = await searchParams
  const pageNum = Math.max(1, Number(pageStr ?? 1))

  const content = await resolveContent(locale, slug, pageNum)
  if (!content) notFound()

  const tokenLink = <link rel="stylesheet" href="/api/tokens" />

  if (content.type === 'page') {
    return content.page.publishedJson ? (
      <PuckRenderer data={content.page.publishedJson} />
    ) : (
      <EmptyPage title={content.page.title} />
    )
  }

  if (content.type === 'archive') {
    return (
      <>
        {tokenLink}
        <ArchiveView content={content} locale={locale} />
      </>
    )
  }

  if (content.type === 'term') {
    return (
      <>
        {tokenLink}
        <TermArchiveView content={content} locale={locale} />
      </>
    )
  }

  return (
    <>
      {tokenLink}
      <SinglePostView content={content} locale={locale} />
    </>
  )
}

// ─── Archive view ─────────────────────────────────────────────────────────────

type ArchiveContent = Extract<ContentData, { type: 'archive' }>

function getExcerpt(schema: SchemaField[], data: Record<string, unknown>): string {
  for (const field of schema) {
    if (['text', 'textarea', 'richtext'].includes(field.type)) {
      const val = data[field.key]
      if (typeof val === 'string' && val.trim()) {
        const text = val.replace(/<[^>]+>/g, '').trim()
        return text.length > 160 ? `${text.slice(0, 157)}…` : text
      }
    }
  }
  return ''
}

function ArchiveView({ content, locale }: { content: ArchiveContent; locale: string }) {
  const { postType, entries, total, currentPage } = content
  const schema = (postType.schema as SchemaField[]) ?? []
  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div
      style={{
        minHeight: '100vh',
        fontFamily: 'system-ui, sans-serif',
        background: '#fff',
        color: '#111',
      }}
    >
      {/* Header */}
      <header
        style={{
          borderBottom: '1px solid #e5e7eb',
          padding: '48px 24px 36px',
          textAlign: 'center',
        }}
      >
        <h1 style={{ margin: '0 0 8px', fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em' }}>
          {postType.name}
        </h1>
        {postType.description && (
          <p
            style={{
              margin: 0,
              fontSize: 16,
              color: '#6b7280',
              maxWidth: 480,
              marginInline: 'auto',
            }}
          >
            {postType.description}
          </p>
        )}
        <p style={{ margin: '12px 0 0', fontSize: 13, color: '#9ca3af' }}>
          {total} article{total !== 1 ? 's' : ''}
        </p>
      </header>

      {/* Entry grid */}
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px' }}>
        {entries.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
            Aucun article pour l'instant.
          </p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 24,
            }}
          >
            {entries.map((entry) => {
              const excerpt = getExcerpt(schema, (entry.data as Record<string, unknown>) ?? {})
              const href = `/${locale}/${postType.slug}/${entry.slug}`
              return (
                <a
                  key={entry.id}
                  href={href}
                  style={{
                    display: 'block',
                    padding: '20px 22px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 10,
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                >
                  <h2
                    style={{
                      margin: '0 0 8px',
                      fontSize: 17,
                      fontWeight: 600,
                      lineHeight: 1.3,
                      color: '#111827',
                    }}
                  >
                    {entry.title}
                  </h2>
                  {excerpt && (
                    <p
                      style={{
                        margin: '0 0 12px',
                        fontSize: 14,
                        color: '#6b7280',
                        lineHeight: 1.6,
                      }}
                    >
                      {excerpt}
                    </p>
                  )}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 12,
                      color: '#9ca3af',
                    }}
                  >
                    {entry.publishedAt && (
                      <time dateTime={entry.publishedAt.toISOString()}>
                        {entry.publishedAt.toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </time>
                    )}
                    {entry.readingTime && (
                      <>
                        <span>·</span>
                        <span>{entry.readingTime} min</span>
                      </>
                    )}
                  </div>
                </a>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 8,
              marginTop: 48,
            }}
          >
            {currentPage > 1 && (
              <a
                href={`/${locale}/${postType.slug}?page=${currentPage - 1}`}
                style={paginationBtn(false)}
              >
                ← Précédent
              </a>
            )}
            <span style={{ fontSize: 13, color: '#6b7280' }}>
              {currentPage} / {totalPages}
            </span>
            {currentPage < totalPages && (
              <a
                href={`/${locale}/${postType.slug}?page=${currentPage + 1}`}
                style={paginationBtn(false)}
              >
                Suivant →
              </a>
            )}
          </nav>
        )}
      </main>
    </div>
  )
}

// ─── Term archive view ────────────────────────────────────────────────────────

type TermContent = Extract<ContentData, { type: 'term' }>

function TermArchiveView({ content, locale }: { content: TermContent; locale: string }) {
  const { taxonomy, term, entries, total, currentPage } = content
  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div
      style={{
        minHeight: '100vh',
        fontFamily: 'system-ui, sans-serif',
        background: '#fff',
        color: '#111',
      }}
    >
      <header
        style={{
          borderBottom: '1px solid #e5e7eb',
          padding: '48px 24px 36px',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            margin: '0 0 8px',
            fontSize: 12,
            color: '#9ca3af',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 600,
          }}
        >
          {taxonomy.name}
        </p>
        <h1 style={{ margin: '0 0 4px', fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em' }}>
          {term.name}
        </h1>
        <p style={{ margin: '12px 0 0', fontSize: 13, color: '#9ca3af' }}>
          {total} article{total !== 1 ? 's' : ''}
        </p>
      </header>

      <main style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px' }}>
        {entries.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
            Aucun article pour l'instant.
          </p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 24,
            }}
          >
            {entries.map((entry) => {
              const href = `/${locale}/${entry.postType.slug}/${entry.slug}`
              return (
                <a
                  key={entry.id}
                  href={href}
                  style={{
                    display: 'block',
                    padding: '20px 22px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 10,
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <p
                    style={{
                      margin: '0 0 6px',
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#9ca3af',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {entry.postType.name}
                  </p>
                  <h2
                    style={{
                      margin: '0 0 12px',
                      fontSize: 17,
                      fontWeight: 600,
                      lineHeight: 1.3,
                      color: '#111827',
                    }}
                  >
                    {entry.title}
                  </h2>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 12,
                      color: '#9ca3af',
                    }}
                  >
                    {entry.publishedAt && (
                      <time dateTime={entry.publishedAt.toISOString()}>
                        {entry.publishedAt.toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </time>
                    )}
                    {entry.readingTime && (
                      <>
                        <span>·</span>
                        <span>{entry.readingTime} min</span>
                      </>
                    )}
                  </div>
                </a>
              )
            })}
          </div>
        )}

        {totalPages > 1 && (
          <nav
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 8,
              marginTop: 48,
            }}
          >
            {currentPage > 1 && (
              <a
                href={`/${locale}/${taxonomy.slug}/${term.slug}?page=${currentPage - 1}`}
                style={paginationBtn(false)}
              >
                ← Précédent
              </a>
            )}
            <span style={{ fontSize: 13, color: '#6b7280' }}>
              {currentPage} / {totalPages}
            </span>
            {currentPage < totalPages && (
              <a
                href={`/${locale}/${taxonomy.slug}/${term.slug}?page=${currentPage + 1}`}
                style={paginationBtn(false)}
              >
                Suivant →
              </a>
            )}
          </nav>
        )}
      </main>
    </div>
  )
}

// ─── Single post view ─────────────────────────────────────────────────────────

type PostContent = Extract<ContentData, { type: 'post' }>

function SinglePostView({ content, locale }: { content: PostContent; locale: string }) {
  const { entry, postType } = content
  const schema = (postType.schema as SchemaField[]) ?? []
  const data = (entry.data as Record<string, unknown>) ?? {}

  const termsByTaxonomy = entry.terms.reduce<Record<string, (typeof entry.terms)[0]['term'][]>>(
    (acc, { term }) => {
      const key = term.taxonomy.name
      if (!acc[key]) acc[key] = []
      acc[key].push(term)
      return acc
    },
    {},
  )

  return (
    <div
      style={{
        minHeight: '100vh',
        fontFamily: 'system-ui, sans-serif',
        background: '#fff',
        color: '#111827',
      }}
    >
      <article style={{ maxWidth: 720, margin: '0 auto', padding: '60px 24px 80px' }}>
        {/* Breadcrumb */}
        <nav style={{ marginBottom: 24 }}>
          <a
            href={`/${locale}/${postType.slug}`}
            style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none' }}
          >
            ← {postType.name}
          </a>
        </nav>

        {/* Title */}
        <h1
          style={{
            margin: '0 0 16px',
            fontSize: 38,
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            color: '#111827',
          }}
        >
          {entry.title}
        </h1>

        {/* Meta */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 8,
            marginBottom: 40,
            paddingBottom: 32,
            borderBottom: '1px solid #f3f4f6',
          }}
        >
          {entry.publishedAt && (
            <time
              dateTime={entry.publishedAt.toISOString()}
              style={{ fontSize: 13, color: '#6b7280' }}
            >
              {entry.publishedAt.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </time>
          )}
          {entry.readingTime && (
            <>
              <span style={{ color: '#d1d5db' }}>·</span>
              <span style={{ fontSize: 13, color: '#6b7280' }}>
                {entry.readingTime} min de lecture
              </span>
            </>
          )}
          {Object.entries(termsByTaxonomy).map(([taxName, terms]) => (
            <div key={taxName} style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {terms.map((term) => (
                <span
                  key={term.id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    height: 22,
                    padding: '0 8px',
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 500,
                    background: '#f3f4f6',
                    color: '#374151',
                  }}
                >
                  {term.name}
                </span>
              ))}
            </div>
          ))}
        </div>

        {/* Fields */}
        <div>
          {schema.map((field) => {
            const value = data[field.key]
            if (value === null || value === undefined || value === '') return null
            return (
              <div key={field.id} style={{ marginBottom: 28 }}>
                {field.type !== 'richtext' &&
                  field.type !== 'text' &&
                  field.type !== 'textarea' && (
                    <p
                      style={{
                        margin: '0 0 4px',
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#9ca3af',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {field.name}
                    </p>
                  )}
                <FieldRenderer field={field} value={value} />
              </div>
            )
          })}
        </div>
      </article>
    </div>
  )
}

// ─── Field renderer ───────────────────────────────────────────────────────────

const RICHTEXT_STYLE: React.CSSProperties = { fontSize: 17, lineHeight: 1.75, color: '#374151' }

function FieldRenderer({ field, value }: { field: SchemaField; value: unknown }) {
  switch (field.type) {
    case 'richtext':
      // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted CMS content
      return <div dangerouslySetInnerHTML={{ __html: value as string }} style={RICHTEXT_STYLE} />

    case 'text':
      return (
        <p style={{ margin: 0, fontSize: 17, lineHeight: 1.7, color: '#374151' }}>
          {value as string}
        </p>
      )

    case 'textarea':
      return (
        <p
          style={{
            margin: 0,
            fontSize: 15,
            lineHeight: 1.7,
            color: '#374151',
            whiteSpace: 'pre-wrap',
          }}
        >
          {value as string}
        </p>
      )

    case 'media': {
      const src = value as string
      if (!src) return null
      return (
        <figure style={{ margin: 0 }}>
          <img
            src={src}
            alt={field.name}
            style={{ maxWidth: '100%', borderRadius: 8, display: 'block' }}
          />
        </figure>
      )
    }

    case 'number':
      return <p style={{ margin: 0, fontSize: 15, color: '#374151' }}>{String(value)}</p>

    case 'boolean':
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            height: 22,
            padding: '0 8px',
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 500,
            background: value ? '#f0fdf4' : '#f9fafb',
            color: value ? '#16a34a' : '#6b7280',
          }}
        >
          {value ? 'Oui' : 'Non'}
        </span>
      )

    case 'date':
      return (
        <time style={{ fontSize: 14, color: '#374151' }}>
          {new Date(value as string).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}
        </time>
      )

    case 'select': {
      const display = Array.isArray(value) ? (value as string[]).join(', ') : (value as string)
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            height: 22,
            padding: '0 8px',
            borderRadius: 4,
            fontSize: 12,
            background: '#f3f4f6',
            color: '#374151',
          }}
        >
          {display}
        </span>
      )
    }

    default:
      return null
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function EmptyPage({ title }: { title: string }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
        color: '#888',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 32, fontWeight: 300, marginBottom: 8 }}>{title}</h1>
        <p style={{ fontSize: 14, color: '#aaa' }}>Contenu en cours de création.</p>
      </div>
    </div>
  )
}

function paginationBtn(active: boolean): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    height: 34,
    padding: '0 16px',
    borderRadius: 6,
    border: '1px solid #e5e7eb',
    background: active ? '#111827' : '#fff',
    color: active ? '#fff' : '#374151',
    fontSize: 13,
    fontWeight: 500,
    textDecoration: 'none',
    cursor: 'pointer',
  }
}
