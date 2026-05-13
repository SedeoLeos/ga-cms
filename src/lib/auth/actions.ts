'use server'

import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export type LoginState = { error: string } | null

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    })
  } catch {
    return { error: 'Email ou mot de passe incorrect.' }
  }

  redirect('/admin')
}

export async function logoutAction(): Promise<void> {
  await auth.api.signOut({
    headers: await headers(),
  })
  redirect('/admin/auth/login')
}
