"use client";

// ─── The running festival strip: Navratri Dandiya or Diwali ──────────────────
//
// The festival twin of HalloweenOfferBar: a moving marquee directly under the
// navbar on the home page, the blog and the gallery while a super admin has the
// site in "dandiya" or "diwali" mode (/admin/season). Each festival has its own
// red (components/promo/festivalTheme.ts) and its own ornaments:
//
//   dandiya — a kumkum-red garba night: bandhani dots in the glass, mirror-work
//             discs glinting, crossed dandiya sticks that click together, a
//             mirror chip on the "% OFF" pill, a rani-pink → marigold → peacock
//             edge sliding round the rim. Taps go to /dandiya-offer.
//   diwali  — a maroon Diwali night: a diya with a live flame on the pill,
//             fireworks blooming behind the clock, rangoli dots along the rim,
//             a diya-gold edge. Taps go to /diwali-offer.
//
// Renders nothing unless the season is that festival. Dismissible for the rest
// of the session with the same key as the Halloween strip (only one season
// shows at a time), so a dismissed strip stays hidden on the next page's first
// paint. Nothing changes size after it paints (fixed-width clock with dashes
// until the client clock starts).

import Link from "next/link";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { useHalloweenBarDismissed, useSeason } from "@/hooks/useSeason";
import { useNow, countdown, pad2 } from "@/hooks/usePromo";
import { useDropFree } from "@/hooks/useDropFree";
import { dismissHalloweenBar, DROPS, type FestivalId } from "@/lib/season";
import { Burst, Dandiya, Diya, Lantern, Marigold, Mirror } from "./festivalArt";
import { FT, ftVars } from "./festivalTheme";

export function dropClock(endsAt: number, t: number): string | null {
  if (!t) return null;
  const c = countdown(endsAt, t);
  if (c.totalMs <= 0) return null;
  const hms = `${pad2(c.h)}:${pad2(c.m)}:${pad2(c.s)}`;
  return c.d > 0 ? `${c.d}d ${hms}` : hms;
}

type Copy = {
  tag: ReactNode;
  items: (pct: number, ended: boolean, free: boolean) => ReactNode[];
  label: (pct: number, free: boolean) => string;
  hide: string;
};

const COPY: Record<FestivalId, Copy> = {
  dandiya: {
    tag: <Mirror size={17} />,
    items: (pct, ended, free) => [
      free
        ? <><Mirror size={17} /> NAVRATRI DANDIYA DROP · <b className="fsb-hot">FREE</b></>
        : pct
        ? <><Mirror size={17} /> NAVRATRI DANDIYA DROP · <b className="fsb-hot">{pct}% OFF</b></>
        : <><Mirror size={17} /> THE NAVRATRI DANDIYA DROP is here</>,
      <><Dandiya size={18} /> Be my Dandiya partner?</>,
      <><Marigold size={15} /> Ask them before the dhol starts</>,
      ended ? <>🥁 The garba goes on — open the drop</> : <><Mirror size={15} /> Ends Dussehra, 20 Oct</>,
      free ? <><Marigold size={15} /> Free to make &amp; send · no payment</> : <><Marigold size={15} /> Try it free · pay only when you publish</>,
    ],
    label: (pct, free) =>
      free
        ? "Navratri Dandiya drop: the Dandiya partner invitation is free, ends Dussehra, 20 October. See it."
        : pct
        ? `Navratri Dandiya drop: ${pct}% off the Dandiya partner invitation, ends Dussehra, 20 October. See the offer.`
        : "The Navratri Dandiya drop: invite your Dandiya partner. See it.",
    hide: "Hide the Dandiya offer",
  },
  diwali: {
    tag: <Diya size={18} />,
    items: (pct, ended, free) => [
      free
        ? <><Diya size={18} /> THE DIWALI DROP · <b className="fsb-hot">FREE</b></>
        : pct
        ? <><Diya size={18} /> THE DIWALI DROP · <b className="fsb-hot">{pct}% OFF</b></>
        : <><Diya size={18} /> THE DIWALI DROP is here</>,
      <><Lantern size={14} /> Light up their Diwali</>,
      <><Marigold size={15} /> Diyas, rangoli &amp; fireworks — with your photos</>,
      ended ? <>🪔 The lights are still on — open the drop</> : <><Diya size={16} /> Ends Diwali night, 8 Nov</>,
      free ? <><Marigold size={15} /> Free to make &amp; send · no payment</> : <><Marigold size={15} /> Try it free · pay only when you publish</>,
    ],
    label: (pct, free) =>
      free
        ? "Diwali drop: the Diwali wishes are free, ends Diwali night, 8 November. See it."
        : pct
        ? `Diwali drop: ${pct}% off the Diwali wishes, ends Diwali night, 8 November. See the offer.`
        : "The Diwali drop: send a Diwali wish they light up themselves. See it.",
    hide: "Hide the Diwali offer",
  },
};

export default function FestivalOfferBar({ kind, source, className = "" }: { kind: FestivalId; source: string; className?: string }) {
  const season = useSeason();
  const dismissed = useHalloweenBarDismissed();
  const t = useNow();
  const free = useDropFree(kind);
  if (season?.mode !== kind || dismissed) return null;

  const pct = season.sale.enabled ? season.sale.percent : 0;
  const drop = DROPS[kind];
  const clock = dropClock(drop.endsAt, t);
  const ended = !!t && !clock;
  const copy = COPY[kind];
  const T = FT[kind];
  const items = copy.items(pct, ended, free);
  const group = (hidden: boolean) => (
    <span className="fsb-group" aria-hidden={hidden || undefined}>
      {items.map((s, i) => (
        <span key={i} className="fsb-item">{s}<i className="fsb-dot" /></span>
      ))}
    </span>
  );

  return (
    <div className={`fsb-wrap fsb-k-${kind} ${className}`} data-src={source} style={ftVars(kind)}>
      <style>{FSB_CSS}</style>
      <span className="fsb-edge" aria-hidden />
      <Link href={drop.path} className="fsb" aria-label={copy.label(pct, free)} prefetch={false}>
        <span className="fsb-sky" aria-hidden />
        <span className="fsb-rim" aria-hidden />
        <span className="fsb-glow" aria-hidden />
        {kind === "diwali" ? (
          <>
            <span className="fsb-fw fsb-fw1" aria-hidden><Burst size={44} color={T.flame} /></span>
            <span className="fsb-fw fsb-fw2" aria-hidden><Burst size={32} color={T.a1} /></span>
          </>
        ) : (
          <>
            <span className="fsb-glint fsb-g1" aria-hidden><Mirror size={20} /></span>
            <span className="fsb-glint fsb-g2" aria-hidden><Mirror size={14} thread={T.a1} /></span>
            <span className="fsb-glint fsb-g3" aria-hidden><Mirror size={16} thread={T.a2} /></span>
          </>
        )}
        <span className="fsb-tag">
          <span className="fsb-tag-ic" aria-hidden>{copy.tag}</span>
          {free ? "FREE" : pct ? <>{pct}%<span className="fsb-tag-off">&nbsp;OFF</span></> : "NEW"}
        </span>
        {kind === "dandiya" && <span className="fsb-sticks" aria-hidden><Dandiya size={24} /></span>}
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
      <button type="button" className="fsb-x" aria-label={copy.hide} onClick={dismissHalloweenBar}>
        <X size={13} strokeWidth={2.6} />
      </button>
    </div>
  );
}

const FSB_CSS = `
html[data-hw-bar-off] .fsb-wrap { display: none !important; }
.fsb-wrap { position: relative; isolation: isolate; margin: 0 0 18px; padding: 2px; border-radius: 17px;
  box-shadow: 0 14px 34px -14px color-mix(in srgb, var(--ft-ink) 85%, transparent), 0 0 22px -4px var(--ft-glow);
  animation: fsbPulse 3.2s ease-in-out infinite; }
.fsb-edge { position: absolute; inset: 0; z-index: -1; border-radius: inherit; pointer-events: none;
  background: linear-gradient(100deg, var(--ft-cta), var(--ft-gold-soft), var(--ft-a1), var(--ft-cta), var(--ft-a2), var(--ft-gold), var(--ft-cta));
  background-size: 300% 100%; animation: fsbEdge 6s linear infinite; }
.fsb-k-diwali .fsb-edge { background: linear-gradient(100deg, var(--ft-gold), var(--ft-gold-soft), var(--ft-cta-deep), var(--ft-flame), #fff3cf, var(--ft-gold), var(--ft-gold));
  background-size: 300% 100%; }
@keyframes fsbEdge { from { background-position: 0% 0; } to { background-position: 150% 0; } }
@keyframes fsbPulse { 50% { box-shadow: 0 14px 34px -14px color-mix(in srgb, var(--ft-ink) 85%, transparent), 0 0 32px 0 var(--ft-glow); } }
.fsb { position: relative; isolation: isolate; overflow: hidden; display: flex; align-items: center; gap: 10px; height: 52px; padding: 0 46px 0 8px;
  border-radius: 15px; text-decoration: none; color: var(--ft-text);
  background: var(--ft-glass); -webkit-backdrop-filter: blur(14px) saturate(1.3); backdrop-filter: blur(14px) saturate(1.3);
  box-shadow: inset 0 0 0 1px var(--ft-edge), inset 0 -12px 24px -16px var(--ft-glow); }
.fsb-sky { position: absolute; inset: 0; z-index: -3; pointer-events: none; }
/* Dandiya: kumkum red with a bandhani dot field and a marigold under-glow */
.fsb-k-dandiya .fsb-sky {
  background:
    radial-gradient(circle at 50% 50%, rgba(255,240,220,.42) 0 1.1px, transparent 1.5px) 0 0 / 16px 16px,
    radial-gradient(circle at 50% 50%, rgba(255,214,120,.32) 0 1px, transparent 1.4px) 8px 8px / 16px 16px,
    radial-gradient(120% 220% at 8% 130%, rgba(255,176,0,.42) 0%, transparent 42%),
    radial-gradient(80% 200% at 70% -40%, rgba(255,61,154,.32) 0%, transparent 50%),
    linear-gradient(100deg, rgba(110,8,16,.97) 0%, rgba(178,16,28,.94) 42%, rgba(200,22,36,.92) 64%, rgba(110,8,16,.97) 100%); }
/* Diwali: a maroon night sky with a few stars and the city's warm glow */
.fsb-k-diwali .fsb-sky {
  background:
    radial-gradient(1px 1px at 22% 30%, rgba(255,255,255,.85) 50%, transparent 51%),
    radial-gradient(1px 1px at 41% 72%, rgba(255,255,255,.6) 50%, transparent 51%),
    radial-gradient(1.4px 1.4px at 58% 22%, rgba(255,240,200,.85) 50%, transparent 51%),
    radial-gradient(1px 1px at 86% 64%, rgba(255,255,255,.6) 50%, transparent 51%),
    radial-gradient(120% 220% at 8% 130%, rgba(255,190,70,.4) 0%, transparent 42%),
    linear-gradient(100deg, rgba(40,4,8,.97) 0%, rgba(84,10,14,.94) 40%, rgba(120,16,20,.9) 66%, rgba(40,4,8,.97) 100%); }
/* the lower rim: rangoli dots (Diwali) / a mirror-stitch border (Dandiya) */
.fsb-rim { position: absolute; left: 0; right: 0; bottom: 3px; height: 4px; z-index: -2; pointer-events: none; opacity: .6;
  background-image: radial-gradient(circle, var(--ft-cta) 1.4px, transparent 1.6px), radial-gradient(circle, var(--ft-a1) 1.2px, transparent 1.4px);
  background-size: 18px 4px, 18px 4px; background-position: 0 0, 9px 0; }
.fsb-k-dandiya .fsb-rim { height: 5px; opacity: .75;
  background-image: radial-gradient(circle, var(--ft-a3) 1.6px, var(--ft-gold) 2px, transparent 2.3px), radial-gradient(circle, var(--ft-a2) 1.1px, transparent 1.3px);
  background-size: 22px 5px, 22px 5px; background-position: 0 0, 11px 0; }
.fsb-glow { position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background: linear-gradient(105deg, transparent 38%, rgba(255,247,232,.16) 48%, color-mix(in srgb, var(--ft-cta) 18%, transparent) 52%, transparent 62%); background-size: 260% 100%;
  animation: fsbShine 4.2s ease-in-out infinite; }
@keyframes fsbShine { from { background-position: 130% 0; } to { background-position: -30% 0; } }
.fsb-fw { position: absolute; z-index: -1; pointer-events: none; opacity: 0; }
.fsb-fw svg { display: block; filter: drop-shadow(0 0 6px var(--ft-glow)); }
.fsb-fw1 { right: 29%; top: -2px; animation: fsbBloom 4.8s ease-out infinite; }
.fsb-fw2 { right: 46%; top: 14px; animation: fsbBloom 4.8s ease-out 2.2s infinite; }
@keyframes fsbBloom { 0%, 8% { opacity: 0; transform: scale(.1); } 12% { opacity: 1; } 34% { opacity: 0; transform: scale(1); } 100% { opacity: 0; transform: scale(1); } }
/* mirror-work discs that catch the light one after another */
.fsb-glint { position: absolute; z-index: -1; pointer-events: none; opacity: .55; }
.fsb-glint svg { display: block; filter: drop-shadow(0 0 4px rgba(255,255,255,.5)); }
.fsb-g1 { right: 31%; top: 3px; animation: fsbGlint 3.6s ease-in-out infinite; }
.fsb-g2 { right: 47%; bottom: 4px; animation: fsbGlint 3.6s ease-in-out 1.2s infinite; }
.fsb-g3 { right: 62%; top: 6px; animation: fsbGlint 3.6s ease-in-out 2.4s infinite; }
@keyframes fsbGlint { 0%, 100% { opacity: .35; transform: rotate(0deg) scale(.92); }
  45% { opacity: .55; } 50% { opacity: 1; transform: rotate(30deg) scale(1.12); } 58% { opacity: .55; } }
.fsb-tag { position: relative; z-index: 1; flex: none; display: inline-flex; align-items: center; gap: 5px; height: 34px; padding: 0 14px 0 8px; border-radius: 999px;
  font: 800 12.5px/1 'Inter', sans-serif; letter-spacing: .08em; color: var(--ft-cta-ink); white-space: nowrap;
  background: linear-gradient(180deg, var(--ft-gold-soft), var(--ft-cta) 60%, var(--ft-cta-deep)); box-shadow: 0 0 0 1px color-mix(in srgb, var(--ft-gold-soft) 80%, transparent), 0 0 16px var(--ft-glow);
  animation: fsbTag 2.6s ease-in-out infinite; }
.fsb-tag-ic { display: inline-flex; letter-spacing: 0; }
.fsb-tag-ic svg { display: block; }
@keyframes fsbTag { 50% { box-shadow: 0 0 0 1px var(--ft-gold-soft), 0 0 26px var(--ft-cta); } }
.fsb-k-dandiya .fsb-tag-ic svg { animation: fsbSpin 6s linear infinite; }
@keyframes fsbSpin { to { transform: rotate(360deg); } }
.fsb-sticks { flex: none; display: grid; place-items: center; width: 26px; }
.fsb-sticks svg { filter: drop-shadow(0 0 4px rgba(255,214,120,.8)); }
.fsb-sticks .ft-stick-l { animation: fsbClickL 1.4s ease-in-out infinite; }
.fsb-sticks .ft-stick-r { animation: fsbClickR 1.4s ease-in-out infinite; }
@keyframes fsbClickL { 0%, 100% { transform: rotate(-14deg); } 46%, 54% { transform: rotate(4deg); } }
@keyframes fsbClickR { 0%, 100% { transform: rotate(14deg); } 46%, 54% { transform: rotate(-4deg); } }
.fsb-track { flex: 1; min-width: 0; overflow: hidden; white-space: nowrap;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 28px, #000 calc(100% - 28px), transparent);
  mask-image: linear-gradient(90deg, transparent, #000 28px, #000 calc(100% - 28px), transparent); }
.fsb-run { display: inline-flex; animation: fsbScroll 38s linear infinite; will-change: transform; }
.fsb:hover .fsb-run, .fsb:focus-visible .fsb-run { animation-play-state: paused; }
.fsb-group { display: inline-flex; flex: none; padding-left: 24px; }
.fsb-item { display: inline-flex; align-items: center; gap: 7px; font: 600 14px/1 'Inter', sans-serif; letter-spacing: .01em; color: var(--ft-text); }
.fsb-item svg { flex: none; }
.fsb-item .fv-flame { animation: fsbFlick 1.1s ease-in-out infinite alternate; transform-box: fill-box; transform-origin: 50% 100%; }
@keyframes fsbFlick { from { transform: scale(1, 1) rotate(-4deg); } to { transform: scale(.88, 1.14) rotate(4deg); } }
.fsb-hot { color: var(--ft-flame); text-shadow: 0 0 10px var(--ft-cta); }
.fsb-k-dandiya .fsb-hot { color: #fff; text-shadow: 0 0 10px var(--ft-cta), 0 0 2px var(--ft-cta); }
/* a tiny cluster between items: rangoli (Diwali) or bandhani (Dandiya) dots */
.fsb-dot { position: relative; display: inline-block; width: 5px; height: 5px; margin: 0 18px; border-radius: 50%; background: var(--ft-cta);
  box-shadow: 7px 0 0 -1px var(--ft-a1), -7px 0 0 -1px var(--ft-a2), 0 0 8px var(--ft-glow); }
.fsb-k-dandiya .fsb-dot { background: #fff4e2; box-shadow: 0 -5px 0 -1px #fff4e2, 0 5px 0 -1px #fff4e2, 5px 0 0 -1px #fff4e2, -5px 0 0 -1px #fff4e2, 0 0 8px var(--ft-glow); }
@keyframes fsbScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.fsb-clock { position: relative; z-index: 1; flex: none; display: inline-flex; align-items: baseline; gap: 6px; padding: 8px 11px; border-radius: 11px; min-width: 158px; justify-content: center;
  background: color-mix(in srgb, var(--ft-ink) 58%, transparent); box-shadow: inset 0 0 0 1px var(--ft-edge); }
.fsb-clock-l { font: 700 9.5px/1 'Inter', sans-serif; letter-spacing: .12em; text-transform: uppercase; color: var(--ft-gold-soft); }
.fsb-clock b { font: 800 15px/1 'Inter', sans-serif; font-variant-numeric: tabular-nums; letter-spacing: .02em; color: #fff; white-space: nowrap; }
.fsb-cta { position: relative; z-index: 1; flex: none; display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 14px; border-radius: 11px;
  font: 800 13px/1 'Inter', sans-serif; color: var(--ft-cta-ink); white-space: nowrap;
  background: linear-gradient(180deg, var(--ft-gold-soft), var(--ft-cta)); box-shadow: 0 0 0 1px color-mix(in srgb, var(--ft-gold-soft) 65%, transparent), 0 6px 16px -6px var(--ft-cta);
  transition: transform .2s ease; }
.fsb-cta-mid { display: none; }
.fsb:hover .fsb-cta { transform: translateX(2px); }
.fsb-x { position: absolute; top: 50%; right: 12px; transform: translateY(-50%); width: 26px; height: 26px; display: grid; place-items: center;
  border: 0; border-radius: 999px; color: rgba(255,247,232,.92); background: rgba(255,214,120,.2); cursor: pointer; z-index: 4; }
.fsb-x:hover { background: rgba(255,214,120,.36); color: #fff; }
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
  .fsb-fw2, .fsb-g3 { display: none; }
  .fsb-x { right: 7px; width: 24px; height: 24px; }
}
@media (prefers-reduced-motion: reduce) {
  .fsb-wrap, .fsb-edge, .fsb-run, .fsb-glow, .fsb-tag, .fsb-sticks *, .fsb-fw, .fsb-glint, .fsb-tag-ic svg, .fsb-item .fv-flame { animation: none !important; }
  .fsb-track { -webkit-mask-image: none; mask-image: none; text-overflow: ellipsis; }
  .fsb-group[aria-hidden] { display: none; }
}
`;
