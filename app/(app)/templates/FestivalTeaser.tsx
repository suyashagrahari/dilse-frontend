"use client";

// The gallery's invitation to the active festival drop, in the seasonal
// teaser's spot beside Premium. Same shape as ValentineTeaser /
// HalloweenTeaser — a full card on tablets and up, one slim row on phones —
// painted in the festival's own red (components/promo/festivalTheme.ts):
//
//   dandiya — a kumkum-red garba night with bandhani dots: a mandap with a
//             mirror-work bandhanwar, the dancing couple under it, a dhol,
//             twirling sticks and mirror glints; a marigold seal.
//   diwali  — a maroon Diwali night: a lit haveli with diyas along its
//             parapet, a marigold toran, fireworks blooming, the painted diya;
//             a diya-gold seal.
//
// Inline SVG/CSS; the GIF loads after idle into a box that is already sized.
// Opens /dandiya-offer or /diwali-offer through that festival's portal.

import { ArrowRight } from "lucide-react";
import { useDropFree } from "@/hooks/useDropFree";
import { useSeason } from "@/hooks/useSeason";
import { DROPS, FESTIVE_GIF, type FestivalId } from "@/lib/season";
import { FT, ftVars } from "@/components/promo/festivalTheme";
import { Bandhanwar, Burst, Dandiya, Dhol, Mirror } from "@/components/promo/festivalArt";
import { FestivalLink } from "@/components/promo/FestivalPortal";
import IdleGif from "@/components/promo/IdleGif";

function Toran({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 74 60" aria-hidden>
      <path d="M74 -1Q36 34 -1 56" stroke="#9c6210" strokeWidth="1" fill="none" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const t = i / 6;
        const x = (1 - t) * (1 - t) * 74 + 2 * (1 - t) * t * 36 + t * t * -1;
        const y = (1 - t) * (1 - t) * -1 + 2 * (1 - t) * t * 34 + t * t * 56;
        return (
          <g key={i}>
            {i % 2 === 1 && <path d={`M${x} ${y + 2}q-3 5 0 10q3-5 0-10z`} fill="#3fa257" />}
            <circle cx={x} cy={y} r={i % 2 ? 4.2 : 5} fill={i % 3 === 0 ? "#f07c0a" : "#ffb020"} />
            <circle cx={x} cy={y} r={1.7} fill="#ffcf3a" />
          </g>
        );
      })}
    </svg>
  );
}

/** A lit haveli in maroon and gold: domes and chhatris, warm arched windows, diyas along the parapet. */
function Haveli() {
  const T = FT.diwali;
  const win = (x: number, y: number, w = 12, h = 18) => (
    <path d={`M${x} ${y + h}V${y + w / 2}a${w / 2} ${w / 2} 0 0 1 ${w} 0V${y + h}z`} fill={T.flame} className="ftzLit" />
  );
  return (
    <svg className="ftzHaveli" viewBox="0 0 220 150" aria-hidden>
      <defs>
        <linearGradient id="ftzWall" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#6e1216" />
          <stop offset="1" stopColor="#3a070a" />
        </linearGradient>
      </defs>
      <path d="M18 150V92h34v58z" fill="url(#ftzWall)" />
      <path d="M14 92h42M20 92q15-26 30 0" fill="#5a0d12" stroke="#22040a" strokeWidth="1.5" />
      <path d="M168 150V92h34v58z" fill="url(#ftzWall)" />
      <path d="M164 92h42M170 92q15-26 30 0" fill="#5a0d12" stroke="#22040a" strokeWidth="1.5" />
      <path d="M44 150V70h132v80z" fill="url(#ftzWall)" stroke="#22040a" strokeWidth="1.5" />
      <path d="M40 70h140" stroke={T.gold} strokeWidth="2.4" />
      <path d="M80 70q30-58 60 0z" fill="#5a0d12" stroke="#22040a" strokeWidth="1.5" />
      <path d="M110 12v14" stroke={T.gold} strokeWidth="2" />
      <circle cx="110" cy="11" r="2.6" fill={T.flame} />
      {win(58, 84)}{win(80, 84)}{win(128, 84)}{win(150, 84)}
      {win(28, 104, 14, 22)}{win(178, 104, 14, 22)}
      <path d="M96 150V116a14 14 0 0 1 28 0V150z" fill={T.gold} className="ftzLit" />
      <path d="M96 150V116a14 14 0 0 1 28 0V150z" fill="none" stroke="#22040a" strokeWidth="1.5" />
      <path d="M92 108q18 10 36 0" stroke="#f07c0a" strokeWidth="3" fill="none" strokeDasharray="1 4" strokeLinecap="round" />
      {[50, 66, 82, 138, 154, 170].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy="66" rx="5" ry="2.6" fill="#b4501a" />
          <path d={`M${x} 58q2.4 3 0 6q-2.4-3 0-6z`} fill={T.flame} className="ftzFlame" />
        </g>
      ))}
      <ellipse cx="110" cy="152" rx="130" ry="10" fill="#1e0306" />
    </svg>
  );
}

/** A garba mandap: a scalloped canopy on carved pillars, bells hanging, a ring of dancers' footprints. */
function Mandap() {
  return (
    <svg className="ftzMandap" viewBox="0 0 220 150" aria-hidden>
      <defs>
        <linearGradient id="ftzCanopy" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ffcf3a" />
          <stop offset="1" stopColor="#f29a00" />
        </linearGradient>
      </defs>
      {/* the garba circle on the ground */}
      <ellipse cx="110" cy="140" rx="96" ry="10" fill="none" stroke="#ffe6a6" strokeWidth="1.4" strokeDasharray="2 5" opacity=".7" />
      <ellipse cx="110" cy="140" rx="70" ry="7" fill="none" stroke="#ff3d9a" strokeWidth="1.2" strokeDasharray="1.5 4" opacity=".7" />
      {/* pillars */}
      {[34, 186].map((x) => (
        <g key={x}>
          <rect x={x - 5} y="46" width="10" height="94" rx="2" fill="#7a0f12" stroke="#d4a537" strokeWidth="1.2" />
          {[62, 86, 110].map((y) => <rect key={y} x={x - 6.5} y={y} width="13" height="3" fill="#d4a537" />)}
          <circle cx={x} cy="44" r="6" fill="#d4a537" />
        </g>
      ))}
      {/* canopy */}
      <path d="M22 44 Q110 -8 198 44 Z" fill="url(#ftzCanopy)" stroke="#b3121b" strokeWidth="1.6" />
      <path d="M22 44 Q110 6 198 44" fill="none" stroke="#b3121b" strokeWidth="1" strokeDasharray="2 3" />
      {Array.from({ length: 11 }, (_, i) => {
        const x = 22 + i * 17.6;
        return <path key={i} d={`M${x} 44 q8.8 12 17.6 0`} fill={i % 2 ? "#c8141f" : "#e5197d"} stroke="#d4a537" strokeWidth=".8" />;
      })}
      {[48, 80, 110, 140, 172].map((x, i) => (
        <g key={x} className="ftzBell" style={{ animationDelay: `${-i * 0.3}s` }}>
          <path d={`M${x} 52v${10 + (i % 2) * 6}`} stroke="#d4a537" strokeWidth=".8" />
          <circle cx={x} cy={64 + (i % 2) * 6} r="3" fill="#f7c64a" />
        </g>
      ))}
      <circle cx="110" cy="14" r="4" fill="#d4a537" />
    </svg>
  );
}

const COPY: Record<FestivalId, { aria: (pct: number) => string; badge: string; title: React.ReactNode; sub: string; perks: string[]; go: string; miniKick: string; miniTitle: React.ReactNode }> = {
  dandiya: {
    aria: (pct) => (pct ? `The Navratri Dandiya drop — ${pct}% off the Dandiya partner invitation` : "The Navratri Dandiya drop"),
    badge: "Navratri Dandiya drop",
    title: <>Be my <em>Dandiya partner?</em></>,
    sub: "A twirling, dancing Navratri invitation they answer with a tap — only till Dussehra, 20 October.",
    perks: ["🥢 Dandiya invite", "🪞 Mirror-work magic", "🥁 Ends 20 Oct"],
    go: "See the Dandiya drop",
    miniKick: "🥢 Navratri Dandiya drop",
    miniTitle: <>Be my <em>Dandiya partner?</em></>,
  },
  diwali: {
    aria: (pct) => (pct ? `The Diwali drop — ${pct}% off the Diwali wishes` : "The Diwali drop"),
    badge: "The Diwali drop",
    title: <>Light up <em>their Diwali</em></>,
    sub: "A Diwali wish they light up themselves — diyas, rangoli, crackers and your photos. Till Diwali night, 8 November.",
    perks: ["🪔 Diyas & rangoli", "🎆 Crackers they light", "✨ Ends 8 Nov"],
    go: "See the Diwali drop",
    miniKick: "🎆 The Diwali drop",
    miniTitle: <>Happy Diwali <em>wishes</em></>,
  },
};

export default function FestivalTeaser({ kind }: { kind: FestivalId }) {
  const season = useSeason();
  const free = useDropFree(kind);
  const pct = season?.mode === kind && season.sale.enabled ? season.sale.percent : 0;
  const T = FT[kind];
  const c = COPY[kind];
  return (
    <section className={`ftz ftz-k-${kind}`} style={ftVars(kind)} aria-label={c.badge}>
      <span className="ftzStars" aria-hidden />
      {kind === "dandiya" ? (
        <Bandhanwar n={14} className="ftzBand" />
      ) : (
        <>
          <Toran className="ftzToran l" />
          <Toran className="ftzToran r" />
        </>
      )}
      <FestivalLink href={DROPS[kind].path} className="ftzLink" prefetch={false} aria-label={free ? `${c.badge} — free` : c.aria(pct)}>
        <div className="ftzBody">
          <span className="ftzBadge">{kind === "dandiya" ? <Mirror size={13} /> : "🪔"} {c.badge}{free ? " · free" : pct ? ` · ${pct}% off` : ""}</span>
          <h2 className="ftzTitle">{c.title}</h2>
          <p className="ftzSub">{c.sub}</p>
          <ul className="ftzPerks" aria-label="Included">
            {c.perks.map((p) => <li key={p}>{p}</li>)}
          </ul>
          <span className="ftzGo">{c.go} <ArrowRight size={15} aria-hidden /></span>
        </div>
        <div className="ftzArt" aria-hidden>
          {kind === "dandiya" ? (
            <>
              <span className="ftzGlint ftzG1"><Mirror size={22} /></span>
              <span className="ftzGlint ftzG2"><Mirror size={16} thread={T.a1} /></span>
              <Mandap />
              <IdleGif src={FESTIVE_GIF("dandiyapartyner.webp")} width={130} height={130} className="ftzCouple" />
              <span className="ftzDhol"><Dhol size={40} /></span>
              <span className="ftzTwirl"><Dandiya size={34} /></span>
            </>
          ) : (
            <>
              <span className="ftzFw ftzFw1"><Burst size={70} color={T.flame} /></span>
              <span className="ftzFw ftzFw2"><Burst size={50} color={T.a1} /></span>
              <Haveli />
              <IdleGif src={FESTIVE_GIF("happy-diwali-diya.webp")} width={90} height={100} className="ftzCouple" />
            </>
          )}
          <span className="ftzSeal">{free ? <><b>FREE</b><i>DROP</i></> : pct ? <><b>{pct}<small>%</small></b><i>OFF</i></> : <><b>NEW</b><i>DROP</i></>}</span>
        </div>

        {/* Phones: one slim row. */}
        <span className="ftzMini">
          <span className="ftzMiniSeal">{free ? <><b>FREE</b><i>DROP</i></> : pct ? <><b>{pct}%</b><i>OFF</i></> : <><b>{kind === "dandiya" ? "🥢" : "🪔"}</b><i>NEW</i></>}</span>
          <span className="ftzMiniText">
            <span className="ftzMiniKick">{c.miniKick}</span>
            <span className="ftzMiniTitle">{c.miniTitle}</span>
          </span>
          <span className="ftzMiniGo"><ArrowRight size={16} /></span>
        </span>
      </FestivalLink>
    </section>
  );
}

const SEAL_BG = "radial-gradient(circle at 35% 30%, var(--ft-gold-soft), var(--ft-cta) 52%, var(--ft-cta-deep) 100%)";

export const FESTIVAL_TEASER_CSS = `
.ftz { position: relative; isolation: isolate; overflow: hidden; border-radius: 26px; background: var(--ft-sky);
  border: 1px solid var(--ft-edge); box-shadow: 0 24px 50px -28px color-mix(in srgb, var(--ft-ink) 90%, transparent), inset 0 1px 0 rgba(255,238,205,.12); }
.ftzStars { position: absolute; inset: 0; z-index: -1; pointer-events: none; opacity: .7;
  background-image: radial-gradient(1.2px 1.2px at 58% 12%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 72% 34%, #fff 50%, transparent 51%),
    radial-gradient(1.3px 1.3px at 90% 20%, #fff4cf 50%, transparent 51%), radial-gradient(1px 1px at 40% 8%, #fff 50%, transparent 51%),
    radial-gradient(1px 1px at 8% 70%, #ffe3a3 50%, transparent 51%), radial-gradient(1.2px 1.2px at 30% 88%, #fff 50%, transparent 51%); }
.ftz-k-dandiya .ftzStars { opacity: .55;
  background: radial-gradient(circle at 50% 50%, rgba(255,240,220,.55) 0 1.2px, transparent 1.6px) 0 0 / 18px 18px,
    radial-gradient(circle at 50% 50%, rgba(255,214,120,.42) 0 1px, transparent 1.4px) 9px 9px / 18px 18px; }
.ftzBand { position: absolute; z-index: 0; left: 0; top: 0; width: 100%; height: 40px; pointer-events: none; filter: drop-shadow(0 4px 6px rgba(40,0,4,.45)); }
.ftzToran { position: absolute; top: 0; z-index: 0; width: 74px; height: 60px; pointer-events: none; overflow: visible; filter: drop-shadow(0 2px 3px rgba(0,0,0,.35)); }
.ftzToran.l { left: 0; transform: scaleX(-1); } .ftzToran.r { right: 0; }
.ftzLink { position: relative; z-index: 1; display: grid; grid-template-columns: minmax(0,1fr); gap: 18px; align-items: center; padding: 22px 20px; color: inherit; text-decoration: none; height: 100%; }
.ftz-k-dandiya .ftzLink { padding-top: 40px; }
.ftzLink:focus-visible { outline: 2px solid var(--ft-cta); outline-offset: -4px; border-radius: 26px; }
.ftzBody { position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: 10px; min-width: 0; padding: 18px; border-radius: 20px;
  background: var(--ft-glass); -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); box-shadow: inset 0 0 0 1px var(--ft-edge); }
.ftzBadge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 11px; border-radius: 99px; color: var(--ft-cta-ink);
  background: linear-gradient(180deg, var(--ft-gold-soft), var(--ft-cta)); box-shadow: 0 0 16px var(--ft-glow); font: 800 10px/1.2 'Inter', system-ui, sans-serif; letter-spacing: .12em; text-transform: uppercase; }
.ftzTitle { margin: 2px 0 0; color: var(--ft-text); font: 600 26px/1.08 'Playfair Display', serif; letter-spacing: -.01em; }
.ftzTitle em { color: var(--ft-cta); font-style: italic; text-shadow: 0 0 18px var(--ft-glow); }
.ftzSub { margin: 0; max-width: 520px; color: var(--ft-muted); font: 400 13.5px/1.5 'Inter', system-ui, sans-serif; }
.ftzPerks { display: flex; flex-wrap: wrap; gap: 6px; margin: 2px 0 4px; padding: 0; list-style: none; }
.ftzPerks li { padding: 5px 10px; border-radius: 99px; border: 1px solid var(--ft-edge); color: var(--ft-text); background: rgba(255,214,120,.08); font: 600 11px/1 'Inter', system-ui, sans-serif; }
.ftzGo { display: inline-flex; align-items: center; gap: 7px; padding: 12px 20px; border-radius: 99px; color: var(--ft-cta-ink);
  background: linear-gradient(180deg, var(--ft-gold-soft), var(--ft-cta)); font: 800 13.5px/1 'Inter', system-ui, sans-serif;
  box-shadow: 0 10px 24px -10px var(--ft-cta); transition: transform .2s ease; }
.ftzArt { position: relative; height: 170px; }
.ftzHaveli, .ftzMandap { position: absolute; right: 0; bottom: 0; width: 86%; height: auto; max-height: 100%; filter: drop-shadow(0 0 18px var(--ft-glow)); }
.ftzMandap { filter: drop-shadow(0 6px 14px rgba(40,0,4,.45)); }
.ftzLit { animation: ftzLit 3.6s ease-in-out infinite; }
@keyframes ftzLit { 0%, 100% { opacity: 1; } 40% { opacity: .78; } 44% { opacity: 1; } 70% { opacity: .88; } }
.ftzFlame { animation: ftzFlick 1s ease-in-out infinite alternate; transform-box: fill-box; transform-origin: 50% 100%; }
@keyframes ftzFlick { from { transform: scale(1, 1); } to { transform: scale(.8, 1.2); } }
.ftzBell { transform-box: fill-box; transform-origin: 50% 0; animation: ftzBell 1.6s ease-in-out infinite; }
@keyframes ftzBell { 0%, 100% { transform: rotate(-8deg); } 50% { transform: rotate(8deg); } }
.ftzFw { position: absolute; z-index: 0; opacity: 0; pointer-events: none; }
.ftzFw svg { display: block; filter: drop-shadow(0 0 6px var(--ft-glow)); }
.ftzFw1 { right: 8%; top: -4%; animation: ftzBloom 4.6s ease-out infinite; }
.ftzFw2 { right: 52%; top: 2%; animation: ftzBloom 4.6s ease-out 2.1s infinite; }
@keyframes ftzBloom { 0%, 6% { opacity: 0; transform: scale(.1); } 10% { opacity: 1; } 36% { opacity: 0; transform: scale(1); } 100% { opacity: 0; } }
.ftzGlint { position: absolute; z-index: 1; animation: ftzGlint 3s ease-in-out infinite; }
.ftzGlint svg { display: block; filter: drop-shadow(0 0 6px rgba(255,255,255,.7)); }
.ftzG1 { left: 6%; top: 6%; } .ftzG2 { right: 4%; top: 2%; animation-delay: -1.4s; }
@keyframes ftzGlint { 0%, 100% { transform: rotate(0) scale(.9); opacity: .6; } 50% { transform: rotate(45deg) scale(1.15); opacity: 1; } }
.ftzCouple { position: absolute; left: 34%; bottom: 4px; width: 104px; height: 104px; z-index: 2; animation: ftzSway 2.4s ease-in-out infinite; transform-origin: 50% 100%; }
.ftz-k-diwali .ftzCouple { left: -2%; width: 84px; height: 94px; animation: none; filter: drop-shadow(0 0 16px rgba(255,176,32,.55)); }
@keyframes ftzSway { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg) translateY(-3px); } }
.ftzDhol { position: absolute; z-index: 2; right: 6%; bottom: 2px; animation: ftzDhol .6s ease-in-out infinite alternate; }
@keyframes ftzDhol { from { transform: rotate(-4deg); } to { transform: rotate(4deg) translateY(-2px); } }
.ftzTwirl { position: absolute; z-index: 2; left: 20%; bottom: 10px; animation: ftzTwirl 2.2s cubic-bezier(.5,0,.5,1) infinite; }
.ftzTwirl svg { filter: drop-shadow(0 0 6px rgba(255,214,120,.8)); }
@keyframes ftzTwirl { 0% { transform: rotate(0); } 60%, 100% { transform: rotate(360deg); } }
.ftzSeal { position: absolute; left: 30%; top: 2%; z-index: 3; width: 74px; height: 74px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center;
  color: var(--ft-cta-ink); background: ${SEAL_BG}; transform: rotate(-10deg);
  box-shadow: 0 0 26px var(--ft-glow), inset 0 2px 0 rgba(255,255,255,.45); animation: ftzSeal 2.8s ease-in-out infinite; }
.ftz-k-dandiya .ftzSeal { left: 4%; top: 30%; outline: 2px dashed rgba(255,246,234,.8); outline-offset: 3px; }
@keyframes ftzSeal { 0%, 100% { transform: rotate(-10deg) scale(1); } 50% { transform: rotate(-6deg) scale(1.07); } }
.ftzSeal b { font: 700 26px/1 'Playfair Display', serif; } .ftzSeal small { font-size: 13px; }
.ftzSeal i { font: 800 9px/1 'Inter', system-ui, sans-serif; font-style: normal; letter-spacing: .24em; margin-top: 2px; }
.ftzMini { display: none; }
@media (hover: hover) { .ftz:hover .ftzGo { transform: translateY(-2px); } }
@media (max-width: 767px) {
  .ftz { border-radius: 18px; }
  .ftzToran { width: 44px; height: 36px; }
  .ftzBand { height: 22px; }
  .ftzLink, .ftz-k-dandiya .ftzLink { display: block; padding: 0; }
  .ftz-k-dandiya .ftzLink { padding-top: 12px; }
  .ftzBody, .ftzArt { display: none; }
  .ftzMini { display: flex; align-items: center; gap: 12px; width: 100%; padding: 10px 12px 10px 10px; }
  .ftzMiniSeal { flex-shrink: 0; width: 52px; height: 52px; margin: 0 7px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center;
    color: var(--ft-cta-ink); background: ${SEAL_BG}; transform: rotate(-8deg);
    box-shadow: 0 0 18px var(--ft-glow), inset 0 1.5px 0 rgba(255,255,255,.45); animation: ftzSeal 2.8s ease-in-out infinite; }
  .ftzMiniSeal b { font: 700 16px/1 'Playfair Display', serif; }
  .ftzMiniSeal i { font: 800 7.5px/1 'Inter', system-ui, sans-serif; font-style: normal; letter-spacing: .2em; margin-top: 2px; }
  .ftzMiniText { display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1; }
  .ftzMiniKick { display: inline-flex; align-items: center; gap: 4px; color: var(--ft-gold-soft); font: 800 9.5px/1 'Inter', system-ui, sans-serif; letter-spacing: .14em; text-transform: uppercase; }
  .ftzMiniTitle { color: var(--ft-text); font: 600 15px/1.2 'Playfair Display', serif; }
  .ftzMiniTitle em { color: var(--ft-cta); font-style: italic; }
  .ftzMiniGo { flex-shrink: 0; width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; color: var(--ft-cta-ink);
    background: linear-gradient(180deg, var(--ft-gold-soft), var(--ft-cta)); box-shadow: 0 6px 14px -6px var(--ft-cta); }
}
@media (min-width: 768px) {
  .ftzLink { grid-template-columns: minmax(0,1.15fr) minmax(0,1fr); gap: 24px; padding: 30px 30px 30px 34px; }
  .ftz-k-dandiya .ftzLink { padding-top: 46px; }
  .ftzTitle { font-size: 36px; }
  .ftzSub { font-size: 15px; }
  .ftzArt { height: 230px; }
  .ftzCouple { width: 124px; height: 124px; }
}
@media (min-width: 1024px) {
  .ftzLink { grid-template-columns: minmax(0,1.2fr) minmax(0,.8fr); gap: 12px; padding: 22px 20px 22px 22px; }
  .ftz-k-dandiya .ftzLink { padding-top: 44px; }
  .ftzBody { padding: 18px 18px 20px; }
  .ftzTitle { font-size: 28px; }
  .ftzSub { font-size: 13.5px; }
  .ftzArt { height: 210px; }
  .ftzCouple { width: 100px; height: 100px; }
  .ftzSeal { left: 18%; }
  .ftz-k-dandiya .ftzSeal { left: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .ftz *, .ftz .ftzSeal, .ftz .ftzMiniSeal { animation: none !important; }
}
`;
