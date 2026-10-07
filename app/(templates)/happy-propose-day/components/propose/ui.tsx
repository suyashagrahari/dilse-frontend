"use client";

// Shared pieces for the Propose Day experience: buttons, the screen
// wrapper, the velvet stage (curtain drapes, spotlight, gold dust) and a
// small canvas fireworks show for the YES.

import { forwardRef, useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { motion } from "framer-motion";
import { FONTS, VW } from "../../../_valentine/theme";
import { prefersReducedMotion } from "../../../_valentine/kit";

export const EASE = [0.2, 0.8, 0.2, 1] as const;
export const GOLD = "#E6C27A";
export const GOLD_SOFT = "#F6E3B4";
export const WINE = "#6B0F2A";
export const PLUM = "#1E0F24";
export const PEARL = "#FFF6EC";

export const goldBtn: CSSProperties = {
  minHeight: 54,
  padding: "14px 28px",
  borderRadius: 999,
  border: 0,
  background: `linear-gradient(180deg, ${GOLD_SOFT}, ${GOLD} 55%, #C99B4E)`,
  color: PLUM,
  font: `600 17px ${FONTS.ui}`,
  boxShadow: "0 5px 0 #8E6A2C, 0 18px 34px -14px rgba(230,194,122,.55)",
  cursor: "pointer",
  touchAction: "manipulation",
};

export const ghostBtn: CSSProperties = {
  minHeight: 44,
  padding: "10px 18px",
  borderRadius: 999,
  border: `1.5px solid rgba(230,194,122,.35)`,
  background: "rgba(255,246,236,.06)",
  color: VW.inkSoft,
  font: `600 14px ${FONTS.ui}`,
  cursor: "pointer",
  touchAction: "manipulation",
};

export const kicker: CSSProperties = {
  margin: 0,
  font: `600 12.5px ${FONTS.ui}`,
  letterSpacing: ".22em",
  textTransform: "uppercase",
  color: GOLD,
};

export const Screen = forwardRef<HTMLElement, { id: string; preview: boolean; children: ReactNode; reduced: boolean; style?: CSSProperties }>(function Screen(
  { id, preview, children, reduced, style },
  ref,
) {
  return (
    <motion.section
      ref={ref}
      data-propose-step={id}
      initial={reduced ? false : { opacity: 0, y: 20, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={reduced ? undefined : { opacity: 0, y: -14, transition: { duration: 0.35 } }}
      transition={{ duration: 0.7, ease: EASE }}
      style={{
        position: "relative",
        zIndex: 2,
        minHeight: "100dvh",
        width: "100%",
        maxWidth: 520,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: `76px 30px ${preview ? 124 : 44}px`,
        textAlign: "center",
        boxSizing: "border-box",
        ...style,
      }}
    >
      {children}
    </motion.section>
  );
});

/** Velvet curtain panel (one side). `open` 0 closed → 1 gathered at the edge. */
export function Drape({ side, open, reduced }: { side: "l" | "r"; open: boolean; reduced: boolean }) {
  const folds = "repeating-linear-gradient(90deg, #4A0A1E 0px, #7A1232 14px, #9B1B40 22px, #7A1232 30px, #4A0A1E 44px)";
  return (
    <motion.div
      aria-hidden
      initial={false}
      animate={open ? { x: side === "l" ? "-47%" : "47%", scaleX: 0.55 } : { x: "0%", scaleX: 1 }}
      transition={{ duration: reduced ? 0 : 1.5, ease: [0.65, 0, 0.25, 1] }}
      style={{
        position: "fixed",
        top: 0,
        bottom: 0,
        [side === "l" ? "left" : "right"]: 0,
        width: "51%",
        zIndex: 60,
        transformOrigin: side === "l" ? "0% 50%" : "100% 50%",
        background: `linear-gradient(${side === "l" ? "90deg" : "270deg"}, rgba(0,0,0,.35), transparent 30%, transparent 75%, rgba(0,0,0,.25)), ${folds}`,
        boxShadow: side === "l" ? "8px 0 30px rgba(0,0,0,.5)" : "-8px 0 30px rgba(0,0,0,.5)",
        pointerEvents: "none",
        borderBottomLeftRadius: side === "r" ? "40% 6%" : 0,
        borderBottomRightRadius: side === "l" ? "40% 6%" : 0,
      }}
    >
      {/* tie-back tassel */}
      <motion.span
        initial={false}
        animate={{ opacity: open ? 1 : 0 }}
        style={{ position: "absolute", top: "58%", [side === "l" ? "right" : "left"]: -6, width: 14, height: 44, borderRadius: 8, background: `linear-gradient(180deg, ${GOLD_SOFT}, ${GOLD})`, boxShadow: "0 4px 10px rgba(0,0,0,.4)" }}
      />
    </motion.div>
  );
}

/** The scalloped pelmet across the top of the stage. */
export function Valance() {
  return (
    <div aria-hidden style={{ position: "fixed", top: 0, left: 0, right: 0, height: 34, zIndex: 61, pointerEvents: "none" }}>
      <svg viewBox="0 0 400 34" preserveAspectRatio="none" width="100%" height="100%">
        <defs>
          <linearGradient id="pd-val" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3E0818" />
            <stop offset="1" stopColor="#7A1232" />
          </linearGradient>
        </defs>
        <path d={`M0 0 H400 V20 ${Array.from({ length: 10 }, (_, i) => `Q${400 - i * 40 - 20} 36 ${400 - (i + 1) * 40} 20`).join(" ")} Z`} fill="url(#pd-val)" />
        <path d={`M0 20 ${Array.from({ length: 10 }, (_, i) => `Q${i * 40 + 20} 36 ${(i + 1) * 40} 20`).join(" ")}`} fill="none" stroke={GOLD} strokeWidth={1.6} vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

/** Slow gold dust in the spotlight. */
export function GoldDust({ count = 22, reduced }: { count?: number; reduced: boolean }) {
  const dots = Array.from({ length: count }, (_, i) => {
    const r = (k: number) => (((i + 1) * 7919 * (k + 3)) % 1000) / 1000;
    return { x: 15 + r(1) * 70, y: r(2) * 100, s: 1.5 + r(3) * 2.5, d: 3 + r(4) * 4, delay: -r(5) * 6, drift: 6 + r(6) * 10 };
  });
  return (
    <div aria-hidden style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1, overflow: "hidden" }}>
      {dots.map((d, i) => (
        <span
          key={i}
          className={reduced ? undefined : "pd-dust"}
          style={{
            position: "absolute",
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.s,
            height: d.s,
            borderRadius: "50%",
            background: GOLD_SOFT,
            boxShadow: `0 0 ${d.s * 3}px ${GOLD}`,
            opacity: 0.5,
            animationDuration: `${d.d}s, ${d.drift}s`,
            animationDelay: `${d.delay}s, ${d.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/** A full-screen canvas fireworks show (~3.5 s, 3 staggered volleys). DPR capped at 2. */
export function Fireworks({ fire, colors, onDone }: { fire: number; colors: readonly string[]; onDone?: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!fire || prefersReducedMotion()) return;
    const c = ref.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = window.innerWidth;
    const H = window.innerHeight;
    c.width = W * dpr;
    c.height = H * dpr;
    ctx.scale(dpr, dpr);
    type P = { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; r: number; rocket?: boolean; tx?: number; ty?: number };
    const ps: P[] = [];
    const launch = (tx: number, ty: number) => ps.push({ x: tx + (Math.random() - 0.5) * 40, y: H + 10, vx: 0, vy: 0, life: 0, max: 60, color: GOLD_SOFT, r: 2.4, rocket: true, tx, ty });
    const explode = (x: number, y: number) => {
      const n = 56;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const sp = 2.2 + Math.random() * 2.6;
        ps.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0, max: 60 + Math.random() * 30, color: colors[i % colors.length], r: 1.6 + Math.random() * 1.4 });
      }
    };
    const volleys = [
      [0, [[0.5, 0.28]]],
      [450, [[0.25, 0.34], [0.75, 0.3]]],
      [950, [[0.4, 0.22], [0.62, 0.4], [0.85, 0.2], [0.15, 0.24]]],
    ] as const;
    const timers = volleys.map(([t, spots]) => window.setTimeout(() => spots.forEach(([x, y]) => launch(x * W, y * H)), t));
    let raf = 0;
    const t0 = performance.now();
    const loop = (t: number) => {
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,.34)";
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        if (p.rocket) {
          p.x += ((p.tx ?? p.x) - p.x) * 0.06;
          p.y += ((p.ty ?? p.y) - p.y) * 0.085;
          if (Math.abs(p.y - (p.ty ?? 0)) < 6) {
            ps.splice(i, 1);
            explode(p.x, p.y);
            continue;
          }
        } else {
          p.vy += 0.045;
          p.vx *= 0.985;
          p.vy *= 0.985;
          p.x += p.vx;
          p.y += p.vy;
          p.life++;
          if (p.life > p.max) {
            ps.splice(i, 1);
            continue;
          }
        }
        ctx.globalAlpha = p.rocket ? 1 : Math.max(0, 1 - p.life / p.max);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (t - t0 < 4200 || ps.length) raf = requestAnimationFrame(loop);
      else onDone?.();
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach((x) => window.clearTimeout(x));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fire]);
  if (!fire) return null;
  return <canvas ref={ref} aria-hidden style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", pointerEvents: "none", zIndex: 350 }} />;
}

/** Local keyframes. No quotes or angle brackets (React escapes <style> text on the server). */
export const PROPOSE_CSS = `
@keyframes pd-twinkle { 0%,100% { opacity: .15 } 50% { opacity: .9 } }
@keyframes pd-rise { from { transform: translateY(0) } to { transform: translateY(-40px) } }
.pd-dust { animation-name: pd-twinkle, pd-rise; animation-timing-function: ease-in-out, linear; animation-iteration-count: infinite, infinite; animation-direction: normal, alternate }
@keyframes pd-beat { 0%, 100% { transform: scale(1) } 12% { transform: scale(1.18) } 24% { transform: scale(1.02) } 36% { transform: scale(1.12) } 50% { transform: scale(1) } }
.pd-beat { animation: pd-beat 1s ease-in-out infinite }
@keyframes pd-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
.pd-float { animation: pd-float 3.2s ease-in-out infinite }
@keyframes pd-glint { 0% { transform: translateX(-120%) rotate(20deg) } 60%, 100% { transform: translateX(220%) rotate(20deg) } }
.pd-glint { animation: pd-glint 3.4s ease-in-out infinite }
@keyframes pd-star { 0%,100% { transform: scale(.3) rotate(0deg); opacity: 0 } 50% { transform: scale(1) rotate(45deg); opacity: 1 } }
.pd-star { animation: pd-star 1.8s ease-in-out infinite }
@keyframes pd-ping { 0% { transform: scale(.85); opacity: .8 } 100% { transform: scale(1.6); opacity: 0 } }
.pd-ping { animation: pd-ping 1.7s ease-out infinite }
@media (prefers-reduced-motion: reduce) {
  .pd-dust, .pd-beat, .pd-float, .pd-glint, .pd-star, .pd-ping { animation: none !important }
}
`;
