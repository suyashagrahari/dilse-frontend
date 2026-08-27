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
export const C = {
  bg: "#FAFAF7",
  bgAlt: "#F3F1EA",
  surface: "#FFFFFF",
  surfaceAlt: "#EFEDFD",
  text: "#0E0E12",
  muted: "#5B5B66",
  border: "#ECEAE3",

  accent: "#6C5CE7",
  accentStrong: "#5646C9",
  pink: "#F72585",
  lime: "#C6FF3D",
  onAccent: "#FFFFFF",

  amber: "#FFB020",
  green: "#3AA76D",

  radius: 20,
  radiusLg: 28,
  shadow: "0 8px 24px rgba(14,14,18,.06)",
  shadowElevated: "0 40px 80px -20px rgba(14,14,18,.38)",
  gradient: "linear-gradient(135deg, #6C5CE7, #F72585)",
} as const;

/** Account status → the palette colour that carries its meaning. */
export const STATUS_COLOR: Record<string, string> = {
  active: "#3AA76D",
  suspended: "#FFB020",
  banned: "#F72585",
};
