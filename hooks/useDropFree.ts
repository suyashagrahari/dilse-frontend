"use client";

// ─── Is a seasonal drop free right now? ──────────────────────────────────────
//
// The banners quote the season's sale percent ("49% OFF"), but the super admin
// can also make the drop's templates free on /admin/pricing — and a banner
// still shouting a discount on something that costs nothing reads as a bug.
// When every template in the drop is free, the banners say FREE instead.
// The rule itself is `isDropFree` (lib/season.ts), shared with the server
// render of the offer pages (lib/pricing.server.ts).

import { useMemo } from "react";
import { useTemplatePricing } from "@/hooks/useTemplatePricing";
import { useSeason } from "@/hooks/useSeason";
import { dropSlugsFor, isDropFree, type DropId } from "@/lib/season";

/** True once prices have landed and every template in the drop `id` is free. */
export function useDropFree(id: DropId): boolean {
  const season = useSeason();
  const { map, settled } = useTemplatePricing();
  return useMemo(() => settled && isDropFree(map, dropSlugsFor(season, id)), [map, settled, season, id]);
}
