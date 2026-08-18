"use client";

// ─── Screen 1 — the profile ──────────────────────────────────────────────────
//
// Sets the frame in about three seconds: one person, one photo, a tagline, and
// an instruction to swipe. The STRUCTURE is the familiar one. The execution is
// not — no product wordmark, no icon row, no saturated gradient, no branded
// colour. Serif type on a dark scrim.
//
// `photoUrl` is empty in the demo data on purpose: the initial card is the
// default path, not the error path, and it must never be a broken image.

import { useState } from "react";
import { seededPick } from "@/lib/seededRandom";

import { INK, MONO, PAPER, SERIF, STENCIL, FALLBACK_STOCKS } from "./flagsTheme";
import { useUpSwipe } from "./useSwipeGesture";

interface ProfileScreenProps {
  name: string;
  age: number;
  photoUrl: string;
  tagline: string;
  seed: string;
  reduced: boolean;
  onBegin: () => void;
}

export default function ProfileScreen({
  name,
  age,
  photoUrl,
  tagline,
  seed,
  reduced,
  onBegin,
}: ProfileScreenProps) {
  const [photoBroken, setPhotoBroken] = useState(false);
  const handlers = useUpSwipe(onBegin);

  const usePhoto = Boolean(photoUrl) && !photoBroken;
  const stock = seededPick(seed, "profile-stock", FALLBACK_STOCKS);
  const initial = (name.trim()[0] ?? "?").toUpperCase();

  return (
    <div
      {...handlers}
      role="button"
      tabIndex={0}
      aria-label={`${name}, ${age}. Swipe up to begin.`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowUp") {
          e.preventDefault();
          onBegin();
        }
      }}
      style={{
        position: "relative",
        flex: 1,
        minHeight: 0,
        width: "100%",
        overflow: "hidden",
        background: INK,
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTapHighlightColor: "transparent",
        cursor: "pointer",
      }}
    >
      {/* full-bleed portrait, or the initial card */}
      {usePhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt=""
          onError={() => setPhotoBroken(true)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: stock,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: SERIF,
              fontSize: "min(38vw, 210px)",
              lineHeight: 1,
              color: "rgba(250,248,244,0.92)",
              letterSpacing: "-0.03em",
            }}
          >
            {initial}
          </span>
        </div>
      )}

      {/* scrim */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(23,21,15,0.62) 0%, rgba(23,21,15,0) 26%," +
            " rgba(23,21,15,0) 44%, rgba(23,21,15,0.86) 92%)",
        }}
      />

      {/* above the photo, small and centred */}
      <p
        style={{
          position: "absolute",
          top: "calc(env(safe-area-inset-top, 0px) + 58px)",
          left: 0,
          right: 0,
          margin: 0,
          textAlign: "center",
          fontFamily: MONO,
          fontSize: 12,
          letterSpacing: "0.2em",
          color: "rgba(250,248,244,0.86)",
        }}
      >
        1 profile near you.
      </p>

      {/* the name block, over the scrim */}
      <div style={{ position: "absolute", left: 24, right: 24, bottom: 112 }}>
        <h2
          style={{
            margin: 0,
            fontFamily: SERIF,
            fontWeight: 400,
            fontSize: "clamp(30px, 9vw, 40px)",
            lineHeight: 1.06,
            color: PAPER,
            letterSpacing: "-0.01em",
          }}
        >
          {name}
          <span style={{ opacity: 0.72 }}>, {age}</span>
        </h2>
        <p
          style={{
            margin: "10px 0 0",
            fontFamily: SERIF,
            fontSize: "clamp(14px, 4vw, 16px)",
            lineHeight: 1.45,
            color: "rgba(250,248,244,0.82)",
          }}
        >
          {tagline}
        </p>
      </div>

      {/* the invitation */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 30px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          minHeight: 44,
          justifyContent: "flex-end",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            display: "block",
            width: 13,
            height: 13,
            borderLeft: "1.5px solid rgba(250,248,244,0.9)",
            borderTop: "1.5px solid rgba(250,248,244,0.9)",
            transform: "rotate(45deg)",
            animation: reduced ? undefined : "flagsChevronDrift 1.9s ease-in-out infinite",
          }}
        />
        <span
          style={{
            fontFamily: STENCIL,
            fontWeight: 500,
            fontSize: 12,
            letterSpacing: "0.26em",
            color: "rgba(250,248,244,0.9)",
            textTransform: "uppercase",
          }}
        >
          swipe up to begin
        </span>
      </div>
    </div>
  );
}
