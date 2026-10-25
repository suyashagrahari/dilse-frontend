"use client";

// ─── The /wedding hub's link to the wedding-season offer ─────────────────────
//
// The hub is the all-year catalogue; /wedding-offer is the season's sale. They
// are kept apart on purpose (the hub never duplicates the offer page), and
// joined by this one ribbon: while the site is in "wedding" mode it sits
// between the hero and the journey — the sale percent (or FREE, or just "the
// wedding season drop" while the sale is off), the countdown, and a link to
// the offer. The hub's own cards already show the sale prices: those come from
// /payment/pricing, which the server discounts for the drop's templates.
//
// Renders nothing outside the wedding season (and while a split season is
// still resolving for this visitor, like every seasonal spot).

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useSeason } from "@/hooks/useSeason";
import { useDropFree } from "@/hooks/useDropFree";
import { useNow } from "@/hooks/usePromo";
import { DROPS } from "@/lib/season";
import { dropClock } from "@/components/promo/FestivalOfferBar";
import { Rings } from "@/components/promo/weddingArt";
import { wtVars } from "@/components/promo/weddingTheme";

export default function SeasonRibbon() {
  const season = useSeason();
  const free = useDropFree("wedding");
  const t = useNow();
  if (season?.mode !== "wedding") return null;
  const pct = season.sale.enabled ? season.sale.percent : 0;
  const clock = dropClock(DROPS.wedding.endsAt, t);
  const ended = !!t && !clock;
  return (
    <div className="whRib" style={wtVars()}>
      <style>{RIB_CSS}</style>
      <Link href={DROPS.wedding.path} className="whRibIn" prefetch={false}
        aria-label={free ? "Wedding season drop: the invitations are free. See the offer." : pct ? `Wedding season drop: ${pct}% off the wedding invitations. See the offer.` : "The wedding season drop. See the offer."}>
        <span className="whRibSeal" aria-hidden>{free ? "FREE" : pct ? <>{pct}%<small>OFF</small></> : <Rings size={20} />}</span>
        <span className="whRibTxt">
          <b>Wedding season drop{free ? " · free" : pct ? ` · ${pct}% off` : ""}</b>
          <span>{free ? "The season's invitations are free to make and send" : pct ? "On the season's invitations — applied when you publish" : "The season's invitations, all in one place"}{!ended && <> · <span className="whRibClock">ends in {clock ?? "--d --:--:--"}</span></>}</span>
        </span>
        <span className="whRibGo">See the offer <ArrowRight size={15} aria-hidden /></span>
      </Link>
    </div>
  );
}

const RIB_CSS = `
.whRib { position: relative; z-index: 3; padding: 14px 12px 0; display: flex; justify-content: center; background: transparent; }
.whRibIn { position: relative; isolation: isolate; display: flex; align-items: center; gap: 12px; width: min(100%, 860px); padding: 10px 14px 10px 10px; border-radius: 18px;
  text-decoration: none; color: var(--wt-ink); overflow: hidden;
  background: radial-gradient(120% 200% at 100% 0%, rgba(231,154,163,.32), transparent 55%), linear-gradient(100deg, #fffaf2, #fdf0e8 60%, #fbe6e1);
  box-shadow: inset 0 0 0 1px var(--wt-gold), inset 0 0 0 4px rgba(255,255,255,.7), inset 0 0 0 5px rgba(195,154,67,.3), 0 18px 34px -22px rgba(110,30,40,.55); }
.whRibIn::before { content: ""; position: absolute; left: 12px; right: 12px; top: 0; height: 6px; z-index: -1;
  background-image: radial-gradient(circle at 50% 30%, var(--wt-marigold) 2.4px, transparent 2.8px), radial-gradient(circle at 50% 30%, var(--wt-marigold-deep) 1.8px, transparent 2.2px);
  background-size: 14px 6px, 14px 6px; background-position: 0 0, 7px 0; }
.whRibSeal { flex: none; width: 54px; height: 54px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center;
  font: 700 17px/1 'Playfair Display', serif; color: #fff3d6; background: radial-gradient(circle at 35% 30%, #c93f57, var(--wt-sindoor) 55%, var(--wt-sindoor-deep));
  box-shadow: 0 0 0 2px var(--wt-gold), 0 0 0 4px rgba(255,250,242,.9), 0 0 0 5px rgba(195,154,67,.4); }
.whRibSeal small { font: 800 8px/1 'Inter', sans-serif; letter-spacing: .2em; margin-top: 2px; }
.whRibTxt { display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1; text-align: left; }
.whRibTxt b { font: 700 16px/1.2 'Playfair Display', serif; color: var(--wt-ink); }
.whRibTxt > span { font: 500 12.5px/1.4 'Inter', sans-serif; color: var(--wt-ink-soft); }
.whRibClock { font-variant-numeric: tabular-nums; font-weight: 700; color: var(--wt-sindoor); white-space: nowrap; }
.whRibGo { flex: none; display: inline-flex; align-items: center; gap: 6px; padding: 11px 16px; border-radius: 999px; color: #fff3d6; font: 800 13px/1 'Inter', sans-serif;
  background: linear-gradient(180deg, #b8324a, var(--wt-sindoor) 60%, var(--wt-sindoor-deep)); box-shadow: 0 0 0 1px var(--wt-gold); }
@media (max-width: 640px) {
  .whRibIn { gap: 10px; padding: 10px 10px 10px 8px; }
  .whRibSeal { width: 46px; height: 46px; font-size: 15px; }
  .whRibTxt b { font-size: 14.5px; }
  .whRibTxt > span { font-size: 11.5px; }
  .whRibGo { width: 34px; height: 34px; padding: 0; justify-content: center; font-size: 0; gap: 0; }
  .whRibGo svg { width: 16px; height: 16px; }
}
`;
