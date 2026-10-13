// Renews the session before the request is handled.
//
// The access cookie expires with its token (~1h) while the refresh cookie lasts
// much longer. When only the access cookie is gone, this trades the refresh
// token for a new access token (POST /auth/google/refresh) and hands the fresh
// cookies both to the browser and to this very request, so server components,
// server actions (admin) and the /api/backend route all see a valid token.

import { NextResponse, type NextRequest } from 'next/server';
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  authCookies,
  clearedAuthCookies,
  refreshGoogleSession,
  type AuthCookie,
} from '@/features/auth/lib/auth-cookies';

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (request.cookies.has(ACCESS_COOKIE) || !refreshToken) return NextResponse.next();

  const result = await refreshGoogleSession(refreshToken);
  // Backend unreachable: let the request through; the session may still be fine.
  if (result.status === 'unavailable') return NextResponse.next();

  const updates: AuthCookie[] =
    result.status === 'refreshed' ? authCookies(result.tokens) : clearedAuthCookies();

  for (const { name, value } of updates) {
    if (value) request.cookies.set(name, value);
    else request.cookies.delete(name);
  }
  const response = NextResponse.next({ request: { headers: request.headers } });
  for (const { name, value, options } of updates) response.cookies.set(name, value, options);
  return response;
}

export const config = {
  // Pages, server actions and the /api/backend proxy. Static assets need no
  // session, and /api/auth/* manages the cookies itself.
  matcher: ['/((?!_next/static|_next/image|api/auth|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico|webmanifest|js)$).*)'],
};
