"use client";

// ─── Catch ───────────────────────────────────────────────────────────────────
//
// Screen orchestration. The game lives in useGameLoop; this file decides which
// screen is on, owns the revealed lines, and owns the warmth of the background.
//
// THE ONE INVARIANT: `revealedIds` is append-only.
//
//   Search this file for the ways a list normally shrinks — `splice`, `pop`,
//   `shift`, `delete`, `= []` — and you will find none of them applied to
//   `revealedIds`. It is written in exactly one place, by `handleCatch`, via
//   `prev.concat(id)` guarded on `indexOf === -1`. Missing a line, being hit,
//   running out of time and replaying all leave it untouched. A run ending is
//   not a reset: `roundKey` changes, revealed lines do not.

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { exportNodeToPng, fileSlug, toDataUrl } from "@/lib/exportPng";
import { arpeggio, setMuted, sfxCatch, sfxHit, unlockAudio } from "@/lib/webAudio";
import {
  ACCENT,
  INK,
  INK_SOFT,
  PAPER,
  PAPER_EDGE,
  faceFill,
  initialOf,
  warmBot,
  warmTop,
} from "./catchTheme";
import FaceCircle from "./FaceCircle";
import GameCanvas from "./GameCanvas";
import IntroScreen from "./IntroScreen";
import LetterPanel from "./LetterPanel";
import ResultScreen from "./ResultScreen";
import ShareCard, { SHARE_H, SHARE_W } from "./ShareCard";
import type { CatchTemplateProps, GoodItem } from "./types";
import { useFaceImage } from "./useFaceImage";
import type { RunResult } from "./useGameLoop";
import { useMediaQuery } from "./useMediaQuery";

type Screen = "intro" | "play" | "result" | "letter";

const OUTFIT = "var(--font-outfit), system-ui, sans-serif";
const SERIF = "var(--font-tinos), Georgia, serif";

export default function CatchTemplate({ data, mode, shareId }: CatchTemplateProps) {
  const [screen, setScreen] = useState<Screen>("intro");

  /** APPEND-ONLY. Arrival order. Nothing in this component ever shortens it. */
  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  const [dodged, setDodged] = useState(0);
  const [roundKey, setRoundKey] = useState(0);
  const [roundIds, setRoundIds] = useState<string[] | null>(null);
  const [lastResult, setLastResult] = useState<RunResult | null>(null);

  const [muted, setMutedState] = useState(true);
  const [showFirstCatch, setShowFirstCatch] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [faceInline, setFaceInline] = useState<{ url: string; data: string } | null>(null);

  const sawFirstCatch = useRef(false);
  const firstCatchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shareRef = useRef<HTMLDivElement | null>(null);

  const face = useFaceImage(data.faceUrl);
  const seed = shareId || `${data.senderName}|${data.recipientName}|${data.goodItems.length}`;

  // A falling-object game cannot be made motion-safe, so don't try — hand them
  // the letter instead, with a way back in. Derived rather than an effect, so
  // there is never a frame of intro before the swap.
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const view: Screen = reduced && screen === "intro" ? "letter" : screen;

  // Inline the photo once, so the export can never taint its canvas on it.
  // Keyed by url: a stale data URL can never leak into a new photo's card, and
  // a failed fetch resolves to "" so the initial disc takes over instead.
  useEffect(() => {
    const url = data.faceUrl;
    if (!url) return;
    let alive = true;
    void toDataUrl(url).then((d) => {
      if (alive) setFaceInline({ url, data: d ?? "" });
    });
    return () => {
      alive = false;
    };
  }, [data.faceUrl]);
  const faceData = faceInline && faceInline.url === data.faceUrl ? faceInline.data : "";

  useEffect(
    () => () => {
      if (firstCatchTimer.current) clearTimeout(firstCatchTimer.current);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  // ── Derived ────────────────────────────────────────────────────────────────
  const byId = useMemo(() => {
    const m = new Map<string, GoodItem>();
    for (const g of data.goodItems) m.set(g.id, g);
    return m;
  }, [data.goodItems]);

  // A lookup, not a removal: an id can only fail to resolve while the EDITOR is
  // mid-keystroke and an item has just been deleted from the form. No gameplay
  // path drops an id here.
  const revealedItems = useMemo(
    () => revealedIds.map((id) => byId.get(id)).filter((g): g is GoodItem => !!g),
    [revealedIds, byId],
  );

  const totalGood = data.goodItems.length;
  const readingAll = view === "letter";
  const warmth = readingAll ? 1 : totalGood ? Math.min(1, revealedIds.length / totalGood) : 1;
  const warmthRef = useRef(0);
  useEffect(() => {
    warmthRef.current = warmth;
  }, [warmth]);

  const roundGood = useMemo(() => {
    if (!roundIds) return data.goodItems;
    const want = new Set(roundIds);
    const subset = data.goodItems.filter((g) => want.has(g.id));
    return subset.length ? subset : data.goodItems;
  }, [data.goodItems, roundIds]);

  // A replay of the leftovers is short and winnable, not a full restart.
  const roundDuration = roundIds
    ? Math.max(12000, Math.min(data.durationMs, roundGood.length * 5000))
    : data.durationMs;

  /** Letter order, not catch order — the result has to read as prose. */
  const resultLines = useMemo(
    () => data.goodItems.filter((g) => revealedIds.indexOf(g.id) !== -1),
    [data.goodItems, revealedIds],
  );
  const shownLines = readingAll ? data.goodItems : resultLines;
  const missedCount = readingAll ? 0 : totalGood - resultLines.length;

  // ── Sound ──────────────────────────────────────────────────────────────────
  const toggleMute = () => {
    const next = !muted;
    unlockAudio(); // the toggle is itself a user gesture
    setMuted(next);
    setMutedState(next);
  };

  // ── Game events ────────────────────────────────────────────────────────────
  const handleCatch = useCallback((item: GoodItem, streak: number) => {
    // The ONLY write to revealedIds in the entire template. Append or no-op.
    setRevealedIds((prev) => (prev.indexOf(item.id) === -1 ? prev.concat(item.id) : prev));
    // Pitch rises across a streak, so a run of catches sounds like a melody.
    sfxCatch(Math.max(0, streak - 1));
    if (!sawFirstCatch.current) {
      sawFirstCatch.current = true;
      setShowFirstCatch(true);
      if (firstCatchTimer.current) clearTimeout(firstCatchTimer.current);
      firstCatchTimer.current = setTimeout(() => setShowFirstCatch(false), 1000);
    }
  }, []);

  // A hit costs a flinch and 400ms of stun. It costs no line. There is
  // deliberately no setRevealedIds call in here.
  const handleHit = useCallback(() => {
    sfxHit();
  }, []);

  // A miss is silent, by design. There is no onMiss handler at all.

  const handleEnd = useCallback(
    (result: RunResult) => {
      setDodged((d) => d + result.dodged);
      setLastResult(result);
      setScreen("result");
    },
    [],
  );

  // Completion fanfare, once, when the last line lands.
  const rangComplete = useRef(false);
  useEffect(() => {
    if (view !== "result") return;
    if (totalGood > 0 && revealedIds.length >= totalGood && !rangComplete.current) {
      rangComplete.current = true;
      arpeggio();
    }
  }, [view, revealedIds.length, totalGood]);

  const startRun = (ids: string[] | null) => {
    unlockAudio(); // the required user gesture
    setRoundIds(ids);
    setRoundKey((k) => k + 1);
    setScreen("play");
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await exportNodeToPng(shareRef.current, {
      width: SHARE_W,
      height: SHARE_H,
      filename: `catch-${fileSlug(data.recipientName, "letter")}`,
      backgroundColor: PAPER,
    });
    setSaving(false);
    setToast(res.message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  };

  const topPad = mode === "demo" ? 60 : 14;

  return (
    <div
      className="relative w-full"
      style={{
        minHeight: "100dvh",
        background: `linear-gradient(180deg, ${warmTop(warmth)} 0%, ${warmBot(warmth)} 100%)`,
        transition: "background 700ms linear",
      }}
    >
      {/* The logo IS the recipient's "create your own" path. */}
      {mode === "live" && (
        <Link
          href="/templates"
          aria-label="SubhSandesh — make your own"
          className="fixed right-3 top-3 z-[95] inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
          style={{
            background: "rgba(255,253,247,0.92)",
            border: `1px solid ${PAPER_EDGE}`,
            boxShadow: "0 4px 14px rgba(44,42,38,0.12)",
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

      {/* ── Intro ─────────────────────────────────────────────────────────── */}
      {view === "intro" && (
        <div style={{ paddingTop: topPad }} className="flex min-h-[100dvh] flex-col">
          <div className="flex justify-start px-4 pt-2">
            <MuteButton muted={muted} onClick={toggleMute} />
          </div>
          <div className="min-h-0 flex-1 pb-6">
            <IntroScreen
              senderName={data.senderName}
              recipientName={data.recipientName}
              faceUrl={data.faceUrl}
              onStart={() => startRun(null)}
              onJustRead={() => setScreen("letter")}
            />
          </div>
        </div>
      )}

      {/* ── Play ──────────────────────────────────────────────────────────── */}
      {view === "play" && (
        <div
          style={{ paddingTop: topPad, height: "100dvh" }}
          className="flex w-full flex-col gap-2 px-3 pb-3"
        >
          <div className="mx-auto flex w-full max-w-[26rem] items-center justify-between gap-2">
            <MuteButton muted={muted} onClick={toggleMute} />
            <span className="truncate text-[11px]" style={{ color: INK_SOFT, fontFamily: OUTFIT }}>
              {data.senderName} → {data.recipientName}
            </span>
            {/* Reachable DURING play. No confirmation, no guilt copy. */}
            <button
              type="button"
              onClick={() => setScreen("letter")}
              aria-label="Just read the letter"
              className="min-h-[44px] shrink-0 rounded-full px-3 text-[11px] underline underline-offset-4"
              style={{ color: INK_SOFT, fontFamily: OUTFIT }}
            >
              just read it →
            </button>
          </div>

          <LetterPanel
            revealed={revealedItems}
            total={totalGood}
            placeholder={`${data.senderName} wrote this in pieces. Catch one and it lands here.`}
            className="mx-auto h-[21vh] max-h-[168px] min-h-[86px] w-full max-w-[26rem] shrink-0"
          />

          <div className="mx-auto min-h-0 w-full max-w-[26rem] flex-1">
            <GameCanvas
              running={view === "play"}
              roundKey={roundKey}
              goodItems={roundGood}
              badItems={data.badItems}
              durationMs={roundDuration}
              seed={seed}
              faceRef={face.ref}
              initial={initialOf(data.recipientName)}
              faceFillColor={faceFill(data.recipientName)}
              warmthRef={warmthRef}
              showFirstCatch={showFirstCatch}
              onCatch={handleCatch}
              onHit={handleHit}
              onEnd={handleEnd}
            />
          </div>
        </div>
      )}

      {/* ── Result ────────────────────────────────────────────────────────── */}
      {view === "result" && (
        <div style={{ paddingTop: topPad }}>
          <div className="mx-auto flex w-full max-w-[30rem] justify-start px-5 pt-2">
            <MuteButton muted={muted} onClick={toggleMute} />
          </div>
          <ResultScreen
            recipientName={data.recipientName}
            senderName={data.senderName}
            faceUrl={data.faceUrl}
            lines={resultLines}
            closingLine={data.closingLine}
            caught={resultLines.length}
            totalGood={totalGood}
            dodged={dodged}
            missedCount={missedCount}
            saving={saving}
            onPlayAgain={() => startRun(lastResult?.missedIds?.length ? lastResult.missedIds : null)}
            onJustRead={() => setScreen("letter")}
            onSave={handleSave}
          />
        </div>
      )}

      {/* ── The letter, no game required ──────────────────────────────────── */}
      {view === "letter" && (
        <div style={{ paddingTop: topPad }} className="mx-auto w-full max-w-[30rem] px-5 pb-12">
          <div className="flex items-center justify-between pt-2">
            <MuteButton muted={muted} onClick={toggleMute} />
            <span className="text-[11px]" style={{ color: INK_SOFT, fontFamily: OUTFIT }}>
              {data.senderName} → {data.recipientName}
            </span>
          </div>

          <div className="mt-5 flex flex-col items-center gap-3 text-center">
            <FaceCircle url={data.faceUrl} name={data.recipientName} size={80} />
            <p className="text-[11px] uppercase tracking-[0.26em]" style={{ color: INK_SOFT, fontFamily: OUTFIT }}>
              for {data.recipientName}
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
            {data.goodItems.map((g) => (
              <p
                key={g.id}
                className="mb-3 text-[14.5px] leading-[1.72] last:mb-0"
                style={{ color: INK, fontFamily: SERIF, wordBreak: "break-word" }}
              >
                {g.line}
              </p>
            ))}
            <p
              className="mt-5 border-t pt-4 text-[14px] italic leading-[1.7]"
              style={{ color: ACCENT, borderColor: PAPER_EDGE, fontFamily: SERIF, wordBreak: "break-word" }}
            >
              {data.closingLine}
            </p>
            <p className="mt-4 text-right text-[13px]" style={{ color: INK_SOFT, fontFamily: SERIF }}>
              — {data.senderName}
            </p>
          </article>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => startRun(null)}
              className="min-h-[44px] rounded-xl px-6 text-[12px] font-semibold uppercase tracking-[0.2em] transition-transform active:scale-[0.97]"
              style={{
                color: INK,
                background: "rgba(255,253,247,0.92)",
                border: `1.5px solid ${INK}`,
                fontFamily: OUTFIT,
              }}
            >
              Play it instead
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="min-h-[44px] rounded-xl px-6 text-[12px] font-semibold uppercase tracking-[0.2em] transition-transform active:scale-[0.97] disabled:opacity-60"
              style={{ color: "#fffdf7", background: INK, border: `1.5px solid ${INK}`, fontFamily: OUTFIT }}
            >
              {saving ? "Saving…" : "Save card"}
            </button>
          </div>
        </div>
      )}

      {/* ── Off-screen export composition (no video, no cross-origin img) ─── */}
      <div aria-hidden style={{ position: "fixed", left: -20000, top: 0, pointerEvents: "none" }}>
        <ShareCard
          ref={shareRef}
          recipientName={data.recipientName}
          senderName={data.senderName}
          faceData={faceData}
          lines={shownLines.map((g) => g.line)}
          closingLine={data.closingLine}
          warmth={warmth}
        />
      </div>

      {toast && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 z-[96] -translate-x-1/2 rounded-full px-4 py-2 text-[12px]"
          style={{
            background: "rgba(44,42,38,0.92)",
            color: "#fffdf7",
            fontFamily: OUTFIT,
            boxShadow: "0 8px 24px rgba(44,42,38,0.22)",
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}

function MuteButton({ muted, onClick }: { muted: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={!muted}
      aria-label={muted ? "Turn sound on" : "Turn sound off"}
      className="inline-flex h-11 min-h-[44px] w-11 items-center justify-center rounded-full text-[14px]"
      style={{ background: "rgba(255,253,247,0.86)", border: `1px solid ${PAPER_EDGE}`, color: INK }}
    >
      <span aria-hidden>{muted ? "🔇" : "🔊"}</span>
    </button>
  );
}
