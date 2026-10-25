"use client";

// The gallery's invitation to the wedding-season drop, in the seasonal
// teaser's spot beside Premium. Same shape as ValentineTeaser /
// HalloweenTeaser / FestivalTeaser — a full card on tablets and up, one slim
// row on phones — in the wedding's daylight silk (weddingTheme.ts): a marigold
// toran along the top, the bride and groom under a floral arch with a jhumka
// swinging on each side, a peacock in flowers, and a gold-zari seal.
//
// The art is the /wedding hub's CDN files, loaded after idle into sized boxes.
// Opens /wedding-offer.

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useDropFree } from "@/hooks/useDropFree";
import { useSeason } from "@/hooks/useSeason";
import { DROPS } from "@/lib/season";
import IdleGif from "@/components/promo/IdleGif";
import { Jhumka, MarigoldToran, Rings } from "@/components/promo/weddingArt";
import { WEDDING_LUX, wtVars } from "@/components/promo/weddingTheme";

export default function WeddingTeaser() {
  const season = useSeason();
  const free = useDropFree("wedding");
  const pct = season?.mode === "wedding" && season.sale.enabled ? season.sale.percent : 0;
  const badge = "Wedding season drop";
  return (
    <section className="wtz" style={wtVars()} aria-label={badge}>
      <span className="wtzToran" aria-hidden><MarigoldToran n={5} /></span>
      <Link href={DROPS.wedding.path} className="wtzLink" prefetch={false}
        aria-label={free ? `${badge} — free` : pct ? `${badge} — ${pct}% off the wedding invitations` : badge}>
        <div className="wtzBody">
          <span className="wtzBadge"><Rings size={13} /> {badge}{free ? " · free" : pct ? ` · ${pct}% off` : ""}</span>
          <h2 className="wtzTitle">Invitations that <em>open like a celebration</em></h2>
          <p className="wtzSub">Palace doors, peacock gardens, lotus temples and chapels — Haldi to reception on one link, with RSVP for every function. Till 31 December.</p>
          <ul className="wtzPerks" aria-label="Included">
            <li>💍 11 wedding designs</li>
            <li>🌼 RSVP per function</li>
            <li>📲 Send on WhatsApp</li>
          </ul>
          <span className="wtzGo">See the wedding drop <ArrowRight size={15} aria-hidden /></span>
        </div>
        <div className="wtzArt" aria-hidden>
          <span className="wtzArch" />
          <span className="wtzJh l"><i /><Jhumka size={22} /></span>
          <span className="wtzJh r"><i /><Jhumka size={22} /></span>
          <IdleGif src={WEDDING_LUX("peacock-flowers-360.webp")} width={196} height={360} className="wtzPeacock" />
          <IdleGif src={WEDDING_LUX("c-wedding-600.webp")} width={334} height={600} className="wtzCouple" />
          <span className="wtzSeal">{free ? <><b>FREE</b><i>DROP</i></> : pct ? <><b>{pct}<small>%</small></b><i>OFF</i></> : <><b>NEW</b><i>DROP</i></>}</span>
        </div>

        {/* Phones: one slim row. */}
        <span className="wtzMini">
          <span className="wtzMiniSeal">{free ? <><b>FREE</b><i>DROP</i></> : pct ? <><b>{pct}%</b><i>OFF</i></> : <><b>💍</b><i>NEW</i></>}</span>
          <span className="wtzMiniText">
            <span className="wtzMiniKick"><Rings size={11} /> Wedding season drop</span>
            <span className="wtzMiniTitle">Invites that <em>open like a celebration</em></span>
          </span>
          <span className="wtzMiniGo"><ArrowRight size={16} /></span>
        </span>
      </Link>
    </section>
  );
}

const SEAL_BG = "radial-gradient(circle at 35% 30%, #fff6dc, #e9cd84 45%, #c39a43 75%, #8f6a22 100%)";

export const WEDDING_TEASER_CSS = `
.wtz { position: relative; isolation: isolate; overflow: hidden; border-radius: 26px; background: var(--wt-silk); color: var(--wt-ink);
  border: 1px solid var(--wt-edge); box-shadow: 0 24px 50px -30px rgba(110,30,40,.45), inset 0 0 0 4px rgba(255,255,255,.55), inset 0 0 0 5px rgba(195,154,67,.25); }
.wtzToran { position: absolute; z-index: 2; left: -4px; right: -4px; top: -3px; display: block; pointer-events: none; filter: drop-shadow(0 3px 3px rgba(110,40,10,.2)); }
.wtzToran svg { display: block; width: 100%; height: auto; }
.wtzLink { position: relative; z-index: 1; display: grid; grid-template-columns: minmax(0,1fr); gap: 18px; align-items: center; padding: 40px 20px 22px; color: inherit; text-decoration: none; height: 100%; }
.wtzLink:focus-visible { outline: 2px solid var(--wt-sindoor); outline-offset: -4px; border-radius: 26px; }
.wtzBody { position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: 10px; min-width: 0; padding: 18px; border-radius: 20px;
  background: var(--wt-glass); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); box-shadow: inset 0 0 0 1px var(--wt-edge); }
.wtzBadge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 11px; border-radius: 99px; color: #fff3d6;
  background: linear-gradient(180deg, #b8324a, var(--wt-sindoor) 60%, var(--wt-sindoor-deep)); box-shadow: 0 0 0 1px var(--wt-gold); font: 800 10px/1.2 'Inter', system-ui, sans-serif; letter-spacing: .12em; text-transform: uppercase; }
.wtzTitle { margin: 2px 0 0; color: var(--wt-ink); font: 600 26px/1.1 'Playfair Display', serif; letter-spacing: -.01em; }
.wtzTitle em { color: var(--wt-sindoor); font-style: italic; }
.wtzSub { margin: 0; max-width: 520px; color: var(--wt-ink-soft); font: 400 13.5px/1.5 'Inter', system-ui, sans-serif; }
.wtzPerks { display: flex; flex-wrap: wrap; gap: 6px; margin: 2px 0 4px; padding: 0; list-style: none; }
.wtzPerks li { padding: 5px 10px; border-radius: 99px; border: 1px solid var(--wt-edge); color: var(--wt-ink); background: rgba(255,255,255,.6); font: 600 11px/1 'Inter', system-ui, sans-serif; }
.wtzGo { display: inline-flex; align-items: center; gap: 7px; padding: 12px 20px; border-radius: 99px; color: #fff3d6;
  background: linear-gradient(180deg, #b8324a, var(--wt-sindoor) 60%, var(--wt-sindoor-deep)); font: 800 13.5px/1 'Inter', system-ui, sans-serif;
  box-shadow: 0 0 0 1px var(--wt-gold), 0 10px 22px -10px rgba(110,16,34,.6); transition: transform .2s ease; }
.wtzArt { position: relative; height: 190px; }
/* a floral arch drawn in CSS: blush and gold rings behind the couple */
.wtzArch { position: absolute; left: 50%; bottom: 0; width: 160px; height: 180px; transform: translateX(-50%); border-radius: 80px 80px 0 0;
  background: radial-gradient(70% 60% at 50% 30%, rgba(255,255,255,.9), rgba(249,225,220,.6) 70%, transparent 100%);
  box-shadow: inset 0 0 0 2px rgba(195,154,67,.55), inset 0 0 0 7px rgba(255,250,242,.8), inset 0 0 0 8px rgba(195,154,67,.3); }
.wtzCouple { position: absolute; z-index: 2; left: 50%; bottom: 0; width: 92px; height: 166px; margin-left: -46px; filter: drop-shadow(0 8px 12px rgba(110,30,40,.25)); }
.wtzPeacock { position: absolute; z-index: 1; right: 0; bottom: 0; width: 70px; height: 128px; }
.wtzJh { position: absolute; z-index: 3; top: 10px; display: block; transform-origin: 50% 0; animation: wtzJh 3s ease-in-out infinite; }
.wtzJh i { position: absolute; left: 50%; top: -14px; width: 1px; height: 14px; background: #c39a43; }
.wtzJh svg { display: block; filter: drop-shadow(0 3px 4px rgba(110,70,10,.3)); }
.wtzJh.l { left: calc(50% - 98px); } .wtzJh.r { left: calc(50% + 76px); animation-delay: -1.5s; }
@keyframes wtzJh { 0%, 100% { transform: rotate(-9deg); } 50% { transform: rotate(9deg); } }
.wtzSeal { position: absolute; left: 2%; top: 8%; z-index: 3; width: 74px; height: 74px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center;
  color: var(--wt-ink); background: ${SEAL_BG}; transform: rotate(-10deg);
  box-shadow: 0 0 0 3px rgba(255,250,242,.9), 0 0 0 4px rgba(195,154,67,.5), 0 10px 20px -8px rgba(110,70,10,.5), inset 0 2px 0 rgba(255,255,255,.6); animation: wtzSeal 3s ease-in-out infinite; }
@keyframes wtzSeal { 0%, 100% { transform: rotate(-10deg) scale(1); } 50% { transform: rotate(-6deg) scale(1.06); } }
.wtzSeal b { font: 700 26px/1 'Playfair Display', serif; } .wtzSeal small { font-size: 13px; }
.wtzSeal i { font: 800 9px/1 'Inter', system-ui, sans-serif; font-style: normal; letter-spacing: .24em; margin-top: 2px; }
.wtzMini { display: none; }
@media (hover: hover) { .wtz:hover .wtzGo { transform: translateY(-2px); } }
@media (max-width: 767px) {
  .wtz { border-radius: 18px; }
  .wtzToran { top: -6px; }
  .wtzLink { display: block; padding: 10px 0 0; }
  .wtzBody, .wtzArt { display: none; }
  .wtzMini { display: flex; align-items: center; gap: 12px; width: 100%; padding: 10px 12px 10px 10px; }
  .wtzMiniSeal { flex-shrink: 0; width: 52px; height: 52px; margin: 0 7px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center;
    color: var(--wt-ink); background: ${SEAL_BG}; transform: rotate(-8deg);
    box-shadow: 0 0 0 2px rgba(255,250,242,.9), 0 0 0 3px rgba(195,154,67,.5), inset 0 1.5px 0 rgba(255,255,255,.55); animation: wtzSeal 3s ease-in-out infinite; }
  .wtzMiniSeal b { font: 700 16px/1 'Playfair Display', serif; }
  .wtzMiniSeal i { font: 800 7.5px/1 'Inter', system-ui, sans-serif; font-style: normal; letter-spacing: .2em; margin-top: 2px; }
  .wtzMiniText { display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1; }
  .wtzMiniKick { display: inline-flex; align-items: center; gap: 4px; color: var(--wt-gold-deep); font: 800 9.5px/1 'Inter', system-ui, sans-serif; letter-spacing: .14em; text-transform: uppercase; }
  .wtzMiniTitle { color: var(--wt-ink); font: 600 15px/1.2 'Playfair Display', serif; }
  .wtzMiniTitle em { color: var(--wt-sindoor); font-style: italic; }
  .wtzMiniGo { flex-shrink: 0; width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; color: #fff3d6;
    background: linear-gradient(180deg, #b8324a, var(--wt-sindoor-deep)); box-shadow: 0 0 0 1px var(--wt-gold); }
}
@media (min-width: 768px) {
  .wtzLink { grid-template-columns: minmax(0,1.15fr) minmax(0,1fr); gap: 24px; padding: 44px 30px 30px 34px; }
  .wtzTitle { font-size: 34px; }
  .wtzSub { font-size: 15px; }
  .wtzArt { height: 236px; }
  .wtzCouple { width: 118px; height: 212px; margin-left: -59px; }
  .wtzArch { width: 190px; height: 226px; border-radius: 95px 95px 0 0; }
  .wtzJh.l { left: calc(50% - 116px); } .wtzJh.r { left: calc(50% + 94px); }
}
@media (min-width: 1024px) {
  .wtzLink { grid-template-columns: minmax(0,1.2fr) minmax(0,.8fr); gap: 12px; padding: 40px 20px 22px 22px; }
  .wtzBody { padding: 18px 18px 20px; }
  .wtzTitle { font-size: 27px; }
  .wtzSub { font-size: 13.5px; }
  .wtzArt { height: 214px; }
  .wtzCouple { width: 104px; height: 187px; margin-left: -52px; }
  .wtzArch { width: 160px; height: 200px; border-radius: 80px 80px 0 0; }
  .wtzJh.l { left: calc(50% - 100px); } .wtzJh.r { left: calc(50% + 78px); }
  .wtzSeal { left: -2%; }
}
@media (prefers-reduced-motion: reduce) {
  .wtz *, .wtz .wtzSeal, .wtz .wtzMiniSeal { animation: none !important; }
}
`;
