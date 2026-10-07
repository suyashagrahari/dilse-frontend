"use client";

// Small building blocks shared by the Hug Day sections: the chunky button,
// the pulsing hint chip, the section shell, a seeded RNG for the procedural
// art, and a tiny WebAudio SFX set (bell / squish / pop / stamp / rip) that only
// ever plays after a user gesture and only when the sender left music on.

import { useEffect, type CSSProperties, type ReactNode } from "react";
import { motion } from "framer-motion";
import { FONTS, VW } from "../../../_valentine/theme";
import { useReducedMotion } from "../../../_valentine/kit";

export const H = {
  cream: "#FFF1E0",
  peach: "#FFB59A",
  strawberry: "#FF8FAB",
  cheek: "#FF6F91",
  cocoa: "#6B4232",
  cocoaDeep: "#4A2C20",
  butter: "#FFD98A",
  lavender: "#CDB8F0",
  chalk: "#3B3A36",
  wood: "#9A6A44",
  mint: "#BFE6D3",
  paper: "#FFFAF3",
} as const;

export const btn: CSSProperties = {
  minHeight: 54,
  padding: "14px 28px",
  borderRadius: 18,
  border: 0,
  background: VW.accent,
  color: VW.accentInk,
  font: `700 17px ${FONTS.ui}`,
  boxShadow: `0 5px 0 ${VW.accentDeep}, 0 16px 30px -14px rgba(0,0,0,.45)`,
  cursor: "pointer",
  touchAction: "manipulation",
};

export const ghostBtn: CSSProperties = {
  minHeight: 44,
  padding: "10px 18px",
  borderRadius: 14,
  border: `1.5px solid ${VW.edge}`,
  background: VW.glass,
  color: VW.ink,
  font: `600 14px ${FONTS.ui}`,
  cursor: "pointer",
  touchAction: "manipulation",
};

export function Btn({ children, onClick, style, disabled, ariaLabel }: { children: ReactNode; onClick?: () => void; style?: CSSProperties; disabled?: boolean; ariaLabel?: string }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      whileTap={disabled ? undefined : { scale: 0.96, y: 3 }}
      style={{ ...btn, opacity: disabled ? 0.5 : 1, ...style }}
    >
      {children}
    </motion.button>
  );
}

/** A soft, pulsing instruction chip. */
export function Hint({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  const reduced = useReducedMotion();
  return (
    <motion.p
      initial={{ opacity: 0, y: 6 }}
      animate={reduced ? { opacity: 1, y: 0 } : { opacity: [0.75, 1, 0.75], y: 0 }}
      transition={reduced ? { duration: 0.3 } : { opacity: { duration: 2.2, repeat: Infinity }, y: { duration: 0.4 } }}
      style={{
        margin: 0,
        padding: "8px 14px",
        borderRadius: 99,
        background: "rgba(255,255,255,.7)",
        border: `1px solid ${VW.edge}`,
        color: VW.ink,
        font: `600 13.5px ${FONTS.ui}`,
        boxShadow: "0 6px 18px -10px rgba(107,66,50,.35)",
        ...style,
      }}
    >
      {children}
    </motion.p>
  );
}

export function Kicker({ children, color }: { children: ReactNode; color?: string }) {
  return <p style={{ margin: 0, font: `600 12.5px ${FONTS.ui}`, letterSpacing: ".2em", textTransform: "uppercase", color: color ?? VW.inkSoft }}>{children}</p>;
}

export function Title({ children, color, size = 34 }: { children: ReactNode; color?: string; size?: number }) {
  return <h2 style={{ margin: 0, font: `700 ${size}px/1.15 ${FONTS.script}`, color: color ?? VW.ink, overflowWrap: "anywhere" }}>{children}</h2>;
}

/** Mulberry32 — deterministic art from a seed (same page → same thumbprint). */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

export const initial = (s: string, fallback: string) => {
  const ch = Array.from((s || "").trim())[0];
  return ch ? ch.toUpperCase() : fallback;
};

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

// ── SFX ────────────────────────────────────────────────────────────────────

let ac: AudioContext | null = null;
let sfxOn = false;

/** The Experience flips this from data.music (the sender's sound setting). */
export function useSfxEnabled(on: boolean) {
  useEffect(() => {
    sfxOn = on;
    return () => {
      sfxOn = false;
    };
  }, [on]);
}

function ctx(): AudioContext | null {
  if (!sfxOn || typeof window === "undefined") return null;
  try {
    if (!ac) {
      const C = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!C) return null;
      ac = new C();
    }
    if (ac.state === "suspended") void ac.resume();
    return ac;
  } catch {
    return null;
  }
}

function noise(c: AudioContext, dur: number) {
  const b = c.createBuffer(1, Math.max(1, Math.floor(c.sampleRate * dur)), c.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const s = c.createBufferSource();
  s.buffer = b;
  return s;
}

export const sfx = {
  /** Café door bell: two bright partials, long ring. */
  bell() {
    const c = ctx();
    if (!c) return;
    const t = c.currentTime;
    [1568, 2093, 2637].forEach((fq, i) => {
      [0, 0.16].forEach((d) => {
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = "sine";
        o.frequency.value = fq * (d ? 1.002 : 1);
        g.gain.setValueAtTime(0, t + d);
        g.gain.linearRampToValueAtTime(0.05 / (i + 1), t + d + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0004, t + d + 1.1);
        o.connect(g).connect(c.destination);
        o.start(t + d);
        o.stop(t + d + 1.15);
      });
    });
  },
  /** A soft "mmph" squish. */
  squish() {
    const c = ctx();
    if (!c) return;
    const t = c.currentTime;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(220, t);
    o.frequency.exponentialRampToValueAtTime(120, t + 0.22);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.16, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0005, t + 0.3);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + 0.32);
  },
  /** Bubble pop. */
  pop(pitch = 1) {
    const c = ctx();
    if (!c) return;
    const t = c.currentTime;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(500 * pitch, t);
    o.frequency.exponentialRampToValueAtTime(1100 * pitch, t + 0.06);
    g.gain.setValueAtTime(0.1, t);
    g.gain.exponentialRampToValueAtTime(0.0005, t + 0.1);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + 0.11);
  },
  /** Rubber stamp. */
  thump() {
    const c = ctx();
    if (!c) return;
    const t = c.currentTime;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(160, t);
    o.frequency.exponentialRampToValueAtTime(50, t + 0.16);
    g.gain.setValueAtTime(0.3, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + 0.23);
  },
  /** Paper tearing. */
  rip() {
    const c = ctx();
    if (!c) return;
    const s = noise(c, 0.35);
    const f = c.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = 2200;
    const g = c.createGain();
    g.gain.value = 0.16;
    s.connect(f).connect(g).connect(c.destination);
    s.start();
  },
  chime() {
    const c = ctx();
    if (!c) return;
    const t = c.currentTime;
    [784, 1047, 1319].forEach((fq, i) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = "triangle";
      o.frequency.value = fq;
      g.gain.setValueAtTime(0, t + i * 0.08);
      g.gain.linearRampToValueAtTime(0.06, t + i * 0.08 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0005, t + i * 0.08 + 0.6);
      o.connect(g).connect(c.destination);
      o.start(t + i * 0.08);
      o.stop(t + i * 0.08 + 0.62);
    });
  },
};
