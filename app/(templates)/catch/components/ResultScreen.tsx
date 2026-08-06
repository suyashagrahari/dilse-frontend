"use client";

// Screen 3. There is no "GAME OVER" here and no "try again". Running out of
// time is a normal way for a run to end, so the copy for a partial letter is
// "one line is still out there. play again?" — an invitation, not a verdict.
//
// The closing line always appears, caught or not.

import { templateMedia } from "@/lib/templateMedia";
import { ACCENT, INK, INK_SOFT, PAPER, PAPER_EDGE } from "./catchTheme";
import FaceCircle from "./FaceCircle";
import type { GoodItem } from "./types";

export interface ResultScreenProps {
  recipientName: string;
  senderName: string;
  faceUrl: string;
  /** In letter order, not catch order — it has to read as prose. */
  lines: GoodItem[];
  closingLine: string;
  caught: number;
  totalGood: number;
  dodged: number;
  missedCount: number;
  saving: boolean;
  onPlayAgain: () => void;
  onJustRead: () => void;
  onSave: () => void;
}

export default function ResultScreen({
  recipientName,
  senderName,
  faceUrl,
  lines,
  closingLine,
  caught,
  totalGood,
  dodged,
  missedCount,
  saving,
  onPlayAgain,
  onJustRead,
  onSave,
}: ResultScreenProps) {
  const complete = missedCount === 0;

  return (
    <div className="mx-auto w-full max-w-[30rem] px-5 pb-10 pt-6">
      <div className="flex flex-col items-center gap-3 text-center">
        {complete ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={templateMedia("catch", "letter-complete.webp")}
            alt=""
            aria-hidden
            className="h-[120px] w-[120px] object-contain"
          />
        ) : (
          <FaceCircle url={faceUrl} name={recipientName} size={72} />
        )}
        <p
          className="text-[11px] uppercase tracking-[0.26em]"
          style={{ color: INK_SOFT, fontFamily: "var(--font-outfit), system-ui, sans-serif" }}
        >
          for {recipientName}
        </p>
      </div>

      <article
        className="mt-5 rounded-2xl px-5 py-5"
        style={{
          background: PAPER,
          border: `1px solid ${PAPER_EDGE}`,
          boxShadow: "0 8px 24px rgba(44,42,38,0.08)",
        }}
      >
        {lines.map((it) => (
          <p
            key={it.id}
            className="mb-3 text-[14.5px] leading-[1.72] last:mb-0"
            style={{ color: INK, fontFamily: "var(--font-tinos), Georgia, serif", wordBreak: "break-word" }}
          >
            {it.line}
          </p>
        ))}
        <p
          className="mt-5 border-t pt-4 text-[14px] italic leading-[1.7]"
          style={{
            color: ACCENT,
            borderColor: PAPER_EDGE,
            fontFamily: "var(--font-tinos), Georgia, serif",
            wordBreak: "break-word",
          }}
        >
          {closingLine}
        </p>
        <p
          className="mt-4 text-right text-[13px]"
          style={{ color: INK_SOFT, fontFamily: "var(--font-tinos), Georgia, serif" }}
        >
          — {senderName}
        </p>
      </article>

      {!complete && (
        <div className="mt-4 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={templateMedia("catch", "searching.webp")}
            alt=""
            aria-hidden
            className="h-[56px] w-[56px] shrink-0 object-contain"
          />
          <p
            className="text-[13.5px] italic leading-snug"
            style={{ color: INK_SOFT, fontFamily: "var(--font-tinos), Georgia, serif" }}
          >
            one line is still out there. play again?
          </p>
        </div>
      )}

      <p
        className="mt-5 text-center text-[11px] tracking-[0.12em]"
        style={{ color: INK_SOFT, fontFamily: "var(--font-outfit), system-ui, sans-serif" }}
      >
        caught {caught} of {totalGood} &nbsp;·&nbsp; dodged {dodged} red flag{dodged === 1 ? "" : "s"}
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        {!complete && (
          <button
            type="button"
            onClick={onPlayAgain}
            className="min-h-[44px] rounded-xl px-6 text-[12px] font-semibold uppercase tracking-[0.2em] transition-transform active:scale-[0.97]"
            style={{
              color: INK,
              background: "rgba(255,253,247,0.92)",
              border: `1.5px solid ${INK}`,
              fontFamily: "var(--font-outfit), system-ui, sans-serif",
            }}
          >
            Play again
          </button>
        )}
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="min-h-[44px] rounded-xl px-6 text-[12px] font-semibold uppercase tracking-[0.2em] transition-transform active:scale-[0.97] disabled:opacity-60"
          style={{
            color: "#fffdf7",
            background: INK,
            border: `1.5px solid ${INK}`,
            fontFamily: "var(--font-outfit), system-ui, sans-serif",
          }}
        >
          {saving ? "Saving…" : "Save card"}
        </button>
      </div>

      {/* Always reachable after a run. No dialog, no guilt. */}
      <div className="mt-5 text-center">
        <button
          type="button"
          onClick={onJustRead}
          className="text-[12px] underline underline-offset-4"
          style={{ color: INK_SOFT, fontFamily: "var(--font-outfit), system-ui, sans-serif" }}
        >
          just read it →
        </button>
      </div>
    </div>
  );
}
