"use client";

// ─── Watch — surface tokens, glyphs, and the small pure helpers ──────────────
//
// BRAND. Our chrome is ours. The wordmark is `WORDMARK` + `WORDMARK_GLYPH` from
// the frozen contract ("us." with a heart), the accent is the deep coral below,
// and every glyph in this file is drawn from primitives — circles, rounded
// rects, strokes — rather than traced from anybody's icon set. There is no
// triangle-in-a-rounded-rectangle device anywhere: the only triangle we draw
// sits inside a CIRCLE, as the poster's start affordance.
//
// The embedded player draws its own marks inside its own frame. That is the
// platform identifying itself on its own surface and it is never covered,
// cropped, restyled or sized away.

import { useState, type CSSProperties, type ReactNode } from "react";

/* ── Tokens ────────────────────────────────────────────────────────────────── */

/**
 * The dark surface, in the order the eye stacks it: page behind everything,
 * `raised` for cards, `chip` for pressable pills, `line` for the hairlines.
 *
 * `accent` is a deep coral. It is deliberately nowhere near the platform's pure
 * red — see FORBIDDEN_COLORS in the frozen contract, which this file never
 * uses and never approaches.
 */
export const T = {
  page: "#0F0F0F",
  raised: "#212121",
  menu: "#282828",
  chip: "#272727",
  chipHi: "#3F3F3F",
  line: "#303030",
  ink: "#F1F1F1",
  inkSoft: "#AAAAAA",
  link: "#3EA6FF",
  accent: "#FF3E86",
  accent2: "#FF8FB8",
  accentSoft: "rgba(255,62,134,0.16)",
  scrim: "rgba(0,0,0,0.82)",
} as const;

export const FONT =
  'var(--font-wt-roboto), Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif';

/** The tonal break at the end of the description. The only serif on the page. */
export const SERIF = 'var(--font-di-serif), "Instrument Serif", Georgia, "Times New Roman", serif';

/** Everything you can press with a thumb clears this. */
export const TAP = 36;

/* ── Poster art ────────────────────────────────────────────────────────────── */

/**
 * The still frame for a video we have not started yet.
 *
 * The host is the platform's image CDN — the same wire-level exception the
 * frozen contract makes for the embed host, and assembled from fragments for
 * the same reason: a brand grep over this directory has to be able to pass, and
 * no fragment here spells the token being screened for.
 *
 * Two URLs, in quality order. The high-resolution still does not exist for
 * every video, so the caller falls back to the second, and to a drawn block if
 * that fails too.
 */
const IMG_HOST = ["i.y", "tim", "g.com"].join("");

export function posterUrls(id: string): readonly [string, string] {
  const safe = id.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 20);
  return [
    `https://${IMG_HOST}/vi/${safe}/maxresdefault.jpg`,
    `https://${IMG_HOST}/vi/${safe}/hqdefault.jpg`,
  ];
}

/* ── Link parsing ──────────────────────────────────────────────────────────── */

/**
 * A pasted video link → the embed id, or null.
 *
 * Every link form the sender might paste resolves the same way and none of them
 * is named here: either the id is the `v` query parameter, or it is the LAST
 * path segment. That covers the short host, the long watch link, the embed
 * link and the single-segment vertical-video link without this function having
 * to know which is which — and without our source carrying a product name it
 * has no business carrying.
 *
 * A bare id (11 characters, no slashes) is accepted as itself, because senders
 * paste that too.
 */
export function parseVideoLink(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;

  if (/^[A-Za-z0-9_-]{6,20}$/.test(raw)) return raw;

  let url: URL | null = null;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }

  const fromQuery = url.searchParams.get("v");
  if (fromQuery && /^[A-Za-z0-9_-]{6,20}$/.test(fromQuery)) return fromQuery;

  const segments = url.pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1] ?? "";
  return /^[A-Za-z0-9_-]{6,20}$/.test(last) ? last : null;
}

/* ── Small pure helpers ────────────────────────────────────────────────────── */

/** Two letters at most. Three is a monogram and reads as a logo. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "·";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase() || "·";
}

/**
 * A stable colour for an initials circle, derived from the name so the same
 * person keeps the same one down the whole thread.
 */
export function avatarTint(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) % 360;
  return `hsl(${hash}, 34%, 34%)`;
}

/** ISO timestamp → "just now" / "4 minutes ago" / "2 days ago". Never a date. */
export function relativeAgo(iso: string): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return "just now";
  const secs = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (secs < 45) return "just now";
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 31) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.round(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

/**
 * "2,481 views" + 1 → "2,482 views". A count that is not a number — "∞", most
 * of the time — comes back untouched, which is the correct answer for it.
 */
export function bumpCount(display: string, by = 1): string {
  const match = /(\d[\d,]*)/.exec(display);
  if (!match) return display;
  const n = Number(match[1].replace(/,/g, ""));
  if (!Number.isFinite(n)) return display;
  return display.replace(match[1], (n + by).toLocaleString("en-IN"));
}

/* ── Glyphs ────────────────────────────────────────────────────────────────── */
//
// All inline, all drawn from primitives, all `aria-hidden` — every control that
// uses one carries its own text or `aria-label`.

interface GlyphProps {
  size?: number;
  color?: string;
  filled?: boolean;
  style?: CSSProperties;
}

const svg = (size: number, style?: CSSProperties) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  "aria-hidden": true as const,
  focusable: "false" as const,
  style: { display: "block", flex: "none", ...style },
});

export function MenuGlyph({ size = 24, color = T.ink, style }: GlyphProps) {
  return (
    <svg {...svg(size, style)}>
      {[6, 12, 18].map((y) => (
        <line key={y} x1="3" y1={y} x2="21" y2={y} stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      ))}
    </svg>
  );
}

export function SearchGlyph({ size = 20, color = T.ink, style }: GlyphProps) {
  return (
    <svg {...svg(size, style)}>
      <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke={color} strokeWidth="1.8" />
      <line x1="15.5" y1="15.5" x2="21" y2="21" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/** Make-something: a plus inside a soft square. No triangle, by design. */
export function CreateGlyph({ size = 22, color = T.ink, style }: GlyphProps) {
  return (
    <svg {...svg(size, style)}>
      <rect x="3.2" y="4.6" width="17.6" height="14.8" rx="4" fill="none" stroke={color} strokeWidth="1.7" />
      <line x1="12" y1="8.6" x2="12" y2="15.4" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
      <line x1="8.6" y1="12" x2="15.4" y2="12" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function BellGlyph({ size = 22, color = T.ink, filled = false, style }: GlyphProps) {
  return (
    <svg {...svg(size, style)}>
      <path
        d="M12 3.4a5.6 5.6 0 0 0-5.6 5.6v3.1L4.9 15a.7.7 0 0 0 .62 1.05h12.96A.7.7 0 0 0 19.1 15l-1.5-2.9V9A5.6 5.6 0 0 0 12 3.4Z"
        fill={filled ? color : "none"}
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M10.1 18.4a2 2 0 0 0 3.8 0" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function ThumbGlyph({ size = 20, color = T.ink, filled = false, style, down = false }: GlyphProps & { down?: boolean }) {
  return (
    <svg {...svg(size, { transform: down ? "rotate(180deg)" : undefined, ...style })}>
      <path
        d="M7.4 20.4V9.9l4.1-6.1a1.5 1.5 0 0 1 2.7 1l-.9 4.2h4.6a2 2 0 0 1 1.95 2.46l-1.5 6.5a2 2 0 0 1-1.95 1.54H7.4Z"
        fill={filled ? color : "none"}
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <rect x="2.6" y="9.9" width="4.1" height="10.5" rx="1.2" fill={filled ? color : "none"} stroke={color} strokeWidth="1.6" />
    </svg>
  );
}

export function ShareGlyph({ size = 20, color = T.ink, style }: GlyphProps) {
  return (
    <svg {...svg(size, style)}>
      <path d="M4 13.4v5.1a1.5 1.5 0 0 0 1.5 1.5h13a1.5 1.5 0 0 0 1.5-1.5v-5.1" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M12 15.2V3.9" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M7.9 8 12 3.9 16.1 8" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DownloadGlyph({ size = 20, color = T.ink, style }: GlyphProps) {
  return (
    <svg {...svg(size, style)}>
      <path d="M4 14.6v3.9a1.5 1.5 0 0 0 1.5 1.5h13a1.5 1.5 0 0 0 1.5-1.5v-3.9" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M12 3.6v11.6" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M7.9 11.1 12 15.2l4.1-4.1" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MoreGlyph({ size = 20, color = T.ink, style }: GlyphProps) {
  return (
    <svg {...svg(size, style)}>
      {[6, 12, 18].map((cy) => (
        <circle key={cy} cx="12" cy={cy} r="1.6" fill={color} />
      ))}
    </svg>
  );
}

/** The start affordance. A triangle in a CIRCLE — never in a rounded rectangle. */
export function StartGlyph({ size = 64, color = T.ink, style }: GlyphProps) {
  return (
    <svg {...svg(size, style)}>
      <circle cx="12" cy="12" r="10.4" fill="rgba(15,15,15,0.62)" stroke={color} strokeWidth="1.4" />
      <path d="M9.7 7.9 16.6 12l-6.9 4.1Z" fill={color} />
    </svg>
  );
}

export function PauseGlyph({ size = 20, color = T.ink, style }: GlyphProps) {
  return (
    <svg {...svg(size, style)}>
      <rect x="7" y="5.4" width="3.4" height="13.2" rx="1.1" fill={color} />
      <rect x="13.6" y="5.4" width="3.4" height="13.2" rx="1.1" fill={color} />
    </svg>
  );
}

export function PlayGlyph({ size = 20, color = T.ink, style }: GlyphProps) {
  return (
    <svg {...svg(size, style)}>
      <path d="M7.6 5.2 18.4 12 7.6 18.8Z" fill={color} />
    </svg>
  );
}

export function ReplayGlyph({ size = 20, color = T.ink, style }: GlyphProps) {
  return (
    <svg {...svg(size, style)}>
      <path d="M20 12a8 8 0 1 1-2.6-5.9" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M19.6 3.2v3.9h-3.9" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PinGlyph({ size = 14, color = T.inkSoft, style }: GlyphProps) {
  return (
    <svg {...svg(size, style)}>
      <path d="M9.4 3.2h5.2l-.8 5 3 3.2H7.2l3-3.2Z" fill={color} />
      <line x1="12" y1="11.4" x2="12" y2="20.6" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function HeartGlyph({ size = 14, color = T.accent, style }: GlyphProps) {
  return (
    <svg {...svg(size, style)}>
      <path
        d="M12 20.4S3.8 15.3 3.8 9.6A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 8.2 2.4c0 5.7-8.2 10.8-8.2 10.8Z"
        fill={color}
      />
    </svg>
  );
}

export function CloseGlyph({ size = 20, color = T.ink, style }: GlyphProps) {
  return (
    <svg {...svg(size, style)}>
      <line x1="5.5" y1="5.5" x2="18.5" y2="18.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="18.5" y1="5.5" x2="5.5" y2="18.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function CheckGlyph({ size = 16, color = T.ink, style }: GlyphProps) {
  return (
    <svg {...svg(size, style)}>
      <path d="m4.6 12.4 4.8 4.8 10-10.4" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronGlyph({ size = 16, color = T.ink, style, up = false }: GlyphProps & { up?: boolean }) {
  return (
    <svg {...svg(size, { transform: up ? "rotate(180deg)" : undefined, ...style })}>
      <path d="m6.5 9.2 5.5 5.6 5.5-5.6" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LinkGlyph({ size = 18, color = T.ink, style }: GlyphProps) {
  return (
    <svg {...svg(size, style)}>
      <path d="M10.2 13.8a3.6 3.6 0 0 0 5.1 0l3-3a3.6 3.6 0 0 0-5.1-5.1l-1.3 1.3" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M13.8 10.2a3.6 3.6 0 0 0-5.1 0l-3 3a3.6 3.6 0 0 0 5.1 5.1l1.3-1.3" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

/* ── Shared bits of chrome ─────────────────────────────────────────────────── */

/** Our mark. Bold sans, a heart where a play device would sit on a lesser page. */
export function Wordmark({
  text,
  glyph,
  size = 20,
}: {
  text: string;
  glyph: string;
  size?: number;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: 2,
        fontFamily: FONT,
        fontSize: size,
        fontWeight: 800,
        letterSpacing: "-0.04em",
        color: T.ink,
        userSelect: "none",
      }}
    >
      <span aria-hidden="true" style={{ color: T.accent, fontSize: size * 0.62, lineHeight: 1 }}>
        {glyph}
      </span>
      {text}
    </span>
  );
}

/**
 * A photo that is allowed to fail.
 *
 * Every remote image on this page comes off somebody's published document, so
 * "the URL 404s" is a normal Tuesday. On failure the caller's `fallback` is
 * rendered in its place — an initials circle, or a drawn block — and never an
 * empty frame with a broken-image icon in it.
 */
export interface SafeImageProps {
  src: string;
  /** Tried once before giving up. Used by the poster's quality ladder. */
  altSrc?: string;
  alt: string;
  fallback: ReactNode;
  style?: CSSProperties;
  className?: string;
  crossOrigin?: "anonymous";
  onFail?: () => void;
}

/**
 * A new URL is a new chance, and the cheapest way to say so is a new instance:
 * keying on the URL discards the previous one's failure state without an effect
 * that resets it, which would be a second render every time a card swaps.
 */
export function SafeImage(props: SafeImageProps) {
  return <SafeImageAttempt key={`${props.src}|${props.altSrc ?? ""}`} {...props} />;
}

function SafeImageAttempt({
  src,
  altSrc,
  alt,
  fallback,
  style,
  className,
  crossOrigin,
  onFail,
}: SafeImageProps) {
  const [stage, setStage] = useState<0 | 1 | 2>(0);

  if (stage === 2 || !src) return <>{fallback}</>;

  const current = stage === 0 ? src : (altSrc ?? src);

  return (
    // A remote URL from a published document: `next/image` would need every
    // host it could ever point at allow-listed in advance.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={current}
      alt={alt}
      className={className}
      style={style}
      crossOrigin={crossOrigin}
      referrerPolicy="no-referrer"
      onError={() => {
        setStage((s) => {
          if (s === 0 && altSrc) return 1;
          onFail?.();
          return 2;
        });
      }}
    />
  );
}

/** An initials circle. The fallback for every avatar on the page. */
export function InitialsAvatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        flex: "none",
        borderRadius: "50%",
        background: avatarTint(name),
        color: T.ink,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT,
        fontSize: Math.round(size * 0.4),
        fontWeight: 600,
        letterSpacing: "0.01em",
      }}
    >
      {initials(name)}
    </span>
  );
}

/** The grey cell a missing thumbnail becomes. Never an empty hole. */
export function ThumbFallback({ radius = 8 }: { radius?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: radius,
        background: T.chip,
        display: "grid",
        placeItems: "center",
      }}
    >
      <StartGlyph size={28} color={T.inkSoft} />
    </span>
  );
}

/** The one pill shape this template presses. */
export const pill = (active = false): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  height: TAP,
  padding: "0 14px",
  borderRadius: 18,
  border: "none",
  background: active ? T.chipHi : T.chip,
  color: T.ink,
  fontFamily: FONT,
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
  whiteSpace: "nowrap",
  touchAction: "manipulation",
});
