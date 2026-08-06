// ─── The last seven days ─────────────────────────────────────────────────────
//
// Seven squares at the foot of the check-in screen. Enough history to feel like
// a thing in progress, not enough to become the archive — the archive is a
// separate screen precisely so the daily view stays small.
//
// A missed square is an empty outline. It is never red, never crossed out, and
// tapping it says nothing about why.

"use client";

import { useCallback, useState } from "react";
import {
  PALETTE,
  SERIF,
  UI,
  addDays,
  fmtDay,
  isComplete,
  isHalf,
  truncWord,
  type CheckInDay,
  type Side,
  type StreakData,
} from "./types";
import { other } from "./demoData";

const SQUARE = 40;

export interface WeekStripProps {
  data: StreakData;
  me: Side;
  today: string;
  /** The day that just completed — its square blooms once. */
  bloomDate?: string | null;
  reduced: boolean;
}

function tintFor(day: CheckInDay | undefined): { background: string; border: string; mark: boolean; half: boolean } {
  if (day?.covered) {
    return { background: PALETTE.accentWash, border: PALETTE.cover, mark: true, half: false };
  }
  if (isComplete(day)) {
    return { background: PALETTE.accent, border: PALETTE.accent, mark: false, half: false };
  }
  if (isHalf(day)) {
    return { background: PALETTE.accentWash, border: PALETTE.edge, mark: false, half: true };
  }
  return { background: "transparent", border: PALETTE.edge, mark: false, half: false };
}

export default function WeekStrip({ data, me, today, bloomDate, reduced }: WeekStripProps) {
  const [open, setOpen] = useState<string | null>(null);
  const toggle = useCallback((d: string) => setOpen((cur) => (cur === d ? null : d)), []);

  const dates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = addDays(today, -i);
    // Nothing before day one is rendered — an outline for a day that predates
    // the pair would read as a day they missed.
    if (d >= data.startedOn) dates.push(d);
  }

  const byDate = new Map(data.checkIns.map((d) => [d.date, d]));
  const openDay = open ? byDate.get(open) : undefined;
  const them = other(me);

  return (
    <div className="w-full">
      <div className="flex items-center justify-center" style={{ gap: 6 }}>
        {dates.map((date) => {
          const day = byDate.get(date);
          const t = tintFor(day);
          const isOpen = open === date;
          return (
            <button
              key={date}
              type="button"
              onClick={() => toggle(date)}
              aria-label={fmtDay(date, data.timezone)}
              aria-pressed={isOpen}
              className="relative grid place-items-center rounded-md"
              style={{
                // The visible square is 40px; the tap target is padded out to
                // the 44px floor on BOTH axes without making the row look
                // chunky. 7 × 44 + 6 × 6 = 344, which still fits 380 minus the
                // page gutters.
                width: 44,
                height: 44,
                background: "transparent",
                border: "none",
                padding: 0,
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  width: SQUARE,
                  height: SQUARE,
                  borderRadius: 7,
                  border: `1.5px solid ${isOpen ? PALETTE.ink : t.border}`,
                  // Half days are filled on one diagonal only — a day where one
                  // person showed up is not the same as a blank day, and it is
                  // not a failure either.
                  background: t.half
                    ? `linear-gradient(135deg, ${PALETTE.accentWash} 0 50%, transparent 50% 100%)`
                    : t.background,
                  display: "grid",
                  placeItems: "center",
                  animation:
                    bloomDate === date && !reduced
                      ? "streak-square-bloom 620ms cubic-bezier(0.34,0.9,0.4,1) both"
                      : undefined,
                }}
              >
                {t.mark && (
                  <span
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: "50%",
                      border: `1.5px solid ${PALETTE.cover}`,
                    }}
                  />
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* The tapped day, in place. No modal — this is a glance, not a page. */}
      {open && (
        <div
          className="mt-3 rounded-xl px-3 py-2.5 text-center"
          style={{
            background: PALETTE.paperDeep,
            border: `1px solid ${PALETTE.edge}`,
            animation: reduced ? undefined : "streak-fade-in 220ms ease-out both",
          }}
        >
          <p style={{ fontFamily: UI, fontSize: 11, letterSpacing: "0.06em", color: PALETTE.inkFaint }}>
            {fmtDay(open, data.timezone)}
          </p>
          {openDay?.[me]?.word || openDay?.[them]?.word ? (
            <p style={{ fontFamily: SERIF, fontSize: 17, color: PALETTE.ink, marginTop: 3 }}>
              {[openDay?.[me]?.word, openDay?.[them]?.word]
                .filter((w): w is string => Boolean(w && w.trim()))
                .map((w) => truncWord(w))
                .join("  ·  ")}
            </p>
          ) : (
            <p style={{ fontFamily: SERIF, fontSize: 16, color: PALETTE.inkFaint, marginTop: 3 }}>
              {openDay?.covered ? "covered" : "no words this day"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
