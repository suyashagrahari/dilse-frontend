"use client";

// ─── The Halloween card inside a blog post ───────────────────────────────────
//
// Takes the place of the Valentine countdown card (PromoCountdownCard) while
// the site is in Halloween mode: a little haunted night — webs flush in the
// corners, a spider on a thread, a pumpkin glow — with the offer, a countdown
// to 31 October and one button to /halloween-offer. The two template GIFs at
// the bottom load after idle into boxes that are already sized.

import Link from "next/link";
import { useSeason } from "@/hooks/useSeason";
import { useNow, countdown, pad2 } from "@/hooks/usePromo";
import { HALLOWEEN_ENDS_AT, HALLOWEEN_GIF, HALLOWEEN_PATH } from "@/lib/season";
import { CornerWeb, Spider } from "./halloweenArt";
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
      <CornerWeb size={118} className="hoc-web hoc-web-l" />
      <CornerWeb size={96} className="hoc-web hoc-web-r" />
      <span className="hoc-spider" aria-hidden><i /><Spider size={22} /></span>
      <IdleGif src={HALLOWEEN_GIF("grave-zombie-hand.webp")} width={150} height={139} className="hoc-grave" />
      <IdleGif src={HALLOWEEN_GIF("ghost-running.webp")} width={220} height={220} className="hoc-ghost" />

      <div className="hoc-top">
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
      </div>
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
    </aside>
  );
}

const HOC_CSS = `
.hoc { position: relative; isolation: isolate; overflow: hidden; margin: 32px 0; padding: 30px 22px 24px; border-radius: 24px; text-align: center; color: #fbeee0;
  background: radial-gradient(90% 60% at 50% 115%, rgba(232,116,42,.55) 0%, transparent 60%),
    radial-gradient(120% 90% at 50% 0%, #4a1015 0%, #2a080c 48%, #12040a 100%);
  box-shadow: 0 26px 50px -30px rgba(26,5,7,.95), inset 0 0 0 1px rgba(201,168,76,.38); }
.hoc::before { content: ""; position: absolute; inset: 8px; z-index: -1; border-radius: 18px; border: 1px dashed rgba(201,168,76,.28); pointer-events: none; }
.hoc-moon { position: absolute; z-index: -1; top: 18px; right: 22%; width: 46px; height: 46px; border-radius: 50%;
  background: radial-gradient(circle at 38% 38%, #fff6dc, #f3d98f 60%, #c9a84c); box-shadow: 0 0 40px 8px rgba(243,217,143,.35); opacity: .9; }
.hoc-web { position: absolute; top: 0; z-index: -1; color: rgba(245,237,230,.32); pointer-events: none; }
.hoc-web-l { left: 0; }
.hoc-web-r { right: 0; transform: scaleX(-1); }
.hoc-spider { position: absolute; top: 0; left: 18%; z-index: 0; display: flex; flex-direction: column; align-items: center; color: #0b0204;
  transform-origin: 50% 0; animation: hocDangle 5s ease-in-out infinite; pointer-events: none; }
.hoc-spider i { display: block; width: 1px; height: 42px; background: rgba(233,196,106,.6); animation: hocThread 5s ease-in-out infinite; }
.hoc-spider svg { filter: drop-shadow(0 0 5px rgba(255,170,90,.55)); }
@keyframes hocDangle { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
@keyframes hocThread { 0%, 100% { height: 30px; } 50% { height: 54px; } }
.hoc-grave { position: absolute; left: 6px; bottom: 0; width: 72px; height: 67px; z-index: -1; opacity: .9; }
.hoc-ghost { position: absolute; right: 8px; bottom: 54px; width: 64px; height: 64px; z-index: -1; animation: hocFloat 4.5s ease-in-out infinite; }
@keyframes hocFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
.hoc-tag { display: inline-block; padding: 7px 13px; border-radius: 999px; font: 800 10.5px/1 'Inter', sans-serif; letter-spacing: .16em;
  color: #2a0a0e; background: linear-gradient(180deg, #ffc37a, #f0862f); box-shadow: 0 0 18px rgba(245,138,53,.5); }
.hoc-pct { margin: 16px 0 12px; display: flex; align-items: flex-start; justify-content: center; gap: 6px; line-height: .9; }
.hoc-pct b { font: 700 78px/0.9 'Playfair Display', serif; background: linear-gradient(180deg, #ffd9a0 10%, #f58a35 60%, #c4521c); -webkit-background-clip: text; background-clip: text; color: transparent;
  filter: drop-shadow(0 4px 22px rgba(245,138,53,.55)); }
.hoc-pct span { margin-top: 10px; font: 800 18px/1 'Inter', sans-serif; letter-spacing: .14em; color: #e9c46a; }
.hoc-title { margin: 16px 0 10px; font: 700 40px/1 'Playfair Display', serif; color: #ffd9a0; text-shadow: 0 4px 24px rgba(245,138,53,.5); }
.hoc-sub { max-width: 31rem; margin: 6px auto 0; font: 400 14px/1.55 'Inter', sans-serif; color: rgba(251,238,224,.82); }
.hoc-sub b { color: #fff; font-weight: 600; }
.hoc-clock { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; max-width: 360px; margin: 18px auto 0; }
.hoc-box { display: flex; flex-direction: column; align-items: center; gap: 5px; padding: 11px 0 9px; border-radius: 14px;
  background: linear-gradient(180deg, rgba(255,255,255,.1), rgba(255,255,255,.03)); box-shadow: inset 0 0 0 1px rgba(201,168,76,.34); }
.hoc-box b { font: 800 26px/1 'Inter', sans-serif; font-variant-numeric: tabular-nums; color: #fff; }
.hoc-box small { font: 700 9.5px/1 'Inter', sans-serif; letter-spacing: .14em; text-transform: uppercase; color: #e9c46a; }
.hoc-cta { display: inline-flex; align-items: center; justify-content: center; gap: 8px; margin-top: 18px; padding: 14px 24px; border-radius: 999px;
  font: 800 15px/1 'Inter', sans-serif; color: #2a0a0e; text-decoration: none;
  background: linear-gradient(180deg, #ffd08f, #f0862f); box-shadow: 0 12px 26px -10px rgba(245,138,53,.9); transition: transform .2s ease, box-shadow .2s ease; }
.hoc-cta:hover { transform: translateY(-2px); box-shadow: 0 16px 30px -10px rgba(245,138,53,1); }
.hoc-proof { margin: 12px 0 0; font: italic 500 13px/1.4 'Playfair Display', serif; color: #fff; }
.hoc-proof span { font: 500 12.5px/1.4 'Inter', sans-serif; font-style: normal; color: rgba(251,238,224,.6); }
@media (max-width: 480px) {
  .hoc { padding: 26px 14px 20px; border-radius: 20px; }
  .hoc-pct b { font-size: 64px; }
  .hoc-box b { font-size: 22px; }
  .hoc-cta { width: 100%; }
  .hoc-ghost { width: 46px; height: 46px; bottom: auto; top: 70px; right: 6px; }
  .hoc-spider { left: auto; right: 5%; }
  .hoc-spider i { animation-name: hocThreadS; }
  @keyframes hocThreadS { 0%, 100% { height: 6px; } 50% { height: 16px; } }
  .hoc-grave { width: 56px; height: 52px; }
  .hoc-moon { right: auto; left: 22%; top: 60px; width: 30px; height: 30px; }
}
@media (prefers-reduced-motion: reduce) { .hoc-spider, .hoc-spider i, .hoc-ghost { animation: none !important; } }
`;
