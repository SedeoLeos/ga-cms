import type { TatomirTemplate } from '../../types'

export const blogPageTemplate: TatomirTemplate = {
  id: 'page-blog',
  name: 'Blog Index',
  version: '1.0.0',
  description: 'Header + post grid + pagination — standard blog listing page',
  category: 'blog',
  tags: ['blog', 'articles', 'listing'],
  scope: 'page',
  page: {
    slug: '/blog',
    label: 'Blog',
    blocks: [
      {
        id: 'page-header-1',
        type: 'page-header',
        props: {
          title: 'Blog',
          subtitle: 'Thoughts, updates, and ideas.',
        },
        children: [],
      },
      {
        id: 'post-grid-1',
        type: 'post-grid',
        props: {
          postType: 'blog',
          columns: 3,
          perPage: 9,
          showPagination: true,
          cardStyle: 'default',
        },
        children: [],
      },
    ],
  },
}
