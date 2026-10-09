"use client";

// "Promise me back?" and the money moment.
//   pick     her turn: she picks one to three promises to give back (chips), beside an open heart love lock
//            engraved with their initials (slot pk-lock waits next to it).
//   rolling  "Lock it forever" → the riser (useSongDrop): the lock trembles to a heartbeat.
//   locked   on the song's chorus the shackle snaps shut, the tiny key arcs off-screen as a shooting star, the sky
//            warms to golden hour and every promise (his stars + the ones she just gave) floats up as a glowing paper
//            lantern, while hugging stickers pop in around the lock (slot pk-yes). → "Get my membership card"

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { motion } from "framer-motion";
import { burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { usePremium, useSongDrop } from "../../../_valentine/kit/premium";
import type { DayConfig, ValentineDayData } from "../../../_valentine/types";
import { Btn, DECOR, Gif, KeyArt, LoveLock, SlotGif, Spark, Typed } from "./parts";
import { originOf, type Club } from "./util";

/** Where the stickers land around the lock (px from its centre) + their size. */
const WALL = [
  { x: -132, y: -70, s: 82, r: -8 },
  { x: 132, y: -76, s: 96, r: 7, slot: true },
  { x: -146, y: 50, s: 74, r: 6 },
  { x: 146, y: 46, s: 76, r: -6 },
  { x: -112, y: 150, s: 62, r: -5 },
  { x: 116, y: 150, s: 64, r: 8 },
];

export function Lock({ club, day, data, onLocked, onDone, onSkyChange }: { club: Club; day: DayConfig; data: ValentineDayData; onLocked: (picks: string[]) => void; onDone: () => void; onSkyChange: (on: boolean) => void }) {
  const { sfx, music } = usePremium();
  const { drop } = useSongDrop();
  const reduce = useReducedMotion();
  const [picks, setPicks] = useState<string[]>([]);
  const [phase, setPhase] = useState<"pick" | "rolling" | "locked">("pick");
  const [keyGone, setKeyGone] = useState(false);
  const [cta, setCta] = useState(false);
  const lockRef = useRef<HTMLDivElement | null>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    if (music?.canFade) music.fadeTo(0.5, 1600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (p: string) => {
    if (phase !== "pick") return;
    setPicks((cur) => {
      if (cur.includes(p)) return cur.filter((x) => x !== p);
      if (cur.length >= 3) return cur;
      return [...cur, p];
    });
    sfx(picks.includes(p) ? "pk-boop" : "pop", { gain: 0.6, detune: picks.length * 120 });
    haptic(8);
  };

  const lockIt = () => {
    if (phase !== "pick" || !picks.length) return;
    setPhase("rolling");
    onLocked(picks);
    haptic([20, 30, 20]);
    sfx("heartbeat", { gain: 0.6 });
    drop(() => {
      setPhase("locked");
      onSkyChange(true);
      sfx("pk-snap");
      sfx("pk-tada", { at: 0.15 });
      sfx("whoosh", { at: 0.55, gain: 0.5 });
      sfx("sparkle", { at: 0.7 });
      sfx("firework", { at: 1.3, gain: 0.35 });
      haptic([20, 30, 20, 30, 60]);
      const o = originOf(lockRef.current);
      timers.current.push(
        window.setTimeout(() => setKeyGone(true), 1700),
        window.setTimeout(() => burst({ kind: "confetti", origin: o, count: 110, colors: day.theme.confetti }), 450),
        window.setTimeout(() => burst({ kind: "hearts", origin: o, count: 24 }), 800),
        ...WALL.map((_, k) => window.setTimeout(() => sfx("pop", { gain: 0.45, detune: k * 90 }), 1500 + k * 230)),
        window.setTimeout(() => setCta(true), 4800),
      );
    });
  };

  const locked = phase === "locked";
  // the lantern sky: his promises (the big one included) and the ones she just gave back
  const lanterns = useMemo(() => {
    const his = club.stars.map((t, k) => ({ t, her: false, big: k === club.bigIndex }));
    const hers = picks.map((t) => ({ t, her: true, big: false }));
    const all = [...his, ...hers].slice(0, 11);
    return all.map((l, k) => ({ ...l, x: 6 + ((k * 37) % 84), d: 11 + ((k * 7) % 6), dl: k * 0.55, s: l.big ? 1.18 : 0.86 + ((k * 13) % 4) / 20 }));
  }, [club.stars, club.bigIndex, picks]);

  return (
    <div className={`pk-scene pk-lockScene is-${phase}`}>
      {locked && (
        <div className="pk-sky" aria-hidden>
          {lanterns.map((l, k) => (
            <span
              key={k}
              className={`pk-lantern${l.her ? " her" : ""}${l.big ? " big" : ""}`}
              style={
                (reduce
                  ? { left: k % 2 ? "auto" : "1%", right: k % 2 ? "1%" : "auto", top: `${18 + Math.floor(k / 2) * 13}%`, ["--s" as string]: 0.8 }
                  : { left: `${l.x}%`, ["--d" as string]: `${l.d}s`, ["--dl" as string]: `${l.dl}s`, ["--s" as string]: l.s }) as CSSProperties
              }
            >
              <i />
              <span>{l.t}</span>
            </span>
          ))}
        </div>
      )}

      <header className="pk-head">
        <p className="pk-kicker">{locked ? `${club.to} & ${club.from}` : "Your turn"}</p>
        {locked ? (
          <motion.h2 className="pk-title pk-lockedTitle" initial={{ scale: 0.4, rotate: -8, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 180, damping: 12 }}>
            <Spark className="l" />
            <span>Locked. Forever.</span>
            <Spark className="r" />
          </motion.h2>
        ) : (
          <h2 className="pk-title">Promise me back?</h2>
        )}
        {!locked && <p className="pk-sub">Pick one, two or three. I&rsquo;ll see which 🙈</p>}
      </header>

      <div className="pk-lockStage">
        <div ref={lockRef} className={`pk-lockWrap${phase === "rolling" ? " is-rolling" : ""}${locked ? " is-locked" : ""}`}>
          <LoveLock open={!locked} engraving={club.engraving} size={reduce ? 140 : 150} />
          {locked && !keyGone && (
            <motion.span
              className="pk-flyKey"
              initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
              animate={reduce ? { opacity: 0 } : { x: [0, 60, 220], y: [0, -180, -520], rotate: [0, 160, 420], scale: [1, 0.8, 0.3], opacity: [1, 1, 0] }}
              transition={{ duration: 1.4, ease: "easeIn", delay: 0.35 }}
            >
              <KeyArt size={44} />
              <span className="pk-keyTrail" />
            </motion.span>
          )}
          {locked &&
            WALL.map((w, k) => (
              <motion.span
                key={k}
                className="pk-wall"
                style={{ left: `calc(50% + ${w.x}px - ${w.s / 2}px)`, top: `calc(50% + ${w.y}px - ${w.s / 2}px)` }}
                initial={{ scale: 0, rotate: w.r - 20, opacity: 0 }}
                animate={{ scale: 1, rotate: w.r, opacity: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15, mass: 0.8, delay: 1.5 + k * 0.23 }}
              >
                {w.slot ? <SlotGif day={day} data={data} id="pk-yes" size={w.s} eager /> : <Gif src={DECOR.sky[k === 0 ? 0 : k - 1]} size={w.s} eager />}
              </motion.span>
            ))}
        </div>
        {!locked && (
          <span className="pk-lockGif" style={{ opacity: phase === "rolling" ? 0 : 1 }}>
            <SlotGif day={day} data={data} id="pk-lock" size={92} eager />
          </span>
        )}
      </div>

      {locked ? (
        <div className="pk-lockedSay" aria-live="polite">
          {keyGone && (
            <motion.p className="pk-bubble" initial={{ opacity: 0, y: 12, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 18 }}>
              <Typed text={`${club.big}`} speed={30} delay={300} />
            </motion.p>
          )}
          {cta && (
            <motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 16 }}>
              <Btn onClick={onDone}>Get my membership card 🎀</Btn>
            </motion.div>
          )}
        </div>
      ) : (
        <div className="pk-pickArea" style={{ opacity: phase === "rolling" ? 0.35 : 1, pointerEvents: phase === "pick" ? "auto" : "none" }}>
          <div className="pk-chips" role="group" aria-label="Promises to give back">
            {club.askBack.map((a) => {
              const on = picks.includes(a);
              return (
                <button key={a} type="button" className={`pk-chip${on ? " on" : ""}`} onClick={() => toggle(a)} aria-pressed={on}>
                  <span aria-hidden>{on ? "🤙" : "+"}</span> {a}
                </button>
              );
            })}
          </div>
          <div className="pk-actions">
            <Btn onClick={lockIt} disabled={!picks.length}>
              {picks.length ? `Lock ${picks.length > 1 ? "them" : "it"} forever 🔒` : "Pick a promise first"}
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}
