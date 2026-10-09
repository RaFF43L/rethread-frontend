// Server-side helpers for the auth cookies.
//
// Security model (anti-XSS): the access/refresh tokens live in HttpOnly cookies
// and are NEVER exposed to client JS. All authenticated backend calls go through
// the /api/backend proxy, which reads these cookies server-side and injects the
// `Authorization: Bearer` header. Only the user profile (name/email/photo) is
// kept in a non-HttpOnly cookie, so the header can render after an F5 without a
// round-trip — it is not a secret.

import { cookies } from 'next/headers';
import { env } from '@/shared/lib/env';
import type { GoogleUser } from '@/shared/types';

export const ACCESS_COOKIE = env.sessionCookieName; // HttpOnly: accessToken
export const REFRESH_COOKIE = `${env.sessionCookieName}_refresh`; // HttpOnly: refreshToken
export const USER_COOKIE = `${env.sessionCookieName}_user`; // readable: profile JSON

const DEFAULT_MAX_AGE_SECONDS = 86400; // 24h

interface TokenSet {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
}

function resolveMaxAge(seconds?: number): number {
  return seconds && seconds > 0 ? seconds : DEFAULT_MAX_AGE_SECONDS;
}

function baseOptions(maxAge: number) {
  return {
    path: '/',
    sameSite: 'lax' as const,
    secure: env.isProduction,
    maxAge,
  };
}

/**
 * Persists the session. Tokens are written HttpOnly; `user` (when provided) is
 * written readable. Pass `user = undefined` to refresh tokens without touching
 * the profile cookie.
 */
export async function writeAuthCookies(tokens: TokenSet, user?: GoogleUser): Promise<void> {
  const store = await cookies();
  const maxAge = resolveMaxAge(tokens.expiresIn);

  if (tokens.accessToken) {
    store.set(ACCESS_COOKIE, tokens.accessToken, { ...baseOptions(maxAge), httpOnly: true });
  }
  if (tokens.refreshToken) {
    store.set(REFRESH_COOKIE, tokens.refreshToken, { ...baseOptions(maxAge), httpOnly: true });
  }
  if (user !== undefined) {
    store.set(USER_COOKIE, JSON.stringify(user), { ...baseOptions(maxAge), httpOnly: false });
  }
}

export async function clearAuthCookies(): Promise<void> {
  const store = await cookies();
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE, USER_COOKIE]) {
    store.set(name, '', { path: '/', maxAge: 0 });
  }
}

export async function readAccessToken(): Promise<string | null> {
  return (await cookies()).get(ACCESS_COOKIE)?.value ?? null;
}

export async function readRefreshToken(): Promise<string | null> {
  return (await cookies()).get(REFRESH_COOKIE)?.value ?? null;
}

/** Reads the email stored in the profile cookie (needed by POST /auth/refresh). */
export async function readSessionEmail(): Promise<string | null> {
  const raw = (await cookies()).get(USER_COOKIE)?.value;
  if (!raw) return null;
  try {
    return (JSON.parse(raw) as GoogleUser).email ?? null;
  } catch {
    try {
      return (JSON.parse(decodeURIComponent(raw)) as GoogleUser).email ?? null;
    } catch {
      return null;
    }
  }
}
