import type { TatomirTemplate } from '../../types'

export const landingPageTemplate: TatomirTemplate = {
  id: 'page-landing',
  name: 'Landing Page',
  version: '1.0.0',
  description: 'Hero + features + CTA — classic SaaS landing page structure',
  category: 'landing',
  tags: ['hero', 'features', 'cta', 'saas'],
  scope: 'page',
  page: {
    slug: '/',
    label: 'Home',
    isHome: true,
    blocks: [
      {
        id: 'hero-1',
        type: 'hero',
        props: {
          headline: 'Build something great',
          subheadline: 'The fastest way to launch your next project.',
          ctaLabel: 'Get started',
          ctaHref: '#',
          align: 'center',
        },
        children: [],
      },
      {
        id: 'features-1',
        type: 'features-grid',
        props: {
          columns: 3,
          items: [
            { icon: 'Zap', title: 'Fast', body: 'Built for performance from day one.' },
            { icon: 'Shield', title: 'Secure', body: 'Enterprise-grade security included.' },
            { icon: 'Globe', title: 'Global', body: 'Deploy anywhere in the world.' },
          ],
        },
        children: [],
      },
      {
        id: 'cta-1',
        type: 'cta-banner',
        props: {
          headline: 'Ready to get started?',
          ctaLabel: 'Start for free',
          ctaHref: '#',
        },
        children: [],
      },
    ],
  },
}
