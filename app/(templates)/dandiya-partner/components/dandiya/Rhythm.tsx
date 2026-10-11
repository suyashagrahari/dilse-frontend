"use client";

// Scene 3 — the dhol game. A ring of light closes in on the crossed sticks on
// every dhol beat; she taps to clash the sticks — "Perfect!" when the ring
// lands, "Nice!" when it's close, "Almost!" otherwise. Every tap fills the
// Dhamaal meter (twelve little mirrors), a perfect one fills two, and a combo
// of three sends hearts up. Nobody can lose: any tap counts, at any time.
// The background music ducks while the dhol plays and comes back after.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { useDayMusic } from "../../../_valentine/music/context";
import { FONTS } from "../../../_valentine/theme";
import { CrossedSticks, Dhol } from "./art";
import { DD_DISPLAY } from "./fonts";
import { useDd, useNext } from "./stage";
import { DD, Hint, RoomTitle } from "./ui";

const BEAT_MS = 800;
const GOAL = 12;

type Grade = "Perfect!" | "Nice!" | "Almost!";
interface Pop {
  id: number;
  grade: Grade;
}

export default function Rhythm({ sticker, onNext }: { sticker: ReactNode; onNext: () => void }) {
  const reduced = useReducedMotion();
  const { cue } = useDd();
  const music = useDayMusic();
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [clash, setClash] = useState(0);
  const [pops, setPops] = useState<Pop[]>([]);
  const [hit, setHit] = useState(false);
  const [idle, setIdle] = useState(false);
  const done = score >= GOAL;
  const t0 = useRef(0);
  const ringRef = useRef<HTMLSpanElement | null>(null);
  const lastBeat = useRef(-1);
  const doneRef = useRef(false);
  doneRef.current = done;

  // Duck the background music while the dhol plays.
  useEffect(() => {
    music?.duck?.(0.22, 400);
    return () => music?.unduck?.(600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The beat clock: one rAF loop drives the closing ring and the dhol.
  useEffect(() => {
    t0.current = performance.now() + 600;
    let raf = 0;
    const loop = (now: number) => {
      const el = ringRef.current;
      const since = now - t0.current;
      const phase = ((since % BEAT_MS) + BEAT_MS) % BEAT_MS / BEAT_MS; // 0 → 1, the beat lands at 1/0
      if (el) {
        if (reduced) {
          el.style.opacity = String(Math.max(0, 1 - phase * 1.6));
          el.style.transform = "scale(1)";
        } else {
          el.style.transform = `scale(${(2.3 - 1.3 * phase).toFixed(3)})`;
          el.style.opacity = String(Math.min(1, 0.15 + phase));
        }
      }
      const beat = Math.floor(since / BEAT_MS);
      if (since >= 0 && beat !== lastBeat.current) {
        lastBeat.current = beat;
        if (!doneRef.current || beat % 2 === 0) cue("dd-dhol", { gain: doneRef.current ? 0.45 : beat % 4 === 0 ? 0.9 : 0.6, detune: beat % 4 === 2 ? 1 : 0 });
        setHit(true);
        window.setTimeout(() => setHit(false), 90);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [cue, reduced]);

  // Nobody gets stuck: a gentle nudge if nothing has been tapped for a while.
  useEffect(() => {
    if (done) return;
    setIdle(false);
    const t = window.setTimeout(() => setIdle(true), 5000);
    return () => window.clearTimeout(t);
  }, [score, done]);

  const tap = () => {
    if (done) {
      setClash((c) => c + 1);
      cue("dd-tak", { gain: 0.7 });
      return;
    }
    const since = performance.now() - t0.current;
    const phase = ((since % BEAT_MS) + BEAT_MS) % BEAT_MS;
    const err = Math.min(phase, BEAT_MS - phase);
    const grade: Grade = err < 110 ? "Perfect!" : err < 230 ? "Nice!" : "Almost!";
    const add = grade === "Perfect!" ? 2 : 1;
    const nextCombo = grade === "Almost!" ? 0 : combo + 1;
    haptic(grade === "Perfect!" ? [12, 30, 12] : 10);
    cue("dd-tak", { gain: grade === "Almost!" ? 0.6 : 0.95, detune: grade === "Perfect!" ? 200 : 0 });
    if (grade === "Perfect!") cue("dd-bells", { gain: 0.4 });
    setClash((c) => c + 1);
    setCombo(nextCombo);
    const id = performance.now();
    setPops([{ id, grade }]);
    window.setTimeout(() => setPops((p) => p.filter((x) => x.id !== id)), 900);
    if (nextCombo > 0 && nextCombo % 3 === 0 && !reduced) burst({ kind: "hearts", emojis: ["💛", "🧡", "💖"], origin: { x: 0.5, y: 0.55 }, count: 10, spread: 0.18 });
    const s = Math.min(GOAL, score + add);
    setScore(s);
    if (s >= GOAL) {
      window.setTimeout(() => {
        cue("chime-cascade", { gain: 0.7 });
        burst({ kind: "confetti", colors: [DD.marigold, DD.kumkum, DD.peacock, DD.emerald, DD.rani, DD.gold], origin: { x: 0.5, y: 0.45 }, count: 60 });
      }, 120);
    }
  };

  useNext(done ? "Pick your look" : null, onNext, "dance");

  return (
    <>
      <style>{RHYTHM_CSS}</style>
      <RoomTitle kicker="Dhol · taal · tak" title={done ? "Dhamaal! You're a natural" : "Clash on the dhol beat"} sub={done ? "Our sticks were made for each other." : "Tap when the ring meets the sticks. Every tap counts."} />

      <div className="dd-fill">
        <button type="button" className={`dd-arena${done ? " is-done" : ""}`} onPointerDown={(e) => { e.preventDefault(); tap(); }} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tap(); } }} aria-label={done ? "Clash the sticks again" : `Clash the sticks on the beat. ${score} of ${GOAL}`}>
          <span className="dd-arena-target" aria-hidden />
          <span ref={ringRef} className="dd-arena-ring" aria-hidden />
          <motion.span
            key={clash}
            className="dd-arena-sticks"
            initial={reduced || clash === 0 ? false : { scale: 1.18, rotate: clash % 2 ? -8 : 8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 600, damping: 14 }}
          >
            <CrossedSticks size="100%" clash={clash % 2} />
          </motion.span>
          <span className="dd-arena-dhol" aria-hidden>
            <Dhol size="100%" hit={hit} />
          </span>
          <AnimatePresence>
            {done && (
              <motion.span className="dd-arena-sticker" initial={reduced ? false : { opacity: 0, scale: 0.4, rotate: -20 }} animate={{ opacity: 1, scale: 1, rotate: 8 }} transition={{ type: "spring", stiffness: 260, damping: 14 }}>
                {sticker}
              </motion.span>
            )}
          </AnimatePresence>
          <span className="dd-arena-pops" aria-hidden>
            <AnimatePresence mode="popLayout">
              {pops.map((p) => (
                <motion.span
                  key={p.id}
                  initial={{ opacity: 0, y: 10, scale: 0.7 }}
                  animate={{ opacity: 1, y: -24, scale: 1 }}
                  exit={{ opacity: 0, y: -44 }}
                  transition={{ duration: 0.35 }}
                  style={{ position: "absolute", left: 0, right: 0, font: `400 clamp(22px, 7cqw, 30px) ${DD_DISPLAY}`, color: p.grade === "Perfect!" ? DD.marigold : p.grade === "Nice!" ? "#7FD8F2" : DD.ink, textShadow: "0 2px 8px rgba(5,8,30,.9)" }}
                >
                  {p.grade}
                </motion.span>
              ))}
            </AnimatePresence>
          </span>
        </button>
      </div>

      {/* the Dhamaal meter: twelve mirrors that light up */}
      <div className="dd-meter" role="progressbar" aria-valuemin={0} aria-valuemax={GOAL} aria-valuenow={score} aria-label="Dhamaal meter">
        {Array.from({ length: GOAL }, (_, i) => (
          <span key={i} className={i < score ? "is-on" : undefined} />
        ))}
      </div>
      <div style={{ flex: "none", minHeight: 30, display: "grid", placeItems: "center" }}>
        {done ? (
          <p style={{ margin: 0, font: `600 clamp(13px, 2dvh, 15px) ${FONTS.ui}`, color: DD.mist }}>Keep tapping if you like. The dhol never gets tired.</p>
        ) : combo >= 2 ? (
          <p style={{ margin: 0, font: `400 clamp(16px, 2.4dvh, 19px) ${DD_DISPLAY}`, color: DD.marigold }}>Combo ×{combo} 💛</p>
        ) : idle ? (
          <Hint>Just tap along, any time counts 💛</Hint>
        ) : (
          <p style={{ margin: 0, font: `600 clamp(13px, 2dvh, 15px) ${FONTS.ui}`, color: DD.mist }}>{score} of {GOAL}</p>
        )}
      </div>
    </>
  );
}

const RHYTHM_CSS = `
.dd-arena { position: relative; width: min(84cqw, 92cqh, calc(320px * var(--vw-s, 1))); aspect-ratio: 1; border: 0; padding: 0; background: none; cursor: pointer;
  border-radius: 50%; touch-action: manipulation; -webkit-tap-highlight-color: transparent; user-select: none; -webkit-user-select: none; }
.dd-arena:focus-visible { outline: 3px solid #7FD8F2; outline-offset: 6px; }
.dd-arena-target { position: absolute; left: 17%; width: 66%; top: 2%; aspect-ratio: 1; border-radius: 50%;
  background: radial-gradient(circle, rgba(255,182,39,.18), rgba(255,182,39,0) 70%);
  box-shadow: 0 0 0 3px #F6D27A, 0 0 0 7px rgba(246,210,122,.25), 0 0 30px rgba(255,182,39,.35); }
.dd-arena-ring { position: absolute; left: 17%; width: 66%; top: 2%; aspect-ratio: 1; border-radius: 50%; border: 4px solid #FFE08A; box-shadow: 0 0 18px rgba(255,224,138,.8); will-change: transform, opacity; pointer-events: none; }
.dd-arena-sticks { position: absolute; left: 25%; right: 25%; top: 10%; aspect-ratio: 1; display: block; }
.dd-arena-dhol { position: absolute; left: 24%; right: 24%; bottom: 0; }
.dd-arena-pops { position: absolute; left: 0; right: 0; top: -2%; height: 0; pointer-events: none; }
.dd-arena-sticker { position: absolute; right: -4%; top: -6%; pointer-events: none; }
.dd-meter { flex: none; display: flex; gap: clamp(4px, 1.2vw, 7px); justify-content: center; }
.dd-meter span { width: clamp(14px, 4vw, 20px); aspect-ratio: 1; border-radius: 50%; background: radial-gradient(circle at 38% 34%, #6A75A8, #2A3268);
  box-shadow: 0 0 0 2px rgba(246,210,122,.4); transition: background .2s ease, box-shadow .2s ease, transform .2s cubic-bezier(.3,1.6,.5,1); }
.dd-meter span.is-on { background: radial-gradient(circle at 38% 34%, #FFFFFF 0 18%, #DCE7FF 40%, #8FA6DE 80%); box-shadow: 0 0 0 2px #F6D27A, 0 0 10px rgba(255,224,138,.9); transform: scale(1.12); }
`;
