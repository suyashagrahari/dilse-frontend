"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import {
  getPricingMap,
  getPricingMapServerSnapshot,
  getPricingRevision,
  getPricingRevisionServerSnapshot,
  isPricingSettled,
  loadPricing,
  pricingFrom,
  subscribePricing,
  type PricingMap,
} from "@/lib/pricing";
import type { ResolvedPricing } from "@/config/templatePricing";

/**
 * What each template costs, for the surfaces that DISPLAY a price.
 *
 * ── THIS IS NOT WHAT THE PAYWALL READS ──────────────────────────────────────
 *
 * The paywall renders the pricing the server attached to its own `402`, which is
 * the exact quote the gate just made. It does not consult this store at all, and
 * that is deliberate: a price shown beside a Pay button has to be the price that
 * will be charged, and the only way to be certain is to use the number that came
 * back with the refusal. See `lib/paywall/paywallBus.ts`.
 *
 * So this hook exists for badges — the gallery card, an admin preview — where
 * being a moment late is invisible and being wrong is merely untidy.
 *
 * ── WHY `settled` MATTERS ───────────────────────────────────────────────────
 *
 * Before the fetch lands the map is empty, and an empty map reads as "everything
 * is free". A card that paints "Free" and then changes to "₹10" is worse than one
 * that shows no badge for a beat, so callers must render nothing until `settled`
 * rather than trusting the free default. `TemplateCard` does exactly that.
 *
 * `useSyncExternalStore` rather than `useState` + `useEffect` because the store
 * is module-level and shared: fifty gallery cards mount at different times
 * against the same already-settled map, and an effect-based hook would start each
 * one from a stale default or refetch per card.
 */
export function useTemplatePricing(): {
  map: PricingMap;
  /** The price for one slug. Unpriced slugs are free — check `settled` first. */
  pricingFor: (slug: string) => ResolvedPricing;
  /** Have we got a real answer yet? False means "render no badge", not "free". */
  settled: boolean;
} {
  // Idempotent and shared: the first card to mount triggers the one fetch, and
  // every later card finds it already settled.
  useEffect(() => { void loadPricing(); }, []);

  const map = useSyncExternalStore(
    subscribePricing,
    getPricingMap,
    getPricingMapServerSnapshot
  );
  // Subscribing to the revision as well is what makes a `refreshPricing()` from
  // the admin panel repaint cards that are already showing a settled price. The
  // map identity changes too, but only when the contents actually differ.
  useSyncExternalStore(
    subscribePricing,
    getPricingRevision,
    getPricingRevisionServerSnapshot
  );
  const settled = useSyncExternalStore(
    subscribePricing,
    isPricingSettled,
    () => false
  );

  const pricingFor = useCallback((slug: string) => pricingFrom(map, slug), [map]);

  return useMemo(() => ({ map, pricingFor, settled }), [map, pricingFor, settled]);
}
