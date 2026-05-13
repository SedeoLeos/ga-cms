'use server'

import { prisma } from '@/lib/db/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const CreateGlobalBlockSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100),
  category: z.string().max(60).optional(),
})

export type GlobalBlockActionState = { error: string } | { success: true; id: string } | null

export async function createGlobalBlockAction(
  _prev: GlobalBlockActionState,
  formData: FormData,
): Promise<GlobalBlockActionState> {
  const raw = {
    name: formData.get('name') as string,
    category: (formData.get('category') as string) || undefined,
  }

  const result = CreateGlobalBlockSchema.safeParse(raw)
  if (!result.success) return { error: result.error.errors[0]?.message ?? 'Données invalides.' }

  try {
    const block = await prisma.globalBlock.create({
      data: { ...result.data, masterJson: {} },
      select: { id: true },
    })
    revalidatePath('/admin/global-blocks')
    revalidatePath('/admin')
    return { success: true, id: block.id }
  } catch {
    return { error: 'Erreur lors de la création du bloc.' }
  }
}

export async function deleteGlobalBlockAction(blockId: string): Promise<void> {
  await prisma.globalBlock.delete({ where: { id: blockId } })
  revalidatePath('/admin/global-blocks')
}

export async function updateGlobalBlockMetaAction(
  blockId: string,
  name: string,
  category: string,
): Promise<{ error?: string }> {
  const trimmed = name.trim()
  if (!trimmed) return { error: 'Nom requis' }
  await prisma.globalBlock.update({
    where: { id: blockId },
    data: { name: trimmed, category: category.trim() || null },
  })
  revalidatePath('/admin/global-blocks')
  return {}
}
