"use client";

// ─── Rewind — slide 7: the photo stack ───────────────────────────────────────
//
// Up to four prints thrown down in a loose overlapping pile, each one dropping
// into place a beat after the last. Every rotation and offset is SEEDED, never
// random: the pile has to look identical on the screen and in the exported PNG.
//
// A URL that fails to load is removed from the pile entirely and the remaining
// prints re-lay themselves out, so a dead link never shows as a broken icon or
// as a hole in the composition.

import React from "react";
import { seededSpread } from "@/lib/seededRandom";
import { EASE_OUT_EXPO } from "../types";
import { BODY_FONT, DISPLAY_FONT, FadeUp, LetterSpaceIn } from "../kinetic";
import type { SlideProps } from "../slideTypes";

/** Up to eight may be supplied. Four is the most that reads as a pile. */
const MAX_PHOTOS = 4;
const STAGGER_MS = 180;
const DROP_MS = 520;

type LoadState = "pending" | "ok" | "fail";

/** Flip to the final state one committed frame after mount. */
function useEnter(reduced: boolean): boolean {
  const [entered, setEntered] = React.useState(reduced);
  React.useEffect(() => {
    if (reduced) {
      setEntered(true);
      return;
    }
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setEntered(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [reduced]);
  return entered;
}

export default function PhotoStackSlide({
  data,
  def,
  reduced,
  seed,
}: SlideProps): React.JSX.Element {
  const candidates = React.useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const raw of data.photos) {
      const url = raw.trim();
      if (!url || seen.has(url)) continue;
      seen.add(url);
      out.push(url);
      if (out.length >= MAX_PHOTOS) break;
    }
    return out;
  }, [data.photos]);

  const [load, setLoad] = React.useState<Record<string, LoadState>>({});
  const mark = React.useCallback((url: string, next: LoadState) => {
    setLoad((prev) => (prev[url] === next ? prev : { ...prev, [url]: next }));
  }, []);

  // Failures leave the pile completely; the survivors re-index, so their seeded
  // rotations recompute and the remaining prints still look deliberate.
  const live = candidates.filter((u) => load[u] !== "fail");
  const entered = useEnter(reduced);

  const n = Math.max(1, live.length);
  const eyebrow = "THE EVIDENCE";
  const caption =
    live.length === 0
      ? "the camera roll declined to comment."
      : live.length === 1
        ? "one that survived the camera roll."
        : `${live.length} that survived the camera roll.`;

  return (
    <div
      className="flex w-full flex-col items-center"
      style={{
        height: "100%",
        minHeight: "100dvh",
        boxSizing: "border-box",
        overflow: "hidden",
        color: def.fg,
        paddingTop: "calc(72px + env(safe-area-inset-top))",
        paddingBottom: "calc(30px + env(safe-area-inset-bottom))",
        paddingLeft: 24,
        paddingRight: 24,
      }}
    >
      <LetterSpaceIn
        reduced={reduced}
        delayMs={60}
        durationMs={620}
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: "0.34em",
          textTransform: "uppercase",
          opacity: 0.72,
        }}
      >
        {eyebrow}
      </LetterSpaceIn>

      <div
        style={{
          position: "relative",
          flex: 1,
          width: "100%",
          minHeight: 0,
          marginTop: 18,
        }}
      >
        {candidates.map((url) => {
          const i = live.indexOf(url);
          const hidden = i < 0 || load[url] !== "ok";
          const mid = (n - 1) / 2;
          const slot = i < 0 ? 0 : i;

          const baseX = (slot - mid) * 20;
          const baseY = (slot - mid) * 22;
          const jitterX = seededSpread(seed, `photo:x:${slot}`, 8);
          const jitterY = seededSpread(seed, `photo:y:${slot}`, 8);
          const rot = seededSpread(seed, `photo:${slot}`, 6);
          const x = baseX + jitterX;
          const y = baseY + jitterY;

          const settled = `translate(calc(-50% + ${x.toFixed(2)}px), calc(-50% + ${y.toFixed(2)}px)) rotate(${rot.toFixed(2)}deg) scale(1)`;
          const dropped = `translate(calc(-50% + ${x.toFixed(2)}px), calc(-50% + ${(y - 26).toFixed(2)}px)) rotate(${(rot * 2.6).toFixed(2)}deg) scale(1.14)`;
          const show = entered && !hidden;

          return (
            <div
              key={url}
              aria-hidden={hidden ? true : undefined}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: "min(56vw, 214px)",
                zIndex: slot + 1,
                transform: show || reduced ? settled : dropped,
                opacity: show ? 1 : 0,
                transition: reduced
                  ? "none"
                  : `transform ${DROP_MS}ms ${EASE_OUT_EXPO} ${slot * STAGGER_MS}ms, opacity ${Math.round(DROP_MS * 0.6)}ms linear ${slot * STAGGER_MS}ms`,
                background: "#FFFFFF",
                padding: 8,
                paddingBottom: 22,
                borderRadius: 2,
                outline: `1px solid ${def.fg}22`,
                boxShadow:
                  "8px 10px 0 rgba(0,0,0,0.20), 0 16px 36px rgba(0,0,0,0.28)",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "4 / 5",
                  overflow: "hidden",
                  background: "#E8E8EA",
                }}
              >
                {/* Plain <img>, not next/image: the share-card export must not
                    be tainted by a proxied or re-encoded source. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  crossOrigin="anonymous"
                  loading="eager"
                  decoding="async"
                  draggable={false}
                  onLoad={() => mark(url, "ok")}
                  onError={() => mark(url, "fail")}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <FadeUp
        reduced={reduced}
        delayMs={live.length * STAGGER_MS + 320}
        durationMs={620}
        fromY={16}
        style={{
          fontFamily: BODY_FONT,
          fontSize: 15,
          lineHeight: 1.3,
          textAlign: "center",
          opacity: 0.82,
          marginTop: 18,
          maxWidth: 320,
        }}
      >
        {caption}
      </FadeUp>
    </div>
  );
}
