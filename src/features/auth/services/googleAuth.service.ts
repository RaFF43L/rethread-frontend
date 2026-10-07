// Google login service. The frontend NEVER talks to Cognito directly:
// all calls go through the backend (via the api-client /api/backend proxy).
// There is no /auth/me: the user data comes from the idToken returned in the callback.

import { apiClient } from '@/shared/lib/api-client';
import { GoogleCallbackResponse, GoogleLoginInit } from '@/shared/types';

const CREDENTIALS: RequestInit = { credentials: 'include' };

export const googleAuthService = {
  // Starts the login: the backend builds the authorization URL and generates the state.
  init(): Promise<GoogleLoginInit> {
    return apiClient.get<GoogleLoginInit>('/auth/google/authorize-url', CREDENTIALS);
  },

  // Completes the login: exchanges the code for tokens. The state is validated on the
  // frontend (CSRF) before calling; the backend accepts only { code }.
  callback(code: string): Promise<GoogleCallbackResponse> {
    return apiClient.post<GoogleCallbackResponse>('/auth/google/callback', { code }, CREDENTIALS);
  },

  logout(token?: string): Promise<void> {
    const client = token ? apiClient.withAuth(token) : apiClient;
    return client.post<void>('/auth/logout', undefined, CREDENTIALS);
  },
};
