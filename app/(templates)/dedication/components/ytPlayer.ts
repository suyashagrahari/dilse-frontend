// ─── Dedication — the official YouTube IFrame Player ─────────────────────────
//
// COMPLIANCE, first, because it constrains everything else:
//
//   • This uses the official IFrame Player API and nothing else. No audio is
//     extracted, proxied, downloaded, or played apart from the video.
//   • The player element is rendered as a visible screen panel set into the
//     radio's face and is never hidden, covered or sized to 0x0 while a song
//     segment is running. This module never touches its size or visibility;
//     that is the panel component's job, and `PLAYER_PANEL` fixes it.
//   • No YouTube logo or wordmark is reproduced in our chrome. The player
//     supplies its own branding.
//
// AUTOPLAY, second, because it is the thing that breaks:
//
// The tune-in lock is the only user gesture the show gets. Inside that one
// handler we construct the player and immediately call `playVideo()` then
// `setVolume(0)`. Calls made before the iframe signals ready are queued by the
// API and replayed on ready, and `onReady` re-asserts both anyway. What matters
// is that playback ORIGINATES from a gesture — after that, every later
// `loadVideoById` on this same instance is allowed to make sound.
//
// `UNLOCK_ORDER` is asserted rather than described: `recordStep` builds the
// observed sequence and `assertUnlockOrder` shouts in development if a step is
// skipped or arrives out of order.
//
// ADS. An ad may play before the video. We do not fight it. The volume fade is
// started only once the player reports playback actually ADVANCING, not on
// load — see `waitForRealPlayback`. Honest caveat: the IFrame API gives no
// reliable ad signal, so an ad that plays and advances will satisfy that check.
// The worst case is the fade landing on the last seconds of an ad, which is a
// far better failure than a song that fades up over silence.

import { UNLOCK_ORDER, YT_READY_TIMEOUT_MS } from "./types";

// ── Minimal typings. No @types/youtube dependency is added. ──────────────────

interface YTPlayerVars {
  autoplay?: 0 | 1;
  controls?: 0 | 1;
  disablekb?: 0 | 1;
  enablejsapi?: 0 | 1;
  fs?: 0 | 1;
  playsinline?: 0 | 1;
  rel?: 0 | 1;
  origin?: string;
  start?: number;
  end?: number;
}

interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  setVolume(v: number): void;
  getVolume(): number;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  loadVideoById(opts: { videoId: string; startSeconds?: number; endSeconds?: number }): void;
  destroy(): void;
}

interface YTNamespace {
  Player: new (
    el: HTMLElement | string,
    opts: {
      width?: number | string;
      height?: number | string;
      videoId?: string;
      playerVars?: YTPlayerVars;
      events?: {
        onReady?: (e: { target: YTPlayer }) => void;
        onStateChange?: (e: { data: number; target: YTPlayer }) => void;
        onError?: (e: { data: number }) => void;
      };
    },
  ) => YTPlayer;
  PlayerState: { UNSTARTED: -1; ENDED: 0; PLAYING: 1; PAUSED: 2; BUFFERING: 3; CUED: 5 };
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const API_SRC = "https://www.youtube.com/iframe_api";
const STATE_ENDED = 0;
const STATE_PLAYING = 1;

let apiPromise: Promise<YTNamespace | null> | null = null;

/**
 * Load the IFrame API once, from YouTube directly.
 *
 * Called on MOUNT, not on the lock. If the 60kB of API script were fetched
 * inside the gesture handler, the player could not be constructed until it
 * arrived — and by then the gesture is spent. Pre-loading it during the tuning
 * screen is the difference between working and silently not working.
 */
export function loadYouTubeApi(): Promise<YTNamespace | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;

  apiPromise = new Promise<YTNamespace | null>((resolve) => {
    let done = false;
    const settle = (v: YTNamespace | null) => {
      if (done) return;
      done = true;
      resolve(v);
    };

    // Chain rather than overwrite: another template on the same page may own it.
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      settle(window.YT ?? null);
    };

    if (!document.querySelector(`script[src="${API_SRC}"]`)) {
      const s = document.createElement("script");
      s.src = API_SRC;
      s.async = true;
      s.onerror = () => settle(null);
      document.head.appendChild(s);
    }

    // A blocked or offline CDN must not hang the show forever.
    window.setTimeout(() => settle(window.YT ?? null), YT_READY_TIMEOUT_MS + 2000);
  });

  return apiPromise;
}

export type YtFailure = "yt-error" | "yt-timeout" | "yt-unavailable";

export interface YtControllerOptions {
  /** Every YouTube failure lands here. The caller skips the segment. */
  onFailure: (why: YtFailure, detail: string) => void;
  /** Fired when the currently-loaded video reaches its natural end. */
  onEnded: () => void;
  log: (level: "info" | "warn" | "error", message: string) => void;
}

export class YtController {
  private player: YTPlayer | null = null;
  private ready = false;
  private readyTimer: number | null = null;
  private rampTimer: number | null = null;
  private watchTimer: number | null = null;
  private destroyed = false;
  private opts: YtControllerOptions;

  /** The observed unlock sequence, compared against UNLOCK_ORDER. */
  private steps: string[] = [];

  constructor(opts: YtControllerOptions) {
    this.opts = opts;
  }

  get exists(): boolean {
    return this.player !== null;
  }

  get isReady(): boolean {
    return this.ready;
  }

  recordStep(step: (typeof UNLOCK_ORDER)[number]): void {
    this.steps.push(step);
  }

  /**
   * Compare the observed sequence against the contract.
   *
   * `expected` is filtered rather than fixed, because a show with no songs
   * legitimately performs neither the create nor the play nor the mute — the
   * assertion has to know the difference between "skipped a step" and "had no
   * player to step on".
   */
  assertUnlockOrder(expected: readonly string[]): void {
    if (process.env.NODE_ENV === "production") return;
    const observed = this.steps.join(" → ");
    const wanted = expected.join(" → ");
    if (observed !== wanted) {
      console.error(
        `[dedication] UNLOCK_ORDER VIOLATED.\n  expected: ${wanted}\n  observed: ${observed}\n` +
          "  Playback will fail silently on iOS Safari. Fix the tune-in handler.",
      );
    } else {
      console.info(`[dedication] unlock sequence OK — ${observed}`);
    }
  }

  /**
   * UNLOCK_ORDER step 2. MUST run inside the gesture handler.
   *
   * Returns false when the API never arrived; the caller then runs the show
   * without a player rather than waiting on one.
   */
  create(host: HTMLElement, videoId: string, startSeconds?: number): boolean {
    if (typeof window === "undefined" || !window.YT?.Player) {
      this.opts.log("error", "YT API not present at lock time — songs cannot play this session");
      this.opts.onFailure("yt-unavailable", "iframe api unavailable at gesture time");
      return false;
    }
    if (this.player) return true;

    this.readyTimer = window.setTimeout(() => {
      if (this.ready || this.destroyed) return;
      this.opts.log("error", `player never reached READY within ${YT_READY_TIMEOUT_MS}ms`);
      this.opts.onFailure("yt-timeout", "no onReady");
    }, YT_READY_TIMEOUT_MS);

    try {
      this.player = new window.YT.Player(host, {
        // The panel's own CSS drives the visible size; these keep the iframe
        // filling it rather than falling back to the API's 640x390 default.
        width: "100%",
        height: "100%",
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          fs: 0,
          playsinline: 1, // without this, iOS takes the video fullscreen and the radio disappears
          rel: 0,
          origin: window.location.origin,
          ...(startSeconds ? { start: Math.floor(startSeconds) } : {}),
        },
        events: {
          onReady: (e) => {
            if (this.destroyed) return;
            this.ready = true;
            if (this.readyTimer !== null) window.clearTimeout(this.readyTimer);
            this.readyTimer = null;
            // Re-assert the gesture-time calls. If the API's pre-ready queue
            // dropped them, this is the recovery; if it did not, this is a
            // harmless repeat.
            try {
              e.target.setVolume(0);
              e.target.playVideo();
            } catch {
              /* the queued calls already covered it */
            }
            this.opts.log("info", "player ready");
          },
          onStateChange: (e) => {
            if (e.data === STATE_ENDED) this.opts.onEnded();
          },
          onError: (e) => {
            // 2 bad parameter · 5 html5 · 100 removed/private · 101/150 embedding
            // disabled or geo/age restricted. All the same to the listener.
            this.opts.log("warn", `player error ${e.data} — segment skipped`);
            this.opts.onFailure("yt-error", `code ${e.data}`);
          },
        },
      });
    } catch (err) {
      this.opts.log("error", `YT.Player constructor threw: ${String(err)}`);
      this.opts.onFailure("yt-unavailable", String(err));
      return false;
    }
    return true;
  }

  /** UNLOCK_ORDER step 3. Queued by the API if the iframe is not up yet. */
  play(): void {
    try {
      this.player?.playVideo();
    } catch {
      /* queued or not yet callable; onReady re-asserts */
    }
  }

  pause(): void {
    try {
      this.player?.pauseVideo();
    } catch {
      /* nothing sensible to do */
    }
  }

  /** UNLOCK_ORDER step 4. */
  setVolume(v: number): void {
    try {
      this.player?.setVolume(Math.round(Math.min(100, Math.max(0, v))));
    } catch {
      /* queued */
    }
  }

  seek(seconds: number): void {
    try {
      this.player?.seekTo(seconds, true);
    } catch {
      /* not ready yet; the segment's start is applied via loadVideoById instead */
    }
  }

  currentTime(): number {
    try {
      return this.player?.getCurrentTime() ?? 0;
    } catch {
      return 0;
    }
  }

  isPlaying(): boolean {
    try {
      return this.player?.getPlayerState() === STATE_PLAYING;
    } catch {
      return false;
    }
  }

  /**
   * Swap in the next song WITHOUT pausing between segments. The player stays
   * warm — a paused player on iOS can need a fresh gesture to restart, and
   * there is no second gesture coming.
   */
  loadSong(videoId: string, startSeconds?: number, endSeconds?: number): void {
    if (!this.player) return;
    try {
      this.player.loadVideoById({
        videoId,
        startSeconds: startSeconds ?? 0,
        ...(endSeconds ? { endSeconds } : {}),
      });
    } catch (err) {
      this.opts.log("warn", `loadVideoById threw: ${String(err)}`);
      this.opts.onFailure("yt-error", "load threw");
    }
  }

  /**
   * Resolve once the video is genuinely ADVANCING, not merely "loaded".
   *
   * Two consecutive samples of a rising currentTime while the state is PLAYING.
   * A single sample is not enough: a buffering player reports PLAYING with a
   * frozen clock, and fading up into that gives an audible half-second of
   * nothing before the song arrives.
   */
  waitForRealPlayback(timeoutMs: number): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.player) {
        resolve(false);
        return;
      }
      let last = -1;
      let advances = 0;
      const started = Date.now();

      if (this.watchTimer !== null) window.clearInterval(this.watchTimer);
      this.watchTimer = window.setInterval(() => {
        if (this.destroyed) {
          this.clearWatch();
          resolve(false);
          return;
        }
        const t = this.currentTime();
        if (this.isPlaying() && t > last + 0.04) advances += 1;
        else advances = 0;
        last = t;

        if (advances >= 2) {
          this.clearWatch();
          resolve(true);
        } else if (Date.now() - started > timeoutMs) {
          this.clearWatch();
          this.opts.log("warn", `no confirmed playback in ${timeoutMs}ms — fading up anyway`);
          resolve(false);
        }
      }, 180);
    });
  }

  private clearWatch(): void {
    if (this.watchTimer !== null) window.clearInterval(this.watchTimer);
    this.watchTimer = null;
  }

  /** Linear volume ramp. Never a hard cut, in either direction. */
  ramp(from: number, to: number, ms: number, onDone?: () => void): void {
    this.cancelRamp();
    if (!this.player) {
      onDone?.();
      return;
    }
    const stepMs = 40;
    const steps = Math.max(1, Math.round(ms / stepMs));
    let i = 0;
    this.setVolume(from);
    this.rampTimer = window.setInterval(() => {
      i += 1;
      const v = from + ((to - from) * i) / steps;
      this.setVolume(v);
      if (i >= steps) {
        this.cancelRamp();
        onDone?.();
      }
    }, stepMs);
  }

  cancelRamp(): void {
    if (this.rampTimer !== null) window.clearInterval(this.rampTimer);
    this.rampTimer = null;
  }

  /** Undo `destroy()`. See the note on `ShowMachine.attach`. */
  revive(): void {
    this.destroyed = false;
    this.steps = [];
  }

  destroy(): void {
    this.destroyed = true;
    this.cancelRamp();
    this.clearWatch();
    if (this.readyTimer !== null) window.clearTimeout(this.readyTimer);
    this.readyTimer = null;
    try {
      this.player?.destroy();
    } catch {
      /* iframe already gone */
    }
    this.player = null;
    this.ready = false;
  }
}
