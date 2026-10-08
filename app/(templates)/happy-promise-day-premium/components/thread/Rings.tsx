"use client";

// ─── Mini-game 1: thread the rings ───────────────────────────────────────────
// Draw with a finger: a gold thread follows; every ring it passes through spins,
// chimes the next note of a rising scale and unfurls one promise as a ribbon.
// Tap a ring as a fallback.

import { useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { haptic } from "../../../_valentine/kit";
import { SkipChip } from "../../../_valentine/kit/premium";
import type { SceneProps } from "./shared";

const SPOTS: [number, number][] = [[22, 22], [72, 30], [36, 52], [78, 62], [24, 82], [64, 86]];
const NOTES = [0, 400, 700, 1200, 1600, 1900];

export default function Rings({ promises, color, sfx, sticker, next }: SceneProps) {
  const n = promises.length;
  const [got, setGot] = useState<number[]>([]);
  const [trail, setTrail] = useState<[number, number][]>([]);
  const field = useRef<HTMLDivElement>(null);
  const drawing = useRef(false);
  const gotRef = useRef<number[]>([]);

  const thread = (i: number) => {
    if (gotRef.current.includes(i)) return;
    gotRef.current = [...gotRef.current, i];
    setGot(gotRef.current);
    const k = gotRef.current.length - 1;
    sfx("tp-ring", { detune: NOTES[k] ?? 1900 });
    sfx("tp-ribbon", { at: 0.15 });
    haptic(10);
  };
  const point = (e: RPointerEvent<HTMLDivElement>) => {
    const r = field.current?.getBoundingClientRect();
    if (!r) return;
    const px = ((e.clientX - r.left) / r.width) * 100, py = ((e.clientY - r.top) / r.height) * 100;
    setTrail((t) => [...t.slice(-46), [px, py]]);
    SPOTS.slice(0, n).forEach(([sx, sy], i) => {
      const dx = ((px - sx) / 100) * r.width, dy = ((py - sy) / 100) * r.height;
      if (Math.hypot(dx, dy) < 38) thread(i);
    });
  };
  const all = got.length >= n;

  return (
    <section className="tp-sec">
      <header className="tp-head">
        <p className="tp-kick">Thread the rings · {got.length}/{n}</p>
        <h2 className="tp-h">{all ? "Every promise, threaded" : "Draw the thread through every ring"}</h2>
        <p className="tp-sub">{all ? "" : "Each ring holds one promise."}</p>
      </header>
      <div
        ref={field}
        className="tp-field"
        onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); drawing.current = true; setTrail([]); point(e); }}
        onPointerMove={(e) => drawing.current && point(e)}
        onPointerUp={() => (drawing.current = false)}
        onPointerCancel={() => (drawing.current = false)}
        style={{ touchAction: "none" }}
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="tp-trail" aria-hidden>
          {trail.length > 1 && <polyline points={trail.map((p) => p.join(",")).join(" ")} fill="none" stroke="#F2C14E" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 3 }} strokeLinecap="round" strokeLinejoin="round" />}
        </svg>
        {promises.map((_, i) => {
          const [sx, sy] = SPOTS[i];
          const on = got.includes(i);
          return (
            <button
              key={i}
              type="button"
              className={`tp-ring${on ? " is-on" : ""}`}
              style={{ left: `${sx}%`, top: `${sy}%`, ["--d" as string]: `${0.75 + (i % 3) * 0.15}`, ["--tc" as string]: color }}
              onClick={() => thread(i)}
              aria-label={`Ring ${i + 1}${on ? `: ${promises[i]}` : ""}`}
            >
              <span />
            </button>
          );
        })}
      </div>
      <ol className="tp-ribbons" aria-live="polite">
        {got.map((i) => (
          <li key={i} className="tp-ribbon">
            <span aria-hidden>✦</span> {promises[i]}
          </li>
        ))}
      </ol>
      <div className="tp-actions">
        {all ? (
          <>
            <span className="tp-stick">{sticker("pp4-rings", 60)}</span>
            <button type="button" className="tp-btn" onClick={next}>
              Read the vow →
            </button>
          </>
        ) : (
          <button type="button" className="tp-btn is-ghost" onClick={() => promises.forEach((_, i) => window.setTimeout(() => thread(i), i * 260))}>
            Thread them all
          </button>
        )}
      </div>
      {!all && <SkipChip onSkip={() => promises.forEach((_, i) => thread(i))} delay={3000} />}
    </section>
  );
}
