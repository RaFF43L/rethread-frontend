// Serviço do login com Google. O frontend NUNCA fala com o Cognito direto:
// todas as chamadas passam pelo backend (via proxy /api/backend do api-client).
// Não há /auth/me: os dados do usuário saem do idToken retornado no callback.

import { apiClient } from '@/shared/lib/api-client';
import { GoogleCallbackResponse, GoogleLoginInit } from '@/shared/types';

const CREDENTIALS: RequestInit = { credentials: 'include' };

export const googleAuthService = {
  // Inicia o login: o backend monta a URL de autorização e gera o state.
  init(): Promise<GoogleLoginInit> {
    return apiClient.get<GoogleLoginInit>('/auth/google/authorize-url', CREDENTIALS);
  },

  // Conclui o login: troca o code por tokens. O state é validado no frontend
  // (CSRF) antes de chamar; o backend aceita somente { code }.
  callback(code: string): Promise<GoogleCallbackResponse> {
    return apiClient.post<GoogleCallbackResponse>('/auth/google/callback', { code }, CREDENTIALS);
  },

  logout(token?: string): Promise<void> {
    const client = token ? apiClient.withAuth(token) : apiClient;
    return client.post<void>('/auth/logout', undefined, CREDENTIALS);
  },
};
