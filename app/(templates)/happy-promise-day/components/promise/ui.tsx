"use client";

// Small building blocks shared by the Promise Day sections: the chunky button,
// the pulsing hint chip, the section shell, a seeded RNG for the procedural
// art, and a tiny WebAudio SFX set (click / snap / splash / stamp) that only
// ever plays after a user gesture and only when the sender left music on.

import { useEffect, type CSSProperties, type ReactNode } from "react";
import { motion } from "framer-motion";
import { FONTS, VW } from "../../../_valentine/theme";
import { useReducedMotion } from "../../../_valentine/kit";

export const P = {
  blush: "#FFF4EE",
  petal: "#F7B6C8",
  rose: "#E86A92",
  berry: "#8E1F4A",
  berryDeep: "#5E1433",
  sindoor: "#C8322F",
  gold: "#D9A441",
  goldLight: "#F3D58C",
  river: "#2E3A6B",
  riverLight: "#5B6BA8",
  mint: "#CDEBDD",
  butter: "#FFE7A8",
  lilac: "#E9D7FF",
  skin: "#F8C9A6",
  skinShade: "#E9A982",
  skinInk: "#7A3B2E",
  paper: "#FFFBF2",
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
        boxShadow: "0 6px 18px -10px rgba(142,31,74,.35)",
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
  /** A crisp little click (snap / lock shut). */
  click(pitch = 1) {
    const c = ctx();
    if (!c) return;
    const t = c.currentTime;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "square";
    o.frequency.setValueAtTime(1800 * pitch, t);
    o.frequency.exponentialRampToValueAtTime(400 * pitch, t + 0.05);
    g.gain.setValueAtTime(0.06, t);
    g.gain.exponentialRampToValueAtTime(0.0005, t + 0.07);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + 0.08);
  },
  /** Paper / seal crack. */
  crack() {
    const c = ctx();
    if (!c) return;
    const s = noise(c, 0.18);
    const f = c.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = 1400;
    const g = c.createGain();
    g.gain.value = 0.18;
    s.connect(f).connect(g).connect(c.destination);
    s.start();
  },
  /** A soft thump (the notary stamp). */
  thump() {
    const c = ctx();
    if (!c) return;
    const t = c.currentTime;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(48, t + 0.18);
    g.gain.setValueAtTime(0.35, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + 0.26);
  },
  /** Water. */
  splash() {
    const c = ctx();
    if (!c) return;
    const s = noise(c, 0.55);
    const f = c.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 900;
    f.Q.value = 0.7;
    const g = c.createGain();
    g.gain.value = 0.22;
    s.connect(f).connect(g).connect(c.destination);
    s.start();
  },
  /** Two-note chime (a little "ta-da"). */
  chime() {
    const c = ctx();
    if (!c) return;
    const t = c.currentTime;
    [988, 1319].forEach((fq, i) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = "triangle";
      o.frequency.value = fq;
      g.gain.setValueAtTime(0, t + i * 0.09);
      g.gain.linearRampToValueAtTime(0.07, t + i * 0.09 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0005, t + i * 0.09 + 0.6);
      o.connect(g).connect(c.destination);
      o.start(t + i * 0.09);
      o.stop(t + i * 0.09 + 0.62);
    });
  },
};
