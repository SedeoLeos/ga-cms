'use server'

import { prisma } from '@/lib/db/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const UpdateSettingsSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100),
  description: z.string().max(500).optional(),
  url: z.string().url('URL invalide').optional().or(z.literal('')),
  locales: z.array(z.string().min(2)).min(1, 'Au moins une langue est requise'),
  defaultLocale: z.string().min(2),
})

export type SettingsActionState = { error: string } | { success: true } | null

export async function updateSettingsAction(
  _prev: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  let locales: string[]
  try {
    locales = JSON.parse(formData.get('locales') as string) as string[]
  } catch {
    return { error: 'Langues invalides.' }
  }

  const raw = {
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || undefined,
    url: (formData.get('url') as string) || undefined,
    locales,
    defaultLocale: formData.get('defaultLocale') as string,
  }

  const result = UpdateSettingsSchema.safeParse(raw)
  if (!result.success) return { error: result.error.errors[0]?.message ?? 'Données invalides.' }

  if (!result.data.locales.includes(result.data.defaultLocale)) {
    return { error: 'La langue par défaut doit faire partie des langues activées.' }
  }

  await prisma.settings.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      name: result.data.name,
      description: result.data.description ?? null,
      url: result.data.url || null,
      locales: JSON.stringify(result.data.locales),
      defaultLocale: result.data.defaultLocale,
    },
    update: {
      name: result.data.name,
      description: result.data.description ?? null,
      url: result.data.url || null,
      locales: JSON.stringify(result.data.locales),
      defaultLocale: result.data.defaultLocale,
    },
  })

  revalidatePath('/admin/settings')
  revalidatePath('/admin')
  return { success: true }
}
