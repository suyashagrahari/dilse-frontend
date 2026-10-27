// ─── Free → premium upgrade offer (client half) ──────────────────────────────
//
// When a visitor publishes a free template that has a premium sibling (today:
// Build a Bouquet → Digital Bouquet), the publish first opens
// <PremiumUpgradeModal>: "see it in Premium?". "Try it" sends their free
// content to the server, which has an AI rewrite it into the premium
// template's fields (never adding photos they did not give), and opens the
// premium editor in preview with that draft. "Publish free" carries on with the
// free publish exactly as before.
//
// Server: server/src/controllers/upgrade.controller.ts (+ config/upgradePaths).
// Every step is recorded there (super admin → Upgrades) and in GA4.
//
// ── THE HAND-OFF ────────────────────────────────────────────────────────────
//
// The premium editor already restores a COMPLETED local draft into preview
// (useValentineDayEditor: `<slug>_draft` with `completed: true`), so the
// hand-off is just: write that draft, remember where they came from
// (sessionStorage UPGRADE_CTX), navigate to `/<to>?upgrade=<from>`. The premium
// page reads the context to show "Publish the free one instead", which goes
// back to `/<from>?publishFree=1` (plus `edit=<id>` when the free page already
// had a row), and the free editor publishes without asking again.

import { API_URL, IS_NGROK } from "@/lib/config";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";

export interface UpgradeOffer {
  enabled: true;
  from: string;
  to: string;
  title: string;
  perks: string[];
  price: {
    isFree: boolean;
    currency: "INR" | "USD";
    final: number;
    mrp: number;
    discountPercent: number;
    freeForViewer: boolean;
  };
}

export type UpgradeStep =
  | "shown"
  | "try_clicked"
  | "edit_opened"
  | "back_to_free"
  | "free_chosen"
  | "dismissed"
  | "free_published"
  | "premium_published";

export interface UpgradeContext {
  from: string;
  to: string;
  /** Where "publish the free one instead" goes. */
  backUrl: string;
  /** The free page's row, when it had one. */
  pageId: string | null;
  at: number;
}

const CTX_KEY = "ss_upgrade_ctx";
const VISITOR_KEY = "ss_visitor_id";
/** A context older than this is stale (an abandoned tab from yesterday). */
const CTX_TTL = 6 * 3600 * 1000;

const jsonHeaders = (token?: string | null): Record<string, string> => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
  ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
});

/** A random id this browser keeps, so a visitor counts once per funnel step. */
export function visitorId(): string {
  try {
    const have = window.localStorage.getItem(VISITOR_KEY);
    if (have && /^[A-Za-z0-9_-]{8,64}$/.test(have)) return have;
    const id = (crypto.randomUUID?.() ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`).replace(/[^A-Za-z0-9_-]/g, "");
    window.localStorage.setItem(VISITOR_KEY, id);
    return id;
  } catch {
    return "anon-session";
  }
}

/** Is there an offer for `from`, and what premium costs this visitor. null = publish as usual. */
export async function fetchUpgradeOffer(from: string, token?: string | null): Promise<UpgradeOffer | null> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    const r = await fetch(`${API_URL}/upgrade/${encodeURIComponent(from)}/offer`, { headers: jsonHeaders(token), signal: ctrl.signal });
    clearTimeout(timer);
    const j = await r.json();
    return j?.success && j.data?.enabled ? (j.data as UpgradeOffer) : null;
  } catch {
    // No offer is always safe: the free publish carries on.
    return null;
  }
}

/**
 * Free content → the premium version (AI-written). Throws a user-facing message.
 * The bouquet comes back as a whole `draft`; the birthday pages as a `patch`
 * over the premium demo (lib/upgrade/compose.ts).
 */
export async function convertToPremium<T>(from: string, data: unknown, token?: string | null, pageId?: string | null): Promise<{ to: string; draft?: T; patch?: Record<string, unknown>; source: "ai" | "carried" }> {
  const r = await fetch(`${API_URL}/upgrade/${encodeURIComponent(from)}/convert`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify({ data, visitorId: visitorId(), pageId: pageId ?? "" }),
  });
  const j = await r.json().catch(() => null);
  if (!r.ok || !j?.success) throw new Error(j?.error || "Could not prepare the premium version. Please try again.");
  return j.data;
}

/** One funnel step, to the server (super admin → Upgrades) and GA4. Fire and forget. */
export function trackUpgrade(from: string, step: UpgradeStep, opts: { token?: string | null; pageId?: string | null; to?: string } = {}): void {
  track(EVENTS.UPGRADE_STEP, { from, to: opts.to, step });
  try {
    void fetch(`${API_URL}/upgrade/${encodeURIComponent(from)}/events`, {
      method: "POST",
      headers: jsonHeaders(opts.token),
      body: JSON.stringify({ event: step, visitorId: visitorId(), pageId: opts.pageId ?? "" }),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

export function saveUpgradeContext(ctx: Omit<UpgradeContext, "at">): void {
  try { window.sessionStorage.setItem(CTX_KEY, JSON.stringify({ ...ctx, at: Date.now() })); } catch {}
}

export function readUpgradeContext(): UpgradeContext | null {
  try {
    const raw = window.sessionStorage.getItem(CTX_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as UpgradeContext;
    if (!c?.from || !c?.to || Date.now() - Number(c.at) > CTX_TTL) return null;
    return c;
  } catch {
    return null;
  }
}

export function clearUpgradeContext(): void {
  try { window.sessionStorage.removeItem(CTX_KEY); } catch {}
}

/**
 * Put a draft where the premium editor restores it into preview
 * (useValentineDayEditor). Photos still held in the browser (data: URLs, not
 * uploaded yet) can overflow storage; then the draft goes without them rather
 * than not at all. Returns false when even that failed.
 */
export function handDraftTo(slug: string, draft: unknown): boolean {
  const put = (d: unknown) => {
    const payload = JSON.stringify({ data: d, password: "", completed: true });
    try { window.localStorage.setItem(`${slug}_draft`, payload); return true; } catch {}
    try { window.sessionStorage.setItem(`${slug}_draft`, payload); return true; } catch {}
    return false;
  };
  if (put(draft)) return true;
  const d = draft as { photos?: { url?: string }[] };
  if (Array.isArray(d?.photos)) return put({ ...d, photos: d.photos.filter((p) => !String(p?.url ?? "").startsWith("data:")) });
  return false;
}

/** "₹149" / "$1.99". */
export function formatPrice(amount: number, currency: "INR" | "USD"): string {
  return currency === "USD" ? `$${amount.toFixed(2)}` : `₹${Math.round(amount).toLocaleString("en-IN")}`;
}
