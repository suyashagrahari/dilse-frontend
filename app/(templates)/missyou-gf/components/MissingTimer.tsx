"use client";

import { useEffect, useState } from "react";

// A live COUNT-UP timer — how long since the missing began (data.sinceDate). Ticks
// every second, client-only (null on server) to avoid a hydration mismatch.
function elapsed(sinceIso: string, now: number) {
  const start = new Date(sinceIso).getTime();
  if (Number.isNaN(start)) return null;
  let diff = Math.max(0, Math.floor((now - start) / 1000));
  const days = Math.floor(diff / 86400); diff -= days * 86400;
  const hours = Math.floor(diff / 3600); diff -= hours * 3600;
  const minutes = Math.floor(diff / 60);
  const seconds = diff - minutes * 60;
  return { days, hours, minutes, seconds };
}

export default function MissingTimer({ sinceIso, petName }: { sinceIso: string; petName: string }) {
  const [t, setT] = useState<ReturnType<typeof elapsed>>(null);

  useEffect(() => {
    if (!sinceIso) return;
    const tick = () => setT(elapsed(sinceIso, Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [sinceIso]);

  const cells = [
    { v: t?.days ?? 0, l: "days" },
    { v: t?.hours ?? 0, l: "hrs" },
    { v: t?.minutes ?? 0, l: "min" },
    { v: t?.seconds ?? 0, l: "sec" },
  ];

  return (
    <div className="text-center">
      <p className="mu-script text-2xl mu-rose-deep sm:text-3xl">i&apos;ve been missing you for</p>
      <div className="mt-4 grid grid-cols-4 gap-2 sm:gap-3">
        {cells.map((c) => (
          <div
            key={c.l}
            className="rounded-2xl px-1 py-3 sm:py-4"
            style={{ background: "var(--mu-blush)", border: "1px solid var(--mu-paper-edge)", boxShadow: "var(--mu-shadow-soft)" }}
          >
            <div className="mu-serif text-3xl font-semibold tabular-nums mu-rose-deep sm:text-5xl" style={{ fontStyle: "normal" }}>
              {t ? String(c.v).padStart(2, "0") : "--"}
            </div>
            <div className="mt-1 text-[10px] uppercase tracking-widest mu-sepia sm:text-xs">{c.l}</div>
          </div>
        ))}
      </div>
      <p className="mu-serif mt-3 text-sm mu-muted">…and every second is one closer to {petName}.</p>
    </div>
  );
}
