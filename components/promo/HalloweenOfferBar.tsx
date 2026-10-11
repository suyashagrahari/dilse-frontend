"use client";

// ─── The running Halloween strip ─────────────────────────────────────────────
//
// A moving marquee directly under the navbar on the home page, the blog and the
// gallery while a super admin has the site in Halloween mode (/admin/season).
// Painted from the haunted-house night (halloweenTheme.ts): frosted navy glass
// with a butter moon, an animated lilac → pumpkin glow edge so it pops on the
// cream pages, a pumpkin "% OFF" pill, a spider dangling in its own slot, bats
// crossing and a ghost peeking over the edge. Taps go to /halloween-offer.
//
// Renders nothing unless the season is "halloween". Dismissible for the rest of
// the session; see lib/season.ts for how a dismissed bar stays hidden on the
// next page's first paint instead of flashing and collapsing.
//
// Nothing here changes size after it paints: the clock box has a fixed width
// and shows dashes until the client clock starts, so the strip never nudges the
// page.
//
// Layout, left → right: pill · spider slot · marquee · clock · CTA · ×. The
// marquee runs in its own clipped box that fades in after the spider slot, so
// its text never slides under the pill (the old "%OFF behind the spider" bug).
// Phones keep every part in one row: the pill shrinks to the percentage, the
// clock drops its label and the CTA becomes a round pumpkin arrow.

import Link from "next/link";
import { X } from "lucide-react";
import { useHalloweenBarDismissed, useSeason } from "@/hooks/useSeason";
import { useNow, countdown, pad2 } from "@/hooks/usePromo";
import { dismissHalloweenBar, HALLOWEEN_ENDS_AT, HALLOWEEN_PATH } from "@/lib/season";
import { Bat, Ghost, Pumpkin, Spider } from "./halloweenArt";
import { HW } from "./halloweenTheme";

export function halloweenClock(t: number): string | null {
  if (!t) return null;
  const c = countdown(HALLOWEEN_ENDS_AT, t);
  if (c.totalMs <= 0) return null;
  const hms = `${pad2(c.h)}:${pad2(c.m)}:${pad2(c.s)}`;
  return c.d > 0 ? `${c.d}d ${hms}` : hms;
}

export default function HalloweenOfferBar({ source, className = "" }: { source: string; className?: string }) {
  const season = useSeason();
  const dismissed = useHalloweenBarDismissed();
  const t = useNow();
  if (season?.mode !== "halloween" || dismissed) return null;

  const pct = season.sale.enabled ? season.sale.percent : 0;
  const clock = halloweenClock(t);
  const ended = !!t && !clock;
  const items = [
    pct
      ? <><Pumpkin size={17} /> HALLOWEEN DROP · <b className="hwb-hot">{pct}% OFF</b> the spookiest love letters</>
      : <><Pumpkin size={17} /> THE HALLOWEEN DROP is here — the spookiest love letters</>,
    <><Ghost size={15} /> Two haunted templates: The Little Haunted House &amp; Boo-tiful Night</>,
    <><Bat size={22} /> Ask “Will you be my boo?” with a glowing pumpkin</>,
    ended ? <>🕯️ Still haunting — open the drop</> : <>🕸️ Ends 31 Oct, midnight</>,
    <><Spider size={15} /> Try it free · pay only when you publish</>,
  ];
  const group = (hidden: boolean) => (
    <span className="hwb-group" aria-hidden={hidden || undefined}>
      {items.map((s, i) => (
        <span key={i} className="hwb-item">{s}<i className="hwb-dot">✦</i></span>
      ))}
    </span>
  );
  const label = pct
    ? `Halloween drop: ${pct}% off the two Halloween templates, ends 31 October. See the offer.`
    : "The Halloween drop: two new Halloween templates. See them.";

  return (
    <div className={`hwb-wrap ${className}`} data-src={source}>
      <style>{HWB_CSS}</style>
      <span className="hwb-edge" aria-hidden />
      <span className="hwb-peek" aria-hidden><Ghost size={18} /></span>
      <Link href={HALLOWEEN_PATH} className="hwb" aria-label={label} prefetch={false}>
        <span className="hwb-sky" aria-hidden />
        <span className="hwb-moon" aria-hidden />
        <span className="hwb-glow" aria-hidden />
        <span className="hwb-bats" aria-hidden>
          <Bat size={20} className="hwb-bat hwb-bat1" />
          <Bat size={14} className="hwb-bat hwb-bat2" />
        </span>
        <span className="hwb-tag">
          <span className="hwb-tag-ic" aria-hidden>🎃</span>
          {pct ? <>{pct}%<span className="hwb-tag-off">&nbsp;OFF</span></> : "NEW"}
        </span>
        <span className="hwb-spider" aria-hidden><i /><Spider size={15} /></span>
        <span className="hwb-track">
          <span className="hwb-run">{group(false)}{group(true)}</span>
        </span>
        {!ended && (
          <span className="hwb-clock" aria-hidden>
            <span className="hwb-clock-l">Ends in</span>
            <b>{clock ?? "--d --:--:--"}</b>
          </span>
        )}
        <span className="hwb-cta" aria-hidden>
          <span className="hwb-cta-full">Enter if you dare</span>
          <span className="hwb-cta-mid">Enter</span>
          <span>→</span>
        </span>
      </Link>
      <button type="button" className="hwb-x" aria-label="Hide the Halloween offer" onClick={dismissHalloweenBar}>
        <X size={13} strokeWidth={2.6} />
      </button>
    </div>
  );
}

const HWB_CSS = `
html[data-hw-bar-off] .hwb-wrap { display: none !important; }
.hwb-wrap { position: relative; isolation: isolate; margin: 0 0 18px; padding: 2px; border-radius: 17px;
  box-shadow: 0 14px 34px -14px rgba(23,19,42,.85), 0 0 22px -4px rgba(185,166,240,.6);
  animation: hwbPulse 3.2s ease-in-out infinite; }
/* The glow edge: a lilac → pumpkin → moon band sliding round the rim. */
.hwb-edge { position: absolute; inset: 0; z-index: -1; border-radius: inherit; pointer-events: none;
  background: linear-gradient(100deg, ${HW.lilac}, ${HW.pumpkin}, ${HW.moon}, #7e6bc4, ${HW.lilac}, ${HW.pumpkin}, ${HW.lilac});
  background-size: 300% 100%; animation: hwbEdge 6s linear infinite; }
@keyframes hwbEdge { from { background-position: 0% 0; } to { background-position: 150% 0; } }
@keyframes hwbPulse { 50% { box-shadow: 0 14px 34px -14px rgba(23,19,42,.85), 0 0 30px 0 rgba(255,154,60,.5); } }
.hwb-peek { position: absolute; z-index: 3; right: 112px; top: -12px; pointer-events: none; animation: hwbPeek 4.5s ease-in-out infinite;
  filter: drop-shadow(0 2px 4px rgba(23,19,42,.45)); }
@keyframes hwbPeek { 0%, 100% { transform: translateY(3px) rotate(-6deg); } 50% { transform: translateY(-3px) rotate(6deg); } }
.hwb { position: relative; isolation: isolate; overflow: hidden; display: flex; align-items: center; gap: 10px; height: 52px; padding: 0 46px 0 8px;
  border-radius: 15px; text-decoration: none; color: ${HW.text};
  background: ${HW.glass}; -webkit-backdrop-filter: blur(14px) saturate(1.3); backdrop-filter: blur(14px) saturate(1.3);
  box-shadow: inset 0 0 0 1px ${HW.glassEdge}, inset 0 -12px 24px -16px rgba(255,154,60,.6); }
.hwb-sky { position: absolute; inset: 0; z-index: -3; pointer-events: none;
  background:
    radial-gradient(1px 1px at 22% 30%, rgba(255,255,255,.85) 50%, transparent 51%),
    radial-gradient(1px 1px at 41% 72%, rgba(255,255,255,.6) 50%, transparent 51%),
    radial-gradient(1.4px 1.4px at 58% 22%, rgba(255,255,255,.8) 50%, transparent 51%),
    radial-gradient(1px 1px at 86% 64%, rgba(255,255,255,.6) 50%, transparent 51%),
    radial-gradient(120% 220% at 8% 130%, rgba(255,154,60,.3) 0%, transparent 42%),
    linear-gradient(100deg, rgba(23,19,42,.95) 0%, rgba(43,34,69,.92) 40%, rgba(59,47,98,.9) 66%, rgba(23,19,42,.96) 100%); }
.hwb-moon { position: absolute; z-index: -2; top: -20px; right: 31%; width: 48px; height: 48px; border-radius: 50%; pointer-events: none;
  background: radial-gradient(circle at 38% 38%, #fffbe6, ${HW.moon} 58%, #e6cf7c); box-shadow: 0 0 26px 10px ${HW.moonGlow}; opacity: .85; }
.hwb-glow { position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background: linear-gradient(105deg, transparent 38%, rgba(243,238,254,.16) 48%, rgba(255,195,90,.14) 52%, transparent 62%); background-size: 260% 100%;
  animation: hwbShine 4.2s ease-in-out infinite; }
@keyframes hwbShine { from { background-position: 130% 0; } to { background-position: -30% 0; } }
.hwb-bats { position: absolute; inset: 0; z-index: -1; pointer-events: none; color: #0d0a16; }
.hwb-bat { position: absolute; left: -30px; filter: drop-shadow(0 0 4px rgba(185,166,240,.6)); }
.hwb-bat1 { top: 3px; animation: hwbBat 11s linear infinite; }
.hwb-bat2 { top: 32px; animation: hwbBat 15s linear 4s infinite; }
@keyframes hwbBat {
  0% { transform: translate(0, 0) scaleY(1); } 10% { transform: translate(10vw, -3px) scaleY(.55); } 20% { transform: translate(20vw, 2px) scaleY(1); }
  30% { transform: translate(30vw, -3px) scaleY(.55); } 40% { transform: translate(40vw, 2px) scaleY(1); } 50% { transform: translate(50vw, -2px) scaleY(.55); }
  60% { transform: translate(60vw, 3px) scaleY(1); } 70% { transform: translate(70vw, -3px) scaleY(.55); } 80% { transform: translate(80vw, 2px) scaleY(1); }
  90% { transform: translate(90vw, -2px) scaleY(.55); } 100% { transform: translate(105vw, 0) scaleY(1); } }
.hwb-tag { position: relative; z-index: 1; flex: none; display: inline-flex; align-items: center; gap: 5px; height: 34px; padding: 0 14px 0 9px; border-radius: 999px;
  font: 800 12.5px/1 'Inter', sans-serif; letter-spacing: .08em; color: #2a1206; white-space: nowrap;
  background: linear-gradient(180deg, #ffc37a, ${HW.pumpkin} 60%, ${HW.pumpkinDeep}); box-shadow: 0 0 0 1px rgba(255,214,150,.75), 0 0 16px rgba(255,154,60,.6);
  animation: hwbTag 2.6s ease-in-out infinite; }
.hwb-tag-ic { font-size: 16px; letter-spacing: 0; }
@keyframes hwbTag { 50% { box-shadow: 0 0 0 1px rgba(255,214,150,.95), 0 0 26px rgba(255,154,60,.95); } }
/* The spider has its own slot between the pill and the marquee. */
.hwb-spider { flex: none; align-self: flex-start; width: 18px; display: flex; flex-direction: column; align-items: center;
  transform-origin: 50% 0; animation: hwbDangle 5s ease-in-out infinite; pointer-events: none; }
.hwb-spider i { display: block; width: 1px; height: 8px; background: rgba(185,166,240,.85); animation: hwbThread 5s ease-in-out infinite; }
.hwb-spider svg { color: #0d0a16; filter: drop-shadow(0 0 3px rgba(185,166,240,.95)); }
@keyframes hwbDangle { 0%, 100% { transform: rotate(-8deg); } 50% { transform: rotate(8deg); } }
@keyframes hwbThread { 0%, 100% { height: 6px; } 45%, 60% { height: 20px; } }
.hwb-track { flex: 1; min-width: 0; overflow: hidden; white-space: nowrap;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 28px, #000 calc(100% - 28px), transparent);
  mask-image: linear-gradient(90deg, transparent, #000 28px, #000 calc(100% - 28px), transparent); }
.hwb-run { display: inline-flex; animation: hwbScroll 38s linear infinite; will-change: transform; }
.hwb:hover .hwb-run, .hwb:focus-visible .hwb-run { animation-play-state: paused; }
.hwb-group { display: inline-flex; flex: none; padding-left: 24px; }
.hwb-item { display: inline-flex; align-items: center; gap: 7px; font: 600 14px/1 'Inter', sans-serif; letter-spacing: .01em; color: ${HW.text}; }
.hwb-item svg { flex: none; color: ${HW.lilac}; }
.hwb-hot { color: #ffb45e; text-shadow: 0 0 10px rgba(255,154,60,.85); }
.hwb-dot { margin: 0 16px; font-style: normal; color: ${HW.lilac}; font-size: 10px; }
@keyframes hwbScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.hwb-clock { position: relative; z-index: 1; flex: none; display: inline-flex; align-items: baseline; gap: 6px; padding: 8px 11px; border-radius: 11px; min-width: 158px; justify-content: center;
  background: rgba(13,10,22,.55); box-shadow: inset 0 0 0 1px rgba(185,166,240,.38); }
.hwb-clock-l { font: 700 9.5px/1 'Inter', sans-serif; letter-spacing: .12em; text-transform: uppercase; color: ${HW.lilac}; }
.hwb-clock b { font: 800 15px/1 'Inter', sans-serif; font-variant-numeric: tabular-nums; letter-spacing: .02em; color: #fff; white-space: nowrap; }
.hwb-cta { position: relative; z-index: 1; flex: none; display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 14px; border-radius: 11px;
  font: 800 13px/1 'Inter', sans-serif; color: #2a1206; white-space: nowrap;
  background: linear-gradient(180deg, #ffd08f, ${HW.pumpkin}); box-shadow: 0 0 0 1px rgba(255,214,150,.6), 0 6px 16px -6px rgba(255,154,60,.9);
  transition: transform .2s ease; }
.hwb-cta-mid { display: none; }
.hwb:hover .hwb-cta { transform: translateX(2px); }
.hwb-x { position: absolute; top: 50%; right: 12px; transform: translateY(-50%); width: 26px; height: 26px; display: grid; place-items: center;
  border: 0; border-radius: 999px; color: rgba(243,238,254,.9); background: rgba(185,166,240,.2); cursor: pointer; z-index: 4; }
.hwb-x:hover { background: rgba(185,166,240,.36); color: #fff; }
@media (max-width: 1100px) {
  .hwb-cta-full { display: none; }
  .hwb-cta-mid { display: inline; }
  .hwb-peek { right: 74px; }
}
@media (max-width: 640px) {
  .hwb-wrap { padding: 1.5px; border-radius: 14px; }
  .hwb { gap: 6px; height: 46px; padding: 0 36px 0 5px; border-radius: 12.5px; }
  .hwb-tag { height: 30px; padding: 0 9px; font-size: 12px; letter-spacing: .02em; }
  .hwb-tag-ic, .hwb-tag-off { display: none; }
  .hwb-spider { display: none; }
  .hwb-track { -webkit-mask-image: linear-gradient(90deg, transparent, #000 14px, #000 calc(100% - 14px), transparent);
    mask-image: linear-gradient(90deg, transparent, #000 14px, #000 calc(100% - 14px), transparent); }
  .hwb-group { padding-left: 12px; }
  .hwb-item { font-size: 12.5px; }
  .hwb-dot { margin: 0 12px; }
  .hwb-clock-l { display: none; }
  .hwb-clock { min-width: 0; width: 90px; padding: 7px 0; }
  .hwb-clock b { font-size: 11.5px; }
  .hwb-cta { width: 30px; height: 30px; padding: 0; border-radius: 999px; font-size: 15px; }
  .hwb-cta-mid { display: none; }
  .hwb-moon { right: 40%; width: 34px; height: 34px; top: -17px; }
  .hwb-peek { right: 44px; top: -10px; }
  .hwb-peek svg { width: 15px; height: 16.5px; }
  .hwb-x { right: 7px; width: 24px; height: 24px; }
}
@media (prefers-reduced-motion: reduce) {
  .hwb-wrap, .hwb-edge, .hwb-peek, .hwb-run, .hwb-glow, .hwb-tag, .hwb-bat, .hwb-spider, .hwb-spider i { animation: none !important; }
  .hwb-bats { display: none; }
  .hwb-track { -webkit-mask-image: none; mask-image: none; text-overflow: ellipsis; }
  .hwb-group[aria-hidden] { display: none; }
}
`;
