"use client";

// ─── The festive card inside a blog post ─────────────────────────────────────
//
// Takes the Valentine/Halloween countdown card's place while the site is in
// festive mode: a navy festival night — marigold garlands flush in the top
// corners, a row of diyas along the bottom, a slowly turning rangoli, a
// firework blooming and the dandiya couple dancing — with frosted navy glass
// carrying the offer, a countdown to Diwali night and one marigold button to
// /festive-offer. The two GIFs load after idle into boxes already sized.

import Link from "next/link";
import { useSeason } from "@/hooks/useSeason";
import { useNow, countdown, pad2 } from "@/hooks/usePromo";
import { FESTIVE_ENDS_AT, FESTIVE_GIF, FESTIVE_PATH } from "@/lib/season";
import { Burst, Diya, Marigold, Rangoli } from "./festiveArt";
import { FV, FV_SKY } from "./festiveTheme";
import IdleGif from "./IdleGif";

/** A short marigold garland for a card's top corner (flowers along a swag). */
function CardToran({ className }: { className: string }) {
  const pts = Array.from({ length: 9 }, (_, i) => {
    const t = i / 8;
    const x = (1 - t) * (1 - t) * 124 + 2 * (1 - t) * t * 60 + t * t * -2;
    const y = (1 - t) * (1 - t) * -2 + 2 * (1 - t) * t * 58 + t * t * 96;
    return [Math.round(x * 10) / 10, Math.round(y * 10) / 10] as const;
  });
  return (
    <svg viewBox="0 0 124 100" className={className} aria-hidden>
      <path d="M124 -2Q60 58 -2 96" stroke="#9c6210" strokeWidth="1.2" fill="none" />
      {pts.map(([x, y], i) => (
        <g key={i}>
          {i % 3 === 1 && <path d={`M${x} ${y + 3}q-4 7 0 14q4-7 0-14z`} fill="#3fa257" />}
          <circle cx={x} cy={y} r={i % 2 ? 6 : 7.2} fill={i % 3 === 0 ? "#f07c0a" : "#ffb020"} />
          <circle cx={x} cy={y} r={2.4} fill="#ffcf3a" />
        </g>
      ))}
    </svg>
  );
}

export default function FestiveOfferCard({ className = "" }: { className?: string }) {
  const season = useSeason();
  const t = useNow();
  if (season?.mode !== "festive") return null;

  const pct = season.sale.enabled ? season.sale.percent : 0;
  const c = countdown(FESTIVE_ENDS_AT, t || FESTIVE_ENDS_AT);
  const live = !t || c.totalMs > 0;
  const boxes = [
    { v: c.d, l: "Days" },
    { v: c.h, l: "Hours" },
    { v: c.m, l: "Mins" },
    { v: c.s, l: "Secs" },
  ];

  return (
    <aside className={`foc ${className}`} aria-label={pct ? `Navratri and Diwali drop: ${pct}% off` : "The Navratri and Diwali drop"}>
      <style>{FOC_CSS}</style>
      <span className="foc-rangoli" aria-hidden><Rangoli size={240} /></span>
      <span className="foc-orb foc-orb1" aria-hidden />
      <span className="foc-orb foc-orb2" aria-hidden />
      <span className="foc-fw foc-fw1" aria-hidden><Burst size={90} color={FV.flame} /></span>
      <span className="foc-fw foc-fw2" aria-hidden><Burst size={64} color={FV.rose} /></span>
      <CardToran className="foc-toran foc-toran-l" />
      <CardToran className="foc-toran foc-toran-r" />
      <IdleGif src={FESTIVE_GIF("fireworks-deepavali-skyshot.gif")} width={200} height={137} className="foc-sky" />
      <IdleGif src={FESTIVE_GIF("dandiyapartyner.webp")} width={130} height={130} className="foc-couple" />
      <span className="foc-diyas" aria-hidden>
        {Array.from({ length: 7 }, (_, i) => <Diya key={i} size={i === 3 ? 30 : 22} />)}
      </span>

      <div className="foc-glass">
        <span className="foc-tag">🪔 NAVRATRI &amp; DIWALI DROP · {live ? "ENDS 8 NOV" : "LIGHTS STILL ON"}</span>
        {pct ? (
          <p className="foc-pct"><b>{pct}%</b><span>OFF</span></p>
        ) : (
          <p className="foc-title">The Festive Drop</p>
        )}
        <p className="foc-sub">
          Two festive cards — <b>Be My Dandiya Partner</b> for Navratri nights and <b>Happy Diwali</b> to light up theirs.
          {pct ? " Try them free; the sale price is applied when you publish." : " Try them free and publish when you love it."}
        </p>
        {live && (
          <div className="foc-clock" role="timer" aria-label={t ? `Ends in ${c.d} days ${c.h} hours ${c.m} minutes` : "Ends on Diwali night, 8 November"}>
            {boxes.map((b) => (
              <span key={b.l} className="foc-box">
                <b>{t ? pad2(b.v) : "--"}</b>
                <small>{b.l}</small>
              </span>
            ))}
          </div>
        )}
        <Link href={FESTIVE_PATH} className="foc-cta" prefetch={false}>
          <Marigold size={18} /> See the festive drop
        </Link>
        <p className="foc-proof">Be my Dandiya partner? <span>· Ready in 2 minutes</span></p>
      </div>
    </aside>
  );
}

const FOC_CSS = `
.foc { position: relative; isolation: isolate; overflow: hidden; margin: 32px 0; padding: 40px 22px 64px; border-radius: 24px; text-align: center; color: ${FV.text};
  background: ${FV_SKY};
  box-shadow: 0 30px 60px -30px rgba(13,15,46,.95), 0 0 0 1px rgba(13,15,46,.2), inset 0 0 0 1px ${FV.glassEdge}, 0 0 34px -10px rgba(255,176,32,.55); }
.foc::before { content: ""; position: absolute; inset: 8px; z-index: -1; border-radius: 18px; border: 1px dashed rgba(244,201,93,.26); pointer-events: none; }
.foc-rangoli { position: absolute; z-index: -3; left: 50%; top: 50%; opacity: .14; transform: translate(-50%, -50%); animation: focSpin 80s linear infinite; }
.foc-rangoli svg { display: block; }
@keyframes focSpin { to { transform: translate(-50%, -50%) rotate(360deg); } }
.foc-orb { position: absolute; z-index: -3; width: 10px; height: 10px; border-radius: 50%; background: rgba(255,196,77,.8); box-shadow: 0 0 16px 6px rgba(255,176,32,.42);
  animation: focOrb 7s ease-in-out infinite; }
.foc-orb1 { left: 14%; top: 46%; }
.foc-orb2 { right: 16%; top: 40%; width: 7px; height: 7px; background: rgba(255,93,143,.8); box-shadow: 0 0 14px 5px rgba(255,93,143,.35); animation-delay: -3s; }
@keyframes focOrb { 0%, 100% { transform: translate(0,0); opacity: .5; } 50% { transform: translate(8px,-12px); opacity: 1; } }
.foc-fw { position: absolute; z-index: -2; opacity: 0; pointer-events: none; }
.foc-fw svg { display: block; filter: drop-shadow(0 0 8px rgba(255,211,107,.8)); }
.foc-fw1 { left: 9%; top: 18%; animation: focBloom 5s ease-out infinite; }
.foc-fw2 { right: 10%; top: 26%; animation: focBloom 5s ease-out 2.4s infinite; }
@keyframes focBloom { 0%, 6% { opacity: 0; transform: scale(.1); } 10% { opacity: 1; } 36% { opacity: 0; transform: scale(1); } 100% { opacity: 0; } }
.foc-toran { position: absolute; top: 0; z-index: 0; width: 124px; height: 100px; pointer-events: none; overflow: visible; filter: drop-shadow(0 3px 4px rgba(0,0,0,.35)); }
.foc-toran-l { left: 0; transform: scaleX(-1); }
.foc-toran-r { right: 0; }
.foc-sky { position: absolute; z-index: -1; right: 4%; top: 6%; width: 150px; height: 103px; opacity: .9; }
.foc-couple { position: absolute; z-index: 0; left: 2%; bottom: 6px; width: 104px; height: 104px; animation: focSway 3.2s ease-in-out infinite; transform-origin: 50% 100%; }
@keyframes focSway { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
.foc-diyas { position: absolute; z-index: 0; left: 50%; bottom: 12px; transform: translateX(-50%); display: flex; align-items: flex-end; gap: 18px; pointer-events: none; }
.foc-diyas svg { filter: drop-shadow(0 0 8px rgba(255,196,77,.85)); }
.foc-diyas .fv-flame { animation: focFlick 1.1s ease-in-out infinite alternate; transform-box: fill-box; transform-origin: 50% 100%; }
.foc-diyas svg:nth-child(even) .fv-flame { animation-delay: -.5s; }
@keyframes focFlick { from { transform: scale(1, 1) rotate(-4deg); } to { transform: scale(.88, 1.14) rotate(4deg); } }
.foc-glass { position: relative; z-index: 1; max-width: 450px; margin: 0 auto; padding: 22px 20px 20px; border-radius: 22px;
  background: ${FV.glass}; -webkit-backdrop-filter: blur(14px) saturate(1.2); backdrop-filter: blur(14px) saturate(1.2);
  box-shadow: inset 0 0 0 1px ${FV.glassEdge}, 0 20px 40px -24px rgba(10,11,34,.9); }
.foc-tag { display: inline-block; padding: 7px 13px; border-radius: 999px; font: 800 10.5px/1.2 'Inter', sans-serif; letter-spacing: .14em;
  color: #2a1206; background: linear-gradient(180deg, ${FV.goldSoft}, ${FV.marigold}); box-shadow: 0 0 18px rgba(255,176,32,.55); }
.foc-pct { margin: 14px 0 10px; display: flex; align-items: flex-start; justify-content: center; gap: 6px; line-height: .9; }
.foc-pct b { font: 700 78px/0.9 'Playfair Display', serif; background: linear-gradient(180deg, #fff1c8 14%, ${FV.marigold} 55%, ${FV.marigoldDeep} 85%); -webkit-background-clip: text; background-clip: text; color: transparent;
  filter: drop-shadow(0 4px 22px rgba(255,176,32,.55)); padding: .1em .04em .2em; margin: -.1em -.04em -.2em; }
.foc-pct span { margin-top: 10px; font: 800 18px/1 'Inter', sans-serif; letter-spacing: .14em; color: ${FV.gold}; }
.foc-title { margin: 16px 0 10px; font: 700 40px/1 'Playfair Display', serif; color: ${FV.goldSoft}; text-shadow: 0 4px 24px rgba(255,176,32,.5); }
.foc-sub { max-width: 31rem; margin: 6px auto 0; font: 400 14px/1.55 'Inter', sans-serif; color: ${FV.muted}; }
.foc-sub b { color: #fff; font-weight: 600; }
.foc-clock { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; max-width: 360px; margin: 18px auto 0; }
.foc-box { display: flex; flex-direction: column; align-items: center; gap: 5px; padding: 11px 0 9px; border-radius: 14px;
  background: linear-gradient(180deg, rgba(244,201,93,.16), rgba(10,11,34,.4)); box-shadow: inset 0 0 0 1px rgba(244,201,93,.36); }
.foc-box b { font: 800 26px/1 'Inter', sans-serif; font-variant-numeric: tabular-nums; color: #fff; }
.foc-box small { font: 700 9.5px/1 'Inter', sans-serif; letter-spacing: .14em; text-transform: uppercase; color: ${FV.gold}; }
.foc-cta { display: inline-flex; align-items: center; justify-content: center; gap: 8px; margin-top: 18px; padding: 14px 26px; border-radius: 999px;
  font: 800 15px/1 'Inter', sans-serif; color: #2a1206; text-decoration: none;
  background: linear-gradient(180deg, ${FV.goldSoft}, ${FV.marigold} 70%, ${FV.marigoldDeep}); box-shadow: 0 0 0 1px rgba(255,227,163,.65), 0 12px 26px -10px rgba(255,176,32,.95);
  transition: transform .2s ease, box-shadow .2s ease; }
.foc-cta:hover { transform: translateY(-2px); box-shadow: 0 0 0 1px rgba(255,227,163,.85), 0 16px 30px -10px rgba(255,176,32,1); }
.foc-proof { margin: 12px 0 0; font: italic 500 13px/1.4 'Playfair Display', serif; color: #fff; }
.foc-proof span { font: 500 12.5px/1.4 'Inter', sans-serif; font-style: normal; color: ${FV.muted}; }
@media (max-width: 720px) {
  .foc-sky { width: 110px; height: 75px; }
  .foc-couple { width: 84px; height: 84px; }
}
@media (max-width: 480px) {
  .foc { padding: 34px 10px 100px; border-radius: 20px; }
  .foc-glass { padding: 18px 12px 16px; border-radius: 18px; }
  .foc-pct b { font-size: 64px; }
  .foc-box b { font-size: 22px; }
  .foc-cta { width: 100%; padding: 14px 12px; }
  .foc-toran { width: 92px; height: 74px; }
  .foc-sky { right: 30%; top: auto; bottom: 40px; width: 96px; height: 66px; }
  .foc-couple { left: auto; right: 4%; bottom: 8px; width: 86px; height: 86px; }
  .foc-diyas { left: 8px; transform: none; gap: 10px; }
  .foc-diyas svg:nth-child(n+5) { display: none; }
}
@media (prefers-reduced-motion: reduce) { .foc-rangoli, .foc-orb, .foc-fw, .foc-couple, .foc-diyas .fv-flame { animation: none !important; } }
`;
