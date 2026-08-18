"use client";

// ─── The player ──────────────────────────────────────────────────────────────
//
// The embed is driven by the shared controller in
// `app/(templates)/dedication/components/ytPlayer.ts`. Nothing here wraps,
// shadows or re-implements it: this file owns the PAGE's relationship to the
// player — poster, phases, the chapter clock, the end screen, the took-it-down
// card — and every call into the embed goes through that one controller.
//
// ── THE CLOCK IS THE PART THAT LEAKS ─────────────────────────────────────────
//
// One interval, 500ms, and it exists ONLY while playback is actually running.
// It is cleared when playback pauses, when the video ends, when the tab is
// hidden, and when this component unmounts — all four, all in one effect whose
// cleanup closes over everything it created. Nothing else on this page starts a
// repeating timer that outlives its own phase.
//
// It also does not start on `create()`. An ad may run first, and a chapter
// highlight tracking an advert's clock is worse than no highlight, so the clock
// waits for `waitForRealPlayback` to confirm the video itself is advancing.
//
// ── STARTING ─────────────────────────────────────────────────────────────────
//
// The page opens PAUSED with the still frame up. The recipient's tap on it is
// the user gesture, and the controller is constructed inside that handler, so
// there is no autoplay unlock to negotiate and no muted-first compromise.
//
// The controller mutes on ready by design (its own template fades in). We undo
// that as soon as it reports ready — see `VOLUME_NUDGE_MS` — because on this
// page the sound is the gift.

import { useCallback, useEffect, useRef, useState } from "react";
import {
  YtController,
  loadYouTubeApi,
  type YtFailure,
} from "@/app/(templates)/dedication/components/ytPlayer";
import { formatTimestamp, type RelatedVideo, type WatchDescription } from "./types";
import {
  FONT,
  SERIF,
  PauseGlyph,
  PlayGlyph,
  ReplayGlyph,
  SafeImage,
  StartGlyph,
  T,
  ThumbFallback,
  posterUrls,
} from "./theme";

export type PlayerPhase = "poster" | "starting" | "playing" | "paused" | "ended" | "failed";

export interface WatchPlayer {
  /**
   * A callback ref for the element the embed mounts into.
   *
   * A callback rather than a `RefObject` on purpose: this object is read all
   * over the render tree, and an object carrying a ref is an object every
   * reader has to be careful with.
   */
  setHost: (el: HTMLDivElement | null) => void;
  phase: PlayerPhase;
  /** Seconds into the CURRENT video. Only moves while the clock is running. */
  currentTime: number;
  /**
   * What we have learned about the length of the current video, or 0.
   *
   * The shared controller does not expose `getDuration`, and this file is not
   * allowed to reach past it for one, so the length is LEARNED: the furthest
   * point playback has reached, promoted to a real duration the moment the
   * video ends. Chapter seeks clamp against it — see `seekTo`.
   */
  duration: number;
  failure: YtFailure | null;
  /** The user gesture. Constructs the player and starts it. */
  start: (atSeconds?: number) => void;
  toggle: () => void;
  /** Seek AND play. What a chapter timestamp does. */
  seekTo: (seconds: number) => void;
  /** Swap the loaded video without tearing the player down. */
  loadVideo: (videoId: string) => void;
  replay: () => void;
}

/** How long we keep re-asserting full volume after the controller reports ready. */
const VOLUME_NUDGE_MS = 1200;
/** Buffering reports "not playing". Three samples before we believe a pause. */
const PAUSE_CONFIRM_TICKS = 3;

export function useWatchPlayer(initialVideoId: string): WatchPlayer {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const ctrlRef = useRef<YtController | null>(null);
  const videoIdRef = useRef(initialVideoId);
  const maxSeenRef = useRef(0);
  const aliveRef = useRef(true);

  const [phase, setPhase] = useState<PlayerPhase>("poster");
  /**
   * The phase, readable from a callback without listing it as a dependency.
   * Written after commit only — never read while rendering.
   */
  const phaseRef = useRef<PlayerPhase>("poster");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [failure, setFailure] = useState<YtFailure | null>(null);

  /**
   * The video id the state above belongs to.
   *
   * When the sender pastes a new link mid-edit, `initialVideoId` changes but
   * every piece of playback state still describes the OLD video. Rather than
   * writing four resets from an effect — which is a cascade of renders and a
   * lint error besides — the mismatch is simply DERIVED below: a phase that
   * belongs to another video reads as "poster", which is exactly what it is.
   */
  const [ownerId, setOwnerId] = useState(initialVideoId);
  const fresh = ownerId === initialVideoId;

  useEffect(() => {
    phaseRef.current = phase;
  });

  // A new id means the live player is playing the wrong thing. Tearing it down
  // is a call into an external system and nothing else — no state is written
  // here, because the render above has already worked out what to show.
  useEffect(() => {
    if (videoIdRef.current === initialVideoId) return;
    videoIdRef.current = initialVideoId;
    maxSeenRef.current = 0;
    ctrlRef.current?.destroy();
    ctrlRef.current = null;
  }, [initialVideoId]);

  // The 60kB API script is fetched on mount, not inside the gesture: by the
  // time the tap happens the gesture is spent and there is no second one.
  useEffect(() => {
    aliveRef.current = true;
    void loadYouTubeApi();
    return () => {
      aliveRef.current = false;
      ctrlRef.current?.destroy();
      ctrlRef.current = null;
    };
  }, []);

  /** Undo the controller's deliberate mute-on-ready, as soon as it is ready. */
  useEffect(() => {
    if (phase !== "starting") return;
    let timer: number | null = null;
    const started = Date.now();
    timer = window.setInterval(() => {
      const ctrl = ctrlRef.current;
      if (!ctrl) return;
      if (ctrl.isReady) ctrl.setVolume(100);
      if (Date.now() - started > VOLUME_NUDGE_MS && ctrl.isReady) {
        if (timer !== null) window.clearInterval(timer);
        timer = null;
      }
    }, 120);
    return () => {
      if (timer !== null) window.clearInterval(timer);
    };
  }, [phase]);

  // ── The chapter clock ──────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "playing") return;
    if (typeof document === "undefined") return;

    let timer: number | null = null;
    let quiet = 0;

    const stop = () => {
      if (timer === null) return;
      window.clearInterval(timer);
      timer = null;
    };

    const tick = () => {
      const ctrl = ctrlRef.current;
      if (!ctrl) {
        stop();
        return;
      }
      const t = ctrl.currentTime();
      setCurrentTime(t);
      if (t > maxSeenRef.current) maxSeenRef.current = t;

      if (ctrl.isPlaying()) {
        quiet = 0;
        return;
      }
      quiet += 1;
      if (quiet >= PAUSE_CONFIRM_TICKS) {
        stop();
        setPhase((p) => (p === "playing" ? "paused" : p));
      }
    };

    const start = () => {
      if (timer !== null) return;
      timer = window.setInterval(tick, 500);
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        stop();
        return;
      }
      tick();
      start();
    };

    // A page restored into a background tab must not start a timer at all.
    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [phase]);

  /** Confirm real playback, then hand the clock its cue. */
  const awaitPlayback = useCallback((ctrl: YtController) => {
    void ctrl.waitForRealPlayback(9000).then((ok) => {
      if (!aliveRef.current || ctrlRef.current !== ctrl) return;
      ctrl.setVolume(100);
      if (ok || ctrl.isPlaying()) setPhase("playing");
    });
  }, []);

  const build = useCallback(
    (atSeconds?: number) => {
      const host = hostRef.current;
      if (!host) return;

      setOwnerId(videoIdRef.current);
      const ctrl = new YtController({
        onFailure: (why) => {
          if (!aliveRef.current) return;
          setFailure(why);
          setPhase("failed");
        },
        onEnded: () => {
          if (!aliveRef.current) return;
          // The one moment the real length is knowable through this surface.
          setDuration((d) => Math.max(d, maxSeenRef.current));
          setPhase("ended");
        },
        log: () => {
          /* the page shows the failure card; the console adds nothing here */
        },
      });
      ctrlRef.current = ctrl;
      setFailure(null);
      setPhase("starting");

      const ok = ctrl.create(host, videoIdRef.current, atSeconds);
      if (!ok) return;
      awaitPlayback(ctrl);
    },
    [awaitPlayback],
  );

  const start = useCallback(
    (atSeconds?: number) => {
      const ctrl = ctrlRef.current;
      if (!ctrl) {
        build(atSeconds);
        return;
      }
      if (typeof atSeconds === "number") ctrl.seek(atSeconds);
      ctrl.play();
      ctrl.setVolume(100);
      setPhase("playing");
    },
    [build],
  );

  const toggle = useCallback(() => {
    const ctrl = ctrlRef.current;
    if (!ctrl) {
      build();
      return;
    }
    if (phaseRef.current === "playing") {
      ctrl.pause();
      setPhase("paused");
      return;
    }
    ctrl.play();
    ctrl.setVolume(100);
    setPhase("playing");
  }, [build]);

  const seekTo = useCallback(
    (seconds: number) => {
      // A chapter past the end of the video is authored data, not corruption:
      // the sender trimmed the cut after writing the timestamps. Land just
      // inside the end rather than throwing the player at nothing.
      const known = Math.max(duration, maxSeenRef.current);
      const target =
        known > 1 && seconds >= known ? Math.max(0, Math.floor(known) - 1) : Math.max(0, Math.floor(seconds));

      setCurrentTime(target);
      const ctrl = ctrlRef.current;
      if (!ctrl) {
        build(target);
        return;
      }
      ctrl.seek(target);
      ctrl.play();
      ctrl.setVolume(100);
      setPhase("playing");
    },
    [build, duration],
  );

  const loadVideo = useCallback(
    (videoId: string) => {
      videoIdRef.current = videoId;
      maxSeenRef.current = 0;
      setOwnerId(videoId);
      setCurrentTime(0);
      setDuration(0);
      setFailure(null);

      const ctrl = ctrlRef.current;
      if (!ctrl) {
        build();
        return;
      }
      setPhase("starting");
      ctrl.loadSong(videoId, 0);
      ctrl.setVolume(100);
      awaitPlayback(ctrl);
    },
    [awaitPlayback, build],
  );

  const replay = useCallback(() => {
    const ctrl = ctrlRef.current;
    maxSeenRef.current = 0;
    setCurrentTime(0);
    if (!ctrl) {
      build(0);
      return;
    }
    ctrl.seek(0);
    ctrl.play();
    ctrl.setVolume(100);
    setPhase("playing");
  }, [build]);

  const setHost = useCallback((el: HTMLDivElement | null) => {
    hostRef.current = el;
  }, []);

  return {
    setHost,
    // Derived, not reset: state belonging to a previous video reads as an
    // untouched poster for the new one.
    phase: fresh ? phase : "poster",
    currentTime: fresh ? currentTime : 0,
    duration: fresh ? duration : 0,
    failure: fresh ? failure : null,
    start,
    toggle,
    seekTo,
    loadVideo,
    replay,
  };
}

/* ── The frame ─────────────────────────────────────────────────────────────── */

export interface PlayerFrameProps {
  player: WatchPlayer;
  videoId: string;
  title: string;
  /** Read out on the took-it-down card, so the words survive the video. */
  description: WatchDescription;
  /** Two of these are offered on the end screen. */
  related: readonly RelatedVideo[];
  onPickRelated: (item: RelatedVideo) => void;
  /** The chapter label under the transport row, or "". */
  nowLabel: string;
}

export default function PlayerFrame({
  player,
  videoId,
  title,
  description,
  related,
  onPickRelated,
  nowLabel,
}: PlayerFrameProps) {
  // Destructured up front: `setHost` is the only ref-ish thing in here and
  // pulling it out keeps the rest of the player's surface plain values.
  const { setHost, phase, currentTime, start, toggle, replay } = player;

  const [poster, posterAlt] = posterUrls(videoId);
  const showPoster = phase === "poster";
  const gone = phase === "failed";
  const ended = phase === "ended";
  const endCards = related.slice(0, 2);

  return (
    <section>
      <div className="wt-frame">
        {/*
          The embed's own element. Mounted at its natural size and left alone —
          the controller sizes it 100%/100% and nothing on this page ever hides
          it, crops it, or scales it away.
        */}
        <div ref={setHost} className="wt-host" />

        {showPoster ? (
          <button
            type="button"
            className="wt-poster"
            onClick={() => start()}
            aria-label={`Play: ${title}`}
          >
            <SafeImage
              src={poster}
              altSrc={posterAlt}
              alt=""
              crossOrigin="anonymous"
              fallback={<ThumbFallback radius={12} />}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
            <span className="wt-poster-mark">
              <StartGlyph size={68} color={T.ink} />
            </span>
          </button>
        ) : null}

        {phase === "starting" ? (
          <span className="wt-loading" aria-live="polite">
            Loading…
          </span>
        ) : null}

        {ended ? (
          // A scrim over the FRAME, held clear of the bottom strip so nothing
          // of the player's own furniture is covered by it.
          <div className="wt-endscreen">
            <p className="wt-end-title">That&apos;s the whole thing.</p>
            <div className="wt-end-cards">
              {endCards.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="wt-end-card"
                  onClick={() => onPickRelated(item)}
                >
                  <span className="wt-end-thumb">
                    <SafeImage
                      src={item.thumbnailUrl}
                      alt=""
                      fallback={<ThumbFallback radius={6} />}
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </span>
                  <span className="wt-end-card-title">{item.title}</span>
                </button>
              ))}
            </div>
            <button type="button" className="wt-end-replay" onClick={replay}>
              <ReplayGlyph size={18} color={T.ink} />
              Watch it again
            </button>
          </div>
        ) : null}

        {gone ? (
          <div className="wt-gone" role="status">
            <p className="wt-gone-title">this one got taken down. here is what it was about</p>
            <div className="wt-gone-body">
              {description.intro.map((p, i) => (
                <p key={`gi-${i}`}>{p}</p>
              ))}
              {description.outro.map((p, i) => (
                <p key={`go-${i}`} style={{ fontFamily: SERIF }}>
                  {p}
                </p>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/*
        Our transport, BELOW the frame rather than over it. The embed's own
        furniture is never covered by anything this page draws.
      */}
      <div className="wt-transport">
        <button
          type="button"
          className="wt-transport-btn"
          onClick={phase === "ended" ? replay : toggle}
          aria-label={phase === "playing" ? "Pause" : "Play"}
        >
          {phase === "playing" ? (
            <PauseGlyph size={18} color={T.ink} />
          ) : phase === "ended" ? (
            <ReplayGlyph size={18} color={T.ink} />
          ) : (
            <PlayGlyph size={18} color={T.ink} />
          )}
        </button>
        <span className="wt-transport-time">{formatTimestamp(currentTime)}</span>
        {nowLabel ? <span className="wt-transport-now">{nowLabel}</span> : null}
      </div>
    </section>
  );
}

export const PLAYER_CSS = `
.wt-frame {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000000;
  border-radius: 12px;
  overflow: hidden;
}
.wt-host { position: absolute; inset: 0; }
.wt-host iframe { width: 100%; height: 100%; border: 0; display: block; }
.wt-poster {
  position: absolute; inset: 0; padding: 0; border: 0; cursor: pointer;
  background: #000000; display: block; overflow: hidden;
}
.wt-poster-mark {
  position: absolute; inset: 0; display: grid; place-items: center;
  transition: transform 220ms ease;
}
.wt-poster:hover .wt-poster-mark { transform: scale(1.06); }
.wt-loading {
  position: absolute; left: 12px; bottom: 10px;
  font-family: ${FONT}; font-size: 12px; color: ${T.inkSoft};
  background: rgba(0,0,0,0.55); padding: 4px 9px; border-radius: 999px;
}
.wt-endscreen {
  position: absolute; left: 0; right: 0; top: 0; bottom: 46px;
  background: ${T.scrim};
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12px; padding: 12px; text-align: center;
  animation: wt-fade 240ms ease-out both;
}
.wt-end-title { margin: 0; font-family: ${FONT}; font-size: 14px; color: ${T.inkSoft}; }
.wt-end-cards { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
.wt-end-card {
  width: 150px; border: 0; background: transparent; padding: 0; cursor: pointer;
  text-align: left; display: flex; flex-direction: column; gap: 6px;
}
.wt-end-thumb {
  position: relative; display: block; width: 100%; aspect-ratio: 16 / 9;
  border-radius: 6px; overflow: hidden; background: ${T.chip};
}
.wt-end-card-title {
  font-family: ${FONT}; font-size: 12px; line-height: 16px; color: ${T.ink};
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.wt-end-replay {
  display: inline-flex; align-items: center; gap: 8px; height: 36px; padding: 0 16px;
  border-radius: 18px; border: 1px solid ${T.line}; background: ${T.chip};
  color: ${T.ink}; font-family: ${FONT}; font-size: 14px; font-weight: 500; cursor: pointer;
}
.wt-gone {
  position: absolute; inset: 0; background: ${T.raised};
  padding: 18px; overflow-y: auto; text-align: left;
}
.wt-gone-title {
  margin: 0 0 10px; font-family: ${FONT}; font-size: 15px; font-weight: 700;
  color: ${T.accent}; line-height: 20px;
}
.wt-gone-body p {
  margin: 0 0 8px; font-family: ${FONT}; font-size: 13px; line-height: 19px;
  color: ${T.inkSoft}; overflow-wrap: anywhere;
}
.wt-transport {
  display: flex; align-items: center; gap: 10px; margin-top: 8px; min-height: 32px;
}
.wt-transport-btn {
  width: 32px; height: 32px; flex: none; border-radius: 50%; border: 0;
  background: ${T.chip}; color: ${T.ink}; display: grid; place-items: center; cursor: pointer;
}
.wt-transport-time {
  font-family: ${FONT}; font-size: 12px; color: ${T.inkSoft};
  font-variant-numeric: tabular-nums; flex: none;
}
.wt-transport-now {
  font-family: ${FONT}; font-size: 12px; color: ${T.ink};
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;
}
@keyframes wt-fade { from { opacity: 0 } to { opacity: 1 } }
@media (prefers-reduced-motion: reduce) {
  .wt-endscreen { animation: none; }
  .wt-poster:hover .wt-poster-mark { transform: none; }
  .wt-poster-mark { transition: none; }
}
`;
