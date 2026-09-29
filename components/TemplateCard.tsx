"use client";

import React, { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { PlayCircle } from "lucide-react";
import FavoriteButton from "@/components/FavoriteButton";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import type { TemplateListItem } from "@/types/template-config";
import { useTemplatePricing } from "@/hooks/useTemplatePricing";
import { guideByTemplateHref } from "@/data/guide-registry";
import { coverSmall, coverSrcSet } from "@/lib/templateMedia";

interface TemplateCardProps {
  template: TemplateListItem;
  isFav: boolean;
  index: number;
  onFavorite: (e: React.MouseEvent, slug: string) => void;
}

/** Memoized — only re-renders when isFav, index, or template identity changes */
const TemplateCard = memo(function TemplateCard({
  template,
  isFav,
  index,
  onFavorite,
}: TemplateCardProps) {
  // A compile-time lookup against the guide registry, not a fetch — the registry
  // is a static import, so this costs one object property read per card.
  const hasGuide = Boolean(guideByTemplateHref[`/${template.slug}`]);

  // No price is shown on the card by design — the gallery stays a clean grid of
  // templates. This is read only so the click event still records whether the
  // template was a paid one, which is what makes the funnel readable. Fifty
  // cards share one module-level fetch, so it is a map read per card.
  const { pricingFor } = useTemplatePricing();
  const pricing = pricingFor(template.slug);

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
        onClick={() =>
          track(EVENTS.TEMPLATE_CARD_CLICKED, {
            template: template.slug,
            position: index,
            is_premium: !pricing.isFree,
          })
        }
      >
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

          {/* Guide badge — top-left, so it never collides with the favourite
              heart on the right. It is a marker on the card, not a second link:
              the card still goes to the template. */}
          {hasGuide && (
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
          )}

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
      </Link>
    </div>
  );
});

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
@media (min-width: 768px) { .tplLink { border-radius: 1.5rem; } }
.tplInner { border: 1px solid rgba(61,12,17,0.15); transform: translateZ(0); transition: transform .28s cubic-bezier(.22,1,.36,1), border-color .28s ease; }
.tplLink::after { content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none; opacity: 0;
  box-shadow: 0 20px 44px -18px rgba(61,12,17,0.45), 0 0 0 1.5px rgba(201,168,76,0.55); transition: opacity .28s ease, transform .28s cubic-bezier(.22,1,.36,1); }
.tplImg { transition: transform .6s cubic-bezier(.22,1,.36,1); }
/* Small solid heart: no backdrop blur (fifty of them), sized for a corner. */
.tplFav { width: 28px !important; height: 28px !important; background: rgba(255,255,255,0.88) !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; box-shadow: 0 2px 8px -2px rgba(0,0,0,0.35) !important; }
@media (min-width: 768px) { .tplFav { width: 30px !important; height: 30px !important; } }
@media (hover: hover) {
  .tplLink:hover .tplInner { transform: translateY(-6px); border-color: rgba(201,168,76,0.5); }
  .tplLink:hover::after { opacity: 1; transform: translateY(-6px); }
  .tplLink:hover .tplImg { transform: scale(1.05); }
}
.tplLink:active .tplInner { transform: scale(0.985); }
@media (prefers-reduced-motion: reduce) {
  .tplCard { animation: none; }
  .tplInner, .tplImg, .tplLink::after { transition: none; }
}
`;

export default TemplateCard;
