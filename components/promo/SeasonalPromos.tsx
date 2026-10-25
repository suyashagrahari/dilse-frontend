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
//                 never a Valentine or festival banner
//   "dandiya"   → the Navratri Dandiya strip, card, critters and mirror-work
//                 torans — never a Diwali, Valentine or Halloween banner
//   "diwali"    → the Diwali strip, card, critters and marigold garlands —
//                 never a Dandiya, Valentine or Halloween banner
//   "wedding"   → the wedding-season strip and card, marigold laris and
//                 jhumkas in the corners and drifting petals — never a festival,
//                 Valentine or Halloween banner
//   "off"       → nothing (Premium promos are not seasonal and stay put)
//
// Until the season is known (no server answer, fetch in flight) nothing renders,
// which is what these spots did before their own fetches landed anyway. With
// India and abroad wearing different seasons, the strip's box is held meanwhile
// when both sides have one (SeasonPendingStrip), so the right one lands in place.

import { useSeason } from "@/hooks/useSeason";
import { PromoCountdownCard, PromoMarquee } from "./PromoBanners";
import HalloweenOfferBar from "./HalloweenOfferBar";
import HalloweenOfferCard from "./HalloweenOfferCard";
import HalloweenCritters from "./HalloweenCritters";
import HalloweenCornerWebs from "./HalloweenCornerWebs";
import { isFestivalMode } from "@/lib/season";
import FestivalOfferBar from "./FestivalOfferBar";
import FestivalOfferCard from "./FestivalOfferCard";
import FestivalCritters from "./FestivalCritters";
import { FestivalCorners } from "./FestivalDecor";
import SeasonPendingStrip from "./SeasonPendingStrip";
import WeddingOfferBar from "./WeddingOfferBar";
import WeddingOfferCard from "./WeddingOfferCard";
import { WeddingCorners, WeddingPetals } from "./WeddingDecor";

/**
 * What a creature on the blog must keep clear of: the running bar, the offer
 * card's glass panel (its text and button), any button in the page and anything marked to keep clear. The
 * navbars need no entry — the layer sits beneath them (z-index 39), so a
 * creature passing there goes behind them.
 */
export const CRITTER_AVOID_BLOG = ".hwb-wrap, .hoc-glass, .fsb-wrap, .foc-glass, .woc-glass, main button, [data-critter-avoid]";

export function SeasonalMarquee({ source, critters = false, className }: { source: string; critters?: boolean; className?: string }) {
  const s = useSeason();
  if (!s) return <SeasonPendingStrip className={className} />;
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
  if (isFestivalMode(s.mode)) {
    return (
      <>
        <FestivalOfferBar kind={s.mode} source={source} className={className} />
        {critters && <FestivalCritters kind={s.mode} scope="page" avoid={CRITTER_AVOID_BLOG} />}
        {critters && <FestivalCorners kind={s.mode} scope="page" />}
      </>
    );
  }
  if (s.mode === "wedding") {
    return (
      <>
        <WeddingOfferBar source={source} className={className} />
        {/* The blog's decorations: petals drifting down and laris in the corners. */}
        {critters && <WeddingPetals scope="page" />}
        {critters && <WeddingCorners scope="page" />}
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
  if (isFestivalMode(s.mode)) return <FestivalOfferCard kind={s.mode} className={className} />;
  if (s.mode === "wedding") return <WeddingOfferCard className={className} />;
  if (s.mode === "valentine") return <PromoCountdownCard source={source} className={className} />;
  return null;
}
