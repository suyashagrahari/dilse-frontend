/** Shapes returned by `GET /admin/super/users/:userId/profile`. */

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
export const C = {
  bg: "#f5ede6",
  bgAlt: "#faf3ee",
  surface: "#fffdfb",
  surfaceAlt: "#f7eee5",

  text: "#2a0a0e",
  muted: "#7f5f5f",
  faint: "#9a7070",
  border: "rgba(61,12,17,0.10)",
  borderStrong: "rgba(61,12,17,0.18)",

  /** Readable gold for links and icons — #c9a84c itself fails on cream. */
  accent: "#8b5a2b",
  /** Deep maroon: primary buttons, active tabs. */
  accentStrong: "#3d0c11",
  /** The brand gold, for highlights and fills rather than small text. */
  gold: "#c9a84c",
  goldDeep: "#a8823a",

  ok: "#3aa76d",
  warn: "#a8823a",
  danger: "#a13540",

  radius: 12,
  radiusLg: 16,
  shadow: "0 2px 10px rgba(61,12,17,0.05)",
  shadowElevated: "0 24px 60px -18px rgba(26,5,7,0.42)",
  gradient: "linear-gradient(135deg,#3d0c11,#5a1620)",
} as const;

/** Account status → the palette colour that carries its meaning. */
export const STATUS_COLOR: Record<string, string> = {
  active: "#3aa76d",
  suspended: "#a8823a",
  banned: "#a13540",
};
