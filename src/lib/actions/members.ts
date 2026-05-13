'use server'

import { prisma } from '@/lib/db/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const InviteMemberSchema = z.object({
  email: z.string().email('Email invalide'),
  name: z.string().max(100).optional(),
})

export type MemberActionState = { error: string } | { success: true } | null

export async function inviteMemberAction(
  _prev: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const raw = {
    email: formData.get('email') as string,
    name: (formData.get('name') as string) || undefined,
  }

  const result = InviteMemberSchema.safeParse(raw)
  if (!result.success) return { error: result.error.errors[0]?.message ?? 'Données invalides.' }

  try {
    await prisma.siteMember.create({
      data: {
        email: result.data.email.toLowerCase(),
        name: result.data.name ?? null,
      },
    })
  } catch {
    return { error: 'Un membre avec cet email existe déjà.' }
  }

  revalidatePath('/admin/members')
  return { success: true }
}

export async function deleteMemberAction(memberId: string): Promise<void> {
  await prisma.siteMember.delete({ where: { id: memberId } })
  revalidatePath('/admin/members')
}

export async function toggleMemberVerifiedAction(
  memberId: string,
  verified: boolean,
): Promise<void> {
  await prisma.siteMember.update({
    where: { id: memberId },
    data: { emailVerified: verified },
  })
  revalidatePath('/admin/members')
}
