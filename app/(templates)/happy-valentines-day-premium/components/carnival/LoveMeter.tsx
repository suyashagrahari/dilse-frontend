"use client";

// Stall 2 · The love tester. She holds her thumb on the pad; the meter climbs through Crush → In love → 100% and
// keeps going to 999%, then the glass cracks, sparks and hearts spill out and the screen shows his joke.

import { useEffect, useRef, useState } from "react";
import { useHoldProgress } from "../../../_valentine/kit";
import { GIF } from "./model";
import { Gif, SlotGif, StallHead, reward, useStall } from "./ui";

const LEVELS: [number, string][] = [
  [0, "Just friends?"],
  [25, "Crush"],
  [55, "Like like"],
  [85, "In love"],
  [100, "Obsessed"],
  [400, "Off the charts"],
  [800, "Uh oh…"],
];

const pct = (p: number) => (p < 0.35 ? (p / 0.35) * 100 : 100 + Math.pow((p - 0.35) / 0.65, 1.6) * 899);

export default function LoveMeter() {
  const { c, done, isDone, sfx } = useStall();
  const [broken, setBroken] = useState(false);
  const tubeRef = useRef<HTMLDivElement>(null);
  const lastStep = useRef(0);
  const hold = useHoldProgress({
    duration: 3400,
    taps: 7,
    springBack: 0.2,
    onComplete: () => {
      setBroken(true);
      sfx("glass-ping", { gain: 0.8 });
      sfx("firework", { gain: 0.5 });
      reward(sfx, tubeRef.current, { big: true, cue: "vc-ding" });
    },
  });
  const value = broken ? 999 : pct(hold.progress);
  const fill = Math.min(1, hold.progress / 0.35);
  const over = Math.max(0, (hold.progress - 0.35) / 0.65);
  const level = [...LEVELS].reverse().find(([v]) => value >= v)?.[1] ?? LEVELS[0][1];

  // A rising tick every 10% of the hold: the visual twin is the climbing fill + the digits.
  useEffect(() => {
    const step = Math.floor(hold.progress * 10);
    if (step > lastStep.current && !broken) sfx("tick", { gain: 0.35, detune: step * 120 });
    lastStep.current = step;
  }, [hold.progress, broken, sfx]);

  useEffect(() => {
    if (!broken || isDone) return;
    const t = window.setTimeout(done, 900);
    return () => clearTimeout(t);
  }, [broken, isDone, done]);

  return (
    <section className="vc-scene vc-meterScene" aria-label="Love tester">
      <StallHead kicker="Stall 2 · Love tester" title="How much do I love you?" hint={broken ? "Okay. You broke it. We're a bit much. 💘" : "Hold the heart. Don't let go!"} />
      <div className={`vc-machine${broken ? " is-broken" : ""}${hold.holding ? " is-holding" : ""}`}>
        <div className="vc-marquee" aria-hidden>
          <b>LOVE TESTER</b>
          <span className="vc-bulbs">{Array.from({ length: 12 }, (_, i) => <i key={i} style={{ ["--i" as string]: i }} />)}</span>
        </div>
        <div className="vc-lcd" aria-live="polite">
          {broken ? <span className="vc-lcdErr">{c.meterLine}</span> : <><b>{Math.round(value)}%</b><small>{level}</small></>}
        </div>
        <div className="vc-meterBody">
          <div className="vc-scale" aria-hidden>
            <span>∞</span><span>999</span><span>100</span><span>50</span><span>0</span>
          </div>
          <div className="vc-tube" ref={tubeRef} style={{ ["--fill" as string]: fill, ["--over" as string]: over }}>
            <i className="vc-tubeFill" />
            <i className="vc-tubeGlow" />
            {broken && (
              <svg className="vc-crack" viewBox="0 0 40 200" preserveAspectRatio="none" aria-hidden>
                <path d="M20 10 L12 40 L26 62 L10 96 L24 120 L16 150" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M26 62 L34 74 M10 96 L4 104" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>
            )}
          </div>
          <div className="vc-meterSide">
            {broken ? <SlotGif id="vc3-meter" size={118} tilt={6} className="vc-popIn" /> : <Gif src={GIF.bearHeart} size={96} tilt={-5} float />}
          </div>
        </div>
        <button
          type="button"
          className={`vc-thumb${hold.holding ? " is-down" : ""}`}
          {...hold.bind}
          disabled={broken}
          aria-label="Press and hold to test our love (or tap it a few times)"
          style={{ ...hold.bind.style, ["--p" as string]: hold.progress }}
        >
          <svg viewBox="0 0 64 58" width="64" height="58" aria-hidden>
            <path d="M32 56 C 6 38, 0 26, 0 16 A 16 16 0 0 1 32 10 A 16 16 0 0 1 64 16 C 64 26, 58 38, 32 56 Z" fill="#fff" fillOpacity=".95" />
          </svg>
          <span>{broken ? "Broken 💥" : hold.holding ? "Keep holding…" : "Hold here"}</span>
        </button>
      </div>
    </section>
  );
}

