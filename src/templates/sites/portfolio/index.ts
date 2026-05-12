import type { TatomirTemplate } from '../../types'

export const portfolioSiteTemplate: TatomirTemplate = {
  id: 'site-portfolio',
  name: 'Portfolio Site',
  version: '1.0.0',
  description: 'Creative portfolio — work showcase, case studies, contact',
  category: 'portfolio',
  tags: ['portfolio', 'creative', 'agency', 'freelance'],
  scope: 'site',
  site: {
    themeId: 'modern',
    pages: [
      {
        slug: '/',
        label: 'Home',
        isHome: true,
        blocks: [
          {
            id: 'hero-portfolio',
            type: 'hero',
            props: {
              headline: 'We build digital products.',
              subheadline: 'Design-led studio specialising in web and mobile.',
              ctaLabel: 'See our work',
              ctaHref: '/work',
              align: 'left',
              variant: 'large',
            },
            children: [],
          },
          {
            id: 'selected-work',
            type: 'post-grid',
            props: {
              postType: 'portfolio',
              columns: 2,
              perPage: 4,
              showPagination: false,
              cardStyle: 'overlay',
            },
            children: [],
          },
        ],
      },
      {
        slug: '/work',
        label: 'Work',
        blocks: [
          {
            id: 'work-header',
            type: 'page-header',
            props: { title: 'Work', subtitle: 'Selected projects.' },
            children: [],
          },
          {
            id: 'work-grid',
            type: 'post-grid',
            props: {
              postType: 'portfolio',
              columns: 2,
              perPage: 12,
              showPagination: true,
              cardStyle: 'overlay',
            },
            children: [],
          },
        ],
      },
      {
        slug: '/about',
        label: 'About',
        blocks: [
          {
            id: 'about-rich',
            type: 'rich-text',
            props: { content: '<h1>About us</h1><p>Tell your story here.</p>' },
            children: [],
          },
        ],
      },
      {
        slug: '/contact',
        label: 'Contact',
        blocks: [
          {
            id: 'contact-form',
            type: 'contact-form',
            props: { title: 'Get in touch', submitLabel: 'Send message' },
            children: [],
          },
        ],
      },
    ],
  },
}
