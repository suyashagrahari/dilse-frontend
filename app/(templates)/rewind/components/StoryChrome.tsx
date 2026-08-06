"use client";

// ─── Rewind — the overlay ────────────────────────────────────────────────────
//
// Everything on top of a slide that is not the slide: the segmented progress
// bar, the mute pill, the brand mark, and the one affordance that lets somebody
// leave early without a swipe.
//
// The whole thing lives behind a single `hidden` switch, because press-and-hold
// exists so a screenshot comes out clean. Half-hidden chrome is worse than no
// hold at all — a progress bar frozen mid-fill in the corner of her screenshot
// is exactly the artefact this feature is meant to remove.
//
// Colour never comes from a constant here. `fg` is `textOn(def.bg)` and every
// mark on this overlay is that colour at some alpha, so the chrome stays legible
// on cream and on near-black without a single conditional.

import React from "react";
import Link from "next/link";
import { ChevronDown, Volume2, VolumeX } from "lucide-react";

import { BODY_FONT } from "./kinetic";
import type { SlideDef } from "./slideTypes";

/** fg is always #FFFFFF or #0E0E12 — a plain hex parse is enough and is exact. */
function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(full.slice(0, 2), 16) || 0;
  const g = parseInt(full.slice(2, 4), 16) || 0;
  const b = parseInt(full.slice(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const TRACK_ALPHA = 0.25;

export function ProgressSegments(props: {
  slides: SlideDef[];
  index: number;
  progress: number;
  fg: string;
}): React.JSX.Element | null {
  const { slides, index, progress, fg } = props;
  if (slides.length === 0) return null;

  const track = withAlpha(fg, TRACK_ALPHA);

  return (
    <div
      aria-hidden="true"
      style={{
        display: "flex",
        gap: 4,
        width: "100%",
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 10,
      }}
    >
      {slides.map((s, i) => {
        const done = i < index;
        const active = i === index;
        return (
          <div
            key={s.key}
            style={{
              flex: "1 1 0",
              height: 3,
              borderRadius: 2,
              overflow: "hidden",
              backgroundColor: done ? fg : track,
            }}
          >
            {active && (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: fg,
                  transformOrigin: "left center",
                  // scaleX, never width: width is layout, transform is compositor
                  // only, and this repaints every animation frame.
                  transform: `scaleX(${Math.min(1, Math.max(0, progress))})`,
                  willChange: "transform",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function StoryChrome(props: {
  slides: SlideDef[];
  index: number;
  progress: number;
  fg: string;
  hidden: boolean;
  mode: "demo" | "live";
  muted: boolean;
  hasAudio: boolean;
  onToggleMute: () => void;
  onExit: () => void;
}): React.JSX.Element | null {
  const { slides, index, progress, fg, hidden, mode, muted, hasAudio, onToggleMute, onExit } =
    props;

  const pillBg = withAlpha(fg, 0.12);
  const pillEdge = withAlpha(fg, 0.28);

  // One switch for the entire overlay. Nothing opts out of it.
  //
  // `visibility` is what actually removes the controls from hit-testing — an
  // element at opacity 0 is still tappable, and a mute pill you cannot see but
  // can press is a bug. It is delayed by the length of the fade on the way out
  // and immediate on the way back in.
  const veil: React.CSSProperties = {
    opacity: hidden ? 0 : 1,
    visibility: hidden ? "hidden" : "visible",
    transition: `opacity 120ms linear, visibility 0s linear ${hidden ? 120 : 0}ms`,
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        // Below the editor's floating top bar (z-index 120), above the slide.
        zIndex: 40,
        display: "flex",
        flexDirection: "column",
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        ...veil,
        // Last word: the overlay itself must never eat a tap, or the left/right
        // zones stop working across the whole top of the screen.
        pointerEvents: "none",
      }}
    >
      <ProgressSegments slides={slides} index={index} progress={progress} fg={fg} />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          paddingLeft: 6,
          paddingRight: 6,
          paddingTop: 2,
          minHeight: 44,
        }}
      >
        {hasAudio ? (
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? "Turn the sound on" : "Turn the sound off"}
            aria-pressed={!muted}
            style={{
              pointerEvents: "auto",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              minWidth: 44,
              minHeight: 44,
              paddingLeft: 12,
              paddingRight: 12,
              borderRadius: 999,
              border: `1px solid ${pillEdge}`,
              backgroundColor: pillBg,
              color: fg,
              fontFamily: BODY_FONT,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.02em",
              cursor: "pointer",
            }}
          >
            {muted ? <VolumeX size={16} aria-hidden="true" /> : <Volume2 size={16} aria-hidden="true" />}
            <span>{muted ? "Sound off" : "Sound on"}</span>
          </button>
        ) : (
          <span aria-hidden="true" />
        )}

        {/* The brand mark IS the recipient's create-your-own path. */}
        {mode === "live" ? (
          <Link
            href="/templates"
            aria-label="SubhSandesh — make your own"
            prefetch={false}
            style={{
              pointerEvents: "auto",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              minHeight: 44,
              paddingLeft: 12,
              paddingRight: 12,
              borderRadius: 999,
              border: `1px solid ${pillEdge}`,
              backgroundColor: pillBg,
              color: fg,
              textDecoration: "none",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.webp" alt="" width={16} height={16} style={{ width: 16, height: 16 }} />
            <span
              style={{
                fontFamily: BODY_FONT,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.01em",
                color: fg,
              }}
            >
              SubhSandesh
            </span>
          </Link>
        ) : (
          <span aria-hidden="true" />
        )}
      </div>

      <div style={{ flex: 1 }} />

      {/* Swipe down is invisible and unreachable without a pointer. This is the
          same action, discoverable and keyboard-focusable. */}
      <div style={{ display: "flex", justifyContent: "center", paddingBottom: 6 }}>
        <button
          type="button"
          onClick={onExit}
          aria-label="Skip to the card"
          style={{
            pointerEvents: "auto",
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            minWidth: 44,
            minHeight: 44,
            padding: "0 12px",
            border: "none",
            background: "transparent",
            color: fg,
            opacity: 0.55,
            fontFamily: BODY_FONT,
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          <ChevronDown size={14} aria-hidden="true" />
          <span>Skip to the card</span>
        </button>
      </div>
    </div>
  );
}
