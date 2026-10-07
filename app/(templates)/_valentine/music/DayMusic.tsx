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
//   • "off"     — nothing.
// Browsers only allow sound after a gesture, so it starts on the visitor's
// first tap/key (when `autoStart`), loops, fades in, pauses while the tab is
// hidden, and falls back to the melody if the song refuses to play (removed,
// region-locked, embedding disabled). Days keep calling useSynthMusic() /
// <MusicToggle>; both delegate here through DayMusicContext.

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { MusicButton, useSynthEngine, type MelodyId } from "../kit/useSynthMusic";
import { FONTS } from "../theme";
import type { MusicMode } from "../types";
import { DayMusicContext, type DayMusicApi } from "./context";
import { loadYouTubeApi, suggestionFor, youTubeThumb, type YTPlayer } from "./youtube";

const TARGET_VOLUME = 80;
const YT_STATE = { UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 } as const;

interface YouTubeEngine {
  playing: boolean;
  loading: boolean;
  title: string | null;
  start: () => void;
  stop: () => void;
  toggle: () => void;
}

function useYouTubeEngine({
  videoId,
  startAt,
  autoStart,
  host,
  onFail,
}: {
  videoId: string;
  startAt: number;
  autoStart: boolean;
  host: React.RefObject<HTMLDivElement | null>;
  onFail: (id: string) => void;
}): YouTubeEngine {
  const playerRef = useRef<YTPlayer | null>(null);
  const readyRef = useRef(false);
  const wantPlay = useRef(false);
  const userOff = useRef(false);
  const resumeOnShow = useRef(false);
  const fadeRef = useRef<number | null>(null);
  const startRef = useRef(startAt);
  const failRef = useRef(onFail);
  useEffect(() => {
    failRef.current = onFail;
  });
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState<string | null>(() => suggestionFor(videoId)?.title ?? null);
  const [titleFor, setTitleFor] = useState(videoId);
  if (titleFor !== videoId) {
    setTitleFor(videoId);
    setTitle(suggestionFor(videoId)?.title ?? null);
  }

  const clearFade = () => {
    if (fadeRef.current != null) window.clearInterval(fadeRef.current);
    fadeRef.current = null;
  };

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
      p.unMute();
      p.setVolume(0);
      p.playVideo();
    } catch {
      return;
    }
    // A gentle fade-in rather than a song slamming in mid-chorus.
    let v = 0;
    fadeRef.current = window.setInterval(() => {
      v = Math.min(TARGET_VOLUME, v + 6);
      try {
        playerRef.current?.setVolume(v);
      } catch {
        /* player gone */
      }
      if (v >= TARGET_VOLUME) clearFade();
    }, 90);
  }, []);

  const pause = useCallback(() => {
    wantPlay.current = false;
    setLoading(false);
    clearFade();
    try {
      playerRef.current?.pauseVideo();
    } catch {
      /* player gone */
    }
  }, []);

  // Create the player once per song. The API script loads only now.
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
              setLoading(false);
              const t = e.target.getVideoData?.().title;
              if (t) setTitle(t);
              if (wantPlay.current) play();
            },
            onStateChange: (e) => {
              if (cancelled) return;
              if (e.data === YT_STATE.PLAYING) {
                setPlaying(true);
                setLoading(false);
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
      readyRef.current = false;
      try {
        playerRef.current?.destroy();
      } catch {
        /* already gone */
      }
      playerRef.current = null;
      setPlaying(false);
      setLoading(false);
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

  // First gesture anywhere starts it (unless they turned it off).
  useEffect(() => {
    if (!videoId || !autoStart) return;
    const go = () => {
      if (!userOff.current) play();
    };
    window.addEventListener("pointerdown", go, { once: true });
    window.addEventListener("keydown", go, { once: true });
    return () => {
      window.removeEventListener("pointerdown", go);
      window.removeEventListener("keydown", go);
    };
  }, [videoId, autoStart, play]);

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
    play();
  }, [play]);
  const stop = useCallback(() => {
    userOff.current = true;
    pause();
  }, [pause]);
  const toggle = useCallback(() => (playing || wantPlay.current ? stop() : start()), [playing, start, stop]);

  return { playing, loading, title, start, stop, toggle };
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
  children: ReactNode;
}) {
  const requested = settings.musicMode;
  const ytId = requested === "youtube" ? settings.musicYoutubeId : "";
  const [failedId, setFailedId] = useState<string | null>(null);
  const broken = !!ytId && failedId === ytId;
  const mode: MusicMode = requested === "youtube" ? (ytId && !broken ? "youtube" : "melody") : requested;

  const host = useRef<HTMLDivElement | null>(null);
  const onFail = useCallback((id: string) => setFailedId(id), []);
  const synth = useSynthEngine({ melody, enabled: mode === "melody", autoStart });
  const yt = useYouTubeEngine({ videoId: mode === "youtube" ? ytId : "", startAt: settings.musicStart, autoStart, host, onFail });

  const [toggles, setToggles] = useState(0);
  const registerToggle = useCallback(() => {
    setToggles((n) => n + 1);
    return () => setToggles((n) => n - 1);
  }, []);

  const error = broken ? "That song can't be played on other sites (the owner turned embedding off, or it's region-locked). Playing the soft melody instead." : null;

  const api = useMemo<DayMusicApi>(
    () =>
      mode === "youtube"
        ? { mode, available: true, playing: yt.playing, loading: yt.loading, error, title: yt.title, toggle: yt.toggle, start: yt.start, stop: yt.stop, registerToggle }
        : {
            mode,
            available: mode === "melody",
            playing: synth.playing,
            loading: false,
            error,
            title: null,
            toggle: synth.toggle,
            start: synth.start,
            stop: synth.stop,
            registerToggle,
          },
    [mode, yt.playing, yt.loading, yt.title, yt.toggle, yt.start, yt.stop, synth.playing, synth.toggle, synth.start, synth.stop, error, registerToggle],
  );

  return (
    <DayMusicContext.Provider value={api}>
      {/* DayRoot pads its bottom by --vw-dock-space; with a YouTube song it grows by the
          player's height on phones. Always the same wrapper, so a mode change never remounts the day. */}
      <div className={mode === "youtube" ? "vm-reserve" : undefined} style={{ display: "contents", ["--vm-base" as string]: dockBase, ["--vm-reserve" as string]: `calc(${dockBase} + 137px)` }}>
        {children}
      </div>
      {mode === "melody" && toggles === 0 && !overSheet && <MusicButton music={api} />}
      {mode === "youtube" && (
        <>
          <YouTubeDock api={api} videoId={ytId} host={host} dark={dark} overSheet={overSheet} dockBase={dockBase} />
          <style>{DOCK_CSS}</style>
        </>
      )}
    </DayMusicContext.Provider>
  );
}
