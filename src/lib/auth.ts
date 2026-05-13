import { prisma } from '@/lib/db/client'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'

type SupportedProvider = 'postgresql' | 'mysql' | 'sqlite'

const DB_PROVIDER = (process.env.DATABASE_PROVIDER ?? 'postgresql') as SupportedProvider

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: DB_PROVIDER }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 jours
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL ?? 'http://localhost:3000'],
})
