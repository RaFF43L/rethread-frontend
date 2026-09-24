import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const cookieName = process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || 'segunda_aura_token';
  const token = request.cookies.get(cookieName)?.value;

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isLoginRoute = request.nextUrl.pathname === '/login';

  if (isAdminRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isLoginRoute && token) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};
