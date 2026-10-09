"use client";

// The page shell's music, shared with whatever is inside it.
//
// ValentineDayEditorPage and ValentineDayViewer mount <DayMusicProvider>; the
// eight day Experiences keep calling `useSynthMusic()` / `<MusicToggle>` and
// those delegate here, so the sender's choice (off · melody · YouTube · track) plays in
// the live page AND in the editor preview without touching any day file.
// Kept in its own module (no imports from the kit) to avoid an import cycle.

import { createContext, useContext } from "react";
import type { MusicMode } from "../types";

export interface DayMusicApi {
  mode: MusicMode;
  /** Something is actually audible right now. */
  playing: boolean;
  /** Music is on for this page (mode !== "off"). */
  available: boolean;
  /** YouTube: the player is still loading / buffering. */
  loading: boolean;
  /** YouTube: the song refused to play (removed, region-locked, embedding off). */
  error: string | null;
  /** YouTube: the video's own title once the player knows it. Track: DayConfig.music.track.title. */
  title: string | null;
  toggle: () => void;
  /** Call from inside a tap/click handler — that is what browsers allow. */
  start: () => void;
  stop: () => void;
  /**
   * A day's <MusicToggle> registers while mounted, so the shell knows not to
   * draw its own button on top of it. Returns the unregister function.
   */
  registerToggle: () => () => void;

  // ── Fine control (used by the ✦ Premium layer; any day may use it) ──────────
  /** The song can start synchronously inside a tap right now (YouTube: player created + onReady). Melody/off: true. */
  ready: boolean;
  /** YouTube refused to start (onAutoplayBlocked, or nothing playing 2.5 s after start()). Show a "♪ Tap to hear" chip whose onClick calls start(). */
  blocked: boolean;
  /** The sender turned it off with a toggle (or "open quietly"); programmatic play() respects it. */
  userOff: boolean;
  /** Resume after pause() — a no-op if the visitor turned the music off. Safe outside a gesture once it has played. */
  play: () => void;
  /** A scene-driven pause (not the visitor's choice): play() brings it back. */
  pause: () => void;
  /** YouTube: seek (seconds). Melody: jump back to the top of its phrase ("the chorus"). */
  seekTo: (sec: number) => void;
  /** Current position in seconds (best effort; melody counts from start). */
  currentTime: () => number;
  /** Lower the music under a voice/SFX moment. level 0–1 (default .25). iOS + YouTube: pauses instead (volume is read-only there). */
  duck: (level?: number, ms?: number) => void;
  /** Undo duck(). */
  unduck: (ms?: number) => void;
  /**
   * A scare-sized duck: dip to `level` (default .2) in ~120 ms, hold for
   * `holdMs`, then ease back over ~700 ms. Re-calling extends the hold. Works
   * for track, YouTube and melody (iOS track/YouTube pause instead, as duck() does).
   */
  duckFor: (holdMs: number, level?: number) => void;
  /** Ramp the music to level 0–1. A no-op where it can't (iOS YouTube) — check canFade and show a visual instead. */
  fadeTo: (level: number, ms?: number) => void;
  /** False on iOS with a YouTube song (no volume control there). */
  canFade: boolean;
  /** This day hides the YouTube video behind the radio card (DayConfig.music.audioOnly). */
  audioOnly: boolean;
}

/** iPhone/iPad (incl. iPadOS that reports itself as a Mac). Client-only. */
export function isIOSDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export const DayMusicContext = createContext<DayMusicApi | null>(null);

export const useDayMusic = () => useContext(DayMusicContext);
