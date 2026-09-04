// ─── What the /admin/drafts screen is made of ────────────────────────────────
//
// Split out of `page.tsx` when the screen grew a second panel, a sender picker
// and a missing-fields list, following the same shape as
// `admin/users/[userId]/types.ts`. The page owns state and layout; these are
// the contracts it talks about.

import type { Thread } from "@/components/admin/ConversationThread";
import type { SenderOption } from "@/components/admin/SenderPicker";
import { BRAND } from "@/lib/brand";

export interface Row {
  pageId: string;
  templateType: string;
  templateLabel: string;
  userId: string;
  userName: string;
  userEmail: string;
  createdAt: string;
  updatedAt: string;
  daysIdle: number;
  isPaid: boolean;
  finalPricePaise: number;
  reason: string;
  reasonDetail: string;
  blockedByPrice: boolean;
  completeness: number;
  wordCount: number;
  photoCount: number;
  nudgedAt: string | null;
  /** "" when the account is gone — the row then shows no profile button. */
  profileUserId: string;
  templateSlug: string;
  missingCount: number;
  missingFields: string[];
}

export interface Stats {
  totalDrafts: number;
  priceBlocked: number;
  freeStalled: number;
  contacted: number;
  capped: boolean;
  /**
   * Drafts the list is NOT showing because their creator's account is gone.
   *
   * `totalDrafts` counts every unpublished page; the list drops the ones that
   * cannot be written to. Without this number the header and the list disagree
   * with nothing to explain the gap, which reads as a broken panel.
   */
  hiddenNoOwner?: number;
}

export interface Detail {
  pageId: string;
  templateType: string;
  templateLabel: string;
  templateSlug: string;
  user: { name: string; email: string };
  profileUserId: string;
  summary: {
    completeness: number;
    filledFields: number;
    totalFields: number;
    wordCount: number;
    photoCount: number;
  };
  missingFields: string[];
  missingCount: number;
  verdict: { reason: string; detail: string; blockedByPrice: boolean };
  daysIdle: number;
  alreadyContacted: { sentAt: string; subject: string; body: string } | null;
  cooldown: { until: string } | null;
  sesConfigured: boolean;
  fromEmail: string;
  senderOptions: SenderOption[];
  defaultSenderId: string;
  replyToAddress: string;
  threads: Thread[];
  defaultThreadMode: "same" | "new";
  /**
   * Whether replies arrive on their own, or have to be pasted in.
   *
   * `configured` is true for EITHER route — the SES receiving webhook or the
   * mailbox poller — so `mechanisms` says which, and `etaSeconds` reflects
   * that choice rather than assuming one of them.
   */
  inbound: {
    configured: boolean;
    mechanisms?: string[];
    etaSeconds?: number;
    /**
     * The address a reply is actually ADDRESSED to, which is not the From
     * address: outbound mail goes as feedback@ on the apex domain, whose mail
     * is GoDaddy's, while SES receives on a subdomain.
     */
    replyToAddress?: string;
    user?: string;
    filterAddresses: string[];
    pollSeconds?: number;
    lastOkAt?: string | null;
    lastError?: string;
    totalStored?: number;
  };
}

export interface Pg { page: number; limit: number; total: number; totalPages: number }

export const FILTERS = [
  { key: "all", label: "All drafts" },
  { key: "price-blocked", label: "Stopped by price" },
  { key: "free-stalled", label: "Free, unfinished" },
  { key: "not-contacted", label: "Not contacted" },
  { key: "contacted", label: "Contacted" },
  { key: "idle", label: "Idle 7d+" },
] as const;

/**
 * Short human label per computed reason, plus the colour it earns.
 *
 * Colour carries meaning here and is not decoration: red is money left on the
 * table, green is a page that is finished and one tap from being live, and the
 * greys are onboarding problems. Somebody scanning the list is choosing what to
 * act on, and those are three different actions.
 */
export const REASON_META: Record<string, { label: string; color: string; bg: string }> = {
  paywall_abandoned:   { label: "Left at checkout",      color: BRAND.danger,   bg: "rgba(161,53,64,0.10)" },
  price_not_attempted: { label: "Saw the price",         color: BRAND.goldDeep, bg: "rgba(201,168,76,0.16)" },
  ready_not_published: { label: "Finished, unpublished", color: BRAND.ok,       bg: "rgba(58,167,109,0.12)" },
  unfinished:          { label: "Stopped partway",       color: BRAND.muted,    bg: "rgba(61,12,17,0.06)" },
  just_started:        { label: "Barely started",        color: BRAND.faint,    bg: "rgba(61,12,17,0.05)" },
};
