// Google login service.
//
// - `init` goes through the /api/backend proxy to the backend (public endpoint).
// - `callback` and `logout` hit the Next.js route handlers under /api/auth/*,
//   which set/clear the HttpOnly token cookies server-side. The frontend never
//   touches the tokens: the callback returns only the user profile.

import { apiClient } from '@/shared/lib/api-client';
import type { GoogleLoginInit, GoogleUser } from '@/shared/types';

export const googleAuthService = {
  // Starts the login: the backend builds the authorization URL and generates the state.
  init(): Promise<GoogleLoginInit> {
    return apiClient.get<GoogleLoginInit>('/auth/google/authorize-url');
  },

  // Completes the login: the route handler exchanges the code and stores the
  // HttpOnly tokens; here we only receive the user profile.
  async callback(code: string): Promise<{ user: GoogleUser }> {
    const res = await fetch('/api/auth/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Falha ao concluir o login.');
    }
    return (await res.json()) as { user: GoogleUser };
  },

  async logout(): Promise<void> {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {
      // A network failure must not block the local cleanup done by the caller.
    });
  },
};
