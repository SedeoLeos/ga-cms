import { prisma } from '@/lib/db/client'
import bcrypt from 'bcryptjs'
import NextAuth from 'next-auth'
import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        // DB auth: cherche l'utilisateur par email, compare le hash
        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
            select: { id: true, email: true, name: true, passwordHash: true },
          })
          if (user?.passwordHash) {
            const valid = await bcrypt.compare(credentials.password as string, user.passwordHash)
            if (!valid) return null
            return { id: user.id, email: user.email ?? '', name: user.name ?? 'Admin' }
          }
        } catch {
          // DB indisponible — fallback env-var
        }

        // Fallback env-var (développement sans seed)
        const email = process.env.ADMIN_EMAIL
        const password = process.env.ADMIN_PASSWORD
        if (!email || !password) return null
        if (credentials.email !== email || credentials.password !== password) return null
        return { id: '1', email, name: 'Admin' }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/admin/auth/login' },
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.id = user.id
      return token
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string
      return session
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
