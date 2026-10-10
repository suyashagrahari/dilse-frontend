"use client";

// The gallery's invitation to the Halloween drop, in the Valentine teaser's
// spot while the site is in Halloween mode. Same shape as ValentineTeaser — a
// full card on tablets and up, one slim row on phones — so the pair beside
// Premium still reads as a set. Painted as the drop's haunted night (HW):
// frosted navy glass over a night sky, a butter moon, the house's silhouette
// with its one warm window, corner webs, and the ghost. The art is inline
// SVG/CSS; the ghost GIF loads after idle into a box that is already sized.

import { WitchLink } from "@/components/promo/WitchPortal";
import { ArrowRight } from "lucide-react";
import { useSeason } from "@/hooks/useSeason";
import { HALLOWEEN_GIF, HALLOWEEN_PATH } from "@/lib/season";
import { HW, HW_SKY } from "@/components/promo/halloweenTheme";
import IdleGif from "@/components/promo/IdleGif";

function Web({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 60 60" aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth=".7" strokeLinecap="round">
        <path d="M0 0 L60 8 M0 0 L52 34 M0 0 L34 52 M0 0 L8 60" />
        <path d="M14 2 Q12 9 12 12 Q9 12 2 14" />
        <path d="M28 4 Q22 17 21 21 Q17 22 4 28" />
        <path d="M42 6 Q33 26 31 31 Q26 33 6 42" />
        <path d="M55 7 Q44 34 41 41 Q34 44 7 55" />
      </g>
    </svg>
  );
}

function House() {
  return (
    <svg className="htzHouse" viewBox="0 0 200 150" aria-hidden>
      <path d="M8 150 C12 128 14 112 12 98 C10 90 4 84 0 80 L3 77 C9 82 13 88 15 94 C16 84 13 74 7 66 L10 64 C17 73 19 84 19 94 C22 88 28 84 36 82 L37 85 C29 88 25 94 23 102 C22 118 24 136 27 150 Z" fill="#0f0b1d" />
      <path d="M48 76 L132 72 L136 150 L44 150 Z" fill="#4a3b6e" stroke={HW.ink} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M36 80 L90 22 L142 76 Z" fill={HW.roof} stroke={HW.ink} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M126 58 L160 55 L163 150 L126 150 Z" fill="#3e3062" stroke={HW.ink} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M120 62 L143 2 L168 58 Z" fill={HW.roof} stroke={HW.ink} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M137 92 L137 80 Q144 69 151 80 L151 92 Z" fill={HW.window} stroke={HW.ink} strokeWidth="2" className="htzLit" />
      <circle cx="90" cy="58" r="8" fill="#1c1532" stroke={HW.ink} strokeWidth="2" />
      <rect x="58" y="92" width="18" height="22" rx="3" fill="#1c1532" stroke={HW.ink} strokeWidth="2" />
      <rect x="104" y="90" width="17" height="22" rx="3" fill="#1c1532" stroke={HW.ink} strokeWidth="2" />
      <path d="M80 150 L80 124 Q90 110 100 124 L100 150 Z" fill="#6a52a0" stroke={HW.ink} strokeWidth="2" />
      <ellipse cx="100" cy="152" rx="120" ry="10" fill="#120d22" />
    </svg>
  );
}

export default function HalloweenTeaser() {
  const season = useSeason();
  const pct = season?.mode === "halloween" && season.sale.enabled ? season.sale.percent : 0;
  return (
    <section className="htz" aria-label="The Halloween drop">
      <span className="htzStars" aria-hidden />
      <Web className="htzWeb l" />
      <Web className="htzWeb r" />
      <WitchLink href={HALLOWEEN_PATH} className="htzLink" prefetch={false}
        aria-label={pct ? `The Halloween drop — ${pct}% off spooky love letter templates` : "The Halloween drop — spooky love letter templates"}>
        <div className="htzBody">
          <span className="htzBadge">🎃 Halloween drop{pct ? ` · ${pct}% off` : ""}</span>
          <h2 className="htzTitle">Will you be <em>my boo?</em></h2>
          <p className="htzSub">A tiny haunted house and a boo-tiful night — spooky-cute love letters, only till 31 October.</p>
          <ul className="htzPerks" aria-label="Included">
            <li>🏚️ Haunted house</li><li>👻 Boo-tiful Night ✦</li><li>🕸️ Ends 31 Oct</li>
          </ul>
          <span className="htzGo">Enter if you dare <ArrowRight size={15} aria-hidden /></span>
        </div>
        <div className="htzArt" aria-hidden>
          <span className="htzMoon" />
          <House />
          <span className="htzFog" />
          <IdleGif src={HALLOWEEN_GIF("ghost-running.webp")} width={220} height={220} className="htzGhost" />
          <span className="htzSeal">{pct ? <><b>{pct}<small>%</small></b><i>OFF</i></> : <><b>NEW</b><i>DROP</i></>}</span>
        </div>

        {/* Phones: one slim row. */}
        <span className="htzMini">
          <span className="htzMiniSeal">{pct ? <><b>{pct}%</b><i>OFF</i></> : <><b>🎃</b><i>NEW</i></>}</span>
          <span className="htzMiniText">
            <span className="htzMiniKick">🦇 Halloween drop</span>
            <span className="htzMiniTitle">Spooky <em>love letters</em></span>
          </span>
          <span className="htzMiniGo"><ArrowRight size={16} /></span>
        </span>
      </WitchLink>
    </section>
  );
}

const SEAL_BG = `radial-gradient(circle at 35% 30%, #ffe2b0, ${HW.pumpkin} 52%, ${HW.pumpkinDeep} 100%)`;

export const HALLOWEEN_TEASER_CSS = `
.htz { position: relative; isolation: isolate; overflow: hidden; border-radius: 26px; background: ${HW_SKY};
  border: 1px solid ${HW.glassEdge}; box-shadow: 0 24px 50px -28px rgba(23,19,42,.9), inset 0 1px 0 rgba(226,216,250,.12); }
.htzStars { position: absolute; inset: 0; z-index: -1; pointer-events: none; opacity: .7;
  background-image: radial-gradient(1.2px 1.2px at 58% 12%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 72% 34%, #fff 50%, transparent 51%),
    radial-gradient(1.3px 1.3px at 90% 20%, #fff4cf 50%, transparent 51%), radial-gradient(1px 1px at 40% 8%, #fff 50%, transparent 51%),
    radial-gradient(1px 1px at 8% 70%, #e2d8fa 50%, transparent 51%), radial-gradient(1.2px 1.2px at 30% 88%, #fff 50%, transparent 51%); }
.htzWeb { position: absolute; top: 0; z-index: 2; width: 74px; height: 74px; color: rgba(226,216,250,.42); pointer-events: none; }
.htzWeb.l { left: 0; } .htzWeb.r { right: 0; transform: scaleX(-1); }
.htzLink { position: relative; z-index: 1; display: grid; grid-template-columns: minmax(0,1fr); gap: 18px; align-items: center; padding: 22px 20px; color: inherit; text-decoration: none; height: 100%; }
.htzLink:focus-visible { outline: 2px solid ${HW.pumpkin}; outline-offset: -4px; border-radius: 26px; }
.htzBody { position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: 10px; min-width: 0; padding: 18px; border-radius: 20px;
  background: ${HW.glass}; -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); box-shadow: inset 0 0 0 1px ${HW.glassEdge}; }
.htzBadge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 11px; border-radius: 99px; color: #1e1230;
  background: linear-gradient(180deg, #ffc27e, ${HW.pumpkin}); box-shadow: 0 0 16px rgba(255,154,60,.45); font: 800 10px/1 'Inter', system-ui, sans-serif; letter-spacing: .14em; text-transform: uppercase; }
.htzTitle { margin: 2px 0 0; color: ${HW.text}; font: 600 26px/1.08 'Playfair Display', serif; letter-spacing: -.01em; }
.htzTitle em { color: ${HW.pumpkin}; font-style: italic; text-shadow: 0 0 18px rgba(255,154,60,.5); }
.htzSub { margin: 0; max-width: 520px; color: ${HW.muted}; font: 400 13.5px/1.5 'Inter', system-ui, sans-serif; }
.htzPerks { display: flex; flex-wrap: wrap; gap: 6px; margin: 2px 0 4px; padding: 0; list-style: none; }
.htzPerks li { padding: 5px 10px; border-radius: 99px; border: 1px solid ${HW.glassEdge}; color: ${HW.text}; background: rgba(185,166,240,.08); font: 600 11px/1 'Inter', system-ui, sans-serif; }
.htzGo { display: inline-flex; align-items: center; gap: 7px; padding: 12px 20px; border-radius: 99px; color: #1e1230;
  background: linear-gradient(180deg, #ffd08f, ${HW.pumpkin}); font: 800 13.5px/1 'Inter', system-ui, sans-serif;
  box-shadow: 0 10px 24px -10px rgba(255,154,60,.85); transition: transform .2s ease; }
.htzArt { position: relative; height: 170px; }
.htzMoon { position: absolute; right: 6%; top: 0; width: 86px; height: 86px; border-radius: 50%;
  background: radial-gradient(circle at 38% 36%, #fffbe6, ${HW.moon} 55%, #ead48a); box-shadow: 0 0 50px 14px ${HW.moonGlow}; }
.htzHouse { position: absolute; right: 0; bottom: 0; width: 78%; height: auto; max-height: 100%; }
.htzLit { animation: htzLit 4s ease-in-out infinite; }
@keyframes htzLit { 0%, 100% { opacity: 1; } 40% { opacity: .7; } 43% { opacity: 1; } 70% { opacity: .82; } }
.htzFog { position: absolute; left: -10%; right: -10%; bottom: -12px; height: 48px; filter: blur(12px); pointer-events: none;
  background: radial-gradient(50% 60% at 40% 50%, rgba(214,202,245,.28), transparent 70%); animation: htzFog 12s ease-in-out infinite alternate; }
@keyframes htzFog { from { transform: translateX(-6%); } to { transform: translateX(6%); } }
.htzGhost { position: absolute; left: 0; bottom: 4%; width: 92px; height: 92px; animation: htzFloat 4.6s ease-in-out infinite; }
@keyframes htzFloat { 0%, 100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-12px) rotate(3deg); } }
.htzSeal { position: absolute; left: 30%; top: 4%; width: 74px; height: 74px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center;
  color: #1e1230; background: ${SEAL_BG}; transform: rotate(-10deg);
  box-shadow: 0 0 26px rgba(255,154,60,.6), inset 0 2px 0 rgba(255,255,255,.45); animation: htzSeal 2.8s ease-in-out infinite; }
@keyframes htzSeal { 0%, 100% { transform: rotate(-10deg) scale(1); } 50% { transform: rotate(-6deg) scale(1.07); } }
.htzSeal b { font: 700 26px/1 'Playfair Display', serif; } .htzSeal small { font-size: 13px; }
.htzSeal i { font: 800 9px/1 'Inter', system-ui, sans-serif; font-style: normal; letter-spacing: .24em; margin-top: 2px; }
.htzMini { display: none; }
@media (hover: hover) { .htz:hover .htzGo { transform: translateY(-2px); } }
@media (max-width: 767px) {
  .htz { border-radius: 18px; }
  .htzWeb { width: 44px; height: 44px; }
  .htzLink { display: block; padding: 0; }
  .htzBody, .htzArt { display: none; }
  .htzMini { display: flex; align-items: center; gap: 12px; width: 100%; padding: 10px 12px 10px 10px; }
  .htzMiniSeal { flex-shrink: 0; width: 52px; height: 52px; margin: 0 7px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center;
    color: #1e1230; background: ${SEAL_BG}; transform: rotate(-8deg);
    box-shadow: 0 0 18px rgba(255,154,60,.6), inset 0 1.5px 0 rgba(255,255,255,.45); animation: htzSeal 2.8s ease-in-out infinite; }
  .htzMiniSeal b { font: 700 16px/1 'Playfair Display', serif; }
  .htzMiniSeal i { font: 800 7.5px/1 'Inter', system-ui, sans-serif; font-style: normal; letter-spacing: .2em; margin-top: 2px; }
  .htzMiniText { display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1; }
  .htzMiniKick { display: inline-flex; align-items: center; gap: 4px; color: ${HW.lilac}; font: 800 9.5px/1 'Inter', system-ui, sans-serif; letter-spacing: .18em; text-transform: uppercase; }
  .htzMiniTitle { color: ${HW.text}; font: 600 15px/1.2 'Playfair Display', serif; }
  .htzMiniTitle em { color: ${HW.pumpkin}; font-style: italic; }
  .htzMiniGo { flex-shrink: 0; width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; color: #1e1230;
    background: linear-gradient(180deg, #ffd08f, ${HW.pumpkin}); box-shadow: 0 6px 14px -6px rgba(255,154,60,.8); }
}
@media (min-width: 768px) {
  .htzLink { grid-template-columns: minmax(0,1.15fr) minmax(0,1fr); gap: 24px; padding: 30px 30px 30px 34px; }
  .htzTitle { font-size: 36px; }
  .htzSub { font-size: 15px; }
  .htzArt { height: 230px; }
  .htzGhost { width: 120px; height: 120px; }
}
@media (min-width: 1024px) {
  .htzLink { grid-template-columns: minmax(0,1.2fr) minmax(0,.8fr); gap: 12px; padding: 22px 20px 22px 22px; }
  .htzBody { padding: 18px 18px 20px; }
  .htzTitle { font-size: 28px; }
  .htzSub { font-size: 13.5px; }
  .htzArt { height: 210px; }
  .htzGhost { width: 92px; height: 92px; }
  .htzSeal { left: 18%; }
}
@media (prefers-reduced-motion: reduce) {
  .htzLit, .htzFog, .htzGhost, .htzSeal, .htzMiniSeal { animation: none !important; }
}
`;
