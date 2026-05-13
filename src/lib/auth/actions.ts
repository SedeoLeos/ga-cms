'use server'

import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export type LoginState = { error: string } | null

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const callbackUrl = (formData.get('callbackUrl') as string) || '/admin'

  try {
    await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    })
  } catch {
    return { error: 'Email ou mot de passe incorrect.' }
  }

  redirect(callbackUrl.startsWith('/') ? callbackUrl : '/admin')
}

export async function logoutAction(): Promise<void> {
  try {
    await auth.api.signOut({ headers: await headers() })
  } catch {
    // ignore
  }
  redirect('/admin/auth/login')
}
