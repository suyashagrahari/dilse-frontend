"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { LeaderRow, SoloRow } from "./PathRecapCard";
import { sfxUiTap } from "./loveflixAudio";
import { ACCENT, BG, FONT_BODY, FONT_DISPLAY, HAIRLINE, TAP, TEXT, TEXT_DIM } from "./theme";
import { PLAYER, WORDMARK, type LoveflixData } from "./types";

// ─── Screen 6 — end credits ──────────────────────────────────────────────────
//
// A slow upward crawl over black, then the autoplay countdown that loops back
// to browse. The rows use the same leader-dot primitive as the recap card, so
// "Directed by ......... Rohan" and "you chose ......... to stay" are the same
// component with different copy.
//
// Cancel is real. It kills the clock permanently — the rAF is cancelled, the
// guard flag makes a late frame a no-op, and the screen then stays put with a
// manual way back. A countdown you cannot stop is worse than no countdown.

export interface CreditsScreenProps {
  data: LoveflixData;
  /** Autoplay countdown elapsed (or skipped) → back to browse. */
  onReplay: () => void;
  reducedMotion: boolean;
}

const KEYFRAMES = `
@keyframes lfxCreditsCrawl {
  from { transform: translate3d(0, 0, 0); }
  to   { transform: translate3d(0, -100%, 0); }
}
@keyframes lfxCreditsIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: none; }
}
`;

/** Long enough to read, short enough not to strand anybody. */
const crawlDuration = (lines: number): number => Math.min(34_000, Math.max(11_000, lines * 1600 + 6500));

const LIST_MAX_W = 460;
const RING_R = 25;
const RING_C = 2 * Math.PI * RING_R;

export default function CreditsScreen({ data, onReplay, reducedMotion }: CreditsScreenProps) {
  const credits = data.credits;
  const crawlMs = useMemo(() => crawlDuration(credits.length + 2), [credits.length]);

  // With motion off there is no crawl to wait for, so the countdown — which is
  // information, not decoration — starts straight away. Derived, not set in an
  // effect, so the first paint is already correct.
  const [crawlDone, setCrawlDone] = useState(false);
  const ended = reducedMotion || crawlDone;

  const skip = useCallback(() => {
    sfxUiTap();
    setCrawlDone(true);
  }, []);

  const list = (
    <div style={{ width: "100%", maxWidth: LIST_MAX_W, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
      {credits.map((c, i) =>
        c.name.trim() ? (
          <LeaderRow key={`${c.role}-${i}`} left={c.role} right={c.name} fontSize={17} />
        ) : (
          <SoloRow key={`${c.role}-${i}`} text={c.role} fontSize={17} />
        ),
      )}
    </div>
  );

  const titleCard = (
    <div style={{ width: "100%", maxWidth: LIST_MAX_W, margin: "0 auto 46px", textAlign: "center" }}>
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontWeight: 700,
          fontSize: 20,
          letterSpacing: "0.30em",
          color: ACCENT,
          textTransform: "uppercase",
        }}
      >
        {WORDMARK}
      </div>
      <div
        style={{
          marginTop: 18,
          fontFamily: FONT_DISPLAY,
          fontWeight: 700,
          fontSize: "clamp(38px, 11vw, 62px)",
          lineHeight: 0.98,
          letterSpacing: "-0.01em",
          textTransform: "uppercase",
          color: TEXT,
        }}
      >
        {data.showTitle}
      </div>
      <div style={{ height: 1, background: HAIRLINE, margin: "28px 0 0" }} />
    </div>
  );

  return (
    <section
      style={{
        position: "relative",
        minHeight: "100dvh",
        background: BG,
        color: TEXT,
        fontFamily: FONT_BODY,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{KEYFRAMES}</style>

      {reducedMotion ? (
        // Static, scrollable, complete. Same rows, same order, no crawl.
        <div style={{ flex: "1 1 auto", padding: "clamp(40px, 10vh, 96px) 20px 0" }}>
          {titleCard}
          {list}
          <div style={{ height: 48 }} />
        </div>
      ) : !ended ? (
        <>
          <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
            <div
              onAnimationEnd={() => setCrawlDone(true)}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                padding: "0 20px",
                animation: `lfxCreditsCrawl ${crawlMs}ms linear forwards`,
                willChange: "transform",
              }}
            >
              {/* A viewport of lead-in, so the crawl starts from below the fold. */}
              <div style={{ height: "100dvh" }} />
              {titleCard}
              {list}
              <div style={{ height: "34dvh" }} />
            </div>
          </div>

          <button
            type="button"
            onClick={skip}
            style={{
              position: "absolute",
              right: 12,
              bottom: "calc(14px + env(safe-area-inset-bottom, 0px))",
              minHeight: TAP,
              minWidth: TAP + 44,
              padding: "10px 16px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(22,22,22,0.7)",
              color: TEXT_DIM,
              fontFamily: FONT_BODY,
              fontSize: 12.5,
              letterSpacing: "0.08em",
              cursor: "pointer",
            }}
          >
            skip to end
          </button>
        </>
      ) : (
        <div
          style={{
            flex: "1 1 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 20px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: "0.30em",
              color: ACCENT,
              textTransform: "uppercase",
              animation: "lfxCreditsIn 700ms ease both",
            }}
          >
            {WORDMARK}
          </div>
          <div
            style={{
              marginTop: 14,
              fontFamily: FONT_BODY,
              fontSize: 15,
              color: TEXT_DIM,
              animation: "lfxCreditsIn 700ms ease 120ms both",
            }}
          >
            {data.showTitle} · {data.seasons}
          </div>
        </div>
      )}

      <AutoplayPanel active={ended} reducedMotion={reducedMotion} onReplay={onReplay} />
    </section>
  );
}

// ─── Autoplay countdown ──────────────────────────────────────────────────────

function AutoplayPanel({
  active,
  reducedMotion,
  onReplay,
}: {
  active: boolean;
  reducedMotion: boolean;
  onReplay: () => void;
}) {
  const total: number = PLAYER.autoplayNextSeconds;
  const [remaining, setRemaining] = useState<number>(total);
  const [cancelled, setCancelled] = useState(false);
  const remainingRef = useRef(total);
  const firedRef = useRef(false);
  const ringRef = useRef<SVGCircleElement | null>(null);

  useEffect(() => {
    if (!active || cancelled) return;

    let raf = 0;
    let dead = false;
    const totalMs = total * 1000;
    const start = performance.now();

    const frame = (now: number) => {
      if (dead) return;
      const left = Math.max(0, totalMs - (now - start));
      const secs = Math.ceil(left / 1000);
      if (secs !== remainingRef.current) {
        remainingRef.current = secs;
        setRemaining(secs);
      }
      // The ring drains smoothly normally, and in whole seconds with motion
      // off — the number is the information, the sweep is the decoration.
      const frac = reducedMotion ? secs / total : left / totalMs;
      if (ringRef.current) ringRef.current.style.strokeDashoffset = String(RING_C * (1 - frac));

      if (left <= 0) {
        dead = true;
        if (!firedRef.current) {
          firedRef.current = true;
          onReplay();
        }
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => {
      dead = true;
      cancelAnimationFrame(raf);
    };
  }, [active, cancelled, onReplay, reducedMotion, total]);

  const cancel = useCallback(() => {
    sfxUiTap();
    // Flipping this tears down the effect, which cancels the frame; `firedRef`
    // makes any in-flight frame a no-op. No stale timer can reach onReplay.
    setCancelled(true);
    firedRef.current = true;
  }, []);

  const back = useCallback(() => {
    sfxUiTap();
    onReplay();
  }, [onReplay]);

  if (!active) return null;

  return (
    <div
      style={{
        position: "sticky",
        bottom: 0,
        left: 0,
        right: 0,
        padding: "16px 18px calc(18px + env(safe-area-inset-bottom, 0px))",
        background: "linear-gradient(to top, rgba(13,13,13,0.98) 24%, rgba(13,13,13,0))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      {!cancelled ? (
        <>
          <div style={{ position: "relative", width: 58, height: 58, flex: "0 0 auto" }}>
            <svg width={58} height={58} viewBox="0 0 58 58" aria-hidden style={{ transform: "rotate(-90deg)" }}>
              <circle cx={29} cy={29} r={RING_R} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth={3} />
              <circle
                ref={ringRef}
                cx={29}
                cy={29}
                r={RING_R}
                fill="none"
                stroke={ACCENT}
                strokeWidth={3}
                strokeLinecap="round"
                strokeDasharray={RING_C}
                strokeDashoffset={0}
              />
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: FONT_DISPLAY,
                fontWeight: 700,
                fontSize: 22,
                color: TEXT,
              }}
            >
              {remaining}
            </div>
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              aria-live="polite"
              style={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 600,
                fontSize: 17,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: TEXT,
              }}
            >
              Next episode in {remaining}…
            </div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 12.5, color: TEXT_DIM, marginTop: 3 }}>
              it&rsquo;s the same one. it was always the same one.
            </div>
          </div>

          <button
            type="button"
            onClick={cancel}
            style={{
              minHeight: TAP,
              minWidth: 108,
              padding: "11px 18px",
              borderRadius: 4,
              border: "1px solid rgba(255,255,255,0.24)",
              background: "transparent",
              color: TEXT,
              fontFamily: FONT_DISPLAY,
              fontWeight: 600,
              fontSize: 15,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            [ Cancel ]
          </button>
        </>
      ) : (
        <>
          <div style={{ fontFamily: FONT_BODY, fontSize: 13.5, color: TEXT_DIM }}>Autoplay off. Stay as long as you like.</div>
          <button
            type="button"
            onClick={back}
            style={{
              minHeight: TAP,
              minWidth: 148,
              padding: "11px 20px",
              borderRadius: 4,
              border: "none",
              background: ACCENT,
              color: BG,
              fontFamily: FONT_DISPLAY,
              fontWeight: 700,
              fontSize: 15,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Back to browse
          </button>
        </>
      )}
    </div>
  );
}
