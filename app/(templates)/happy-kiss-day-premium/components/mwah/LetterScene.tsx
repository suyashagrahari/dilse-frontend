"use client";

// Scene 5 · Sealed with a kiss. A pink envelope sealed with a lipstick print
// (the sender's shade). Tap the kiss: it pops off, the flap opens and the
// letter slides up and types itself in a legible hand. Under it, a folded
// P.S. ("Open only when…") that unfolds on tap.

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Typewriter, burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { sfx, usePremium } from "../../../_valentine/kit/premium";
import { LipPrint } from "./LipPrint";
import type { Mwah } from "./model";
import { Gif, Kicker, Puffy, Quiet, Scene, Sub, Title, Washi, popIn, rise } from "./ui";

export default function LetterScene({ m, letter, gif, onNext }: { m: Mwah; letter: string; gif: string; onNext: () => void }) {
  const reduce = useReducedMotion();
  const { premium } = usePremium();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState(false);
  const [ps, setPs] = useState(false);
  const psText = (premium.psLetter || "").trim();
  const [psHead, ...psRest] = psText.split(/\n+/);

  const unseal = () => {
    if (open) return;
    setOpen(true);
    sfx("kmw-seal", { gain: 0.85 });
    haptic([15, 40, 25]);
    burst({ kind: "hearts", origin: { x: 0.5, y: 0.45 }, count: 18, spread: 0.25 });
  };

  return (
    <Scene label="A letter sealed with a kiss" className="km-letter">
      <motion.div {...rise(0)}>
        <Kicker>Sealed with a kiss</Kicker>
      </motion.div>
      {!open && (
        <>
          <motion.div {...rise(1)}>
            <Title>
              You&rsquo;ve got <em>mail</em>
            </Title>
          </motion.div>
          <motion.div {...rise(2)}>
            <Sub>Tap the kiss to open it.</Sub>
          </motion.div>
        </>
      )}

      <AnimatePresence mode="wait" initial={false}>
        {!open ? (
          <motion.div key="env" className="km-env" {...popIn(3)} exit={{ opacity: 0, y: 40, scale: 0.9, transition: { duration: 0.35 } }}>
            <span className="km-envBack" aria-hidden />
            <span className="km-envFlap" aria-hidden />
            <span className="km-envTo km-hand">for {m.recipient}</span>
            <button type="button" className="km-seal" onClick={unseal} aria-label="Open the letter (tap the kiss)">
              <LipPrint color={m.S.c} lipstick={m.lipstick} size={84} seed={9} />
            </button>
            <span className="km-envGif">
              <Gif src={gif} size={88} tilt={-10} eager />
            </span>
          </motion.div>
        ) : (
          <motion.article key="paper" className="km-paper" initial={{ opacity: 0, y: 60, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 22 }}>
            <Washi tone="mint" style={{ left: 18, top: -9, transform: "rotate(-6deg)" }} />
            <Washi tone="yellow" style={{ right: 18, top: -9, transform: "rotate(5deg)" }} />
            <p className="km-dear">Dear {m.recipient},</p>
            <div className="km-body">
              {reduce ? <p className="km-plain">{letter}</p> : <Typewriter text={letter} speed={22} onDone={() => setTyped(true)} caretColor={m.S.c} />}
            </div>
            <div className={`km-sign${typed || reduce ? " is-in" : ""}`}>
              <span className="km-hand">love, {m.sender}</span>
              <LipPrint color={m.S.c} lipstick={m.lipstick} size={60} seed={12} style={{ transform: "rotate(-10deg)" }} />
            </div>
            {psText && (
              <button type="button" className={`km-ps${ps ? " is-open" : ""}`} onClick={() => (setPs(!ps), sfx("paper-rustle", { gain: 0.6 }))} aria-expanded={ps}>
                <span className="km-psHead">P.S. {ps ? "" : "· " + (psHead.length > 42 ? "tap to unfold" : psHead)}</span>
                {ps && (
                  <span className="km-psBody">
                    {psRest.length ? <b>{psHead}</b> : null}
                    {(psRest.length ? psRest : [psHead]).join("\n\n")}
                  </span>
                )}
              </button>
            )}
          </motion.article>
        )}
      </AnimatePresence>

      <div className="km-foot">
        {open ? (
          <Puffy onClick={onNext}>{premium.voiceNote || premium.voiceCaption ? "Next: come closer… 🤫" : "Next: one question 💋"}</Puffy>
        ) : (
          <Quiet onClick={unseal}>Open it</Quiet>
        )}
      </div>
      <style>{CSS}</style>
    </Scene>
  );
}

const CSS = `
.km-env { position: relative; width: min(320px, 84vw); aspect-ratio: 3 / 2; margin-top: 24px; }
.km-envBack { position: absolute; inset: 0; border-radius: 18px; background: linear-gradient(160deg, #FFC1D3, #FF9EBB); box-shadow: 0 0 0 4px #fff, 0 22px 40px -20px rgba(214,63,114,.7);
  background-image: radial-gradient(rgba(255,255,255,.5) 1.4px, transparent 1.8px), linear-gradient(160deg, #FFC1D3, #FF9EBB); background-size: 14px 14px, auto; }
.km-envFlap { position: absolute; left: 0; right: 0; top: 0; height: 62%; background: linear-gradient(180deg, #FFD6E3, #FFB3C9); clip-path: polygon(0 0, 100% 0, 50% 100%); border-radius: 18px 18px 0 0;
  filter: drop-shadow(0 4px 4px rgba(214,63,114,.2)); }
.km-envTo { position: absolute; left: 0; right: 0; bottom: 6px; font-size: 22px; font-weight: 600; color: #fff; text-shadow: 0 2px 0 rgba(214,63,114,.45); }
.km-seal { all: unset; cursor: pointer; position: absolute; left: calc(50% - 52px); top: calc(56% - 52px); width: 104px; height: 104px; display: grid; place-items: center; border-radius: 50%;
  background: radial-gradient(circle, #fff 0 48%, rgba(255,255,255,.0) 70%); animation: km-beat 1.6s ease-in-out infinite; -webkit-tap-highlight-color: transparent; }
.km-seal:focus-visible { outline: 3px solid var(--km-primary); outline-offset: 3px; }
.km-envGif { position: absolute; right: -16px; top: -44px; }
.km-paper { position: relative; width: min(440px, 100%); box-sizing: border-box; margin-top: 10px; padding: 28px 22px 22px; border-radius: 22px; text-align: left; background: #fff;
  background-image: repeating-linear-gradient(180deg, transparent 0 31px, #FFE3EC 31px 32px); background-position: 0 58px;
  box-shadow: 0 0 0 4px #fff, 0 0 0 6px #FFE3EC, 0 22px 40px -20px rgba(214,63,114,.6); }
.km-dear { margin: 0 0 6px; font: 600 22px/32px var(--km-hand); color: var(--km-deep); }
.km-body, .km-plain { font: 400 17.5px/32px var(--km-hand); color: var(--km-ink); white-space: pre-wrap; }
.km-plain { margin: 0; }
.km-sign { display: flex; align-items: center; justify-content: flex-end; gap: 10px; margin-top: 10px; opacity: 0; transform: translateY(6px); transition: opacity .5s, transform .5s var(--km-spring); }
.km-sign.is-in { opacity: 1; transform: none; }
.km-sign .km-hand { font-size: 22px; font-weight: 600; color: var(--km-deep); }
.km-ps { all: unset; cursor: pointer; display: grid; gap: 8px; margin-top: 18px; width: 100%; box-sizing: border-box; padding: 14px 16px; border-radius: 16px; background: #FFF6D8;
  box-shadow: 0 6px 14px -10px rgba(160,110,20,.5); transform: rotate(-1deg); }
.km-ps:focus-visible { outline: 3px solid var(--km-primary); outline-offset: 3px; }
.km-psHead { font: 600 16px/1.3 var(--km-hand); color: #8A5A10; }
.km-psBody { font: 400 16px/1.5 var(--km-hand); color: var(--km-ink); white-space: pre-wrap; }
.km-psBody b { display: block; margin-bottom: 6px; font-weight: 600; color: #8A5A10; }
@media (prefers-reduced-motion: reduce) { .km-seal { animation: none; } }
`;
