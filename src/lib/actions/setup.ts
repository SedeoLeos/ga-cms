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
  } catch (e) {
    const msg = e instanceof Error ? e.message : ''
    if (msg.includes('already exists') || msg.includes('unique')) {
      return { error: 'Cet email est déjà utilisé.' }
    }
    return { error: 'Erreur lors de la création du compte.' }
  }

  redirect('/admin/auth/login?setup=1')
}
