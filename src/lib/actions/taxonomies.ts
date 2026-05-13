'use server'

import { prisma } from '@/lib/db/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

export type TaxonomyActionState = { error: string } | { success: true } | null

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const TaxonomySchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(80),
  slug: z
    .string()
    .min(1, "L'identifiant est requis")
    .max(80)
    .regex(/^[a-z0-9-]+$/, 'Identifiant : lettres minuscules, chiffres et tirets'),
  hierarchical: z.coerce.boolean().optional(),
})

// ─── Taxonomy CRUD ────────────────────────────────────────────────────────────

export async function createTaxonomyAction(
  _prev: TaxonomyActionState,
  formData: FormData,
): Promise<TaxonomyActionState> {
  const raw = {
    name: (formData.get('name') as string) ?? '',
    slug: (formData.get('slug') as string) || slugify((formData.get('name') as string) ?? ''),
    hierarchical: formData.get('hierarchical') === 'on',
  }
  const parsed = TaxonomySchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Données invalides.' }

  try {
    const tax = await prisma.taxonomy.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        hierarchical: parsed.data.hierarchical ?? false,
      },
      select: { id: true },
    })
    revalidatePath('/admin/taxonomies')
    redirect(`/admin/taxonomies/${tax.id}`)
  } catch {
    return { error: 'Une taxonomie avec cet identifiant existe déjà.' }
  }
}

export async function updateTaxonomyAction(
  taxonomyId: string,
  _prev: TaxonomyActionState,
  formData: FormData,
): Promise<TaxonomyActionState> {
  const raw = {
    name: (formData.get('name') as string) ?? '',
    slug: (formData.get('slug') as string) ?? '',
    hierarchical: formData.get('hierarchical') === 'on',
  }
  const parsed = TaxonomySchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Données invalides.' }

  try {
    await prisma.taxonomy.update({
      where: { id: taxonomyId },
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        hierarchical: parsed.data.hierarchical ?? false,
      },
    })
  } catch {
    return { error: 'Une taxonomie avec cet identifiant existe déjà.' }
  }

  revalidatePath('/admin/taxonomies')
  revalidatePath(`/admin/taxonomies/${taxonomyId}`)
  return { success: true }
}

export async function deleteTaxonomyAction(taxonomyId: string): Promise<void> {
  await prisma.taxonomy.delete({ where: { id: taxonomyId } })
  revalidatePath('/admin/taxonomies')
  redirect('/admin/taxonomies')
}

// ─── Term CRUD ────────────────────────────────────────────────────────────────

const TermSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(120),
  slug: z
    .string()
    .min(1, "L'identifiant est requis")
    .max(120)
    .regex(/^[a-z0-9-]+$/, 'Identifiant : lettres minuscules, chiffres et tirets'),
  parentId: z.string().optional(),
})

export async function createTermAction(
  taxonomyId: string,
  _prev: TaxonomyActionState,
  formData: FormData,
): Promise<TaxonomyActionState> {
  const raw = {
    name: (formData.get('name') as string) ?? '',
    slug: (formData.get('slug') as string) || slugify((formData.get('name') as string) ?? ''),
    parentId: (formData.get('parentId') as string) || undefined,
  }
  const parsed = TermSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Données invalides.' }

  try {
    await prisma.term.create({
      data: {
        taxonomyId,
        name: parsed.data.name,
        slug: parsed.data.slug,
        parentId: parsed.data.parentId ?? null,
      },
    })
  } catch {
    return { error: 'Un terme avec cet identifiant existe déjà dans cette taxonomie.' }
  }

  revalidatePath(`/admin/taxonomies/${taxonomyId}`)
  return { success: true }
}

export async function updateTermAction(
  termId: string,
  taxonomyId: string,
  _prev: TaxonomyActionState,
  formData: FormData,
): Promise<TaxonomyActionState> {
  const raw = {
    name: (formData.get('name') as string) ?? '',
    slug: (formData.get('slug') as string) ?? '',
    parentId: (formData.get('parentId') as string) || undefined,
  }
  const parsed = TermSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Données invalides.' }

  try {
    await prisma.term.update({
      where: { id: termId },
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        parentId: parsed.data.parentId ?? null,
      },
    })
  } catch {
    return { error: 'Un terme avec cet identifiant existe déjà.' }
  }

  revalidatePath(`/admin/taxonomies/${taxonomyId}`)
  return { success: true }
}

export async function deleteTermAction(termId: string, taxonomyId: string): Promise<void> {
  await prisma.term.delete({ where: { id: termId } })
  revalidatePath(`/admin/taxonomies/${taxonomyId}`)
}

// ─── Post type associations ───────────────────────────────────────────────────

export async function togglePostTypeTaxonomyAction(
  postTypeId: string,
  taxonomyId: string,
  attached: boolean,
): Promise<void> {
  if (attached) {
    await prisma.postTypeTaxonomy.delete({
      where: { postTypeId_taxonomyId: { postTypeId, taxonomyId } },
    })
  } else {
    await prisma.postTypeTaxonomy.create({ data: { postTypeId, taxonomyId } })
  }
  revalidatePath(`/admin/post-types/${postTypeId}`)
  revalidatePath(`/admin/taxonomies/${taxonomyId}`)
}
