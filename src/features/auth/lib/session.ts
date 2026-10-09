// Client-side session helpers.
//
// Tokens live in HttpOnly cookies set by the server route handlers
// (/api/auth/callback, /api/backend) and are intentionally UNREADABLE here —
// that is exactly what protects them from XSS. The only client-readable piece is
// the user profile (name/email/photo), kept in a non-HttpOnly cookie so the
// header can render after an F5 without a round-trip. It is not a secret.
//
// Authenticated requests do NOT attach a token from JS: they go through the
// /api/backend proxy, which injects the Bearer from the HttpOnly cookie.

import { env } from '@/shared/lib/env';
import type { GoogleUser } from '@/shared/types';

const USER_COOKIE = `${env.sessionCookieName}_user`;

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const prefix = `${name}=`;
  const parts = document.cookie ? document.cookie.split('; ') : [];
  for (const part of parts) {
    if (part.startsWith(prefix)) {
      return decodeURIComponent(part.slice(prefix.length)) || null;
    }
  }
  return null;
}

// --- User (name/email/photo for display) ---

export function getSessionUser(): GoogleUser | null {
  const raw = readCookie(USER_COOKIE);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GoogleUser;
  } catch {
    return null;
  }
}

/** Whether there is a local session (used to gate authenticated UI actions). */
export function hasSession(): boolean {
  return getSessionUser() !== null;
}

/**
 * Clears the client-readable profile cookie. The HttpOnly token cookies are
 * cleared server-side by the /api/auth/logout route handler.
 */
export function clearSessionUser(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${USER_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}
