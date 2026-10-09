"use client";

// Stop 5 · Bat mail. A little bat flaps in carrying a rolled scroll tied with a
// pink ribbon and hovers, waiting. Tap the bat: it lets go, blows a heart and
// flies off, and the scroll unrolls into the sender's letter (legible Nunito,
// "Dear …" and the signature in handwriting). Under it, a P.S. sealed with a
// little pumpkin wax seal: tap the seal to crack it open.

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { sfx, usePremium } from "../../../_valentine/kit/premium";
import { Bat } from "./art";
import { HAND } from "./fonts";
import { GIF } from "./gifs";
import { BN, type Night } from "./model";
import { Gif, Header, Hint, POP, Puffy } from "./ui";

export default function Letter({ n, letter, step, total, onNext }: { n: Night; letter: string; step: number; total: number; onNext: () => void }) {
  const p = usePremium();
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<"bat" | "drop" | "open">("bat");
  const [ps, setPs] = useState(false);
  const psText = p.premium.psLetter?.trim() ?? "";

  const tapBat = () => {
    if (phase !== "bat") return;
    setPhase("drop");
    haptic(14);
    sfx("bn-flap", { gain: 0.7 });
    sfx("kiss", { gain: 0.35, at: 0.25 });
    window.setTimeout(() => {
      setPhase("open");
      sfx("paper-rustle", { gain: 0.6 });
      sfx("chime", { gain: 0.45, at: 0.4 });
    }, reduce ? 100 : 750);
  };
  const crack = () => {
    if (ps) return;
    setPs(true);
    haptic([10, 30, 12]);
    sfx("wax-crack", { gain: 0.6 });
    sfx("sparkle", { gain: 0.4, at: 0.15 });
    burst({ kind: "hearts", origin: { x: 0.5, y: 0.75 }, count: 14, emojis: ["💜", "🧡", "✨"] });
  };

  const paras = letter.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);

  return (
    <div className={`bn-scene bn-letter is-${phase}`}>
      <Header step={step} total={total} kicker="Stop 5 · Bat mail" title={phase === "open" ? `For you, ${n.recipient}` : "A bat brought you something"} sub={phase === "bat" ? "It won't let go until you tap it." : undefined} />

      <AnimatePresence>
        {phase !== "open" && (
          <motion.button
            type="button"
            className="bn-batBtn"
            onClick={tapBat}
            aria-label="Tap the bat to get the letter"
            initial={{ x: -260, y: -120, rotate: -20, opacity: 0 }}
            animate={phase === "bat" ? { x: 0, y: 0, rotate: 0, opacity: 1 } : { x: 220, y: -320, rotate: 20, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={phase === "bat" ? { type: "spring", stiffness: 70, damping: 12 } : { duration: 0.8, ease: "easeIn" }}
          >
            <span className="bn-batBob">
              <Bat size={210} carry={phase === "bat" ? "scroll" : "heart"} />
            </span>
          </motion.button>
        )}
      </AnimatePresence>
      {phase === "bat" && <Hint>Tap the bat 🦇</Hint>}

      {phase === "open" && (
        <motion.article
          className="bn-scroll"
          initial={reduce ? { opacity: 0 } : { scaleY: 0.08, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 90, damping: 16 }}
        >
          <span className="bn-rod bn-rodTop" aria-hidden />
          <div className="bn-scrollBody">
            <p className="bn-dear">Dear {n.recipient},</p>
            {paras.map((t, i) => (
              <p key={i} className="bn-para">
                {t}
              </p>
            ))}
            {n.sender && <p className="bn-sign">— {n.sender} 🦇</p>}
          </div>
          <span className="bn-rod bn-rodBot" aria-hidden />
          <Gif src={GIF.spookyLove} size={86} tilt={10} className="bn-scrollGif" />
        </motion.article>
      )}

      {phase === "open" && psText && (
        <div className="bn-ps">
          {!ps ? (
            <button type="button" className="bn-psSeal" onClick={crack}>
              <span className="bn-wax" aria-hidden>
                🎃
              </span>
              <span>Tap the seal for a P.S.</span>
            </button>
          ) : (
            <motion.p className="bn-psText" initial={{ scale: 0.7, opacity: 0, rotate: -3 }} animate={{ scale: 1, opacity: 1, rotate: -1 }} transition={POP}>
              {psText}
            </motion.p>
          )}
        </div>
      )}

      <div className="bn-foot">
        {phase === "open" && (
          <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...POP, delay: 1 }}>
            <Puffy onClick={onNext}>Next stop →</Puffy>
          </motion.div>
        )}
      </div>
      <style>{LETTER_CSS}</style>
    </div>
  );
}

const LETTER_CSS = `
.bn-batBtn { all: unset; cursor: pointer; margin: auto 0; display: grid; place-items: center; -webkit-tap-highlight-color: transparent; }
.bn-batBtn:focus-visible { outline: 3px solid #fff; outline-offset: 6px; border-radius: 30px; }
.bn-batBob { display: inline-block; animation: bn-hover 1.8s ease-in-out infinite; }
@keyframes bn-hover { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-14px) } }
.bn-scroll { position: relative; width: min(100%, 420px); transform-origin: 50% 0; margin-top: 4px; }
.bn-rod { display: block; height: 22px; margin: 0 -10px; border-radius: 12px; background: linear-gradient(180deg, #F2D7A6, #D9B98A); box-shadow: 0 0 0 3px #C29A62 inset, 0 6px 12px rgba(30,16,60,.35); position: relative; z-index: 2; }
.bn-scrollBody { background: ${BN.cream}; color: ${BN.ink}; padding: 18px 22px 16px; text-align: left; margin: -6px 0; box-shadow: 0 16px 30px rgba(30,16,60,.35);
  background-image: radial-gradient(circle at 12% 8%, rgba(255,158,196,.18), transparent 30%), radial-gradient(circle at 90% 90%, rgba(201,182,255,.25), transparent 34%); }
.bn-dear { margin: 0 0 8px; font: 400 24px/1.1 ${HAND}; color: ${BN.orangeDeep}; }
.bn-para { margin: 0 0 12px; font: 600 17px/1.55 var(--font-bn-body), sans-serif; text-wrap: pretty; }
.bn-sign { margin: 4px 0 0; text-align: right; font: 400 24px/1 ${HAND}; color: ${BN.lilacDeep}; }
.bn-scrollGif { position: absolute; right: -18px; bottom: 6px; z-index: 3; }
.bn-ps { width: min(100%, 400px); display: grid; justify-items: center; }
.bn-psSeal { all: unset; cursor: pointer; display: inline-flex; align-items: center; gap: 10px; min-height: 48px; padding: 6px 18px 6px 6px; border-radius: 99px; background: ${BN.card}; color: ${BN.ink};
  font: 800 15px/1 var(--font-bn-body), sans-serif; box-shadow: 0 5px 0 #E6D2B4, 0 10px 22px rgba(30,16,60,.3); }
.bn-psSeal:focus-visible { outline: 3px solid #fff; outline-offset: 3px; }
.bn-wax { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 50%; font-size: 20px; background: radial-gradient(circle at 38% 32%, #FFB86E, ${BN.orangeDeep}); box-shadow: inset 0 -3px 4px rgba(0,0,0,.2); animation: bn-wiggle 2.8s ease-in-out infinite; }
.bn-psText { margin: 0; padding: 14px 18px; border-radius: 18px; background: #FFE3EF; color: ${BN.ink}; font: 400 20px/1.3 ${HAND}; text-align: left; box-shadow: 0 0 0 3px #fff inset, 0 10px 22px rgba(30,16,60,.3); white-space: pre-line; }
@media (prefers-reduced-motion: reduce) { .bn-batBob, .bn-wax { animation: none; } }
`;
