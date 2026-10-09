"use client";

// The gate's art: a thumbprint drawn in warm light (fine elliptical ridges, CSS only) with a heartbeat ring breathing
// out of it. It is the money moment in miniature: a thumb, warmth, a pulse. No photo here (they load behind the tap).

export function Thumbprint() {
  return (
    <span className="hh-print" aria-hidden>
      <i className="hh-printRing" />
      <i className="hh-printRing hh-printRing2" />
      <i className="hh-printGlow" />
      <i className="hh-printRidges" />
    </span>
  );
}

export const GATE_BG =
  "radial-gradient(60% 42% at 50% 58%, rgba(242,164,119,.20), transparent 70%)," +
  "radial-gradient(120% 80% at 50% 0%, #2A1D16 0%, #1E1510 45%, #120C09 100%)";

export const GATE_CSS = `
.hh-gate::before { content: ""; position: absolute; inset: 0; z-index: 1; pointer-events: none;
  background: radial-gradient(85% 65% at 50% 50%, transparent 45%, rgba(8,5,3,.7) 100%); }
.hh-gate .pm-gateIn { gap: 14px; }
.hh-gate .pm-gateKick { font: 700 11px/1.3 var(--hh-ui) !important; letter-spacing: .34em; color: rgba(250,247,242,.7); opacity: 1; }
.hh-gate .pm-gateName, .hh-gate .pm-gateName * { font-family: var(--hh-display) !important; font-weight: 400 !important; font-style: italic !important; }
.hh-gate .pm-gateName { font-size: clamp(64px, 19vw, 128px) !important; line-height: .95 !important; letter-spacing: -.02em; }
.hh-gate .pm-gateSub { font: 400 15px/1.45 var(--hh-ui) !important; color: rgba(250,247,242,.66); opacity: 1; max-width: 26ch; }
.hh-gate .pm-gateArt { width: min(230px, 58vw); max-height: 30vh; margin: 6px 0 4px; animation: none; }
.hh-gate .pm-gateCta { color: #2A1A10; font: 700 12.5px/1 var(--hh-ui) !important; letter-spacing: .22em; text-transform: uppercase; min-height: 54px; padding: 14px 36px;
  background: linear-gradient(180deg, #FFE2CC 0%, #F2A477 52%, #C9774A 100%); box-shadow: 0 18px 40px -14px rgba(242,164,119,.55), inset 0 1px 0 rgba(255,255,255,.7), 0 0 0 1px rgba(0,0,0,.25); }
.hh-gate .pm-gateCta small { font-family: var(--hh-ui); text-transform: none; letter-spacing: .04em; }
.hh-gate .pm-seal { background: rgba(250,247,242,.06); font: 500 12px/1.2 var(--hh-ui); letter-spacing: .04em; }
.hh-gate .pm-sealWax { background: radial-gradient(circle at 35% 30%, #F7C3A0, #C9774A 55%, #7A4126); color: #FFF4EA; }
.hh-gate .pm-quiet { font: 500 12px/1 var(--hh-ui); opacity: .6; }
.hh-gate .pm-bar { background: #080503; }

.hh-print { position: relative; display: block; width: 100%; height: 100%; }
.hh-print > i { position: absolute; inset: 0; margin: auto; border-radius: 50%; display: block; }
.hh-printGlow { width: 70%; height: 70%; background: radial-gradient(circle, rgba(255,214,180,.55) 0%, rgba(242,164,119,.28) 38%, rgba(242,164,119,0) 70%);
  animation: hh-glow 1.875s ease-in-out infinite; }
.hh-printRidges { width: 46%; height: 58%; border-radius: 48% 48% 46% 46% / 54% 54% 44% 44% !important;
  background: repeating-radial-gradient(ellipse 60% 74% at 50% 58%, rgba(255,226,204,.9) 0 1.2px, transparent 1.6px 6.5px);
  -webkit-mask-image: radial-gradient(ellipse 50% 52% at 50% 52%, #000 55%, transparent 100%); mask-image: radial-gradient(ellipse 50% 52% at 50% 52%, #000 55%, transparent 100%);
  filter: drop-shadow(0 0 6px rgba(242,164,119,.6)); opacity: .9; }
.hh-printRing { width: 62%; height: 62%; border: 1px solid rgba(242,164,119,.55); animation: hh-ring 1.875s cubic-bezier(.22,1,.36,1) infinite; }
.hh-printRing2 { animation-delay: .32s; border-color: rgba(250,247,242,.35); }
@keyframes hh-glow { 0%, 100% { transform: scale(.94); opacity: .8; } 14% { transform: scale(1.04); opacity: 1; } 30% { transform: scale(.98); } 42% { transform: scale(1.02); } }
@keyframes hh-ring { 0% { transform: scale(.7); opacity: 0; } 12% { opacity: 1; } 100% { transform: scale(1.55); opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .hh-printGlow, .hh-printRing { animation: none; } .hh-printRing { opacity: .5; } }
`;
