import { apiClient } from '@/shared/lib/api-client';
import { AuthResponse } from '@/shared/types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/login', credentials);
  }

  verifyToken(token: string): boolean {
    return !!token;
  }
}

export const authService = new AuthService();
