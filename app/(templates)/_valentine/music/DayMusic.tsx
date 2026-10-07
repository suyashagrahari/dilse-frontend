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
//   • "youtube" + `audioOnly` (a per-day flag, DayConfig.music.audioOnly —
//                 Halloween uses it at the user's request): the same player,
//                 still mounted at its normal 200×113 size so iOS/Chrome keep
//                 it playing (they throttle or refuse 0px / offscreen frames),
//                 but fully covered by an opaque themed "spirit radio" card.
//                 The video is never visible; only the sound comes through.
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
import { loadYouTubeApi, suggestionFor, youTubeThumb, type SongSuggestion, type YTPlayer } from "./youtube";

const TARGET_VOLUME = 80;
const YT_STATE = { UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 } as const;

interface YouTubeEngine {
  playing: boolean;
  loading: boolean;
  title: string | null;
  muted: boolean;
  start: () => void;
  stop: () => void;
  toggle: () => void;
  toggleMute: () => void;
}

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
  const startRef = useRef(startAt);
  const failRef = useRef(onFail);
  useEffect(() => {
    failRef.current = onFail;
  });
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState<string | null>(() => suggestionFor(videoId, songs)?.title ?? null);
  const [titleFor, setTitleFor] = useState(videoId);
  if (titleFor !== videoId) {
    setTitleFor(videoId);
    setTitle(suggestionFor(videoId, songs)?.title ?? null);
  }
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);

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
      if (mutedRef.current) p.mute();
      else p.unMute();
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

  return { playing, loading, title, muted, start, stop, toggle, toggleMute };
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
  videoId,
  host,
  overSheet,
  dockBase,
  songs,
  muted,
  onMute,
}: {
  api: DayMusicApi;
  videoId: string;
  host: React.RefObject<HTMLDivElement | null>;
  overSheet: boolean;
  dockBase: string;
  songs?: readonly SongSuggestion[];
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
  const title = api.title ?? suggestionFor(videoId, songs)?.title ?? "Your song";
  const artist = suggestionFor(videoId, songs)?.artist ?? "";
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
        <div ref={host} className="vr-host" aria-hidden />
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
  const yt = useYouTubeEngine({ videoId: mode === "youtube" ? ytId : "", startAt: settings.musicStart, autoStart, host, onFail, songs });

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
          {audioOnly ? (
            <SpiritRadioDock api={api} videoId={ytId} host={host} overSheet={overSheet} dockBase={dockBase} songs={songs} muted={yt.muted} onMute={yt.toggleMute} />
          ) : (
            <YouTubeDock api={api} videoId={ytId} host={host} dark={dark} overSheet={overSheet} dockBase={dockBase} />
          )}
          <style>{DOCK_CSS}</style>
          {audioOnly && <style>{RADIO_CSS}</style>}
        </>
      )}
    </DayMusicContext.Provider>
  );
}
