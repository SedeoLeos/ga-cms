'use server'

import { prisma } from '@/lib/db/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const CreateSiteSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100),
  slug: z
    .string()
    .min(1, "L'identifiant est requis")
    .max(60)
    .regex(/^[a-z0-9-]+$/, 'Identifiant : lettres minuscules, chiffres et tirets uniquement'),
  customDomain: z.string().max(200).optional(),
})

export type SiteActionState = { error: string } | { success: true; id: string } | null

export async function createSiteAction(
  _prev: SiteActionState,
  formData: FormData,
): Promise<SiteActionState> {
  const raw = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    customDomain: (formData.get('customDomain') as string) || undefined,
  }

  const result = CreateSiteSchema.safeParse(raw)
  if (!result.success) return { error: result.error.errors[0]?.message ?? 'Données invalides.' }

  try {
    const site = await prisma.site.create({
      data: result.data,
      select: { id: true },
    })
    revalidatePath('/admin/sites')
    revalidatePath('/admin')
    return { success: true, id: site.id }
  } catch {
    return { error: 'Un site avec cet identifiant ou ce domaine existe déjà.' }
  }
}

// ─── Update ───────────────────────────────────────────────────────────

const UpdateSiteSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100),
  slug: z
    .string()
    .min(1, "L'identifiant est requis")
    .max(60)
    .regex(/^[a-z0-9-]+$/, 'Identifiant : lettres minuscules, chiffres et tirets uniquement'),
  customDomain: z.string().max(200).optional(),
  locales: z.array(z.string().min(2)).min(1, 'Au moins une langue est requise'),
  defaultLocale: z.string().min(2),
})

export type UpdateSiteState = { error: string } | { success: true } | null

export async function updateSiteAction(
  siteId: string,
  _prev: UpdateSiteState,
  formData: FormData,
): Promise<UpdateSiteState> {
  let locales: string[]
  try {
    locales = JSON.parse(formData.get('locales') as string) as string[]
  } catch {
    return { error: 'Langues invalides.' }
  }

  const raw = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    customDomain: (formData.get('customDomain') as string) || undefined,
    locales,
    defaultLocale: formData.get('defaultLocale') as string,
  }

  const result = UpdateSiteSchema.safeParse(raw)
  if (!result.success) return { error: result.error.errors[0]?.message ?? 'Données invalides.' }

  if (!result.data.locales.includes(result.data.defaultLocale)) {
    return { error: 'La langue par défaut doit faire partie des langues activées.' }
  }

  try {
    await prisma.site.update({
      where: { id: siteId },
      data: {
        name: result.data.name,
        slug: result.data.slug,
        customDomain: result.data.customDomain ?? null,
        locales: result.data.locales,
        defaultLocale: result.data.defaultLocale,
      },
    })
    revalidatePath('/admin/sites')
    revalidatePath(`/admin/sites/${siteId}`)
    revalidatePath('/admin')
    return { success: true }
  } catch {
    return { error: 'Un site avec cet identifiant ou ce domaine existe déjà.' }
  }
}

// ─── Delete ───────────────────────────────────────────────────────────

export async function deleteSiteAction(siteId: string): Promise<void> {
  await prisma.site.delete({ where: { id: siteId } })
  revalidatePath('/admin/sites')
  revalidatePath('/admin')
}
