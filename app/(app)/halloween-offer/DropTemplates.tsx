"use client";

// ─── The drop's templates, as gallery cards ──────────────────────────────────
//
// Which templates are in the drop is the season's `sale.slugs` — the super
// admin picks them in /admin/season, Halloween or not — resolved against the
// template registry. Unknown slugs and templates hidden from this visitor are
// skipped; with nothing usable (or no answer yet) it falls back to the two
// Halloween templates.
//
// Each card IS the gallery card: `TemplateCard` for a normal template and
// `PremiumTemplateCard` for a premium / ✦ ultra one, fed the same rank,
// favourite and tier data the gallery feeds it, so the paid/premium behaviour
// (badge, gold frame, click tracking with is_premium, the template's own
// paywall on publish) is identical. A coming-soon template gets the gallery's
// coming-soon tile, not a link. Around each card: a haunted frame (navy glass,
// a corner web, a pumpkin glow on hover) and the sale price line underneath.

import { useCallback, useEffect, useMemo } from "react";
import TemplateCard, { TEMPLATE_CARD_CSS } from "@/components/TemplateCard";
import PremiumTemplateCard, { PREMIUM_CARD_CSS } from "@/components/PremiumTemplateCard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchFavorites, toggleFavoriteAsync } from "@/store/favoritesSlice";
import { useTemplateAccess } from "@/hooks/useTemplateAccess";
import { useTemplatePricing } from "@/hooks/useTemplatePricing";
import { formatINR } from "@/config/templatePricing";
import { isPremiumSlug, useTemplateMeta } from "@/lib/templateMeta";
import { GALLERY_BY_SLUG, GALLERY_LIST, isComingSoon, rankRooms } from "@/lib/galleryRules";
import { HALLOWEEN_SLUGS } from "@/lib/season";
import type { TemplateListItem } from "@/types/template-config";

type DropItem = TemplateListItem & { premium: boolean };

/** The drop's templates for this visitor, in the admin's order. */
export function useDropTemplates(slugs: readonly string[] | null | undefined): DropItem[] {
  const { hidden } = useTemplateAccess();
  const { tiers } = useTemplateMeta();
  return useMemo(() => {
    const pick = (list: readonly string[]) => {
      const seen = new Set<string>();
      const out: DropItem[] = [];
      for (const raw of list) {
        const slug = String(raw).trim().toLowerCase();
        const t = GALLERY_BY_SLUG.get(slug);
        if (!t || seen.has(slug) || hidden.has(slug)) continue;
        seen.add(slug);
        out.push({ ...t, premium: isPremiumSlug(slug, tiers) });
      }
      return out;
    };
    const chosen = slugs && slugs.length ? pick(slugs) : [];
    return chosen.length ? chosen : pick(HALLOWEEN_SLUGS);
  }, [slugs, hidden, tiers]);
}

/** Original struck through → sale price, or "Free" when the template is unpriced. */
function PriceLine({ slug, name }: { slug: string; name: string }) {
  const { pricingFor, settled } = useTemplatePricing();
  if (!settled) return <span className="hdPrice is-skel" aria-hidden />;
  const p = pricingFor(slug);
  if (p.isFree) {
    return (
      <span className="hdPrice" aria-label={`${name}: free`}>
        <b>Free</b><span className="hdPriceNote">to make &amp; send</span>
      </span>
    );
  }
  const struck = p.mrp > p.finalPrice;
  return (
    <span className="hdPrice" aria-label={struck ? `${name}: was ${formatINR(p.mrp)}, now ${formatINR(p.finalPrice)}` : `${name}: ${formatINR(p.finalPrice)}`}>
      {struck && <s>{formatINR(p.mrp)}</s>}
      {struck && <span className="hdArrow" aria-hidden>→</span>}
      <b>{formatINR(p.finalPrice)}</b>
      {struck && p.discountPercent > 0 && <em>{p.discountPercent}% off</em>}
    </span>
  );
}

function ComingSoonTile({ t }: { t: TemplateListItem }) {
  return (
    <div className="hdSoon" aria-label={`${t.title} — coming soon`}>
      {t.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element -- dimmed poster in a sized box
        <img src={t.coverImage} alt="" loading="lazy" decoding="async" />
      )}
      <span className="hdSoonTag">Coming soon</span>
      <span className="hdSoonName">{t.title}</span>
    </div>
  );
}

/** A thin inline web for the frame's corner (no request, no layout). */
function FrameWeb({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 60 60" aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth=".8" strokeLinecap="round">
        <path d="M0 0 L60 8 M0 0 L52 34 M0 0 L34 52 M0 0 L8 60" />
        <path d="M14 2 Q12 9 12 12 Q9 12 2 14" />
        <path d="M28 4 Q22 17 21 21 Q17 22 4 28" />
        <path d="M42 6 Q33 26 31 31 Q26 33 6 42" />
        <path d="M55 7 Q44 34 41 41 Q34 44 7 55" />
      </g>
    </svg>
  );
}

export default function DropTemplates({ slugs }: { slugs: readonly string[] | null | undefined }) {
  const items = useDropTemplates(slugs);
  const dispatch = useAppDispatch();
  const favSlugs = useAppSelector((s) => s.favorites.slugs);
  const favFetched = useAppSelector((s) => s.favorites.fetched);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  useEffect(() => {
    if (isAuthenticated && !favFetched) dispatch(fetchFavorites());
  }, [dispatch, isAuthenticated, favFetched]);
  const handleFavorite = useCallback((e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleFavoriteAsync(slug));
  }, [dispatch]);

  // Rank badges exactly as the gallery computes them: against every visible
  // template in the room, most-created first.
  const { hidden } = useTemplateAccess();
  const { tiers, ranking } = useTemplateMeta();
  const createdBy = useMemo(() => new Map(ranking.map((r) => [r.slug, r.created])), [ranking]);
  const rankOf = useMemo(() => {
    const idx = new Map(GALLERY_LIST.map((t, i) => [t.slug, i]));
    const visible = GALLERY_LIST
      .filter((t) => !hidden.has(t.slug))
      .map((t) => ({ ...t, premium: isPremiumSlug(t.slug, tiers) }))
      .sort((a, b) => (createdBy.get(b.slug) ?? 0) - (createdBy.get(a.slug) ?? 0) || idx.get(a.slug)! - idx.get(b.slug)!);
    return rankRooms(visible, createdBy);
  }, [hidden, tiers, createdBy]);

  return (
    <>
      <style>{TEMPLATE_CARD_CSS + PREMIUM_CARD_CSS + HD_CSS}</style>
      <div className={`hdGrid n${Math.min(items.length, 4)}`}>
        {items.map((t, i) => {
          const soon = isComingSoon(t);
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
            <div key={t.slug} className={`hdSlot${fancy ? " is-premium" : ""}`} style={{ animationDelay: `${Math.min(i, 6) * 90}ms` }}>
              <span className="hdGlow" aria-hidden />
              <FrameWeb className="hdWeb l" />
              <FrameWeb className="hdWeb r" />
              <span className="hdThread" aria-hidden><span className="hdSpider" /></span>
              <div className="hdCard">
                {soon ? <ComingSoonTile t={t} /> : fancy ? <PremiumTemplateCard {...props} /> : <TemplateCard {...props} />}
              </div>
              <div className="hdFoot">
                <span className="hdName">{t.title}</span>
                {!soon && <PriceLine slug={t.slug} name={t.title} />}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

const HD_CSS = `
.hdGrid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin: 30px auto 0; text-align: left; }
.hdGrid.n1 { grid-template-columns: minmax(0, 300px); justify-content: center; }
@media (min-width: 768px) {
  .hdGrid { grid-template-columns: repeat(auto-fit, minmax(250px, 330px)); justify-content: center; gap: 28px; }
}
.hdSlot { position: relative; isolation: isolate; padding: 10px 10px 12px; border-radius: 24px;
  background: linear-gradient(180deg, rgba(58,47,98,.55), rgba(23,19,42,.72));
  -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px);
  box-shadow: inset 0 0 0 1px rgba(185,166,240,.24), 0 30px 60px -34px rgba(0,0,0,.95);
  animation: hdIn .7s cubic-bezier(.22,1,.36,1) backwards; transition: transform .35s cubic-bezier(.22,1,.36,1), box-shadow .35s ease; }
.hdSlot.is-premium { box-shadow: inset 0 0 0 1px rgba(246,231,166,.38), 0 30px 60px -34px rgba(0,0,0,.95), 0 0 46px -18px rgba(246,231,166,.35); }
@keyframes hdIn { from { opacity: 0; transform: translateY(22px); } }
.hdGlow { position: absolute; inset: -1px; z-index: -1; border-radius: inherit; pointer-events: none; opacity: 0; transition: opacity .35s ease;
  background: radial-gradient(80% 60% at 50% 100%, rgba(255,154,60,.38), transparent 70%); }
.hdWeb { position: absolute; top: 0; z-index: 30; width: 46px; height: 46px; color: rgba(226,216,250,.5); pointer-events: none; }
.hdWeb.l { left: 0; }
.hdWeb.r { right: 0; transform: scaleX(-1); }
.hdThread { position: absolute; top: 0; right: 28%; z-index: 31; width: 1px; height: 26px; background: rgba(226,216,250,.45); pointer-events: none;
  transform-origin: top center; animation: hdDangle 5s ease-in-out infinite; }
.hdSpider { position: absolute; left: -5px; bottom: -8px; width: 11px; height: 11px; border-radius: 50%; background: #0c0816;
  box-shadow: 0 0 0 1px rgba(185,166,240,.35), -5px -2px 0 -3px #0c0816, 5px -2px 0 -3px #0c0816, -6px 3px 0 -3px #0c0816, 6px 3px 0 -3px #0c0816; }
@keyframes hdDangle { 0%, 100% { height: 18px; } 50% { height: 34px; } }
.hdSlot:nth-child(2n) .hdThread { right: auto; left: 30%; animation-delay: -2.2s; }
.hdCard { position: relative; }
.hdCard .tplInner { border-color: rgba(185,166,240,.22); }
.hdFoot { display: flex; flex-direction: column; gap: 6px; padding: 12px 4px 0; }
.hdName { color: #f3eefe; font: 600 14px/1.25 var(--font-playfair), "Playfair Display", serif; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 2.5em; }
.hdPrice { display: inline-flex; align-items: baseline; flex-wrap: wrap; gap: 4px 7px; min-height: 22px; }
.hdPrice.is-skel { width: 70%; border-radius: 8px; background: linear-gradient(90deg, rgba(255,255,255,.06), rgba(255,255,255,.14), rgba(255,255,255,.06)); background-size: 200% 100%; animation: hdSkel 1.4s linear infinite; }
@keyframes hdSkel { from { background-position: 100% 0; } to { background-position: -100% 0; } }
.hdPrice s { font: 500 12.5px/1 'Inter', sans-serif; color: rgba(226,216,250,.55); }
.hdArrow { font: 600 12px/1 'Inter', sans-serif; color: rgba(226,216,250,.45); }
.hdPrice b { font: 800 19px/1 'Inter', sans-serif; color: #fff; text-shadow: 0 0 18px rgba(255,154,60,.45); }
.hdPrice em { align-self: center; padding: 3px 7px; border-radius: 999px; font: 800 9.5px/1.2 'Inter', sans-serif; font-style: normal; letter-spacing: .06em; color: #1e1230;
  background: linear-gradient(180deg, #ffc27e, #ff9a3c); }
.hdPriceNote { font: 500 11.5px/1 'Inter', sans-serif; color: rgba(226,216,250,.6); }
.hdSoon { position: relative; aspect-ratio: 3 / 4; border-radius: 1rem; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
  background: #1b1630; box-shadow: inset 0 0 0 1px rgba(185,166,240,.2); }
.hdSoon img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: .35; filter: grayscale(.4); }
.hdSoonTag { position: relative; padding: 6px 14px; border-radius: 999px; background: rgba(0,0,0,.7); color: rgba(255,255,255,.88); font: 700 10px/1 'Inter', sans-serif; letter-spacing: .18em; text-transform: uppercase; }
.hdSoonName { position: relative; color: rgba(255,255,255,.7); font: 600 13px/1.2 'Inter', sans-serif; text-align: center; padding: 0 10px; }
@media (min-width: 768px) {
  .hdSlot { padding: 14px 14px 16px; border-radius: 30px; }
  .hdWeb { width: 64px; height: 64px; }
  .hdName { font-size: 17px; }
  .hdPrice b { font-size: 23px; }
  .hdPrice s { font-size: 14px; }
  .hdPrice em { font-size: 10.5px; }
}
@media (hover: hover) {
  .hdSlot:hover { transform: translateY(-6px); box-shadow: inset 0 0 0 1px rgba(255,154,60,.55), 0 36px 70px -34px rgba(0,0,0,.95), 0 0 60px -14px rgba(255,154,60,.45); }
  .hdSlot:hover .hdGlow { opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .hdSlot, .hdThread, .hdPrice.is-skel { animation: none !important; }
  .hdSlot { transition: none; }
}
`;
