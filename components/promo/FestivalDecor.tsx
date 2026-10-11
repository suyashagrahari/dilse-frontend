"use client";

// ─── Festival corners and the hero's festival wash ───────────────────────────
//
// The Navratri/Diwali twin of HalloweenCornerWebs.tsx — one per festival, and
// they look nothing alike:
//
// FestivalCorners kind="dandiya": mirror-work torans swagged across the very
//   top corners — mirror discs, rani-pink and peacock pom-poms and marigolds on
//   a gold cord — with a pair of lacquered dandiya sticks and a mirror tassel
//   hanging from each, swinging.
// FestivalCorners kind="diwali": marigold garlands (genda-phool torans) with
//   mango leaves, and little clay diyas hanging from each on gold threads,
//   swaying, their flames flickering.
//   scope "page"   — the blog: pinned to the top corners of the document.
//   scope "parent" — fills the nearest positioned ancestor.
//
// FestivalHeroNight: the home hero's wash in the festival's red.
//   dandiya — a kumkum/rani-pink blush from the edges, a bandhani dot field, a
//             giant mirror mandala turning behind the showcase, mirror glints.
//   diwali  — a maroon-gold glow, a string of fairy lights across the top,
//             glowing diya orbs and a faint rangoli. No moon: Diwali is the
//             new-moon night.
//
// Pure inline SVG + CSS: no request, no layout (absolutely positioned,
// pointer-events none); only transforms/opacity animate, off under reduced
// motion.

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useFestival } from "@/hooks/useSeason";
import type { FestivalId } from "@/lib/season";
import { Dandiya, Diya, Mirror, Rangoli } from "./festivalArt";

const noop = () => () => {};
const r1 = (v: number) => Math.round(v * 10) / 10;

// ── the swag, computed once (deterministic, so SSR == client) ──
// A quadratic swag from the top edge (A) to the left edge (B), drooping toward
// the inner corner. Beads sit along it; leaves/pom-poms hang between.
const A = { x: 236, y: -4 };
const B = { x: -4, y: 196 };
const C = { x: 128, y: 118 };
const at = (t: number) => ({
  x: (1 - t) * (1 - t) * A.x + 2 * (1 - t) * t * C.x + t * t * B.x,
  y: (1 - t) * (1 - t) * A.y + 2 * (1 - t) * t * C.y + t * t * B.y,
});
const N = 17;
const BEADS = Array.from({ length: N }, (_, i) => {
  const p = at(i / (N - 1));
  return { x: r1(p.x), y: r1(p.y), big: i % 2 === 0, deep: i % 3 === 0, i };
});
const LEAVES = BEADS.filter((_, i) => i % 3 === 1);
// the inner, shorter strand
const A2 = { x: 150, y: -4 };
const B2 = { x: -4, y: 118 };
const C2 = { x: 70, y: 66 };
const at2 = (t: number) => ({
  x: (1 - t) * (1 - t) * A2.x + 2 * (1 - t) * t * C2.x + t * t * B2.x,
  y: (1 - t) * (1 - t) * A2.y + 2 * (1 - t) * t * C2.y + t * t * B2.y,
});
const BEADS2 = Array.from({ length: 11 }, (_, i) => {
  const p = at2(i / 10);
  return { x: r1(p.x), y: r1(p.y), rose: i % 2 === 1 };
});
const SWAG = `M${A.x} ${A.y}Q${C.x} ${C.y} ${B.x} ${B.y}`;
const SWAG2 = `M${A2.x} ${A2.y}Q${C2.x} ${C2.y} ${B2.x} ${B2.y}`;

/** Diwali: the marigold garland. */
function Garland() {
  return (
    <svg viewBox="0 0 240 240" className="fvc-svg" aria-hidden preserveAspectRatio="xMinYMin meet">
      <path d={SWAG2} stroke="#b77a12" strokeWidth="1.2" fill="none" />
      {BEADS2.map((f, i) => (
        <g key={`s${i}`}>
          <circle cx={f.x} cy={f.y} r="5.6" fill={f.rose ? "#e2343c" : "#ffcf3a"} />
          <circle cx={f.x} cy={f.y} r="2.2" fill={f.rose ? "#8f1416" : "#e8820c"} />
        </g>
      ))}
      <path d={SWAG} stroke="#9c6210" strokeWidth="1.4" fill="none" />
      {LEAVES.map((f, i) => (
        <path key={`l${i}`} d={`M${f.x} ${f.y + 4}q-5 9 0 18q5-9 0-18z`} fill={i % 2 ? "#2f8a45" : "#3fa257"} />
      ))}
      {BEADS.map((f, i) => (
        <g key={i}>
          <circle cx={f.x} cy={f.y} r={f.big ? 9 : 7.4} fill={f.deep ? "#f07c0a" : "#ffb020"} />
          <circle cx={f.x} cy={f.y} r={f.big ? 9 : 7.4} fill="none" stroke="#c45e06" strokeWidth=".8" strokeDasharray="2 2.4" opacity=".7" />
          <circle cx={f.x} cy={f.y} r={f.big ? 3.4 : 2.8} fill={f.deep ? "#ffcf3a" : "#e8820c"} />
        </g>
      ))}
    </svg>
  );
}

/** Dandiya: a mirror-work toran — mirror discs, pom-poms and marigolds on a gold cord. */
function MirrorToran() {
  return (
    <svg viewBox="0 0 240 240" className="fvc-svg" aria-hidden preserveAspectRatio="xMinYMin meet">
      <defs>
        <radialGradient id="fvc-mir" cx="38%" cy="34%" r="70%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".5" stopColor="#dfe6ef" />
          <stop offset="1" stopColor="#8f9cad" />
        </radialGradient>
      </defs>
      <path d={SWAG2} stroke="#d4a537" strokeWidth="1.6" fill="none" />
      {BEADS2.map((f, i) => (
        <circle key={`s${i}`} cx={f.x} cy={f.y} r="4.8" fill={f.rose ? "#ff3d9a" : "#12b5a6"} />
      ))}
      <path d={SWAG} stroke="#d4a537" strokeWidth="2.2" fill="none" />
      <path d={SWAG} stroke="#7a0f12" strokeWidth="1" strokeDasharray="2 3" fill="none" />
      {LEAVES.map((f, i) => (
        <g key={`t${i}`}>
          <path d={`M${f.x} ${f.y + 6}v10`} stroke="#d4a537" strokeWidth="1" />
          <path d={`M${f.x - 3.4} ${f.y + 16}h6.8l1.6 9h-10z`} fill={i % 2 ? "#ff3d9a" : "#ffb000"} />
        </g>
      ))}
      {BEADS.map((f) =>
        f.big ? (
          <g key={f.i}>
            <circle cx={f.x} cy={f.y} r="9.6" fill="#b3121b" stroke="#d4a537" strokeWidth="1.4" />
            <circle cx={f.x} cy={f.y} r="6" fill="url(#fvc-mir)" />
            <circle cx={f.x - 1.8} cy={f.y - 1.8} r="1.5" fill="#fff" className="fvc-glint" />
          </g>
        ) : (
          <g key={f.i}>
            <circle cx={f.x} cy={f.y} r="6.6" fill={f.deep ? "#f29a00" : "#ffb000"} />
            <circle cx={f.x} cy={f.y} r="2.4" fill="#c8141f" />
          </g>
        ),
      )}
    </svg>
  );
}

export function FestivalCorners({ kind, scope = "page" }: { kind: FestivalId; scope?: "page" | "parent" }) {
  const on = useFestival() === kind;
  // The page layer portals to <body>, which exists only after mount.
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  if (!on) return null;

  const node = (
    <div className={`fvc fvc-${scope} fvc-k-${kind}`} aria-hidden>
      <style>{FVC_CSS}</style>
      {(["l", "r"] as const).map((side) => (
        <span key={side} className={`fvc-c fvc-${side}`}>
          {kind === "dandiya" ? <MirrorToran /> : <Garland />}
          {kind === "dandiya" ? (
            <>
              <span className="fvc-hang fvc-h1"><i /><span className="fvc-obj fvc-sticks"><Dandiya size={34} /></span></span>
              <span className="fvc-hang fvc-h2"><i /><span className="fvc-obj"><Mirror size={22} thread="#ff3d9a" /></span></span>
            </>
          ) : (
            <>
              <span className="fvc-hang fvc-h1"><i /><span className="fvc-obj fvc-diya"><Diya size={26} /></span></span>
              <span className="fvc-hang fvc-h2"><i /><span className="fvc-obj fvc-diya"><Diya size={20} /></span></span>
            </>
          )}
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
/* the running strip stays readable on top of the corners */
body:has(.fvc-page) .fsb-wrap { z-index: 31; }
.fvc-parent { position: absolute; inset: 0; z-index: 2; overflow: hidden; }
.fvc-c { position: absolute; top: 0; display: block; width: 240px; height: 240px; }
.fvc-l { left: 0; }
.fvc-r { right: 0; transform: scaleX(-1); }
.fvc-svg { position: absolute; inset: 0; display: block; width: 100%; height: 100%; overflow: visible;
  filter: drop-shadow(0 3px 4px rgba(120,10,10,.3)); }
/* ornaments hanging from the toran: a gold thread that sways, the ornament riding its end */
.fvc-hang { position: absolute; width: 0; height: 0; transform-origin: 50% 0; animation: fvcSway 4.4s ease-in-out infinite; }
.fvc-hang i { position: absolute; left: -.5px; top: 0; width: 1px; height: var(--L); background: linear-gradient(180deg, rgba(183,122,18,.4), #d9a632); }
.fvc-obj { position: absolute; left: 0; top: var(--L); transform: translate(-50%, -2px); display: block; }
.fvc-obj svg { display: block; }
.fvc-diya svg { filter: drop-shadow(0 0 8px rgba(255,196,77,.85)); }
.fvc-diya .fv-flame { animation: fvcFlick 1.2s ease-in-out infinite alternate; transform-box: fill-box; transform-origin: 50% 100%; }
.fvc-k-dandiya .fvc-obj svg { filter: drop-shadow(0 2px 4px rgba(90,7,12,.4)) drop-shadow(0 0 6px rgba(255,255,255,.35)); }
.fvc-sticks { transform: translate(-50%, -6px); }
.fvc-sticks .ft-stick-l { animation: fvcClickL 1.8s ease-in-out infinite; }
.fvc-sticks .ft-stick-r { animation: fvcClickR 1.8s ease-in-out infinite; }
@keyframes fvcClickL { 0%, 100% { transform: rotate(-12deg); } 46%, 54% { transform: rotate(4deg); } }
@keyframes fvcClickR { 0%, 100% { transform: rotate(12deg); } 46%, 54% { transform: rotate(-4deg); } }
.fvc-glint { animation: fvcGlint 2.6s ease-in-out infinite; }
@keyframes fvcGlint { 0%, 100% { opacity: .5; } 50% { opacity: 1; } }
.fvc-h1 { left: 53.3%; top: 49%; --L: 46px; }
.fvc-h2 { left: 30%; top: 27%; --L: 30px; animation-delay: -1.9s; animation-duration: 3.8s; }
.fvc-r .fvc-h1 { animation-delay: -1.1s; }
.fvc-k-dandiya .fvc-hang { animation-duration: 2.6s; }
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
  .fvc-h1 .fvc-obj svg { width: 20px; height: 20px; }
  .fvc-h2 { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .fvc *, .fvc .fv-flame { animation: none !important; }
}
`;

/**
 * The home hero's festival wash, behind the hero's content (z 0): absolutely
 * positioned, pointer-events none, CSS only. Brings the corners with it.
 */
export function FestivalHeroNight({ kind }: { kind: FestivalId }) {
  const on = useFestival() === kind;
  if (!on) return null;
  return (
    <>
      {kind === "dandiya" ? (
        <div className="fvhero fvhero-dandiya" aria-hidden>
          <style>{FVHERO_CSS}</style>
          <span className="fvhero-haze" />
          <span className="fvhero-dots" />
          <span className="fvhero-mandala"><Mirror size={520} thread="#ffb000" /></span>
          <span className="fvhero-glint fvhero-g1"><Mirror size={26} /></span>
          <span className="fvhero-glint fvhero-g2"><Mirror size={18} thread="#ff3d9a" /></span>
          <span className="fvhero-glint fvhero-g3"><Mirror size={22} thread="#12b5a6" /></span>
          <span className="fvhero-glint fvhero-g4"><Mirror size={16} /></span>
          <span className="fvhero-hem" />
        </div>
      ) : (
        <div className="fvhero fvhero-diwali" aria-hidden>
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
          <span className="fvhero-hem" />
        </div>
      )}
      {/* The corners hang from the very top of the page, above the strip and the hero. */}
      <FestivalCorners kind={kind} scope="page" />
    </>
  );
}

const FVHERO_CSS = `
/* The home page's floral top corners (CornerOrnaments) give way to the festival's own. */
body:has(.fvhero) [data-corner-top] { display: none; }
.fvhero { position: absolute; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; }
.fvhero-haze { position: absolute; inset: 0; }
/* a hem of the festival's colour along the hero's bottom edge */
.fvhero-hem { position: absolute; left: 0; right: 0; bottom: 0; height: 10px; }

/* ── Dandiya: kumkum-red and rani-pink blush, bandhani dots, a mirror mandala ── */
.fvhero-dandiya .fvhero-haze {
  background: radial-gradient(60% 55% at 85% 20%, rgba(255,61,154,.20), transparent 70%),
    radial-gradient(55% 60% at 4% 96%, rgba(200,20,31,.22), transparent 70%),
    radial-gradient(40% 45% at 100% 100%, rgba(255,176,0,.20), transparent 70%),
    linear-gradient(180deg, rgba(200,20,31,.10), rgba(200,20,31,0) 30%, rgba(200,20,31,.08)); }
.fvhero-dots { position: absolute; inset: 0; opacity: .5;
  background: radial-gradient(circle at 50% 50%, rgba(200,20,31,.32) 0 1.4px, transparent 1.9px) 0 0 / 26px 26px,
    radial-gradient(circle at 50% 50%, rgba(242,154,0,.32) 0 1.2px, transparent 1.7px) 13px 13px / 26px 26px;
  -webkit-mask-image: radial-gradient(75% 70% at 50% 50%, transparent 40%, #000 85%); mask-image: radial-gradient(75% 70% at 50% 50%, transparent 40%, #000 85%); }
.fvhero-mandala { position: absolute; right: 2%; top: 50%; margin-top: -260px; opacity: .1; animation: fvheroSpin 70s linear infinite; }
.fvhero-mandala svg { display: block; }
.fvhero-glint { position: absolute; animation: fvheroGlint 3.2s ease-in-out infinite; }
.fvhero-glint svg { display: block; filter: drop-shadow(0 0 6px rgba(255,255,255,.8)) drop-shadow(0 2px 4px rgba(122,15,18,.35)); }
.fvhero-g1 { left: 5%; top: 40%; }
.fvhero-g2 { left: 44%; top: 20%; animation-delay: -1s; }
.fvhero-g3 { right: 6%; top: 28%; animation-delay: -2s; }
.fvhero-g4 { left: 28%; bottom: 12%; animation-delay: -.5s; }
@keyframes fvheroGlint { 0%, 100% { transform: rotate(0) scale(.9); opacity: .55; } 50% { transform: rotate(45deg) scale(1.15); opacity: 1; } }
.fvhero-dandiya .fvhero-hem { background: repeating-linear-gradient(90deg, #c8141f 0 18px, #ffb000 18px 22px, #12b5a6 22px 30px, #ffb000 30px 34px, #ff3d9a 34px 52px, #ffb000 52px 56px); opacity: .8; }

/* ── Diwali: a maroon-gold glow, fairy lights, diya orbs, a faint rangoli ── */
.fvhero-diwali .fvhero-haze {
  background: radial-gradient(55% 50% at 80% 30%, rgba(255,190,70,.30), transparent 70%),
    radial-gradient(60% 60% at 4% 100%, rgba(143,20,22,.30), transparent 70%),
    radial-gradient(45% 40% at 100% 100%, rgba(143,20,22,.22), transparent 70%),
    radial-gradient(40% 35% at 50% 0%, rgba(143,20,22,.18), transparent 70%),
    linear-gradient(180deg, rgba(143,20,22,.12), rgba(143,20,22,0) 35%, rgba(232,134,12,.14)); }
.fvhero-lights { position: absolute; left: 3%; right: 3%; top: 132px; height: 40px; }
.fvhero-lights i { position: absolute; width: 7px; height: 9px; border-radius: 50% 50% 45% 45%; transform: translateX(-50%);
  background: #ffcf5a; box-shadow: 0 0 10px 3px rgba(255,190,70,.6); animation: fvheroBulb 2s ease-in-out infinite alternate; }
.fvhero-lights i:nth-child(3n+1) { background: #ff6f6f; box-shadow: 0 0 10px 3px rgba(226,52,60,.5); }
.fvhero-lights i:nth-child(3n+2) { background: #ffe7a8; box-shadow: 0 0 10px 3px rgba(255,231,168,.5); }
@keyframes fvheroBulb { from { opacity: .45; } to { opacity: 1; } }
.fvhero-rangoli { position: absolute; right: 3%; bottom: -70px; opacity: .16; animation: fvheroSpin 90s linear infinite; }
.fvhero-rangoli svg { display: block; }
@keyframes fvheroSpin { to { transform: rotate(360deg); } }
.fvhero-orb { position: absolute; width: 9px; height: 9px; border-radius: 50%; background: rgba(255,196,77,.9); box-shadow: 0 0 16px 7px rgba(255,176,32,.45);
  animation: fvheroOrb 7s ease-in-out infinite; }
.fvhero-o1 { left: 6%; top: 36%; }
.fvhero-o2 { left: 47%; top: 22%; width: 6px; height: 6px; animation-delay: -2s; background: rgba(226,52,60,.8); box-shadow: 0 0 12px 5px rgba(226,52,60,.35); }
.fvhero-o3 { right: 5%; top: 30%; animation-delay: -4s; }
.fvhero-o4 { left: 30%; bottom: 14%; width: 7px; height: 7px; animation-delay: -5s; }
@keyframes fvheroOrb { 0%, 100% { transform: translate(0,0); opacity: .45; } 50% { transform: translate(10px,-16px); opacity: 1; } }
.fvhero-diwali .fvhero-hem { height: 8px; opacity: .85;
  background: radial-gradient(circle, #ffcf5a 2.2px, transparent 2.6px) 0 50% / 16px 8px, linear-gradient(90deg, #5e0b10, #8f1416, #5e0b10); }
@media (max-width: 768px) {
  /* phones: the hero's top band is the strip, so the lights would float over the headline */
  .fvhero-lights { display: none; }
  .fvhero-rangoli { right: -60px; bottom: auto; top: 46%; }
  .fvhero-mandala { right: -180px; top: 58%; }
  .fvhero-g2 { display: none; }
}
@media (prefers-reduced-motion: reduce) { .fvhero * { animation: none !important; } }
`;
