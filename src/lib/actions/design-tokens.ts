'use server'

import { TOKEN_TYPES } from '@/lib/constants/design-tokens'
import { prisma } from '@/lib/db/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const TokenSchema = z.object({
  name: z
    .string()
    .min(1, 'Nom requis')
    .max(60)
    .regex(/^[a-z][a-z0-9-]*$/, 'Nom : minuscules, chiffres, tirets'),
  value: z.string().min(1, 'Valeur requise').max(300),
  type: z.enum(TOKEN_TYPES, { message: 'Type invalide' }),
})

export type DesignTokenActionState = { error: string } | { success: true } | null

export async function upsertDesignTokenAction(
  _prev: DesignTokenActionState,
  formData: FormData,
): Promise<DesignTokenActionState> {
  const raw = {
    name: formData.get('name') as string,
    value: formData.get('value') as string,
    type: formData.get('type') as string,
  }

  const result = TokenSchema.safeParse(raw)
  if (!result.success) return { error: result.error.errors[0]?.message ?? 'Données invalides.' }

  try {
    await prisma.designToken.upsert({
      where: { name: result.data.name },
      create: result.data,
      update: { value: result.data.value, type: result.data.type },
    })
  } catch {
    return { error: 'Erreur lors de la sauvegarde.' }
  }

  revalidatePath('/admin/design-system')
  return { success: true }
}

export async function deleteDesignTokenAction(tokenId: string): Promise<void> {
  await prisma.designToken.delete({ where: { id: tokenId } })
  revalidatePath('/admin/design-system')
  revalidatePath('/api/tokens')
}
