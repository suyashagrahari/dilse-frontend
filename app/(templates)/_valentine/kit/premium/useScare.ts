"use client";

// ─── useScare() — the jump-scare's sound, duck and buzz in one call ──────────
//
//   const scare = useScare();                       // preloads boo-scare.mp3
//   <button onClick={() => { scare(); setBoo(true); }}>Knock</button>
//
// scare() — call it from the tap that causes the scare, on the frame the
// picture lands:
//   1. plays the "boo" sample through the SFX bus (mute-aware, ~0 ms latency);
//   2. ducks the background music for ~2.2 s and eases it back (duckFor);
//   3. fires a strong haptic (Android; a no-op on iOS) — skipped with
//      prefers-reduced-motion, where the sound plays a little softer too.
// Silent (duck + buzz only) when the sender chose "no music" or the visitor
// turned the music/sound off. The visual is yours: every scare needs one.
//
// Works on $2 days too (no PremiumRoot, no gate): until the Web Audio context
// is unlocked, the hook listens for the visitor's first tap anywhere and runs
// unlockAudioInGesture() inside it, and scare() itself does the same when it
// is the first tap. On premium days the gate has already done it.

import { useCallback, useEffect } from "react";
import { MEDIA_BASE } from "@/lib/templateMedia";
import { useDayMusic } from "../../music/context";
import { haptic } from "../haptic";
import { useReducedMotion } from "../useReducedMotion";
import { audioSnapshot, unlockAudioInGesture } from "./audio";
import { loadSample, playSample, type SampleOptions } from "./samples";
import type { CueHandle } from "./sfx";

export const BOO_SCARE_URL = `${MEDIA_BASE}/templates/_halloween/boo-scare.mp3`;
export const SCARE_DUCK_MS = 2200;
export const SCARE_HAPTIC = [70, 40, 140];

export interface ScareOptions {
  /** Sample id (default "boo"). */
  id?: string;
  /** Sample URL (default BOO_SCARE_URL). */
  url?: string;
  /** Sample loudness, 0–2 (default 1.6 — the SFX bus sits ~6 dB under the song). */
  gain?: number;
  /** How long the music stays ducked (default 2200 ms). */
  duckMs?: number;
  /** Music level while ducked, 0–1 (default 0.15). */
  duckLevel?: number;
  /** Vibration pattern (default [70, 40, 140]); false = none. */
  haptic?: number[] | false;
}

/** Unlock the shared AudioContext on the first tap anywhere (for pages without a PremiumGate). */
export function useUnlockAudioOnFirstTap(): void {
  useEffect(() => {
    if (audioSnapshot().unlocked) return;
    const evs = ["pointerdown", "touchend", "click", "keydown"] as const;
    const go = () => {
      unlockAudioInGesture();
      for (const ev of evs) window.removeEventListener(ev, go, true);
    };
    for (const ev of evs) window.addEventListener(ev, go, { capture: true, passive: true });
    return () => {
      for (const ev of evs) window.removeEventListener(ev, go, true);
    };
  }, []);
}

/** Per-call overrides for scare(). */
export type ScareCallOptions = Omit<ScareOptions, "id" | "url"> & Pick<SampleOptions, "pan" | "rate">;

export function useScare(defaults: ScareOptions = {}): (o?: ScareCallOptions) => CueHandle {
  const music = useDayMusic();
  const reduce = useReducedMotion();
  const id = defaults.id ?? "boo";
  const url = defaults.url ?? BOO_SCARE_URL;

  useUnlockAudioOnFirstTap();
  // Fetch now; it decodes the moment the context is unlocked.
  useEffect(() => {
    void loadSample(id, url);
  }, [id, url]);

  const { gain, duckMs, duckLevel } = defaults;
  const buzz = defaults.haptic;
  const scare = useCallback(
    (o: ScareCallOptions = {}): CueHandle => {
      if (!audioSnapshot().unlocked) unlockAudioInGesture();
      const silent = !!music && (music.mode === "off" || music.userOff);
      const g = o.gain ?? gain ?? 1.6;
      const h = silent ? { stop: () => {}, peakIn: 0 } : playSample(id, { gain: reduce ? g * 0.7 : g, pan: o.pan, rate: o.rate });
      music?.duckFor(o.duckMs ?? duckMs ?? SCARE_DUCK_MS, o.duckLevel ?? duckLevel ?? 0.15);
      const pattern = o.haptic ?? buzz ?? SCARE_HAPTIC;
      if (pattern && !reduce) haptic(pattern);
      return h;
    },
    [music, reduce, id, gain, duckMs, duckLevel, buzz],
  );
  // Dev only: `window.__vwScare()` fires the scare from a test (Playwright) or the console.
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const w = window as unknown as { __vwScare?: typeof scare };
    w.__vwScare = scare;
    return () => {
      if (w.__vwScare === scare) delete w.__vwScare;
    };
  }, [scare]);
  return scare;
}
