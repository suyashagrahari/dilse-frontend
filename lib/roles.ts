/**
 * Client-side role helpers.
 *
 * Mirrors `server/src/config/roles.ts`. Compare by rank, never by equality:
 * `user.role !== "admin"` locked the super admin out of the entire admin panel
 * the moment the `superadmin` role existed, because a role ABOVE admin is not
 * equal to admin. Every gate here admits anything that outranks it.
 *
 * These are conveniences for hiding UI, not security. The server re-checks
 * every one of them — a hidden button is not an access control.
 */

export type UserRole = "normal" | "member" | "admin" | "superadmin";

const RANK: Record<string, number> = {
  normal: 0,
  member: 1,
  admin: 2,
  superadmin: 3,
};

export function roleAtLeast(role: string | undefined, min: UserRole): boolean {
  const r = RANK[role || "normal"];
  return r !== undefined && r >= RANK[min];
}

export const isAdmin = (role?: string) => roleAtLeast(role, "admin");
export const isSuperAdmin = (role?: string) => roleAtLeast(role, "superadmin");
