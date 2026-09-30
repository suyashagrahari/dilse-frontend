"use client";

import React, { memo } from "react";
import TemplateCard from "@/components/TemplateCard";
import type { TemplateListItem } from "@/types/template-config";

interface PremiumTemplateCardProps {
  template: TemplateListItem;
  isFav: boolean;
  index: number;
  onFavorite: (e: React.MouseEvent, slug: string) => void;
  rank?: number;
  created?: number;
}

/**
 * The standard card inside a luxury frame: a slowly turning gold border, a
 * light sweep across the cover every few seconds, and a gold PREMIUM seal.
 *
 * Only the premium templates use it, so the animated border (one
 * conic-gradient layer per card) costs a dozen layers, not fifty. Everything
 * animates on transform/opacity; see PREMIUM_CARD_CSS.
 */
const PremiumTemplateCard = memo(function PremiumTemplateCard(props: PremiumTemplateCardProps) {
  return (
    <div className="pmFrame" style={{ animationDelay: `${Math.min(props.index, 8) * 60}ms` }}>
      <span className="pmRing" aria-hidden />
      <div className="pmBody">
        <TemplateCard {...props} />
        <span className="pmShine" aria-hidden />
        <span className="pmSeal" aria-hidden>
          <svg viewBox="0 0 24 24" width="11" height="11"><path d="M3 18h18l-1.6-9.2-4.6 3.9L12 5.5l-2.8 7.2-4.6-3.9z" fill="currentColor" /></svg>
          Premium
        </span>
      </div>
    </div>
  );
});

export const PREMIUM_CARD_CSS = `
.pmFrame { position: relative; padding: 2px; border-radius: calc(1rem + 2px); isolation: isolate; overflow: hidden;
  box-shadow: 0 18px 40px -22px rgba(120,80,10,.55); transition: transform .3s cubic-bezier(.22,1,.36,1), box-shadow .3s ease;
  animation: pmIn .6s cubic-bezier(.22,1,.36,1) backwards; }
@media (min-width: 768px) { .pmFrame { border-radius: calc(1.5rem + 2px); } }
.pmRing { position: absolute; left: 50%; top: 50%; width: 160%; aspect-ratio: 1; translate: -50% -50%; z-index: -1;
  background: conic-gradient(from 0deg, #fff3c4, #c99a2e 18%, #7a4f0c 30%, #f5d77e 45%, #fffbe8 52%, #b8861f 68%, #6e470a 80%, #f0cf6a 92%, #fff3c4);
  animation: pmSpin 6s linear infinite; }
.pmBody { position: relative; border-radius: 1rem; overflow: hidden; }
@media (min-width: 768px) { .pmBody { border-radius: 1.5rem; } }
.pmBody .tplCard { animation: none; content-visibility: visible; }
.pmBody .tplInner { border-color: transparent; }
.pmShine { position: absolute; inset: 0; z-index: 25; pointer-events: none; overflow: hidden; border-radius: inherit; }
.pmShine::before { content: ""; position: absolute; top: -20%; bottom: -20%; width: 38%; left: -60%;
  background: linear-gradient(100deg, transparent, rgba(255,246,214,.55), transparent); transform: skewX(-18deg);
  animation: pmSweep 4.8s cubic-bezier(.4,0,.2,1) infinite; }
.pmSeal { position: absolute; left: 50%; bottom: 10px; translate: -50% 0; z-index: 30; pointer-events: none;
  display: inline-flex; align-items: center; gap: 5px; padding: 5px 11px 5px 9px; border-radius: 99px;
  background: linear-gradient(135deg, #fff1bf, #e2b44a 45%, #a6751c); color: #3a2505;
  font: 800 9.5px/1 'Inter', system-ui, sans-serif; letter-spacing: .2em; text-transform: uppercase;
  box-shadow: 0 6px 16px -6px rgba(90,55,5,.7), inset 0 1px 0 rgba(255,255,255,.7); }
@media (min-width: 768px) { .pmSeal { bottom: 14px; font-size: 10.5px; padding: 6px 13px 6px 11px; } }
@media (hover: hover) {
  .pmFrame:hover { transform: translateY(-6px); box-shadow: 0 26px 50px -20px rgba(160,110,20,.65), 0 0 0 1px rgba(245,215,126,.4); }
  .pmFrame .tplLink:hover .tplInner, .pmFrame .tplLink:hover::after { transform: none; }
}
@keyframes pmSpin { to { rotate: 360deg; } }
@keyframes pmSweep { 0%, 55% { left: -60%; } 85%, 100% { left: 130%; } }
@keyframes pmIn { from { opacity: 0; transform: translateY(18px) scale(.97); } }
@media (prefers-reduced-motion: reduce) {
  .pmFrame, .pmRing, .pmShine::before { animation: none; }
}
`;

export default PremiumTemplateCard;
