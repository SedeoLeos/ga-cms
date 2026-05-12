import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Charge .env.local SYNCHRONÉMENT avant tout import dépendant de l'env
for (const file of ['.env.local', '.env']) {
  const path = resolve(process.cwd(), file)
  if (existsSync(path)) {
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const match = line.match(/^([^#=\s][^=]*)\s*=\s*(.*)$/)
      if (match) {
        const key = (match[1] ?? '').trim()
        const val = (match[2] ?? '').trim().replace(/^["']|["']$/g, '')
        if (!process.env[key]) process.env[key] = val
      }
    }
    break
  }
}

// Imports dynamiques — s'exécutent APRÈS le chargement de l'env
async function main() {
  const { prisma } = await import('../src/lib/db/client')
  const { default: bcrypt } = await import('bcryptjs')

  const email = process.argv[2] ?? 'admin@tatomir.local'
  const password = process.argv[3] ?? 'admin'

  console.log(`[seed] Création de l'admin : ${email}`)

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, name: 'Admin', passwordHash, locale: 'en' },
  })

  const site = await prisma.site.upsert({
    where: { slug: 'my-site' },
    update: {},
    create: {
      name: 'My Site',
      slug: 'my-site',
      locales: ['en', 'fr'],
      defaultLocale: 'en',
      memberships: { create: { userId: user.id, role: 'OWNER' } },
    },
  })

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
      create: { siteId: site.id, ...pt, isBuiltIn: true, schema: [] },
    })
  }

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

  console.log(`[seed] OK — user=${user.email}, site=${site.slug}`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
