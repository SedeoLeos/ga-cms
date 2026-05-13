'use server'

import type { SchemaField } from '@/lib/actions/collections'
import { prisma } from '@/lib/db/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

export type PostEntryActionState = { error: string } | { success: true } | null

export async function createPostEntryAndRedirect(
  postTypeId: string,
  locale: string,
): Promise<never> {
  const entry = await prisma.postEntry.create({
    data: {
      postTypeId,
      title: 'Nouveau billet',
      slug: `nouveau-${Date.now()}`,
      locale,
      status: 'DRAFT',
      data: {},
    },
    select: { id: true },
  })
  redirect(`/admin/post-types/${postTypeId}/entries/${entry.id}`)
}

const UpdatePostEntrySchema = z.object({
  title: z.string().min(1, 'Le titre est requis').max(255),
  slug: z
    .string()
    .min(1, "L'identifiant est requis")
    .max(120)
    .regex(/^[a-z0-9-]+$/, 'Identifiant : lettres minuscules, chiffres et tirets'),
})

export async function updatePostEntryAction(
  entryId: string,
  _prev: PostEntryActionState,
  formData: FormData,
): Promise<PostEntryActionState> {
  const entry = await prisma.postEntry.findUnique({
    where: { id: entryId },
    select: {
      postTypeId: true,
      postType: { select: { schema: true } },
    },
  })
  if (!entry) return { error: 'Entrée introuvable.' }

  const meta = UpdatePostEntrySchema.safeParse({
    title: formData.get('title') as string,
    slug: formData.get('slug') as string,
  })
  if (!meta.success) return { error: meta.error.errors[0]?.message ?? 'Données invalides.' }

  const schema = entry.postType.schema as unknown as SchemaField[]
  let rawData: Record<string, unknown>
  try {
    rawData = JSON.parse(formData.get('data') as string) as Record<string, unknown>
  } catch {
    return { error: 'Données du formulaire invalides.' }
  }

  for (const field of schema) {
    const val = rawData[field.key]
    if (field.required) {
      if (field.type === 'boolean' && val === false) {
        return { error: `Le champ "${field.name}" doit être coché.` }
      }
      if (field.type !== 'boolean' && (val === null || val === undefined || val === '')) {
        return { error: `Le champ "${field.name}" est requis.` }
      }
    }
  }

  const locale = formData.get('locale') as string | null

  try {
    await prisma.postEntry.update({
      where: { id: entryId },
      data: {
        title: meta.data.title,
        slug: meta.data.slug,
        data: rawData as object,
        ...(locale ? { locale } : {}),
      },
    })
  } catch {
    return { error: 'Un billet avec cet identifiant existe déjà pour cette langue.' }
  }

  revalidatePath(`/admin/post-types/${entry.postTypeId}/entries`)
  revalidatePath(`/admin/post-types/${entry.postTypeId}/entries/${entryId}`)
  return { success: true }
}

export async function updatePostEntryStatusAction(
  entryId: string,
  postTypeId: string,
  status: string,
): Promise<void> {
  await prisma.postEntry.update({
    where: { id: entryId },
    data: { status: status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' },
  })
  revalidatePath(`/admin/post-types/${postTypeId}/entries`)
  revalidatePath(`/admin/post-types/${postTypeId}/entries/${entryId}`)
}

export async function deletePostEntryAction(entryId: string, postTypeId: string): Promise<void> {
  await prisma.postEntry.delete({ where: { id: entryId } })
  revalidatePath(`/admin/post-types/${postTypeId}/entries`)
}

export async function updatePostEntryTermsAction(
  entryId: string,
  postTypeId: string,
  termIds: string[],
): Promise<void> {
  await prisma.$transaction([
    prisma.postEntryTerm.deleteMany({ where: { entryId } }),
    ...(termIds.length > 0
      ? [
          prisma.postEntryTerm.createMany({
            data: termIds.map((termId) => ({ entryId, termId })),
          }),
        ]
      : []),
  ])
  revalidatePath(`/admin/post-types/${postTypeId}/entries/${entryId}`)
}
