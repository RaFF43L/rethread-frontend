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

  async verifyToken(token: string): Promise<boolean> {
    try {
      await apiClient.withAuth(token).get('/auth/verify');
      return true;
    } catch {
      return false;
    }
  }
}

export const authService = new AuthService();
