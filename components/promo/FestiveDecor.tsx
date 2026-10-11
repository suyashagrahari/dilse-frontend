"use client";

// ─── Festive corners and the hero's festival evening ─────────────────────────
//
// Festive mode only — the Navratri & Diwali twin of HalloweenCornerWebs.tsx.
//
// FestiveCorners: marigold garlands (genda-phool torans) swagged across the
// very top corners of the page, mango leaves between the flowers, and little
// clay diyas hanging from each garland on gold threads, swaying, their flames
// flickering. Flush in the corners, behind the floating navbar.
//   scope "page"   — the blog: pinned to the top corners of the document.
//   scope "parent" — fills the nearest positioned ancestor.
//
// FestiveHeroNight: the home hero's warm evening — a marigold haze, a string
// of fairy lights, glowing diya orbs and a faint rangoli behind the showcase,
// plus the corner garlands. No moon: Diwali is the new-moon night.
//
// Pure inline SVG + CSS: no request, no layout (absolutely positioned,
// pointer-events none); only transforms/opacity animate, off under reduced
// motion.

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useIsFestive } from "@/hooks/useSeason";
import { Diya, Rangoli } from "./festiveArt";

const noop = () => () => {};
const r1 = (v: number) => Math.round(v * 10) / 10;

// ── the garland, computed once (deterministic, so SSR == client) ──
// A quadratic swag from the top edge (A) to the left edge (B), drooping toward
// the inner corner. Flowers sit along it; leaves hang between every few.
const A = { x: 236, y: -4 };
const B = { x: -4, y: 196 };
const C = { x: 128, y: 118 };
const at = (t: number) => ({
  x: (1 - t) * (1 - t) * A.x + 2 * (1 - t) * t * C.x + t * t * B.x,
  y: (1 - t) * (1 - t) * A.y + 2 * (1 - t) * t * C.y + t * t * B.y,
});
const N = 17;
const FLOWERS = Array.from({ length: N }, (_, i) => {
  const p = at(i / (N - 1));
  return { x: r1(p.x), y: r1(p.y), big: i % 2 === 0, deep: i % 3 === 0 };
});
const LEAVES = FLOWERS.filter((_, i) => i % 3 === 1);
// the inner, shorter strand
const A2 = { x: 150, y: -4 };
const B2 = { x: -4, y: 118 };
const C2 = { x: 70, y: 66 };
const at2 = (t: number) => ({
  x: (1 - t) * (1 - t) * A2.x + 2 * (1 - t) * t * C2.x + t * t * B2.x,
  y: (1 - t) * (1 - t) * A2.y + 2 * (1 - t) * t * C2.y + t * t * B2.y,
});
const FLOWERS2 = Array.from({ length: 11 }, (_, i) => {
  const p = at2(i / 10);
  return { x: r1(p.x), y: r1(p.y), rose: i % 2 === 1 };
});
const SWAG = `M${A.x} ${A.y}Q${C.x} ${C.y} ${B.x} ${B.y}`;
const SWAG2 = `M${A2.x} ${A2.y}Q${C2.x} ${C2.y} ${B2.x} ${B2.y}`;

function Garland() {
  return (
    <svg viewBox="0 0 240 240" className="fvc-svg" aria-hidden preserveAspectRatio="xMinYMin meet">
      <path d={SWAG2} stroke="#b77a12" strokeWidth="1.2" fill="none" />
      {FLOWERS2.map((f, i) => (
        <g key={`s${i}`}>
          <circle cx={f.x} cy={f.y} r="5.6" fill={f.rose ? "#ff5d8f" : "#ffcf3a"} />
          <circle cx={f.x} cy={f.y} r="2.2" fill={f.rose ? "#c42a5c" : "#e8820c"} />
        </g>
      ))}
      <path d={SWAG} stroke="#9c6210" strokeWidth="1.4" fill="none" />
      {LEAVES.map((f, i) => (
        <path key={`l${i}`} d={`M${f.x} ${f.y + 4}q-5 9 0 18q5-9 0-18z`} fill={i % 2 ? "#2f8a45" : "#3fa257"} />
      ))}
      {FLOWERS.map((f, i) => (
        <g key={i}>
          <circle cx={f.x} cy={f.y} r={f.big ? 9 : 7.4} fill={f.deep ? "#f07c0a" : "#ffb020"} />
          <circle cx={f.x} cy={f.y} r={f.big ? 9 : 7.4} fill="none" stroke="#c45e06" strokeWidth=".8" strokeDasharray="2 2.4" opacity=".7" />
          <circle cx={f.x} cy={f.y} r={f.big ? 3.4 : 2.8} fill={f.deep ? "#ffcf3a" : "#e8820c"} />
        </g>
      ))}
    </svg>
  );
}

export default function FestiveCorners({ scope = "page" }: { scope?: "page" | "parent" }) {
  const on = useIsFestive();
  // The page layer portals to <body>, which exists only after mount.
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  if (!on) return null;

  const node = (
    <div className={`fvc fvc-${scope}`} aria-hidden>
      <style>{FVC_CSS}</style>
      {(["l", "r"] as const).map((side) => (
        <span key={side} className={`fvc-c fvc-${side}`}>
          <Garland />
          <span className="fvc-hang fvc-h1"><i /><span className="fvc-diya"><Diya size={26} /></span></span>
          <span className="fvc-hang fvc-h2"><i /><span className="fvc-diya"><Diya size={20} /></span></span>
        </span>
      ))}
    </div>
  );
  if (scope === "page") return mounted ? createPortal(node, document.body) : null;
  return node;
}

const FVC_CSS = `
.fvc { pointer-events: none; }
.fvc-page { position: absolute; left: 0; top: 0; width: 100%; height: 0; z-index: 30; }
/* the running strip stays readable on top of the garlands */
body:has(.fvc-page) .fsb-wrap { z-index: 31; }
.fvc-parent { position: absolute; inset: 0; z-index: 2; overflow: hidden; }
.fvc-c { position: absolute; top: 0; display: block; width: 240px; height: 240px; }
.fvc-l { left: 0; }
.fvc-r { right: 0; transform: scaleX(-1); }
.fvc-svg { position: absolute; inset: 0; display: block; width: 100%; height: 100%; overflow: visible;
  filter: drop-shadow(0 3px 4px rgba(120,60,0,.28)); }
/* diyas hanging from the garland: a gold thread that sways, the diya riding its end */
.fvc-hang { position: absolute; width: 0; height: 0; transform-origin: 50% 0; animation: fvcSway 4.4s ease-in-out infinite; }
.fvc-hang i { position: absolute; left: -.5px; top: 0; width: 1px; height: var(--L); background: linear-gradient(180deg, rgba(183,122,18,.4), #d9a632); }
.fvc-diya { position: absolute; left: 0; top: var(--L); transform: translate(-50%, -2px); display: block; }
.fvc-diya svg { display: block; filter: drop-shadow(0 0 8px rgba(255,196,77,.85)); }
.fvc-diya .fv-flame { animation: fvcFlick 1.2s ease-in-out infinite alternate; transform-box: fill-box; transform-origin: 50% 100%; }
.fvc-h1 { left: 53.3%; top: 49%; --L: 46px; }
.fvc-h2 { left: 30%; top: 27%; --L: 30px; animation-delay: -1.9s; animation-duration: 3.8s; }
.fvc-r .fvc-h1 { animation-delay: -1.1s; }
@keyframes fvcSway { 0%, 100% { transform: rotate(-6deg); } 50% { transform: rotate(6deg); } }
@keyframes fvcFlick { from { transform: scale(1, 1) rotate(-4deg); } to { transform: scale(.88, 1.12) rotate(4deg); } }
@media (max-width: 1023px) {
  .fvc-c { width: 180px; height: 180px; }
  .fvc-h1 { --L: 32px; }
  .fvc-h2 { --L: 20px; }
}
@media (max-width: 768px) {
  .fvc-c { width: 128px; height: 128px; }
  .fvc-h1 { --L: 20px; }
  .fvc-h1 .fvc-diya svg { width: 18px; height: 18px; }
  .fvc-h2 { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .fvc-hang, .fvc-diya .fv-flame { animation: none !important; }
}
`;

/**
 * The home hero's festival evening: a marigold haze, a string of fairy lights
 * across the top, glowing diya orbs, a faint rangoli behind the showcase and
 * the corner garlands. Decoration only — absolutely positioned behind the
 * hero's content (z 0), pointer-events none, CSS only.
 */
export function FestiveHeroNight() {
  const on = useIsFestive();
  if (!on) return null;
  return (
    <>
      <div className="fvhero" aria-hidden>
        <style>{FVHERO_CSS}</style>
        <span className="fvhero-haze" />
        <span className="fvhero-lights">
          {Array.from({ length: 22 }, (_, i) => (
            <i key={i} style={{ left: `${(i + 0.5) * (100 / 22)}%`, top: `${Math.round(Math.sin(((i % 11) / 10) * Math.PI) * 22)}px`, animationDelay: `${-(i % 5) * 0.4}s` }} />
          ))}
        </span>
        <span className="fvhero-rangoli"><Rangoli size={320} /></span>
        <span className="fvhero-orb fvhero-o1" />
        <span className="fvhero-orb fvhero-o2" />
        <span className="fvhero-orb fvhero-o3" />
        <span className="fvhero-orb fvhero-o4" />
      </div>
      {/* The garlands hang from the very top of the page, above the strip and the hero. */}
      <FestiveCorners scope="page" />
    </>
  );
}

const FVHERO_CSS = `
/* The home page's floral top corners (CornerOrnaments) give way to the garlands. */
body:has(.fvhero) [data-corner-top] { display: none; }
.fvhero { position: absolute; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; }
.fvhero-haze { position: absolute; inset: 0;
  background: radial-gradient(55% 50% at 80% 30%, rgba(255,176,32,.20), transparent 70%),
    radial-gradient(45% 40% at 8% 92%, rgba(255,93,143,.10), transparent 70%),
    radial-gradient(40% 35% at 50% 0%, rgba(35,42,102,.10), transparent 70%); }
/* fairy lights drooping across the top, just under the strip */
.fvhero-lights { position: absolute; left: 3%; right: 3%; top: 132px; height: 40px; }
.fvhero-lights i { position: absolute; width: 7px; height: 9px; border-radius: 50% 50% 45% 45%; transform: translateX(-50%);
  background: #ffd36b; box-shadow: 0 0 10px 3px rgba(255,196,77,.55); animation: fvheroBulb 2s ease-in-out infinite alternate; }
.fvhero-lights i:nth-child(3n+1) { background: #ff8fb1; box-shadow: 0 0 10px 3px rgba(255,93,143,.45); }
.fvhero-lights i:nth-child(3n+2) { background: #7fe6da; box-shadow: 0 0 10px 3px rgba(47,211,192,.45); }
@keyframes fvheroBulb { from { opacity: .45; } to { opacity: 1; } }
.fvhero-rangoli { position: absolute; right: 3%; bottom: -70px; opacity: .13; animation: fvheroSpin 90s linear infinite; }
.fvhero-rangoli svg { display: block; }
@keyframes fvheroSpin { to { transform: rotate(360deg); } }
.fvhero-orb { position: absolute; width: 9px; height: 9px; border-radius: 50%; background: rgba(255,196,77,.85); box-shadow: 0 0 16px 7px rgba(255,176,32,.4);
  animation: fvheroOrb 7s ease-in-out infinite; }
.fvhero-o1 { left: 6%; top: 36%; }
.fvhero-o2 { left: 47%; top: 22%; width: 6px; height: 6px; animation-delay: -2s; background: rgba(255,93,143,.8); box-shadow: 0 0 12px 5px rgba(255,93,143,.35); }
.fvhero-o3 { right: 5%; top: 30%; animation-delay: -4s; }
.fvhero-o4 { left: 30%; bottom: 14%; width: 7px; height: 7px; animation-delay: -5s; background: rgba(47,211,192,.8); box-shadow: 0 0 12px 5px rgba(47,211,192,.3); }
@keyframes fvheroOrb { 0%, 100% { transform: translate(0,0); opacity: .45; } 50% { transform: translate(10px,-16px); opacity: 1; } }
@media (max-width: 768px) {
  /* phones: the hero's top band is the strip, so the lights would float over the headline */
  .fvhero-lights { display: none; }
  .fvhero-rangoli { right: -60px; bottom: auto; top: 46%; }
}
@media (prefers-reduced-motion: reduce) { .fvhero-lights i, .fvhero-rangoli, .fvhero-orb { animation: none !important; } }
`;
