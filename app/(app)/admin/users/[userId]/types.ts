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

export const C = {
  border: "rgba(61,12,17,0.08)",
  t1: "#2a0a0e",
  t2: "#7f5f5f",
  tM: "#9a7070",
  gold: "#c9a84c",
  goldD: "#8b5a2b",
  bg: "#f5ede6",
  card: "#fffdfb",
  danger: "#b3261e",
  ok: "#1e7a4b",
} as const;
