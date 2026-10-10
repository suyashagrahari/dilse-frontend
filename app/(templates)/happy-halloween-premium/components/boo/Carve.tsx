"use client";

// Stop 2 · Carve us a pumpkin. A big cute pumpkin with dotted guides: pick its
// eyes (hearts, stars, happy), pick its smile (a grin, a sweet smile, a kiss);
// the heart nose carves itself. Then hold the candle button: the pumpkin
// glows from inside and their initials light up on the little sign under it.
// The pumpkin pal (slot hb3) dances alongside. Then (not on kids pages) a
// second pumpkin sits behind, facing away and wobbling: turn it round and it
// lights up green and BOOs at you full screen (scare #2, pumpkin-light-up),
// then giggles and stays, glowing, beside ours.

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { burst, haptic, useHoldProgress } from "../../../_valentine/kit";
import { sfx } from "../../../_valentine/kit/premium";
import { EyeIcon, MouthIcon, Pumpkin, type EyeStyle, type MouthStyle } from "./art";
import { DISPLAY, HAND } from "./fonts";
import { GIF, lastGif, preloadGif } from "./gifs";
import { BN, type Night } from "./model";
import { useBoo } from "./Scare";
import { Gif, Header, NextButton, POP, Puffy } from "./ui";

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
  const boo = useBoo();
  const [turned, setTurned] = useState(false);
  const [turning, setTurning] = useState(false);
  // warm the turning pumpkin while she carves (≈ 0.6 MB)
  useEffect(() => {
    if (boo.enabled) preloadGif(GIF.pumpkinLight);
  }, [boo.enabled]);
  const turn = () => {
    if (turned || turning) return;
    setTurning(true);
    haptic(10);
    boo.pumpkin({
      line: "Hehe! Got you 💚",
      sub: "It only wanted to glow next to ours.",
      onDone: () => {
        setTurned(true);
        setTurning(false);
        sfx("chime", { gain: 0.5 });
      },
    });
  };

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

  const stage = !eyes ? "eyes" : !mouth ? "mouth" : !lit ? "light" : boo.enabled && !turned ? "turn" : "done";
  const title = stage === "eyes" ? "Carve us a pumpkin" : stage === "mouth" ? "Now, a smile" : stage === "light" ? "Light it up" : stage === "turn" ? "It's alive! 🎃" : turned ? "Two glowing pumpkins 💚" : "It's alive! 🎃";
  const sub =
    stage === "eyes" ? "Pick its eyes first." : stage === "mouth" ? "What kind of smile?" : stage === "light" ? "Hold the candle until it glows." : stage === "turn" ? "…wait. Why is that one facing away?" : "Our pumpkin. Nobody else's.";

  return (
    <div className={`bn-scene bn-carve${lit ? " is-lit" : ""}`}>
      <Header step={step} total={total} kicker="Stop 2 · The pumpkin patch" title={title} sub={sub} />

      <div className="bn-pkWrap">
        <span className="bn-pkGlow" aria-hidden />
        <motion.span
          className="bn-pkBody"
          animate={lit ? { scaleX: [1, 1.08, 0.96, 1.02, 1], scaleY: [1, 0.92, 1.06, 0.99, 1] } : undefined}
          transition={{ duration: 0.6 }}
        >
          <Pumpkin eyes={eyes} mouth={mouth} lit={lit} size={260} className="bn-pk" />
        </motion.span>
        <Gif src={pal} size={88} tilt={-10} className="bn-pkPal" />
        {lit && boo.enabled && (
          <motion.button
            type="button"
            className={`bn-pk2${turned ? " is-turned" : ""}`}
            onClick={turn}
            disabled={turned}
            aria-label="Turn the other pumpkin round"
            initial={{ x: 60, scale: 0.3, opacity: 0 }}
            animate={{ x: 0, scale: 1, opacity: turning ? 0 : 1 }}
            transition={{ ...POP, delay: turned ? 0 : 1.1 }}
          >
            {turned ? (
              <Gif src={lastGif(GIF.pumpkinLight)} size={104} float={false} eager className="bn-pk2Gif" />
            ) : (
              <span className="bn-pk2Back bn-wiggle">
                <Pumpkin eyes={null} mouth={null} lit={false} size={96} />
              </span>
            )}
          </motion.button>
        )}
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
        {stage === "turn" && (
          <motion.p className="bn-pkPsst" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...POP, delay: 1.5 }}>
            psst… tap it and turn it round 👀
          </motion.p>
        )}
        {stage === "done" && turned && (
          <motion.p className="bn-pkPsst" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={POP}>
            {"It's friendly now. It glows for you 💚"}
          </motion.p>
        )}
      </div>
      <div className="bn-foot">
        {stage === "turn" && (
          <Puffy tone="lilac" onClick={turn} disabled={turning} style={{ opacity: 1 }}>
            Turn it round 🎃
          </Puffy>
        )}
        {stage === "done" && <NextButton onClick={onNext} delay={turned ? 0.3 : 0.9} />}
      </div>
      <style>{CARVE_CSS}</style>
    </div>
  );
}

const CARVE_CSS = `
.bn-pkWrap { position: relative; display: grid; grid-template-rows: minmax(0, 1fr); place-items: center; flex: 1 1 0; min-height: 0; width: min(100%, 380px); }
.bn-pk { display: block; width: auto; height: auto; max-width: 100%; }
.bn-pkBody { height: min(100%, 252px); max-width: 100%; aspect-ratio: 300 / 290; display: grid; place-items: center; }
.bn-pkBody .bn-pk { width: 100%; height: 100%; }
.bn-pkGlow { position: absolute; width: min(100%, 360px); aspect-ratio: 1; border-radius: 50%; background: radial-gradient(circle, rgba(255,210,122,.0), transparent 66%); transition: background 1s ease; pointer-events: none; }
.bn-carve.is-lit .bn-pkGlow { background: radial-gradient(circle, rgba(255,210,122,.55), rgba(255,154,60,.18) 45%, transparent 68%); animation: bn-flicker 2.6s ease-in-out infinite; }
@keyframes bn-flicker { 0%,100% { opacity: .85; transform: scale(1) } 30% { opacity: 1; transform: scale(1.03) } 60% { opacity: .78; transform: scale(.98) } }
.bn-carve.is-lit .bn-pk { filter: drop-shadow(0 0 18px rgba(255,210,122,.7)); }
.bn-pkPal { position: absolute; left: -4px; top: 0; width: clamp(60px, 10dvh, 88px) !important; height: clamp(60px, 10dvh, 88px) !important; }
.bn-pkSign { position: absolute; bottom: -4px; left: 50%; margin-left: -70px; width: 140px; text-align: center; padding: 8px 0; border-radius: 16px; background: #5A3A22; color: #FFE7A3;
  font: 400 clamp(20px, 3.4dvh, 26px)/1 ${DISPLAY}; letter-spacing: .06em; text-shadow: 0 0 10px rgba(255,210,122,.9), 0 0 2px #fff; box-shadow: 0 0 0 3px #8A5A2B inset, 0 8px 18px rgba(30,16,60,.4); transform: rotate(-3deg); z-index: 3; }
.bn-pk2 { all: unset; cursor: pointer; position: absolute; right: -2px; bottom: 6%; z-index: 4; display: grid; place-items: center; width: clamp(78px, 13dvh, 108px); aspect-ratio: 1; -webkit-tap-highlight-color: transparent; }
.bn-pk2:focus-visible { outline: 3px solid #fff; outline-offset: 3px; border-radius: 50%; }
.bn-pk2Back { display: grid; place-items: center; width: 92%; filter: brightness(.82) saturate(.9) drop-shadow(0 6px 10px rgba(30,16,60,.4)); }
.bn-pk2Back svg { width: 100%; height: auto; }
.bn-pk2Gif { width: 100% !important; height: 100% !important; }
.bn-pk2.is-turned .bn-pk2Gif img { filter: drop-shadow(0 0 2px #fff) drop-shadow(0 0 18px rgba(120,255,110,.6)); }
.bn-pkPsst { margin: 0; font: 400 clamp(19px, 3dvh, 23px)/1.2 ${HAND}; color: #FFF7EC; }
.bn-carveCtl { flex: none; min-height: clamp(92px, 15dvh, 128px); display: grid; place-items: center; width: 100%; }
.bn-picks { display: flex; gap: 10px; justify-content: center; flex-wrap: nowrap; }
.bn-pick { all: unset; cursor: pointer; display: grid; justify-items: center; gap: 4px; width: clamp(88px, 27vw, 104px); padding: clamp(8px, 1.4dvh, 12px) 6px clamp(7px, 1.2dvh, 10px); border-radius: 22px; background: ${BN.card}; color: ${BN.ink};
  font: 800 13px/1.1 var(--font-bn-body), sans-serif; box-shadow: 0 5px 0 #E6D2B4, 0 10px 20px rgba(30,16,60,.3); transition: transform .15s ease; -webkit-tap-highlight-color: transparent; }
.bn-pick:active { transform: translateY(3px) scale(.96); box-shadow: 0 2px 0 #E6D2B4; }
.bn-pick:focus-visible { outline: 3px solid #fff; outline-offset: 3px; }
.bn-holdBtn { all: unset; cursor: pointer; position: relative; display: grid; place-items: center; width: 120px; height: 110px; touch-action: none; -webkit-tap-highlight-color: transparent; }
.bn-holdBtn::before { content: ""; position: absolute; top: 8px; width: 84px; height: 84px; border-radius: 50%; background: ${BN.card}; box-shadow: 0 5px 0 #E6D2B4, 0 10px 22px rgba(30,16,60,.35); }
.bn-holdRing { position: absolute; top: 8px; }
.bn-candle { position: relative; font-size: 34px; margin-top: -16px; }
.bn-holdLabel { position: absolute; bottom: -2px; font: 800 14px/1 var(--font-bn-body), sans-serif; color: #fff; white-space: nowrap; }
.bn-holdBtn:focus-visible { outline: 3px solid #fff; outline-offset: 2px; border-radius: 50%; }
@media (prefers-reduced-motion: reduce) { .bn-carve.is-lit .bn-pkGlow { animation: none; } }
`;
