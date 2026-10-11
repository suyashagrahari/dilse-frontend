"use client";

// ─── One switch for every seasonal banner spot ───────────────────────────────
//
// The blog and the gallery used to render the Valentine wishlist banners
// directly. They now render these, which pick by the season a super admin set
// in /admin/season:
//
//   "valentine" → the Valentine banners, exactly as before (they still show
//                 only while their own countdown runs — /admin/wishlist)
//   "halloween" → the Halloween strip, card, critters and corner webs —
//                 never a Valentine or festive banner
//   "festive"   → the Navratri & Diwali strip, card, critters and corner
//                 garlands — never a Valentine or Halloween banner
//   "off"       → nothing (Premium promos are not seasonal and stay put)
//
// Until the season is known (no server answer, fetch in flight) nothing renders,
// which is what these spots did before their own fetches landed anyway.

import { useSeason } from "@/hooks/useSeason";
import { PromoCountdownCard, PromoMarquee } from "./PromoBanners";
import HalloweenOfferBar from "./HalloweenOfferBar";
import HalloweenOfferCard from "./HalloweenOfferCard";
import HalloweenCritters from "./HalloweenCritters";
import HalloweenCornerWebs from "./HalloweenCornerWebs";
import FestiveOfferBar from "./FestiveOfferBar";
import FestiveOfferCard from "./FestiveOfferCard";
import FestiveCritters from "./FestiveCritters";
import FestiveCorners from "./FestiveDecor";

/**
 * What a creature on the blog must keep clear of: the running bar, the offer
 * card's glass panel (its text and button), any button in the page and anything marked to keep clear. The
 * navbars need no entry — the layer sits beneath them (z-index 39), so a
 * creature passing there goes behind them.
 */
export const CRITTER_AVOID_BLOG = ".hwb-wrap, .hoc-glass, .fsb-wrap, .foc-glass, main button, [data-critter-avoid]";

export function SeasonalMarquee({ source, critters = false, className }: { source: string; critters?: boolean; className?: string }) {
  const s = useSeason();
  if (!s) return null;
  if (s.mode === "halloween") {
    return (
      <>
        <HalloweenOfferBar source={source} className={className} />
        {/* The blog's decorations: creatures in waves and webs in the corners. */}
        {critters && <HalloweenCritters scope="page" kinds={["ghost", "crawl", "drop", "bats"]} avoid={CRITTER_AVOID_BLOG} />}
        {critters && <HalloweenCornerWebs scope="page" />}
      </>
    );
  }
  if (s.mode === "festive") {
    return (
      <>
        <FestiveOfferBar source={source} className={className} />
        {critters && <FestiveCritters scope="page" avoid={CRITTER_AVOID_BLOG} />}
        {critters && <FestiveCorners scope="page" />}
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
  if (s.mode === "festive") return <FestiveOfferCard className={className} />;
  if (s.mode === "valentine") return <PromoCountdownCard source={source} className={className} />;
  return null;
}
