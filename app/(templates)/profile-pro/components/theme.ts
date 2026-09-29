"use client";

// ─── Endorsements — design tokens ────────────────────────────────────────────
//
// The page is a straight-faced clone of the professional-profile format, so the
// tokens are that genre's: a warm off-white canvas, white cards with a hairline
// ring, near-black text at .9 / .6 opacity, one working blue for links and
// primary buttons, and a green reserved for the "open to" frame. The romance is
// in the copy and the little details (a heart mark, a pink reaction), never in
// the chrome.
//
// `PP`, `ACCENT_TINT`, `ACCENT_EDGE` and `Card` keep their old names because the
// contributor pages (endorse / recommend) and the sender's queue import them.

import * as React from "react";

export const PP = {
  page: "#F4F2EE",
  card: "#FFFFFF",
  edge: "#E8E5DF",
  ink: "rgba(0,0,0,.9)",
  inkSoft: "rgba(0,0,0,.6)",
  accent: "#0A66C2",
  accentInk: "#FFFFFF",
  font: `-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", "Fira Sans", Ubuntu, Oxygen, sans-serif`,
};

/** Extra tokens the clone uses. */
export const LI = {
  blue: "#0A66C2",
  blueDeep: "#004182",
  blueTint: "#EAF4FE",
  green: "#01754F",
  greenFrame: "#3E8E41",
  greenTint: "#EDF7EE",
  pink: "#E0457B",
  gold: "#C37D16",
  premium: "#915907",
  premiumTint: "#FCF0DE",
  mute: "rgba(0,0,0,.6)",
  faint: "rgba(0,0,0,.45)",
  line: "rgba(0,0,0,.08)",
  line2: "rgba(0,0,0,.15)",
  hover: "rgba(0,0,0,.04)",
};

/** The accent at a low alpha — tints behind "Open to" and the top-skill pill. */
export const ACCENT_TINT = "rgba(10, 102, 194, 0.08)";
/** The accent at a mid alpha — outlined-button borders. */
export const ACCENT_EDGE = "rgba(10, 102, 194, 0.7)";

/** White card with the genre's hairline ring. Used by the queue + contributor pages. */
export function Card(props: { children: React.ReactNode; className?: string }) {
  return React.createElement(
    "section",
    {
      className: props.className,
      style: {
        background: PP.card,
        border: `1px solid ${PP.edge}`,
        borderRadius: 8,
        padding: 16,
        fontFamily: PP.font,
        color: PP.ink,
        overflowWrap: "anywhere" as const,
      },
    },
    props.children,
  );
}
