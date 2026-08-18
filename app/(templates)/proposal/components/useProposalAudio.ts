"use client";

// ─── Proposal — music ────────────────────────────────────────────────────────
// Two sources, one interface:
//
//   • `musicUrl` set  → loop the sender's track through a real <audio loop>.
//   • `musicUrl` empty → synthesise a slow romantic arpeggio with WebAudio.
//
// The synth is the point: every proposal gets music at zero asset weight, and
// nothing is ever downloaded for it. Both paths only ever start from `start()`,
// which the gate button calls, so we never trip a browser autoplay policy.

import { useCallback, useEffect, useRef, useState } from "react";

/** I – V – vi – IV in C. The most reliably tear-jerking four bars in pop music. */
const CHORDS: number[][] = [
  [261.63, 329.63, 392.0, 523.25], // C  major
  [196.0, 246.94, 293.66, 392.0], // G  major
  [220.0, 261.63, 329.63, 440.0], // A  minor
  [174.61, 220.0, 261.63, 349.23], // F  major
];

const CHORD_MS = 3400;
/** Deliberately tiny. This sits *under* a proposal, it does not perform one. */
const PEAK_GAIN = 0.06;
const FILE_VOLUME = 0.55;

export interface ProposalAudio {
  /** True once the gate has been opened and something is playing. */
  started: boolean;
  muted: boolean;
  /** Called from the gate click — the user gesture that unlocks audio. */
  start: () => void;
  toggleMute: () => void;
  /**
   * Callback ref for the <audio loop> element, used when `musicUrl` is non-empty.
   * Exposed as a callback rather than a RefObject deliberately: handing a ref out
   * of a hook taints the whole returned object for the `react-hooks/refs` lint
   * rule, which then (correctly) refuses to let `started`/`muted` be read during
   * render.
   */
  attachAudio: (el: HTMLAudioElement | null) => void;
}

export function useProposalAudio(musicUrl: string): ProposalAudio {
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepRef = useRef(0);
  const liveRef = useRef(false);
  const startedRef = useRef(false);
  const mutedRef = useRef(false);

  /**
   * One bar: a sine pad swelling underneath, and the same chord walked upward as
   * a triangle arpeggio an octave above it. Long attacks and exponential
   * releases are what stop it sounding like a ringtone.
   */
  const scheduleBar = useCallback(() => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;

    const t = ctx.currentTime + 0.06;
    const chord = CHORDS[stepRef.current % CHORDS.length];
    stepRef.current += 1;

    // Pad: root + fifth, swelling in over a full second.
    const pad = ctx.createGain();
    pad.gain.setValueAtTime(0.0001, t);
    pad.gain.linearRampToValueAtTime(0.4, t + 1.1);
    pad.gain.exponentialRampToValueAtTime(0.0001, t + 3.9);
    pad.connect(master);
    for (const f of [chord[0], chord[2]]) {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = f;
      o.connect(pad);
      o.start(t);
      o.stop(t + 4);
    }

    // Arpeggio: one note every 300ms, an octave up so it sings over the pad.
    chord.forEach((f, i) => {
      const at = t + i * 0.3;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "triangle";
      o.frequency.value = f * 2;
      g.gain.setValueAtTime(0.0001, at);
      g.gain.linearRampToValueAtTime(0.28, at + 0.14);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 1.9);
      o.connect(g).connect(master);
      o.start(at);
      o.stop(at + 2);
    });
  }, []);

  const start = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    setStarted(true);

    if (musicUrl) {
      const el = audioRef.current;
      if (el) {
        el.loop = true;
        el.volume = FILE_VOLUME;
        void el.play().catch(() => {});
      }
      return;
    }

    if (typeof window === "undefined") return;
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;

    const ctx = new AC();
    const master = ctx.createGain();
    master.gain.value = 0;
    // A gentle low-pass takes the edge off the triangle wave's upper harmonics,
    // which is the difference between "warm" and "cheap keyboard".
    const warmth = ctx.createBiquadFilter();
    warmth.type = "lowpass";
    warmth.frequency.value = 2200;
    warmth.Q.value = 0.4;
    master.connect(warmth).connect(ctx.destination);

    ctxRef.current = ctx;
    masterRef.current = master;
    void ctx.resume().catch(() => {});
    // Fade the music in rather than punching it in on the gate click.
    master.gain.linearRampToValueAtTime(PEAK_GAIN, ctx.currentTime + 1.8);

    liveRef.current = true;
    const tick = () => {
      if (!liveRef.current) return;
      scheduleBar();
      timerRef.current = setTimeout(tick, CHORD_MS);
    };
    tick();
  }, [musicUrl, scheduleBar]);

  const attachAudio = useCallback((el: HTMLAudioElement | null) => {
    audioRef.current = el;
    if (el) el.muted = mutedRef.current;
  }, []);

  const toggleMute = useCallback(() => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMuted(next);

    const el = audioRef.current;
    if (el) el.muted = next;

    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (ctx && master) {
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(next ? 0 : PEAK_GAIN, now + 0.35);
    }
  }, []);

  // Tear everything down: stop the scheduler, pause the file, close the context.
  useEffect(
    () => () => {
      liveRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
      const el = audioRef.current;
      if (el) el.pause();
      const ctx = ctxRef.current;
      if (ctx) {
        void ctx.close().catch(() => {});
        ctxRef.current = null;
        masterRef.current = null;
      }
    },
    [],
  );

  return { started, muted, start, toggleMute, attachAudio };
}
