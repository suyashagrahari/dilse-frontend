"use client";

import { useEffect, useState } from "react";
import { countdownTo, type Countdown } from "./types";

// Live "until I hold you again" countdown. Starts null on the server and fills in
// on mount to avoid a hydration mismatch (the tick is client-only).
export default function ReunionCountdown({ targetIso, label }: { targetIso: string; label: string }) {
  const [time, setTime] = useState<Countdown | null>(null);

  useEffect(() => {
    if (!targetIso) return;
    const update = () => setTime(countdownTo(targetIso));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  if (time?.done) {
    return (
      <div className="text-center">
        <p className="mu-script text-3xl mu-rose-deep sm:text-4xl">the waiting is over 🤍</p>
        <p className="mu-serif mt-1 text-base mu-muted">go hold them.</p>
      </div>
    );
  }

  const cells = [
    { v: time?.days ?? 0, l: "days" },
    { v: time?.hours ?? 0, l: "hours" },
    { v: time?.minutes ?? 0, l: "minutes" },
    { v: time?.seconds ?? 0, l: "seconds" },
  ];

  return (
    <div className="text-center">
      <p className="mu-script text-2xl mu-rose-deep sm:text-3xl">{label}</p>
      <div className="mt-4 grid grid-cols-4 gap-2 sm:gap-3">
        {cells.map((c) => (
          <div
            key={c.l}
            className="rounded-2xl px-1 py-3 sm:py-4"
            style={{ background: "var(--mu-blush)", border: "1px solid var(--mu-paper-edge)", boxShadow: "var(--mu-shadow-soft)" }}
          >
            <div className="mu-serif text-3xl font-semibold tabular-nums mu-rose-deep sm:text-5xl" style={{ fontStyle: "normal" }}>
              {time ? String(c.v).padStart(2, "0") : "--"}
            </div>
            <div className="mt-1 text-[10px] uppercase tracking-widest mu-sepia sm:text-xs">{c.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
