'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/client'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const SetupSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Mot de passe : 8 caractères minimum'),
  confirmPassword: z.string(),
})

export type SetupActionState = { error: string } | null

// ─── Default page content ────────────────────────────────────────────────────

const homePage = {
  content: [
    {
      type: 'Hero',
      props: {
        id: 'hero-home',
        title: 'Créez votre présence web, sans compromis.',
        subtitle:
          'Un CMS puissant, visuel et open-source. Conçu pour les équipes qui veulent publier vite et bien.',
        align: 'center',
        background: '#ffffff',
        minHeight: '75vh',
        ctaLabel: 'Découvrir les fonctionnalités',
        ctaHref: '#features-home',
        ctaSecondLabel: 'En savoir plus',
        ctaSecondHref: '/about',
      },
    },
    {
      type: 'Features',
      props: {
        id: 'features-home',
        title: 'Tout ce dont vous avez besoin',
        subtitle:
          "GA CMS réunit les fonctionnalités essentielles d'un CMS moderne en une solution cohérente.",
        columns: '3',
        background: '#f8fafc',
        items: [
          {
            icon: '⚡',
            title: 'Ultra rapide',
            description:
              'Pages servies en statique, rechargement instantané, scores Lighthouse au maximum.',
          },
          {
            icon: '✏️',
            title: 'Éditeur visuel',
            description:
              'Glissez-déposez vos blocs, prévisualisez en temps réel, publiez en un clic.',
          },
          {
            icon: '🔒',
            title: 'Sécurisé par défaut',
            description: 'Authentification robuste, sessions en base, accès granulaires par rôle.',
          },
          {
            icon: '🌐',
            title: 'Multi-langue',
            description:
              'Gérez plusieurs langues depuis un seul tableau de bord, sans plugin supplémentaire.',
          },
          {
            icon: '📦',
            title: 'Types de contenu',
            description:
              'Créez vos propres structures de contenu avec des champs entièrement personnalisés.',
          },
          {
            icon: '🛠️',
            title: 'Open Source',
            description: 'Code source accessible, self-hosted, 100 % sous votre contrôle.',
          },
        ],
      },
    },
  ],
  root: { props: {} },
}

const aboutPage = {
  content: [
    {
      type: 'Hero',
      props: {
        id: 'hero-about',
        title: 'À propos de nous',
        subtitle:
          'Nous construisons des outils qui redonnent le contrôle aux créateurs de contenu, sans dépendance aux plateformes tierces.',
        align: 'center',
        background: '#f8fafc',
        minHeight: '50vh',
        ctaLabel: 'Nous contacter',
        ctaHref: '/contact',
        ctaSecondLabel: '',
        ctaSecondHref: '#',
      },
    },
    {
      type: 'Features',
      props: {
        id: 'features-about',
        title: 'Nos valeurs',
        subtitle: 'Ce qui guide chacune de nos décisions de conception et de développement.',
        columns: '3',
        background: '#ffffff',
        items: [
          {
            icon: '🎯',
            title: 'Simplicité',
            description:
              "Chaque fonctionnalité doit être compréhensible en 30 secondes. La complexité n'est jamais une option.",
          },
          {
            icon: '🔓',
            title: 'Liberté',
            description:
              'Vos données vous appartiennent. Exportez, migrez, hébergez où vous voulez, quand vous voulez.',
          },
          {
            icon: '🚀',
            title: 'Performance',
            description:
              'Nous ne faisons aucun compromis sur la vitesse. Chaque milliseconde compte pour vos utilisateurs.',
          },
        ],
      },
    },
    {
      type: 'Features',
      props: {
        id: 'features-about-2',
        title: 'Notre histoire',
        subtitle:
          "GA CMS est né d'une frustration simple : les CMS existants étaient soit trop rigides, soit trop complexes.",
        columns: '2',
        background: '#f8fafc',
        items: [
          {
            icon: '💡',
            title: "L'idée",
            description:
              "Créer un CMS headless avec un éditeur visuel de qualité, open-source, déployable en 5 minutes sur n'importe quelle infrastructure.",
          },
          {
            icon: '🤝',
            title: 'La mission',
            description:
              "Permettre à n'importe quelle équipe — développeurs comme non-techniques — de gérer un site web sans friction.",
          },
        ],
      },
    },
  ],
  root: { props: {} },
}

const contactPage = {
  content: [
    {
      type: 'Hero',
      props: {
        id: 'hero-contact',
        title: 'Parlons de votre projet',
        subtitle:
          'Une question, une suggestion ou envie de collaborer ? Nous répondons sous 24 heures.',
        align: 'center',
        background: '#eff6ff',
        minHeight: '50vh',
        ctaLabel: '',
        ctaHref: '#',
        ctaSecondLabel: '',
        ctaSecondHref: '#',
      },
    },
    {
      type: 'Features',
      props: {
        id: 'features-contact',
        title: 'Nous contacter',
        subtitle: 'Choisissez le canal qui vous convient le mieux.',
        columns: '3',
        background: '#ffffff',
        items: [
          {
            icon: '✉️',
            title: 'Email',
            description:
              'Envoyez-nous un message à contact@monsite.fr. Réponse garantie sous 24 h en jours ouvrés.',
          },
          {
            icon: '📞',
            title: 'Téléphone',
            description: 'Disponibles du lundi au vendredi, de 9 h à 18 h. +33 (0)1 00 00 00 00.',
          },
          {
            icon: '📍',
            title: 'Adresse',
            description: "42 rue de l'Innovation, 75001 Paris, France.",
          },
        ],
      },
    },
    {
      type: 'Features',
      props: {
        id: 'features-contact-faq',
        title: 'Questions fréquentes',
        subtitle: "Les réponses aux questions qu'on nous pose le plus souvent.",
        columns: '2',
        background: '#f8fafc',
        items: [
          {
            icon: '❓',
            title: 'GA CMS est-il gratuit ?',
            description:
              "Oui, GA CMS est entièrement open-source et gratuit. Vous pouvez l'héberger vous-même sans aucun frais de licence.",
          },
          {
            icon: '🖥️',
            title: 'Quels hébergeurs sont supportés ?',
            description:
              'Vercel, Netlify, Railway, un VPS classique — tout serveur capable de faire tourner Node.js convient parfaitement.',
          },
          {
            icon: '🗄️',
            title: 'Quelles bases de données ?',
            description:
              'PostgreSQL, MySQL et SQLite sont supportés nativement via Prisma. Configurez simplement la variable DATABASE_URL.',
          },
          {
            icon: '🔧',
            title: 'Comment personnaliser les blocs ?',
            description:
              'Les blocs Puck sont définis dans src/lib/puck/config.tsx. Ajoutez, modifiez ou supprimez des blocs selon vos besoins.',
          },
        ],
      },
    },
  ],
  root: { props: {} },
}

// ─── Action ──────────────────────────────────────────────────────────────────

export async function setupAction(
  _prev: SetupActionState,
  formData: FormData,
): Promise<SetupActionState> {
  const count = await prisma.user.count()
  if (count > 0) return { error: 'Un compte admin existe déjà.' }

  const raw = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
  }

  const result = SetupSchema.safeParse(raw)
  if (!result.success) return { error: result.error.errors[0]?.message ?? 'Données invalides.' }

  if (result.data.password !== result.data.confirmPassword) {
    return { error: 'Les mots de passe ne correspondent pas.' }
  }

  const { name, email, password } = result.data

  try {
    await auth.api.signUpEmail({
      body: { name, email, password },
      headers: await headers(),
    })

    await prisma.settings.upsert({
      where: { id: 1 },
      update: {},
      create: { name: 'Mon Site', locales: '["fr"]', defaultLocale: 'fr' },
    })

    const pages = [
      { slug: 'index', locale: 'fr', title: 'Accueil', data: homePage },
      { slug: 'about', locale: 'fr', title: 'À propos', data: aboutPage },
      { slug: 'contact', locale: 'fr', title: 'Contact', data: contactPage },
    ]

    for (const page of pages) {
      await prisma.page.upsert({
        where: { slug_locale: { slug: page.slug, locale: page.locale } },
        update: {},
        create: {
          title: page.title,
          slug: page.slug,
          locale: page.locale,
          status: 'PUBLISHED',
          draftJson: page.data,
          publishedJson: page.data,
        },
      })
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : ''
    if (msg.includes('already exists') || msg.includes('unique')) {
      return { error: 'Cet email est déjà utilisé.' }
    }
    return { error: 'Erreur lors de la création du compte.' }
  }

  redirect('/admin/auth/login?setup=1')
}
