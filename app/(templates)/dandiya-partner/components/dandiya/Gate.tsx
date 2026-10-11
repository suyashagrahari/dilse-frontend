"use client";

// Scene 1 — the gate. An embroidered invitation envelope (kumkum silk,
// bandhani dots, a border of little mirrors) sealed with a mirror medallion
// and a pair of crossed dandiya sticks. "Psst, <Name>… the dhol is calling."
// Tap the sticks three times — tak, tak, TAK! — and the flap swings open, the
// invitation card rises out and marigold petals fly. This first tap is also
// what starts the music. The panda couple peeks over the envelope's corner.

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { FONTS } from "../../../_valentine/theme";
import { CrossedSticks, Diya } from "./art";
import { DD_DISPLAY } from "./fonts";
import { useDd, useNext } from "./stage";
import { BANDHANI, DD, Hint, MIRROR_ROW, RoomTitle } from "./ui";

const TAPS = 3;

export default function Gate({ recipient, sender, openingLine, sticker, onEnter }: { recipient: string; sender: string; openingLine: string; sticker: ReactNode; onEnter: () => void }) {
  const reduced = useReducedMotion();
  const { cue } = useDd();
  const [taps, setTaps] = useState(0);
  const [clash, setClash] = useState(0);
  const open = taps >= TAPS;

  const tap = () => {
    if (open) return;
    const n = taps + 1;
    haptic(n === TAPS ? [20, 40, 30] : 14);
    cue("dd-tak", { gain: n === TAPS ? 1.1 : 0.85, detune: (n - 2) * 90 });
    if (n === TAPS) {
      cue("dd-dhol", { gain: 1 });
      cue("dd-bells", { gain: 0.7, at: 0.15 });
      window.setTimeout(() => cue("chime", { gain: 0.6 }), 420);
      burst({ kind: "petals", emojis: ["🌼", "🌸", "✨", "🌼"], origin: { x: 0.5, y: 0.5 }, count: 34 });
    }
    setClash((c) => c + 1);
    setTaps(n);
  };

  useNext(open ? "Open it" : null, onEnter, "sticks");

  return (
    <>
      <style>{GATE_CSS}</style>
      <RoomTitle as="h1" kicker="Navratri · a Dandiya night" title={<>Psst, {recipient}…</>} sub={openingLine || "the dhol is calling 🥁"} />

      <div className="dd-fill">
        <div className={`dd-env${open ? " is-open" : ""}`}>
          {/* the panda couple, peeking over the corner */}
          <div className="dd-env-peek">{sticker}</div>
          <div className="dd-env-back" />
          <motion.div
            className="dd-env-card"
            initial={false}
            animate={open ? { y: reduced ? "-48%" : ["0%", "-52%", "-48%"] } : { y: "0%" }}
            transition={{ duration: reduced ? 0 : 1.1, delay: reduced ? 0 : 0.35, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <p className="dd-env-k">You&apos;re invited</p>
            <p className="dd-env-t">to a Dandiya night</p>
            <p className="dd-env-s">with love, {sender}</p>
            <div className="dd-env-diyas" aria-hidden>
              <Diya lit size={26} hue={DD.peacock} />
              <Diya lit size={30} hue={DD.kumkum} />
              <Diya lit size={26} hue={DD.emerald} />
            </div>
          </motion.div>
          <div className="dd-env-front" />
          <div className="dd-env-flap" />
          <button
            type="button"
            className="dd-env-seal"
            onClick={tap}
            aria-label={open ? "The invitation is open" : `Tap the dandiya sticks (${taps} of ${TAPS})`}
            disabled={open}
          >
            <span className="dd-env-medal" aria-hidden />
            <motion.span
              key={clash}
              className="dd-env-sticks"
              initial={reduced || clash === 0 ? false : { scale: 1.25, rotate: clash % 2 ? -10 : 10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 520, damping: 12 }}
            >
              <CrossedSticks size="100%" clash={clash % 2} />
            </motion.span>
            {clash > 0 && !reduced && <span key={`r${clash}`} className="dd-env-pop" aria-hidden />}
          </button>
        </div>
      </div>

      <div style={{ flex: "none", minHeight: 34, display: "grid", placeItems: "center" }}>
        {!open ? (
          <Hint>
            Tap the sticks:{" "}
            {Array.from({ length: TAPS }, (_, i) => (
              <b key={i} style={{ color: i < taps ? DD.marigold : "rgba(255,247,232,.45)", fontWeight: 800 }}>
                {i === TAPS - 1 ? "TAK!" : "tak, "}
              </b>
            ))}
          </Hint>
        ) : (
          <p style={{ margin: 0, font: `400 clamp(17px, 2.6dvh, 21px) ${DD_DISPLAY}`, color: DD.gold }}>Dhamaal! It&apos;s open ✨</p>
        )}
      </div>
    </>
  );
}

const GATE_CSS = `
/* The envelope sits in the lower part of a near-square stage; the card rises into the space above it. */
.dd-env { position: relative; width: min(86cqw, 100cqh, calc(350px * var(--vw-s, 1))); aspect-ratio: 1.45; margin-top: min(23cqw, 27cqh); }
.dd-env-back, .dd-env-front, .dd-env-flap { position: absolute; inset: 0; border-radius: 14px; }
.dd-env-back { background: linear-gradient(180deg, #5E0B1C, #3B0712); box-shadow: 0 30px 60px -24px rgba(0,0,0,.85), 0 0 0 2px rgba(246,210,122,.35); }
.dd-env-card { position: absolute; left: 7%; right: 7%; top: 6%; height: 88%; border-radius: 10px; z-index: 1;
  background: linear-gradient(180deg, #FFF8E8, #FFEBC2); box-shadow: 0 0 0 3px #F6D27A inset, 0 0 0 6px #FFF4DE inset, 0 0 0 7px #B8862E inset;
  display: grid; align-content: start; justify-items: center; padding: 9% 8% 0; box-sizing: border-box; text-align: center; color: ${DD.maroon}; }
.dd-env:not(.is-open) .dd-env-card > * { visibility: hidden; }
.dd-env-k { margin: 0; font: 700 clamp(10px, 3.2cqw, 12px) ${FONTS.ui}; letter-spacing: .22em; text-transform: uppercase; color: ${DD.kumkum}; }
.dd-env-t { margin: 2px 0 0; font: 400 clamp(20px, 7.4cqw, 30px)/1.15 ${DD_DISPLAY}; }
.dd-env-s { margin: 4px 0 0; font: 700 clamp(15px, 5cqw, 20px) ${FONTS.script}; color: ${DD.kumkumDeep}; overflow-wrap: anywhere; }
.dd-env-diyas { display: flex; gap: 6px; align-items: end; margin-top: 4px; }
/* the front pocket: kumkum silk with bandhani dots and a mirror border, cut in a V at the top */
.dd-env-front { z-index: 2; clip-path: polygon(0 34%, 50% 70%, 100% 34%, 100% 100%, 0 100%);
  background: ${MIRROR_ROW.replace("0 50% / 14px 14px repeat-x", "0 calc(100% - 6px) / 14px 14px repeat-x")}, ${BANDHANI}, linear-gradient(160deg, #E0324A, #A3132A 70%); }
/* the flap: a triangle with a zari edge; it swings up and back when the envelope opens */
.dd-env-flap { z-index: 3; transform-origin: 50% 0; transition: transform .7s cubic-bezier(.3,.7,.3,1), z-index 0s .3s;
  clip-path: polygon(0 0, 100% 0, 50% 70%); background: ${BANDHANI}, linear-gradient(180deg, #C21B33, #8E1022); }
.dd-env-flap::after { content: ""; position: absolute; inset: 0; clip-path: polygon(0 0, 100% 0, 50% 70%, 50% 64%, 94% 2%, 6% 2%, 50% 64%, 50% 70%); background: #F6D27A; }
.dd-env.is-open .dd-env-flap { transform: perspective(700px) rotateX(180deg) scaleY(.5); z-index: 0; }
.dd-env-peek { position: absolute; right: -4%; top: -30%; z-index: 0; transform: rotate(8deg); pointer-events: none; }
.dd-env.is-open .dd-env-peek { transition: transform .8s ease .6s; transform: translate(14%, -10%) rotate(14deg); }
/* the seal: a round mirror medallion with the crossed sticks over it — the button */
.dd-env-seal { position: absolute; z-index: 4; left: 50%; top: 70%; width: clamp(92px, 34cqw, 132px); aspect-ratio: 1; transform: translate(-50%, -50%);
  border: 0; padding: 0; background: none; cursor: pointer; border-radius: 50%; touch-action: manipulation; -webkit-tap-highlight-color: transparent; transition: opacity .5s ease .2s, transform .5s ease .2s; }
.dd-env-seal:focus-visible { outline: 3px solid #7FD8F2; outline-offset: 4px; }
.dd-env.is-open .dd-env-seal { opacity: 0; transform: translate(-50%, -20%) scale(.6); pointer-events: none; }
.dd-env-medal { position: absolute; inset: 22%; border-radius: 50%;
  background: radial-gradient(circle at 38% 34%, #FFFFFF 0 10%, #DCE7FF 22%, #8FA6DE 52%, #3D4F9A 72%);
  box-shadow: 0 0 0 4px #F6D27A, 0 0 0 7px #B8862E, 0 0 0 11px rgba(255,182,39,.3), 0 0 26px 6px rgba(255,210,122,.55); animation: dd-medal 1.6s ease-in-out infinite alternate; }
@keyframes dd-medal { from { box-shadow: 0 0 0 4px #F6D27A, 0 0 0 7px #B8862E, 0 0 0 11px rgba(255,182,39,.25), 0 0 18px 4px rgba(255,210,122,.4) } to { box-shadow: 0 0 0 4px #F6D27A, 0 0 0 7px #B8862E, 0 0 0 14px rgba(255,182,39,.35), 0 0 34px 10px rgba(255,210,122,.6) } }
.dd-env-sticks { position: absolute; inset: 0; display: block; }
.dd-env-pop { position: absolute; inset: 10%; border-radius: 50%; border: 3px solid #FFE08A; animation: dd-pop .5s ease-out forwards; pointer-events: none; }
@keyframes dd-pop { from { opacity: 1; transform: scale(.7) } to { opacity: 0; transform: scale(1.7) } }
@media (prefers-reduced-motion: reduce) { .dd-env-medal { animation: none; } .dd-env-flap { transition: none; } }
`;
