// Authenticated proxy to the backend.
//
// The browser calls `/api/backend/<path>`; this handler forwards the request to
// the real backend (env.apiUrl) and injects `Authorization: Bearer <token>` read
// from the HttpOnly cookie. This is what lets the access token stay HttpOnly:
// client JS never sees it, so XSS cannot steal it.
//
// On a 401 it transparently tries POST /auth/refresh once (email + refreshToken),
// rotates the cookies, and replays the request. Responses are streamed back
// as-is, so SSE endpoints (the AI chat) keep working.

import type { NextRequest } from 'next/server';
import { env } from '@/shared/lib/env';
import {
  readAccessToken,
  readRefreshToken,
  readSessionEmail,
  writeAuthCookies,
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

interface RefreshResponse {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
}

/** Exchanges the refresh token for a new access token. Returns the new one or null. */
async function tryRefresh(): Promise<string | null> {
  const refreshToken = await readRefreshToken();
  const email = await readSessionEmail();
  if (!refreshToken || !email) return null;

  let res: Response;
  try {
    res = await fetch(`${env.apiUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, refreshToken }),
    });
  } catch {
    return null;
  }
  if (!res.ok) return null;

  const data = (await res.json().catch(() => null)) as RefreshResponse | null;
  if (!data?.accessToken) return null;

  await writeAuthCookies({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken ?? refreshToken,
    expiresIn: data.expiresIn,
  });
  return data.accessToken;
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
    const refreshed = await tryRefresh();
    if (refreshed) backendRes = await send(refreshed);
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
