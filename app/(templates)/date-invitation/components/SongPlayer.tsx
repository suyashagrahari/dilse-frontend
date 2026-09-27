"use client";

// ─── Their song ──────────────────────────────────────────────────────────────
//
// A spinning record in the corner that starts playing as soon as the page
// opens. Browsers only allow sound after a tap, so it tries three things in
// order:
//
//   1. play with sound straight away — works whenever the visitor already
//      tapped on the site this visit (e.g. opened the template from the
//      gallery, or tapped a link inside the app);
//   2. otherwise play muted (always allowed) and show "tap for sound";
//   3. the very first tap or key press ANYWHERE on the page then unmutes it.
//
// The YouTube player itself is the record's label, so it is never hidden.

import { useCallback, useEffect, useRef, useState } from "react";

import { loadYouTubeApi } from "../../dedication/components/ytPlayer";
import { GRAD, GROTESK, MOON } from "./dateTheme";

interface Player {
  playVideo(): void;
  pauseVideo(): void;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  setVolume(v: number): void;
  seekTo(s: number, a: boolean): void;
  getPlayerState(): number;
  destroy(): void;
}

const PLAYING = 1;
const ENDED = 0;

export default function SongPlayer({
  songId,
  title,
  lift,
  reduceMotion,
}: {
  songId: string;
  title: string;
  /** Extra bottom offset so the record clears the demo nudge. */
  lift: number;
  reduceMotion: boolean;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showTitle, setShowTitle] = useState(true);
  const [failed, setFailed] = useState(false);

  // Build the player once per song.
  useEffect(() => {
    if (!songId) return;
    let cancelled = false;
    let checkTimer = 0;
    const mount = document.createElement("div");
    hostRef.current?.appendChild(mount);

    void loadYouTubeApi().then((YT) => {
      if (cancelled || !YT) {
        if (!YT) setFailed(true);
        return;
      }
      const p = new YT.Player(mount, {
        width: 200,
        height: 200,
        videoId: songId,
        playerVars: { autoplay: 1, controls: 0, disablekb: 1, fs: 0, playsinline: 1, rel: 0, origin: window.location.origin },
        events: {
          onReady: (e) => {
            const pl = e.target as unknown as Player;
            playerRef.current = pl;
            setReady(true);
            pl.setVolume(80);
            pl.playVideo();
            // No sound allowed yet? Fall back to muted play; the first tap unmutes.
            checkTimer = window.setTimeout(() => {
              const st = pl.getPlayerState();
              if (st !== PLAYING && st !== 3 /* buffering */) {
                pl.mute();
                pl.playVideo();
                setMuted(true);
              }
            }, 1300);
          },
          onStateChange: (e) => {
            if (e.data === PLAYING) setPlaying(true);
            else if (e.data === ENDED) {
              // Loop the song for as long as the page is open.
              (e.target as unknown as Player).seekTo(0, true);
              (e.target as unknown as Player).playVideo();
            } else if (e.data === 2) setPlaying(false);
          },
          onError: () => setFailed(true),
        },
      }) as unknown as Player;
      playerRef.current = p;
    });

    const hide = window.setTimeout(() => setShowTitle(false), 6000);
    return () => {
      cancelled = true;
      window.clearTimeout(checkTimer);
      window.clearTimeout(hide);
      try {
        playerRef.current?.destroy();
      } catch {
        /* already gone */
      }
      playerRef.current = null;
      mount.remove();
    };
  }, [songId]);

  // The first gesture anywhere turns the sound on.
  useEffect(() => {
    if (!muted) return;
    const unmute = () => {
      const p = playerRef.current;
      if (!p) return;
      p.unMute();
      p.setVolume(80);
      p.playVideo();
      setMuted(false);
    };
    window.addEventListener("pointerdown", unmute, { once: true, capture: true });
    window.addEventListener("keydown", unmute, { once: true, capture: true });
    return () => {
      window.removeEventListener("pointerdown", unmute, { capture: true });
      window.removeEventListener("keydown", unmute, { capture: true });
    };
  }, [muted]);

  const toggle = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    if (muted) return; // the capture listener above already unmuted on this tap
    if (playing) {
      p.pauseVideo();
      setPlaying(false);
    } else {
      p.playVideo();
    }
    setShowTitle(true);
    window.setTimeout(() => setShowTitle(false), 3500);
  }, [muted, playing]);

  if (!songId || failed) return null;

  const spinning = playing && !reduceMotion;

  return (
    <div
      style={{
        position: "fixed",
        right: 14,
        bottom: `calc(${18 + lift}px + env(safe-area-inset-bottom, 0px))`,
        zIndex: 125,
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexDirection: "row-reverse",
        pointerEvents: "none",
      }}
    >
      <style>{`@keyframes di-vinyl { to { transform: rotate(360deg) } }`}</style>
      <button
        type="button"
        onClick={toggle}
        aria-label={playing && !muted ? `Pause ${title}` : `Play ${title}`}
        style={{
          pointerEvents: "auto",
          position: "relative",
          width: 58,
          height: 58,
          borderRadius: "50%",
          border: "2px solid rgba(255,255,255,.2)",
          padding: 0,
          cursor: "pointer",
          background: "repeating-radial-gradient(circle at 50% 50%, #1a1a1a 0 2px, #0c0c0c 2px 4px)",
          boxShadow: "0 14px 30px -10px rgba(0,0,0,.8), 0 0 0 4px rgba(255,79,139,.18)",
          overflow: "hidden",
          animation: spinning ? "di-vinyl 4s linear infinite" : "none",
        }}
      >
        {/* The label is the live YouTube player, scaled into the middle. */}
        <span
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 30,
            height: 30,
            marginLeft: -15,
            marginTop: -15,
            borderRadius: "50%",
            overflow: "hidden",
            background: GRAD,
            pointerEvents: "none",
          }}
        >
          <div
            ref={hostRef}
            style={{ width: 200, height: 200, transform: "scale(.26)", transformOrigin: "0 0", marginLeft: -11, marginTop: -11 }}
          />
        </span>
        <span
          aria-hidden
          style={{ position: "absolute", left: "50%", top: "50%", width: 6, height: 6, margin: -3, borderRadius: "50%", background: "#12081f" }}
        />
      </button>

      {(showTitle || muted || !ready) && (
        <span
          className={reduceMotion ? "" : "di-pop-in"}
          style={{
            pointerEvents: "auto",
            maxWidth: "min(58vw, 260px)",
            padding: "8px 14px",
            borderRadius: 999,
            background: muted ? "#d8ff5c" : "rgba(18,8,31,.8)",
            color: muted ? "#1a0d26" : MOON,
            border: muted ? "none" : "1px solid rgba(255,255,255,.16)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            fontFamily: GROTESK,
            fontSize: 12.5,
            fontWeight: 700,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            boxShadow: "0 10px 24px -12px rgba(0,0,0,.7)",
          }}
        >
          {muted ? "🔊 tap anywhere for our song" : !ready ? "🎵 loading our song…" : `🎵 ${title || "our song"}`}
        </span>
      )}
    </div>
  );
}
