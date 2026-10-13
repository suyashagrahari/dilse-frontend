"use client";

// ─── A festival drop's templates, as gallery cards ───────────────────────────
//
// The same rules as the Halloween drop (../halloween-offer/DropTemplates):
// which templates are in the drop is that festival drop's slugs — the super admin
// picks them in /admin/season — resolved against the template registry, in the
// admin's order, skipping what this visitor cannot OPEN (`blocked`; a template
// hidden from the gallery stays openable while it is in the ACTIVE drop).
//
// One difference: the festival templates may not be in the registry yet
// (they ship separately). A default festival slug that the registry does not
// know gets a registry-independent card — a name, a blurb and festival CDN
// art as its cover — so the page never shows an empty drop; the
// moment the registry entry lands, the real card (and its poster) takes over.
//
// Each card IS the gallery card (`TemplateCard` / `PremiumTemplateCard`, same
// rank, favourite and tier data the gallery feeds them), so the paid/premium
// behaviour is identical; around it one festival plate in that festival's red
// (Dandiya: kumkum glass, a mirror-work bandhanwar along the top, mirror discs
// in the corners; Diwali: maroon glass, a marigold toran, diyas in the
// corners), the sale tag in a band ABOVE the card, and the admin's price
// underneath.

import { useCallback, useEffect, useMemo } from "react";
import TemplateCard, { TEMPLATE_CARD_CSS } from "@/components/TemplateCard";
import PremiumTemplateCard, { PREMIUM_CARD_CSS } from "@/components/PremiumTemplateCard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchFavorites, toggleFavoriteAsync } from "@/store/favoritesSlice";
import { useTemplateAccess } from "@/hooks/useTemplateAccess";
import { useTemplatePricing } from "@/hooks/useTemplatePricing";
import { formatPrice } from "@/config/templatePricing";
import { isPremiumSlug, useTemplateMeta } from "@/lib/templateMeta";
import { GALLERY_BY_SLUG, GALLERY_LIST, isComingSoon, rankRooms } from "@/lib/galleryRules";
import { DROPS, FESTIVE_GIF, type FestivalId } from "@/lib/season";
import { Bandhanwar, Diya, Mirror } from "@/components/promo/festivalArt";
import { ftVars } from "@/components/promo/festivalTheme";
import type { TemplateListItem } from "@/types/template-config";

export type FestivalDropItem = TemplateListItem & { premium: boolean; fallback: boolean };

// The art is drawn by this file over a cover-less TemplateCard (see `fdArt`):
// TemplateCard would ask for pre-sized poster variants (`coverSrcSet`) that
// exist only for real gallery covers, and these are plain animated stickers.
const FALLBACK_COVER = (file: string) => FESTIVE_GIF(file);

/** Cards for the festival templates while their registry entries have not landed. */
const FALLBACK: Record<string, TemplateListItem> = {
  "dandiya-partner": {
    slug: "dandiya-partner",
    type: "dandiya-partner",
    category: "festival",
    title: "Be My Dandiya Partner",
    description: "A playful Navratri invitation: ask them to be your Dandiya partner — they answer with a tap.",
    emoji: "🥢",
    color: "#ffb000",
    bgGradient: "linear-gradient(160deg, #b3121b, #5a070c)",
    coverImage: FALLBACK_COVER("dandiyapartyner.webp"),
  },
  "happy-diwali": {
    slug: "happy-diwali",
    type: "happy-diwali",
    category: "festival",
    title: "Happy Diwali",
    description: "A Diwali wish they light up themselves — diyas, rangoli, sparklers and fireworks with your photos.",
    emoji: "🪔",
    color: "#ffcf5a",
    bgGradient: "linear-gradient(160deg, #8f1416, #33060a)",
    coverImage: FALLBACK_COVER("happy-diwali-diya.webp"),
  },
};

/** A festival drop's templates for this visitor, in the admin's order. */
export function useFestivalDropTemplates(kind: FestivalId, slugs: readonly string[] | null | undefined): FestivalDropItem[] {
  const { blocked } = useTemplateAccess();
  const { tiers } = useTemplateMeta();
  return useMemo(() => {
    const pick = (list: readonly string[]) => {
      const seen = new Set<string>();
      const out: FestivalDropItem[] = [];
      for (const raw of list) {
        const slug = String(raw).trim().toLowerCase();
        if (seen.has(slug)) continue;
        const t = GALLERY_BY_SLUG.get(slug);
        if (t) {
          if (blocked.has(slug)) continue;
          seen.add(slug);
          out.push({ ...t, premium: isPremiumSlug(slug, tiers), fallback: false });
        } else if (FALLBACK[slug]) {
          seen.add(slug);
          out.push({ ...FALLBACK[slug], premium: false, fallback: true });
        }
      }
      return out;
    };
    const chosen = slugs && slugs.length ? pick(slugs) : [];
    return chosen.length ? chosen : pick(DROPS[kind].slugs);
  }, [kind, slugs, blocked, tiers]);
}

/** The drop's own sale percent from /payment/pricing (see the Halloween twin). */
export function useFestivalDropDiscount(items: readonly FestivalDropItem[]): { pct: number; upTo: boolean } | null {
  const { pricingFor, settled } = useTemplatePricing();
  return useMemo(() => {
    if (!settled) return null;
    const ps = items.filter((t) => !isComingSoon(t)).map((t) => pricingFor(t.slug));
    if (!ps.length || ps.some((p) => p.isFree || !(p.discountPercent > 0))) return null;
    const vals = ps.map((p) => p.discountPercent);
    const pct = Math.max(...vals);
    return { pct, upTo: vals.some((v) => v !== pct) };
  }, [items, pricingFor, settled]);
}

function SaleTag({ slug, soon }: { slug: string; soon: boolean }) {
  const { pricingFor, settled } = useTemplatePricing();
  if (soon) return <span className="fdTag is-soon">Soon</span>;
  if (!settled) return null;
  const p = pricingFor(slug);
  if (p.isFree) return <span className="fdTag is-free">Free</span>;
  if (!(p.discountPercent > 0 && p.mrp > p.finalPrice)) return null;
  return (
    <span className="fdTag">
      <span className="fdTagIc" aria-hidden>✦</span>
      {p.discountPercent}% off
    </span>
  );
}

function PriceLine({ slug, name }: { slug: string; name: string }) {
  const { pricingFor, settled } = useTemplatePricing();
  // Super admin / "All templates free": the publish gate lets them through
  // free, so the card does not quote a price. Display only.
  const freeFor = useAppSelector((s) => s.auth.user?.publishesFree ?? null);
  if (!settled) return <span className="fdPrice is-skel" aria-hidden />;
  const p = pricingFor(slug);
  if (!p.isFree && freeFor) {
    return (
      <span className="fdPrice" aria-label={`${name}: free for you`}>
        <b>Free for you</b>
        <span className="fdPriceNote">{freeFor === "super_admin" ? "· super admin" : "· gift from SubhSandesh"}</span>
      </span>
    );
  }
  if (p.isFree) {
    return (
      <span className="fdPrice" aria-label={`${name}: free`}>
        <b>Free</b><span className="fdPriceNote">to make &amp; send</span>
      </span>
    );
  }
  const struck = p.mrp > p.finalPrice;
  return (
    <span className="fdPrice" aria-label={struck ? `${name}: was ${formatPrice(p, "mrp")}, now ${formatPrice(p)}${p.discountPercent > 0 ? `, ${p.discountPercent}% off` : ""}` : `${name}: ${formatPrice(p)}`}>
      {struck && <s>{formatPrice(p, "mrp")}</s>}
      {struck && <span className="fdArrow" aria-hidden>→</span>}
      <b>{formatPrice(p)}</b>
      {struck && p.discountPercent > 0 && <span className="fdOff">· {p.discountPercent}% off</span>}
    </span>
  );
}

function ComingSoonTile({ t }: { t: TemplateListItem }) {
  return (
    <div className="fdSoon" aria-label={`${t.title} — coming soon`}>
      {t.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element -- dimmed poster in a sized box
        <img src={t.coverImage} alt="" loading="lazy" decoding="async" />
      )}
      <span className="fdSoonTag">Coming soon</span>
      <span className="fdSoonName">{t.title}</span>
    </div>
  );
}

/** A marigold toran strung along the plate's top edge (Diwali). */
function Toran() {
  const n = 15;
  return (
    <svg className="fdToran" viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden>
      <path d="M0 3 Q150 16 300 3" stroke="#c46a12" strokeWidth="1" fill="none" />
      {Array.from({ length: n }, (_, i) => {
        const t = (i + 0.5) / n;
        const x = t * 300;
        const y = 3 + 13 * 4 * t * (1 - t) * 0.5 + 2;
        return i % 2 ? (
          <path key={i} d={`M${x - 3} ${y - 1} L${x + 3} ${y - 1} L${x} ${y + 9} Z`} fill="#3aa65a" />
        ) : (
          <circle key={i} cx={x} cy={y + 1} r={4} fill={i % 4 ? "#ffb020" : "#f07c0a"} />
        );
      })}
    </svg>
  );
}

export default function FestivalDropTemplates({ kind, slugs }: { kind: FestivalId; slugs: readonly string[] | null | undefined }) {
  const items = useFestivalDropTemplates(kind, slugs);
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

  // Rank badges exactly as the gallery computes them.
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
      <style>{TEMPLATE_CARD_CSS + PREMIUM_CARD_CSS + FD_CSS}</style>
      <div className={`fdGrid fd-k-${kind} n${Math.min(items.length, 3)}`} style={ftVars(kind)}>
        {items.map((t, i) => {
          const soon = !t.fallback && isComingSoon(t);
          const fancy = Boolean(t.ultra || t.premium);
          const props = {
            template: t,
            rank: t.fallback ? undefined : rankOf.get(t.slug),
            created: createdBy.get(t.slug),
            isFav: favSlugs.includes(t.slug),
            index: i,
            onFavorite: handleFavorite,
          };
          return (
            <div key={t.slug} className={`fdSlot${fancy ? " is-premium" : ""}`} style={{ animationDelay: `${Math.min(i, 6) * 110}ms` }}>
              <span className="fdGlow" aria-hidden />
              {kind === "dandiya" ? (
                <>
                  <Bandhanwar n={12} className="fdBand" />
                  <span className="fdDiya l" aria-hidden><Mirror size={24} /></span>
                  <span className="fdDiya r" aria-hidden><Mirror size={24} thread="#ff3d9a" /></span>
                </>
              ) : (
                <>
                  <Toran />
                  <span className="fdDiya l" aria-hidden><Diya size={22} /></span>
                  <span className="fdDiya r" aria-hidden><Diya size={22} /></span>
                </>
              )}
              <div className="fdTagBand">
                <SaleTag slug={t.slug} soon={soon} />
              </div>
              <div className={`fdCard${t.fallback ? " is-fallback" : ""}`}>
                {soon ? (
                  <ComingSoonTile t={t} />
                ) : fancy ? (
                  <PremiumTemplateCard {...props} />
                ) : (
                  <TemplateCard {...props} template={t.fallback ? { ...t, coverImage: undefined } : t} />
                )}
                {t.fallback && t.coverImage && (
                  // eslint-disable-next-line @next/next/no-img-element -- an animated sticker; next/image would freeze it
                  <img className="fdArt" src={t.coverImage} alt="" loading="lazy" decoding="async" aria-hidden />
                )}
                {t.fallback && (
                  <span className="fdCap" aria-hidden>
                    <b>{t.title}</b>
                    <span>{kind === "dandiya" ? "Navratri invitation" : "Diwali wishes"}</span>
                  </span>
                )}
              </div>
              <div className="fdFoot">
                <span className="fdName">{t.title}</span>
                {!soon && <PriceLine slug={t.slug} name={t.title} />}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

const FD_CSS = `
.fdGrid { display: grid; grid-template-columns: minmax(0, 360px); justify-content: center; gap: 26px; margin: 34px auto 0; text-align: left; }
@media (min-width: 640px) { .fdGrid { grid-template-columns: repeat(2, minmax(0, 340px)); gap: 26px 22px; } .fdGrid.n1 { grid-template-columns: minmax(0, 360px); } }
@media (min-width: 640px) and (max-width: 1023px) { .fdGrid > .fdSlot:last-child:nth-child(odd):not(:first-child) { grid-column: 1 / -1; justify-self: center; width: calc(50% - 11px); } }
@media (min-width: 1024px) { .fdGrid.n3 { grid-template-columns: repeat(3, minmax(0, 340px)); gap: 34px; } .fdGrid.n2 { gap: 40px; } }
.fdSlot { position: relative; isolation: isolate; display: flex; flex-direction: column; padding: 0 14px 18px; border-radius: 28px;
  background: radial-gradient(120% 60% at 50% 0%, color-mix(in srgb, var(--ft-cta) 18%, transparent), transparent 60%), linear-gradient(180deg, color-mix(in srgb, var(--ft-sky0) 72%, transparent), color-mix(in srgb, var(--ft-sky2) 90%, transparent));
  -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px);
  box-shadow: inset 0 1px 0 rgba(255,227,163,.18), 0 34px 60px -36px rgba(0,0,0,.95), 0 0 0 1px rgba(5,6,24,.35);
  animation: fdIn .8s cubic-bezier(.22,1,.36,1) backwards; transition: transform .4s cubic-bezier(.22,1,.36,1), box-shadow .4s ease; }
.fdSlot.is-premium { box-shadow: inset 0 1px 0 rgba(255,227,163,.28), 0 34px 60px -36px rgba(0,0,0,.95), 0 0 0 1px rgba(5,6,24,.35), 0 0 50px -22px rgba(255,211,107,.4); }
@keyframes fdIn { from { opacity: 0; transform: translateY(26px) scale(.98); } }
.fdGlow { position: absolute; inset: 0; z-index: -1; border-radius: inherit; pointer-events: none; opacity: 0; transition: opacity .4s ease;
  background: radial-gradient(90% 50% at 50% 104%, rgba(255,176,32,.42), transparent 70%), radial-gradient(80% 40% at 50% -6%, rgba(255,93,143,.22), transparent 70%); }
.fdBand { position: absolute; z-index: 2; top: 0; left: 22px; width: calc(100% - 44px); height: 30px; pointer-events: none; filter: drop-shadow(0 3px 4px rgba(40,0,4,.4)); }
.fd-k-dandiya .fdSlot::after { content: ""; position: absolute; inset: 0; z-index: -1; border-radius: inherit; pointer-events: none; opacity: .35;
  background: radial-gradient(circle at 50% 50%, rgba(255,240,220,.6) 0 1.1px, transparent 1.5px) 0 0 / 16px 16px; }
.fd-k-dandiya .fdDiya { top: 36px; animation: fdGlint 3s ease-in-out infinite; }
.fd-k-dandiya .fdDiya.r { animation-delay: -1.5s; }
@keyframes fdGlint { 0%, 100% { transform: rotate(0) scale(.92); filter: drop-shadow(0 0 4px rgba(255,255,255,.5)); } 50% { transform: rotate(40deg) scale(1.1); filter: drop-shadow(0 0 10px rgba(255,255,255,.9)); } }
.fdToran { position: absolute; z-index: 2; top: 0; left: 26px; right: 26px; width: calc(100% - 52px); height: 22px; pointer-events: none;
  filter: drop-shadow(0 2px 3px rgba(0,0,0,.35)); transform-origin: 50% 0; animation: fdSwing 6s ease-in-out infinite; }
@keyframes fdSwing { 0%, 100% { transform: rotate(-.6deg); } 50% { transform: rotate(.6deg); } }
.fdDiya { position: absolute; z-index: 2; top: 10px; pointer-events: none; filter: drop-shadow(0 0 8px rgba(255,176,32,.7)); }
.fdDiya.l { left: 10px; }
.fdDiya.r { right: 10px; }
.fdDiya .fv-flame { animation: fdFlick 1.5s ease-in-out infinite; }
.fdDiya.r .fv-flame { animation-delay: -.7s; }
@keyframes fdFlick { 0%, 100% { transform: scale(1, 1); } 35% { transform: scale(.88, 1.1); } 65% { transform: scale(1.06, .94); } }
.fdTagBand { position: relative; z-index: 3; height: 48px; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 7px; box-sizing: border-box; }
.fdTag { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 999px;
  font: 800 11px/1 'Inter', sans-serif; letter-spacing: .08em; text-transform: uppercase; color: #2a1606;
  background: linear-gradient(180deg, #ffe3a3, #ffb020 65%, #f07c0a); box-shadow: 0 6px 16px -6px rgba(255,140,20,.85), inset 0 1px 0 rgba(255,255,255,.55); }
.fdTagIc { font-size: 10px; }
.fdTag.is-free { color: #10123a; background: linear-gradient(180deg, #c9fff6, #2fd3c0); box-shadow: 0 6px 16px -8px rgba(47,211,192,.8), inset 0 1px 0 rgba(255,255,255,.6); }
.fdTag.is-soon { color: rgba(255,255,255,.85); background: rgba(0,0,0,.45); box-shadow: inset 0 0 0 1px rgba(255,211,107,.3); }
.fdCard { position: relative; z-index: 1; }
.fdCard .tplCard, .fdCard .pmFrame { animation: none; content-visibility: visible; }
.fdCard .tplInner { border-color: rgba(255,211,107,.18); }
.fdCard .tplLink:hover .tplInner, .fdCard .tplLink:hover::after, .fdCard .pmFrame:hover { transform: none; }
/* a registry-independent card: festival art on a lit night instead of a poster */
.fdCard.is-fallback .tplInner > div:first-child { background: radial-gradient(80% 60% at 50% 30%, rgba(255,176,32,.35), transparent 70%), radial-gradient(70% 50% at 50% 100%, rgba(255,93,143,.25), transparent 70%), linear-gradient(170deg, var(--ft-sky0), var(--ft-sky2)) !important; }
.fdArt { position: absolute; z-index: 14; left: 8%; right: 8%; top: 7%; height: 66%; width: 84%; object-fit: contain; pointer-events: none;
  filter: drop-shadow(0 10px 22px rgba(0,0,0,.45)); animation: fdBob 3.2s ease-in-out infinite; }
@keyframes fdBob { 0%, 100% { transform: translateY(0) rotate(-1.5deg); } 50% { transform: translateY(-6px) rotate(1.5deg); } }
.fdCap { position: absolute; z-index: 15; left: 10px; right: 10px; bottom: 12px; display: flex; flex-direction: column; align-items: center; gap: 4px; text-align: center; pointer-events: none; }
.fdCap b { font: 700 clamp(18px, 2.2vw, 22px)/1.1 var(--font-playfair), "Playfair Display", serif; color: #fff7e8; text-shadow: 0 2px 12px rgba(0,0,0,.6); }
.fdCap span { font: 800 9.5px/1 'Inter', sans-serif; letter-spacing: .2em; text-transform: uppercase; color: #ffd36b; }
.fdFoot { display: flex; flex-direction: column; gap: 8px; padding: 14px 4px 0; margin-top: auto; }
.fdName { color: #fff7e8; font: 600 16px/1.25 var(--font-playfair), "Playfair Display", serif; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 2.5em; }
.fdPrice { display: inline-flex; align-items: baseline; flex-wrap: wrap; gap: 4px 8px; min-height: 24px; }
.fdPrice.is-skel { width: 70%; border-radius: 8px; background: linear-gradient(90deg, rgba(255,255,255,.06), rgba(255,255,255,.14), rgba(255,255,255,.06)); background-size: 200% 100%; animation: fdSkel 1.4s linear infinite; }
@keyframes fdSkel { from { background-position: 100% 0; } to { background-position: -100% 0; } }
.fdPrice s { font: 500 14px/1 'Inter', sans-serif; color: rgba(255,238,205,.55); text-decoration-color: rgba(255,176,32,.85); }
.fdArrow { font: 600 13px/1 'Inter', sans-serif; color: rgba(255,238,205,.45); }
.fdPrice b { font: 800 22px/1 'Inter', sans-serif; color: #fff; text-shadow: 0 0 18px rgba(255,176,32,.5); }
.fdOff { font: 700 13px/1 'Inter', sans-serif; color: #ffc457; }
.fdPriceNote { font: 500 12px/1 'Inter', sans-serif; color: rgba(255,238,205,.6); }
.fdSoon { position: relative; aspect-ratio: 3 / 4; border-radius: 1rem; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
  background: var(--ft-sky2); box-shadow: inset 0 0 0 1px rgba(255,211,107,.2); }
.fdSoon img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: .35; filter: grayscale(.4); }
.fdSoonTag { position: relative; padding: 6px 14px; border-radius: 999px; background: rgba(0,0,0,.7); color: rgba(255,255,255,.88); font: 700 10px/1 'Inter', sans-serif; letter-spacing: .18em; text-transform: uppercase; }
.fdSoonName { position: relative; color: rgba(255,255,255,.7); font: 600 13px/1.2 'Inter', sans-serif; text-align: center; padding: 0 10px; }
@media (min-width: 768px) {
  .fdSlot { padding: 0 16px 20px; border-radius: 32px; }
  .fdTagBand { height: 54px; }
  .fdTag { font-size: 11.5px; }
  .fdName { font-size: 18px; }
  .fdPrice b { font-size: 24px; }
}
@media (hover: hover) {
  .fdSlot:hover { transform: translateY(-8px); box-shadow: inset 0 1px 0 rgba(255,227,163,.3), 0 44px 70px -36px rgba(0,0,0,.95), 0 0 0 1px rgba(255,176,32,.3), 0 0 60px -16px rgba(255,176,32,.45); }
  .fdSlot:hover .fdGlow { opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .fdSlot, .fdToran, .fdDiya .fv-flame, .fdPrice.is-skel, .fdArt { animation: none !important; }
  .fdSlot { transition: none; }
}
`;
