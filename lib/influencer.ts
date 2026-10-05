/**
 * Influencer programme: shared types, money formatting and link building.
 * Mirrors `server/src/services/influencer.service.ts`.
 */
import { ROOT_DOMAIN, SITE_URL } from "@/lib/config";

export type PageKind = "paid" | "points" | "free";

export interface ReferredPage {
  id: string;
  templateType: string;
  templateLabel: string;
  isPublished: boolean;
  createdAt: string;
  kind: PageKind;
  amountPaise: number;
  commissionPaise: number;
}

export interface ReferredUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinedAt: string;
  pages: ReferredPage[];
  paidPages: number;
  spentPaise: number;
  earnedPaise: number;
}

export interface InfluencerDashboard {
  profile: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    subdomain?: string;
    referralCode: string;
    status: "active" | "suspended";
    instagram?: string;
    upiId?: string;
    commissionPercent: number;
    commissionOverride: number | null;
    joinedAt: string;
  };
  totals: { earnedPaise: number; paidOutPaise: number; pendingPaise: number; revenuePaise: number };
  stats: {
    clicks: number;
    signups: number;
    creators: number;
    pages: number;
    paidPages: number;
    freePages: number;
    conversionPercent: number;
  };
  daily: { day: string; clicks: number; signups: number; earnedPaise: number }[];
  referrals: ReferredUser[];
  earnings: {
    id: string;
    referredUserName: string;
    templateLabel: string;
    amountPaise: number;
    commissionPercent: number;
    commissionPaise: number;
    createdAt: string;
  }[];
  payouts: { id: string; amountPaise: number; note?: string; paidAt: string }[];
}

/** ₹1,234 — or ₹12.50 when there are paise. */
export function rupees(paise: number): string {
  const r = (paise || 0) / 100;
  return "₹" + r.toLocaleString("en-IN", { minimumFractionDigits: r % 1 ? 2 : 0, maximumFractionDigits: 2 });
}

/**
 * The links an influencer shares. The name link (priya.subhsandesh.in) only
 * exists where subdomain routing does; the short link works everywhere,
 * including staging and localhost.
 */
export function influencerLinks(code: string | undefined): { nameLink: string | null; shortLink: string | null } {
  if (!code) return { nameLink: null, shortLink: null };
  return {
    nameLink: ROOT_DOMAIN ? `https://${code}.${ROOT_DOMAIN}` : null,
    shortLink: `${SITE_URL}/r/${code}`,
  };
}

export const displayLink = (url: string) => url.replace(/^https?:\/\//, "");

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
