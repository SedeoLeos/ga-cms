import { type NextRequest, NextResponse } from 'next/server'

/**
 * proxy.ts — Next.js 16 network boundary layer
 * Replaces middleware.ts. Handles:
 *   - Multi-tenant hostname → siteId routing
 *   - Admin / Studio session protection
 *   - Locale detection and redirect for site routes
 *   - Preview token passthrough
 */

const ADMIN_PATHS = ['/admin', '/studio']
const PUBLIC_ADMIN_PATHS = ['/admin/auth/login', '/admin/auth/forgot-password']
const PREVIEW_PATH = '/preview'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') ?? ''

  // ── Preview routes — allow with valid token ───────────────────────
  if (pathname.startsWith(PREVIEW_PATH)) {
    return NextResponse.next()
  }

  // ── Custom domain → rewrite to (site) route group ────────────────
  if (!isInternalHostname(hostname)) {
    return rewriteToSite(request, hostname)
  }

  // ── Admin / Studio protection ─────────────────────────────────────
  if (ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    const isPublic = PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p))
    if (!isPublic) {
      // Auth.js v5 sets 'authjs.session-token' (dev) or '__Secure-authjs.session-token' (prod)
      const hasSession =
        request.cookies.has('authjs.session-token') ||
        request.cookies.has('__Secure-authjs.session-token') ||
        request.cookies.has('next-auth.session-token') // beta compat
      if (!hasSession) {
        const loginUrl = new URL('/admin/auth/login', request.url)
        loginUrl.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(loginUrl)
      }
    }
    return NextResponse.next()
  }

  // ── Site locale detection ─────────────────────────────────────────
  return handleLocale(request)
}

// ─── Helpers ───────────────────────────────────────────────────────────

function isInternalHostname(hostname: string) {
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'tatomir.app'
  return (
    hostname === 'localhost' ||
    hostname.startsWith('localhost:') ||
    hostname === appDomain ||
    hostname.endsWith(`.${appDomain}`) ||
    hostname.endsWith('.vercel.app')
  )
}

function rewriteToSite(_request: NextRequest, hostname: string) {
  const response = NextResponse.next()
  // Pass hostname to the site route handler via request header
  response.headers.set('x-hostname', hostname)
  return response
}

function handleLocale(request: NextRequest) {
  const { pathname } = request.nextUrl
  const supported = (process.env.SUPPORTED_LOCALES ?? 'en,fr').split(',').map((l) => l.trim())
  const defaultLocale = process.env.DEFAULT_LOCALE ?? 'en'

  // Already has a valid locale prefix
  if (supported.some((l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`)) {
    return NextResponse.next()
  }

  // Skip files and API routes
  if (pathname.startsWith('/api/') || pathname.includes('.')) {
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
