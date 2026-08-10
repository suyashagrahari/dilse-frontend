"use client";

// ─── Endorsements — the design tokens and the one shared primitive ───────────
//
// This genre reads as "serious professional tool" within half a second, and it
// does that with four flat colours and no ornament at all. The whole look is:
// an off-white page, white cards, a hairline border, and text at two opacities.
//
// ── NO SHADOWS ───────────────────────────────────────────────────────────────
// Cards are a 1px border and nothing else. A drop shadow instantly reads as a
// generic consumer web app, which is the one thing this template must not look
// like — the copy is doing all the joking, so the chrome has to keep a straight
// face. If a card ever needs emphasis, it gets a heavier border, never a shadow.
//
// ── BRAND ────────────────────────────────────────────────────────────────────
// The accent is a deep teal we picked ourselves. Nothing in this file borrows a
// palette, a mark, or a name from any real professional network.
//
// This is a `.ts` file on purpose — it is imported by every other piece of the
// template, so it stays free of JSX and builds its one element with
// `createElement`.

import * as React from "react";

export const PP = {
  page: "#F4F2EE",
  card: "#FFFFFF",
  edge: "#E0E0E0",
  ink: "#000000E6",
  inkSoft: "#00000099",
  accent: "#0E6B6B",
  accentInk: "#FFFFFF",
  font: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
};

/** The accent at a low alpha — the tint behind "Open to" and the top-skill pill. */
export const ACCENT_TINT = "rgba(14, 107, 107, 0.08)";
/** The accent at a mid alpha — outlined-button borders. */
export const ACCENT_EDGE = "rgba(14, 107, 107, 0.55)";

/**
 * Every section on the page is one of these: white, 8px radius, hairline
 * border, 16px padding, no shadow.
 *
 * It sets no margin. The template stacks the sections in a flex column with a
 * 12px gap, so a margin here would double the spacing on every seam.
 */
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
        boxShadow: "none",
        overflowWrap: "anywhere" as const,
      },
    },
    props.children
  );
}
