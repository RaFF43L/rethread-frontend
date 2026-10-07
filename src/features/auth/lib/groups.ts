// Pure group-authorization helpers (no cookie/document access),
// safe to use on both the client and the server.

import type { GoogleUser } from "@/shared/types";

export const ADMIN_GROUP = "@admin";

export function isAdminUser(user: GoogleUser | null | undefined): boolean {
  return Array.isArray(user?.groups) && user.groups.includes(ADMIN_GROUP);
}
