"use client";

// ─── <TiltCard> — a physical object: 3D tilt, moving glare, soft lift shadow ──
//
//   <TiltCard radius={6} foil>             // holographic foil on a ticket/card
//     <div style={{ aspectRatio: "4/5" }}><CroppedPhoto photo={p} /></div>
//   </TiltCard>
//
// Desktop: tilts toward the pointer over the card. Phones: follows the gyro
// (call `requestTiltPermission()` inside your start gesture for iOS), and also
// follows a finger dragged across it. The glare is a white radial highlight
// that slides opposite the tilt (screen blend); `foil` adds a rainbow sheen
// (color-dodge) that shifts with the angle. Transforms only — no layout work.
// Reduced motion: flat, with a static soft glare.

import { motion, useMotionTemplate, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "../../useReducedMotion";
import { subscribeTilt, useActive } from "./shared";

export interface TiltCardProps {
  children: ReactNode;
  /** Max tilt in degrees (default 12). */
  max?: number;
  radius?: number;
  /** Specular glare strength 0–1 (default 0.35). */
  glare?: number;
  /** Holographic foil sheen. */
  foil?: boolean;
  /** Follow the page-wide gyro/pointer as well as pointer-over-card (default true). */
  gyro?: boolean;
  /** Idle sway when nothing is driving it (default true). */
  idle?: boolean;
  shadow?: boolean;
  style?: CSSProperties;
  className?: string;
}

export default function TiltCard({ children, max = 12, radius = 14, glare = 0.35, foil = false, gyro = true, idle = true, shadow = true, style, className }: TiltCardProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const active = useActive(wrap);
  const over = useRef(false);
  const spring = { stiffness: 120, damping: 16, mass: 0.6 };
  const nx = useSpring(0, spring); // -1 … 1
  const ny = useSpring(0, spring);

  useEffect(() => {
    if (reduce || !active) return;
    let raf = 0;
    let lastDrive = 0;
    const unsub = gyro
      ? subscribeTilt((s) => {
          if (over.current || s.source !== "gyro") return;
          lastDrive = performance.now();
          nx.set(s.x);
          ny.set(s.y);
        })
      : () => {};
    // Idle: a slow figure-of-eight so a still card still catches the light.
    const sway = (t: number) => {
      raf = requestAnimationFrame(sway);
      if (over.current || t - lastDrive < 2500) return;
      nx.set(Math.sin(t / 2300) * 0.45);
      ny.set(Math.sin(t / 1700) * 0.3);
    };
    if (idle) raf = requestAnimationFrame(sway);
    return () => {
      unsub();
      cancelAnimationFrame(raf);
    };
  }, [reduce, active, gyro, idle, nx, ny]);

  const rotateY = useTransform(nx, (v) => v * max);
  const rotateX = useTransform(ny, (v) => -v * max);
  const gx = useTransform(nx, (v) => 50 - v * 45);
  const gy = useTransform(ny, (v) => 50 - v * 45);
  const glareBg = useMotionTemplate`radial-gradient(80% 65% at ${gx}% ${gy}%, rgba(255,255,255,${glare}) 0%, rgba(255,255,255,${glare * 0.25}) 35%, transparent 65%)`;
  const foilPos = useMotionTemplate`${gx}% ${gy}%`;
  const shX = useTransform(nx, (v) => -v * 14);
  const shY = useTransform(ny, (v) => 18 - v * 8);

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || reduce) return;
    const r = el.getBoundingClientRect();
    over.current = true;
    nx.set(((e.clientX - r.left) / r.width) * 2 - 1);
    ny.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };
  const onLeave = () => {
    over.current = false;
    nx.set(0);
    ny.set(0);
  };

  return (
    <div ref={wrap} className={className} style={{ perspective: 900, position: "relative", ...style }}>
      {shadow && (
        <motion.div
          aria-hidden
          style={{
            position: "absolute", left: "8%", right: "8%", bottom: "-4%", height: "18%", borderRadius: "50%",
            background: "rgba(0,0,0,.55)", filter: "blur(22px)", x: shX, y: shY, opacity: 0.7,
          }}
        />
      )}
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        onPointerCancel={onLeave}
        style={{
          position: "relative", borderRadius: radius, transformStyle: "preserve-3d", rotateX, rotateY, willChange: "transform",
          boxShadow: "0 1px 0 rgba(255,255,255,.25) inset, 0 30px 60px -20px rgba(0,0,0,.45), 0 12px 24px -12px rgba(0,0,0,.35)",
        }}
      >
        <div style={{ borderRadius: radius, overflow: "hidden", position: "relative", transform: "translateZ(0)" }}>
          {children}
          {foil && (
            <motion.div
              aria-hidden
              style={{
                position: "absolute", inset: 0, pointerEvents: "none", mixBlendMode: "color-dodge", opacity: 0.38,
                backgroundImage:
                  "linear-gradient(115deg, transparent 20%, rgba(255,120,200,.55) 32%, rgba(120,220,255,.55) 42%, rgba(255,240,140,.55) 52%, rgba(160,140,255,.55) 62%, transparent 74%), repeating-linear-gradient(45deg, rgba(255,255,255,.07) 0 2px, transparent 2px 6px)",
                backgroundSize: "250% 250%, 100% 100%",
                backgroundPosition: foilPos,
              }}
            />
          )}
          <motion.div
            aria-hidden
            style={{ position: "absolute", inset: 0, pointerEvents: "none", mixBlendMode: "screen", background: reduce ? `linear-gradient(135deg, rgba(255,255,255,${glare * 0.5}), transparent 50%)` : glareBg }}
          />
        </div>
      </motion.div>
    </div>
  );
}
