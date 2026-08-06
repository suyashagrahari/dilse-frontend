"use client";

// ─── The Last Piece ──────────────────────────────────────────────────────────
//
// AUTHORED BY THE LEAD. This is the orchestrator and the integration point.
// Sub-agents: you may READ this to see how your component is wired, but you may
// not edit it. If you need a prop that is not here, ask.
//
// THE ONE INVARIANT: `revealedLines` is append-only.
//
//   It is written in exactly one place — `handlePlaced` — via `concat`, guarded
//   on `indexOf === -1`. Nothing in this template splices, pops, filters or
//   reassigns it to `[]`. A line, once given, has been given. There is no
//   failure path that takes one back, because there is no failure path.
//
// Everything else here is wiring:
//   engine (canvas)      → the board, the settle, the drop, the seams
//   tray + drag layer    → the pointer story
//   letter panel         → the reward
//   final-piece panel    → the two-people-at-once moment
//   completion overlay   → the closing line and the card
//
// Progress is spoken as "8 of 12 pieces". There is no percentage, no score, no
// timer and no fail state anywhere in this file, and there must never be one.

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { exportNodeToPng, fileSlug } from "@/lib/exportPng";
import { setMuted, unlockAudio } from "@/lib/webAudio";

import CompletionOverlay from "./CompletionOverlay";
import FinalPiecePanel from "./FinalPiecePanel";
import LetterPanel from "./LetterPanel";
import PieceTray from "./PieceTray";
import PuzzleBoard from "./PuzzleBoard";
import ShareCard, { SHARE_H, SHARE_W } from "./ShareCard";
import { usePuzzleEngine } from "./usePuzzleEngine";
import { playMelody, sfxNote, sfxPieceClick } from "./puzzleAudio";
import type { EngineCallbacks, PuzzlePhase } from "./engineContract";
import { useReducedMotion, useWideScreen } from "./useMediaQuery";
import {
  CHROME,
  CHROME_BORDER,
  CHROME_SHADOW,
  INDIGO,
  INK,
  INK_SOFT,
  OUTFIT,
  PAGE_BG,
  PAPER,
  PAPER_EDGE,
} from "./puzzleTheme";
import {
  lineSchedule,
  melodyNoteAt,
  normaliseGrid,
  type PhotoPuzzleTemplateProps,
} from "./types";

export default function PhotoPuzzleTemplate({ data, mode, shareId }: PhotoPuzzleTemplateProps) {
  const reduced = useReducedMotion();
  const wide = useWideScreen();

  const grid = useMemo(() => normaliseGrid(data.cols, data.rows), [data.cols, data.rows]);
  const pieceCount = grid.cols * grid.rows;

  // Stable across refreshes and devices, so the cut never changes under her.
  const seed = shareId || `${data.senderName}|${data.recipientName}|${grid.cols}x${grid.rows}`;

  /** APPEND-ONLY. Indices into `data.lines`, in reveal order. */
  const [revealedLines, setRevealedLines] = useState<number[]>([]);
  const [phase, setPhase] = useState<PuzzlePhase>("loading");
  const [sealed, setSealed] = useState(false);
  const [complete, setComplete] = useState(false);

  const [muted, setMutedState] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState("");

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shareRef = useRef<HTMLDivElement | null>(null);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  const schedule = useMemo(
    () => lineSchedule(data.lines.length, pieceCount),
    [data.lines.length, pieceCount],
  );
  const scheduleRef = useRef(schedule);
  scheduleRef.current = schedule;
  const melodyRef = useRef(data.melody);
  melodyRef.current = data.melody;

  // ── The reward, in the order the spec gives: click + note, then the line ────
  const handlePlaced = useCallback((_index: number, ordinal: number) => {
    sfxPieceClick();
    sfxNote(melodyNoteAt(melodyRef.current, ordinal));
    const li = scheduleRef.current[ordinal] ?? -1;
    if (li < 0) return;
    // The ONLY write to revealedLines in the entire template. Append or no-op.
    setRevealedLines((prev) => (prev.indexOf(li) === -1 ? prev.concat(li) : prev));
  }, []);

  const handleSealed = useCallback(() => {
    setSealed(true);
    playMelody(melodyRef.current);
  }, []);

  const handleComplete = useCallback(() => setComplete(true), []);

  // Recreated every render on purpose — the engine stores this in a ref, so the
  // rAF loop never closes over a stale callback.
  const callbacks: EngineCallbacks = {
    onPlaced: handlePlaced,
    onPhase: setPhase,
    onSealed: handleSealed,
    onComplete: handleComplete,
  };

  const engine = usePuzzleEngine({
    cols: grid.cols,
    rows: grid.rows,
    imageUrl: data.imageUrl,
    revealImageUrl: data.revealImageUrl,
    seed,
    finalPieceMode: data.finalPieceMode,
    reducedMotion: reduced,
    callbacks,
  });

  // The completed photograph, inlined once, so the exported card is never a
  // tainted-canvas failure.
  useEffect(() => {
    if (!complete || snapshot) return;
    const url = engine.getSnapshotDataUrl();
    if (url) setSnapshot(url);
  }, [complete, snapshot, engine]);

  // ── Sound ──────────────────────────────────────────────────────────────────
  const toggleMute = useCallback(() => {
    const next = !muted;
    unlockAudio(); // the toggle is itself the user gesture
    setMuted(next);
    setMutedState(next);
  }, [muted]);

  /** Every pointerdown on a piece. Creating the context here, never on load. */
  const handleGesture = useCallback(() => unlockAudio(), []);

  // ── Card ───────────────────────────────────────────────────────────────────
  const revealedText = useMemo(
    () => revealedLines.slice().sort((a, b) => a - b).map((i) => data.lines[i]).filter(Boolean),
    [revealedLines, data.lines],
  );

  const handleSave = useCallback(async () => {
    setSaving(true);
    const res = await exportNodeToPng(shareRef.current, {
      width: SHARE_W,
      height: SHARE_H,
      filename: `the-last-piece-${fileSlug(data.recipientName, "puzzle")}`,
      backgroundColor: PAPER,
    });
    setSaving(false);
    setToast(res.message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, [data.recipientName]);

  const placedCount = engine.placedOrder.length;
  const waitingFinal = phase === "waiting-final";
  const topPad = mode === "demo" ? 58 : 12;

  const letter = (
    <LetterPanel
      lines={data.lines}
      revealed={revealedLines}
      placedCount={placedCount}
      totalPieces={pieceCount}
      senderName={data.senderName}
      reducedMotion={reduced}
      placeholder={`${data.senderName} wrote this in ${pieceCount} pieces. Place one and it lands here.`}
      className={
        wide
          ? "w-[21rem] shrink-0 self-stretch"
          : "min-h-0 w-full flex-1 overflow-hidden"
      }
    />
  );

  if (phase === "error") {
    return (
      <div
        className="flex w-full flex-col items-center justify-center px-6 text-center"
        style={{ minHeight: "100dvh", background: PAGE_BG }}
      >
        <div className="text-4xl" aria-hidden>🧩</div>
        <p className="mt-4 text-[15px] font-semibold" style={{ color: INK, fontFamily: OUTFIT }}>
          The photo didn&apos;t come through
        </p>
        <p className="mt-2 max-w-[22rem] text-[13px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: OUTFIT }}>
          {engine.errorMessage ?? "Ask them to send it again — the letter is still waiting."}
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ minHeight: "100dvh", background: PAGE_BG }}>
      {/* The logo IS the recipient's "create your own" path. */}
      {mode === "live" && (
        <Link
          href="/templates"
          aria-label="SubhSandesh — make your own"
          className="fixed right-3 top-3 z-[95] inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
          style={{
            background: CHROME,
            border: CHROME_BORDER,
            boxShadow: CHROME_SHADOW,
            textDecoration: "none",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.webp" alt="" width={18} height={18} style={{ width: 18, height: 18 }} />
          <span className="text-[11px] font-semibold" style={{ color: INK, fontFamily: OUTFIT }}>
            SubhSandesh
          </span>
        </Link>
      )}

      <div
        className="mx-auto flex w-full max-w-[26rem] flex-col gap-2 px-3 pb-3 lg:max-w-[62rem] lg:flex-row lg:items-stretch lg:gap-5 lg:px-5"
        style={{ height: "100dvh", paddingTop: topPad, overscrollBehavior: "none" }}
      >
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
          <div className="flex shrink-0 items-center justify-between gap-2">
            <button
              type="button"
              onClick={toggleMute}
              aria-pressed={!muted}
              aria-label={muted ? "Turn sound on" : "Turn sound off"}
              className="inline-flex h-11 min-h-[44px] w-11 items-center justify-center rounded-full text-[14px]"
              style={{ background: CHROME, border: CHROME_BORDER, color: INDIGO }}
            >
              <span aria-hidden>{muted ? "🔇" : "🔊"}</span>
            </button>
            <span className="truncate text-[11px]" style={{ color: INK_SOFT, fontFamily: OUTFIT }}>
              {data.senderName} → {data.recipientName}
            </span>
          </div>

          <PuzzleBoard
            engine={engine}
            reducedMotion={reduced}
            className="shrink-0"
            overlay={
              waitingFinal ? (
                <FinalPiecePanel
                  message={data.finalPieceMessage}
                  showDebugRelease={mode === "demo"}
                  onRelease={engine.releaseFinalPiece}
                  onSelfServe={engine.releaseFinalPiece}
                  reducedMotion={reduced}
                />
              ) : sealed || complete ? (
                <CompletionOverlay
                  sealed={sealed}
                  complete={complete}
                  closingLine={data.closingLine}
                  senderName={data.senderName}
                  recipientName={data.recipientName}
                  saving={saving}
                  onSave={handleSave}
                  reducedMotion={reduced}
                />
              ) : null
            }
          />

          {!wide && letter}

          <PieceTray
            engine={engine}
            reducedMotion={reduced}
            seed={seed}
            onGesture={handleGesture}
            className="shrink-0"
          />
        </div>

        {wide && letter}
      </div>

      {/* Off-screen export composition. No <video>, no cross-origin <img>. */}
      <div aria-hidden style={{ position: "fixed", left: -20000, top: 0, pointerEvents: "none" }}>
        <ShareCard
          ref={shareRef}
          recipientName={data.recipientName}
          senderName={data.senderName}
          imageData={snapshot}
          lines={revealedText}
          closingLine={data.closingLine}
        />
      </div>

      {toast && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 z-[96] -translate-x-1/2 rounded-full px-4 py-2 text-[12px]"
          style={{
            background: "rgba(30,27,51,0.92)",
            color: PAPER,
            border: `1px solid ${PAPER_EDGE}`,
            fontFamily: OUTFIT,
            boxShadow: CHROME_SHADOW,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
