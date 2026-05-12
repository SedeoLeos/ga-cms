'use server'

import type { SchemaField } from '@/lib/actions/collections'
import { prisma } from '@/lib/db/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type EntryActionState = { error: string } | { success: true } | null

export async function createEntryAndRedirect(collectionId: string, locale: string): Promise<never> {
  const entry = await prisma.collectionEntry.create({
    data: { collectionId, locale, status: 'DRAFT', data: {} },
    select: { id: true },
  })
  redirect(`/admin/collections/${collectionId}/entries/${entry.id}`)
}

export async function updateEntryAction(
  entryId: string,
  _prev: EntryActionState,
  formData: FormData,
): Promise<EntryActionState> {
  const entry = await prisma.collectionEntry.findUnique({
    where: { id: entryId },
    select: {
      collectionId: true,
      collection: { select: { schema: true } },
    },
  })
  if (!entry) return { error: 'Entrée introuvable.' }

  const schema = entry.collection.schema as unknown as SchemaField[]

  let rawData: Record<string, unknown>
  try {
    rawData = JSON.parse(formData.get('data') as string) as Record<string, unknown>
  } catch {
    return { error: 'Données invalides.' }
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

  await prisma.collectionEntry.update({
    where: { id: entryId },
    data: {
      data: rawData as object,
      ...(locale ? { locale } : {}),
    },
  })
  revalidatePath(`/admin/collections/${entry.collectionId}/entries`)
  revalidatePath(`/admin/collections/${entry.collectionId}/entries/${entryId}`)
  return { success: true }
}

export async function updateEntryStatusAction(
  entryId: string,
  collectionId: string,
  status: string,
): Promise<void> {
  await prisma.collectionEntry.update({
    where: { id: entryId },
    data: { status },
  })
  revalidatePath(`/admin/collections/${collectionId}/entries`)
  revalidatePath(`/admin/collections/${collectionId}/entries/${entryId}`)
}

export async function deleteEntryAction(entryId: string, collectionId: string): Promise<void> {
  await prisma.collectionEntry.delete({ where: { id: entryId } })
  revalidatePath(`/admin/collections/${collectionId}/entries`)
}
