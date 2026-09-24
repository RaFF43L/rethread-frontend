// Utilitário para registrar vídeo de produto
import { apiClient } from '@/shared/lib/api-client';

export async function registerProductVideo(
  productId: string,
  key: string,
  token?: string
): Promise<{ id: number; urlS3: string }> {
  if (token) {
    return apiClient.withAuth(token).post<{ id: number; urlS3: string }>(
      '/products/register-video',
      { productId, key }
    );
  }
  return apiClient.post<{ id: number; urlS3: string }>(
    '/products/register-video',
    { productId, key }
  );
}
