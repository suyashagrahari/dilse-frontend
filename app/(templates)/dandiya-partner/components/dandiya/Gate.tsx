"use client";

// Scene 1 — the liffafa. An embroidered sindoor-silk envelope: gold zari
// borders, bandhani dots, paisleys in the corners, a row of little mirrors
// along the hem, sealed with a wax seal pressed with a kalash. A warm rim light
// sits behind it and the mirrors catch the light as you move (desktop: the
// pointer tilts it; the sheen follows).
//
// Tap the seal — tak, tak, TAK! The wax cracks on each tap, splits in two on
// the third, the flap lifts back in real 3D, and the invitation card slides up
// out of the pocket with a bloom of light and a burst of mirror sparkles. This
// first tap is also what starts the music. The panda couple peeks over the
// corner and hops when it opens.
//
// Everything animates transform/opacity only (one composited layer each);
// reduced motion opens it in place.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { FONTS } from "../../../_valentine/theme";
import { Diya } from "./art";
import { DD_DISPLAY } from "./fonts";
import { useDd, useNext } from "./stage";
import { BANDHANI, DD, Hint, MIRROR_ROW, RoomTitle } from "./ui";

const TAPS = 3;
/** When the Next pill may appear after the third tap (the card has risen by then). */
const SETTLE_MS = 1900;

/** The wax seal: an uneven blob of deep-red wax with a gold kalash pressed into it. */
function WaxSeal({ cracks }: { cracks: number }) {
  return (
    <svg viewBox="0 0 120 120" width="100%" height="100%" style={{ display: "block", overflow: "visible" }} aria-hidden>
      <defs>
        <radialGradient id="ddwax" cx="38%" cy="32%" r="75%">
          <stop offset="0" stopColor="#E0313C" />
          <stop offset=".55" stopColor="#A5121C" />
          <stop offset="1" stopColor="#5C060C" />
        </radialGradient>
        <radialGradient id="ddwaxin" cx="50%" cy="50%" r="50%">
          <stop offset=".7" stopColor="#7E0A12" stopOpacity="0" />
          <stop offset="1" stopColor="#3E0307" stopOpacity=".55" />
        </radialGradient>
        <linearGradient id="ddkal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFF0B8" />
          <stop offset=".5" stopColor="#F2C14E" />
          <stop offset="1" stopColor="#B07A1C" />
        </linearGradient>
      </defs>
      {/* the poured edge */}
      <path
        d="M60 4 C72 3 80 10 90 12 C101 15 108 24 112 35 C117 46 115 56 117 66 C118 79 110 88 103 97 C95 107 84 112 72 115 C60 118 49 117 38 113 C26 109 16 102 10 91 C4 80 3 69 4 57 C5 45 8 34 16 25 C25 15 36 8 48 6 C52 5 56 4 60 4 Z"
        fill="url(#ddwax)"
      />
      <circle cx="60" cy="60" r="41" fill="none" stroke="#5C060C" strokeOpacity=".55" strokeWidth="3" />
      <circle cx="60" cy="60" r="41" fill="url(#ddwaxin)" />
      <circle cx="60" cy="60" r="36" fill="none" stroke="#F6D27A" strokeOpacity=".75" strokeWidth="1.4" strokeDasharray="2 3.2" />
      {/* the kalash: mango leaves, a coconut, the pot with a band */}
      <g fill="url(#ddkal)" stroke="#7A4A0C" strokeWidth=".8">
        {[-34, -17, 0, 17, 34].map((a) => (
          <path key={a} d="M60 46 Q55 36 60 26 Q65 36 60 46 Z" transform={`rotate(${a} 60 46)`} />
        ))}
        <ellipse cx="60" cy="38" rx="7" ry="8.5" />
        <path d="M50 49 L70 49 L68 54 Q82 60 80 72 Q78 86 60 87 Q42 86 40 72 Q38 60 52 54 Z" />
        <path d="M44 66 Q60 71 76 66" fill="none" stroke="#7A4A0C" strokeWidth="1.6" />
        <circle cx="60" cy="76" r="3" />
      </g>
      {/* glossy highlight */}
      <path d="M30 26 Q44 14 62 14" stroke="#FFFFFF" strokeOpacity=".45" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* the cracks, one per tap */}
      <g fill="none" stroke="#2A0205" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path className={`dd-crack${cracks >= 1 ? " is-on" : ""}`} pathLength={1} d="M60 6 L57 24 L64 38 L58 52" />
        <path className={`dd-crack${cracks >= 2 ? " is-on" : ""}`} pathLength={1} d="M58 52 L63 68 L56 84 L61 100 L59 116" />
      </g>
    </svg>
  );
}

/** A paisley (keri) in gold thread, for the corners. */
function Paisley({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden>
      <path d="M26 6 C36 10 37 26 26 33 C17 38 6 33 6 24 C6 16 14 13 19 17 C23 20 21 26 17 25" fill="none" stroke="#F6D27A" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="24" r="2.2" fill="#FFE08A" />
      <circle cx="27" cy="20" r="1.4" fill="#F6D27A" />
      <circle cx="25" cy="27" r="1.4" fill="#F6D27A" />
    </svg>
  );
}

const SPARK_N = 16;

export default function Gate({ recipient, sender, openingLine, sticker, onEnter }: { recipient: string; sender: string; openingLine: string; sticker: ReactNode; onEnter: () => void }) {
  const reduced = useReducedMotion();
  const { cue } = useDd();
  const [taps, setTaps] = useState(0);
  const [press, setPress] = useState(0);
  const [settled, setSettled] = useState(false);
  const open = taps >= TAPS;
  const tiltRef = useRef<HTMLDivElement | null>(null);

  const tap = () => {
    if (open) return;
    const n = taps + 1;
    haptic(n === TAPS ? [20, 40, 30] : 14);
    cue("dd-tak", { gain: n === TAPS ? 1.1 : 0.85, detune: (n - 2) * 90 });
    if (n === TAPS) {
      cue("dd-dhol", { gain: 1 });
      cue("paper-rustle", { gain: 0.6, at: 0.25 });
      cue("dd-bells", { gain: 0.7, at: 0.55 });
      window.setTimeout(() => cue("chime", { gain: 0.6 }), reduced ? 0 : 1050);
      window.setTimeout(
        () => burst({ kind: "petals", emojis: ["🌼", "🌸", "✨", "🌼"], origin: { x: 0.5, y: 0.42 }, count: 34 }),
        reduced ? 0 : 1100,
      );
    }
    setPress((c) => c + 1);
    setTaps(n);
  };

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => setSettled(true), reduced ? 0 : SETTLE_MS);
    return () => window.clearTimeout(t);
  }, [open, reduced]);

  // Desktop: the envelope tilts toward the pointer and the light slides across the mirrors.
  useEffect(() => {
    const el = tiltRef.current;
    if (!el || reduced) return;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width * 0.9)));
      ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height * 1.4)));
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          el.style.setProperty("--tx", tx.toFixed(3));
          el.style.setProperty("--ty", ty.toFixed(3));
        });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  useNext(open && settled ? "Open it" : null, onEnter, "sticks");

  return (
    <>
      <style>{GATE_CSS}</style>
      <RoomTitle as="h1" kicker="Navratri · a Dandiya night" title={<>Psst, {recipient}…</>} sub={openingLine || "the dhol is calling 🥁"} />

      <div className="dd-fill">
        <div ref={tiltRef} className={`dd-lif${open ? " is-open" : ""}${reduced ? " is-still" : ""}`} data-dd-envelope={open ? "open" : "sealed"}>
          <span className="dd-lif-rim" aria-hidden />
          <div className="dd-lif-tilt">
            {/* the panda couple, peeking over the corner */}
            <div className="dd-lif-peek">{sticker}</div>
            <div className="dd-lif-back" />
            <svg className="dd-lif-fshadow" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
              <defs>
                <filter id="ddlifsh" x="-10%" y="-10%" width="120%" height="130%">
                  <feGaussianBlur stdDeviation="2.2" />
                </filter>
              </defs>
              <path d="M0 0 H100 L50 72 Z" transform="translate(0 4)" fill="rgba(30,0,4,.55)" filter="url(#ddlifsh)" />
            </svg>
            <div className="dd-lif-flap" aria-hidden>
              <span className="dd-lif-flap-out" />
              <span className="dd-lif-flap-in" />
            </div>
            <div className="dd-lif-card">
              <span className="dd-lif-bloom" aria-hidden />
              <p className="dd-lif-k">You&apos;re invited</p>
              <p className="dd-lif-t">to a Dandiya night</p>
              <p className="dd-lif-s">with love, {sender}</p>
              <div className="dd-lif-diyas" aria-hidden>
                <Diya lit size={26} hue={DD.peacock} />
                <Diya lit size={30} hue={DD.kumkum} />
                <Diya lit size={26} hue={DD.emerald} />
              </div>
            </div>
            <div className="dd-lif-front">
              <Paisley className="dd-lif-pz dd-lif-pz-l" />
              <Paisley className="dd-lif-pz dd-lif-pz-r" />
              {/* the folded-in side flaps and bottom flap: soft shading and gold-stitched seams */}
              <svg className="dd-lif-seams" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                <path d="M0 0 L50 64 L0 100 Z" fill="rgba(40,0,6,.1)" />
                <path d="M100 0 L50 64 L100 100 Z" fill="rgba(40,0,6,.16)" />
                <path d="M0 100 L46 62 Q50 59 54 62 L100 100" fill="none" stroke={ZARI} strokeOpacity=".75" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
                <path d="M6 100 L46 67 Q50 64 54 67 L94 100" fill="none" stroke={ZARI} strokeOpacity=".45" strokeWidth="1" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
              </svg>
              <span className="dd-lif-mirrors" aria-hidden />
              <span className="dd-lif-sheen" aria-hidden />
            </div>
            <button
              type="button"
              className={`dd-lif-seal${press ? (press % 2 ? " is-press-a" : " is-press-b") : ""}`}
              onClick={tap}
              aria-label={open ? "The invitation is open" : `Tap the wax seal to open it (${taps} of ${TAPS})`}
              disabled={open}
            >
              <span className="dd-lif-half dd-lif-half-l">
                <WaxSeal cracks={taps} />
              </span>
              <span className="dd-lif-half dd-lif-half-r">
                <WaxSeal cracks={taps} />
              </span>
              {press > 0 && !reduced && <span key={`pop-${press}`} className="dd-lif-pop" aria-hidden />}
            </button>
            {open && !reduced && (
              <span className="dd-lif-sparks" aria-hidden>
                {Array.from({ length: SPARK_N }, (_, i) => {
                  const a = (i / SPARK_N) * Math.PI * 2 + (i % 2 ? 0.12 : 0);
                  const d = 70 + (i % 3) * 30;
                  return (
                    <i
                      key={i}
                      style={{ ["--x" as string]: `${Math.cos(a) * d}%`, ["--y" as string]: `${Math.sin(a) * d * 0.7 - 30}%`, animationDelay: `${1.05 + (i % 4) * 0.05}s` }}
                    />
                  );
                })}
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ flex: "none", minHeight: 34, display: "grid", placeItems: "center" }}>
        {!open ? (
          <Hint>
            Tap the seal:{" "}
            {Array.from({ length: TAPS }, (_, i) => (
              <b key={i} style={{ color: i < taps ? DD.marigold : "rgba(255,247,232,.5)", fontWeight: 800 }}>
                {i === TAPS - 1 ? "TAK!" : "tak, "}
              </b>
            ))}
          </Hint>
        ) : (
          <p style={{ margin: 0, font: `400 clamp(17px, 2.6dvh, 21px) ${DD_DISPLAY}`, color: DD.gold, opacity: settled ? 1 : 0, transition: "opacity .5s ease" }}>Dhamaal! It&apos;s open ✨</p>
        )}
      </div>
    </>
  );
}

const SILK = "linear-gradient(160deg, #D8283A 0%, #B3121B 45%, #8A0D14 100%)";
const ZARI = "#F6D27A";

const GATE_CSS = `
/* The envelope sits in the lower part of a near-square stage; the card rises into the space above it. */
.dd-lif { --tx: 0; --ty: 0; position: relative; width: min(86cqw, 100cqh, calc(350px * var(--vw-s, 1))); aspect-ratio: 1.45; margin-top: min(23cqw, 27cqh); }
.dd-lif-tilt { position: absolute; inset: 0; transform: perspective(1100px) rotateY(calc(var(--tx) * 7deg)) rotateX(calc(var(--ty) * -6deg)); transition: transform .25s ease-out; }
/* warm rim light behind it, breathing; it blooms when the card comes out */
.dd-lif-rim { position: absolute; inset: -22% -16%; border-radius: 50%; pointer-events: none;
  background: radial-gradient(50% 50% at 50% 55%, rgba(255,214,120,.55), rgba(255,160,40,.22) 45%, rgba(255,120,30,0) 72%);
  animation: dd-rim 3.2s ease-in-out infinite alternate; will-change: transform, opacity; }
@keyframes dd-rim { from { opacity: .7; transform: scale(.96) } to { opacity: 1; transform: scale(1.04) } }
.dd-lif.is-open .dd-lif-rim { animation: dd-rim-bloom 1.6s ease-out 1s both; }
@keyframes dd-rim-bloom { 0% { opacity: .9; transform: scale(1) } 35% { opacity: 1; transform: scale(1.3) } 100% { opacity: .85; transform: scale(1.12) } }

.dd-lif-back, .dd-lif-front { position: absolute; inset: 0; border-radius: 12px; }
.dd-lif-back { background: linear-gradient(180deg, #5C0A12, #34050A); box-shadow: 0 34px 60px -26px rgba(20,0,2,.9), 0 0 0 2px rgba(246,210,122,.55), 0 0 40px -6px rgba(255,190,80,.45); }
/* the card: cream with a gold frame */
.dd-lif-card { position: absolute; left: 7%; right: 7%; top: 6%; height: 88%; border-radius: 10px; z-index: 1;
  background: linear-gradient(180deg, #FFF9EC, #FFEBC2); box-shadow: 0 0 0 3px ${ZARI} inset, 0 0 0 6px #FFF4DE inset, 0 0 0 7px #B8862E inset, 0 10px 24px -10px rgba(40,0,0,.6);
  display: grid; align-content: start; justify-items: center; padding: 9% 8% 0; box-sizing: border-box; text-align: center; color: ${DD.maroon};
  transform: translateY(0); transition: transform 1.05s cubic-bezier(.2,.85,.25,1.08) .95s; will-change: transform; overflow: hidden; }
.dd-lif.is-open .dd-lif-card { transform: translateY(-74%); }
.dd-lif:not(.is-open) .dd-lif-card > p, .dd-lif:not(.is-open) .dd-lif-card > div { visibility: hidden; }
.dd-lif-bloom { position: absolute; inset: -40%; pointer-events: none; opacity: 0;
  background: radial-gradient(closest-side, rgba(255,255,255,.95), rgba(255,236,170,.6) 40%, rgba(255,214,120,0) 75%); }
.dd-lif.is-open .dd-lif-bloom { animation: dd-bloom 1.3s ease-out 1.2s both; }
@keyframes dd-bloom { 0% { opacity: 0; transform: scale(.4) } 30% { opacity: 1 } 100% { opacity: 0; transform: scale(1.4) } }
.dd-lif-k { margin: 0; font: 700 clamp(10px, 3.2cqw, 12px) ${FONTS.ui}; letter-spacing: .22em; text-transform: uppercase; color: ${DD.kumkum}; }
.dd-lif-t { margin: 2px 0 0; font: 400 clamp(20px, 7.4cqw, 30px)/1.15 ${DD_DISPLAY}; }
.dd-lif-s { margin: 4px 0 0; font: 700 clamp(15px, 5cqw, 20px) ${FONTS.script}; color: ${DD.kumkumDeep}; overflow-wrap: anywhere; }
.dd-lif-diyas { display: flex; gap: 6px; align-items: end; margin-top: 4px; }

/* the front pocket: sindoor silk, bandhani, a double zari border. Its mouth is the straight top edge,
   like a real envelope; the folded flaps are drawn on it (.dd-lif-seams), the bottom one peaking UP. */
.dd-lif-front { z-index: 2;
  background:
    linear-gradient(${ZARI}, ${ZARI}) 0 calc(100% - 9px) / 100% 2px no-repeat,
    linear-gradient(${ZARI}, ${ZARI}) 0 calc(100% - 26px) / 100% 1px no-repeat,
    ${BANDHANI}, ${SILK}; }
.dd-lif-front::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 3px; border-radius: 12px 12px 0 0; background: ${ZARI}; }
.dd-lif-mirrors { position: absolute; left: 0; right: 0; bottom: 11px; height: 14px; background: ${MIRROR_ROW}; }
.dd-lif-mirrors::after { content: ""; position: absolute; inset: -3px 0; mix-blend-mode: screen;
  background: linear-gradient(90deg, transparent 0, rgba(255,255,255,.95) 50%, transparent 100%) calc(50% + var(--tx, 0) * 160px) 0 / 70px 100% no-repeat;
  animation: dd-lif-glint 3.4s ease-in-out infinite; }
@keyframes dd-lif-glint { 0%, 100% { opacity: .35 } 50% { opacity: 1 } }
.dd-lif-sheen { position: absolute; inset: 0; pointer-events: none; mix-blend-mode: soft-light;
  background: linear-gradient(115deg, transparent 30%, rgba(255,240,200,.55) 48%, transparent 62%) calc(50% + var(--tx, 0) * 60%) 0 / 220% 100% no-repeat; }
.dd-lif-pz { position: absolute; bottom: 30px; width: 15%; aspect-ratio: 1; opacity: .95; }
.dd-lif-pz-l { left: 5%; }
.dd-lif-pz-r { right: 5%; transform: scaleX(-1); }

/* the flap: two faces (embroidered outside, gold-lined inside) that lift back in 3D about the top edge */
.dd-lif-seams { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.dd-lif-fshadow { position: absolute; inset: 0; z-index: 3; width: 100%; height: 100%; overflow: visible; pointer-events: none; transition: opacity .3s ease .3s; }
.dd-lif.is-open .dd-lif-fshadow { opacity: 0; }
.dd-lif-flap { position: absolute; inset: 0; z-index: 4; transform-origin: 50% 0; transform-style: preserve-3d;
  transform: perspective(900px) rotateX(0deg) scaleY(1); transition: transform .95s cubic-bezier(.3,.6,.25,1) .3s, z-index 0s .62s; will-change: transform; }
.dd-lif-flap > span { position: absolute; inset: 0; border-radius: 12px 12px 0 0; clip-path: polygon(0 0, 100% 0, 50% 72%); backface-visibility: hidden; -webkit-backface-visibility: hidden; }
.dd-lif-flap-out { background:
    linear-gradient(180deg, rgba(255,255,255,.14), rgba(0,0,0,0) 30%),
    ${BANDHANI}, linear-gradient(180deg, #E0293C, #B3121B 60%, #9A0F19); }
.dd-lif-flap-out::after { content: ""; position: absolute; inset: 0; clip-path: polygon(0 0, 100% 0, 50% 72%, 50% 66%, 93% 2.5%, 7% 2.5%, 50% 66%, 50% 72%); background: ${ZARI}; }
/* The lining is turned over (rotateX 180° about its centre) so it shows once the flap is open, and that
   turn mirrors it top-to-bottom. So its triangle is cut pre-mirrored (base at the bottom): after the flap's
   own turn about the top edge it sits ON the hinge, pointing up, instead of floating above it upside down. */
.dd-lif-flap > .dd-lif-flap-in { transform: rotateX(180deg); border-radius: 0 0 12px 12px; clip-path: polygon(0 100%, 100% 100%, 50% 28%);
  background: linear-gradient(0deg, rgba(92,10,18,.4), rgba(92,10,18,0) 22%), repeating-linear-gradient(45deg, #FFEFC8 0 6px, #F6D27A 6px 7px), #FFEFC8; }
.dd-lif-flap-in::after { content: ""; position: absolute; inset: 0; clip-path: polygon(0 100%, 100% 100%, 50% 28%, 50% 34%, 93% 97.5%, 7% 97.5%, 50% 34%, 50% 28%); background: ${ZARI}; }
.dd-lif.is-open .dd-lif-flap { transform: perspective(900px) rotateX(180deg) scaleY(1); z-index: 0; }


/* the wax seal — the button */
.dd-lif-seal { position: absolute; z-index: 5; left: 50%; top: 64%; width: clamp(70px, 26cqw, 100px); aspect-ratio: 1; transform: translate(-50%, -50%);
  border: 0; padding: 0; background: none; cursor: pointer; border-radius: 50%; touch-action: manipulation; -webkit-tap-highlight-color: transparent;
  filter: drop-shadow(0 6px 8px rgba(30,0,0,.55)); }
.dd-lif-seal:not(:disabled) { animation: dd-seal-breathe 1.8s ease-in-out infinite alternate; }
@keyframes dd-seal-breathe { from { transform: translate(-50%, -50%) scale(1) } to { transform: translate(-50%, -50%) scale(1.05) } }
.dd-lif-seal.is-press-a:not(:disabled) { animation: dd-seal-press-a .32s cubic-bezier(.3,1.6,.5,1), dd-seal-breathe 1.8s ease-in-out .32s infinite alternate; }
.dd-lif-seal.is-press-b:not(:disabled) { animation: dd-seal-press-b .32s cubic-bezier(.3,1.6,.5,1), dd-seal-breathe 1.8s ease-in-out .32s infinite alternate; }
@keyframes dd-seal-press-a { 0% { transform: translate(-50%, -50%) scale(.86) rotate(-4deg) } 100% { transform: translate(-50%, -50%) scale(1) } }
@keyframes dd-seal-press-b { 0% { transform: translate(-50%, -50%) scale(.86) rotate(4deg) } 100% { transform: translate(-50%, -50%) scale(1) } }
.dd-lif-seal:focus-visible { outline: 3px solid #7FD8F2; outline-offset: 4px; }
.dd-lif-half { position: absolute; inset: 0; display: block; transition: transform .7s cubic-bezier(.4,.1,.7,.6), opacity .7s ease; }
.dd-lif-half-l { clip-path: polygon(0 0, 52% 0, 48% 20%, 54% 33%, 49% 45%, 54% 58%, 48% 72%, 52% 85%, 50% 100%, 0 100%); }
.dd-lif-half-r { clip-path: polygon(52% 0, 100% 0, 100% 100%, 50% 100%, 52% 85%, 48% 72%, 54% 58%, 49% 45%, 54% 33%, 48% 20%); }
.dd-lif.is-open .dd-lif-half-l { transform: translate(-60%, 70%) rotate(-50deg); opacity: 0; }
.dd-lif.is-open .dd-lif-half-r { transform: translate(60%, 80%) rotate(45deg); opacity: 0; }
.dd-crack { stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset .25s ease-out; }
.dd-crack.is-on { stroke-dashoffset: 0; }
.dd-lif-pop { position: absolute; inset: -6%; border-radius: 50%; border: 3px solid #FFE08A; animation: dd-pop .5s ease-out forwards; pointer-events: none; }
@keyframes dd-pop { from { opacity: 1; transform: scale(.7) } to { opacity: 0; transform: scale(1.7) } }

/* mirror sparkles thrown out as the card comes up */
.dd-lif-sparks { position: absolute; z-index: 6; left: 50%; top: 30%; width: 0; height: 0; pointer-events: none; }
.dd-lif-sparks i { position: absolute; left: -7px; top: -7px; width: 14px; height: 14px; opacity: 0;
  background: radial-gradient(circle, #FFFFFF 0 18%, rgba(255,255,255,0) 22%), conic-gradient(from 45deg, transparent 0 20%, #FFF6D0 22% 28%, transparent 30% 45%, #FFF6D0 47% 53%, transparent 55% 70%, #FFF6D0 72% 78%, transparent 80% 95%, #FFF6D0 97%);
  border-radius: 50%; animation: dd-lif-spark 1.1s cubic-bezier(.2,.7,.3,1) both; }
.dd-lif-sparks i:nth-child(3n) { background: radial-gradient(circle at 40% 35%, #FFFFFF 0 20%, #DCE7FF 40%, #F6D27A 70%, rgba(0,0,0,0) 72%); width: 10px; height: 10px; }
@keyframes dd-lif-spark { 0% { opacity: 0; transform: translate(0, 0) scale(.3) rotate(0) } 15% { opacity: 1 } 100% { opacity: 0; transform: translate(calc(var(--x) * 2.2), calc(var(--y) * 2.2)) scale(1.2) rotate(180deg) } }

.dd-lif-peek { position: absolute; right: -4%; top: -30%; z-index: 0; transform: rotate(8deg); pointer-events: none; transition: transform .8s cubic-bezier(.3,1.5,.5,1) 1.1s; }
.dd-lif.is-open .dd-lif-peek { transform: translate(14%, -14%) rotate(14deg) scale(1.08); }

.dd-lif.is-still *, .dd-lif.is-still { transition: none !important; animation: none !important; }
@media (prefers-reduced-motion: reduce) { .dd-lif *, .dd-lif { transition: none !important; animation: none !important; } }
`;
