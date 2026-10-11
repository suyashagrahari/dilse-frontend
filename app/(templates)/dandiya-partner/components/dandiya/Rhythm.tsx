"use client";

// Scene 3 — the Dandiya Clash. A two-player dandiya round: the sender's pair
// of sticks swings in from the top on every dhol beat; tap and your pair
// swings up from the bottom to meet them in the middle — TAK! A shower of
// mirror-work sparks flies off the clash, "Perfect!" when you land on the
// beat, and a combo builds: ×3 sends hearts, ×5 is "Dhamaal!" with a flash of
// marigold light, ×8 crowns you. Swipe sideways for a garba twirl clash.
// The panda couple beside the ring hops on every clash and spins on combos.
//
// Nobody can lose: every tap counts (off-beat is still "Tak!"), the Dhamaal
// meter only ever fills, and a gentle nudge appears if nothing happens. The
// background music ducks while the dhol plays.
//
// One rAF loop drives the beat (their sticks + the closing ring) by writing
// transforms straight to the DOM; every effect is transform/opacity only.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { useDayMusic } from "../../../_valentine/music/context";
import { FONTS } from "../../../_valentine/theme";
import { Dhol, Stick } from "./art";
import { DD_DISPLAY } from "./fonts";
import { useDd, useNext } from "./stage";
import { DD, Hint, RoomTitle } from "./ui";

const BEAT_MS = 720;
const GOAL = 12;

type Grade = "Perfect!" | "Nice!" | "Tak!" | "Twirl!";
interface Fx {
  id: number;
  grade: Grade;
  combo: number;
}

// Hands (in % of the square arena) and the angles that point each stick at the centre.
const THEM = [
  { x: 30, y: 9, aim: 63, out: 24 },
  { x: 70, y: 9, aim: 117, out: -24 },
] as const;
const YOU = [
  { x: 30, y: 91, aim: -63, out: -26 },
  { x: 70, y: 91, aim: -117, out: 26 },
] as const;

const SPARKS = 14;

export default function Rhythm({ sender, sticker, onNext }: { sender: string; sticker: ReactNode; onNext: () => void }) {
  const reduced = useReducedMotion();
  const { cue } = useDd();
  const music = useDayMusic();
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState(0);
  const [clash, setClash] = useState(0);
  const [fx, setFx] = useState<Fx | null>(null);
  const [twirl, setTwirl] = useState(0);
  const [idle, setIdle] = useState(false);
  const done = score >= GOAL;
  const t0 = useRef(0);
  const ringRef = useRef<HTMLSpanElement | null>(null);
  const themRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const lastBeat = useRef(-1);
  const doneRef = useRef(false);
  const comboRef = useRef(0);
  const scoreRef = useRef(0);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  doneRef.current = done;

  // Duck the background music while the dhol plays.
  useEffect(() => {
    music?.duck?.(0.22, 400);
    return () => music?.unduck?.(600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The beat clock: their sticks swing in to the centre on every beat; the ring closes on it.
  useEffect(() => {
    t0.current = performance.now() + 700;
    let raf = 0;
    const loop = (now: number) => {
      const since = now - t0.current;
      const p = (((since % BEAT_MS) + BEAT_MS) % BEAT_MS) / BEAT_MS; // 0 → 1; the beat lands at 1/0
      // swing: out after the beat (fast), then easing in to meet the centre on the next one
      const s = reduced ? 0.5 : p < 0.16 ? p / 0.16 : 1 - Math.pow((p - 0.16) / 0.84, 2);
      themRefs.current.forEach((el, k) => {
        if (el) el.style.transform = `rotate(${(THEM[k].aim + THEM[k].out * s).toFixed(2)}deg)`;
      });
      const ring = ringRef.current;
      if (ring) {
        ring.style.transform = reduced ? "scale(1)" : `scale(${(2.4 - 1.4 * p).toFixed(3)})`;
        ring.style.opacity = String(reduced ? Math.max(0, 1 - p * 1.6) : Math.min(1, 0.1 + p));
      }
      const beat = Math.floor(since / BEAT_MS);
      if (since >= 0 && beat !== lastBeat.current) {
        lastBeat.current = beat;
        if (!doneRef.current || beat % 2 === 0) cue("dd-dhol", { gain: doneRef.current ? 0.4 : beat % 4 === 0 ? 0.9 : 0.6, detune: beat % 4 === 2 ? 1 : 0 });
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

  const hit = (twirling: boolean) => {
    const since = performance.now() - t0.current;
    const phase = ((since % BEAT_MS) + BEAT_MS) % BEAT_MS;
    const err = Math.min(phase, BEAT_MS - phase);
    const grade: Grade = twirling ? "Twirl!" : err < 110 ? "Perfect!" : err < 220 ? "Nice!" : "Tak!";
    const good = grade !== "Tak!";
    const nextCombo = good ? comboRef.current + 1 : 0;
    comboRef.current = nextCombo;
    haptic(grade === "Perfect!" || twirling ? [12, 30, 12] : 10);
    cue("dd-tak", { gain: good ? 1 : 0.7, detune: grade === "Perfect!" ? 220 : twirling ? 120 : 0 });
    cue("dd-tak", { gain: 0.55, at: 0.06, detune: 400 });
    if (grade === "Perfect!" || twirling) cue("dd-bells", { gain: 0.45 });
    if (twirling) cue("whoosh", { gain: 0.4 });
    setClash((c) => c + 1);
    setCombo(nextCombo);
    setBest((b) => Math.max(b, nextCombo));
    setFx({ id: Math.round(performance.now()), grade, combo: nextCombo });
    if (twirling) setTwirl((t) => t + 1);
    if (!reduced) {
      if (nextCombo === 3 || nextCombo === 6) burst({ kind: "hearts", emojis: ["💛", "🧡", "💖"], origin: { x: 0.5, y: 0.5 }, count: 12, spread: 0.2 });
      if (nextCombo === 5 || nextCombo === 8) {
        cue("chime", { gain: 0.6 });
        burst({ kind: "confetti", colors: [DD.marigold, DD.gold, "#FFFFFF", DD.rani, DD.peacock], origin: { x: 0.5, y: 0.5 }, count: 40 });
      }
    }
    if (doneRef.current) return;
    const add = grade === "Perfect!" || twirling ? 2 : 1;
    const s = Math.min(GOAL, scoreRef.current + add);
    scoreRef.current = s;
    setScore(s);
    if (s >= GOAL) {
      window.setTimeout(() => {
        cue("chime-cascade", { gain: 0.7 });
        burst({ kind: "confetti", colors: [DD.marigold, DD.kumkum, DD.peacock, DD.emerald, DD.rani, DD.gold], origin: { x: 0.5, y: 0.45 }, count: 60 });
      }, 120);
    }
  };

  useNext(done ? "Pick your look" : null, onNext, "dance");

  const title = done ? "Dhamaal! Perfect pair" : `Clash sticks with ${sender}`;
  const sub = done ? `Best combo ×${Math.max(best, 1)}. Our sticks were made for each other.` : "Tap when their sticks swing in. Swipe sideways to twirl!";
  const label = fx ? (fx.combo >= 8 ? "Garba royalty 👑" : fx.combo >= 5 ? "Dhamaal!" : fx.grade) : "";

  return (
    <>
      <style>{CLASH_CSS}</style>
      <RoomTitle kicker="Dhol · taal · tak" title={title} sub={sub} />

      <div className="dd-fill">
        <div
          role="button"
          tabIndex={0}
          className={`dd-cl${done ? " is-done" : ""}`}
          data-dd-clash={score}
          aria-label={done ? "Clash the sticks again" : `Clash your sticks with ${sender}'s on the beat. ${score} of ${GOAL}`}
          onPointerDown={(e) => {
            e.preventDefault();
            swipe.current = { x: e.clientX, y: e.clientY };
          }}
          onPointerUp={(e) => {
            const s0 = swipe.current;
            swipe.current = null;
            if (!s0) return;
            const dx = e.clientX - s0.x;
            const dy = e.clientY - s0.y;
            hit(Math.abs(dx) > 46 && Math.abs(dx) > Math.abs(dy) * 1.3);
          }}
          onPointerCancel={() => {
            if (swipe.current) hit(false);
            swipe.current = null;
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              hit(false);
            } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
              e.preventDefault();
              hit(true);
            }
          }}
        >
          <span key={`tw-${twirl}`} className={`dd-cl-spin${twirl ? " is-twirl" : ""}`}>
            <span className="dd-cl-floor" aria-hidden />
            <span className="dd-cl-target" aria-hidden />
            <span ref={ringRef} className="dd-cl-ring" aria-hidden />
            {/* their sticks (the beat moves them) */}
            {THEM.map((h, k) => (
              <span
                key={`t${k}`}
                ref={(el) => {
                  themRefs.current[k] = el;
                }}
                className="dd-cl-stick"
                style={{ left: `${h.x}%`, top: `${h.y}%`, transform: `rotate(${h.aim + h.out}deg)` }}
                aria-hidden
              >
                <Stick length="100%" a={k ? DD.peacock : DD.marigold} b={k ? DD.rani : DD.emerald} />
              </span>
            ))}
            {/* your sticks: swing up to the centre on every clash */}
            {YOU.map((h, k) => (
              <span
                key={`y${k}-${clash}`}
                className={`dd-cl-stick dd-cl-you${clash ? " is-swing" : ""}`}
                style={{ left: `${h.x}%`, top: `${h.y}%`, ["--rest" as string]: `${h.aim + h.out}deg`, ["--hit" as string]: `${h.aim + (k ? -4 : 4)}deg` }}
                aria-hidden
              >
                <Stick length="100%" a={k ? DD.kumkum : DD.rani} b={k ? DD.emerald : DD.peacock} />
              </span>
            ))}
            {/* the clash: mirror sparks + a flash of light at the centre */}
            {fx && !reduced && (
              <span key={`fx-${fx.id}`} className={`dd-cl-burst${fx.grade === "Perfect!" || fx.grade === "Twirl!" ? " is-big" : ""}`} aria-hidden>
                <b />
                {Array.from({ length: SPARKS }, (_, i) => (
                  <i key={i} style={{ ["--a" as string]: `${(360 / SPARKS) * i + (fx.id % 20)}deg`, ["--d" as string]: `${38 + (i % 3) * 16}px` }} />
                ))}
              </span>
            )}
            <span className="dd-cl-tag dd-cl-tag-them">{sender}</span>
            <span className="dd-cl-tag dd-cl-tag-you">You</span>
          </span>

          <span className="dd-cl-dhol" aria-hidden>
            <Dhol size="100%" hit={clash % 2 === 1} />
          </span>
          {/* the panda couple: hops on every clash, spins on a combo */}
          <span key={`buddy-${clash}`} className={`dd-cl-buddy${clash ? (combo >= 3 ? " is-spin" : " is-hop") : ""}`} aria-hidden>
            {sticker}
          </span>
          {fx && (
            <span key={`pop-${fx.id}`} className={`dd-cl-pop${fx.combo >= 5 ? " is-mega" : ""}`} aria-hidden>
              {label}
              {fx.combo >= 2 && fx.combo < 5 && <small>combo ×{fx.combo}</small>}
            </span>
          )}
        </div>
        {fx && fx.combo >= 5 && !reduced && <span key={`flash-${fx.id}`} className="dd-cl-flash" aria-hidden />}
      </div>

      {/* the Dhamaal meter: twelve mirrors that light up */}
      <div className="dd-meter" role="progressbar" aria-valuemin={0} aria-valuemax={GOAL} aria-valuenow={score} aria-label="Dhamaal meter">
        {Array.from({ length: GOAL }, (_, i) => (
          <span key={i} className={i < score ? "is-on" : undefined} />
        ))}
      </div>
      <div style={{ flex: "none", minHeight: 30, display: "grid", placeItems: "center" }}>
        {done ? (
          <p style={{ margin: 0, font: `600 clamp(13px, 2dvh, 15px) ${FONTS.ui}`, color: DD.mist }}>Keep clashing if you like. The dhol never gets tired.</p>
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

const CLASH_CSS = `
.dd-cl { position: relative; width: min(92cqw, 94cqh, calc(340px * var(--vw-s, 1))); aspect-ratio: 1; cursor: pointer; border-radius: 50%; outline: none;
  touch-action: none; -webkit-tap-highlight-color: transparent; user-select: none; -webkit-user-select: none; }
.dd-cl:focus-visible { box-shadow: 0 0 0 3px #7FD8F2; }
.dd-cl-spin { position: absolute; inset: 0; display: block; }
.dd-cl-spin.is-twirl { animation: dd-cl-twirl .62s cubic-bezier(.3,.7,.3,1); }
@keyframes dd-cl-twirl { from { transform: rotate(0) scale(.96) } 60% { transform: rotate(330deg) scale(1.04) } to { transform: rotate(360deg) scale(1) } }
/* the dance floor: a rangoli disc of mirrors under the sticks */
.dd-cl-floor { position: absolute; inset: 6%; border-radius: 50%;
  background: radial-gradient(circle, rgba(255,214,120,.28), rgba(255,182,39,.08) 55%, rgba(0,0,0,0) 70%),
    repeating-conic-gradient(from 0deg, rgba(246,210,122,.16) 0 7.5deg, rgba(0,0,0,0) 7.5deg 15deg);
  box-shadow: inset 0 0 0 2px rgba(246,210,122,.35), inset 0 0 40px rgba(255,182,39,.18); }
.dd-cl-target { position: absolute; left: 50%; top: 50%; width: 22%; aspect-ratio: 1; margin: -11% 0 0 -11%; border-radius: 50%;
  box-shadow: 0 0 0 3px ${DD.gold}, 0 0 0 7px rgba(246,210,122,.25), 0 0 30px rgba(255,182,39,.5); }
.dd-cl-ring { position: absolute; left: 50%; top: 50%; width: 22%; aspect-ratio: 1; margin: -11% 0 0 -11%; border-radius: 50%; border: 3px solid #FFE08A;
  box-shadow: 0 0 16px rgba(255,224,138,.8); will-change: transform, opacity; pointer-events: none; box-sizing: border-box; }
.dd-cl-stick { position: absolute; width: 50%; height: 9%; margin-top: -4.5%; transform-origin: 0 50%; display: grid; align-items: center; pointer-events: none; will-change: transform;
  filter: drop-shadow(0 4px 5px rgba(30,0,2,.5)); }
.dd-cl-you { transform: rotate(var(--rest)); }
.dd-cl-you.is-swing { animation: dd-cl-swing .3s cubic-bezier(.2,.9,.3,1); }
@keyframes dd-cl-swing { 0% { transform: rotate(var(--rest)) } 38% { transform: rotate(var(--hit)) } 100% { transform: rotate(var(--rest)) } }
.dd-cl-tag { position: absolute; left: 50%; transform: translateX(-50%); padding: 3px 10px; border-radius: 99px; max-width: 46%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  font: 700 clamp(11px, 3.4cqw, 13px) ${FONTS.ui}; letter-spacing: .06em; color: #3A1404; background: linear-gradient(180deg, #FFE08A, #FFB627); box-shadow: 0 2px 0 #A8580A; pointer-events: none; }
.dd-cl-tag-them { top: -2%; }
.dd-cl-tag-you { bottom: -2%; background: linear-gradient(180deg, #FFF4DE, #F6D27A); }
.dd-cl-burst { position: absolute; left: 50%; top: 50%; width: 0; height: 0; pointer-events: none; }
.dd-cl-burst b { position: absolute; left: -40px; top: -40px; width: 80px; height: 80px; border-radius: 50%;
  background: radial-gradient(closest-side, rgba(255,255,255,.95), rgba(255,224,138,.6) 45%, rgba(255,182,39,0)); animation: dd-cl-flashb .42s ease-out both; }
.dd-cl-burst.is-big b { animation-duration: .6s; }
@keyframes dd-cl-flashb { from { opacity: 1; transform: scale(.3) } to { opacity: 0; transform: scale(1.8) } }
.dd-cl-burst i { position: absolute; left: -5px; top: -5px; width: 10px; height: 10px; border-radius: 50%;
  background: radial-gradient(circle at 38% 34%, #FFFFFF 0 22%, #DCE7FF 44%, #F6D27A 70%, rgba(0,0,0,0) 72%);
  animation: dd-cl-spark .62s cubic-bezier(.15,.7,.3,1) both; }
.dd-cl-burst i:nth-child(odd) { width: 7px; height: 7px; background: #FFF6D0; box-shadow: 0 0 8px 2px rgba(255,214,120,.9); }
.dd-cl-burst.is-big i { animation-duration: .8s; }
@keyframes dd-cl-spark { 0% { opacity: 1; transform: rotate(var(--a)) translateX(4px) scale(1) } 100% { opacity: 0; transform: rotate(var(--a)) translateX(calc(var(--d) * 1.6)) scale(.3) } }
.dd-cl-dhol { position: absolute; left: 0; bottom: 2%; width: 17%; pointer-events: none; opacity: .95; }
.dd-cl-buddy { position: absolute; right: -6%; top: -4%; pointer-events: none; transform-origin: 50% 90%; }
.dd-cl-buddy.is-hop { animation: dd-cl-hop .42s cubic-bezier(.3,1.6,.5,1); }
.dd-cl-buddy.is-spin { animation: dd-cl-buddyspin .7s cubic-bezier(.3,1.3,.5,1); }
@keyframes dd-cl-hop { 0% { transform: translateY(0) scale(1, 1) } 30% { transform: translateY(-14px) scale(.94, 1.08) } 100% { transform: translateY(0) scale(1) } }
@keyframes dd-cl-buddyspin { 0% { transform: rotate(0) scale(1) } 50% { transform: rotate(-200deg) scale(1.2) } 100% { transform: rotate(-360deg) scale(1) } }
.dd-cl-pop { position: absolute; left: 0; right: 0; top: 24%; display: grid; justify-items: center; pointer-events: none; text-align: center;
  font: 400 clamp(24px, 9cqw, 36px)/1 ${DD_DISPLAY}; color: #FFE08A; text-shadow: 0 2px 0 #8A0D14, 0 0 16px rgba(255,182,39,.8);
  animation: dd-cl-pop .8s cubic-bezier(.2,.9,.3,1) both; }
.dd-cl-pop small { font: 700 clamp(11px, 3.4cqw, 13px) ${FONTS.ui}; letter-spacing: .1em; text-transform: uppercase; color: #FFF7E8; text-shadow: 0 1px 4px rgba(40,2,4,.9); margin-top: 4px; }
.dd-cl-pop.is-mega { font-size: clamp(34px, 13cqw, 52px); color: #FFF1C2; }
@keyframes dd-cl-pop { 0% { opacity: 0; transform: translateY(14px) scale(.6) } 25% { opacity: 1; transform: translateY(0) scale(1.08) } 70% { opacity: 1; transform: translateY(-10px) scale(1) } 100% { opacity: 0; transform: translateY(-26px) scale(.96) } }
.dd-cl-flash { position: fixed; inset: 0; z-index: 40; pointer-events: none; background: radial-gradient(70% 60% at 50% 50%, rgba(255,214,120,.45), rgba(255,138,31,.15) 50%, rgba(0,0,0,0) 80%);
  animation: dd-cl-screen .7s ease-out both; }
@keyframes dd-cl-screen { from { opacity: 1 } to { opacity: 0 } }
.dd-meter { flex: none; display: flex; gap: clamp(4px, 1.2vw, 7px); justify-content: center; }
.dd-meter span { width: clamp(14px, 4vw, 20px); aspect-ratio: 1; border-radius: 50%; background: radial-gradient(circle at 38% 34%, #A8454A, #5C0A12);
  box-shadow: 0 0 0 2px rgba(246,210,122,.45); transition: background .2s ease, box-shadow .2s ease, transform .2s cubic-bezier(.3,1.6,.5,1); }
.dd-meter span.is-on { background: radial-gradient(circle at 38% 34%, #FFFFFF 0 18%, #FFF1C2 40%, #F6D27A 80%); box-shadow: 0 0 0 2px #F6D27A, 0 0 10px rgba(255,224,138,.9); transform: scale(1.12); }
@media (prefers-reduced-motion: reduce) { .dd-cl *, .dd-cl-flash { animation: none !important; } }
`;
