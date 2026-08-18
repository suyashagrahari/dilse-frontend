"use client";

// ─── SCREEN 3 — running status ───────────────────────────────────────────────
//
// The relationship as a route. This is where the emotional weight sits: the slip
// is a joke about bureaucracy, but the timeline is just true. Kept in the same
// dot-matrix register so the sincerity arrives dry rather than sentimental.

import { forwardRef } from "react";
import type { TicketData } from "./types";
import { BANDING, INK, MONO, PAPER, RULE, TonerStreak } from "./Paper";
import { useCountdown } from "../hooks/useTicketClock";

const hair = `1px solid ${RULE}`;
/** Dull amber. The only colour on this document, and barely. */
const AMBER = "#8a6212";
const AMBER_BG = "#f5eddb";

function Node({ status, isLast }: { status: TicketData["stations"][number]["status"]; isLast: boolean }) {
  const filled = status === "passed";
  const current = status === "current";
  return (
    <span
      className={current ? "tt-pulse" : undefined}
      style={{
        position: "relative",
        zIndex: 1,
        width: current ? 11 : 9,
        height: current ? 11 : 9,
        borderRadius: "50%",
        flexShrink: 0,
        marginTop: 3,
        background: filled ? INK : PAPER,
        // the terminus is deliberately left unresolved — no fill, no weight
        border: filled
          ? `1px solid ${INK}`
          : current
            ? `2px solid ${INK}`
            : `1px solid ${isLast ? "#b9b4a8" : "#8a857a"}`,
      }}
    />
  );
}

const RunningStatus = forwardRef<HTMLDivElement, { data: TicketData; terminusRef?: React.Ref<HTMLDivElement> }>(
  function RunningStatus({ data, terminusRef }, ref) {
    const stations = data.stations;
    const lastIndex = stations.length - 1;
    // Once departure has passed the train is no longer "running late" — it has
    // arrived. Leaving the banner in the present tense after the zero crossing
    // is the one way this screen can go stale and stop being true.
    const { elapsed: departed } = useCountdown(data.departureAt);

    return (
      <div
        ref={ref}
        style={{
          position: "relative",
          width: "100%",
          background: PAPER,
          backgroundImage: BANDING,
          color: INK,
          fontFamily: MONO,
          border: hair,
          overflow: "hidden",
        }}
      >
        <TonerStreak />

        <div style={{ borderBottom: hair, padding: "7px 8px", marginLeft: -1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>RUNNING STATUS</div>
          <div style={{ fontSize: 7.5, letterSpacing: "0.1em", color: "#444", marginTop: 1 }}>
            TRAIN {data.trainNo} · {data.trainName} · SPOT YOUR TRAIN
          </div>
        </div>

        <div style={{ padding: "10px 8px 4px" }}>
          {stations.map((s, i) => {
            const isLast = i === lastIndex;
            const dim = s.status === "upcoming";
            // The rail below a node: solid while the journey is behind you, dashed
            // from the current location onward, and gone entirely after the last
            // stop so the line just stops instead of arriving anywhere.
            const railStyle: React.CSSProperties = isLast
              ? { background: "transparent" }
              : s.status === "passed"
                ? { background: INK }
                : {
                    backgroundImage: `repeating-linear-gradient(to bottom, ${dim ? "#a8a396" : "#4a463d"} 0 3px, transparent 3px 6px)`,
                  };

            return (
              <div
                key={i}
                ref={isLast ? terminusRef : undefined}
                style={{ display: "flex", gap: 9, alignItems: "stretch" }}
              >
                {/* left rail */}
                <div style={{ position: "relative", width: 11, display: "flex", justifyContent: "center", flexShrink: 0 }}>
                  <Node status={s.status} isLast={isLast} />
                  {!isLast && (
                    <span
                      aria-hidden
                      style={{
                        position: "absolute",
                        top: 12,
                        bottom: -4,
                        left: "50%",
                        marginLeft: -0.5,
                        width: 1,
                        ...railStyle,
                      }}
                    />
                  )}
                  {isLast && (
                    // trailing off, fading out: no ETA, no rush, no arrival graphic
                    <span
                      aria-hidden
                      style={{
                        position: "absolute",
                        top: 12,
                        height: 26,
                        left: "50%",
                        marginLeft: -0.5,
                        width: 1,
                        backgroundImage: "linear-gradient(to bottom, #b9b4a8, rgba(185,180,168,0))",
                      }}
                    />
                  )}
                </div>

                {/* row */}
                <div style={{ flex: 1, minWidth: 0, paddingBottom: isLast ? 30 : 16 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, opacity: dim ? 0.55 : 1 }}>
                    <span
                      style={{
                        fontSize: 10.5,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: 172,
                        fontWeight: s.status === "current" ? 700 : 400,
                      }}
                    >
                      {s.name}
                    </span>
                    {/* dot leaders — flex-grow so every detail lands on one right edge */}
                    <span
                      aria-hidden
                      style={{
                        flex: 1,
                        minWidth: 8,
                        borderBottom: "1px dotted #8a857a",
                        transform: "translateY(-3px)",
                        opacity: 0.8,
                      }}
                    />
                    <span style={{ fontSize: 9, whiteSpace: "nowrap", textAlign: "right" }}>{s.detail}</span>
                    <span style={{ fontSize: 9, width: 10, textAlign: "right" }}>
                      {s.status === "passed" ? "✓" : s.status === "current" ? "●" : ""}
                    </span>
                  </div>
                  {s.label && (
                    <div style={{ fontSize: 7.5, color: "#555", marginTop: 1, opacity: dim ? 0.6 : 1 }}>({s.label})</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── delay banner ───────────────────────────────────────────────────
            The line the whole template is built around. Left completely plain —
            it does not need help. */}
        {(data.delay.amount || data.delay.reason) && (
          <div style={{ padding: "0 8px 10px" }}>
            <div style={{ border: `1px solid ${AMBER}`, background: AMBER_BG, padding: "7px 8px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: AMBER, letterSpacing: "0.02em", lineHeight: 1.4 }}>
                {departed
                  ? `Arrived. Late by ${data.delay.amount || "some time"}.`
                  : `Running late by ${data.delay.amount || "some time"}.`}
              </div>
              <div style={{ fontSize: 9, color: AMBER, lineHeight: 1.45, marginTop: 1 }}>
                {departed
                  ? "Reason: no longer relevant."
                  : `Reason: ${data.delay.reason || "circumstances beyond our control"}.`}
              </div>
            </div>
          </div>
        )}

        <div style={{ borderTop: hair, padding: "4px 8px", fontSize: 6.5, letterSpacing: "0.08em", color: "#444" }}>
          IHRCTC · SPOT YOUR TRAIN · POSITIONS ARE INDICATIVE AND SUBJECT TO EVERYTHING
        </div>
      </div>
    );
  },
);

export default RunningStatus;
