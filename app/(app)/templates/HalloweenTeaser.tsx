"use client";

// The gallery's invitation to the Halloween drop, in the Valentine teaser's
// spot while the site is in Halloween mode. Same shape as ValentineTeaser — a
// full card on tablets and up, one slim row on phones — so the pair beside
// Premium still reads as a set. The template GIFs load after idle into boxes
// that are already sized, so nothing moves when they arrive.

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useSeason } from "@/hooks/useSeason";
import { HALLOWEEN_GIF, HALLOWEEN_PATH } from "@/lib/season";
import { Bat, CornerWeb } from "@/components/promo/halloweenArt";
import IdleGif from "@/components/promo/IdleGif";

export default function HalloweenTeaser() {
  const season = useSeason();
  const pct = season?.mode === "halloween" && season.sale.enabled ? season.sale.percent : 0;
  return (
    <section className="htz" aria-label="The Halloween drop">
      <span className="htzGlow" aria-hidden />
      <CornerWeb size={110} className="htzWeb" />
      <Link href={HALLOWEEN_PATH} className="htzLink" prefetch={false}
        aria-label={pct ? `The Halloween drop — ${pct}% off two Halloween templates` : "The Halloween drop — two Halloween templates"}>
        <div className="htzBody">
          <span className="htzBadge">🎃 Halloween drop{pct ? ` · ${pct}% off` : ""}</span>
          <h2 className="htzTitle">Will you be <em>my boo?</em></h2>
          <p className="htzSub">A tiny haunted house and a boo-tiful night — two spooky-cute love letters, only till 31 October.</p>
          <ul className="htzPerks" aria-label="Included">
            <li>🏚️ Haunted house</li><li>👻 Boo-tiful Night ✦</li><li>🕸️ Ends 31 Oct</li>
          </ul>
          <span className="htzGo">Enter if you dare <ArrowRight size={15} aria-hidden /></span>
        </div>
        <div className="htzArt" aria-hidden>
          <span className="htzMoon" />
          <Bat size={30} className="htzBat b1" />
          <Bat size={20} className="htzBat b2" />
          <IdleGif src={HALLOWEEN_GIF("ghost-running.webp")} width={220} height={220} className="htzGhost" />
          <IdleGif src={HALLOWEEN_GIF("witch-hat-pumpkin.webp")} width={240} height={285} className="htzPumpkin" />
          <span className="htzSeal">{pct ? <><b>{pct}<small>%</small></b><i>OFF</i></> : <><b>NEW</b><i>DROP</i></>}</span>
        </div>

        {/* Phones: one slim row. */}
        <span className="htzMini">
          <span className="htzMiniSeal">{pct ? <><b>{pct}%</b><i>OFF</i></> : <><b>🎃</b><i>NEW</i></>}</span>
          <span className="htzMiniText">
            <span className="htzMiniKick">🦇 Halloween drop</span>
            <span className="htzMiniTitle">Two spooky <em>love letters</em></span>
          </span>
          <span className="htzMiniGo"><ArrowRight size={16} /></span>
        </span>
      </Link>
    </section>
  );
}

export const HALLOWEEN_TEASER_CSS = `
.htz { position: relative; isolation: isolate; overflow: hidden; border-radius: 26px;
  background: radial-gradient(70% 80% at 85% 110%, rgba(232,116,42,.6) 0%, transparent 60%),
    radial-gradient(120% 140% at 0% 0%, #4a1015 0%, #2a080c 45%, #12040a 100%);
  border: 1px solid rgba(201,168,76,.42); box-shadow: 0 24px 50px -28px rgba(26,5,7,.85), inset 0 1px 0 rgba(255,220,180,.12); }
.htzGlow { position: absolute; inset: 0; z-index: -1; pointer-events: none; overflow: hidden; }
.htzGlow::before { content: ""; position: absolute; top: -30%; bottom: -30%; width: 28%; left: 0; transform: translateX(-150%) skewX(-18deg);
  background: linear-gradient(90deg, transparent, rgba(255,190,120,.14), transparent); animation: htzSweep 6.5s ease-in-out 1.5s infinite; }
/* transform, not left: animating left registers as a layout shift on every frame */
@keyframes htzSweep { 0%, 55% { transform: translateX(-150%) skewX(-18deg); } 90%, 100% { transform: translateX(470%) skewX(-18deg); } }
.htzWeb { position: absolute; top: 0; left: 0; z-index: 0; color: rgba(245,237,230,.22); pointer-events: none; }
.htzLink { position: relative; z-index: 1; display: grid; grid-template-columns: minmax(0,1fr); gap: 18px; align-items: center; padding: 22px 20px; color: inherit; text-decoration: none; height: 100%; }
.htzLink:focus-visible { outline: 2px solid #ffc37a; outline-offset: -4px; border-radius: 26px; }
.htzBody { display: flex; flex-direction: column; align-items: flex-start; gap: 10px; min-width: 0; }
.htzBadge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 11px; border-radius: 99px; color: #2a0a0e;
  background: linear-gradient(180deg, #ffc37a, #f0862f); box-shadow: 0 0 16px rgba(245,138,53,.45); font: 800 10px/1 'Inter', system-ui, sans-serif; letter-spacing: .14em; text-transform: uppercase; }
.htzTitle { margin: 2px 0 0; color: #fbeee0; font: 600 26px/1.08 'Playfair Display', serif; letter-spacing: -.01em; }
.htzTitle em { color: #ffb45e; font-style: italic; text-shadow: 0 0 18px rgba(245,138,53,.55); }
.htzSub { margin: 0; max-width: 520px; color: rgba(251,238,224,.74); font: 400 13.5px/1.5 'Inter', system-ui, sans-serif; }
.htzPerks { display: flex; flex-wrap: wrap; gap: 6px; margin: 2px 0 4px; padding: 0; list-style: none; }
.htzPerks li { padding: 5px 10px; border-radius: 99px; border: 1px solid rgba(201,168,76,.4); color: #f3dfb9; font: 600 11px/1 'Inter', system-ui, sans-serif; }
.htzGo { display: inline-flex; align-items: center; gap: 7px; padding: 12px 20px; border-radius: 99px; color: #2a0a0e;
  background: linear-gradient(135deg, #f6e3a8, #e9c46a 50%, #c9a84c); font: 800 13.5px/1 'Inter', system-ui, sans-serif;
  box-shadow: 0 10px 24px -10px rgba(233,196,106,.8); transition: transform .2s ease; }
.htzArt { position: relative; height: 150px; }
.htzMoon { position: absolute; right: 10%; top: 4%; width: 54px; height: 54px; border-radius: 50%;
  background: radial-gradient(circle at 38% 38%, #fff6dc, #f3d98f 60%, #c9a84c); box-shadow: 0 0 46px 10px rgba(243,217,143,.3); }
.htzBat { position: absolute; color: #0b0204; animation: htzFlap 3.2s ease-in-out infinite; filter: drop-shadow(0 0 4px rgba(255,170,90,.4)); }
.htzBat.b1 { left: 14%; top: 8%; } .htzBat.b2 { left: 38%; top: 2%; animation-delay: -1.4s; }
@keyframes htzFlap { 0%, 100% { transform: translate(0,0) scaleY(1); } 25% { transform: translate(6px,-6px) scaleY(.5); } 50% { transform: translate(12px,0) scaleY(1); } 75% { transform: translate(6px,5px) scaleY(.5); } }
.htzGhost { position: absolute; left: 4%; bottom: 6%; width: 104px; height: 104px; animation: htzFloat 4.6s ease-in-out infinite; }
@keyframes htzFloat { 0%, 100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-12px) rotate(3deg); } }
.htzPumpkin { position: absolute; right: 2%; bottom: 0; width: 104px; height: 124px; }
.htzSeal { position: absolute; left: 44%; top: 26%; width: 74px; height: 74px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center;
  color: #2a0a0e; background: radial-gradient(circle at 35% 30%, #ffd9a0, #f58a35 50%, #b84a17 100%); transform: rotate(-10deg);
  box-shadow: 0 0 26px rgba(245,138,53,.6), inset 0 2px 0 rgba(255,255,255,.45); animation: htzSeal 2.8s ease-in-out infinite; }
@keyframes htzSeal { 0%, 100% { transform: rotate(-10deg) scale(1); } 50% { transform: rotate(-6deg) scale(1.07); } }
.htzSeal b { font: 700 26px/1 'Playfair Display', serif; } .htzSeal small { font-size: 13px; }
.htzSeal i { font: 800 9px/1 'Inter', system-ui, sans-serif; font-style: normal; letter-spacing: .24em; margin-top: 2px; }
.htzMini { display: none; }
@media (hover: hover) { .htz:hover .htzGo { transform: translateY(-2px); } }
@media (max-width: 767px) {
  .htz { border-radius: 18px; }
  .htzWeb { width: 70px; height: 70px; }
  .htzLink { display: block; padding: 0; }
  .htzBody, .htzArt { display: none; }
  .htzMini { display: flex; align-items: center; gap: 12px; width: 100%; padding: 10px 12px 10px 10px; }
  .htzMiniSeal { flex-shrink: 0; width: 52px; height: 52px; margin: 0 7px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center;
    color: #2a0a0e; background: radial-gradient(circle at 35% 30%, #ffd9a0, #f58a35 50%, #b84a17 100%); transform: rotate(-8deg);
    box-shadow: 0 0 18px rgba(245,138,53,.6), inset 0 1.5px 0 rgba(255,255,255,.45); animation: htzSeal 2.8s ease-in-out infinite; }
  .htzMiniSeal b { font: 700 16px/1 'Playfair Display', serif; }
  .htzMiniSeal i { font: 800 7.5px/1 'Inter', system-ui, sans-serif; font-style: normal; letter-spacing: .2em; margin-top: 2px; }
  .htzMiniText { display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1; }
  .htzMiniKick { display: inline-flex; align-items: center; gap: 4px; color: #ffb45e; font: 800 9.5px/1 'Inter', system-ui, sans-serif; letter-spacing: .18em; text-transform: uppercase; }
  .htzMiniTitle { color: #fbeee0; font: 600 15px/1.2 'Playfair Display', serif; }
  .htzMiniTitle em { color: #e9c46a; font-style: italic; }
  .htzMiniGo { flex-shrink: 0; width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; color: #2a0a0e;
    background: linear-gradient(135deg, #f6e3a8, #c9a84c); box-shadow: 0 6px 14px -6px rgba(233,196,106,.8); }
}
@media (min-width: 768px) {
  .htzLink { grid-template-columns: minmax(0,1.15fr) minmax(0,1fr); gap: 28px; padding: 36px 40px 36px 44px; }
  .htzTitle { font-size: 38px; }
  .htzSub { font-size: 15px; }
  .htzArt { height: 220px; }
  .htzGhost { width: 130px; height: 130px; }
  .htzPumpkin { width: 130px; height: 154px; }
}
@media (min-width: 1024px) {
  .htzLink { grid-template-columns: minmax(0,1.2fr) minmax(0,.8fr); gap: 14px; padding: 30px 26px 30px 32px; }
  .htzTitle { font-size: 29px; }
  .htzSub { font-size: 13.5px; }
  .htzArt { height: 200px; }
  .htzGhost { width: 104px; height: 104px; }
  .htzPumpkin { width: 108px; height: 128px; }
}
@media (prefers-reduced-motion: reduce) {
  .htzGlow::before, .htzBat, .htzGhost, .htzSeal, .htzMiniSeal { animation: none !important; }
}
`;
