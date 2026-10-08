"use client";

// The persistent world of "Look Up": the night sky (moon + twinkle), the city skyline in three depths (pure CSS,
// windows are masked gradients, so a thousand windows cost nothing) with up to six MEMORY windows you can switch
// on, the rooftop in the foreground (parapet, fairy lights, a sheer canopy), and the phone chat.

import { useMemo, type CSSProperties, type ReactNode } from "react";
import { seeded } from "./util";

type B = { w: number; h: number; wa: number; tone: number; ant?: boolean };

function buildings(r: () => number, n: number, hMin: number, hMax: number): B[] {
  const ws = Array.from({ length: n }, () => 0.6 + r());
  const sum = ws.reduce((a, b) => a + b, 0);
  return ws.map((w) => ({ w: (w / sum) * 100, h: hMin + r() * (hMax - hMin), wa: 0.15 + r() * 0.5, tone: r(), ant: r() > 0.8 }));
}

export interface MemWindow {
  id: number;
  lit: boolean;
  label: string;
  onTap: () => void;
}

export function Skyline({ seed, tilt, wave, windows, hint }: { seed: string; tilt: number; wave: boolean; windows?: MemWindow[]; hint?: boolean }) {
  const { far, mid, near } = useMemo(() => {
    const r = seeded(seed);
    return { far: buildings(r, 16, 24, 46), mid: buildings(r, 12, 30, 62), near: buildings(r, 7, 40, 82) };
  }, [seed]);
  const mem = windows ?? [];
  // memory windows live in the near buildings 1..6
  const slots = near.map((_, i) => mem[i - 1]).map((m, i) => (i === 0 ? undefined : m));
  const lefts = near.reduce<number[]>((acc, b, i) => [...acc, i === 0 ? 0 : acc[i - 1] + near[i - 1].w], []);
  return (
    <div className={`sk-city${wave ? " is-wave" : ""}`} style={{ transform: `translate3d(0, ${tilt}vh, 0)` }}>
      {[far, mid].map((row, li) => (
        <div key={li} className={`sk-row ${li === 0 ? "is-far" : "is-mid"}`} aria-hidden>
          {row.map((b, i) => (
            <span key={i} className="sk-b" style={{ width: `${b.w}%`, height: `${b.h}%`, ["--wa" as string]: b.wa, ["--wd" as string]: `${(i / row.length) * 1.4 + li * 0.2}s` } as CSSProperties}>
              {b.ant && <i className="sk-ant" />}
            </span>
          ))}
        </div>
      ))}
      <div className="sk-row is-near">
        {near.map((b, i) => {
          const m = slots[i];
          const left = lefts[i];
          return (
            <span key={i} className="sk-b" style={{ width: `${b.w}%`, height: `${b.h}%`, ["--wa" as string]: b.wa * 0.8, ["--wd" as string]: `${(left / 100) * 1.4 + 0.4}s` } as CSSProperties}>
              {m && (
                <button
                  type="button"
                  className={`sk-mem${m.lit ? " is-lit" : ""}${hint && !m.lit ? " is-hint" : ""}`}
                  onClick={m.onTap}
                  aria-label={m.lit ? `Memory: ${m.label}` : `Switch on window ${m.id + 1}`}
                >
                  <i />
                </button>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function NightSky({ seed, show }: { seed: string; show?: boolean }) {
  const stars = useMemo(() => {
    const r = seeded(seed + "*");
    return Array.from({ length: 46 }, () => ({ x: r() * 100, y: r() * 52, s: 1 + r() * 1.6, k: r() < 0.5 }));
  }, [seed]);
  return (
    <div className={`sk-night${show ? " is-show" : ""}`} aria-hidden>
      <span className="sk-moon" />
      <div className="sk-starsA">{stars.filter((s) => s.k).map((s, i) => <i key={i} style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s }} />)}</div>
      <div className="sk-starsB">{stars.filter((s) => !s.k).map((s, i) => <i key={i} style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s }} />)}</div>
    </div>
  );
}

export function Rooftop({ down, warm }: { down: number; warm: number }) {
  return (
    <div className={`sk-roof${down > 20 ? " is-away" : ""}`} style={{ transform: `translate3d(0, ${down}vh, 0)`, ["--warm" as string]: warm }} aria-hidden>
      <span className="sk-drape is-l" />
      <span className="sk-drape is-r" />
      <svg className="sk-lights" viewBox="0 0 400 60" preserveAspectRatio="none">
        <path d="M-10 8 Q100 52 200 22 Q300 -6 410 30" fill="none" stroke="rgba(30,25,20,.8)" strokeWidth="1.2" />
      </svg>
      <div className="sk-bulbs">
        {Array.from({ length: 15 }, (_, i) => {
          const t = i / 14;
          const x = t * 100;
          // follows the wire above (two quadratic halves)
          const y = t < 0.5 ? (1 - t * 2) ** 2 * 8 + 2 * (1 - t * 2) * (t * 2) * 52 + (t * 2) ** 2 * 22 : (1 - (t - 0.5) * 2) ** 2 * 22 + 2 * (1 - (t - 0.5) * 2) * ((t - 0.5) * 2) * -6 + ((t - 0.5) * 2) ** 2 * 30;
          return <i key={i} style={{ left: `${x}%`, top: `${(y / 60) * 100}%`, animationDelay: `${-i * 0.37}s` }} />;
        })}
      </div>
      <div className="sk-ledge" />
    </div>
  );
}

export function Phone({ from, sticker, children, className }: { from: string; sticker?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={`sk-phone${className ? ` ${className}` : ""}`}>
      <div className="sk-phHead">
        <span className="sk-ava">{(Array.from(from)[0] ?? "♥").toUpperCase()}</span>
        <span className="sk-phName">{from} <b>♥</b></span>
        <span className="sk-phOn">online</span>
      </div>
      <div className="sk-msgs">
        {children}
        {sticker}
      </div>
    </div>
  );
}
