// ─── Paywall bus ─────────────────────────────────────────────────────────────
//
// A one-slot module store so any template's editor can raise the paywall, and
// the paywall itself is mounted exactly once.
//
// This is the same shape as `lib/share/shareBus.ts`, for the same reasons — read
// that file's note too. The short version: the paywall is raised from the publish
// path inside ~41 `useXxxEditor` hooks, a hook cannot render, and the alternative
// is 41 hooks exposing modal state plus 41 `page.tsx` files mounting and wiring
// the component. That is 82 files of identical plumbing whose failure mode is
// silent — forget the JSX in one page and that template shows no paywall and
// simply cannot be published.
//
// It is also the reason this feature shipped for one template and not
// forty-two: the previous arrangement really was two files per template.
//
// ── MOST EDITORS DO NOT TOUCH THIS FILE ─────────────────────────────────────
//
// They call `publishWithPaywall` from `./publishRequest`, which owns the whole
// interaction and hands the editor back a publish response exactly as `fetch`
// would have. This module is the plumbing underneath it.
//
// ── WHY THE PRICE COMES OFF THE 402 AND NOT THE PRICING STORE ───────────────
//
// The pricing is lifted straight out of the refusal. That object is the quote the
// publish gate JUST made, from an uncached read, for this exact template. Any
// other source can disagree with it:
//
//   • the public pricing endpoint is edge-cached for 60s
//   • the client store may have loaded before a super admin changed the price
//
// A number shown beside a Pay button must be the number that will be charged, so
// it comes from the refusal that demanded it. `create-order` then re-checks the
// same amount server-side and answers `409 PRICE_CHANGED` if it has moved — so
// even a stale quote cannot become a surprise charge.
//
// ── SSR ─────────────────────────────────────────────────────────────────────
//
// `useSyncExternalStore` is given a server snapshot of `null`, so the paywall is
// always closed in the server render and there is no hydration mismatch. The
// store is never written during a server render: `offerPaywall` is only ever
// reached from an event handler.

import { useSyncExternalStore } from "react";
import type { ResolvedPricing } from "@/config/templatePricing";

/** What the caller must tell the paywall about the page being unlocked. */
export interface PaywallContext {
  /** The template's slug — for copy and analytics. */
  slug: string;
  /** The server-side templateType — what `/payment/*` is keyed by. */
  templateType: string;
  /** The page being unlocked. */
  pageId: string | null | undefined;
  /** The template's own display name, for the modal heading. */
  templateTitle?: string;
}

export interface PaywallRequest extends Omit<PaywallContext, "pageId"> {
  pageId: string;
  /** The quote the gate made. See the note above on why this and nothing else. */
  pricing: ResolvedPricing;
  /** The payment is verified and the page is unlocked. */
  onPaid: () => void;
  /** The user closed the paywall without paying. */
  onDismiss: () => void;
}

let current: PaywallRequest | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listen of listeners) listen();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

/** Does this publish response mean "pay first"? */
export function isPaymentRequired(result: unknown): boolean {
  return (result as { error?: unknown } | null)?.error === "PAYMENT_REQUIRED";
}

/** Shape of the pricing object a 402 carries. Validated, not trusted. */
export function readPricing(value: unknown): ResolvedPricing | null {
  if (!value || typeof value !== "object") return null;
  const p = value as Partial<ResolvedPricing>;
  // `finalPricePaise` is the one field checkout cannot work without, and a
  // paywall asking for ₹0 is a bug we would rather surface as "no paywall".
  if (typeof p.finalPricePaise !== "number" || p.finalPricePaise <= 0) return null;
  return {
    slug:            String(p.slug ?? ""),
    isFree:          Boolean(p.isFree),
    finalPricePaise: p.finalPricePaise,
    finalPrice:      Number(p.finalPrice) || p.finalPricePaise / 100,
    mrpPaise:        Number(p.mrpPaise) || p.finalPricePaise,
    mrp:             Number(p.mrp) || (Number(p.mrpPaise) || p.finalPricePaise) / 100,
    savingsPaise:    Number(p.savingsPaise) || 0,
    savings:         Number(p.savings) || 0,
    discountPercent: Number(p.discountPercent) || 0,
    pointsCost:      Number(p.pointsCost) || 0,
  };
}

/**
 * Raise the paywall for a `402` publish response.
 *
 * Returns false — having raised nothing — when the response is not a paywall, or
 * is one we cannot render: no usable pricing, or no page to unlock. The caller
 * then proceeds as it would have with any other failure, which is the honest
 * outcome when the server demanded money and did not say how much.
 *
 * Prefer `publishWithPaywall` in `./publishRequest`. This is for callers that
 * already hold a parsed response and want to drive the two outcomes themselves.
 */
export function offerPaywall(
  result: unknown,
  ctx: PaywallContext & { onPaid: () => void; onDismiss: () => void }
): boolean {
  if (!isPaymentRequired(result)) return false;

  const pricing = readPricing((result as { pricing?: unknown }).pricing);
  if (!pricing) {
    console.error("[paywall] 402 with no usable pricing; not raising the paywall", result);
    return false;
  }
  if (!ctx.pageId) {
    console.error("[paywall] 402 with no pageId; nothing to unlock");
    return false;
  }

  current = { ...ctx, pageId: ctx.pageId, pricing };
  emit();
  return true;
}

/** The user closed the paywall without paying. */
export function closePaywall(): void {
  const request = current;
  if (!request) return;
  current = null;
  emit();
  try {
    request.onDismiss();
  } catch (err) {
    console.error("[paywall] onDismiss threw", err);
  }
}

/**
 * The payment is verified. Close the paywall and tell the caller.
 *
 * Called by `PaywallHost` only after the SERVER has confirmed the payment —
 * never straight from a Razorpay callback, because an unverified signature is a
 * claim and not a payment.
 *
 * The slot is cleared before `onPaid` runs, so a publish that synchronously
 * re-renders cannot see the paywall still open and raise it again.
 */
export function completePaywall(): void {
  const request = current;
  if (!request) return;
  current = null;
  emit();
  try {
    request.onPaid();
  } catch (err) {
    // The money is taken and the page is unlocked; a throwing continuation must
    // not look like a failed payment. The next Publish passes the gate for free.
    console.error("[paywall] onPaid threw", err);
  }
}

const getRequest = () => current;
const getRequestServerSnapshot = () => null;

/** The open paywall request, or null. Re-renders only on open/close. */
export function usePaywallRequest(): PaywallRequest | null {
  return useSyncExternalStore(subscribe, getRequest, getRequestServerSnapshot);
}
