"use client";

// ─── Cobwebs in the corners ──────────────────────────────────────────────────
//
// Halloween mode only. Two webs flush in the top-left and top-right corners,
// each with a little spider bobbing on a thread.
//
//   scope "page"   — the blog: pinned to the top corners of the document, just
//                    under the navbar, so they scroll away with the page top.
//   scope "parent" — the home hero: fills the nearest positioned ancestor.
//
// Pure inline SVG + CSS: no request, no layout (absolutely positioned,
// pointer-events none), small on phones, the spider still under reduced motion.

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useIsHalloween } from "@/hooks/useSeason";
import { CornerWeb, Spider } from "./halloweenArt";

const noop = () => () => {};

export default function HalloweenCornerWebs({ scope = "page" }: { scope?: "page" | "parent" }) {
  const on = useIsHalloween();
  // The page layer portals to <body>, which exists only after mount.
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  if (!on) return null;

  const node = (
    <div className={`hwweb hwweb-${scope}`} aria-hidden>
      <style>{HWWEB_CSS}</style>
      <span className="hwweb-c hwweb-l">
        <CornerWeb size={160} className="hwweb-svg" />
        <span className="hwweb-spider hwweb-s1"><i /><Spider size={18} /></span>
      </span>
      <span className="hwweb-c hwweb-r">
        <CornerWeb size={160} className="hwweb-svg" />
        <span className="hwweb-spider hwweb-s2"><i /><Spider size={22} /></span>
      </span>
    </div>
  );
  if (scope === "page") return mounted ? createPortal(node, document.body) : null;
  return node;
}

const HWWEB_CSS = `
.hwweb { pointer-events: none; }
.hwweb-page { position: absolute; left: 0; top: 0; width: 100%; height: 0; z-index: 30; }
.hwweb-parent { position: absolute; inset: 0; z-index: 2; overflow: hidden; }
.hwweb-c { position: absolute; display: block; width: 160px; height: 160px; color: rgba(58,47,88,.42); }
.hwweb-svg { display: block; width: 100%; height: 100%; filter: drop-shadow(0 0 1px rgba(255,255,255,.7)); }
.hwweb-l { left: 0; }
.hwweb-r { right: 0; }
.hwweb-r .hwweb-svg { transform: scaleX(-1); }
/* Blog: under the floating navbar pill. */
.hwweb-page .hwweb-c { top: 96px; }
.hwweb-parent .hwweb-c { top: 0; }
.hwweb-spider { position: absolute; display: flex; flex-direction: column; align-items: center; color: #1d1530;
  transform-origin: 50% 0; animation: hwwebBob 3.8s ease-in-out infinite; }
.hwweb-spider i { display: block; width: 1px; background: rgba(58,47,88,.55); animation: hwwebThread 3.8s ease-in-out infinite; height: 46px; }
.hwweb-spider svg { filter: drop-shadow(0 2px 3px rgba(23,19,42,.35)); }
.hwweb-s1 { left: 58px; top: 52px; animation-delay: -1.4s; }
.hwweb-s1 i { animation-delay: -1.4s; }
.hwweb-s2 { right: 44px; top: 70px; }
@keyframes hwwebBob { 0%, 100% { transform: rotate(-4deg); } 50% { transform: rotate(4deg); } }
@keyframes hwwebThread { 0%, 100% { height: 28px; } 50% { height: 62px; } }
@media (max-width: 1023px) { .hwweb-c { width: 110px; height: 110px; } .hwweb-s1 { left: 40px; top: 36px; } .hwweb-s2 { right: 30px; top: 48px; } }
@media (max-width: 768px) {
  .hwweb-c { width: 74px; height: 74px; color: rgba(58,47,88,.36); }
  .hwweb-page .hwweb-c { top: 70px; }
  .hwweb-parent .hwweb-c { top: 72px; }
  .hwweb-s1 { left: 26px; top: 26px; }
  .hwweb-s2 { right: 20px; top: 32px; }
  .hwweb-spider svg { width: 14px; height: 14px; }
  @keyframes hwwebThread { 0%, 100% { height: 10px; } 50% { height: 30px; } }
}
@media (prefers-reduced-motion: reduce) { .hwweb-spider, .hwweb-spider i { animation: none !important; } }
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
      <HalloweenCornerWebs scope="parent" />
    </>
  );
}

const HWHERO_CSS = `
/* The home page's floral top corners (CornerOrnaments, desktop) give way to the webs. */
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
