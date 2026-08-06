"use client";

// ─── The last piece ──────────────────────────────────────────────────────────
//
// The emotional peak of the whole template, and the only mechanic in the set
// that puts two people on their phones at the same moment. Rendered absolutely
// over the board while the engine's phase is `waiting-final`.
//
// The board pulses the empty hole (canvas, not here). This file owns three
// things: the message, the release, and the kindness at the end of the wait.
//
//  1. The message is presented with weight — she screenshots this and sends it
//     to him. It sits BELOW the hole so the hole can breathe.
//  2. A slow breathing dot so the page reads as *listening*, not as stuck. It is
//     not a loading spinner and must never become one.
//  3. After ten minutes with no release, a quiet self-serve link. No countdown,
//     no guilt, no pressure — nobody is left holding an incomplete gift because
//     the sender fell asleep.
//
// There is no failure here. Waiting is not failing, and the safety valve is not
// a consolation prize.

import { useCallback, useEffect, useRef, useState } from "react";

import { CHROME_SHADOW, INDIGO, INK, INK_SOFT, OUTFIT, PAPER_EDGE, SERIF } from "./puzzleTheme";
import { FINAL_PIECE } from "./types";

export interface FinalPiecePanelProps {
  message: string;
  /** Demo mode only. Clearly labelled `[DEBUG: release piece]`. */
  showDebugRelease: boolean;
  onRelease: () => void;
  /** Fires when she takes the safety valve after FINAL_PIECE.safetyValveMs. */
  onSelfServe: () => void;
  reducedMotion: boolean;
}

/** How often we ask whether he has let go of it. */
const RELEASE_POLL_MS = 500;

/**
 * Local override of the frozen constant, so the valve can be shortened while
 * testing without touching `types.ts`. Ships reading the real ten minutes.
 */
const SAFETY_VALVE_MS = FINAL_PIECE.safetyValveMs;

/** What the poll reads. Today a local flag; next session, the server. */
interface ReleaseSource {
  released: boolean;
}

/**
 * TODO(realtime): poll or subscribe for the sender's release.
 *
 * The polling loop below is real — it runs on an interval, it is async, it is
 * cancelled on unmount, and the debug button does not call `onRelease` itself,
 * it flips the source the loop is watching. Wiring this to the network is a
 * one-line change inside this function:
 *
 *   const r = await fetch(`/api/puzzle/${shareId}/release`, { cache: "no-store" });
 *   return r.ok && (await r.json()).released === true;
 */
async function pollRelease(source: ReleaseSource): Promise<boolean> {
  return source.released;
}

export default function FinalPiecePanel({
  message,
  showDebugRelease,
  onRelease,
  onSelfServe,
  reducedMotion,
}: FinalPiecePanelProps) {
  const sourceRef = useRef<ReleaseSource>({ released: false });
  /** The piece can only ever come home once. */
  const firedRef = useRef(false);

  // Kept in refs so the polling interval never closes over a stale callback,
  // and never has to be torn down and rebuilt when the parent re-renders.
  const onReleaseRef = useRef(onRelease);
  const onSelfServeRef = useRef(onSelfServe);
  useEffect(() => {
    onReleaseRef.current = onRelease;
    onSelfServeRef.current = onSelfServe;
  });

  const [valveOpen, setValveOpen] = useState(false);

  const check = useCallback(async () => {
    if (firedRef.current) return;
    const released = await pollRelease(sourceRef.current);
    if (!released || firedRef.current) return;
    firedRef.current = true;
    onReleaseRef.current();
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      void check();
    }, RELEASE_POLL_MS);
    return () => clearInterval(id);
  }, [check]);

  // The safety valve. Internal timer only — never surfaced as a countdown.
  useEffect(() => {
    const t = setTimeout(() => setValveOpen(true), SAFETY_VALVE_MS);
    return () => clearTimeout(t);
  }, []);

  const handleDebug = useCallback(() => {
    // Flip the stubbed source, not the callback — so the debug path exercises
    // exactly the code the real release will travel down.
    sourceRef.current.released = true;
    void check();
  }, [check]);

  const handleSelfServe = useCallback(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    onSelfServeRef.current();
  }, []);

  const still = reducedMotion ? " pp-still" : "";

  return (
    <div
      className={`pp-final pointer-events-none absolute inset-0 z-20 flex flex-col justify-end p-3${still}`}
    >
      <div
        role="status"
        className="pointer-events-auto mx-auto w-full max-w-[21rem] rounded-[20px] px-4 pb-3.5 pt-3"
        style={{
          background: "rgba(255,253,249,0.95)",
          border: `1px solid ${PAPER_EDGE}`,
          boxShadow: CHROME_SHADOW,
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        {/* The listening signal. Slow, quiet, alive. */}
        <div className="flex items-center gap-2">
          <span
            className="pp-breathe block h-[7px] w-[7px] shrink-0 rounded-full"
            style={{ background: INDIGO }}
            aria-hidden
          />
          <span
            className="text-[10px] font-semibold uppercase"
            style={{ color: INK_SOFT, fontFamily: OUTFIT, letterSpacing: "0.16em" }}
          >
            waiting
          </span>
          <span className="pp-dots flex items-end gap-[3px] pb-[2px]" aria-hidden>
            <i className="pp-dot block h-[3px] w-[3px] rounded-full" style={{ background: INK_SOFT }} />
            <i className="pp-dot block h-[3px] w-[3px] rounded-full" style={{ background: INK_SOFT }} />
            <i className="pp-dot block h-[3px] w-[3px] rounded-full" style={{ background: INK_SOFT }} />
          </span>
        </div>

        <p
          className="mt-2 text-[17px]"
          style={{
            color: INK,
            fontFamily: SERIF,
            lineHeight: 1.45,
            textWrap: "balance",
            wordBreak: "break-word",
            overflowWrap: "anywhere",
          }}
        >
          {message || "I have the last piece. Ask me for it."}
        </p>

        {showDebugRelease && (
          <button
            type="button"
            onClick={handleDebug}
            className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center rounded-[14px] px-4 text-[12px] font-semibold"
            style={{
              color: INDIGO,
              fontFamily: OUTFIT,
              background: "rgba(99,102,241,0.10)",
              border: "1px dashed rgba(99,102,241,0.55)",
              letterSpacing: "0.02em",
            }}
          >
            [DEBUG: release piece]
          </button>
        )}

        {valveOpen && (
          <div className="pp-valve mt-1.5 flex justify-center">
            <button
              type="button"
              onClick={handleSelfServe}
              className="inline-flex min-h-[44px] items-center justify-center px-2 text-center text-[12px]"
              style={{
                color: INK_SOFT,
                fontFamily: OUTFIT,
                background: "transparent",
                border: "none",
                textDecoration: "underline",
                textDecorationStyle: "dotted",
                textUnderlineOffset: "3px",
              }}
            >
              {FINAL_PIECE.safetyValveCopy}
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .pp-breathe {
          animation: pp-breathe 2600ms ease-in-out infinite;
        }
        @keyframes pp-breathe {
          0%,
          100% {
            opacity: 0.32;
            transform: scale(0.82);
          }
          50% {
            opacity: 1;
            transform: scale(1.14);
          }
        }
        .pp-dot {
          animation: pp-drift 2600ms ease-in-out infinite;
          opacity: 0.35;
        }
        .pp-dot:nth-child(2) {
          animation-delay: 260ms;
        }
        .pp-dot:nth-child(3) {
          animation-delay: 520ms;
        }
        @keyframes pp-drift {
          0%,
          100% {
            opacity: 0.22;
            transform: translateY(0);
          }
          50% {
            opacity: 0.7;
            transform: translateY(-2px);
          }
        }
        .pp-valve {
          animation: pp-valve-in 340ms ease-out both;
        }
        @keyframes pp-valve-in {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
        .pp-final.pp-still .pp-breathe,
        .pp-final.pp-still .pp-dot,
        .pp-final.pp-still .pp-valve {
          animation: none;
          opacity: 1;
          transform: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .pp-breathe,
          .pp-dot,
          .pp-valve {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}
