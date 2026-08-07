"use client";

// ─── loveकार्ट — surface tokens, glyphs and the arithmetic ───────────────────
//
// Everything visual and everything numeric that more than one section needs.
// Nothing here renders a section; nothing here fetches.
//
// ── BRAND ────────────────────────────────────────────────────────────────────
// The listing CONVENTIONS are reproduced; the marks are not. No borrowed
// device, no licensed typeface — the stack below is the platform system stack.
// The wordmark is WORDMARK from ./types.ts and the only thing drawn under it is
// the heart in `HeartMark`, which we draw ourselves, below.
//
// ── THE MONEY RULE ───────────────────────────────────────────────────────────
// No function in this file touches `price.amount`, `price.original` or
// `bundle[].price`. They are strings, the demo amount is "∞", and a parse
// anywhere on that path renders "NaN" on the most-looked-at line of the page.

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ProductData, QA, Review, Spec } from "./types";

/* ── Palette ───────────────────────────────────────────────────────────────── */

export const C = {
  header: "#131A22",
  subHeader: "#232F3E",
  page: "#FFFFFF",
  section: "#F7F8F8",
  border: "#D5D9D9",
  star: "#F5A623",
  priceRed: "#C7431F",
  ctaYellow: "#FFD866",
  ctaOrange: "#FFA544",
  link: "#016E8F",
  text: "#0F1111",
  secondary: "#565959",
  /** In-stock green. The stock line flips to `priceRed` for the "only 1" joke. */
  green: "#007600",
  /** Histogram track. Lighter than `border` so the bar reads at 20px. */
  track: "#F0F2F2",
  /** The gallery rail's active state. */
  activeEdge: "#E77600",
  activeTint: "#FEF3E7",
} as const;

export const FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';

/** Only the "from the seller" block breaks into serif. That break is the point. */
export const SERIF = 'Georgia, "Times New Roman", Times, serif';

/* ── Motion ────────────────────────────────────────────────────────────────── */

/**
 * A media query as a value.
 *
 * `useSyncExternalStore` rather than an effect that calls `setState`: the
 * matcher IS an external store, React 19 lint forbids the setState-in-effect
 * shape, and this version has no first-paint flash of the wrong branch beyond
 * the unavoidable server default. The server snapshot is `false`, so the page
 * renders its no-hover, no-reduce form and corrects on hydration.
 */
function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {};
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    [query]
  );
  const snapshot = useCallback(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
    return window.matchMedia(query).matches;
  }, [query]);
  return useSyncExternalStore(subscribe, snapshot, () => false);
}

/**
 * True when the visitor asked for less movement.
 *
 * Every animated thing on this page consults it and every one of them still
 * WORKS with it on: the count-up jumps to the answer, the bars are already at
 * width, new reviews are simply there. Nothing is gated on an animation ending.
 */
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/**
 * True on a pointer that can actually hover. Gates the gallery's zoom panel —
 * on a touch screen there is no "roll over", and the panel would just eat the
 * tap that was meant to change the photo.
 */
export function useCanHover(): boolean {
  return useMediaQuery("(hover: hover) and (pointer: fine)");
}

/** True while the viewport is at least `px` wide. */
export function useMinWidth(px: number): boolean {
  return useMediaQuery(`(min-width: ${px}px)`);
}

/**
 * Animates a number towards `target`.
 *
 * The previous value is read from a ref that is written AFTER every commit, so
 * nothing reads a ref during render and the interpolation always starts from
 * what was actually on screen. `enabled: false` (reduced motion, or the very
 * first paint) returns the target immediately.
 */
export function useCountUp(target: number, enabled: boolean, ms = 650): number {
  const [value, setValue] = useState(target);

  /** What is actually on screen. Written after every commit, read in effects. */
  const shown = useRef(target);
  useEffect(() => {
    shown.current = enabled ? value : target;
  });

  useEffect(() => {
    // Disabled is not a state to synchronise — the hook simply returns the
    // target below, so there is nothing to set here.
    if (!enabled) return;

    const from = shown.current;
    let raf = 0;

    // Already there (or near enough that a 650ms tween would be a stutter):
    // land on the exact number in one frame and stop.
    if (Math.abs(from - target) < 0.05) {
      raf = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(raf);
    }

    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / ms);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(p < 1 ? from + (target - from) * eased : target);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, enabled, ms]);

  return enabled ? value : target;
}

/* ── Glyphs — every one drawn here, generically. No icon library. ──────────── */

type GlyphProps = { size?: number; color?: string; className?: string };

/** The mark under the wordmark. Deliberately wobbly — it is meant to look drawn. */
export function HeartMark({ width = 46, color = C.ctaOrange }: { width?: number; color?: string }) {
  return (
    <svg
      width={width}
      height={width * 0.34}
      viewBox="0 0 46 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
      style={{ display: "block" }}
    >
      <path
        d="M3 8.4c5.6-4.6 11-6 15.3-4.2 2.2.9 3.4 2.4 4.5 4.6 1-2.5 2.4-4.2 4.8-5 4.3-1.4 9.6.6 15 5.4"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M22.8 8.8c-1.1 2.1-2.4 3.6-4.1 4.7 2.5.5 4.6.1 6.4-1.2-1-.9-1.8-2-2.3-3.5z"
        fill={color}
      />
    </svg>
  );
}

export function PinGlyph({ size = 13, color = "#FFFFFF" }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" style={{ display: "block", flex: "none" }}>
      <path
        d="M12 22s7-6.3 7-12a7 7 0 1 0-14 0c0 5.7 7 12 7 12z"
        fill="none"
        stroke={color}
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.6" fill="none" stroke={color} strokeWidth="1.9" />
    </svg>
  );
}

export function SearchGlyph({ size = 18, color = C.text }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" style={{ display: "block" }}>
      <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke={color} strokeWidth="2" />
      <path d="M15.4 15.4 21 21" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function CartGlyph({ size = 26, color = "#FFFFFF" }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 26" aria-hidden="true" focusable="false" style={{ display: "block" }}>
      <path
        d="M2 3h4.2l3.1 12.4h13.4L26 6.6H8.4"
        fill="none"
        stroke={color}
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="21" r="2.1" fill={color} />
      <circle cx="21.5" cy="21" r="2.1" fill={color} />
    </svg>
  );
}

export function ChevronDown({ size = 12, color = C.text }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden="true" focusable="false" style={{ display: "block", flex: "none" }}>
      <path d="M2 4.2 6 8.2l4-4" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LockGlyph({ size = 13, color = C.link }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" style={{ display: "block", flex: "none" }}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2" fill="none" stroke={color} strokeWidth="2" />
      <path d="M8.2 10.5V7.8a3.8 3.8 0 0 1 7.6 0v2.7" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function CaretGlyph({ size = 16, color = C.secondary, up = true }: GlyphProps & { up?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true" focusable="false" style={{ display: "block" }}>
      <path d={up ? "M8 3.5 14 12H2z" : "M8 12.5 2 4h12z"} fill={color} />
    </svg>
  );
}

/** The grey cell a broken or missing photo becomes. Never a broken-image icon. */
export function ImageGlyph({ size = 30, color = "#B4B9B9" }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" style={{ display: "block" }}>
      <rect x="2.5" y="4.5" width="19" height="15" rx="2" fill="none" stroke={color} strokeWidth="1.8" />
      <circle cx="8.5" cy="9.5" r="1.8" fill={color} />
      <path d="M3.5 17.5 9 12l3.4 3.2L16 11.5l4.5 6" fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Photos ────────────────────────────────────────────────────────────────── */

/**
 * An <img> that cannot break the layout.
 *
 * A missing src, a 404 or a hotlink block all land on the same grey cell with
 * an image glyph in it. The failure is tracked BY URL rather than as a boolean,
 * so switching to a photo that works clears it without an effect and without
 * setting state during render.
 *
 * `next/image` is not usable here: these URLs come off a published document and
 * can point at any host the sender uploaded through.
 */
export function Photo({
  src,
  alt,
  radius = 0,
  fit = "cover",
  background = C.section,
  glyphSize = 30,
  draggable,
}: {
  src?: string;
  alt: string;
  radius?: number;
  fit?: "cover" | "contain";
  background?: string;
  glyphSize?: number;
  draggable?: boolean;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const broken = !src || failedSrc === src;

  const box: React.CSSProperties = {
    width: "100%",
    height: "100%",
    borderRadius: radius,
    background,
    display: "block",
  };

  if (broken) {
    return (
      <span
        role="img"
        aria-label={alt}
        style={{ ...box, display: "grid", placeItems: "center", border: `1px solid ${C.border}` }}
      >
        <ImageGlyph size={glyphSize} />
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      draggable={draggable}
      onError={() => setFailedSrc(src)}
      style={{ ...box, objectFit: fit }}
    />
  );
}

/* ── Tolerant shape helpers ────────────────────────────────────────────────── */
//
// The AI fill schema declares `specs` and `qa` as LISTS OF STRINGS — "Label:
// Value" and "Question | Answer" — because a model writes flat text far better
// than it writes nested objects. The frozen contract stores them as objects.
// These two functions are the seam, and they are applied in three places: on
// the way out of the fill, on the way into a render, and on the way into the
// wire body. Splitting on the FIRST separator only, so a value may contain
// further colons and an answer may contain further pipes.

const isRecord = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);

/** `"Brand: Sharma"` → `{ label: "Brand", value: "Sharma" }`. First colon wins. */
export function splitSpecLine(line: string): Spec | null {
  const at = line.indexOf(":");
  if (at < 0) {
    const only = line.trim();
    return only ? { label: only, value: "—" } : null;
  }
  const label = line.slice(0, at).trim();
  const value = line.slice(at + 1).trim();
  if (!label || !value) return null;
  return { label, value };
}

/** `"Q | A"` → `{ question, answer }`. First pipe wins. */
export function splitQaLine(line: string): { question: string; answer: string } | null {
  const at = line.indexOf("|");
  if (at < 0) return null;
  const question = line.slice(0, at).trim();
  const answer = line.slice(at + 1).trim();
  if (!question || !answer) return null;
  return { question, answer };
}

export function normalizeSpecs(raw: unknown): Spec[] {
  if (!Array.isArray(raw)) return [];
  const out: Spec[] = [];
  for (const entry of raw) {
    if (typeof entry === "string") {
      const row = splitSpecLine(entry);
      if (row) out.push(row);
      continue;
    }
    if (isRecord(entry)) {
      const label = typeof entry.label === "string" ? entry.label.trim() : "";
      const value = typeof entry.value === "string" ? entry.value.trim() : "";
      if (label && value) out.push({ label, value });
    }
  }
  return out;
}

export function normalizeQa(raw: unknown, defaultBy: string): QA[] {
  if (!Array.isArray(raw)) return [];
  const out: QA[] = [];
  for (const entry of raw) {
    if (typeof entry === "string") {
      const parsed = splitQaLine(entry);
      if (parsed) out.push({ ...parsed, by: defaultBy || "Anonymous", ago: "", votes: 0 });
      continue;
    }
    if (isRecord(entry)) {
      const question = typeof entry.question === "string" ? entry.question.trim() : "";
      const answer = typeof entry.answer === "string" ? entry.answer.trim() : "";
      if (!question || !answer) continue;
      out.push({
        question,
        answer,
        by: (typeof entry.by === "string" && entry.by.trim()) || defaultBy || "Anonymous",
        ago: typeof entry.ago === "string" ? entry.ago : "",
        votes: typeof entry.votes === "number" && Number.isFinite(entry.votes) ? Math.max(0, Math.trunc(entry.votes)) : 0,
      });
    }
  }
  return out;
}

/**
 * The one place a `ProductData` is made safe to render AND safe to send.
 *
 * Called on every AI fill result, before every wire body, and at the top of the
 * template. Idempotent — objects in, the same objects out.
 */
export function normalizeProductData(data: ProductData): ProductData {
  const specs = normalizeSpecs(data.specs);
  const qa = normalizeQa(data.qa, data.sender?.firstName ?? "");
  if (specs.length === data.specs.length && qa.length === data.qa.length) {
    // Fast path: already objects. Rebuild anyway only if something changed.
    const specsSame = specs.every((s, i) => {
      const cur = data.specs[i] as unknown;
      return isRecord(cur) && cur.label === s.label && cur.value === s.value;
    });
    const qaSame = qa.every((q, i) => {
      const cur = data.qa[i] as unknown;
      return isRecord(cur) && cur.question === q.question && cur.answer === q.answer;
    });
    if (specsSame && qaSame) return data;
  }
  return { ...data, specs, qa };
}

/* ── The review arithmetic ─────────────────────────────────────────────────── */

export interface Aggregate {
  /** How many published reviews there are. Zero is a real, handled answer. */
  count: number;
  /** Mean of published stars, one decimal, half-up. 0 when count is 0. */
  average: number;
  /** Index 0 is 1★ … index 4 is 5★. */
  buckets: [number, number, number, number, number];
  /** Whole-number percentages, index-aligned with `buckets`, summing to 100. */
  percents: [number, number, number, number, number];
}

const EMPTY_AGGREGATE: Aggregate = {
  count: 0,
  average: 0,
  buckets: [0, 0, 0, 0, 0],
  percents: [0, 0, 0, 0, 0],
};

/**
 * Whole percentages that sum to EXACTLY 100.
 *
 * Naive rounding of five buckets routinely produces 99 or 101, which is the
 * kind of thing nobody notices for a month and then cannot un-notice. Largest
 * remainder: floor everything, then hand the leftover points to the rows with
 * the biggest discarded fraction, ties broken by index so it is deterministic.
 */
function percentagesTo100(
  buckets: readonly number[],
  total: number
): [number, number, number, number, number] {
  const out: [number, number, number, number, number] = [0, 0, 0, 0, 0];
  if (total <= 0) return out;

  const exact = buckets.map((b) => (b / total) * 100);
  let assigned = 0;
  for (let i = 0; i < 5; i += 1) {
    out[i] = Math.floor(exact[i] ?? 0);
    assigned += out[i];
  }

  const order = exact
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac || a.i - b.i);

  let leftover = 100 - assigned;
  for (let k = 0; leftover > 0 && k < order.length; k += 1) {
    out[order[k].i] += 1;
    leftover -= 1;
  }
  return out;
}

/** Half-up to one decimal. `Math.round` is already half-up for positives. */
export const oneDecimal = (n: number): number => Math.round(n * 10) / 10;

/** "4.9" / "5" — never "5.0", never "4.90". */
export const spokenAverage = (n: number): string =>
  Number.isInteger(n) ? String(n) : n.toFixed(1);

/** Mean, buckets and adjusted percentages over the reviews handed in. */
export function aggregateOf(reviews: readonly Review[]): Aggregate {
  if (reviews.length === 0) return EMPTY_AGGREGATE;
  const buckets: [number, number, number, number, number] = [0, 0, 0, 0, 0];
  let total = 0;
  for (const r of reviews) {
    buckets[r.stars - 1] += 1;
    total += r.stars;
  }
  return {
    count: reviews.length,
    average: oneDecimal(total / reviews.length),
    buckets,
    percents: percentagesTo100(buckets, reviews.length),
  };
}

/* ── Small shared bits ─────────────────────────────────────────────────────── */

/**
 * A muted avatar colour seeded from the name.
 *
 * Deterministic so the same person keeps the same disc across a refresh, and
 * pinned to a low-saturation band so twelve of them in a column read as a list
 * rather than a paint chart. Duplicate names getting the same colour is fine —
 * they are the same string, and the page appends nothing to disambiguate them.
 */
export function avatarColour(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  const hue = hash % 360;
  return `hsl(${hue} 26% 62%)`;
}

/** Anything a long unbroken paste could otherwise push off the side of the page. */
export const WRAP: React.CSSProperties = { overflowWrap: "anywhere", wordBreak: "normal" };

/** The blue text link used a dozen times. */
export function LinkText({
  children,
  onClick,
  href,
  size = 13,
  bold,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  size?: number;
  bold?: boolean;
}) {
  const style: React.CSSProperties = {
    color: C.link,
    fontSize: size,
    fontFamily: FONT,
    fontWeight: bold ? 700 : 400,
    background: "none",
    border: "none",
    padding: 0,
    textAlign: "left",
    cursor: "pointer",
    textDecoration: "none",
    ...WRAP,
  };
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" style={style}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} style={style}>
      {children}
    </button>
  );
}

/** A stable id maker for sections we scroll to. */
export const SECTION_IDS = {
  reviews: "lk-customer-reviews",
  writeReview: "lk-write-review",
  specs: "lk-product-details",
  qa: "lk-questions",
} as const;

/** Scrolls to a section, honouring reduced motion. */
export function useScrollToSection(reduced: boolean) {
  return useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    },
    [reduced]
  );
}
