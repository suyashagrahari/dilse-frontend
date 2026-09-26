"use client";

// ─── Screen 2 — the parts of the broadcast face ──────────────────────────────
//
// The player panel, the marquee, the physical controls and the segment dots.
// Split out from `DedicationTemplate` only so that file stays readable; these
// are not independently useful.

import { useCallback } from "react";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { BODY_FACE, DISPLAY_FACE, PALETTE, PLAYER_PANEL, TAP_TARGET_PX, TIMING } from "./types";
import { amberGlow, knobBackground } from "./radioStyles";

/* ══════════════════════════════════════════════════════════════════════════
   The player panel

   COMPLIANCE-CRITICAL. This renders the official IFrame player as a visible
   screen set into the radio's face, at PLAYER_PANEL (140x80). It is never
   hidden, never covered, never sized to zero. The NO SIGNAL plate sits BEHIND
   the host (z-0 against z-10) so that the instant an iframe exists it is the
   thing you see.

   The host element is created imperatively and appended, rather than rendered
   by React. The IFrame API REPLACES the element it is given with an <iframe>,
   and handing React-managed DOM to something that swaps it out is how you get
   a NotFoundError on the next reconciliation.
   ══════════════════════════════════════════════════════════════════════════ */

export interface PlayerPanelProps {
  onHost: (el: HTMLElement | null) => void;
  /** Drawn behind the player. Visible only before a video exists. */
  idleLabel: string;
}

export function PlayerPanel({ onHost, idleLabel }: PlayerPanelProps) {
  const attachSlot = useCallback(
    (el: HTMLDivElement | null) => {
      if (!el) {
        onHost(null);
        return;
      }
      // Strict Mode attaches twice in development; start from empty each time.
      el.replaceChildren();
      const host = document.createElement("div");
      host.style.width = "100%";
      host.style.height = "100%";
      host.style.display = "block";
      el.appendChild(host);
      onHost(host);
      return () => {
        onHost(null);
      };
    },
    [onHost],
  );

  return (
    <div
      className="relative shrink-0 rounded-[6px] overflow-hidden"
      style={{
        width: PLAYER_PANEL.width,
        height: PLAYER_PANEL.height,
        // Chrome bezel around the screen, the way a set-in panel is mounted.
        padding: 3,
        background: `linear-gradient(160deg, ${PALETTE.chrome}, ${PALETTE.chromeDark})`,
        boxShadow: `0 2px 6px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.5)`,
      }}
    >
      <div className="relative w-full h-full overflow-hidden rounded-[3px]" style={{ background: "#070603" }}>
        <span
          aria-hidden
          className="absolute inset-0 z-0 grid place-items-center text-center px-1"
          style={{
            fontFamily: BODY_FACE,
            fontSize: 8,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(240,166,60,.42)",
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(255,255,255,.045) 0 1px, rgba(0,0,0,0) 1px 3px)",
          }}
        >
          {idleLabel}
        </span>
        <div ref={attachSlot} className="absolute inset-0 z-10" data-ded-player-slot />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   NOW PLAYING marquee — one of only two continuous animations here
   ══════════════════════════════════════════════════════════════════════════ */

export function Marquee({ text, reduced }: { text: string; reduced: boolean }) {
  if (reduced) {
    return (
      <div
        className="overflow-hidden whitespace-nowrap text-ellipsis px-2"
        style={{ fontFamily: DISPLAY_FACE, fontSize: 12, color: PALETTE.amber, textShadow: amberGlow(0.7) }}
      >
        {text}
      </div>
    );
  }
  return (
    <div className="overflow-hidden" style={{ maskImage: "linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)" }}>
      <div
        data-ded-motion
        className="flex whitespace-nowrap will-change-transform"
        style={{ animation: `dedMarquee ${TIMING.marqueeMs}ms linear infinite` }}
      >
        {/* Duplicated so the -50% wrap is seamless. */}
        {[0, 1].map((i) => (
          <span
            key={i}
            className="pr-12"
            style={{ fontFamily: DISPLAY_FACE, fontSize: 12, color: PALETTE.amber, textShadow: amberGlow(0.7) }}
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Controls — physical, minimal, every target >= TAP_TARGET_PX

   No scrubbing inside a song. It is radio; you get the song that is on.
   ══════════════════════════════════════════════════════════════════════════ */

export interface ControlsProps {
  playing: boolean;
  volume: number;
  onToggle: () => void;
  onVolume: (v: number) => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  disabled: boolean;
}

function SquareButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="grid place-items-center rounded-full active:scale-95 transition-transform disabled:opacity-40"
      style={{
        width: TAP_TARGET_PX,
        height: TAP_TARGET_PX,
        color: PALETTE.ink,
        ...knobBackground(),
      }}
    >
      {children}
    </button>
  );
}

export function Controls({
  playing,
  volume,
  onToggle,
  onVolume,
  onSkipBack,
  onSkipForward,
  disabled,
}: ControlsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-center gap-4">
        <SquareButton label="Previous segment" onClick={onSkipBack} disabled={disabled}>
          <SkipBack size={19} strokeWidth={2.4} />
        </SquareButton>

        {/* The big knob. 68px — this is played at arm's length. */}
        <button
          type="button"
          aria-label={playing ? "Pause the show" : "Play the show"}
          aria-pressed={playing}
          onClick={onToggle}
          disabled={disabled}
          className="relative grid place-items-center rounded-full active:scale-95 transition-transform disabled:opacity-40"
          style={{ width: 68, height: 68, color: PALETTE.ink, ...knobBackground() }}
        >
          <span
            aria-hidden
            className="absolute inset-[7px] rounded-full"
            style={{
              background: `linear-gradient(180deg, ${PALETTE.chrome}, #9a958d)`,
              boxShadow: "inset 0 2px 4px rgba(255,255,255,.55), inset 0 -3px 6px rgba(0,0,0,.35)",
            }}
          />
          <span className="relative">
            {playing ? <Pause size={24} strokeWidth={2.6} /> : <Play size={24} strokeWidth={2.6} />}
          </span>
        </button>

        <SquareButton label="Next segment" onClick={onSkipForward} disabled={disabled}>
          <SkipForward size={19} strokeWidth={2.4} />
        </SquareButton>
      </div>

      {/* Volume, styled as a dial: knurled chrome thumb on a milled track. */}
      <div className="flex items-center gap-2.5 px-1">
        <span
          className="text-[9px] font-bold uppercase tracking-[0.2em] shrink-0"
          style={{ fontFamily: BODY_FACE, color: "rgba(232,220,192,.55)" }}
        >
          Vol
        </span>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={volume}
          disabled={disabled}
          aria-label="Volume"
          onChange={(e) => onVolume(Number(e.target.value))}
          className="ded-vol flex-1"
          style={{ height: TAP_TARGET_PX }}
        />
        <span
          className="text-[10px] tabular-nums shrink-0 w-7 text-right"
          style={{ fontFamily: DISPLAY_FACE, color: PALETTE.amber, textShadow: amberGlow(0.5) }}
        >
          {volume}
        </span>
      </div>
    </div>
  );
}

/** Styling for the range input. Injected once by the template. */
export const VOLUME_CSS = `
.ded-vol { -webkit-appearance: none; appearance: none; background: transparent; touch-action: none; }
.ded-vol::-webkit-slider-runnable-track {
  height: 10px; border-radius: 5px;
  background: linear-gradient(180deg, #4b2418, #2f150d);
  box-shadow: inset 0 2px 4px rgba(0,0,0,.7), inset 0 -1px 0 rgba(255,255,255,.14);
}
.ded-vol::-moz-range-track {
  height: 10px; border-radius: 5px;
  background: linear-gradient(180deg, #4b2418, #2f150d);
  box-shadow: inset 0 2px 4px rgba(0,0,0,.7);
}
.ded-vol::-webkit-slider-thumb {
  -webkit-appearance: none; appearance: none;
  width: 30px; height: 30px; margin-top: -10px; border-radius: 50%;
  background:
    radial-gradient(circle at 34% 28%, rgba(255,255,255,.9), rgba(255,255,255,0) 46%),
    conic-gradient(from 0deg, ${PALETTE.chrome} 0deg 5deg, ${PALETTE.chromeDark} 5deg 10deg);
  box-shadow: inset 0 -2px 4px rgba(0,0,0,.45), 0 3px 7px -2px rgba(0,0,0,.7);
  cursor: pointer;
}
.ded-vol::-moz-range-thumb {
  width: 30px; height: 30px; border: none; border-radius: 50%;
  background:
    radial-gradient(circle at 34% 28%, rgba(255,255,255,.9), rgba(255,255,255,0) 46%),
    conic-gradient(from 0deg, ${PALETTE.chrome} 0deg 5deg, ${PALETTE.chromeDark} 5deg 10deg);
  box-shadow: inset 0 -2px 4px rgba(0,0,0,.45), 0 3px 7px -2px rgba(0,0,0,.7);
  cursor: pointer;
}
.ded-vol:disabled { opacity: .45; }
`;

/* ══════════════════════════════════════════════════════════════════════════
   Segment progress — one dot per segment, filled as they pass
   ══════════════════════════════════════════════════════════════════════════ */

export function SegmentDots({
  passed,
  current,
  kinds,
}: {
  passed: boolean[];
  current: number;
  kinds: Array<"voice" | "song" | "clip">;
}) {
  return (
    <div className="flex items-center justify-center gap-1.5" role="list" aria-label="Show progress">
      {kinds.map((kind, i) => {
        const done = passed[i];
        const now = i === current;
        return (
          <span
            key={i}
            role="listitem"
            aria-label={`${kind === "voice" ? "Voice" : kind === "clip" ? "Video" : "Song"} segment ${i + 1}${done ? ", played" : now ? ", on air" : ""}`}
            style={{
              width: now ? 16 : 7,
              height: 7,
              borderRadius: 4,
              transition: "width 260ms ease, background 260ms ease",
              background: now ? PALETTE.amber : done ? PALETTE.amberDim : "rgba(232,220,192,.2)",
              boxShadow: now ? `0 0 7px ${PALETTE.amber}aa` : "none",
            }}
          />
        );
      })}
    </div>
  );
}
