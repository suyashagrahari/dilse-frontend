"use client";

// Small shared pieces for the Rose Day experience: buttons, the screen
// wrapper, the ambient falling petals and an imperative petal shower drawn
// with real SVG petals in the sender's rose colour.

import { forwardRef, type CSSProperties, type ReactNode } from "react";
import { motion } from "framer-motion";
import { FONTS, VW } from "../../../_valentine/theme";
import { prefersReducedMotion } from "../../../_valentine/kit";
import type { RoseShades } from "./art";

export const EASE = [0.2, 0.8, 0.2, 1] as const;

export const primaryBtn: CSSProperties = {
  minHeight: 54,
  padding: "14px 28px",
  borderRadius: 999,
  border: 0,
  background: VW.accent,
  color: VW.accentInk,
  font: `600 17px ${FONTS.ui}`,
  boxShadow: `0 5px 0 ${VW.accentDeep}, 0 18px 30px -14px rgba(90,26,43,.55)`,
  cursor: "pointer",
  touchAction: "manipulation",
};

export const ghostBtn: CSSProperties = {
  minHeight: 44,
  padding: "10px 18px",
  borderRadius: 999,
  border: `1.5px solid ${VW.edge}`,
  background: "rgba(255,255,255,.6)",
  color: VW.inkSoft,
  font: `600 14px ${FONTS.ui}`,
  cursor: "pointer",
  touchAction: "manipulation",
};

export const kicker: CSSProperties = {
  margin: 0,
  font: `600 12.5px ${FONTS.ui}`,
  letterSpacing: ".2em",
  textTransform: "uppercase",
  color: VW.inkSoft,
};

export const Screen = forwardRef<HTMLElement, { id: string; preview: boolean; children: ReactNode; reduced: boolean; style?: CSSProperties }>(function Screen(
  { id, preview, children, reduced, style },
  ref,
) {
  return (
    <motion.section
      ref={ref}
      key={id}
      data-rose-step={id}
      initial={reduced ? false : { opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduced ? undefined : { opacity: 0, y: -16, transition: { duration: 0.3 } }}
      transition={{ duration: 0.55, ease: EASE }}
      style={{
        position: "relative",
        zIndex: 2,
        minHeight: "calc(100dvh - var(--vw-dock-space, 0px))",
        width: "100%",
        maxWidth: "calc(520px * var(--vw-s, 1))",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        padding: `66px 18px ${preview ? 124 : 40}px`,
        textAlign: "center",
        boxSizing: "border-box",
        ...style,
      }}
    >
      {children}
    </motion.section>
  );
});

export const petalSvg = (fill: string, edge: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 -26 40 52" width="100%" height="100%"><path d="M0 24 C -16 14 -20 -8 -8 -22 C -4 -26 4 -26 8 -22 C 20 -8 16 14 0 24 Z" fill="${fill}"/><path d="M0 22 C -2 8 -1 -6 0 -18" stroke="${edge}" stroke-width="1.3" fill="none" opacity=".45"/></svg>`;

/** A shower of real petals flung from a point (viewport fractions). */
export function petalShower(sh: RoseShades, origin = { x: 0.5, y: 0.4 }, count = 40) {
  if (typeof document === "undefined" || prefersReducedMotion()) return;
  const layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  layer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:300;overflow:hidden;contain:strict";
  document.body.appendChild(layer);
  const W = window.innerWidth;
  const H = window.innerHeight;
  const ox = origin.x * W;
  const oy = origin.y * H;
  const fills = [sh.petal, sh.light, sh.dark, sh.petal];
  let left = count;
  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    const size = 12 + Math.random() * 16;
    el.innerHTML = petalSvg(fills[i % fills.length], sh.deep);
    el.style.cssText = `position:absolute;left:${ox - size / 2}px;top:${oy - size / 2}px;width:${size}px;height:${size * 1.3}px;will-change:transform,opacity`;
    layer.appendChild(el);
    const ang = Math.random() * Math.PI * 2;
    const r = (0.18 + Math.random() * 0.32) * Math.min(W, H);
    const dx = Math.cos(ang) * r;
    const dy = Math.sin(ang) * r * 0.7 - 40;
    const fall = H * (0.45 + Math.random() * 0.4);
    const sway = (Math.random() - 0.5) * 120;
    const rot = (Math.random() - 0.5) * 720;
    const a = el.animate(
      [
        { transform: "translate(0,0) rotate(0deg) scale(.4)", opacity: 0 },
        { transform: `translate(${dx}px,${dy}px) rotate(${rot * 0.3}deg) scale(1)`, opacity: 1, offset: 0.22 },
        { transform: `translate(${dx + sway}px,${dy + fall * 0.5}px) rotate(${rot * 0.7}deg) rotateX(160deg) scale(1)`, opacity: 1, offset: 0.65 },
        { transform: `translate(${dx - sway * 0.6}px,${dy + fall}px) rotate(${rot}deg) rotateX(320deg) scale(.9)`, opacity: 0 },
      ],
      { duration: 1500 + Math.random() * 900, easing: "cubic-bezier(.2,.7,.3,1)", delay: Math.random() * 120 },
    );
    a.onfinish = () => {
      el.remove();
      if (--left <= 0) layer.remove();
    };
  }
}

/** Slow falling petals behind everything (8–12 at a time). Off under reduced motion. */
export function FallingPetals({ sh, count = 10, reduced }: { sh: RoseShades; count?: number; reduced: boolean }) {
  if (reduced) return null;
  const petals = Array.from({ length: count }, (_, i) => {
    const seed = (i * 9301 + 49297) % 233280;
    const rnd = (k: number) => ((seed * (k + 3)) % 997) / 997;
    return { left: rnd(1) * 100, size: 10 + rnd(2) * 12, dur: 11 + rnd(3) * 9, delay: -rnd(4) * 18, sway: (rnd(5) - 0.5) * 120, fill: i % 3 === 0 ? sh.light : sh.petal, op: 0.35 + rnd(6) * 0.35 };
  });
  return (
    <div aria-hidden style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {petals.map((p, i) => (
        <span
          key={i}
          className="rd-fall"
          style={{
            position: "absolute",
            top: -40,
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.3,
            opacity: p.op,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
            ["--rd-sway" as string]: `${p.sway}px`,
          }}
        >
          <svg viewBox="-20 -26 40 52" width="100%" height="100%">
            <path d="M0 24 C -16 14 -20 -8 -8 -22 C -4 -26 4 -26 8 -22 C 20 -8 16 14 0 24 Z" fill={p.fill} />
          </svg>
        </span>
      ))}
    </div>
  );
}

/** Local keyframes. No quotes or angle brackets: React text-escapes <style> children on the server. */
export const ROSE_CSS = `
@keyframes rd-fall { 0% { transform: translate3d(0,-5vh,0) rotate(0deg) } 50% { transform: translate3d(var(--rd-sway),50vh,0) rotate(200deg) } 100% { transform: translate3d(0,110vh,0) rotate(400deg) } }
.rd-fall { animation: rd-fall 14s linear infinite }
@keyframes rd-sway { 0%,100% { transform: rotate(-1.4deg) } 50% { transform: rotate(1.4deg) } }
.rd-sway { animation: rd-sway 4s ease-in-out infinite; transform-origin: 50% 92% }
@keyframes rd-breathe { 0%,100% { transform: scale(1) } 50% { transform: scale(1.06) } }
.rd-breathe { animation: rd-breathe 1.8s ease-in-out infinite }
@keyframes rd-ping { 0% { transform: scale(.8); opacity: .8 } 100% { transform: scale(1.9); opacity: 0 } }
.rd-ping { animation: rd-ping 1.6s ease-out infinite }
@keyframes rd-ink { 0% { opacity: 0; filter: blur(3px); color: var(--rd-ink-wet) } 60% { opacity: 1; filter: blur(.4px) } 100% { opacity: 1; filter: blur(0) } }
.rd-word { opacity: 0; animation: rd-ink .9s ease-out forwards }
.rd-shown .rd-word { animation: none; opacity: 1 }
@keyframes rd-twinkle { 0%,100% { opacity: .2; transform: scale(.6) } 50% { opacity: 1; transform: scale(1) } }
.rd-twinkle { animation: rd-twinkle 2.4s ease-in-out infinite }
@media (prefers-reduced-motion: reduce) {
  .rd-fall, .rd-sway, .rd-breathe, .rd-ping, .rd-twinkle { animation: none !important }
  .rd-word { animation: none !important; opacity: 1 }
}
`;
