// Server-side helpers for the auth cookies.
//
// Security model (anti-XSS): the access/refresh tokens live in HttpOnly cookies
// and are NEVER exposed to client JS. All authenticated backend calls go through
// the /api/backend proxy, which reads these cookies server-side and injects the
// `Authorization: Bearer` header. Only the user profile (name/email/photo) is
// kept in a non-HttpOnly cookie, so the header can render after an F5 without a
// round-trip — it is not a secret.
//
// Lifetimes: the access cookie lives as long as the access token (`expiresIn`,
// ~1h). The refresh and profile cookies live as long as the refresh token, so
// the session survives the access token: `src/proxy.ts` (and the /api/backend
// route, on a 401) trade the refresh token for a new access token.

import { cookies } from 'next/headers';
import { env } from '@/shared/lib/env';
import type { GoogleUser } from '@/shared/types';

export const ACCESS_COOKIE = env.sessionCookieName; // HttpOnly: accessToken
export const REFRESH_COOKIE = `${env.sessionCookieName}_refresh`; // HttpOnly: refreshToken
export const USER_COOKIE = `${env.sessionCookieName}_user`; // readable: profile JSON
const AUTH_COOKIES = [ACCESS_COOKIE, REFRESH_COOKIE, USER_COOKIE];

const DEFAULT_ACCESS_MAX_AGE_SECONDS = 3600;
const SESSION_MAX_AGE_SECONDS = 30 * 24 * 3600;

export interface TokenSet {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface AuthCookie {
  name: string;
  value: string;
  options: {
    path: string;
    sameSite: 'lax';
    secure: boolean;
    httpOnly: boolean;
    maxAge: number;
  };
}

function cookie(name: string, value: string, maxAge: number, httpOnly: boolean): AuthCookie {
  return {
    name,
    value,
    options: { path: '/', sameSite: 'lax', secure: env.isProduction, httpOnly, maxAge },
  };
}

/**
 * Cookies that persist the session. Tokens are HttpOnly; `user` (when provided)
 * is readable. Pass `user = undefined` to refresh tokens without touching the
 * profile cookie. Shared by route handlers (`cookies()`) and `src/proxy.ts`
 * (request/response cookies).
 */
export function authCookies(tokens: TokenSet, user?: GoogleUser): AuthCookie[] {
  const out: AuthCookie[] = [];
  if (tokens.accessToken) {
    const maxAge =
      tokens.expiresIn && tokens.expiresIn > 0 ? tokens.expiresIn : DEFAULT_ACCESS_MAX_AGE_SECONDS;
    out.push(cookie(ACCESS_COOKIE, tokens.accessToken, maxAge, true));
  }
  if (tokens.refreshToken) {
    out.push(cookie(REFRESH_COOKIE, tokens.refreshToken, SESSION_MAX_AGE_SECONDS, true));
  }
  if (user !== undefined) {
    out.push(cookie(USER_COOKIE, JSON.stringify(user), SESSION_MAX_AGE_SECONDS, false));
  }
  return out;
}

/** Expired copies of every auth cookie, to end the session. */
export function clearedAuthCookies(): AuthCookie[] {
  return AUTH_COOKIES.map((name) => cookie(name, '', 0, false));
}

export async function writeAuthCookies(tokens: TokenSet, user?: GoogleUser): Promise<void> {
  const store = await cookies();
  for (const { name, value, options } of authCookies(tokens, user)) {
    store.set(name, value, options);
  }
}

export async function clearAuthCookies(): Promise<void> {
  const store = await cookies();
  for (const { name, value, options } of clearedAuthCookies()) {
    store.set(name, value, options);
  }
}

export async function readAccessToken(): Promise<string | null> {
  return (await cookies()).get(ACCESS_COOKIE)?.value ?? null;
}

export async function readRefreshToken(): Promise<string | null> {
  return (await cookies()).get(REFRESH_COOKIE)?.value ?? null;
}

export type RefreshResult =
  | { status: 'refreshed'; tokens: TokenSet }
  | { status: 'expired' }
  | { status: 'unavailable' };

export async function refreshGoogleSession(refreshToken: string): Promise<RefreshResult> {
  let res: Response;
  try {
    res = await fetch(`${env.apiUrl}/auth/google/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    return { status: 'unavailable' };
  }
  if (res.status === 400 || res.status === 401) return { status: 'expired' };
  if (!res.ok) return { status: 'unavailable' };

  const data = (await res.json().catch(() => null)) as TokenSet | null;
  if (!data?.accessToken) return { status: 'unavailable' };
  return {
    status: 'refreshed',
    tokens: {
      accessToken: data.accessToken,
      expiresIn: data.expiresIn,
      refreshToken:
        data.refreshToken && data.refreshToken !== refreshToken ? data.refreshToken : undefined,
    },
  };
}
