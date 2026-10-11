"use client";

// Finale: a twilight bridge. Drag the engraved heart padlock up onto the
// railing (it snaps), tap it shut (click), then flick the key over the
// railing — it arcs with the flick's velocity, falls into the river, splash,
// ripples, glints. A weak flick bounces back ("Itni jaldi nahi, phir se!").
// Fallbacks: "Put it on the railing", tap the lock, "Throw the key".
//
// One SVG (viewBox 360×560); pointer → viewBox via getScreenCTM.

import { useMemo, useRef, useState } from "react";
import { animate, AnimatePresence, motion, useMotionValue } from "framer-motion";
import { FONTS } from "../../../_valentine/theme";
import { burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { Btn, P, clamp, rng, sfx } from "./ui";

const METAL = {
  gold: { light: "#F8DE95", mid: "#D9A441", dark: "#8C6418" },
  silver: { light: "#F6F8FB", mid: "#BFC6D0", dark: "#6B7380" },
  rosegold: { light: "#FCD8CD", mid: "#E2A090", dark: "#985646" },
} as const;

const LOCK_START = { x: 180, y: 470 };
/** Hangs from the middle rail (y≈300): the shackle top is 62 units above the lock origin. */
const LOCK_TARGET = { x: 180, y: 365 };
const KEY_START = { x: 252, y: 492 };
const HEART = "M0 34 C-36 13 -38 -16 -19 -21 C-9 -23.5 -2 -17 0 -11 C2 -17 9 -23.5 19 -21 C38 -16 36 13 0 34 Z";

type Phase = "place" | "close" | "throw" | "flying" | "done";

function PadLock({ metal, engraving, closed }: { metal: (typeof METAL)[keyof typeof METAL]; engraving: string; closed: boolean }) {
  const fs = Math.min(7.6, 104 / Math.max(6, engraving.length));
  return (
    <g>
      {/* shackle */}
      <motion.g initial={false} animate={{ y: closed ? 0 : -16 }} transition={{ type: "spring", stiffness: 700, damping: 18 }}>
        <path d="M-13 -12 V-34 A13 13 0 0 1 13 -34 V-12" fill="none" stroke={metal.dark} strokeWidth="9" strokeLinecap="round" />
        <path d="M-13 -12 V-34 A13 13 0 0 1 13 -34 V-12" fill="none" stroke={metal.mid} strokeWidth="5.5" strokeLinecap="round" />
        <path d="M-11 -30 A11 11 0 0 1 -2 -44" fill="none" stroke={metal.light} strokeWidth="1.6" strokeLinecap="round" />
      </motion.g>
      {/* heart body */}
      <path d={HEART} fill={`url(#pl-body)`} stroke={metal.dark} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M-24 -8 C-26 -16 -18 -19 -12 -16" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="3" strokeLinecap="round" />
      <text x="0" y="-1" textAnchor="middle" style={{ font: `700 ${fs}px Georgia, 'Times New Roman', serif` }} fill={metal.dark} fillOpacity=".9">
        {engraving}
      </text>
      {/* keyhole */}
      <circle cx="0" cy="12" r="3.6" fill={metal.dark} />
      <path d="M-1.8 13 L-3 21 H3 L1.8 13 Z" fill={metal.dark} />
    </g>
  );
}

function Key({ metal }: { metal: (typeof METAL)[keyof typeof METAL] }) {
  return (
    <g>
      <path d="M0 -6 C-14 -14 -15 -27 -7 -29 C-3 -30 -0.5 -27 0 -24 C0.5 -27 3 -30 7 -29 C15 -27 14 -14 0 -6 Z" fill="none" stroke={metal.dark} strokeWidth="6" strokeLinejoin="round" />
      <path d="M0 -6 C-14 -14 -15 -27 -7 -29 C-3 -30 -0.5 -27 0 -24 C0.5 -27 3 -30 7 -29 C15 -27 14 -14 0 -6 Z" fill="none" stroke={metal.mid} strokeWidth="3.4" strokeLinejoin="round" />
      <rect x="-2.6" y="-7" width="5.2" height="34" rx="2.4" fill={metal.mid} stroke={metal.dark} strokeWidth="1.4" />
      <path d="M2.6 17 h7 v4 h-4 v3 h4 v4 h-7 z" fill={metal.mid} stroke={metal.dark} strokeWidth="1.3" strokeLinejoin="round" />
      <circle cx="-4" cy="-22" r="1.6" fill={metal.light} />
    </g>
  );
}

export default function LoveLock({
  engraving,
  style,
  sticker,
  onNext,
}: {
  engraving: string;
  style: keyof typeof METAL;
  sticker: React.ReactNode;
  onNext: () => void;
}) {
  const reduced = useReducedMotion();
  const metal = METAL[style] ?? METAL.gold;
  const svgRef = useRef<SVGSVGElement>(null);
  const [phase, setPhase] = useState<Phase>("place");
  const [nope, setNope] = useState(0);
  const [splash, setSplash] = useState<{ x: number; y: number } | null>(null);
  const lx = useMotionValue(LOCK_START.x);
  const ly = useMotionValue(LOCK_START.y);
  const kx = useMotionValue(KEY_START.x);
  const ky = useMotionValue(KEY_START.y);
  const ks = useMotionValue(1);
  const kr = useMotionValue(-28);
  const drag = useRef<{ id: number; ox: number; oy: number; hist: { x: number; y: number; t: number }[] } | null>(null);

  const stars = useMemo(() => {
    const r = rng(42);
    return Array.from({ length: 38 }, () => ({ x: r() * 360, y: r() * 170, s: 0.5 + r() * 1.3, d: r() * 3 }));
  }, []);
  const glints = useMemo(() => {
    const r = rng(9);
    return Array.from({ length: 26 }, () => ({ x: r() * 340, y: 244 + r() * 120, w: 8 + r() * 26, d: r() * 3 }));
  }, []);

  const toSvg = (e: React.PointerEvent) => {
    const svg = svgRef.current;
    const m = svg?.getScreenCTM();
    if (!svg || !m) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const q = pt.matrixTransform(m.inverse());
    return { x: q.x, y: q.y };
  };

  const justPlaced = useRef(false);
  const placeLock = () => {
    justPlaced.current = true;
    window.setTimeout(() => (justPlaced.current = false), 450);
    animate(lx, LOCK_TARGET.x, reduced ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 24 });
    animate(ly, LOCK_TARGET.y, reduced ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 24 });
    setPhase("close");
    haptic(12);
    sfx.click(0.6);
  };

  const closeLock = () => {
    // the pointerup that finished the drag also fires a click — ignore it
    if (phase !== "close" || justPlaced.current) return;
    haptic([20, 30, 20]);
    sfx.click(1.3);
    setPhase("throw");
    const r = svgRef.current?.getBoundingClientRect();
    if (r) burst({ kind: "sparkles", count: 14, spread: 0.15, origin: { x: (r.left + (r.width * 180) / 360) / window.innerWidth, y: (r.top + (r.height * 400) / 560) / window.innerHeight } });
  };

  const throwKey = (vx = 0.15, vy = -1.2) => {
    if (phase !== "throw") return;
    setPhase("flying");
    const x0 = kx.get();
    const y0 = ky.get();
    const landX = clamp(x0 + vx * 260 + (180 - x0) * 0.4, 50, 310);
    const landY = 300 + Math.min(40, Math.abs(vy) * 14);
    const apex = Math.min(y0, landY) - 150 - Math.min(80, Math.abs(vy) * 40);
    const dur = reduced ? 0.01 : 1.15;
    animate(kx, [x0, (x0 + landX) / 2, landX], { duration: dur, ease: "linear" });
    animate(ky, [y0, apex, landY], { duration: dur, times: [0, 0.42, 1], ease: ["easeOut", "easeIn"] });
    animate(ks, [1, 0.75, 0.3], { duration: dur });
    animate(kr, [-28, 300, 700], { duration: dur, ease: "linear" });
    window.setTimeout(() => {
      setSplash({ x: landX, y: landY });
      setPhase("done");
      sfx.splash();
      haptic([30, 50, 30]);
      window.setTimeout(() => {
        sfx.chime();
        const r = svgRef.current?.getBoundingClientRect();
        burst({ kind: "hearts", count: 24, origin: r ? { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height * 0.7) / window.innerHeight } : undefined });
      }, 500);
    }, dur * 1000);
  };

  const onDown = (which: "lock" | "key") => (e: React.PointerEvent) => {
    if ((which === "lock" && phase !== "place") || (which === "key" && phase !== "throw")) return;
    e.preventDefault();
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    const p = toSvg(e);
    const mx = which === "lock" ? lx : kx;
    const my = which === "lock" ? ly : ky;
    drag.current = { id: e.pointerId, ox: p.x - mx.get(), oy: p.y - my.get(), hist: [{ ...p, t: performance.now() }] };
    haptic(6);
  };
  const onMove = (which: "lock" | "key") => (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const p = toSvg(e);
    d.hist.push({ ...p, t: performance.now() });
    if (d.hist.length > 6) d.hist.shift();
    if (which === "lock") {
      lx.set(clamp(p.x - d.ox, 40, 320));
      ly.set(clamp(p.y - d.oy, 330, 520));
      if (Math.hypot(lx.get() - LOCK_TARGET.x, ly.get() - LOCK_TARGET.y) < 26) {
        drag.current = null;
        placeLock();
      }
    } else {
      kx.set(clamp(p.x - d.ox, 20, 340));
      ky.set(clamp(p.y - d.oy, 280, 540));
    }
  };
  const onUp = (which: "lock" | "key") => (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (which === "lock") {
      if (Math.hypot(lx.get() - LOCK_TARGET.x, ly.get() - LOCK_TARGET.y) < 70) placeLock();
      else {
        animate(lx, LOCK_START.x, { duration: 0.22, ease: "easeOut" });
        animate(ly, LOCK_START.y, { duration: 0.22, ease: "easeOut" });
      }
      return;
    }
    const a = d.hist[0];
    const b = d.hist[d.hist.length - 1];
    const dt = Math.max(16, b.t - a.t);
    const vx = (b.x - a.x) / dt;
    const vy = (b.y - a.y) / dt;
    const flicked = vy < -0.35 || (Math.hypot(vx, vy) > 0.7 && vy < 0) || ky.get() < 330;
    if (flicked) throwKey(vx, vy);
    else {
      setNope((n) => n + 1);
      haptic(10);
      animate(kx, KEY_START.x, { type: "spring", stiffness: 300, damping: 14 });
      animate(ky, KEY_START.y, { type: "spring", stiffness: 300, damping: 14 });
    }
  };

  const caption =
    phase === "place"
      ? "Drag the lock up onto the railing 🔐"
      : phase === "close"
        ? "Tap the lock to click it shut"
        : phase === "throw"
          ? nope
            ? "Itni jaldi nahi, phir se! Flick it harder ↑"
            : "Now flick the key into the river ↑"
          : phase === "flying"
            ? "…"
            : "Ab yeh taala kabhi nahi khulega.";

  return (
    <>
      <style>{`
        @keyframes pl-tw { 0%,100% { opacity: .25 } 50% { opacity: 1 } }
        @keyframes pl-gl { 0%,100% { opacity: .08 } 50% { opacity: .55 } }
        @keyframes pl-ff { 0% { transform: translate(0,0) } 50% { transform: translate(10px,-14px) } 100% { transform: translate(0,0) } }
        .pl-tw { animation: pl-tw 2.6s ease-in-out infinite }
        .pl-gl { animation: pl-gl 2.2s ease-in-out infinite }
        .pl-ff { animation: pl-ff 5s ease-in-out infinite }
        @media (prefers-reduced-motion: reduce) { .pl-tw, .pl-gl, .pl-ff { animation: none } }
      `}</style>
      <div style={{ position: "relative", width: "min(100%, calc(420px * var(--vw-s, 1)))", borderRadius: 26, overflow: "hidden", boxShadow: "0 30px 60px -28px rgba(46,58,107,.75)" }}>
        <svg ref={svgRef} viewBox="0 0 360 560" width="100%" style={{ display: "block", aspectRatio: "360 / 560", touchAction: "none", userSelect: "none" }} aria-hidden>
          <defs>
            <linearGradient id="pl-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#1F2752" />
              <stop offset=".55" stopColor={P.river} />
              <stop offset=".85" stopColor="#7C6FAE" />
              <stop offset="1" stopColor="#E9A0B8" />
            </linearGradient>
            <linearGradient id="pl-river" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#5B6BA8" />
              <stop offset=".4" stopColor="#36447A" />
              <stop offset="1" stopColor="#1C2449" />
            </linearGradient>
            <linearGradient id="pl-deck" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#4A3C5E" />
              <stop offset="1" stopColor="#2A2238" />
            </linearGradient>
            <radialGradient id="pl-moon" cx=".5" cy=".5" r=".5">
              <stop offset="0" stopColor="#FFF5D6" stopOpacity=".55" />
              <stop offset="1" stopColor="#FFF5D6" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="pl-lamp" cx=".5" cy=".5" r=".5">
              <stop offset="0" stopColor="#FFD98A" stopOpacity=".55" />
              <stop offset="1" stopColor="#FFD98A" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="pl-body" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={metal.light} />
              <stop offset=".55" stopColor={metal.mid} />
              <stop offset="1" stopColor={metal.dark} />
            </linearGradient>
          </defs>

          {/* sky */}
          <rect width="360" height="250" fill="url(#pl-sky)" />
          {stars.map((s, k) => (
            <circle key={k} cx={s.x} cy={s.y} r={s.s} fill="#fff" className={reduced ? undefined : "pl-tw"} style={{ animationDelay: `${s.d}s` }} />
          ))}
          <circle cx="292" cy="70" r="60" fill="url(#pl-moon)" />
          <mask id="pl-crescent">
            <rect x="260" y="40" width="70" height="70" fill="#fff" />
            <circle cx="302" cy="63" r="20" fill="#000" />
          </mask>
          <circle cx="292" cy="70" r="22" fill="#FFF3D1" mask="url(#pl-crescent)" />
          {/* far city */}
          <path d="M0 236 V214 h14 v-10 h10 v16 h12 v-22 h8 v-8 h6 v8 h8 v24 h16 v-14 h12 v14 h10 v-30 h14 v30 h12 v-12 h18 v-8 h6 v20 h14 v-18 h10 v-12 h4 v12 h10 v26 h16 v-16 h12 v-10 h8 v26 h14 v-20 h12 v20 h10 v-12 h14 v12 h12 v-26 h10 v26 h14 V236 Z" fill="#2B2F5C" opacity=".95" />
          {[22, 58, 96, 132, 170, 214, 252, 288, 326].map((x, k) => (
            <rect key={x} x={x} y={218 + (k % 3) * 4} width="2.4" height="3" fill="#FFD98A" opacity=".7" />
          ))}
          {/* river */}
          <rect y="236" width="360" height="160" fill="url(#pl-river)" />
          {[0, 1, 2, 3, 4, 5, 6].map((k) => (
            <rect key={k} x={284 - k * 1.5} y={246 + k * 16} width={16 + k * 3} height="2" rx="1" fill="#FFF3D1" opacity={0.5 - k * 0.05} className={reduced ? undefined : "pl-gl"} style={{ animationDelay: `${k * 0.3}s` }} />
          ))}
          {glints.map((g, k) => (
            <rect key={k} x={g.x} y={g.y} width={g.w} height="1.4" rx=".7" fill="#C9D3FF" className={reduced ? undefined : "pl-gl"} style={{ animationDelay: `${g.d}s` }} opacity=".25" />
          ))}

          {/* splash + ripples (behind the railing — it's in the river) */}
          {splash && (
            <g>
              {[0, 0.25, 0.5].map((d, k) => (
                <motion.ellipse
                  key={k}
                  cx={splash.x}
                  cy={splash.y}
                  rx="10"
                  ry="3"
                  fill="none"
                  stroke="#E6ECFF"
                  strokeWidth="1.6"
                  initial={{ scale: 0.3, opacity: 0.9 }}
                  animate={{ scale: 5, opacity: 0 }}
                  transition={{ duration: reduced ? 0.01 : 1.8, delay: reduced ? 0 : d, repeat: reduced ? 0 : 1, repeatDelay: 0.4 }}
                  style={{ originX: `${splash.x}px`, originY: `${splash.y}px` }}
                />
              ))}
              {!reduced &&
                [-1, -0.4, 0.3, 0.9].map((v, k) => (
                  <motion.circle
                    key={`d${k}`}
                    cx={splash.x}
                    cy={splash.y}
                    r="1.8"
                    fill="#E6ECFF"
                    initial={{ x: 0, y: 0, opacity: 1 }}
                    animate={{ x: v * 14, y: [0, -16 - k * 3, 2], opacity: [1, 1, 0] }}
                    transition={{ duration: 0.7 }}
                  />
                ))}
            </g>
          )}

          {/* fireflies */}
          {[
            [60, 150],
            [120, 196],
            [240, 120],
            [320, 200],
            [30, 280],
          ].map(([x, y], k) => (
            <g key={k} className={reduced ? undefined : "pl-ff"} style={{ animationDelay: `${-k * 1.1}s` }}>
              <circle cx={x} cy={y} r="5" fill="#FFE9A6" opacity=".25" />
              <circle cx={x} cy={y} r="1.8" fill="#FFF3C4" />
            </g>
          ))}

          {/* deck / walkway */}
          <path d="M0 396 H360 V560 H0 Z" fill="url(#pl-deck)" />
          {[0, 1, 2, 3, 4, 5].map((k) => (
            <path key={k} d={`M0 ${420 + k * 26 + k * k * 2} H360`} stroke="#5B4C70" strokeWidth="1.2" opacity=".6" />
          ))}
          {/* lamp */}
          <circle cx="38" cy="300" r="70" fill="url(#pl-lamp)" />
          <rect x="35" y="300" width="6" height="104" fill="#1C1830" />
          <path d="M26 296 h24 l-4 -18 h-16 z" fill="#FFE7A8" stroke="#1C1830" strokeWidth="2.5" />
          <path d="M24 278 h28 l-6 -8 h-16 z" fill="#1C1830" />

          {/* railing */}
          <rect x="0" y="262" width="360" height="9" rx="3" fill="#1A1E3D" />
          <rect x="0" y="263" width="360" height="2" fill="#5D66A0" opacity=".7" />
          <rect x="0" y="384" width="360" height="12" rx="3" fill="#1A1E3D" />
          <rect x="0" y="385" width="360" height="2" fill="#5D66A0" opacity=".7" />
          <rect x="0" y="298" width="360" height="5" rx="2" fill="#1A1E3D" />
          <rect x="0" y="298" width="360" height="1.4" fill="#5D66A0" opacity=".6" />
          {Array.from({ length: 13 }, (_, k) => 6 + k * 29).map((x) => (
            <g key={x}>
              <rect x={x - 2.5} y="270" width="5" height="116" fill="#1A1E3D" />
              <path d={`M${x} 334 c-12 6 -12 20 0 26 c12 -6 12 -20 0 -26`} fill="none" stroke="#1A1E3D" strokeWidth="2.4" />
            </g>
          ))}
          {/* other couples' locks */}
          {[
            { x: 46, c: P.rose, s: 0.55 },
            { x: 98, c: "#7FA0E8", s: 0.45 },
            { x: 262, c: "#CDEBDD", s: 0.5 },
            { x: 318, c: "#FFD98A", s: 0.42 },
            { x: 128, c: "#F7B6C8", s: 0.38 },
          ].map((l, k) => (
            <g key={k} transform={`translate(${l.x} ${302 + 47 * l.s}) rotate(${k % 2 ? 6 : -5}) scale(${l.s})`}>
              <path d="M-13 -12 V-34 A13 13 0 0 1 13 -34 V-12" fill="none" stroke="#6B7380" strokeWidth="6" />
              <path d={HEART} fill={l.c} stroke="rgba(0,0,0,.35)" strokeWidth="2" />
            </g>
          ))}

          {/* the target spot */}
          {phase === "place" && (
            <g transform={`translate(${LOCK_TARGET.x} ${LOCK_TARGET.y})`} opacity=".85">
              <path d={HEART} fill="none" stroke="#FFD98A" strokeWidth="2" strokeDasharray="4 4" />
              {!reduced && (
                <motion.path d={HEART} fill="none" stroke="#FFD98A" strokeWidth="2" animate={{ scale: [1, 1.35], opacity: [0.7, 0] }} transition={{ duration: 1.5, repeat: Infinity }} />
              )}
            </g>
          )}

          {/* the lock */}
          <motion.g
            style={{ x: lx, y: ly, cursor: phase === "place" ? "grab" : phase === "close" ? "pointer" : "default" }}
            onPointerDown={onDown("lock")}
            onPointerMove={onMove("lock")}
            onPointerUp={onUp("lock")}
            onPointerCancel={onUp("lock")}
            onClick={closeLock}
          >
            <rect x="-48" y="-56" width="96" height="100" fill="transparent" />
            <motion.g animate={phase === "place" && !reduced ? { y: [0, -5, 0] } : { y: 0 }} transition={{ duration: 1.8, repeat: phase === "place" ? Infinity : 0 }}>
              <g transform="scale(1.32)">
                <PadLock metal={metal} engraving={engraving} closed={phase !== "place" && phase !== "close"} />
              </g>
            </motion.g>
            {phase === "close" && !reduced && (
              <motion.circle r="40" cy="4" fill="none" stroke="#FFD98A" strokeWidth="2" animate={{ scale: [1, 1.4], opacity: [0.8, 0] }} transition={{ duration: 1.2, repeat: Infinity }} />
            )}
          </motion.g>

          {/* the key */}
          <AnimatePresence>
            {(phase === "throw" || phase === "flying") && (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                style={{ x: kx, y: ky, scale: ks, rotate: kr, cursor: "grab" }}
                onPointerDown={onDown("key")}
                onPointerMove={onMove("key")}
                onPointerUp={onUp("key")}
                onPointerCancel={onUp("key")}
              >
                <circle r="36" fill="transparent" />
                <circle r="26" fill="#FFD98A" opacity=".18" />
                <g transform="scale(1.5)">
                  <Key metal={metal} />
                </g>
              </motion.g>
            )}
          </AnimatePresence>

          {/* flick arrow */}
          {phase === "throw" && !reduced && (
            <motion.path
              d="M252 440 C250 410 240 392 226 380"
              fill="none"
              stroke="#FFD98A"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="6 6"
              animate={{ opacity: [0, 1, 0], pathLength: [0.2, 1, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            />
          )}
        </svg>

        {/* caption over the sky */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "0 16px", pointerEvents: "none" }}>
          <p style={{ margin: 0, font: `600 12px ${FONTS.ui}`, letterSpacing: ".2em", color: "#C9D3FF" }}>LOVE-LOCK · OUR BRIDGE</p>
          <AnimatePresence mode="wait">
            <motion.p
              key={caption}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              aria-live="polite"
              style={{ margin: 0, font: phase === "done" ? `700 26px/1.2 ${FONTS.script}` : `600 15px/1.35 ${FONTS.ui}`, color: "#FFF4EE", textShadow: "0 2px 10px rgba(0,0,0,.4)", maxWidth: 300 }}
            >
              {caption}
            </motion.p>
          </AnimatePresence>
          <AnimatePresence>
            {phase === "done" && (
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.3 }}>
                {sticker}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div style={{ minHeight: 100, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        {phase === "place" && (
          <button type="button" onClick={placeLock} style={{ minHeight: 44, padding: "8px 16px", border: 0, background: "transparent", color: P.berry, font: `600 14px ${FONTS.ui}`, textDecoration: "underline", textUnderlineOffset: 4, cursor: "pointer" }}>
            Put it on the railing for me
          </button>
        )}
        {phase === "close" && <Btn onClick={closeLock}>Click it shut 🔒</Btn>}
        {phase === "throw" && (
          <button type="button" onClick={() => throwKey()} style={{ minHeight: 44, padding: "8px 16px", border: 0, background: "transparent", color: P.berry, font: `600 14px ${FONTS.ui}`, textDecoration: "underline", textUnderlineOffset: 4, cursor: "pointer" }}>
            Throw the key for me 🗝️
          </button>
        )}
        {phase === "done" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduced ? 0 : 1 }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <Btn onClick={onNext}>Our signed Vachan Patra →</Btn>
            <p style={{ margin: 0, font: `400 12px ${FONTS.ui}`, color: "#A2647C" }}>No real bridges were harmed in this promise 🌉</p>
          </motion.div>
        )}
      </div>
    </>
  );
}
