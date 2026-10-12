"use client";

// The sealed letter before "A note for you" opens: a real envelope, seen from
// the back. Ivory handmade paper with gold-foil edges, the two side flaps and
// the bottom flap folded in (each with its own soft shadow), the pointed top
// flap closed over them, and a kumkum wax seal pressed with a heart and two
// crossed dandiya sticks. "For <name>" is written across it in the Indian hand,
// with a little diya postage stamp and a Navratri postmark in the corner.
//
// Tap the seal: the wax splits, the flap lifts back in 3D to show its bandhani
// lining, and the letter slides up out of the pocket. The parent then swaps the
// envelope for the full letter. Transform/opacity only; reduced motion skips
// straight to the letter.

import { useId } from "react";
import { Diya } from "./art";
import { DD_HAND } from "./fonts";
import { DD } from "./ui";

const FLAP = "M0 0 H300 L168 98 Q150 112 132 98 Z";
const FLAP_EDGE = "M1 1 L132 98 Q150 112 168 98 L299 1";

function Seal() {
  return (
    <svg viewBox="0 0 120 120" width="100%" height="100%" style={{ display: "block", overflow: "visible" }} aria-hidden>
      <defs>
        <radialGradient id="ddlwax" cx="38%" cy="32%" r="75%">
          <stop offset="0" stopColor="#E0313C" />
          <stop offset=".55" stopColor="#A5121C" />
          <stop offset="1" stopColor="#5C060C" />
        </radialGradient>
        <linearGradient id="ddlgold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFF0B8" />
          <stop offset=".5" stopColor="#F2C14E" />
          <stop offset="1" stopColor="#B07A1C" />
        </linearGradient>
      </defs>
      <path
        d="M60 4 C72 3 80 10 90 12 C101 15 108 24 112 35 C117 46 115 56 117 66 C118 79 110 88 103 97 C95 107 84 112 72 115 C60 118 49 117 38 113 C26 109 16 102 10 91 C4 80 3 69 4 57 C5 45 8 34 16 25 C25 15 36 8 48 6 C52 5 56 4 60 4 Z"
        fill="url(#ddlwax)"
      />
      <circle cx="60" cy="60" r="40" fill="none" stroke="#5C060C" strokeOpacity=".55" strokeWidth="3" />
      <circle cx="60" cy="60" r="35" fill="none" stroke="#F6D27A" strokeOpacity=".75" strokeWidth="1.4" strokeDasharray="2 3.2" />
      {/* two crossed dandiya sticks behind a heart */}
      <g strokeLinecap="round">
        <path d="M36 84 L84 36" stroke="url(#ddlgold)" strokeWidth="6" />
        <path d="M36 36 L84 84" stroke="url(#ddlgold)" strokeWidth="6" />
        <path d="M36 84 L84 36 M36 36 L84 84" stroke="#7A4A0C" strokeWidth="6" strokeDasharray="2 8" strokeOpacity=".55" />
      </g>
      <path d="M60 52 C55 43 42 45 43 55 C44 64 60 73 60 73 C60 73 76 64 77 55 C78 45 65 43 60 52 Z" fill="url(#ddlgold)" stroke="#7A4A0C" strokeWidth="1.2" />
      <path d="M30 26 Q44 14 62 14" stroke="#FFFFFF" strokeOpacity=".45" strokeWidth="4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/** A perforated postage stamp with a lit diya, and a round postmark over its corner. */
function Stamp() {
  return (
    <svg viewBox="0 0 64 74" width="100%" style={{ display: "block", overflow: "visible" }} aria-hidden>
      <rect x="4" y="4" width="56" height="66" fill="#FFF8EA" stroke="#D9B26A" strokeWidth="1.6" strokeDasharray="2.4 2" />
      <rect x="9" y="9" width="46" height="56" rx="2" fill={DD.kumkum} />
      <rect x="11.5" y="11.5" width="41" height="51" rx="1.5" fill="none" stroke={DD.gold} strokeWidth="1" />
      <foreignObject x="14" y="20" width="36" height="36">
        <div style={{ width: 36, height: 36 }}>
          <Diya lit size={36} hue={DD.peacock} />
        </div>
      </foreignObject>
      <text x="32" y="60" textAnchor="middle" fontSize="6.4" fontWeight="700" fill={DD.gold} fontFamily="system-ui, sans-serif" letterSpacing=".6">
        ₹ 9
      </text>
    </svg>
  );
}

function Postmark() {
  return (
    <svg viewBox="0 0 100 60" width="100%" style={{ display: "block", overflow: "visible" }} aria-hidden>
      <g fill="none" stroke="#6B2A1A" strokeOpacity=".55" strokeWidth="1.6">
        <circle cx="30" cy="30" r="24" />
        <circle cx="30" cy="30" r="18" strokeWidth="1" />
        {[0, 1, 2, 3].map((k) => (
          <path key={k} d={`M56 ${18 + k * 8} q8 -5 16 0 t16 0`} />
        ))}
      </g>
      <text x="30" y="27.5" textAnchor="middle" fontSize="6.6" fontWeight="800" fill="#6B2A1A" fillOpacity=".6" fontFamily="system-ui, sans-serif" letterSpacing=".5">
        NAVRATRI
      </text>
      <text x="30" y="36.5" textAnchor="middle" fontSize="5.6" fontWeight="700" fill="#6B2A1A" fillOpacity=".6" fontFamily="system-ui, sans-serif" letterSpacing=".4">
        DANDIYA
      </text>
    </svg>
  );
}

export default function LetterEnvelope({ recipient, sender, opening, gone, onOpen }: { recipient: string; sender: string; opening: boolean; gone: boolean; onOpen: () => void }) {
  const uid = useId().replace(/:/g, "");
  return (
    <div className={`dd-env${opening ? " is-opening" : ""}${gone ? " is-gone" : ""}`} data-dd-envelope2={opening ? "open" : "sealed"} onClick={onOpen}>
      <style>{ENV_CSS}</style>
      <span className="dd-env-glow" aria-hidden />
      <div className="dd-env-body">
        {/* the lining you see once the flap is up */}
        <span className="dd-env-back" aria-hidden />

        {/* the letter inside */}
        <div className="dd-env-letter" aria-hidden>
          <p className="dd-env-dear">Dear {recipient},</p>
          <span className="dd-env-lines" />
        </div>

        {/* the pocket: side flaps and the bottom flap, folded in */}
        <svg className="dd-env-pocket" viewBox="0 0 300 200" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id={`ps${uid}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#F1DDB6" />
              <stop offset="1" stopColor="#FAEBD0" />
            </linearGradient>
            <linearGradient id={`pr${uid}`} x1="1" y1="0" x2="0" y2="0">
              <stop offset="0" stopColor="#EBD3A6" />
              <stop offset="1" stopColor="#F7E6C6" />
            </linearGradient>
            <linearGradient id={`pb${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#FFF9EC" />
              <stop offset="1" stopColor="#F6E4C2" />
            </linearGradient>
            <filter id={`bl${uid}`} x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>
          <path d="M0 0 L146 106 L0 200 Z" fill={`url(#ps${uid})`} />
          <path d="M300 0 L154 106 L300 200 Z" fill={`url(#pr${uid})`} />
          <path d="M0 200 L130 98 Q150 84 170 98 L300 200 Z" transform="translate(0 -4)" fill="rgba(110,60,15,.32)" filter={`url(#bl${uid})`} />
          <path d="M0 200 L130 98 Q150 84 170 98 L300 200 Z" fill={`url(#pb${uid})`} />
          <path d="M1 199 L130 98 Q150 84 170 98 L299 199" fill="none" stroke="#D4A64A" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
          <path d="M16 192 L134 104 Q150 93 166 104 L284 192" fill="none" stroke="#D4A64A" strokeOpacity=".55" strokeWidth="1" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
        </svg>

        <p className="dd-env-to" aria-hidden>
          <span className="dd-env-for">For</span> {recipient}
          <span className="dd-env-from">♡ from {sender}</span>
        </p>
        <span className="dd-env-stamp" aria-hidden>
          <Stamp />
        </span>
        <span className="dd-env-mark" aria-hidden>
          <Postmark />
        </span>

        {/* the top flap's shadow on the pocket, then the flap itself (ivory outside, bandhani lining inside) */}
        <svg className="dd-env-fshadow" viewBox="0 0 300 200" preserveAspectRatio="none" aria-hidden>
          <defs>
            <filter id={`fb${uid}`} x="-10%" y="-10%" width="120%" height="130%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
          </defs>
          <path d={FLAP} transform="translate(0 6)" fill="rgba(90,40,5,.42)" filter={`url(#fb${uid})`} />
        </svg>
        <div className="dd-env-flap" aria-hidden>
          <svg className="dd-env-face dd-env-face-out" viewBox="0 0 300 200" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`fo${uid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#FBEFD6" />
                <stop offset=".7" stopColor="#FFF9EE" />
                <stop offset="1" stopColor="#F4E2BF" />
              </linearGradient>
            </defs>
            <path d={FLAP} fill={`url(#fo${uid})`} />
            <path d="M26 0 L140 84 Q150 91 160 84 L274 0" fill="none" stroke="#D4A64A" strokeOpacity=".6" strokeWidth="1" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
            <path d={FLAP_EDGE} fill="none" stroke="#C9963A" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
          </svg>
          <svg className="dd-env-face dd-env-face-in" viewBox="0 0 300 200" preserveAspectRatio="none">
            <defs>
              <pattern id={`ln${uid}`} width="14" height="14" patternUnits="userSpaceOnUse">
                <rect width="14" height="14" fill="#B3162A" />
                <circle cx="3.5" cy="3.5" r="1.5" fill="#FFF4DE" />
                <circle cx="10.5" cy="10.5" r="1.9" fill="#F6D27A" />
              </pattern>
            </defs>
            <path d={FLAP} fill={`url(#ln${uid})`} />
            <path d={FLAP_EDGE} fill="none" stroke="#F6D27A" strokeWidth="2.4" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>

        <button
          type="button"
          className="dd-env-seal"
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
          disabled={opening}
          tabIndex={opening ? -1 : 0}
          aria-label="Break the seal and read the letter"
        >
          <span className="dd-env-half dd-env-half-l">
            <Seal />
          </span>
          <span className="dd-env-half dd-env-half-r">
            <Seal />
          </span>
        </button>
      </div>
    </div>
  );
}

const ENV_CSS = `
.dd-env { position: relative; grid-area: 1 / 1; width: min(90cqw, 130cqh, calc(390px * var(--vw-s, 1))); aspect-ratio: 1.5; cursor: pointer; margin-top: min(12cqh, 20cqw);
  transition: transform .55s cubic-bezier(.5,0,.7,.4), opacity .45s ease; -webkit-tap-highlight-color: transparent; }
.dd-env.is-gone { opacity: 0; transform: translateY(22%) scale(.9); pointer-events: none; }
.dd-env.is-opening { cursor: default; }
.dd-env-glow { position: absolute; inset: -26% -18%; border-radius: 50%; pointer-events: none;
  background: radial-gradient(50% 50% at 50% 55%, rgba(255,214,120,.5), rgba(255,160,40,.2) 45%, rgba(255,120,30,0) 72%);
  animation: dd-env-glow 3.2s ease-in-out infinite alternate; }
@keyframes dd-env-glow { from { opacity: .7; transform: scale(.96) } to { opacity: 1; transform: scale(1.05) } }
.dd-env-body { position: absolute; inset: 0; isolation: isolate; animation: dd-env-float 3.6s ease-in-out infinite alternate; }
@keyframes dd-env-float { from { transform: translateY(0) rotate(-1.2deg) } to { transform: translateY(-6px) rotate(.6deg) } }
.dd-env.is-opening .dd-env-body { animation: none; transform: none; transition: transform .4s ease; }
.dd-env-back { position: absolute; inset: 0; border-radius: 8px;
  background: radial-gradient(circle, rgba(246,210,122,.85) 0 1.6px, rgba(0,0,0,0) 2.2px) 0 0 / 14px 14px,
    radial-gradient(circle, rgba(255,244,222,.7) 0 1.2px, rgba(0,0,0,0) 1.8px) 7px 7px / 14px 14px, linear-gradient(180deg, #A3132A, #7A0E1E);
  box-shadow: 0 30px 50px -22px rgba(20,0,2,.9), 0 0 0 1.5px #D4A64A; }
/* the letter: cream, ruled, "Dear …" in the hand */
.dd-env-letter { position: absolute; z-index: 1; left: 6%; right: 6%; top: 5%; height: 88%; border-radius: 4px; box-sizing: border-box; padding: 7% 8% 0;
  background: radial-gradient(110% 80% at 50% 30%, rgba(255,255,255,.7), rgba(255,255,255,0) 60%), linear-gradient(172deg, #FFF8E6, #F6E0B4);
  box-shadow: inset 0 0 0 1.5px rgba(184,134,46,.7), inset 0 0 0 4px rgba(255,248,230,.9), inset 0 0 0 5px rgba(214,165,55,.6), 0 -4px 14px -6px rgba(40,0,0,.4);
  transition: transform .85s cubic-bezier(.2,.85,.25,1.05) .75s; }
.dd-env.is-opening .dd-env-letter { transform: translateY(-58%); }
.dd-env-dear { margin: 0; font: 700 clamp(17px, 6cqw, 24px)/1.2 ${DD_HAND}; color: ${DD.kumkumDeep}; text-align: left; }
.dd-env-lines { display: block; margin-top: 6%; height: 40%;
  background: repeating-linear-gradient(180deg, rgba(0,0,0,0) 0 15px, rgba(142,16,34,.18) 15px 16.5px); }
.dd-env-pocket { position: absolute; z-index: 2; inset: 0; width: 100%; height: 100%; overflow: visible; filter: drop-shadow(0 1px 0 rgba(212,166,74,.9)); }
/* the name, the stamp and the postmark on the pocket */
.dd-env-to { position: absolute; z-index: 3; left: 18%; right: 18%; bottom: 6%; margin: 0; text-align: center; pointer-events: none;
  font: 700 clamp(19px, 7cqw, 28px)/1.05 ${DD_HAND}; color: ${DD.kumkumDeep}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transform: rotate(-3deg); }
.dd-env-for { font-weight: 400; font-size: .7em; color: #7A3A2A; }
.dd-env-from { display: block; margin-top: 2px; font: 400 clamp(12px, 4cqw, 15px)/1.2 ${DD_HAND}; color: #7A3A2A; overflow: hidden; text-overflow: ellipsis; }
.dd-env-stamp { position: absolute; z-index: 3; right: 4.5%; bottom: 9%; width: 13.5%; transform: rotate(5deg); filter: drop-shadow(0 2px 2px rgba(80,30,0,.3)); }
.dd-env-mark { position: absolute; z-index: 3; right: 12%; bottom: 27%; width: 22%; transform: rotate(-12deg); opacity: .9; pointer-events: none; }
/* the top flap: its shadow, then the flap in 3D with an ivory outside and a bandhani lining */
.dd-env-fshadow { position: absolute; z-index: 4; inset: 0; width: 100%; height: 100%; overflow: visible; transition: opacity .3s ease .15s; pointer-events: none; }
.dd-env.is-opening .dd-env-fshadow { opacity: 0; }
.dd-env-flap { position: absolute; z-index: 5; inset: 0; transform-origin: 50% 0; transform-style: preserve-3d; pointer-events: none;
  transform: perspective(900px) rotateX(0deg); transition: transform .8s cubic-bezier(.3,.6,.25,1) .22s, z-index 0s .62s; }
.dd-env-face { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
.dd-env-face-in { transform: rotateX(180deg); }
.dd-env.is-opening .dd-env-flap { transform: perspective(900px) rotateX(180deg); z-index: 0; }
/* the wax seal on the flap's tip — the button */
.dd-env-seal { position: absolute; z-index: 6; left: 50%; top: 50%; width: clamp(58px, 19cqw, 80px); aspect-ratio: 1; transform: translate(-50%, -50%); border: 0; padding: 0; background: none;
  border-radius: 50%; cursor: pointer; touch-action: manipulation; -webkit-tap-highlight-color: transparent; filter: drop-shadow(0 5px 7px rgba(30,0,0,.5));
  animation: dd-env-seal 1.8s ease-in-out infinite alternate; }
@keyframes dd-env-seal { from { transform: translate(-50%, -50%) scale(1) } to { transform: translate(-50%, -50%) scale(1.07) } }
.dd-env-seal:disabled { animation: none; cursor: default; }
.dd-env-seal:focus-visible { outline: 3px solid #7FD8F2; outline-offset: 4px; }
.dd-env-seal::after { content: ""; position: absolute; inset: -14%; border-radius: 50%; border: 2px solid rgba(255,224,138,.8); animation: dd-env-ring 1.8s ease-out infinite; pointer-events: none; }
@keyframes dd-env-ring { from { opacity: .9; transform: scale(.8) } to { opacity: 0; transform: scale(1.35) } }
.dd-env-seal:disabled::after { display: none; }
.dd-env-half { position: absolute; inset: 0; display: block; transition: transform .6s cubic-bezier(.4,.1,.7,.6), opacity .6s ease; }
.dd-env-half-l { clip-path: polygon(0 0, 52% 0, 48% 20%, 54% 33%, 49% 45%, 54% 58%, 48% 72%, 52% 85%, 50% 100%, 0 100%); }
.dd-env-half-r { clip-path: polygon(52% 0, 100% 0, 100% 100%, 50% 100%, 52% 85%, 48% 72%, 54% 58%, 49% 45%, 54% 33%, 48% 20%); }
.dd-env.is-opening .dd-env-half-l { transform: translate(-55%, 75%) rotate(-50deg); opacity: 0; }
.dd-env.is-opening .dd-env-half-r { transform: translate(55%, 85%) rotate(45deg); opacity: 0; }
@media (prefers-reduced-motion: reduce) { .dd-env, .dd-env * { animation: none !important; transition: none !important; } }
`;
