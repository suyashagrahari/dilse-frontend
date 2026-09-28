"use client";

// ─── One card ────────────────────────────────────────────────────────────────
//
// Two faces. The front holds the statement; the back holds the response for the
// direction that was actually swiped. `card.responses` is a record of all three
// and this component only ever reads `card.responses[reveal.choice]` — there is
// no fallback text that could surface regardless of direction, which is the one
// bug that would turn the whole template into a slideshow.

import { V } from "../../_love/theme";
import { CHOICE_EMOJI, CHOICE_LABEL, FLAG_VAR, GESTURE, REVEAL, type FlagCard, type SwipeChoice } from "./types";
import { FlagSticker } from "./bits";
import { EXIT_MS, FLY_OUT_PUSH, GROTESK, ITALIC, MONO, STACK_MS, clamp } from "./flagsTheme";
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
  /** The sincere card's GIF sticker, if the sender picked one. */
  gif?: string;
  onCommit: (choice: SwipeChoice, dx: number, dy: number) => void;
  onTap: () => void;
}

const EASE_OUT = "cubic-bezier(0.22, 0.61, 0.36, 1)";
const STAMP_ROTATION: Record<SwipeChoice, number> = { red: 12, green: -12, complicated: -4 };
const RADIUS = 30;

function stackTransform(depth: number): { transform: string; opacity: number; zIndex: number } {
  if (depth < 0) return { transform: "translateY(calc(100% + 60px)) rotate(-4deg)", opacity: 0, zIndex: 40 };
  if (depth === 0) return { transform: "translateY(0px) scale(1) rotate(0deg)", opacity: 1, zIndex: 30 };
  if (depth === 1) return { transform: "translateY(12px) scale(0.95) rotate(2.2deg)", opacity: 1, zIndex: 20 };
  if (depth === 2) return { transform: "translateY(22px) scale(0.9) rotate(-2.4deg)", opacity: 0.75, zIndex: 10 };
  return { transform: "translateY(22px) scale(0.9)", opacity: 0, zIndex: 0 };
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
  gif,
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
      const px = reveal.choice === "red" ? -FLY_OUT_PUSH : reveal.choice === "green" ? FLY_OUT_PUSH : 0;
      const py = reveal.choice === "complicated" ? -FLY_OUT_PUSH : 0;
      const x = reveal.from.dx + px;
      const y = reveal.from.dy + py;
      const rot = reduced ? 0 : (x / (width || 1)) * GESTURE.rotationDeg * 1.25 + (reveal.choice === "complicated" ? -2 : 0);
      bodyTransform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg)`;
      bodyTransition = reveal.phase === "flyout" ? `transform ${REVEAL.flyOutMs}ms ${EASE_OUT}` : "none";
    } else {
      bodyTransform = "translate3d(0px, 0px, 0) rotate(0deg)";
      bodyTransition = `transform ${REVEAL.returnMs}ms ${GESTURE.springEasing}`;
    }
  } else {
    const rot = reduced ? 0 : (swipe.dx / (width || 1)) * GESTURE.rotationDeg;
    bodyTransform = `translate3d(${swipe.dx.toFixed(1)}px, ${swipe.dy.toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg)`;
    bodyTransition = swipe.active ? "none" : swipe.springing ? `transform ${GESTURE.springBackMs}ms ${GESTURE.springEasing}` : "none";
  }

  // ── Live drag feedback ────────────────────────────────────────────────────
  const liveChoice = draggable && swipe.active ? previewChoice(swipe.dx, swipe.dy) : null;
  const progress = dragProgress(swipe.dx, swipe.dy, width, height, liveChoice);
  const tintOpacity = liveChoice && progress >= GESTURE.tintStartProgress ? Math.min(progress * 0.6, 0.34) : 0;
  const stampOpacity = liveChoice ? clamp((progress - 0.2) / 0.35, 0, 1) : 0;

  const flipped = reveal !== null && (reveal.phase === "flip" || reveal.phase === "settled");
  const use3d = !reduced;
  const overruled = reveal !== null && reveal.choice !== card.truth;

  const stack = stackTransform(depth);
  const response = reveal ? card.responses[reveal.choice] : "";
  const long = response.length > 140;
  const glow = liveChoice ? `0 0 0 3px ${FLAG_VAR[liveChoice]}, 0 30px 60px -24px ${FLAG_VAR[liveChoice]}` : `0 26px 60px -30px ${V.shadow}`;

  const face: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    borderRadius: RADIUS,
    overflow: "hidden",
    backfaceVisibility: use3d ? "hidden" : "visible",
    WebkitBackfaceVisibility: use3d ? "hidden" : "visible",
  };

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
        onClick={!draggable && interactive ? onTap : undefined}
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: GESTURE.transformOrigin,
          transform: bodyTransform,
          transition: bodyTransition,
          perspective: 1400,
          touchAction: "none",
          userSelect: "none",
          WebkitUserSelect: "none",
          WebkitTapHighlightColor: "transparent",
          cursor: draggable ? (swipe.active ? "grabbing" : "grab") : interactive ? "pointer" : "default",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: RADIUS,
            transformStyle: use3d ? "preserve-3d" : "flat",
            transform: use3d && flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            transition: use3d ? `transform ${REVEAL.flipMs}ms ${REVEAL.flipEasing}` : "none",
            boxShadow: depth === 0 ? glow : `0 16px 40px -28px ${V.shadow}`,
          }}
        >
          {/* ── FRONT ───────────────────────────────────────────────────── */}
          <div
            style={{
              ...face,
              display: "flex",
              flexDirection: "column",
              background: sincere ? V.grad : V.paper,
              border: sincere ? "none" : `1px solid ${V.edge}`,
              color: sincere ? "#fff" : V.paperInk,
              opacity: use3d ? 1 : flipped ? 0 : 1,
              transition: use3d ? "none" : `opacity ${REVEAL.flipMs}ms ${REVEAL.flipEasing}`,
            }}
          >
            {/* soft colour wash in the corner so the card never reads flat */}
            {!sincere && (
              <div aria-hidden style={{ position: "absolute", inset: 0, background: `radial-gradient(80% 50% at 100% 0%, color-mix(in srgb, ${V.a2} 16%, transparent), transparent 70%), radial-gradient(70% 40% at 0% 100%, color-mix(in srgb, ${V.a3} 14%, transparent), transparent 70%)`, pointerEvents: "none" }} />
            )}

            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 0" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: GROTESK, fontSize: 13, fontWeight: 800, color: sincere ? "rgba(255,255,255,.92)" : V.paperSoft }}>
                <span aria-hidden style={{ width: 28, height: 28, borderRadius: 99, display: "grid", placeItems: "center", background: sincere ? "rgba(255,255,255,.22)" : V.grad, color: "#fff", fontSize: 13, fontWeight: 900 }}>
                  {(senderName[0] ?? "?").toUpperCase()}
                </span>
                {sincere ? "no swiping this one" : `${senderName.toLowerCase()}'s confession`}
              </span>
              {numberLabel && <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: V.paperSoft }}>{numberLabel}</span>}
            </div>

            <div style={{ position: "relative", flex: 1, minHeight: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "10px 24px" }}>
              <span aria-hidden style={{ fontFamily: ITALIC, fontSize: 84, lineHeight: 0.6, height: 40, color: sincere ? "rgba(255,255,255,.5)" : V.a1, opacity: sincere ? 1 : 0.9 }}>
                “
              </span>
              <p
                style={{
                  margin: 0,
                  fontFamily: sincere ? ITALIC : GROTESK,
                  fontStyle: sincere ? "italic" : "normal",
                  fontWeight: sincere ? 400 : 800,
                  fontSize: sincere ? "clamp(26px, 7.4vw, 32px)" : card.statement.length > 48 ? "clamp(25px, 7vw, 30px)" : "clamp(29px, 8.2vw, 36px)",
                  lineHeight: sincere ? 1.12 : 1.08,
                  letterSpacing: sincere ? "0" : "-0.03em",
                  overflowWrap: "anywhere",
                }}
              >
                {card.statement}
              </p>
            </div>

            {sincere ? (
              <div style={{ position: "relative", display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 20px 20px", gap: 10 }}>
                <span style={{ fontFamily: GROTESK, fontSize: 13, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,.92)" }}>just read it. tap to continue →</span>
                {gif && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={gif} alt="" style={{ width: 84, height: 84, objectFit: "cover", borderRadius: 20, transform: "rotate(6deg)", boxShadow: "0 12px 26px -10px rgba(0,0,0,.45)", border: "3px solid #fff", flex: "0 0 auto" }} />
                )}
              </div>
            ) : (
              <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "12px 18px 18px" }}>
                {(["red", "complicated", "green"] as SwipeChoice[]).map((c) => (
                  <span key={c} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 10px", borderRadius: 999, border: `1.5px dashed color-mix(in srgb, ${FLAG_VAR[c]} 60%, transparent)`, fontFamily: GROTESK, fontSize: 11.5, fontWeight: 800, color: FLAG_VAR[c], whiteSpace: "nowrap" }}>
                    {c === "red" ? "←" : c === "green" ? "" : "↑"} {CHOICE_EMOJI[c]} {c === "complicated" ? "beige" : c}
                    {c === "green" ? " →" : ""}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── BACK ────────────────────────────────────────────────────── */}
          <div
            style={{
              ...face,
              display: "flex",
              flexDirection: "column",
              background: V.paper,
              border: `1px solid ${V.edge}`,
              transform: use3d ? "rotateY(180deg)" : "none",
              opacity: use3d ? 1 : flipped ? 1 : 0,
              transition: use3d ? "none" : `opacity ${REVEAL.flipMs}ms ${REVEAL.flipEasing}`,
              pointerEvents: flipped ? "auto" : "none",
            }}
          >
            {reveal && (
              <>
                <div style={{ position: "relative", background: FLAG_VAR[reveal.choice], color: "var(--fl-on)", padding: "16px 20px 15px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <span style={{ fontFamily: GROTESK, fontWeight: 800, fontSize: 15, letterSpacing: "0.02em" }}>
                    you said: {CHOICE_LABEL[reveal.choice].toLowerCase()} {CHOICE_EMOJI[reveal.choice]}
                  </span>
                  {numberLabel && <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, opacity: 0.8 }}>{numberLabel}</span>}
                </div>

                <div style={{ flex: 1, minHeight: 0, overflowY: "auto", overscrollBehavior: "contain", touchAction: "pan-y", padding: "20px 22px 14px", display: "flex", flexDirection: "column", justifyContent: long ? "flex-start" : "center" }}>
                  <p style={{ margin: "0 0 10px", fontFamily: GROTESK, fontSize: 12, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: V.paperSoft }}>
                    {senderName.toLowerCase()} replied
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontFamily: ITALIC,
                      fontStyle: "italic",
                      fontSize: long ? 22 : "clamp(26px, 7.2vw, 30px)",
                      lineHeight: 1.16,
                      color: V.paperInk,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {response || "…nothing written for that one. which is, itself, an answer."}
                  </p>
                </div>

                <div style={{ padding: "12px 18px 18px", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 13px", borderRadius: 999, background: `color-mix(in srgb, ${FLAG_VAR[card.truth]} 16%, transparent)`, border: `1.5px solid ${FLAG_VAR[card.truth]}`, fontFamily: GROTESK, fontSize: 12.5, fontWeight: 800, color: V.paperInk }}>
                    <span aria-hidden style={{ width: 9, height: 9, borderRadius: 99, background: FLAG_VAR[card.truth] }} />
                    {senderName.toLowerCase()} says: {CHOICE_LABEL[card.truth].toLowerCase()} {CHOICE_EMOJI[card.truth]}
                  </span>
                </div>

                {overruled && (
                  <div
                    style={{
                      position: "absolute",
                      top: 64,
                      right: 12,
                      opacity: flipped ? 1 : 0,
                      transform: flipped ? "scale(1)" : "scale(1.6)",
                      transition: `opacity 160ms linear ${Math.round(REVEAL.flipMs * 0.6)}ms, transform 260ms cubic-bezier(.2,.9,.3,1.4) ${Math.round(REVEAL.flipMs * 0.6)}ms`,
                      pointerEvents: "none",
                    }}
                  >
                    <FlagSticker color={FLAG_VAR[card.truth]} rotate={9} size={13}>
                      overruled 💅
                    </FlagSticker>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Drag feedback: tint + stamp, above the faces ─────────────── */}
        {liveChoice && !sincere && (
          <div aria-hidden style={{ position: "absolute", inset: 0, borderRadius: RADIUS, pointerEvents: "none", background: FLAG_VAR[liveChoice], opacity: tintOpacity }} />
        )}
        {liveChoice && !sincere && stampOpacity > 0 && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: liveChoice === "complicated" ? "auto" : 70,
              bottom: liveChoice === "complicated" ? 90 : "auto",
              left: liveChoice === "green" ? 18 : liveChoice === "complicated" ? 0 : undefined,
              right: liveChoice === "red" ? 18 : liveChoice === "complicated" ? 0 : undefined,
              textAlign: "center",
              opacity: stampOpacity,
              transform: `scale(${0.8 + stampOpacity * 0.2})`,
              pointerEvents: "none",
            }}
          >
            <FlagSticker color={FLAG_VAR[liveChoice]} rotate={STAMP_ROTATION[liveChoice]} size={22}>
              {CHOICE_LABEL[liveChoice]} {CHOICE_EMOJI[liveChoice]}
            </FlagSticker>
          </div>
        )}
      </div>
    </div>
  );
}
