// ─── What's New — the changelog's front door ─────────────────────────────────
//
// A small block: the latest version, when it shipped, and what changed. Its real
// job is the link on the right of the heading, which is the only way into the
// version history — the piece of this template people actually read.
//
// The link sits on the heading row rather than under the notes because that is
// where the eye already is after reading "What's New", and because a trigger
// placed after the notes competes with the notes for the same tap.
//
// ── SPACING ─────────────────────────────────────────────────────────────────
//
// This section owns the gap ABOVE it (`SECTION_GAP`) and none below, because the
// version history panel is glued to its underside — that panel is the expansion
// of this block's link, not a separate section, and 32px of air between a
// trigger and the thing it opened reads as two unrelated regions.

"use client";

import type { AppWhatsNew } from "./types";
import { AP, SECTION_GAP } from "./theme";
import { VERSION_HISTORY_PANEL_ID } from "./VersionHistory";

/** 44px floor — this is pressed with a thumb. */
const TAP = 44;

export function WhatsNew({
  whatsNew,
  onOpenHistory,
}: {
  whatsNew: AppWhatsNew;
  onOpenHistory: () => void;
}) {
  return (
    <section
      aria-labelledby="whats-new-heading"
      style={{ fontFamily: AP.font, marginTop: SECTION_GAP, padding: "0 16px" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          minHeight: TAP,
        }}
      >
        <h2
          id="whats-new-heading"
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 700,
            lineHeight: 1.2,
            color: AP.ink,
            letterSpacing: "-0.01em",
          }}
        >
          What&apos;s New
        </h2>

        <button
          type="button"
          onClick={onOpenHistory}
          aria-controls={VERSION_HISTORY_PANEL_ID}
          style={{
            // The negative margin pulls the 44px target back into optical
            // alignment with the heading's right edge. The target stays 44px;
            // only the ink moves.
            minHeight: TAP,
            display: "inline-flex",
            alignItems: "center",
            flex: "none",
            padding: "0 4px",
            marginRight: -4,
            border: "none",
            background: "transparent",
            color: AP.accent,
            font: "inherit",
            fontSize: 15,
            textAlign: "right",
            cursor: "pointer",
            touchAction: "manipulation",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          Version History
        </button>
      </div>

      <div style={{ fontSize: 13, color: AP.inkSoft, marginTop: 2 }}>
        {whatsNew.version}
        <span aria-hidden="true"> · </span>
        {whatsNew.date}
      </div>

      <div style={{ marginTop: 10 }}>
        {whatsNew.notes.map((note, i) => (
          <p
            key={i}
            style={{
              margin: i === 0 ? 0 : "10px 0 0",
              fontSize: 15,
              lineHeight: 1.47,
              color: AP.ink,
              overflowWrap: "anywhere",
            }}
          >
            {note}
          </p>
        ))}
      </div>
    </section>
  );
}

export default WhatsNew;
