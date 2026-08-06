"use client";

// ─── The letter, assembling ──────────────────────────────────────────────────
//
// DOM, not canvas: it has to wrap a 140-character line, be selectable, and be
// read by a screen reader. It sits above the play field and looks like paper.
//
// It only ever GROWS. There is no branch in this file that shortens `revealed`.

import { useEffect, useRef } from "react";
import { INK, INK_SOFT, PAPER, PAPER_EDGE } from "./catchTheme";
import type { GoodItem } from "./types";

export interface LetterPanelProps {
  /** In arrival order. Appended to, never spliced. */
  revealed: GoodItem[];
  total: number;
  placeholder: string;
  className?: string;
}

export default function LetterPanel({ revealed, total, placeholder, className }: LetterPanelProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Keep the newest line visible.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [revealed.length]);

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl ${className ?? ""}`}
      style={{
        background: PAPER,
        border: `1px solid ${PAPER_EDGE}`,
        boxShadow: "0 6px 18px rgba(44,42,38,0.08)",
      }}
    >
      <div
        ref={scrollRef}
        aria-live="polite"
        className="h-full overflow-y-auto px-4 py-3"
        style={{ scrollBehavior: "smooth" }}
      >
        {revealed.length === 0 ? (
          <p
            className="text-[13px] italic leading-relaxed"
            style={{ color: INK_SOFT, fontFamily: "var(--font-tinos), Georgia, serif" }}
          >
            {placeholder}
          </p>
        ) : (
          <ul className="m-0 list-none space-y-2 p-0">
            {revealed.map((it) => (
              <li
                key={it.id}
                className="catch-line flex gap-2 text-[13.5px] leading-[1.55]"
                style={{ color: INK, fontFamily: "var(--font-tinos), Georgia, serif" }}
              >
                <span aria-hidden className="shrink-0 select-none opacity-70">
                  {it.emoji}
                </span>
                <span className="min-w-0 break-words">{it.line}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Quiet progress: dots, not a score. */}
      <div className="pointer-events-none absolute bottom-1.5 right-2.5 flex gap-[3px]">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className="block h-[3px] w-[3px] rounded-full"
            style={{ background: i < revealed.length ? "rgba(194,131,58,0.9)" : "rgba(44,42,38,0.16)" }}
          />
        ))}
      </div>

      <style jsx>{`
        .catch-line {
          animation: catch-line-in 400ms ease-out both;
        }
        @keyframes catch-line-in {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .catch-line {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
