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
    Sections: {
      components: [
        'Hero',
        'Features',
        'CallToAction',
        'Testimonials',
        'Stats',
        'Pricing',
        'Accordion',
      ],
    },
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
    // ── CallToAction ─────────────────────────────────────────────────────────

    CallToAction: {
      label: 'Call to Action',
      fields: {
        title: { type: 'text', label: 'Titre' },
        subtitle: { type: 'textarea', label: 'Sous-titre' },
        ctaLabel: { type: 'text', label: 'Texte CTA' },
        ctaHref: { type: 'text', label: 'Lien CTA' },
        ctaSecondLabel: { type: 'text', label: 'CTA secondaire' },
        ctaSecondHref: { type: 'text', label: 'Lien CTA secondaire' },
        background: { type: 'text', label: 'Couleur de fond' },
        textColor: { type: 'text', label: 'Couleur du texte' },
      },
      defaultProps: {
        title: 'Prêt à démarrer ?',
        subtitle: "Rejoignez les milliers d'équipes qui nous font confiance.",
        ctaLabel: 'Commencer gratuitement',
        ctaHref: '#',
        ctaSecondLabel: 'En savoir plus',
        ctaSecondHref: '#',
        background: '#0f172a',
        textColor: '#ffffff',
      },
      render: ({
        title,
        subtitle,
        ctaLabel,
        ctaHref,
        ctaSecondLabel,
        ctaSecondHref,
        background,
        textColor,
      }) => (
        <section style={{ background, padding: '88px 24px', textAlign: 'center' }}>
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <h2
              style={{
                margin: '0 0 16px',
                fontSize: 'clamp(28px, 4vw, 42px)',
                fontWeight: 800,
                letterSpacing: '-0.035em',
                color: textColor,
                lineHeight: 1.1,
              }}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                style={{
                  margin: '0 0 36px',
                  fontSize: 17,
                  color: textColor === '#ffffff' ? 'rgba(255,255,255,0.65)' : textColor,
                  lineHeight: 1.6,
                }}
              >
                {subtitle}
              </p>
            )}
            <div
              style={{
                display: 'flex',
                gap: 12,
                justifyContent: 'center',
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
                    color: textColor === '#ffffff' ? 'rgba(255,255,255,0.8)' : textColor,
                    border: `1.5px solid ${textColor === '#ffffff' ? 'rgba(255,255,255,0.25)' : textColor}`,
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

    // ── Testimonials ─────────────────────────────────────────────────────────

    Testimonials: {
      label: 'Témoignages',
      fields: {
        title: { type: 'text', label: 'Titre de section' },
        subtitle: { type: 'text', label: 'Sous-titre' },
        columns: {
          type: 'select',
          label: 'Colonnes',
          options: [
            { value: '2', label: '2' },
            { value: '3', label: '3' },
          ],
        },
        items: {
          type: 'array',
          label: 'Témoignages',
          arrayFields: {
            quote: { type: 'textarea', label: 'Citation' },
            author: { type: 'text', label: 'Nom' },
            role: { type: 'text', label: 'Titre / Entreprise' },
            avatar: { type: 'text', label: 'URL avatar' },
          },
          defaultItemProps: {
            quote: 'Un produit exceptionnel qui a transformé notre façon de travailler.',
            author: 'Marie Dupont',
            role: 'CEO, Startup SAS',
            avatar: '',
          },
        },
        background: { type: 'text', label: 'Fond' },
      },
      defaultProps: {
        title: 'Ce que disent nos clients',
        subtitle: 'Ils nous font confiance et le font savoir.',
        columns: '3',
        background: '#ffffff',
        items: [
          {
            quote:
              'Un outil indispensable pour notre équipe. La prise en main est immédiate et les résultats sont au rendez-vous.',
            author: 'Sophie Martin',
            role: 'Directrice Marketing, Acme Corp',
            avatar: '',
          },
          {
            quote:
              "Enfin un CMS qui respecte notre workflow. L'éditeur visuel est bluffant, nos équipes adorent.",
            author: 'Thomas Bernard',
            role: 'Lead Dev, Studio Pixel',
            avatar: '',
          },
          {
            quote:
              "Déployé en production en moins d'une heure. La documentation est claire, le support réactif.",
            author: 'Laura Chen',
            role: 'CTO, Nexio Technologies',
            avatar: '',
          },
        ],
      },
      render: ({ title, subtitle, columns, items, background }) => (
        <section style={{ padding: '88px 24px', background }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            {(title || subtitle) && (
              <div style={{ textAlign: 'center', marginBottom: 52 }}>
                {title && (
                  <h2
                    style={{
                      margin: '0 0 12px',
                      fontSize: 'clamp(24px, 3.5vw, 34px)',
                      fontWeight: 700,
                      letterSpacing: '-0.03em',
                      color: '#0f172a',
                    }}
                  >
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p style={{ margin: 0, fontSize: 16, color: '#6b7280' }}>{subtitle}</p>
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
              {(items as { quote: string; author: string; role: string; avatar: string }[]).map(
                (item) => (
                  <div
                    key={`${item.author}-${item.role}`}
                    style={{
                      padding: '28px 24px',
                      background: '#f8fafc',
                      borderRadius: 14,
                      border: '1px solid #e5e7eb',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 20,
                    }}
                  >
                    {/* Quote mark */}
                    <svg width="28" height="20" viewBox="0 0 28 20" fill="none" aria-hidden="true">
                      <path
                        d="M0 20V12.5C0 5.6 4.2 1.4 12.6 0L13.6 2C9.8 2.8 7.6 5 7 8.5H12V20H0ZM16 20V12.5C16 5.6 20.2 1.4 28.6 0L29.6 2C25.8 2.8 23.6 5 23 8.5H28V20H16Z"
                        fill={ACCENT}
                        fillOpacity="0.25"
                      />
                    </svg>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 15,
                        color: '#374151',
                        lineHeight: 1.7,
                        flex: 1,
                      }}
                    >
                      {item.quote}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {item.avatar ? (
                        <img
                          src={item.avatar}
                          alt={item.author}
                          style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: ACCENT,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 15,
                            fontWeight: 700,
                            color: '#fff',
                            flexShrink: 0,
                          }}
                        >
                          {item.author[0]}
                        </div>
                      )}
                      <div>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                          {item.author}
                        </p>
                        <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>{item.role}</p>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </section>
      ),
    },

    // ── Stats ────────────────────────────────────────────────────────────────

    Stats: {
      label: 'Statistiques',
      fields: {
        title: { type: 'text', label: 'Titre (optionnel)' },
        items: {
          type: 'array',
          label: 'Chiffres',
          arrayFields: {
            value: { type: 'text', label: 'Valeur' },
            label: { type: 'text', label: 'Label' },
            description: { type: 'text', label: 'Description (optionnel)' },
          },
          defaultItemProps: { value: '10K+', label: 'Utilisateurs', description: '' },
        },
        background: { type: 'text', label: 'Fond' },
        accent: { type: 'text', label: 'Couleur des chiffres' },
      },
      defaultProps: {
        title: '',
        background: '#f8fafc',
        accent: ACCENT,
        items: [
          { value: '10K+', label: 'Utilisateurs actifs', description: 'Dans 40 pays' },
          { value: '99.9%', label: 'Disponibilité', description: 'SLA garanti' },
          { value: '< 50ms', label: 'Temps de réponse', description: 'En moyenne' },
          { value: '4.9/5', label: 'Satisfaction', description: 'Sur 1200+ avis' },
        ],
      },
      render: ({ title, items, background, accent }) => (
        <section style={{ padding: '72px 24px', background }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            {title && (
              <h2
                style={{
                  textAlign: 'center',
                  margin: '0 0 52px',
                  fontSize: 'clamp(24px, 3.5vw, 34px)',
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  color: '#0f172a',
                }}
              >
                {title}
              </h2>
            )}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${(items as unknown[]).length}, 1fr)`,
                gap: 1,
                background: '#e5e7eb',
                borderRadius: 14,
                overflow: 'hidden',
              }}
            >
              {(items as { value: string; label: string; description: string }[]).map((item) => (
                <div
                  key={`${item.value}-${item.label}`}
                  style={{
                    background: '#ffffff',
                    padding: '32px 24px',
                    textAlign: 'center',
                  }}
                >
                  <p
                    style={{
                      margin: '0 0 6px',
                      fontSize: 'clamp(28px, 3.5vw, 42px)',
                      fontWeight: 800,
                      letterSpacing: '-0.04em',
                      color: accent || ACCENT,
                      lineHeight: 1,
                    }}
                  >
                    {item.value}
                  </p>
                  <p
                    style={{
                      margin: '0 0 4px',
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#0f172a',
                    }}
                  >
                    {item.label}
                  </p>
                  {item.description && (
                    <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>{item.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      ),
    },

    // ── Pricing ──────────────────────────────────────────────────────────────

    Pricing: {
      label: 'Tarifs',
      fields: {
        title: { type: 'text', label: 'Titre' },
        subtitle: { type: 'text', label: 'Sous-titre' },
        items: {
          type: 'array',
          label: 'Plans',
          arrayFields: {
            name: { type: 'text', label: 'Nom du plan' },
            price: { type: 'text', label: 'Prix' },
            period: { type: 'text', label: 'Période (ex: /mois)' },
            description: { type: 'text', label: 'Description' },
            features: { type: 'textarea', label: 'Fonctionnalités (une par ligne)' },
            ctaLabel: { type: 'text', label: 'Texte bouton' },
            ctaHref: { type: 'text', label: 'Lien bouton' },
            highlighted: {
              type: 'radio',
              label: 'Plan mis en avant',
              options: [
                { value: 'true', label: 'Oui' },
                { value: 'false', label: 'Non' },
              ],
            },
          },
          defaultItemProps: {
            name: 'Pro',
            price: '29€',
            period: '/mois',
            description: "Tout ce qu'il faut pour une équipe.",
            features: 'Pages illimitées\nÉditeur visuel\nSEO avancé\nSupport prioritaire',
            ctaLabel: 'Commencer',
            ctaHref: '#',
            highlighted: 'false',
          },
        },
        background: { type: 'text', label: 'Fond' },
      },
      defaultProps: {
        title: 'Tarifs simples et transparents',
        subtitle: 'Pas de frais cachés. Changez de plan à tout moment.',
        background: '#f8fafc',
        items: [
          {
            name: 'Starter',
            price: 'Gratuit',
            period: '',
            description: 'Pour commencer sans engagement.',
            features: '3 pages\nÉditeur visuel\nSEO de base\nCommunauté',
            ctaLabel: 'Commencer',
            ctaHref: '#',
            highlighted: 'false',
          },
          {
            name: 'Pro',
            price: '29€',
            period: '/mois',
            description: 'Pour les équipes qui veulent aller vite.',
            features:
              'Pages illimitées\nÉditeur visuel\nSEO avancé\nSupport prioritaire\nAnalytics',
            ctaLabel: 'Essayer 14 jours',
            ctaHref: '#',
            highlighted: 'true',
          },
          {
            name: 'Entreprise',
            price: 'Sur devis',
            period: '',
            description: 'Pour les besoins spécifiques à grande échelle.',
            features: 'Tout Pro inclus\nSLA dédié\nOnboarding personnalisé\nSSO / SAML',
            ctaLabel: 'Nous contacter',
            ctaHref: '/contact',
            highlighted: 'false',
          },
        ],
      },
      render: ({ title, subtitle, items, background }) => (
        <section style={{ padding: '88px 24px', background }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            {(title || subtitle) && (
              <div style={{ textAlign: 'center', marginBottom: 52 }}>
                {title && (
                  <h2
                    style={{
                      margin: '0 0 12px',
                      fontSize: 'clamp(24px, 3.5vw, 36px)',
                      fontWeight: 700,
                      letterSpacing: '-0.03em',
                      color: '#0f172a',
                    }}
                  >
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p style={{ margin: 0, fontSize: 16, color: '#6b7280' }}>{subtitle}</p>
                )}
              </div>
            )}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${(items as unknown[]).length}, 1fr)`,
                gap: 20,
                alignItems: 'start',
              }}
            >
              {(
                items as {
                  name: string
                  price: string
                  period: string
                  description: string
                  features: string
                  ctaLabel: string
                  ctaHref: string
                  highlighted: string
                }[]
              ).map((item) => {
                const hot = item.highlighted === 'true'
                const featureList = item.features
                  .split('\n')
                  .map((f) => f.trim())
                  .filter(Boolean)
                return (
                  <div
                    key={item.name}
                    style={{
                      padding: '28px 24px',
                      background: hot ? '#0f172a' : '#ffffff',
                      borderRadius: 16,
                      border: hot ? `2px solid ${ACCENT}` : '1px solid #e5e7eb',
                      boxShadow: hot ? `0 0 0 4px ${ACCENT}18` : '0 1px 3px rgba(0,0,0,0.04)',
                      position: 'relative',
                    }}
                  >
                    {hot && (
                      <div
                        style={{
                          position: 'absolute',
                          top: -12,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: ACCENT,
                          color: '#fff',
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: '0.06em',
                          padding: '3px 12px',
                          borderRadius: 20,
                          whiteSpace: 'nowrap',
                          textTransform: 'uppercase',
                        }}
                      >
                        Populaire
                      </div>
                    )}
                    <p
                      style={{
                        margin: '0 0 8px',
                        fontSize: 13,
                        fontWeight: 600,
                        color: hot ? '#94a3b8' : '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {item.name}
                    </p>
                    <div
                      style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}
                    >
                      <span
                        style={{
                          fontSize: 36,
                          fontWeight: 800,
                          letterSpacing: '-0.04em',
                          color: hot ? '#f1f5f9' : '#0f172a',
                          lineHeight: 1,
                        }}
                      >
                        {item.price}
                      </span>
                      {item.period && (
                        <span style={{ fontSize: 14, color: hot ? '#64748b' : '#9ca3af' }}>
                          {item.period}
                        </span>
                      )}
                    </div>
                    <p
                      style={{
                        margin: '0 0 24px',
                        fontSize: 13,
                        color: hot ? '#64748b' : '#6b7280',
                        lineHeight: 1.5,
                      }}
                    >
                      {item.description}
                    </p>
                    <ul
                      style={{
                        margin: '0 0 28px',
                        padding: 0,
                        listStyle: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                      }}
                    >
                      {featureList.map((f) => (
                        <li
                          key={f}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 8,
                            fontSize: 14,
                            color: hot ? '#cbd5e1' : '#374151',
                          }}
                        >
                          <span
                            style={{
                              color: hot ? '#60a5fa' : ACCENT,
                              fontWeight: 700,
                              flexShrink: 0,
                              marginTop: 1,
                            }}
                          >
                            ✓
                          </span>
                          {f}
                        </li>
                      ))}
                    </ul>
                    {item.ctaLabel && (
                      <a
                        href={item.ctaHref}
                        style={{
                          display: 'block',
                          textAlign: 'center',
                          padding: '11px 0',
                          background: hot ? ACCENT : 'transparent',
                          color: hot ? '#fff' : ACCENT,
                          border: hot ? 'none' : `1.5px solid ${ACCENT}`,
                          borderRadius: 8,
                          fontSize: 14,
                          fontWeight: 600,
                          textDecoration: 'none',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {item.ctaLabel}
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      ),
    },

    // ── Accordion ────────────────────────────────────────────────────────────

    Accordion: {
      label: 'Accordéon / FAQ',
      fields: {
        title: { type: 'text', label: 'Titre (optionnel)' },
        subtitle: { type: 'text', label: 'Sous-titre (optionnel)' },
        items: {
          type: 'array',
          label: 'Questions',
          arrayFields: {
            question: { type: 'text', label: 'Question' },
            answer: { type: 'textarea', label: 'Réponse' },
          },
          defaultItemProps: {
            question: 'Comment fonctionne le produit ?',
            answer:
              'Notre produit est conçu pour être simple et intuitif. Vous pouvez démarrer en quelques minutes sans configuration technique.',
          },
        },
        background: { type: 'text', label: 'Fond' },
        maxWidth: { type: 'text', label: 'Largeur max' },
      },
      defaultProps: {
        title: 'Questions fréquentes',
        subtitle: 'Tout ce que vous devez savoir.',
        background: '#ffffff',
        maxWidth: '720px',
        items: [
          {
            question: 'Puis-je essayer gratuitement ?',
            answer:
              'Oui, un plan gratuit est disponible sans carte bancaire. Il inclut toutes les fonctionnalités de base pour démarrer votre site.',
          },
          {
            question: 'Comment migrer depuis un autre CMS ?',
            answer:
              "Nous proposons des outils d'import pour WordPress, Webflow et les exports JSON génériques. La migration prend généralement moins d'une heure.",
          },
          {
            question: 'Quels langages et bases de données sont supportés ?',
            answer:
              'Le CMS tourne sur Node.js avec Next.js. PostgreSQL, MySQL et SQLite sont supportés nativement via Prisma.',
          },
          {
            question: 'Puis-je héberger sur mon propre serveur ?',
            answer:
              'Absolument. Le CMS est entièrement self-hosted. Déployez sur Vercel, Railway, un VPS ou tout serveur Node.js.',
          },
        ],
      },
      render: ({ title, subtitle, items, background, maxWidth }) => (
        <section style={{ padding: '88px 24px', background }}>
          <div style={{ maxWidth: maxWidth || 720, margin: '0 auto' }}>
            {(title || subtitle) && (
              <div style={{ textAlign: 'center', marginBottom: 52 }}>
                {title && (
                  <h2
                    style={{
                      margin: '0 0 12px',
                      fontSize: 'clamp(24px, 3.5vw, 34px)',
                      fontWeight: 700,
                      letterSpacing: '-0.03em',
                      color: '#0f172a',
                    }}
                  >
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p style={{ margin: 0, fontSize: 16, color: '#6b7280' }}>{subtitle}</p>
                )}
              </div>
            )}
            <div
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: 14,
                overflow: 'hidden',
              }}
            >
              {(items as { question: string; answer: string }[]).map((item, i) => (
                <details
                  key={item.question}
                  style={{
                    borderTop: i === 0 ? 'none' : '1px solid #f3f4f6',
                  }}
                >
                  <summary
                    style={{
                      padding: '18px 20px',
                      fontSize: 15,
                      fontWeight: 600,
                      color: '#0f172a',
                      cursor: 'pointer',
                      listStyle: 'none',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 12,
                      userSelect: 'none',
                    }}
                  >
                    {item.question}
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: '#f3f4f6',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 16,
                        color: '#6b7280',
                        flexShrink: 0,
                        fontWeight: 400,
                      }}
                    >
                      +
                    </span>
                  </summary>
                  <p
                    style={{
                      margin: 0,
                      padding: '0 20px 18px',
                      fontSize: 14,
                      color: '#4b5563',
                      lineHeight: 1.7,
                    }}
                  >
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      ),
    },
  },
}
