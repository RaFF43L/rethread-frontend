// Completes the Google login server-side.
//
// Receives { code } from the callback page, exchanges it at the backend, and
// stores the tokens in HttpOnly cookies. Only the (non-secret) user profile is
// returned to the client — the tokens never cross back over the wire to JS.

import { NextResponse, type NextRequest } from 'next/server';
import { env } from '@/shared/lib/env';
import { writeAuthCookies } from '@/features/auth/lib/auth-cookies';
import type { GoogleCallbackResponse, GoogleUser } from '@/shared/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { code } = (await req.json().catch(() => ({}))) as { code?: unknown };
  if (typeof code !== 'string' || !code) {
    return NextResponse.json({ message: 'Código de autorização ausente.' }, { status: 400 });
  }

  let res: Response;
  try {
    // The backend accepts only { code }; the state is validated on the frontend.
    res = await fetch(`${env.apiUrl}/auth/google/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
  } catch {
    return NextResponse.json({ message: 'Não foi possível contatar o servidor.' }, { status: 502 });
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return NextResponse.json(
      { message: err.message || 'Falha ao concluir o login.' },
      { status: res.status },
    );
  }

  const data = (await res.json()) as GoogleCallbackResponse;
  const user: GoogleUser = {
    name: data.user?.name,
    email: data.user?.email,
    picture: data.user?.pictureUrl,
    groups: data.user?.groups,
  };

  await writeAuthCookies(
    {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn,
    },
    user,
  );

  return NextResponse.json({ user });
}
