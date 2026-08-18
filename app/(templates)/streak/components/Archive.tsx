// ─── Screen two: the archive ─────────────────────────────────────────────────
//
// Lazy-loaded. The check-in screen is what gets opened every morning and it
// should not pay for a calendar most of those mornings never render.
//
// A note on the grid's tap targets, because it is a real deviation from the
// 44px floor and not an oversight: a GitHub-contributions grid of 400 days
// cannot have 44px cells on a 380px phone — that is a 2,700px-wide wall. The
// pitch here scales with the run (36px at a month, 18px at a year) and the day
// panel that opens carries 44px "earlier"/"later" buttons, so no interaction
// REQUIRES landing on a small square. Flagged rather than quietly shipped.

"use client";

import { useCallback, useMemo, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  COPY,
  PALETTE,
  SERIF,
  UI,
  buildGrid,
  deriveStats,
  fmtClock,
  fmtDay,
  truncWord,
  type CellState,
  type DayCell,
  type Side,
  type StreakData,
  type StreakView,
} from "./types";
import { other } from "./demoData";
import { ARCHIVE_COPY } from "./archiveCopy";

export interface ArchiveProps {
  data: StreakData;
  me: Side;
  today: string;
  view: StreakView;
  reduced: boolean;
  onBack: () => void;
  onOpenPoem: () => void;
}

/** Cell pitch scales with the run so a short streak is not a row of specks. */
function pitchFor(n: number): number {
  if (n <= 60) return 32;
  if (n <= 150) return 22;
  return 15;
}

function cellStyle(state: CellState): React.CSSProperties {
  switch (state) {
    case "both":
      return { background: PALETTE.accent, border: `1px solid ${PALETTE.accent}` };
    case "half":
      // Half-filled diagonally. Distinct from both a full day and an empty one
      // at a glance, without needing a legend.
      return {
        background: `linear-gradient(135deg, ${PALETTE.accent} 0 50%, transparent 50% 100%)`,
        border: `1px solid ${PALETTE.edge}`,
      };
    case "covered":
      return { background: PALETTE.accentWash, border: `1px solid ${PALETTE.cover}` };
    default:
      // A quiet day. An outline — never a cross, never red.
      return { background: "transparent", border: `1px solid ${PALETTE.edge}` };
  }
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center" style={{ minWidth: 76 }}>
      <span style={{ fontFamily: SERIF, fontSize: 26, lineHeight: 1.1, color: PALETTE.ink }}>{value}</span>
      <span style={{ fontFamily: UI, fontSize: 10.5, letterSpacing: "0.07em", color: PALETTE.inkFaint, marginTop: 3 }}>
        {label}
      </span>
    </div>
  );
}

export default function Archive({ data, me, today, view, reduced, onBack, onOpenPoem }: ArchiveProps) {
  const cells = useMemo(() => buildGrid(data, today), [data, today]);
  const stats = useMemo(() => deriveStats(data, view), [data, view]);
  const [openDate, setOpenDate] = useState<string | null>(null);

  const pitch = pitchFor(cells.length);
  const gap = Math.max(2, Math.round(pitch * 0.13));
  const size = pitch - gap;
  const weeks = cells.length > 0 ? cells[cells.length - 1].week - cells[0].week + 1 : 1;
  const firstWeek = cells.length > 0 ? cells[0].week : 0;

  const byDate = useMemo(() => new Map(data.checkIns.map((d) => [d.date, d])), [data.checkIns]);
  const index = useMemo(() => new Map(cells.map((c, i) => [c.date, i])), [cells]);

  const step = useCallback(
    (dir: -1 | 1) => {
      setOpenDate((cur) => {
        if (!cur) return cur;
        const i = index.get(cur);
        if (i === undefined) return cur;
        const next = cells[i + dir];
        return next ? next.date : cur;
      });
    },
    [cells, index],
  );

  const day = openDate ? byDate.get(openDate) : undefined;
  const them = other(me);

  // Day one gets a sentence, not an empty page and certainly not an error.
  const isDayOne = cells.length <= 1;

  return (
    <div className="w-full flex flex-col items-center gap-5" style={{ maxWidth: 360 }}>
      <div className="w-full flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-full px-3"
          style={{
            minHeight: 44,
            fontFamily: UI,
            fontSize: 13,
            color: PALETTE.inkSoft,
            background: "transparent",
            border: `1px solid ${PALETTE.edge}`,
          }}
        >
          <ArrowLeft size={15} /> {ARCHIVE_COPY.archive.back}
        </button>
        <span className="flex-1" />
        <h2 style={{ fontFamily: SERIF, fontSize: 19, color: PALETTE.ink }}>{ARCHIVE_COPY.archive.title}</h2>
      </div>

      {/* ── Derived on read, stored nowhere. ── */}
      <div className="w-full flex items-start justify-center flex-wrap" style={{ gap: 14 }}>
        <Stat label={ARCHIVE_COPY.stats.longest} value={stats.longest} />
        <Stat label={ARCHIVE_COPY.stats.current} value={stats.current} />
        <Stat label={ARCHIVE_COPY.stats.total} value={stats.totalDays} />
        {stats.mostUsedWord && (
          <Stat label={ARCHIVE_COPY.stats.mostUsed} value={truncWord(stats.mostUsedWord)} />
        )}
      </div>

      <div className="w-full flex flex-col items-center gap-1">
        {stats.firstMoreOften && (
          <p style={{ fontFamily: UI, fontSize: 12.5, color: PALETTE.inkSoft }}>
            {ARCHIVE_COPY.stats.firstMoreOften(stats.firstMoreOften.name, stats.firstMoreOften.percent)}
          </p>
        )}
        {stats.earliest && (
          <p style={{ fontFamily: UI, fontSize: 12.5, color: PALETTE.inkFaint }}>
            {ARCHIVE_COPY.stats.earliest(stats.earliest.name, stats.earliest.time)}
          </p>
        )}
        {stats.latest && (
          <p style={{ fontFamily: UI, fontSize: 12.5, color: PALETTE.inkFaint }}>
            {ARCHIVE_COPY.stats.latest(stats.latest.name, stats.latest.time)}
          </p>
        )}
      </div>

      {/* ── The grid. Weeks as columns. Future days are not rendered at all. ── */}
      {isDayOne && (
        <p className="text-center" style={{ fontFamily: SERIF, fontSize: 17, color: PALETTE.inkSoft }}>
          {COPY.emptyArchive}
        </p>
      )}

      <div
        className="w-full"
        style={{ overflowX: "auto", overflowY: "hidden", WebkitOverflowScrolling: "touch" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${weeks}, ${pitch}px)`,
            gridTemplateRows: `repeat(7, ${pitch}px)`,
            width: weeks * pitch,
            margin: "0 auto",
            minWidth: "min-content",
          }}
        >
          {cells.map((c: DayCell) => (
            <button
              key={c.date}
              type="button"
              onClick={() => setOpenDate(c.date)}
              aria-label={`${fmtDay(c.date, data.timezone)} — ${ARCHIVE_COPY.grid[c.state]}`}
              style={{
                gridColumn: c.week - firstWeek + 1,
                gridRow: c.weekday + 1,
                width: size,
                height: size,
                borderRadius: Math.max(3, Math.round(size * 0.22)),
                padding: 0,
                cursor: "pointer",
                display: "grid",
                placeItems: "center",
                outline: openDate === c.date ? `2px solid ${PALETTE.ink}` : "none",
                outlineOffset: 1,
                ...cellStyle(c.state),
              }}
            >
              {c.state === "covered" && (
                <span
                  style={{
                    width: Math.max(4, size * 0.34),
                    height: Math.max(4, size * 0.34),
                    borderRadius: "50%",
                    border: `1.4px solid ${PALETTE.cover}`,
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <p style={{ fontFamily: UI, fontSize: 11, color: PALETTE.inkFaint }}>{ARCHIVE_COPY.archive.legend}</p>

      {/* ── One day, opened. ── */}
      {openDate && (
        <div
          className="w-full rounded-2xl px-4 py-4"
          style={{
            background: PALETTE.paperDeep,
            border: `1px solid ${PALETTE.edge}`,
            animation: reduced ? undefined : "streak-sheet-up 300ms ease-out both",
          }}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label={ARCHIVE_COPY.day.prev}
              style={{ minWidth: 44, minHeight: 44, display: "grid", placeItems: "center", background: "transparent", border: "none", color: PALETTE.inkSoft }}
            >
              <ChevronLeft size={18} />
            </button>
            <p className="flex-1 text-center" style={{ fontFamily: SERIF, fontSize: 17, color: PALETTE.ink }}>
              {fmtDay(openDate, data.timezone)}
            </p>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label={ARCHIVE_COPY.day.next}
              style={{ minWidth: 44, minHeight: 44, display: "grid", placeItems: "center", background: "transparent", border: "none", color: PALETTE.inkSoft }}
            >
              <ChevronRight size={18} />
            </button>
            <button
              type="button"
              onClick={() => setOpenDate(null)}
              aria-label={ARCHIVE_COPY.day.close}
              style={{ minWidth: 44, minHeight: 44, display: "grid", placeItems: "center", background: "transparent", border: "none", color: PALETTE.inkFaint }}
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex gap-3 mt-2">
            {([me, them] as Side[]).map((side) => {
              const entry = day?.[side];
              return (
                <div key={side} className="flex-1 min-w-0 text-center">
                  <p style={{ fontFamily: UI, fontSize: 10.5, letterSpacing: "0.07em", color: PALETTE.inkFaint }}>
                    {data.pair[side].name}
                  </p>
                  {entry?.photoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={entry.photoUrl}
                      alt=""
                      style={{
                        width: "100%",
                        aspectRatio: "1",
                        objectFit: "cover",
                        borderRadius: 10,
                        marginTop: 6,
                        border: `1px solid ${PALETTE.edge}`,
                      }}
                    />
                  )}
                  <p style={{ fontFamily: SERIF, fontSize: 19, color: entry?.word ? PALETTE.ink : PALETTE.inkFaint, marginTop: 6 }}>
                    {entry?.word ? truncWord(entry.word) : "—"}
                  </p>
                  <p style={{ fontFamily: UI, fontSize: 11, color: PALETTE.inkFaint, marginTop: 2 }}>
                    {entry ? fmtClock(Date.parse(entry.at), data.timezone) : ""}
                  </p>
                </div>
              );
            })}
          </div>

          {day?.covered && (
            <p className="text-center mt-2" style={{ fontFamily: UI, fontSize: 12.5, color: PALETTE.cover }}>
              {COPY.coveredBy(data.pair[other(day.covered)].name)}
            </p>
          )}
          {!day?.a && !day?.b && (
            <p className="text-center mt-2" style={{ fontFamily: UI, fontSize: 12.5, color: PALETTE.inkFaint }}>
              {ARCHIVE_COPY.grid.missed}
            </p>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={onOpenPoem}
        className="rounded-full px-4"
        style={{
          minHeight: 44,
          fontFamily: SERIF,
          fontSize: 15,
          color: PALETTE.ink,
          background: "transparent",
          border: `1px solid ${PALETTE.edge}`,
        }}
      >
        {COPY.poemLink}
      </button>
    </div>
  );
}
