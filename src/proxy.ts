import { type NextRequest, NextResponse } from 'next/server'

/**
 * proxy.ts — Next.js 16 network boundary layer
 * Handles:
 *   - Admin / Studio session protection (Better Auth)
 *   - Locale detection and redirect for site routes
 *   - Preview token passthrough
 */

const ADMIN_PATHS = ['/admin', '/studio']
const PUBLIC_ADMIN_PATHS = ['/admin/auth/login', '/admin/auth/forgot-password']
const PREVIEW_PATH = '/preview'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith(PREVIEW_PATH)) {
    return NextResponse.next()
  }

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

  return handleLocale(request)
}

function handleLocale(request: NextRequest) {
  const { pathname } = request.nextUrl
  const supported = (process.env.SUPPORTED_LOCALES ?? 'fr').split(',').map((l) => l.trim())
  const defaultLocale = process.env.DEFAULT_LOCALE ?? 'fr'

  if (supported.some((l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`)) {
    return NextResponse.next()
  }

  // Root path and setup path handled by their own pages
  if (pathname === '/' || pathname.startsWith('/api/') || pathname.includes('.')) {
    return NextResponse.next()
  }

  const locale = detectLocale(request, supported, defaultLocale)
  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname}`
  return NextResponse.redirect(url)
}

function detectLocale(request: NextRequest, supported: string[], fallback: string): string {
  const cookie = request.cookies.get('locale')?.value
  if (cookie && supported.includes(cookie)) return cookie

  const accept = request.headers.get('accept-language') ?? ''
  for (const part of accept.split(',')) {
    const tag = part.split(';')[0]?.trim().substring(0, 2)
    if (tag && supported.includes(tag)) return tag
  }

  return fallback
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2)).*)',
  ],
}
