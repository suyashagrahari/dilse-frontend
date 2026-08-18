// ─── Letters ─────────────────────────────────────────────────────────────────
//
// Milestones unlock on the HIGH WATER MARK (`view.record`), never on the
// current count. Someone who reached 100 and then went dormant for a season has
// still reached 100, and taking that back would be the single most punishing
// thing this template could do. `unlockedMilestones` in the contract enforces
// it; there is no code path here that removes an unlocked letter.
//
// Micro-letters are the lighter cadence: one per 7 completed days, presented as
// folded paper rather than a sealed envelope, because a full ceremony every
// week would wear out by month two. If the sender wrote fewer lines than weeks
// elapsed, that week shows NOTHING. Filler would cheapen the ones they meant.

"use client";

import { useCallback, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { tone } from "@/lib/webAudio";
import {
  PALETTE,
  SERIF,
  TIMING,
  UI,
  fmtDay,
  unlockedMicroLetters,
  unlockedMilestones,
  type MicroLetter,
  type StreakData,
  type StreakView,
  type UnlockedMilestone,
} from "./types";
import { ARCHIVE_COPY } from "./archiveCopy";
import WaxSeal from "./WaxSeal";

export interface LettersProps {
  data: StreakData;
  view: StreakView;
  reduced: boolean;
  onBack: () => void;
  onOpen: (atDay: number) => void;
}

function MilestoneCard({
  milestone,
  timezone,
  reduced,
  onOpen,
}: {
  milestone: UnlockedMilestone;
  timezone: string;
  reduced: boolean;
  onOpen: (atDay: number) => void;
}) {
  // Local: whether the crack ANIMATES. Whether it is open is `openedOn`, which
  // lives in the data and is never cleared.
  const [justOpened, setJustOpened] = useState(false);
  const opened = Boolean(milestone.openedOn);

  const open = useCallback(() => {
    if (opened) return;
    setJustOpened(true);
    onOpen(milestone.atDay);
    if (!reduced) {
      tone({ freq: 392, ms: 380, type: "sine", gain: 0.09 });
      tone({ freq: 587.33, ms: 520, type: "sine", gain: 0.075, delay: 0.2 });
    }
  }, [opened, onOpen, milestone.atDay, reduced]);

  const animate = justOpened && !reduced;
  const lines = milestone.letter.split("\n");

  return (
    <div
      className="w-full rounded-2xl px-4 py-4"
      style={{
        background: PALETTE.paperDeep,
        border: `1px solid ${PALETTE.edge}`,
        // The soft one-shot pulse belongs to the sealed state only.
        animation: !opened && !reduced ? "streak-seal-pulse 1800ms ease-out 1 both" : undefined,
      }}
    >
      <div className="flex items-center gap-3">
        <WaxSeal
          cracked={opened}
          animate={animate}
          size={48}
          mark={String(milestone.atDay)}
          seed={`m${milestone.atDay}`}
        />
        <div className="flex-1 min-w-0">
          <p style={{ fontFamily: SERIF, fontSize: 19, color: PALETTE.ink }}>day {milestone.atDay}</p>
          {milestone.openedOn && (
            <p style={{ fontFamily: UI, fontSize: 11, color: PALETTE.inkFaint }}>
              {ARCHIVE_COPY.letters.openedOn(fmtDay(milestone.openedOn.slice(0, 10), timezone))}
            </p>
          )}
        </div>
        {!opened && (
          <button
            type="button"
            onClick={open}
            className="rounded-full px-4"
            style={{
              minHeight: 44,
              fontFamily: UI,
              fontSize: 13,
              color: PALETTE.paper,
              background: PALETTE.ink,
              border: "none",
            }}
          >
            {ARCHIVE_COPY.letters.open}
          </button>
        )}
      </div>

      {/* Slides up out of the envelope, then reveals a line at a time. Once
          opened it simply IS open — the archive keeps it permanently. */}
      {opened && (
        <div
          style={{
            marginTop: 14,
            animation: animate ? `streak-letter-rise 520ms ease-out ${TIMING.sealCrackMs}ms both` : undefined,
          }}
        >
          {lines.map((line, i) => (
            <p
              key={i}
              style={{
                fontFamily: SERIF,
                fontSize: 16.5,
                lineHeight: 1.75,
                color: line.trim() ? PALETTE.ink : "transparent",
                minHeight: line.trim() ? undefined : 12,
                animation: animate ? "streak-line-in 380ms ease-out both" : undefined,
                animationDelay: animate ? `${TIMING.sealCrackMs + 320 + i * 130}ms` : undefined,
              }}
            >
              {line || " "}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function MicroCard({ letter, reduced }: { letter: MicroLetter; reduced: boolean }) {
  return (
    <div
      className="w-full rounded-xl px-3.5 py-3"
      style={{
        background: PALETTE.paper,
        // Folded paper: a crease down the left edge rather than a wax seal.
        borderLeft: `3px solid ${PALETTE.accentWash}`,
        border: `1px solid ${PALETTE.edge}`,
        animation: reduced ? undefined : "streak-unfold 380ms ease-out both",
        transformOrigin: "top",
      }}
    >
      <p style={{ fontFamily: UI, fontSize: 10.5, letterSpacing: "0.08em", color: PALETTE.inkFaint }}>
        {ARCHIVE_COPY.letters.weekly(letter.week)}
      </p>
      <p style={{ fontFamily: SERIF, fontSize: 16.5, lineHeight: 1.6, color: PALETTE.ink, marginTop: 2 }}>
        {letter.line}
      </p>
    </div>
  );
}

export default function Letters({ data, view, reduced, onBack, onOpen }: LettersProps) {
  const milestones = unlockedMilestones(data, view).filter((m) => m.letter.trim());
  const micro = unlockedMicroLetters(data, view);

  return (
    <div className="w-full flex flex-col items-center gap-4" style={{ maxWidth: 360 }}>
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
        <h2 style={{ fontFamily: SERIF, fontSize: 19, color: PALETTE.ink }}>{ARCHIVE_COPY.letters.title}</h2>
      </div>

      {milestones.length === 0 && micro.length === 0 && (
        <p className="text-center" style={{ fontFamily: SERIF, fontSize: 17, color: PALETTE.inkSoft }}>
          {ARCHIVE_COPY.letters.none}
        </p>
      )}

      {milestones.map((m) => (
        <MilestoneCard
          key={m.atDay}
          milestone={m}
          timezone={data.timezone}
          reduced={reduced}
          onOpen={onOpen}
        />
      ))}

      {micro.length > 0 && (
        <div className="w-full flex flex-col gap-2 pt-1">
          {[...micro].reverse().map((m) => (
            <MicroCard key={m.week} letter={m} reduced={reduced} />
          ))}
        </div>
      )}
    </div>
  );
}
