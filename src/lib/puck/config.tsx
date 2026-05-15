import { DropZone } from '@measured/puck'
import type { Config } from '@measured/puck'

// ─── Shared styles ────────────────────────────────────────────────────────────

const FONT_SIZES: { value: string; label: string }[] = [
  { value: '13px', label: 'XS' },
  { value: '15px', label: 'S' },
  { value: '17px', label: 'M' },
  { value: '20px', label: 'L' },
  { value: '24px', label: 'XL' },
  { value: '32px', label: '2XL' },
]

const ALIGN_OPTIONS = [
  { value: 'left', label: 'Gauche' },
  { value: 'center', label: 'Centre' },
  { value: 'right', label: 'Droite' },
]

const PADDING_OPTIONS = [
  { value: '0px', label: 'Aucun' },
  { value: '20px 16px', label: 'S' },
  { value: '40px 20px', label: 'M' },
  { value: '64px 20px', label: 'L' },
  { value: '96px 20px', label: 'XL' },
]

// Accent cohérent avec l'admin (#2563eb / blue-600)
const ACCENT = '#2563eb'

// ─── Config ───────────────────────────────────────────────────────────────────

export const puckConfig: Config = {
  categories: {
    Structure: { components: ['Section', 'Container', 'Columns2', 'Columns3'] },
    Contenu: { components: ['Heading', 'Paragraph', 'Image', 'Button', 'Divider'] },
    Sections: { components: ['Hero', 'Features'] },
    Médias: { components: ['Video'] },
  },

  components: {
    // ── Layout ──────────────────────────────────────────────────────────────

    Section: {
      label: 'Section',
      fields: {
        background: { type: 'text', label: 'Couleur de fond' },
        padding: {
          type: 'select',
          label: 'Espacement vertical',
          options: PADDING_OPTIONS,
        },
      },
      defaultProps: { background: '', padding: '64px 20px' },
      render: ({ background, padding }) => (
        <section style={{ background: background || undefined, padding }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <DropZone zone="content" />
          </div>
        </section>
      ),
    },

    Container: {
      label: 'Conteneur',
      fields: {
        maxWidth: {
          type: 'select',
          label: 'Largeur max',
          options: [
            { value: '640px', label: 'Narrow (640)' },
            { value: '768px', label: 'Small (768)' },
            { value: '1024px', label: 'Medium (1024)' },
            { value: '1200px', label: 'Large (1200)' },
            { value: '100%', label: 'Pleine largeur' },
          ],
        },
        padding: {
          type: 'select',
          label: 'Espacement',
          options: PADDING_OPTIONS,
        },
        background: { type: 'text', label: 'Couleur de fond' },
      },
      defaultProps: { maxWidth: '1200px', padding: '40px 20px', background: '' },
      render: ({ maxWidth, padding, background }) => (
        <div style={{ background: background || undefined, padding }}>
          <div style={{ maxWidth, margin: '0 auto' }}>
            <DropZone zone="content" />
          </div>
        </div>
      ),
    },

    Columns2: {
      label: '2 Colonnes',
      fields: {
        gap: {
          type: 'select',
          label: 'Écart',
          options: [
            { value: '12px', label: 'S' },
            { value: '24px', label: 'M' },
            { value: '40px', label: 'L' },
          ],
        },
        stackMobile: {
          type: 'radio',
          label: 'Empiler sur mobile',
          options: [
            { value: 'true', label: 'Oui' },
            { value: 'false', label: 'Non' },
          ],
        },
      },
      defaultProps: { gap: '24px', stackMobile: 'true' },
      render: ({ gap }) => (
        <div style={{ display: 'flex', gap, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 280px', minWidth: 0 }}>
            <DropZone zone="col-1" />
          </div>
          <div style={{ flex: '1 1 280px', minWidth: 0 }}>
            <DropZone zone="col-2" />
          </div>
        </div>
      ),
    },

    Columns3: {
      label: '3 Colonnes',
      fields: {
        gap: {
          type: 'select',
          label: 'Écart',
          options: [
            { value: '12px', label: 'S' },
            { value: '24px', label: 'M' },
            { value: '32px', label: 'L' },
          ],
        },
      },
      defaultProps: { gap: '24px' },
      render: ({ gap }) => (
        <div style={{ display: 'flex', gap, flexWrap: 'wrap' }}>
          {(['col-1', 'col-2', 'col-3'] as const).map((zone) => (
            <div key={zone} style={{ flex: '1 1 200px', minWidth: 0 }}>
              <DropZone zone={zone} />
            </div>
          ))}
        </div>
      ),
    },

    // ── Typography ──────────────────────────────────────────────────────────

    Heading: {
      label: 'Titre',
      fields: {
        text: { type: 'textarea', label: 'Texte' },
        level: {
          type: 'select',
          label: 'Niveau',
          options: [
            { value: 'h1', label: 'H1' },
            { value: 'h2', label: 'H2' },
            { value: 'h3', label: 'H3' },
            { value: 'h4', label: 'H4' },
          ],
        },
        align: { type: 'select', label: 'Alignement', options: ALIGN_OPTIONS },
        color: { type: 'text', label: 'Couleur' },
        size: { type: 'select', label: 'Taille', options: FONT_SIZES },
      },
      defaultProps: { text: 'Titre', level: 'h2', align: 'left', color: '', size: '32px' },
      render: ({ text, level, align, color, size }) => {
        const Tag = level as 'h1' | 'h2' | 'h3' | 'h4'
        return (
          <Tag
            style={{
              margin: '0 0 16px',
              fontSize: size,
              fontWeight: 700,
              letterSpacing: '-0.025em',
              lineHeight: 1.15,
              textAlign: align as 'left' | 'center' | 'right',
              color: color || '#111827',
            }}
          >
            {text}
          </Tag>
        )
      },
    },

    Paragraph: {
      label: 'Paragraphe',
      fields: {
        text: { type: 'textarea', label: 'Texte' },
        align: { type: 'select', label: 'Alignement', options: ALIGN_OPTIONS },
        color: { type: 'text', label: 'Couleur' },
        size: { type: 'select', label: 'Taille', options: FONT_SIZES },
        maxWidth: { type: 'text', label: 'Largeur max' },
      },
      defaultProps: {
        text: 'Votre texte ici.',
        align: 'left',
        color: '',
        size: '17px',
        maxWidth: '',
      },
      render: ({ text, align, color, size, maxWidth }) => (
        <p
          style={{
            margin: '0 0 16px',
            fontSize: size,
            lineHeight: 1.75,
            textAlign: align as 'left' | 'center' | 'right',
            color: color || '#4b5563',
            maxWidth: maxWidth || undefined,
          }}
        >
          {text}
        </p>
      ),
    },

    // ── Media ────────────────────────────────────────────────────────────────

    Image: {
      label: 'Image',
      fields: {
        src: { type: 'text', label: "URL de l'image" },
        alt: { type: 'text', label: 'Texte alternatif' },
        width: {
          type: 'select',
          label: 'Largeur',
          options: [
            { value: '100%', label: 'Pleine largeur' },
            { value: '640px', label: 'Large (640)' },
            { value: '480px', label: 'Moyen (480)' },
            { value: '320px', label: 'Petit (320)' },
          ],
        },
        borderRadius: { type: 'text', label: 'Border radius' },
        align: { type: 'select', label: 'Alignement', options: ALIGN_OPTIONS },
      },
      defaultProps: { src: '', alt: '', width: '100%', borderRadius: '0px', align: 'left' },
      render: ({ src, alt, width, borderRadius, align }) => {
        if (!src) {
          return (
            <div
              style={{
                width,
                height: 200,
                background: '#f3f4f6',
                border: '2px dashed #e5e7eb',
                borderRadius,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9ca3af',
                fontSize: 13,
              }}
            >
              Image
            </div>
          )
        }
        return (
          <div style={{ textAlign: align as 'left' | 'center' | 'right' }}>
            <img
              src={src}
              alt={alt}
              style={{
                width,
                maxWidth: '100%',
                borderRadius,
                display: 'block',
                margin: align === 'center' ? '0 auto' : undefined,
              }}
            />
          </div>
        )
      },
    },

    Video: {
      label: 'Vidéo',
      fields: {
        url: { type: 'text', label: 'URL YouTube ou Vimeo' },
        ratio: {
          type: 'select',
          label: 'Format',
          options: [
            { value: '56.25%', label: '16:9' },
            { value: '75%', label: '4:3' },
            { value: '100%', label: '1:1' },
          ],
        },
      },
      defaultProps: { url: '', ratio: '56.25%' },
      render: ({ url, ratio }) => {
        const embedUrl = url
          .replace('watch?v=', 'embed/')
          .replace('youtu.be/', 'www.youtube.com/embed/')
          .replace('vimeo.com/', 'player.vimeo.com/video/')
        return (
          <div
            style={{
              position: 'relative',
              paddingBottom: ratio,
              height: 0,
              overflow: 'hidden',
              borderRadius: 12,
            }}
          >
            {url ? (
              <iframe
                src={embedUrl}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
                allowFullScreen
                title="Video"
              />
            ) : (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#9ca3af',
                  fontSize: 13,
                  border: '2px dashed #e5e7eb',
                  borderRadius: 12,
                }}
              >
                Vidéo
              </div>
            )}
          </div>
        )
      },
    },

    // ── UI ───────────────────────────────────────────────────────────────────

    Button: {
      label: 'Bouton',
      fields: {
        label: { type: 'text', label: 'Texte' },
        href: { type: 'text', label: 'Lien' },
        variant: {
          type: 'select',
          label: 'Style',
          options: [
            { value: 'primary', label: 'Principal' },
            { value: 'secondary', label: 'Secondaire' },
            { value: 'outline', label: 'Contour' },
          ],
        },
        size: {
          type: 'select',
          label: 'Taille',
          options: [
            { value: 'sm', label: 'Petit' },
            { value: 'md', label: 'Moyen' },
            { value: 'lg', label: 'Grand' },
          ],
        },
        align: { type: 'select', label: 'Alignement', options: ALIGN_OPTIONS },
      },
      defaultProps: {
        label: 'Cliquez ici',
        href: '#',
        variant: 'primary',
        size: 'md',
        align: 'left',
      },
      render: ({ label: text, href, variant, size, align }) => {
        const heights: Record<string, number> = { sm: 34, md: 42, lg: 50 }
        const fontSizes: Record<string, number> = { sm: 13, md: 15, lg: 16 }
        const pads: Record<string, string> = { sm: '0 16px', md: '0 24px', lg: '0 32px' }
        const styles: Record<string, React.CSSProperties> = {
          primary: { background: ACCENT, color: '#fff', border: 'none' },
          secondary: { background: '#111827', color: '#fff', border: 'none' },
          outline: { background: 'transparent', color: '#111827', border: '1.5px solid #d1d5db' },
        }
        return (
          <div style={{ textAlign: align as 'left' | 'center' | 'right' }}>
            <a
              href={href}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: heights[size],
                padding: pads[size],
                borderRadius: 7,
                fontSize: fontSizes[size],
                fontWeight: 600,
                textDecoration: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                letterSpacing: '-0.01em',
                ...styles[variant],
              }}
            >
              {text}
            </a>
          </div>
        )
      },
    },

    Divider: {
      label: 'Séparateur',
      fields: {
        color: { type: 'text', label: 'Couleur' },
        margin: {
          type: 'select',
          label: 'Marge',
          options: [
            { value: '8px 0', label: 'S' },
            { value: '20px 0', label: 'M' },
            { value: '40px 0', label: 'L' },
          ],
        },
      },
      defaultProps: { color: '#e5e7eb', margin: '20px 0' },
      render: ({ color, margin }) => (
        <hr style={{ border: 'none', borderTop: `1px solid ${color}`, margin }} />
      ),
    },

    // ── Sections ─────────────────────────────────────────────────────────────

    Hero: {
      label: 'Hero',
      fields: {
        title: { type: 'text', label: 'Titre' },
        subtitle: { type: 'textarea', label: 'Sous-titre' },
        ctaLabel: { type: 'text', label: 'Texte CTA' },
        ctaHref: { type: 'text', label: 'Lien CTA' },
        ctaSecondLabel: { type: 'text', label: 'CTA secondaire' },
        ctaSecondHref: { type: 'text', label: 'Lien CTA secondaire' },
        background: { type: 'text', label: 'Couleur de fond' },
        align: { type: 'select', label: 'Alignement', options: ALIGN_OPTIONS },
        minHeight: { type: 'text', label: 'Hauteur min' },
      },
      defaultProps: {
        title: 'Titre principal',
        subtitle: 'Une accroche percutante pour présenter votre produit ou service.',
        ctaLabel: 'Commencer',
        ctaHref: '#',
        ctaSecondLabel: '',
        ctaSecondHref: '#',
        background: '#ffffff',
        align: 'center',
        minHeight: '520px',
      },
      render: ({
        title,
        subtitle,
        ctaLabel,
        ctaHref,
        ctaSecondLabel,
        ctaSecondHref,
        background,
        align,
        minHeight,
      }) => (
        <section
          style={{
            background,
            minHeight,
            display: 'flex',
            alignItems: 'center',
            padding: '96px 24px',
          }}
        >
          <div
            style={{
              maxWidth: 760,
              margin: '0 auto',
              textAlign: align as 'left' | 'center' | 'right',
              width: '100%',
            }}
          >
            <h1
              style={{
                margin: '0 0 24px',
                fontSize: 'clamp(36px, 5.5vw, 64px)',
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: '-0.04em',
                color: '#0f172a',
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                style={{
                  margin: '0 0 40px',
                  fontSize: 19,
                  color: '#4b5563',
                  lineHeight: 1.65,
                  maxWidth: 600,
                  ...(align === 'center' ? { marginLeft: 'auto', marginRight: 'auto' } : {}),
                }}
              >
                {subtitle}
              </p>
            )}
            <div
              style={{
                display: 'flex',
                gap: 12,
                justifyContent: align === 'center' ? 'center' : 'flex-start',
                flexWrap: 'wrap',
              }}
            >
              {ctaLabel && (
                <a
                  href={ctaHref}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    height: 50,
                    padding: '0 32px',
                    background: ACCENT,
                    color: '#fff',
                    borderRadius: 8,
                    fontSize: 16,
                    fontWeight: 600,
                    textDecoration: 'none',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {ctaLabel}
                </a>
              )}
              {ctaSecondLabel && (
                <a
                  href={ctaSecondHref}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    height: 50,
                    padding: '0 32px',
                    background: 'transparent',
                    color: '#374151',
                    border: '1.5px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 16,
                    fontWeight: 600,
                    textDecoration: 'none',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {ctaSecondLabel}
                </a>
              )}
            </div>
          </div>
        </section>
      ),
    },

    Features: {
      label: 'Features',
      fields: {
        title: { type: 'text', label: 'Titre de section' },
        subtitle: { type: 'text', label: 'Sous-titre' },
        columns: {
          type: 'select',
          label: 'Colonnes',
          options: [
            { value: '2', label: '2' },
            { value: '3', label: '3' },
            { value: '4', label: '4' },
          ],
        },
        items: {
          type: 'array',
          label: 'Fonctionnalités',
          arrayFields: {
            icon: { type: 'text', label: 'Icône (emoji ou texte)' },
            title: { type: 'text', label: 'Titre' },
            description: { type: 'textarea', label: 'Description' },
          },
          defaultItemProps: {
            icon: '✦',
            title: 'Fonctionnalité',
            description: 'Description de la fonctionnalité.',
          },
        },
        background: { type: 'text', label: 'Fond' },
      },
      defaultProps: {
        title: 'Nos fonctionnalités',
        subtitle: 'Tout ce dont vous avez besoin.',
        columns: '3',
        background: '#f8fafc',
        items: [
          {
            icon: '⚡',
            title: 'Rapide',
            description: 'Performances optimales pour une expérience fluide.',
          },
          {
            icon: '🔒',
            title: 'Sécurisé',
            description: 'Vos données protégées avec les meilleurs standards.',
          },
          {
            icon: '🎨',
            title: 'Personnalisable',
            description: 'Adaptez chaque détail à votre identité.',
          },
        ],
      },
      render: ({ title, subtitle, columns, items, background }) => (
        <section style={{ padding: '88px 24px', background }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            {(title || subtitle) && (
              <div style={{ textAlign: 'center', marginBottom: 56 }}>
                {title && (
                  <h2
                    style={{
                      margin: '0 0 14px',
                      fontSize: 'clamp(26px, 4vw, 36px)',
                      fontWeight: 700,
                      letterSpacing: '-0.03em',
                      color: '#0f172a',
                      lineHeight: 1.15,
                    }}
                  >
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p
                    style={{
                      margin: '0 auto',
                      fontSize: 17,
                      color: '#6b7280',
                      maxWidth: 560,
                      lineHeight: 1.6,
                    }}
                  >
                    {subtitle}
                  </p>
                )}
              </div>
            )}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: 20,
              }}
            >
              {(items as { icon: string; title: string; description: string }[]).map((item) => (
                <div
                  key={`${item.icon}-${item.title}`}
                  style={{
                    padding: '28px 24px',
                    background: '#fff',
                    borderRadius: 14,
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                >
                  {item.icon && (
                    <div style={{ fontSize: 30, marginBottom: 14, lineHeight: 1 }}>{item.icon}</div>
                  )}
                  <h3
                    style={{
                      margin: '0 0 8px',
                      fontSize: 16,
                      fontWeight: 650,
                      color: '#0f172a',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {item.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: 14, color: '#6b7280', lineHeight: 1.65 }}>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ),
    },
  },
}
