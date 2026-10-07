"use client";

// ─── useSynthMusic — a soft, licence-safe background melody ──────────────────
//
// Zero bytes, zero licences: a gentle music-box arpeggio over a warm pad,
// synthesised with Web Audio (see the infringement note in
// proposal/components/music.ts — no commercial recordings on our CDN).
//
// Browsers only allow audio after a user gesture, so it never autoplays: when
// `enabled` (the sender's `data.music`), it starts on the visitor's FIRST tap
// or key press anywhere, and <MusicToggle> lets them turn it off/on. It pauses
// while the tab is hidden and stops on unmount. In the editor preview pass
// `enabled: false` (or mode === "live" && data.music) to keep editing quiet.
//
//   const music = useSynthMusic({ melody: day.melody, enabled: mode === "live" && data.music });
//   <MusicToggle music={music} />

import { useCallback, useEffect, useRef, useState } from "react";
import type { DayConfig } from "../types";

export type MelodyId = DayConfig["melody"];

/** Semitone offsets from the root, 8 steps per bar, -1 = rest. */
const MELODIES: Record<MelodyId, { root: number; bpm: number; wave: OscillatorType; bars: number[][] }> = {
  garden: { root: 72, bpm: 84, wave: "sine", bars: [[0, 4, 7, 12, 7, 4, 2, -1], [-3, 0, 4, 9, 4, 0, -1, -1], [-7, -3, 0, 5, 9, 5, 4, -1], [-5, -1, 2, 7, 2, -1, -1, -1]] },
  velvet: { root: 69, bpm: 72, wave: "triangle", bars: [[0, 3, 7, 10, 7, 3, -1, -1], [-4, 0, 3, 8, 3, 0, -1, -1], [-7, -4, 0, 5, 8, 5, 3, -1], [-5, -2, 2, 7, 2, -1, -1, -1]] },
  cocoa: { root: 67, bpm: 90, wave: "triangle", bars: [[0, 4, 7, 4, 9, 7, 4, -1], [-3, 0, 4, 0, 5, 4, 0, -1], [-5, -1, 2, 5, 7, 5, 2, -1], [0, 4, 7, 12, -1, -1, -1, -1]] },
  arcade: { root: 76, bpm: 108, wave: "square", bars: [[0, 4, 7, 4, 0, 4, 7, 12], [-3, 0, 4, 0, -3, 0, 4, 9], [-7, -3, 0, -3, -7, -3, 0, 5], [-5, -1, 2, 7, 2, -1, -5, -1]] },
  paper: { root: 72, bpm: 76, wave: "sine", bars: [[0, 7, 4, 7, 0, 7, 4, -1], [-3, 4, 0, 4, -3, 4, 0, -1], [-7, 0, -3, 0, -7, 0, -3, -1], [-5, 2, -1, 2, -5, -1, -1, -1]] },
  cafe: { root: 70, bpm: 88, wave: "triangle", bars: [[0, 4, 7, 11, 7, 4, -1, -1], [2, 5, 9, 12, 9, 5, -1, -1], [-1, 2, 5, 9, 5, 2, -1, -1], [0, 4, 7, 12, 7, -1, -1, -1]] },
  blush: { root: 74, bpm: 96, wave: "sine", bars: [[0, 4, 7, 9, 7, 4, 0, -1], [-3, 0, 4, 7, 4, 0, -3, -1], [-5, -1, 2, 5, 2, -1, -5, -1], [0, 4, 7, 12, 7, -1, -1, -1]] },
  lantern: { root: 67, bpm: 66, wave: "sine", bars: [[0, 7, 12, 16, 12, 7, -1, -1], [-4, 3, 8, 12, 8, 3, -1, -1], [-7, 0, 5, 9, 5, 0, -1, -1], [-5, 2, 7, 11, 7, 2, -1, -1]] },
};

const freq = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

export interface SynthMusic {
  playing: boolean;
  /** Whether music is on for this page at all (the sender's toggle). */
  available: boolean;
  toggle: () => void;
  start: () => void;
  stop: () => void;
}

export function useSynthMusic({ melody, enabled, volume = 0.5 }: { melody: MelodyId; enabled: boolean; volume?: number }): SynthMusic {
  const [playing, setPlaying] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const timerRef = useRef<number | null>(null);
  const stepRef = useRef(0);
  const nextAtRef = useRef(0);
  const userOff = useRef(false);

  const schedule = useCallback(() => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;
    const m = MELODIES[melody];
    const stepDur = 60 / m.bpm / 2;
    while (nextAtRef.current < ctx.currentTime + 0.3) {
      const s = stepRef.current;
      const bar = m.bars[Math.floor(s / 8) % m.bars.length];
      const note = bar[s % 8];
      const t = nextAtRef.current;
      if (note !== -1) {
        // Music-box pluck.
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = m.wave === "square" ? "square" : m.wave;
        o.frequency.value = freq(m.root + note);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(m.wave === "square" ? 0.025 : 0.08, t + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0008, t + stepDur * 3.2);
        o.connect(g).connect(master);
        o.start(t);
        o.stop(t + stepDur * 3.4);
      }
      if (s % 8 === 0) {
        // Soft pad on the bar's first note, an octave down.
        const first = bar.find((x) => x !== -1) ?? 0;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.value = freq(m.root + first - 12);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.045, t + 0.4);
        g.gain.linearRampToValueAtTime(0, t + stepDur * 8);
        o.connect(g).connect(master);
        o.start(t);
        o.stop(t + stepDur * 8 + 0.05);
      }
      stepRef.current = s + 1;
      nextAtRef.current = t + stepDur;
    }
  }, [melody]);

  const stop = useCallback(() => {
    if (timerRef.current != null) window.clearInterval(timerRef.current);
    timerRef.current = null;
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (ctx && master) master.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
    setPlaying(false);
  }, []);

  const start = useCallback(() => {
    if (!enabled || typeof window === "undefined") return;
    const Ctor = (window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext) as typeof AudioContext | undefined;
    if (!Ctor) return;
    if (!ctxRef.current) {
      const ctx = new Ctor();
      const master = ctx.createGain();
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 2400;
      master.gain.value = 0;
      master.connect(lp).connect(ctx.destination);
      ctxRef.current = ctx;
      masterRef.current = master;
    }
    const ctx = ctxRef.current;
    if (ctx.state === "suspended") void ctx.resume();
    masterRef.current!.gain.setTargetAtTime(volume, ctx.currentTime, 0.6);
    if (timerRef.current == null) {
      nextAtRef.current = ctx.currentTime + 0.08;
      schedule();
      timerRef.current = window.setInterval(schedule, 120);
    }
    setPlaying(true);
  }, [enabled, schedule, volume]);

  const toggle = useCallback(() => {
    if (playing) {
      userOff.current = true;
      stop();
    } else {
      userOff.current = false;
      start();
    }
  }, [playing, start, stop]);

  // First gesture anywhere starts it (unless they turned it off).
  useEffect(() => {
    if (!enabled) {
      stop();
      return;
    }
    const go = () => {
      if (!userOff.current && timerRef.current == null) start();
    };
    window.addEventListener("pointerdown", go, { once: true });
    window.addEventListener("keydown", go, { once: true });
    return () => {
      window.removeEventListener("pointerdown", go);
      window.removeEventListener("keydown", go);
    };
  }, [enabled, start, stop]);

  // Hidden tab → pause; back → resume if it was playing.
  useEffect(() => {
    const onVis = () => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      if (document.hidden) void ctx.suspend();
      else if (timerRef.current != null) void ctx.resume();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current != null) window.clearInterval(timerRef.current);
      void ctxRef.current?.close().catch(() => {});
      ctxRef.current = null;
    },
    [],
  );

  return { playing, available: enabled, toggle, start, stop };
}

/** A small round speaker button. Renders nothing when music is off for the page. */
export function MusicToggle({ music, style }: { music: SynthMusic; style?: React.CSSProperties }) {
  if (!music.available) return null;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        music.toggle();
      }}
      aria-pressed={music.playing}
      aria-label={music.playing ? "Turn music off" : "Turn music on"}
      style={{
        position: "fixed",
        left: 12,
        top: 12,
        zIndex: 95,
        width: 44,
        height: 44,
        borderRadius: "50%",
        border: "1px solid var(--vw-edge, rgba(0,0,0,.1))",
        background: "var(--vw-glass, rgba(255,255,255,.7))",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        color: "var(--vw-ink, #333)",
        fontSize: 18,
        cursor: "pointer",
        display: "grid",
        placeItems: "center",
        ...style,
      }}
    >
      {music.playing ? "🔊" : "🔈"}
    </button>
  );
}

export default useSynthMusic;
