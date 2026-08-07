"use client";

// ─── SCREEN 3 — processing ───────────────────────────────────────────────────
//
// The detail that sells the whole template, and the one screen where doing LESS
// work would be the bug. Four and a half seconds of a spinner and five lines of
// status text, one of which — "Do not press back or refresh" — is the most
// recognisable string in Indian digital payments. The wait IS the joke; it is
// not shortened, and it is not skippable.
//
// Three behaviours that are easy to get wrong and obvious when they are:
//
//   BACK. Pressing back during the wait does not cancel anything. A guard entry
//   is pushed onto the history stack on mount; the pop is caught, the screen
//   says "I said do not.", the entry is pushed straight back, and the sequence
//   carries on. That guard entry is deliberately LEFT on the stack when this
//   unmounts — the receipt screen consumes it, which is what stops a back press
//   from the receipt landing on the payment sheet and re-running a payment.
//
//   BACKGROUNDING. Timers in a hidden tab are throttled to whatever the browser
//   feels like, so the sequence pauses on `visibilitychange` and resumes from
//   the line it was on. Coming back to "Almost there…" three lines late reads
//   as a hang.
//
//   ROTATION. There is no listener on resize and no key tied to viewport size,
//   so turning the phone keeps the current line instead of restarting at
//   "Connecting to bank…".

import { useCallback, useEffect, useState } from "react";
import { ACCENT, BORDER, FONT, INK, MUTED } from "./ui";

/** 900ms apiece. Five lines, so 4.5 seconds. Do not shorten this. */
const STEP_MS = 900;

const LINES = [
  "Connecting to bank…",
  "Verifying…",
  "Do not press back or refresh",
  "Processing payment…",
  "Almost there…",
] as const;

export default function ProcessingScreen({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const [scolded, setScolded] = useState(false);

  // ── Pause while backgrounded ───────────────────────────────────────────────
  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // ── The back guard ─────────────────────────────────────────────────────────
  //
  // One entry, pushed once. The pop handler re-pushes it so a second, third and
  // fourth press are all caught too, and the sequence never learns about any of
  // them.
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.history.pushState({ rcGuard: true }, "", window.location.href);
    const onPop = () => {
      setScolded(true);
      window.history.pushState({ rcGuard: true }, "", window.location.href);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // ── The sequence ───────────────────────────────────────────────────────────
  //
  // One timeout at a time, re-armed on every step. Nothing is set during the
  // effect body — every write happens inside the timer callback — and the
  // cleanup makes a pause, an unmount and a re-arm all the same operation.
  const finish = useCallback(() => onDone(), [onDone]);

  useEffect(() => {
    if (paused) return;
    const t = window.setTimeout(() => {
      if (step < LINES.length - 1) setStep((s) => s + 1);
      else finish();
    }, STEP_MS);
    return () => window.clearTimeout(t);
  }, [step, paused, finish]);

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 28px",
        textAlign: "center",
      }}
    >
      {/* 48px indeterminate ring. Under reduced motion the CSS stops the spin
          and the arc simply sits there — the status text is what carries
          progress, and it keeps advancing either way. */}
      <svg width={48} height={48} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <circle cx="24" cy="24" r="20" fill="none" stroke={BORDER} strokeWidth="4" />
        <circle
          className="rc-spin"
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke={ACCENT}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="34 92"
        />
      </svg>

      <p
        role="status"
        aria-live="polite"
        style={{ margin: "22px 0 0", fontFamily: FONT, fontSize: 14, fontWeight: 500, color: INK, minHeight: 20 }}
      >
        {LINES[step]}
      </p>

      {scolded ? (
        <p style={{ margin: "10px 0 0", fontFamily: FONT, fontSize: 13, fontWeight: 600, color: ACCENT }}>
          I said do not.
        </p>
      ) : null}

      <p style={{ margin: "8px 0 0", fontFamily: FONT, fontSize: 11.5, lineHeight: 1.5, color: MUTED }}>
        This may take a moment. Please keep this page open.
      </p>
    </div>
  );
}
