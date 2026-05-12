import { blogPageTemplate } from './pages/blog'
import { landingPageTemplate } from './pages/landing'
import { templateRegistry } from './registry'
import { blogSiteTemplate } from './sites/blog-site'
import { portfolioSiteTemplate } from './sites/portfolio'

export function registerBuiltInTemplates() {
  templateRegistry.register(landingPageTemplate)
  templateRegistry.register(blogPageTemplate)
  templateRegistry.register(blogSiteTemplate)
  templateRegistry.register(portfolioSiteTemplate)
}

export { templateRegistry }
export * from './types'
