"use client";

// ─── Rewind — slide 8: the song ──────────────────────────────────────────────
//
// Only reaches the deck when data.audioUrl is non-empty, so there is no empty
// state to design for. The tile is a graphic composition built out of def.fg
// and transparency — there is no artwork URL and there is no player: no play
// button, no scrub bar, no elapsed time, no service mark of any kind. Playback
// belongs to the shell. This slide is a poster of a song, not a music app.
//
// The waveform is SEEDED off props.seed, so the bars are identical on screen
// and in the exported PNG.

import React from "react";
import { seededUnit } from "@/lib/seededRandom";
import { EASE_OUT_EXPO } from "../types";
import { BODY_FONT, DISPLAY_FONT, FadeUp, LetterSpaceIn } from "../kinetic";
import type { SlideProps } from "../slideTypes";

const BARS = 48;
const BAR_STAGGER_MS = 11;
const BAR_RISE_MS = 420;
const WAVE_DELAY_MS = 900;

/** Everything that is not whitespace or ASCII punctuation. ES2017-safe. */
const GLYPH = /[^\s!-/:-@[-`{-~]/;

function useEnter(reduced: boolean): boolean {
  const [entered, setEntered] = React.useState(reduced);
  React.useEffect(() => {
    if (reduced) {
      setEntered(true);
      return;
    }
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setEntered(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [reduced]);
  return entered;
}

function initialsOf(...sources: string[]): string {
  for (const src of sources) {
    const words = src.trim().split(/\s+/).filter(Boolean);
    const letters: string[] = [];
    for (const w of words) {
      const m = w.match(GLYPH);
      if (m) letters.push(m[0]);
      if (letters.length === 2) break;
    }
    if (letters.length) return letters.join("").toUpperCase();
  }
  return "RW";
}

export default function SongSlide({
  data,
  def,
  reduced,
  seed,
}: SlideProps): React.JSX.Element {
  const entered = useEnter(reduced);

  const title = data.songTitle.trim() || "the one on repeat";
  const artist = data.songArtist.trim();
  const initials = React.useMemo(
    () =>
      initialsOf(
        data.songTitle,
        data.songArtist,
        `${data.senderName} ${data.recipientName}`,
      ),
    [data.songTitle, data.songArtist, data.senderName, data.recipientName],
  );

  const bars = React.useMemo(
    () =>
      Array.from({ length: BARS }, (_, i) => {
        const u = seededUnit(seed, `wave:${i}`);
        // A gentle envelope so it reads as a waveform rather than static noise.
        const env = 0.58 + 0.42 * Math.sin((Math.PI * (i + 0.5)) / BARS);
        return Math.min(1, Math.max(0.14, (0.24 + 0.76 * u) * env));
      }),
    [seed],
  );

  // A long title shrinks rather than wraps into the waveform.
  const titlePx = title.length > 46 ? 26 : title.length > 26 ? 32 : 40;

  return (
    <div
      className="flex w-full flex-col items-center justify-center"
      style={{
        height: "100%",
        minHeight: "100dvh",
        boxSizing: "border-box",
        overflow: "hidden",
        color: def.fg,
        paddingTop: "calc(72px + env(safe-area-inset-top))",
        paddingBottom: "calc(30px + env(safe-area-inset-bottom))",
        paddingLeft: 24,
        paddingRight: 24,
      }}
    >
      <LetterSpaceIn
        reduced={reduced}
        delayMs={60}
        durationMs={620}
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: "0.34em",
          textTransform: "uppercase",
          opacity: 0.72,
        }}
      >
        ON REPEAT
      </LetterSpaceIn>

      {/* The tile: flat colour, transparency and type. No artwork, no chrome. */}
      <FadeUp
        reduced={reduced}
        delayMs={220}
        durationMs={700}
        fromY={22}
        style={{ marginTop: 22 }}
      >
        <div
          aria-hidden
          style={{
            position: "relative",
            width: "min(56vw, 214px)",
            aspectRatio: "1 / 1",
            overflow: "hidden",
            background: `${def.fg}14`,
            border: `1px solid ${def.fg}33`,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "-18%",
              bottom: "-26%",
              width: "86%",
              aspectRatio: "1 / 1",
              borderRadius: "50%",
              background: `${def.fg}1F`,
            }}
          />
          <div
            style={{
              position: "absolute",
              right: "-12%",
              top: "-20%",
              width: "58%",
              aspectRatio: "1 / 1",
              borderRadius: "50%",
              border: `2px solid ${def.fg}2E`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "50%",
              height: 1,
              background: `${def.fg}26`,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              fontFamily: DISPLAY_FONT,
              fontWeight: 700,
              fontSize: "clamp(56px, 19vw, 78px)",
              lineHeight: 0.85,
              letterSpacing: "-0.03em",
              textTransform: "uppercase",
              color: def.fg,
              opacity: 0.92,
            }}
          >
            {initials}
          </div>
        </div>
      </FadeUp>

      <FadeUp
        reduced={reduced}
        delayMs={520}
        durationMs={640}
        fromY={18}
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 700,
          fontSize: titlePx,
          lineHeight: 0.92,
          letterSpacing: "-0.02em",
          textTransform: "uppercase",
          textAlign: "center",
          marginTop: 26,
          maxWidth: 330,
          // A pathologically long title is clipped rather than allowed to push
          // the waveform off a 640px-tall screen.
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: 3,
          overflow: "hidden",
        }}
      >
        {title}
      </FadeUp>

      {artist ? (
        <FadeUp
          reduced={reduced}
          delayMs={700}
          durationMs={620}
          fromY={14}
          style={{
            fontFamily: BODY_FONT,
            fontSize: 15,
            lineHeight: 1.3,
            textAlign: "center",
            opacity: 0.78,
            marginTop: 10,
            maxWidth: 320,
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 2,
            overflow: "hidden",
          }}
        >
          {artist}
        </FadeUp>
      ) : null}

      <div
        aria-hidden
        style={{
          display: "flex",
          alignItems: "center",
          gap: 3,
          width: "100%",
          maxWidth: 330,
          height: 66,
          marginTop: 26,
        }}
      >
        {bars.map((h, i) => (
          <div
            key={i}
            style={{
              flex: "1 1 0",
              minWidth: 0,
              height: `${(h * 100).toFixed(1)}%`,
              borderRadius: 999,
              background: def.fg,
              opacity: 0.55 + h * 0.4,
              transformOrigin: "center",
              transform: reduced || entered ? "scaleY(1)" : "scaleY(0.02)",
              transition: reduced
                ? "none"
                : `transform ${BAR_RISE_MS}ms ${EASE_OUT_EXPO} ${WAVE_DELAY_MS + i * BAR_STAGGER_MS}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
