"use client";
// ─── <Countdown> — live days · hours · minutes · seconds to the muhurat ──────
//
//   <Countdown date="2026-12-12" time="19:30" variant="flip" />
//
// variant "flip" — split-flap cards that fold over on every change (Premium /
// Royal); "roll" — digits roll up (Normal); "plain" — no motion. Reduced motion
// always renders "plain". Ticks once a second via a shared external store, so
// many countdowns on a page cost one timer.

import { useSyncExternalStore } from "react";
import { DEFAULT_TZ_OFFSET } from "../types";
import { eventStart } from "../ics";
import { useWeddingReducedMotion } from "../WeddingRoot";

export interface CountdownProps {
  /** "2026-12-12" */
  date: string;
  /** "19:30"; default 10:00. */
  time?: string;
  tz?: string;
  variant?: "flip" | "roll" | "plain";
  /** Unit labels (Hindi: { d: "दिन", h: "घंटे", m: "मिनट", s: "सेकंड" }). */
  labels?: { d: string; h: string; m: string; s: string };
  /** Shown once the moment has passed. */
  doneText?: string;
  /** Hide seconds (calmer). */
  hideSeconds?: boolean;
  className?: string;
}

// One ticking clock for every Countdown on the page.
let listeners = new Set<() => void>();
let timer: number | null = null;
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  if (timer === null) timer = window.setInterval(() => listeners.forEach((l) => l()), 1000);
  return () => {
    listeners.delete(cb);
    if (!listeners.size && timer !== null) {
      window.clearInterval(timer);
      timer = null;
      listeners = new Set();
    }
  };
};
const nowSec = () => Math.floor(Date.now() / 1000);

export function useNowSeconds(): number {
  return useSyncExternalStore(subscribe, nowSec, () => 0);
}

const pad = (n: number) => String(n).padStart(2, "0");
const dd = (n: number) => (n > 99 ? String(n) : pad(n));

function Unit({ value, prev, label, variant }: { value: string; prev: string; label: string; variant: "flip" | "roll" | "plain" }) {
  return (
    <div className="wk-cd-unit">
      {variant === "flip" ? (
        // Split-flap: the upper half shows the new value, the lower the old one;
        // the old upper half folds down, then the new lower half folds into place.
        <div className="wk-flip" key={value}>
          <span className="wk-flip-half wk-flip-up"><i>{value}</i></span>
          <span className="wk-flip-half wk-flip-down"><i>{prev}</i></span>
          <span className="wk-flip-half wk-flip-up wk-flip-a" aria-hidden><i>{prev}</i></span>
          <span className="wk-flip-half wk-flip-down wk-flip-b" aria-hidden><i>{value}</i></span>
          <span className="wk-sr">{value}</span>
        </div>
      ) : variant === "roll" ? (
        <div className="wk-roll">
          <span className="wk-roll-v" key={value}>{value}</span>
        </div>
      ) : (
        <div className="wk-roll">
          <span>{value}</span>
        </div>
      )}
      <span className="wk-cd-label">{label}</span>
    </div>
  );
}

export default function Countdown({
  date,
  time,
  tz = DEFAULT_TZ_OFFSET,
  variant = "flip",
  labels = { d: "Days", h: "Hours", m: "Minutes", s: "Seconds" },
  doneText = "The celebrations have begun",
  hideSeconds = false,
  className,
}: CountdownProps) {
  const now = useNowSeconds();
  const reduce = useWeddingReducedMotion();
  const target = eventStart(date, time, tz);
  if (!target) return null;
  const v = reduce ? "plain" : variant;
  const left = Math.max(0, Math.floor(target.getTime() / 1000) - now);
  // Server / first client render: a stable placeholder (no hydration mismatch).
  if (now === 0) return <div className={`wk-countdown is-idle${className ? ` ${className}` : ""}`} aria-hidden />;
  if (left === 0) return <p className={`wk-countdown-done wk-foil-text wk-shimmer${className ? ` ${className}` : ""}`}>{doneText}</p>;
  const d = Math.floor(left / 86400);
  const h = Math.floor((left % 86400) / 3600);
  const m = Math.floor((left % 3600) / 60);
  const s = left % 60;
  return (
    <div className={`wk-countdown wk-cd-${v}${className ? ` ${className}` : ""}`} role="timer" aria-label={`${d} ${labels.d}, ${h} ${labels.h}, ${m} ${labels.m} to go`}>
      <Unit value={dd(d)} prev={dd(d + 1)} label={labels.d} variant={v} />
      <span className="wk-cd-sep" aria-hidden>:</span>
      <Unit value={pad(h)} prev={pad((h + 1) % 24)} label={labels.h} variant={v} />
      <span className="wk-cd-sep" aria-hidden>:</span>
      <Unit value={pad(m)} prev={pad((m + 1) % 60)} label={labels.m} variant={v} />
      {!hideSeconds && (
        <>
          <span className="wk-cd-sep" aria-hidden>:</span>
          <Unit value={pad(s)} prev={pad((s + 1) % 60)} label={labels.s} variant={v} />
        </>
      )}
    </div>
  );
}
