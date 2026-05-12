export interface FieldDefinition {
  key: string
  label: string
  type: string
  required?: boolean
  multiple?: boolean
  options?: { value: string; label: string }[]
  description?: string
}

export interface PostTypeDefinition {
  id: string
  label: string
  labelPlural: string
  slug: string
  icon: string
  description?: string
  hasExcerpt?: boolean
  hasFeaturedImage?: boolean
  hasTaxonomies?: string[]
  fields: FieldDefinition[]
}

export const BUILT_IN_POST_TYPES: PostTypeDefinition[] = [
  {
    id: 'blog',
    label: 'Post',
    labelPlural: 'Posts',
    slug: 'blog',
    icon: 'Newspaper',
    description: 'Standard blog / news posts',
    hasExcerpt: true,
    hasFeaturedImage: true,
    hasTaxonomies: ['category', 'tag'],
    fields: [
      { key: 'author', label: 'Author', type: 'text', required: true },
      { key: 'readTime', label: 'Read Time (min)', type: 'number' },
    ],
  },
  {
    id: 'portfolio',
    label: 'Project',
    labelPlural: 'Projects',
    slug: 'work',
    icon: 'Briefcase',
    description: 'Portfolio / case study entries',
    hasExcerpt: true,
    hasFeaturedImage: true,
    hasTaxonomies: ['category'],
    fields: [
      { key: 'client', label: 'Client', type: 'text' },
      { key: 'year', label: 'Year', type: 'number' },
      { key: 'services', label: 'Services', type: 'text', multiple: true },
      { key: 'url', label: 'Live URL', type: 'url' },
    ],
  },
  {
    id: 'event',
    label: 'Event',
    labelPlural: 'Events',
    slug: 'events',
    icon: 'Calendar',
    description: 'Events with date, location and registration',
    hasExcerpt: true,
    hasFeaturedImage: true,
    hasTaxonomies: ['category'],
    fields: [
      { key: 'startDate', label: 'Start Date', type: 'datetime', required: true },
      { key: 'endDate', label: 'End Date', type: 'datetime' },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'onlineUrl', label: 'Online URL', type: 'url' },
      { key: 'capacity', label: 'Capacity', type: 'number' },
      { key: 'price', label: 'Price', type: 'number' },
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'upcoming', label: 'Upcoming' },
          { value: 'ongoing', label: 'Ongoing' },
          { value: 'past', label: 'Past' },
          { value: 'cancelled', label: 'Cancelled' },
        ],
      },
    ],
  },
  {
    id: 'team',
    label: 'Team Member',
    labelPlural: 'Team Members',
    slug: 'team',
    icon: 'Users',
    description: 'Team or staff profiles',
    hasFeaturedImage: true,
    fields: [
      { key: 'role', label: 'Role / Title', type: 'text', required: true },
      { key: 'bio', label: 'Bio', type: 'textarea' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'twitter', label: 'Twitter / X', type: 'url' },
      { key: 'linkedin', label: 'LinkedIn', type: 'url' },
      { key: 'github', label: 'GitHub', type: 'url' },
    ],
  },
  {
    id: 'faq',
    label: 'FAQ',
    labelPlural: 'FAQs',
    slug: 'faqs',
    icon: 'HelpCircle',
    description: 'Frequently asked questions',
    hasTaxonomies: ['category'],
    fields: [
      { key: 'answer', label: 'Answer', type: 'rich-text', required: true },
      { key: 'order', label: 'Sort Order', type: 'number' },
    ],
  },
  {
    id: 'testimonial',
    label: 'Testimonial',
    labelPlural: 'Testimonials',
    slug: 'testimonials',
    icon: 'MessageSquare',
    description: 'Customer or client quotes',
    hasFeaturedImage: true,
    fields: [
      { key: 'quote', label: 'Quote', type: 'textarea', required: true },
      { key: 'authorRole', label: 'Author Role', type: 'text' },
      { key: 'company', label: 'Company', type: 'text' },
      { key: 'rating', label: 'Rating (1-5)', type: 'number' },
    ],
  },
]
