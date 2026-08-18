// ─── Dedication — the running order ──────────────────────────────────────────
//
// An external store, not React state, and that is a deliberate choice rather
// than a stylistic one:
//
//   • React 19's `react-hooks/set-state-in-effect` forbids the obvious
//     "tick a timer, setState" shape. Everything here mutates a plain object
//     and notifies subscribers; components read it through
//     `useSyncExternalStore` and never own any of it.
//   • The audio graph and the YouTube player have to survive React re-renders,
//     Strict Mode double-invocation and the tuner overlay unmounting. Nothing
//     in this file is tied to a component lifecycle.
//
// The sequencing rules, in one place:
//
//   VOICE → SONG   600ms of generated static, then the song fades up over 800ms
//   SONG  → VOICE  song fades down over 800ms, 400ms of static, then the voice
//   SONG  → SONG   fade down, static, fade up
//   VOICE → VOICE  400ms of static
//
// There is never a hard cut. And the video is never PAUSED between segments —
// it runs at volume 0 so the player stays warm. A paused player on iOS can
// require a fresh gesture to restart and there is no second gesture coming.

import { rngFrom } from "@/lib/seededRandom";
import {
  STATIC,
  TIMING,
  UNLOCK_ORDER,
  YT_ERROR_COPY,
  YT_READY_TIMEOUT_MS,
  type Decoy,
  type RadioShow,
  type Segment,
  type SegmentFailure,
  type ShowPhase,
} from "./types";
import { RadioAudio } from "./radioAudio";
import { YtController } from "./ytPlayer";

export const LIVE_MARQUEE = "LIVE — DEDICATION";

export interface ShowSnapshot {
  phase: ShowPhase;
  /** -1 before the first segment. */
  index: number;
  kind: "voice" | "song" | null;
  /** User play/pause. False also while the tab is backgrounded. */
  playing: boolean;
  /** ON AIR lamp. Voice segments only. */
  onAir: boolean;
  /** True during the generated static between segments. */
  bridging: boolean;
  /** A song segment owns the airwaves — the player panel must be visible. */
  songActive: boolean;
  /** 0..100. */
  volume: number;
  marquee: string;
  caption: string;
  /** The dedication card over the lower third, or null. */
  dedicationCard: string | null;
  /** YT_ERROR_COPY, shown as a card. Never a raw error. */
  errorCard: string | null;
  /** One flag per segment for the progress dots. */
  passed: boolean[];
  failures: SegmentFailure[];
  /** True when the tab is hidden and segment-advance is frozen. */
  suspended: boolean;
  /** Diagnostics for the development overlay. */
  notes: string[];
}

const EMPTY: ShowSnapshot = {
  phase: "tuning",
  index: -1,
  kind: null,
  playing: false,
  onAir: false,
  bridging: false,
  songActive: false,
  volume: 85,
  marquee: LIVE_MARQUEE,
  caption: "",
  dedicationCard: null,
  errorCard: null,
  passed: [],
  failures: [],
  suspended: false,
  notes: [],
};

/**
 * A timeout that can be frozen and thawed, so backgrounding the tab pauses
 * segment-advance instead of letting the whole show run out into silence while
 * nobody is looking at it.
 */
class PausableTimer {
  private id: number | null = null;
  private fn: (() => void) | null = null;
  private remaining = 0;
  private startedAt = 0;
  private frozen = false;

  set(ms: number, fn: () => void): void {
    this.clear();
    this.fn = fn;
    this.remaining = ms;
    if (!this.frozen) this.arm();
  }

  private arm(): void {
    if (!this.fn) return;
    this.startedAt = Date.now();
    this.id = window.setTimeout(() => {
      this.id = null;
      const f = this.fn;
      this.fn = null;
      f?.();
    }, Math.max(0, this.remaining));
  }

  freeze(): void {
    this.frozen = true;
    if (this.id === null) return;
    window.clearTimeout(this.id);
    this.id = null;
    this.remaining -= Date.now() - this.startedAt;
  }

  thaw(): void {
    this.frozen = false;
    if (this.fn && this.id === null) this.arm();
  }

  clear(): void {
    if (this.id !== null) window.clearTimeout(this.id);
    this.id = null;
    this.fn = null;
  }
}

export interface ShowMachineOptions {
  show: RadioShow;
  targetFreq: number;
  decoys: Decoy[];
  /** Seeds the simulated VU walk so two viewers see the same needles. */
  seed: string;
}

export class ShowMachine {
  private listeners = new Set<() => void>();
  private snap: ShowSnapshot = EMPTY;

  readonly audio = new RadioAudio();
  private yt: YtController;

  private show: RadioShow;
  private targetFreq: number;
  private decoys: Decoy[];

  private segTimer = new PausableTimer();
  private cardTimer = new PausableTimer();
  private endWatch: number | null = null;
  private endWatchArgs: { end: number } | null = null;
  private cancelVoice: (() => void) | null = null;
  private playerHost: HTMLElement | null = null;
  private unlockSteps: string[] = [];
  private destroyed = false;
  private visibilityHandler: (() => void) | null = null;

  /** Simulated-VU generator. Seeded — `Math.random` is banned in this template. */
  readonly vuRandom: () => number;

  /** Exposed so a caller can tell a live machine from a torn-down one. */
  get isDestroyed(): boolean {
    return this.destroyed;
  }

  constructor(opts: ShowMachineOptions) {
    this.show = opts.show;
    this.targetFreq = opts.targetFreq;
    this.decoys = opts.decoys;
    this.vuRandom = rngFrom(`${opts.seed}::vu`);

    this.yt = new YtController({
      onFailure: (why, detail) => this.onYtFailure(why, detail),
      onEnded: () => this.onVideoEnded(),
      log: (level, message) => this.note(`${level}: ${message}`),
    });

    this.snap = { ...EMPTY, passed: this.show.segments.map(() => false) };
  }

  /**
   * Bring the machine up. Pairs with `destroy()`, and MUST be called from the
   * same effect whose cleanup destroys it.
   *
   * This pairing is not ceremony. React's development Strict Mode runs every
   * effect setup → cleanup → setup on mount, so a machine that only had a
   * destroy path was torn down on mount and never rebuilt: the tuner still
   * locked, the player was still created, and then every `patch()` no-opped
   * behind the `destroyed` guard and the show sat in silence on the tuning
   * screen forever. It looked exactly like the autoplay failure it was not.
   *
   * Cheap and safe to call repeatedly: the audio graph and the player are
   * rebuilt lazily, on the tune-in gesture, so a teardown before the user has
   * touched anything costs nothing.
   */
  attach(): void {
    this.destroyed = false;
    this.yt.revive();
    if (typeof document !== "undefined" && !this.visibilityHandler) {
      this.visibilityHandler = () => this.onVisibility();
      document.addEventListener("visibilitychange", this.visibilityHandler);
    }
  }

  // ── Store plumbing ────────────────────────────────────────────────────────

  subscribe = (cb: () => void): (() => void) => {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  };

  getSnapshot = (): ShowSnapshot => this.snap;

  /** Server render has no radio. One stable object, so React does not loop. */
  getServerSnapshot = (): ShowSnapshot => EMPTY;

  private patch(next: Partial<ShowSnapshot>): void {
    if (this.destroyed) return;
    this.snap = { ...this.snap, ...next };
    for (const l of this.listeners) l();
  }

  private note(message: string): void {
    const notes = [...this.snap.notes, message].slice(-40);
    this.patch({ notes });
  }

  // ── Wiring ────────────────────────────────────────────────────────────────

  /**
   * Attach callback rather than a ref object: React 19's `react-hooks/refs`
   * forbids a hook returning a RefObject, and the host element must never be
   * re-parented once the player is inside it.
   */
  attachPlayerHost = (el: HTMLElement | null): void => {
    this.playerHost = el;
  };

  get hasSongs(): boolean {
    return this.show.segments.some((s) => s.kind === "song" && Boolean(s.youtubeId));
  }

  private firstSong(): { id: string; start?: number } | null {
    for (const s of this.show.segments) {
      if (s.kind === "song" && s.youtubeId) return { id: s.youtubeId, start: s.startSeconds };
    }
    return null;
  }

  // ── The tuner ─────────────────────────────────────────────────────────────

  /** Called from pointerdown/keydown — both are real gestures. Idempotent. */
  primeTuner(): void {
    this.audio.ensureContext();
  }

  /** Called from pointermove. No gesture required; the context already exists. */
  setNeedle(freq: number): void {
    this.audio.setTuning(freq, this.targetFreq, this.decoys);
  }

  // ── THE UNLOCK. Everything below runs inside ONE gesture handler. ─────────

  /**
   * The station locked. This is the only user gesture the show gets, so the
   * whole of UNLOCK_ORDER happens here, synchronously, before any await.
   *
   * Do not add an `await` above the last `recordStep` call. The moment this
   * function yields, the browser's transient user activation is gone and every
   * subsequent `play()` is a coin toss that iOS loses on purpose.
   */
  tuneIn(): void {
    if (this.snap.phase !== "tuning") return;

    // 1 ─ create-audio-context
    this.audio.ensureContext();
    this.step("create-audio-context");
    this.audio.silenceTuner();

    const first = this.firstSong();
    const expected: string[] = ["create-audio-context"];

    if (first && this.playerHost) {
      // 2 ─ create-yt-player
      const made = this.yt.create(this.playerHost, first.id, first.start);
      this.step("create-yt-player");
      expected.push("create-yt-player");

      if (made) {
        // 3 ─ yt-play-video. Queued by the API if the iframe is not up yet;
        //     onReady re-asserts it. What matters is that the CALL happens
        //     inside the gesture.
        this.yt.play();
        this.step("yt-play-video");
        expected.push("yt-play-video");

        // 4 ─ yt-set-volume-0. The video now runs silently beneath the intro.
        this.yt.setVolume(0);
        this.step("yt-set-volume-0");
        expected.push("yt-set-volume-0");
      }
    } else if (first && !this.playerHost) {
      this.note("error: player host missing at lock — songs cannot play this session");
    } else {
      // Zero songs. The contract says do not initialise the player at all, so
      // steps 2-4 are legitimately absent and the assertion is told so.
      this.note("info: no song segments — YouTube player not initialised");
    }

    // 5 ─ start-voice-element. Either the real first voice, or 60ms of
    //     generated silence to satisfy the element's own autoplay gate so
    //     LATER voice segments can start without a gesture.
    const opener = this.show.segments[0];
    if (opener && opener.kind === "voice" && opener.audioUrl) {
      this.beginVoice(0, opener.audioUrl, opener.caption ?? "");
    } else {
      this.audio.primeVoiceElements();
    }
    this.step("start-voice-element");
    expected.push("start-voice-element");

    this.yt.assertUnlockOrder(expected);

    this.patch({ phase: "playing", playing: true });

    // The opening voice already started above; anything else enters normally.
    if (!(opener && opener.kind === "voice" && opener.audioUrl)) {
      this.enter(0, true);
    } else {
      this.patch({ index: 0, kind: "voice", onAir: true, caption: opener.caption ?? "", marquee: LIVE_MARQUEE });
    }
  }

  private step(name: (typeof UNLOCK_ORDER)[number]): void {
    this.unlockSteps.push(name);
    this.yt.recordStep(name);
  }

  // ── Segment sequencing ────────────────────────────────────────────────────

  /**
   * Move to `index`, playing the correct bridge for the pair of segments being
   * crossed. `immediate` skips the bridge — used only for the very first
   * segment, which the tune-in static already covered.
   */
  private enter(index: number, immediate = false): void {
    if (this.destroyed) return;
    this.clearSegment();

    if (index >= this.show.segments.length) {
      this.finish();
      return;
    }

    const prev = this.snap.index >= 0 ? this.show.segments[this.snap.index]?.kind : null;
    const next = this.show.segments[index].kind;

    const run = () => this.run(index);

    if (immediate || prev === null) {
      run();
      return;
    }

    this.patch({ bridging: true, dedicationCard: null });

    if (prev === "song") {
      // Fade the song out before any static, so the bridge is a fade into
      // noise rather than noise landing on top of a song.
      this.yt.ramp(this.snap.volume, 0, TIMING.fadeDownMs);
      this.segTimer.set(TIMING.fadeDownMs, () => {
        const staticMs = next === "song" ? STATIC.voiceToSongMs : STATIC.songToVoiceMs;
        this.audio.interstitial(staticMs);
        this.segTimer.set(staticMs, run);
      });
      return;
    }

    const staticMs = next === "song" ? STATIC.voiceToSongMs : STATIC.songToVoiceMs;
    this.audio.interstitial(staticMs);
    this.segTimer.set(staticMs, run);
  }

  private run(index: number): void {
    if (this.destroyed) return;
    const seg = this.show.segments[index];
    if (!seg) {
      this.finish();
      return;
    }
    this.patch({ index, kind: seg.kind, bridging: false, errorCard: null });
    this.prefetchNext(index);

    if (seg.kind === "voice") this.runVoice(index, seg);
    else this.runSong(index, seg);
  }

  /** Metered connections: warm exactly one file ahead, never the whole show. */
  private prefetchNext(index: number): void {
    const next = this.show.segments[index + 1];
    if (next && next.kind === "voice" && next.audioUrl) this.audio.prefetchVoice(next.audioUrl);
  }

  private runVoice(index: number, seg: Extract<Segment, { kind: "voice" }>): void {
    this.patch({
      onAir: true,
      songActive: false,
      caption: seg.caption ?? "",
      marquee: LIVE_MARQUEE,
      dedicationCard: null,
    });
    // The video keeps running at 0 so the player stays warm.
    this.yt.setVolume(0);

    if (seg.audioUrl) {
      this.beginVoice(index, seg.audioUrl, seg.caption ?? "");
      return;
    }

    // No audioUrl at all — the documented text-to-card fallback, not a failure.
    this.segTimer.set(seg.durationMs, () => this.complete(index));
  }

  private beginVoice(index: number, url: string, caption: string): void {
    this.patch({ onAir: true, songActive: false, caption, marquee: LIVE_MARQUEE });
    this.audio.setVoiceVolume(this.snap.volume / 100);
    this.cancelVoice = this.audio.playVoice(
      url,
      () => this.complete(index),
      (why) => {
        // An audioUrl that was SET but will not load is a broken segment, and
        // the brief says skip it rather than stall on it.
        this.note(`warn: voice segment ${index} skipped — ${why}`);
        this.recordFailure(index, "audio-load");
        this.complete(index);
      },
    );
  }

  private runSong(index: number, seg: Extract<Segment, { kind: "song" }>): void {
    this.patch({
      onAir: false,
      songActive: true,
      caption: "",
      marquee: [seg.title, seg.artist].filter(Boolean).join(" — ") || LIVE_MARQUEE,
    });
    this.showDedicationCard(seg.dedication);

    if (!seg.youtubeId) {
      // A song slot with no link. The dedication card is the whole point of the
      // segment, so it still plays out — it just plays out over NO SIGNAL.
      this.note(`info: segment ${index} has no video link — dedication card only`);
      this.segTimer.set(TIMING.dedicationHoldMs + 2500, () => this.complete(index));
      return;
    }

    if (!this.yt.exists) {
      this.note(`warn: segment ${index} wanted a player that was never created`);
      this.patch({ errorCard: YT_ERROR_COPY });
      this.recordFailure(index, "yt-error");
      this.segTimer.set(2200, () => this.complete(index));
      return;
    }

    const isOpeningSong = this.firstSong()?.id === seg.youtubeId && this.snap.passed.every((p) => !p);
    if (isOpeningSong) {
      // The player was constructed with this id inside the gesture, so the
      // contract's instruction applies literally: seek, then ramp.
      this.yt.seek(seg.startSeconds ?? 0);
    } else {
      this.yt.loadSong(seg.youtubeId, seg.startSeconds, seg.endSeconds);
    }

    void this.yt.waitForRealPlayback(YT_READY_TIMEOUT_MS).then((confirmed) => {
      if (this.destroyed || this.snap.index !== index) return;
      if (!confirmed) this.note(`warn: segment ${index} never confirmed playback`);
      this.yt.ramp(0, this.snap.volume, TIMING.fadeUpMs);
      this.watchForEnd(index, seg.endSeconds);
    });
  }

  /**
   * `endSeconds` is polled rather than trusted to `loadVideoById`'s own end
   * parameter, because that parameter is ignored after a `seekTo` and the
   * segment would then run to the end of the video.
   */
  private watchForEnd(index: number, endSeconds?: number): void {
    this.clearEndWatch();
    if (!endSeconds) return;
    this.endWatchArgs = { end: endSeconds };
    this.endWatch = window.setInterval(() => {
      if (this.snap.index !== index) {
        this.clearEndWatch();
        return;
      }
      if (this.yt.currentTime() >= endSeconds) {
        this.clearEndWatch();
        this.complete(index);
      }
    }, 500);
  }

  private clearEndWatch(): void {
    if (this.endWatch !== null) window.clearInterval(this.endWatch);
    this.endWatch = null;
    this.endWatchArgs = null;
  }

  private showDedicationCard(text: string): void {
    if (!text.trim()) return;
    this.patch({ dedicationCard: text });
    this.cardTimer.set(TIMING.dedicationHoldMs, () => this.patch({ dedicationCard: null }));
  }

  private recordFailure(index: number, reason: SegmentFailure["reason"]): void {
    this.patch({ failures: [...this.snap.failures, { index, reason }] });
  }

  private onYtFailure(why: string, detail: string): void {
    this.note(`warn: youtube ${why} (${detail})`);
    const index = this.snap.index;
    if (index < 0 || this.show.segments[index]?.kind !== "song") return;
    // Never a raw error code on screen. One warm card, then move on.
    this.patch({ errorCard: YT_ERROR_COPY });
    this.recordFailure(index, why === "yt-timeout" ? "yt-timeout" : "yt-error");
    this.segTimer.set(2400, () => this.complete(index));
  }

  private onVideoEnded(): void {
    const index = this.snap.index;
    if (index >= 0 && this.show.segments[index]?.kind === "song") this.complete(index);
  }

  private complete(index: number): void {
    if (this.destroyed) return;
    const passed = [...this.snap.passed];
    passed[index] = true;
    this.patch({ passed });
    this.enter(index + 1);
  }

  private clearSegment(): void {
    this.segTimer.clear();
    this.cardTimer.clear();
    this.clearEndWatch();
    this.cancelVoice?.();
    this.cancelVoice = null;
    this.audio.stopVoice();
  }

  private finish(): void {
    this.clearSegment();
    this.yt.ramp(this.snap.volume, 0, TIMING.fadeDownMs);
    this.patch({ bridging: true, songActive: false, onAir: false, dedicationCard: null, marquee: LIVE_MARQUEE });
    this.segTimer.set(TIMING.fadeDownMs, () => {
      this.audio.interstitial(900);
      this.segTimer.set(700, () => {
        this.yt.pause();
        this.patch({ phase: "signoff", bridging: false, playing: false });
      });
    });
  }

  // ── Controls ──────────────────────────────────────────────────────────────

  togglePlay(): void {
    if (this.snap.phase !== "playing") return;
    if (this.snap.playing) {
      this.segTimer.freeze();
      this.cardTimer.freeze();
      this.audio.pauseVoice();
      this.yt.pause();
      this.patch({ playing: false });
    } else {
      // A tap on the play knob is a fresh gesture, which is exactly what iOS
      // wants before it will let the elements make sound again.
      this.audio.pump();
      this.segTimer.thaw();
      this.cardTimer.thaw();
      this.audio.resumeVoice();
      this.yt.play();
      this.patch({ playing: true });
    }
  }

  setVolume(v: number): void {
    const vol = Math.round(Math.min(100, Math.max(0, v)));
    this.patch({ volume: vol });
    this.audio.setVoiceVolume(vol / 100);
    // Only push to the player while a song actually owns the airwaves —
    // otherwise this would un-mute the video underneath a voice segment.
    if (this.snap.songActive && !this.snap.bridging) this.yt.setVolume(vol);
  }

  skipForward(): void {
    if (this.snap.phase !== "playing") return;
    const index = this.snap.index;
    const passed = [...this.snap.passed];
    if (index >= 0) passed[index] = true;
    this.patch({ passed });
    this.enter(index + 1);
  }

  skipBack(): void {
    if (this.snap.phase !== "playing") return;
    const target = Math.max(0, this.snap.index - 1);
    const passed = [...this.snap.passed];
    for (let i = target; i < passed.length; i++) passed[i] = false;
    this.patch({ passed });
    this.enter(target);
  }

  // ── Backgrounding ─────────────────────────────────────────────────────────

  /**
   * Audio keeps going if the OS allows it, but segment-advance freezes. Without
   * this the show runs to the sign-off while the phone is in a pocket and the
   * recipient comes back to a dead radio.
   */
  private onVisibility(): void {
    if (typeof document === "undefined") return;
    if (document.hidden) {
      this.segTimer.freeze();
      this.cardTimer.freeze();
      this.patch({ suspended: true });
    } else {
      this.audio.pump();
      if (this.snap.playing) {
        this.segTimer.thaw();
        this.cardTimer.thaw();
      }
      this.patch({ suspended: false });
      // A frozen end-watch would have been cleared by the interval surviving;
      // re-arm it so a bounded song still ends where it was told to.
      if (this.endWatchArgs && this.endWatch === null) {
        this.watchForEnd(this.snap.index, this.endWatchArgs.end);
      }
    }
  }

  destroy(): void {
    this.destroyed = true;
    this.clearSegment();
    this.yt.destroy();
    this.audio.destroy();
    if (this.visibilityHandler && typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this.visibilityHandler);
      this.visibilityHandler = null;
    }
    // Listeners are NOT cleared: `useSyncExternalStore` keeps its subscription
    // across Strict Mode's simulated unmount, and dropping it here would leave
    // the component permanently deaf to the machine it just re-attached.
  }
}
