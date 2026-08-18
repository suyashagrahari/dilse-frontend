"use client";

// ─── Us — the highlight strip ────────────────────────────────────────────────
//
// 64px rings, 20px apart, scrolling sideways under a 16px gutter. The 3px white
// gap between the hairline ring and the cover is doing more work than its size
// suggests — without it the covers read as flat circles rather than as covers
// inside a ring, and the strip stops looking like a strip.
//
// Zero highlights hides the whole row. An empty 100px band with nothing in it
// is the loudest possible "this is a template".

import Photo from "./Photo";
import { HIGHLIGHT_TITLE_TRUNCATE, METRICS, PALETTE, type Highlight } from "./types";

/** Titles are one line and never wrap; the tail becomes an ellipsis. */
export function truncateTitle(title: string): string {
  return title.length > HIGHLIGHT_TITLE_TRUNCATE
    ? `${title.slice(0, HIGHLIGHT_TITLE_TRUNCATE)}…`
    : title;
}

export interface HighlightStripProps {
  highlights: Highlight[];
  onOpen: (index: number) => void;
}

export default function HighlightStrip({ highlights, onOpen }: HighlightStripProps) {
  if (highlights.length === 0) return null;

  return (
    <nav
      className="us-hscroll"
      aria-label="Story highlights"
      style={{ display: "flex", gap: 20, padding: `16px ${METRICS.pagePad}px`, whiteSpace: "nowrap" }}
    >
      {highlights.map((h, i) => (
        <button
          key={`${h.title}-${i}`}
          type="button"
          className="us-tap"
          onClick={() => onOpen(i)}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
            width: METRICS.highlightRing,
          }}
        >
          <div
            style={{
              boxSizing: "border-box",
              width: METRICS.highlightRing,
              height: METRICS.highlightRing,
              borderRadius: "50%",
              border: `1px solid ${PALETTE.border}`,
              // The white breathing room between the ring and the cover.
              padding: 3,
              background: PALETTE.bg,
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                overflow: "hidden",
                background: PALETTE.button,
              }}
            >
              <Photo src={h.coverUrl} alt="" sizes="64px" glyphSize={20} />
            </div>
          </div>
          <span
            style={{
              fontSize: 12,
              lineHeight: "15px",
              color: PALETTE.ink,
              maxWidth: METRICS.highlightRing,
              textAlign: "center",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {truncateTitle(h.title)}
          </span>
        </button>
      ))}
    </nav>
  );
}
