// ─── StarRating — five stars, filled to the exact fraction ───────────────────
//
// THE ROUNDING IS THE PRODUCT. A page that says 4.7 and draws five solid stars
// is a page nobody believes, and once the stars are not believed the reviews
// under them are not believed either. So: no rounding to whole stars, none to
// half stars, no "nearest 0.1". The orange is clipped at the exact width the
// number asks for, and 4.7 is drawn as four stars and seven tenths of a fifth.
//
// ── HOW ──────────────────────────────────────────────────────────────────────
//
// Two identical rows of the same path, one on top of the other. The bottom row
// is grey and is the full width. The top row is orange, sits in an absolutely
// positioned box with `overflow: hidden`, and that box is the only thing the
// rating touches. Nothing is masked, no gradient, no per-star maths at render:
// one number becomes one width.
//
// The clip width is computed per star rather than as a flat `(rating/5) * 100%`
// because there is a gap between the stars. A flat percentage puts the edge of
// a 4.5 fill slightly past the middle of the fifth star, since the gaps eat
// into the percentage — visible at any size above about 20px. Walking whole
// stars first and then a fraction of the last one lands the edge exactly where
// the number says. With `gap: 0` the two are the same expression.
//
// ── NO ANIMATION, DELIBERATELY ───────────────────────────────────────────────
//
// There is nothing here to honour `prefers-reduced-motion` about: no count-up
// on the average, no fill transition, no press bounce. The hover and press
// preview is an instant colour change. A number that animates up to itself is
// the single most common way this component gets built and it is exactly the
// thing that reduced-motion users ask not to see.

"use client";

import { useCallback, useRef, useState } from "react";
import { CONTRIB_TAP, STAR_VALUES, type StarValue } from "@/lib/contrib/types";

/** The classic five-point star, in a 24×24 box. Inline — no icon library. */
const STAR_PATH =
  "M12 1.6l3.09 6.26 6.91 1.01-5 4.87 1.18 6.88L12 17.35l-6.18 3.27L7 13.74l-5-4.87 6.91-1.01L12 1.6z";

const DEFAULT_FILL = "#F5A623";
const DEFAULT_EMPTY = "#D5D9D9";

/** Gap between stars, as a fraction of one star. Kept in the clip maths above. */
const GAP_RATIO = 0.12;

export interface StarRatingProps {
  /**
   * 0–5, and NOT rounded on the way in. Values outside the range are clamped
   * (a corrupt average must not draw past the end of the row); everything
   * inside it is drawn as given.
   */
  rating: number;
  /** Star height in px. The row is five of these plus four gaps. */
  size?: number;
  /** Turns the row into a control: five tap targets, hover preview, keyboard. */
  interactive?: boolean;
  onRate?: (n: StarValue) => void;
  /**
   * Overrides the accessible name. Static default is "4.7 out of 5 stars";
   * interactive default is "Rate out of 5". Pass something specific when the
   * row appears twice on one screen.
   */
  label?: string;
  fillColor?: string;
  emptyColor?: string;
  className?: string;
}

/** One star. `aria-hidden` on every one of them — the row carries the name. */
function Star({ color, size }: { color: string; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      style={{ display: "block", flex: "none" }}
    >
      <path d={STAR_PATH} fill={color} />
    </svg>
  );
}

/**
 * Five stars in a row, at a fixed width.
 *
 * The width is pinned rather than left to the flexbox, because this row is also
 * the thing inside the clipping box — a row allowed to shrink to its container
 * would squash to the clip width instead of being cut off by it, which is a
 * squashed 4.7 rather than a partial one.
 */
function StarRow({
  color,
  size,
  gap,
  width,
}: {
  color: string;
  size: number;
  gap: number;
  width: number;
}) {
  return (
    <span style={{ display: "flex", gap, width, flex: "none", lineHeight: 0 }}>
      {STAR_VALUES.map((n) => (
        <Star key={n} color={color} size={size} />
      ))}
    </span>
  );
}

/** "4.7", "5" — how the number is said out loud. Never "4.70". */
function spoken(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export default function StarRating({
  rating,
  size = 16,
  interactive = false,
  onRate,
  label,
  fillColor = DEFAULT_FILL,
  emptyColor = DEFAULT_EMPTY,
  className,
}: StarRatingProps) {
  /**
   * The value under the pointer, or the one the arrow keys have walked to.
   *
   * Null means "show what is actually selected". It is separate from the
   * committed value so that moving away with the mouse, or tabbing out, puts
   * the real answer back rather than leaving a lie on screen.
   */
  const [preview, setPreview] = useState<StarValue | null>(null);

  /** Focus targets for the arrow keys. Written in a callback ref, never read in render. */
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  const clamped = Math.min(5, Math.max(0, Number.isFinite(rating) ? rating : 0));

  const gap = size * GAP_RATIO;
  const rowWidth = size * 5 + gap * 4;

  const commit = useCallback(
    (n: StarValue) => {
      setPreview(null);
      onRate?.(n);
    },
    [onRate]
  );

  // ── Interactive ────────────────────────────────────────────────────────────
  //
  // A person can only choose whole stars, so this branch draws whole stars —
  // the partial fill above exists to tell the truth about an average, and there
  // is no truth to tell about a value that has not been picked yet. The
  // incoming `rating` is rounded FOR THE HIGHLIGHT ONLY, so a control handed a
  // stored 4 highlights four.
  if (interactive) {
    const selected = Math.round(clamped) as 0 | StarValue;
    const shown = preview ?? selected;
    // Roving tabindex: exactly one button is in the tab order, and it is the
    // selected one so returning to the control lands on the current answer.
    const tabStop = selected || 1;

    const move = (next: StarValue) => {
      setPreview(next);
      buttons.current[next - 1]?.focus();
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      // 0 when nothing has been chosen yet, which both clamps below turn into
      // one star — so the first arrow press in either direction lands on 1★.
      const from: number = preview ?? selected;
      switch (e.key) {
        case "ArrowRight":
        case "ArrowUp":
          e.preventDefault();
          move(Math.min(5, from + 1) as StarValue);
          break;
        case "ArrowLeft":
        case "ArrowDown":
          e.preventDefault();
          move(Math.max(1, from - 1) as StarValue);
          break;
        case "Home":
          e.preventDefault();
          move(1);
          break;
        case "End":
          e.preventDefault();
          move(5);
          break;
        case "Enter":
        case " ":
          // The buttons handle Space and Enter themselves when one has focus;
          // this is the case where focus is on the group and a value has been
          // walked to but not yet chosen.
          if (preview) {
            e.preventDefault();
            commit(preview);
          }
          break;
        default:
          break;
      }
    };

    return (
      <div
        role="radiogroup"
        aria-label={label ?? "Rate out of 5"}
        className={className}
        onKeyDown={onKeyDown}
        onMouseLeave={() => setPreview(null)}
        onBlur={(e) => {
          // Only when focus has left the whole group — moving between the five
          // buttons must not flash the highlight back to the committed value.
          if (!e.currentTarget.contains(e.relatedTarget)) setPreview(null);
        }}
        style={{ display: "inline-flex", alignItems: "center" }}
      >
        {STAR_VALUES.map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={selected === n}
            aria-label={n === 1 ? "1 star" : `${n} stars`}
            tabIndex={tabStop === n ? 0 : -1}
            ref={(el) => {
              buttons.current[n - 1] = el;
            }}
            onClick={() => commit(n)}
            onMouseEnter={() => setPreview(n)}
            onFocus={() => setPreview(n)}
            style={{
              // 44px floor on every target: these are pressed with a thumb, and
              // five stars at 16px sit 2mm apart without it.
              minWidth: CONTRIB_TAP,
              minHeight: CONTRIB_TAP,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              margin: 0,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              touchAction: "manipulation",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <Star color={n <= shown ? fillColor : emptyColor} size={size} />
          </button>
        ))}
      </div>
    );
  }

  // ── Static ─────────────────────────────────────────────────────────────────

  const whole = Math.floor(clamped);
  const fraction = clamped - whole;
  // Whole stars carry their trailing gap; the last, partial one does not.
  const clipWidth = Math.min(rowWidth, whole * (size + gap) + fraction * size);

  return (
    <span
      role="img"
      aria-label={label ?? `${spoken(clamped)} out of 5 stars`}
      className={className}
      style={{
        position: "relative",
        display: "inline-flex",
        width: rowWidth,
        height: size,
        flex: "none",
        lineHeight: 0,
      }}
    >
      <StarRow color={emptyColor} size={size} gap={gap} width={rowWidth} />
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: size,
          width: clipWidth,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <StarRow color={fillColor} size={size} gap={gap} width={rowWidth} />
      </span>
    </span>
  );
}
