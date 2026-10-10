"use client";

// ─── One switch for every seasonal banner spot ───────────────────────────────
//
// The blog and the gallery used to render the Valentine wishlist banners
// directly. They now render these, which pick by the season a super admin set
// in /admin/season:
//
//   "valentine" → the Valentine banners, exactly as before (they still show
//                 only while their own countdown runs — /admin/wishlist)
//   "halloween" → the Halloween strip, card and critters
//   "off"       → nothing
//
// Until the season is known (no server answer, fetch in flight) nothing renders,
// which is what these spots did before their own fetches landed anyway.

import { useSeason } from "@/hooks/useSeason";
import { PromoCountdownCard, PromoMarquee } from "./PromoBanners";
import HalloweenOfferBar from "./HalloweenOfferBar";
import HalloweenOfferCard from "./HalloweenOfferCard";
import HalloweenCritters from "./HalloweenCritters";

/**
 * What a creature on the blog must keep clear of: the running bar, the offer
 * card's button, any button in the page and anything marked to keep clear. The
 * navbars need no entry — the layer sits beneath them (z-index 39), so a
 * creature passing there goes behind them.
 */
export const CRITTER_AVOID_BLOG = ".hwb-wrap, .hoc-cta, main button, [data-critter-avoid]";

export function SeasonalMarquee({ source, critters = false, className }: { source: string; critters?: boolean; className?: string }) {
  const s = useSeason();
  if (!s) return null;
  if (s.mode === "halloween") {
    return (
      <>
        <HalloweenOfferBar source={source} className={className} />
        {critters && <HalloweenCritters scope="page" kinds={["ghost", "crawl", "drop", "bats"]} avoid={CRITTER_AVOID_BLOG} />}
      </>
    );
  }
  if (s.mode === "valentine") return <PromoMarquee source={source} className={className} />;
  return null;
}

export function SeasonalCountdownCard({ source, className }: { source: string; className?: string }) {
  const s = useSeason();
  if (!s) return null;
  if (s.mode === "halloween") return <HalloweenOfferCard className={className} />;
  if (s.mode === "valentine") return <PromoCountdownCard source={source} className={className} />;
  return null;
}
