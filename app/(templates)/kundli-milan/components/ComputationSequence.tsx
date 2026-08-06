"use client";

// ─── Screen 2 — the computation ──────────────────────────────────────────────
//
// Four lines type in with deliberately IRREGULAR gaps, then a short hold, then
// the total counts up and lands in a double-ruled box.
//
// Nothing here computes anything. The total was fixed by `computeKundliReport`
// before this screen mounted; the count-up is theatre over a known number, so
// the same two birth dates always land on the same figure.
//
// It replays on every visit. That is intentional — it is the best part.

import { useEffect, useRef, useState } from "react";
import { templateMediaBase } from "@/lib/templateMedia";
import { KOOTA_TOTAL, type KundliReport } from "./types";
import { INK, MAROON, MONO, PAPER, plainButton, SERIF, SOFT_INK } from "./ui";

const ASSET = templateMediaBase("kundli-milan");

const LINES = [
  "Applying Lahiri ayanamsa",
  "Computing lunar longitude",
  "Casting Rashi chart",
  "Running Ashtakoota Milan",
];

/** Even intervals kill the tension. These do not. */
const GAPS = [700, 1100, 600, 900];

const CHAR_MS = 9;
const HOLD_MS = 500;
const COUNT_MS = 1400;
const VERDICT_MS = 26;
/** Dot leaders run out to this column, as a real printout's would. */
const LEADER_COL = 46;

const fullLine = (i: number): string => {
  const label = LINES[i];
  return `${label} ${".".repeat(Math.max(3, LEADER_COL - label.length))} done`;
};

/** Decelerating hard at the end — the number should look like it is settling. */
const easeOutQuint = (t: number): number => 1 - Math.pow(1 - t, 5);

export default function ComputationSequence({
  report,
  reduced,
  onDone,
}: {
  report: KundliReport;
  reduced: boolean;
  onDone: () => void;
}) {
  const [typed, setTyped] = useState<string[]>(["", "", "", ""]);
  const [counting, setCounting] = useState(false);
  const [count, setCount] = useState(0);
  const [landed, setLanded] = useState(false);
  const [verdictLen, setVerdictLen] = useState(0);

  const verdict = `MATCH: ${report.grade}`;
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    // prefers-reduced-motion: skip the typing and the count-up entirely.
    if (reduced) {
      onDoneRef.current();
      return;
    }

    let cancelled = false;
    let raf = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.push(setTimeout(resolve, ms));
      });

    (async () => {
      for (let i = 0; i < LINES.length; i++) {
        const full = fullLine(i);
        for (let c = 1; c <= full.length; c++) {
          if (cancelled) return;
          const slice = full.slice(0, c);
          setTyped((prev) => {
            const next = prev.slice();
            next[i] = slice;
            return next;
          });
          await sleep(CHAR_MS);
        }
        await sleep(GAPS[i]);
        if (cancelled) return;
      }

      await sleep(HOLD_MS);
      if (cancelled) return;
      setCounting(true);

      const start = performance.now();
      const tick = (now: number) => {
        if (cancelled) return;
        const t = Math.min(1, (now - start) / COUNT_MS);
        setCount(Math.round(easeOutQuint(t) * report.total));
        if (t < 1) {
          raf = requestAnimationFrame(tick);
        } else {
          setCount(report.total);
          setLanded(true);
          for (let c = 1; c <= verdict.length; c++) {
            timers.push(setTimeout(() => setVerdictLen(c), c * VERDICT_MS));
          }
        }
      };
      raf = requestAnimationFrame(tick);
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
    };
    // Re-runs whenever the report identity changes — a new match, a new show.
  }, [reduced, report.seed, report.total, verdict.length]);

  if (reduced) return null;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 460,
        margin: "0 auto",
        padding: "0 6px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Surrounding UI only. Never inside a captured node. Animated WebP, so
          it must be an <img> — it will not play in a <video>. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${ASSET}/computing.webp`}
        alt=""
        aria-hidden
        width={104}
        height={104}
        style={{ width: 104, height: 104, objectFit: "contain", marginBottom: 10 }}
      />

      <div
        style={{
          width: "100%",
          border: `1px solid ${INK}`,
          background: PAPER,
          padding: "12px 12px 14px",
          boxSizing: "border-box",
        }}
      >
        <pre
          style={{
            margin: 0,
            fontFamily: MONO,
            fontSize: 11,
            lineHeight: 1.75,
            color: INK,
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            minHeight: 76,
          }}
          aria-live="polite"
        >
          {typed.filter(Boolean).join("\n")}
          {!landed && !counting && <span style={{ opacity: 0.55 }}>_</span>}
        </pre>

        {counting && (
          <div style={{ marginTop: 14, textAlign: "center" }}>
            <div
              style={{
                display: "inline-block",
                border: landed ? `2px double ${MAROON}` : "2px double transparent",
                padding: landed ? "6px 20px" : "6px 20px",
                transition: "border-color 140ms linear",
              }}
            >
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 62,
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: 2,
                  color: landed ? MAROON : INK,
                }}
              >
                {count}
              </span>
              <span style={{ fontFamily: MONO, fontSize: 20, color: SOFT_INK }}> / {KOOTA_TOTAL}</span>
            </div>

            <div
              style={{
                marginTop: 10,
                minHeight: 18,
                fontFamily: MONO,
                fontSize: 13,
                letterSpacing: 1.2,
                color: INK,
              }}
            >
              {verdict.slice(0, verdictLen)}
              {verdictLen > 0 && verdictLen < verdict.length && <span style={{ opacity: 0.55 }}>_</span>}
            </div>
          </div>
        )}
      </div>

      {landed && verdictLen >= verdict.length && (
        <button type="button" onClick={onDone} style={{ ...plainButton, marginTop: 16 }}>
          View full report
        </button>
      )}

      <div style={{ marginTop: 10, fontFamily: SERIF, fontSize: 10.5, color: SOFT_INK }}>
        Ayanamsa: Lahiri · Chart style: North Indian
      </div>
    </div>
  );
}
