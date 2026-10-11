"use client";

// ─── The festival card inside a blog post ────────────────────────────────────
//
// Takes the Valentine/Halloween countdown card's place while the site is in a
// festival mode. One card shape, two festivals that look nothing alike:
//
//   dandiya — a kumkum-red garba night with a bandhani dot field: a mirror-work
//             bandhanwar across the top, a giant mirror mandala turning behind
//             the glass, the dancing couple on one side and the bubudubu panda
//             swinging his sticks on the other, a dhol, mirror glints. Counts
//             down to Dussehra (20 Oct) → /dandiya-offer.
//   diwali  — a maroon Diwali night: marigold garlands in the corners, a row of
//             diyas along the bottom, a slow rangoli, fireworks blooming, the
//             sparkler penguin and the painted diya. Counts down to Diwali
//             night (8 Nov) → /diwali-offer.
//
// Frosted glass carries the offer in both. The GIFs load after idle into boxes
// already sized; every animation stops under reduced motion.

import Link from "next/link";
import { useSeason } from "@/hooks/useSeason";
import { useNow, countdown, pad2 } from "@/hooks/usePromo";
import { DROPS, FESTIVE_GIF, type FestivalId } from "@/lib/season";
import { Bandhanwar, Burst, Dandiya, Dhol, Diya, Marigold, Mirror, Rangoli } from "./festivalArt";
import { FT, ftVars } from "./festivalTheme";
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

const COPY: Record<FestivalId, { tag: (live: boolean) => string; title: string; sub: React.ReactNode; cta: string; proof: React.ReactNode; aria: (pct: number) => string; clockAria: string }> = {
  dandiya: {
    tag: (live) => `NAVRATRI DANDIYA DROP · ${live ? "ENDS 20 OCT" : "THE GARBA GOES ON"}`,
    title: "Be My Dandiya Partner",
    sub: <>Ask them the sweetest Navratri question — <b>Be My Dandiya Partner</b> twirls, dances and waits for their yes.</>,
    cta: "See the Dandiya drop",
    proof: <>Will you twirl with me? <span>· Ready in 2 minutes</span></>,
    aria: (pct) => (pct ? `Navratri Dandiya drop: ${pct}% off` : "The Navratri Dandiya drop"),
    clockAria: "Ends on Dussehra, 20 October",
  },
  diwali: {
    tag: (live) => `🪔 THE DIWALI DROP · ${live ? "ENDS 8 NOV" : "LIGHTS STILL ON"}`,
    title: "Light up their Diwali",
    sub: <>A Diwali wish they light up themselves — <b>Happy Diwali</b> with diyas, rangoli, crackers and your photos.</>,
    cta: "See the Diwali drop",
    proof: <>Shubh Deepavali! <span>· Ready in 2 minutes</span></>,
    aria: (pct) => (pct ? `Diwali drop: ${pct}% off` : "The Diwali drop"),
    clockAria: "Ends on Diwali night, 8 November",
  },
};

export default function FestivalOfferCard({ kind, className = "" }: { kind: FestivalId; className?: string }) {
  const season = useSeason();
  const t = useNow();
  if (season?.mode !== kind) return null;

  const drop = DROPS[kind];
  const pct = season.sale.enabled ? season.sale.percent : 0;
  const c = countdown(drop.endsAt, t || drop.endsAt);
  const live = !t || c.totalMs > 0;
  const copy = COPY[kind];
  const T = FT[kind];
  const boxes = [
    { v: c.d, l: "Days" },
    { v: c.h, l: "Hours" },
    { v: c.m, l: "Mins" },
    { v: c.s, l: "Secs" },
  ];

  return (
    <aside className={`foc foc-k-${kind} ${className}`} style={ftVars(kind)} aria-label={copy.aria(pct)}>
      <style>{FOC_CSS}</style>
      {kind === "dandiya" ? (
        <>
          <span className="foc-mandala" aria-hidden><Mirror size={300} thread={T.cta} /></span>
          <Bandhanwar n={16} className="foc-band" />
          <span className="foc-glint foc-gl1" aria-hidden><Mirror size={26} /></span>
          <span className="foc-glint foc-gl2" aria-hidden><Mirror size={20} thread={T.a1} /></span>
          <span className="foc-glint foc-gl3" aria-hidden><Mirror size={22} thread={T.a2} /></span>
          <span className="foc-dhol" aria-hidden><Dhol size={46} /></span>
          <span className="foc-sticks" aria-hidden><Dandiya size={40} /></span>
          <IdleGif src={FESTIVE_GIF("dandiyapartyner.webp")} width={130} height={130} className="foc-couple" />
          <IdleGif src={FESTIVE_GIF("bubudubu-dandiya-playing.webp")} width={110} height={108} className="foc-panda" />
        </>
      ) : (
        <>
          <span className="foc-rangoli" aria-hidden><Rangoli size={240} /></span>
          <span className="foc-fw foc-fw1" aria-hidden><Burst size={90} color={T.flame} /></span>
          <span className="foc-fw foc-fw2" aria-hidden><Burst size={64} color={T.a1} /></span>
          <CardToran className="foc-toran foc-toran-l" />
          <CardToran className="foc-toran foc-toran-r" />
          <IdleGif src={FESTIVE_GIF("fireworks-deepavali-skyshot.gif")} width={200} height={137} className="foc-sky" />
          <IdleGif src={FESTIVE_GIF("celebration-with-crackers-dudu.webp")} width={130} height={130} className="foc-couple" />
          <IdleGif src={FESTIVE_GIF("happy-diwali-diya.webp")} width={100} height={110} className="foc-panda" />
          <span className="foc-diyas" aria-hidden>
            {Array.from({ length: 7 }, (_, i) => <Diya key={i} size={i === 3 ? 30 : 22} />)}
          </span>
        </>
      )}

      <div className="foc-glass">
        <span className="foc-tag">
          {kind === "dandiya" && <Mirror size={14} />} {copy.tag(live)}
        </span>
        {pct ? (
          <p className="foc-pct"><b>{pct}%</b><span>OFF</span></p>
        ) : (
          <p className="foc-title">{copy.title}</p>
        )}
        <p className="foc-sub">
          {copy.sub}
          {pct ? " Try it free; the sale price is applied when you publish." : " Try it free and publish when you love it."}
        </p>
        {live && (
          <div className="foc-clock" role="timer" aria-label={t ? `Ends in ${c.d} days ${c.h} hours ${c.m} minutes` : copy.clockAria}>
            {boxes.map((b) => (
              <span key={b.l} className="foc-box">
                <b>{t ? pad2(b.v) : "--"}</b>
                <small>{b.l}</small>
              </span>
            ))}
          </div>
        )}
        <Link href={drop.path} className="foc-cta" prefetch={false}>
          {kind === "dandiya" ? <Dandiya size={20} /> : <Marigold size={18} />} {copy.cta}
        </Link>
        <p className="foc-proof">{copy.proof}</p>
      </div>
    </aside>
  );
}

const FOC_CSS = `
.foc { position: relative; isolation: isolate; overflow: hidden; margin: 32px 0; padding: 40px 22px 64px; border-radius: 24px; text-align: center; color: var(--ft-text);
  background: var(--ft-sky);
  box-shadow: 0 30px 60px -30px color-mix(in srgb, var(--ft-ink) 95%, transparent), inset 0 0 0 1px var(--ft-edge), 0 0 34px -10px var(--ft-glow); }
.foc::before { content: ""; position: absolute; inset: 8px; z-index: -1; border-radius: 18px; border: 1px dashed color-mix(in srgb, var(--ft-gold) 30%, transparent); pointer-events: none; }
/* Dandiya: bandhani dots all over the red, a band of mirror flaps across the top */
.foc-k-dandiya { padding-top: 58px; }
.foc-k-dandiya::after { content: ""; position: absolute; inset: 0; z-index: -4; pointer-events: none; opacity: .6;
  background: radial-gradient(circle at 50% 50%, rgba(255,240,220,.5) 0 1.3px, transparent 1.7px) 0 0 / 20px 20px,
    radial-gradient(circle at 50% 50%, rgba(255,214,120,.38) 0 1.1px, transparent 1.5px) 10px 10px / 20px 20px; }
.foc-band { position: absolute; z-index: 0; left: 0; top: 0; width: 100%; height: 46px; pointer-events: none; filter: drop-shadow(0 4px 6px rgba(40,0,4,.45)); }
.foc-mandala { position: absolute; z-index: -3; left: 50%; top: 52%; opacity: .16; transform: translate(-50%, -50%); animation: focSpin 60s linear infinite; }
.foc-mandala svg { display: block; }
.foc-glint { position: absolute; z-index: -1; pointer-events: none; animation: focGlint 3.4s ease-in-out infinite; }
.foc-glint svg { display: block; filter: drop-shadow(0 0 6px rgba(255,255,255,.55)); }
.foc-gl1 { left: 8%; top: 30%; }
.foc-gl2 { right: 9%; top: 26%; animation-delay: 1.1s; }
.foc-gl3 { right: 18%; top: 56%; animation-delay: 2.2s; }
@keyframes focGlint { 0%, 100% { opacity: .45; transform: rotate(0) scale(.9); } 50% { opacity: 1; transform: rotate(40deg) scale(1.15); } }
.foc-dhol { position: absolute; z-index: 0; right: 30%; bottom: 10px; animation: focDhol .7s ease-in-out infinite alternate; }
@keyframes focDhol { from { transform: rotate(-4deg) translateY(0); } to { transform: rotate(3deg) translateY(-3px); } }
.foc-sticks { position: absolute; z-index: 0; left: 30%; bottom: 14px; animation: focTwirl 2.4s cubic-bezier(.5,0,.5,1) infinite; }
.foc-sticks svg { filter: drop-shadow(0 0 6px rgba(255,214,120,.8)); }
@keyframes focTwirl { 0% { transform: rotate(0); } 60%, 100% { transform: rotate(360deg); } }
.foc-panda { position: absolute; z-index: 0; right: 2%; bottom: 6px; width: 96px; height: 94px; transform-origin: 50% 100%; animation: focSway 1.6s ease-in-out infinite; }
.foc-k-diwali .foc-panda { width: 84px; height: 92px; animation: none; filter: drop-shadow(0 0 18px rgba(255,176,32,.5)); }
/* Diwali */
.foc-rangoli { position: absolute; z-index: -3; left: 50%; top: 50%; opacity: .14; transform: translate(-50%, -50%); animation: focSpin 80s linear infinite; }
.foc-rangoli svg { display: block; }
@keyframes focSpin { to { transform: translate(-50%, -50%) rotate(360deg); } }
.foc-fw { position: absolute; z-index: -2; opacity: 0; pointer-events: none; }
.foc-fw svg { display: block; filter: drop-shadow(0 0 8px var(--ft-glow)); }
.foc-fw1 { left: 9%; top: 18%; animation: focBloom 5s ease-out infinite; }
.foc-fw2 { right: 10%; top: 26%; animation: focBloom 5s ease-out 2.4s infinite; }
@keyframes focBloom { 0%, 6% { opacity: 0; transform: scale(.1); } 10% { opacity: 1; } 36% { opacity: 0; transform: scale(1); } 100% { opacity: 0; } }
.foc-toran { position: absolute; top: 0; z-index: 0; width: 124px; height: 100px; pointer-events: none; overflow: visible; filter: drop-shadow(0 3px 4px rgba(0,0,0,.35)); }
.foc-toran-l { left: 0; transform: scaleX(-1); }
.foc-toran-r { right: 0; }
.foc-sky { position: absolute; z-index: -1; right: 4%; top: 6%; width: 150px; height: 103px; opacity: .9; mix-blend-mode: screen; }
.foc-couple { position: absolute; z-index: 0; left: 2%; bottom: 6px; width: 104px; height: 104px; animation: focSway 3.2s ease-in-out infinite; transform-origin: 50% 100%; }
@keyframes focSway { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
.foc-diyas { position: absolute; z-index: 0; left: 50%; bottom: 12px; transform: translateX(-50%); display: flex; align-items: flex-end; gap: 18px; pointer-events: none; }
.foc-diyas svg { filter: drop-shadow(0 0 8px rgba(255,196,77,.85)); }
.foc-diyas .fv-flame { animation: focFlick 1.1s ease-in-out infinite alternate; transform-box: fill-box; transform-origin: 50% 100%; }
.foc-diyas svg:nth-child(even) .fv-flame { animation-delay: -.5s; }
@keyframes focFlick { from { transform: scale(1, 1) rotate(-4deg); } to { transform: scale(.88, 1.14) rotate(4deg); } }
/* the glass */
.foc-glass { position: relative; z-index: 1; max-width: 450px; margin: 0 auto; padding: 22px 20px 20px; border-radius: 22px;
  background: var(--ft-glass); -webkit-backdrop-filter: blur(14px) saturate(1.2); backdrop-filter: blur(14px) saturate(1.2);
  box-shadow: inset 0 0 0 1px var(--ft-edge), 0 20px 40px -24px color-mix(in srgb, var(--ft-ink) 90%, transparent); }
.foc-tag { display: inline-flex; align-items: center; gap: 6px; padding: 7px 13px; border-radius: 999px; font: 800 10.5px/1.2 'Inter', sans-serif; letter-spacing: .14em;
  color: var(--ft-cta-ink); background: linear-gradient(180deg, var(--ft-gold-soft), var(--ft-cta)); box-shadow: 0 0 18px var(--ft-glow); }
.foc-pct { margin: 14px 0 10px; display: flex; align-items: flex-start; justify-content: center; gap: 6px; line-height: .9; }
.foc-pct b { font: 700 78px/0.9 'Playfair Display', serif; background: linear-gradient(180deg, #fff6dc 14%, var(--ft-cta) 55%, var(--ft-cta-deep) 85%); -webkit-background-clip: text; background-clip: text; color: transparent;
  filter: drop-shadow(0 4px 22px var(--ft-glow)); padding: .1em .04em .2em; margin: -.1em -.04em -.2em; }
.foc-pct span { margin-top: 10px; font: 800 18px/1 'Inter', sans-serif; letter-spacing: .14em; color: var(--ft-gold-soft); }
.foc-title { margin: 16px 0 10px; font: 700 38px/1.05 'Playfair Display', serif; color: var(--ft-gold-soft); text-shadow: 0 4px 24px var(--ft-glow); }
.foc-sub { max-width: 31rem; margin: 6px auto 0; font: 400 14px/1.55 'Inter', sans-serif; color: var(--ft-muted); }
.foc-sub b { color: #fff; font-weight: 600; }
.foc-clock { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; max-width: 360px; margin: 18px auto 0; }
.foc-box { display: flex; flex-direction: column; align-items: center; gap: 5px; padding: 11px 0 9px; border-radius: 14px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--ft-gold) 18%, transparent), color-mix(in srgb, var(--ft-ink) 45%, transparent)); box-shadow: inset 0 0 0 1px var(--ft-edge); }
.foc-k-dandiya .foc-box { border-radius: 50% 50% 14px 14px / 30% 30% 14px 14px; }
.foc-box b { font: 800 26px/1 'Inter', sans-serif; font-variant-numeric: tabular-nums; color: #fff; }
.foc-box small { font: 700 9.5px/1 'Inter', sans-serif; letter-spacing: .14em; text-transform: uppercase; color: var(--ft-gold-soft); }
.foc-cta { display: inline-flex; align-items: center; justify-content: center; gap: 8px; margin-top: 18px; padding: 14px 26px; border-radius: 999px;
  font: 800 15px/1 'Inter', sans-serif; color: var(--ft-cta-ink); text-decoration: none;
  background: linear-gradient(180deg, var(--ft-gold-soft), var(--ft-cta) 70%, var(--ft-cta-deep)); box-shadow: 0 0 0 1px color-mix(in srgb, var(--ft-gold-soft) 65%, transparent), 0 12px 26px -10px var(--ft-cta);
  transition: transform .2s ease, box-shadow .2s ease; }
.foc-cta:hover { transform: translateY(-2px); }
.foc-proof { margin: 12px 0 0; font: italic 500 13px/1.4 'Playfair Display', serif; color: #fff; }
.foc-proof span { font: 500 12.5px/1.4 'Inter', sans-serif; font-style: normal; color: var(--ft-muted); }
@media (max-width: 720px) {
  .foc-sky { width: 110px; height: 75px; }
  .foc-couple { width: 84px; height: 84px; }
  .foc-panda { width: 80px; height: 78px; }
  .foc-dhol, .foc-sticks { display: none; }
}
@media (max-width: 480px) {
  .foc { padding: 34px 10px 100px; border-radius: 20px; }
  .foc-k-dandiya { padding-top: 52px; }
  .foc-glass { padding: 18px 12px 16px; border-radius: 18px; }
  .foc-pct b { font-size: 64px; }
  .foc-box b { font-size: 22px; }
  .foc-cta { width: 100%; padding: 14px 12px; }
  .foc-toran { width: 92px; height: 74px; }
  .foc-sky { right: 30%; top: auto; bottom: 40px; width: 96px; height: 66px; }
  .foc-couple { left: 4%; bottom: 8px; width: 86px; height: 86px; }
  .foc-k-diwali .foc-couple { left: auto; right: 4%; }
  .foc-k-diwali .foc-panda { display: none !important; }
  .foc-diyas { left: 8px; transform: none; gap: 10px; }
  .foc-diyas svg:nth-child(n+5) { display: none; }
}
@media (prefers-reduced-motion: reduce) { .foc *, .foc .fv-flame { animation: none !important; } }
`;
