"use client";

// ─── useGyroParallax + <ParallaxLayer> — layered depth from pointer / gyro ───
//
//   const par = useGyroParallax();                    // springs in -1 … 1
//   <ParallaxLayer par={par} depth={8}>  <Backdrop/> </ParallaxLayer>   // far: moves little
//   <ParallaxLayer par={par} depth={28}> <Fluent3D name="rose"/> </ParallaxLayer>  // near
//
// One shared listener for the page (./shared.ts). Desktop follows the mouse,
// phones follow the gyro once `requestTiltPermission()` has run in a gesture
// (Android needs no prompt). Reduced motion: the values stay at 0.

import { motion, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useEffect, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "../../useReducedMotion";
import { subscribeTilt } from "./shared";

export interface GyroParallax {
  /** -1 … 1 (left → right), spring-smoothed. */
  x: MotionValue<number>;
  /** -1 … 1 (top → bottom), spring-smoothed. */
  y: MotionValue<number>;
}

export interface GyroParallaxOptions {
  /** Spring stiffness (default 60 — slow and heavy reads as expensive). */
  stiffness?: number;
  damping?: number;
  /** Turn it off without unmounting (e.g. during a transition). */
  disabled?: boolean;
}

export function useGyroParallax({ stiffness = 60, damping = 18, disabled = false }: GyroParallaxOptions = {}): GyroParallax {
  const reduce = useReducedMotion();
  const x = useSpring(0, { stiffness, damping, mass: 1 });
  const y = useSpring(0, { stiffness, damping, mass: 1 });
  useEffect(() => {
    if (reduce || disabled) {
      x.set(0);
      y.set(0);
      return;
    }
    return subscribeTilt((s) => {
      x.set(s.x);
      y.set(s.y);
    });
  }, [reduce, disabled, x, y]);
  return { x, y };
}

/** Moves its children by up to `depth` px against the tilt (positive = nearer). */
export function ParallaxLayer({ par, depth, rotate = 0, children, style, className }: {
  par: GyroParallax;
  depth: number;
  /** Optional max degrees of 3D rotation for "object" layers. */
  rotate?: number;
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  const tx = useTransform(par.x, (v) => -v * depth);
  const ty = useTransform(par.y, (v) => -v * depth);
  const rx = useTransform(par.y, (v) => v * rotate);
  const ry = useTransform(par.x, (v) => -v * rotate);
  return (
    <motion.div className={className} style={{ x: tx, y: ty, rotateX: rotate ? rx : 0, rotateY: rotate ? ry : 0, willChange: "transform", ...style }}>
      {children}
    </motion.div>
  );
}
