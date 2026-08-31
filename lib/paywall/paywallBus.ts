// ─── Paywall bus ─────────────────────────────────────────────────────────────
//
// A one-slot module store so any template's editor hook can raise the paywall
// with a single call, and the paywall itself is mounted exactly once.
//
// This is the same shape as `lib/share/shareBus.ts`, for the same reasons — read
// that file's note too. The short version: the paywall is raised from
// `handlePublish` inside ~42 `useXxxEditor` hooks, a hook cannot render, and the
// alternative is 42 hooks exposing modal state plus 42 `page.tsx` files mounting
// and wiring the component. That is 84 files of identical plumbing whose failure
// mode is silent — forget the JSX in one page and that template takes money and
// never shows a receipt, or worse, shows no paywall and cannot publish.
//
// It is also the reason this feature shipped for two templates and not
// forty-two: the previous arrangement really was two files per template, and
// forty of them were never done.
//
// ── WHY THE PRICE COMES OFF THE 402 AND NOT THE PRICING STORE ───────────────
//
// `offerPaywall` is handed the parsed publish response and lifts `pricing`
// straight out of it. That object is the quote the publish gate JUST made, from
// an uncached read, for this exact template. Any other source can disagree with
// it:
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

import { useEffect, useRef, useSyncExternalStore } from "react";
import type { ResolvedPricing } from "@/config/templatePricing";

export interface PaywallRequest {
  /** The template's slug — for copy and analytics. */
  slug: string;
  /** The server-side templateType — what `/payment/*` is keyed by. */
  templateType: string;
  /** The page being unlocked. */
  pageId: string;
  /** The quote the gate made. See the note above on why this and nothing else. */
  pricing: ResolvedPricing;
  /** The template's own display name, for the modal heading. */
  templateTitle?: string;
}

let current: PaywallRequest | null = null;

/**
 * The page a payment has just completed for.
 *
 * Keyed by page rather than a bare boolean so two editors mounted at once — a
 * preview behind a modal, a route transition mid-flight — cannot both conclude
 * the payment was theirs and both re-publish.
 */
let paidPageId: string | null = null;

const listeners = new Set<() => void>();

function emit(): void {
  for (const listen of listeners) listen();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

/** Shape of the pricing object a 402 carries. Validated, not trusted. */
function readPricing(value: unknown): ResolvedPricing | null {
  if (!value || typeof value !== "object") return null;
  const p = value as Partial<ResolvedPricing>;
  // `finalPricePaise` is the one field the checkout cannot work without, and a
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
 * Raise the paywall if this publish response was a `402`.
 *
 * Returns true when it handled the response, so the caller can skip its own
 * "Publish failed" toast. This is the ONE line each editor adds to its publish
 * branch — a plain function, not a hook, so it is callable from inside a
 * `useCallback` without joining its dependency list and without the editor
 * needing a provider above it.
 *
 * Returns false for anything else, including a 402 whose pricing is missing or
 * nonsensical: the caller then shows its normal failure, which is the honest
 * outcome when the server demanded money and did not say how much.
 */
export function offerPaywall(
  result: unknown,
  ctx: { slug: string; templateType: string; pageId: string; templateTitle?: string }
): boolean {
  const error = (result as { error?: unknown } | null)?.error;
  if (error !== "PAYMENT_REQUIRED") return false;

  const pricing = readPricing((result as { pricing?: unknown }).pricing);
  if (!pricing) {
    console.error("[paywall] 402 with no usable pricing; not raising the paywall", result);
    return false;
  }
  if (!ctx.pageId) {
    console.error("[paywall] 402 with no pageId; nothing to unlock");
    return false;
  }

  current = { ...ctx, pricing };
  emit();
  return true;
}

export function closePaywall(): void {
  if (current === null) return;
  current = null;
  emit();
}

/**
 * Record that this page is now unlocked, and close the paywall.
 *
 * Called by `PaywallHost` after the server has VERIFIED the payment — never
 * from a Razorpay callback directly, because an unverified signature is not a
 * payment.
 */
export function markPagePaid(pageId: string): void {
  if (!pageId) return;
  paidPageId = pageId;
  current = null;
  emit();
}

function clearPaidPage(): void {
  if (paidPageId === null) return;
  paidPageId = null;
  emit();
}

const getRequest = () => current;
const getRequestServerSnapshot = () => null;
const getPaidPage = () => paidPageId;
const getPaidPageServerSnapshot = () => null;

/** The open paywall request, or null. Re-renders only on open/close. */
export function usePaywallRequest(): PaywallRequest | null {
  return useSyncExternalStore(subscribe, getRequest, getRequestServerSnapshot);
}

/**
 * Re-run `publish` once a payment for `pageId` has been verified.
 *
 * The second line each editor adds. It owns the ref, the effect and the
 * clean-up, so an editor never writes any of that — which is what keeps the
 * forty-template sweep to three lines per file and stops each one inventing its
 * own retry.
 *
 * ── WHY A REF ───────────────────────────────────────────────────────────────
 *
 * `publish` is a new function on nearly every render (it is a `useCallback` over
 * changing form state). Depending on it directly would re-run this effect
 * constantly, and capturing it once would publish stale content — the user may
 * have edited while the Razorpay sheet was open. The ref is updated every render
 * and read only when a payment lands, so the publish that fires is always the
 * current one.
 */
export function usePublishAfterPaywall(
  pageId: string | null | undefined,
  publish: () => void | Promise<void>
): void {
  const publishRef = useRef(publish);

  // Declared BEFORE the effect that reads the ref, so within one commit the ref
  // is refreshed first and the publish that fires is never a render behind.
  // In an effect rather than during render because writing a ref while
  // rendering is not safe under concurrent React — the render may be discarded.
  useEffect(() => {
    publishRef.current = publish;
  }, [publish]);

  const paid = useSyncExternalStore(subscribe, getPaidPage, getPaidPageServerSnapshot);

  useEffect(() => {
    if (!pageId || paid !== pageId) return;
    // Cleared BEFORE publishing, so a publish that itself re-renders this
    // component cannot see the flag still set and fire twice.
    clearPaidPage();
    void publishRef.current();
  }, [paid, pageId]);
}
