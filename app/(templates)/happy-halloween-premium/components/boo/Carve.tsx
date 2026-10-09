"use client";

// Stop 2 · Carve us a pumpkin. A big cute pumpkin with dotted guides: pick its
// eyes (hearts, stars, happy), pick its smile (a grin, a sweet smile, a kiss);
// the heart nose carves itself. Then hold the candle button: the pumpkin
// glows from inside and their initials light up on the little sign under it.
// The pumpkin pal (slot hb3) dances alongside.

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { burst, haptic, useHoldProgress } from "../../../_valentine/kit";
import { sfx } from "../../../_valentine/kit/premium";
import { EyeIcon, MouthIcon, Pumpkin, type EyeStyle, type MouthStyle } from "./art";
import { DISPLAY } from "./fonts";
import { GIF } from "./gifs";
import { BN, type Night } from "./model";
import { Gif, Header, POP, Puffy } from "./ui";

const EYE_OPTS: { k: EyeStyle; label: string }[] = [
  { k: "hearts", label: "Heart eyes" },
  { k: "stars", label: "Star eyes" },
  { k: "happy", label: "Happy eyes" },
];
const MOUTH_OPTS: { k: MouthStyle; label: string }[] = [
  { k: "grin", label: "Big grin" },
  { k: "smile", label: "Sweet smile" },
  { k: "kiss", label: "A kiss" },
];

export default function Carve({ n, pal, step, total, onNext }: { n: Night; pal: string | null; step: number; total: number; onNext: () => void }) {
  const [eyes, setEyes] = useState<EyeStyle | null>(null);
  const [mouth, setMouth] = useState<MouthStyle | null>(null);
  const [lit, setLit] = useState(false);

  const light = () => {
    if (lit) return;
    setLit(true);
    haptic([15, 40, 25]);
    sfx("match-strike", { gain: 0.5 });
    sfx("flame-whoosh", { gain: 0.5, at: 0.15 });
    sfx("chime", { gain: 0.6, at: 0.45 });
    burst({ kind: "sparkles", origin: { x: 0.5, y: 0.42 }, count: 24, emojis: ["✨", "🧡", "⭐", "💜"] });
  };
  const hold = useHoldProgress({ duration: 1400, onComplete: light, disabled: lit || !eyes || !mouth });

  const pickEyes = (k: EyeStyle) => {
    setEyes(k);
    haptic(10);
    sfx("snap", { gain: 0.5 });
    sfx("bn-boing", { gain: 0.35, at: 0.06 });
  };
  const pickMouth = (k: MouthStyle) => {
    setMouth(k);
    haptic(10);
    sfx("snap", { gain: 0.5 });
    sfx("bn-boing", { gain: 0.35, at: 0.06 });
  };

  const stage = !eyes ? "eyes" : !mouth ? "mouth" : !lit ? "light" : "done";
  const title = stage === "eyes" ? "Carve us a pumpkin" : stage === "mouth" ? "Now, a smile" : stage === "light" ? "Light it up" : "It's alive! 🎃";
  const sub = stage === "eyes" ? "Pick its eyes first." : stage === "mouth" ? "What kind of smile?" : stage === "light" ? "Hold the candle until it glows." : "Our pumpkin. Nobody else's.";

  return (
    <div className={`bn-scene bn-carve${lit ? " is-lit" : ""}`}>
      <Header step={step} total={total} kicker="Stop 2 · The pumpkin patch" title={title} sub={sub} />

      <div className="bn-pkWrap">
        <span className="bn-pkGlow" aria-hidden />
        <motion.span
          style={{ display: "inline-block" }}
          animate={lit ? { scaleX: [1, 1.08, 0.96, 1.02, 1], scaleY: [1, 0.92, 1.06, 0.99, 1] } : undefined}
          transition={{ duration: 0.6 }}
        >
          <Pumpkin eyes={eyes} mouth={mouth} lit={lit} size={260} className="bn-pk" />
        </motion.span>
        <Gif src={lit ? GIF.jack : pal} size={lit ? 82 : 96} tilt={-10} className="bn-pkPal" />
        <AnimatePresence>
          {lit && (
            <motion.span className="bn-pkSign" initial={{ y: 20, scale: 0.4, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} transition={{ ...POP, delay: 0.5 }}>
              {n.initials}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="bn-carveCtl">
        {stage === "eyes" && (
          <div className="bn-picks" role="group" aria-label="Pick the eyes">
            {EYE_OPTS.map((o) => (
              <button key={o.k} type="button" className="bn-pick" onClick={() => pickEyes(o.k)}>
                <EyeIcon kind={o.k} />
                <span>{o.label}</span>
              </button>
            ))}
          </div>
        )}
        {stage === "mouth" && (
          <div className="bn-picks" role="group" aria-label="Pick the smile">
            {MOUTH_OPTS.map((o) => (
              <button key={o.k} type="button" className="bn-pick" onClick={() => pickMouth(o.k)}>
                <MouthIcon kind={o.k} />
                <span>{o.label}</span>
              </button>
            ))}
          </div>
        )}
        {stage === "light" && (
          <button type="button" className="bn-holdBtn" {...hold.bind} aria-label="Hold to light the candle">
            <svg viewBox="0 0 80 80" width="84" height="84" aria-hidden className="bn-holdRing">
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="7" />
              <circle cx="40" cy="40" r="34" fill="none" stroke={BN.candle} strokeWidth="7" strokeLinecap="round" strokeDasharray={`${hold.progress * 213.6} 213.6`} transform="rotate(-90 40 40)" />
            </svg>
            <span className="bn-candle" aria-hidden>🕯️</span>
            <span className="bn-holdLabel">{hold.holding ? "keep holding…" : "Hold me"}</span>
          </button>
        )}
        {stage === "done" && (
          <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...POP, delay: 0.9 }}>
            <Puffy onClick={onNext}>Next stop →</Puffy>
          </motion.div>
        )}
      </div>
      <style>{CARVE_CSS}</style>
    </div>
  );
}

const CARVE_CSS = `
.bn-pkWrap { position: relative; display: grid; place-items: center; margin-top: 4px; }
.bn-pkGlow { position: absolute; width: 360px; height: 360px; border-radius: 50%; background: radial-gradient(circle, rgba(255,210,122,.0), transparent 66%); transition: background 1s ease; pointer-events: none; }
.bn-carve.is-lit .bn-pkGlow { background: radial-gradient(circle, rgba(255,210,122,.55), rgba(255,154,60,.18) 45%, transparent 68%); animation: bn-flicker 2.6s ease-in-out infinite; }
@keyframes bn-flicker { 0%,100% { opacity: .85; transform: scale(1) } 30% { opacity: 1; transform: scale(1.03) } 60% { opacity: .78; transform: scale(.98) } }
.bn-carve.is-lit .bn-pk { filter: drop-shadow(0 0 18px rgba(255,210,122,.7)); }
.bn-pkPal { position: absolute; left: -22px; top: 6px; }
.bn-pkSign { position: absolute; bottom: -18px; left: 50%; margin-left: -70px; width: 140px; text-align: center; padding: 8px 0; border-radius: 16px; background: #5A3A22; color: #FFE7A3;
  font: 400 26px/1 ${DISPLAY}; letter-spacing: .06em; text-shadow: 0 0 10px rgba(255,210,122,.9), 0 0 2px #fff; box-shadow: 0 0 0 3px #8A5A2B inset, 0 8px 18px rgba(30,16,60,.4); transform: rotate(-3deg); }
.bn-carveCtl { min-height: 128px; display: grid; place-items: center; width: 100%; margin-top: 18px; }
.bn-picks { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
.bn-pick { all: unset; cursor: pointer; display: grid; justify-items: center; gap: 4px; width: 100px; padding: 12px 6px 10px; border-radius: 22px; background: ${BN.card}; color: ${BN.ink};
  font: 800 13px/1.1 var(--font-bn-body), sans-serif; box-shadow: 0 5px 0 #E6D2B4, 0 10px 20px rgba(30,16,60,.3); transition: transform .15s ease; -webkit-tap-highlight-color: transparent; }
.bn-pick:active { transform: translateY(3px) scale(.96); box-shadow: 0 2px 0 #E6D2B4; }
.bn-pick:focus-visible { outline: 3px solid #fff; outline-offset: 3px; }
.bn-holdBtn { all: unset; cursor: pointer; position: relative; display: grid; place-items: center; width: 120px; height: 120px; touch-action: none; -webkit-tap-highlight-color: transparent; }
.bn-holdBtn::before { content: ""; position: absolute; width: 84px; height: 84px; border-radius: 50%; background: ${BN.card}; box-shadow: 0 5px 0 #E6D2B4, 0 10px 22px rgba(30,16,60,.35); }
.bn-holdRing { position: absolute; top: 18px; }
.bn-candle { position: relative; font-size: 34px; margin-top: -6px; }
.bn-holdLabel { position: absolute; bottom: -8px; font: 800 14px/1 var(--font-bn-body), sans-serif; color: #fff; white-space: nowrap; }
.bn-holdBtn:focus-visible { outline: 3px solid #fff; outline-offset: 2px; border-radius: 50%; }
@media (prefers-reduced-motion: reduce) { .bn-carve.is-lit .bn-pkGlow { animation: none; } }
`;
