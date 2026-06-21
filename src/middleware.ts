import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Public routes - no auth needed
  const publicRoutes = ['/', '/about', '/programs', '/facilities', '/admissions', '/contact', '/login', '/signup', '/forgot-password']
  if (publicRoutes.includes(pathname) || pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next()
  }

  // Protected routes - check for auth cookies
  const hasAuthCookie = request.cookies.getAll().some(c => c.name.includes('sb-') && c.name.includes('-auth-token'))

  if (!hasAuthCookie && (pathname.startsWith('/admin') || pathname.startsWith('/teacher') || pathname.startsWith('/parent'))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public|manifest.json).*)'],
}
