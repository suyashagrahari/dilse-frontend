"use client";

// ─── The wedding drop's templates, as gallery cards ──────────────────────────
//
// The same rules as every drop page (../_festival-offer/FestivalDropTemplates):
// the templates are the wedding drop's slugs — the super admin picks and orders
// them in /admin/season or /admin/places — resolved against the registry in
// that order, skipping what this visitor cannot OPEN (a template hidden from
// the gallery stays openable while it is in the ACTIVE drop). Each card IS the
// gallery card (TemplateCard / PremiumTemplateCard, with the gallery's rank,
// favourite and tier data), so paid/premium behaviour is identical.
//
// The wedding drop is a whole collection (11 designs by default), so it is laid
// out like a gallery — two columns on phones, three on tablets, four on wide
// screens — and each card sits on a slim ivory plate: a string of marigolds
// along its top, the sale tag in a band above the card, the admin's price
// underneath (struck through to the sale price while the sale runs).

import TemplateCard, { TEMPLATE_CARD_CSS } from "@/components/TemplateCard";
import PremiumTemplateCard, { PREMIUM_CARD_CSS } from "@/components/PremiumTemplateCard";
import { isComingSoon } from "@/lib/galleryRules";
import { ComingSoonTile, PriceLine, SaleTag, useGalleryCardData, type FestivalDropItem } from "../_festival-offer/FestivalDropTemplates";

export default function WeddingDropTemplates({ items }: { items: FestivalDropItem[] }) {
  const { favSlugs, handleFavorite, rankOf, createdBy } = useGalleryCardData();
  return (
    <>
      <style>{TEMPLATE_CARD_CSS + PREMIUM_CARD_CSS + WD_CSS}</style>
      <div className={`wdGrid n${Math.min(items.length, 4)}`}>
        {items.map((t, i) => {
          const soon = !t.fallback && isComingSoon(t);
          const fancy = Boolean(t.ultra || t.premium);
          const props = {
            template: t,
            rank: rankOf.get(t.slug),
            created: createdBy.get(t.slug),
            isFav: favSlugs.includes(t.slug),
            index: i,
            onFavorite: handleFavorite,
          };
          return (
            <div key={t.slug} className={`wdSlot${fancy ? " is-premium" : ""}`} style={{ animationDelay: `${Math.min(i, 8) * 70}ms` }}>
              <span className="wdBeads" aria-hidden />
              <div className="wdTagBand fdTagBand">
                <SaleTag slug={t.slug} soon={soon} />
              </div>
              <div className="wdCard fdCard">
                {soon ? <ComingSoonTile t={t} /> : fancy ? <PremiumTemplateCard {...props} /> : <TemplateCard {...props} />}
              </div>
              <div className="wdFoot">
                <span className="wdName">{t.title}</span>
                {!soon && <PriceLine slug={t.slug} name={t.title} />}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

const WD_CSS = `
.wdGrid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px 10px; margin: 30px auto 0; text-align: left; }
.wdGrid.n1 { grid-template-columns: minmax(0, 320px); justify-content: center; }
@media (min-width: 640px) { .wdGrid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 22px 16px; } .wdGrid.n2 { grid-template-columns: repeat(2, minmax(0, 300px)); justify-content: center; } }
@media (min-width: 1024px) { .wdGrid { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 28px 20px; } .wdGrid.n3 { grid-template-columns: repeat(3, minmax(0, 300px)); justify-content: center; } }
.wdSlot { position: relative; isolation: isolate; display: flex; flex-direction: column; min-width: 0; padding: 0 8px 12px; border-radius: 20px;
  background: linear-gradient(180deg, rgba(255,255,255,.92), rgba(253,241,234,.92));
  box-shadow: inset 0 0 0 1px rgba(195,154,67,.4), inset 0 0 0 4px rgba(255,255,255,.7), inset 0 0 0 5px rgba(195,154,67,.18), 0 22px 40px -28px rgba(110,30,40,.5);
  animation: wdIn .7s cubic-bezier(.22,1,.36,1) backwards; transition: transform .35s cubic-bezier(.22,1,.36,1), box-shadow .35s ease; }
.wdSlot.is-premium { box-shadow: inset 0 0 0 1px rgba(195,154,67,.7), inset 0 0 0 4px rgba(255,255,255,.7), inset 0 0 0 5px rgba(195,154,67,.35), 0 22px 40px -26px rgba(143,106,34,.55); }
@keyframes wdIn { from { opacity: 0; transform: translateY(18px); } }
.wdBeads { position: absolute; left: 14px; right: 14px; top: 0; height: 9px; pointer-events: none; z-index: 2;
  background-image: radial-gradient(circle at 50% 40%, #f4a21c 3px, transparent 3.5px), radial-gradient(circle at 50% 40%, #e0780c 2.4px, transparent 2.9px);
  background-size: 14px 9px, 14px 9px; background-position: 0 0, 7px 0; filter: drop-shadow(0 1px 1px rgba(110,40,10,.25)); }
.wdTagBand.fdTagBand { position: relative; z-index: 3; height: 40px; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 6px; box-sizing: border-box; }
.wdSlot .fdTag { display: inline-flex; align-items: center; gap: 5px; border-radius: 999px; font-weight: 800; line-height: 1; font-family: 'Inter', sans-serif; letter-spacing: .08em; text-transform: uppercase; }
.wdSlot .fdTagIc { font-size: 9px; }
.wdSlot .fdTag { color: #fff3d6; background: linear-gradient(180deg, #b8324a, #9e1f34 60%, #6e1022); box-shadow: 0 0 0 1px #c39a43, 0 6px 14px -6px rgba(110,16,34,.6); font-size: 10.5px; padding: 5px 10px; }
.wdSlot .fdTag.is-free { color: #2c4a1e; background: linear-gradient(180deg, #eaf7d8, #b7e08f); box-shadow: 0 0 0 1px #8fbf5a; }
.wdSlot .fdTag.is-soon { color: #7b4450; background: rgba(255,255,255,.8); box-shadow: inset 0 0 0 1px rgba(195,154,67,.4); }
.wdCard { position: relative; z-index: 1; }
.wdCard .tplCard, .wdCard .pmFrame { animation: none; content-visibility: visible; }
.wdCard .tplLink:hover .tplInner, .wdCard .tplLink:hover .tplShell::after, .wdCard .pmFrame:hover { transform: none; }
.wdFoot { display: flex; flex-direction: column; gap: 6px; padding: 10px 4px 0; margin-top: auto; }
.wdName { color: #4a121c; font: 600 14.5px/1.25 var(--font-playfair), "Playfair Display", serif; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 2.5em; }
.wdSlot .fdPrice { display: inline-flex; align-items: baseline; flex-wrap: wrap; gap: 2px 6px; min-height: 22px; }
.wdSlot .fdPrice.is-skel { width: 70%; border-radius: 8px; background: linear-gradient(90deg, rgba(195,154,67,.1), rgba(195,154,67,.24), rgba(195,154,67,.1)); background-size: 200% 100%; animation: wdSkel 1.4s linear infinite; }
@keyframes wdSkel { from { background-position: 100% 0; } to { background-position: -100% 0; } }
.wdSlot .fdPrice s { font: 500 12.5px/1 'Inter', sans-serif; color: #9a7a80; text-decoration-color: #9e1f34; }
.wdSlot .fdArrow { font: 600 12px/1 'Inter', sans-serif; color: #b89aa0; }
.wdSlot .fdPrice b { font: 800 18px/1 'Inter', sans-serif; color: #4a121c; text-shadow: none; }
.wdSlot .fdOff { font: 700 12px/1 'Inter', sans-serif; color: #9e1f34; }
.wdSlot .fdPriceNote { font: 500 11.5px/1 'Inter', sans-serif; color: #7b4450; }
.wdSlot .fdSoon { position: relative; aspect-ratio: 3 / 4; border-radius: 1rem; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; background: #f9e1dc; }
.wdSlot .fdSoon img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: .35; }
.wdSlot .fdSoonTag { position: relative; padding: 6px 12px; border-radius: 999px; background: #4a121c; color: #fff3d6; font: 700 9.5px/1 'Inter', sans-serif; letter-spacing: .16em; text-transform: uppercase; }
.wdSlot .fdSoonName { position: relative; color: #4a121c; font: 600 12.5px/1.2 'Inter', sans-serif; text-align: center; padding: 0 8px; }
@media (min-width: 768px) {
  .wdSlot { padding: 0 12px 16px; border-radius: 24px; }
  .wdTagBand.fdTagBand { height: 46px; }
  .wdSlot .fdTag { font-size: 11px; padding: 5px 12px; }
  .wdName { font-size: 16.5px; }
  .wdSlot .fdPrice b { font-size: 21px; }
}
@media (hover: hover) {
  .wdSlot:hover { transform: translateY(-6px); box-shadow: inset 0 0 0 1px rgba(195,154,67,.75), inset 0 0 0 4px rgba(255,255,255,.7), inset 0 0 0 5px rgba(195,154,67,.35), 0 30px 50px -28px rgba(110,30,40,.6); }
}
@media (prefers-reduced-motion: reduce) {
  .wdSlot, .wdSlot .fdPrice.is-skel { animation: none !important; transition: none; }
}
`;
