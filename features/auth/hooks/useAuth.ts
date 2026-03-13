'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService, LoginCredentials } from '../services/auth.service';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login(credentials);
      const token = response.accessToken || response.token;
      if (!token) throw new Error('Token não recebido do servidor');

      document.cookie = `${process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || 'segunda_aura_token'}=${token}; path=/; max-age=86400`;

      router.push('/admin/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    document.cookie = `${process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || 'segunda_aura_token'}=; path=/; max-age=0`;
    router.push('/');
    router.refresh();
  };

  return { login, logout, loading, error };
}
