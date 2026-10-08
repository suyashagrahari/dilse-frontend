"use client";

// Room 5 — The spirit radio. An antique valve set with a big tuning knob and
// a green magic-eye tube. Turn the knob (drag around it, or ◀ ▶): static
// hisses louder the further you are, ghost whispers drift by as you get
// close, and at "{sender}'s frequency" the eye glows full, the static cuts
// out with a tick, and their real voice plays (the song ducks; on iPhone it
// pauses and resumes). No voice note → a typed transmission with a Morse tick.

import { useEffect, useRef, useState } from "react";
import { sfx, usePremium, VoiceNotePlayer } from "../../../_valentine/kit/premium";
import { Typewriter, haptic, useReducedMotion } from "../../../_valentine/kit";
import { RadioCabinet } from "./art";
import { BOOK, ENGRAVED } from "./fonts";
import type { Manor } from "./model";
import { Gilded, Hint, Kicker, Quiet, Room, RoomTitle } from "./ui";

const TARGET = 0.72;

export default function Radio({ m, onNext }: { m: Manor; onNext: () => void }) {
  const p = usePremium();
  const reduce = useReducedMotion();
  const [tune, setTune] = useState(0.18);
  const [locked, setLocked] = useState(false);
  const knob = useRef<HTMLDivElement>(null);
  const drag = useRef<{ a: number } | null>(null);
  const lastStatic = useRef(0);
  const lastWhisper = useRef(0);
  const close = Math.max(0, 1 - Math.abs(tune - TARGET) / 0.3);
  const freq = (88 + tune * 20).toFixed(1);

  const setT = (v: number) => {
    if (locked) return;
    const t = Math.max(0, Math.min(1, v));
    setTune(t);
    const now = performance.now();
    const c = Math.max(0, 1 - Math.abs(t - TARGET) / 0.3);
    if (now - lastStatic.current > 170) {
      lastStatic.current = now;
      sfx("static", { dur: 0.22, gain: 0.25 + (1 - c) * 0.65, detune: (t - 0.5) * 1400 });
    }
    if (c > 0.45 && c < 0.85 && now - lastWhisper.current > 1400) {
      lastWhisper.current = now;
      sfx("mm-whisper", { gain: 0.5 });
    }
    if (Math.abs(t - TARGET) < 0.022) lock();
  };

  const lock = () => {
    if (locked) return;
    setLocked(true);
    setTune(TARGET);
    haptic([20, 40, 20]);
    sfx("tick", { gain: 1 });
    sfx("tick", { at: 0.12, detune: 300 });
  };

  const angle = (e: { clientX: number; clientY: number }) => {
    const r = knob.current?.getBoundingClientRect();
    if (!r) return 0;
    return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2));
  };
  const onDown = (e: React.PointerEvent) => {
    if (locked) return;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    drag.current = { a: angle(e) };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const a = angle(e);
    let da = a - d.a;
    if (da > Math.PI) da -= 2 * Math.PI;
    if (da < -Math.PI) da += 2 * Math.PI;
    d.a = a;
    setT(tune + da / (Math.PI * 2.4));
  };
  const onUp = () => {
    drag.current = null;
  };

  // Keyboard on the knob: arrows tune.
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      setT(tune + 0.04);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      setT(tune - 0.04);
    }
  };

  const caption = p.premium.voiceCaption || `…${m.sender} here. If you can hear this, look at the moon. I'm looking at the same one.`;
  const hasVoice = !!p.premium.voiceNote && !!p.voice;
  const [typed, setTyped] = useState(false);
  useEffect(() => {
    if (!locked || hasVoice) return;
    sfx("tick", { at: 0.3 });
    sfx("tick", { at: 0.45 });
    sfx("tick", { at: 0.85, detune: 200 });
  }, [locked, hasVoice]);

  return (
    <Room label="The spirit radio" className="mm-radio">
      <Kicker>The study</Kicker>
      <RoomTitle>{locked ? m.T.radio(m.sender) : "Tune the spirit radio"}</RoomTitle>

      <div className={`mm-set${locked ? " is-locked" : ""}`}>
        <RadioCabinet needle={tune} eye={locked ? 1 : close * 0.8} />
        <span className="mm-snow" aria-hidden style={{ opacity: locked ? 0 : 0.15 + (1 - close) * 0.6 }} />
        <span className="mm-freq" style={{ fontFamily: ENGRAVED }}>{locked ? `${m.sender}'s frequency` : `${freq} · · ·`}</span>
      </div>

      {!locked ? (
        <>
          <div className="mm-tuneRow">
            <button type="button" className="mm-step" onClick={() => setT(tune - 0.05)} aria-label="Tune left">◀</button>
            <div
              ref={knob}
              className="mm-knob"
              role="slider"
              tabIndex={0}
              aria-label="Tuning knob"
              aria-valuemin={88}
              aria-valuemax={108}
              aria-valuenow={Number(freq)}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              onKeyDown={onKey}
              style={{ transform: `rotate(${tune * 300 - 150}deg)` }}
            >
              <i />
            </div>
            <button type="button" className="mm-step" onClick={() => setT(tune + 0.05)} aria-label="Tune right">▶</button>
          </div>
          <Hint>{close > 0.6 ? "Closer… someone's there" : "Turn the knob until the eye glows"}</Hint>
          <Quiet onClick={lock}>Find their frequency</Quiet>
        </>
      ) : (
        <>
          <VoiceNotePlayer
            label={m.T.radio(m.sender)}
            accent="#2FB596"
            track="rgba(241,238,251,.7)"
            className="mm-voice"
            fallback={
              <figure className="mm-trans">
                <figcaption style={{ fontFamily: ENGRAVED }}>Transmission received</figcaption>
                <Typewriter text={`“${caption}”`} speed={reduce ? 0 : 38} onDone={() => setTyped(true)} style={{ font: `italic 400 20px/1.45 ${BOOK}`, color: "#EAFFF8", textAlign: "left" }} />
              </figure>
            }
          />
          <Gilded big onClick={() => { sfx("paper-rustle", { gain: 0.6 }); onNext(); }} style={{ opacity: hasVoice || typed ? 1 : 0.85 }}>
            Up to the attic →
          </Gilded>
        </>
      )}
      <style>{CSS}</style>
    </Room>
  );
}

const SNOW =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.4' numOctaves='1' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

const CSS = `
.mm-radio { gap: 12px; }
.mm-set { position: relative; width: min(84vw, 330px); aspect-ratio: 320 / 250; filter: drop-shadow(0 24px 40px rgba(0,0,0,.6)); }
.mm-set.is-locked { filter: drop-shadow(0 0 40px rgba(127,245,216,.35)) drop-shadow(0 24px 40px rgba(0,0,0,.6)); }
.mm-snow { position: absolute; left: 19.5%; right: 19.5%; top: 21%; height: 35%; border-radius: 40% 40% 4px 4px; background-image: ${SNOW}; mix-blend-mode: screen;
  transition: opacity .3s; animation: mm-snow .25s steps(3) infinite; pointer-events: none; }
@keyframes mm-snow { 0% { background-position: 0 0; } 33% { background-position: -40px 20px; } 66% { background-position: 30px -30px; } }
.mm-freq { position: absolute; left: 0; right: 0; bottom: -30px; font-size: 12px; letter-spacing: .2em; text-transform: uppercase; color: #7FF5D8; text-shadow: 0 0 10px rgba(127,245,216,.6); }
.mm-tuneRow { display: flex; align-items: center; gap: 18px; margin-top: 26px; }
.mm-step { width: 48px; height: 48px; border-radius: 50%; border: 1px solid rgba(220,227,242,.3); background: rgba(11,10,20,.5); color: var(--vw-ink); font-size: 16px; cursor: pointer; }
.mm-step:focus-visible, .mm-knob:focus-visible { outline: 3px solid var(--vw-gold); outline-offset: 3px; }
.mm-knob { position: relative; width: 96px; height: 96px; border-radius: 50%; touch-action: none; cursor: grab;
  background: conic-gradient(from 0deg, #5A3A22, #8E6238, #4A2A16, #7A5230, #5A3A22); box-shadow: inset 0 0 0 6px rgba(0,0,0,.25), 0 10px 20px rgba(0,0,0,.55), 0 0 0 4px #C99A5B; }
.mm-knob i { position: absolute; left: 50%; top: 8px; width: 6px; height: 22px; margin-left: -3px; border-radius: 3px; background: #F4D58D; box-shadow: 0 0 6px rgba(255,200,107,.7); }
.mm-voice { background: rgba(14,40,34,.55) !important; border-color: rgba(127,245,216,.35) !important; color: #F1EEFB !important; margin-top: 18px; }
.mm-trans { margin: 18px 0 0; width: min(100%, 440px); padding: 16px 18px; border-radius: 16px; box-sizing: border-box; display: grid; gap: 8px;
  background: rgba(14,40,34,.6); border: 1px solid rgba(127,245,216,.35); box-shadow: 0 0 40px rgba(127,245,216,.12) inset; }
.mm-trans figcaption { font-size: 11px; letter-spacing: .24em; text-transform: uppercase; color: #7FF5D8; text-align: left; }
@media (prefers-reduced-motion: reduce) { .mm-snow { animation: none; } }
`;
