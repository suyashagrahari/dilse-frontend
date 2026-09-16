"use client";

// ─── Proposal — the music dock ───────────────────────────────────────────────
//
// Bottom-right, fixed, and the only music control on the page. Two icons, no
// words: one for the sound, one for the video panel. Nothing else.
//
// ── WHY ICONS AND NOT A LABELLED PILL ───────────────────────────────────────
//
// The pill used to print the track name, and the YouTube panel carried its own
// "our song / hide" title bar. That is three pieces of chrome and two different
// affordances stacked in the corner of a page whose entire job is a question
// somebody is about to answer. A speaker and a screen are understood without
// being read, in any language, at a glance — which is the whole budget this
// control gets. The names moved to `aria-label`, where a screen reader still
// gets the full sentence.
//
// ── WHY BOTTOM-RIGHT ────────────────────────────────────────────────────────
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
// ── THE YOUTUBE PANEL ───────────────────────────────────────────────────────
//
// When the sender pasted a YouTube link, the real IFrame player renders here,
// visibly, above the icons. That is not a design preference: the IFrame API
// terms require the player to stay visible and not be covered or shrunk away,
// and "play the audio with the video hidden" is precisely what they forbid.
// See the compliance note in ./music.
//
// So the video is present and honest, and simply small and out of the way. The
// screen icon collapses it — a viewer-initiated collapse pauses nothing and
// hides nothing that was not already their choice — but the page never hides it
// on their behalf while it is playing, and it opens visible every time.

import { useState } from "react";
import type { BuiltInTrack } from "./music";
import { INK_SOFT, PINK_DEEP } from "./theme";

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
      <path d="M15.5 9.5l5 5m0-5l-5 5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

/** A little screen with a play triangle — "the video panel". */
function ScreenOn() {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" aria-hidden>
      <rect x="2.6" y="5" width="18.8" height="13" rx="3.2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M10.4 9.5l4.6 2.5-4.6 2.5z" fill="currentColor" />
    </svg>
  );
}

function ScreenOff() {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" aria-hidden>
      <rect x="2.6" y="5" width="18.8" height="13" rx="3.2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M4 20L20 3.4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
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
  /** Spoken, not printed: the icon is the control, this is what it is playing. */
  const name =
    mode === "builtin" ? track?.label ?? "the music" : isYouTube ? "your song" : "your song";

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
        gap: 10,
        pointerEvents: "none",
      }}
    >
      {isYouTube && (
        <div
          className="ps-dock-yt"
          style={{
            pointerEvents: "auto",
            borderRadius: 20,
            overflow: "hidden",
            background: "rgba(255,255,255,.9)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,214,228,.95)",
            boxShadow: "0 16px 36px -16px rgba(239,83,125,.5)",
            /*
              Collapsed is height:0 with the padding gone, not display:none, so
              the iframe below is never unmounted — unmounting it would stop the
              music, which is not what "hide the video" asked for.
            */
            padding: open ? 5 : 0,
            height: open ? undefined : 0,
            opacity: open ? 1 : 0,
            transition: "opacity .22s ease",
          }}
        >
          <div className="ps-dock-ytbox" style={{ borderRadius: 15, overflow: "hidden" }}>
            <div ref={attachYouTube} style={{ width: "100%", height: "100%" }} />
          </div>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 10, pointerEvents: "auto" }}>
        {isYouTube && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Hide the video" : "Show the video"}
            aria-pressed={!open}
            className="ps-btn ps-dock-btn"
            style={{ color: open ? PINK_DEEP : INK_SOFT }}
          >
            <span className="ps-dock-icon" aria-hidden>
              {open ? <ScreenOn /> : <ScreenOff />}
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? `Unmute ${name}` : `Mute ${name}`}
          aria-pressed={muted}
          className="ps-btn ps-dock-btn"
          style={{ color: muted ? INK_SOFT : PINK_DEEP }}
        >
          <span className="ps-dock-icon" aria-hidden>
            {muted ? <SpeakerOff /> : <SpeakerOn />}
          </span>
        </button>
      </div>

      <style>{`
        /* One shape for both icons, so the pair reads as a set. 52px clears the
           44px touch minimum even after the rounded corners are discounted. */
        .ps-dock-btn {
          width: 52px; height: 52px; padding: 0; cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center;
          border-radius: 999px;
          background: rgba(255,255,255,.86);
          -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px);
          border: 1px solid rgba(255,214,228,.95);
          box-shadow: 0 12px 28px -10px rgba(239,83,125,.5);
        }
        .ps-dock-icon { width: 24px; height: 24px; display: block; flex: none }
        .ps-dock-ytbox { width: 172px; aspect-ratio: 16 / 9 }

        @media (min-width: 900px) {
          /* A phone-sized control in the corner of a 1440px page is a speck. */
          .ps-dock-btn { width: 62px; height: 62px }
          .ps-dock-icon { width: 29px; height: 29px }
          .ps-dock-ytbox { width: 276px }
        }
      `}</style>
    </div>
  );
}
