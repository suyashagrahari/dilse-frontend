"use client";

// ─── Cobwebs in the corners ──────────────────────────────────────────────────
//
// Halloween mode only. Two big silvery webs flush in the very top corners of
// the page — behind the floating navbar, above the page background — each
// with a spider bobbing on a thread, dew drops that glint, and a second tiny
// spider resting on the right-hand web.
//
//   scope "page"   — the blog: pinned to the top corners of the document
//                    (top: 0), so they frame the navbar and scroll away.
//   scope "parent" — the home hero: fills the nearest positioned ancestor.
//
// Pure inline SVG + CSS: no request, no layout (absolutely positioned,
// pointer-events none). The strands are drawn once under a static glow filter;
// only the dew and the spiders move (opacity/transform), and they stop under
// reduced motion.

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useIsHalloween } from "@/hooks/useSeason";
import { Spider } from "./halloweenArt";

const noop = () => () => {};

// ── the web, drawn once at module load (deterministic, so SSR == client) ──
const r1 = (v: number) => Math.round(v * 10) / 10;
const ANG = [2, 15, 29, 44, 59, 73, 88].map((a) => (a * Math.PI) / 180);
const LEN = [200, 206, 216, 232, 216, 206, 200];
const RINGS = [16, 33, 52, 73, 96, 121, 148, 176];
const pt = (a: number, r: number) => `${r1(Math.cos(a) * r)} ${r1(Math.sin(a) * r)}`;
const SPOKES = ANG.map((a, i) => `M0 0L${pt(a, LEN[i])}`).join("");
const DEW: [number, number, number][] = [];
const RING_D = RINGS.map((r, k) => {
  let d = "";
  for (let i = 0; i < ANG.length - 1; i++) {
    // a few torn gaps in the outer rings so it reads as old and real
    if ((k === 7 && (i === 1 || i === 4)) || (k === 6 && i === 3) || (k === 5 && i === 0)) continue;
    const wob = (n: number) => r + (n % 2 ? 1.6 : -1.6) + (k % 2 ? 0.5 : -0.5);
    const a0 = ANG[i], a1 = ANG[i + 1], am = (a0 + a1) / 2;
    d += `M${pt(a0, wob(i))}Q${pt(am, r * 0.82)} ${pt(a1, wob(i + 1))}`;
    if (k > 1 && (k * 3 + i) % 4 === 1) DEW.push([r1(Math.cos(am) * r * 0.88), r1(Math.sin(am) * r * 0.88), k]);
  }
  return d;
}).join("");
// one loose strand drifting off the outer edge
const LOOSE = `M${pt(ANG[3], 176)}Q${pt(ANG[3] + 0.06, 196)} ${pt(ANG[3] - 0.04, 214)}`;

function SilkWeb() {
  return (
    <svg viewBox="0 0 200 200" className="hwweb-svg" aria-hidden preserveAspectRatio="xMinYMin meet">
      <g className="hwweb-silk" fill="none" strokeLinecap="round">
        <path d={SPOKES} strokeWidth="1.15" />
        <path d={RING_D} strokeWidth=".95" />
        <path d={LOOSE} strokeWidth=".8" opacity=".7" />
      </g>
    </svg>
  );
}

function Dew() {
  return (
    <svg viewBox="0 0 200 200" className="hwweb-dew" aria-hidden preserveAspectRatio="xMinYMin meet">
      {DEW.map(([x, y, k], i) => (
        <circle key={i} cx={x} cy={y} r={k > 4 ? 2.1 : 1.6} style={{ animationDelay: `${-(i * 0.73) % 4}s` }} />
      ))}
    </svg>
  );
}

export default function HalloweenCornerWebs({ scope = "page" }: { scope?: "page" | "parent" }) {
  const on = useIsHalloween();
  // The page layer portals to <body>, which exists only after mount.
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  if (!on) return null;

  const node = (
    <div className={`hwweb hwweb-${scope}`} aria-hidden>
      <style>{HWWEB_CSS}</style>
      <span className="hwweb-c hwweb-l">
        <SilkWeb />
        <Dew />
        <span className="hwweb-hang hwweb-h1"><i /><span className="hwweb-sp"><Spider size={22} /></span></span>
      </span>
      <span className="hwweb-c hwweb-r">
        <SilkWeb />
        <Dew />
        <span className="hwweb-hang hwweb-h2"><i /><span className="hwweb-sp"><Spider size={17} /></span></span>
        <span className="hwweb-rest"><Spider size={12} /></span>
      </span>
    </div>
  );
  if (scope === "page") return mounted ? createPortal(node, document.body) : null;
  return node;
}

const HWWEB_CSS = `
.hwweb { pointer-events: none; }
/* Blog: the very top of the document, under the navbars (z 40/50), over the page. */
.hwweb-page { position: absolute; left: 0; top: 0; width: 100%; height: 0; z-index: 30; }
/* …but the running strip stays readable on top of the strands. */
body:has(.hwweb-page) .hwb-wrap { z-index: 31; }
.hwweb-parent { position: absolute; inset: 0; z-index: 2; overflow: hidden; }
.hwweb-c { position: absolute; top: 0; display: block; width: 250px; height: 250px; --silk: rgba(84,74,122,.56); }
.hwweb-l { left: 0; }
.hwweb-r { right: 0; }
.hwweb-svg, .hwweb-dew { position: absolute; inset: 0; display: block; width: 100%; height: 100%; overflow: visible; }
.hwweb-r .hwweb-svg, .hwweb-r .hwweb-dew { transform: scaleX(-1); }
/* silvery: a dusky violet strand with a moonlit white rim, fading as it leaves the corner */
.hwweb-svg { filter: drop-shadow(0 0 .6px rgba(255,255,255,.95)) drop-shadow(0 0 5px rgba(196,182,240,.45));
  -webkit-mask-image: radial-gradient(circle at 0 0, #000 52%, rgba(0,0,0,.35) 82%, transparent 100%);
          mask-image: radial-gradient(circle at 0 0, #000 52%, rgba(0,0,0,.35) 82%, transparent 100%); }
.hwweb-silk { stroke: var(--silk); }
.hwweb-dew circle { fill: #fff; stroke: rgba(150,136,200,.55); stroke-width: .6; opacity: .55; animation: hwwebDew 4s ease-in-out infinite; }
@keyframes hwwebDew { 0%, 100% { opacity: .35; } 50% { opacity: 1; } }

/* the spiders: a fixed-length thread that stretches (scaleY) while the spider rides its end (translateY) */
.hwweb-hang { position: absolute; width: 0; height: 0; transform-origin: 50% 0; animation: hwwebSway 4.6s ease-in-out infinite; }
.hwweb-hang i { position: absolute; left: -.5px; top: 0; width: 1px; height: var(--L); transform-origin: 50% 0;
  background: linear-gradient(180deg, rgba(84,74,122,.15), rgba(84,74,122,.7));
  box-shadow: 0 0 2px rgba(255,255,255,.9); animation: hwwebThread 4.6s ease-in-out infinite; }
.hwweb-sp { position: absolute; left: 0; top: var(--L); display: block; transform: translate(-50%, -4px); color: #1d1530; animation: hwwebRide 4.6s ease-in-out infinite; }
.hwweb-sp svg { display: block; filter: drop-shadow(0 3px 4px rgba(23,19,42,.35)); }
.hwweb-h1 { left: 31%; top: 31%; --L: 92px; }
.hwweb-h2 { right: 47%; top: 21%; --L: 64px; animation-delay: -2.1s; }
.hwweb-h2 i, .hwweb-h2 .hwweb-sp { animation-delay: -2.1s; }
@keyframes hwwebSway { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
@keyframes hwwebThread { 0%, 100% { transform: scaleY(.42); } 50% { transform: scaleY(1); } }
@keyframes hwwebRide { 0%, 100% { transform: translate(-50%, calc(-4px - var(--L) * .58)); } 50% { transform: translate(-50%, -4px); } }
.hwweb-rest { position: absolute; right: 14%; top: 9%; color: #2a2140; transform: rotate(-38deg); animation: hwwebTwitch 6s ease-in-out infinite; }
.hwweb-rest svg { display: block; }
@keyframes hwwebTwitch { 0%, 82%, 100% { transform: rotate(-38deg) translate(0, 0); } 86% { transform: rotate(-30deg) translate(-3px, 2px); } 92% { transform: rotate(-40deg) translate(-5px, 3px); } }

@media (max-width: 1023px) {
  .hwweb-c { width: 190px; height: 190px; }
  .hwweb-h1 { --L: 70px; }
  .hwweb-h2 { --L: 48px; }
}
@media (max-width: 768px) {
  .hwweb-c { width: 142px; height: 142px; --silk: rgba(84,74,122,.46); }
  /* the left spider hangs just beside the brand pill, above the running strip */
  .hwweb-h1 { left: 22%; top: 16%; --L: 34px; }
  .hwweb-h2 { --L: 34px; }
  .hwweb-sp svg { width: 16px; height: 16px; }
  .hwweb-h2 .hwweb-sp svg { width: 13px; height: 13px; }
  .hwweb-rest svg { width: 10px; height: 10px; }
}
@media (prefers-reduced-motion: reduce) {
  .hwweb-hang, .hwweb-hang i, .hwweb-sp, .hwweb-rest, .hwweb-dew circle { animation: none !important; }
}
`;

/**
 * The home hero's Halloween night: a butter moon with its glow behind the
 * showcase, a lilac haze, drifting fog along the bottom, glowing orbs and the
 * corner webs. Decoration only — absolutely positioned behind the hero's
 * content (z 0), pointer-events none, CSS only, so LCP and layout are untouched.
 */
export function HalloweenHeroNight() {
  const on = useIsHalloween();
  if (!on) return null;
  return (
    <>
      <div className="hwhero" aria-hidden>
        <style>{HWHERO_CSS}</style>
        <span className="hwhero-haze" />
        <span className="hwhero-moon" />
        <span className="hwhero-orb hwhero-o1" />
        <span className="hwhero-orb hwhero-o2" />
        <span className="hwhero-orb hwhero-o3" />
        <span className="hwhero-fog hwhero-f1" />
        <span className="hwhero-fog hwhero-f2" />
      </div>
      {/* The webs hang from the very top of the page, above the strip and the hero. */}
      <HalloweenCornerWebs scope="page" />
    </>
  );
}

const HWHERO_CSS = `
/* The home page's floral top corners (CornerOrnaments) give way to the webs. */
body:has(.hwhero) [data-corner-top] { display: none; }
.hwhero { position: absolute; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; }
.hwhero-haze { position: absolute; inset: 0;
  background: radial-gradient(60% 55% at 82% 18%, rgba(185,166,240,.22), transparent 70%),
    radial-gradient(50% 45% at 10% 95%, rgba(90,74,124,.14), transparent 70%); }
.hwhero-moon { position: absolute; top: 160px; right: 4%; width: 132px; height: 132px; border-radius: 50%; opacity: .75;
  background: radial-gradient(circle at 38% 36%, #fffbea 0%, #fff0c4 38%, #f6e7a6 66%, #e6c373 100%);
  box-shadow: 0 0 80px 30px rgba(246,231,166,.35), 0 0 160px 60px rgba(185,166,240,.18); animation: hwheroMoon 6s ease-in-out infinite; }
@keyframes hwheroMoon { 50% { box-shadow: 0 0 96px 36px rgba(246,231,166,.45), 0 0 180px 70px rgba(185,166,240,.22); } }
.hwhero-orb { position: absolute; width: 9px; height: 9px; border-radius: 50%; background: rgba(185,166,240,.7); box-shadow: 0 0 14px 6px rgba(185,166,240,.35);
  animation: hwheroOrb 8s ease-in-out infinite; }
.hwhero-o1 { left: 6%; top: 34%; }
.hwhero-o2 { left: 46%; top: 16%; width: 6px; height: 6px; animation-delay: -3s; background: rgba(255,195,90,.7); box-shadow: 0 0 12px 5px rgba(255,195,90,.3); }
.hwhero-o3 { right: 4%; bottom: 22%; animation-delay: -5s; }
@keyframes hwheroOrb { 0%, 100% { transform: translate(0,0); opacity: .45; } 50% { transform: translate(10px,-16px); opacity: 1; } }
.hwhero-fog { position: absolute; left: -20%; width: 140%; height: 150px; bottom: -40px; filter: blur(14px); will-change: transform;
  background: radial-gradient(30% 60% at 25% 60%, rgba(185,166,240,.32), transparent 70%), radial-gradient(28% 55% at 70% 65%, rgba(185,166,240,.26), transparent 70%); }
.hwhero-f1 { animation: hwheroFog 18s ease-in-out infinite alternate; }
.hwhero-f2 { bottom: -60px; opacity: .8; animation: hwheroFog 24s ease-in-out -8s infinite alternate-reverse; }
@keyframes hwheroFog { from { transform: translateX(-6%); } to { transform: translateX(6%); } }
@media (max-width: 768px) {
  .hwhero-moon { top: 150px; right: -26px; width: 84px; height: 84px; opacity: .6; }
  .hwhero-fog { height: 110px; }
}
@media (prefers-reduced-motion: reduce) { .hwhero-moon, .hwhero-orb, .hwhero-fog { animation: none !important; } }
`;
