"use client";

// ─── Proposal — the music dock ───────────────────────────────────────────────
//
// Bottom-right, fixed, and the only music control on the page.
//
// ── WHY BOTTOM-RIGHT AND NOT TOP-LEFT ───────────────────────────────────────
//
// It used to be top-left, to keep it away from the dodging "No" button. That
// solved the collision by putting the control in the corner people look at
// least, at a size (42px) that is under the 44px touch minimum once you account
// for the rounded corners. Bottom-right is where a thumb already rests on a
// phone and where players live on the web generally.
//
// The collision is handled properly instead: this element carries `id` =
// DOCK_ID, and TheAsk reads its rect and treats it as forbidden ground exactly
// the way it already treats the YES button. One element to avoid, measured
// rather than assumed, so moving this dock again cannot strand the No button
// underneath it.
//
// ── SIZE ────────────────────────────────────────────────────────────────────
//
// 52px on a phone, 64px on a desktop, and on a desktop it is a pill that also
// prints the track name. A desktop pointer is precise but a desktop viewport is
// enormous, and a 42px circle in the corner of a 1440px page is a speck.
//
// ── THE YOUTUBE PANEL ───────────────────────────────────────────────────────
//
// When the sender pasted a YouTube link, the real IFrame player renders here,
// visibly, above the button. That is not a design preference: the IFrame API
// terms require the player to stay visible and not be covered or shrunk away,
// and "play the audio with the video hidden" is precisely what they forbid.
// See the compliance note in ./music.
//
// So the video is present and honest, and simply small and out of the way. It
// can be collapsed to its title bar by the viewer — a viewer-initiated collapse
// pauses nothing and hides nothing that was not already their choice — but the
// page never hides it on their behalf while it is playing.

import { useState } from "react";
import type { BuiltInTrack } from "./music";
import { DISPLAY, INK, INK_SOFT, PINK_DEEP } from "./theme";

/** TheAsk reads this element's rect so the No button can never hide behind it. */
export const DOCK_ID = "ps-music-dock";

function SpeakerOn() {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" aria-hidden>
      <path
        d="M4 9.5h3.2L11.5 6v12L7.2 14.5H4z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M15.2 9.2a4 4 0 0 1 0 5.6M17.8 6.6a7.6 7.6 0 0 1 0 10.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SpeakerOff() {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" aria-hidden>
      <path
        d="M4 9.5h3.2L11.5 6v12L7.2 14.5H4z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M15.5 9.5l5 5m0-5l-5 5"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Props are spelled out rather than taking the whole audio object.
 *
 * `react-hooks/refs` treats a value returned from a hook that carries callback
 * refs as ref-bearing, and reading any field off it during render is an error —
 * the audio hook's own doc comment warns about exactly this. Destructuring at
 * the call site is the documented way out, so the boundary is individual props.
 */
export default function MusicDock({
  started,
  muted,
  mode,
  track,
  onToggleMute,
  attachYouTube,
}: {
  started: boolean;
  muted: boolean;
  mode: "builtin" | "file" | "youtube";
  track: BuiltInTrack | null;
  onToggleMute: () => void;
  attachYouTube: (el: HTMLDivElement | null) => void;
}) {
  const [open, setOpen] = useState(true);
  if (!started) return null;

  const isYouTube = mode === "youtube";
  const name =
    mode === "builtin"
      ? `${track?.emoji ?? "🎵"} ${track?.label ?? "Music"}`
      : mode === "youtube"
        ? "🎬 Your song"
        : "🎵 Your song";

  return (
    <div
      id={DOCK_ID}
      className="ps-dock"
      style={{
        position: "fixed",
        right: 14,
        bottom: 14,
        zIndex: 47,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 8,
        pointerEvents: "none",
      }}
    >
      {isYouTube && (
        <div
          className="ps-dock-yt"
          style={{
            pointerEvents: "auto",
            borderRadius: 18,
            overflow: "hidden",
            background: "rgba(255,255,255,.86)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,214,228,.95)",
            boxShadow: "0 14px 34px -14px rgba(239,83,125,.5)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              padding: "6px 8px 6px 11px",
            }}
          >
            <span
              style={{
                fontFamily: DISPLAY,
                fontSize: 11,
                fontWeight: 700,
                color: PINK_DEEP,
                letterSpacing: ".02em",
              }}
            >
              our song
            </span>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Collapse the player" : "Expand the player"}
              aria-expanded={open}
              style={{
                border: "none",
                background: "none",
                cursor: "pointer",
                color: INK_SOFT,
                fontFamily: DISPLAY,
                fontSize: 11,
                fontWeight: 700,
                padding: "2px 6px",
                borderRadius: 999,
              }}
            >
              {open ? "hide" : "show"}
            </button>
          </div>

          {/*
            The player host. Kept MOUNTED whether or not the panel is expanded,
            because destroying it would stop the music; collapsing only changes
            its height, and only ever because the viewer asked.
          */}
          <div
            className="ps-dock-ytbox"
            style={{
              height: open ? undefined : 0,
              overflow: "hidden",
              transition: "height .28s ease",
            }}
          >
            <div ref={attachYouTube} style={{ width: "100%", height: "100%" }} />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onToggleMute}
        aria-label={muted ? "Unmute the music" : "Mute the music"}
        aria-pressed={muted}
        className="ps-btn ps-dock-btn"
        style={{
          pointerEvents: "auto",
          display: "inline-flex",
          alignItems: "center",
          gap: 9,
          cursor: "pointer",
          borderRadius: 999,
          background: "rgba(255,255,255,.84)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255,214,228,.95)",
          boxShadow: "0 12px 28px -10px rgba(239,83,125,.5)",
          color: muted ? INK_SOFT : PINK_DEEP,
        }}
      >
        <span className="ps-dock-icon" aria-hidden>
          {muted ? <SpeakerOff /> : <SpeakerOn />}
        </span>
        {/* Desktop only — see the stylesheet. */}
        <span className="ps-dock-label" style={{ fontFamily: DISPLAY, color: INK }}>
          {muted ? "Muted" : name}
        </span>
      </button>

      <style>{`
        /* Phone: a circle, thumb-sized. The label is not rendered at all rather
           than hidden, so the pill collapses to a true square. */
        .ps-dock-btn { width: 52px; height: 52px; justify-content: center; padding: 0 }
        .ps-dock-icon { width: 23px; height: 23px; display: block; flex: none }
        .ps-dock-label { display: none; font-size: 13.5px; font-weight: 600; white-space: nowrap }
        .ps-dock-ytbox { width: 168px; aspect-ratio: 16 / 9 }

        @media (min-width: 900px) {
          /* Desktop: a pill that names the track. Bigger, because a 1440px page
             makes a phone-sized control look like a mistake. */
          .ps-dock-btn { width: auto; height: 64px; padding: 0 22px 0 18px; gap: 11px }
          .ps-dock-icon { width: 27px; height: 27px }
          .ps-dock-label { display: inline }
          .ps-dock-ytbox { width: 272px }
        }

        /* A collapsed panel keeps its aspect ratio rule but takes the inline
           height:0, so the ratio must not fight it. */
        .ps-dock-ytbox[style*="height: 0"] { aspect-ratio: auto }
      `}</style>
    </div>
  );
}
