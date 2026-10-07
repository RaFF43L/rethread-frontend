// Leitura/escrita da sessão do login Google em cookies não-HttpOnly.
//
// Decisão (aprovada pelo usuário): o backend retorna tokens no corpo e NÃO há
// /auth/me. Guardamos o accessToken (para o logout) e os dados do usuário
// (nome/email/foto, lidos do idToken) em cookies, para o header sobreviver ao F5.
// NÃO usar localStorage (proibido pelos critérios) e nunca logar tokens.

import { env } from '@/shared/lib/env';
import type { GoogleUser } from '@/shared/types';

const DEFAULT_MAX_AGE_SECONDS = 86400; // 24h
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

function writeCookie(name: string, value: string, maxAgeSeconds: number): void {
  if (typeof document === 'undefined') return;

  const secure = env.isProduction ? '; Secure' : '';
  document.cookie =
    `${name}=${encodeURIComponent(value)}` +
    `; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${secure}`;
}

function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

function resolveMaxAge(seconds?: number): number {
  return seconds && seconds > 0 ? seconds : DEFAULT_MAX_AGE_SECONDS;
}

// --- Token (accessToken, usado no logout) ---

export function getSessionToken(): string | null {
  return readCookie(env.sessionCookieName);
}

export function setSessionToken(token: string, maxAgeSeconds?: number): void {
  writeCookie(env.sessionCookieName, token, resolveMaxAge(maxAgeSeconds));
}

// --- Usuário (nome/email/foto para exibição) ---

export function getSessionUser(): GoogleUser | null {
  const raw = readCookie(USER_COOKIE);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GoogleUser;
  } catch {
    return null;
  }
}

export function setSessionUser(user: GoogleUser, maxAgeSeconds?: number): void {
  writeCookie(USER_COOKIE, JSON.stringify(user), resolveMaxAge(maxAgeSeconds));
}

// --- Limpeza completa (logout / sessão inválida) ---

export function clearSession(): void {
  deleteCookie(env.sessionCookieName);
  deleteCookie(USER_COOKIE);
}
