'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { env } from '@/shared/lib/env';
import { redirect } from 'next/navigation';

export type ActionResult =
  | { success: true }
  | { success: false; error: string };

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(
    process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || 'segunda_aura_token'
  )?.value ?? null;
}

export async function markAsSold(id: number): Promise<ActionResult> {
  const token = await getToken();
  if (!token) redirect('/login');

  const res = await fetch(`${env.apiUrl}/products/${id}/sell`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return { success: false, error: err.message || 'Erro ao marcar produto como vendido' };
  }

  revalidatePath('/admin/products');
  return { success: true };
}

export async function revertSale(id: number): Promise<ActionResult> {
  const token = await getToken();
  if (!token) redirect('/login');

  const res = await fetch(`${env.apiUrl}/products/${id}/revert-sale`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return { success: false, error: err.message || 'Erro ao reverter venda' };
  }

  revalidatePath('/admin/products');
  return { success: true };
}

export async function deleteProduct(id: number): Promise<ActionResult> {
  const token = await getToken();
  if (!token) redirect('/login');

  const res = await fetch(`${env.apiUrl}/products/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    return { success: false, error: err.message || 'Erro ao deletar produto' };
  }

  revalidatePath('/admin/products');
  return { success: true };
}

export async function createProduct(formData: FormData): Promise<ActionResult> {
  const token = await getToken();
  if (!token) redirect('/login');

  let res: Response;
  try {
    res = await fetch(`${env.apiUrl}/products`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  } catch (e) {
    const detail = e instanceof Error ? e.message : 'desconhecido';
    return { success: false, error: `Erro de conexão com o servidor (${detail}). Tente novamente.` };
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = Array.isArray(err.message) ? err.message.join(', ') : (err.message || `Erro ao criar produto (status ${res.status})`);
    return { success: false, error: msg };
  }

  revalidatePath('/admin/products');
  return { success: true };
}

export async function updateProduct(id: number, formData: FormData): Promise<ActionResult> {
  const token = await getToken();
  if (!token) redirect('/login');

  let res: Response;
  try {
    res = await fetch(`${env.apiUrl}/products/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  } catch (e) {
    const detail = e instanceof Error ? e.message : 'desconhecido';
    return { success: false, error: `Erro de conexão com o servidor (${detail}). Tente novamente.` };
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = Array.isArray(err.message) ? err.message.join(', ') : (err.message || `Erro ao atualizar produto (status ${res.status})`);
    return { success: false, error: msg };
  }

  revalidatePath('/admin/products');
  return { success: true };
}
