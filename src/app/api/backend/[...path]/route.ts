// Authenticated proxy to the backend.
//
// The browser calls `/api/backend/<path>`; this handler forwards the request to
// the real backend (env.apiUrl) and injects `Authorization: Bearer <token>` read
// from the HttpOnly cookie. This is what lets the access token stay HttpOnly:
// client JS never sees it, so XSS cannot steal it.
//
// `src/proxy.ts` already renewed an expired access cookie before this runs; on
// a 401 (token revoked, or expired in between) it tries POST /auth/google/refresh
// once, rotates the cookies, and replays the request. Responses are streamed
// back as-is, so SSE endpoints (the AI chat) keep working.

import type { NextRequest } from 'next/server';
import { env } from '@/shared/lib/env';
import {
  clearAuthCookies,
  readAccessToken,
  readRefreshToken,
  refreshGoogleSession,
  writeAuthCookies,
  type RefreshResult,
} from '@/features/auth/lib/auth-cookies';

export const dynamic = 'force-dynamic';

// Hop-by-hop or client-controlled headers we must not forward verbatim.
const STRIP_REQUEST_HEADERS = new Set([
  'host',
  'connection',
  'content-length',
  'authorization', // we set our own from the HttpOnly cookie
  'cookie', // our session cookies are not the backend's concern
]);

// Response headers that would corrupt the proxied body if copied.
const STRIP_RESPONSE_HEADERS = new Set([
  'content-encoding',
  'content-length',
  'transfer-encoding',
]);

/** Exchanges the refresh token for a new access token, rotating the cookies. */
async function tryRefresh(): Promise<RefreshResult> {
  const refreshToken = await readRefreshToken();
  if (!refreshToken) return { status: 'expired' };

  const result = await refreshGoogleSession(refreshToken);
  if (result.status === 'refreshed') await writeAuthCookies(result.tokens);
  return result;
}

async function proxy(req: NextRequest, path: string[]): Promise<Response> {
  const target = `${env.apiUrl}/${path.join('/')}${req.nextUrl.search}`;
  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
  const body = hasBody ? await req.arrayBuffer() : undefined;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (!STRIP_REQUEST_HEADERS.has(key.toLowerCase())) headers.set(key, value);
  });

  const send = (token: string | null): Promise<Response> => {
    if (token) headers.set('authorization', `Bearer ${token}`);
    else headers.delete('authorization');
    return fetch(target, {
      method: req.method,
      headers,
      body,
      redirect: 'manual',
    });
  };

  let backendRes = await send(await readAccessToken());

  if (backendRes.status === 401) {
    const refresh = await tryRefresh();
    if (refresh.status === 'refreshed') {
      backendRes = await send(refresh.tokens.accessToken ?? null);
    }
    // Still rejected: the session is over. Drop every cookie (the readable
    // profile one included) so the client stops showing a logged-in user.
    // A refresh that merely failed to reach the backend keeps the session.
    if (backendRes.status === 401 && refresh.status !== 'unavailable') {
      await clearAuthCookies();
    }
  }

  const resHeaders = new Headers();
  backendRes.headers.forEach((value, key) => {
    if (!STRIP_RESPONSE_HEADERS.has(key.toLowerCase())) resHeaders.set(key, value);
  });

  return new Response(backendRes.body, {
    status: backendRes.status,
    statusText: backendRes.statusText,
    headers: resHeaders,
  });
}

type RouteContext = { params: Promise<{ path: string[] }> };

async function handle(req: NextRequest, ctx: RouteContext): Promise<Response> {
  return proxy(req, (await ctx.params).path);
}

export {
  handle as GET,
  handle as POST,
  handle as PUT,
  handle as PATCH,
  handle as DELETE,
};
