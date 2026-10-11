"use client";

// ─── The Halloween card inside a blog post ───────────────────────────────────
//
// Takes the place of the Valentine countdown card (PromoCountdownCard) while
// the site is in Halloween mode: the haunted-house night from the template —
// frosted navy glass over the night sky, a butter moon, the lavender house with
// its one lit window on the hill, webs flush in the corners, a spider on a
// thread, a floating ghost and a grave — with the offer, a countdown to
// 31 October and one pumpkin button to /halloween-offer. The two GIFs load
// after idle into boxes that are already sized.

import Link from "next/link";
import { useSeason } from "@/hooks/useSeason";
import { useNow, countdown, pad2 } from "@/hooks/usePromo";
import { HALLOWEEN_ENDS_AT, HALLOWEEN_GIF, HALLOWEEN_PATH } from "@/lib/season";
import { CornerWeb, Spider } from "./halloweenArt";
import { HW, HW_SKY } from "./halloweenTheme";
import HauntedHouseArt from "./HauntedHouseArt";
import IdleGif from "./IdleGif";

export default function HalloweenOfferCard({ className = "" }: { className?: string }) {
  const season = useSeason();
  const t = useNow();
  if (season?.mode !== "halloween") return null;

  const pct = season.sale.enabled ? season.sale.percent : 0;
  const c = countdown(HALLOWEEN_ENDS_AT, t || HALLOWEEN_ENDS_AT);
  const live = !t || c.totalMs > 0;
  const boxes = [
    { v: c.d, l: "Days" },
    { v: c.h, l: "Hours" },
    { v: c.m, l: "Mins" },
    { v: c.s, l: "Secs" },
  ];

  return (
    <aside className={`hoc ${className}`} aria-label={pct ? `Halloween drop: ${pct}% off` : "The Halloween drop"}>
      <style>{HOC_CSS}</style>
      <span className="hoc-moon" aria-hidden />
      <span className="hoc-orb hoc-orb1" aria-hidden />
      <span className="hoc-orb hoc-orb2" aria-hidden />
      <HauntedHouseArt uid="hoc" className="hoc-house" />
      <span className="hoc-fog" aria-hidden />
      <CornerWeb size={120} className="hoc-web hoc-web-l" />
      <CornerWeb size={104} className="hoc-web hoc-web-r" />
      <span className="hoc-spider" aria-hidden><i /><Spider size={22} /></span>
      <IdleGif src={HALLOWEEN_GIF("grave-zombie-hand.webp")} width={150} height={139} className="hoc-grave" />
      <IdleGif src={HALLOWEEN_GIF("ghost-running.webp")} width={220} height={220} className="hoc-ghost" />

      <div className="hoc-glass">
        <span className="hoc-tag">🎃 HALLOWEEN DROP · {live ? "ENDS 31 OCT" : "STILL HAUNTING"}</span>
        {pct ? (
          <p className="hoc-pct"><b>{pct}%</b><span>OFF</span></p>
        ) : (
          <p className="hoc-title">The Halloween Drop</p>
        )}
        <p className="hoc-sub">
          Two spooky-cute love letters — <b>The Little Haunted House</b> and <b>Boo-tiful Night ✦ Premium</b>.
          {pct ? " Try them free; the sale price is applied when you publish." : " Try them free and publish when you love it."}
        </p>
        {live && (
          <div className="hoc-clock" role="timer" aria-label={t ? `Ends in ${c.d} days ${c.h} hours ${c.m} minutes` : "Ends 31 October"}>
            {boxes.map((b) => (
              <span key={b.l} className="hoc-box">
                <b>{t ? pad2(b.v) : "--"}</b>
                <small>{b.l}</small>
              </span>
            ))}
          </div>
        )}
        <Link href={HALLOWEEN_PATH} className="hoc-cta" prefetch={false}>
          <span aria-hidden>👻</span> Enter the haunted drop
        </Link>
        <p className="hoc-proof">Will you be my boo? <span>· Ready in 2 minutes</span></p>
      </div>
    </aside>
  );
}

const HOC_CSS = `
.hoc { position: relative; isolation: isolate; overflow: hidden; margin: 32px 0; padding: 34px 22px 26px; border-radius: 24px; text-align: center; color: ${HW.text};
  background: ${HW_SKY};
  box-shadow: 0 30px 60px -30px rgba(23,19,42,.95), 0 0 0 1px rgba(23,19,42,.2), inset 0 0 0 1px ${HW.glassEdge}, 0 0 34px -10px rgba(185,166,240,.55); }
.hoc::before { content: ""; position: absolute; inset: 8px; z-index: -1; border-radius: 18px; border: 1px dashed rgba(185,166,240,.24); pointer-events: none; }
.hoc-moon { position: absolute; z-index: -3; top: 22px; right: 9%; width: 92px; height: 92px; border-radius: 50%;
  background: radial-gradient(circle at 38% 36%, #fffbea 0%, #fff0c4 38%, ${HW.moon} 66%, #e6c373 100%); box-shadow: 0 0 60px 18px ${HW.moonGlow}; }
.hoc-orb { position: absolute; z-index: -3; width: 10px; height: 10px; border-radius: 50%; background: rgba(185,166,240,.75); box-shadow: 0 0 16px 6px rgba(185,166,240,.4);
  animation: hocOrb 7s ease-in-out infinite; }
.hoc-orb1 { left: 16%; top: 44%; }
.hoc-orb2 { left: 30%; bottom: 18%; width: 7px; height: 7px; background: rgba(255,195,90,.7); box-shadow: 0 0 14px 5px rgba(255,195,90,.35); animation-delay: -3s; }
@keyframes hocOrb { 0%, 100% { transform: translate(0,0); opacity: .5; } 50% { transform: translate(8px,-12px); opacity: 1; } }
.hoc-house { position: absolute; z-index: -2; right: -4px; bottom: -4px; width: 230px; height: auto; opacity: .95; pointer-events: none; }
.hoc-fog { position: absolute; z-index: -1; left: -10%; right: -10%; bottom: -10px; height: 90px; pointer-events: none;
  background: radial-gradient(50% 60% at 30% 100%, rgba(185,166,240,.28), transparent 70%), radial-gradient(45% 55% at 75% 100%, rgba(185,166,240,.22), transparent 70%);
  filter: blur(6px); animation: hocFog 14s ease-in-out infinite alternate; }
@keyframes hocFog { from { transform: translateX(-4%); } to { transform: translateX(4%); } }
.hoc-web { position: absolute; top: 0; z-index: 0; color: rgba(226,216,250,.42); pointer-events: none; }
.hoc-web-l { left: 0; }
.hoc-web-r { right: 0; transform: scaleX(-1); }
.hoc-spider { position: absolute; top: 0; left: 15%; z-index: 0; display: flex; flex-direction: column; align-items: center; color: #0d0a16;
  transform-origin: 50% 0; animation: hocDangle 5s ease-in-out infinite; pointer-events: none; }
.hoc-spider i { display: block; width: 1px; height: 42px; background: rgba(185,166,240,.75); animation: hocThread 5s ease-in-out infinite; }
.hoc-spider svg { filter: drop-shadow(0 0 5px rgba(185,166,240,.9)); }
@keyframes hocDangle { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
@keyframes hocThread { 0%, 100% { height: 30px; } 50% { height: 58px; } }
.hoc-grave { position: absolute; left: 10px; bottom: 2px; width: 78px; height: 72px; z-index: 0; opacity: .92; }
.hoc-ghost { position: absolute; left: 7%; top: 46%; width: 66px; height: 66px; z-index: 0; animation: hocFloat 4.5s ease-in-out infinite; }
@keyframes hocFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
/* The frosted navy glass the offer sits on. */
.hoc-glass { position: relative; z-index: 1; max-width: 450px; margin: 0 auto; padding: 22px 20px 20px; border-radius: 22px;
  background: ${HW.glass}; -webkit-backdrop-filter: blur(14px) saturate(1.2); backdrop-filter: blur(14px) saturate(1.2);
  box-shadow: inset 0 0 0 1px ${HW.glassEdge}, 0 20px 40px -24px rgba(13,10,22,.9); }
.hoc-tag { display: inline-block; padding: 7px 13px; border-radius: 999px; font: 800 10.5px/1 'Inter', sans-serif; letter-spacing: .16em;
  color: #2a1206; background: linear-gradient(180deg, #ffc37a, ${HW.pumpkin}); box-shadow: 0 0 18px rgba(255,154,60,.5); }
.hoc-pct { margin: 14px 0 10px; display: flex; align-items: flex-start; justify-content: center; gap: 6px; line-height: .9; }
.hoc-pct b { font: 700 78px/0.9 'Playfair Display', serif; background: linear-gradient(180deg, #ffe2ad 16%, ${HW.pumpkin} 53%, ${HW.pumpkinDeep} 83%); -webkit-background-clip: text; background-clip: text; color: transparent;
  filter: drop-shadow(0 4px 22px rgba(255,154,60,.55));
  /* clip-text paints only the padding box; pad past the .9 line box so no glyph is cut */
  padding: .1em .04em .2em; margin: -.1em -.04em -.2em; }
.hoc-pct span { margin-top: 10px; font: 800 18px/1 'Inter', sans-serif; letter-spacing: .14em; color: ${HW.lilac}; }
.hoc-title { margin: 16px 0 10px; font: 700 40px/1 'Playfair Display', serif; color: #ffd9a0; text-shadow: 0 4px 24px rgba(255,154,60,.5); }
.hoc-sub { max-width: 31rem; margin: 6px auto 0; font: 400 14px/1.55 'Inter', sans-serif; color: ${HW.muted}; }
.hoc-sub b { color: #fff; font-weight: 600; }
.hoc-clock { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; max-width: 360px; margin: 18px auto 0; }
.hoc-box { display: flex; flex-direction: column; align-items: center; gap: 5px; padding: 11px 0 9px; border-radius: 14px;
  background: linear-gradient(180deg, rgba(185,166,240,.16), rgba(13,10,22,.35)); box-shadow: inset 0 0 0 1px rgba(185,166,240,.34); }
.hoc-box b { font: 800 26px/1 'Inter', sans-serif; font-variant-numeric: tabular-nums; color: #fff; }
.hoc-box small { font: 700 9.5px/1 'Inter', sans-serif; letter-spacing: .14em; text-transform: uppercase; color: ${HW.lilac}; }
.hoc-cta { display: inline-flex; align-items: center; justify-content: center; gap: 8px; margin-top: 18px; padding: 14px 26px; border-radius: 999px;
  font: 800 15px/1 'Inter', sans-serif; color: #2a1206; text-decoration: none;
  background: linear-gradient(180deg, #ffd08f, ${HW.pumpkin} 70%, ${HW.pumpkinDeep}); box-shadow: 0 0 0 1px rgba(255,214,150,.6), 0 12px 26px -10px rgba(255,154,60,.95);
  transition: transform .2s ease, box-shadow .2s ease; }
.hoc-cta:hover { transform: translateY(-2px); box-shadow: 0 0 0 1px rgba(255,214,150,.8), 0 16px 30px -10px rgba(255,154,60,1); }
.hoc-proof { margin: 12px 0 0; font: italic 500 13px/1.4 'Playfair Display', serif; color: #fff; }
.hoc-proof span { font: 500 12.5px/1.4 'Inter', sans-serif; font-style: normal; color: ${HW.muted}; }
@media (max-width: 720px) {
  .hoc-house { width: 170px; opacity: .8; }
  .hoc-moon { width: 64px; height: 64px; right: 6%; top: 16px; }
  .hoc-ghost { left: 4%; top: 40%; width: 50px; height: 50px; }
}
@media (max-width: 480px) {
  .hoc { padding: 30px 10px 96px; border-radius: 20px; }
  .hoc-glass { padding: 18px 12px 16px; border-radius: 18px; }
  .hoc-pct b { font-size: 64px; }
  .hoc-box b { font-size: 22px; }
  .hoc-cta { width: 100%; padding: 14px 12px; }
  .hoc-house { width: 150px; right: -8px; opacity: .95; }
  .hoc-ghost { left: auto; right: 44%; top: auto; bottom: 22px; width: 46px; height: 46px; }
  .hoc-spider { left: auto; right: 22%; }
  .hoc-spider i { animation-name: hocThreadS; }
  @keyframes hocThreadS { 0%, 100% { height: 6px; } 50% { height: 16px; } }
  .hoc-grave { width: 60px; height: 56px; }
  .hoc-web-l { width: 84px; height: 84px; }
  .hoc-web-r { width: 72px; height: 72px; }
  .hoc-moon { width: 52px; height: 52px; top: 10px; right: 30%; }
}
@media (prefers-reduced-motion: reduce) { .hoc-spider, .hoc-spider i, .hoc-ghost, .hoc-orb, .hoc-fog { animation: none !important; } }
`;
