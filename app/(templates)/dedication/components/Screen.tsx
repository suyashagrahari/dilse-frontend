"use client";

// ─── The screen — a full 16:9 picture tube set into the radio ────────────────
//
// Replaces the old 140x80 player panel. Three things can own it:
//
//   song   the official YouTube IFrame player, full size and fully visible
//   clip   one of the sender's own uploaded videos, in a plain <video>
//   voice  a slow Ken Burns slideshow of their photos with the ON AIR bars,
//          while the RJ (the sender) talks
//
// COMPLIANCE: while a song is on air nothing is drawn over the YouTube player.
// It is only covered while it is muted at volume 0 (voice segments and clips),
// i.e. never used as an audio source behind a cover.
//
// The YouTube host is created imperatively (the IFrame API REPLACES the node it
// is given, which React must never own) — same pattern as the old PlayerPanel.

import { useCallback, useEffect, useState } from "react";
import { Play, Mic } from "lucide-react";
import { BODY_FACE, DISPLAY_FACE, PALETTE, cropStyle, photoCrop, type Photo } from "./types";
import { amberGlow } from "./radioStyles";

export interface ScreenProps {
  onHost: (el: HTMLElement | null) => void;
  onClipEl: (el: HTMLVideoElement | null) => void;
  onPlayBlocked: () => void;
  photos: Photo[];
  phase: "tuning" | "locked" | "playing" | "signoff";
  kind: "voice" | "song" | "clip" | null;
  songActive: boolean;
  clipActive: boolean;
  clipBlocked: boolean;
  bridging: boolean;
  /** The segment's YouTube id — empty means a song slot with no link. */
  songHasVideo: boolean;
  songTitle: string;
  songArtist: string;
  clipPoster?: string;
  senderName: string;
  caption: string;
  reduced: boolean;
}

const STATIC_BG =
  "repeating-radial-gradient(circle at 17% 32%, rgba(255,255,255,.07) 0 1px, transparent 1px 3px), repeating-radial-gradient(circle at 73% 61%, rgba(255,255,255,.06) 0 1px, transparent 1px 4px), repeating-linear-gradient(0deg, rgba(255,255,255,.04) 0 1px, transparent 1px 3px)";

export default function Screen(p: ScreenProps) {
  const attachSlot = useCallback(
    (el: HTMLDivElement | null) => {
      if (!el) {
        p.onHost(null);
        return;
      }
      // Strict Mode attaches twice in development; start from empty each time.
      el.replaceChildren();
      const host = document.createElement("div");
      host.style.width = "100%";
      host.style.height = "100%";
      host.style.display = "block";
      el.appendChild(host);
      p.onHost(host);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [p.onHost],
  );

  // Slideshow index for the voice / no-video states.
  const [slide, setSlide] = useState(0);
  const photoCount = p.photos.length;
  useEffect(() => {
    if (photoCount < 2 || p.reduced) return;
    const id = window.setInterval(() => setSlide((s) => (s + 1) % photoCount), 4500);
    return () => window.clearInterval(id);
  }, [photoCount, p.reduced]);

  const tuning = p.phase === "tuning";
  const showSong = p.songActive && p.songHasVideo && !p.bridging;
  const showClip = p.clipActive;
  // Everything that is not a live song or clip gets the photo slideshow.
  const showSlides = !tuning && !showSong && !showClip;
  const voiceOnAir = p.kind === "voice" && !p.bridging;
  const songNoVideo = p.songActive && !p.songHasVideo && !p.bridging;

  return (
    <div
      className="relative w-full"
      style={{
        borderRadius: 12,
        padding: 5,
        background: `linear-gradient(160deg, ${PALETTE.chrome}, ${PALETTE.chromeDark} 55%, #56524c)`,
        boxShadow: "0 6px 16px -4px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.55)",
      }}
    >
      <div
        className="relative w-full overflow-hidden"
        style={{ borderRadius: 8, aspectRatio: "16 / 9", background: "#050403", boxShadow: "inset 0 0 0 1px rgba(0,0,0,.8)" }}
      >
        {/* 0 ── static, always underneath */}
        <div
          aria-hidden
          className="absolute inset-0 z-0"
          data-ded-motion
          style={{
            backgroundImage: STATIC_BG,
            backgroundSize: "100px 60px, 90px 70px, auto",
            animation: p.reduced ? "none" : "dedStatic .35s steps(4) infinite",
          }}
        />

        {/* 10 ── the YouTube player host */}
        <div ref={attachSlot} className="absolute inset-0 z-10" data-ded-player-slot />

        {/* 20 ── the sender's own video */}
        <video
          ref={p.onClipEl}
          className="absolute inset-0 z-20 w-full h-full"
          style={{
            objectFit: "contain",
            background: "#000",
            opacity: showClip ? 1 : 0,
            pointerEvents: showClip ? "auto" : "none",
            transition: "opacity 500ms ease",
          }}
          poster={p.clipPoster}
          playsInline
          muted
          preload="metadata"
        />

        {/* 30 ── photo slideshow (voice segments, bridges, no-link songs) */}
        <div
          className="absolute inset-0 z-30"
          style={{ opacity: showSlides ? 1 : 0, transition: "opacity 700ms ease", pointerEvents: "none" }}
          aria-hidden={!showSlides}
        >
          <div className="absolute inset-0" style={{ background: "#0b0604" }} />
          {p.photos.map((ph, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${ph.url}-${i}`}
              src={ph.url}
              alt=""
              loading="lazy"
              decoding="async"
              draggable={false}
              className="absolute inset-0"
              style={{
                ...cropStyle(photoCrop(ph)),
                opacity: i === slide % Math.max(1, photoCount) ? 1 : 0,
                transition: "opacity 1200ms ease",
                // Ken Burns only on photos the sender didn't zoom themselves —
                // the animation owns `transform`, which is where their zoom lives.
                animation:
                  p.reduced || !showSlides || (ph.scale ?? 100) > 100 ? "none" : "dedKen 9s ease-out infinite alternate",
                filter: "saturate(.92) contrast(1.02)",
              }}
            />
          ))}
          {/* warm scanlines + vignette so photos read as "on the tube" */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "repeating-linear-gradient(0deg, rgba(0,0,0,.14) 0 1px, transparent 1px 3px), radial-gradient(120% 90% at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,.65) 100%), linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(10,4,2,.82) 100%)",
            }}
          />

          {voiceOnAir && (
            <div className="absolute flex items-end gap-2.5" style={{ left: 12, right: 12, bottom: 10 }}>
              <span
                className="grid place-items-center rounded-full shrink-0"
                style={{ width: 30, height: 30, background: PALETTE.red, boxShadow: `0 0 14px ${PALETTE.red}` }}
              >
                <Mic size={15} color="#fff" />
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className="text-[9px] font-bold uppercase"
                  style={{ fontFamily: BODY_FACE, letterSpacing: ".22em", color: "#ffd9c9" }}
                >
                  on air · {p.senderName ? `${p.senderName} speaking` : "a message for you"}
                </p>
                {p.caption && (
                  <p
                    className="text-[12px] leading-snug mt-0.5"
                    style={{
                      fontFamily: BODY_FACE,
                      color: "#fff",
                      textShadow: "0 1px 6px rgba(0,0,0,.9)",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {p.caption}
                  </p>
                )}
              </div>
              <Bars reduced={p.reduced} />
            </div>
          )}

          {songNoVideo && (
            <div className="absolute" style={{ left: 12, right: 12, bottom: 12 }}>
              <p
                className="text-[9px] font-bold uppercase"
                style={{ fontFamily: BODY_FACE, letterSpacing: ".22em", color: PALETTE.amber }}
              >
                now playing
              </p>
              <p className="text-[15px] font-bold truncate" style={{ fontFamily: BODY_FACE, color: "#fff" }}>
                {p.songTitle || "your song"}
                {p.songArtist && <span className="font-normal opacity-75"> — {p.songArtist}</span>}
              </p>
            </div>
          )}
        </div>

        {/* 40 ── tuning: NO SIGNAL over the static */}
        {tuning && (
          <div className="absolute inset-0 z-40 grid place-items-center pointer-events-none">
            {p.photos[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.photos[0].url}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                style={{ opacity: 0.16, filter: "blur(3px) grayscale(.8)" }}
              />
            )}
            <div className="relative text-center">
              <p
                className="text-[13px] font-bold uppercase"
                data-ded-motion
                style={{
                  fontFamily: DISPLAY_FACE,
                  letterSpacing: ".3em",
                  color: PALETTE.amber,
                  textShadow: amberGlow(0.8),
                  animation: p.reduced ? "none" : "dedBlink 1.6s ease-in-out infinite",
                }}
              >
                no signal
              </p>
              <p className="text-[10px] mt-1.5" style={{ fontFamily: BODY_FACE, color: "rgba(232,220,192,.6)" }}>
                tune the dial to start the show
              </p>
            </div>
          </div>
        )}

        {/* 50 ── a clip the browser refused to start with sound */}
        {showClip && p.clipBlocked && (
          <button
            type="button"
            onClick={p.onPlayBlocked}
            className="absolute inset-0 z-50 grid place-items-center"
            style={{ background: "rgba(0,0,0,.45)" }}
            aria-label="Play the video"
          >
            <span
              className="grid place-items-center rounded-full"
              style={{ width: 64, height: 64, background: PALETTE.red, boxShadow: `0 0 24px ${PALETTE.red}` }}
            >
              <Play size={28} color="#fff" fill="#fff" />
            </span>
          </button>
        )}

        {/* tube glass: a curved highlight over everything, never blocking taps */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 60,
            borderRadius: 8,
            background: "radial-gradient(140% 100% at 30% 0%, rgba(255,255,255,.10), rgba(255,255,255,0) 42%)",
            boxShadow: "inset 0 0 28px rgba(0,0,0,.55)",
          }}
        />

        {/* LIVE bug, top-left, whenever a picture is live */}
        {!tuning && p.phase !== "signoff" && (showSong || showClip || voiceOnAir) && (
          <span
            className="absolute inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-bold uppercase pointer-events-none"
            style={{ top: 8, left: 8, zIndex: 61, borderRadius: 4, fontFamily: BODY_FACE, letterSpacing: ".18em", background: "rgba(0,0,0,.55)", color: "#fff" }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: PALETTE.red }} />
            {showClip ? "our video" : showSong ? "live" : "on air"}
          </span>
        )}
      </div>
    </div>
  );
}

function Bars({ reduced }: { reduced: boolean }) {
  return (
    <span className="flex items-end shrink-0" style={{ gap: 3, height: 20 }} aria-hidden>
      {[0.1, 0.35, 0.2, 0.5, 0.05].map((d, i) => (
        <span
          key={i}
          className="h-full rounded-full"
          data-ded-motion
          style={{
            width: 3,
            transformOrigin: "bottom",
            background: "#fff",
            animation: reduced ? "none" : `dedPulse ${0.7 + i * 0.12}s ease-in-out ${d}s infinite`,
          }}
        />
      ))}
    </span>
  );
}
