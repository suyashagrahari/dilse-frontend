"use client";

// ─── Proposal — music ────────────────────────────────────────────────────────
//
// Three sources, one interface. Which one is live comes from `resolveMusic` in
// ./music; everything below is the machinery for playing it and muting it.
//
//   • builtin → a chord progression synthesised in WebAudio. Zero bytes.
//   • file    → the sender's own URL, through a real <audio loop>.
//   • youtube → the official IFrame player, which MusicDock keeps visible.
//
// ── EVERYTHING STARTS FROM ONE GESTURE ──────────────────────────────────────
//
// `start()` is called by the gate button's own click handler and nothing else.
// That is the single user gesture the page gets, and all three paths have to
// originate inside it or the browser will refuse them: WebAudio contexts start
// suspended, <audio>.play() rejects, and YouTube silently never plays.
//
// The YouTube path is the fussy one. The IFrame API script is fetched on MOUNT,
// not inside the handler, because if it were still in flight when the gesture
// fired the player could not be constructed until it landed, and by then the
// gesture is spent. The dedication template learned that the hard way.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { resolveMusic, type BuiltInTrack, type ResolvedMusic } from "./music";

/** A file plays louder than a synth pad: it is a real mix, not a bed. */
const FILE_VOLUME = 0.55;
/** YouTube's scale is 0-100. Matches FILE_VOLUME closely enough. */
const YT_VOLUME = 55;
/** Music should arrive rather than punch in. */
const FADE_IN_S = 1.8;
/** A blocked or very slow API script must not hang the gate handler forever. */
const YT_API_TIMEOUT_MS = 8000;

// ── The YouTube IFrame API, loaded once per page ────────────────────────────

interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  setVolume(v: number): void;
  mute(): void;
  unMute(): void;
  destroy(): void;
}

interface YTNamespace {
  Player: new (
    el: HTMLElement,
    opts: {
      width?: number | string;
      height?: number | string;
      videoId?: string;
      playerVars?: Record<string, unknown>;
      events?: {
        onReady?: (e: { target: YTPlayer }) => void;
        onStateChange?: (e: { data: number; target: YTPlayer }) => void;
      };
    },
  ) => YTPlayer;
}

/**
 * Read through a local cast rather than `declare global`.
 *
 * The dedication template augments `Window.YT` with its OWN structural type for
 * the same API. Two augmentations of one property are a hard TS error even when
 * the shapes are identical, and whichever file is added second loses. A cast
 * keeps this module's typing entirely local, which is what it should have been:
 * neither template owns the global.
 */
type YTWindow = Window & {
  YT?: YTNamespace;
  onYouTubeIframeAPIReady?: () => void;
};

const ytWindow = (): YTWindow | null =>
  typeof window === "undefined" ? null : (window as unknown as YTWindow);

let ytApi: Promise<YTNamespace | null> | null = null;

function loadYouTubeApi(): Promise<YTNamespace | null> {
  const w = ytWindow();
  if (!w) return Promise.resolve(null);
  const ready = w.YT;
  if (ready?.Player) return Promise.resolve(ready);
  if (ytApi) return ytApi;

  ytApi = new Promise<YTNamespace | null>((resolve) => {
    let done = false;
    const settle = (v: YTNamespace | null) => {
      if (done) return;
      done = true;
      resolve(v);
    };
    // Chain rather than overwrite: another template on the page may own it.
    const prev = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => {
      prev?.();
      settle(w.YT ?? null);
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;
    tag.onerror = () => settle(null);
    document.head.appendChild(tag);
    setTimeout(() => settle(w.YT ?? null), YT_API_TIMEOUT_MS);
  });
  return ytApi;
}

export interface ProposalAudio {
  /** Which world we are in. MusicDock renders differently for each. */
  mode: ResolvedMusic["kind"];
  /** The melody that will play, when `mode` is "builtin". */
  track: BuiltInTrack | null;
  /** The file URL, when `mode` is "file". Empty otherwise. */
  fileSrc: string;
  /** True once the gate has been opened and something is playing. */
  started: boolean;
  muted: boolean;
  /** Called from the gate click: the user gesture that unlocks audio. */
  start: () => void;
  toggleMute: () => void;
  /**
   * Callback refs rather than RefObjects: handing a ref out of a hook taints
   * the whole returned object for the `react-hooks/refs` lint rule, which then
   * (correctly) refuses to let `started`/`muted` be read during render.
   */
  attachAudio: (el: HTMLAudioElement | null) => void;
  attachYouTube: (el: HTMLDivElement | null) => void;
}

export function useProposalAudio(musicUrl: string, musicTrack: string): ProposalAudio {
  // ── Resolve ONCE per configuration ──────────────────────────────────────
  //
  // `useMemo` is wrong here and a ref is not allowed here. "auto" resolves
  // RANDOMLY, and useMemo is explicitly permitted to drop and recompute a
  // cached value whenever React likes — which would change the melody under a
  // listener, mid-page. A ref would be stable but `react-hooks/refs` forbids
  // reading one during render, correctly: the resolved value IS render input.
  //
  // So: state, adjusted during render when the inputs change. React's own
  // documented pattern for deriving state from props, and the only one of the
  // three that is both stable and legal.
  const key = `${musicUrl} :: ${musicTrack}`;
  const [resolvedKey, setResolvedKey] = useState(key);
  const [resolved, setResolved] = useState<ResolvedMusic>(() =>
    resolveMusic(musicUrl, musicTrack),
  );
  if (resolvedKey !== key) {
    setResolvedKey(key);
    setResolved(resolveMusic(musicUrl, musicTrack));
  }

  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytHostRef = useRef<HTMLDivElement | null>(null);
  const ytPlayerRef = useRef<YTPlayer | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepRef = useRef(0);
  const liveRef = useRef(false);
  const startedRef = useRef(false);
  const mutedRef = useRef(false);
  /**
   * The live track, for the bar scheduler and the mute ramp.
   *
   * Written in an effect rather than during render: writing a ref mid-render is
   * exactly what `react-hooks/refs` is there to stop, and `start()` writes it
   * too so the gate click can never fire against a stale one — an effect runs
   * after paint, and the gate is reachable before then.
   */
  const trackRef = useRef<BuiltInTrack | null>(null);
  useEffect(() => {
    trackRef.current = resolved.kind === "builtin" ? resolved.track : null;
  }, [resolved]);

  // Pre-warm the IFrame API so the gate click has a constructor ready.
  useEffect(() => {
    if (resolved.kind === "youtube") void loadYouTubeApi();
  }, [resolved.kind]);

  /**
   * One bar of the built-in melody: a pad swelling underneath, and the same
   * chord walked upward as an arpeggio above it. Long attacks and exponential
   * releases are what stop it sounding like a ringtone.
   *
   * Every duration is derived from the track's own bar length, so a slow track
   * gets long swells and a quick one gets short ones without a second set of
   * constants to keep in step.
   */
  const scheduleBar = useCallback(() => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    const track = trackRef.current;
    if (!ctx || !master || !track) return;

    const t = ctx.currentTime + 0.06;
    const chord = track.chords[stepRef.current % track.chords.length];
    stepRef.current += 1;
    const barS = track.barMs / 1000;

    // Pad: root and fifth, swelling in over the first third of the bar.
    const pad = ctx.createGain();
    pad.gain.setValueAtTime(0.0001, t);
    pad.gain.linearRampToValueAtTime(0.4, t + barS * 0.32);
    pad.gain.exponentialRampToValueAtTime(0.0001, t + barS * 1.14);
    pad.connect(master);
    for (const f of [chord[0], chord[2]]) {
      const o = ctx.createOscillator();
      o.type = track.padWave;
      o.frequency.value = f;
      o.connect(pad);
      o.start(t);
      o.stop(t + barS * 1.18);
    }

    // Arpeggio, an octave or two up so it sings over the pad.
    chord.forEach((f, i) => {
      const at = t + i * track.arpGap;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = track.arpWave;
      o.frequency.value = f * Math.pow(2, track.arpOctave);
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

    if (resolved.kind === "file") {
      const el = audioRef.current;
      if (el) {
        el.loop = true;
        el.volume = FILE_VOLUME;
        void el.play().catch(() => {});
      }
      return;
    }

    if (resolved.kind === "youtube") {
      // Construct inside the gesture. Calls made before the iframe signals
      // ready are queued by the API and replayed on ready, and onReady
      // re-asserts them anyway. What matters is that playback ORIGINATES here.
      void loadYouTubeApi().then((YT) => {
        const host = ytHostRef.current;
        if (!YT || !host || ytPlayerRef.current) return;
        ytPlayerRef.current = new YT.Player(host, {
          width: "100%",
          height: "100%",
          videoId: resolved.videoId,
          playerVars: {
            autoplay: 1,
            controls: 1,
            playsinline: 1,
            rel: 0,
            modestbranding: 1,
            origin: typeof window !== "undefined" ? window.location.origin : undefined,
          },
          events: {
            onReady: (e) => {
              e.target.setVolume(YT_VOLUME);
              if (mutedRef.current) e.target.mute();
              e.target.playVideo();
            },
            // 0 is ENDED. The API will not loop a single video unless it is
            // given a playlist, so restart it by hand.
            onStateChange: (e) => {
              if (e.data === 0) e.target.playVideo();
            },
          },
        });
      });
      return;
    }

    // ── built-in ────────────────────────────────────────────────────────────
    if (typeof window === "undefined") return;
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;

    const track = resolved.track;
    trackRef.current = track;
    const ctx = new AC();
    const master = ctx.createGain();
    master.gain.value = 0;
    // A gentle low-pass takes the edge off the upper harmonics, which is the
    // difference between "warm" and "cheap keyboard". Each track sets its own
    // cutoff, and it is most of what separates "Forever" from "First light".
    const warmth = ctx.createBiquadFilter();
    warmth.type = "lowpass";
    warmth.frequency.value = track.cutoff;
    warmth.Q.value = 0.4;
    master.connect(warmth).connect(ctx.destination);

    ctxRef.current = ctx;
    masterRef.current = master;
    stepRef.current = 0;
    void ctx.resume().catch(() => {});
    master.gain.linearRampToValueAtTime(track.peak, ctx.currentTime + FADE_IN_S);

    liveRef.current = true;
    const tick = () => {
      if (!liveRef.current) return;
      scheduleBar();
      timerRef.current = setTimeout(tick, track.barMs);
    };
    tick();
  }, [resolved, scheduleBar]);

  const attachAudio = useCallback((el: HTMLAudioElement | null) => {
    audioRef.current = el;
    if (el) el.muted = mutedRef.current;
  }, []);

  const attachYouTube = useCallback((el: HTMLDivElement | null) => {
    ytHostRef.current = el;
  }, []);

  const toggleMute = useCallback(() => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMuted(next);

    const el = audioRef.current;
    if (el) el.muted = next;

    const yt = ytPlayerRef.current;
    if (yt) {
      if (next) yt.mute();
      else yt.unMute();
    }

    const ctx = ctxRef.current;
    const master = masterRef.current;
    const track = trackRef.current;
    if (ctx && master && track) {
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(next ? 0 : track.peak, now + 0.35);
    }
  }, []);

  // Tear everything down: stop the scheduler, pause the file, destroy the
  // player, close the context.
  useEffect(
    () => () => {
      liveRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
      audioRef.current?.pause();
      const yt = ytPlayerRef.current;
      if (yt) {
        try {
          yt.destroy();
        } catch {
          /* the iframe may already be gone with the unmounted subtree */
        }
        ytPlayerRef.current = null;
      }
      const ctx = ctxRef.current;
      if (ctx) {
        void ctx.close().catch(() => {});
        ctxRef.current = null;
        masterRef.current = null;
      }
    },
    [],
  );

  return useMemo(
    () => ({
      mode: resolved.kind,
      track: resolved.kind === "builtin" ? resolved.track : null,
      fileSrc: resolved.kind === "file" ? resolved.src : "",
      started,
      muted,
      start,
      toggleMute,
      attachAudio,
      attachYouTube,
    }),
    [resolved, started, muted, start, toggleMute, attachAudio, attachYouTube],
  );
}
