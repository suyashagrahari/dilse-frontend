// ─── What each template costs ────────────────────────────────────────────────
//
// The catalogue is code — `data/template-registry.ts` imports every template's
// config, and that list is what exists. This module answers the separate
// question of what a super admin has decided each one COSTS on this deployment,
// and it is the only thing the gallery badges and the paywall consult.
//
// The server's half is `config/templatePricing.ts` + `models/TemplatePricing.ts`,
// exposed at `GET /payment/pricing`. It returns only the templates somebody has
// PRICED, keyed by slug — normally a handful against a catalogue of fifty-two —
// so a slug that is absent is free. That also makes the failure mode the safe
// one: a request that fails leaves an empty map, everything reads as free, and
// nobody is shown a paywall they cannot get past.
//
// ── WHY THE FIRST VALUE MUST NOT BE A GUESS ─────────────────────────────────
//
// A client module cannot know the real prices until its fetch resolves, which is
// one render too late. Whatever it shows first is what the visitor sees, and
// both wrong answers are visible:
//
//   guessed free, actually paid  → the card says "Free", then changes to "₹10"
//   guessed paid, actually free  → a price badge on a template that costs
//                                  nothing, then it vanishes
//
// A card that changes its price after paint is worse than one that shows no
// badge for a beat, so this store's own default is "nothing is priced" and the
// real answer arrives with the HTML instead: `getPricingServer()` resolves it
// during the server render and `PricingProvider` hands it to consumers. That
// makes the server markup, the first client render and the settled state one
// list. This is the same shape as `lib/templateVisibility.ts` and for the same
// reason — read that file's note for the longer version.
//
// ── THIS IS NOT WHAT DECIDES WHETHER MONEY IS OWED ──────────────────────────
//
// The publish gate is. A client that wrongly believes a template is free still
// gets a 402 when it tries to publish, and the paywall then renders the pricing
// the SERVER attached to that 402 — not this store. So being briefly wrong here
// costs a badge, never a charge.

import { API_URL, IS_NGROK } from "@/lib/config";
import { freePricing, type ResolvedPricing } from "@/config/templatePricing";

export type PricingMap = Readonly<Record<string, ResolvedPricing>>;

const EMPTY: PricingMap = Object.freeze({});

let prices: PricingMap = EMPTY;

/**
 * Bumped only when a fetch of OURS completes.
 *
 * How consumers tell "the server handed us a list" from "we have since learned
 * something newer ourselves" — see `useTemplatePricing`. It stays 0 until this
 * module has an opinion of its own, so that is a fact to read rather than guess.
 */
let revision = 0;
let settled = false;
let inFlight: Promise<void> | null = null;

type Listener = () => void;
const listeners = new Set<Listener>();

function emit(): void {
  for (const l of listeners) {
    try { l(); } catch { /* a bad listener must not break pricing */ }
  }
}

function parse(json: unknown): PricingMap | null {
  const data = (json as { success?: unknown; data?: unknown } | null)?.data;
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;

  const out: Record<string, ResolvedPricing> = {};
  for (const [slug, row] of Object.entries(data as Record<string, unknown>)) {
    if (!row || typeof row !== "object") continue;
    const r = row as Partial<ResolvedPricing>;
    // Trust the server's derived values — it is the authority and the paywall
    // must show exactly what the gate quoted. Only coerce shape, never recompute.
    out[slug] = {
      slug,
      isFree:          Boolean(r.isFree),
      finalPricePaise: Number(r.finalPricePaise) || 0,
      finalPrice:      Number(r.finalPrice) || 0,
      mrpPaise:        Number(r.mrpPaise) || 0,
      mrp:             Number(r.mrp) || 0,
      savingsPaise:    Number(r.savingsPaise) || 0,
      savings:         Number(r.savings) || 0,
      discountPercent: Number(r.discountPercent) || 0,
      pointsCost:      Number(r.pointsCost) || 0,
      // The visitor's own currency, for display only (formatPrice). Anything
      // unexpected falls back to INR, the fields above.
      ...(r.currency === "USD" && Number(r.displayFinal) > 0
        ? { currency: "USD" as const, displayFinal: Number(r.displayFinal), displayMrp: Number(r.displayMrp) || Number(r.displayFinal) }
        : { currency: "INR" as const }),
    };
  }
  return out;
}

function load(fresh = false): Promise<void> {
  if (!fresh && (settled || inFlight)) return inFlight ?? Promise.resolve();
  if (fresh && inFlight) return inFlight;

  inFlight = (async () => {
    try {
      const res = await fetch(`${API_URL}/payment/pricing`, {
        // "no-cache", not "default": the browser may keep its copy but must check
        // it with the API first, so a visitor never reads a minutes-old answer.
        cache: fresh ? "no-store" : "no-cache",
        headers: IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : undefined,
      });
      const parsed = res.ok ? parse(await res.json()) : null;
      // A failed or malformed response settles as EMPTY — everything free. See
      // the note at the top: a missed badge beats a paywall nobody can clear.
      prices = parsed ?? EMPTY;
    } catch {
      prices = EMPTY;
    } finally {
      settled = true;
      revision++;
      inFlight = null;
      emit();
    }
  })();

  return inFlight;
}

/** Fetch prices if we have not already. Safe to call from anywhere, any number of times. */
export function loadPricing(): Promise<void> {
  return load(false);
}

/**
 * Refetch, bypassing the HTTP cache.
 *
 * For the admin panel after it writes a price: the endpoint is edge-cached for
 * 60s, and a super admin who saves a price and then looks at the gallery in the
 * same tab must not be shown the old one.
 */
export function refreshPricing(): Promise<void> {
  return load(true);
}

/**
 * Adopt the list the server resolved, to save a redundant fetch.
 *
 * A no-op once we have fetched for ourselves — our own answer is newer. Safe to
 * call from a render body: idempotent, and it does not notify (nothing has
 * changed for anyone already reading the same list).
 */
export function seedPricing(map: PricingMap): void {
  if (revision > 0 || settled) return;
  prices = map;
  settled = true;
}

export function subscribePricing(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const getPricingMap = (): PricingMap => prices;
export const getPricingRevision = (): number => revision;
export const isPricingSettled = (): boolean => settled;

// Server snapshots for `useSyncExternalStore`. Constant, so the server render and
// the first client render agree and hydration has nothing to reconcile.
export const getPricingMapServerSnapshot = (): PricingMap => EMPTY;
export const getPricingRevisionServerSnapshot = (): number => 0;

/**
 * The price for one slug out of a map. Unpriced slugs are free.
 *
 * A plain function of the map rather than a store read, so components that
 * already hold the map via `useTemplatePricing` do not each subscribe again.
 */
export function pricingFrom(map: PricingMap, slug: string): ResolvedPricing {
  const key = String(slug || "").trim().toLowerCase();
  if (!key) return freePricing(key);
  return map[key] ?? freePricing(key);
}
