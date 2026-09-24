// Utilitários para upload direto S3
import { apiClient } from '@/shared/lib/api-client';

export interface PresignedUrlResponse {
  url: string;
  key: string;
}

export async function getPresignedUrl(
  productId: string | undefined,
  fileName: string,
  fileType: string,
  token?: string
): Promise<PresignedUrlResponse> {
  if (token) {
    return apiClient.withAuth(token).post<PresignedUrlResponse>(
      '/products/presigned-upload-url',
      { productId, fileName, fileType }
    );
  }
  return apiClient.post<PresignedUrlResponse>(
    '/products/presigned-upload-url',
    { productId, fileName, fileType }
  );
}

export async function uploadToS3(presignedUrl: string, file: File): Promise<void> {
  const res = await fetch(presignedUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });
  if (!res.ok) throw new Error('Erro ao enviar para o S3');
}

export async function registerProductImage(
  productId: string,
  key: string,
  token?: string
): Promise<{ id: number; urlS3: string }> {
  if (token) {
    return apiClient.withAuth(token).post<{ id: number; urlS3: string }>(
      '/products/register-image',
      { productId, key }
    );
  }
  return apiClient.post<{ id: number; urlS3: string }>(
    '/products/register-image',
    { productId, key }
  );
}
