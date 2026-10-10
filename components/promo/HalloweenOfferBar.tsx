"use client";

// ─── The running Halloween strip ─────────────────────────────────────────────
//
// A moving marquee directly under the navbar on the home page, the blog and the
// gallery while a super admin has the site in Halloween mode (/admin/season).
// Maroon night with a pumpkin glow and gold edges — the site's own palette,
// dressed for the season — with a couple of bats crossing it and a spider on a
// thread. Taps go to /halloween-offer.
//
// Renders nothing unless the season is "halloween". Dismissible for the rest of
// the session; see lib/season.ts for how a dismissed bar stays hidden on the
// next page's first paint instead of flashing and collapsing.
//
// Nothing here changes size after it paints: the clock box has a fixed width
// and shows dashes until the client clock starts, so the strip never nudges the
// page.

import Link from "next/link";
import { X } from "lucide-react";
import { useHalloweenBarDismissed, useSeason } from "@/hooks/useSeason";
import { useNow, countdown, pad2 } from "@/hooks/usePromo";
import { dismissHalloweenBar, HALLOWEEN_ENDS_AT, HALLOWEEN_PATH } from "@/lib/season";
import { Bat, Ghost, Pumpkin, Spider } from "./halloweenArt";

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
      <Link href={HALLOWEEN_PATH} className="hwb" aria-label={label} prefetch={false}>
        <span className="hwb-glow" aria-hidden />
        <span className="hwb-bats" aria-hidden>
          <Bat size={20} className="hwb-bat hwb-bat1" />
          <Bat size={14} className="hwb-bat hwb-bat2" />
        </span>
        <span className="hwb-tag"><span className="hwb-tag-ic" aria-hidden>🎃</span>{pct ? `${pct}% OFF` : "NEW"}</span>
        <span className="hwb-track">
          <span className="hwb-run">{group(false)}{group(true)}</span>
        </span>
        {!ended && (
          <span className="hwb-clock" aria-hidden>
            <span className="hwb-clock-l">Ends in</span>
            <b>{clock ?? "--d --:--:--"}</b>
          </span>
        )}
        <span className="hwb-cta" aria-hidden>Enter if you dare →</span>
        <span className="hwb-spider" aria-hidden><i /><Spider size={16} /></span>
      </Link>
      <button type="button" className="hwb-x" aria-label="Hide the Halloween offer" onClick={dismissHalloweenBar}>
        <X size={13} strokeWidth={2.6} />
      </button>
    </div>
  );
}

const HWB_CSS = `
html[data-hw-bar-off] .hwb-wrap { display: none !important; }
.hwb-wrap { position: relative; margin: 0 0 18px; }
.hwb { position: relative; isolation: isolate; overflow: hidden; display: flex; align-items: center; gap: 10px; height: 46px; padding: 0 40px 0 7px;
  border-radius: 14px; text-decoration: none; color: #fbeee0;
  background: radial-gradient(120% 220% at 12% 120%, rgba(232,116,42,.55) 0%, transparent 45%),
    linear-gradient(100deg, #1c060a 0%, #3d0c11 38%, #4a1015 62%, #22070b 100%);
  box-shadow: 0 12px 28px -16px rgba(26,5,7,.95), inset 0 0 0 1px rgba(201,168,76,.42), inset 0 -10px 22px -14px rgba(245,138,53,.55); }
.hwb-glow { position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background: linear-gradient(105deg, transparent 35%, rgba(255,170,90,.18) 50%, transparent 65%); background-size: 250% 100%;
  animation: hwbShine 5s ease-in-out infinite; }
@keyframes hwbShine { from { background-position: 130% 0; } to { background-position: -30% 0; } }
.hwb-bats { position: absolute; inset: 0; z-index: -1; pointer-events: none; color: rgba(12,2,4,.85); }
.hwb-bat { position: absolute; left: -30px; filter: drop-shadow(0 0 4px rgba(255,150,70,.35)); }
.hwb-bat1 { top: 3px; animation: hwbBat 11s linear infinite; }
.hwb-bat2 { top: 24px; animation: hwbBat 15s linear 4s infinite; }
@keyframes hwbBat {
  0% { transform: translate(0, 0) scaleY(1); } 10% { transform: translate(10vw, -3px) scaleY(.55); } 20% { transform: translate(20vw, 2px) scaleY(1); }
  30% { transform: translate(30vw, -3px) scaleY(.55); } 40% { transform: translate(40vw, 2px) scaleY(1); } 50% { transform: translate(50vw, -2px) scaleY(.55); }
  60% { transform: translate(60vw, 3px) scaleY(1); } 70% { transform: translate(70vw, -3px) scaleY(.55); } 80% { transform: translate(80vw, 2px) scaleY(1); }
  90% { transform: translate(90vw, -2px) scaleY(.55); } 100% { transform: translate(105vw, 0) scaleY(1); } }
.hwb-tag { flex: none; display: inline-flex; align-items: center; gap: 5px; height: 30px; padding: 0 11px 0 8px; border-radius: 999px;
  font: 800 11.5px/1 'Inter', sans-serif; letter-spacing: .1em; color: #2a0a0e;
  background: linear-gradient(180deg, #ffc37a, #f0862f); box-shadow: 0 0 0 1px rgba(255,214,150,.7), 0 0 16px rgba(245,138,53,.55);
  animation: hwbTag 2.6s ease-in-out infinite; }
.hwb-tag-ic { font-size: 15px; letter-spacing: 0; }
@keyframes hwbTag { 50% { box-shadow: 0 0 0 1px rgba(255,214,150,.9), 0 0 24px rgba(245,138,53,.85); } }
.hwb-track { flex: 1; min-width: 0; overflow: hidden; white-space: nowrap;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent); mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent); }
.hwb-run { display: inline-flex; animation: hwbScroll 38s linear infinite; will-change: transform; }
.hwb:hover .hwb-run, .hwb:focus-visible .hwb-run { animation-play-state: paused; }
.hwb-group { display: inline-flex; flex: none; }
.hwb-item { display: inline-flex; align-items: center; gap: 7px; font: 600 13px/1 'Inter', sans-serif; letter-spacing: .01em; }
.hwb-item svg { flex: none; color: #120305; }
.hwb-hot { color: #ffb45e; text-shadow: 0 0 10px rgba(245,138,53,.8); }
.hwb-dot { margin: 0 16px; font-style: normal; color: #c9a84c; font-size: 10px; }
@keyframes hwbScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.hwb-clock { flex: none; display: inline-flex; align-items: baseline; gap: 6px; padding: 7px 10px; border-radius: 10px; min-width: 150px; justify-content: center;
  background: rgba(0,0,0,.35); box-shadow: inset 0 0 0 1px rgba(201,168,76,.4); }
.hwb-clock-l { font: 700 9.5px/1 'Inter', sans-serif; letter-spacing: .12em; text-transform: uppercase; color: #e9c46a; }
.hwb-clock b { font: 800 14px/1 'Inter', sans-serif; font-variant-numeric: tabular-nums; letter-spacing: .02em; color: #fff; }
.hwb-cta { flex: none; padding: 9px 13px; border-radius: 10px; font: 800 12.5px/1 'Inter', sans-serif; color: #2a0a0e;
  background: linear-gradient(180deg, #f6e3a8, #c9a84c); transition: transform .2s ease; }
.hwb:hover .hwb-cta { transform: translateX(2px); }
.hwb-spider { position: absolute; left: 128px; top: 0; z-index: 1; display: flex; flex-direction: column; align-items: center; color: #0e0204;
  animation: hwbDangle 6s ease-in-out infinite; transform-origin: 50% 0; pointer-events: none; }
.hwb-spider i { display: block; width: 1px; height: 10px; background: rgba(233,196,106,.75); animation: hwbThread 6s ease-in-out infinite; }
.hwb-spider svg { filter: drop-shadow(0 0 3px rgba(255,170,90,.6)); }
@keyframes hwbDangle { 0%, 100% { transform: rotate(-6deg); } 50% { transform: rotate(6deg); } }
@keyframes hwbThread { 0%, 100% { height: 4px; } 45%, 60% { height: 14px; } }
.hwb-x { position: absolute; top: 50%; right: 8px; transform: translateY(-50%); width: 24px; height: 24px; display: grid; place-items: center;
  border: 0; border-radius: 999px; color: rgba(251,238,224,.85); background: rgba(255,255,255,.12); cursor: pointer; z-index: 2; }
.hwb-x:hover { background: rgba(255,255,255,.24); color: #fff; }
@media (max-width: 1100px) { .hwb-cta { display: none; } }
@media (max-width: 640px) {
  .hwb { gap: 8px; height: 42px; padding: 0 36px 0 6px; border-radius: 12px; }
  .hwb-tag { width: 30px; height: 30px; padding: 0; justify-content: center; font-size: 0; letter-spacing: 0; }
  .hwb-tag-ic { font-size: 16px; }
  .hwb-clock-l { display: none; }
  .hwb-clock { min-width: 0; padding: 6px 8px; width: 104px; }
  .hwb-clock b { font-size: 12px; }
  .hwb-item { font-size: 12px; }
  .hwb-dot { margin: 0 12px; }
  .hwb-spider { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .hwb-run, .hwb-glow, .hwb-tag, .hwb-bat, .hwb-spider, .hwb-spider i { animation: none !important; }
  .hwb-bats { display: none; }
  .hwb-track { -webkit-mask-image: none; mask-image: none; text-overflow: ellipsis; }
  .hwb-group[aria-hidden] { display: none; }
}
`;
