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

export async function deleteSiteAction(siteId: string): Promise<void> {
  await prisma.site.delete({ where: { id: siteId } })
  revalidatePath('/admin/sites')
  revalidatePath('/admin')
}
