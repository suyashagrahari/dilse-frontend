"use client";

import { useState } from "react";
import {
  ACCENT,
  FONT_BODY,
  FONT_DISPLAY,
  PLACEHOLDER_RULES,
  TEXT,
  TEXT_DIM,
  initialOf,
  placeholderLook,
} from "./theme";

/**
 * Artwork slot for every image in the template — hero still, rail cards, Top 10
 * portraits, scene backgrounds, profile avatars.
 *
 * THE PLACEHOLDER IS THE DEFAULT PATH, not the error path. The demo ships with
 * every image URL empty, so this composition is what anybody browsing the
 * gallery actually sees. It is therefore designed rather than apologetic: a
 * seeded duotone, a printed hairline texture, a ghosted display glyph and the
 * title set in the condensed face. A rail of them should read as a curated
 * catalogue, not as a row of failures.
 *
 * A URL that 404s or is blocked falls back to exactly the same composition, so
 * a broken image is indistinguishable from a deliberately unillustrated one.
 * There is never a torn-image icon.
 */

export type PlaceholderVariant = "card" | "portrait" | "hero" | "scene" | "avatar";

export interface PlaceholderArtProps {
  /** May be "" — that is the normal case, not an error. */
  src: string;
  /** Drives both the seeded palette and the typography in the fallback. */
  title: string;
  variant?: PlaceholderVariant;
  /** Extra seed salt so two identically-titled items differ. */
  seedSalt?: string;
  /** Set on the <img> only; the fallback is decorative and stays aria-hidden. */
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  /** Rendered above the artwork inside the same box (scrims, captions, rank). */
  children?: React.ReactNode;
}

const GLYPH_SCALE: Record<PlaceholderVariant, number> = {
  card: 0.9,
  portrait: 0.72,
  hero: 0.78,
  scene: 0.62,
  avatar: 0.58,
};

const TITLE_SIZE: Record<PlaceholderVariant, string> = {
  card: "clamp(10px, 3.2cqw, 15px)",
  portrait: "clamp(10px, 5cqw, 14px)",
  hero: "clamp(12px, 2.2cqw, 18px)",
  scene: "clamp(11px, 1.6cqw, 16px)",
  avatar: "0px",
};

export default function PlaceholderArt({
  src,
  title,
  variant = "card",
  seedSalt = "",
  alt,
  className,
  style,
  children,
}: PlaceholderArtProps) {
  // Remember WHICH url failed rather than that "a" failure happened, so a
  // changed url gets a fresh attempt for free. Storing a bare boolean meant
  // clearing it from an effect on every src change — a cascading render, and
  // one frame of a broken image before it cleared.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = failedSrc !== null && failedSrc === src;

  const showImage = Boolean(src) && !failed;
  const seed = `${title}|${variant}|${seedSalt}`;
  const look = placeholderLook(seed);
  const glyph = initialOf(title, "★");

  return (
    <div
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        background: showImage ? "#111" : look.background,
        containerType: "inline-size",
        ...style,
      }}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt ?? ""}
          onError={() => setFailedSrc(src)}
          loading="lazy"
          decoding="async"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <div aria-hidden style={{ position: "absolute", inset: 0 }}>
          {/* Printed hairline texture — stops the gradient reading as a flat void. */}
          <div style={{ position: "absolute", inset: 0, background: PLACEHOLDER_RULES }} />

          {/* Ghosted display glyph, bled off the corner so it feels like art
              direction rather than a centred "no image" badge. */}
          <div
            style={{
              position: "absolute",
              right: "-6%",
              bottom: variant === "avatar" ? "50%" : "-16%",
              transform: variant === "avatar" ? "translateY(50%)" : undefined,
              left: variant === "avatar" ? 0 : undefined,
              display: "flex",
              alignItems: "center",
              justifyContent: variant === "avatar" ? "center" : "flex-end",
              fontFamily: FONT_DISPLAY,
              fontWeight: 600,
              fontSize: `${GLYPH_SCALE[variant] * 100}cqw`,
              lineHeight: 0.78,
              letterSpacing: "-0.04em",
              color: variant === "avatar" ? TEXT : "rgba(255,255,255,0.09)",
              opacity: variant === "avatar" ? 0.85 : 1,
              userSelect: "none",
            }}
          >
            {glyph}
          </div>

          {/* A single accent rule. The one piece of colour a placeholder gets. */}
          {variant !== "avatar" && (
            <div
              style={{
                position: "absolute",
                left: "8%",
                bottom: variant === "portrait" ? "22%" : "26%",
                width: "22%",
                height: 2,
                background: ACCENT,
                opacity: 0.85,
              }}
            />
          )}

          {/* The title carries the meaning when there is no picture. */}
          {variant !== "avatar" && (
            <div
              style={{
                position: "absolute",
                left: "8%",
                right: "12%",
                bottom: variant === "portrait" ? "8%" : "10%",
              }}
            >
              <div
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  fontSize: TITLE_SIZE[variant],
                  lineHeight: 1.08,
                  color: TEXT,
                  display: "-webkit-box",
                  WebkitLineClamp: variant === "hero" || variant === "scene" ? 2 : 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {title}
              </div>
              {(variant === "hero" || variant === "scene") && (
                <div
                  style={{
                    marginTop: 6,
                    fontFamily: FONT_BODY,
                    fontSize: 10,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: TEXT_DIM,
                  }}
                >
                  Original Series
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {children}
    </div>
  );
}
