"use client";

// ─── Rewind — the shell ──────────────────────────────────────────────────────
//
// Mounts exactly one slide at a time and hands it to the story machine. Three
// things in here are load-bearing and easy to undo by accident:
//
// 1. ONE SLIDE, KEYED BY VISIT. There is no outgoing slide to cross-fade with,
//    because the previous one is unmounted in the same commit that mounts the
//    next. The background colour is written straight onto the column with no
//    `transition` property anywhere near it, so the change lands in a single
//    frame. That abrupt cut is the format. It looks like a bug for the first
//    two minutes of working on it. Leave it.
//
// 2. THE CLOCK IS CAPTURED ONCE, ON THE CLIENT. `deriveStats` defaults to
//    `Date.now()`, which is a different number on the server than in the
//    browser, and every headline number on screen comes out of it. So the first
//    paint is the right background and nothing else, and the deck appears on
//    mount with a single fixed `now`.
//
// 3. THE AUDIO ELEMENT LIVES OUTSIDE THE CARD. `html-to-image` walks the node
//    it is given; media elements inside it serialise blank. The track is mounted
//    at the top of the shell, above both the story and the share screen.

import React from "react";

import { isMuted, setMuted as setAudioBusMuted, unlockAudio } from "@/lib/webAudio";

import { StoryChrome } from "./StoryChrome";
import { useStoryMachine } from "./useStoryMachine";
import { useReducedMotion } from "./kinetic";
import { buildDeck, deckSeed } from "./buildDeck";
import { SLIDE_REGISTRY } from "./slides/registry";
import ShareScreen from "./ShareScreen";
import { sfxAdvance, sfxReveal } from "./rewindAudio";
import { NEAR_BLACK, computeArchetype, deriveStats, type RewindTemplateProps } from "./types";
import type { SlideDef } from "./slideTypes";

/** The neutral surround behind the letterboxed column on a wide screen. */
const SURROUND = "#08080A";
/** Portrait column. Wider than this and the story stops reading as a story. */
const COLUMN_MAX = 440;

const SR_ONLY: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  border: 0,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  whiteSpace: "nowrap",
};

export default function RewindTemplate({ data, mode }: RewindTemplateProps) {
  const reduced = useReducedMotion();

  // ── The clock, captured once on the client ────────────────────────────────
  const [nowMs, setNowMs] = React.useState<number | null>(null);
  React.useEffect(() => setNowMs(Date.now()), []);

  const stats = React.useMemo(
    // Before mount this is a throwaway: nothing derived from it is rendered,
    // and `buildDeck` does not read it, so the deck is identical either way.
    () => deriveStats(data.startDate, nowMs ?? (Date.parse(data.startDate) || 0)),
    [data.startDate, nowMs],
  );
  const archetype = React.useMemo(
    () => computeArchetype(data.answers, data.startDate),
    [data.answers, data.startDate],
  );
  const slides: SlideDef[] = React.useMemo(
    () => buildDeck(data, stats, archetype),
    [data, stats, archetype],
  );
  const seedBase = React.useMemo(() => deckSeed(data), [data]);

  // ── Audio ─────────────────────────────────────────────────────────────────
  const hasAudio = data.audioUrl.trim().length > 0;
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  // With a track the story opens silent — including the UI ticks, so the pill
  // tells the truth about everything you can hear. Without one, the ticks play.
  const [muted, setMutedState] = React.useState(() => hasAudio);
  const mutedRef = React.useRef(muted);
  mutedRef.current = muted;
  const startedRef = React.useRef(false);

  React.useEffect(() => {
    setAudioBusMuted(hasAudio);
    setMutedState(hasAudio ? true : isMuted());
  }, [hasAudio]);

  /** First pointer down anywhere: the only moment a browser will let us start. */
  const onFirstPointer = React.useCallback(() => {
    unlockAudio();
    if (startedRef.current) return;
    startedRef.current = true;
    const a = audioRef.current;
    if (!a) return;
    a.volume = 1;
    // Autoplay rejection is normal and must not surface.
    void a.play().catch(() => {});
  }, []);

  const toggleMute = React.useCallback(() => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMutedState(next);
    setAudioBusMuted(next);
    const a = audioRef.current;
    if (a && !next && a.paused) void a.play().catch(() => {});
  }, []);

  // ── The machine ───────────────────────────────────────────────────────────
  const machine = useStoryMachine({
    slides,
    reduced,
    onAdvance: React.useCallback(() => sfxAdvance(), []),
    onSlideEnter: React.useCallback((def: SlideDef) => {
      if (def.kind === "archetype") sfxReveal();
    }, []),
  });

  const { index, visit, progress, held, exited, containerRef, goNext, goPrev, exit, restart } =
    machine;

  const def = slides[Math.min(index, Math.max(0, slides.length - 1))];
  const bg = def?.bg ?? NEAR_BLACK;
  const fg = def?.fg ?? "#FFFFFF";

  // ── Fade the track out across the final slide ─────────────────────────────
  React.useEffect(() => {
    const a = audioRef.current;
    if (!a || slides.length === 0) return;
    const isLast = index === slides.length - 1;
    if (!isLast) {
      a.volume = 1;
      return;
    }
    const durationMs = Math.max(1, slides[index]?.durationMs ?? 4500);
    const from = a.volume;
    const t0 = performance.now();
    let raf = requestAnimationFrame(function step() {
      const k = Math.min(1, (performance.now() - t0) / durationMs);
      a.volume = Math.max(0, from * (1 - k));
      if (k < 1) raf = requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(raf);
  }, [index, visit, slides]);

  React.useEffect(() => {
    if (!exited) return;
    const a = audioRef.current;
    if (a) a.pause();
  }, [exited]);

  // ── Keyboard: the story must be completable without a pointer ─────────────
  const onKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") {
        e.preventDefault();
        goNext();
      } else if (e.key === "Escape") {
        e.preventDefault();
        exit();
      }
    },
    [goNext, goPrev, exit],
  );

  // ── The active slide ──────────────────────────────────────────────────────
  //
  // Memoised so a progress frame — sixty state updates a second — re-renders the
  // chrome and nothing else. The element identity is stable, so React skips the
  // whole slide subtree.
  const ready = nowMs !== null && !!def;
  const Slide = def ? SLIDE_REGISTRY[def.kind] : null;
  const slideEl = React.useMemo(() => {
    if (!ready || !Slide || !def) return null;
    return (
      <Slide
        key={`${def.key}:${visit}`}
        data={data}
        stats={stats}
        archetype={archetype}
        def={def}
        reduced={reduced}
        held={held}
        // Deliberately free of `visit`: a slide must look identical the second
        // time you see it, or a re-watch produces a different screenshot.
        seed={`${seedBase}:${def.key}`}
      />
    );
  }, [ready, Slide, def, data, stats, archetype, reduced, held, seedBase, visit]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "stretch",
        backgroundColor: SURROUND,
        overflow: "hidden",
        overscrollBehavior: "none",
      }}
      onPointerDownCapture={onFirstPointer}
    >
      {/* Outside every node that gets captured as a PNG. */}
      {hasAudio && (
        <audio
          ref={audioRef}
          src={data.audioUrl}
          loop
          muted={muted}
          playsInline
          preload="auto"
          style={{ display: "none" }}
        />
      )}

      <div
        ref={containerRef}
        role="button"
        tabIndex={0}
        aria-label="Rewind story. Tap the right side for the next slide, the left side to go back, press and hold to pause."
        onKeyDown={onKeyDown}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: COLUMN_MAX,
          height: "100%",
          overflow: "hidden",
          // No transition on this. Ever. The cut is the point.
          backgroundColor: exited ? NEAR_BLACK : bg,
          color: fg,
          touchAction: "none",
          overscrollBehavior: "none",
          userSelect: "none",
          WebkitUserSelect: "none",
          WebkitTapHighlightColor: "transparent",
          outline: "none",
        }}
      >
        {exited ? (
          <ShareScreen
            data={data}
            stats={stats}
            archetype={archetype}
            mode={mode}
            reduced={reduced}
            onReplay={restart}
          />
        ) : (
          <>
            {slideEl}
            {ready && def && (
              <StoryChrome
                slides={slides}
                index={index}
                progress={progress}
                fg={def.fg}
                hidden={held}
                mode={mode}
                muted={muted}
                hasAudio={hasAudio}
                onToggleMute={toggleMute}
                onExit={exit}
              />
            )}
          </>
        )}

        <div aria-live="polite" aria-atomic="true" style={SR_ONLY}>
          {exited
            ? "The card. Your story is finished."
            : ready && slides.length > 0
              ? `Slide ${index + 1} of ${slides.length}`
              : ""}
        </div>
      </div>
    </div>
  );
}
