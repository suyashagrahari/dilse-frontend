"use client";

// ─── The running Navratri & Diwali strip ─────────────────────────────────────
//
// The festive twin of HalloweenOfferBar: a moving marquee directly under the
// navbar on the home page, the blog and the gallery while a super admin has the
// site in festive mode (/admin/season). A navy festival night: frosted navy
// glass, a marigold → gold → rose glow edge sliding round the rim, a marigold
// "% OFF" pill, a diya with a live flame in its own slot, crossed dandiya
// sticks that click together, rangoli dots and a firework blooming behind the
// clock. Taps go to /festive-offer.
//
// Renders nothing unless the season is "festive". Dismissible for the rest of
// the session with the same key as the Halloween strip (only one season shows
// at a time), so a dismissed strip stays hidden on the next page's first paint.
// Nothing changes size after it paints (fixed-width clock with dashes until the
// client clock starts).

import Link from "next/link";
import { X } from "lucide-react";
import { useHalloweenBarDismissed, useSeason } from "@/hooks/useSeason";
import { useNow, countdown, pad2 } from "@/hooks/usePromo";
import { dismissHalloweenBar, FESTIVE_ENDS_AT, FESTIVE_PATH } from "@/lib/season";
import { Burst, Dandiya, Diya, Lantern, Marigold } from "./festiveArt";
import { FV } from "./festiveTheme";

export function dropClock(endsAt: number, t: number): string | null {
  if (!t) return null;
  const c = countdown(endsAt, t);
  if (c.totalMs <= 0) return null;
  const hms = `${pad2(c.h)}:${pad2(c.m)}:${pad2(c.s)}`;
  return c.d > 0 ? `${c.d}d ${hms}` : hms;
}

export default function FestiveOfferBar({ source, className = "" }: { source: string; className?: string }) {
  const season = useSeason();
  const dismissed = useHalloweenBarDismissed();
  const t = useNow();
  if (season?.mode !== "festive" || dismissed) return null;

  const pct = season.sale.enabled ? season.sale.percent : 0;
  const clock = dropClock(FESTIVE_ENDS_AT, t);
  const ended = !!t && !clock;
  const items = [
    pct
      ? <><Diya size={18} /> NAVRATRI &amp; DIWALI DROP · <b className="fsb-hot">{pct}% OFF</b></>
      : <><Diya size={18} /> THE NAVRATRI &amp; DIWALI DROP is here</>,
    <><Dandiya size={18} /> Be my Dandiya partner</>,
    <><Lantern size={14} /> Light up their Diwali</>,
    ended ? <>🪔 The lights are still on — open the drop</> : <><Marigold size={15} /> Ends Diwali night, 8 Nov</>,
    <><Marigold size={15} /> Try it free · pay only when you publish</>,
  ];
  const group = (hidden: boolean) => (
    <span className="fsb-group" aria-hidden={hidden || undefined}>
      {items.map((s, i) => (
        <span key={i} className="fsb-item">{s}<i className="fsb-dot" /></span>
      ))}
    </span>
  );
  const label = pct
    ? `Navratri and Diwali drop: ${pct}% off the festive templates, ends Diwali night, 8 November. See the offer.`
    : "The Navratri and Diwali drop: two new festive templates. See them.";

  return (
    <div className={`fsb-wrap ${className}`} data-src={source}>
      <style>{FSB_CSS}</style>
      <span className="fsb-edge" aria-hidden />
      <Link href={FESTIVE_PATH} className="fsb" aria-label={label} prefetch={false}>
        <span className="fsb-sky" aria-hidden />
        <span className="fsb-rangoli" aria-hidden />
        <span className="fsb-glow" aria-hidden />
        <span className="fsb-fw fsb-fw1" aria-hidden><Burst size={44} color={FV.flame} /></span>
        <span className="fsb-fw fsb-fw2" aria-hidden><Burst size={32} color={FV.rose} /></span>
        <span className="fsb-tag">
          <span className="fsb-tag-ic" aria-hidden>🪔</span>
          {pct ? <>{pct}%<span className="fsb-tag-off">&nbsp;OFF</span></> : "NEW"}
        </span>
        <span className="fsb-sticks" aria-hidden><Dandiya size={22} /></span>
        <span className="fsb-track">
          <span className="fsb-run">{group(false)}{group(true)}</span>
        </span>
        {!ended && (
          <span className="fsb-clock" aria-hidden>
            <span className="fsb-clock-l">Ends in</span>
            <b>{clock ?? "--d --:--:--"}</b>
          </span>
        )}
        <span className="fsb-cta" aria-hidden>
          <span className="fsb-cta-full">See the drop</span>
          <span className="fsb-cta-mid">Open</span>
          <span>→</span>
        </span>
      </Link>
      <button type="button" className="fsb-x" aria-label="Hide the festive offer" onClick={dismissHalloweenBar}>
        <X size={13} strokeWidth={2.6} />
      </button>
    </div>
  );
}

const FSB_CSS = `
html[data-hw-bar-off] .fsb-wrap { display: none !important; }
.fsb-wrap { position: relative; isolation: isolate; margin: 0 0 18px; padding: 2px; border-radius: 17px;
  box-shadow: 0 14px 34px -14px rgba(13,15,46,.85), 0 0 22px -4px rgba(255,176,32,.6);
  animation: fsbPulse 3.2s ease-in-out infinite; }
.fsb-edge { position: absolute; inset: 0; z-index: -1; border-radius: inherit; pointer-events: none;
  background: linear-gradient(100deg, ${FV.marigold}, ${FV.gold}, ${FV.rose}, ${FV.teal}, ${FV.marigold}, ${FV.goldSoft}, ${FV.marigold});
  background-size: 300% 100%; animation: fsbEdge 6s linear infinite; }
@keyframes fsbEdge { from { background-position: 0% 0; } to { background-position: 150% 0; } }
@keyframes fsbPulse { 50% { box-shadow: 0 14px 34px -14px rgba(13,15,46,.85), 0 0 30px 0 rgba(255,196,77,.6); } }
.fsb { position: relative; isolation: isolate; overflow: hidden; display: flex; align-items: center; gap: 10px; height: 52px; padding: 0 46px 0 8px;
  border-radius: 15px; text-decoration: none; color: ${FV.text};
  background: ${FV.glass}; -webkit-backdrop-filter: blur(14px) saturate(1.3); backdrop-filter: blur(14px) saturate(1.3);
  box-shadow: inset 0 0 0 1px ${FV.glassEdge}, inset 0 -12px 24px -16px rgba(255,176,32,.7); }
.fsb-sky { position: absolute; inset: 0; z-index: -3; pointer-events: none;
  background:
    radial-gradient(1px 1px at 22% 30%, rgba(255,255,255,.85) 50%, transparent 51%),
    radial-gradient(1px 1px at 41% 72%, rgba(255,255,255,.6) 50%, transparent 51%),
    radial-gradient(1.4px 1.4px at 58% 22%, rgba(255,240,200,.85) 50%, transparent 51%),
    radial-gradient(1px 1px at 86% 64%, rgba(255,255,255,.6) 50%, transparent 51%),
    radial-gradient(120% 220% at 8% 130%, rgba(255,176,32,.34) 0%, transparent 42%),
    linear-gradient(100deg, rgba(13,15,46,.96) 0%, rgba(26,31,82,.93) 40%, rgba(40,48,112,.9) 66%, rgba(13,15,46,.96) 100%); }
/* rangoli dots running along the lower rim */
.fsb-rangoli { position: absolute; left: 0; right: 0; bottom: 3px; height: 4px; z-index: -2; pointer-events: none; opacity: .55;
  background-image: radial-gradient(circle, ${FV.marigold} 1.4px, transparent 1.6px), radial-gradient(circle, ${FV.rose} 1.2px, transparent 1.4px);
  background-size: 18px 4px, 18px 4px; background-position: 0 0, 9px 0; }
.fsb-glow { position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background: linear-gradient(105deg, transparent 38%, rgba(255,247,232,.16) 48%, rgba(255,196,77,.16) 52%, transparent 62%); background-size: 260% 100%;
  animation: fsbShine 4.2s ease-in-out infinite; }
@keyframes fsbShine { from { background-position: 130% 0; } to { background-position: -30% 0; } }
.fsb-fw { position: absolute; z-index: -1; pointer-events: none; opacity: 0; }
.fsb-fw svg { display: block; filter: drop-shadow(0 0 6px rgba(255,211,107,.8)); }
.fsb-fw1 { right: 29%; top: -2px; animation: fsbBloom 4.8s ease-out infinite; }
.fsb-fw2 { right: 46%; top: 14px; animation: fsbBloom 4.8s ease-out 2.2s infinite; }
@keyframes fsbBloom { 0%, 8% { opacity: 0; transform: scale(.1); } 12% { opacity: 1; } 34% { opacity: 0; transform: scale(1); } 100% { opacity: 0; transform: scale(1); } }
.fsb-tag { position: relative; z-index: 1; flex: none; display: inline-flex; align-items: center; gap: 5px; height: 34px; padding: 0 14px 0 9px; border-radius: 999px;
  font: 800 12.5px/1 'Inter', sans-serif; letter-spacing: .08em; color: #2a1206; white-space: nowrap;
  background: linear-gradient(180deg, ${FV.goldSoft}, ${FV.marigold} 60%, ${FV.marigoldDeep}); box-shadow: 0 0 0 1px rgba(255,227,163,.8), 0 0 16px rgba(255,176,32,.65);
  animation: fsbTag 2.6s ease-in-out infinite; }
.fsb-tag-ic { font-size: 16px; letter-spacing: 0; }
@keyframes fsbTag { 50% { box-shadow: 0 0 0 1px rgba(255,227,163,1), 0 0 26px rgba(255,176,32,1); } }
.fsb-sticks { flex: none; display: grid; place-items: center; width: 24px; animation: fsbClick 1.6s ease-in-out infinite; transform-origin: 50% 80%; }
.fsb-sticks svg { filter: drop-shadow(0 0 4px rgba(255,211,107,.8)); }
@keyframes fsbClick { 0%, 100% { transform: rotate(-10deg) scale(1); } 45% { transform: rotate(10deg) scale(1); } 50% { transform: rotate(10deg) scale(1.15); } 55% { transform: rotate(10deg) scale(1); } }
.fsb-track { flex: 1; min-width: 0; overflow: hidden; white-space: nowrap;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 28px, #000 calc(100% - 28px), transparent);
  mask-image: linear-gradient(90deg, transparent, #000 28px, #000 calc(100% - 28px), transparent); }
.fsb-run { display: inline-flex; animation: fsbScroll 38s linear infinite; will-change: transform; }
.fsb:hover .fsb-run, .fsb:focus-visible .fsb-run { animation-play-state: paused; }
.fsb-group { display: inline-flex; flex: none; padding-left: 24px; }
.fsb-item { display: inline-flex; align-items: center; gap: 7px; font: 600 14px/1 'Inter', sans-serif; letter-spacing: .01em; color: ${FV.text}; }
.fsb-item svg { flex: none; }
.fsb-item .fv-flame { animation: fsbFlick 1.1s ease-in-out infinite alternate; transform-box: fill-box; transform-origin: 50% 100%; }
@keyframes fsbFlick { from { transform: scale(1, 1) rotate(-4deg); } to { transform: scale(.88, 1.14) rotate(4deg); } }
.fsb-hot { color: ${FV.flame}; text-shadow: 0 0 10px rgba(255,176,32,.9); }
/* a tiny rangoli dot cluster between items */
.fsb-dot { position: relative; display: inline-block; width: 5px; height: 5px; margin: 0 18px; border-radius: 50%; background: ${FV.marigold};
  box-shadow: 7px 0 0 -1px ${FV.rose}, -7px 0 0 -1px ${FV.teal}, 0 0 8px rgba(255,176,32,.8); }
@keyframes fsbScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.fsb-clock { position: relative; z-index: 1; flex: none; display: inline-flex; align-items: baseline; gap: 6px; padding: 8px 11px; border-radius: 11px; min-width: 158px; justify-content: center;
  background: rgba(10,11,34,.55); box-shadow: inset 0 0 0 1px rgba(244,201,93,.4); }
.fsb-clock-l { font: 700 9.5px/1 'Inter', sans-serif; letter-spacing: .12em; text-transform: uppercase; color: ${FV.gold}; }
.fsb-clock b { font: 800 15px/1 'Inter', sans-serif; font-variant-numeric: tabular-nums; letter-spacing: .02em; color: #fff; white-space: nowrap; }
.fsb-cta { position: relative; z-index: 1; flex: none; display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 14px; border-radius: 11px;
  font: 800 13px/1 'Inter', sans-serif; color: #2a1206; white-space: nowrap;
  background: linear-gradient(180deg, ${FV.goldSoft}, ${FV.marigold}); box-shadow: 0 0 0 1px rgba(255,227,163,.65), 0 6px 16px -6px rgba(255,176,32,.95);
  transition: transform .2s ease; }
.fsb-cta-mid { display: none; }
.fsb:hover .fsb-cta { transform: translateX(2px); }
.fsb-x { position: absolute; top: 50%; right: 12px; transform: translateY(-50%); width: 26px; height: 26px; display: grid; place-items: center;
  border: 0; border-radius: 999px; color: rgba(255,247,232,.9); background: rgba(244,201,93,.2); cursor: pointer; z-index: 4; }
.fsb-x:hover { background: rgba(244,201,93,.36); color: #fff; }
@media (max-width: 1100px) {
  .fsb-cta-full { display: none; }
  .fsb-cta-mid { display: inline; }
}
@media (max-width: 640px) {
  .fsb-wrap { padding: 1.5px; border-radius: 14px; }
  .fsb { gap: 6px; height: 46px; padding: 0 36px 0 5px; border-radius: 12.5px; }
  .fsb-tag { height: 30px; padding: 0 9px; font-size: 12px; letter-spacing: .02em; }
  .fsb-tag-ic, .fsb-tag-off { display: none; }
  .fsb-sticks { display: none; }
  .fsb-track { -webkit-mask-image: linear-gradient(90deg, transparent, #000 14px, #000 calc(100% - 14px), transparent);
    mask-image: linear-gradient(90deg, transparent, #000 14px, #000 calc(100% - 14px), transparent); }
  .fsb-group { padding-left: 12px; }
  .fsb-item { font-size: 12.5px; }
  .fsb-dot { margin: 0 14px; }
  .fsb-clock-l { display: none; }
  .fsb-clock { min-width: 0; width: 90px; padding: 7px 0; }
  .fsb-clock b { font-size: 11.5px; }
  .fsb-cta { width: 30px; height: 30px; padding: 0; border-radius: 999px; font-size: 15px; }
  .fsb-cta-mid { display: none; }
  .fsb-fw1 { right: 38%; }
  .fsb-fw2 { display: none; }
  .fsb-x { right: 7px; width: 24px; height: 24px; }
}
@media (prefers-reduced-motion: reduce) {
  .fsb-wrap, .fsb-edge, .fsb-run, .fsb-glow, .fsb-tag, .fsb-sticks, .fsb-fw, .fsb-item .fv-flame { animation: none !important; }
  .fsb-track { -webkit-mask-image: none; mask-image: none; text-overflow: ellipsis; }
  .fsb-group[aria-hidden] { display: none; }
}
`;
