"use client";

// ─── The wedding-season card inside a blog post ──────────────────────────────
//
// Takes the Valentine/Halloween/festival countdown card's place while the site
// is in "wedding" mode. Daylight silk, not a night: a marigold toran swagged
// across the top with two gold jhumkas swaying under it, rose and marigold
// petals drifting through, the bride and groom on one side and a peacock in
// flowers on the other, and the offer on frosted ivory glass framed in a
// double gold-zari border. Counts down to 31 December → /wedding-offer.
//
// The couple and the peacock are the /wedding hub's CDN art, loaded after idle
// into boxes already sized; every animation stops under reduced motion.

import Link from "next/link";
import { useSeason } from "@/hooks/useSeason";
import { useDropFree } from "@/hooks/useDropFree";
import { useNow, countdown, pad2 } from "@/hooks/usePromo";
import { DROPS } from "@/lib/season";
import IdleGif from "./IdleGif";
import { WeddingPetals } from "./WeddingDecor";
import { Jhumka, MarigoldToran, Rings } from "./weddingArt";
import { GOLD_TEXT, WEDDING_LUX, wtVars } from "./weddingTheme";

export default function WeddingOfferCard({ className = "" }: { className?: string }) {
  const season = useSeason();
  const t = useNow();
  const free = useDropFree("wedding");
  if (season?.mode !== "wedding") return null;

  const drop = DROPS.wedding;
  const pct = season.sale.enabled ? season.sale.percent : 0;
  const c = countdown(drop.endsAt, t || drop.endsAt);
  const live = !t || c.totalMs > 0;
  const boxes = [
    { v: c.d, l: "Days" },
    { v: c.h, l: "Hours" },
    { v: c.m, l: "Mins" },
    { v: c.s, l: "Secs" },
  ];

  return (
    <aside className={`woc ${className}`} style={wtVars()} aria-label={free ? "Wedding season drop: free" : pct ? `Wedding season drop: ${pct}% off` : "The wedding season drop"}>
      <style>{WOC_CSS}</style>
      <WeddingPetals scope="parent" />
      <span className="woc-toran" aria-hidden><MarigoldToran n={6} /></span>
      <span className="woc-jh woc-jh-l" aria-hidden><i /><Jhumka size={26} /></span>
      <span className="woc-jh woc-jh-r" aria-hidden><i /><Jhumka size={26} /></span>
      <IdleGif src={WEDDING_LUX("c-wedding-600.webp")} width={334} height={600} className="woc-couple" />
      <IdleGif src={WEDDING_LUX("peacock-flowers-360.webp")} width={196} height={360} className="woc-peacock" />

      <div className="woc-glass">
        <span className="woc-tag"><Rings size={14} /> WEDDING SEASON DROP · {live ? "TILL 31 DEC" : "THE SHEHNAI PLAYS ON"}</span>
        {free ? (
          <p className="woc-pct is-free"><b>FREE</b></p>
        ) : pct ? (
          <p className="woc-pct"><b>{pct}%</b><span>OFF</span></p>
        ) : (
          <p className="woc-title">Invitations that open like a celebration</p>
        )}
        <p className="woc-sub">
          Palace doors, peacock gardens, lotus temples and Christian chapels — <b>Haldi to reception on one link</b>, RSVP per function, your music and photos.
          {free ? " Free to make and send — no payment." : pct ? " Try it free; the sale price is applied when you publish." : " Try it free and publish when you love it."}
        </p>
        {live && (
          <div className="woc-clock" role="timer" aria-label={t ? `Ends in ${c.d} days ${c.h} hours ${c.m} minutes` : "Ends on 31 December"}>
            {boxes.map((b) => (
              <span key={b.l} className="woc-box">
                <b>{t ? pad2(b.v) : "--"}</b>
                <small>{b.l}</small>
              </span>
            ))}
          </div>
        )}
        <Link href={drop.path} className="woc-cta" prefetch={false}>
          <Rings size={18} /> See the wedding drop
        </Link>
        <p className="woc-proof">Shubh Vivah! <span>· Ready in minutes · send on WhatsApp</span></p>
      </div>
    </aside>
  );
}

const WOC_CSS = `
.woc { position: relative; isolation: isolate; overflow: hidden; margin: 32px 0; padding: 62px 22px 70px; border-radius: 24px; text-align: center; color: var(--wt-ink);
  background: var(--wt-silk);
  box-shadow: 0 30px 60px -34px rgba(110,30,40,.45), inset 0 0 0 1px var(--wt-edge); }
.woc::before { content: ""; position: absolute; inset: 9px; z-index: -1; border-radius: 17px; pointer-events: none;
  box-shadow: inset 0 0 0 1px rgba(195,154,67,.55), inset 0 0 0 4px rgba(255,250,242,.6), inset 0 0 0 5px rgba(195,154,67,.3); }
.woc-toran { position: absolute; z-index: 1; left: -4px; right: -4px; top: -2px; display: block; pointer-events: none; transform-origin: 50% 0;
  filter: drop-shadow(0 3px 3px rgba(110,40,10,.22)); animation: wocSwing 7s ease-in-out infinite; }
.woc-toran svg { display: block; width: 100%; height: auto; }
@keyframes wocSwing { 0%, 100% { transform: rotate(-.5deg); } 50% { transform: rotate(.5deg); } }
.woc-jh { position: absolute; z-index: 1; top: 34px; display: block; transform-origin: 50% 0; animation: wocJh 3.2s ease-in-out infinite; pointer-events: none; }
.woc-jh i { position: absolute; left: 50%; top: -18px; width: 1px; height: 18px; background: #c39a43; }
.woc-jh svg { display: block; filter: drop-shadow(0 4px 5px rgba(110,70,10,.3)); }
.woc-jh-l { left: 9%; }
.woc-jh-r { right: 9%; animation-delay: -1.6s; }
@keyframes wocJh { 0%, 100% { transform: rotate(-8deg); } 50% { transform: rotate(8deg); } }
.woc-couple { position: absolute; z-index: 0; left: 2%; bottom: 0; width: 92px; height: 165px; filter: drop-shadow(0 8px 14px rgba(110,30,40,.25)); }
.woc-peacock { position: absolute; z-index: 0; right: 1%; bottom: 4px; width: 82px; height: 150px; opacity: .95; }
/* the glass */
.woc-glass { position: relative; z-index: 2; max-width: 450px; margin: 0 auto; padding: 22px 20px 20px; border-radius: 22px;
  background: var(--wt-glass); -webkit-backdrop-filter: blur(12px) saturate(1.15); backdrop-filter: blur(12px) saturate(1.15);
  box-shadow: inset 0 0 0 1px var(--wt-edge), inset 0 0 0 5px rgba(255,255,255,.55), inset 0 0 0 6px rgba(195,154,67,.28), 0 22px 40px -26px rgba(110,30,40,.5); }
.woc-tag { display: inline-flex; align-items: center; gap: 6px; padding: 7px 13px; border-radius: 999px; font: 800 10.5px/1.2 'Inter', sans-serif; letter-spacing: .14em;
  color: #fff3d6; background: linear-gradient(180deg, #b8324a, var(--wt-sindoor) 60%, var(--wt-sindoor-deep)); box-shadow: 0 0 0 1px var(--wt-gold), 0 6px 14px -6px rgba(110,16,34,.55); }
.woc-pct { margin: 14px 0 8px; display: flex; align-items: flex-start; justify-content: center; gap: 6px; line-height: .9; }
.woc-pct b { font: 700 78px/0.9 'Playfair Display', serif; background: ${GOLD_TEXT}; -webkit-background-clip: text; background-clip: text; color: transparent;
  filter: drop-shadow(0 3px 0 rgba(143,106,34,.18)); padding: .1em .04em .2em; margin: -.1em -.04em -.2em; }
.woc-pct.is-free b { font-size: 66px; letter-spacing: .02em; }
.woc-pct span { margin-top: 10px; font: 800 18px/1 'Inter', sans-serif; letter-spacing: .14em; color: var(--wt-sindoor); }
.woc-title { margin: 16px 0 8px; font: italic 600 32px/1.12 'Playfair Display', serif; color: var(--wt-ink); }
.woc-sub { max-width: 31rem; margin: 6px auto 0; font: 400 14px/1.55 'Inter', sans-serif; color: var(--wt-ink-soft); }
.woc-sub b { color: var(--wt-ink); font-weight: 600; }
.woc-clock { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; max-width: 340px; margin: 18px auto 0; }
.woc-box { display: flex; flex-direction: column; align-items: center; gap: 5px; padding: 11px 0 9px; border-radius: 40px 40px 14px 14px / 26px 26px 14px 14px;
  background: linear-gradient(180deg, #fff, var(--wt-blush)); box-shadow: inset 0 0 0 1px var(--wt-edge), 0 6px 12px -8px rgba(110,30,40,.35); }
.woc-box b { font: 800 24px/1 'Inter', sans-serif; font-variant-numeric: tabular-nums; color: var(--wt-ink); }
.woc-box small { font: 700 9.5px/1 'Inter', sans-serif; letter-spacing: .14em; text-transform: uppercase; color: var(--wt-gold-deep); }
.woc-cta { display: inline-flex; align-items: center; justify-content: center; gap: 8px; margin-top: 18px; padding: 14px 26px; border-radius: 999px;
  font: 800 15px/1 'Inter', sans-serif; color: #fff3d6; text-decoration: none;
  background: linear-gradient(180deg, #b8324a, var(--wt-sindoor) 60%, var(--wt-sindoor-deep));
  box-shadow: 0 0 0 1px var(--wt-gold), 0 0 0 3px rgba(255,250,242,.9), 0 0 0 4px rgba(195,154,67,.4), 0 14px 26px -12px rgba(110,16,34,.6);
  transition: transform .2s ease; }
.woc-cta:hover { transform: translateY(-2px); }
.woc-proof { margin: 14px 0 0; font: italic 600 14px/1.4 'Playfair Display', serif; color: var(--wt-sindoor); }
.woc-proof span { font: 500 12.5px/1.4 'Inter', sans-serif; font-style: normal; color: var(--wt-ink-soft); }
@media (max-width: 720px) {
  .woc-couple { width: 70px; height: 126px; }
  .woc-peacock { width: 62px; height: 114px; }
}
@media (max-width: 480px) {
  .woc { padding: 52px 10px 128px; border-radius: 20px; }
  .woc-glass { padding: 18px 12px 16px; border-radius: 18px; }
  .woc-pct b { font-size: 64px; }
  .woc-title { font-size: 26px; }
  .woc-box b { font-size: 21px; }
  .woc-cta { width: 100%; padding: 14px 12px; }
  .woc-jh { top: 24px; }
  .woc-jh svg { width: 20px; height: 34px; }
  .woc-couple { left: 6%; width: 64px; height: 115px; }
  .woc-peacock { right: 6%; width: 58px; height: 106px; }
}
@media (prefers-reduced-motion: reduce) { .woc * { animation: none !important; } }
`;
