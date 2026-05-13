import { prisma } from '@/lib/db/client'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { nextCookies } from 'better-auth/next-js'

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
    // cookieCache désactivé : quand le cookie de cache a une signature
    // HMAC invalide (secret changé, cookie corrompu), Better Auth retourne
    // null sans vérifier le vrai token en base — ce qui cause une
    // déconnexion fantôme. Sans cache, chaque appel getSession() va
    // directement en BDD, ce qui est fiable.
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL ?? 'http://localhost:3000'],
  // CRITIQUE : sans ce plugin, auth.api.signInEmail() appelé depuis une
  // server action crée la session en BDD mais ne renvoie PAS le cookie
  // Set-Cookie au navigateur → boucle de redirection infinie sur login.
  // Doit rester le dernier plugin (il intercepte les headers de réponse).
  plugins: [nextCookies()],
})
