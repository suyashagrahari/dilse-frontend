"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import ChoiceBar from "./ChoiceBar";
import PlaceholderArt from "./PlaceholderArt";
import { sfxChoiceCommit, sfxTick, sfxUiTap } from "./loveflixAudio";
import {
  ACCENT,
  BG,
  BG_RAISED,
  CARD_RADIUS,
  FONT_BODY,
  FONT_DISPLAY,
  HAIRLINE,
  TAP,
  TEXT,
  TEXT_DIM,
  Z,
  scrim,
} from "./theme";
import {
  PLAYER,
  SKIP_INTRO_JOKE,
  TIMEOUT_LINE,
  indexScenes,
  sceneProgress,
  type LoveflixData,
  type PathEntry,
  type Scene,
} from "./types";
import { useChoiceTimer } from "./useChoiceTimer";

// The episode player. Everything else in this template is packaging.
//
// The scene graph arriving here has ALREADY been validated upstream by
// `useSceneGraph` — it terminates at a finale, every `nextSceneId` resolves and
// every non-finale scene carries exactly two choices. The cheap guards below
// exit to browse rather than render a blank frame, but they should never fire.
//
// Two jokes are load-bearing and are played completely straight:
//   1. Skip Intro is offered exactly as a real skip control, and refuses.
//   2. "Are you still watching?" fires once, and BOTH answers continue.
// Neither is winked at. The comedy is entirely in the deadpan.
//
// Timing out is a JOKE, never a failure. The default choice is taken, one quiet
// line appears, and the story continues down a path of exactly the same
// quality. Nothing anywhere reads as a penalty.

export interface EpisodePlayerProps {
  data: LoveflixData;
  /** Already validated upstream — guaranteed to terminate at a finale. */
  scenes: Scene[];
  startSceneId: string;
  /** progressDenominator() result. Clamp overshoot with sceneProgress(). */
  denom: number;
  /** Fired on reaching the finale scene, with every choice actually taken. */
  onFinish: (path: PathEntry[]) => void;
  /** Bail out to browse without finishing. */
  onExit: () => void;
  reducedMotion: boolean;
}

/** Where we are inside a single scene. */
type Beat = "reveal" | "choosing" | "committed" | "fading";

/** Skip Intro is offered, refuses once, and is then gone for the episode. */
type SkipState = "offered" | "refused" | "gone";

/**
 * The timeout line has to be readable before the scene moves on, so the commit
 * hold is extended for the automatic case. Composed from the frozen contract
 * rather than invented.
 */
const AUTO_HOLD_MS = PLAYER.choiceCommitHoldMs + PLAYER.lineRevealMs * 2;

/** How long the skip refusal sits there before it fades. Long enough to read. */
const REFUSAL_MS = PLAYER.lineRevealMs * 3;

const KEYFRAMES = `
@keyframes loveflix-drift { from { transform: scale(1); } to { transform: scale(1.06); } }
@keyframes loveflix-rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
@keyframes loveflix-soft { from { opacity: 0; } to { opacity: 1; } }
`;

export default function EpisodePlayer({
  data,
  scenes,
  startSceneId,
  denom,
  onFinish,
  onExit,
  reducedMotion,
}: EpisodePlayerProps) {
  const byId = useMemo(() => indexScenes(scenes), [scenes]);

  const [sceneId, setSceneId] = useState(startSceneId);
  /** Scenes entered, starting at 1. The progress bar advances by COUNT, not time. */
  const [visitedCount, setVisitedCount] = useState(1);
  const [beat, setBeat] = useState<Beat>("reveal");
  const [revealed, setRevealed] = useState(0);
  const [committedIndex, setCommittedIndex] = useState<number | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [fade, setFade] = useState(0);
  const [skip, setSkip] = useState<SkipState>("offered");
  const [stillWatching, setStillWatching] = useState(false);

  const scene = byId[sceneId] ?? null;
  const lines = useMemo(
    () =>
      (scene?.text ?? "")
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean),
    [scene],
  );

  const progress = sceneProgress(visitedCount, denom);

  // ── Refs that must not be reset by a re-render ──────────────────────────────

  /** One entry per choice actually taken. This list IS the share card. */
  const pathRef = useRef<PathEntry[]>([]);
  const committedRef = useRef(false);
  const finishedRef = useRef(false);
  const stopTimerRef = useRef<() => void>(() => {});
  const lastTickRef = useRef<number | null>(null);
  const lastActivityRef = useRef(0);
  /** The still-watching latch. A ref, not state, so nothing can reset it. */
  const stillWatchingFiredRef = useRef(false);
  const progressRef = useRef(progress);
  const commitTimersRef = useRef<number[]>([]);
  const onFinishRef = useRef(onFinish);
  const onExitRef = useRef(onExit);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    onFinishRef.current = onFinish;
    onExitRef.current = onExit;
    progressRef.current = progress;
  });

  // ── Idle tracking (declared first so the interrupt never sees a zero) ───────

  useEffect(() => {
    lastActivityRef.current = performance.now();
    const bump = () => {
      lastActivityRef.current = performance.now();
    };
    const opts: AddEventListenerOptions = { passive: true };
    window.addEventListener("pointerdown", bump, opts);
    window.addEventListener("keydown", bump, opts);
    window.addEventListener("wheel", bump, opts);
    window.addEventListener("touchstart", bump, opts);
    return () => {
      window.removeEventListener("pointerdown", bump);
      window.removeEventListener("keydown", bump);
      window.removeEventListener("wheel", bump);
      window.removeEventListener("touchstart", bump);
    };
  }, []);

  // ── "Are you still watching?" — exactly once, and nothing bad happens ───────
  //
  // Mount-scoped, so nothing about a scene change can re-arm it, and latched on
  // a ref rather than state so a re-render cannot unlatch it. The latch is set
  // BEFORE the state update, so even a double-invoked effect cannot fire twice.

  useEffect(() => {
    const id = window.setInterval(() => {
      if (stillWatchingFiredRef.current) return;
      if (progressRef.current < PLAYER.stillWatchingAtProgress) return;
      if (performance.now() - lastActivityRef.current < PLAYER.stillWatchingIdleMs) return;
      stillWatchingFiredRef.current = true;
      setStillWatching(true);
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const dismissStillWatching = useCallback(() => {
    sfxUiTap();
    lastActivityRef.current = performance.now();
    setStillWatching(false);
  }, []);

  // ── Skip Intro — offered for the window, refuses, never returns ─────────────

  useEffect(() => {
    const id = window.setTimeout(() => {
      setSkip((s) => (s === "offered" ? "gone" : s));
    }, PLAYER.skipIntroWindowMs);
    return () => window.clearTimeout(id);
  }, []);

  const handleSkip = useCallback(() => {
    sfxUiTap();
    setSkip("refused");
  }, []);

  useEffect(() => {
    if (skip !== "refused") return;
    // The refusal is one quiet line where the button was, then it is gone.
    const id = window.setTimeout(() => setSkip("gone"), REFUSAL_MS);
    return () => window.clearTimeout(id);
  }, [skip]);

  // ── Scene lifecycle: reveal the narration, then bring the choices in ────────
  //
  // The per-scene reset happens DURING RENDER, not in the effect below.
  //
  // Resetting it in the effect meant the new scene rendered once carrying the
  // previous scene's beat and revealed-line count before the effect corrected
  // it — a real flash of the wrong scene's choices, not just a cascading
  // render. Adjusting state during render when a prop changes is React's
  // documented pattern for exactly this, and it lands before anything paints.
  //
  // The refs stay in the effect: they cannot be written during render.

  const currentSceneId = scene && !scene.isFinale ? scene.id : null;
  const [sceneKey, setSceneKey] = useState<string | null>(currentSceneId);
  if (sceneKey !== currentSceneId) {
    setSceneKey(currentSceneId);
    setCommittedIndex(null);
    setTimedOut(false);
    setBeat("reveal");
    // Reduced motion shows the whole scene at once; otherwise the first line is
    // already up and the effect staggers the rest in.
    setRevealed(currentSceneId === null ? 0 : reducedMotion ? lines.length : lines.length > 0 ? 1 : 0);
  }

  useEffect(() => {
    if (!scene || scene.isFinale) return;

    committedRef.current = false;
    lastTickRef.current = null;

    const timers: number[] = [];

    if (reducedMotion) {
      timers.push(window.setTimeout(() => setBeat("choosing"), PLAYER.choiceBeatMs));
    } else {
      for (let i = 1; i < lines.length; i += 1) {
        timers.push(window.setTimeout(() => setRevealed(i + 1), i * PLAYER.lineRevealMs));
      }
      // The last line gets its own reveal slot, then the beat, then the choices.
      const choicesAt = Math.max(0, lines.length) * PLAYER.lineRevealMs + PLAYER.choiceBeatMs;
      timers.push(window.setTimeout(() => setBeat("choosing"), choicesAt));
    }

    // Every reveal timer is cleared on scene change and on unmount. A leaked
    // one would fire against the next scene and desynchronise the player.
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [scene, lines, reducedMotion]);

  // Keep the newest line in view when the narration is long enough to scroll.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [revealed, beat]);

  // ── The choice mechanic ─────────────────────────────────────────────────────

  const advance = useCallback(
    (nextSceneId: string) => {
      const next = byId[nextSceneId];
      if (!next) {
        // Cannot happen with a validated graph; exit rather than render blank.
        onExitRef.current();
        return;
      }
      setSceneId(next.id);
      setVisitedCount((n) => n + 1);
      // Hold on black into the finale so the handover has no flash.
      if (!next.isFinale) setFade(0);
    },
    [byId],
  );

  const commit = useCallback(
    (index: number, auto: boolean) => {
      if (committedRef.current || !scene || scene.isFinale) return;
      const choice = scene.choices[index] ?? scene.choices[0];
      if (!choice) {
        onExitRef.current();
        return;
      }

      committedRef.current = true;
      // Stop the countdown the instant a choice lands, so a late frame cannot
      // fire onExpire after the user has already chosen.
      stopTimerRef.current();

      const chosenIndex = scene.choices.indexOf(choice);
      setCommittedIndex(chosenIndex);
      setTimedOut(auto);
      setBeat("committed");
      // ChoiceBar plays the commit voice on a tap; the automatic path has no
      // tap, so it is played here instead of twice.
      if (auto) sfxChoiceCommit();

      pathRef.current = [
        ...pathRef.current,
        { sceneId: scene.id, label: choice.label, auto },
      ];

      const hold = auto ? AUTO_HOLD_MS : PLAYER.choiceCommitHoldMs;
      const t1 = window.setTimeout(() => {
        setBeat("fading");
        if (!reducedMotion) setFade(1);
      }, hold);
      const t2 = window.setTimeout(() => advance(choice.nextSceneId), hold + PLAYER.sceneFadeMs);
      commitTimersRef.current = [t1, t2];
    },
    [advance, reducedMotion, scene],
  );

  // Commit/fade timers are cleared on unmount as well as being replaced on each
  // commit, so nothing can advance a player that has already gone away.
  useEffect(
    () => () => {
      commitTimersRef.current.forEach((t) => window.clearTimeout(t));
    },
    [],
  );

  // The timer stays armed through the commit hold so the drained bar freezes
  // where it landed instead of snapping back to full; `stop()` has already
  // halted it. It is disarmed by the scene change, and while the still-watching
  // interrupt is up — resuming there gives a fresh full countdown, which is
  // generous rather than punishing.
  const timerActive =
    !!scene && !scene.isFinale && !stillWatching && beat !== "reveal";

  const timer = useChoiceTimer(
    scene?.choiceSeconds ?? PLAYER.defaultChoiceSeconds,
    timerActive,
    () => commit(scene?.defaultChoiceIndex ?? 0, true),
  );

  useEffect(() => {
    stopTimerRef.current = timer.stop;
  }, [timer.stop]);

  // One soft tick per second across the final three seconds, and not before.
  useEffect(() => {
    if (!timerActive || beat !== "choosing" || timer.paused) return;
    const s = timer.secondsLeft;
    if (s > 3 || s < 1) return;
    if (lastTickRef.current === s) return;
    lastTickRef.current = s;
    sfxTick();
  }, [timerActive, beat, timer.paused, timer.secondsLeft]);

  // ── Finale handover ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!scene || !scene.isFinale || finishedRef.current) return;
    finishedRef.current = true;
    onFinishRef.current(pathRef.current.slice());
  }, [scene]);

  // ── Cheap guards. A validated graph never reaches either of these. ──────────

  useEffect(() => {
    if (!scene) onExitRef.current();
  }, [scene]);

  if (!scene) return null;

  if (scene.isFinale) {
    // The parent swaps to the finale screen on the next commit; hold black.
    return <div style={{ position: "fixed", inset: 0, background: BG, zIndex: Z.player }} />;
  }

  const showChoices = beat !== "reveal";
  const rise = reducedMotion
    ? undefined
    : `loveflix-rise ${PLAYER.choiceBeatMs}ms cubic-bezier(0.2,0.7,0.3,1) both`;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: Z.player,
        background: BG,
        color: TEXT,
        fontFamily: FONT_BODY,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{KEYFRAMES}</style>

      {/* ── Scene artwork with a slow drift, so a still feels cinematic ─────── */}
      <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <div
          key={scene.id}
          style={{
            position: "absolute",
            inset: 0,
            transformOrigin: "52% 45%",
            willChange: reducedMotion ? undefined : "transform",
            // Suppressed entirely under reduced motion.
            animation: reducedMotion
              ? undefined
              : `loveflix-drift ${PLAYER.kenBurnsMs}ms linear both`,
          }}
        >
          <PlaceholderArt
            src={scene.imageUrl}
            title={data.showTitle}
            variant="scene"
            seedSalt={scene.id}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          />
        </div>
        <div style={{ position: "absolute", inset: 0, background: scrim() }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(13,13,13,0.78) 0%, rgba(13,13,13,0.28) 18%, rgba(13,13,13,0) 42%)",
          }}
        />
      </div>

      {/* ── Chrome: exit top-left, skip control top-right below the mute ────── */}
      <button
        type="button"
        onClick={() => {
          sfxUiTap();
          onExit();
        }}
        aria-label="Leave the episode and go back to browsing"
        style={{
          position: "absolute",
          top: "calc(10px + env(safe-area-inset-top, 0px))",
          left: 10,
          zIndex: 4,
          width: TAP,
          height: TAP,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 999,
          border: `1px solid ${HAIRLINE}`,
          background: "rgba(13,13,13,0.55)",
          backdropFilter: "blur(8px)",
          color: TEXT,
          cursor: "pointer",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M15 5 8 12l7 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {skip !== "gone" && (
        <div
          style={{
            position: "absolute",
            top: "calc(56px + env(safe-area-inset-top, 0px))",
            right: 10,
            zIndex: 4,
            display: "flex",
            justifyContent: "flex-end",
            animation: reducedMotion ? undefined : `loveflix-soft ${PLAYER.choiceBeatMs}ms ease both`,
          }}
        >
          {skip === "offered" ? (
            <button
              type="button"
              onClick={handleSkip}
              style={{
                minHeight: TAP,
                padding: "10px 18px",
                borderRadius: 3,
                border: `1px solid rgba(255,255,255,0.55)`,
                background: "rgba(13,13,13,0.62)",
                backdropFilter: "blur(6px)",
                color: TEXT,
                fontFamily: FONT_BODY,
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "0.01em",
                cursor: "pointer",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              Skip Intro
            </button>
          ) : (
            // The refusal. One quiet line where the button was. Played dry.
            <div
              style={{
                minHeight: TAP,
                display: "flex",
                alignItems: "center",
                padding: "10px 4px",
                color: TEXT_DIM,
                fontFamily: FONT_BODY,
                fontSize: 13,
                letterSpacing: "0.01em",
              }}
            >
              {SKIP_INTRO_JOKE}
            </div>
          )}
        </div>
      )}

      {/* ── Scene body ───────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          width: "100%",
          maxWidth: 860,
          margin: "0 auto",
          padding: "calc(112px + env(safe-area-inset-top, 0px)) 18px calc(30px + env(safe-area-inset-bottom, 0px))",
          gap: 14,
        }}
      >
        {/* Long narration (400+ chars) scrolls inside the frame rather than
            pushing the choices off the bottom of the screen. */}
        <div
          ref={scrollRef}
          style={{
            flex: "1 1 auto",
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            WebkitOverflowScrolling: "touch",
            display: "flex",
            flexDirection: "column",
            scrollbarWidth: "none",
          }}
        >
          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
            {lines.slice(0, revealed).map((line, i) => (
              <p
                key={`${scene.id}-${i}`}
                style={{
                  margin: 0,
                  fontFamily: FONT_BODY,
                  fontSize: "clamp(16px, 4.2vw, 21px)",
                  lineHeight: 1.55,
                  color: TEXT,
                  textShadow: "0 1px 18px rgba(0,0,0,0.6)",
                  animation: reducedMotion
                    ? undefined
                    : `loveflix-rise ${PLAYER.lineRevealMs}ms cubic-bezier(0.2,0.7,0.3,1) both`,
                }}
              >
                {line}
              </p>
            ))}
          </div>
        </div>

        {/* Timing out is a joke, not a penalty: one dim line, same type as the
            narration, no colour, no warning, no different path quality. */}
        {timedOut && (
          <p
            style={{
              margin: 0,
              fontFamily: FONT_BODY,
              fontSize: 14,
              lineHeight: 1.5,
              color: TEXT_DIM,
              animation: rise,
            }}
          >
            {TIMEOUT_LINE}
          </p>
        )}

        {showChoices && (
          <div style={{ flex: "0 0 auto", animation: rise }}>
            <ChoiceBar
              choices={scene.choices}
              remainingFraction={timer.remainingFraction}
              secondsLeft={timer.secondsLeft}
              committedIndex={committedIndex}
              onChoose={(i) => commit(i, false)}
              reducedMotion={reducedMotion}
            />
          </div>
        )}
      </div>

      {/* ── Progress: by SCENE COUNT, not time ───────────────────────────────── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 3,
          height: 3,
          background: "rgba(255,255,255,0.10)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress * 100}%`,
            background: ACCENT,
            transition: reducedMotion ? "none" : `width ${PLAYER.sceneFadeMs}ms ease`,
          }}
        />
      </div>

      {/* ── Cross-fade to black and back up between scenes ───────────────────── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 5,
          background: BG,
          opacity: reducedMotion ? 0 : fade,
          pointerEvents: "none",
          transition: reducedMotion ? "none" : `opacity ${PLAYER.sceneFadeMs}ms linear`,
        }}
      />

      {/* ── "Are you still watching?" — once, and both answers continue ──────── */}
      {stillWatching && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Are you still watching?"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 6,
            background: "rgba(13,13,13,0.93)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 22,
            animation: reducedMotion ? undefined : `loveflix-soft ${PLAYER.choiceBeatMs}ms ease both`,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 460,
              background: BG_RAISED,
              border: `1px solid ${HAIRLINE}`,
              borderRadius: CARD_RADIUS,
              padding: "26px 22px 22px",
              textAlign: "center",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontFamily: FONT_DISPLAY,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.02em",
                fontSize: "clamp(22px, 6vw, 30px)",
                lineHeight: 1.1,
                color: TEXT,
              }}
            >
              Are you still watching?
            </h2>
            <p
              style={{
                margin: "10px 0 22px",
                fontFamily: FONT_BODY,
                fontSize: 14,
                lineHeight: 1.5,
                color: TEXT_DIM,
              }}
            >
              {data.showTitle} — {data.seasons}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {["Yes", "Yes, obviously"].map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={dismissStillWatching}
                  style={{
                    flex: "1 1 160px",
                    minWidth: 0,
                    minHeight: TAP + 4,
                    padding: "12px 16px",
                    borderRadius: CARD_RADIUS,
                    border: `1px solid ${HAIRLINE}`,
                    background: "rgba(255,255,255,0.06)",
                    color: TEXT,
                    fontFamily: FONT_BODY,
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
