// Server-side session reading (server components / server actions).
// Admin is gated exclusively by the Google session (cookie env.sessionCookieName)
// of a user in the @admin group.

import { cookies } from "next/headers";
import { env } from "@/shared/lib/env";
import { isAdminUser } from "@/features/auth/lib/groups";
import type { GoogleUser } from "@/shared/types";

const USER_COOKIE = `${env.sessionCookieName}_user`;

// Google session accessToken, sent as Bearer in admin calls.
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

// Admin access: Google session of a user in the @admin group.
export async function hasAdminAccess(): Promise<boolean> {
  return isAdminUser(await getServerSessionUser());
}
