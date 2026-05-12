'use server'

import { prisma } from '@/lib/db/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const CreatePageSchema = z.object({
  siteId: z.string().min(1, 'Site requis'),
  title: z.string().min(1, 'Le titre est requis').max(200),
  slug: z
    .string()
    .min(1, "L'identifiant est requis")
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Identifiant : lettres minuscules, chiffres et tirets'),
  locale: z.string().min(2),
})

export type PageActionState = { error: string } | { success: true; id: string } | null

export async function createPageAction(
  _prev: PageActionState,
  formData: FormData,
): Promise<PageActionState> {
  const raw = {
    siteId: formData.get('siteId') as string,
    title: formData.get('title') as string,
    slug: formData.get('slug') as string,
    locale: formData.get('locale') as string,
  }

  const result = CreatePageSchema.safeParse(raw)
  if (!result.success) return { error: result.error.errors[0]?.message ?? 'Données invalides.' }

  try {
    const page = await prisma.page.create({
      data: { ...result.data, status: 'DRAFT' },
      select: { id: true },
    })
    revalidatePath('/admin/pages')
    revalidatePath('/admin')
    return { success: true, id: page.id }
  } catch {
    return { error: 'Une page avec cet identifiant existe déjà pour cette langue.' }
  }
}

export async function deletePageAction(pageId: string): Promise<void> {
  await prisma.page.delete({ where: { id: pageId } })
  revalidatePath('/admin/pages')
  revalidatePath('/admin')
}
