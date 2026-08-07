// ─── Screen 2 — connected ────────────────────────────────────────────────────
//
// The photo shrinks to 64px and goes to the top with her name beside it, a
// monospaced timer starts from 00:00, and then the message arrives one line at
// a time. THIS IS THE PAYLOAD. Everything before it is a joke about a caller-ID
// screen; this is the part somebody wrote for somebody else, so it is set at
// 17px with a generous line-height and it is allowed to take its time.
//
// ── NEVER STALL ──────────────────────────────────────────────────────────────
//
// `voiceUrl` is optional and, when present, is a file on someone else's CDN
// that may 404, may lack CORS headers, or may simply never start. Every one of
// those paths ends at the same place — the message — because a connected call
// screen with nothing happening on it is the worst state this template has.
// Three routes out, and one of them always fires:
//
//   • the audio ends normally             → message
//   • the element errors on either try    → message
//   • six seconds pass with no `playing`  → message
//
// The waveform is drawn from a real `AnalyserNode` when the routed element
// loads. When the CORS-routed attempt fails, playback continues on an unrouted
// twin that cannot be analysed, and the meter drops to a flat idle line rather
// than inventing movement it cannot see.

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar, DARK, FONT, MONO, TAP, useReducedMotion } from "./theme";
import { PhoneDownGlyph } from "./icons";
import type { CallData } from "./types";

export interface ConnectedScreenProps {
  data: CallData;
  onEnd: () => void;
}

/** `04:07`, and `1:04:07` once it has been going long enough to deserve it. */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return hh > 0 ? `${hh}:${pad(mm)}:${pad(ss)}` : `${pad(mm)}:${pad(ss)}`;
}

const BARS = 42;

export default function ConnectedScreen({ data, onEnd }: ConnectedScreenProps) {
  const reduced = useReducedMotion();

  // ── Timer ──────────────────────────────────────────────────────────────────
  // The start instant is state, not a ref, so nothing is written during render
  // and a re-render from a rotation cannot restart the clock.
  const [startedAt] = useState(() => Date.now());
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    // Derived from the wall clock every tick rather than incremented, so a
    // throttled background tab comes back with the right number instead of a
    // number of ticks it managed to run.
    const id = setInterval(() => setSeconds(Math.floor((Date.now() - startedAt) / 1000)), 250);
    return () => clearInterval(id);
  }, [startedAt]);

  // ── Voice ──────────────────────────────────────────────────────────────────
  const voiceUrl = data.voiceUrl ?? "";
  const [voiceDone, setVoiceDone] = useState(!voiceUrl);
  const [analysed, setAnalysed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!voiceUrl) return;

    let settled = false;
    let frame = 0;
    let watchdog: ReturnType<typeof setTimeout> | null = null;
    const cleanups: Array<() => void> = [];

    const finish = () => {
      if (settled) return;
      settled = true;
      if (watchdog !== null) clearTimeout(watchdog);
      setVoiceDone(true);
    };

    const armWatchdog = () => {
      if (watchdog !== null) clearTimeout(watchdog);
      watchdog = setTimeout(finish, 6000);
    };

    type Ctor = new () => AudioContext;
    const w = window as unknown as { AudioContext?: Ctor; webkitAudioContext?: Ctor };
    const Ctor = w.AudioContext ?? w.webkitAudioContext ?? null;

    let ac: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let buffer: Uint8Array<ArrayBuffer> | null = null;

    const routed = document.createElement("audio");
    routed.crossOrigin = "anonymous";
    routed.preload = "auto";
    let plain: HTMLAudioElement | null = null;
    let usedFallback = false;

    if (Ctor) {
      try {
        ac = new Ctor();
        const source = ac.createMediaElementSource(routed);
        const node = ac.createAnalyser();
        node.fftSize = 512;
        node.smoothingTimeConstant = 0.6;
        // Routed all the way to the destination — an analyser left dangling is
        // the classic "it plays but you hear nothing".
        source.connect(node).connect(ac.destination);
        analyser = node;
        buffer = new Uint8Array(new ArrayBuffer(node.fftSize));
      } catch {
        analyser = null;
      }
    }

    const attach = (el: HTMLAudioElement, isAnalysed: boolean, onLoadError: () => void) => {
      const onEnded = () => finish();
      const onError = () => onLoadError();
      const onPlaying = () => {
        if (watchdog !== null) {
          clearTimeout(watchdog);
          watchdog = null;
        }
        setAnalysed(isAnalysed);
      };
      el.addEventListener("ended", onEnded);
      el.addEventListener("error", onError);
      el.addEventListener("playing", onPlaying);
      cleanups.push(() => {
        el.removeEventListener("ended", onEnded);
        el.removeEventListener("error", onError);
        el.removeEventListener("playing", onPlaying);
        el.pause();
        el.removeAttribute("src");
      });
    };

    const startPlain = () => {
      if (usedFallback) return;
      usedFallback = true;
      setAnalysed(false);
      plain = document.createElement("audio");
      plain.preload = "auto";
      attach(plain, false, finish);
      plain.src = voiceUrl;
      armWatchdog();
      void plain.play().catch(finish);
    };

    attach(routed, analyser !== null, startPlain);
    routed.src = voiceUrl;
    armWatchdog();
    void ac?.resume().catch(() => {});
    void routed.play().catch(startPlain);

    // ── The meter ────────────────────────────────────────────────────────────
    const draw = () => {
      frame = requestAnimationFrame(draw);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = Math.min(3, window.devicePixelRatio || 1);
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const barWidth = width / (BARS * 1.7);
      const gap = (width - BARS * barWidth) / Math.max(1, BARS - 1);

      // One read per frame, not one per bar.
      if (analyser && buffer) analyser.getByteTimeDomainData(buffer);
      const slice = buffer ? Math.floor(buffer.length / BARS) : 0;

      for (let i = 0; i < BARS; i++) {
        let level = 0.06;
        if (buffer && slice > 0) {
          let sum = 0;
          for (let j = 0; j < slice; j++) {
            const d = (buffer[i * slice + j] - 128) / 128;
            sum += d * d;
          }
          level = Math.min(1, Math.sqrt(sum / slice) * 3.2);
        }
        const h = Math.max(2, level * height);
        ctx.fillStyle = DARK.accentWarm;
        ctx.globalAlpha = 0.35 + level * 0.65;
        ctx.fillRect(i * (barWidth + gap), (height - h) / 2, barWidth, h);
      }
      ctx.globalAlpha = 1;
    };
    frame = requestAnimationFrame(draw);

    return () => {
      settled = true;
      if (watchdog !== null) clearTimeout(watchdog);
      cancelAnimationFrame(frame);
      for (const c of cleanups) c();
      void ac?.close().catch(() => {});
    };
  }, [voiceUrl]);

  // ── The message ────────────────────────────────────────────────────────────
  //
  // Under reduced motion every line is simply THERE — that is derived, not a
  // state write, so the effect below never has to run for the page to be
  // complete. The staged reveal is a chain of timeouts rather than an interval
  // plus an immediate write: the first line lands on the next tick, and no
  // state is set synchronously inside an effect body.
  const lines = data.message;
  const [revealed, setRevealed] = useState(0);
  const shown = reduced ? lines.length : revealed;

  useEffect(() => {
    if (!voiceDone || reduced || lines.length === 0) return;

    let n = 0;
    let timer: ReturnType<typeof setTimeout>;
    const step = () => {
      n += 1;
      setRevealed(n);
      if (n < lines.length) timer = setTimeout(step, 800);
    };
    timer = setTimeout(step, 0);

    return () => clearTimeout(timer);
  }, [voiceDone, reduced, lines.length]);

  const end = useCallback(() => onEnd(), [onEnd]);

  const nameSize = data.caller.name.length > 22 ? 17 : 20;

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: DARK.bg,
        color: DARK.text,
        fontFamily: FONT,
        padding: "calc(env(safe-area-inset-top, 0px) + 18px) 18px calc(env(safe-area-inset-bottom, 0px) + 22px)",
      }}
    >
      <header style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <Avatar name={data.caller.name} src={data.caller.photoUrl} size={64} ring={2} ringColor={DARK.accentWarm} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ margin: 0, fontSize: nameSize, fontWeight: 600, lineHeight: 1.2, overflowWrap: "anywhere" }}>
            {data.caller.name}
          </p>
          <p style={{ margin: "3px 0 0", fontSize: 13, color: DARK.dim }}>{data.caller.number}</p>
        </div>
        <p
          style={{
            margin: 0,
            fontFamily: MONO,
            fontSize: 15,
            color: DARK.accentWarm,
            fontVariantNumeric: "tabular-nums",
          }}
          aria-label="Call duration"
        >
          {formatDuration(seconds)}
        </p>
      </header>

      {voiceUrl && !voiceDone ? (
        <div style={{ marginTop: 22 }}>
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            style={{ display: "block", width: "100%", height: 54 }}
          />
          <p style={{ margin: "8px 0 0", fontSize: 12, color: DARK.dim, textAlign: "center" }}>
            {analysed ? "She is saying it herself" : "Playing her voice note"}
          </p>
        </div>
      ) : null}

      <div style={{ marginTop: 26, flex: 1, minWidth: 0 }}>
        {lines.slice(0, shown).map((line, i) => (
          <p
            key={`${i}-${line}`}
            className={reduced ? undefined : "call-line"}
            style={{
              margin: i === 0 ? 0 : "18px 0 0",
              fontSize: 17,
              lineHeight: 1.72,
              color: i === lines.length - 1 ? DARK.dim : DARK.text,
              overflowWrap: "anywhere",
            }}
          >
            {line}
          </p>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: 22 }}>
        <button
          type="button"
          onClick={end}
          style={{
            minHeight: TAP + 4,
            padding: "0 26px",
            borderRadius: 999,
            border: "none",
            background: DARK.danger,
            color: "#fff",
            fontFamily: FONT,
            fontSize: 15,
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
            touchAction: "manipulation",
          }}
        >
          <PhoneDownGlyph size={20} color="#fff" />
          End call
        </button>
      </div>

      <style>{`
        .call-line { animation: call-line-in 420ms ease-out both; }
        @keyframes call-line-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: none; }
        }
        .call-frozen .call-line { animation: none !important; }
        @media (prefers-reduced-motion: reduce) {
          .call-line { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
