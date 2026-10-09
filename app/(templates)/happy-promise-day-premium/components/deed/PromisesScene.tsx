"use client";

// Chapter II · The promises. A sheet in the typewriter's platen; above it,
// one of their photos clipped to the deed. Press the big round key and the
// next clause types itself in, clack by clack, the bell rings at the end of
// the line, and the carriage returns for the next one. Pressing while it
// types finishes the line (it's never a wait).

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { CinematicPhoto, PremiumCTA, TiltCard, sfx } from "../../../_valentine/kit/premium";
import { roman, type Deed } from "./model";
import { CTA_STYLE, Eyebrow, Scene } from "./ui";

export default function PromisesScene({ d, sticker, onNext }: { d: Deed; sticker: ReactNode; onNext: () => void }) {
  const reduce = useReducedMotion();
  const total = d.promises.length;
  const [i, setI] = useState(0);
  const [n, setN] = useState(0); // characters typed of clause i
  const [feeding, setFeeding] = useState(false);
  const [started, setStarted] = useState(false);
  const timer = useRef(0);
  const text = d.promises[i] ?? "";
  const typing = started && n < text.length;
  const lineDone = started && n >= text.length;
  const allDone = lineDone && i === total - 1;

  // The typing loop: one character per tick, a key sound per character.
  useEffect(() => {
    if (!started || n >= text.length) return;
    const ch = text[n];
    const wait = reduce ? 8 : ch === " " ? 70 : /[,.;!?]/.test(ch) ? 150 : 46 + Math.random() * 38;
    timer.current = window.setTimeout(() => {
      if (!reduce) sfx(ch === " " ? "sp-space" : "sp-key", { gain: ch === " " ? 0.5 : 0.62, detune: (Math.random() - 0.5) * 260, pan: (n / Math.max(1, text.length) - 0.5) * 0.5 });
      setN((v) => v + 1);
      if (n + 1 >= text.length) {
        sfx("sp-ding", { gain: 0.8, at: 0.08 });
        haptic(8);
      }
    }, wait);
    return () => window.clearTimeout(timer.current);
  }, [started, n, text, reduce]);

  // First clause starts on its own, so the page shows what the key does.
  useEffect(() => {
    const t = window.setTimeout(() => setStarted(true), reduce ? 200 : 900);
    return () => window.clearTimeout(t);
  }, [reduce]);

  const press = useCallback(() => {
    haptic(12);
    if (!started) {
      setStarted(true);
      return;
    }
    if (typing) {
      window.clearTimeout(timer.current);
      setN(text.length);
      sfx("sp-key", { gain: 0.7 });
      sfx("sp-ding", { gain: 0.8, at: 0.06 });
      return;
    }
    if (feeding) return;
    if (i >= total - 1) {
      onNext();
      return;
    }
    // Carriage return: the sheet feeds up and away, the next clause types.
    sfx("sp-return", { gain: 0.9 });
    setFeeding(true);
    window.setTimeout(
      () => {
        setI((v) => v + 1);
        setN(0);
        setFeeding(false);
      },
      reduce ? 120 : 520,
    );
  }, [started, typing, text.length, feeding, i, total, onNext, reduce]);

  const photo = d.clausePhotos[i];
  const keyLabel = typing ? "Finish" : allDone ? "Typed" : lineDone ? "Next" : "Type";

  return (
    <Scene label="The promises" className="sp-pr">
      <Eyebrow>
        Clause {roman(i + 1)} <span className="sp-prOf">of {roman(total)}</span>
      </Eyebrow>
      <div className="sp-prGrid">
        <div className="sp-prPhoto">
          {photo && (
            <div key={`ph-${i}`} className={`sp-prPrint${feeding ? " is-out" : ""}`} style={{ ["--r" as string]: `${i % 2 ? 3 : -3}deg` }}>
              <TiltCard radius={2} max={8} glare={0.28} shadow={false}>
                <div className="sp-prMat">
                  <CinematicPhoto photo={photo} grade="warm" kenBurns="in" drift={16} caption="" aspect="4 / 5" eager />
                  {photo.caption && <p className="sp-prCap">{photo.caption}</p>}
                </div>
              </TiltCard>
              <span className="sp-prClip" aria-hidden />
            </div>
          )}
        </div>
        <div className="sp-prDesk">
          <div className="sp-prWindow">
            <div key={`sh-${i}`} className={`sp-prSheet sp-paper${feeding ? " is-feed" : ""}`}>
              <p className="sp-prNo">§ {roman(i + 1)}.</p>
              <p className="sp-prText sp-typed" aria-live="polite">
                <span className="sr-only">{text}</span>
                <span aria-hidden>
                  {text.slice(0, started ? n : 0)}
                  {!lineDone && <i className="sp-caret" />}
                </span>
                <span className="sp-prGhost" aria-hidden>
                  {text.slice(started ? n : 0)}
                </span>
              </p>
            </div>
          </div>
          <div className="sp-platen" aria-hidden />
          <div className="sp-prKeyRow" hidden={allDone}>
            <button type="button" className={`sp-key${typing ? " is-typing" : ""}`} onClick={press} aria-label={allDone ? "Continue" : typing ? "Finish typing this clause" : "Type the next clause"}>
              <span className="sp-keyCap">{keyLabel}</span>
            </button>
            {sticker && <div className="sp-prSticker">{sticker}</div>}
          </div>
          <div className="sp-prDots" aria-hidden hidden={allDone}>
            {d.promises.map((_, k) => (
              <span key={k} className={k < i || (k === i && lineDone) ? "is-on" : k === i ? "is-now" : ""} />
            ))}
          </div>
        </div>
      </div>
      <div className="sp-foot">
        {allDone && (
          <PremiumCTA style={CTA_STYLE} tone="pearl" cue="page-turn" onClick={onNext}>
            Every clause, typed
          </PremiumCTA>
        )}
      </div>
      <style>{CSS}</style>
    </Scene>
  );
}

const CSS = `
.sp-pr .sp-in { gap: 14px; }
.sp-pr .sp-foot { margin-top: 18px; padding-top: 0; }
.sp-prOf { opacity: .6; }
.sp-prGrid { width: 100%; display: grid; justify-items: center; gap: 4px; }
.sp-prPhoto { width: min(60vw, 280px); aspect-ratio: 4 / 5.1; position: relative; margin-top: 18px; }
@media (max-height: 740px) { .sp-prPhoto { width: min(50vw, 230px); } }
.sp-prPrint { position: absolute; inset: 0; transform: rotate(var(--r)); animation: sp-printIn .9s var(--sp-ease) both; transition: transform .5s cubic-bezier(.65,0,.35,1), opacity .45s ease; }
.sp-prPrint.is-out { transform: translate(-30px, -60px) rotate(calc(var(--r) * -3)); opacity: 0; }
@keyframes sp-printIn { from { opacity: 0; transform: translateY(26px) rotate(calc(var(--r) * 2)) scale(.96); } to { opacity: 1; transform: rotate(var(--r)); } }
.sp-prMat { background: #fbf8f1; padding: 8px 8px 30px; box-shadow: 0 30px 50px -22px rgba(0,0,0,.9); position: relative; }
.sp-prCap { position: absolute; left: 8px; right: 8px; bottom: 8px; margin: 0; font: italic 400 14px/1 var(--sp-serif); color: var(--sp-navy); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sp-prClip { position: absolute; right: 18%; top: -16px; width: 13px; height: 44px; border: 2px solid #b9bec5; border-radius: 7px; box-shadow: 0 2px 2px rgba(0,0,0,.4); }
.sp-prClip::after { content: ""; position: absolute; left: 2px; right: 2px; top: 6px; bottom: -6px; border: 2px solid #d6dade; border-radius: 5px; }
.sp-prDesk { width: min(370px, calc(100vw - 40px)); display: grid; justify-items: center; margin-top: 10px; }
.sp-prWindow { width: 92%; height: clamp(116px, 17svh, 150px); overflow: hidden; position: relative; display: grid; align-items: end;
  -webkit-mask-image: linear-gradient(180deg, transparent 0, #000 26%); mask-image: linear-gradient(180deg, transparent 0, #000 26%); }
.sp-prSheet { box-sizing: border-box; min-height: 100%; padding: 16px 20px 18px; text-align: left; border-radius: 2px 2px 0 0; animation: sp-feedIn .55s var(--sp-ease) both; transition: transform .5s cubic-bezier(.65,0,.35,1); }
.sp-prSheet.is-feed { transform: translateY(-110%); }
@keyframes sp-feedIn { from { transform: translateY(40%); } to { transform: none; } }
.sp-prNo { margin: 0 0 6px; font: 600 13px/1 var(--sp-serif); font-variant: small-caps; letter-spacing: .14em; color: var(--sp-ox); }
.sp-prText { margin: 0; font-size: clamp(17px, 4.9vw, 21px); line-height: 1.4; position: relative; }
.sp-prGhost { opacity: 0; }
.sp-platen { width: 100%; height: 22px; border-radius: 11px; position: relative; z-index: 2;
  background: linear-gradient(180deg, #4a4542 0%, #1a1715 30%, #0a0908 62%, #2a2523 100%);
  box-shadow: 0 10px 20px -8px rgba(0,0,0,.9), inset 0 1px 0 rgba(255,255,255,.18); }
.sp-platen::before, .sp-platen::after { content: ""; position: absolute; top: -3px; width: 26px; height: 28px; border-radius: 6px;
  background: linear-gradient(90deg, #8d939b, #eef1f4 40%, #9aa0a8 70%, #5d6269); }
.sp-platen::before { left: -10px; } .sp-platen::after { right: -10px; }
.sp-prKeyRow[hidden] { display: none; }
.sp-prKeyRow { position: relative; display: grid; place-items: center; margin-top: 22px; }
.sp-key { all: unset; cursor: pointer; width: 86px; height: 86px; border-radius: 50%; position: relative; display: grid; place-items: center; -webkit-tap-highlight-color: transparent;
  background: radial-gradient(circle at 50% 35%, #3b3634 0%, #151211 60%, #070606 100%);
  box-shadow: 0 0 0 5px #c9ced6, 0 0 0 6px #5d6269, 0 14px 22px -6px rgba(0,0,0,.9), inset 0 2px 1px rgba(255,255,255,.25), inset 0 -6px 12px rgba(0,0,0,.6);
  transition: transform .12s ease, box-shadow .12s ease; }
.sp-key::before { content: ""; position: absolute; inset: 10px 18px auto; height: 22px; border-radius: 50%; background: linear-gradient(180deg, rgba(255,255,255,.22), rgba(255,255,255,0)); }
.sp-key:active { transform: translateY(3px) scale(.98); box-shadow: 0 0 0 5px #c9ced6, 0 0 0 6px #5d6269, 0 6px 10px -4px rgba(0,0,0,.9), inset 0 2px 1px rgba(255,255,255,.2), inset 0 -3px 8px rgba(0,0,0,.6); }
.sp-key:focus-visible { outline: 3px solid var(--sp-gold); outline-offset: 8px; }
.sp-keyCap { font: 700 12px/1 var(--sp-type); letter-spacing: .18em; text-transform: uppercase; color: #f3ead8; }
.sp-key.is-typing .sp-keyCap { opacity: .75; }
.sp-prSticker { position: absolute; left: calc(100% + 26px); top: 50%; transform: translateY(-50%); }
.sp-prDots { display: flex; gap: 6px; margin-top: 18px; }
.sp-prDots span { width: 6px; height: 6px; border-radius: 50%; background: rgba(245,239,226,.22); transition: background .3s ease, transform .3s ease; }
.sp-prDots .is-now { background: rgba(245,239,226,.55); transform: scale(1.2); }
.sp-prDots .is-on { background: var(--sp-gold); }
@media (min-width: 1024px) {
  .sp-prGrid { grid-template-columns: 1fr 1fr; align-items: center; column-gap: 72px; min-height: calc(100svh - 220px); }
  .sp-prPhoto { width: min(30vw, 400px); justify-self: end; }
  .sp-prDesk { justify-self: start; width: 420px; }
}
@media (prefers-reduced-motion: reduce) { .sp-prPrint, .sp-prSheet { animation: sp-fade .3s ease both; } }
`;
