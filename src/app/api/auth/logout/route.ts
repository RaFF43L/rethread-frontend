// Ends the session.
//
// Per the backend contract (LogoutDto) logout requires { refreshToken } in the
// body — not a Bearer. We read the refresh token from its HttpOnly cookie, call
// the backend, and clear every auth cookie regardless of the backend outcome
// (a backend failure must never leave a half-open local session).

import { NextResponse } from 'next/server';
import { env } from '@/shared/lib/env';
import { clearAuthCookies, readRefreshToken } from '@/features/auth/lib/auth-cookies';

export const dynamic = 'force-dynamic';

export async function POST(): Promise<NextResponse> {
  const refreshToken = await readRefreshToken();

  if (refreshToken) {
    try {
      await fetch(`${env.apiUrl}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Ignore: local cleanup below must happen anyway.
    }
  }

  await clearAuthCookies();
  return new NextResponse(null, { status: 204 });
}
