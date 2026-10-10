"use client";

// Room 2 — Trick or Treat? Mini-game A, about ten seconds.
//   TREAT → sweets rain down; slide the pumpkin pail (or tap the sweets) to
//           catch five. "Fill it for me" does it for them.
//   TRICK → asked for it: the prankster panda in a Scream mask jumps at them
//           with a BOO (the optional third scare, ./stage.tsx), then "got you!
//           💜", the sender's trick line and "…fine, have a treat anyway".
//           Kids mode: the panda just waves hello, no sound, no dark.
// Both paths end on a full pail and the way into the house.

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { FONTS, VW } from "../../../_valentine/theme";
import { CandyBucket } from "./art";
import { HW_DISPLAY } from "./fonts";
import { HW_GIF, preload, useHw, useNext } from "./stage";
import { Btn, Hint, HW, RoomTitle, SkipChip } from "./ui";

const GOAL = 5;
const SWEETS = ["🍬", "🍭", "🍫", "🍬", "🍭", "🧁"];
const POOL = 6;
const BUCKET_W = 112;

type Phase = "choose" | "treat" | "trick" | "anyway" | "done";

interface Drop {
  on: boolean;
  x: number;
  y: number;
  vy: number;
  rot: number;
  vr: number;
}

function CatchGame({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion();
  const { cue } = useHw();
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const bucketRef = useRef<HTMLDivElement | null>(null);
  const els = useRef<(HTMLSpanElement | null)[]>([]);
  const drops = useRef<Drop[]>(Array.from({ length: POOL }, () => ({ on: false, x: 0, y: 0, vy: 0, rot: 0, vr: 0 })));
  const bucketX = useRef(0.5);
  const caughtRef = useRef(0);
  const [caught, setCaught] = useState(0);
  const [pops, setPops] = useState<{ id: number; x: number; y: number }[]>([]);
  const finished = caught >= GOAL;

  const catchOne = useCallback(
    (x: number, y: number) => {
      if (caughtRef.current >= GOAL) return;
      caughtRef.current += 1;
      setCaught(caughtRef.current);
      haptic(12);
      cue("pop", { gain: 0.7, detune: caughtRef.current * 90 });
      const id = performance.now();
      setPops((p) => [...p.slice(-4), { id, x, y }]);
      if (caughtRef.current >= GOAL) window.setTimeout(onDone, 500);
    },
    [onDone, cue],
  );

  // The falling sweets (skipped under reduced motion — they sit still to be tapped).
  useEffect(() => {
    if (reduced) return;
    const arena = arenaRef.current;
    if (!arena) return;
    let raf = 0;
    let last = performance.now();
    let spawnIn = 200;
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const w = arena.clientWidth;
      const h = arena.clientHeight;
      const bx = bucketX.current * w;
      const bTop = h - 96;
      spawnIn -= dt * 1000;
      if (spawnIn <= 0 && caughtRef.current < GOAL) {
        spawnIn = 520 + Math.random() * 300;
        const d = drops.current.find((x) => !x.on);
        if (d) {
          d.on = true;
          d.x = 24 + Math.random() * (w - 48);
          d.y = -40;
          d.vy = 150 + Math.random() * 90;
          d.rot = Math.random() * 360;
          d.vr = (Math.random() - 0.5) * 240;
        }
      }
      drops.current.forEach((d, i) => {
        const el = els.current[i];
        if (!d.on) {
          if (el) el.style.opacity = "0";
          return;
        }
        d.y += d.vy * dt;
        d.rot += d.vr * dt;
        if (d.y > bTop - 6 && d.y < bTop + 30 && Math.abs(d.x - bx) < BUCKET_W / 2 - 4) {
          d.on = false;
          catchOne(d.x, bTop);
        } else if (d.y > h + 20) d.on = false;
        if (el) {
          el.style.opacity = d.on ? "1" : "0";
          el.style.transform = `translate3d(${d.x - 18}px, ${d.y}px, 0) rotate(${d.rot}deg)`;
        }
      });
      // The pail sits centred by CSS; this slides it from there.
      if (bucketRef.current) bucketRef.current.style.transform = `translate3d(${bx - w / 2}px, 0, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, catchOne]);

  const move = (clientX: number) => {
    const r = arenaRef.current?.getBoundingClientRect();
    if (!r) return;
    bucketX.current = Math.min(1 - BUCKET_W / 2 / r.width, Math.max(BUCKET_W / 2 / r.width, (clientX - r.left) / r.width));
  };

  const fillForMe = () => {
    const left = GOAL - caughtRef.current;
    for (let k = 0; k < left; k++) window.setTimeout(() => catchOne((arenaRef.current?.clientWidth ?? 300) / 2, (arenaRef.current?.clientHeight ?? 300) - 96), k * 140);
  };

  return (
    <>
      <p aria-live="polite" style={{ margin: 0, flex: "none", font: `400 clamp(18px, 2.8dvh, 22px) ${HW_DISPLAY}`, color: HW.candle }}>
        🍬 {caught} / {GOAL}
      </p>
      <div
        ref={arenaRef}
        onPointerMove={(e) => move(e.clientX)}
        onPointerDown={(e) => move(e.clientX)}
        style={{
          position: "relative",
          flex: "1 1 0",
          minHeight: 0,
          width: "100%",
          maxWidth: "calc(420px * var(--vw-s, 1))",
          maxHeight: 420,
          borderRadius: 24,
          overflow: "hidden",
          background: "linear-gradient(180deg, rgba(247,243,255,.04), rgba(247,243,255,.10))",
          border: "1px solid rgba(247,243,255,.14)",
          touchAction: "none",
          cursor: "ew-resize",
        }}
      >
        {!reduced &&
          Array.from({ length: POOL }, (_, i) => (
            <span
              key={i}
              ref={(el) => {
                els.current[i] = el;
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                const d = drops.current[i];
                if (!d.on) return;
                d.on = false;
                catchOne(d.x, d.y);
              }}
              style={{ position: "absolute", left: 0, top: 0, width: 36, height: 36, fontSize: 30, lineHeight: "36px", textAlign: "center", opacity: 0, cursor: "pointer", willChange: "transform" }}
              aria-hidden
            >
              {SWEETS[i % SWEETS.length]}
            </span>
          ))}
        {reduced &&
          !finished &&
          SWEETS.slice(0, GOAL - caught).map((s, i) => (
            <button
              key={`${caught}-${i}`}
              type="button"
              onClick={() => catchOne(0, 0)}
              aria-label="Put a sweet in the pail"
              style={{ position: "absolute", left: `${12 + i * 17}%`, top: `${18 + (i % 2) * 18}%`, width: 48, height: 48, border: 0, background: "transparent", fontSize: 32, cursor: "pointer" }}
            >
              {s}
            </button>
          ))}
        <div ref={bucketRef} style={{ position: "absolute", left: `calc(50% - ${BUCKET_W / 2}px)`, bottom: 4, width: BUCKET_W }} aria-hidden>
          <CandyBucket size={BUCKET_W} fill={caught / GOAL} />
        </div>
        <AnimatePresence>
          {pops.map((p) => (
            <motion.span
              key={p.id}
              initial={{ opacity: 1, y: 0, scale: 0.8 }}
              animate={{ opacity: 0, y: -40, scale: 1.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              style={{ position: "absolute", left: p.x - 20, top: p.y - 10, width: 40, textAlign: "center", font: `400 18px ${HW_DISPLAY}`, color: HW.mint, pointerEvents: "none" }}
              aria-hidden
            >
              +1
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
      <div style={{ flex: "none", display: "grid", gap: 4, justifyItems: "center", minHeight: 76 }}>
        {!finished && <Hint>{reduced ? "Tap the sweets to drop them in the pail" : "Slide the pail to catch 5 sweets (or tap them)"}</Hint>}
        {!finished && <SkipChip onClick={fillForMe}>Fill it for me</SkipChip>}
      </div>
    </>
  );
}

export default function TrickOrTreat({ trickLine, sticker, onNext }: { trickLine: string; sticker: ReactNode; onNext: () => void }) {
  const reduced = useReducedMotion();
  const hw = useHw();
  const [phase, setPhase] = useState<Phase>("choose");
  const play = `trick${hw.round}`;

  useEffect(() => preload(`${HW_GIF.panda}?play=${play}`), [play]);

  const candyRain = useCallback(() => {
    burst({ kind: "sparkles", emojis: ["🍬", "🍭", "🍫", "🧁"], origin: { x: 0.5, y: 0.25 }, count: 26 });
  }, []);

  const treat = () => {
    haptic(15);
    hw.cue("sparkle", { gain: 0.6 });
    setPhase("treat");
  };
  const line = trickLine || "Trick! You owe me three hugs.";
  const trick = () => {
    setPhase("trick");
    hw.scare({
      kind: "panda",
      play,
      line,
      onDone: () => {
        setPhase("anyway");
        candyRain();
      },
    });
  };

  useNext(phase === "anyway" || phase === "done" ? "Come inside" : null, onNext, "candy", phase === "done" ? 2000 : phase === "anyway" ? 2600 : null);

  return (
    <>
      <RoomTitle kicker="Room 2 · the front porch" title="Trick or treat?" sub={phase === "choose" ? "Pick one. Choose wisely… or don't." : undefined} />

      {(phase === "choose" || phase === "trick") && (
        <>
          <div className="hw-fill">
            <div style={{ display: "grid", justifyItems: "center", gap: 2 }}>
              <div style={{ height: "min(30cqh, 96px)", display: "grid", placeItems: "end center" }}>{sticker}</div>
              <motion.div animate={reduced ? undefined : { rotate: [-3, 3, -3] }} transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }} style={{ width: "min(56cqh, 170px)" }}>
                <CandyBucket size="100%" fill={0.15} />
              </motion.div>
            </div>
          </div>
          <div className="hw-row" style={{ flex: "none", gap: 12, minHeight: 76, alignContent: "start" }}>
            <Btn onClick={trick} style={{ background: HW.lavender, color: HW.paperInk, boxShadow: `0 5px 0 #6E55B8, 0 16px 34px -14px rgba(183,156,255,.5)`, minWidth: 140 }}>
              TRICK 👻
            </Btn>
            <Btn onClick={treat} style={{ minWidth: 140 }}>TREAT 🍬</Btn>
          </div>
        </>
      )}

      {phase === "treat" && (
        <CatchGame
          onDone={() => {
            candyRain();
            hw.cue("chime", { gain: 0.6 });
            setPhase("done");
          }}
        />
      )}

      {(phase === "anyway" || phase === "done") && (
        <div className="hw-fill">
          <motion.div initial={reduced ? false : { opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ display: "grid", gap: "clamp(6px, 1.4dvh, 12px)", justifyItems: "center" }}>
            {phase === "done" ? <div style={{ height: "min(26cqh, 96px)", display: "grid", placeItems: "end center" }}>{sticker}</div> : null}
            <div style={{ width: "min(44cqh, 160px)" }}>
              <CandyBucket size="100%" fill={1} />
            </div>
            <p style={{ margin: 0, font: `400 clamp(22px, 3.6dvh, 28px) ${HW_DISPLAY}`, color: HW.candle }}>{phase === "done" ? "Treat unlocked! 🍬" : "…fine, have a treat anyway 🍬"}</p>
            <p style={{ margin: 0, maxWidth: 320, font: `500 clamp(13px, 2dvh, 15px)/1.4 ${FONTS.ui}`, color: VW.inkSoft, overflowWrap: "anywhere" }}>
              {phase === "done" ? "A full pail. You're a natural." : `“${line}”`}
            </p>
          </motion.div>
        </div>
      )}
    </>
  );
}
