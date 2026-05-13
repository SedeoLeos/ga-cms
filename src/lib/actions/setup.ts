'use server'

import { prisma } from '@/lib/db/client'
import bcrypt from 'bcryptjs'
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
  // Security: refuse if any user already exists
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
    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: { name, email, emailVerified: true },
    })

    await prisma.account.create({
      data: {
        accountId: user.id,
        providerId: 'credential',
        userId: user.id,
        password: passwordHash,
      },
    })

    // Default settings (won't exist yet on first run)
    await prisma.settings.upsert({
      where: { id: 1 },
      update: {},
      create: { name: 'Mon Site', locales: '["fr"]', defaultLocale: 'fr' },
    })
  } catch {
    return { error: 'Erreur lors de la création du compte.' }
  }

  redirect('/admin/auth/login?setup=1')
}
