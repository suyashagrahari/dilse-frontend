/** Shapes returned by `GET /admin/super/users/:userId/profile`. */

import { BRAND } from "@/lib/brand";

export interface ProfileUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: string;
  role: string;
  status?: "active" | "suspended" | "banned";
  statusReason?: string;
  suspendedUntil?: string;
  points: number;
  totalPointsEarned: number;
  referralCode: string;
  subdomain?: string;
  /** ISO-2 country at signup / latest seen (≤ daily). Reporting only. */
  signupCountry?: string | null;
  lastSeenCountry?: string | null;
  isVerified: boolean;
  tokenVersion?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProfilePage {
  _id: string;
  templateType: string;
  templateLabel: string;
  editorRoute: string;
  shareId?: string;
  isPublished: boolean;
  viewCount: number;
  installCount: number;
  hasPassword: boolean;
  supportsPassword: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PointRow {
  _id: string;
  type: string;
  delta: number;
  balance: number;
  meta?: Record<string, unknown>;
  createdAt: string;
}

export interface ProfileData {
  user: ProfileUser;
  pages: ProfilePage[];
  contributions: Record<string, unknown>[];
  favorites: Record<string, unknown>[];
  points: PointRow[];
  referrals: {
    made: { referee?: { email?: string; name?: string; createdAt?: string } }[];
    referredBy?: { referrer?: { email?: string; name?: string } } | null;
  };
  payments: Record<string, unknown>[];
  stats: {
    totalPages: number;
    publishedPages: number;
    passwordProtectedPages: number;
    totalViews: number;
    totalContributions: number;
    totalSpent: number;
  };
}

/**
 * SubhSandesh theme tokens.
 *
 * The `--site-*` CSS variables this palette is normally read from do not exist
 * in `globals.css` in this repo, and there is no `data-sitetheme` attribute to
 * hang them off — so the hex values are inlined here instead, in ONE place, and
 * every surface on this screen reads from it. If the token layer lands later,
 * this object is the only thing that has to change.
 */
/**
 * SubhSandesh theme tokens — gold, deep maroon and cream.
 *
 * Taken from what the site actually ships: `components/home/*` uses #c9a84c
 * 200 times, #3d0c11 61 times and #f5ede6 31 times, and every sibling admin
 * page (analytics, contacts, users, templates) is built from the same three.
 * Headings are Lora, the serif the landing uses, already loaded globally by the
 * root layout as `--font-lora`.
 *
 * Defined once here so the whole screen shifts together if the brand does.
 */
/**
 * The palette this screen is built from.
 *
 * The values moved to `lib/brand.ts` when the paywall needed the same three
 * colours — a shared component must not import from an admin page's internals.
 * Re-exported under the old name so nothing on this screen had to change.
 */
export const C = BRAND;

/** Account status → the palette colour that carries its meaning. */
export const STATUS_COLOR: Record<string, string> = {
  active: "#3aa76d",
  suspended: "#a8823a",
  banned: "#a13540",
};
