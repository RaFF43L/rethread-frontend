'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { env } from '@/shared/lib/env';
import { redirect } from 'next/navigation';

async function getToken(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get(
    process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || 'segunda_aura_token'
  )?.value;
  if (!token) redirect('/login');
  return token;
}

export async function marcarComoVendido(id: number) {
  const token = await getToken();
  const res = await fetch(`${env.apiUrl}/products/${id}/sell`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Erro ao marcar produto como vendido');
  }

  revalidatePath('/admin/produtos');
}

export async function reverterVenda(id: number) {
  const token = await getToken();
  const res = await fetch(`${env.apiUrl}/products/${id}/revert-sale`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Erro ao reverter venda');
  }

  revalidatePath('/admin/produtos');
}

export async function deletarProduto(id: number) {
  const token = await getToken();
  const res = await fetch(`${env.apiUrl}/products/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Erro ao deletar produto');
  }

  revalidatePath('/admin/produtos');
}

export async function criarProduto(formData: FormData) {
  const token = await getToken();

  const res = await fetch(`${env.apiUrl}/products`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = Array.isArray(err.message) ? err.message.join(', ') : (err.message || 'Erro ao criar produto');
    throw new Error(msg);
  }

  revalidatePath('/admin/produtos');
  redirect('/admin/produtos');
}

export async function atualizarProduto(id: number, formData: FormData) {
  const token = await getToken();

  const res = await fetch(`${env.apiUrl}/products/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = Array.isArray(err.message) ? err.message.join(', ') : (err.message || 'Erro ao atualizar produto');
    throw new Error(msg);
  }

  revalidatePath('/admin/produtos');
  redirect('/admin/produtos');
}
