"use client";

// Scenes 0–2: the gate chat, the rooftop establishing shot and the candle path.
//
// Gate: the sender's nervous texts arrive in a phone (typing… then a message pop, silently — nothing is audible
// before the tap), and "Reply 👀" is the PremiumGate tap that starts the song. Rooftop: a letterboxed 2.4 s
// establishing shot, "For {name}." Candles: strike the match (swipe the striker — a bonus), then tap each
// candle; it catches ("match-strike", "sky-candle"), its reason rises in handwriting, and the whole rooftop
// warms a little more with every flame.

import { useEffect, useRef, useState, type PointerEvent as RPointerEvent, type ReactNode } from "react";
import { SkipChip, usePremium } from "../../../_valentine/kit/premium";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { Candle } from "./art";
import { Phone } from "./world";
import { SKIP_TOP } from "./styles";
import type { Sky } from "./util";

export function GateChat({ sky, sticker }: { sky: Sky; sticker: ReactNode }) {
  // each message: typing for 0.9 s, then the bubble; a longer text holds a little longer before the next
  const starts = sky.texts.reduce<number[]>((acc, m, i) => [...acc, i === 0 ? 0.5 : acc[i - 1] + 0.9 + Math.min(1.4, sky.texts[i - 1].length * 0.025)], []);
  const end = starts.length ? starts[starts.length - 1] + 0.9 + Math.min(1.4, sky.texts[sky.texts.length - 1].length * 0.025) : 0.5;
  return (
    <div className="sk-gateWrap">
      <Phone from={sky.from}>
        {sky.texts.map((m, i) => {
          const td = starts[i];
          return (
            <div key={i} className="sk-slot" style={{ ["--td" as string]: `${td}s`, ["--bd" as string]: `${td + 0.9}s` }}>
              <span className="sk-typing" aria-hidden><i /><i /><i /></span>
              <span className="sk-bub">{m}</span>
            </div>
          );
        })}
        <div className="sk-stk" style={{ ["--bd" as string]: `${end + 0.2}s` }}>{sticker}</div>
      </Phone>
    </div>
  );
}

export function Establishing({ to, onDone }: { to: string; onDone: () => void }) {
  const reduce = useReducedMotion();
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });
  useEffect(() => {
    const id = window.setTimeout(() => done.current(), reduce ? 1600 : 2600);
    return () => window.clearTimeout(id);
  }, [reduce]);
  return (
    <section className="sk-scene" style={{ justifyContent: "center", paddingBottom: "40vh" }} onClick={onDone} aria-label="The rooftop">
      <p className="sk-kick sk-in">Tonight · the rooftop</p>
      <h1 className="sk-h sk-in" style={{ animationDelay: ".3s" }}>For {to}.</h1>
    </section>
  );
}

export function Candles({ sky, sticker, onWarm, onDone }: { sky: Sky; sticker: ReactNode; onWarm: (w: number) => void; onDone: () => void }) {
  const { sfx } = usePremium();
  const n = sky.reasons.length;
  const [lit, setLit] = useState<boolean[]>(() => Array(n).fill(false));
  const [last, setLast] = useState<number | null>(null);
  const [match, setMatch] = useState(false);
  const strike = useRef<{ x: number } | null>(null);
  const count = lit.filter(Boolean).length;
  const all = count === n;

  useEffect(() => {
    onWarm(count / n);
  }, [count, n, onWarm]);

  const light = (k: number) => {
    if (lit[k]) return;
    if (!match) sfx("match-strike", { gain: 0.6 });
    sfx("sky-candle", { detune: k * 60 });
    haptic(8);
    setLit((l) => l.map((v, i) => (i === k ? true : v)));
    setLast(k);
  };

  const sDown = (e: RPointerEvent<HTMLDivElement>) => {
    if (match) return;
    strike.current = { x: e.clientX };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* fine */
    }
  };
  const sMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (!strike.current || match) return;
    if (Math.abs(e.clientX - strike.current.x) > 36) {
      strike.current = null;
      setMatch(true);
      sfx("match-strike");
      sfx("flame-whoosh", { at: 0.12, gain: 0.6 });
      haptic(12);
    }
  };

  return (
    <section className="sk-scene" aria-label="The candle path">
      <p className="sk-kick">The candle path</p>
      <h2 className="sk-h" style={{ fontSize: "clamp(28px, 7.4vw, 44px)" }}>{all ? "Every reason, lit." : "Light them, one by one."}</h2>
      <div className="sk-reason" aria-live="polite">
        {last !== null ? (
          <div key={last} className="sk-in">
            <span className="sk-count">{count} / {n}</span>
            <p>{sky.reasons[last]}</p>
          </div>
        ) : (
          <p className="sk-hint" style={{ maxWidth: "28ch" }}>{match ? "Now touch each candle." : "Swipe the matchbox to strike a match — or just tap a candle."}</p>
        )}
      </div>
      {all && (
        <div className="sk-in" style={{ display: "grid", justifyItems: "center", gap: 10 }}>
          {sticker}
          <button type="button" className="sk-btn" onClick={onDone}>Walk to the edge ▸</button>
        </div>
      )}

      <div className="sk-candles">
        {sky.reasons.map((r, k) => (
          <button key={k} type="button" className={`sk-cbtn${lit[k] ? " is-lit" : ""}`} onClick={() => light(k)} aria-label={lit[k] ? r : `Light candle ${k + 1}`} aria-pressed={lit[k]}>
            <Candle lit={lit[k]} h={0.8 + ((k * 37) % 5) * 0.12} />
          </button>
        ))}
        <div className={`sk-match${match ? " is-lit" : ""}`} onPointerDown={sDown} onPointerMove={sMove} onPointerUp={() => (strike.current = null)} role="button" tabIndex={0}
          aria-label={match ? "The match is lit" : "Strike a match"} onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && !match) { setMatch(true); sfx("match-strike"); } }}>
          {match ? "🔥 lit" : "strike →"}
          <span className="sk-spark" />
        </div>
      </div>
      {!all && <SkipChip onSkip={() => { setLit(Array(n).fill(true)); setLast(n - 1); }} label="Light them all ▸" delay={2500} style={SKIP_TOP} />}
    </section>
  );
}
