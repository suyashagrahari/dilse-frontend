"use client";

// Stop 4 · Brew a love potion. Three little bottles (the sender's ingredients,
// each a real memory) sit on a shelf; drag each into the cauldron (or tap it)
// and it glugs in, the brew changes colour and the memory shows. Then stir in
// circles around the cauldron (two turns; "Stir it for me" fallback): it
// bubbles pink, puffs out a big heart, and the spell appears. The witch seal
// on her broom (slot hb5, our guide from the Next buttons) flies round the pot
// while it brews.

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { burst, haptic } from "../../../_valentine/kit";
import { sfx } from "../../../_valentine/kit/premium";
import { Bottle, BOTTLE_COLORS, Cauldron, heartPath } from "./art";
import { HAND } from "./fonts";
import { BN, type Night } from "./model";
import { Gif, Header, Hint, Later, NextButton, Note, TextLink } from "./ui";

const LIQUID = [BN.mint, "#B9D7FF", "#D9B8FF", "#FF9EC4"];
const TURNS = 2;

export default function Potion({ n, helper, step, total, onNext }: { n: Night; helper: string | null; step: number; total: number; onNext: () => void }) {
  const pot = useRef<HTMLDivElement>(null);
  const [poured, setPoured] = useState<boolean[]>([false, false, false]);
  const [last, setLast] = useState<number | null>(null);
  const [stir, setStir] = useState(0); // 0..1
  const [done, setDone] = useState(false);
  const [angle, setAngle] = useState(0);
  const pc = poured.filter(Boolean).length;
  const phase = pc < 3 ? "pour" : done ? "done" : "stir";

  const pouredRef = useRef<boolean[]>([false, false, false]);
  const pour = (i: number) => {
    if (pouredRef.current[i]) return;
    pouredRef.current[i] = true;
    setPoured((p) => p.map((v, k) => (k === i ? true : v)));
    setLast(i);
    haptic(12);
    sfx("bubble", { gain: 0.6 });
    sfx("bubble", { gain: 0.4, at: 0.18, detune: 300 });
    burst({ kind: "sparkles", origin: { x: 0.5, y: 0.56 }, count: 8, emojis: ["✨", "🫧", "💜"] });
  };

  const insidePot = (x: number, y: number) => {
    const r = pot.current?.getBoundingClientRect();
    return !!r && x > r.left - 20 && x < r.right + 20 && y > r.top - 40 && y < r.bottom + 20;
  };

  const finish = () => {
    if (done) return;
    setDone(true);
    setStir(1);
    haptic([20, 40, 30]);
    sfx("chime-cascade", { gain: 0.6 });
    sfx("sparkle", { gain: 0.5, at: 0.3 });
    burst({ kind: "hearts", origin: { x: 0.5, y: 0.45 }, count: 26, emojis: ["💖", "💜", "✨", "🧡"] });
  };

  // Stirring: accumulate the angle swept around the cauldron's centre.
  const track = useRef<{ a: number; sum: number; lastCue: number } | null>(null);
  const centre = () => {
    const r = pot.current!.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height * 0.42 };
  };
  const onDown = (e: React.PointerEvent) => {
    if (phase !== "stir" || !pot.current) return;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    const c = centre();
    track.current = { a: Math.atan2(e.clientY - c.y, e.clientX - c.x), sum: stir * TURNS * Math.PI * 2, lastCue: 0 };
  };
  const onMove = (e: React.PointerEvent) => {
    const t = track.current;
    if (!t || phase !== "stir" || !pot.current) return;
    const c = centre();
    const a = Math.atan2(e.clientY - c.y, e.clientX - c.x);
    let d = a - t.a;
    if (d > Math.PI) d -= Math.PI * 2;
    if (d < -Math.PI) d += Math.PI * 2;
    t.a = a;
    t.sum += Math.abs(d);
    setAngle(a);
    const p = Math.min(1, t.sum / (TURNS * Math.PI * 2));
    setStir(p);
    if (t.sum - t.lastCue > Math.PI / 2) {
      t.lastCue = t.sum;
      sfx("bubble", { gain: 0.35, detune: Math.round(p * 600) });
      haptic(6);
    }
    if (p >= 1) {
      track.current = null;
      finish();
    }
  };
  const onUp = () => (track.current = null);

  const liquid = done ? "#FF9EC4" : LIQUID[Math.min(3, pc)];
  const ing = last !== null ? n.ingredients[last] : null;
  const title = phase === "pour" ? "Brew a love potion" : phase === "stir" ? "Now stir it!" : "It worked 💖";
  const sub = phase === "pour" ? "Drag each bottle into the cauldron." : phase === "stir" ? "Draw circles around the cauldron." : undefined;

  return (
    <div className={`bn-scene bn-potion is-${phase}`}>
      <Header step={step} total={total} kicker="Stop 4 · The love potion" title={title} sub={sub} />

      <div className="bn-shelf" role="group" aria-label="Ingredients">
        {n.ingredients.map((g, i) => (
          <div key={i} className="bn-bottleSlot">
            {!poured[i] ? (
              <motion.button
                type="button"
                className="bn-bottle"
                aria-label={`Pour ${g.name}`}
                drag
                dragSnapToOrigin
                dragElastic={0.9}
                whileDrag={{ scale: 1.12, rotate: 25, zIndex: 20 }}
                onTap={() => pour(i)}
                onDragEnd={(e, info) => {
                  if (insidePot(info.point.x - window.scrollX, info.point.y - window.scrollY)) pour(i);
                }}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && pour(i)}
              >
                <Bottle color={BOTTLE_COLORS[i]} size={50} />
                <span className="bn-label">{g.name}</span>
              </motion.button>
            ) : (
              <span className="bn-bottleGhost" aria-hidden>
                <span className="bn-label is-used">{g.name}</span>
              </span>
            )}
          </div>
        ))}
      </div>

      <div
        className="bn-potWrap"
        ref={pot}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        style={{ touchAction: phase === "stir" ? "none" : "auto" }}
      >
        {phase === "stir" && (
          <svg className="bn-stirRing" viewBox="0 0 300 300" aria-hidden>
            <circle cx="150" cy="150" r="138" fill="none" stroke="rgba(255,255,255,.22)" strokeWidth="8" strokeDasharray="4 14" strokeLinecap="round" />
            <circle cx="150" cy="150" r="138" fill="none" stroke={BN.pink} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${stir * 867} 867`} transform="rotate(-90 150 150)" />
          </svg>
        )}
        <span className="bn-bubbles" aria-hidden>
          {[0, 1, 2, 3, 4].map((b) => (
            <span key={b} style={{ left: `${30 + b * 10}%`, animationDelay: `${b * 0.45}s`, background: liquid }} />
          ))}
        </span>
        {phase === "stir" && (
          <span className="bn-spoon" style={{ transform: `rotate(${(angle * 180) / Math.PI + 90}deg)` }} aria-hidden>
            <span />
          </span>
        )}
        <Cauldron liquid={liquid} size={230} happy={done} className="bn-cauldron" />
        <AnimatePresence>
          {done && (
            <motion.svg className="bn-puff" viewBox="0 0 120 120" width="150" height="150" initial={{ y: 40, scale: 0.2, opacity: 0 }} animate={{ y: -70, scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 140, damping: 10 }} aria-hidden>
              <circle cx="22" cy="80" r="16" fill="#fff" opacity=".8" />
              <circle cx="98" cy="76" r="18" fill="#fff" opacity=".8" />
              <circle cx="60" cy="96" r="20" fill="#fff" opacity=".85" />
              <path d={heartPath(60, 54, 96)} fill="#FF7FB5" stroke="#fff" strokeWidth="5" />
            </motion.svg>
          )}
        </AnimatePresence>
        {phase !== "pour" || pc > 0 ? <Gif src={helper} size={100} tilt={-6} className={`bn-broom${done ? " is-landed" : ""}`} /> : null}
      </div>

      <div className="bn-potNote">
        <AnimatePresence mode="wait">
          {phase === "done" ? (
            <Note key="spell" tilt={-1} className="bn-spell" style={{ fontFamily: HAND, fontWeight: 400, lineHeight: 1.22 }}>
              {n.spell}
            </Note>
          ) : ing ? (
            <Note key={last} tilt={last! % 2 ? 1.2 : -1.2}>
              <b>{ing.name}</b>
              {ing.line ? <>: {ing.line}</> : null}
            </Note>
          ) : (
            <Hint key="h">{phase === "pour" ? "or just tap a bottle" : ""}</Hint>
          )}
        </AnimatePresence>
      </div>

      <div className="bn-foot">
        {phase === "done" && <NextButton onClick={onNext} delay={0.8} />}
        {phase === "stir" && (
          <Later ms={6000}>
            <TextLink onClick={finish}>Stir it for me</TextLink>
          </Later>
        )}
      </div>
      <style>{POTION_CSS}</style>
    </div>
  );
}

const POTION_CSS = `
.bn-shelf { flex: none; display: flex; gap: 8px; justify-content: center; width: 100%; max-width: 380px; padding: 8px 6px 6px; border-radius: 20px; background: rgba(42,31,61,.28); box-shadow: inset 0 -6px 0 rgba(42,31,61,.3); }
.bn-bottleSlot { flex: 1 1 0; min-width: 0; display: grid; justify-items: center; align-content: start; min-height: clamp(92px, 14dvh, 112px); }
.bn-bottle { all: unset; cursor: grab; display: grid; justify-items: center; gap: 4px; touch-action: none; position: relative; -webkit-tap-highlight-color: transparent; }
.bn-bottle svg { width: clamp(38px, 7dvh, 50px); height: auto; }
.bn-bottle:focus-visible { outline: 3px solid #fff; outline-offset: 3px; border-radius: 14px; }
.bn-label { display: block; max-width: 112px; padding: 3px 7px; border-radius: 10px; background: ${BN.card}; color: ${BN.ink}; font: 400 clamp(13px, 2dvh, 15px)/1.1 ${HAND}; text-align: center; box-shadow: 0 3px 0 #E6D2B4; }
.bn-label.is-used { opacity: .4; text-decoration: line-through; margin-top: clamp(40px, 7dvh, 64px); }
.bn-bottleGhost { display: grid; justify-items: center; }
.bn-potWrap { --pot: clamp(150px, min(30dvh, 62vw), 236px); position: relative; display: grid; place-items: center; width: calc(var(--pot) * 1.3); flex: 1 1 0; min-height: 0; max-height: calc(var(--pot) * 1.12); }
.bn-cauldron { width: var(--pot); height: auto; }
.bn-stirRing { position: absolute; width: calc(var(--pot) * 1.26); height: calc(var(--pot) * 1.26); left: 50%; top: 50%; translate: -50% -52%; pointer-events: none; }
.bn-spoon { position: absolute; left: 50%; top: 42%; width: 0; height: 0; z-index: 3; pointer-events: none; }
.bn-spoon span { position: absolute; left: -5px; top: calc(var(--pot) * -.4); width: 10px; height: calc(var(--pot) * .38); border-radius: 6px; background: linear-gradient(90deg, #C98A4B, #E7B07A); box-shadow: 0 0 0 2px #8A5A2B; }
.bn-bubbles { position: absolute; left: 20%; right: 20%; top: 18%; height: 60px; pointer-events: none; z-index: 2; }
.bn-bubbles span { position: absolute; bottom: 0; width: 16px; height: 16px; border-radius: 50%; border: 2px solid rgba(255,255,255,.8); opacity: 0; animation: bn-rise 2.2s ease-in infinite; }
.bn-potion.is-stir .bn-bubbles span, .bn-potion.is-done .bn-bubbles span { animation-duration: 1.1s; }
@keyframes bn-rise { 0% { transform: translateY(10px) scale(.4); opacity: 0 } 30% { opacity: 1 } 100% { transform: translateY(-60px) scale(1.1); opacity: 0 } }
.bn-puff { position: absolute; top: -10px; left: 50%; margin-left: -60px; width: 120px; height: 120px; z-index: 4; filter: drop-shadow(0 0 16px rgba(255,127,181,.7)); }
.bn-broom { position: absolute; top: -6px; left: -36px; z-index: 5; width: clamp(70px, 12dvh, 100px) !important; height: clamp(70px, 12dvh, 100px) !important; animation: bn-fly 5.5s ease-in-out infinite; }
.bn-broom.is-landed { animation: none; left: auto; right: -30px; top: 30%; }
@keyframes bn-fly { 0% { transform: translate(-20px, 16px) rotate(-6deg) } 50% { transform: translate(calc(var(--pot) * 1.05), -24px) rotate(6deg) } 100% { transform: translate(-20px, 16px) rotate(-6deg) } }
.bn-potNote { flex: none; min-height: clamp(72px, 12dvh, 92px); display: grid; place-items: center; width: 100%; }
.bn-potNote .bn-note { font-size: clamp(14px, 2.2dvh, 16px); padding: clamp(10px, 1.5dvh, 14px) 18px; }
.bn-potNote .bn-note.bn-spell { font-size: clamp(18px, 2.8dvh, 22px); }
@media (prefers-reduced-motion: reduce) { .bn-bubbles span, .bn-broom { animation: none !important; } }
`;
