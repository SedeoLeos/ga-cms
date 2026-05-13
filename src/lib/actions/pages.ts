'use server'

import { prisma } from '@/lib/db/client'
import { Prisma } from '@prisma/client'
import { SignJWT } from 'jose'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const CreatePageSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').max(200),
  slug: z
    .string()
    .min(1, "L'identifiant est requis")
    .max(200)
    .regex(/^[a-z0-9-/]+$/, 'Identifiant : lettres minuscules, chiffres, tirets et /'),
  locale: z.string().min(2),
})

export type PageActionState = { error: string } | { success: true; id: string } | null

export async function createPageAction(
  _prev: PageActionState,
  formData: FormData,
): Promise<PageActionState> {
  const raw = {
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

export async function savePageDraftAction(
  pageId: string,
  data: Record<string, unknown>,
): Promise<{ success: true } | { error: string }> {
  try {
    await prisma.page.update({
      where: { id: pageId },
      data: { draftJson: data as Prisma.InputJsonValue },
    })
    return { success: true }
  } catch {
    return { error: 'Erreur lors de la sauvegarde.' }
  }
}

export async function publishPageAction(
  pageId: string,
): Promise<{ success: true } | { error: string }> {
  try {
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      select: { draftJson: true },
    })
    if (!page) return { error: 'Page introuvable.' }

    await prisma.page.update({
      where: { id: pageId },
      data: {
        status: 'PUBLISHED',
        publishedJson: page.draftJson ?? Prisma.JsonNull,
        publishedAt: new Date(),
      },
    })

    if (page.draftJson) {
      await prisma.pageRevision.create({
        data: { pageId, json: page.draftJson },
      })
    }

    revalidatePath('/admin/pages')
    revalidatePath('/', 'layout')
    return { success: true }
  } catch {
    return { error: 'Erreur lors de la publication.' }
  }
}

export async function generatePreviewTokenAction(
  pageId: string,
): Promise<{ url: string } | { error: string }> {
  const secret = process.env.BETTER_AUTH_SECRET
  if (!secret) return { error: 'BETTER_AUTH_SECRET non configuré.' }

  const page = await prisma.page.findUnique({
    where: { id: pageId },
    select: { id: true },
  })
  if (!page) return { error: 'Page introuvable.' }

  const token = await new SignJWT({ pageId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(new TextEncoder().encode(secret))

  const base = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000'
  return { url: `${base}/preview/${token}` }
}
