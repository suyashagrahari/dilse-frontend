"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/** True only on the client (false during SSR and hydration) — keeps clocks and locale dates out of SSR. */
export function useMounted(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

/** Live `prefers-reduced-motion`. Drives the split-flap and the station pulse. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return reduced;
}

export interface Countdown {
  /** false until the client has mounted — render a dash, never a wrong number. */
  ready: boolean;
  /** true once the target has passed. Never yields negative components. */
  elapsed: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** "12d 04h 33m 12s" */
  text: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Ticks once a second toward an ISO target and clamps hard at zero.
 *
 * The zero crossing is the interesting case: the interval keeps running, the
 * component flips to `elapsed`, and every numeric field is 0 — so a caller that
 * forgets to check `elapsed` still renders "0d 00h 00m 00s" rather than negative
 * time. `elapsed` is what switches the band to DEPARTED.
 */
export function useCountdown(targetIso: string): Countdown {
  const mounted = useMounted();
  const [now, setNow] = useState(0);

  useEffect(() => {
    const first = setTimeout(() => setNow(Date.now()), 0);
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [targetIso]);

  const target = Date.parse(targetIso);
  if (!mounted || !now || Number.isNaN(target)) {
    return { ready: false, elapsed: false, days: 0, hours: 0, minutes: 0, seconds: 0, text: "--d --h --m --s" };
  }

  const diff = target - now;
  if (diff <= 0) {
    return { ready: true, elapsed: true, days: 0, hours: 0, minutes: 0, seconds: 0, text: "0d 00h 00m 00s" };
  }

  const s = Math.floor(diff / 1000);
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  return {
    ready: true,
    elapsed: false,
    days,
    hours,
    minutes,
    seconds,
    text: `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`,
  };
}

/**
 * A short, dry mechanical click — a filtered noise burst, built on the fly.
 *
 * A split-flap board without the clack is just a number changing. The context is
 * created lazily on the first GET STATUS press (a real user gesture) so autoplay
 * policy never blocks it, and every failure path is swallowed: the reveal must
 * still work with audio unavailable, muted, or denied.
 */
export function useClick(): () => void {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => () => { void ctxRef.current?.close().catch(() => {}); }, []);

  return () => {
    try {
      type Win = Window & { webkitAudioContext?: typeof AudioContext };
      const Ctor = window.AudioContext || (window as Win).webkitAudioContext;
      if (!Ctor) return;
      const ctx = ctxRef.current ?? (ctxRef.current = new Ctor());
      if (ctx.state === "suspended") void ctx.resume().catch(() => {});

      const dur = 0.035;
      const frames = Math.floor(ctx.sampleRate * dur);
      const buf = ctx.createBuffer(1, frames, ctx.sampleRate);
      const ch = buf.getChannelData(0);
      for (let i = 0; i < frames; i++) {
        // white noise under a steep exponential decay = a flap hitting its stop
        ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / frames, 6);
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;

      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 2100;
      bp.Q.value = 1.1;

      const gain = ctx.createGain();
      gain.gain.value = 0.16;

      src.connect(bp).connect(gain).connect(ctx.destination);
      src.start();
    } catch {
      /* no audio available — the reveal is still fully legible without it */
    }
  };
}
