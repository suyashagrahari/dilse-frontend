"use client";

// ─── One card ────────────────────────────────────────────────────────────────
//
// Two faces. The front holds the statement; the back holds the response for the
// direction that was actually swiped. `card.responses` is a record of all three
// and this component only ever reads `card.responses[reveal.choice]` — there is
// no fallback text that could surface regardless of direction, which is the one
// bug that would turn the whole template into a slideshow.

import { CHOICE_COLOR, CHOICE_LABEL, GESTURE, REVEAL, type FlagCard, type SwipeChoice } from "./types";
import {
  EXIT_MS,
  FLY_OUT_PUSH,
  HAIRLINE,
  INK,
  INK_SOFT,
  MONO,
  PAPER,
  PAPER_WARM,
  SERIF,
  STACK_MS,
  STENCIL,
  clamp,
} from "./flagsTheme";
import InkStamp from "./InkStamp";
import { dragProgress, previewChoice, useSwipeGesture } from "./useSwipeGesture";

export type RevealPhase = "flyout" | "hold" | "return" | "flip" | "settled";

export interface RevealState {
  choice: SwipeChoice;
  /** Where the pointer let go, so the fly-out continues from there. */
  from: { dx: number; dy: number };
  phase: RevealPhase;
  showNext: boolean;
}

interface SwipeCardProps {
  card: FlagCard;
  /** `04 / 11`, or null on a sincere card. */
  numberLabel: string | null;
  senderName: string;
  /** 0 = front, 1/2 = behind, -1 = sliding off. */
  depth: number;
  interactive: boolean;
  width: number;
  height: number;
  reduced: boolean;
  reveal: RevealState | null;
  onCommit: (choice: SwipeChoice, dx: number, dy: number) => void;
  onTap: () => void;
}

const EASE_OUT = "cubic-bezier(0.22, 0.61, 0.36, 1)";
const STAMP_ROTATION: Record<SwipeChoice, number> = { red: -12, green: 12, complicated: 0 };

function stackTransform(depth: number): { transform: string; opacity: number; zIndex: number } {
  if (depth < 0) {
    return { transform: "translateY(calc(100% + 48px)) scale(1)", opacity: 0, zIndex: 40 };
  }
  if (depth === 0) return { transform: "translateY(0px) scale(1)", opacity: 1, zIndex: 30 };
  if (depth === 1) return { transform: "translateY(8px) scale(0.96)", opacity: 1, zIndex: 20 };
  if (depth === 2) return { transform: "translateY(16px) scale(0.92)", opacity: 0.7, zIndex: 10 };
  return { transform: "translateY(16px) scale(0.92)", opacity: 0, zIndex: 0 };
}

export default function SwipeCard({
  card,
  numberLabel,
  senderName,
  depth,
  interactive,
  width,
  height,
  reduced,
  reveal,
  onCommit,
  onTap,
}: SwipeCardProps) {
  const sincere = card.kind === "sincere";
  const draggable = interactive && !sincere && reveal === null;

  const swipe = useSwipeGesture({
    enabled: draggable,
    width,
    height,
    onCommit,
    onTap: interactive ? onTap : undefined,
  });

  // ── Transform of the card body: drag, then the reveal sequence ────────────
  let bodyTransform: string;
  let bodyTransition: string;

  if (reveal) {
    if (reveal.phase === "flyout" || reveal.phase === "hold") {
      // Beat 1: a further 90px in the committed direction, rotation increasing.
      const px =
        reveal.choice === "red" ? -FLY_OUT_PUSH : reveal.choice === "green" ? FLY_OUT_PUSH : 0;
      const py = reveal.choice === "complicated" ? -FLY_OUT_PUSH : 0;
      const x = reveal.from.dx + px;
      const y = reveal.from.dy + py;
      const rot = reduced
        ? 0
        : (x / (width || 1)) * GESTURE.rotationDeg * 1.25 + (reveal.choice === "complicated" ? -2 : 0);
      bodyTransform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg)`;
      // Beat 2 is the 120ms HOLD: same transform, no transition, nothing moves.
      bodyTransition = reveal.phase === "flyout" ? `transform ${REVEAL.flyOutMs}ms ${EASE_OUT}` : "none";
    } else {
      // Beat 3: back to dead centre before the flip.
      bodyTransform = "translate3d(0px, 0px, 0) rotate(0deg)";
      bodyTransition = `transform ${REVEAL.returnMs}ms ${GESTURE.springEasing}`;
    }
  } else {
    const rot = reduced ? 0 : (swipe.dx / (width || 1)) * GESTURE.rotationDeg;
    bodyTransform = `translate3d(${swipe.dx.toFixed(1)}px, ${swipe.dy.toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg)`;
    bodyTransition = swipe.active
      ? "none"
      : swipe.springing
        ? `transform ${GESTURE.springBackMs}ms ${GESTURE.springEasing}`
        : "none";
  }

  // ── Live drag feedback ────────────────────────────────────────────────────
  const liveChoice = draggable && swipe.active ? previewChoice(swipe.dx, swipe.dy) : null;
  const progress = dragProgress(swipe.dx, swipe.dy, width, height, liveChoice);
  const tintOpacity =
    liveChoice && progress >= GESTURE.tintStartProgress
      ? Math.min(progress, GESTURE.tintMaxOpacity)
      : 0;
  const stampOpacity = liveChoice
    ? clamp((progress - GESTURE.stampAtProgress) / 0.35, 0, 1)
    : 0;

  const flipped = reveal !== null && (reveal.phase === "flip" || reveal.phase === "settled");
  const use3d = !reduced;
  const overruled = reveal !== null && reveal.choice !== card.truth;

  const stack = stackTransform(depth);
  const stock = sincere ? PAPER_WARM : PAPER;
  const response = reveal ? card.responses[reveal.choice] : "";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transformOrigin: "50% 0%",
        transform: stack.transform,
        opacity: stack.opacity,
        zIndex: stack.zIndex,
        transition:
          depth < 0
            ? `transform ${EXIT_MS}ms cubic-bezier(0.4, 0, 1, 1), opacity ${EXIT_MS}ms linear`
            : `transform ${STACK_MS}ms ${EASE_OUT}, opacity ${STACK_MS}ms ${EASE_OUT}`,
        pointerEvents: depth === 0 ? "auto" : "none",
      }}
    >
      <div
        {...(draggable ? swipe.handlers : {})}
        // Sincere cards and settled reveals are drag-locked but still tappable.
        onClick={!draggable && interactive ? onTap : undefined}
        style={{
          position: "absolute",
          inset: 0,
          // The single property that decides whether this feels like a held card
          // or a spinning sprite: the pivot sits BELOW the card.
          transformOrigin: GESTURE.transformOrigin,
          transform: bodyTransform,
          transition: bodyTransition,
          perspective: 1200,
          touchAction: "none",
          userSelect: "none",
          WebkitUserSelect: "none",
          WebkitTapHighlightColor: "transparent",
          cursor: draggable ? "grab" : interactive ? "pointer" : "default",
        }}
      >
        {/* the two faces */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            transformStyle: use3d ? "preserve-3d" : "flat",
            transform: use3d && flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            transition: use3d ? `transform ${REVEAL.flipMs}ms ${REVEAL.flipEasing}` : "none",
          }}
        >
          {/* ── FRONT ───────────────────────────────────────────────────── */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "34px 26px",
              background: stock,
              border: `1px solid ${INK}`,
              borderRadius: 2,
              backfaceVisibility: use3d ? "hidden" : "visible",
              WebkitBackfaceVisibility: use3d ? "hidden" : "visible",
              opacity: use3d ? 1 : flipped ? 0 : 1,
              transition: use3d ? "none" : `opacity ${REVEAL.flipMs}ms ${REVEAL.flipEasing}`,
              overflow: "hidden",
            }}
          >
            <p
              style={{
                margin: 0,
                fontFamily: SERIF,
                fontStyle: sincere ? "italic" : "normal",
                fontSize: "clamp(18px, 5.4vw, 22px)",
                lineHeight: 1.42,
                textAlign: "center",
                color: INK,
                letterSpacing: "0.002em",
              }}
            >
              {card.statement}
            </p>

            {sincere && (
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 18,
                  textAlign: "center",
                  fontFamily: MONO,
                  fontSize: 11,
                  letterSpacing: "0.16em",
                  color: INK_SOFT,
                  textTransform: "uppercase",
                }}
              >
                tap to continue
              </span>
            )}

            {numberLabel && (
              <span
                style={{
                  position: "absolute",
                  left: 14,
                  bottom: 12,
                  fontFamily: MONO,
                  fontSize: 10,
                  letterSpacing: "0.14em",
                  color: INK_SOFT,
                }}
              >
                {numberLabel}
              </span>
            )}
          </div>

          {/* ── BACK ────────────────────────────────────────────────────── */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              background: PAPER,
              border: `1px solid ${INK}`,
              borderRadius: 2,
              overflow: "hidden",
              transform: use3d ? "rotateY(180deg)" : "none",
              backfaceVisibility: use3d ? "hidden" : "visible",
              WebkitBackfaceVisibility: use3d ? "hidden" : "visible",
              opacity: use3d ? 1 : flipped ? 1 : 0,
              transition: use3d ? "none" : `opacity ${REVEAL.flipMs}ms ${REVEAL.flipEasing}`,
              pointerEvents: flipped ? "auto" : "none",
            }}
          >
            {reveal && (
              <>
                <div
                  style={{
                    background: CHOICE_COLOR[reveal.choice],
                    color: PAPER,
                    fontFamily: STENCIL,
                    fontWeight: 600,
                    fontSize: 12,
                    letterSpacing: "0.2em",
                    padding: "10px 14px 9px",
                  }}
                >
                  YOU SAID: {CHOICE_LABEL[reveal.choice]}
                </div>

                <div
                  style={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    overscrollBehavior: "contain",
                    touchAction: "pan-y",
                    padding: "22px 22px 26px",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontFamily: SERIF,
                      fontSize: 18,
                      lineHeight: 1.5,
                      color: INK,
                      textAlign: "left",
                    }}
                  >
                    {response || "nothing written for that one. which is, itself, an answer."}
                  </p>
                </div>

                {overruled && (
                  <div
                    style={{
                      position: "absolute",
                      top: 58,
                      right: 12,
                      opacity: flipped ? 0.62 : 0,
                      transform: flipped ? "scale(1)" : "scale(1.18)",
                      transition: `opacity 180ms linear ${Math.round(REVEAL.flipMs * 0.55)}ms, transform 180ms ${EASE_OUT} ${Math.round(REVEAL.flipMs * 0.55)}ms`,
                      pointerEvents: "none",
                    }}
                  >
                    <InkStamp text="OVERRULED" color={CHOICE_COLOR[card.truth]} rotate={-14} fontSize={16} />
                  </div>
                )}

                <div
                  style={{
                    borderTop: `1px solid ${INK}`,
                    background: INK,
                    color: PAPER,
                    fontFamily: STENCIL,
                    fontWeight: 500,
                    fontSize: 11.5,
                    letterSpacing: "0.18em",
                    padding: "10px 14px 9px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      background: CHOICE_COLOR[card.truth],
                      flex: "0 0 auto",
                    }}
                  />
                  {senderName.toUpperCase()} SAYS: {CHOICE_LABEL[card.truth]}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Drag feedback: tint + stamp, above the faces, never rotated ── */}
        {liveChoice && !sincere && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 2,
              pointerEvents: "none",
              background: CHOICE_COLOR[liveChoice],
              opacity: tintOpacity,
            }}
          />
        )}
        {liveChoice && !sincere && stampOpacity > 0 && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: liveChoice === "complicated" ? "38%" : 26,
              left: liveChoice === "green" ? 22 : undefined,
              right: liveChoice === "red" ? 22 : undefined,
              ...(liveChoice === "complicated" ? { left: 0, right: 0, textAlign: "center" as const } : {}),
              pointerEvents: "none",
            }}
          >
            <InkStamp
              text={CHOICE_LABEL[liveChoice]}
              color={CHOICE_COLOR[liveChoice]}
              rotate={STAMP_ROTATION[liveChoice]}
              opacity={stampOpacity * 0.88}
              fontSize={18}
            />
          </div>
        )}
      </div>

      {/* ── "tap to continue", no button chrome ─────────────────────────── */}
      {reveal?.showNext && (
        <button
          type="button"
          onClick={onTap}
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            bottom: -46,
            minHeight: 44,
            padding: "0 18px",
            background: "transparent",
            border: "none",
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: INK_SOFT,
            cursor: "pointer",
            borderBottom: `1px solid ${HAIRLINE}`,
            borderRadius: 0,
          }}
        >
          tap to continue
        </button>
      )}
    </div>
  );
}
