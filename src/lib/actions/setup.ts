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
    // Better Auth gère le hachage du mot de passe avec son propre algorithme
    await auth.api.signUpEmail({
      body: { name, email, password },
      headers: await headers(),
    })

    await prisma.settings.upsert({
      where: { id: 1 },
      update: {},
      create: { name: 'Mon Site', locales: '["fr"]', defaultLocale: 'fr' },
    })

    const homePageData = {
      content: [
        {
          type: 'Hero',
          props: {
            id: 'hero-home',
            title: 'Bienvenue',
            subtitle:
              "Découvrez notre plateforme et tout ce qu'elle peut faire pour vous. Rapide, sécurisée et facile à prendre en main.",
            align: 'center',
            background: '#ffffff',
            minHeight: '70vh',
            ctaLabel: 'Découvrir',
            ctaHref: '#features',
          },
        },
        {
          type: 'Features',
          props: {
            id: 'features-home',
            title: 'Pourquoi nous choisir ?',
            subtitle: 'Des fonctionnalités pensées pour vous simplifier la vie.',
            columns: '3',
            background: '#f9fafb',
            items: [
              {
                icon: '⚡',
                title: 'Rapide',
                description:
                  'Une interface optimisée pour des performances maximales, quelle que soit la taille de votre contenu.',
              },
              {
                icon: '🔒',
                title: 'Sécurisé',
                description:
                  'Authentification robuste, contrôle des accès et données protégées à chaque étape.',
              },
              {
                icon: '🛠️',
                title: 'Simple à utiliser',
                description:
                  'Prise en main immédiate grâce à une interface claire, sans compromis sur la puissance.',
              },
            ],
          },
        },
      ],
      root: { props: {} },
    }

    await prisma.page.upsert({
      where: { slug_locale: { slug: 'index', locale: 'fr' } },
      update: {},
      create: {
        title: 'Accueil',
        slug: 'index',
        locale: 'fr',
        status: 'PUBLISHED',
        draftJson: homePageData,
        publishedJson: homePageData,
      },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : ''
    if (msg.includes('already exists') || msg.includes('unique')) {
      return { error: 'Cet email est déjà utilisé.' }
    }
    return { error: 'Erreur lors de la création du compte.' }
  }

  redirect('/admin/auth/login?setup=1')
}
