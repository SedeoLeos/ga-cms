import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

/**
 * Strips the `better-auth.session_data` cookie (the cookie-cache payload)
 * from the outgoing headers before calling auth.api.getSession().
 *
 * Why: Better Auth reads and HMAC-validates the session_data cookie before
 * checking `cookieCache.enabled`. If the cookie is present but its signature
 * is invalid (secret rotation, stale cookie from a previous config), Better
 * Auth returns null immediately — without ever querying the database. Removing
 * the cookie forces a direct DB lookup every time, which is reliable.
 */
function stripSessionDataCookie(raw: Headers): Headers {
  const cookieHeader = raw.get('cookie')
  if (!cookieHeader) return raw

  const cleaned = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .filter(
      (c) =>
        !c.startsWith('better-auth.session_data') &&
        !c.startsWith('__Secure-better-auth.session_data'),
    )
    .join('; ')

  if (cleaned === cookieHeader) return raw // nothing stripped — reuse original

  const h = new Headers(raw)
  h.set('cookie', cleaned)
  return h
}

export async function getSession() {
  const h = stripSessionDataCookie(await headers())
  return auth.api.getSession({ headers: h })
}

export async function requireSession() {
  const session = await getSession()
  if (!session) throw new Error('Non authentifié')
  return session
}
