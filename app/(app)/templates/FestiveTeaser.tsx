"use client";

// The gallery's invitation to the Navratri & Diwali drop, in the seasonal
// teaser's spot beside Premium while the site is in festive mode. Same shape as
// ValentineTeaser / HalloweenTeaser — a full card on tablets and up, one slim
// row on phones — painted as the festival night (FV): frosted navy glass, a
// lit haveli with diyas along its parapet, a marigold toran, a firework and
// the dandiya couple. Inline SVG/CSS; the couple GIF loads after idle into a
// box that is already sized. Opens through the festive portal.

import { ArrowRight } from "lucide-react";
import { useSeason } from "@/hooks/useSeason";
import { FESTIVE_GIF, FESTIVE_PATH } from "@/lib/season";
import { FV, FV_SKY } from "@/components/promo/festiveTheme";
import { Burst } from "@/components/promo/festiveArt";
import { FestiveLink } from "@/components/promo/FestivePortal";
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

/** A lit haveli: domes and chhatris, warm arched windows, diyas along the parapet. */
function Haveli() {
  const win = (x: number, y: number, w = 12, h = 18) => (
    <path d={`M${x} ${y + h}V${y + w / 2}a${w / 2} ${w / 2} 0 0 1 ${w} 0V${y + h}z`} fill={FV.flame} className="ftzLit" />
  );
  return (
    <svg className="ftzHaveli" viewBox="0 0 220 150" aria-hidden>
      <defs>
        <linearGradient id="ftzWall" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#3a3f86" />
          <stop offset="1" stopColor="#1b1f52" />
        </linearGradient>
      </defs>
      {/* side chhatris */}
      <path d="M18 150V92h34v58z" fill="url(#ftzWall)" />
      <path d="M14 92h42M20 92q15-26 30 0" fill="#2b3070" stroke="#0a0b22" strokeWidth="1.5" />
      <path d="M168 150V92h34v58z" fill="url(#ftzWall)" />
      <path d="M164 92h42M170 92q15-26 30 0" fill="#2b3070" stroke="#0a0b22" strokeWidth="1.5" />
      {/* main body + central dome */}
      <path d="M44 150V70h132v80z" fill="url(#ftzWall)" stroke="#0a0b22" strokeWidth="1.5" />
      <path d="M40 70h140" stroke="#f4c95d" strokeWidth="2.4" />
      <path d="M80 70q30-58 60 0z" fill="#2b3070" stroke="#0a0b22" strokeWidth="1.5" />
      <path d="M110 12v14" stroke="#f4c95d" strokeWidth="2" />
      <circle cx="110" cy="11" r="2.6" fill="#ffd36b" />
      {/* windows */}
      {win(58, 84)}{win(80, 84)}{win(128, 84)}{win(150, 84)}
      {win(28, 104, 14, 22)}{win(178, 104, 14, 22)}
      {/* the door */}
      <path d="M96 150V116a14 14 0 0 1 28 0V150z" fill="#ffb020" className="ftzLit" />
      <path d="M96 150V116a14 14 0 0 1 28 0V150z" fill="none" stroke="#0a0b22" strokeWidth="1.5" />
      {/* toran over the door */}
      <path d="M92 108q18 10 36 0" stroke="#f07c0a" strokeWidth="3" fill="none" strokeDasharray="1 4" strokeLinecap="round" />
      {/* diyas along the parapet */}
      {[50, 66, 82, 138, 154, 170].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy="66" rx="5" ry="2.6" fill="#c45e06" />
          <path d={`M${x} 58q2.4 3 0 6q-2.4-3 0-6z`} fill="#ffd36b" className="ftzFlame" />
        </g>
      ))}
      <ellipse cx="110" cy="152" rx="130" ry="10" fill="#0a0b22" />
    </svg>
  );
}

export default function FestiveTeaser() {
  const season = useSeason();
  const pct = season?.mode === "festive" && season.sale.enabled ? season.sale.percent : 0;
  return (
    <section className="ftz" aria-label="The Navratri and Diwali drop">
      <span className="ftzStars" aria-hidden />
      <Toran className="ftzToran l" />
      <Toran className="ftzToran r" />
      <FestiveLink href={FESTIVE_PATH} className="ftzLink" prefetch={false}
        aria-label={pct ? `The Navratri and Diwali drop — ${pct}% off festive templates` : "The Navratri and Diwali drop — festive templates"}>
        <div className="ftzBody">
          <span className="ftzBadge">🪔 Navratri &amp; Diwali drop{pct ? ` · ${pct}% off` : ""}</span>
          <h2 className="ftzTitle">Be my <em>Dandiya partner?</em></h2>
          <p className="ftzSub">Invite them to Garba nights, then light up their Diwali — two festive cards, only till Diwali night, 8 November.</p>
          <ul className="ftzPerks" aria-label="Included">
            <li>🥢 Dandiya invite</li><li>🪔 Happy Diwali</li><li>🎆 Ends 8 Nov</li>
          </ul>
          <span className="ftzGo">See the festive drop <ArrowRight size={15} aria-hidden /></span>
        </div>
        <div className="ftzArt" aria-hidden>
          <span className="ftzFw ftzFw1"><Burst size={70} color={FV.flame} /></span>
          <span className="ftzFw ftzFw2"><Burst size={50} color={FV.rose} /></span>
          <Haveli />
          <IdleGif src={FESTIVE_GIF("dandiyapartyner.webp")} width={130} height={130} className="ftzCouple" />
          <span className="ftzSeal">{pct ? <><b>{pct}<small>%</small></b><i>OFF</i></> : <><b>NEW</b><i>DROP</i></>}</span>
        </div>

        {/* Phones: one slim row. */}
        <span className="ftzMini">
          <span className="ftzMiniSeal">{pct ? <><b>{pct}%</b><i>OFF</i></> : <><b>🪔</b><i>NEW</i></>}</span>
          <span className="ftzMiniText">
            <span className="ftzMiniKick">🎆 Navratri &amp; Diwali drop</span>
            <span className="ftzMiniTitle">Dandiya <em>&amp; Diwali cards</em></span>
          </span>
          <span className="ftzMiniGo"><ArrowRight size={16} /></span>
        </span>
      </FestiveLink>
    </section>
  );
}

const SEAL_BG = `radial-gradient(circle at 35% 30%, ${FV.goldSoft}, ${FV.marigold} 52%, ${FV.marigoldDeep} 100%)`;

export const FESTIVE_TEASER_CSS = `
.ftz { position: relative; isolation: isolate; overflow: hidden; border-radius: 26px; background: ${FV_SKY};
  border: 1px solid ${FV.glassEdge}; box-shadow: 0 24px 50px -28px rgba(13,15,46,.9), inset 0 1px 0 rgba(255,238,205,.12); }
.ftzStars { position: absolute; inset: 0; z-index: -1; pointer-events: none; opacity: .7;
  background-image: radial-gradient(1.2px 1.2px at 58% 12%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 72% 34%, #fff 50%, transparent 51%),
    radial-gradient(1.3px 1.3px at 90% 20%, #fff4cf 50%, transparent 51%), radial-gradient(1px 1px at 40% 8%, #fff 50%, transparent 51%),
    radial-gradient(1px 1px at 8% 70%, #ffe3a3 50%, transparent 51%), radial-gradient(1.2px 1.2px at 30% 88%, #fff 50%, transparent 51%); }
.ftzToran { position: absolute; top: 0; z-index: 0; width: 74px; height: 60px; pointer-events: none; overflow: visible; filter: drop-shadow(0 2px 3px rgba(0,0,0,.35)); }
.ftzToran.l { left: 0; transform: scaleX(-1); } .ftzToran.r { right: 0; }
.ftzLink { position: relative; z-index: 1; display: grid; grid-template-columns: minmax(0,1fr); gap: 18px; align-items: center; padding: 22px 20px; color: inherit; text-decoration: none; height: 100%; }
.ftzLink:focus-visible { outline: 2px solid ${FV.marigold}; outline-offset: -4px; border-radius: 26px; }
.ftzBody { position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: 10px; min-width: 0; padding: 18px; border-radius: 20px;
  background: ${FV.glass}; -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); box-shadow: inset 0 0 0 1px ${FV.glassEdge}; }
.ftzBadge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 11px; border-radius: 99px; color: #2a1206;
  background: linear-gradient(180deg, ${FV.goldSoft}, ${FV.marigold}); box-shadow: 0 0 16px rgba(255,176,32,.5); font: 800 10px/1.2 'Inter', system-ui, sans-serif; letter-spacing: .12em; text-transform: uppercase; }
.ftzTitle { margin: 2px 0 0; color: ${FV.text}; font: 600 26px/1.08 'Playfair Display', serif; letter-spacing: -.01em; }
.ftzTitle em { color: ${FV.marigold}; font-style: italic; text-shadow: 0 0 18px rgba(255,176,32,.5); }
.ftzSub { margin: 0; max-width: 520px; color: ${FV.muted}; font: 400 13.5px/1.5 'Inter', system-ui, sans-serif; }
.ftzPerks { display: flex; flex-wrap: wrap; gap: 6px; margin: 2px 0 4px; padding: 0; list-style: none; }
.ftzPerks li { padding: 5px 10px; border-radius: 99px; border: 1px solid ${FV.glassEdge}; color: ${FV.text}; background: rgba(244,201,93,.08); font: 600 11px/1 'Inter', system-ui, sans-serif; }
.ftzGo { display: inline-flex; align-items: center; gap: 7px; padding: 12px 20px; border-radius: 99px; color: #2a1206;
  background: linear-gradient(180deg, ${FV.goldSoft}, ${FV.marigold}); font: 800 13.5px/1 'Inter', system-ui, sans-serif;
  box-shadow: 0 10px 24px -10px rgba(255,176,32,.9); transition: transform .2s ease; }
.ftzArt { position: relative; height: 170px; }
.ftzHaveli { position: absolute; right: 0; bottom: 0; width: 86%; height: auto; max-height: 100%; filter: drop-shadow(0 0 18px rgba(255,176,32,.25)); }
.ftzLit { animation: ftzLit 3.6s ease-in-out infinite; }
@keyframes ftzLit { 0%, 100% { opacity: 1; } 40% { opacity: .78; } 44% { opacity: 1; } 70% { opacity: .88; } }
.ftzFlame { animation: ftzFlick 1s ease-in-out infinite alternate; transform-box: fill-box; transform-origin: 50% 100%; }
@keyframes ftzFlick { from { transform: scale(1, 1); } to { transform: scale(.8, 1.2); } }
.ftzFw { position: absolute; z-index: 0; opacity: 0; pointer-events: none; }
.ftzFw svg { display: block; filter: drop-shadow(0 0 6px rgba(255,211,107,.8)); }
.ftzFw1 { right: 8%; top: -4%; animation: ftzBloom 4.6s ease-out infinite; }
.ftzFw2 { right: 52%; top: 2%; animation: ftzBloom 4.6s ease-out 2.1s infinite; }
@keyframes ftzBloom { 0%, 6% { opacity: 0; transform: scale(.1); } 10% { opacity: 1; } 36% { opacity: 0; transform: scale(1); } 100% { opacity: 0; } }
.ftzCouple { position: absolute; left: -2%; bottom: 0; width: 104px; height: 104px; z-index: 2; animation: ftzSway 3.2s ease-in-out infinite; transform-origin: 50% 100%; }
@keyframes ftzSway { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
.ftzSeal { position: absolute; left: 30%; top: 2%; z-index: 3; width: 74px; height: 74px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center;
  color: #2a1206; background: ${SEAL_BG}; transform: rotate(-10deg);
  box-shadow: 0 0 26px rgba(255,176,32,.65), inset 0 2px 0 rgba(255,255,255,.45); animation: ftzSeal 2.8s ease-in-out infinite; }
@keyframes ftzSeal { 0%, 100% { transform: rotate(-10deg) scale(1); } 50% { transform: rotate(-6deg) scale(1.07); } }
.ftzSeal b { font: 700 26px/1 'Playfair Display', serif; } .ftzSeal small { font-size: 13px; }
.ftzSeal i { font: 800 9px/1 'Inter', system-ui, sans-serif; font-style: normal; letter-spacing: .24em; margin-top: 2px; }
.ftzMini { display: none; }
@media (hover: hover) { .ftz:hover .ftzGo { transform: translateY(-2px); } }
@media (max-width: 767px) {
  .ftz { border-radius: 18px; }
  .ftzToran { width: 44px; height: 36px; }
  .ftzLink { display: block; padding: 0; }
  .ftzBody, .ftzArt { display: none; }
  .ftzMini { display: flex; align-items: center; gap: 12px; width: 100%; padding: 10px 12px 10px 10px; }
  .ftzMiniSeal { flex-shrink: 0; width: 52px; height: 52px; margin: 0 7px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center;
    color: #2a1206; background: ${SEAL_BG}; transform: rotate(-8deg);
    box-shadow: 0 0 18px rgba(255,176,32,.6), inset 0 1.5px 0 rgba(255,255,255,.45); animation: ftzSeal 2.8s ease-in-out infinite; }
  .ftzMiniSeal b { font: 700 16px/1 'Playfair Display', serif; }
  .ftzMiniSeal i { font: 800 7.5px/1 'Inter', system-ui, sans-serif; font-style: normal; letter-spacing: .2em; margin-top: 2px; }
  .ftzMiniText { display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1; }
  .ftzMiniKick { display: inline-flex; align-items: center; gap: 4px; color: ${FV.gold}; font: 800 9.5px/1 'Inter', system-ui, sans-serif; letter-spacing: .14em; text-transform: uppercase; }
  .ftzMiniTitle { color: ${FV.text}; font: 600 15px/1.2 'Playfair Display', serif; }
  .ftzMiniTitle em { color: ${FV.marigold}; font-style: italic; }
  .ftzMiniGo { flex-shrink: 0; width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; color: #2a1206;
    background: linear-gradient(180deg, ${FV.goldSoft}, ${FV.marigold}); box-shadow: 0 6px 14px -6px rgba(255,176,32,.85); }
}
@media (min-width: 768px) {
  .ftzLink { grid-template-columns: minmax(0,1.15fr) minmax(0,1fr); gap: 24px; padding: 30px 30px 30px 34px; }
  .ftzTitle { font-size: 36px; }
  .ftzSub { font-size: 15px; }
  .ftzArt { height: 230px; }
  .ftzCouple { width: 124px; height: 124px; }
}
@media (min-width: 1024px) {
  .ftzLink { grid-template-columns: minmax(0,1.2fr) minmax(0,.8fr); gap: 12px; padding: 22px 20px 22px 22px; }
  .ftzBody { padding: 18px 18px 20px; }
  .ftzTitle { font-size: 28px; }
  .ftzSub { font-size: 13.5px; }
  .ftzArt { height: 210px; }
  .ftzCouple { width: 100px; height: 100px; }
  .ftzSeal { left: 18%; }
}
@media (prefers-reduced-motion: reduce) {
  .ftzLit, .ftzFlame, .ftzFw, .ftzCouple, .ftzSeal, .ftzMiniSeal { animation: none !important; }
}
`;
