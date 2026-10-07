// Helpers puros de autorização por grupo (sem acesso a cookies/document),
// seguros para usar no cliente e no servidor.

import type { GoogleUser } from "@/shared/types";

export const ADMIN_GROUP = "@admin";

export function isAdminUser(user: GoogleUser | null | undefined): boolean {
  return Array.isArray(user?.groups) && user.groups.includes(ADMIN_GROUP);
}
