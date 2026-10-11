"use client";

// Scene 1 — The Doorstep. Dusk on Diwali: a carved front door under a little
// marigold toran, rangoli on the step, and an unlit clay diya waiting on it
// with a paper tag tied on ("for the brightest light in my year"). "Psst,
// Meera… someone left a diya at your door." Tap the diya: a match strikes, the
// flame catches, the screen blooms warm, the door swings open onto golden
// light. The tap is also the first gesture, so the music starts here.

import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { FONTS, VW } from "../../../_valentine/theme";
import { Diya, Door } from "./art";
import { DW_DISPLAY } from "./fonts";
import { DW_GIF, preload, useDw, useNext } from "./stage";
import { DW, Hint, SceneTitle } from "./ui";

const CSS = `
.dw-door-box { position: relative; width: min(100cqw, 74cqh, 330px); aspect-ratio: 240 / 300; }
.dw-door-diya { position: absolute; left: 50%; bottom: 3.5%; width: 34%; aspect-ratio: 200 / 150; transform: translateX(-50%); border: 0; padding: 0; background: none; cursor: pointer;
  touch-action: manipulation; -webkit-tap-highlight-color: transparent; border-radius: 40%; }
.dw-door-diya:focus-visible { outline: 3px solid #FFF1B8; outline-offset: 6px; }
.dw-door-diya.is-unlit { animation: dw-nudge 2.4s ease-in-out infinite; }
@keyframes dw-nudge { 0%, 70%, 100% { transform: translateX(-50%) } 76% { transform: translateX(-50%) rotate(-5deg) } 84% { transform: translateX(-50%) rotate(4deg) } 92% { transform: translateX(-50%) rotate(-2deg) } }
.dw-door-diya.is-unlit::before { content: ""; position: absolute; inset: -18% -14%; border-radius: 50%; border: 2px dashed rgba(255,211,110,.7); animation: dw-spin 9s linear infinite; }
@keyframes dw-spin { to { transform: rotate(360deg) } }
.dw-tag { position: absolute; left: 3%; bottom: 22%; width: 40%; padding: 8px 9px 9px 16px; box-sizing: border-box; background: #FFF4DC; color: #5A2A12; border-radius: 4px 12px 12px 4px;
  font: 700 clamp(13px, 2.3dvh, 16px)/1.2 var(--font-vw-script, cursive); text-align: left; transform: rotate(-7deg); box-shadow: 0 8px 18px -8px rgba(0,0,0,.7); overflow-wrap: anywhere; }
.dw-tag::before { content: ""; position: absolute; left: 6px; top: 50%; width: 6px; height: 6px; margin-top: -3px; border-radius: 50%; background: #5A0A0E; box-shadow: 0 0 0 1.5px #C98A3A; }
.dw-tag-string { position: absolute; left: 38%; bottom: 13%; width: 18%; height: 12%; border-top: 1.5px solid rgba(255,230,180,.75); border-radius: 50% 50% 0 0; transform: rotate(18deg); pointer-events: none; }
.dw-bloom { position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background: radial-gradient(60% 45% at 50% 72%, rgba(255,200,90,.55), rgba(255,140,40,.18) 50%, transparent 75%); animation: dw-bloom 2.2s cubic-bezier(.2,.8,.2,1) forwards; }
@keyframes dw-bloom { 0% { opacity: 0; transform: scale(.3) } 30% { opacity: 1 } 100% { opacity: .65; transform: scale(1.25) } }
@media (prefers-reduced-motion: reduce) { .dw-door-diya.is-unlit, .dw-door-diya.is-unlit::before, .dw-bloom { animation: none; } }
`;

export default function Doorstep({ recipient, petName, doorNote, sticker, onEnter }: { recipient: string; petName: string; doorNote: string; sticker: ReactNode; onEnter: () => void }) {
  const reduced = useReducedMotion();
  const { cue } = useDw();
  const [lit, setLit] = useState(false);
  const [open, setOpen] = useState(0);

  useEffect(() => {
    // The next scene's diyas are drawn; its celebration GIF is the one fetch worth warming.
    const t = window.setTimeout(() => preload(DW_GIF.dudu), 1500);
    return () => window.clearTimeout(t);
  }, []);

  const light = () => {
    if (lit) return;
    haptic([10, 40, 18]);
    cue("match-strike", { gain: 0.8 });
    window.setTimeout(() => cue("flame-whoosh", { gain: 0.5 }), 260);
    window.setTimeout(() => setLit(true), reduced ? 0 : 280);
    window.setTimeout(() => {
      setOpen(1);
      cue("chime", { gain: 0.5 });
    }, reduced ? 0 : 900);
  };

  useNext(lit ? "Step inside" : null, onEnter, "diya");

  return (
    <>
      <style>{CSS}</style>
      {lit && <span className="dw-bloom" aria-hidden />}
      <SceneTitle as="h1" kicker={`Psst, ${petName || recipient}…`} title="someone left a diya at your door" />
      <div className="dw-fill">
        <div className="dw-door-box">
          <Door open={open} glow={lit ? 1 : 0} />
          <span className="dw-tag-string" aria-hidden />
          <p className="dw-tag">{doorNote}</p>
          <button type="button" className={`dw-door-diya${lit ? "" : " is-unlit"}`} onClick={light} aria-label={lit ? "The diya is lit" : "Light the diya"} aria-pressed={lit}>
            <Diya lit={lit} id="door" />
          </button>
        </div>
      </div>
      <div style={{ flex: "none", minHeight: 52, display: "grid", placeItems: "center" }}>
        {lit ? (
          <motion.div initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduced ? 0 : 0.7 }} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 52, height: 52, display: "grid", placeItems: "center", flex: "none" }}>{sticker}</span>
            <p style={{ margin: 0, font: `400 clamp(19px, 3dvh, 24px)/1.2 ${DW_DISPLAY}`, color: DW.gold, textAlign: "left", textShadow: "0 0 18px rgba(255,178,63,.5)", overflowWrap: "anywhere" }}>
              Happy Diwali, {recipient}
              <span style={{ display: "block", font: `500 clamp(12.5px, 1.9dvh, 14px) ${FONTS.ui}`, color: VW.inkSoft }}>the door&apos;s open. Come in ✨</span>
            </p>
          </motion.div>
        ) : (
          <Hint>Tap the diya to light it 🪔</Hint>
        )}
      </div>
    </>
  );
}
