'use server'

import { prisma } from '@/lib/db/client'
import { FieldSchemaZ } from '@/lib/schema/fields'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const CreateCollectionSchema = z.object({
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
    return { error: 'Une collection avec cet identifiant existe déjà.' }
  }
}

export async function deleteCollectionAction(collectionId: string): Promise<void> {
  await prisma.collection.delete({ where: { id: collectionId } })
  revalidatePath('/admin/collections')
  revalidatePath('/admin')
}

// ─── Schema Builder ───────────────────────────────────────────────────────────

export type FieldType =
  | 'text'
  | 'textarea'
  | 'richtext'
  | 'number'
  | 'boolean'
  | 'date'
  | 'select'
  | 'media'
  | 'relation'

export interface SchemaField {
  id: string
  type: FieldType
  name: string
  key: string
  required: boolean
  description?: string
  options?: string[]
  multiple?: boolean
  relatedCollectionId?: string
}

export type SchemaActionState = { error: string } | { success: true } | null

export async function updateCollectionSchemaAction(
  collectionId: string,
  _prev: SchemaActionState,
  formData: FormData,
): Promise<SchemaActionState> {
  const raw = formData.get('schema') as string
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { error: 'Schéma JSON invalide.' }
  }

  const result = z.array(FieldSchemaZ).safeParse(parsed)
  if (!result.success) return { error: result.error.errors[0]?.message ?? 'Schéma invalide.' }

  const keys = result.data.map((f) => f.key)
  if (new Set(keys).size !== keys.length)
    return { error: 'Les clés de champs doivent être uniques.' }

  await prisma.collection.update({
    where: { id: collectionId },
    data: { schema: result.data as object[] },
  })
  revalidatePath(`/admin/collections/${collectionId}`)
  return { success: true }
}
