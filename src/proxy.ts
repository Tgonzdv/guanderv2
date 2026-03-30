import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protected routes
const protectedRoutes = ['/dashboard']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/admin/login' || pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Admin auth check
  const adminSession = request.cookies.get('admin_session')
  if (pathname.startsWith('/admin') && !adminSession) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // Dashboard auth check (from middleware.ts)
  const token = request.cookies.get('token')?.value
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route))
  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
}
