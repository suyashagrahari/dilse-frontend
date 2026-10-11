"use client";

// Scene 4 · Catch the flying kisses (15 s). Lip prints and hearts float
// down; tap to catch them (a blip that climbs with the combo, a heart pop).
// Broken hearts make the sticker cry and cost a kiss. The score is the
// number of kisses the sender owes her, and it unlocks the "kisses I owe
// you" list. "Catch them for me" skips straight to a (generous) score.

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { sfx } from "../../../_valentine/kit/premium";
import { LIP_LOWER, LIP_UPPER } from "./LipPrint";
import { GIF, type Mwah } from "./model";
import { Gif, HEART_PATH, Kicker, Puffy, Quiet, Scene, Sub, Title, popIn, rise } from "./ui";

const GAME_MS = 15000;
type Kind = "lips" | "heart" | "broken";
type Item = { id: number; kind: Kind; x: number; dur: number; y: number; caught?: boolean };

function Lips({ color, size }: { color: string; size: number }) {
  return (
    <svg viewBox="0 0 120 72" width={size} height={size * 0.6} aria-hidden style={{ display: "block", overflow: "visible" }}>
      <g fill={color} stroke="#fff" strokeWidth="6" strokeLinejoin="round" paintOrder="stroke">
        <path d={LIP_UPPER} />
        <path d={LIP_LOWER} />
      </g>
    </svg>
  );
}
function Heart({ color, broken, size }: { color: string; broken?: boolean; size: number }) {
  return (
    <svg viewBox="0 0 100 90" width={size} height={size * 0.9} aria-hidden style={{ display: "block", overflow: "visible" }}>
      <path d={HEART_PATH} fill={color} stroke="#fff" strokeWidth="7" strokeLinejoin="round" />
      {broken && <path d="M50 17 L42 36 L56 48 L44 64 L50 86" stroke="#fff" strokeWidth="6" fill="none" strokeLinejoin="round" />}
    </svg>
  );
}

export default function CatchScene({ m, gif, onNext }: { m: Mwah; gif: string; onNext: (score: number) => void }) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [items, setItems] = useState<Item[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [sad, setSad] = useState(false);
  const [left, setLeft] = useState(GAME_MS);
  const nextId = useRef(1);
  const sadT = useRef<number | null>(null);

  useEffect(() => {
    if (phase !== "play") return;
    const t0 = performance.now();
    const spawn = window.setInterval(() => {
      const r = Math.random();
      const kind: Kind = r < 0.58 ? "lips" : r < 0.84 ? "heart" : "broken";
      setItems((xs) => [...xs.slice(-14), { id: nextId.current++, kind, x: 8 + Math.random() * 78, dur: 2.6 + Math.random() * 1.4, y: 10 + Math.random() * 70 }]);
    }, 430);
    const tick = window.setInterval(() => {
      const l = Math.max(0, GAME_MS - (performance.now() - t0));
      setLeft(l);
      if (l <= 0) {
        window.clearInterval(spawn);
        window.clearInterval(tick);
        setItems([]);
        setPhase("done");
        sfx("kmw-ding", { gain: 0.8 });
        haptic([15, 40, 25]);
        burst({ kind: "hearts", count: 30 });
      }
    }, 200);
    return () => {
      window.clearInterval(spawn);
      window.clearInterval(tick);
    };
  }, [phase]);
  useEffect(() => () => void (sadT.current && window.clearTimeout(sadT.current)), []);

  const catchIt = (it: Item, e: React.PointerEvent) => {
    if (it.caught) return;
    setItems((xs) => xs.map((x) => (x.id === it.id ? { ...x, caught: true } : x)));
    if (it.kind === "broken") {
      setScore((s) => Math.max(0, s - 1));
      setCombo(0);
      setSad(true);
      sfx("kmw-oops", { gain: 0.7 });
      haptic(30);
      if (sadT.current) window.clearTimeout(sadT.current);
      sadT.current = window.setTimeout(() => setSad(false), 1100);
      return;
    }
    setScore((s) => s + 1);
    setCombo((c) => c + 1);
    sfx("kmw-catch", { gain: 0.7, detune: Math.min(combo, 12) * 80 });
    haptic(8);
    burst({ kind: "hearts", origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight }, count: 6, spread: 0.08 });
  };

  const forMe = () => {
    setScore(21 + Math.floor(Math.random() * 7));
    setPhase("done");
    sfx("kmw-ding", { gain: 0.8 });
    burst({ kind: "hearts", count: 30 });
  };
  const owed = Math.max(score, 1);

  return (
    <Scene label="Catch the flying kisses" className="km-catch">
      <motion.div {...rise(0)}>
        <Kicker>{phase === "done" ? "Game over, you won" : "Mini game · 15 seconds"}</Kicker>
      </motion.div>

      {phase !== "done" && (
        <>
          <motion.div {...rise(1)}>
            <Title>
              Catch the <em>flying kisses</em>
            </Title>
          </motion.div>
          <motion.div {...rise(2)}>
            <Sub>Tap the lips and hearts. Dodge the broken ones.</Sub>
          </motion.div>
          <div className="km-arena" aria-label={`Game: ${score} kisses caught`}>
            {phase === "play" && (
              <div className="km-hud">
                <span className="km-score">💋 {score}</span>
                <span className="km-time" aria-hidden>
                  <i style={{ transform: `scaleX(${left / GAME_MS})` }} />
                </span>
              </div>
            )}
            {items.map((it) => (
              <button
                key={it.id}
                type="button"
                className={`km-fly is-${it.kind}${it.caught ? " is-caught" : ""}${reduce ? " is-reduced" : ""}`}
                style={{ left: `${it.x}%`, top: reduce ? `${it.y}%` : undefined, animationDuration: `${reduce ? 1.6 : it.dur}s` }}
                onPointerDown={(e) => catchIt(it, e)}
                onAnimationEnd={(e) => e.target === e.currentTarget && setItems((xs) => xs.filter((x) => x.id !== it.id))}
                aria-label={it.kind === "broken" ? "Broken heart" : "Catch this kiss"}
                tabIndex={-1}
              >
                {it.kind === "lips" ? <Lips color={m.S.c} size={58} /> : <Heart color={it.kind === "broken" ? "#B9A3AC" : m.S.hi} broken={it.kind === "broken"} size={50} />}
              </button>
            ))}
            {phase === "intro" && (
              <div className="km-arenaIntro">
                <Gif src={GIF.kissing} size={96} tilt={-6} eager />
                <Puffy onClick={() => setPhase("play")}>Start catching 💋</Puffy>
              </div>
            )}
            <span className="km-catcher">
              <Gif src={sad ? GIF.crying : GIF.closedEyes} size={70} tilt={6} float={!sad} />
            </span>
          </div>
          <div className="km-foot">
            <Quiet onClick={forMe}>Catch them for me</Quiet>
          </div>
        </>
      )}

      {phase === "done" && (
        <>
          <motion.div className="km-result" {...popIn(1)}>
            <Gif src={gif} size={120} tilt={-4} eager />
            <p className="km-big">{owed}</p>
            <p className="km-resultTx">
              {owed === 1 ? "kiss" : "kisses"} caught, so {m.sender} owes you {owed === 1 ? "one" : owed} (plus every one you missed). Here&rsquo;s the list:
            </p>
          </motion.div>
          <ul className="km-owed">
            <AnimatePresence>
              {m.notes.map((n, i) => (
                <motion.li key={i} {...popIn(3 + i)} style={{ ["--t" as string]: `${(i % 2 ? 1 : -1) * (1 + (i % 3))}deg` }}>
                  <span aria-hidden>💋</span> {n}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          <div className="km-foot">
            <Puffy onClick={() => onNext(owed)}>Next: a letter 💌</Puffy>
          </div>
        </>
      )}
      <style>{CSS}</style>
    </Scene>
  );
}

const CSS = `
.km-arena { position: relative; width: min(420px, 100%); height: clamp(340px, 50svh, 470px); margin-top: 6px; border-radius: 30px; overflow: hidden;
  background: radial-gradient(circle at 20% 15%, #fff 0 18%, transparent 19%), radial-gradient(circle at 80% 30%, #fff 0 12%, transparent 13%),
    radial-gradient(rgba(214,63,114,.1) 1.4px, transparent 1.8px), linear-gradient(180deg, #FFEAF1, #FFF7FA);
  background-size: auto, auto, 16px 16px, auto; box-shadow: 0 0 0 4px #fff, 0 18px 34px -18px rgba(214,63,114,.6); touch-action: manipulation; }
.km-hud { position: absolute; left: 12px; right: 12px; top: 12px; z-index: 3; display: flex; align-items: center; gap: 10px; pointer-events: none; }
.km-score { font: 400 22px/1 var(--km-display); color: var(--km-deep); background: #fff; padding: 6px 12px; border-radius: 99px; box-shadow: 0 4px 12px -6px rgba(214,63,114,.5); }
.km-time { flex: 1; height: 10px; border-radius: 99px; background: rgba(255,255,255,.9); overflow: hidden; }
.km-time i { display: block; height: 100%; background: linear-gradient(90deg, #FF9EBB, #FF4F86); transform-origin: left; transition: transform .2s linear; }
.km-fly { all: unset; position: absolute; top: -70px; width: 64px; height: 64px; margin-left: -32px; display: grid; place-items: center; cursor: pointer; z-index: 2;
  animation: km-fall linear forwards; -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
.km-fly.is-reduced { animation: km-blink ease forwards; }
.km-fly svg { filter: drop-shadow(0 4px 6px rgba(214,63,114,.3)); }
.km-fly.is-caught { pointer-events: none; animation: km-caught .3s ease-out forwards !important; }
@keyframes km-fall { from { transform: translateY(0) rotate(-12deg); } 50% { transform: translateY(calc(var(--h, 470px) * .5 + 35px)) rotate(10deg) translateX(14px); } to { transform: translateY(calc(var(--h, 470px) + 90px)) rotate(-8deg); } }
@keyframes km-blink { 0% { opacity: 0; transform: scale(.6); } 20%, 80% { opacity: 1; transform: none; } 100% { opacity: 0; } }
@keyframes km-caught { to { opacity: 0; transform: scale(1.8); } }
.km-arena { --h: clamp(340px, 50svh, 470px); }
.km-arenaIntro { position: absolute; inset: 0; z-index: 4; display: grid; place-items: center; align-content: center; gap: 14px; background: rgba(255,245,248,.55); }
.km-catcher { position: absolute; right: 10px; bottom: 10px; z-index: 3; pointer-events: none; }
.km-result { display: grid; justify-items: center; gap: 4px; margin-top: 8px; }
.km-big { margin: 6px 0 0; font: 400 clamp(72px, 22vw, 110px)/.9 var(--km-display); color: var(--km-primary); text-shadow: 0 5px 0 #fff, 0 12px 26px rgba(214,63,114,.3); }
.km-resultTx { margin: 0; font: 500 17px/1.4 var(--km-ui); color: var(--km-ink2); max-width: 28ch; }
.km-owed { list-style: none; margin: 8px 0 0; padding: 0; display: grid; gap: 10px; width: min(380px, 100%); }
.km-owed li { display: flex; gap: 10px; align-items: center; text-align: left; padding: 12px 16px; border-radius: 16px; background: #fff; font: 600 16px/1.3 var(--km-hand); color: var(--km-ink);
  box-shadow: 0 0 0 2px #FFE3EC, 0 8px 18px -12px rgba(214,63,114,.5); transform: rotate(var(--t)); border-left: 6px dotted #FFC1D3; }
`;
