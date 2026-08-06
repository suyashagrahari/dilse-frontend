"use client";

// ─── Screen 3 — the recording booth ──────────────────────────────────────────
//
// A studio, not a file input. Microphone graphic, an ON AIR sign that lights
// while the tape is rolling, a live waveform scrolling right to left, and a
// countdown.
//
// THE TWO THINGS THAT SILENTLY BREAK A BOOTH:
//
//   1. Assuming webm. Safari records mp4 and NOTHING else; `MediaRecorder`
//      constructed with an unsupported mimeType either throws or produces a
//      zero-byte blob depending on the version. `pickRecorderMime()` from the
//      frozen contract feature-detects, and if it returns null we say so
//      instead of handing the sender a booth that appears to work.
//   2. Requesting the microphone on page load. Safari and Firefox will refuse
//      a getUserMedia call that is not attached to a gesture, and a denied
//      permission is sticky. Permission is requested from a button tap, once.
//
// AND THE THING THAT QUIETLY RUINS IT: retakes. Capped at BOOTH.maxRetakes,
// after which the booth stops offering. The stumbles are the emotional content
// and a sender given unlimited takes will sand them all off.

import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import { Mic, Square, RotateCcw, Check, Play, Pause, TriangleAlert } from "lucide-react";
import { BOOTH, BODY_FACE, DISPLAY_FACE, PALETTE, TAP_TARGET_PX } from "./types";
import { pickRecorderMime } from "./types";
import { lampStyle } from "./radioStyles";

export interface Recording {
  /** An object URL. NOT yet uploaded — see the TODO in `onKeep` callers. */
  url: string;
  blob: Blob;
  durationMs: number;
  mimeType: string;
}

export interface BoothProps {
  onKeep: (rec: Recording) => void;
  /** The sender chose (or was forced onto) the text-to-card path. */
  onUseText?: () => void;
  heading?: string;
  /** The reply booth has no text fallback to offer. */
  showTextFallback?: boolean;
}

type Stage = "idle" | "requesting" | "recording" | "review" | "denied" | "unsupported";

/**
 * A 100ms ticker as an external store.
 *
 * React 19's `react-hooks/set-state-in-effect` rules out the obvious
 * `setInterval(() => setSeconds(...))` inside an effect, and this is the shape
 * the rule points you at.
 */
class Ticker {
  private listeners = new Set<() => void>();
  private elapsed = 0;
  private id: number | null = null;
  private startedAt = 0;

  subscribe = (cb: () => void): (() => void) => {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  };

  getSnapshot = (): number => this.elapsed;
  getServerSnapshot = (): number => 0;

  private emit(): void {
    for (const l of this.listeners) l();
  }

  start(onLimit: () => void, limitMs: number): void {
    this.stop();
    this.startedAt = Date.now();
    this.elapsed = 0;
    this.emit();
    this.id = window.setInterval(() => {
      this.elapsed = Date.now() - this.startedAt;
      this.emit();
      if (this.elapsed >= limitMs) onLimit();
    }, 100);
  }

  stop(): void {
    if (this.id !== null) window.clearInterval(this.id);
    this.id = null;
  }

  reset(): void {
    this.stop();
    this.elapsed = 0;
    this.emit();
  }
}

const fmt = (ms: number): string => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

export default function Booth({ onKeep, onUseText, heading = "Recording booth", showTextFallback = true }: BoothProps) {
  const [ticker] = useState(() => new Ticker());
  const elapsed = useSyncExternalStore(ticker.subscribe, ticker.getSnapshot, ticker.getServerSnapshot);

  const [stage, setStage] = useState<Stage>("idle");
  const [takes, setTakes] = useState(0);
  const [review, setReview] = useState<Recording | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [problem, setProblem] = useState("");

  // Live objects: the stream, the recorder, the analyser, the preview element.
  //
  // A ref, not state. React 19's `react-hooks/immutability` forbids mutating
  // anything returned by `useState`, and every one of these is mutated in place
  // by design — a MediaRecorder is not a value you can copy on write. Nothing
  // here is ever read during render; only from event handlers and the rAF loop.
  const rigRef = useRef({
    stream: null as MediaStream | null,
    recorder: null as MediaRecorder | null,
    analyser: null as AnalyserNode | null,
    ctx: null as AudioContext | null,
    chunks: [] as Blob[],
    preview: null as HTMLAudioElement | null,
  });

  const limitMs = BOOTH.maxSeconds * 1000;
  const remaining = limitMs - elapsed;
  const outOfTakes = takes >= BOOTH.maxRetakes;

  /* ── The scrolling waveform ───────────────────────────────────────────── */
  const attachWave = useCallback(
    (canvas: HTMLCanvasElement | null) => {
      if (!canvas) return;
      const ctx2d = canvas.getContext("2d");
      if (!ctx2d) return;

      let raf = 0;
      let w = 0;
      let h = 0;
      // The scroll history. One column per frame, shifted left as it fills.
      const history: number[] = [];

      const resize = () => {
        const dpr = Math.min(3, window.devicePixelRatio || 1);
        const r = canvas.getBoundingClientRect();
        w = Math.max(1, r.width);
        h = Math.max(1, r.height);
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      resize();
      const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
      ro?.observe(canvas);

      const step = 2; // px per column
      let buf: Uint8Array<ArrayBuffer> | null = null;

      const frame = () => {
        const an = rigRef.current.analyser;
        let level = 0;
        if (an) {
          if (!buf || buf.length !== an.fftSize) buf = new Uint8Array(new ArrayBuffer(an.fftSize));
          an.getByteTimeDomainData(buf);
          let sum = 0;
          for (let i = 0; i < buf.length; i++) {
            const d = (buf[i] - 128) / 128;
            sum += d * d;
          }
          level = Math.min(1, Math.sqrt(sum / buf.length) * 3);
        }
        history.push(level);
        const maxCols = Math.ceil(w / step);
        while (history.length > maxCols) history.shift();

        ctx2d.clearRect(0, 0, w, h);
        ctx2d.fillStyle = "rgba(0,0,0,.35)";
        ctx2d.fillRect(0, 0, w, h);

        // Centre line
        ctx2d.strokeStyle = "rgba(240,166,60,.18)";
        ctx2d.lineWidth = 1;
        ctx2d.beginPath();
        ctx2d.moveTo(0, h / 2);
        ctx2d.lineTo(w, h / 2);
        ctx2d.stroke();

        ctx2d.fillStyle = PALETTE.amber;
        for (let i = 0; i < history.length; i++) {
          const amp = Math.max(1, history[i] * (h * 0.44));
          // Right-to-left: newest column is at the right edge.
          const x = w - (history.length - i) * step;
          ctx2d.fillRect(x, h / 2 - amp, step - 0.6, amp * 2);
        }

        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);

      return () => {
        cancelAnimationFrame(raf);
        ro?.disconnect();
      };
    },
    [],
  );

  /* ── Teardown ─────────────────────────────────────────────────────────── */
  const teardown = useCallback(() => {
    ticker.stop();
    rigRef.current.recorder = null;
    rigRef.current.analyser = null;
    for (const t of rigRef.current.stream?.getTracks() ?? []) t.stop();
    rigRef.current.stream = null;
    void rigRef.current.ctx?.close().catch(() => {});
    rigRef.current.ctx = null;
  }, [ticker]);

  /* ── Stop ─────────────────────────────────────────────────────────────── */
  const stop = useCallback(() => {
    try {
      if (rigRef.current.recorder && rigRef.current.recorder.state !== "inactive") rigRef.current.recorder.stop();
    } catch {
      // A recorder that will not stop still has to release the microphone.
      teardown();
      setStage("idle");
    }
  }, [teardown]);

  /* ── Start. ALWAYS from a button tap. ─────────────────────────────────── */
  const start = useCallback(async () => {
    setProblem("");

    const mime = pickRecorderMime();
    if (!mime) {
      // Said out loud rather than swallowed: a booth that looks fine and yields
      // a zero-byte file is worse than a booth that admits it cannot record.
      setStage("unsupported");
      setProblem("this browser can't record audio — use the card instead");
      return;
    }

    setStage("requesting");
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
    } catch {
      setStage("denied");
      return;
    }

    rigRef.current.stream = stream;
    rigRef.current.chunks = [];

    // Analyser for the live waveform. Its own context — the show's context may
    // not exist yet in the editor, and the booth must not depend on it.
    try {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (Ctor) {
        const ac = new Ctor();
        const src = ac.createMediaStreamSource(stream);
        const an = ac.createAnalyser();
        an.fftSize = 1024;
        an.smoothingTimeConstant = 0.4;
        // Deliberately NOT connected onward to the destination — routing the
        // microphone to the speakers is a feedback loop.
        src.connect(an);
        rigRef.current.ctx = ac;
        rigRef.current.analyser = an;
      }
    } catch {
      // No waveform, but the recording itself is unaffected.
      rigRef.current.analyser = null;
    }

    let rec: MediaRecorder;
    try {
      rec = new MediaRecorder(stream, { mimeType: mime });
    } catch {
      teardown();
      setStage("unsupported");
      setProblem("this browser refused the recorder — use the card instead");
      return;
    }

    rec.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) rigRef.current.chunks.push(e.data);
    };
    rec.onstop = () => {
      const durationMs = ticker.getSnapshot();
      const blob = new Blob(rigRef.current.chunks, { type: mime });
      teardown();
      if (blob.size === 0) {
        setProblem("that take came out empty — try once more");
        setStage("idle");
        return;
      }
      setReview({ url: URL.createObjectURL(blob), blob, durationMs, mimeType: mime });
      setTakes((t) => t + 1);
      setStage("review");
    };

    rigRef.current.recorder = rec;
    try {
      rec.start(250);
    } catch {
      teardown();
      setStage("unsupported");
      setProblem("the recorder wouldn't start — use the card instead");
      return;
    }
    ticker.start(() => stop(), limitMs);
    setStage("recording");
  }, [ticker, teardown, stop, limitMs]);

  /* ── Review playback ──────────────────────────────────────────────────── */
  const togglePreview = useCallback(() => {
    if (!review) return;
    if (!rigRef.current.preview) {
      const el = document.createElement("audio");
      el.addEventListener("ended", () => setPreviewing(false));
      rigRef.current.preview = el;
    }
    const el = rigRef.current.preview;
    if (previewing) {
      el.pause();
      setPreviewing(false);
      return;
    }
    el.src = review.url;
    void el.play().then(
      () => setPreviewing(true),
      () => setProblem("couldn't play that back — it should still send fine"),
    );
  }, [review, previewing]);

  const again = useCallback(() => {
    rigRef.current.preview?.pause();
    setPreviewing(false);
    setReview(null);
    ticker.reset();
    setStage("idle");
  }, [ticker]);

  const keep = useCallback(() => {
    if (!review) return;
    rigRef.current.preview?.pause();
    setPreviewing(false);
    onKeep(review);
  }, [review, onKeep]);

  const recording = stage === "recording";

  return (
    <div
      className="rounded-2xl p-3.5"
      style={{
        background: "linear-gradient(180deg,#2a1710,#1a0e08)",
        border: "1px solid rgba(240,166,60,.22)",
      }}
    >
      {/* ── Head: mic + ON AIR ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-3">
        {/* Microphone graphic — capsule, grille lines, stand. All CSS. */}
        <div aria-hidden className="relative shrink-0" style={{ width: 34, height: 46 }}>
          <span
            className="absolute left-1/2 -translate-x-1/2 rounded-full"
            style={{
              top: 0,
              width: 22,
              height: 30,
              background: `linear-gradient(160deg, ${PALETTE.chrome}, ${PALETTE.chromeDark})`,
              backgroundImage: `repeating-linear-gradient(0deg, rgba(0,0,0,.4) 0 1px, rgba(255,255,255,.18) 1px 3px)`,
              boxShadow: "inset 0 -2px 4px rgba(0,0,0,.5)",
            }}
          />
          <span
            className="absolute left-1/2 -translate-x-1/2"
            style={{ top: 29, width: 3, height: 10, background: PALETTE.chromeDark }}
          />
          <span
            className="absolute left-1/2 -translate-x-1/2 rounded-sm"
            style={{ top: 39, width: 20, height: 5, background: PALETTE.chromeDark }}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold" style={{ fontFamily: BODY_FACE, color: PALETTE.cream }}>
            {heading}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <span aria-hidden className="w-2.5 h-2.5 rounded-full" style={lampStyle(PALETTE.red, recording)} />
            <span
              className="text-[9px] font-bold uppercase tracking-[0.22em]"
              style={{ fontFamily: BODY_FACE, color: recording ? PALETTE.red : "rgba(232,220,192,.35)" }}
            >
              On air
            </span>
          </div>
        </div>

        <span
          className="tabular-nums text-[15px] font-bold shrink-0"
          style={{
            fontFamily: DISPLAY_FACE,
            color: recording && remaining < 10_000 ? PALETTE.red : PALETTE.amber,
          }}
          aria-live="off"
        >
          {fmt(recording ? remaining : review ? review.durationMs : limitMs)}
        </span>
      </div>

      {/* ── The waveform ──────────────────────────────────────────────── */}
      <canvas
        ref={attachWave}
        aria-hidden
        className="block w-full rounded-lg mb-3"
        style={{ height: 54, background: "rgba(0,0,0,.4)" }}
      />

      {/* ── The script. On screen to defuse the freeze. ───────────────── */}
      {(stage === "idle" || stage === "recording") && (
        <p
          className="text-[11px] leading-relaxed rounded-lg px-2.5 py-2 mb-3"
          style={{
            fontFamily: BODY_FACE,
            color: "rgba(232,220,192,.72)",
            background: "rgba(240,166,60,.07)",
            border: "1px dashed rgba(240,166,60,.25)",
          }}
        >
          {BOOTH.script}
        </p>
      )}

      {problem && (
        <p
          className="flex items-start gap-1.5 text-[11px] mb-2.5"
          style={{ fontFamily: BODY_FACE, color: PALETTE.red }}
          role="status"
        >
          <TriangleAlert size={13} className="shrink-0 mt-px" />
          {problem}
        </p>
      )}

      {/* ── Controls ───────────────────────────────────────────────────── */}
      {stage === "denied" || stage === "unsupported" ? (
        <div>
          <p className="text-[12px] leading-relaxed mb-3" style={{ fontFamily: BODY_FACE, color: PALETTE.cream }}>
            {BOOTH.denied}
          </p>
          {showTextFallback && onUseText && (
            <button
              type="button"
              onClick={onUseText}
              className="w-full rounded-xl font-bold text-[13px]"
              style={{
                minHeight: TAP_TARGET_PX,
                background: PALETTE.amber,
                color: PALETTE.ink,
                fontFamily: BODY_FACE,
              }}
            >
              use the card instead
            </button>
          )}
        </div>
      ) : stage === "review" && review ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePreview}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl font-bold text-[13px]"
              style={{
                minHeight: TAP_TARGET_PX,
                background: "rgba(232,220,192,.12)",
                color: PALETTE.cream,
                fontFamily: BODY_FACE,
                border: "1px solid rgba(232,220,192,.25)",
              }}
            >
              {previewing ? <Pause size={16} /> : <Play size={16} />}
              {previewing ? "pause" : "listen back"}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={keep}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl font-bold text-[13px]"
              style={{ minHeight: TAP_TARGET_PX, background: PALETTE.green, color: "#062b13", fontFamily: BODY_FACE }}
            >
              <Check size={16} /> keep
            </button>
            <button
              type="button"
              onClick={again}
              disabled={outOfTakes}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl font-bold text-[13px] disabled:opacity-40"
              style={{
                minHeight: TAP_TARGET_PX,
                background: "rgba(232,220,192,.12)",
                color: PALETTE.cream,
                fontFamily: BODY_FACE,
                border: "1px solid rgba(232,220,192,.25)",
              }}
            >
              <RotateCcw size={16} /> record again
            </button>
          </div>
          {outOfTakes && (
            <p className="text-[11px] text-center" style={{ fontFamily: BODY_FACE, color: PALETTE.amber }}>
              {BOOTH.enough}
            </p>
          )}
        </div>
      ) : recording ? (
        <button
          type="button"
          onClick={stop}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl font-bold text-[13px]"
          style={{ minHeight: TAP_TARGET_PX, background: PALETTE.red, color: "#fff", fontFamily: BODY_FACE }}
        >
          <Square size={15} fill="currentColor" /> stop
        </button>
      ) : (
        <button
          type="button"
          onClick={() => void start()}
          disabled={stage === "requesting"}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl font-bold text-[13px] disabled:opacity-60"
          style={{ minHeight: TAP_TARGET_PX, background: PALETTE.amber, color: PALETTE.ink, fontFamily: BODY_FACE }}
        >
          <Mic size={16} />
          {stage === "requesting" ? "asking for the mic…" : takes > 0 ? "record another take" : "start recording"}
        </button>
      )}

      {takes > 0 && stage !== "denied" && (
        <p className="text-[10px] text-center mt-2" style={{ fontFamily: BODY_FACE, color: "rgba(232,220,192,.42)" }}>
          take {Math.min(takes, BOOTH.maxRetakes)} of {BOOTH.maxRetakes}
        </p>
      )}
    </div>
  );
}
