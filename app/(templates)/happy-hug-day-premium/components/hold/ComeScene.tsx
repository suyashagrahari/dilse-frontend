"use client";

// Chapter 1: "Come here." One word per screen, then their name. Each word lands with a felt thump and a pulse of
// warm light behind it (its visual twin); a tap brings the next word sooner. It moves on by itself.

import { useEffect, useRef, useState } from "react";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { sfx } from "../../../_valentine/kit/premium";
import type { Hug } from "./model";

export default function ComeScene({ h, onNext }: { h: Hug; onNext: () => void }) {
  const reduce = useReducedMotion();
  const beats = [...h.words, `${h.to}.`];
  const [i, setI] = useState(0);
  const timer = useRef<number | null>(null);
  const onNextRef = useRef(onNext);
  useEffect(() => {
    onNextRef.current = onNext;
  });
  const last = i === beats.length - 1;

  useEffect(() => {
    sfx("hh-word", { gain: last ? 0.85 : 0.65, detune: last ? -200 : i * 60 });
    haptic(last ? [14, 60, 10] : 10);
    timer.current = window.setTimeout(() => (last ? onNextRef.current() : setI((n) => n + 1)), last ? 2200 : reduce ? 1300 : 1050);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [i, last, reduce]);

  const advance = () => (last ? onNext() : setI((n) => n + 1));

  return (
    <section className="hh-scene hh-come" aria-label={beats.join(" ")} onClick={advance}>
      <span key={`g${i}`} className="hh-comeGlow" aria-hidden />
      <p key={i} className={`hh-comeWord${last ? " is-name" : ""}`} aria-live="polite">
        {beats[i]}
      </p>
      <button type="button" className="hh-quiet hh-comeNext" onClick={(e) => { e.stopPropagation(); advance(); }}>
        {last ? "Continue" : "Next"}
      </button>
      <style>{CSS}</style>
    </section>
  );
}

const CSS = `
.hh-come { display: grid; place-items: center; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.hh-comeWord { position: relative; z-index: 1; margin: 0; padding: 0 20px; font: 400 clamp(84px, 30vw, 220px)/.9 var(--hh-display); letter-spacing: -.035em; color: var(--hh-cloud);
  text-align: center; overflow-wrap: anywhere; animation: hh-word 1s var(--hh-ease) both; }
.hh-comeWord.is-name { font-style: italic; color: var(--hh-apricot); font-size: clamp(72px, 24vw, 200px); text-shadow: 0 0 60px rgba(242,164,119,.35); }
.hh-comeGlow { position: absolute; left: 50%; top: 50%; width: min(120vw, 900px); aspect-ratio: 1; margin: calc(min(120vw, 900px) / -2) 0 0 calc(min(120vw, 900px) / -2); border-radius: 50%;
  background: radial-gradient(circle, rgba(242,164,119,.22) 0%, rgba(242,164,119,.06) 40%, transparent 65%); animation: hh-pulse 1.2s var(--hh-ease) both; pointer-events: none; }
.hh-comeNext { position: absolute; left: 50%; bottom: calc(24px + env(safe-area-inset-bottom, 0px)); transform: translateX(-50%); opacity: .55; }
@keyframes hh-word { from { opacity: 0; transform: scale(1.12); filter: blur(14px); } 55% { filter: blur(0); } to { opacity: 1; transform: none; filter: blur(0); } }
@keyframes hh-pulse { from { opacity: 0; transform: scale(.6); } 30% { opacity: 1; } to { opacity: .5; transform: scale(1); } }
@media (prefers-reduced-motion: reduce) { .hh-comeWord { animation: hh-fade .4s ease both; } .hh-comeGlow { animation: none; opacity: .5; } }
`;
