// Leitura da sessão no servidor (server components / server actions).
// Admin é gated exclusivamente pela sessão Google (cookie env.sessionCookieName)
// de um usuário no grupo @admin.

import { cookies } from "next/headers";
import { env } from "@/shared/lib/env";
import { isAdminUser } from "@/features/auth/lib/groups";
import type { GoogleUser } from "@/shared/types";

const USER_COOKIE = `${env.sessionCookieName}_user`;

// accessToken da sessão Google, enviado como Bearer nas chamadas do admin.
export async function getServerAdminToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(env.sessionCookieName)?.value ?? null;
}

export async function getServerSessionUser(): Promise<GoogleUser | null> {
  const store = await cookies();
  const raw = store.get(USER_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as GoogleUser;
  } catch {
    try {
      return JSON.parse(raw) as GoogleUser;
    } catch {
      return null;
    }
  }
}

// Acesso ao admin: sessão Google de usuário no grupo @admin.
export async function hasAdminAccess(): Promise<boolean> {
  return isAdminUser(await getServerSessionUser());
}
