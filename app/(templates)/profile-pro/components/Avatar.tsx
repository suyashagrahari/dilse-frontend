"use client";

// ─── Avatar — the picture that is never broken ───────────────────────────────
//
// Two shapes, one component: a circle for people, a rounded square for the
// company and school marks in Experience / Education / Certifications.
//
// ── THE FALLBACK IS THE POINT ────────────────────────────────────────────────
// A profile is mostly photographs, and a sender will hand us a dead image URL
// eventually — a link that expired, a host that blocks hotlinking, a field they
// left blank. A broken-image glyph on a page whose whole gag is "this looks
// completely real" destroys the illusion faster than any typo. So there is no
// path through this component that renders a torn page: no `src`, or an `onError`
// from the one we were given, and we draw initials on a muted disc instead.
//
// ── THE COLOUR IS SEEDED, NOT RANDOM ─────────────────────────────────────────
// The disc colour is an FNV-1a hash of the name, so the same person is the same
// colour on every render, on the server and the client, and — the reason this
// actually matters — in the PNG capture of the card. `Math.random()` would
// hydrate mismatched and re-roll mid-screenshot.

import { useState } from "react";
import { PP } from "./theme";

/**
 * Muted, desaturated, all dark enough for white text at any size.
 *
 * Nothing here is saturated: an avatar is chrome, and a bright disc would pull
 * the eye off the copy sitting next to it.
 */
const DISCS = [
  "#7A8B99",
  "#8A7A99",
  "#99857A",
  "#7A997F",
  "#996F6F",
  "#6F8299",
  "#87997A",
  "#998C6F",
  "#7F7A99",
  "#6F9993",
] as const;

/** FNV-1a. Small, stable, and identical everywhere it runs. */
function seed(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Up to two letters. Falls back to a dot so the disc is never empty. */
function initialsOf(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "·";
  const letters = words
    .slice(0, 2)
    .map((w) => Array.from(w)[0] ?? "")
    .join("");
  return letters.toUpperCase() || "·";
}

export function Avatar(props: { name: string; src?: string; size: number; square?: boolean }) {
  const { name, src, size, square } = props;
  // Tracked by URL, not by a boolean, so swapping in a new image gets a fresh
  // attempt instead of inheriting the last one's failure.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const radius = square ? Math.max(4, Math.round(size * 0.18)) : size;
  const box = {
    width: size,
    height: size,
    borderRadius: radius,
    flex: "none" as const,
    display: "block" as const,
  };

  const usable = src?.trim() && src.trim() !== failedSrc ? src.trim() : "";

  if (!usable) {
    const disc = DISCS[seed(name || "?") % DISCS.length];
    return (
      <span
        role="img"
        aria-label={name || "Profile picture"}
        style={{
          ...box,
          display: "grid",
          placeItems: "center",
          background: disc,
          color: "#FFFFFF",
          fontFamily: PP.font,
          fontSize: Math.round(size * (square ? 0.36 : 0.4)),
          fontWeight: 600,
          letterSpacing: 0.5,
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        {initialsOf(name)}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={usable}
      alt={name || "Profile picture"}
      draggable={false}
      onError={() => setFailedSrc(usable)}
      style={{ ...box, objectFit: "cover", background: PP.edge }}
    />
  );
}
