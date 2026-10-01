"use client";

// The gallery's invitation to the Valentine's week wishlist. It sits beside
// the Premium teaser and mirrors its shape — a full card on tablets and up, one
// slim row on phones — so the pair reads as a set. Joining happens on the
// wishlist page; this card only reflects whether the user already has.

import Link from "next/link";
import { ArrowRight, Check, Heart } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import { VALENTINE_CAMPAIGN, VALENTINE_DISCOUNT, VALENTINE_PATH } from "@/lib/wishlist/valentine";

const FLOAT = [
  { l: 8, t: 62, s: 22, d: 0 }, { l: 26, t: 18, s: 14, d: 1.2 }, { l: 74, t: 14, s: 18, d: 0.6 },
  { l: 88, t: 58, s: 13, d: 1.8 }, { l: 60, t: 78, s: 16, d: 2.4 }, { l: 16, t: 30, s: 11, d: 3 },
];

export default function ValentineTeaser() {
  const { status } = useWishlist(VALENTINE_CAMPAIGN);
  const joined = status === "joined";
  return (
    <section className="vtz" aria-label="Valentine's week wishlist">
      <span className="vtzSheen" aria-hidden />
      <Link href={VALENTINE_PATH} className="vtzLink" aria-label={joined ? "You're on the Valentine's week wishlist" : `Join the Valentine's week wishlist and get ${VALENTINE_DISCOUNT}% off`}>
        <div className="vtzBody">
          <span className="vtzBadge"><Heart size={12} fill="currentColor" aria-hidden /> Valentine&apos;s Week · Wishlist</span>
          <h2 className="vtzTitle">Coming this February, <em>{VALENTINE_DISCOUNT}% off for you.</em></h2>
          <p className="vtzSub">Eight new templates, Rose Day to Valentine&apos;s Day. Join the wishlist and the offer is saved to your account.</p>
          <ul className="vtzPerks" aria-label="Included">
            <li>🌹 8 days, 8 templates</li><li>First to know</li><li>{VALENTINE_DISCOUNT}% off saved</li>
          </ul>
          <span className={`vtzGo${joined ? " is-on" : ""}`}>
            {joined ? <><Check size={15} strokeWidth={3} aria-hidden /> You&apos;re on the list</> : <>Join the wishlist <ArrowRight size={15} aria-hidden /></>}
          </span>
        </div>
        <div className="vtzArt" aria-hidden>
          {FLOAT.map((f, i) => (
            <span key={i} className="vtzFloat" style={{ left: `${f.l}%`, top: `${f.t}%`, fontSize: f.s, animationDelay: `${f.d}s` }}>♥</span>
          ))}
          <span className="vtzEnv">💌</span>
          <span className="vtzSeal"><b>{VALENTINE_DISCOUNT}<small>%</small></b><i>OFF</i></span>
        </div>

        {/* Phones: one slim row. */}
        <span className="vtzMini">
          <span className="vtzMiniSeal"><b>{VALENTINE_DISCOUNT}%</b><i>OFF</i></span>
          <span className="vtzMiniText">
            <span className="vtzMiniKick"><Heart size={10} fill="currentColor" aria-hidden /> Valentine wishlist</span>
            <span className="vtzMiniTitle">{joined ? <>You&apos;re <em>on the list</em></> : <>Join early, <em>save {VALENTINE_DISCOUNT}%</em></>}</span>
          </span>
          <span className={`vtzMiniGo${joined ? " is-on" : ""}`}>{joined ? <Check size={16} strokeWidth={3} /> : <Heart size={15} fill="currentColor" />}</span>
        </span>
      </Link>
    </section>
  );
}

export const VALENTINE_TEASER_CSS = `
/* ── the pair of invitations above the grid ─────────────────────────────── */
.txDuo { display: grid; grid-template-columns: minmax(0,1fr); gap: 10px; margin: 0 auto 22px; }
.txDuo .pxTz { margin: 0; }
@media (min-width: 768px) { .txDuo { gap: 16px; margin-bottom: 30px; } }
@media (min-width: 1024px) {
  .txDuo { grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 18px; align-items: stretch; }
  .txDuo .pxTz { grid-template-columns: minmax(0,1.2fr) minmax(0,.8fr); gap: 14px; padding: 30px 26px 0 32px; border-radius: 26px; }
  .txDuo .pxTzBody { padding-bottom: 30px; }
  .txDuo .pxTzTitle { font-size: 29px; }
  .txDuo .pxTzSub { font-size: 13.5px; }
  .txDuo .pxTzFan { height: 200px; }
  .txDuo .pxTzCard { width: 40%; }
  .txDuo .pxTzCard.c0 { left: 0; } .txDuo .pxTzCard.c1 { left: 30%; } .txDuo .pxTzCard.c2 { right: 0; }
}

/* ── the Valentine card ─────────────────────────────────────────────────── */
.vtz { position: relative; isolation: isolate; overflow: hidden; border-radius: 26px;
  background: radial-gradient(120% 140% at 0% 0%, #c42d4c 0%, #8a1430 45%, #4a0d1c 100%);
  border: 1px solid rgba(255,190,180,.4); box-shadow: 0 24px 50px -28px rgba(138,20,48,.75), inset 0 1px 0 rgba(255,220,214,.18); }
.vtzSheen { position: absolute; inset: 0; z-index: -1; pointer-events: none; overflow: hidden; }
.vtzSheen::before { content: ""; position: absolute; top: -30%; bottom: -30%; width: 28%; left: -40%; transform: skewX(-18deg);
  background: linear-gradient(90deg, transparent, rgba(255,226,220,.16), transparent); animation: vtzSweep 6s ease-in-out 1.5s infinite; }
@keyframes vtzSweep { 0%, 55% { left: -40%; } 90%, 100% { left: 130%; } }
.vtzLink { position: relative; z-index: 1; display: grid; grid-template-columns: minmax(0,1fr); gap: 18px; align-items: center; padding: 22px 20px; color: inherit; text-decoration: none; height: 100%; }
.vtzLink:focus-visible { outline: 2px solid #f6d58a; outline-offset: -4px; border-radius: 26px; }
.vtzBody { display: flex; flex-direction: column; align-items: flex-start; gap: 10px; min-width: 0; }
.vtzBadge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 11px; border-radius: 99px; color: #7a1028;
  background: linear-gradient(135deg, #fff4f1, #ffd6ce); font: 800 10px/1 'Inter', system-ui, sans-serif; letter-spacing: .14em; text-transform: uppercase; }
.vtzTitle { margin: 2px 0 0; color: #fff4f1; font: 600 26px/1.08 'Playfair Display', serif; letter-spacing: -.01em; }
.vtzTitle em { color: #f6d58a; font-style: italic; }
.vtzSub { margin: 0; max-width: 520px; color: rgba(255,236,232,.75); font: 400 13.5px/1.5 'Inter', system-ui, sans-serif; }
.vtzPerks { display: flex; flex-wrap: wrap; gap: 6px; margin: 2px 0 4px; padding: 0; list-style: none; }
.vtzPerks li { padding: 5px 10px; border-radius: 99px; border: 1px solid rgba(255,200,190,.35); color: #ffe1db; font: 600 11px/1 'Inter', system-ui, sans-serif; }
.vtzGo { display: inline-flex; align-items: center; gap: 7px; padding: 12px 20px; border-radius: 99px; color: #3d0c11;
  background: linear-gradient(135deg, #fff1c9, #f0cd7c 50%, #c99a45); font: 800 13.5px/1 'Inter', system-ui, sans-serif;
  box-shadow: 0 10px 24px -10px rgba(246,213,138,.8); transition: transform .2s ease; }
.vtzGo.is-on { background: rgba(255,240,236,.14); color: #fff4f1; box-shadow: inset 0 0 0 1.5px rgba(255,214,206,.5); }
.vtzArt { position: relative; height: 150px; }
.vtzFloat { position: absolute; color: rgba(255,170,185,.55); animation: vtzBob 4.5s ease-in-out infinite; will-change: transform; }
@keyframes vtzBob { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-12px) scale(1.12); } }
.vtzEnv { position: absolute; left: 50%; top: 50%; font-size: 76px; line-height: 1; transform: translate(-60%, -50%) rotate(-10deg);
  filter: drop-shadow(0 16px 20px rgba(0,0,0,.4)); animation: vtzEnvF 5s ease-in-out infinite; }
@keyframes vtzEnvF { 0%, 100% { transform: translate(-60%, -50%) rotate(-10deg); } 50% { transform: translate(-60%, -58%) rotate(-6deg); } }
.vtzSeal { position: absolute; left: 58%; top: 18%; width: 74px; height: 74px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center;
  color: #3d0c11; background: radial-gradient(circle at 35% 30%, #fff1c9, #f0cd7c 45%, #b8893a 100%); transform: rotate(12deg);
  box-shadow: 0 12px 24px -10px rgba(0,0,0,.6), inset 0 2px 0 rgba(255,255,255,.6); }
.vtzSeal b { font: 700 26px/1 'Playfair Display', serif; } .vtzSeal small { font-size: 13px; }
.vtzSeal i { font: 800 9px/1 'Inter', system-ui, sans-serif; font-style: normal; letter-spacing: .24em; margin-top: 2px; }
.vtzMini { display: none; }
@media (hover: hover) {
  .vtz:hover .vtzGo:not(.is-on) { transform: translateY(-2px); }
}
@media (max-width: 767px) {
  .vtz { border-radius: 18px; }
  .vtzLink { display: block; padding: 0; }
  .vtzBody, .vtzArt { display: none; }
  .vtzMini { display: flex; align-items: center; gap: 12px; width: 100%; padding: 10px 12px 10px 10px; }
  .vtzMiniSeal { flex-shrink: 0; width: 52px; height: 52px; margin: 0 7px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center;
    color: #3d0c11; background: radial-gradient(circle at 35% 30%, #fff1c9, #f0cd7c 45%, #b8893a 100%); transform: rotate(-8deg);
    box-shadow: 0 6px 14px -6px rgba(0,0,0,.6), inset 0 1.5px 0 rgba(255,255,255,.6); animation: vtzBeat 2.4s ease-in-out infinite; }
  @keyframes vtzBeat { 0%, 100% { transform: rotate(-8deg) scale(1); } 12% { transform: rotate(-8deg) scale(1.1); } 24% { transform: rotate(-8deg) scale(1); } 36% { transform: rotate(-8deg) scale(1.06); } 48% { transform: rotate(-8deg) scale(1); } }
  .vtzMiniSeal b { font: 700 16px/1 'Playfair Display', serif; }
  .vtzMiniSeal i { font: 800 7.5px/1 'Inter', system-ui, sans-serif; font-style: normal; letter-spacing: .2em; margin-top: 2px; }
  .vtzMiniText { display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1; }
  .vtzMiniKick { display: inline-flex; align-items: center; gap: 4px; color: #ffc9c0; font: 800 9.5px/1 'Inter', system-ui, sans-serif; letter-spacing: .18em; text-transform: uppercase; }
  .vtzMiniTitle { color: #fff4f1; font: 600 15px/1.2 'Playfair Display', serif; }
  .vtzMiniTitle em { color: #f6d58a; font-style: italic; }
  .vtzMiniGo { flex-shrink: 0; width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; color: #8a1430;
    background: linear-gradient(135deg, #fff4f1, #ffd6ce); box-shadow: 0 6px 14px -6px rgba(255,180,170,.8); }
  .vtzMiniGo.is-on { color: #fff4f1; background: rgba(255,240,236,.16); box-shadow: inset 0 0 0 1.5px rgba(255,214,206,.5); }
}
@media (min-width: 768px) {
  .vtzLink { grid-template-columns: minmax(0,1.15fr) minmax(0,1fr); gap: 28px; padding: 36px 40px 36px 44px; }
  .vtzTitle { font-size: 38px; }
  .vtzSub { font-size: 15px; }
  .vtzArt { height: 220px; }
}
@media (min-width: 1024px) {
  .vtz { border-radius: 26px; }
  .vtzLink { grid-template-columns: minmax(0,1.2fr) minmax(0,.8fr); gap: 14px; padding: 30px 26px 30px 32px; }
  .vtzTitle { font-size: 29px; }
  .vtzSub { font-size: 13.5px; }
  .vtzArt { height: 200px; }
}
@media (prefers-reduced-motion: reduce) {
  .vtzSheen::before, .vtzFloat, .vtzEnv, .vtzMiniSeal { animation: none !important; }
}
`;
