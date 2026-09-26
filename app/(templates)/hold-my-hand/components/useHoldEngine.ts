"use client";

/**
 * The hold physics. One `requestAnimationFrame` loop, delta-time driven, owns
 * everything: progress, the heartbeat phase, haptics, audio and the line timers.
 * Nothing else is allowed a timer — a second clock is exactly how the pulse, the
 * buzz and the thump drift apart.
 *
 * Continuous values (progress, beat) never enter React state; they are handed to
 * `onFrame` so the caller can write them straight to the DOM. Only *discrete*
 * transitions (held/released, a line appearing, the win) cause a render.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BETRAYAL_GRACE_MS,
  BETRAYAL_LEAD_MS,
  GHOST_INTERVAL_MS,
  PUNISH_MS,
  type HoldLine,
  type HoldMode,
} from "./types";

// ─── Heartbeat ───────────────────────────────────────────────────────────────
// 60bpm. `navigator.vibrate([18, 90, 26])` = buzz 18ms, pause 90ms, buzz 26ms,
// so the two physical taps land at t=0 and t=108 inside the cycle. The visual
// pulse and the audio thumps use those exact onsets — that is what keeps the
// three channels in sync rather than merely "about the same speed".
const BEAT_PERIOD_MS = 1000;
const BEAT_ONSETS = [0, 108] as const;
const BEAT_ATTACK_MS = 40;
const BEAT_DECAY_MS = 200;
const VIBE_PATTERN: number[] = [18, 90, 26];
const VIBE_RELEASE_MS = 220;

/** Drain multipliers. 3x normally; 5x for two seconds after an evil-mode bite. */
const DRAIN_X = 3;
const PUNISH_DRAIN_X = 5;

/** A hold line's life: 400ms in, 2500ms on screen, 400ms out. */
export const LINE_IN_MS = 400;
export const LINE_HOLD_MS = 2500;
export const LINE_OUT_MS = 400;
const LINE_LIFE_MS = LINE_IN_MS + LINE_HOLD_MS + LINE_OUT_MS;

/** Release copy lives longer — it carries more than the hold lines do. */
const RELEASE_LIFE_MS = 3600;

export interface FrameState {
  progressMs: number;
  /** 0..1 */
  p: number;
  holding: boolean;
  /** 0..1 heartbeat envelope. Always 0 when released or under reduced motion. */
  beat: number;
  pointerCount: number;
}

export interface WinSummary {
  heldMs: number;
  releases: number;
  /** True when they were baited in evil mode and did not bite. */
  survivedBetrayal: boolean;
  /** True when the letter was revealed by the escape hatch rather than earned. */
  skipped: boolean;
}

export interface ActiveLine {
  id: number;
  text: string;
  kind: "hold" | "release" | "punish";
}

export interface HoldEngineOptions {
  durationMs: number;
  hands: 1 | 2;
  mode: HoldMode;
  holdLines: HoldLine[];
  /** How many ghost fragments exist, so the loop can cap the index. */
  ghostCount: number;
  reducedMotion: boolean;
  /** False parks the loop (used while the edit sheet is open). */
  enabled: boolean;
  onFrame: (s: FrameState) => void;
  onWin?: (s: WinSummary) => void;
  /** Supplies the sender's release copy — the engine does not own their words. */
  releaseLineFor?: (releaseCount: number) => string | null;
}

export function useHoldEngine(opts: HoldEngineOptions) {
  // The rAF loop is created once and reads options through this ref, so changing
  // a prop never tears the loop down (and never resets progress).
  const o = useRef(opts);
  o.current = opts;

  // ── Continuous state (refs only — never triggers a render) ─────────────────
  const progressRef = useRef(0);
  const beatClockRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef(0);
  const pointersRef = useRef<Set<number>>(new Set());
  const spaceRef = useRef(false);
  const holdingRef = useRef(false);
  const hasHeldRef = useRef(false);
  const wonRef = useRef(false);
  const skippedRef = useRef(false);
  const punishUntilRef = useRef(0);
  const baitedAtRef = useRef<number | null>(null);
  const baitLiveRef = useRef(false);
  const survivedBetrayalRef = useRef(false);
  const firedLinesRef = useRef<Set<number>>(new Set());
  const lineExpiresRef = useRef(0);
  const releaseCountRef = useRef(0);
  const lineIdRef = useRef(0);
  const coarseAtRef = useRef(0);

  // ── Discrete state (renders) ───────────────────────────────────────────────
  const [holding, setHolding] = useState(false);
  const [releaseCount, setReleaseCount] = useState(0);
  const [won, setWon] = useState(false);
  const [activeLine, setActiveLine] = useState<ActiveLine | null>(null);
  const [ghostsShown, setGhostsShown] = useState(0);
  const [baitLive, setBaitLive] = useState(false);
  const [pointerCount, setPointerCount] = useState(0);
  /** Coarse mirror of progress, ~6Hz — for the timer readout and a11y only. */
  const [coarseMs, setCoarseMs] = useState(0);

  // ── Audio (iOS Safari has no Vibration API — this is the substitute) ───────
  const [hasVibrate] = useState(
    () => typeof navigator !== "undefined" && typeof navigator.vibrate === "function",
  );
  const [audioArmed, setAudioArmed] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const audioOnRef = useRef(false);

  /** Built on the first pointerdown — a user gesture — or autoplay policy kills it. */
  const armAudio = useCallback(() => {
    if (audioCtxRef.current) {
      void audioCtxRef.current.resume().catch(() => {});
      return;
    }
    try {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      const ctx = new Ctor();
      const master = ctx.createGain();
      // On by default. This runs inside their first pointerdown, which is the
      // user gesture autoplay policy asks for, so the heartbeat starts the
      // moment they hold — nobody should have to find a button first. The
      // pill stays as the way to turn it off.
      master.gain.value = 0.5;
      master.connect(ctx.destination);
      audioCtxRef.current = ctx;
      masterRef.current = master;
      audioOnRef.current = true;
      setAudioOn(true);
      setAudioArmed(true);
      void ctx.resume().catch(() => {});
    } catch {
      /* no WebAudio — the visual pulse carries the beat alone */
    }
  }, []);

  const toggleAudio = useCallback(() => {
    const ctx = audioCtxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;
    void ctx.resume().catch(() => {});
    const next = !audioOnRef.current;
    audioOnRef.current = next;
    setAudioOn(next);
    master.gain.setTargetAtTime(next ? 0.5 : 0, ctx.currentTime, 0.05);
  }, []);

  /** One low thump. Two per cycle, at the vibrate pattern's own onsets. */
  const thump = useCallback((offsetSec: number, gain: number) => {
    const ctx = audioCtxRef.current;
    const master = masterRef.current;
    if (!ctx || !master || !audioOnRef.current) return;
    const t = ctx.currentTime + offsetSec;
    const osc = ctx.createOscillator();
    const sub = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    sub.type = "sine";
    osc.frequency.setValueAtTime(64, t);
    osc.frequency.exponentialRampToValueAtTime(38, t + 0.16);
    sub.frequency.setValueAtTime(41, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    // Phone speakers cannot reproduce 40-60Hz at all, so on a phone the
    // thump alone is silence. A short, higher "knock" rides on top of it —
    // that is the part a phone actually plays.
    const knock = ctx.createOscillator();
    const kg = ctx.createGain();
    knock.type = "triangle";
    knock.frequency.setValueAtTime(180, t);
    knock.frequency.exponentialRampToValueAtTime(95, t + 0.09);
    kg.gain.setValueAtTime(0.0001, t);
    kg.gain.exponentialRampToValueAtTime(gain * 0.55, t + 0.006);
    kg.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    knock.connect(kg);
    kg.connect(master);
    osc.connect(g);
    sub.connect(g);
    g.connect(master);
    osc.start(t); sub.start(t); knock.start(t);
    osc.stop(t + 0.26); sub.stop(t + 0.26); knock.stop(t + 0.16);
  }, []);

  // ── Wake lock — the screen dimming mid-hold is its own kind of betrayal ────
  const wakeRef = useRef<WakeLockSentinel | null>(null);
  const requestWakeLock = useCallback(() => {
    if (wakeRef.current) return;
    try {
      const wl = (navigator as Navigator & {
        wakeLock?: { request(t: "screen"): Promise<WakeLockSentinel> };
      }).wakeLock;
      if (!wl) return;
      void wl.request("screen").then((s) => { wakeRef.current = s; }).catch(() => {});
    } catch {
      /* unsupported — nothing to do */
    }
  }, []);

  const showLine = useCallback((text: string, kind: ActiveLine["kind"], lifeMs: number) => {
    lineIdRef.current += 1;
    setActiveLine({ id: lineIdRef.current, text, kind });
    lineExpiresRef.current = performance.now() + lifeMs;
  }, []);

  // ── The single loop ────────────────────────────────────────────────────────
  const enabled = opts.enabled;
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    lastTsRef.current = performance.now();

    const tick = (ts: number) => {
      if (!alive) return;
      rafRef.current = requestAnimationFrame(tick);

      const cfg = o.current;
      // Clamp dt: a backgrounded tab returns one enormous frame, which would
      // otherwise drain twenty seconds of progress in a single step.
      const dt = Math.min(64, Math.max(0, ts - lastTsRef.current));
      lastTsRef.current = ts;
      if (wonRef.current) return;

      const held = holdingRef.current;
      if (held) {
        progressRef.current = Math.min(cfg.durationMs, progressRef.current + dt);
      } else {
        const rate = ts < punishUntilRef.current ? PUNISH_DRAIN_X : DRAIN_X;
        // Floored at 0 — NEVER reset. A clawable setback is the whole design.
        progressRef.current = Math.max(0, progressRef.current - dt * rate);
      }
      const progressMs = progressRef.current;

      // ── Heartbeat + haptics + audio, all off this one clock ────────────────
      let beat = 0;
      if (held && !cfg.reducedMotion) {
        let next = beatClockRef.current + dt;
        if (next >= BEAT_PERIOD_MS) {
          next -= BEAT_PERIOD_MS;
          // Cycle rollover: fire the physical and audible beats for the new cycle.
          if (hasVibrate) { try { navigator.vibrate(VIBE_PATTERN); } catch {} }
          thump(0, 0.9);
          thump(BEAT_ONSETS[1] / 1000, 0.6);
        }
        beatClockRef.current = next;
        for (let i = 0; i < BEAT_ONSETS.length; i++) {
          const d = next - BEAT_ONSETS[i];
          if (d < 0 || d > BEAT_ATTACK_MS + BEAT_DECAY_MS) continue;
          const env = d < BEAT_ATTACK_MS ? d / BEAT_ATTACK_MS : 1 - (d - BEAT_ATTACK_MS) / BEAT_DECAY_MS;
          beat = Math.max(beat, env * (i === 0 ? 1 : 0.66));
        }
      } else if (!held) {
        beatClockRef.current = 0;
      }

      // ── Hold lines ─────────────────────────────────────────────────────────
      for (let i = 0; i < cfg.holdLines.length; i++) {
        const line = cfg.holdLines[i];
        if (progressMs >= line.atMs) {
          if (held && !firedLinesRef.current.has(i)) {
            firedLinesRef.current.add(i);
            showLine(line.text, "hold", LINE_LIFE_MS);
          }
        } else if (firedLinesRef.current.has(i)) {
          // Drained back below it → eligible again.
          firedLinesRef.current.delete(i);
        }
      }

      // ── evil mode: arm the betrayal, then let its window lapse ─────────────
      if (cfg.mode === "evil") {
        const baitAt = Math.max(0, cfg.durationMs - BETRAYAL_LEAD_MS);
        if (held && progressMs >= baitAt && baitedAtRef.current === null) {
          baitedAtRef.current = ts;
          baitLiveRef.current = true;
          setBaitLive(true);
        }
        if (baitLiveRef.current && baitedAtRef.current !== null && ts - baitedAtRef.current > BETRAYAL_GRACE_MS) {
          baitLiveRef.current = false;
          // They sat through the whole bait window without letting go.
          if (held) survivedBetrayalRef.current = true;
          setBaitLive(false);
        }
      }

      // ── Ghost fragments (drain removes them again — that is the point) ─────
      const ghosts = Math.min(cfg.ghostCount, Math.floor(progressMs / GHOST_INTERVAL_MS));
      setGhostsShown((g) => (g === ghosts ? g : ghosts));

      // ── Line expiry ────────────────────────────────────────────────────────
      if (lineExpiresRef.current && ts >= lineExpiresRef.current) {
        lineExpiresRef.current = 0;
        setActiveLine(null);
      }

      // ── Coarse mirror for the timer readout ────────────────────────────────
      if (ts - coarseAtRef.current > 160) {
        coarseAtRef.current = ts;
        setCoarseMs(progressMs);
      }

      cfg.onFrame({
        progressMs,
        p: cfg.durationMs > 0 ? progressMs / cfg.durationMs : 0,
        holding: held,
        beat,
        pointerCount: pointersRef.current.size,
      });

      // ── Win ────────────────────────────────────────────────────────────────
      if (progressMs >= cfg.durationMs) {
        wonRef.current = true;
        setWon(true);
        setCoarseMs(cfg.durationMs);
        setActiveLine(null);
        if (hasVibrate) { try { navigator.vibrate([30, 60, 30, 60, 220]); } catch {} }
        cfg.onWin?.({
          heldMs: cfg.durationMs,
          releases: releaseCountRef.current,
          survivedBetrayal: survivedBetrayalRef.current,
          skipped: false,
        });
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      alive = false;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
    // Everything else is read through `o.current` on purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, hasVibrate, showLine, thump]);

  // ── Hold / release transitions ─────────────────────────────────────────────
  const recompute = useCallback(() => {
    const cfg = o.current;
    if (wonRef.current) return;
    const required = cfg.hands === 2 ? 2 : 1;
    const count = pointersRef.current.size + (spaceRef.current ? 1 : 0);
    setPointerCount(pointersRef.current.size);

    const next = count >= required;
    if (next === holdingRef.current) return;
    holdingRef.current = next;
    setHolding(next);

    if (next) {
      hasHeldRef.current = true;
      // Roll the beat over on the very next frame so the first thump is immediate.
      beatClockRef.current = BEAT_PERIOD_MS;
      requestWakeLock();
      setActiveLine(null);
      lineExpiresRef.current = 0;
      return;
    }

    // ── Released ─────────────────────────────────────────────────────────────
    if (!hasHeldRef.current) return;
    if (hasVibrate) { try { navigator.vibrate(VIBE_RELEASE_MS); } catch {} }

    const now = performance.now();
    const bitTheBait =
      cfg.mode === "evil" && baitLiveRef.current && baitedAtRef.current !== null &&
      now - baitedAtRef.current <= BETRAYAL_GRACE_MS;

    releaseCountRef.current += 1;
    setReleaseCount(releaseCountRef.current);

    if (bitTheBait) {
      punishUntilRef.current = now + PUNISH_MS;
      baitedAtRef.current = null;
      baitLiveRef.current = false;
      setBaitLive(false);
      showLine("I lied. hold it again.", "punish", RELEASE_LIFE_MS);
      return;
    }

    const copy = cfg.releaseLineFor?.(releaseCountRef.current);
    if (copy) showLine(copy, "release", RELEASE_LIFE_MS);
    else setActiveLine(null);
  }, [hasVibrate, requestWakeLock, showLine]);

  // ── Pointer handlers ───────────────────────────────────────────────────────
  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (wonRef.current) return;
      e.preventDefault();
      armAudio();
      // Capture guarantees a matching pointerup even if the finger slides off the
      // element or onto a child — no phantom "still holding" state.
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
      pointersRef.current.add(e.pointerId);
      recompute();
    },
    [armAudio, recompute],
  );

  const endPointer = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!pointersRef.current.delete(e.pointerId)) return;
      try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
      recompute();
    },
    [recompute],
  );

  /**
   * Belt-and-braces only. With pointer capture the browser suppresses boundary
   * events, so a `pointerleave` that arrives while we still hold capture is
   * spurious and must not end the hold.
   */
  const onPointerLeave = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (e.currentTarget.hasPointerCapture?.(e.pointerId)) return;
      endPointer(e);
    },
    [endPointer],
  );

  // ── Global releases: tab switch, window blur, spacebar ─────────────────────
  useEffect(() => {
    const releaseAll = () => {
      if (pointersRef.current.size === 0 && !spaceRef.current) return;
      pointersRef.current.clear();
      spaceRef.current = false;
      recompute();
    };
    // Leaving the app is letting go.
    const onVis = () => { if (document.visibilityState === "hidden") releaseAll(); };
    const onKeyDown = (e: KeyboardEvent) => {
      // After the win the page is a letter: Space scrolls it, as it should.
      if (e.code !== "Space" || e.repeat || wonRef.current) return;
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(t.tagName)) return;
      e.preventDefault(); // stop the page scrolling out from under the hold
      spaceRef.current = true;
      armAudio();
      recompute();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== "Space" || !spaceRef.current) return;
      spaceRef.current = false;
      recompute();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("blur", releaseAll);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("blur", releaseAll);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [recompute, armAudio]);

  // ── Cleanup ────────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      try { navigator.vibrate?.(0); } catch {}
      void wakeRef.current?.release().catch(() => {});
      wakeRef.current = null;
      void audioCtxRef.current?.close().catch(() => {});
      audioCtxRef.current = null;
    };
  }, []);

  /** The escape hatch. Nobody's love letter should be hostage to a reflex test. */
  const forceComplete = useCallback(() => {
    if (wonRef.current) return;
    wonRef.current = true;
    skippedRef.current = true;
    progressRef.current = o.current.durationMs;
    setWon(true);
    setActiveLine(null);
    o.current.onWin?.({
      heldMs: o.current.durationMs,
      releases: releaseCountRef.current,
      survivedBetrayal: survivedBetrayalRef.current,
      skipped: true,
    });
  }, []);

  return {
    holding, releaseCount, won, activeLine, ghostsShown, baitLive, pointerCount, coarseMs,
    hasVibrate, audioArmed, audioOn, toggleAudio,
    bind: {
      onPointerDown,
      onPointerUp: endPointer,
      onPointerCancel: endPointer,
      onPointerLeave,
      onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
    },
    forceComplete,
    progressRef,
  };
}
