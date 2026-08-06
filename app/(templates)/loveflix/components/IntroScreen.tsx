"use client";

import { useCallback, useEffect, useRef, type KeyboardEvent } from "react";

import { sfxIntroSting } from "./loveflixAudio";
import { ACCENT, BG, FONT_DISPLAY, TEXT } from "./theme";
import { PLAYER, WORDMARK } from "./types";

export interface IntroScreenProps {
  /** Auto-advance after PLAYER.introMs, or immediately when tapped to skip. */
  onDone: () => void;
  /** Call from the tap handler BEFORE playing anything — unlocks the context. */
  onFirstGesture: () => void;
  reducedMotion: boolean;
}

// ─── Landing the sting on the wordmark's beat ────────────────────────────────
//
// The animation starts on mount (t = 0) and RESOLVES at t = PLAYER.wordmarkMs
// (1400ms) — that is the frame the tracking finishes tightening, the blur
// clears and the type reaches full brightness. That frame is the beat.
//
// The sting's own internal shape (see loveflixAudio.ts):
//   sting t+0ms    note one — 146.83Hz, 180ms
//   sting t+180ms  note two — 220Hz, 400ms   ← this is the note that must land
//
// So the arithmetic is:
//
//   fire the sting at  PLAYER.wordmarkMs − STING_NOTE_TWO_OFFSET_MS
//                    = 1400 − 180
//                    = 1220ms after mount
//
//   → note one sounds at 1220ms, while the letters are still closing up
//   → note two begins at 1220 + 180 = 1400ms = PLAYER.wordmarkMs, exactly on
//     the landing
//   → note two ends at 1400 + 400 = 1800ms, leaving 700ms of quiet black
//     before onDone() fires at PLAYER.introMs (2500ms)
//
// Mirrors NOTE_TWO_OFFSET_MS in loveflixAudio.ts. If one changes, change both.
const STING_NOTE_TWO_OFFSET_MS = 180;
const STING_CUE_MS = Math.max(0, PLAYER.wordmarkMs - STING_NOTE_TWO_OFFSET_MS);

/** Horizontal condensation. The display face is narrow; this takes it further. */
const CONDENSE_X = 0.88;

/** Resting tracking. Slightly negative — the letters just touch at rest. */
const TRACK_END = "-0.022em";

/** #RRGGBB → rgba(), so the accent is never hardcoded as a literal anywhere. */
const rgba = (hex: string, a: number): string => {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

// Starting tracking is a custom property rather than a literal in the keyframe
// so it can shrink on narrow screens. At 380px a +0.5em start would push the
// word wider than the viewport and clip; 0.30em is as wide as it can open
// without overflowing, and with the scale-down and blur it still reads as
// "spread out and unresolved".
const CSS = `
.lfx-intro-stage{
  position:relative;display:flex;align-items:center;justify-content:center;
  width:100%;min-height:100vh;min-height:100dvh;overflow:hidden;
  padding:24px;box-sizing:border-box;background:${BG};
  cursor:pointer;user-select:none;-webkit-user-select:none;
  -webkit-tap-highlight-color:transparent;touch-action:manipulation;
}
.lfx-intro-stage:focus-visible{outline:2px solid ${rgba(ACCENT, 0.6)};outline-offset:-6px;}
.lfx-intro-column{
  position:relative;display:flex;flex-direction:column;align-items:center;
  justify-content:center;max-width:100%;
}
.lfx-intro-bloom{
  position:absolute;inset:-140% -34%;pointer-events:none;z-index:0;
  background:radial-gradient(50% 50% at 50% 50%,
    ${rgba(ACCENT, 0.2)} 0%, ${rgba(ACCENT, 0.055)} 46%, ${rgba(ACCENT, 0)} 72%);
  animation:lfx-intro-bloom ${PLAYER.wordmarkMs}ms cubic-bezier(0.58,0,0.5,1) both;
}
.lfx-intro-markwrap{
  position:relative;z-index:1;transform:scaleX(${CONDENSE_X});
  transform-origin:50% 50%;max-width:100%;
}
.lfx-intro-mark{
  --lfx-track-start:0.30em;
  display:inline-block;white-space:nowrap;
  font-family:${FONT_DISPLAY};font-weight:700;font-size:clamp(2.6rem,15.5vw,9rem);
  line-height:0.92;text-transform:uppercase;color:${TEXT};
  will-change:letter-spacing,transform,opacity,filter;
  animation:lfx-intro-mark ${PLAYER.wordmarkMs}ms linear both;
}
.lfx-intro-rule{
  position:relative;z-index:1;height:1px;width:min(56vw,470px);
  margin-top:clamp(12px,2.4vw,30px);transform-origin:50% 50%;
  background:linear-gradient(90deg,
    ${rgba(ACCENT, 0)} 0%, ${rgba(ACCENT, 0.75)} 50%, ${rgba(ACCENT, 0)} 100%);
  animation:lfx-intro-rule ${PLAYER.wordmarkMs}ms cubic-bezier(0.24,0.72,0.16,1) both;
}
@keyframes lfx-intro-mark{
  0%{
    letter-spacing:var(--lfx-track-start);
    margin-right:calc(-1 * var(--lfx-track-start));
    opacity:0.05;transform:scale(0.94);filter:blur(7px);
    animation-timing-function:cubic-bezier(0.14,0.78,0.28,1);
  }
  72%{
    letter-spacing:0.075em;margin-right:-0.075em;
    opacity:0.94;transform:scale(1.006);filter:blur(0.4px);
    animation-timing-function:cubic-bezier(0.36,0,0.14,1);
  }
  100%{
    letter-spacing:${TRACK_END};margin-right:calc(-1 * ${TRACK_END});
    opacity:1;transform:scale(1);filter:blur(0px);
  }
}
@keyframes lfx-intro-rule{
  0%,20%{transform:scaleX(0);opacity:0;}
  100%{transform:scaleX(1);opacity:1;}
}
@keyframes lfx-intro-bloom{
  0%,26%{opacity:0;transform:scale(1.28);}
  100%{opacity:1;transform:scale(1);}
}
.lfx-intro-still .lfx-intro-mark,
.lfx-intro-still .lfx-intro-rule{animation:none;}
.lfx-intro-still .lfx-intro-mark{
  letter-spacing:${TRACK_END};margin-right:calc(-1 * ${TRACK_END});
  opacity:1;transform:none;filter:none;will-change:auto;
}
.lfx-intro-still .lfx-intro-rule{transform:none;opacity:1;}
@media (prefers-reduced-motion:reduce){
  .lfx-intro-mark,.lfx-intro-rule{animation:none !important;}
  .lfx-intro-mark{
    letter-spacing:${TRACK_END} !important;margin-right:calc(-1 * ${TRACK_END}) !important;
    opacity:1 !important;transform:none !important;filter:none !important;
  }
  .lfx-intro-rule{transform:none !important;opacity:1 !important;}
  .lfx-intro-bloom{display:none !important;}
}
`;

/**
 * Screen 1. Black, one word, two notes, 2.5 seconds.
 *
 * The whole idea is the TRACKING: the wordmark opens wide, dim and out of
 * focus, then closes up and brightens, decelerating hard so it appears to
 * settle into place rather than slide to a stop. The accent does exactly two
 * restrained things — a bloom behind the letters and a hairline that sweeps
 * out beneath them — and both resolve on the same beat as the type.
 *
 * Reduced motion gets the resolved state immediately: no scale, no tracking
 * animation, no bloom. It still auto-advances and it is still skippable,
 * because reduced motion removes decoration and never functionality. The sting
 * still plays; sound is not motion.
 */
export default function IntroScreen({ onDone, onFirstGesture, reducedMotion }: IntroScreenProps) {
  const doneRef = useRef(false);

  const finish = useCallback(() => {
    // The component unmounts the instant the phase changes, but guard anyway:
    // a second onDone() would skip straight past the profile screen.
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  }, [onDone]);

  // Both timers are cleared on unmount. A leaked one would fire onDone() from a
  // screen that no longer exists and silently skip whatever is showing then.
  useEffect(() => {
    const ids: number[] = [
      window.setTimeout(() => sfxIntroSting(), STING_CUE_MS),
      window.setTimeout(finish, PLAYER.introMs),
    ];
    return () => {
      for (const id of ids) window.clearTimeout(id);
    };
  }, [finish]);

  // onFirstGesture FIRST, always: it unlocks the AudioContext, and a context
  // created outside a real gesture handler stays suspended forever.
  const skip = useCallback(() => {
    onFirstGesture();
    finish();
  }, [onFirstGesture, finish]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      skip();
    },
    [skip],
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div
        className={`lfx-intro-stage${reducedMotion ? " lfx-intro-still" : ""}`}
        role="button"
        tabIndex={0}
        aria-label="Skip intro"
        onPointerDown={skip}
        onKeyDown={onKeyDown}
      >
        <div className="lfx-intro-column">
          {!reducedMotion && <div className="lfx-intro-bloom" aria-hidden="true" />}
          <div className="lfx-intro-markwrap">
            <span className="lfx-intro-mark">{WORDMARK}</span>
          </div>
          <div className="lfx-intro-rule" aria-hidden="true" />
        </div>
      </div>
    </>
  );
}
