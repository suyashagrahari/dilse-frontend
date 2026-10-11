"use client";

// ─── Typewriter — text that types itself, skippably ──────────────────────────
//
// The FULL text is laid out invisibly underneath from the first frame, and the
// typed text sits on top of it in the same grid cell — so the box is its final
// height immediately and nothing below it jumps as it types. Pauses on
// punctuation, a "Skip ⏩" chip, tap-anywhere-to-finish, and reduced motion
// shows it all at once. Line breaks are kept (white-space: pre-wrap).
//
//   <Typewriter text={data.letter} speed={34} onDone={() => setDone(true)} style={{ fontFamily: FONTS.serif }} />

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "./useReducedMotion";

export interface TypewriterProps {
  text: string;
  /** ms per character. Default 34. */
  speed?: number;
  /** Start typing (lets a parent hold it until the letter is on screen). Default true. */
  start?: boolean;
  onDone?: () => void;
  /** Show the Skip chip. Default true. */
  skippable?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Colour of the caret. */
  caretColor?: string;
}

const pauseFor = (ch: string, speed: number) => (/[.!?…]/.test(ch) ? speed * 9 : /[,;:—]/.test(ch) ? speed * 4 : ch === "\n" ? speed * 6 : speed);

export default function Typewriter({ text, speed = 34, start = true, onDone, skippable = true, className, style, caretColor }: TypewriterProps) {
  const reduced = useReducedMotion();
  const [n, setN] = useState(0);
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const full = reduced || n >= text.length;

  useEffect(() => {
    doneRef.current = false;
    setN(0);
  }, [text]);

  useEffect(() => {
    if (!start || reduced || n >= text.length) return;
    const t = window.setTimeout(() => setN((x) => Math.min(text.length, x + 1)), pauseFor(text[n - 1] ?? "", speed));
    return () => window.clearTimeout(t);
  }, [n, start, reduced, text, speed]);

  useEffect(() => {
    if (start && full && !doneRef.current) {
      doneRef.current = true;
      onDoneRef.current?.();
    }
  }, [full, start]);

  const shown = full ? text : text.slice(0, n);

  return (
    <div className={className} style={{ position: "relative", display: "grid", ...style }} onClick={() => !full && setN(text.length)}>
      <span aria-hidden style={{ gridArea: "1 / 1", visibility: "hidden", whiteSpace: "pre-wrap" }}>
        {text}
      </span>
      <span style={{ gridArea: "1 / 1", whiteSpace: "pre-wrap" }} aria-label={text}>
        <span aria-hidden>{shown}</span>
        {!full && start && (
          <span aria-hidden style={{ display: "inline-block", width: 2, height: "1em", marginLeft: 1, verticalAlign: "-0.12em", background: caretColor ?? "currentColor", opacity: 0.7 }} />
        )}
      </span>
      {skippable && !full && start && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setN(text.length);
          }}
          style={{
            position: "sticky",
            bottom: 8,
            justifySelf: "end",
            alignSelf: "end",
            gridArea: "1 / 1",
            padding: "6px 12px",
            minHeight: 32,
            borderRadius: 99,
            border: "1px solid rgba(0,0,0,.08)",
            background: "rgba(255,255,255,.88)",
            color: "#3a2a30",
            font: "600 12px var(--vw-font-ui, system-ui)",
            cursor: "pointer",
          }}
        >
          Skip ⏩
        </button>
      )}
    </div>
  );
}
