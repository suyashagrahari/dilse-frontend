"use client";

import { Check, Play, Plus } from "lucide-react";
import { useCallback, useState } from "react";

import PlaceholderArt from "./PlaceholderArt";
import { sfxUiTap } from "./loveflixAudio";
import {
  ACCENT,
  ACCENT_GRAD,
  BG,
  CARD_RADIUS,
  FONT_BODY,
  FONT_DISPLAY,
  HAIRLINE,
  TAP,
  TEXT,
  TEXT_DIM,
  scrim,
  scrimLeft,
} from "./theme";
import type { LoveflixData } from "./types";

export interface HeroBannerProps {
  data: LoveflixData;
  onPlay: () => void;
  reducedMotion: boolean;
}

/**
 * The billboard at the top of the catalogue.
 *
 * Density is the whole design bar here: a match percentage, a year, a maturity
 * chip and a season count in one tight metadata row is what makes a page with
 * exactly one title on it read as a catalogue. The match percentage is the only
 * coloured text on the screen; everything else lives on the near-black ramp.
 *
 * "My List" is a real toggle. It stores nothing anywhere — it is in-memory for
 * the life of the screen — but people press it, so it answers.
 */

/** Accent at an alpha, derived from the token so the hex is never retyped. */
function accentAlpha(alpha: number): string {
  const h = ACCENT.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, (c) => c + c) : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/**
 * The artwork box is deliberately taller than the visible band and anchored to
 * the top, so the placeholder's own bottom-left caption block is cropped away
 * rather than colliding with the hero copy that sits in the same corner.
 */
const ART_OVERHANG = 180;

const CSS = `
.lfx-hb-btn{
  display:inline-flex;align-items:center;justify-content:center;gap:9px;
  min-height:${TAP + 4}px;padding:0 22px;border-radius:${CARD_RADIUS}px;
  font-family:${FONT_BODY};font-size:15px;font-weight:700;letter-spacing:0.01em;
  cursor:pointer;-webkit-tap-highlight-color:transparent;
  transition:transform 200ms ease,background-color 200ms ease,border-color 200ms ease,filter 200ms ease;
}
.lfx-hb-btn:focus-visible{outline:2px solid ${TEXT};outline-offset:3px;}
.lfx-hb-btn:hover{transform:scale(1.03);}
.lfx-hb-btn:active{transform:scale(0.98);}
.lfx-hb-play:hover{filter:brightness(1.08);}
.lfx-hb-list:hover{border-color:${TEXT};}
.lfx-hb-still,.lfx-hb-still:hover,.lfx-hb-still:active{transform:none;transition:background-color 1ms linear,border-color 1ms linear;}
.lfx-hb-still:hover{filter:none;}
`;

export default function HeroBanner({ data, onPlay, reducedMotion }: HeroBannerProps) {
  const [inList, setInList] = useState(false);

  const still = reducedMotion ? " lfx-hb-still" : "";

  const handlePlay = useCallback(() => {
    sfxUiTap();
    onPlay();
  }, [onPlay]);

  const handleList = useCallback(() => {
    sfxUiTap();
    setInList((v) => !v);
  }, []);

  const dot = (
    <span aria-hidden style={{ color: TEXT_DIM, opacity: 0.7, fontSize: 11 }}>
      &bull;
    </span>
  );

  return (
    <section
      aria-label={data.showTitle}
      style={{
        position: "relative",
        width: "100%",
        height: "55dvh",
        minHeight: 400,
        maxHeight: 760,
        overflow: "hidden",
        background: BG,
      }}
    >
      <style>{CSS}</style>

      <PlaceholderArt
        src={data.heroImageUrl}
        title={data.showTitle}
        variant="hero"
        seedSalt="hero"
        alt=""
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: `calc(100% + ${ART_OVERHANG}px)`,
        }}
      />

      {/* Both scrims, layered: bottom-up for the copy block, left-in so the
          metadata row survives a bright still behind it. */}
      <div aria-hidden style={{ position: "absolute", inset: 0, background: scrim() }} />
      <div aria-hidden style={{ position: "absolute", inset: 0, background: scrimLeft }} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "0 clamp(16px, 4vw, 56px) clamp(20px, 4vh, 44px)",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontFamily: FONT_DISPLAY,
            fontWeight: 600,
            fontSize: "clamp(42px, 12vw, 108px)",
            lineHeight: 0.9,
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
            color: TEXT,
            maxWidth: "min(100%, 900px)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textShadow: "0 2px 24px rgba(0,0,0,0.55)",
          }}
        >
          {data.showTitle}
        </h2>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "8px 10px",
            marginTop: "clamp(10px, 1.6vh, 16px)",
            fontFamily: FONT_BODY,
            fontSize: 13,
            color: TEXT,
          }}
        >
          <span style={{ color: ACCENT, fontWeight: 700, letterSpacing: "0.01em" }}>
            {data.matchPercent}% Match
          </span>
          {data.metYear ? (
            <>
              {dot}
              <span style={{ color: TEXT, opacity: 0.92 }}>{data.metYear}</span>
            </>
          ) : null}
          {data.rating ? (
            <>
              {dot}
              <span
                style={{
                  display: "inline-block",
                  padding: "2px 7px",
                  border: `1px solid ${HAIRLINE}`,
                  borderRadius: 2,
                  fontSize: 11,
                  letterSpacing: "0.06em",
                  color: TEXT_DIM,
                  whiteSpace: "nowrap",
                }}
              >
                {data.rating}
              </span>
            </>
          ) : null}
          {data.seasons ? (
            <>
              {dot}
              <span style={{ color: TEXT, opacity: 0.92 }}>{data.seasons}</span>
            </>
          ) : null}
        </div>

        <p
          style={{
            margin: "clamp(10px, 1.6vh, 16px) 0 0",
            maxWidth: "min(100%, 520px)",
            fontFamily: FONT_BODY,
            fontSize: "clamp(13px, 3.4vw, 15px)",
            lineHeight: 1.55,
            color: TEXT_DIM,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {data.tagline}
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            marginTop: "clamp(16px, 2.4vh, 24px)",
          }}
        >
          <button
            type="button"
            onClick={handlePlay}
            className={`lfx-hb-btn lfx-hb-play${still}`}
            style={{ border: "none", background: ACCENT_GRAD, color: BG }}
          >
            <Play size={18} fill="currentColor" strokeWidth={0} aria-hidden />
            Play
          </button>

          <button
            type="button"
            onClick={handleList}
            aria-pressed={inList}
            aria-label={inList ? "Remove from My List" : "Add to My List"}
            className={`lfx-hb-btn lfx-hb-list${still}`}
            style={{
              border: `1px solid ${inList ? ACCENT : "rgba(255,255,255,0.42)"}`,
              background: inList ? accentAlpha(0.16) : "rgba(22,22,22,0.55)",
              color: TEXT,
              backdropFilter: "blur(6px)",
            }}
          >
            {inList ? (
              <Check size={18} strokeWidth={2.6} color={ACCENT} aria-hidden />
            ) : (
              <Plus size={18} strokeWidth={2.4} aria-hidden />
            )}
            My List
          </button>
        </div>
      </div>
    </section>
  );
}
