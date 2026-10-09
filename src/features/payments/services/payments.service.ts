import { apiClient } from '@/shared/lib/api-client';

export interface PixCustomerInput {
  name: string;
  email: string;
  /** CPF (11 digits) or CNPJ (14 digits). */
  taxId: string;
  cellphone: string;
}

export interface CreatePixChargeInput {
  /** Amount in cents (4000 = R$40.00). */
  amount: number;
  /** Expiration time in seconds. */
  expiresIn?: number;
  description?: string;
  customer: PixCustomerInput;
}

export type PixChargeStatus = 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED';

export interface PixCharge {
  id: string;
  amount: number;
  status: PixChargeStatus;
  /** Raw "Pix Copia e Cola" payload. */
  brCode: string;
  /** QR code image as a data URL (data:image/png;base64,...). */
  brCodeBase64: string;
  expiresAt: string;
  devMode?: boolean;
}

export class PaymentsService {
  // `token` is optional: on the client it is omitted and the /api/backend proxy
  // injects the Bearer from the HttpOnly cookie.
  async createPixCharge(input: CreatePixChargeInput, token?: string): Promise<PixCharge> {
    const client = token ? apiClient.withAuth(token) : apiClient;
    return client.post<PixCharge>('/payments/pix', input);
  }
}

export const paymentsService = new PaymentsService();
