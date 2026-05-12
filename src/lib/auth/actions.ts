'use server'

import { AuthError } from 'next-auth'
import { signIn, signOut } from './config'

export type LoginState = { error: string } | null

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  try {
    await signIn('credentials', {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      redirectTo: '/admin',
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Incorrect email or password.' }
    }
    // signIn throws a NEXT_REDIRECT on success — must re-throw
    throw error
  }
  return null
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: '/admin/auth/login' })
}
