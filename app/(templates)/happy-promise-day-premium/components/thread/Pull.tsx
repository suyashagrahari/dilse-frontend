"use client";

// ─── Scene: pull the thread hand over hand; photos ride past on pegs ────────
//
// Only downward drags reel the thread in (hand over hand). A fast yank twangs
// and sets the thread wobbling (a decaying sine on the curve). Each photo peg
// clicks as it passes the hand. When the whole length is in, the other end
// arrives (onArrive). "Pull ↓" reels one length per tap.

import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { CroppedPhoto, haptic } from "../../../_valentine/kit";
import { SkipChip } from "../../../_valentine/kit/premium";
import { Hand } from "./art";
import type { SceneProps } from "./shared";

const S = 210; // px of thread between pegs

export default function Pull({ data, x, color, hi, reduced, sfx, sticker, next }: SceneProps) {
  const photos = data.photos.filter((p) => p && p.url).slice(0, 8);
  const L = S * (Math.max(1, photos.length) + 1);
  const [off, setOff] = useState(0);
  const [wob, setWob] = useState(0);
  const [dip, setDip] = useState(false);
  const offRef = useRef(0);
  const wobRef = useRef(0);
  const drag = useRef<{ y: number; t: number } | null>(null);
  const reeled = useRef(0);
  const pulls = useRef(0);
  const passed = useRef(0);
  const done = useRef(false);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // the wobble decays on its own
  useEffect(() => {
    let raf = 0;
    const step = () => {
      if (Math.abs(wobRef.current) > 0.3) {
        wobRef.current *= 0.93;
        setWob(wobRef.current);
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const add = (dy: number) => {
    if (done.current) return;
    const n = Math.min(L, offRef.current + dy);
    offRef.current = n;
    setOff(n);
    reeled.current += dy;
    if (reeled.current > 70) {
      reeled.current = 0;
      pulls.current += 1;
      sfx("tp-reel", { detune: Math.min(1200, pulls.current * 50) });
    }
    const past = Math.floor((n + S * 0.35) / S);
    if (past > passed.current && past <= photos.length) {
      passed.current = past;
      sfx("tp-peg");
      haptic(6);
    }
    if (n >= L) {
      done.current = true;
      sfx("tp-glint");
      timers.current.push(window.setTimeout(next, reduced ? 200 : 700));
    }
  };
  const down = (e: RPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drag.current = { y: e.clientY, t: performance.now() };
    setDip(true);
  };
  const move = (e: RPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dy = e.clientY - d.y;
    const now = performance.now();
    if (dy > 0) {
      const v = dy / Math.max(8, now - d.t);
      if (v > 2.2 && Math.abs(wobRef.current) < 6) {
        wobRef.current = Math.min(22, v * 6) * (Math.random() < 0.5 ? -1 : 1);
        sfx("tp-twang");
      }
      add(dy * 1.15);
    }
    d.y = e.clientY;
    d.t = now;
  };
  const up = () => {
    drag.current = null;
    setDip(false);
  };
  const pullOnce = () => {
    const target = Math.min(L, (Math.floor(offRef.current / S) + 1) * S);
    const from = offRef.current;
    setDip(true);
    const t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / (reduced ? 80 : 520));
      add(from + (target - from) * (1 - Math.pow(1 - k, 3)) - offRef.current);
      if (k < 1) requestAnimationFrame(step);
      else setDip(false);
    };
    requestAnimationFrame(step);
  };

  const prog = off / L;
  const since = (x.sharedSince || "").trim().replace(/^(tied\s+)?since\s+/i, "");
  const w = wob * Math.sin(performance.now() / 60);
  return (
    <section className="tp-sec tp-pullSec">
      <header className="tp-head">
        <p className="tp-kick">{since ? (/^\d+\s*\+?\s*(years?|yrs?|months?|saal|mahine)\b/i.test(since) ? `Tied for ${since}` : `Tied since ${since}`) : "The red thread"}</p>
        <h2 className="tp-h">Pull it. Hand over hand.</h2>
        <p className="tp-sub">Drag down to reel the thread in.</p>
      </header>
      <div className="tp-pull" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} style={{ touchAction: "none" }} role="img" aria-label={`The thread, ${Math.round(prog * 100)}% pulled in`}>
        <svg className="tp-pullThread" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <path d={`M50 -5 Q ${50 + w} 45, 50 86`} stroke={color} strokeWidth="1.1" vectorEffect="non-scaling-stroke" fill="none" style={{ strokeWidth: 3 }} />
          <path d={`M50 -5 Q ${50 + w} 45, 50 86`} stroke={hi} strokeOpacity=".5" fill="none" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 1 }} strokeDasharray="2 14" strokeDashoffset={-off * 0.4} />
        </svg>
        {photos.map((p, i) => {
          const y = off - S * (i + 1);
          if (y < -260 || y > 900) return null;
          const left = i % 2 === 0;
          return (
            <figure key={i} className={`tp-peg${left ? " is-l" : " is-r"}`} style={{ transform: `translateY(${y}px) rotate(${left ? -4 : 4}deg)` }}>
              <span className="tp-pegClip" aria-hidden />
              <span className="tp-pegPh">
                <CroppedPhoto photo={p} alt={p.caption || `Photo ${i + 1}`} />
              </span>
              {p.caption && <figcaption>{p.caption}</figcaption>}
            </figure>
          );
        })}
        <div className={`tp-myHand${dip ? " is-dip" : ""}`}>
          <Hand color={color} />
        </div>
        <span className="tp-pullStick">{sticker("pp2-pull", 60)}</span>
        <div className="tp-meter" aria-hidden>
          <span style={{ transform: `scaleY(${prog})` }} />
        </div>
      </div>
      <div className="tp-actions">
        <button type="button" className="tp-btn is-ghost" onClick={pullOnce}>
          Pull ↓
        </button>
      </div>
      <SkipChip onSkip={() => add(L)} delay={3000} />
    </section>
  );
}
