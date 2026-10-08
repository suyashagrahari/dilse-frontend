"use client";

// ─── Scenes 2–3: Pour → tap out the bubbles → temper → demould ─────────────
//
// One SVG stage (viewBox 0 0 100 108): a copper pot top-right that rotates
// about its spout, a clear mould with a heart cavity on the marble. Dragging
// anywhere on the stage tips the pot (down/left = more); the pour rate follows
// the angle, the chocolate rises inside the heart clip with a wobbling surface,
// and it cannot overfill. Then 8 air bubbles: every tap on the mould knocks
// the nearest one out (mini-game 1; the rest pop themselves after 5 s). The
// temper dial falls to 31 °C with a shine sweep, and a tap turns the heart out.

import { useCallback, useEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { haptic } from "../../../_valentine/kit";
import { SkipChip } from "../../../_valentine/kit/premium";
import { HEART_D } from "./art";
import type { SceneProps } from "./shared";

type Phase = "pour" | "bubbles" | "temper" | "ready" | "out";

const BUBBLES: [number, number][] = [[36, 40], [62, 36], [50, 56], [26, 32], [72, 46], [42, 68], [58, 70], [50, 33]];
// The mould's heart lives at translate(20 42) scale(.6) in stage units.
const MX = 20, MY = 42, MS = 0.6;

export default function Make({ marks, reduced, sfx, next }: SceneProps) {
  const [phase, setPhase] = useState<Phase>("pour");
  const [tilt, setTilt] = useState(0);
  const [fill, setFill] = useState(0);
  const [amp, setAmp] = useState(0);
  const [popped, setPopped] = useState<boolean[]>(() => BUBBLES.map(() => false));
  const [rings, setRings] = useState<{ id: number; x: number; y: number }[]>([]);
  const [temp, setTemp] = useState(45);
  const drag = useRef<{ x: number; y: number; t: number } | null>(null);
  const auto = useRef(false);
  const st = useRef({ tilt: 0, fill: 0, amp: 0 });
  const pourBed = useRef<ReturnType<typeof sfx> | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => () => {
    timers.current.forEach(clearTimeout);
    pourBed.current?.stop(200);
  }, []);

  // ── the pour loop ──
  useEffect(() => {
    if (phase !== "pour") return;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = st.current;
      if (!drag.current) s.tilt = auto.current ? Math.min(62, s.tilt + dt * 90) : Math.max(0, s.tilt - dt * 140);
      const rate = Math.max(0, Math.min(1, (s.tilt - 18) / 42));
      s.fill = Math.min(1, s.fill + rate * dt * 0.32);
      s.amp = s.amp * 0.94 + rate * 0.25;
      if (rate > 0 && !pourBed.current) pourBed.current = sfx("choc-pour");
      if (rate === 0 && pourBed.current) {
        pourBed.current.stop(250);
        pourBed.current = null;
      }
      setTilt(s.tilt);
      setFill(s.fill);
      setAmp(s.amp);
      if (s.fill >= 1) {
        pourBed.current?.stop(300);
        pourBed.current = null;
        drag.current = null;
        auto.current = false;
        s.tilt = 0;
        setTilt(0);
        haptic(20);
        timers.current.push(window.setTimeout(() => setPhase("bubbles"), 500));
        return;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [phase, sfx]);

  const down = (e: RPointerEvent<SVGSVGElement>) => {
    if (phase === "pour") {
      e.currentTarget.setPointerCapture?.(e.pointerId);
      drag.current = { x: e.clientX, y: e.clientY, t: st.current.tilt };
      sfx("choc-slosh", { detune: Math.random() * 100 - 50 });
    } else if (phase === "bubbles") knock(e.clientX, e.clientY);
    else if (phase === "ready") demould();
  };
  const move = (e: RPointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (!d || phase !== "pour") return;
    st.current.tilt = Math.max(0, Math.min(64, d.t + (e.clientY - d.y) * 0.42 + (d.x - e.clientX) * 0.22));
  };
  const up = () => {
    drag.current = null;
  };

  // ── bubbles ──
  const popAt = useCallback(
    (i: number) => {
      setPopped((p) => {
        if (p[i]) return p;
        const n = [...p];
        n[i] = true;
        return n;
      });
      const [bx, by] = BUBBLES[i];
      const id = Math.random();
      setRings((r) => [...r, { id, x: MX + bx * MS, y: MY + by * MS }]);
      timers.current.push(window.setTimeout(() => setRings((r) => r.filter((q) => q.id !== id)), 500));
      sfx("choc-bubble", { detune: Math.random() * 400 - 200, pan: (bx - 50) / 60 });
    },
    [sfx],
  );
  const knock = (cx: number, cy: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const r = svg.getBoundingClientRect();
    const sx = ((cx - r.left) / r.width) * 100, sy = -46 + ((cy - r.top) / r.height) * 154;
    let best = -1, bd = 1e9;
    BUBBLES.forEach(([bx, by], i) => {
      if (popped[i]) return;
      const d = Math.hypot(MX + bx * MS - sx, MY + by * MS - sy);
      if (d < bd) { bd = d; best = i; }
    });
    if (best >= 0) {
      popAt(best);
      haptic(8);
    }
  };
  const left = popped.filter((p) => !p).length;
  useEffect(() => {
    if (phase !== "bubbles") return;
    const t = window.setTimeout(() => {
      BUBBLES.forEach((_, i) => timers.current.push(window.setTimeout(() => popAt(i), i * 160)));
    }, 5200);
    return () => clearTimeout(t);
  }, [phase, popAt]);
  useEffect(() => {
    if (phase === "bubbles" && left === 0) timers.current.push(window.setTimeout(() => setPhase("temper"), 450));
  }, [phase, left]);

  // ── temper ──
  useEffect(() => {
    if (phase !== "temper") return;
    let raf = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / (reduced ? 300 : 1900));
      setTemp(Math.round(45 - 14 * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(step);
      else {
        sfx("choc-temper");
        timers.current.push(window.setTimeout(() => setPhase("ready"), 500));
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [phase, reduced, sfx]);

  const demould = () => {
    if (phase !== "ready") return;
    sfx("choc-demould");
    haptic([20, 40, 20]);
    setPhase("out");
    timers.current.push(window.setTimeout(next, reduced ? 500 : 1500));
  };

  const skip = () => {
    pourBed.current?.stop(150);
    pourBed.current = null;
    st.current.fill = 1;
    setFill(1);
    setPopped(BUBBLES.map(() => true));
    setTemp(31);
    setPhase("ready");
  };

  const rate = Math.max(0, Math.min(1, (tilt - 18) / 42));
  const levelH = 90 - fill * 84; // in heart units
  const levelStage = MY + levelH * MS;
  const wave = (() => {
    const pts: string[] = [];
    const t = typeof performance !== "undefined" ? performance.now() / 260 : 0;
    for (let i = 0; i <= 25; i++) {
      const x = i * 4;
      pts.push(`${x} ${(levelH + Math.sin(i * 0.45 + t) * amp * 1.4 + Math.sin(i * 0.9 - t * 1.3) * amp * 0.5).toFixed(2)}`);
    }
    return `M0 120 L0 ${levelH} L${pts.join(" L")} L100 120 Z`;
  })();

  const copy = {
    pour: { k: "Step one · the pour", h: "Tip the pot. Fill the heart.", s: "Drag the copper pot down to pour. Slowly is fine." },
    bubbles: { k: "Step two · the bubbles", h: "Tap out the air bubbles", s: `Tap the mould — ${left} left` },
    temper: { k: "Step three · the temper", h: "Let it set…", s: "Cooling to the perfect temper" },
    ready: { k: "Set. Glossy. Snaps clean.", h: "Turn it out", s: "Tap the mould to turn the heart out" },
    out: { k: "Made by you", h: "One chocolate heart", s: marks.length ? `Embossed ${marks.join(" ♥ ")}` : "Still warm from your hands" },
  }[phase];

  return (
    <section className="mc-sec">
      <header className="mc-head">
        <p className="mc-kick">{copy.k}</p>
        <h2 className="mc-h">{copy.h}</h2>
        <p className="mc-sub" aria-live="polite">{copy.s}</p>
      </header>
      <div className={`mc-make is-${phase}`}>
        <svg
          ref={svgRef}
          viewBox="0 -46 100 154"
          className="mc-makeSvg"
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          role="img"
          aria-label={phase === "pour" ? `A copper pot over a heart mould, ${Math.round(fill * 100)}% full` : "The chocolate heart in its mould"}
          style={{ touchAction: "none" }}
        >
          <defs>
            <clipPath id="mc-cavity">
              <path d={HEART_D} />
            </clipPath>
            <linearGradient id="mc-choc" x1="0" x2="1">
              <stop offset="0" stopColor="#3a1d10" />
              <stop offset=".4" stopColor="#6e3d24" />
              <stop offset=".55" stopColor="#8d5434" />
              <stop offset="1" stopColor="#3a1d10" />
            </linearGradient>
            <linearGradient id="mc-chocV" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#7b4a2e" />
              <stop offset="1" stopColor="#2a1208" />
            </linearGradient>
            <linearGradient id="mc-sheen" x1="0" x2="1">
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset=".5" stopColor="#ffe9d0" stopOpacity=".55" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="mc-cu2" x1="0" x2="1">
              <stop offset="0" stopColor="#7a3f1f" />
              <stop offset=".35" stopColor="#e09a63" />
              <stop offset=".55" stopColor="#f6c08f" />
              <stop offset="1" stopColor="#8a4724" />
            </linearGradient>
          </defs>
          {/* mould tray */}
          <rect x="12" y="38" width="76" height="66" rx="9" fill="rgba(255,255,255,.10)" stroke="rgba(255,255,255,.35)" strokeWidth=".6" />
          <rect x="14" y="40" width="72" height="4" rx="2" fill="rgba(255,255,255,.18)" />
          <g transform={`translate(${MX} ${MY}) scale(${MS})`}>
            <path d={HEART_D} fill="rgba(20,8,4,.45)" stroke="rgba(255,255,255,.4)" strokeWidth="1.2" />
            <g clipPath="url(#mc-cavity)" className="mc-fillG" style={{ opacity: phase === "out" ? 0 : 1, transition: "opacity .4s" }}>
              <path d={wave} fill="url(#mc-chocV)" />
              <rect x="0" y={levelH - 1} width="100" height="3" fill="url(#mc-choc)" opacity={fill >= 1 ? 0 : 0.5} />
              {(phase === "temper" || phase === "ready") && !reduced && <rect className="mc-sheenSweep" x="-60" y="0" width="40" height="100" fill="url(#mc-sheen)" />}
              {phase === "bubbles" &&
                BUBBLES.map(([bx, by], i) =>
                  popped[i] ? null : (
                    <g key={i} className="mc-bub" style={{ animationDelay: `${i * 0.21}s` }}>
                      <circle cx={bx} cy={by} r="3.6" fill="rgba(255,230,200,.18)" stroke="rgba(255,236,214,.75)" strokeWidth=".7" />
                      <circle cx={bx - 1.1} cy={by - 1.2} r=".9" fill="#fff" opacity=".8" />
                    </g>
                  ),
                )}
            </g>
            <path d={HEART_D} fill="none" stroke="rgba(255,255,255,.55)" strokeWidth=".8" />
          </g>
          {rings.map((r) => (
            <circle key={r.id} className="mc-ring" cx={r.x} cy={r.y} r="2" fill="none" stroke="#ffe9d0" strokeWidth=".6" />
          ))}
          {/* the stream */}
          {phase === "pour" && rate > 0 && (
            <g>
              <path d={`M54 2 C 51 20, 50 32, 50 ${levelStage}`} stroke="url(#mc-choc)" strokeWidth={1.2 + rate * 3} fill="none" strokeLinecap="round" />
              <path d={`M54.3 2 C 51.3 20, 50.4 32, 50.3 ${levelStage}`} stroke="#ffd9b8" strokeOpacity=".35" strokeWidth={0.4 + rate * 0.5} fill="none" />
              <ellipse cx="50" cy={levelStage} rx={2 + rate * 3} ry=".9" fill="#5b3020" />
            </g>
          )}
          {/* the pot (pivot = the spout at 54,2) */}
          <g transform={`translate(54 2) rotate(${-tilt}) scale(.29) translate(0 -20)`} className={`mc-pot${phase !== "pour" ? " is-away" : ""}`}>
            <rect x="112" y="40" width="46" height="9" rx="4.5" fill="#3b2418" />
            <path d="M14 30 H116 L110 92 Q108 104 96 104 H34 Q22 104 20 92 Z" fill="url(#mc-cu2)" />
            <ellipse cx="65" cy="30" rx="51" ry="9" fill="#3a1b0f" />
            <ellipse cx="65" cy="31" rx="46" ry="6" fill={fill < 1 ? "#6e3d24" : "#3a1b0f"} />
            <path d="M14 30 Q2 26 0 20 Q10 24 18 26 Z" fill="#c9844f" />
            <path d="M28 46 Q32 78 40 96" stroke="#ffe0bf" strokeOpacity=".45" strokeWidth="5" fill="none" strokeLinecap="round" />
          </g>
          {phase === "pour" && (
            <g className="mc-steam" aria-hidden>
              <circle cx="72" cy="6" r="4" fill="rgba(255,255,255,.12)" />
              <circle cx="78" cy="2" r="3" fill="rgba(255,255,255,.08)" />
            </g>
          )}
        </svg>
        {phase === "pour" && <div className="mc-meter" aria-hidden><span style={{ transform: `scaleX(${fill})` }} /></div>}
        {(phase === "temper" || phase === "ready") && (
          <div className="mc-dial" aria-label={`${temp} degrees`}>
            <span className="mc-dialFace">
              <span className="mc-needle" style={{ transform: `rotate(${(temp - 38) * 9}deg)` }} />
            </span>
            <b>{temp}°C</b>
            {temp <= 31 && <small>perfect temper ✓</small>}
          </div>
        )}
        {phase === "out" && (
          <div className="mc-outHeart" aria-hidden>
            <svg viewBox="0 0 100 100">
              <path d={HEART_D} fill="url(#mc-chocV)" />
              <path d={HEART_D} fill="none" stroke="rgba(255,220,190,.3)" strokeWidth="2" />
              <path d="M22 24 Q30 14 42 20" stroke="#fff" strokeOpacity=".5" strokeWidth="3" fill="none" strokeLinecap="round" />
              {marks.length > 0 && (
                <text x="50" y="52" textAnchor="middle" className="mc-emboss">
                  {marks.join(" ♥ ")}
                </text>
              )}
            </svg>
          </div>
        )}
      </div>
      <div className="mc-actions">
        {phase === "pour" && (
          <button type="button" className="mc-btn is-ghost" onClick={() => { auto.current = true; sfx("choc-slosh"); }}>
            Pour it for me
          </button>
        )}
        {phase === "bubbles" && (
          <button type="button" className="mc-btn is-ghost" onClick={() => { const i = popped.findIndex((p) => !p); if (i >= 0) popAt(i); }}>
            Knock the mould ({left})
          </button>
        )}
        {phase === "ready" && (
          <button type="button" className="mc-btn" onClick={demould}>
            Turn it out ✦
          </button>
        )}
      </div>
      {(phase === "pour" || phase === "bubbles") && <SkipChip onSkip={skip} delay={2500} />}
    </section>
  );
}
