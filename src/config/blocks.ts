export interface BlockMeta {
  type: string
  label: string
  category: BlockCategory
  icon: string
  description?: string
}

export type BlockCategory =
  | 'layout'
  | 'typography'
  | 'media'
  | 'navigation'
  | 'hero'
  | 'features'
  | 'blog'
  | 'forms'
  | 'commerce'
  | 'interactive'

export const BUILT_IN_BLOCKS: BlockMeta[] = [
  // Layout
  {
    type: 'container',
    label: 'Container',
    category: 'layout',
    icon: 'Square',
    description: 'Generic wrapper with padding and max-width',
  },
  {
    type: 'section',
    label: 'Section',
    category: 'layout',
    icon: 'Rows',
    description: 'Full-width section with background options',
  },
  {
    type: 'grid',
    label: 'Grid',
    category: 'layout',
    icon: 'LayoutGrid',
    description: 'CSS grid with configurable columns',
  },
  {
    type: 'flex',
    label: 'Flex',
    category: 'layout',
    icon: 'Columns',
    description: 'Flexbox row or column',
  },
  {
    type: 'divider',
    label: 'Divider',
    category: 'layout',
    icon: 'Minus',
    description: 'Horizontal rule or spacer',
  },

  // Typography
  {
    type: 'heading',
    label: 'Heading',
    category: 'typography',
    icon: 'Heading',
    description: 'h1–h6 with style controls',
  },
  {
    type: 'paragraph',
    label: 'Paragraph',
    category: 'typography',
    icon: 'AlignLeft',
    description: 'Body text block',
  },
  {
    type: 'rich-text',
    label: 'Rich Text',
    category: 'typography',
    icon: 'FileText',
    description: 'Full Tiptap editor block',
  },
  {
    type: 'quote',
    label: 'Quote',
    category: 'typography',
    icon: 'Quote',
    description: 'Blockquote with attribution',
  },
  {
    type: 'code',
    label: 'Code Block',
    category: 'typography',
    icon: 'Code',
    description: 'Syntax-highlighted code',
  },

  // Media
  {
    type: 'image',
    label: 'Image',
    category: 'media',
    icon: 'Image',
    description: 'Optimised Next.js Image',
  },
  {
    type: 'video',
    label: 'Video',
    category: 'media',
    icon: 'Video',
    description: 'Native video or YouTube embed',
  },
  {
    type: 'gallery',
    label: 'Gallery',
    category: 'media',
    icon: 'Images',
    description: 'Masonry or grid image gallery',
  },
  {
    type: 'icon',
    label: 'Icon',
    category: 'media',
    icon: 'Shapes',
    description: 'Lucide icon with size and colour',
  },

  // Navigation
  {
    type: 'navbar',
    label: 'Navbar',
    category: 'navigation',
    icon: 'Menu',
    description: 'Top navigation with links and CTA',
  },
  {
    type: 'footer',
    label: 'Footer',
    category: 'navigation',
    icon: 'PanelBottom',
    description: 'Footer with columns and legal links',
  },
  {
    type: 'breadcrumb',
    label: 'Breadcrumb',
    category: 'navigation',
    icon: 'ChevronRight',
    description: 'Breadcrumb trail',
  },
  {
    type: 'pagination',
    label: 'Pagination',
    category: 'navigation',
    icon: 'ChevronRight',
    description: 'Next/prev page controls',
  },

  // Hero
  {
    type: 'hero',
    label: 'Hero',
    category: 'hero',
    icon: 'Sparkles',
    description: 'Headline, subline, CTA and optional media',
  },
  {
    type: 'hero-split',
    label: 'Hero Split',
    category: 'hero',
    icon: 'PanelLeft',
    description: 'Text left / image right hero',
  },
  {
    type: 'hero-video',
    label: 'Hero Video',
    category: 'hero',
    icon: 'Film',
    description: 'Full-bleed video hero',
  },

  // Features
  {
    type: 'features-grid',
    label: 'Features Grid',
    category: 'features',
    icon: 'LayoutGrid',
    description: 'Icon + title + body cards in a grid',
  },
  {
    type: 'features-list',
    label: 'Features List',
    category: 'features',
    icon: 'List',
    description: 'Vertical feature list with icons',
  },
  {
    type: 'testimonials',
    label: 'Testimonials',
    category: 'features',
    icon: 'MessageSquare',
    description: 'Quote cards or carousel',
  },
  {
    type: 'pricing',
    label: 'Pricing',
    category: 'features',
    icon: 'DollarSign',
    description: 'Pricing tiers table',
  },
  {
    type: 'faq',
    label: 'FAQ',
    category: 'features',
    icon: 'HelpCircle',
    description: 'Accordion FAQ section',
  },
  {
    type: 'cta-banner',
    label: 'CTA Banner',
    category: 'features',
    icon: 'Megaphone',
    description: 'Full-width call-to-action',
  },
  {
    type: 'stats',
    label: 'Stats',
    category: 'features',
    icon: 'BarChart2',
    description: 'Key numbers in a row or grid',
  },
  {
    type: 'logo-cloud',
    label: 'Logo Cloud',
    category: 'features',
    icon: 'Layers',
    description: 'Client / partner logos strip',
  },
  {
    type: 'team-grid',
    label: 'Team Grid',
    category: 'features',
    icon: 'Users',
    description: 'Team member cards',
  },

  // Blog
  {
    type: 'post-grid',
    label: 'Post Grid',
    category: 'blog',
    icon: 'Newspaper',
    description: 'Query + display posts dynamically',
  },
  {
    type: 'post-card',
    label: 'Post Card',
    category: 'blog',
    icon: 'FileText',
    description: 'Single post preview card',
  },
  {
    type: 'post-body',
    label: 'Post Body',
    category: 'blog',
    icon: 'AlignLeft',
    description: 'Rendered post content',
  },
  {
    type: 'page-header',
    label: 'Page Header',
    category: 'blog',
    icon: 'Heading1',
    description: 'Title and subtitle page intro',
  },

  // Forms
  {
    type: 'contact-form',
    label: 'Contact Form',
    category: 'forms',
    icon: 'Mail',
    description: 'Name / email / message with send action',
  },
  {
    type: 'newsletter',
    label: 'Newsletter',
    category: 'forms',
    icon: 'Send',
    description: 'Email subscribe form',
  },
  {
    type: 'search',
    label: 'Search',
    category: 'forms',
    icon: 'Search',
    description: 'Site search input',
  },
]

export const BLOCK_CATEGORIES: { id: BlockCategory; label: string; icon: string }[] = [
  { id: 'layout', label: 'Layout', icon: 'Layout' },
  { id: 'typography', label: 'Typography', icon: 'Type' },
  { id: 'media', label: 'Media', icon: 'Image' },
  { id: 'navigation', label: 'Navigation', icon: 'Menu' },
  { id: 'hero', label: 'Hero', icon: 'Sparkles' },
  { id: 'features', label: 'Features', icon: 'Star' },
  { id: 'blog', label: 'Blog', icon: 'Newspaper' },
  { id: 'forms', label: 'Forms', icon: 'FormInput' },
  { id: 'commerce', label: 'Commerce', icon: 'ShoppingCart' },
  { id: 'interactive', label: 'Interactive', icon: 'MousePointer' },
]
