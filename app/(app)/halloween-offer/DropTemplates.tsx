"use client";

// ─── The drop's templates, as gallery cards ──────────────────────────────────
//
// Which templates are in the drop is the season's `sale.slugs` — the super
// admin picks them in /admin/season — resolved against the template registry.
// Unknown slugs are skipped, and so are templates this visitor cannot OPEN
// (`blocked`). A template hidden from the gallery in /admin/templates is NOT
// skipped while it is in the active drop (mode "halloween"): the drop is how it
// is sold, and its builder and publish are open for exactly that reason (see
// `useTemplateAccess` and the server's `isTemplateReachable`). With the mode
// off or valentine the drop opens nothing, so hidden ones drop out. With
// nothing usable (or no answer yet) it falls back to the two Halloween
// templates, under the same filter.
//
// Each card IS the gallery card: `TemplateCard` for a normal template and
// `PremiumTemplateCard` for a premium / ✦ ultra one, fed the same rank,
// favourite and tier data the gallery feeds it, so the paid/premium behaviour
// (badge, gold frame, click tracking with is_premium, the template's own
// paywall on publish) is identical. A coming-soon template gets the gallery's
// coming-soon tile, not a link. Around each card: one haunted plate (navy
// glass, silver corner webs and the sale tag in a band ABOVE the card, a spider
// on the plate's edge, a pumpkin/lilac glow on hover) and the price underneath.

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
import { HALLOWEEN_SLUGS } from "@/lib/season";
import type { TemplateListItem } from "@/types/template-config";

type DropItem = TemplateListItem & { premium: boolean };

/** The drop's templates for this visitor, in the admin's order. */
export function useDropTemplates(slugs: readonly string[] | null | undefined): DropItem[] {
  const { blocked } = useTemplateAccess();
  const { tiers } = useTemplateMeta();
  return useMemo(() => {
    const pick = (list: readonly string[]) => {
      const seen = new Set<string>();
      const out: DropItem[] = [];
      for (const raw of list) {
        const slug = String(raw).trim().toLowerCase();
        const t = GALLERY_BY_SLUG.get(slug);
        if (!t || seen.has(slug) || blocked.has(slug)) continue;
        seen.add(slug);
        out.push({ ...t, premium: isPremiumSlug(slug, tiers) });
      }
      return out;
    };
    const chosen = slugs && slugs.length ? pick(slugs) : [];
    return chosen.length ? chosen : pick(HALLOWEEN_SLUGS);
  }, [slugs, blocked, tiers]);
}

/**
 * The drop's own sale percent, straight from /payment/pricing (never computed
 * here): when every priced template in the drop carries a discountPercent, the
 * hero shows that number — the same one on every card — or "up to" the largest
 * when they differ. null = no answer yet / some template unpriced or undiscounted
 * (the hero then keeps the season's percent).
 */
export function useDropDiscount(items: readonly DropItem[]): { pct: number; upTo: boolean } | null {
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

/** The pumpkin sale tag in the plate's top band: "49% off", "Free", or nothing until prices land. */
function SaleTag({ slug, soon }: { slug: string; soon: boolean }) {
  const { pricingFor, settled } = useTemplatePricing();
  if (soon) return <span className="hdTag is-soon">Soon</span>;
  if (!settled) return null;
  const p = pricingFor(slug);
  if (p.isFree) return <span className="hdTag is-free">Free</span>;
  if (!(p.discountPercent > 0 && p.mrp > p.finalPrice)) return null;
  return (
    <span className="hdTag">
      <span className="hdTagHole" aria-hidden />
      {p.discountPercent}% off
    </span>
  );
}

/** MRP struck through → the sale price · the percent, all as the API sent them; "Free" when unpriced. */
function PriceLine({ slug, name }: { slug: string; name: string }) {
  const { pricingFor, settled } = useTemplatePricing();
  // A super admin not paying like a customer, or an "All templates free" grant:
  // the publish gate lets this person through free, so the card must not quote
  // them a price. Display only — the server decides at publish.
  const freeFor = useAppSelector((s) => s.auth.user?.publishesFree ?? null);
  if (!settled) return <span className="hdPrice is-skel" aria-hidden />;
  const p = pricingFor(slug);
  if (!p.isFree && freeFor) {
    return (
      <span className="hdPrice" aria-label={`${name}: free for you`}>
        <b>Free for you</b>
        <span className="hdPriceNote">{freeFor === "super_admin" ? "· super admin" : "· gift from SubhSandesh"}</span>
      </span>
    );
  }
  if (p.isFree) {
    return (
      <span className="hdPrice" aria-label={`${name}: free`}>
        <b>Free</b><span className="hdPriceNote">to make &amp; send</span>
      </span>
    );
  }
  const struck = p.mrp > p.finalPrice;
  return (
    <span className="hdPrice" aria-label={struck ? `${name}: was ${formatPrice(p, "mrp")}, now ${formatPrice(p)}${p.discountPercent > 0 ? `, ${p.discountPercent}% off` : ""}` : `${name}: ${formatPrice(p)}`}>
      {struck && <s>{formatPrice(p, "mrp")}</s>}
      {struck && <span className="hdArrow" aria-hidden>→</span>}
      <b>{formatPrice(p)}</b>
      {struck && p.discountPercent > 0 && <span className="hdOff">· {p.discountPercent}% off</span>}
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

// ── the corner web: radial strands + sagging spiral rings + a few dew drops ──
const WEB_R = 60;
const WEB_ANG = [0, 17, 35, 55, 73, 90].map((d) => (d * Math.PI) / 180);
const WEB_RINGS = [13, 24, 35, 46, 56];
const pt = (r: number, a: number) => [+(r * Math.cos(a)).toFixed(1), +(r * Math.sin(a)).toFixed(1)] as const;
const WEB_SPOKES = WEB_ANG.map((a) => { const [x, y] = pt(WEB_R, a); return `M0 0L${x} ${y}`; }).join("");
const WEB_SPIRAL = WEB_RINGS.map((r) =>
  WEB_ANG.slice(1).map((a, i) => {
    const a0 = WEB_ANG[i];
    const [x0, y0] = pt(r, a0);
    const [x1, y1] = pt(r, a);
    const [cx, cy] = pt(r * 0.84, (a0 + a) / 2);
    return `${i === 0 ? `M${x0} ${y0}` : ""}Q${cx} ${cy} ${x1} ${y1}`;
  }).join(""),
).join("");
const WEB_DEW = [[24, 1], [35, 3], [46, 2], [56, 4], [13, 4], [35, 5]].map(([r, k]) => pt(r, WEB_ANG[k]));

/** A finely drawn silver corner web (top-left; the right one is mirrored in CSS). */
function CornerWeb({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden>
      <g fill="none" stroke="currentColor" strokeLinecap="round">
        <path d={WEB_SPOKES} strokeWidth=".7" />
        <path d={WEB_SPIRAL} strokeWidth=".55" opacity=".85" />
      </g>
      {WEB_DEW.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 2 ? 0.9 : 1.2} fill="#f4f0ff" opacity=".9" />
      ))}
    </svg>
  );
}

/** A small cute spider on a silk thread, hanging off the plate's side edge (never over the card). */
function DanglingSpider() {
  return (
    <span className="hdDangle" aria-hidden>
      <span className="hdSilk" />
      <span className="hdBug">
        <svg viewBox="0 0 24 22" width="26" height="24">
          <g stroke="#b9a6f0" strokeWidth="1.2" fill="none" strokeLinecap="round">
            <path d="M8 10 Q4 6 1.5 8 M8 12 Q3.5 11 1 13.5 M8.5 14 Q4.5 15 2.5 19 M9.5 15.5 Q7 18 6 21" />
            <path d="M16 10 Q20 6 22.5 8 M16 12 Q20.5 11 23 13.5 M15.5 14 Q19.5 15 21.5 19 M14.5 15.5 Q17 18 18 21" />
          </g>
          <ellipse cx="12" cy="13" rx="5.6" ry="5.8" fill="#3b2f63" stroke="#b9a6f0" strokeWidth=".8" />
          <circle cx="12" cy="7.4" r="3.6" fill="#4d3f7c" stroke="#b9a6f0" strokeWidth=".7" />
          <circle cx="10.6" cy="7" r="1.25" fill="#fff" />
          <circle cx="13.4" cy="7" r="1.25" fill="#fff" />
          <circle cx="10.8" cy="7.2" r=".55" fill="#1a1428" />
          <circle cx="13.6" cy="7.2" r=".55" fill="#1a1428" />
          <path d="M10.2 13.2 Q12 14.6 13.8 13.2" stroke="#ff9ec4" strokeWidth=".9" fill="none" strokeLinecap="round" />
        </svg>
      </span>
    </span>
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
      <div className={`hdGrid n${Math.min(items.length, 3)}`}>
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
            <div key={t.slug} className={`hdSlot${fancy ? " is-premium" : ""}`} style={{ animationDelay: `${Math.min(i, 6) * 110}ms` }}>
              <span className="hdGlow" aria-hidden />
              <CornerWeb className="hdWeb l" />
              <CornerWeb className="hdWeb r" />
              <DanglingSpider />
              <div className="hdBand">
                <SaleTag slug={t.slug} soon={soon} />
              </div>
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

// One frame per card: a soft navy-glass plate (no hairline; the card inside is the
// only edge), a top band that holds the webs and the sale tag above the card, so
// nothing ever sits on the card's own badges, heart or poster text. The spider
// hangs on the plate's outer edge.
const HD_CSS = `
.hdGrid { display: grid; grid-template-columns: minmax(0, 360px); justify-content: center; gap: 26px; margin: 34px auto 0; text-align: left; }
@media (min-width: 640px) { .hdGrid { grid-template-columns: repeat(2, minmax(0, 340px)); gap: 26px 22px; } .hdGrid.n1 { grid-template-columns: minmax(0, 360px); } }
@media (min-width: 640px) and (max-width: 1023px) { .hdGrid > .hdSlot:last-child:nth-child(odd):not(:first-child) { grid-column: 1 / -1; justify-self: center; width: calc(50% - 11px); } }
@media (min-width: 1024px) { .hdGrid.n3 { grid-template-columns: repeat(3, minmax(0, 340px)); gap: 34px; } .hdGrid.n2 { gap: 40px; } }
.hdSlot { position: relative; isolation: isolate; display: flex; flex-direction: column; padding: 0 14px 18px; border-radius: 28px;
  background: radial-gradient(120% 60% at 50% 0%, rgba(185,166,240,.16), transparent 60%), linear-gradient(180deg, rgba(48,39,88,.66), rgba(21,17,40,.82));
  -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px);
  box-shadow: inset 0 1px 0 rgba(226,216,250,.16), 0 34px 60px -36px rgba(0,0,0,.95), 0 0 0 1px rgba(10,7,22,.35);
  animation: hdIn .8s cubic-bezier(.22,1,.36,1) backwards; transition: transform .4s cubic-bezier(.22,1,.36,1), box-shadow .4s ease; }
.hdSlot.is-premium { box-shadow: inset 0 1px 0 rgba(246,231,166,.24), 0 34px 60px -36px rgba(0,0,0,.95), 0 0 0 1px rgba(10,7,22,.35), 0 0 50px -22px rgba(246,231,166,.35); }
@keyframes hdIn { from { opacity: 0; transform: translateY(26px) scale(.98); } }
.hdGlow { position: absolute; inset: 0; z-index: -1; border-radius: inherit; pointer-events: none; opacity: 0; transition: opacity .4s ease;
  background: radial-gradient(90% 50% at 50% 104%, rgba(255,154,60,.42), transparent 70%), radial-gradient(80% 40% at 50% -6%, rgba(185,166,240,.32), transparent 70%); }
/* the webs: flush in the plate's top corners, inside the band */
.hdWeb { position: absolute; top: 0; z-index: 2; width: 50px; height: 50px; color: rgba(226,222,240,.62); pointer-events: none; filter: drop-shadow(0 0 2px rgba(226,216,250,.25)); }
.hdWeb.l { left: 0; border-top-left-radius: 28px; }
.hdWeb.r { right: 0; transform: scaleX(-1); }
.hdBand { position: relative; z-index: 3; height: 40px; display: flex; align-items: center; justify-content: center; }
.hdTag { position: relative; display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px 5px 9px; border-radius: 6px 999px 999px 6px; rotate: -2deg;
  font: 800 11px/1 'Inter', sans-serif; letter-spacing: .08em; text-transform: uppercase; color: #2a1606;
  background: linear-gradient(180deg, #ffd08f, #ff9a3c 70%, #f07d1f); box-shadow: 0 6px 16px -6px rgba(255,140,40,.8), inset 0 1px 0 rgba(255,255,255,.55), inset 0 -1px 0 rgba(150,60,0,.25); }
.hdTagHole { width: 6px; height: 6px; border-radius: 50%; background: #2a2148; box-shadow: inset 0 1px 1px rgba(0,0,0,.5), 0 0 0 1.5px rgba(255,255,255,.5); }
.hdTag::before { content: ""; position: absolute; left: -12px; top: 50%; width: 14px; height: 1px; background: rgba(226,216,250,.5); rotate: -18deg; }
.hdTag.is-free { color: #1e1636; background: linear-gradient(180deg, #e6dcff, #b9a6f0); box-shadow: 0 6px 16px -8px rgba(185,166,240,.8), inset 0 1px 0 rgba(255,255,255,.6); padding: 5px 12px; border-radius: 999px; }
.hdTag.is-free::before, .hdTag.is-soon::before { display: none; }
.hdTag.is-soon { color: rgba(255,255,255,.85); background: rgba(0,0,0,.45); box-shadow: inset 0 0 0 1px rgba(185,166,240,.3); padding: 5px 12px; border-radius: 999px; }
/* the spider: on the plate's outer edge, bobbing on its silk (transform only) */
.hdDangle { position: absolute; z-index: 4; top: 22px; left: 0; width: 0; height: 0; pointer-events: none; }
.hdSlot:nth-child(2n) .hdDangle { left: auto; right: 0; }
.hdSilk { position: absolute; left: 0; top: 0; width: 1px; height: 60px; background: linear-gradient(180deg, rgba(226,216,250,.2), rgba(226,216,250,.75));
  transform-origin: top center; animation: hdSilk 5.5s ease-in-out infinite; }
.hdBug { position: absolute; left: -13px; top: 56px; width: 26px; height: 24px; animation: hdBug 5.5s ease-in-out infinite; }
.hdBug svg { display: block; filter: drop-shadow(0 0 4px rgba(185,166,240,.55)); }
.hdSlot:nth-child(2n) .hdSilk, .hdSlot:nth-child(2n) .hdBug { animation-delay: -2.4s; }
@keyframes hdSilk { 0%, 100% { transform: scaleY(.55); } 50% { transform: scaleY(1); } }
@keyframes hdBug { 0%, 100% { transform: translateY(-27px) rotate(-6deg); } 50% { transform: translateY(0) rotate(5deg); } }
.hdCard { position: relative; z-index: 1; }
/* the plate lifts as one; the inner card keeps still and drops its own entrance */
.hdCard .tplCard, .hdCard .pmFrame { animation: none; content-visibility: visible; }
.hdCard .tplInner { border-color: rgba(185,166,240,.16); }
.hdCard .tplLink:hover .tplInner, .hdCard .tplLink:hover .tplShell::after, .hdCard .pmFrame:hover { transform: none; }
.hdFoot { display: flex; flex-direction: column; gap: 8px; padding: 14px 4px 0; margin-top: auto; }
.hdName { color: #f3eefe; font: 600 16px/1.25 var(--font-playfair), "Playfair Display", serif; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 2.5em; }
.hdPrice { display: inline-flex; align-items: baseline; flex-wrap: wrap; gap: 4px 8px; min-height: 24px; }
.hdPrice.is-skel { width: 70%; border-radius: 8px; background: linear-gradient(90deg, rgba(255,255,255,.06), rgba(255,255,255,.14), rgba(255,255,255,.06)); background-size: 200% 100%; animation: hdSkel 1.4s linear infinite; }
@keyframes hdSkel { from { background-position: 100% 0; } to { background-position: -100% 0; } }
.hdPrice s { font: 500 14px/1 'Inter', sans-serif; color: rgba(226,216,250,.55); text-decoration-color: rgba(255,154,60,.8); }
.hdArrow { font: 600 13px/1 'Inter', sans-serif; color: rgba(226,216,250,.45); }
.hdPrice b { font: 800 22px/1 'Inter', sans-serif; color: #fff; text-shadow: 0 0 18px rgba(255,154,60,.45); }
.hdOff { font: 700 13px/1 'Inter', sans-serif; color: #ffb36b; }
.hdPriceNote { font: 500 12px/1 'Inter', sans-serif; color: rgba(226,216,250,.6); }
.hdSoon { position: relative; aspect-ratio: 3 / 4; border-radius: 1rem; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
  background: #1b1630; box-shadow: inset 0 0 0 1px rgba(185,166,240,.2); }
.hdSoon img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: .35; filter: grayscale(.4); }
.hdSoonTag { position: relative; padding: 6px 14px; border-radius: 999px; background: rgba(0,0,0,.7); color: rgba(255,255,255,.88); font: 700 10px/1 'Inter', sans-serif; letter-spacing: .18em; text-transform: uppercase; }
.hdSoonName { position: relative; color: rgba(255,255,255,.7); font: 600 13px/1.2 'Inter', sans-serif; text-align: center; padding: 0 10px; }
@media (min-width: 768px) {
  .hdSlot { padding: 0 16px 20px; border-radius: 32px; }
  .hdWeb { width: 58px; height: 58px; }
  .hdWeb.l { border-top-left-radius: 32px; }
  .hdBand { height: 46px; }
  .hdTag { font-size: 11.5px; }
  .hdName { font-size: 18px; }
  .hdPrice b { font-size: 24px; }
}
@media (hover: hover) {
  .hdSlot:hover { transform: translateY(-8px); box-shadow: inset 0 1px 0 rgba(255,200,140,.3), 0 44px 70px -36px rgba(0,0,0,.95), 0 0 0 1px rgba(255,154,60,.28), 0 0 60px -16px rgba(255,154,60,.42); }
  .hdSlot:hover .hdGlow { opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .hdSlot, .hdSilk, .hdBug, .hdPrice.is-skel { animation: none !important; }
  .hdSlot { transition: none; }
}
`;
