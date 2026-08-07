// ─── Caller ID — every glyph on the screen ───────────────────────────────────
//
// All inline SVG, all drawn here from primitives. No icon library is imported
// into this template and no glyph is traced from anybody's set: the shapes are
// the generic ones every phone has drawn since 2008 — a handset, a tick, a pin,
// a label, four direction arrows — built out of lines, arcs and one polyline.
//
// Every icon takes `size` and `color` and paints with `currentColor` nowhere,
// so a row can hand its own colour down without a cascade surprise. All of them
// are `aria-hidden`: the text beside each one is what a screen reader should
// read, and "phone icon" said twice is worse than not said at all.

import type { CSSProperties } from "react";

export interface GlyphProps {
  size?: number;
  color?: string;
  style?: CSSProperties;
}

const svg = (size: number, style?: CSSProperties) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none" as const,
  "aria-hidden": true as const,
  focusable: "false" as const,
  style: { display: "block", flex: "none", ...style },
});

/**
 * The handset.
 *
 * One closed path: earpiece, the diagonal body, mouthpiece. Rotating it 135°
 * gives the decline glyph, which is how every phone has drawn "hang up" for
 * long enough that it is a convention rather than a design.
 */
export function PhoneGlyph({ size = 24, color = "#fff", style }: GlyphProps) {
  return (
    <svg {...svg(size, style)}>
      <path
        d="M5.6 3.4c1.2-1 2.9-.8 3.7.4l1.5 2.1c.6.9.4 2.2-.6 2.8l-.8.5c.9 1.9 2.5 3.5 4.4 4.4l.5-.8c.6-1 1.9-1.2 2.8-.6l2.1 1.5c1.2.8 1.4 2.5.4 3.7l-.9 1c-1 1.1-2.6 1.4-3.9.8-5-2.1-9-6.1-11.1-11.1-.6-1.3-.3-2.9.8-3.9z"
        fill={color}
      />
    </svg>
  );
}

/** Hang up. The same handset, turned over. */
export function PhoneDownGlyph({ size = 24, color = "#fff", style }: GlyphProps) {
  return (
    <span
      aria-hidden="true"
      style={{ display: "block", transform: "rotate(135deg)", lineHeight: 0, ...style }}
    >
      <PhoneGlyph size={size} color={color} />
    </span>
  );
}

/** Verified. A tick inside a soft disc — the disc is what makes it read as a badge. */
export function CheckBadgeGlyph({ size = 20, color = "#1DA362", style }: GlyphProps) {
  return (
    <svg {...svg(size, style)}>
      <circle cx="12" cy="12" r="9.2" fill={color} opacity="0.16" />
      <circle cx="12" cy="12" r="9.2" stroke={color} strokeWidth="1.6" />
      <path
        d="M7.8 12.3l2.8 2.8 5.6-6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** A bare tick, for the wordmark pill. */
export function CheckGlyph({ size = 12, color = "#1DA362", style }: GlyphProps) {
  return (
    <svg {...svg(size, style)}>
      <path
        d="M5 12.6l4.2 4.2L19 6.6"
        stroke={color}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** A luggage-label: the crowd-sourced tag row, and the tag page's chips. */
export function TagGlyph({ size = 20, color = "#9AA4AE", style }: GlyphProps) {
  return (
    <svg {...svg(size, style)}>
      <path
        d="M11.4 3.4H19a1.6 1.6 0 011.6 1.6v7.6c0 .4-.2.8-.5 1.1l-6.4 6.4a1.6 1.6 0 01-2.3 0l-7.6-7.6a1.6 1.6 0 010-2.3l6.4-6.4c.3-.3.7-.4 1.2-.4z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="16.2" cy="7.8" r="1.5" fill={color} />
    </svg>
  );
}

/** The spam meter's row glyph. A plain shield — reassurance, not alarm. */
export function ShieldGlyph({ size = 20, color = "#9AA4AE", style }: GlyphProps) {
  return (
    <svg {...svg(size, style)}>
      <path
        d="M12 3l7 2.6v5.6c0 4-2.8 7.6-7 9.2-4.2-1.6-7-5.2-7-9.2V5.6L12 3z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Where she is calling from. */
export function PinGlyph({ size = 20, color = "#9AA4AE", style }: GlyphProps) {
  return (
    <svg {...svg(size, style)}>
      <path
        d="M12 21c4.2-4.6 6.3-8 6.3-10.6A6.3 6.3 0 005.7 10.4C5.7 13 7.8 16.4 12 21z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10.3" r="2.4" stroke={color} strokeWidth="1.6" />
    </svg>
  );
}

/** The swipe hint. Three of these drift upward above the answer button. */
export function ChevronUpGlyph({ size = 18, color = "#9AA4AE", style }: GlyphProps) {
  return (
    <svg {...svg(size, style)}>
      <path
        d="M5.5 15.2L12 8.8l6.5 6.4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The decorative search field on the recents list. */
export function SearchGlyph({ size = 18, color = "#6B7480", style }: GlyphProps) {
  return (
    <svg {...svg(size, style)}>
      <circle cx="10.8" cy="10.8" r="6.3" stroke={color} strokeWidth="1.8" />
      <path d="M15.6 15.6L20 20" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/** The trailing affordance on every recents row. */
export function InfoGlyph({ size = 20, color = "#9AA4AE", style }: GlyphProps) {
  return (
    <svg {...svg(size, style)}>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.6" />
      <path d="M12 11v5.4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="7.9" r="1.1" fill={color} />
    </svg>
  );
}

export function CopyGlyph({ size = 16, color = "#fff", style }: GlyphProps) {
  return (
    <svg {...svg(size, style)}>
      <rect x="8.4" y="8.4" width="11.2" height="11.2" rx="2.4" stroke={color} strokeWidth="1.7" />
      <path
        d="M15.6 5.6V5A1.6 1.6 0 0014 3.4H6A1.6 1.6 0 004.4 5v8A1.6 1.6 0 006 14.6h.6"
        stroke={color}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ArrowLeftGlyph({ size = 18, color = "#fff", style }: GlyphProps) {
  return (
    <svg {...svg(size, style)}>
      <path d="M19 12H5.4" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path
        d="M11 5.8L4.8 12l6.2 6.2"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PenGlyph({ size = 16, color = "#fff", style }: GlyphProps) {
  return (
    <svg {...svg(size, style)}>
      <path
        d="M4.5 19.5l4.6-1.1L19.3 8.2a2 2 0 000-2.8l-.7-.7a2 2 0 00-2.8 0L5.6 14.9 4.5 19.5z"
        stroke={color}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ShareGlyph({ size = 16, color = "#fff", style }: GlyphProps) {
  return (
    <svg {...svg(size, style)}>
      <circle cx="6.4" cy="12" r="2.6" stroke={color} strokeWidth="1.7" />
      <circle cx="17.4" cy="6" r="2.6" stroke={color} strokeWidth="1.7" />
      <circle cx="17.4" cy="18" r="2.6" stroke={color} strokeWidth="1.7" />
      <path d="M8.8 10.8l6.2-3.4M8.8 13.2l6.2 3.4" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function DownloadGlyph({ size = 16, color = "#101418", style }: GlyphProps) {
  return (
    <svg {...svg(size, style)}>
      <path d="M12 4v10.6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M7.6 10.6L12 15l4.4-4.4"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M4.8 18.6h14.4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function CloseGlyph({ size = 18, color = "#fff", style }: GlyphProps) {
  return (
    <svg {...svg(size, style)}>
      <path d="M6 6l12 12M18 6L6 18" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function PlusGlyph({ size = 16, color = "#101418", style }: GlyphProps) {
  return (
    <svg {...svg(size, style)}>
      <path d="M12 5v14M5 12h14" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function MinusGlyph({ size = 16, color = "#101418", style }: GlyphProps) {
  return (
    <svg {...svg(size, style)}>
      <path d="M5 12h14" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function LockGlyph({ size = 16, color = "#6B7480", style }: GlyphProps) {
  return (
    <svg {...svg(size, style)}>
      <rect x="4.8" y="10.4" width="14.4" height="9.4" rx="2.4" stroke={color} strokeWidth="1.7" />
      <path d="M8.2 10.2V7.8a3.8 3.8 0 017.6 0v2.4" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

/* ── Call direction ────────────────────────────────────────────────────────── */

/**
 * The four recents glyphs.
 *
 * Incoming and missed both point INTO the corner; outgoing points out of it.
 * That is the whole convention, and it is why colour has to carry the rest:
 * missed and rejected are red, the other two are grey. Rejected adds the bar
 * across the tail — the one that says somebody made a decision.
 */
export function CallDirectionGlyph({
  kind,
  size = 20,
  color = "#6B7480",
  style,
}: GlyphProps & { kind: "missed" | "incoming" | "outgoing" | "rejected" }) {
  const stroke = { stroke: color, strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  if (kind === "outgoing") {
    return (
      <svg {...svg(size, style)}>
        <path d="M5.4 18.6L18.2 5.8" {...stroke} />
        <path d="M10.4 5.8h7.8v7.8" {...stroke} fill="none" />
      </svg>
    );
  }

  if (kind === "rejected") {
    return (
      <svg {...svg(size, style)}>
        <path d="M18.6 5.4L5.8 18.2" {...stroke} />
        <path d="M13.6 18.2H5.8v-7.8" {...stroke} fill="none" />
        <path d="M14.6 12.4l5.4 5.4" {...stroke} />
      </svg>
    );
  }

  // incoming and missed share the arrow; only the colour differs.
  return (
    <svg {...svg(size, style)}>
      <path d="M18.6 5.4L5.8 18.2" {...stroke} />
      <path d="M13.6 18.2H5.8v-7.8" {...stroke} fill="none" />
    </svg>
  );
}
