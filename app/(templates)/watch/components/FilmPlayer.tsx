"use client";

// ─── The film player ─────────────────────────────────────────────────────────
//
// The sender's photos, played as a video with a real player's grammar: a
// chapter-segmented scrubber with a hover preview, a buffered track, captions
// that type out, double-tap-to-seek ripples on touch, a settings menu with
// ambient mode / speed / quality, theatre and fullscreen, keyboard shortcuts,
// and an end screen with an up-next countdown.
//
// ── ONE CLOCK, NO RE-RENDER STORM ────────────────────────────────────────────
// Playback time lives in a ref and is advanced by requestAnimationFrame only
// while playing. Every per-frame visual (played bars, the knob, the time
// readout, the Ken Burns drift, the typed caption) is written straight to the
// DOM by `paint()`. React only re-renders when the CHAPTER changes, so the
// page around the player (description highlight, chapter panel) stays calm.

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Pic from "./Pic";
import { FRAME_SECONDS, formatTimestamp, type Frame, type LovePhoto } from "./types";
import { FONT, T } from "./theme";
import {
  ICC,
  IChevron,
  ICheck,
  IDefaultView,
  IFullscreen,
  IGear,
  INext,
  IPause,
  IPlay,
  IPrev,
  IReplay,
  ISeekArrows,
  ITheatre,
  IVolume,
  Mark,
} from "./icons";

export interface PlayerHandle {
  seek: (seconds: number) => void;
  play: () => void;
}

export interface UpNext {
  title: string;
  channel: string;
  photo: LovePhoto | null;
}

export interface FilmPlayerProps {
  frames: Frame[];
  title: string;
  theatre: boolean;
  onTheatre?: () => void;
  onChapter?: (index: number) => void;
  onOpenChapters?: () => void;
  onToast: (message: string) => void;
  upNext?: UpNext | null;
  onUpNext?: () => void;
  /** A line on the end screen (e.g. the nudge towards the letter). */
  endLine?: string;
  handleRef?: { current: PlayerHandle | null };
  autoPlay?: boolean;
  /** Where playback starts (a chapter link tapped while a memory was playing). */
  startAt?: number;
  /** Seconds each frame holds; memories hold a little longer. */
  frameSeconds?: number;
}

type Menu = null | "main" | "speed" | "quality";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;
const QUALITIES = ["2160p60 HDR ♥", "1440p", "1080p", "720p", "Auto (how I see you)"] as const;
const SEEK_STEP = 5;
const UP_NEXT_SECONDS = 8;

/** Ken Burns drift per variant: [scale from, scale to, x from, x to, y from, y to] in % */
const KB: readonly [number, number, number, number, number, number][] = [
  [1.04, 1.14, 0, -2.2, 0, -1],
  [1.15, 1.05, -1.8, 1.2, 1, -0.6],
  [1.05, 1.15, 1.6, -1.2, -1.2, 0.8],
  [1.14, 1.04, 0, 0, 1.6, -1.4],
];

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export default function FilmPlayer({
  frames,
  title,
  theatre,
  onTheatre,
  onChapter,
  onOpenChapters,
  onToast,
  upNext,
  onUpNext,
  endLine,
  handleRef,
  autoPlay = false,
  startAt = 0,
  frameSeconds = FRAME_SECONDS,
}: FilmPlayerProps) {
  const F = frameSeconds;
  const duration = Math.max(F, frames.length * F);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const tRef = useRef(startAt);
  const idxRef = useRef(0);
  const playingRef = useRef(false);
  const speedRef = useRef(1);
  const reduceRef = useRef(false);

  const playedRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const bufRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const kbRefs = useRef<(HTMLDivElement | null)[]>([]);
  const knobRef = useRef<HTMLSpanElement | null>(null);
  const timeRef = useRef<HTMLSpanElement | null>(null);
  const timeRef2 = useRef<HTMLSpanElement | null>(null);
  const ccRef = useRef<HTMLSpanElement | null>(null);
  const miniRef = useRef<HTMLSpanElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);

  const [started, setStarted] = useState(autoPlay);
  const [playing, setPlaying] = useState(autoPlay);
  const [ended, setEnded] = useState(false);
  const [idx, setIdx] = useState(0);
  const [cc, setCc] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [quality, setQuality] = useState<string>(QUALITIES[0]);
  const [ambient, setAmbient] = useState(true);
  const [muted, setMuted] = useState(false);
  const [menu, setMenu] = useState<Menu>(null);
  const [controls, setControls] = useState(true);
  const [fs, setFs] = useState(false);
  const [pseudoFs, setPseudoFs] = useState(false);
  const [hover, setHover] = useState<{ x: number; t: number; w: number } | null>(null);
  const [scrubbing, setScrubbing] = useState(false);
  const [ripple, setRipple] = useState<{ side: "l" | "r"; key: number } | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [bigIcon, setBigIcon] = useState<{ kind: "play" | "pause"; key: number } | null>(null);

  const hideTimer = useRef<number | null>(null);
  const lastTap = useRef<{ at: number; side: "l" | "r" | "c" } | null>(null);

  useEffect(() => {
    reduceRef.current = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  }, []);

  // ── Paint: everything that moves every frame ──────────────────────────────
  const paint = useCallback(() => {
    const t = tRef.current;
    frames.forEach((f, i) => {
      const s = i * F;
      const p = clamp((t - s) / F, 0, 1);
      const el = playedRefs.current[i];
      if (el) el.style.transform = `scaleX(${p})`;
      const b = bufRefs.current[i];
      if (b) b.style.transform = `scaleX(${clamp((t + 9 - s) / F, 0, 1)})`;
    });
    const frac = clamp(t / duration, 0, 1);
    if (knobRef.current) knobRef.current.style.left = `${frac * 100}%`;
    if (miniRef.current) miniRef.current.style.transform = `scaleX(${frac})`;
    const label = `${formatTimestamp(t)} / ${formatTimestamp(duration)}`;
    if (timeRef.current) timeRef.current.textContent = label;
    if (timeRef2.current) timeRef2.current.textContent = label;

    const i = clamp(Math.floor(t / F), 0, frames.length - 1);
    const local = clamp((t - i * F) / F, 0, 1);
    const kb = kbRefs.current[i];
    if (kb) {
      if (reduceRef.current) {
        kb.style.transform = "scale(1.02)";
      } else {
        const v = KB[i % KB.length];
        const sc = v[0] + (v[1] - v[0]) * local;
        const x = v[2] + (v[3] - v[2]) * local;
        const y = v[4] + (v[5] - v[4]) * local;
        kb.style.transform = `translate3d(${x}%, ${y}%, 0) scale(${sc})`;
      }
    }
    const text = frames[i]?.cc ?? "";
    if (ccRef.current) {
      const chars = reduceRef.current ? text.length : Math.floor((t - i * F) * 32);
      ccRef.current.textContent = text.slice(0, clamp(chars, 0, text.length));
      ccRef.current.style.visibility = chars > 0 && text ? "visible" : "hidden";
    }
    if (i !== idxRef.current) {
      idxRef.current = i;
      setIdx(i);
      onChapter?.(i);
    }
  }, [frames, F, duration, onChapter]);

  // ── The clock ─────────────────────────────────────────────────────────────
  useEffect(() => {
    playingRef.current = playing;
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      tRef.current += dt * speedRef.current;
      if (tRef.current >= duration) {
        tRef.current = duration;
        paint();
        setPlaying(false);
        setEnded(true);
        setCountdown(UP_NEXT_SECONDS);
        return;
      }
      paint();
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing, duration, paint]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  // Paint once on mount and whenever the frames change underneath us.
  useEffect(() => {
    if (tRef.current > duration) tRef.current = 0;
    paint();
  }, [paint, duration]);

  // ── Controls auto-hide ───────────────────────────────────────────────────
  const poke = useCallback(() => {
    setControls(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      if (playingRef.current) setControls(false);
    }, 2800);
  }, []);
  useEffect(() => () => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
  }, []);
  useEffect(() => {
    if (!playing) return;
    const t = window.setTimeout(() => {
      if (playingRef.current) setControls(false);
    }, 2800);
    return () => window.clearTimeout(t);
  }, [playing]);

  // ── Transport ────────────────────────────────────────────────────────────
  const flash = (kind: "play" | "pause") => setBigIcon({ kind, key: Date.now() });

  const play = useCallback(() => {
    if (tRef.current >= duration - 0.05) {
      tRef.current = 0;
      paint();
    }
    setStarted(true);
    setEnded(false);
    setCountdown(null);
    setPlaying(true);
  }, [duration, paint]);

  const pause = useCallback(() => setPlaying(false), []);

  const toggle = useCallback(() => {
    if (playingRef.current) {
      pause();
      flash("pause");
    } else {
      play();
      flash("play");
    }
  }, [play, pause]);

  const seek = useCallback(
    (s: number) => {
      tRef.current = clamp(s, 0, duration - 0.01);
      setEnded(false);
      setCountdown(null);
      setStarted(true);
      paint();
    },
    [duration, paint],
  );

  const seekAndPlay = useCallback(
    (s: number) => {
      seek(s);
      setPlaying(true);
    },
    [seek],
  );

  const next = useCallback(() => {
    const i = Math.floor(tRef.current / F);
    if (i + 1 < frames.length) seekAndPlay((i + 1) * F + 0.01);
    else if (upNext && onUpNext) onUpNext();
    else {
      tRef.current = duration;
      paint();
      setPlaying(false);
      setEnded(true);
      setCountdown(UP_NEXT_SECONDS);
    }
  }, [F, frames.length, seekAndPlay, upNext, onUpNext, duration, paint]);

  const prev = useCallback(() => {
    const i = Math.floor(tRef.current / F);
    const into = tRef.current - i * F;
    seekAndPlay(into > 2 || i === 0 ? i * F + 0.01 : (i - 1) * F + 0.01);
  }, [F, seekAndPlay]);

  useEffect(() => {
    if (!handleRef) return;
    handleRef.current = { seek: seekAndPlay, play };
    return () => {
      handleRef.current = null;
    };
  }, [handleRef, seekAndPlay, play]);

  // ── Fullscreen ───────────────────────────────────────────────────────────
  useEffect(() => {
    const on = () => setFs(document.fullscreenElement === rootRef.current);
    document.addEventListener("fullscreenchange", on);
    return () => document.removeEventListener("fullscreenchange", on);
  }, []);
  const toggleFs = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen?.();
      return;
    }
    if (pseudoFs) {
      setPseudoFs(false);
      return;
    }
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => setPseudoFs(true));
    } else {
      setPseudoFs(true);
    }
  }, [pseudoFs]);

  // ── Keyboard, the way a watch page answers it ────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tgt = e.target as HTMLElement | null;
      if (tgt && (tgt.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(tgt.tagName))) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (document.querySelector("[aria-modal='true']")) return;
      const k = e.key.toLowerCase();
      if (k === "k" || (k === " " && tgt === document.body)) {
        e.preventDefault();
        toggle();
      } else if (k === "j" || k === "arrowleft") {
        seek(tRef.current - SEEK_STEP);
        setRipple({ side: "l", key: Date.now() });
      } else if (k === "l" || k === "arrowright") {
        seek(tRef.current + SEEK_STEP);
        setRipple({ side: "r", key: Date.now() });
      } else if (k === "f") toggleFs();
      else if (k === "c") setCc((v) => !v);
      else if (k === "t" && onTheatre) onTheatre();
      else if (k === "m") setMuted((v) => !v);
      else return;
      poke();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle, seek, toggleFs, onTheatre, poke]);

  // ── Surface gestures ─────────────────────────────────────────────────────
  const onSurfaceUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (menu) {
      setMenu(null);
      return;
    }
    if (!started) {
      play();
      return;
    }
    if (e.pointerType === "mouse") {
      toggle();
      poke();
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const side: "l" | "r" | "c" = x < 0.35 ? "l" : x > 0.65 ? "r" : "c";
    const now = Date.now();
    const prevTap = lastTap.current;
    if (prevTap && now - prevTap.at < 320 && side !== "c" && prevTap.side === side) {
      seek(tRef.current + (side === "l" ? -SEEK_STEP : SEEK_STEP));
      setRipple({ side, key: now });
      lastTap.current = null;
      return;
    }
    lastTap.current = { at: now, side };
    if (controls && playingRef.current) {
      setControls(false);
    } else {
      poke();
    }
  };

  // ── Scrubber ─────────────────────────────────────────────────────────────
  const wasPlaying = useRef(false);
  const tAt = (clientX: number): { t: number; x: number; w: number } | null => {
    const bar = barRef.current;
    if (!bar) return null;
    const r = bar.getBoundingClientRect();
    return { t: clamp((clientX - r.left) / r.width, 0, 1) * duration, x: clientX - r.left, w: r.width };
  };
  const onBarDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    wasPlaying.current = playingRef.current;
    setPlaying(false);
    setScrubbing(true);
    const at = tAt(e.clientX);
    if (at) {
      seek(at.t);
      setHover(at);
    }
  };
  const onBarMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const at = tAt(e.clientX);
    if (!at) return;
    if (scrubbing) seek(at.t);
    if (scrubbing || e.pointerType === "mouse") setHover(at);
    poke();
  };
  const onBarUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!scrubbing) return;
    setScrubbing(false);
    if (e.pointerType !== "mouse") setHover(null);
    if (wasPlaying.current || !started) setPlaying(true);
  };

  // ── Up next countdown ────────────────────────────────────────────────────
  useEffect(() => {
    if (!ended || countdown === null || countdown <= 0) return;
    const t = window.setTimeout(() => setCountdown((c) => (c === null ? null : c - 1)), 1000);
    return () => window.clearTimeout(t);
  }, [ended, countdown]);
  useEffect(() => {
    if (ended && countdown === 0 && upNext && onUpNext) onUpNext();
  }, [ended, countdown, upNext, onUpNext]);

  const frame = frames[idx];
  const hoverFrame = hover ? frames[clamp(Math.floor(hover.t / F), 0, frames.length - 1)] : null;
  const showUi = controls || !playing || scrubbing || !!menu;

  const segs = useMemo(() => frames.map((f, i) => ({ key: `${i}-${f.label}`, w: 100 / frames.length })), [frames]);

  const rootClass = [
    "wtp",
    showUi ? "is-ui" : "",
    started ? "is-started" : "",
    playing ? "is-playing" : "",
    ended ? "is-ended" : "",
    scrubbing ? "is-scrub" : "",
    pseudoFs ? "is-pseudo-fs" : "",
    hover ? "is-hover" : "",
    fs ? "is-fs" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="wtp-wrap">
      {ambient && started ? (
        <div className="wtp-ambient" aria-hidden="true">
          <Pic photo={frame?.photo} />
        </div>
      ) : null}
      <div
        ref={rootRef}
        className={rootClass}
        onMouseMove={poke}
        onMouseLeave={() => {
          setHover(null);
          if (playingRef.current) setControls(false);
        }}
        role="region"
        aria-label={`Video player: ${title}`}
      >
        {/* Frames */}
        <div className="wtp-frames">
          {frames.map((f, i) => (
            <div key={`${i}-${f.photo?.url ?? ""}`} className={`wtp-f${i === idx ? " is-on" : ""}`}>
              <div
                className="wtp-kb"
                ref={(el) => {
                  kbRefs.current[i] = el;
                }}
              >
                <Pic photo={f.photo} eager={i < 2} />
              </div>
            </div>
          ))}
        </div>

        {/* Captions */}
        {cc ? (
          <div className="wtp-cc" aria-live="off">
            <span ref={ccRef} className="wtp-cc-line" />
          </div>
        ) : null}

        {/* The tappable surface */}
        <div
          className="wtp-surface"
          onPointerUp={onSurfaceUp}
          // The tap already did its job in pointerup. Cancelling touchend stops the
          // browser's follow-up click from landing on the controls it just revealed.
          onTouchEnd={(e) => e.preventDefault()}
          onDoubleClick={(e) => {
          if (window.matchMedia?.("(pointer: fine)").matches) {
            e.preventDefault();
            toggleFs();
          }
        }} />

        {/* Poster */}
        {!started ? (
          <button type="button" className="wtp-poster" onClick={play} aria-label={`Play ${title}`}>
            <span className="wtp-poster-btn">
              <IPlay size={34} color="#fff" />
            </span>
            <span className="wtp-poster-dur">{formatTimestamp(duration)}</span>
            <span className="wtp-poster-hint">tap to play · captions on</span>
          </button>
        ) : null}

        {/* Double-tap ripples */}
        {ripple ? (
          <div key={ripple.key} className={`wtp-ripple is-${ripple.side}`} aria-hidden="true">
            <ISeekArrows size={26} color="#fff" back={ripple.side === "l"} />
            <span>{SEEK_STEP} seconds</span>
          </div>
        ) : null}

        {/* Center flash on desktop toggle */}
        {bigIcon ? (
          <div key={bigIcon.key} className="wtp-flash" aria-hidden="true">
            {bigIcon.kind === "play" ? <IPlay size={30} color="#fff" /> : <IPause size={30} color="#fff" />}
          </div>
        ) : null}

        {/* Mobile center cluster */}
        {started && !ended ? (
          <div className="wtp-center">
            <button type="button" className="wtp-cbtn" onClick={prev} aria-label="Previous chapter">
              <IPrev size={30} color="#fff" />
            </button>
            <button type="button" className="wtp-cbtn is-big" onClick={toggle} aria-label={playing ? "Pause" : "Play"}>
              {playing ? <IPause size={40} color="#fff" /> : <IPlay size={40} color="#fff" />}
            </button>
            <button type="button" className="wtp-cbtn" onClick={next} aria-label="Next chapter">
              <INext size={30} color="#fff" />
            </button>
          </div>
        ) : null}

        {/* Mobile top-right */}
        {started ? (
          <div className="wtp-top">
            <button type="button" className={`wtp-ibtn${cc ? " is-on" : ""}`} onClick={() => setCc((v) => !v)} aria-label="Subtitles/closed captions" aria-pressed={cc}>
              <ICC size={24} color="#fff" />
            </button>
            <button type="button" className="wtp-ibtn" onClick={() => setMenu((m) => (m ? null : "main"))} aria-label="Settings">
              <IGear size={24} color="#fff" />
            </button>
          </div>
        ) : null}

        {/* End screen */}
        {ended ? (
          <div className="wtp-end">
            {upNext && countdown !== null && countdown > 0 ? (
              <div className="wtp-upnext">
                {endLine ? <p className="wtp-endline is-small">{endLine}</p> : null}
                <p className="wtp-upnext-k">Up next in {countdown}</p>
                <div className="wtp-upnext-card">
                  <span className="wtp-upnext-thumb">
                    <Pic photo={upNext.photo} />
                    <svg className="wtp-ring" viewBox="0 0 44 44" aria-hidden="true">
                      <circle cx="22" cy="22" r="19" fill="rgba(0,0,0,.55)" />
                      <circle
                        cx="22"
                        cy="22"
                        r="19"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="3"
                        strokeDasharray={119.4}
                        strokeDashoffset={119.4 * (countdown / UP_NEXT_SECONDS)}
                        transform="rotate(-90 22 22)"
                        style={{ transition: "stroke-dashoffset 1s linear" }}
                      />
                      <path d="M18 15.5v13l10-6.5z" fill="#fff" />
                    </svg>
                  </span>
                  <span className="wtp-upnext-meta">
                    <b>{upNext.title}</b>
                    <small>{upNext.channel}</small>
                  </span>
                </div>
                <div className="wtp-upnext-btns">
                  <button type="button" onClick={() => setCountdown(null)}>Cancel</button>
                  <button type="button" className="is-go" onClick={onUpNext}>Play now</button>
                </div>
              </div>
            ) : (
              <div className="wtp-endbox">
                {endLine ? <p className="wtp-endline">{endLine}</p> : null}
                <button type="button" className="wtp-replay" onClick={play}>
                  <IReplay size={22} color="#fff" /> Watch again
                </button>
              </div>
            )}
          </div>
        ) : null}

        {/* Bottom chrome */}
        <div className="wtp-bottom">
          <div
            className={`wtp-bar${hover ? " is-hover" : ""}`}
            ref={barRef}
            onPointerDown={onBarDown}
            onPointerMove={onBarMove}
            onPointerUp={onBarUp}
            onPointerLeave={(e) => {
              if (e.pointerType === "mouse" && !scrubbing) setHover(null);
            }}
            role="slider"
            aria-label="Seek slider"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(idx * F)}
            aria-valuetext={`${formatTimestamp(idx * F)} — ${frame?.label ?? ""}`}
            tabIndex={0}
          >
            <div className="wtp-segs">
              {segs.map((s, i) => {
                const hovered = hover && Math.floor(hover.t / F) === i;
                return (
                  <span key={s.key} className={`wtp-seg${hovered ? " is-h" : ""}`} style={{ width: `${s.w}%` } as CSSProperties}>
                    <span className="wtp-seg-buf" ref={(el) => { bufRefs.current[i] = el; }} />
                    <span className="wtp-seg-play" ref={(el) => { playedRefs.current[i] = el; }} />
                  </span>
                );
              })}
            </div>
            <span className="wtp-knob" ref={knobRef} />
            {hover && hoverFrame ? (
              <div
                className="wtp-preview"
                style={{ left: clamp(hover.x, 82, Math.max(82, hover.w - 82)) }}
              >
                <span className="wtp-preview-img">
                  <Pic photo={hoverFrame.photo} />
                </span>
                <span className="wtp-preview-ch">{hoverFrame.label}</span>
                <span className="wtp-preview-t">{formatTimestamp(hover.t)}</span>
              </div>
            ) : null}
          </div>

          <div className="wtp-row">
            <button type="button" className="wtp-ibtn only-fine" onClick={ended ? play : toggle} aria-label={playing ? "Pause (k)" : "Play (k)"}>
              {ended ? <IReplay size={26} color="#fff" /> : playing ? <IPause size={28} color="#fff" /> : <IPlay size={28} color="#fff" />}
            </button>
            <button type="button" className="wtp-ibtn only-fine" onClick={next} aria-label="Next">
              <INext size={24} color="#fff" />
            </button>
            <button
              type="button"
              className="wtp-ibtn only-fine"
              onClick={() => {
                setMuted((m) => !m);
                if (!muted) onToast("muted. the silence is also romantic.");
                else onToast("this one's silent — hum your song ♪");
              }}
              aria-label={muted ? "Unmute (m)" : "Mute (m)"}
            >
              <IVolume size={24} color="#fff" muted={muted} />
            </button>
            <span className="wtp-time" ref={timeRef}>
              0:00 / {formatTimestamp(duration)}
            </span>
            {frame ? (
              <button type="button" className="wtp-chap" onClick={onOpenChapters}>
                <span className="wtp-dot" aria-hidden="true">•</span>
                <span className="wtp-chap-t">{frame.label}</span>
                <IChevron size={16} color="#fff" dir="right" />
              </button>
            ) : null}
            <span className="wtp-flex" />
            <button type="button" className={`wtp-ibtn only-fine${cc ? " is-on" : ""}`} onClick={() => setCc((v) => !v)} aria-label="Subtitles/closed captions (c)" aria-pressed={cc}>
              <ICC size={24} color="#fff" />
            </button>
            <button type="button" className="wtp-ibtn only-fine wtp-gearbtn" onClick={() => setMenu((m) => (m ? null : "main"))} aria-label="Settings">
              <IGear size={24} color="#fff" className={menu ? "wtp-spin" : undefined} />
              <span className="wtp-hd">HD</span>
            </button>
            {onTheatre ? (
              <button type="button" className="wtp-ibtn only-wide" onClick={onTheatre} aria-label={theatre ? "Default view (t)" : "Theatre mode (t)"}>
                {theatre ? <IDefaultView size={24} color="#fff" /> : <ITheatre size={24} color="#fff" />}
              </button>
            ) : null}
            <button type="button" className="wtp-ibtn" onClick={toggleFs} aria-label={fs || pseudoFs ? "Exit full screen (f)" : "Full screen (f)"}>
              <IFullscreen size={24} color="#fff" exit={fs || pseudoFs} />
            </button>
          </div>
          <span className="wtp-time wtp-time-m" ref={timeRef2} aria-hidden="true" />
        </div>

        {/* Always-there hairline progress (mobile, controls hidden) */}
        <span className="wtp-mini" aria-hidden="true">
          <span ref={miniRef} />
        </span>

        <span className="wtp-mark" aria-hidden="true">
          <Mark size={22} />
        </span>

        {/* Settings */}
        {menu ? (
          <>
            <button type="button" className="wtp-menu-scrim" aria-label="Close settings" onClick={() => setMenu(null)} />
            <div className="wtp-menu" role="menu">
              {menu === "main" ? (
                <>
                  <MenuRow label="Ambient mode" onClick={() => setAmbient((a) => !a)} right={<Toggle on={ambient} />} />
                  <MenuRow label="Captions" onClick={() => setCc((v) => !v)} right={<span>{cc ? "English (written by me)" : "Off"}</span>} />
                  <MenuRow label="Playback speed" onClick={() => setMenu("speed")} right={<span>{speed === 1 ? "Normal" : `${speed}`} ›</span>} />
                  <MenuRow label="Quality" onClick={() => setMenu("quality")} right={<span>{quality.split(" (")[0]} ›</span>} />
                </>
              ) : menu === "speed" ? (
                <>
                  <MenuHead label="Playback speed" onBack={() => setMenu("main")} />
                  {SPEEDS.map((s) => (
                    <MenuPick
                      key={s}
                      label={s === 1 ? "Normal" : String(s)}
                      on={speed === s}
                      onClick={() => {
                        setSpeed(s);
                        setMenu(null);
                        if (s < 1) onToast("slow-mo. good choice. linger.");
                        if (s === 2) onToast("2×? you're rushing the best part.");
                      }}
                    />
                  ))}
                </>
              ) : (
                <>
                  <MenuHead label="Quality" onBack={() => setMenu("main")} />
                  {QUALITIES.map((q) => (
                    <MenuPick
                      key={q}
                      label={q}
                      on={quality === q}
                      onClick={() => {
                        setQuality(q);
                        setMenu(null);
                        onToast(q.startsWith("2160") ? "maximum resolution. she deserves it." : "lower quality… she still looks unreal.");
                      }}
                    />
                  ))}
                </>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function MenuRow({ label, right, onClick }: { label: string; right: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" role="menuitem" className="wtp-mrow" onClick={onClick}>
      <span>{label}</span>
      <span className="wtp-mrow-r">{right}</span>
    </button>
  );
}

function MenuHead({ label, onBack }: { label: string; onBack: () => void }) {
  return (
    <button type="button" className="wtp-mhead" onClick={onBack}>
      <IChevron size={18} color="#fff" dir="left" /> {label}
    </button>
  );
}

function MenuPick({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button type="button" role="menuitemradio" aria-checked={on} className="wtp-mpick" onClick={onClick}>
      <span className="wtp-mpick-c">{on ? <ICheck size={18} color="#fff" /> : null}</span>
      {label}
    </button>
  );
}

function Toggle({ on }: { on: boolean }) {
  return <span className={`wtp-toggle${on ? " is-on" : ""}`} aria-hidden="true"><i /></span>;
}

export const FILM_CSS = `
.wtp-wrap { position: relative; }
.wtp-ambient {
  display: none;
  position: absolute; inset: -6% -4%; z-index: 0; pointer-events: none;
  filter: blur(56px) saturate(1.5); opacity: .42; transform: translateZ(0);
  border-radius: 40px; overflow: hidden; transition: opacity .8s ease;
}
.wtp-ambient img { transition: opacity .9s ease; }
.wtp {
  position: relative; z-index: 1; width: 100%; aspect-ratio: 16 / 9; background: #000;
  overflow: hidden; user-select: none; -webkit-user-select: none; touch-action: manipulation;
  font-family: ${FONT}; color: #fff; outline: none;
}
.wtp.is-pseudo-fs { position: fixed; inset: 0; z-index: 400; aspect-ratio: auto; width: 100vw; height: 100dvh; }
.wtp.is-fs { aspect-ratio: auto; }
.wtp-frames { position: absolute; inset: 0; }
.wtp-f { position: absolute; inset: 0; opacity: 0; transition: opacity .9s ease; overflow: hidden; }
.wtp-f.is-on { opacity: 1; }
.wtp-kb { position: absolute; inset: 0; will-change: transform; transform-origin: 50% 50%; }
.wtp-surface { position: absolute; inset: 0; z-index: 2; cursor: pointer; }
.wtp.is-playing:not(.is-ui) .wtp-surface { cursor: none; }
.wtp-cc {
  position: absolute; left: 0; right: 0; bottom: 8%; z-index: 3; display: flex; justify-content: center;
  pointer-events: none; padding: 0 8%; transition: transform .2s ease;
}
.wtp.is-ui.is-started .wtp-cc { transform: translateY(-38px); }
.wtp.is-hover .wtp-cc { opacity: 0; }
.wtp-cc-line {
  background: rgba(8,8,8,.75); color: #fff; padding: 2px 8px 3px; border-radius: 2px;
  font-size: clamp(12.5px, calc(0.9vw + 8px), 22px); line-height: 1.35; text-align: center;
  box-decoration-break: clone; -webkit-box-decoration-break: clone; max-width: 100%;
}
.wtp-poster { position: absolute; inset: 0; z-index: 6; border: 0; padding: 0; background: linear-gradient(180deg, rgba(0,0,0,.05) 50%, rgba(0,0,0,.55)); cursor: pointer; }
.wtp-poster-btn {
  position: absolute; left: 50%; top: 50%; width: 68px; height: 68px; margin: -34px 0 0 -34px;
  border-radius: 50%; background: rgba(15,15,15,.72); display: grid; place-items: center;
  box-shadow: 0 0 0 1px rgba(255,255,255,.18), 0 10px 40px rgba(0,0,0,.4);
  transition: background .2s ease, transform .2s ease;
}
.wtp-poster-btn svg { margin-left: 4px; }
.wtp-poster:hover .wtp-poster-btn { background: ${T.accent}; transform: scale(1.06); }
.wtp-poster-dur {
  position: absolute; right: 10px; bottom: 10px; background: rgba(0,0,0,.8); color: #fff;
  font-size: 12px; font-weight: 500; padding: 1px 5px; border-radius: 4px;
}
.wtp-poster-hint {
  position: absolute; left: 12px; bottom: 11px; font-size: 12px; color: rgba(255,255,255,.85);
  text-shadow: 0 1px 2px rgba(0,0,0,.6);
}
.wtp-ripple {
  position: absolute; top: 0; bottom: 0; width: 42%; z-index: 7; pointer-events: none;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
  background: rgba(255,255,255,.14); font-size: 12px; font-weight: 500;
  animation: wtp-ripple .65s ease-out forwards;
}
.wtp-ripple.is-l { left: 0; border-radius: 0 50% 50% 0 / 0 50% 50% 0; }
.wtp-ripple.is-r { right: 0; border-radius: 50% 0 0 50% / 50% 0 0 50%; }
@keyframes wtp-ripple { 0% { opacity: 0; } 20% { opacity: 1; } 100% { opacity: 0; } }
.wtp-flash {
  position: absolute; left: 50%; top: 50%; width: 60px; height: 60px; margin: -30px 0 0 -30px; z-index: 7;
  border-radius: 50%; background: rgba(0,0,0,.5); display: grid; place-items: center; pointer-events: none;
  animation: wtp-flash .5s ease-out forwards;
}
@keyframes wtp-flash { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(1.7); } }
.wtp-center {
  position: absolute; inset: 0; z-index: 4; display: flex; align-items: center; justify-content: center; gap: 12%;
  background: rgba(0,0,0,.38); opacity: 0; pointer-events: none; transition: opacity .18s ease;
}
.wtp-cbtn { border: 0; background: transparent; padding: 0; width: 48px; height: 48px; display: grid; place-items: center; cursor: pointer; border-radius: 50%; }
.wtp-cbtn.is-big { width: 64px; height: 64px; background: rgba(0,0,0,.35); }
.wtp-top { position: absolute; top: 4px; right: 4px; z-index: 5; display: flex; opacity: 0; pointer-events: none; transition: opacity .18s ease; }
.wtp-bottom {
  position: absolute; left: 0; right: 0; bottom: 0; z-index: 5; padding: 0 12px 2px;
  background: linear-gradient(180deg, transparent, rgba(0,0,0,.72));
  opacity: 0; pointer-events: none; transition: opacity .2s ease;
}
.wtp.is-ui.is-started .wtp-bottom { opacity: 1; pointer-events: auto; }
.wtp-bar { position: relative; height: 18px; display: flex; align-items: center; cursor: pointer; touch-action: none; }
.wtp-segs { position: relative; display: flex; gap: 2px; width: 100%; height: 3px; transition: height .12s ease; }
.wtp-bar:hover .wtp-segs, .wtp.is-scrub .wtp-segs { height: 5px; }
.wtp-seg { position: relative; height: 100%; background: rgba(255,255,255,.22); overflow: hidden; transition: transform .12s ease; }
.wtp-seg.is-h { transform: scaleY(1.6); }
.wtp-seg-buf, .wtp-seg-play { position: absolute; inset: 0; transform-origin: 0 50%; transform: scaleX(0); }
.wtp-seg-buf { background: rgba(255,255,255,.4); }
.wtp-seg-play { background: linear-gradient(90deg, ${T.accent}, #FF6FA5); }
.wtp-knob {
  position: absolute; top: 50%; width: 13px; height: 13px; margin: -6.5px 0 0 -6.5px; border-radius: 50%;
  background: ${T.accent}; transform: scale(0); transition: transform .12s ease; pointer-events: none;
  box-shadow: 0 0 0 3px rgba(255,62,134,.25);
}
.wtp-bar:hover .wtp-knob, .wtp.is-scrub .wtp-knob { transform: scale(1); }
.wtp-preview {
  position: absolute; bottom: 22px; transform: translateX(-50%); width: 164px; pointer-events: none;
  display: flex; flex-direction: column; align-items: center; gap: 3px; text-shadow: 0 1px 2px rgba(0,0,0,.8);
}
.wtp-preview-img { position: relative; width: 164px; aspect-ratio: 16 / 9; border-radius: 8px; overflow: hidden; border: 2px solid #fff; background: #000; }
.wtp-preview-ch { font-size: 12.5px; font-weight: 500; max-width: 200px; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wtp-preview-t { font-size: 12.5px; font-weight: 500; }
.wtp-row { display: flex; align-items: center; gap: 2px; height: 44px; }
.wtp-ibtn {
  position: relative; width: 44px; height: 44px; flex: none; border: 0; background: transparent; padding: 0;
  display: grid; place-items: center; cursor: pointer; border-radius: 50%; opacity: .95;
}
.wtp-ibtn:hover { opacity: 1; background: rgba(255,255,255,.08); }
.wtp-ibtn.is-on::after { content: ""; position: absolute; left: 12px; right: 12px; bottom: 9px; height: 3px; border-radius: 2px; background: ${T.accent}; }
.wtp-hd { position: absolute; top: 9px; right: 7px; background: ${T.accent}; color: #fff; font-size: 7.5px; font-weight: 700; padding: 0 2px; border-radius: 2px; line-height: 10px; }
.wtp-spin { transition: transform .3s ease; transform: rotate(30deg); }
.wtp-time { font-size: 13px; font-variant-numeric: tabular-nums; padding: 0 8px; white-space: nowrap; flex: none; }
.wtp-time-m { display: none; }
.wtp-chap {
  display: inline-flex; align-items: center; gap: 4px; min-width: 0; height: 32px; padding: 0 6px 0 2px;
  border: 0; background: transparent; color: #fff; font-family: inherit; font-size: 13px; cursor: pointer; border-radius: 16px;
}
.wtp-chap:hover { background: rgba(255,255,255,.1); }
.wtp-chap-t { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 280px; }
.wtp.is-fs .wtp-cc-line, .wtp.is-pseudo-fs .wtp-cc-line { font-size: clamp(16px, 2.2vw, 34px); }
.wtp-dot { opacity: .8; }
.wtp-flex { flex: 1; }
.wtp-mini { position: absolute; left: 0; right: 0; bottom: 0; height: 3px; z-index: 4; background: rgba(255,255,255,.2); opacity: 0; transition: opacity .2s ease; pointer-events: none; }
.wtp-mini span { position: absolute; inset: 0; background: ${T.accent}; transform-origin: 0 50%; transform: scaleX(0); }
.wtp-mark { position: absolute; right: 14px; bottom: 58px; z-index: 3; opacity: 0; transition: opacity .3s ease; pointer-events: none; }
.wtp.is-ui.is-started .wtp-mark { opacity: .55; }
.wtp-end {
  position: absolute; inset: 0; z-index: 6; display: grid; place-items: center; padding: 12px;
  background: radial-gradient(ellipse at center, rgba(0,0,0,.55), rgba(0,0,0,.85)); animation: wtp-in .35s ease both;
}
.wtp-upnext { display: flex; flex-direction: column; align-items: center; gap: 8px; max-width: 360px; width: 100%; }
.wtp-upnext-k { margin: 0; font-size: 13px; color: rgba(255,255,255,.8); }
.wtp-upnext-card { display: flex; gap: 10px; align-items: center; width: 100%; }
.wtp-upnext-thumb { position: relative; width: 44%; flex: none; aspect-ratio: 16 / 9; border-radius: 8px; overflow: hidden; background: #222; }
.wtp-ring { position: absolute; left: 50%; top: 50%; width: 40px; height: 40px; margin: -20px 0 0 -20px; }
.wtp-upnext-meta { display: flex; flex-direction: column; gap: 3px; min-width: 0; text-align: left; }
.wtp-upnext-meta b { font-size: 14px; line-height: 1.3; font-weight: 500; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.wtp-upnext-meta small { font-size: 12px; color: rgba(255,255,255,.7); }
.wtp-upnext-btns { display: flex; gap: 8px; }
.wtp-upnext-btns button {
  height: 34px; padding: 0 16px; border-radius: 17px; border: 0; background: rgba(255,255,255,.14);
  color: #fff; font-family: inherit; font-size: 13px; font-weight: 500; cursor: pointer;
}
.wtp-upnext-btns .is-go { background: #fff; color: #0f0f0f; }
.wtp-endbox { display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; }
.wtp.is-ended .wtp-cc { opacity: 0; }
.wtp-endline.is-small { font-size: 12.5px; color: #FFB3CF; margin-bottom: 6px; }
.wtp-endline { margin: 0; font-size: clamp(13px, calc(0.6vw + 10px), 17px); color: #fff; max-width: 320px; line-height: 1.35; }
.wtp-replay {
  display: inline-flex; align-items: center; gap: 8px; height: 40px; padding: 0 18px; border-radius: 20px; border: 0;
  background: rgba(255,255,255,.16); color: #fff; font-family: inherit; font-size: 14px; font-weight: 500; cursor: pointer;
}
.wtp-replay:hover { background: rgba(255,255,255,.26); }
.wtp-menu-scrim { position: absolute; inset: 0; z-index: 8; background: transparent; border: 0; padding: 0; cursor: default; }
.wtp-menu {
  position: absolute; right: 12px; bottom: 60px; z-index: 9; width: 290px; max-height: calc(100% - 72px); overflow-y: auto;
  background: rgba(28,28,28,.94); border-radius: 12px; padding: 8px 0; box-shadow: 0 8px 30px rgba(0,0,0,.5);
  animation: wtp-in .16s ease both;
}
.wtp-mrow, .wtp-mpick, .wtp-mhead {
  display: flex; align-items: center; gap: 12px; width: 100%; min-height: 40px; padding: 0 16px; border: 0;
  background: transparent; color: #fff; font-family: inherit; font-size: 13.5px; text-align: left; cursor: pointer;
}
.wtp-mrow:hover, .wtp-mpick:hover { background: rgba(255,255,255,.1); }
.wtp-mrow > span:first-child { flex: 1; font-weight: 500; }
.wtp-mrow-r { color: rgba(255,255,255,.75); font-size: 12.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px; }
.wtp-mhead { font-weight: 500; border-bottom: 1px solid rgba(255,255,255,.14); margin-bottom: 6px; min-height: 46px; }
.wtp-mpick-c { width: 18px; flex: none; }
.wtp-toggle { display: inline-block; position: relative; width: 36px; height: 14px; border-radius: 7px; background: rgba(255,255,255,.3); vertical-align: middle; }
.wtp-toggle i { position: absolute; top: -3px; left: -2px; width: 20px; height: 20px; border-radius: 50%; background: #ccc; transition: transform .2s ease, background .2s ease; box-shadow: 0 1px 3px rgba(0,0,0,.4); }
.wtp-toggle.is-on { background: rgba(255,62,134,.55); }
.wtp-toggle.is-on i { transform: translateX(20px); background: ${T.accent}; }
@media (min-width: 1000px) { .wtp-ambient { display: block; } }
@keyframes wtp-in { from { opacity: 0; } to { opacity: 1; } }

/* Desktop / fine pointer */
@media (hover: hover) and (pointer: fine) {
  .wtp-center, .wtp-top { display: none; }
}
/* Touch */
@media (hover: none), (pointer: coarse) {
  .only-fine { display: none; }
  .wtp.is-started .wtp-mini { opacity: 1; }
  .wtp.is-ui.is-started .wtp-mini { opacity: 0; }
  .wtp.is-ui.is-started .wtp-center, .wtp.is-ui.is-started .wtp-top { opacity: 1; pointer-events: auto; }
  .wtp.is-ended .wtp-center { display: none; }
  .wtp-bottom { background: none; padding: 0; }
  .wtp-row { position: absolute; left: 0; right: 0; bottom: 8px; height: 40px; padding: 0 4px 0 6px; }
  .wtp-bar { position: absolute; left: 0; right: 0; bottom: -7px; height: 16px; }
  .wtp-knob { transform: scale(1); }
  .wtp-time { font-size: 12px; padding: 0 4px; }
  .wtp-chap { font-size: 12px; }
  .wtp-chap-t { max-width: 38vw; }
  .wtp-mark { display: none; }
  .wtp.is-ui.is-started .wtp-cc { opacity: 0; }
  .wtp-preview { bottom: 26px; }
}
.only-wide { display: none; }
@media (min-width: 1000px) and (hover: hover) { .only-wide { display: grid; } }
@media (max-width: 600px) {
  .wtp-menu {
    position: fixed; left: 8px; right: 8px; bottom: 8px; width: auto; max-height: 70vh; z-index: 410;
    background: #212121; border-radius: 14px;
  }
  .wtp-menu-scrim { position: fixed; z-index: 405; background: rgba(0,0,0,.45); }
}
@media (prefers-reduced-motion: reduce) {
  .wtp-f { transition: none; }
  .wtp-ripple, .wtp-flash, .wtp-end, .wtp-menu { animation: none; }
}
`;
