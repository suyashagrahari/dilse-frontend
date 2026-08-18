"use client";

// ─── The letter, arriving one piece at a time ────────────────────────────────
//
// This is the reward. Every placed piece pays out a line here, so the panel has
// to read like a LETTER — warm paper, a serif face, real paragraph rhythm — and
// never like a log or a console.
//
// `revealed` is APPEND-ONLY. There is no branch in this file that shortens it,
// reorders it, or clears it. Lines are rendered in the order they arrived,
// newest last, exactly as the orchestrator handed them over.
//
// Progress is spoken as "8 of 12 pieces". Never a percentage, never a score,
// never a timer, never a deficit ("4 remaining"). The number only goes up.
//
// ONE component, TWO layouts. The parent has already resolved the breakpoint and
// passes a different `className` (a short flexible strip on mobile, a full-height
// column on wide screens). This file does not branch on a media query.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { INDIGO, INK, INK_SOFT, OUTFIT, PAPER, PAPER_EDGE, ROSE, SERIF } from "./puzzleTheme";

export interface LetterPanelProps {
  /** The full letter. Only the indices in `revealed` are shown. */
  lines: string[];
  /** Indices into `lines`, in reveal order. Append-only. */
  revealed: number[];
  placedCount: number;
  totalPieces: number;
  senderName: string;
  reducedMotion: boolean;
  /** Shown before the first piece lands. */
  placeholder: string;
  className?: string;
}

/** How far from the bottom still counts as "she is reading the newest line". */
const STICK_SLACK_PX = 56;

export default function LetterPanel({
  lines,
  revealed,
  placedCount,
  totalPieces,
  senderName,
  reducedMotion,
  placeholder,
  className,
}: LetterPanelProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  /**
   * True while she is parked at the bottom of the letter. Updated on every user
   * scroll, and therefore holds the PRE-append value when a new line lands —
   * which is exactly the question we need answered. If she has scrolled up to
   * re-read something, we leave her there.
   */
  const stickRef = useRef(true);
  const [masked, setMasked] = useState(false);

  // Defensive de-dupe: `revealed` is guarded upstream, but a duplicate index
  // would collide as a React key, and a letter must never stutter a line.
  const shown = useMemo(() => {
    const seen = new Set<number>();
    const out: number[] = [];
    for (const i of revealed) {
      if (seen.has(i)) continue;
      const text = lines[i];
      if (typeof text !== "string" || text.trim() === "") continue;
      seen.add(i);
      out.push(i);
    }
    return out;
  }, [revealed, lines]);

  const written = lines.filter((l) => typeof l === "string" && l.trim() !== "").length;
  const signed = written > 0 && shown.length >= written;

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight <= STICK_SLACK_PX;
    const next = el.scrollTop > 6;
    setMasked((m) => (m === next ? m : next));
  }, []);

  // Bring the newest line into view — smoothly, and only if she is already at
  // the bottom. Never a jump-scroll, never a yank back from where she scrolled.
  const count = shown.length;
  const prevCount = useRef(0);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const grew = count > prevCount.current;
    prevCount.current = count;
    if (!grew || !stickRef.current) return;
    const top = el.scrollHeight - el.clientHeight;
    if (top <= 0) return;
    if (reducedMotion) el.scrollTop = top;
    else el.scrollTo({ top, behavior: "smooth" });
  }, [count, signed, reducedMotion]);

  const still = reducedMotion ? " pp-still" : "";

  return (
    <div
      className={`pp-letter relative flex min-h-0 flex-col overflow-hidden rounded-[20px]${still} ${className ?? ""}`}
      style={{
        background: PAPER,
        border: `1px solid ${PAPER_EDGE}`,
        boxShadow: "0 8px 24px rgba(30,27,51,0.08)",
      }}
    >
      {/* Header: what this is, and how much of it has arrived. */}
      <div
        className="flex shrink-0 items-center justify-between gap-2 px-4 pb-1.5 pt-2.5"
        style={{ borderBottom: `1px solid rgba(231,227,245,0.7)` }}
      >
        <span
          className="text-[10px] font-semibold uppercase"
          style={{ color: INK_SOFT, fontFamily: OUTFIT, letterSpacing: "0.14em" }}
        >
          The letter
        </span>
        <span
          key={placedCount}
          className={`pp-pill${placedCount > 0 ? " pp-pill-tick" : ""} shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold`}
          style={{
            color: INDIGO,
            fontFamily: OUTFIT,
            background: "rgba(99,102,241,0.09)",
            border: "1px solid rgba(99,102,241,0.20)",
          }}
        >
          {placedCount} of {totalPieces} pieces
        </span>
      </div>

      {/* The paper itself. */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        aria-live="polite"
        className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-3.5"
        style={{
          overscrollBehavior: "contain",
          // A soft top edge so a scrolled line dissolves under the header
          // instead of being guillotined by it.
          maskImage: masked ? "linear-gradient(to bottom, transparent 0, #000 20px)" : undefined,
          WebkitMaskImage: masked ? "linear-gradient(to bottom, transparent 0, #000 20px)" : undefined,
        }}
      >
        {shown.length === 0 ? (
          <p
            className="pp-line text-[13.5px] italic"
            style={{
              color: INK_SOFT,
              fontFamily: SERIF,
              lineHeight: 1.7,
              wordBreak: "break-word",
              overflowWrap: "anywhere",
            }}
          >
            {placeholder}
          </p>
        ) : (
          <>
            {shown.map((i, n) => (
              <p
                key={i}
                className="pp-line text-[14.5px]"
                style={{
                  color: INK,
                  fontFamily: SERIF,
                  lineHeight: 1.7,
                  marginTop: n === 0 ? 0 : "0.72em",
                  wordBreak: "break-word",
                  overflowWrap: "anywhere",
                }}
              >
                {lines[i]}
              </p>
            ))}

            {signed && (
              <p
                key="pp-sign"
                className="pp-line text-right text-[14px] italic"
                style={{
                  color: INK,
                  fontFamily: SERIF,
                  lineHeight: 1.7,
                  marginTop: "1.35em",
                  opacity: 0.9,
                  wordBreak: "break-word",
                  overflowWrap: "anywhere",
                }}
              >
                — {senderName}
              </p>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        .pp-line {
          animation: pp-line-in 400ms cubic-bezier(0.22, 0.61, 0.36, 1) both;
        }
        @keyframes pp-line-in {
          from {
            opacity: 0;
            transform: translateY(7px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
        /* A small satisfying beat when the count changes. Not a counter roll. */
        .pp-pill-tick {
          animation: pp-tick 420ms cubic-bezier(0.34, 1.4, 0.5, 1) both;
        }
        @keyframes pp-tick {
          0% {
            transform: scale(1);
          }
          38% {
            transform: scale(1.09);
            border-color: ${ROSE};
            background: rgba(251, 113, 133, 0.16);
          }
          100% {
            transform: scale(1);
          }
        }
        .pp-letter.pp-still .pp-line,
        .pp-letter.pp-still .pp-pill-tick {
          animation: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .pp-line,
          .pp-pill-tick {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
