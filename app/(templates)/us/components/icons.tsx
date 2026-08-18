// ─── Us — the icon set ───────────────────────────────────────────────────────
//
// Every glyph here is drawn by hand, in this file, as plain inline SVG. No icon
// package is imported and nothing is traced from an existing app's artwork —
// these are the generic forms the shapes are drawn from in the first place: a
// chevron, a bell, a bookmark, a speech bubble, a paper plane, a heart.
//
// One geometry note that carries most of the fidelity: the strokes are 1.6–2px
// with round caps and joins on a 24 grid, and the optical weight is matched
// across the set. A mixed-weight icon row is the single loudest tell that a
// layout is a reproduction rather than the thing itself.

import type { CSSProperties } from "react";

export interface IconProps {
  /** Square edge in CSS pixels. The whole set is drawn on a 24 grid. */
  size?: number;
  /** Applied to `stroke` (or `fill`, for the solid glyphs). */
  color?: string;
  style?: CSSProperties;
  className?: string;
}

const base = (size: number, style?: CSSProperties): Record<string, unknown> => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
  "aria-hidden": true,
  focusable: false,
  style: { display: "block", flexShrink: 0, ...style },
});

const stroke = (color: string, width = 1.7) => ({
  stroke: color,
  strokeWidth: width,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

/* ── Navigation ──────────────────────────────────────────────────────────── */

export function BackChevron({ size = 24, color = "#000000", style }: IconProps) {
  return (
    <svg {...base(size, style)}>
      <path d="M15 4.5 7.5 12l7.5 7.5" {...stroke(color, 1.9)} />
    </svg>
  );
}

export function SmallChevronDown({ size = 12, color = "#000000", style }: IconProps) {
  return (
    <svg {...base(size, style)}>
      <path d="M5 9.5 12 16l7-6.5" {...stroke(color, 2.4)} />
    </svg>
  );
}

export function BellIcon({ size = 24, color = "#000000", style }: IconProps) {
  return (
    <svg {...base(size, style)}>
      {/* A dome on a flat rail, with a clapper arc beneath. */}
      <path d="M12 3.2a5.6 5.6 0 0 0-5.6 5.6v3.4L4.9 16.2h14.2l-1.5-4V8.8A5.6 5.6 0 0 0 12 3.2Z" {...stroke(color)} />
      <path d="M10.1 18.6a2 2 0 0 0 3.8 0" {...stroke(color)} />
    </svg>
  );
}

export function MenuIcon({ size = 24, color = "#000000", style }: IconProps) {
  return (
    <svg {...base(size, style)}>
      <path d="M4 7h16M4 12h16M4 17h16" {...stroke(color, 1.8)} />
    </svg>
  );
}

export function DotsMenu({ size = 24, color = "#000000", style }: IconProps) {
  return (
    <svg {...base(size, style)}>
      <circle cx="5" cy="12" r="1.6" fill={color} />
      <circle cx="12" cy="12" r="1.6" fill={color} />
      <circle cx="19" cy="12" r="1.6" fill={color} />
    </svg>
  );
}

export function CloseIcon({ size = 24, color = "#000000", style }: IconProps) {
  return (
    <svg {...base(size, style)}>
      <path d="M6 6l12 12M18 6 6 18" {...stroke(color, 1.9)} />
    </svg>
  );
}

/* ── Post actions ────────────────────────────────────────────────────────── */

/**
 * Two arcs meeting at a point. `filled` swaps stroke for fill — the same path,
 * so the shape does not jump when it is tapped.
 */
export function HeartIcon({
  size = 24,
  color = "#000000",
  filled = false,
  strokeWidth = 1.8,
  style,
}: IconProps & { filled?: boolean; strokeWidth?: number }) {
  const d =
    "M12 20.4 4.6 13.2a4.6 4.6 0 0 1 0-6.6 4.8 4.8 0 0 1 6.7 0l.7.7.7-.7a4.8 4.8 0 0 1 6.7 0 4.6 4.6 0 0 1 0 6.6Z";
  return (
    <svg {...base(size, style)}>
      <path d={d} fill={filled ? color : "none"} {...(filled ? {} : stroke(color, strokeWidth))} />
    </svg>
  );
}

export function CommentIcon({ size = 24, color = "#000000", style }: IconProps) {
  return (
    <svg {...base(size, style)}>
      {/* A rounded bubble with the tail folded into the bottom-left corner. */}
      <path d="M20.5 11.6c0 4.2-3.8 7.6-8.5 7.6a9.8 9.8 0 0 1-2.6-.35L4.4 20.4l1.4-3.9a7.2 7.2 0 0 1-2.3-5c0-4.2 3.8-7.6 8.5-7.6s8.5 3.4 8.5 7.7Z" {...stroke(color)} />
    </svg>
  );
}

export function SendIcon({ size = 24, color = "#000000", style }: IconProps) {
  return (
    <svg {...base(size, style)}>
      {/* Outline dart with the centre crease drawn, not filled. */}
      <path d="M21 3.6 2.9 10.3l7.4 2.9 2.9 7.4Z" {...stroke(color)} />
      <path d="M21 3.6 10.3 13.2" {...stroke(color)} />
    </svg>
  );
}

export function BookmarkIcon({ size = 24, color = "#000000", filled = false, style }: IconProps & { filled?: boolean }) {
  const d = "M6 3.6h12v17l-6-4.6-6 4.6Z";
  return (
    <svg {...base(size, style)}>
      <path d={d} fill={filled ? color : "none"} {...(filled ? {} : stroke(color))} />
    </svg>
  );
}

/* ── Profile tabs ────────────────────────────────────────────────────────── */

/** Nine squares. Drawn as a 3×3 rule set rather than nine rects. */
export function GridTabIcon({ size = 24, color = "#000000", style }: IconProps) {
  return (
    <svg {...base(size, style)}>
      <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="1.2" {...stroke(color, 1.8)} />
      <path d="M9.07 3.2v17.6M14.93 3.2v17.6M3.2 9.07h17.6M3.2 14.93h17.6" {...stroke(color, 1.8)} />
    </svg>
  );
}

/** A play triangle inside a tall rectangle — the "clips" tab. */
export function ClipsTabIcon({ size = 24, color = "#000000", style }: IconProps) {
  return (
    <svg {...base(size, style)}>
      <rect x="4.4" y="3.2" width="15.2" height="17.6" rx="3" {...stroke(color, 1.8)} />
      <path d="M10.4 8.9 15.6 12l-5.2 3.1Z" {...stroke(color, 1.8)} />
    </svg>
  );
}

/** A person inside a square — head, shoulders, frame. */
export function TaggedTabIcon({ size = 24, color = "#000000", style }: IconProps) {
  return (
    <svg {...base(size, style)}>
      <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="3" {...stroke(color, 1.8)} />
      <circle cx="12" cy="10" r="2.6" {...stroke(color, 1.8)} />
      <path d="M7.2 18.1a5.1 5.1 0 0 1 9.6 0" {...stroke(color, 1.8)} />
    </svg>
  );
}

/* ── Grid overlays ───────────────────────────────────────────────────────── */

/** Two offset squares — "there is more than one photo here". */
export function StackGlyph({ size = 18, color = "#FFFFFF", style }: IconProps) {
  return (
    <svg {...base(size, style)}>
      <path d="M8.5 3.2h12.3v12.3" {...stroke(color, 2.1)} />
      <rect x="3.2" y="8.5" width="12.3" height="12.3" rx="1.6" {...stroke(color, 2.1)} />
    </svg>
  );
}

/** A solid play triangle. Solid, not outlined — it has to read at 16px. */
export function PlayGlyph({ size = 18, color = "#FFFFFF", style }: IconProps) {
  return (
    <svg {...base(size, style)}>
      <path d="M6.6 3.9 20 12 6.6 20.1Z" fill={color} />
    </svg>
  );
}

/** A map pin, drawn solid so it survives the shadow at 14px. */
export function PinGlyph({ size = 18, color = "#FFFFFF", style }: IconProps) {
  return (
    <svg {...base(size, style)}>
      <path d="M12 2.6a6 6 0 0 0-6 6c0 4.3 6 12.8 6 12.8s6-8.5 6-12.8a6 6 0 0 0-6-6Zm0 8.3a2.3 2.3 0 1 1 0-4.6 2.3 2.3 0 0 1 0 4.6Z" fill={color} />
    </svg>
  );
}

/** The fallback drawn in place of a photo that would not load. */
export function BrokenPhotoGlyph({ size = 24, color = "#B8B8B8", style }: IconProps) {
  return (
    <svg {...base(size, style)}>
      <rect x="3.2" y="5" width="17.6" height="14" rx="2" {...stroke(color, 1.6)} />
      <circle cx="8.6" cy="9.8" r="1.5" {...stroke(color, 1.6)} />
      <path d="M3.7 16.6 9 11.7l3.6 3.3 3-2.6 4.7 4.2" {...stroke(color, 1.6)} />
    </svg>
  );
}

/* ── Bottom navigation ───────────────────────────────────────────────────── */

export function HomeIcon({ size = 24, color = "#000000", style }: IconProps) {
  return (
    <svg {...base(size, style)}>
      <path d="M3.6 10.2 12 3.4l8.4 6.8v9.2a1.2 1.2 0 0 1-1.2 1.2H4.8a1.2 1.2 0 0 1-1.2-1.2Z" {...stroke(color)} />
    </svg>
  );
}

export function SearchIcon({ size = 24, color = "#000000", style }: IconProps) {
  return (
    <svg {...base(size, style)}>
      <circle cx="10.8" cy="10.8" r="6.8" {...stroke(color)} />
      <path d="m15.9 15.9 4.4 4.4" {...stroke(color, 1.9)} />
    </svg>
  );
}

export function PlusSquareIcon({ size = 24, color = "#000000", style }: IconProps) {
  return (
    <svg {...base(size, style)}>
      <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="4.4" {...stroke(color)} />
      <path d="M12 8.2v7.6M8.2 12h7.6" {...stroke(color)} />
    </svg>
  );
}

/** A person with a plus beside them — the follow affordance. */
export function PersonPlusIcon({ size = 20, color = "#000000", style }: IconProps) {
  return (
    <svg {...base(size, style)}>
      <circle cx="9.6" cy="8.4" r="3.6" {...stroke(color, 1.7)} />
      <path d="M3.4 19.4a6.4 6.4 0 0 1 12.4 0" {...stroke(color, 1.7)} />
      <path d="M18.6 7.6v5.2M16 10.2h5.2" {...stroke(color, 1.7)} />
    </svg>
  );
}

/* ── Editor chrome ───────────────────────────────────────────────────────── */

export function PenIcon({ size = 16, color = "currentColor", style }: IconProps) {
  return (
    <svg {...base(size, style)}>
      <path d="m14.6 4.4 5 5-9.4 9.4-6.2 1.2 1.2-6.2Z" {...stroke(color, 1.8)} />
      <path d="m13 6 5 5" {...stroke(color, 1.8)} />
    </svg>
  );
}

export function DownloadIcon({ size = 16, color = "currentColor", style }: IconProps) {
  return (
    <svg {...base(size, style)}>
      <path d="M12 3.6v11.2M7.4 10.6 12 15.2l4.6-4.6" {...stroke(color, 1.8)} />
      <path d="M4.4 18.4h15.2" {...stroke(color, 1.8)} />
    </svg>
  );
}

export function CopyIcon({ size = 16, color = "currentColor", style }: IconProps) {
  return (
    <svg {...base(size, style)}>
      <rect x="8.4" y="8.4" width="11.2" height="11.2" rx="2" {...stroke(color, 1.7)} />
      <path d="M15.6 5.4a2 2 0 0 0-2-2H6.4a3 3 0 0 0-3 3v7.2a2 2 0 0 0 2 2" {...stroke(color, 1.7)} />
    </svg>
  );
}

export function SpinnerIcon({ size = 20, color = "currentColor", style }: IconProps) {
  return (
    <svg {...base(size, { animation: "us-spin 900ms linear infinite", ...style })}>
      <circle cx="12" cy="12" r="8.4" stroke={color} strokeWidth={2} opacity={0.25} />
      <path d="M20.4 12a8.4 8.4 0 0 0-8.4-8.4" {...stroke(color, 2)} />
    </svg>
  );
}

export function TrashIcon({ size = 16, color = "currentColor", style }: IconProps) {
  return (
    <svg {...base(size, style)}>
      <path d="M4.6 6.6h14.8M9.4 6.6V4.4h5.2v2.2M6.4 6.6l1 13h9.2l1-13" {...stroke(color, 1.7)} />
    </svg>
  );
}
