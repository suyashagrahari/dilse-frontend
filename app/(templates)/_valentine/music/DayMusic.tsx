"use client";

// ─── DayMusicProvider — the page shell's background music ────────────────────
//
// Mounted by ValentineDayEditorPage (preview) and ValentineDayViewer (live).
// Plays the sender's choice:
//   • "melody"  — the day's built-in synth (useSynthEngine), the same round
//                 speaker button as before;
//   • "youtube" — their song through the official IFrame Player API, loaded
//                 lazily only for these pages, in a small "now playing" card
//                 that stays visible (≥ 200×113, YouTube's minimum) whenever it
//                 plays, and can be tucked into the corner;
//   • "track"   — the template's own looping MP3 (DayConfig.music.track), one
//                 <audio> element (useTrackEngine), shown in the same audio-only
//                 card as below (the chip on premium days, the radio otherwise);
//   • "off"     — nothing.
//   • "youtube" + `audioOnly` (a per-day flag, DayConfig.music.audioOnly —
//                 Halloween uses it at the user's request): the same player,
//                 still mounted at its normal 200×113 size so iOS/Chrome keep
//                 it playing (they throttle or refuse 0px / offscreen frames),
//                 but fully covered by an opaque themed "spirit radio" card.
//                 The video is never visible; only the sound comes through.
//                 With `chip` (every -premium day) the cover is a compact
//                 themed "now playing" pill instead (NowPlayingChip).
// Browsers only allow sound after a gesture, so it starts on the visitor's
// first tap/key (when `autoStart`), loops, fades in, pauses while the tab is
// hidden, and falls back to the melody if the song refuses to play (removed,
// region-locked, embedding disabled). Days keep calling useSynthMusic() /
// <MusicToggle>; both delegate here through DayMusicContext.

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { MusicButton, useSynthEngine, type MelodyId } from "../kit/useSynthMusic";
import { FONTS } from "../theme";
import type { DayTrack, MusicMode } from "../types";
import { DayMusicContext, isIOSDevice, type DayMusicApi } from "./context";
import { loadYouTubeApi, suggestionFor, youTubeThumb, type SongSuggestion, type YTPlayer } from "./youtube";

const TARGET_VOLUME = 80;
const YT_STATE = { UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 } as const;
/** No PLAYING/BUFFERING this long after start() → `blocked` (show the "Tap to hear" chip). */
const BLOCKED_AFTER_MS = 2500;

interface YouTubeEngine {
  playing: boolean;
  loading: boolean;
  ready: boolean;
  blocked: boolean;
  title: string | null;
  muted: boolean;
  userOff: boolean;
  start: () => void;
  stop: () => void;
  toggle: () => void;
  toggleMute: () => void;
  play: () => void;
  pause: () => void;
  seekTo: (sec: number) => void;
  currentTime: () => number;
  fadeTo: (level: number, ms?: number) => void;
  duck: (level?: number, ms?: number) => void;
  unduck: (ms?: number) => void;
  canFade: boolean;
}

// The autoplay race (fixed for every day, not just premium): browsers — iOS
// above all — only allow audible playback from code that runs synchronously
// inside a tap. The player is created at mount (not on the first tap), so by
// the time someone taps it is usually ready and play() calls playVideo()
// inside the gesture. If the tap beats onReady, play() still runs from
// onReady (fine on Chrome/Android thanks to sticky activation, refused on
// iOS); in that case nothing reaches PLAYING, `blocked` turns on after 2.5 s,
// and the gesture listeners stay attached, so the NEXT tap anywhere retries
// inside a real gesture. They detach once the song is actually playing.
function useYouTubeEngine({
  videoId,
  startAt,
  autoStart,
  host,
  onFail,
  songs,
}: {
  videoId: string;
  startAt: number;
  autoStart: boolean;
  host: React.RefObject<HTMLDivElement | null>;
  onFail: (id: string) => void;
  /** The day's own suggestion list, for an instant title. */
  songs?: readonly SongSuggestion[];
}): YouTubeEngine {
  const playerRef = useRef<YTPlayer | null>(null);
  const readyRef = useRef(false);
  const wantPlay = useRef(false);
  const userOff = useRef(false);
  const resumeOnShow = useRef(false);
  const fadeRef = useRef<number | null>(null);
  const blockTimer = useRef<number | null>(null);
  const stateRef = useRef<number>(YT_STATE.UNSTARTED);
  const levelRef = useRef(1);
  const duckedPaused = useRef(false);
  const startRef = useRef(startAt);
  const failRef = useRef(onFail);
  useEffect(() => {
    failRef.current = onFail;
  });
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [off, setOff] = useState(false);
  // Once the song has really played, taps no longer (re)start it — exactly the old "first gesture" semantics.
  const [everPlayed, setEverPlayed] = useState(false);
  const [title, setTitle] = useState<string | null>(() => suggestionFor(videoId, songs)?.title ?? null);
  const [titleFor, setTitleFor] = useState(videoId);
  if (titleFor !== videoId) {
    setTitleFor(videoId);
    setTitle(suggestionFor(videoId, songs)?.title ?? null);
  }
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);
  // iOS ignores volume writes on media (YouTube setVolume is a no-op there).
  const [ios] = useState(() => isIOSDevice());

  const clearFade = () => {
    if (fadeRef.current != null) window.clearInterval(fadeRef.current);
    fadeRef.current = null;
  };
  const clearBlockTimer = () => {
    if (blockTimer.current != null) window.clearTimeout(blockTimer.current);
    blockTimer.current = null;
  };
  const isAudible = () => stateRef.current === YT_STATE.PLAYING || stateRef.current === YT_STATE.BUFFERING;

  /** Ramp setVolume from its current level to `to` (0–100) over `ms`. Non-iOS only. */
  const rampVolume = useCallback((to: number, ms: number, from?: number) => {
    clearFade();
    const p = playerRef.current;
    if (!p) return;
    const steps = Math.max(1, Math.round(ms / 90));
    let i = 0;
    const start = from ?? levelRef.current * TARGET_VOLUME;
    fadeRef.current = window.setInterval(() => {
      i += 1;
      const v = Math.round(start + ((to - start) * i) / steps);
      try {
        playerRef.current?.setVolume(v);
      } catch {
        /* player gone */
      }
      if (i >= steps) clearFade();
    }, 90);
  }, []);

  const play = useCallback(() => {
    const p = playerRef.current;
    // "loading" = they asked for sound and it isn't audible yet.
    setLoading(true);
    if (!p || !readyRef.current) {
      wantPlay.current = true;
      return;
    }
    wantPlay.current = false;
    clearFade();
    try {
      // Synchronous, in this order — WebKit only honours unMute/playVideo inside the tap.
      if (mutedRef.current) p.mute();
      else p.unMute();
      if (!ios) p.setVolume(0);
      p.playVideo();
    } catch {
      return;
    }
    clearBlockTimer();
    blockTimer.current = window.setTimeout(() => {
      if (!isAudible() && !userOff.current) {
        setBlocked(true);
        setLoading(false);
      }
    }, BLOCKED_AFTER_MS);
    // A gentle fade-in rather than a song slamming in mid-chorus (not on iOS:
    // volume is read-only there, the premium gate's sting masks the entry).
    if (!ios) rampVolume(Math.round(levelRef.current * TARGET_VOLUME), 1200, 0);
  }, [ios, rampVolume]);

  const pause = useCallback(() => {
    wantPlay.current = false;
    setLoading(false);
    clearFade();
    clearBlockTimer();
    try {
      playerRef.current?.pauseVideo();
    } catch {
      /* player gone */
    }
  }, []);

  // Create the player once per song, at mount — NOT on the first tap (see the race note above).
  useEffect(() => {
    if (!videoId) return;
    let cancelled = false;
    const box0 = host.current;
    loadYouTubeApi()
      .then((YT) => {
        const box = host.current;
        if (cancelled || !box) return;
        // The API swaps its target for an <iframe>; give it a node React doesn't own.
        box.innerHTML = "";
        const target = document.createElement("div");
        box.appendChild(target);
        playerRef.current = new YT.Player(target, {
          width: "100%",
          height: "100%",
          videoId,
          host: "https://www.youtube-nocookie.com",
          playerVars: {
            start: startRef.current,
            playsinline: 1,
            controls: 0,
            rel: 0,
            modestbranding: 1,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            origin: window.location.origin,
          },
          events: {
            onReady: (e) => {
              if (cancelled) return;
              readyRef.current = true;
              setReady(true);
              setLoading(false);
              const t = e.target.getVideoData?.().title;
              if (t) setTitle(t);
              if (wantPlay.current) play();
            },
            onAutoplayBlocked: () => {
              if (cancelled) return;
              setBlocked(true);
              setLoading(false);
            },
            onStateChange: (e) => {
              if (cancelled) return;
              stateRef.current = e.data;
              if (e.data === YT_STATE.PLAYING) {
                setPlaying(true);
                setEverPlayed(true);
                setLoading(false);
                setBlocked(false);
                clearBlockTimer();
                const t = e.target.getVideoData?.().title;
                if (t) setTitle(t);
              } else if (e.data === YT_STATE.BUFFERING) {
                setLoading(true);
              } else if (e.data === YT_STATE.ENDED) {
                // Loop from the sender's chosen start.
                try {
                  e.target.seekTo(startRef.current, true);
                  e.target.playVideo();
                } catch {
                  setPlaying(false);
                }
              } else {
                setPlaying(false);
                setLoading(false);
              }
            },
            onError: () => {
              setLoading(false);
              if (!cancelled) failRef.current(videoId);
            },
          },
        });
      })
      .catch(() => {
        if (!cancelled) failRef.current(videoId);
      });
    return () => {
      cancelled = true;
      clearFade();
      clearBlockTimer();
      readyRef.current = false;
      stateRef.current = YT_STATE.UNSTARTED;
      try {
        playerRef.current?.destroy();
      } catch {
        /* already gone */
      }
      playerRef.current = null;
      setPlaying(false);
      setLoading(false);
      setReady(false);
      if (box0) box0.innerHTML = "";
    };
  }, [videoId, host, play]);

  // A new start time re-cues (or re-seeks) the same song.
  useEffect(() => {
    if (startRef.current === startAt) return;
    startRef.current = startAt;
    const p = playerRef.current;
    if (!p || !readyRef.current) return;
    try {
      if (p.getPlayerState() === YT_STATE.PLAYING) p.seekTo(startAt, true);
      else p.cueVideoById({ videoId, startSeconds: startAt });
    } catch {
      /* ignore */
    }
  }, [startAt, videoId]);

  // Taps anywhere start it (unless they turned it off) — and keep retrying,
  // each time inside a fresh gesture, until it is really playing. iOS counts
  // touchend/click as activation (not pointerdown), so all four are heard.
  useEffect(() => {
    if (!videoId || !autoStart || everPlayed) return;
    const go = () => {
      if (userOff.current || isAudible()) return;
      play();
    };
    const evs = ["pointerdown", "touchend", "click", "keydown"] as const;
    for (const ev of evs) window.addEventListener(ev, go, { passive: true });
    return () => {
      for (const ev of evs) window.removeEventListener(ev, go);
    };
  }, [videoId, autoStart, play, everPlayed]);

  // Hidden tab → pause; back → resume if it was playing.
  useEffect(() => {
    const onVis = () => {
      const p = playerRef.current;
      if (!p || !readyRef.current) return;
      if (document.hidden) {
        let s = -1;
        try {
          s = p.getPlayerState();
        } catch {
          /* ignore */
        }
        resumeOnShow.current = s === YT_STATE.PLAYING || s === YT_STATE.BUFFERING;
        if (resumeOnShow.current) pause();
      } else if (resumeOnShow.current) {
        resumeOnShow.current = false;
        play();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [play, pause]);

  const start = useCallback(() => {
    userOff.current = false;
    setOff(false);
    setBlocked(false);
    play();
  }, [play]);
  const stop = useCallback(() => {
    userOff.current = true;
    setOff(true);
    setBlocked(false);
    pause();
  }, [pause]);
  const toggle = useCallback(() => (playing || wantPlay.current ? stop() : start()), [playing, start, stop]);
  const toggleMute = useCallback(() => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMuted(next);
    try {
      if (next) playerRef.current?.mute();
      else playerRef.current?.unMute();
    } catch {
      /* player gone */
    }
  }, []);

  const resume = useCallback(() => {
    if (!userOff.current) play();
  }, [play]);
  const seekTo = useCallback((sec: number) => {
    const p = playerRef.current;
    if (!p || !readyRef.current) return;
    try {
      p.seekTo(Math.max(0, sec), true);
    } catch {
      /* ignore */
    }
  }, []);
  const currentTime = useCallback(() => {
    try {
      return playerRef.current?.getCurrentTime?.() ?? 0;
    } catch {
      return 0;
    }
  }, []);
  const fadeTo = useCallback(
    (level: number, ms = 800) => {
      levelRef.current = Math.min(1, Math.max(0, level));
      if (ios) return;
      rampVolume(Math.round(levelRef.current * TARGET_VOLUME), ms);
    },
    [ios, rampVolume],
  );
  const duck = useCallback(
    (level = 0.25, ms = 400) => {
      if (ios) {
        // No volume on iOS: pause under the voice, resume on unduck.
        if (isAudible()) {
          duckedPaused.current = true;
          try {
            playerRef.current?.pauseVideo();
          } catch {
            /* ignore */
          }
        }
        return;
      }
      rampVolume(Math.round(Math.min(1, Math.max(0, level)) * TARGET_VOLUME), ms);
    },
    [ios, rampVolume],
  );
  const unduck = useCallback(
    (ms = 600) => {
      if (ios) {
        if (duckedPaused.current && !userOff.current) {
          duckedPaused.current = false;
          try {
            playerRef.current?.playVideo();
          } catch {
            /* ignore */
          }
        }
        return;
      }
      rampVolume(Math.round(levelRef.current * TARGET_VOLUME), ms);
    },
    [ios, rampVolume],
  );

  return useMemo(
    () => ({
      playing, loading, ready, blocked, title, muted, userOff: off,
      start, stop, toggle, toggleMute, play: resume, pause, seekTo, currentTime, fadeTo, duck, unduck, canFade: !ios,
    }),
    [playing, loading, ready, blocked, title, muted, off, start, stop, toggle, toggleMute, resume, pause, seekTo, currentTime, fadeTo, duck, unduck, ios],
  );
}

// ─── The template's own track: one looping <audio> ───────────────────────────
//
// For days that ship a background MP3 (DayConfig.music.track, mode "track").
// The element is made at mount with preload="auto", so the gate tap's
// start() calls el.play() synchronously inside the gesture — the only thing
// iOS needs. Plain HTMLAudio, not Web Audio: no CORS, no decode cost, and the
// browser streams it. Same contract as the YouTube engine: fade in, loop,
// pause while hidden, retry on the next tap if play() was refused, duck.

const TRACK_VOLUME = 0.7;

interface TrackEngine extends Omit<YouTubeEngine, "title"> {
  el: () => HTMLAudioElement | null;
}

function useTrackEngine({ url, autoStart }: { url: string; autoStart: boolean }): TrackEngine {
  const elRef = useRef<HTMLAudioElement | null>(null);
  const userOff = useRef(false);
  const resumeOnShow = useRef(false);
  const duckedPaused = useRef(false);
  const levelRef = useRef(1);
  const fadeRef = useRef<number | null>(null);
  const mutedRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [off, setOff] = useState(false);
  const [muted, setMuted] = useState(false);
  const [everPlayed, setEverPlayed] = useState(false);
  const [ios] = useState(() => isIOSDevice());

  const clearFade = () => {
    if (fadeRef.current != null) window.clearInterval(fadeRef.current);
    fadeRef.current = null;
  };
  /** Ramp el.volume (0–1) to `to` over `ms`. Non-iOS only (iOS media volume is read-only). */
  const ramp = useCallback((to: number, ms: number, from?: number) => {
    clearFade();
    const el = elRef.current;
    if (!el) return;
    const start = from ?? el.volume;
    if (from != null) el.volume = Math.min(1, Math.max(0, from));
    const steps = Math.max(1, Math.round(ms / 40));
    let i = 0;
    fadeRef.current = window.setInterval(() => {
      i += 1;
      const v = start + ((to - start) * i) / steps;
      if (elRef.current) elRef.current.volume = Math.min(1, Math.max(0, v));
      if (i >= steps) clearFade();
    }, 40);
  }, []);

  const play = useCallback(() => {
    const el = elRef.current;
    if (!el) return;
    clearFade();
    duckedPaused.current = false;
    el.muted = mutedRef.current;
    if (!ios) el.volume = 0;
    setLoading(el.readyState < 3);
    // Synchronous inside the tap — WebKit only honours play() there.
    const p = el.play();
    if (p && typeof p.then === "function") {
      p.then(() => setBlocked(false)).catch((err: unknown) => {
        setLoading(false);
        if ((err as { name?: string })?.name === "NotAllowedError" && !userOff.current) setBlocked(true);
      });
    }
    if (!ios) ramp(levelRef.current * TRACK_VOLUME, 900, 0);
  }, [ios, ramp]);

  const pause = useCallback(() => {
    clearFade();
    setLoading(false);
    elRef.current?.pause();
  }, []);

  // The element, once per URL.
  useEffect(() => {
    if (!url || typeof Audio === "undefined") return;
    const el = new Audio();
    el.loop = true;
    el.preload = "auto";
    el.setAttribute("playsinline", "");
    el.src = url;
    elRef.current = el;
    const onPlaying = () => {
      setPlaying(true);
      setEverPlayed(true);
      setLoading(false);
      setBlocked(false);
    };
    const onPause = () => setPlaying(false);
    const onWaiting = () => setLoading(true);
    const onError = () => {
      setLoading(false);
      setPlaying(false);
    };
    el.addEventListener("playing", onPlaying);
    el.addEventListener("pause", onPause);
    el.addEventListener("waiting", onWaiting);
    el.addEventListener("error", onError);
    return () => {
      clearFade();
      el.removeEventListener("playing", onPlaying);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("waiting", onWaiting);
      el.removeEventListener("error", onError);
      el.pause();
      el.removeAttribute("src");
      el.load();
      if (elRef.current === el) elRef.current = null;
      setPlaying(false);
      setLoading(false);
    };
  }, [url]);

  // Any tap starts it (unless they turned it off), retrying each tap until it really plays.
  useEffect(() => {
    if (!url || !autoStart || everPlayed) return;
    const go = () => {
      const el = elRef.current;
      if (userOff.current || !el || !el.paused) return;
      play();
    };
    const evs = ["pointerdown", "touchend", "click", "keydown"] as const;
    for (const ev of evs) window.addEventListener(ev, go, { passive: true });
    return () => {
      for (const ev of evs) window.removeEventListener(ev, go);
    };
  }, [url, autoStart, play, everPlayed]);

  // Hidden tab → pause; back → resume if it was playing.
  useEffect(() => {
    const onVis = () => {
      const el = elRef.current;
      if (!el) return;
      if (document.hidden) {
        resumeOnShow.current = !el.paused;
        if (resumeOnShow.current) pause();
      } else if (resumeOnShow.current) {
        resumeOnShow.current = false;
        if (!userOff.current) play();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [play, pause]);

  const start = useCallback(() => {
    userOff.current = false;
    setOff(false);
    setBlocked(false);
    play();
  }, [play]);
  const stop = useCallback(() => {
    userOff.current = true;
    setOff(true);
    setBlocked(false);
    pause();
  }, [pause]);
  const toggle = useCallback(() => (playing ? stop() : start()), [playing, start, stop]);
  const toggleMute = useCallback(() => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMuted(next);
    if (elRef.current) elRef.current.muted = next;
  }, []);
  const resume = useCallback(() => {
    if (!userOff.current) play();
  }, [play]);
  const seekTo = useCallback((sec: number) => {
    const el = elRef.current;
    if (!el) return;
    try {
      el.currentTime = Math.max(0, sec);
    } catch {
      /* not seekable yet */
    }
  }, []);
  const currentTime = useCallback(() => elRef.current?.currentTime ?? 0, []);
  const fadeTo = useCallback(
    (level: number, ms = 800) => {
      levelRef.current = Math.min(1, Math.max(0, level));
      if (ios) return;
      ramp(levelRef.current * TRACK_VOLUME, ms);
    },
    [ios, ramp],
  );
  const duck = useCallback(
    (level = 0.25, ms = 400) => {
      const el = elRef.current;
      if (!el) return;
      if (ios) {
        if (!el.paused) {
          duckedPaused.current = true;
          el.pause();
        }
        return;
      }
      ramp(Math.min(1, Math.max(0, level)) * levelRef.current * TRACK_VOLUME, ms);
    },
    [ios, ramp],
  );
  const unduck = useCallback(
    (ms = 600) => {
      if (ios) {
        if (duckedPaused.current && !userOff.current) {
          duckedPaused.current = false;
          void elRef.current?.play().catch(() => {});
        }
        return;
      }
      ramp(levelRef.current * TRACK_VOLUME, ms);
    },
    [ios, ramp],
  );
  const getEl = useCallback(() => elRef.current, []);

  return useMemo(
    () => ({
      playing, loading, ready: true, blocked, muted, userOff: off,
      start, stop, toggle, toggleMute, play: resume, pause, seekTo, currentTime, fadeTo, duck, unduck, canFade: !ios, el: getEl,
    }),
    [playing, loading, blocked, muted, off, start, stop, toggle, toggleMute, resume, pause, seekTo, currentTime, fadeTo, duck, unduck, ios, getEl],
  );
}

// ─── The floating "now playing" card ─────────────────────────────────────────

function Disc({ spinning }: { spinning: boolean }) {
  return (
    <span className={`vm-disc${spinning ? " is-on" : ""}`} aria-hidden>
      <i />
    </span>
  );
}

function YouTubeDock({
  api,
  videoId,
  host,
  dark,
  overSheet,
  dockBase,
}: {
  api: DayMusicApi;
  videoId: string;
  host: React.RefObject<HTMLDivElement | null>;
  dark: boolean;
  overSheet: boolean;
  dockBase: string;
}) {
  const [expanded, setExpanded] = useState(false);
  // Keep the thumbnail showing until the song first plays (the idle embed is black).
  const [everPlayed, setEverPlayed] = useState(false);
  if (api.playing && !everPlayed) setEverPlayed(true);
  // Which corner it sits in — the visitor can move it off whatever it covers.
  const [corner, setCorner] = useState<Corner>("br");
  useEffect(() => {
    // After paint (the server can't know the screen or the stored corner).
    const raf = requestAnimationFrame(() => {
      setExpanded(window.innerWidth >= 768);
      try {
        const c = window.localStorage.getItem(CORNER_KEY) as Corner | null;
        if (c && CORNERS.includes(c)) setCorner(c);
      } catch {
        /* storage blocked — default corner */
      }
    });
    return () => cancelAnimationFrame(raf);
  }, []);
  const move = () => {
    const next = CORNERS[(CORNERS.indexOf(corner) + 1) % CORNERS.length];
    setCorner(next);
    try {
      window.localStorage.setItem(CORNER_KEY, next);
    } catch {
      /* fine */
    }
  };
  // Over the edit form the card only shows while it plays (the sender pressed Listen).
  const hidden = overSheet && !api.playing && !api.loading;
  const title = api.title ?? suggestionFor(videoId)?.title ?? "Your song";
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();
  const at = overSheet ? "br" : corner;
  const style: CSSProperties = {
    zIndex: overSheet ? 195 : 96,
    ...(at[0] === "b"
      ? { bottom: overSheet ? "calc(112px + env(safe-area-inset-bottom, 0px))" : `calc(${dockBase} + 12px + env(safe-area-inset-bottom, 0px))` }
      : // Top right sits under the SubhSandesh mark.
        { top: at === "tr" ? "calc(64px + env(safe-area-inset-top, 0px))" : "calc(12px + env(safe-area-inset-top, 0px))" }),
    ...(at[1] === "r" ? { right: "max(12px, env(safe-area-inset-right, 0px))" } : { left: "max(12px, env(safe-area-inset-left, 0px))" }),
    visibility: hidden ? "hidden" : "visible",
    pointerEvents: hidden ? "none" : "auto",
  };
  return (
    <div className={`vm-dock${expanded ? " is-big" : ""}${dark ? " is-dark" : ""}`} style={style} onPointerDown={stop} onKeyDown={stop} role="region" aria-label="Now playing">
      {expanded && (
        <div className="vm-head">
          <Disc spinning={api.playing} />
          <span className="vm-headTx">
            <small>{api.playing ? "Now playing" : api.loading ? "Loading the song…" : "Their song"}</small>
            <b title={title}>{title}</b>
          </span>
        </div>
      )}
      <div className="vm-row">
        {!expanded && (
          <div className="vm-side">
            <button type="button" className="vm-btn vm-play" onClick={api.toggle} aria-label={api.playing ? "Pause the song" : "Play the song"}>
              {api.playing ? "❚❚" : "▶"}
            </button>
            <button type="button" className="vm-btn" onClick={() => setExpanded(true)} aria-label="More: song title, move or resize the player" title="More">⋯</button>
          </div>
        )}
        <div className={`vm-video${everPlayed ? " is-live" : ""}`} style={{ backgroundImage: `url(${youTubeThumb(videoId)})` }}>
          <div ref={host} className="vm-host" />
        </div>
      </div>
      {expanded && (
        <div className="vm-ctrls">
          <button type="button" className="vm-btn vm-play is-wide" onClick={api.toggle} aria-label={api.playing ? "Pause the song" : "Play the song"}>
            {api.playing ? "❚❚  Pause" : "▶  Play"}
          </button>
          {!overSheet && (
            <button type="button" className="vm-btn" onClick={move} aria-label="Move the player to another corner" title="Move to another corner">⇱</button>
          )}
          <button type="button" className="vm-btn" onClick={() => setExpanded(false)} aria-label="Make the player smaller" title="Smaller">⤡</button>
        </div>
      )}
    </div>
  );
}

// ─── Audio-only: the "spirit radio" card ─────────────────────────────────────
//
// THIS HIDES THE YOUTUBE PLAYER. The iframe is still mounted at 200×113 (the
// size YouTube asks for, and big enough that mobile browsers do not treat it
// as offscreen and throttle it), but an opaque card sits on top of it and
// takes every tap, so the video is never seen — only the sound plays.
// YouTube's embed terms expect the player to be visible; hiding it is the
// product owner's explicit request for Halloween. It is opt-in per day
// (DayConfig.music.audioOnly) and switching that one flag off brings back the
// normal visible mini-player. If YouTube ever pauses covered players, that is
// the flag to flip.

function SpiritRadioDock({
  api,
  title,
  artist,
  host,
  overSheet,
  dockBase,
  muted,
  onMute,
}: {
  api: DayMusicApi;
  title: string;
  artist: string;
  /** The YouTube player's mount (absent for a template track: nothing to cover). */
  host?: React.RefObject<HTMLDivElement | null>;
  overSheet: boolean;
  dockBase: string;
  muted: boolean;
  onMute: () => void;
}) {
  const [corner, setCorner] = useState<Corner>("br");
  // Phones: the card would sit on the scene's buttons, so it tucks into the
  // right edge leaving a small spinning-pumpkin tab. The player stays 200×113
  // and partly on screen (so it is never "offscreen"), still fully covered.
  // It slides out for a few seconds when the song starts, then tucks again.
  const [phone, setPhone] = useState(false);
  const [tucked, setTucked] = useState(true);
  const [peekFor, setPeekFor] = useState(0);
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setPhone(window.innerWidth < 768);
      try {
        const c = window.localStorage.getItem(CORNER_KEY) as Corner | null;
        if (c && CORNERS.includes(c)) setCorner(c);
      } catch {
        /* storage blocked — default corner */
      }
    });
    return () => cancelAnimationFrame(raf);
  }, []);
  const [wasPlaying, setWasPlaying] = useState(false);
  if (api.playing !== wasPlaying) {
    setWasPlaying(api.playing);
    if (api.playing) {
      setTucked(false);
      setPeekFor((n) => n + 1);
    }
  }
  useEffect(() => {
    if (!peekFor || !phone) return;
    const t = window.setTimeout(() => setTucked(true), 4500);
    return () => window.clearTimeout(t);
  }, [peekFor, phone]);
  const move = () => {
    const next = CORNERS[(CORNERS.indexOf(corner) + 1) % CORNERS.length];
    setCorner(next);
    try {
      window.localStorage.setItem(CORNER_KEY, next);
    } catch {
      /* fine */
    }
  };
  const hidden = overSheet && !api.playing && !api.loading;
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();
  // Tucking only ever happens on a right-hand corner.
  const at: Corner = overSheet ? "br" : phone ? (corner[0] === "t" ? "tr" : "br") : corner;
  const tuck = phone && tucked && !overSheet;
  const style: CSSProperties = {
    zIndex: overSheet ? 195 : 96,
    transform: tuck ? "translateX(calc(100% - 58px))" : "none",
    transition: "transform .45s cubic-bezier(.3,.7,.2,1)",
    ...(at[0] === "b"
      ? { bottom: overSheet ? "calc(112px + env(safe-area-inset-bottom, 0px))" : `calc(${dockBase} + 12px + env(safe-area-inset-bottom, 0px))` }
      : { top: at === "tr" ? "calc(64px + env(safe-area-inset-top, 0px))" : "calc(12px + env(safe-area-inset-top, 0px))" }),
    ...(at[1] === "r" ? { right: "max(12px, env(safe-area-inset-right, 0px))" } : { left: "max(12px, env(safe-area-inset-left, 0px))" }),
    visibility: hidden ? "hidden" : "visible",
    pointerEvents: hidden ? "none" : "auto",
  };
  const status = api.playing ? (muted ? "Muted" : "Now playing") : api.loading ? "Tuning in…" : "Paused";
  return (
    <div className="vm-dock vm-radio" style={style} onPointerDown={stop} onKeyDown={stop} role="region" aria-label="Now playing">
      <div className="vr-box">
        {/* The real player — full size, under the cover. Never visible. */}
        {host && <div ref={host} className="vr-host" aria-hidden />}
        <div className="vr-cover">
          <span className={`vr-disc${api.playing && !muted ? " is-on" : ""}`} aria-hidden>
            <i />
          </span>
          <div className="vr-tx">
            <small><span className={`vr-dot${api.playing ? " is-on" : ""}`} aria-hidden />{status}</small>
            <b title={title}>{title}</b>
            {artist && <em>{artist}</em>}
            <div className="vr-ctrls">
              <button type="button" className="vr-btn vr-play" onClick={api.toggle} aria-label={api.playing ? "Pause the song" : "Play the song"}>
                {api.playing ? "❚❚" : "▶"}
              </button>
              <button type="button" className="vr-btn" onClick={onMute} aria-pressed={muted} aria-label={muted ? "Unmute the song" : "Mute the song"}>
                {muted ? "🔇" : "🔊"}
              </button>
              {!overSheet && !phone && (
                <button type="button" className="vr-btn" onClick={move} aria-label="Move the radio to another corner" title="Move to another corner">⇱</button>
              )}
              {!overSheet && phone && (
                <button type="button" className="vr-btn" onClick={() => setTucked(true)} aria-label="Tuck the radio away" title="Tuck it away">⇥</button>
              )}
            </div>
          </div>
          <span className="vr-eq" aria-hidden><i /><i /><i /><i /></span>
        </div>
        {tuck && (
          <button type="button" className="vr-tab" onClick={() => setTucked(false)} aria-label={`Music: ${title}. Show the player`}>
            <span className="vr-sr">{api.playing ? "Now playing" : "Paused"}: {title}</span>
          </button>
        )}
      </div>
    </div>
  );
}

const RADIO_CSS = `
.vm-radio { padding: 6px; background: #1B1330; color: #F7F3FF; box-shadow: 0 18px 40px -14px rgba(0,0,0,.75), 0 0 0 1px rgba(255,210,122,.28), 0 0 24px -6px rgba(255,138,61,.45); }
.vr-box { position: relative; width: 200px; height: 113px; border-radius: 12px; overflow: hidden; background: #1B1330; }
.vr-host, .vr-host iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
.vr-cover { position: absolute; inset: 0; z-index: 2; display: flex; gap: 9px; align-items: center; padding: 8px 9px; box-sizing: border-box;
  background: radial-gradient(120% 90% at 0% 0%, #3A2257 0%, #241843 55%, #1B1330 100%); }
.vr-disc { position: relative; flex: none; width: 50px; height: 50px; border-radius: 50%;
  background: radial-gradient(circle at 50% 55%, #FFB067 0 30%, #FF8A3D 31% 58%, #C2551A 59% 62%, #FF8A3D 63% 100%);
  box-shadow: inset 0 -4px 0 rgba(0,0,0,.18), 0 0 0 2px rgba(255,210,122,.35); }
.vr-disc::before { content: ""; position: absolute; left: 50%; top: -5px; width: 5px; height: 9px; margin-left: -2.5px; border-radius: 2px; background: #6FBF8E; }
.vr-disc i { position: absolute; inset: 19px; border-radius: 50%; background: #1B1330; box-shadow: 0 0 0 2px #FFD27A; }
.vr-disc.is-on { animation: vm-spin 3.6s linear infinite; }
.vr-tx { display: grid; min-width: 0; flex: 1; gap: 1px; line-height: 1.2; font-family: ${FONTS.ui}; }
.vr-tx small { display: flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #FFD27A; }
.vr-tx b { font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #F7F3FF; }
.vr-tx em { font-style: normal; font-size: 10.5px; color: #CFC6E8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vr-dot { width: 6px; height: 6px; border-radius: 50%; background: #6B5F86; flex: none; }
.vr-dot.is-on { background: #9BE7C4; box-shadow: 0 0 6px #9BE7C4; }
.vr-ctrls { display: flex; gap: 5px; margin-top: 4px; }
.vr-btn { width: 34px; height: 34px; border-radius: 11px; border: 0; cursor: pointer; display: grid; place-items: center; background: rgba(247,243,255,.12); color: #F7F3FF; font: 700 13px ${FONTS.ui}; }
.vr-btn.vr-play { background: #FF8A3D; color: #1A0F05; box-shadow: 0 3px 0 #C2551A; }
.vr-btn:focus-visible { outline: 3px solid #FFD27A; outline-offset: 2px; }
.vr-tab { position: absolute; inset: 0; z-index: 3; border: 0; padding: 0; background: transparent; cursor: pointer; }
.vr-tab:focus-visible { outline: 3px solid #FFD27A; outline-offset: -3px; border-radius: 12px; }
.vr-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; }
.vr-eq { position: absolute; right: 8px; top: 9px; display: flex; align-items: flex-end; gap: 2px; height: 12px; opacity: .8; }
.vr-eq i { width: 2.5px; height: 35%; border-radius: 2px; background: #9BE7C4; }
.vm-radio .vr-disc.is-on ~ .vr-eq i { animation: vmp-eq-r .9s ease-in-out infinite; }
.vm-radio .vr-disc.is-on ~ .vr-eq i:nth-child(2) { animation-delay: .15s; }
.vm-radio .vr-disc.is-on ~ .vr-eq i:nth-child(3) { animation-delay: .3s; }
.vm-radio .vr-disc.is-on ~ .vr-eq i:nth-child(4) { animation-delay: .45s; }
@keyframes vmp-eq-r { 0%,100% { height: 30%; } 50% { height: 100%; } }
@media (prefers-reduced-motion: reduce) { .vr-disc.is-on, .vm-radio .vr-disc.is-on ~ .vr-eq i { animation: none; } }
`;

// ─── Audio-only, premium: the themed "now playing" chip ──────────────────────
//
// THIS ALSO HIDES THE YOUTUBE PLAYER — the same trade-off as the spirit radio
// above (YouTube's embed terms expect a visible player; hiding it is the
// product owner's explicit decision for the -premium days, whose cinematic
// scenes a visible video card would cover). The iframe stays mounted at
// 200×113 inside the chip, clipped by it and covered by its opaque face, so it
// is never offscreen and never seen. Switch `music.audioOnly` off on a day to
// bring back the visible mini-player.
//
// Compact: a 52px pill in the day's own colours (disc with the day's emoji,
// status, title, play/pause, mute, move). Collapsed to the disc until the
// song first plays; on phones it opens for a few seconds when the song starts,
// then folds back into a half-disc tab at the screen edge, so it never sits on
// a scene's buttons (the page also reserves 68px above --vw-dock-space).

export interface NowPlayingChipTheme {
  /** Opaque face colour. */
  bg: string;
  ink: string;
  soft: string;
  accent: string;
  accentInk: string;
  gold: string;
  /** The day's emoji in the disc. */
  glyph: string;
}

/** Chip theme from a day's palette (dark days use the base, light days the paper). */
export function chipThemeFrom(t: { base: string; paper: string; ink: string; inkSoft: string; paperInk: string; accent: string; accentInk: string; gold: string; dark?: boolean }, glyph: string): NowPlayingChipTheme {
  return t.dark
    ? { bg: t.base, ink: t.ink, soft: t.inkSoft, accent: t.accent, accentInk: t.accentInk, gold: t.gold, glyph }
    : { bg: t.paper, ink: t.paperInk, soft: t.paperInk, accent: t.accent, accentInk: t.accentInk, gold: t.gold, glyph };
}

/** Bottom room the chip needs on phones (52px pill + 12px gap + 4px air). */
const CHIP_RESERVE = 68;

function NowPlayingChip({
  api,
  title,
  artist,
  host,
  overSheet,
  dockBase,
  muted,
  onMute,
  theme,
}: {
  api: DayMusicApi;
  title: string;
  artist: string;
  /** The YouTube player's mount (absent for a template track). */
  host?: React.RefObject<HTMLDivElement | null>;
  overSheet: boolean;
  dockBase: string;
  muted: boolean;
  onMute: () => void;
  theme: NowPlayingChipTheme;
}) {
  const [corner, setCorner] = useState<Corner>("br");
  const [phone, setPhone] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setPhone(window.innerWidth < 768);
      try {
        const c = window.localStorage.getItem(CORNER_KEY) as Corner | null;
        if (c && CORNERS.includes(c)) setCorner(c);
      } catch {
        /* storage blocked — default corner */
      }
    });
    return () => cancelAnimationFrame(raf);
  }, []);
  // Opens when the song starts (phones: for a few seconds, then back to the disc).
  const [wasPlaying, setWasPlaying] = useState(false);
  if (api.playing !== wasPlaying) {
    setWasPlaying(api.playing);
    // Phones never auto-open it: an open 52px pill sat on scenes' bottom CTAs
    // for its first seconds. There the edge sliver's spinning disc says the
    // song is on, and a tap on it opens the pill.
    if (api.playing && !phone) setOpen(true);
  }
  const move = () => {
    const next = CORNERS[(CORNERS.indexOf(corner) + 1) % CORNERS.length];
    setCorner(next);
    try {
      window.localStorage.setItem(CORNER_KEY, next);
    } catch {
      /* fine */
    }
  };
  const hidden = overSheet && !api.playing && !api.loading;
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();
  const at: Corner = overSheet ? "br" : corner;
  const expanded = open || overSheet;
  // Phones, collapsed: the chip sits flush on the screen edge with only a 14px
  // sliver showing — narrower than the 16px page gutter — so a scene's
  // full-width buttons scrolling past (or resting at the bottom) are never
  // covered. The player stays partly on screen, still covered.
  const tuck = phone && !expanded && !overSheet;
  const edge = tuck ? "0px" : "12px";
  const style: CSSProperties = {
    zIndex: overSheet ? 195 : 96,
    transform: tuck ? `translateX(${at[1] === "r" ? "" : "-"}calc(100% - 14px))` : "none",
    ["--vp-bg" as string]: theme.bg,
    ["--vp-ink" as string]: theme.ink,
    ["--vp-soft" as string]: theme.soft,
    ["--vp-accent" as string]: theme.accent,
    ["--vp-accent-ink" as string]: theme.accentInk,
    ["--vp-gold" as string]: theme.gold,
    ...(at[0] === "b"
      ? { bottom: overSheet ? "calc(112px + env(safe-area-inset-bottom, 0px))" : `calc(${dockBase} + 12px + env(safe-area-inset-bottom, 0px))` }
      : // Top corners sit under the 🔊 chip (left) / the SubhSandesh mark (right).
        { top: "calc(64px + env(safe-area-inset-top, 0px))" }),
    ...(at[1] === "r" ? { right: `max(${edge}, env(safe-area-inset-right, 0px))` } : { left: `max(${edge}, env(safe-area-inset-left, 0px))` }),
    visibility: hidden ? "hidden" : "visible",
    pointerEvents: hidden ? "none" : "auto",
  };
  const on = api.playing && !muted;
  const status = api.playing ? (muted ? "Muted" : "Now playing") : api.loading ? "Tuning in…" : "Paused";
  return (
    <div
      className={`vp-chip${expanded ? " is-open" : ""}${tuck ? " is-tucked" : ""}`}
      style={style}
      onPointerDown={stop}
      onKeyDown={stop}
      role="region"
      aria-label="Now playing"
    >
      {/* The real player — 200×113, clipped by the chip, under its opaque face. Never visible. */}
      {host && <div ref={host} className="vp-host" aria-hidden />}
      <div className="vp-face">
        <button
          type="button"
          className={`vp-disc${on ? " is-on" : ""}`}
          onClick={() => setOpen((o) => !o)}
          aria-expanded={expanded}
          aria-label={expanded ? "Hide the music controls" : `Music: ${title}. Show the controls`}
        >
          <span className="vp-ring" aria-hidden />
          <span className="vp-glyph" aria-hidden>{theme.glyph}</span>
        </button>
        <span className="vp-tx" aria-hidden={!expanded}>
          <small><i className={`vp-dot${api.playing ? " is-on" : ""}`} />{status}</small>
          <b title={title}>{title}</b>
          {artist && <em>{artist}</em>}
        </span>
        <span className="vp-ctrls">
          <button type="button" className="vp-btn vp-play" tabIndex={expanded ? 0 : -1} onClick={api.toggle} aria-label={api.playing ? "Pause the song" : "Play the song"}>
            {api.playing ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button type="button" className="vp-btn" tabIndex={expanded ? 0 : -1} onClick={onMute} aria-pressed={muted} aria-label={muted ? "Unmute the song" : "Mute the song"}>
            {muted ? <MuteIcon off /> : <MuteIcon />}
          </button>
          {!overSheet && (
            <button type="button" className="vp-btn" tabIndex={expanded ? 0 : -1} onClick={move} aria-label="Move the music chip to another corner" title="Move to another corner">
              <MoveIcon />
            </button>
          )}
        </span>
      </div>
    </div>
  );
}

const svgProps = { width: 16, height: 16, viewBox: "0 0 16 16", "aria-hidden": true, focusable: false } as const;
const PlayIcon = () => (
  <svg {...svgProps}>
    <path d="M5 3.2v9.6L12.6 8z" fill="currentColor" />
  </svg>
);
const PauseIcon = () => (
  <svg {...svgProps}>
    <rect x="4" y="3" width="2.8" height="10" rx="1" fill="currentColor" />
    <rect x="9.2" y="3" width="2.8" height="10" rx="1" fill="currentColor" />
  </svg>
);
const MuteIcon = ({ off = false }: { off?: boolean }) => (
  <svg {...svgProps}>
    <path d="M2.5 6h2.6L8.6 3v10L5.1 10H2.5z" fill="currentColor" />
    {off ? (
      <path d="M10.6 5.8l3.6 4.4M14.2 5.8l-3.6 4.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    ) : (
      <path d="M10.6 5.6c1.1 1.3 1.1 3.5 0 4.8M12.4 4c2 2.3 2 5.7 0 8" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    )}
  </svg>
);
const MoveIcon = () => (
  <svg {...svgProps}>
    <path d="M8 1.8v12.4M1.8 8h12.4M8 1.8 6.2 3.6M8 1.8l1.8 1.8M8 14.2l-1.8-1.8M8 14.2l1.8-1.8M1.8 8l1.8-1.8M1.8 8l1.8 1.8M14.2 8l-1.8-1.8M14.2 8l-1.8 1.8" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
  </svg>
);

const CHIP_CSS = `
.vp-chip { position: fixed; width: 52px; height: 52px; border-radius: 26px; overflow: hidden; isolation: isolate;
  background: var(--vp-bg); color: var(--vp-ink); font-family: ${FONTS.ui};
  box-shadow: 0 14px 34px -14px rgba(0,0,0,.6), 0 0 0 1px color-mix(in srgb, var(--vp-gold) 45%, transparent);
  transition: width .38s cubic-bezier(.3,.7,.2,1), transform .38s cubic-bezier(.3,.7,.2,1); }
.vp-chip.is-open { width: min(316px, calc(100vw - 24px)); }
.vp-host, .vp-host iframe { position: absolute; left: 0; top: 0; width: 200px; height: 113px; border: 0; pointer-events: none; }
.vp-face { position: absolute; inset: 0; z-index: 2; display: flex; align-items: center; gap: 6px; padding: 4px; box-sizing: border-box;
  background: var(--vp-bg);
  background-image: radial-gradient(120% 140% at 0% 0%, color-mix(in srgb, var(--vp-accent) 22%, transparent), transparent 62%); }
.vp-disc { position: relative; flex: none; width: 44px; height: 44px; border-radius: 50%; border: 0; padding: 0; cursor: pointer; display: grid; place-items: center;
  background: radial-gradient(circle, color-mix(in srgb, var(--vp-ink) 6%, var(--vp-bg)) 0 46%, transparent 47%),
    repeating-radial-gradient(circle, color-mix(in srgb, var(--vp-ink) 18%, var(--vp-bg)) 0 1.5px, color-mix(in srgb, var(--vp-ink) 8%, var(--vp-bg)) 1.5px 3px); }
.vp-ring { position: absolute; inset: 0; border-radius: 50%;
  background: conic-gradient(from 0deg, var(--vp-gold), transparent 30%, var(--vp-accent) 52%, transparent 78%, var(--vp-gold));
  -webkit-mask: radial-gradient(circle, transparent 0 19px, #000 19.5px 22px, transparent 22.5px); mask: radial-gradient(circle, transparent 0 19px, #000 19.5px 22px, transparent 22.5px);
  opacity: .75; }
.vp-disc.is-on .vp-ring { animation: vp-spin 2.8s linear infinite; opacity: 1; }
.vp-glyph { position: relative; font-size: 18px; line-height: 1; }
.vp-tx { display: grid; min-width: 0; flex: 1; gap: 1px; line-height: 1.15; opacity: 0; transition: opacity .2s; }
.vp-chip.is-open .vp-tx { opacity: 1; transition-delay: .12s; }
.vp-tx small { display: flex; align-items: center; gap: 5px; font-size: 9.5px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--vp-gold); }
.vp-tx b { font-size: 13px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vp-tx em { font-style: normal; font-size: 10.5px; color: var(--vp-soft); opacity: .85; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vp-dot { width: 6px; height: 6px; border-radius: 50%; flex: none; background: color-mix(in srgb, var(--vp-ink) 30%, transparent); }
.vp-dot.is-on { background: var(--vp-accent); box-shadow: 0 0 6px var(--vp-accent); }
.vp-ctrls { display: flex; gap: 4px; flex: none; opacity: 0; transition: opacity .2s; }
.vp-chip.is-open .vp-ctrls { opacity: 1; transition-delay: .12s; }
.vp-chip:not(.is-open) .vp-ctrls, .vp-chip:not(.is-open) .vp-tx { pointer-events: none; }
.vp-btn { width: 44px; height: 44px; border-radius: 50%; border: 0; cursor: pointer; display: grid; place-items: center; padding: 0;
  background: color-mix(in srgb, var(--vp-ink) 9%, transparent); color: var(--vp-ink); }
.vp-btn.vp-play { background: var(--vp-accent); color: var(--vp-accent-ink); }
.vp-btn:focus-visible, .vp-disc:focus-visible { outline: 3px solid var(--vp-gold); outline-offset: -3px; }
@keyframes vp-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .vp-chip { transition: none; } .vp-disc.is-on .vp-ring { animation: none; } }
`;

// ─── Compact: one 40px round icon (DayConfig.music.compact) ──────────────────
//
// Opt-in per day. Replaces the radio card / chip (and the melody's round
// button) with a single 40px button: a tap plays or stops the music, a tiny
// equaliser bounces while it plays, a struck-through note shows when it is
// stopped. A YouTube song's player stays mounted at 200×113 inside it, clipped
// and covered (the same audio-only trade-off as the chip above).
//
// Placement: bottom-left, above the dock and the safe area, by default (a day
// can nudge it with plain CSS on `.vm-icon`, e.g. to centre it on its own
// bottom button). While the edit form is open (`overSheet`) it must never sit
// on the form: inline styles move it into the strip of dimmed page ABOVE the
// sheet, top-left, a little smaller (the phone sheet is 94dvh tall, so that
// strip is 6dvh: 40px at 667, 50px at 844; on wide screens the sheet is a
// centred card with at least 6vh above it).

function CompactMusicIcon({
  api,
  title,
  host,
  overSheet,
  dockBase,
  muted,
  onMute,
}: {
  api: DayMusicApi;
  title: string;
  host?: React.RefObject<HTMLDivElement | null>;
  overSheet: boolean;
  dockBase: string;
  muted: boolean;
  onMute?: () => void;
}) {
  const on = api.playing && !muted;
  const hidden = overSheet && !api.playing && !api.loading;
  const style: CSSProperties = {
    ["--vm-icon-base" as string]: dockBase,
    ...(overSheet
      ? { zIndex: 195, top: "max(4px, calc(3dvh - 16px))", bottom: "auto", right: "auto", left: "max(12px, env(safe-area-inset-left, 0px))", transform: "scale(.8)", transformOrigin: "0 0" }
      : null),
    visibility: hidden ? "hidden" : "visible",
    pointerEvents: hidden ? "none" : "auto",
  };
  const label = on ? `Stop the music (${title})` : `Play the music (${title})`;
  return (
    <div className={`vm-icon${on ? " is-on" : ""}${api.loading ? " is-loading" : ""}`} style={style}>
      {/* The real player (YouTube only) — 200×113, clipped by the 40px circle, under the face. Never visible. */}
      {host && <div ref={host} className="vm-icon-host" aria-hidden />}
      <button
        type="button"
        className="vm-icon-btn"
        // Keep this tap away from the "first gesture starts the music" listener,
        // or the same tap would start it and then toggle it straight back off.
        onPointerDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          if (api.playing && muted && onMute) onMute();
          else api.toggle();
        }}
        aria-pressed={on}
        aria-label={label}
        title={label}
      >
        <span className="vm-icon-ring" aria-hidden />
        <span className="vm-icon-eq" aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <svg className="vm-icon-off" width="18" height="18" viewBox="0 0 18 18" aria-hidden focusable="false">
          <path d="M7 13.2V4.4l7-1.6v8.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <ellipse cx="5" cy="13.4" rx="2.3" ry="1.8" fill="currentColor" />
          <ellipse cx="12" cy="11.6" rx="2.3" ry="1.8" fill="currentColor" />
          <path d="M2.5 2.5l13 13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

const ICON_CSS = `
.vm-icon { position: fixed; z-index: 96; width: 40px; height: 40px; border-radius: 50%; overflow: hidden; isolation: isolate;
  left: max(12px, env(safe-area-inset-left, 0px)); bottom: calc(var(--vm-icon-base, 0px) + 12px + env(safe-area-inset-bottom, 0px));
  box-shadow: 0 8px 20px -8px rgba(0,0,0,.7), 0 0 0 1px rgba(255,210,122,.4); }
.vm-icon-host, .vm-icon-host iframe { position: absolute; left: 0; top: 0; width: 200px; height: 113px; border: 0; pointer-events: none; }
.vm-icon-btn { position: absolute; inset: 0; z-index: 2; border: 0; padding: 0; margin: 0; border-radius: 50%; cursor: pointer; display: grid; place-items: center;
  color: #FFD27A; background: radial-gradient(circle at 50% 38%, #3A2257, #1B1330 70%); touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.vm-icon-btn:focus-visible { outline: 3px solid #FFD27A; outline-offset: -3px; }
.vm-icon-ring { position: absolute; inset: 2px; border-radius: 50%; opacity: 0; transition: opacity .3s;
  background: conic-gradient(from 0deg, #FFD27A, transparent 30%, #FF8A3D 52%, transparent 78%, #FFD27A);
  -webkit-mask: radial-gradient(circle, transparent 0 15px, #000 15.5px 18px, transparent 18.5px); mask: radial-gradient(circle, transparent 0 15px, #000 15.5px 18px, transparent 18.5px); }
.vm-icon.is-on .vm-icon-ring { opacity: 1; animation: vm-icon-spin 3.2s linear infinite; }
@keyframes vm-icon-spin { to { transform: rotate(360deg); } }
.vm-icon-eq { position: absolute; display: flex; align-items: flex-end; gap: 2.5px; height: 14px; opacity: 0; transition: opacity .2s; }
.vm-icon-eq i { display: block; width: 3px; height: 14px; border-radius: 2px; background: #FFD27A; transform-origin: 50% 100%; transform: scaleY(.35); }
.vm-icon.is-on .vm-icon-eq { opacity: 1; }
.vm-icon.is-on .vm-icon-eq i { animation: vm-icon-eq .9s ease-in-out infinite; }
.vm-icon.is-on .vm-icon-eq i:nth-child(2) { animation-delay: .2s; }
.vm-icon.is-on .vm-icon-eq i:nth-child(3) { animation-delay: .4s; }
@keyframes vm-icon-eq { 0%,100% { transform: scaleY(.3); } 50% { transform: scaleY(1); } }
.vm-icon-off { position: absolute; opacity: .9; transition: opacity .2s; }
.vm-icon.is-on .vm-icon-off { opacity: 0; }
.vm-icon.is-loading .vm-icon-off { opacity: .45; }
@media (prefers-reduced-motion: reduce) { .vm-icon.is-on .vm-icon-ring, .vm-icon.is-on .vm-icon-eq i { animation: none; } .vm-icon.is-on .vm-icon-eq i { transform: scaleY(.7); } }
`;

type Corner = "br" | "bl" | "tl" | "tr";
const CORNERS: Corner[] = ["br", "bl", "tl", "tr"];
const CORNER_KEY = "vw_music_corner";

const DOCK_CSS = `
.vm-dock { position: fixed; display: grid; gap: 8px; padding: 6px;
  border-radius: 18px; background: rgba(255,255,255,.92); color: #2a1a22; font-family: ${FONTS.ui};
  box-shadow: 0 18px 40px -16px rgba(30,12,24,.55), 0 0 0 1px rgba(0,0,0,.06);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); transition: padding .2s; }
.vm-dock.is-dark { background: rgba(28,14,24,.9); color: #fff3f6; box-shadow: 0 18px 40px -16px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.1); }
.vm-dock.is-big { padding: 10px; width: min(300px, calc(100vw - 24px)); }
.vm-row { display: flex; gap: 6px; align-items: stretch; }
.vm-side { display: grid; gap: 6px; align-content: center; }
.vm-video { position: relative; width: 200px; height: 113px; border-radius: 12px; overflow: hidden; background: #000 center / cover no-repeat; flex: none; }
.vm-dock.is-big .vm-video { width: 100%; height: auto; aspect-ratio: 16 / 9; }
.vm-host, .vm-host iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
.vm-host { opacity: 0; transition: opacity .4s; }
.vm-video.is-live .vm-host { opacity: 1; }
.vm-video::after { content: "♪"; position: absolute; left: 50%; top: 50%; width: 44px; height: 44px; margin: -22px 0 0 -22px; border-radius: 50%; display: grid; place-items: center;
  background: rgba(0,0,0,.55); color: #fff; font-size: 20px; pointer-events: none; transition: opacity .3s; }
.vm-video.is-live::after { opacity: 0; }
/* Phones: the scene gives up a strip at the bottom so the player never sits on a day's buttons. */
.vm-reserve { --vw-dock-space: var(--vm-reserve); }
@media (min-width: 768px) { .vm-reserve { --vw-dock-space: var(--vm-base); } }
.vm-head { display: flex; align-items: center; gap: 10px; min-width: 0; padding: 2px 2px 0; }
.vm-headTx { display: grid; min-width: 0; line-height: 1.2; }
.vm-headTx small { font-size: 11px; font-weight: 600; opacity: .65; text-transform: uppercase; letter-spacing: .06em; }
.vm-headTx b { font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vm-ctrls { display: flex; gap: 8px; }
.vm-btn { min-width: 44px; height: 44px; border-radius: 14px; border: 0; cursor: pointer; display: grid; place-items: center;
  background: rgba(0,0,0,.06); color: inherit; font: 700 15px ${FONTS.ui}; }
.vm-dock.is-dark .vm-btn { background: rgba(255,255,255,.1); }
.vm-btn.vm-play { background: linear-gradient(135deg, #ff5d8f, #d0245f); color: #fff; box-shadow: 0 6px 14px -6px rgba(208,36,95,.7); }
.vm-btn.is-wide { flex: 1; }
.vm-btn:focus-visible { outline: 3px solid #ff8fb1; outline-offset: 2px; }
.vm-disc { position: relative; flex: none; width: 34px; height: 34px; border-radius: 50%;
  background: repeating-radial-gradient(circle, #2a1a22 0 2px, #3b2630 2px 4px); box-shadow: inset 0 0 0 1px rgba(255,255,255,.15); }
.vm-disc i { position: absolute; inset: 11px; border-radius: 50%; background: linear-gradient(135deg, #ff8fb1, #d0245f); }
.vm-disc.is-on { animation: vm-spin 3.2s linear infinite; }
@keyframes vm-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .vm-disc.is-on { animation: none; } }
`;

// ─── The provider ────────────────────────────────────────────────────────────

export interface DayMusicSettings {
  musicMode: MusicMode;
  musicYoutubeId: string;
  musicStart: number;
}

export function DayMusicProvider({
  settings,
  melody,
  autoStart,
  dark = false,
  overSheet = false,
  dockBase = "0px",
  audioOnly = false,
  songs,
  chip,
  track,
  compact = false,
  children,
}: {
  settings: DayMusicSettings;
  melody: MelodyId;
  /** Start on the first tap/key anywhere (live page; the editor once they've saved). */
  autoStart: boolean;
  /** Paint the card for a dark day. */
  dark?: boolean;
  /** The edit form is open: lift the card over it, and show it only while it plays. */
  overSheet?: boolean;
  /** Bottom space the shell already reserves (the editor's floating dock). */
  dockBase?: string;
  /** Play a YouTube song as audio only — the video stays covered (DayConfig.music.audioOnly). */
  audioOnly?: boolean;
  /** The day's own song list (titles for the card). */
  songs?: readonly SongSuggestion[];
  /** With `audioOnly`: draw the compact themed chip (premium days) instead of the spirit radio. */
  chip?: NowPlayingChipTheme;
  /** The day's own looping MP3 (DayConfig.music.track) — plays in mode "track". */
  track?: DayTrack;
  /** DayConfig.music.compact: one 40px play/stop icon instead of the card / chip / melody button. */
  compact?: boolean;
  children: ReactNode;
}) {
  const requested = settings.musicMode;
  const ytId = requested === "youtube" ? settings.musicYoutubeId : "";
  const [failedId, setFailedId] = useState<string | null>(null);
  const broken = !!ytId && failedId === ytId;
  const mode: MusicMode =
    requested === "youtube" ? (ytId && !broken ? "youtube" : "melody") : requested === "track" ? (track?.url ? "track" : "melody") : requested;

  const host = useRef<HTMLDivElement | null>(null);
  const onFail = useCallback((id: string) => setFailedId(id), []);
  const synth = useSynthEngine({ melody, enabled: mode === "melody", autoStart });
  const yt = useYouTubeEngine({ videoId: mode === "youtube" ? ytId : "", startAt: settings.musicStart, autoStart, host, onFail, songs });
  const tr = useTrackEngine({ url: mode === "track" && track ? track.url : "", autoStart });

  const [toggles, setToggles] = useState(0);
  const registerToggle = useCallback(() => {
    setToggles((n) => n + 1);
    return () => setToggles((n) => n - 1);
  }, []);

  const error = broken ? "That song can't be played on other sites (the owner turned embedding off, or it's region-locked). Playing the soft melody instead." : null;

  // The melody's "turned off by the visitor" flag (the synth keeps its own for its toggle).
  const [melodyOff, setMelodyOff] = useState(false);
  const melodyOffRef = useRef(false);
  const melodyStart = synth.start;
  const melodyStop = synth.stop;
  const synthApi = useMemo(() => {
    const start = () => {
      melodyOffRef.current = false;
      setMelodyOff(false);
      melodyStart();
    };
    const stop = () => {
      melodyOffRef.current = true;
      setMelodyOff(true);
      melodyStop();
    };
    return {
      start,
      stop,
      toggle: () => (synth.playing ? stop() : start()),
      play: () => {
        if (!melodyOffRef.current) melodyStart();
      },
    };
  }, [melodyStart, melodyStop, synth.playing]);

  const base = useMemo<Omit<DayMusicApi, "duckFor">>(
    () =>
      mode === "youtube"
        ? {
            mode, available: true, playing: yt.playing, loading: yt.loading, error, title: yt.title,
            toggle: yt.toggle, start: yt.start, stop: yt.stop, registerToggle,
            ready: yt.ready, blocked: yt.blocked, userOff: yt.userOff, play: yt.play, pause: yt.pause, seekTo: yt.seekTo,
            currentTime: yt.currentTime, duck: yt.duck, unduck: yt.unduck, fadeTo: yt.fadeTo, canFade: yt.canFade, audioOnly,
          }
        : mode === "track"
          ? {
              mode, available: true, playing: tr.playing, loading: tr.loading, error, title: track?.title ?? null,
              toggle: tr.toggle, start: tr.start, stop: tr.stop, registerToggle,
              ready: tr.ready, blocked: tr.blocked, userOff: tr.userOff, play: tr.play, pause: tr.pause, seekTo: tr.seekTo,
              currentTime: tr.currentTime, duck: tr.duck, unduck: tr.unduck, fadeTo: tr.fadeTo, canFade: tr.canFade, audioOnly,
            }
          : {
              mode,
              available: mode === "melody",
              playing: synth.playing,
              loading: false,
              error,
              title: null,
              toggle: synthApi.toggle,
              start: synthApi.start,
              stop: synthApi.stop,
              registerToggle,
              ready: true,
              blocked: false,
              userOff: melodyOff,
              play: synthApi.play,
              pause: melodyStop,
              seekTo: () => synth.restartPhrase?.(),
              currentTime: () => synth.elapsed?.() ?? 0,
              duck: (level = 0.25, ms = 400) => synth.setLevel?.(level, ms),
              unduck: (ms = 600) => synth.setLevel?.(1, ms),
              fadeTo: (level: number, ms = 800) => synth.setLevel?.(level, ms),
              canFade: true,
              audioOnly,
            },
    [mode, yt, tr, track?.title, synth, synthApi, melodyOff, melodyStop, error, registerToggle, audioOnly],
  );

  // duckFor: one timer for the whole page, so overlapping scares extend the hold
  // instead of un-ducking under the second one. Always talks to the CURRENT engine.
  const baseRef = useRef(base);
  useEffect(() => {
    baseRef.current = base;
  });
  const duckTimer = useRef<number | null>(null);
  const duckFor = useCallback((holdMs: number, level = 0.2) => {
    const b = baseRef.current;
    if (!b.available) return;
    if (duckTimer.current == null) b.duck(level, 120);
    else window.clearTimeout(duckTimer.current);
    duckTimer.current = window.setTimeout(() => {
      duckTimer.current = null;
      baseRef.current.unduck(700);
    }, Math.max(0, holdMs));
  }, []);
  useEffect(
    () => () => {
      if (duckTimer.current != null) window.clearTimeout(duckTimer.current);
    },
    [],
  );

  const api = useMemo<DayMusicApi>(() => ({ ...base, duckFor }), [base, duckFor]);

  const ytTitle = yt.title ?? suggestionFor(ytId, songs)?.title ?? "Your song";
  const ytArtist = suggestionFor(ytId, songs)?.artist ?? "";
  const cardTitle = mode === "track" ? (track?.title ?? "Background music") : ytTitle;
  const cardArtist = mode === "track" ? (track?.artist ?? "") : ytArtist;
  const muted = mode === "track" ? tr.muted : yt.muted;
  const onMute = mode === "track" ? tr.toggleMute : yt.toggleMute;
  const cardHost = mode === "youtube" ? host : undefined;
  const hasCard = mode === "youtube" || mode === "track";
  // A track has no video to show: it always gets the audio-only card.
  const coverCard = mode === "track" || audioOnly;

  return (
    <DayMusicContext.Provider value={api}>
      {/* DayRoot pads its bottom by --vw-dock-space; with a YouTube song it grows by the
          player's height on phones. Always the same wrapper, so a mode change never remounts the day. */}
      <div
        className={hasCard ? "vm-reserve" : undefined}
        style={{ display: "contents", ["--vm-base" as string]: dockBase, ["--vm-reserve" as string]: compact ? dockBase : `calc(${dockBase} + ${coverCard && chip ? CHIP_RESERVE : 137}px)` }}
      >
        {children}
      </div>
      {compact ? (
        (hasCard || (mode === "melody" && toggles === 0 && !overSheet)) && (
          <>
            <CompactMusicIcon
              api={api}
              title={hasCard ? cardTitle : "Melody"}
              host={cardHost}
              overSheet={overSheet}
              dockBase={dockBase}
              muted={hasCard ? muted : false}
              onMute={hasCard ? onMute : undefined}
            />
            <style>{ICON_CSS}</style>
          </>
        )
      ) : (
        mode === "melody" && toggles === 0 && !overSheet && <MusicButton music={api} />
      )}
      {hasCard && !compact && (
        <>
          {coverCard && chip ? (
            <NowPlayingChip api={api} title={cardTitle} artist={cardArtist} host={cardHost} overSheet={overSheet} dockBase={dockBase} muted={muted} onMute={onMute} theme={chip} />
          ) : coverCard ? (
            <SpiritRadioDock api={api} title={cardTitle} artist={cardArtist} host={cardHost} overSheet={overSheet} dockBase={dockBase} muted={muted} onMute={onMute} />
          ) : (
            <YouTubeDock api={api} videoId={ytId} host={host} dark={dark} overSheet={overSheet} dockBase={dockBase} />
          )}
          <style>{DOCK_CSS}</style>
          {coverCard && <style>{chip ? CHIP_CSS : RADIO_CSS}</style>}
        </>
      )}
    </DayMusicContext.Provider>
  );
}
