'use server'

import { prisma } from '@/lib/db/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const CreateCollectionSchema = z.object({
  siteId: z.string().min(1, 'Site requis'),
  name: z.string().min(1, 'Le nom est requis').max(100),
  slug: z
    .string()
    .min(1, "L'identifiant est requis")
    .max(60)
    .regex(/^[a-z0-9-]+$/, 'Identifiant : lettres minuscules, chiffres et tirets'),
  description: z.string().max(500).optional(),
})

export type CollectionActionState = { error: string } | { success: true; id: string } | null

export async function createCollectionAction(
  _prev: CollectionActionState,
  formData: FormData,
): Promise<CollectionActionState> {
  const raw = {
    siteId: formData.get('siteId') as string,
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    description: (formData.get('description') as string) || undefined,
  }

  const result = CreateCollectionSchema.safeParse(raw)
  if (!result.success) return { error: result.error.errors[0]?.message ?? 'Données invalides.' }

  try {
    const col = await prisma.collection.create({
      data: { ...result.data, schema: [] },
      select: { id: true },
    })
    revalidatePath('/admin/collections')
    revalidatePath('/admin')
    return { success: true, id: col.id }
  } catch {
    return { error: 'Une collection avec cet identifiant existe déjà sur ce site.' }
  }
}

export async function deleteCollectionAction(collectionId: string): Promise<void> {
  await prisma.collection.delete({ where: { id: collectionId } })
  revalidatePath('/admin/collections')
  revalidatePath('/admin')
}
