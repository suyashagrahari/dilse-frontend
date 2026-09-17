"use client";

/**
 * Hold My Hand — the recipient experience.
 *
 * Everything continuous (photo filter, ring, bloom, heartbeat scale) is written
 * straight to the DOM from the engine's single rAF loop. React only re-renders
 * on discrete events: a line appearing, a release, the win. That is what keeps
 * the pulse, the haptic and the audio thump on the same frame.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Hand, Volume2, VolumeX, SkipForward } from "lucide-react";

import ParticleBurst from "./ParticleBurst";
import ResultCard, { type ResultStats } from "./ResultCard";
import { useHoldEngine, type FrameState, type WinSummary } from "./useHoldEngine";
import { HMH, effectiveHoldLines, fmtSecs, fmtWhole, type HoldData } from "./types";
import { STAGES, stageIndexFor, releaseMoment, preloadStage } from "./moments";
import MemoryCards from "./MemoryCards";
import { templateMediaBase } from "@/lib/templateMedia";

/** Animation set for this template — served from S3, never bundled. */
const ASSET = templateMediaBase("hold-my-hand");

// ─── Ring geometry ───────────────────────────────────────────────────────────
const RING_VB = 200;
const RING_R = 92;
const RING_LEN = 2 * Math.PI * RING_R;

/** Cool → indigo → pink → warm amber, as p climbs. */
const RING_STOPS: [number, [number, number, number]][] = [
  [0.0, [96, 108, 168]],
  [0.45, [108, 92, 231]],
  [0.8, [247, 37, 133]],
  [1.0, [255, 176, 32]],
];

function ringRgb(p: number): [number, number, number] {
  for (let i = 1; i < RING_STOPS.length; i++) {
    const [s1, c1] = RING_STOPS[i - 1];
    const [s2, c2] = RING_STOPS[i];
    if (p <= s2 || i === RING_STOPS.length - 1) {
      const t = s2 === s1 ? 0 : Math.min(1, Math.max(0, (p - s1) / (s2 - s1)));
      return [
        Math.round(c1[0] + (c2[0] - c1[0]) * t),
        Math.round(c1[1] + (c2[1] - c1[1]) * t),
        Math.round(c1[2] + (c2[2] - c1[2]) * t),
      ];
    }
  }
  return RING_STOPS[0][1];
}

/** Deterministic ghost-fragment positions — stable across renders and reloads. */
const GHOST_SPOTS = [
  { top: "13%", left: "7%", rotate: -6 },
  { top: "20%", right: "6%", rotate: 5 },
  { top: "68%", left: "9%", rotate: 4 },
  { top: "76%", right: "7%", rotate: -5 },
  { top: "41%", left: "3%", rotate: -3 },
  { top: "50%", right: "3%", rotate: 3 },
  { top: "30%", left: "16%", rotate: 7 },
  { top: "60%", right: "15%", rotate: -7 },
  { top: "9%", left: "34%", rotate: 2 },
  { top: "84%", left: "32%", rotate: -2 },
  { top: "24%", left: "44%", rotate: -4 },
  { top: "72%", left: "46%", rotate: 4 },
];

export interface HoldMyHandProps {
  data: HoldData;
  mode: "preview" | "live";
  shareId?: string;
  hasPassword?: boolean;
  /** True while the edit sheet is open — parks the loop. */
  paused?: boolean;
}

export default function HoldMyHand({ data, mode, paused = false }: HoldMyHandProps) {
  // ── Reduced motion ─────────────────────────────────────────────────────────
  const [reduced, setReduced] = useState(false);
  const reducedRef = useRef(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => { reducedRef.current = mq.matches; setReduced(mq.matches); };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // ── DOM handles written from the loop ──────────────────────────────────────
  const rootRef = useRef<HTMLElement | null>(null);
  const photoRef = useRef<HTMLDivElement | null>(null);
  const photoWrapRef = useRef<HTMLDivElement | null>(null);
  const scrimRef = useRef<HTMLSpanElement | null>(null);
  const haloRef = useRef<HTMLSpanElement | null>(null);
  const ringRef = useRef<SVGCircleElement | null>(null);
  const gifRef = useRef<HTMLImageElement | null>(null);
  /** Mirrors engine.hasVibrate so the frame writer can read it without a re-bind. */
  const hapticsRef = useRef(true);

  /**
   * Which of the five warmth stages we are in.
   *
   * The rAF writer owns everything continuous, but the animation above the
   * portrait is an <img> whose src has to change — a React concern. So the loop
   * writes the index to a ref every frame and only lifts it into state on the
   * four frames per hold where it actually changes. That keeps the swap off the
   * hot path while still letting React render it.
   */
  const [stageIdx, setStageIdx] = useState(0);
  const stageRef = useRef(0);
  const stage = STAGES[stageIdx];

  const [photoBroken, setPhotoBroken] = useState(false);
  const showHeart = !data.photoUrl || photoBroken;

  const [stats, setStats] = useState<ResultStats | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [letterStep, setLetterStep] = useState(0);

  const lines = useMemo(() => effectiveHoldLines(data), [data]);
  const releaseLineFor = useCallback(
    (count: number) => {
      const list = data.releaseLines;
      if (!list.length) return null;
      return list[Math.min(count - 1, list.length - 1)];
    },
    [data.releaseLines],
  );

  const onWin = useCallback((s: WinSummary) => {
    setStats({ heldMs: s.heldMs, releases: s.releases, survivedBetrayal: s.survivedBetrayal, skipped: s.skipped });
  }, []);

  // ── The frame writer. No React state touched here — ever. ──────────────────
  const onFrame = useCallback((s: FrameState) => {
    const p = Math.max(0, Math.min(1, s.p));
    const inv = 1 - p;

    // Stage changes four times in a whole hold, so this comparison is free and
    // the setState behind it is rare. Warming the next animation here means the
    // swap never shows a blank frame to somebody holding perfectly still.
    const idx = stageIndexFor(p);
    if (idx !== stageRef.current) {
      stageRef.current = idx;
      setStageIdx(idx);
      preloadStage(idx);
    }

    if (photoRef.current) {
      // Spec formula, plus a saturation/contrast ramp so the last 20% reads as
      // light arriving on a face rather than a slider finishing its travel.
      photoRef.current.style.filter =
        `grayscale(${inv.toFixed(3)}) blur(${(8 * inv).toFixed(2)}px) ` +
        `brightness(${(0.55 + 0.45 * p).toFixed(3)}) ` +
        `saturate(${(0.5 + 0.8 * p).toFixed(3)}) contrast(${(0.86 + 0.32 * p).toFixed(3)})`;
      // Slow dolly-in. Also keeps the 8px blur from showing the circle's edge.
      photoRef.current.style.transform = `scale(${(1.16 - 0.16 * p).toFixed(4)})`;
    }
    if (scrimRef.current) {
      scrimRef.current.style.opacity = Math.pow(inv, 1.15).toFixed(3);
    }
    if (photoWrapRef.current) {
      // The portrait beats on its own, always — this is the "heart" of the
      // screen and it should look alive before anybody touches it. Bigger than
      // it was (it used to be a 1.5% twitch nobody noticed), and bigger again
      // where there is no Vibration API at all (iOS Safari), because there the
      // beat has to be carried entirely by the eye.
      const amp = hapticsRef.current ? 0.032 : 0.046;
      photoWrapRef.current.style.transform = `scale(${(1 + amp * s.beat).toFixed(4)})`;
    }
    if (gifRef.current) {
      // Same beat, half the amplitude, so the animation and the face pulse
      // together rather than looking like two separate loops.
      gifRef.current.style.transform = `translateX(-50%) scale(${(1 + 0.05 * s.beat).toFixed(4)})`;
    }
    if (ringRef.current) {
      const [r, g, b] = ringRgb(p);
      ringRef.current.style.strokeDashoffset = (RING_LEN * inv).toFixed(2);
      ringRef.current.style.stroke = `rgb(${r},${g},${b})`;
    }
    if (haloRef.current) {
      const [r, g, b] = ringRgb(p);
      haloRef.current.style.background = `radial-gradient(circle, rgba(${r},${g},${b},${(0.10 + 0.5 * p).toFixed(3)}) 0%, rgba(${r},${g},${b},0) 68%)`;
      haloRef.current.style.transform = `scale(${(1 + 0.22 * p + 0.05 * s.beat).toFixed(4)})`;
    }
    // NOTE: the page background is no longer written here. It is the stage's
    // gradient, applied in render with a slow CSS transition, so the world
    // visibly warms from indigo night to golden dawn as they hold instead of
    // shifting imperceptibly every frame.
  }, []);

  const engine = useHoldEngine({
    durationMs: data.durationMs,
    hands: data.hands,
    mode: data.mode,
    holdLines: lines,
    ghostCount: data.ghostFragments.length,
    reducedMotion: reduced,
    enabled: !paused,
    onFrame,
    onWin,
    releaseLineFor,
  });

  const { holding, releaseCount, won, activeLine, ghostsShown, baitLive, coarseMs } = engine;
  const hasStarted = holding || releaseCount > 0 || coarseMs > 0;
  hapticsRef.current = engine.hasVibrate;

  // ── Kill pull-to-refresh and page scroll for the duration of the hold ──────
  useEffect(() => {
    const body = document.body;
    const prevOverscroll = body.style.overscrollBehavior;
    const prevOverflow = body.style.overflow;
    body.style.overscrollBehavior = "none";
    if (!revealed) body.style.overflow = "hidden";
    return () => {
      body.style.overscrollBehavior = prevOverscroll;
      body.style.overflow = prevOverflow;
    };
  }, [revealed]);

  // ── Letter reveal, line by line ────────────────────────────────────────────
  const letterLines = useMemo(
    () => data.letter.split("\n").map((l) => l.trim()).filter(Boolean),
    [data.letter],
  );
  useEffect(() => {
    if (!revealed || letterStep >= letterLines.length) return;
    const t = setTimeout(() => setLetterStep((s) => s + 1), reduced ? 120 : 600);
    return () => clearTimeout(t);
  }, [revealed, letterStep, letterLines.length, reduced]);

  // Reduced motion skips the burst entirely.
  useEffect(() => {
    if (won && reduced) setRevealed(true);
  }, [won, reduced]);

  const brandBadge = mode === "live" && (
    <Link
      href="/templates"
      onPointerDown={(e) => e.stopPropagation()}
      className="fixed z-[140] flex flex-col items-center gap-1 no-underline"
      style={{ top: "calc(12px + env(safe-area-inset-top, 0px))", right: 12 }}
    >
      <span
        className="grid place-items-center overflow-hidden"
        style={{
          width: 36, height: 36, borderRadius: 11,
          background: "rgba(255,255,255,.92)",
          border: "1px solid rgba(255,255,255,.35)",
          boxShadow: "0 6px 18px -6px rgba(108,92,231,.6)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.webp" alt="SubhSandesh" width={28} height={28} style={{ objectFit: "contain" }} />
      </span>
      <span style={{ fontFamily: HMH.display, fontSize: 8, fontWeight: 700, letterSpacing: ".04em", color: "rgba(255,255,255,.8)", lineHeight: 1 }}>
        SubhSandesh
      </span>
    </Link>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // The payoff
  // ═══════════════════════════════════════════════════════════════════════════
  if (revealed) {
    return (
      <main
        className="relative w-full overflow-x-hidden"
        style={{
          minHeight: "100dvh",
          // The letter opens in the same golden dawn the hold ended in, rather
          // than snapping back to the indigo night they started in.
          background: STAGES[STAGES.length - 1].bg,
          fontFamily: HMH.body,
          color: "#fff",
        }}
      >
        {brandBadge}
        <div className="mx-auto w-full max-w-md md:max-w-2xl px-6 pt-20 pb-16 flex flex-col items-center">
          <p className="text-center" style={{ fontFamily: HMH.script, fontSize: 30, color: HMH.lime, lineHeight: 1.1 }}>
            {data.recipientName ? `${data.recipientName},` : "you held on."}
          </p>

          <div className="mt-8 w-full space-y-4">
            {letterLines.map((line, i) => (
              <p
                key={i}
                className="transition-all duration-700"
                style={{
                  fontSize: 15,
                  lineHeight: 1.75,
                  color: "rgba(255,255,255,.86)",
                  opacity: i < letterStep ? 1 : 0,
                  transform: i < letterStep ? "translateY(0)" : "translateY(10px)",
                }}
              >
                {line}
              </p>
            ))}
          </div>

          {data.senderName && letterStep >= letterLines.length && (
            <p className="self-end mt-6" style={{ fontFamily: HMH.script, fontSize: 24, color: "rgba(255,255,255,.9)" }}>
              — {data.senderName}
            </p>
          )}

          {/* Their photographs, under the letter they just earned. */}
          <MemoryCards memories={data.memories} reduced={reduced} accent={STAGES[STAGES.length - 1].accent} />

          <div className="mt-12 w-full flex justify-center">
            {stats && (
              <ResultCard
                stats={stats}
                recipientName={data.recipientName}
                senderName={data.senderName}
                reduced={reduced}
              />
            )}
          </div>

          {mode === "live" && (
            <Link
              href="/templates"
              className="mt-10 text-xs no-underline"
              style={{ color: "rgba(255,255,255,.5)", fontFamily: HMH.display, letterSpacing: ".1em" }}
            >
              make one of these →
            </Link>
          )}
        </div>
      </main>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // The hold surface
  // ═══════════════════════════════════════════════════════════════════════════
  const ghostFragments = data.ghostFragments.slice(0, GHOST_SPOTS.length);

  return (
    <section
      ref={rootRef}
      {...engine.bind}
      aria-label="Press and hold to unlock the letter"
      className="fixed inset-0 z-0 overflow-hidden select-none"
      style={{
        // The world warms as they hold: indigo night -> plum -> rose -> ember ->
        // golden dawn, one step per stage. A long transition means the change is
        // felt rather than seen, and a glance at the screen says roughly how far
        // in they are without reading the timer. Reduced motion keeps the first
        // stage's flat night and never moves.
        background: reduced ? STAGES[0].bg : stage.bg,
        transition: "background 2200ms cubic-bezier(.4,0,.2,1)",
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
        WebkitTapHighlightColor: "transparent",
        fontFamily: HMH.body,
        color: "#fff",
        cursor: won ? "default" : "pointer",
      }}
    >
      {/*
        The animation sits ABOVE the portrait, not behind it.

        It used to be a webm blooming behind the photo at low opacity, which
        read as a grey smudge under the face rather than as anything holding
        anybody. Above the circle it has room to be what it is — two hearts,
        then a hug — and the face underneath stays the thing you look at.

        It changes with the stage (see moments.ts) and beats on the same frame
        as the portrait, so the whole centre of the screen has one pulse.
        Reduced motion drops it: it is decoration, and a looping gif is exactly
        what that setting is asking us not to play.
      */}
      {!reduced && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={gifRef}
          key={stage.gif}
          src={stage.gif}
          alt={stage.alt}
          className="absolute pointer-events-none"
          style={{
            left: "50%",
            transform: "translateX(-50%)",
            // Sits just above the portrait on every screen: the circle is
            // min(70vw,340px) and vertically centred, so half of it plus a
            // gap puts this clear of the frame without overlapping the timer.
            bottom: "calc(50% + min(35vw, 170px) + 14px)",
            width: "min(38vw, 150px)",
            maxHeight: "22vh",
            objectFit: "contain",
            // These animations are drawn on white. Left bare on a dark page
            // that reads as a broken image box, so it is framed as a sticker
            // on purpose — rounded, hairline border, soft drop shadow.
            borderRadius: 18,
            border: "1px solid rgba(255,255,255,.22)",
            boxShadow: "0 18px 40px -14px rgba(0,0,0,.75)",
            opacity: hasStarted ? 1 : 0.88,
            transition: "opacity 600ms ease",
            willChange: "transform",
          }}
        />
      )}

      {/* A warm line when the world changes, under the timer. */}
      <AnimatePresence mode="wait">
        {hasStarted && !won && !activeLine && (
          <motion.p
            key={`whisper-${stageIdx}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 0.75, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute left-0 right-0 text-center px-10 pointer-events-none"
            style={{
              top: "calc(50% + min(35vw, 170px) + 74px)",
              fontFamily: HMH.script,
              fontSize: 19,
              lineHeight: 1.3,
              color: stage.accent,
              textShadow: "0 2px 16px rgba(0,0,0,.55)",
            }}
          >
            {stage.whisper}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Ghost fragments — behind the photo. Draining takes them away again. */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        {ghostFragments.map((frag, i) => {
          const { rotate, ...pos } = GHOST_SPOTS[i];
          const on = i < ghostsShown;
          return (
            <span
              key={i}
              className="absolute transition-opacity duration-700"
              style={{
                ...pos,
                transform: `rotate(${rotate}deg)`,
                maxWidth: "38vw",
                fontFamily: HMH.script,
                fontSize: 17,
                lineHeight: 1.25,
                color: "rgba(255,255,255,.30)",
                opacity: on ? 1 : 0,
              }}
            >
              {frag}
            </span>
          );
        })}
      </div>

      {/* Photo + ring */}
      <div className="absolute inset-0 grid place-items-center pointer-events-none">
        <div className="relative" style={{ width: "min(70vw, 340px)", aspectRatio: "1 / 1" }}>
          <span
            ref={haloRef}
            aria-hidden
            className="absolute pointer-events-none"
            style={{ inset: "-24%", borderRadius: "50%", filter: "blur(18px)" }}
          />

          <svg viewBox={`0 0 ${RING_VB} ${RING_VB}`} className="absolute inset-0 w-full h-full -rotate-90">
            <circle cx={RING_VB / 2} cy={RING_VB / 2} r={RING_R} fill="none" stroke="rgba(255,255,255,.09)" strokeWidth={4} />
            <circle
              ref={ringRef}
              cx={RING_VB / 2} cy={RING_VB / 2} r={RING_R}
              fill="none" strokeWidth={5} strokeLinecap="round"
              stroke="rgb(96,108,168)"
              strokeDasharray={RING_LEN}
              strokeDashoffset={RING_LEN}
            />
          </svg>

          <div
            ref={photoWrapRef}
            className={`absolute rounded-full overflow-hidden ${won ? "hmh-dissolve" : ""}`}
            style={{ inset: "9%", willChange: "transform" }}
          >
            <div ref={photoRef} className="absolute inset-0" style={{ willChange: "filter, transform", transform: "scale(1.16)" }}>
              {showHeart ? <HeartFallback /> : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.photoUrl}
                  alt=""
                  onError={() => setPhotoBroken(true)}
                  draggable={false}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            {/* The dark they are coming out of. Lifts as p rises. */}
            <span
              ref={scrimRef}
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(circle at 50% 44%, rgba(7,5,13,.22) 0%, rgba(7,5,13,.80) 58%, rgba(7,5,13,.97) 100%)",
                opacity: 1,
              }}
            />
          </div>

          {/* Sits outside the photo box so nothing clips at the emission ring. */}
          {won && !reduced && (
            <div className="absolute pointer-events-none" style={{ inset: "-50%" }}>
              <ParticleBurst radiusRatio={0.23} onDone={() => setRevealed(true)} />
            </div>
          )}
        </div>
      </div>

      {/* Timer + progress semantics */}
      <div
        className="absolute left-0 right-0 flex flex-col items-center gap-1 pointer-events-none"
        style={{ top: "calc(50% + min(35vw, 170px) + 26px)" }}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={Math.round(data.durationMs / 1000)}
        aria-valuenow={Math.round(coarseMs / 1000)}
        aria-valuetext={`${Math.round(coarseMs / 1000)} of ${Math.round(data.durationMs / 1000)} seconds held`}
      >
        <span style={{ fontFamily: HMH.display, fontSize: 30, fontWeight: 700, letterSpacing: "-.03em", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
          {fmtSecs(coarseMs)}
        </span>
        <span style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(255,255,255,.4)" }}>
          of {fmtWhole(data.durationMs)} seconds
        </span>
      </div>

      {/* The line. Hold copy, release copy and the punishment all land here. */}
      <div className="absolute left-0 right-0 px-8 flex justify-center pointer-events-none" style={{ bottom: "20%" }}>
        <AnimatePresence mode="wait">
          {activeLine && (
            <motion.p
              key={activeLine.id}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: reduced ? 0.15 : 0.4 }}
              className="text-center"
              style={{
                fontFamily: activeLine.kind === "hold" ? HMH.body : HMH.script,
                fontSize: activeLine.kind === "hold" ? 17 : 26,
                lineHeight: 1.35,
                maxWidth: 330,
                color:
                  activeLine.kind === "punish" ? HMH.pink
                  : activeLine.kind === "release" ? "rgba(255,255,255,.94)"
                  : "rgba(255,255,255,.86)",
                textShadow: "0 2px 18px rgba(0,0,0,.7)",
              }}
            >
              {activeLine.text}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* The instruction — only until they have understood it */}
      <AnimatePresence>
        {!hasStarted && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute left-0 right-0 px-8 flex flex-col items-center gap-3 pointer-events-none text-center"
            style={{ bottom: "9%" }}
          >
            {data.hands === 2 && !reduced && (
              <video
                src={`${ASSET}/holding-hands.webm`}
                autoPlay loop muted playsInline aria-hidden
                className="w-20 h-auto opacity-80"
              />
            )}
            <p className="inline-flex items-center gap-2" style={{ fontFamily: HMH.display, fontSize: 15, fontWeight: 600, letterSpacing: ".02em" }}>
              <Hand size={16} />
              {data.hands === 2 ? "press and hold with two fingers" : "press and hold"}
            </p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,.5)", maxWidth: 300, lineHeight: 1.5 }}>
              {data.hands === 2
                ? "Two touches at once — opposite ends of the screen, or hand one side to somebody. On a laptop: hold Space and click."
                : `Don't let go for ${fmtWhole(data.durationMs)} seconds. Let go and it drains — three times faster than it filled.`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/*
        They let go before the end.

        A still image of somebody reaching out used to sit here. It is now the
        crying animation for however many times they have released — panda,
        bear, "don't be sad", cat — with the line that goes with it. The set
        escalates but never scolds: the feeling to leave them with is "come
        back", not "you failed", because this is a gift and nobody should be
        told off by one.
      */}
      <AnimatePresence>
        {hasStarted && !holding && !won && !reduced && (
          <motion.div
            key="released"
            initial={{ opacity: 0, y: 14, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 320, damping: 24 }}
            className="absolute left-0 right-0 flex flex-col items-center pointer-events-none px-8"
            style={{ bottom: "4%" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={releaseMoment(releaseCount).gif}
              alt={releaseMoment(releaseCount).alt}
              style={{
                width: "min(28vw, 112px)",
                maxHeight: "17vh",
                objectFit: "contain",
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,.2)",
                boxShadow: "0 16px 34px -12px rgba(0,0,0,.7)",
              }}
            />
            {!activeLine && (
            <p
              className="mt-2 text-center"
              style={{
                fontFamily: HMH.script,
                fontSize: 21,
                lineHeight: 1.25,
                color: "rgba(255,255,255,.92)",
                textShadow: "0 2px 18px rgba(0,0,0,.6)",
              }}
            >
              {releaseMoment(releaseCount).line}
            </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* The bait, in evil mode. */}
      <AnimatePresence>
        {baitLive && !reduced && (
          <motion.video
            key="bear"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 0.95, scale: 1 }}
            exit={{ opacity: 0 }}
            src={`${ASSET}/cute-bear-evil-laugh.webm`}
            autoPlay loop muted playsInline aria-hidden
            className="absolute pointer-events-none"
            style={{ top: "12%", left: "50%", translate: "-50% 0", width: 104 }}
          />
        )}
      </AnimatePresence>

      {/* Sound. On iOS there is no Vibration API at all, so this is the heartbeat. */}
      {engine.audioArmed && (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={engine.toggleAudio}
          className="absolute inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-semibold"
          style={{
            left: 12,
            bottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
            background: engine.audioOn ? "rgba(198,255,61,.16)" : "rgba(255,255,255,.09)",
            color: engine.audioOn ? HMH.lime : "rgba(255,255,255,.72)",
            border: "1px solid rgba(255,255,255,.14)",
            backdropFilter: "blur(8px)",
            minHeight: 40,
          }}
        >
          {engine.audioOn ? <Volume2 size={13} /> : <VolumeX size={13} />}
          {engine.audioOn ? "heartbeat on" : engine.hasVibrate ? "hear it" : "no buzz on iOS — hear it"}
        </button>
      )}

      {/* Never trap anybody. Three releases and the door opens. */}
      {releaseCount >= 3 && !won && (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={engine.forceComplete}
          className="absolute inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-semibold"
          style={{
            right: 12,
            bottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
            background: "rgba(255,255,255,.09)",
            color: "rgba(255,255,255,.66)",
            border: "1px solid rgba(255,255,255,.14)",
            backdropFilter: "blur(8px)",
            minHeight: 40,
          }}
        >
          <SkipForward size={13} /> just show me the letter
        </button>
      )}

      {brandBadge}

      <style jsx global>{`
        .hmh-dissolve {
          animation: hmh-dissolve 900ms cubic-bezier(.2,.8,.3,1) forwards;
        }
        @keyframes hmh-dissolve {
          0%   { opacity: 1; transform: scale(1); }
          55%  { opacity: 1; transform: scale(1.14); }
          100% { opacity: 0; transform: scale(1.35); }
        }
        @media (prefers-reduced-motion: reduce) {
          .hmh-dissolve { animation: none; opacity: 0; }
        }
      `}</style>
    </section>
  );
}

/**
 * Photo fallback. Shaded rather than flat, so the same grayscale/blur/brightness
 * ramp still reads as something emerging from the dark.
 */
function HeartFallback() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full" aria-hidden>
      <defs>
        <radialGradient id="hmh-h" cx="38%" cy="30%" r="78%">
          <stop offset="0%" stopColor="#FF9EC6" />
          <stop offset="48%" stopColor="#F72585" />
          <stop offset="100%" stopColor="#5A0B3B" />
        </radialGradient>
        <radialGradient id="hmh-hbg" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#3A2260" />
          <stop offset="100%" stopColor="#120A20" />
        </radialGradient>
      </defs>
      <rect width="200" height="200" fill="url(#hmh-hbg)" />
      <path
        d="M100 172C60 142 26 116 26 82c0-22 17-38 38-38 14 0 26 7 36 20 10-13 22-20 36-20 21 0 38 16 38 38 0 34-34 60-74 90z"
        fill="url(#hmh-h)"
      />
      <ellipse cx="76" cy="76" rx="20" ry="13" fill="#fff" opacity=".3" transform="rotate(-28 76 76)" />
    </svg>
  );
}
