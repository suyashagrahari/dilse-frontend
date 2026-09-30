// Shapes shared by the /admin/outreach screen. Mirrors
// server/src/services/audience.service.ts and controllers/adminOutreach.controller.ts.

export interface AudienceRow {
  userId: string;
  name: string;
  email: string;
  verified: boolean;
  provider: "local" | "google";
  status: string;
  optedOut: boolean;
  joinedAt: string;
  pages: number;
  published: number;
  templates: { type: string; label: string; count: number }[];
  lastPageAt: string | null;
  feedbackCount: number;
  avgRating: number | null;
  ratings: number[];
  lastRating: number | null;
  commentCount: number;
  paidOrders: number;
  lastEmailedAt: string | null;
}

export interface Filters {
  q: string;
  verified: "verified" | "all";
  ratings: number[];
  feedback: "any" | "given" | "none" | "comment";
  pages: "any" | "0" | "1" | "1+" | "2-4" | "5+";
  published: "any" | "yes" | "no";
  template: string;
  joined: "any" | "7" | "30" | "90" | "365";
  active: "any" | "7" | "30" | "90" | "idle30" | "idle90";
  provider: "any" | "google" | "local";
  paid: "any" | "yes" | "no";
  emailed: "any" | "never" | "not14" | "not30";
  optout: "hide" | "only";
  sort: "joined" | "pages" | "rating" | "active" | "name";
  order: "asc" | "desc";
}

export const DEFAULT_FILTERS: Filters = {
  q: "", verified: "verified", ratings: [], feedback: "any", pages: "any", published: "any", template: "",
  joined: "any", active: "any", provider: "any", paid: "any", emailed: "any", optout: "hide", sort: "joined", order: "desc",
};

export interface AudienceStats {
  totalUsers: number;
  verifiedUsers: number;
  matching: number;
  sendable: number;
  withFeedback: number;
  avgRating: number | null;
  pages: number;
  optedOut: number;
}

export interface AudienceResponse {
  rows: AudienceRow[];
  total: number;
  page: number;
  pages: number;
  label: string;
  stats: AudienceStats;
  ratingCounts: Record<string, number>;
  templates: { type: string; label: string; users: number }[];
  sesConfigured: boolean;
}

/** Hand-picked people, or "everyone the filter matches, minus these". */
export type Selection =
  | { mode: "ids"; rows: Map<string, AudienceRow> }
  | { mode: "filter"; filters: Filters; exclude: Set<string> };

export interface RecipientList {
  count: number;
  label: string;
  skipped: { unverified: number; inactive: number; optedOut: number; duplicate: number };
  recipients: { userId: string; email: string; name: string }[];
}

export interface Broadcast {
  _id: string;
  subject: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  brief: string;
  audienceLabel: string;
  total: number;
  sentCount: number;
  failedCount: number;
  pending?: number;
  status: "sending" | "sent" | "partial" | "failed" | "interrupted";
  createdByEmail: string;
  startedAt: string;
  finishedAt?: string;
  createdAt: string;
  recipients?: { userId: string; email: string; name: string; status: "pending" | "sent" | "failed" | "skipped"; error?: string; sentAt?: string }[];
}

export type Tone = "warm" | "festive" | "professional" | "apologetic" | "excited";
export type Length = "short" | "medium" | "long";

export interface Draft {
  subject: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
}

/** Filters → query string (GET) — the JSON body form is the object itself. */
export function filtersToQuery(f: Filters): URLSearchParams {
  const q = new URLSearchParams();
  (Object.keys(f) as (keyof Filters)[]).forEach((k) => {
    const v = f[k];
    const d = DEFAULT_FILTERS[k];
    if (Array.isArray(v)) { if (v.length) q.set(k, v.join(",")); }
    else if (v !== d) q.set(k, String(v));
  });
  return q;
}

export function rel(iso: string | null | undefined): string {
  if (!iso) return "—";
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 14) return `${Math.floor(s / 86400)}d ago`;
  if (s < 86400 * 60) return `${Math.floor(s / 86400 / 7)}w ago`;
  if (s < 86400 * 365) return `${Math.floor(s / 86400 / 30)}mo ago`;
  return `${Math.floor(s / 86400 / 365)}y ago`;
}
