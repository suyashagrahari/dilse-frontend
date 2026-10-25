"use client";

// ─── The running wedding-season strip ────────────────────────────────────────
//
// The wedding twin of FestivalOfferBar / HalloweenOfferBar: a moving marquee
// directly under the navbar on the home page, the blog and the gallery while a
// super admin has the site in "wedding" mode (/admin/season). Where the
// festival strips are a night, this one is daylight silk: ivory and blush with
// a gold-zari edge sliding round the rim, a string of marigolds along the top,
// a sindoor-red "% OFF" pill with interlocked rings, a gold jhumka swinging
// beside it, and the countdown in a blush pill. Taps go to /wedding-offer.
//
// Same box as the other strips (52px, 46px on phones, same rim and margin), so
// SeasonPendingStrip can hold its place and the home page's `fsb-home` rules
// place it. Dismissible for the session with the same key as every strip.
// Nothing changes size after it paints (fixed-width clock with dashes until
// the client clock starts).

import Link from "next/link";
import { X } from "lucide-react";
import { useHalloweenBarDismissed, useSeason } from "@/hooks/useSeason";
import { useNow } from "@/hooks/usePromo";
import { useDropFree } from "@/hooks/useDropFree";
import { dismissHalloweenBar, DROPS } from "@/lib/season";
import { Marigold } from "./festivalArt";
import { dropClock } from "./FestivalOfferBar";
import { Jhumka, Rings } from "./weddingArt";
import { wtVars } from "./weddingTheme";

export default function WeddingOfferBar({ source, className = "" }: { source: string; className?: string }) {
  const season = useSeason();
  const dismissed = useHalloweenBarDismissed();
  const t = useNow();
  const free = useDropFree("wedding");
  if (season?.mode !== "wedding" || dismissed) return null;

  const pct = season.sale.enabled ? season.sale.percent : 0;
  const drop = DROPS.wedding;
  const clock = dropClock(drop.endsAt, t);
  const ended = !!t && !clock;
  const items = [
    free
      ? <><Rings size={18} /> THE WEDDING SEASON DROP · <b className="wsb-hot">FREE</b></>
      : pct
      ? <><Rings size={18} /> THE WEDDING SEASON DROP · <b className="wsb-hot">{pct}% OFF</b></>
      : <><Rings size={18} /> THE WEDDING SEASON DROP is here</>,
    <><Marigold size={15} /> Invitations that open like a celebration</>,
    <>🦚 Palace doors, peacock gardens &amp; lotus temples</>,
    <><Marigold size={15} /> Haldi to reception on one link · RSVP per function</>,
    ended ? <>💍 The shehnai plays on — open the drop</> : <><Rings size={16} /> Season offer ends 31 Dec</>,
    free ? <><Marigold size={15} /> Free to make &amp; send · no payment</> : <><Marigold size={15} /> Try it free · pay only when you publish</>,
  ];
  const label = free
    ? "Wedding season drop: the wedding invitations are free, ends 31 December. See them."
    : pct
    ? `Wedding season drop: ${pct}% off the wedding invitations, ends 31 December. See the offer.`
    : "The wedding season drop: digital wedding invitations that open like a celebration. See them.";
  const group = (hidden: boolean) => (
    <span className="wsb-group" aria-hidden={hidden || undefined}>
      {items.map((s, i) => (
        <span key={i} className="wsb-item">{s}<i className="wsb-dot" /></span>
      ))}
    </span>
  );

  return (
    <div className={`wsb-wrap fsb-wrap ${className}`} data-src={source} style={wtVars()}>
      <style>{WSB_CSS}</style>
      <span className="wsb-edge" aria-hidden />
      <Link href={drop.path} className="wsb" aria-label={label} prefetch={false}>
        <span className="wsb-silk" aria-hidden />
        <span className="wsb-beads" aria-hidden />
        <span className="wsb-glow" aria-hidden />
        <span className="wsb-tag">
          <span className="wsb-tag-ic" aria-hidden><Rings size={16} /></span>
          {free ? "FREE" : pct ? <>{pct}%<span className="wsb-tag-off">&nbsp;OFF</span></> : "NEW"}
        </span>
        <span className="wsb-jh" aria-hidden><Jhumka size={14} /></span>
        <span className="wsb-track">
          <span className="wsb-run">{group(false)}{group(true)}</span>
        </span>
        {!ended && (
          <span className="wsb-clock" aria-hidden>
            <span className="wsb-clock-l">Ends in</span>
            <b>{clock ?? "--d --:--:--"}</b>
          </span>
        )}
        <span className="wsb-cta" aria-hidden>
          <span className="wsb-cta-full">See the drop</span>
          <span className="wsb-cta-mid">Open</span>
          <span>→</span>
        </span>
      </Link>
      <button type="button" className="wsb-x" aria-label="Hide the wedding offer" onClick={dismissHalloweenBar}>
        <X size={13} strokeWidth={2.6} />
      </button>
    </div>
  );
}

const WSB_CSS = `
html[data-hw-bar-off] .wsb-wrap { display: none !important; }
.wsb-wrap { position: relative; isolation: isolate; margin: 0 0 18px; padding: 2px; border-radius: 17px;
  box-shadow: 0 14px 30px -16px rgba(110,30,40,.45), 0 0 22px -8px var(--wt-glow); }
.wsb-edge { position: absolute; inset: 0; z-index: -1; border-radius: inherit; pointer-events: none;
  background: linear-gradient(100deg, var(--wt-gold), var(--wt-gold-soft), var(--wt-rose), #fff6e0, var(--wt-marigold), var(--wt-gold-soft), var(--wt-gold));
  background-size: 300% 100%; animation: wsbEdge 7s linear infinite; }
@keyframes wsbEdge { from { background-position: 0% 0; } to { background-position: 150% 0; } }
.wsb { position: relative; isolation: isolate; overflow: hidden; display: flex; align-items: center; gap: 10px; height: 52px; padding: 0 46px 0 8px;
  border-radius: 15px; text-decoration: none; color: var(--wt-ink);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.7), inset 0 -10px 22px -16px rgba(201,95,113,.5); }
.wsb-silk { position: absolute; inset: 0; z-index: -3; pointer-events: none;
  background:
    radial-gradient(circle at 50% 50%, rgba(195,154,67,.28) 0 .9px, transparent 1.3px) 0 0 / 14px 14px,
    radial-gradient(120% 220% at 6% 130%, rgba(244,162,28,.22) 0%, transparent 42%),
    radial-gradient(90% 220% at 78% -60%, rgba(231,154,163,.38) 0%, transparent 52%),
    linear-gradient(100deg, #fff8ee 0%, #fdf0e8 45%, #fbe6e1 70%, #fff8ee 100%); }
/* a string of tiny marigolds along the top edge */
.wsb-beads { position: absolute; left: 0; right: 0; top: 0; height: 5px; z-index: -2; pointer-events: none; opacity: .9;
  background-image: radial-gradient(circle at 50% 30%, var(--wt-marigold) 2px, transparent 2.4px), radial-gradient(circle at 50% 30%, var(--wt-marigold-deep) 1.6px, transparent 2px);
  background-size: 16px 5px, 16px 5px; background-position: 0 0, 8px 0; }
.wsb-glow { position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background: linear-gradient(105deg, transparent 38%, rgba(255,255,255,.75) 48%, rgba(242,222,164,.4) 52%, transparent 62%); background-size: 260% 100%;
  animation: wsbShine 5s ease-in-out infinite; }
@keyframes wsbShine { from { background-position: 130% 0; } to { background-position: -30% 0; } }
.wsb-tag { position: relative; z-index: 1; flex: none; display: inline-flex; align-items: center; gap: 5px; height: 34px; padding: 0 14px 0 8px; border-radius: 999px;
  font: 800 12.5px/1 'Inter', sans-serif; letter-spacing: .08em; color: #fff3d6; white-space: nowrap;
  background: linear-gradient(180deg, #b8324a, var(--wt-sindoor) 55%, var(--wt-sindoor-deep));
  box-shadow: 0 0 0 1px var(--wt-gold), 0 0 0 3px rgba(255,250,242,.9), 0 0 0 4px rgba(195,154,67,.45), 0 6px 14px -6px rgba(110,16,34,.6); }
.wsb-tag-ic { display: inline-flex; letter-spacing: 0; }
.wsb-tag-ic svg { display: block; }
.wsb-jh { flex: none; display: grid; place-items: start center; width: 16px; height: 46px; margin-top: -6px; transform-origin: 50% 0; animation: wsbJh 2.8s ease-in-out infinite; }
.wsb-jh svg { filter: drop-shadow(0 2px 2px rgba(110,70,10,.3)); }
@keyframes wsbJh { 0%, 100% { transform: rotate(-12deg); } 50% { transform: rotate(12deg); } }
.wsb-track { flex: 1; min-width: 0; overflow: hidden; white-space: nowrap;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 28px, #000 calc(100% - 28px), transparent);
  mask-image: linear-gradient(90deg, transparent, #000 28px, #000 calc(100% - 28px), transparent); }
.wsb-run { display: inline-flex; animation: wsbScroll 42s linear infinite; will-change: transform; }
.wsb:hover .wsb-run, .wsb:focus-visible .wsb-run { animation-play-state: paused; }
.wsb-group { display: inline-flex; flex: none; padding-left: 24px; }
.wsb-item { display: inline-flex; align-items: center; gap: 7px; font: 600 14px/1 'Inter', sans-serif; letter-spacing: .01em; color: var(--wt-ink); }
.wsb-item svg { flex: none; }
.wsb-hot { color: var(--wt-sindoor); }
.wsb-dot { position: relative; display: inline-block; width: 6px; height: 6px; margin: 0 18px; transform: rotate(45deg); background: var(--wt-gold);
  box-shadow: 8px -8px 0 -2px var(--wt-rose), -8px 8px 0 -2px var(--wt-marigold); }
@keyframes wsbScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.wsb-clock { position: relative; z-index: 1; flex: none; display: inline-flex; align-items: baseline; gap: 6px; padding: 8px 11px; border-radius: 11px; min-width: 158px; justify-content: center;
  background: rgba(249,225,220,.85); box-shadow: inset 0 0 0 1px var(--wt-edge); }
.wsb-clock-l { font: 700 9.5px/1 'Inter', sans-serif; letter-spacing: .12em; text-transform: uppercase; color: var(--wt-gold-deep); }
.wsb-clock b { font: 800 15px/1 'Inter', sans-serif; font-variant-numeric: tabular-nums; letter-spacing: .02em; color: var(--wt-ink); white-space: nowrap; }
.wsb-cta { position: relative; z-index: 1; flex: none; display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 14px; border-radius: 11px;
  font: 800 13px/1 'Inter', sans-serif; color: #fff3d6; white-space: nowrap;
  background: linear-gradient(180deg, #b8324a, var(--wt-sindoor) 60%, var(--wt-sindoor-deep)); box-shadow: inset 0 0 0 1px rgba(242,222,164,.55), 0 6px 14px -6px rgba(110,16,34,.6);
  transition: transform .2s ease; }
.wsb-cta-mid { display: none; }
.wsb:hover .wsb-cta { transform: translateX(2px); }
.wsb-x { position: absolute; top: 50%; right: 12px; transform: translateY(-50%); width: 26px; height: 26px; display: grid; place-items: center;
  border: 0; border-radius: 999px; color: var(--wt-ink); background: rgba(195,154,67,.18); cursor: pointer; z-index: 4; }
.wsb-x:hover { background: rgba(195,154,67,.32); }
@media (max-width: 1100px) {
  .wsb-cta-full { display: none; }
  .wsb-cta-mid { display: inline; }
}
@media (max-width: 640px) {
  .wsb-wrap { padding: 1.5px; border-radius: 14px; }
  .wsb { gap: 6px; height: 46px; padding: 0 36px 0 5px; border-radius: 12.5px; }
  .wsb-tag { height: 30px; padding: 0 9px; font-size: 12px; letter-spacing: .02em; box-shadow: 0 0 0 1px var(--wt-gold), 0 4px 10px -5px rgba(110,16,34,.6); }
  .wsb-tag-ic, .wsb-tag-off, .wsb-jh { display: none; }
  .wsb-track { -webkit-mask-image: linear-gradient(90deg, transparent, #000 14px, #000 calc(100% - 14px), transparent);
    mask-image: linear-gradient(90deg, transparent, #000 14px, #000 calc(100% - 14px), transparent); }
  .wsb-group { padding-left: 12px; }
  .wsb-item { font-size: 12.5px; }
  .wsb-dot { margin: 0 14px; }
  .wsb-clock-l { display: none; }
  .wsb-clock { min-width: 0; width: 90px; padding: 7px 0; }
  .wsb-clock b { font-size: 11.5px; }
  .wsb-cta { width: 30px; height: 30px; padding: 0; border-radius: 999px; font-size: 15px; }
  .wsb-cta-mid { display: none; }
  .wsb-x { right: 7px; width: 24px; height: 24px; }
}
@media (prefers-reduced-motion: reduce) {
  .wsb-edge, .wsb-run, .wsb-glow, .wsb-jh { animation: none !important; }
  .wsb-track { -webkit-mask-image: none; mask-image: none; text-overflow: ellipsis; }
  .wsb-group[aria-hidden] { display: none; }
}
`;
