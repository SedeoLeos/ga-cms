import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const passwordHash = await bcrypt.hash('password123', 12)

  const user = await prisma.user.upsert({
    where: { email: 'admin@tatomir.local' },
    update: {},
    create: {
      email: 'admin@tatomir.local',
      name: 'Admin',
      passwordHash,
      locale: 'en',
    },
  })

  const site = await prisma.site.upsert({
    where: { slug: 'my-site' },
    update: {},
    create: {
      name: 'My Site',
      slug: 'my-site',
      locales: ['en', 'fr'],
      defaultLocale: 'en',
      memberships: {
        create: { userId: user.id, role: 'OWNER' },
      },
    },
  })

  // Seed built-in post types
  const builtInPostTypes = [
    { name: 'Blog', slug: 'blog-post', icon: 'BookOpen', hasRss: true },
    { name: 'Portfolio', slug: 'portfolio', icon: 'Briefcase', hasRss: false },
    { name: 'Team', slug: 'team-member', icon: 'Users', hasRss: false },
    { name: 'Testimonials', slug: 'testimonial', icon: 'MessageSquare', hasRss: false },
    { name: 'FAQ', slug: 'faq', icon: 'HelpCircle', hasRss: false },
    { name: 'Events', slug: 'event', icon: 'Calendar', hasRss: true },
    { name: 'Jobs', slug: 'job', icon: 'Briefcase', hasRss: false },
  ]

  for (const pt of builtInPostTypes) {
    await prisma.postType.upsert({
      where: { siteId_slug: { siteId: site.id, slug: pt.slug } },
      update: {},
      create: {
        siteId: site.id,
        name: pt.name,
        slug: pt.slug,
        icon: pt.icon,
        isBuiltIn: true,
        hasRss: pt.hasRss,
        schema: [],
      },
    })
  }

  // Default home page
  await prisma.page.upsert({
    where: { siteId_slug_locale: { siteId: site.id, slug: 'index', locale: 'en' } },
    update: {},
    create: {
      siteId: site.id,
      title: 'Home',
      slug: 'index',
      locale: 'en',
      status: 'DRAFT',
      draftJson: { version: 1, root: { type: 'body', id: 'root', children: [] } },
    },
  })

  console.log(`Seeded: user=${user.email}, site=${site.slug}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
