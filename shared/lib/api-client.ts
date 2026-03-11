// Cliente HTTP centralizado para comunicação com o backend

import { ApiError } from '@/shared/types';
import { env } from './env';

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = env.apiUrl;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        message: 'Erro ao processar resposta',
        statusCode: response.status,
      }));
      throw error;
    }

    return response.json();
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, body?: any, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, body?: any, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    return this.handleResponse<T>(response);
  }

  withAuth(token: string) {
    return {
      get: <T>(endpoint: string, options?: RequestInit) =>
        this.get<T>(endpoint, {
          ...options,
          headers: { ...options?.headers, Authorization: `Bearer ${token}` },
        }),
      post: <T>(endpoint: string, body?: any, options?: RequestInit) =>
        this.post<T>(endpoint, body, {
          ...options,
          headers: { ...options?.headers, Authorization: `Bearer ${token}` },
        }),
      put: <T>(endpoint: string, body?: any, options?: RequestInit) =>
        this.put<T>(endpoint, body, {
          ...options,
          headers: { ...options?.headers, Authorization: `Bearer ${token}` },
        }),
      delete: <T>(endpoint: string, options?: RequestInit) =>
        this.delete<T>(endpoint, {
          ...options,
          headers: { ...options?.headers, Authorization: `Bearer ${token}` },
        }),
    };
  }
}

export const apiClient = new ApiClient();
