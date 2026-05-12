import type { TatomirTemplate } from '../../types'

export const blogSiteTemplate: TatomirTemplate = {
  id: 'site-blog',
  name: 'Blog Site',
  version: '1.0.0',
  description: 'Complete blog site — home, about, blog index, contact',
  category: 'blog',
  tags: ['blog', 'personal', 'writing'],
  scope: 'site',
  site: {
    themeId: 'minimal',
    pages: [
      {
        slug: '/',
        label: 'Home',
        isHome: true,
        blocks: [
          {
            id: 'hero-home',
            type: 'hero',
            props: {
              headline: 'Hello, I write things.',
              subheadline: 'A personal blog about technology, design, and ideas.',
              align: 'left',
            },
            children: [],
          },
          {
            id: 'recent-posts',
            type: 'post-grid',
            props: {
              postType: 'blog',
              columns: 2,
              perPage: 4,
              showPagination: false,
              cardStyle: 'minimal',
            },
            children: [],
          },
        ],
      },
      {
        slug: '/blog',
        label: 'Blog',
        blocks: [
          {
            id: 'blog-header',
            type: 'page-header',
            props: { title: 'Blog', subtitle: 'All articles.' },
            children: [],
          },
          {
            id: 'blog-grid',
            type: 'post-grid',
            props: {
              postType: 'blog',
              columns: 1,
              perPage: 10,
              showPagination: true,
              cardStyle: 'list',
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
            id: 'about-content',
            type: 'rich-text',
            props: { content: '<h1>About</h1><p>Write your story here.</p>' },
            children: [],
          },
        ],
      },
    ],
  },
}
