"use client";

import React, { memo } from "react";
import Link from "next/link";
import { useWitchPortal, warmWitch, isHalloweenTemplateHref } from "@/components/promo/WitchPortal";
import { useFestivalPortal, useIsFestivalTemplate } from "@/components/promo/FestivalPortal";
import Image from "next/image";
import { PlayCircle } from "lucide-react";
import FavoriteButton from "@/components/FavoriteButton";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import type { TemplateListItem } from "@/types/template-config";
import { useTemplatePricing } from "@/hooks/useTemplatePricing";
import { guideByTemplateHref } from "@/data/guide-registry";
import { coverSmall, coverSrcSet } from "@/lib/templateMedia";
import { RANK_BADGES, compactCount } from "@/lib/templateMeta";
import { formatPrice } from "@/config/templatePricing";
import { useAppSelector } from "@/store/hooks";

interface TemplateCardProps {
  template: TemplateListItem;
  isFav: boolean;
  index: number;
  onFavorite: (e: React.MouseEvent, slug: string) => void;
  /** 1–5 when this is one of the most-created templates in its room. */
  rank?: number;
  /** Pages created — shown beside the rank badge once it is worth showing. */
  created?: number;
  /** Inside its launch window (galleryRules.isNewLaunch): the diagonal "New launch" ribbon. */
  isNew?: boolean;
  /** The gallery's price strip under the cover. Off by default: the offer pages print their own price line. */
  price?: boolean;
}

/** Memoized — only re-renders when isFav, index, or template identity changes */
const TemplateCard = memo(function TemplateCard({
  template,
  isFav,
  index,
  onFavorite,
  rank,
  created = 0,
  isNew = false,
  price = false,
}: TemplateCardProps) {
  const badge = rank && rank >= 1 && rank <= RANK_BADGES.length ? RANK_BADGES[rank - 1] : null;
  // A compile-time lookup against the guide registry, not a fetch — the registry
  // is a static import, so this costs one object property read per card.
  const hasGuide = Boolean(guideByTemplateHref[`/${template.slug}`]);

  // The price strip under the cover, and the click event's is_premium. Fifty
  // cards share one module-level fetch, so it is a map read per card. The
  // server picks the visitor's currency (₹ in India, $ abroad); formatPrice
  // only displays what it was given.
  const { pricingFor, settled } = useTemplatePricing();
  const freeFor = useAppSelector((s) => s.auth.user?.publishesFree ?? null);
  const pricing = pricingFor(template.slug);
  const openWitch = useWitchPortal();
  const witchy = isHalloweenTemplateHref(template.slug);
  const openFestival = useFestivalPortal();
  const festival = useIsFestivalTemplate(template.slug);

  return (
    // ── WHY NO FRAMER-MOTION HERE ──────────────────────────────────────────────
    //
    // The gallery renders fifty of these. Each used to carry a `layout` motion
    // wrapper, a whileHover that animated box-shadow, and three live
    // backdrop-filter blurs — about 150 blur layers the GPU re-composited on
    // every scroll frame, which is what made the page feel heavy on a phone.
    // The entrance and hover are now CSS on transform/opacity only, the tints
    // are solid, and `content-visibility: auto` lets the browser skip drawing
    // cards that are off-screen. See TEMPLATE_CARD_CSS below.
    <div className="tplCard" style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}>
      {/* onClick only records the click; navigation is still handled entirely by
          Link. The favourite button's handler calls stopPropagation (see
          handleFavorite in app/(app)/templates/page.tsx), so favouriting a card
          does not reach this and is not miscounted as an open. */}
      <Link
        href={`/${template.slug}`}
        className="block group tplLink"
        onPointerEnter={witchy ? warmWitch : undefined}
        onClick={(e) => {
          track(EVENTS.TEMPLATE_CARD_CLICKED, {
            template: template.slug,
            position: index,
            is_premium: !pricing.isFree,
          });
          // A Halloween template opens through the witch portal (Halloween mode only).
          if (witchy) openWitch(e, `/${template.slug}`);
          // The active festival's drop template opens through its portal (sticks twirl / a cracker bursts).
          else if (festival) openFestival(e, `/${template.slug}`);
        }}
      >
        <div className="tplShell">
        <div className="tplInner relative aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0" style={{ background: "var(--app-card-img-bg)" }} />

          {/* Cover image — the covers are finished posters (title, tagline and
              real screens are all in the artwork), so the card shows the image
              and nothing on top of it. The name is kept for screen readers and
              search engines only. */}
          {template.coverImage && (
            <div className="absolute inset-0">
              {coverSrcSet(template.coverImage) ? (
                // Pre-sized variants straight from CloudFront (see coverSrcSet):
                // no trip through the app server's image optimizer.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={coverSmall(template.coverImage)}
                  srcSet={coverSrcSet(template.coverImage)}
                  sizes="(max-width:768px) 50vw, (max-width:1024px) 33vw, 25vw"
                  alt={template.title}
                  className="absolute inset-0 w-full h-full object-cover tplImg"
                  loading={index < 4 ? "eager" : "lazy"}
                  decoding="async"
                  // The first row is the shop window — fetch it ahead of everything else.
                  fetchPriority={index < 4 ? "high" : "auto"}
                />
              ) : (
                <Image
                  src={template.coverImage}
                  alt={template.title}
                  fill
                  className="object-cover tplImg"
                  sizes="(max-width:768px) 50vw, (max-width:1024px) 33vw, 25vw"
                  loading={index < 4 ? "eager" : "lazy"}
                  fetchPriority={index < 4 ? "high" : "auto"}
                />
              )}
            </div>
          )}
          <span className="sr-only">{template.title} — {template.description}</span>

          {/* New launch — a satin sash across the top-left corner for the first
              days after a template goes live. The cover's rounded clip trims
              its ends; the rank badge moves beside the heart while it shows. */}
          {isNew && (
            <span className="tplRibbon" aria-label="New launch">
              <span className="tplRibbonBand"><span aria-hidden>✦</span> New launch <span aria-hidden>✦</span></span>
            </span>
          )}

          {/* Rank badge — the five most-created templates in this room. It
              takes the top-left corner; a guide shrinks to an icon inside it. */}
          {badge ? (
            <div className={`tplRank tplRank--${badge.tone}${isNew ? " is-right" : ""}`} aria-label={`#${rank} ${badge.label}`}>
              <span className="tplRankIcon" aria-hidden>{badge.icon}</span>
              <span className="tplRankNum">#{rank}</span>
              <span className="tplRankLabel">{badge.label}</span>
              {created >= 100 && <span className="tplRankCount">· {compactCount(created)} made</span>}
              {hasGuide && <PlayCircle size={10} className="tplRankGuide" aria-label="Has a guide" />}
            </div>
          ) : hasGuide && !isNew ? (
            /* Guide badge — top-left, so it never collides with the favourite
               heart on the right. It is a marker on the card, not a second link:
               the card still goes to the template. */
            <div className="absolute top-0 left-0 z-20">
              <div
                className="flex items-center gap-1 px-2 py-[3px] rounded-br-lg rounded-tl-2xl text-[8px] md:text-[9px] font-black uppercase tracking-widest"
                style={{
                  background: "rgba(26,5,8,0.82)",
                  color: "#f2cf74",
                  border: "1px solid rgba(242,207,116,0.42)",
                  borderTop: "none",
                  borderLeft: "none",
                }}
              >
                <PlayCircle size={9} />
                Guide
              </div>
            </div>
          ) : null}

          {/* Favourite — a small heart tucked into the top-right corner. */}
          <div className="absolute top-1.5 right-1.5 md:top-2 md:right-2 z-20">
            <FavoriteButton
              isFavorited={isFav}
              onClick={(e) => onFavorite(e, template.slug)}
              size={13}
              className="tplFav"
            />
          </div>
        </div>
        </div>
        {price && <PriceStrip p={settled ? pricing : null} freeFor={freeFor} name={template.title} />}
      </Link>
    </div>
  );
});

/**
 * Under the cover: the price the visitor pays — the struck original and the
 * % off when there is a discount — in their own currency. "Free" when the
 * template is unpriced; a super admin / free-access account still sees the
 * real price, with a note that it is free for them. A blank bar of the same
 * height until the prices arrive, so the grid never jumps.
 */
function PriceStrip({ p, freeFor, name }: { p: ReturnType<ReturnType<typeof useTemplatePricing>["pricingFor"]> | null; freeFor: string | null; name: string }) {
  if (!p) return <span className="tplPrice is-skel" aria-hidden />;
  if (p.isFree) {
    return (
      <span className="tplPrice" aria-label={`${name}: free`}>
        <b className="tplPriceNow is-free">Free</b>
        <span className="tplPriceNote">make &amp; send</span>
      </span>
    );
  }
  const struck = p.mrp > p.finalPrice;
  const off = struck && p.discountPercent > 0 ? p.discountPercent : 0;
  return (
    <span
      className="tplPrice"
      aria-label={`${name}: ${struck ? `was ${formatPrice(p, "mrp")}, now ` : ""}${formatPrice(p)}${off ? `, ${off}% off` : ""}${freeFor ? ", free for you" : ""}`}
    >
      <b className="tplPriceNow">{formatPrice(p)}</b>
      {struck && <s className="tplPriceWas">{formatPrice(p, "mrp")}</s>}
      {freeFor ? <span className="tplPriceFor">free for you</span> : off > 0 && <span className="tplPriceOff"><span className="tplOffLong">{off}% OFF</span><span className="tplOffShort">−{off}%</span></span>}
    </span>
  );
}

/**
 * Gallery card styles, rendered once by the page (not per card).
 * Transform/opacity only; the hover shadow lives on a pseudo-element whose
 * opacity changes, so no box-shadow is ever animated.
 */
export const TEMPLATE_CARD_CSS = `
.tplCard { content-visibility: auto; contain-intrinsic-size: auto 240px; animation: tplIn .5s cubic-bezier(.22,1,.36,1) backwards; }
@media (min-width: 768px) { .tplCard { contain-intrinsic-size: auto 330px; } }
@media (min-width: 1024px) { .tplCard { contain-intrinsic-size: auto 380px; } }
@keyframes tplIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
.tplLink { position: relative; border-radius: 1rem; -webkit-tap-highlight-color: transparent; }
/* The cover's own box: the hover glow outlines it, never the price strip under it. */
.tplShell { position: relative; border-radius: 1rem; }
@media (min-width: 768px) { .tplShell { border-radius: 1.5rem; } }
@media (min-width: 768px) { .tplLink { border-radius: 1.5rem; } }
.tplInner { border: 1px solid rgba(61,12,17,0.15); transform: translateZ(0); transition: transform .28s cubic-bezier(.22,1,.36,1), border-color .28s ease; }
.tplShell::after { content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none; opacity: 0;
  box-shadow: 0 20px 44px -18px rgba(61,12,17,0.45), 0 0 0 1.5px rgba(201,168,76,0.55); transition: opacity .28s ease, transform .28s cubic-bezier(.22,1,.36,1); }
.tplImg { transition: transform .6s cubic-bezier(.22,1,.36,1); }
/* Small solid heart: no backdrop blur (fifty of them), sized for a corner. */
.tplFav { width: 28px !important; height: 28px !important; background: rgba(255,255,255,0.88) !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; box-shadow: 0 2px 8px -2px rgba(0,0,0,0.35) !important; }
@media (min-width: 768px) { .tplFav { width: 30px !important; height: 30px !important; } }
@media (hover: hover) {
  .tplLink:hover .tplInner { transform: translateY(-6px); border-color: rgba(201,168,76,0.5); }
  .tplLink:hover .tplShell::after { opacity: 1; transform: translateY(-6px); }
  .tplLink:hover .tplImg { transform: scale(1.05); }
}
.tplLink:active .tplInner { transform: scale(0.985); }
/* Rank badge: a glossy pill in the top-left corner with a slow shimmer. */
.tplRank { position: absolute; top: 7px; left: 7px; z-index: 20; display: inline-flex; align-items: center; gap: 4px;
  max-width: calc(100% - 50px); padding: 4px 8px 4px 5px; border-radius: 99px; overflow: hidden; white-space: nowrap;
  font: 800 9.5px/1 'Inter', system-ui, sans-serif; letter-spacing: .02em; color: #fff;
  box-shadow: 0 6px 16px -6px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.45); animation: tplRankPop .55s cubic-bezier(.34,1.56,.64,1) .25s backwards; }
.tplRank::after { content: ""; position: absolute; top: 0; bottom: 0; width: 40%; left: -60%; transform: skewX(-20deg);
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.55), transparent); animation: tplRankShine 3.6s ease-in-out infinite; }
.tplRankIcon { display: grid; place-items: center; width: 17px; height: 17px; border-radius: 50%; background: rgba(255,255,255,.22); font-size: 10px; flex: none; }
.tplRankNum { font-weight: 900; font-size: 10.5px; }
.tplRankLabel { text-transform: uppercase; letter-spacing: .08em; font-size: 8.5px; overflow: hidden; text-overflow: ellipsis; }
.tplRankCount { display: none; font-weight: 700; opacity: .85; font-size: 9px; }
.tplRankGuide { flex: none; opacity: .9; display: none; }
@media (max-width: 767px) { .tplRankLabel { letter-spacing: .04em; font-size: 8px; } }
@media (min-width: 768px) {
  .tplRank { top: 10px; left: 10px; gap: 5px; padding: 5px 11px 5px 5px; font-size: 11px; }
  .tplRankIcon { width: 20px; height: 20px; font-size: 11.5px; }
  .tplRankNum { font-size: 12px; } .tplRankLabel { font-size: 9.5px; } .tplRankCount { display: inline; font-size: 10px; } .tplRankGuide { display: block; }
}
.tplRank--gold { background: linear-gradient(135deg, #fff1bf, #e2b44a 45%, #a6751c); color: #3a2505; }
.tplRank--fire { background: linear-gradient(135deg, #ff9a3c, #ff3d3d 60%, #c2185b); }
.tplRank--hot  { background: linear-gradient(135deg, #ff6fb5, #e0287d 55%, #8e1a5a); }
.tplRank--rise { background: linear-gradient(135deg, #9d7bff, #6a3df0 55%, #3b1fa8); }
.tplRank--fan  { background: linear-gradient(135deg, #3ee0c5, #139e9a 55%, #0b5f6b); }
.tplRank--gold .tplRankIcon { background: rgba(255,255,255,.5); }
@keyframes tplRankPop { from { opacity: 0; transform: translateY(-6px) scale(.7); } }
@keyframes tplRankShine { 0%, 60% { left: -60%; } 90%, 100% { left: 130%; } }
/* "New launch" sash: a satin band across the top-left corner, clipped by the
   cover's rounded corner. A slow sheen runs along it; it glides in once. */
.tplRibbon { position: absolute; top: 0; left: 0; width: 92px; height: 92px; overflow: hidden; z-index: 19; pointer-events: none; }
.tplRibbonBand { position: absolute; top: 19px; left: -36px; width: 140px; padding: 5px 0 4px; transform: rotate(-45deg); text-align: center; white-space: nowrap;
  font: 900 8px/1 'Inter', system-ui, sans-serif; letter-spacing: .14em; text-transform: uppercase; color: #fff; text-shadow: 0 1px 1px rgba(110,10,50,.45);
  background: linear-gradient(100deg, #e8366f 0%, #ff6f91 30%, #ffb36b 50%, #ff6f91 70%, #e8366f 100%); background-size: 250% 100%;
  box-shadow: 0 4px 12px -3px rgba(150,15,60,.55), inset 0 1px 0 rgba(255,255,255,.55), inset 0 -1px 0 rgba(120,10,45,.35);
  animation: tplRibbonIn .7s cubic-bezier(.22,1,.36,1) .2s backwards, tplRibbonSheen 5s ease-in-out 1s infinite; }
.tplRibbonBand::before, .tplRibbonBand::after { content: ""; position: absolute; left: 0; right: 0; height: 1px; background: rgba(255,255,255,.45); }
.tplRibbonBand::before { top: 2px; } .tplRibbonBand::after { bottom: 2px; }
.tplRibbonBand > span[aria-hidden] { font-size: 7px; opacity: .9; }
@media (min-width: 768px) {
  .tplRibbon { width: 124px; height: 124px; }
  .tplRibbonBand { top: 27px; left: -42px; width: 186px; padding: 7px 0 6px; font-size: 10.5px; letter-spacing: .16em; }
  .tplRibbonBand > span[aria-hidden] { font-size: 9px; }
}
@keyframes tplRibbonIn { from { opacity: 0; translate: -18px -18px; } }
@keyframes tplRibbonSheen { 0%, 100% { background-position: 100% 0; } 50% { background-position: 0% 0; } }
/* The rank badge steps aside to the top-right, beside the heart, while the sash shows. */
.tplRank.is-right { left: auto; right: 42px; max-width: calc(100% - 92px); }
@media (min-width: 768px) { .tplRank.is-right { right: 50px; max-width: calc(100% - 124px); } }
.tplRank.is-right .tplRankCount { display: none !important; }
@media (max-width: 767px) { .tplRank.is-right { padding-right: 7px; } .tplRank.is-right .tplRankLabel { display: none; } }
.tplOffShort { display: none; }
.tplPriceWas { min-width: 0; overflow: hidden; text-overflow: clip; }
/* Price strip under the cover: now · was · % off. One line, never wraps out of the card. */
.tplPrice { display: flex; align-items: baseline; gap: 6px; min-height: 22px; margin-top: 7px; padding: 0 4px; white-space: nowrap; overflow: hidden;
  font: 600 11px/1.2 'Inter', system-ui, sans-serif; color: rgba(61,12,17,.55); }
/* Fixed ink: the gallery is always the light cream page (it does not follow .dark). */
.tplPriceNow { font-weight: 900; font-size: 15px; color: #3d0c11; letter-spacing: -.01em; }
.tplPriceNow.is-free { color: #157a4f; }
.tplPriceWas { font-size: 11.5px; color: rgba(61,12,17,.45); text-decoration-thickness: 1.5px; }
.tplPriceOff { margin-left: auto; align-self: center; padding: 3px 7px; border-radius: 99px; background: linear-gradient(135deg, #1fa36a, #0f7a4c); color: #fff; font-weight: 900; font-size: 9.5px; letter-spacing: .06em; }
.tplPriceFor { margin-left: auto; align-self: center; padding: 3px 7px; border-radius: 99px; background: rgba(201,168,76,.18); color: #7a5410; font-weight: 800; font-size: 9px; letter-spacing: .04em; overflow: hidden; text-overflow: ellipsis; }
.tplPriceNote { font-size: 10.5px; overflow: hidden; text-overflow: ellipsis; }
.tplPrice.is-skel { width: 55%; height: 14px; min-height: 0; margin: 11px 4px 4px; border-radius: 99px; background: rgba(61,12,17,.07); }
@media (min-width: 768px) { .tplPrice { margin-top: 9px; padding: 0 6px; gap: 8px; } .tplPriceNow { font-size: 17px; } .tplPriceWas { font-size: 12.5px; } .tplPriceOff { font-size: 10.5px; padding: 4px 9px; } }
.pmBody .tplPrice { padding: 0 10px 9px; background: #fffaf0; margin-top: 0; padding-top: 8px; color: rgba(61,12,17,.55); }
/* The premium frame's strip is always cream: keep its ink dark in dark mode too. */
.pmBody .tplPriceNow { color: #3d0c11; } .pmBody .tplPriceNow.is-free { color: #157a4f; } .pmBody .tplPriceWas { color: rgba(61,12,17,.45); } .pmBody .tplPriceFor { color: #7a5410; }
.pmBody .tplPrice.is-skel { margin: 0; width: auto; height: 31px; border-radius: 0; background: #fffaf0; }
@media (max-width: 767px) {
  .tplPrice { gap: 4px; padding: 0 2px; }
  .tplPriceNow { font-size: 13.5px; }
  .tplPriceWas { font-size: 10.5px; }
  .tplPriceOff { padding: 2px 5px !important; font-size: 8.5px !important; letter-spacing: .02em; }
  .pmBody .tplPrice { padding: 8px 7px 9px; }
}
@media (max-width: 379px) {
  .tplPrice { gap: 3px; }
  .tplPriceNow { font-size: 12.5px; }
  .tplPriceWas { font-size: 9.5px; }
  .tplPriceOff { padding: 2px 4px !important; font-size: 8px !important; }
  .pmBody .tplPrice { padding: 8px 5px 9px; }
}
@media (max-width: 767px) { .tplOffLong { display: none; } .tplOffShort { display: inline; } }
@media (prefers-reduced-motion: reduce) {
  .tplCard, .tplRank, .tplRank::after, .tplRibbonBand { animation: none; }
  .tplInner, .tplImg, .tplShell::after { transition: none; }
}
`;

export default TemplateCard;
