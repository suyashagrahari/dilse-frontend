"use client";

// Screen 2. The canvas is the game; everything animated that is NOT the game
// (the stun reaction, the first-catch toast) is a DOM overlay sitting on top of
// it. Nothing from S3 is ever drawn into the canvas.

import { useEffect, useRef, useState } from "react";
import { templateMedia } from "@/lib/templateMedia";
import { FIELD, type BadItem, type GoodItem } from "./types";
import { useGameLoop, type RunResult } from "./useGameLoop";
import { INK_SOFT } from "./catchTheme";

export interface GameCanvasProps {
  running: boolean;
  roundKey: number;
  goodItems: GoodItem[];
  badItems: BadItem[];
  durationMs: number;
  seed: string;
  faceRef: React.MutableRefObject<HTMLImageElement | null>;
  initial: string;
  faceFillColor: string;
  warmthRef: React.MutableRefObject<number>;
  showFirstCatch: boolean;
  onCatch: (item: GoodItem, streak: number) => void;
  onHit: (stunUntilMs: number) => void;
  onEnd: (result: RunResult) => void;
}

export default function GameCanvas(props: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stunned, setStunned] = useState(false);
  const stunTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleHit = (until: number) => {
    setStunned(true);
    if (stunTimer.current) clearTimeout(stunTimer.current);
    stunTimer.current = setTimeout(() => setStunned(false), Math.max(120, until - performance.now()));
    props.onHit(until);
  };

  useEffect(
    () => () => {
      if (stunTimer.current) clearTimeout(stunTimer.current);
    },
    [],
  );

  useGameLoop({
    canvasRef,
    running: props.running,
    roundKey: props.roundKey,
    goodItems: props.goodItems,
    badItems: props.badItems,
    durationMs: props.durationMs,
    seed: props.seed,
    faceRef: props.faceRef,
    initial: props.initial,
    faceFillColor: props.faceFillColor,
    warmthRef: props.warmthRef,
    onCatch: props.onCatch,
    onHit: handleHit,
    onEnd: props.onEnd,
  });

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <canvas
        ref={canvasRef}
        aria-label="Catch the falling pieces of the letter"
        role="img"
        className="rounded-2xl"
        style={{
          height: "100%",
          width: "auto",
          maxWidth: "100%",
          maxHeight: "100%",
          aspectRatio: `${FIELD.w} / ${FIELD.h}`,
          touchAction: "none",
          border: "1px solid rgba(44,42,38,0.10)",
          boxShadow: "0 10px 30px rgba(44,42,38,0.10)",
          display: "block",
        }}
      />

      {/* 400ms stun reaction — DOM, above the canvas. */}
      {stunned && (
        <video
          key="stunned"
          src={templateMedia("catch", "stunned.webm")}
          autoPlay
          loop
          muted
          playsInline
          aria-hidden
          className="pointer-events-none absolute bottom-[14%] left-1/2 h-[86px] w-[86px] -translate-x-1/2 object-contain"
        />
      )}

      {/* The first time they catch something, once, for a second. */}
      {props.showFirstCatch && (
        <div className="pointer-events-none absolute left-1/2 top-3 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-[rgba(255,253,247,0.94)] px-3 py-1.5 shadow">
          <video
            src={templateMedia("catch", "first-catch.webm")}
            autoPlay
            muted
            playsInline
            aria-hidden
            className="h-7 w-7 object-contain"
          />
          <span
            className="text-[11px] font-semibold"
            style={{ color: INK_SOFT, fontFamily: "var(--font-outfit), system-ui, sans-serif" }}
          >
            that&apos;s one line
          </span>
        </div>
      )}
    </div>
  );
}
