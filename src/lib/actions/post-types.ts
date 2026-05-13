'use server'

import { prisma } from '@/lib/db/client'
import { FieldSchemaZ } from '@/lib/schema/fields'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { SchemaActionState } from './collections'

const CreatePostTypeSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100),
  slug: z
    .string()
    .min(1, "L'identifiant est requis")
    .max(60)
    .regex(/^[a-z0-9-]+$/, 'Identifiant : lettres minuscules, chiffres et tirets'),
  description: z.string().max(500).optional(),
})

export type PostTypeActionState = { error: string } | { success: true; id: string } | null

export async function createPostTypeAction(
  _prev: PostTypeActionState,
  formData: FormData,
): Promise<PostTypeActionState> {
  const raw = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    description: (formData.get('description') as string) || undefined,
  }

  const result = CreatePostTypeSchema.safeParse(raw)
  if (!result.success) return { error: result.error.errors[0]?.message ?? 'Données invalides.' }

  try {
    const pt = await prisma.postType.create({
      data: { ...result.data, schema: [] },
      select: { id: true },
    })
    revalidatePath('/admin/post-types')
    revalidatePath('/admin')
    return { success: true, id: pt.id }
  } catch {
    return { error: 'Un post type avec cet identifiant existe déjà.' }
  }
}

export async function deletePostTypeAction(postTypeId: string): Promise<void> {
  await prisma.postType.delete({ where: { id: postTypeId } })
  revalidatePath('/admin/post-types')
  revalidatePath('/admin')
}

export async function updatePostTypeSchemaAction(
  postTypeId: string,
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

  await prisma.postType.update({
    where: { id: postTypeId },
    data: { schema: result.data as object[] },
  })
  revalidatePath(`/admin/post-types/${postTypeId}`)
  return { success: true }
}
