import { type NextRequest, NextResponse } from 'next/server'

/**
 * proxy.ts — Next.js 16 network boundary layer
 * Handles:
 *   - Admin / Studio session protection (Better Auth)
 *   - Preview token passthrough
 *   - Site routes pass through as-is (no locale prefix in URLs)
 */

const ADMIN_PATHS = ['/admin', '/studio']
const PUBLIC_ADMIN_PATHS = ['/admin/auth/login', '/admin/auth/forgot-password']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    const isPublic = PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p))
    if (!isPublic) {
      const hasSession =
        request.cookies.has('better-auth.session_token') ||
        request.cookies.has('__Secure-better-auth.session_token')
      if (!hasSession) {
        const loginUrl = new URL('/admin/auth/login', request.url)
        loginUrl.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(loginUrl)
      }
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2)).*)',
  ],
}
