import NextAuth from 'next-auth'
import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        // Sprint S1: env-var credentials — no DB required
        // Sprint S2: replace with:
        //   const user = await prisma.user.findUnique({ where: { email: credentials.email as string } })
        //   if (!user || !(await bcrypt.compare(credentials.password as string, user.passwordHash))) return null
        //   return { id: user.id, email: user.email, name: user.name }
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
