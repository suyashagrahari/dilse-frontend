"use client";

// TEMPORARY verification harness for AGENT 3. Deleted before reporting.

import { useCallback, useMemo, useState } from "react";
import LetterPanel from "../components/LetterPanel";
import FinalPiecePanel from "../components/FinalPiecePanel";
import { DEMO_DATA, lineSchedule } from "../components/types";

const SHORT = ["Line one of three.", "Line two of three.", "Line three of three."];

export default function A3Check() {
  const [shortLetter, setShortLetter] = useState(false);
  const [wide, setWide] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [placed, setPlaced] = useState(0);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [log, setLog] = useState<string[]>([]);

  const lines = shortLetter ? SHORT : DEMO_DATA.lines;
  const total = 12;
  const schedule = useMemo(() => lineSchedule(lines.length, total), [lines.length]);

  const place = useCallback(() => {
    setPlaced((p) => {
      if (p >= total) return p;
      const li = schedule[p] ?? -1;
      if (li >= 0) setRevealed((prev) => (prev.indexOf(li) === -1 ? prev.concat(li) : prev));
      return p + 1;
    });
  }, [schedule]);

  const reset = () => {
    setPlaced(0);
    setRevealed([]);
    setLog([]);
  };

  return (
    <div style={{ padding: 8, fontFamily: "system-ui", fontSize: 12 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
        <button id="place" onClick={place} style={{ border: "1px solid #999", padding: "4px 8px" }}>
          place ({placed}/{total})
        </button>
        <button id="all" onClick={() => { for (let i = 0; i < total; i++) place(); }} style={{ border: "1px solid #999", padding: "4px 8px" }}>
          place all
        </button>
        <button id="reset" onClick={reset} style={{ border: "1px solid #999", padding: "4px 8px" }}>reset</button>
        <button id="short" onClick={() => { setShortLetter((s) => !s); reset(); }} style={{ border: "1px solid #999", padding: "4px 8px" }}>
          lines: {lines.length}
        </button>
        <button id="wide" onClick={() => setWide((w) => !w)} style={{ border: "1px solid #999", padding: "4px 8px" }}>
          layout: {wide ? "wide" : "mobile"}
        </button>
        <button id="reduce" onClick={() => setReduced((r) => !r)} style={{ border: "1px solid #999", padding: "4px 8px" }}>
          reduced: {String(reduced)}
        </button>
      </div>
      <div id="sched" style={{ fontFamily: "monospace", marginBottom: 6 }}>
        schedule({lines.length},{total}) = [{schedule.join(",")}] · revealed = [{revealed.join(",")}]
      </div>
      <div id="log" style={{ fontFamily: "monospace", color: "#b00", marginBottom: 6 }}>{log.join(" | ")}</div>

      <div style={{ display: "flex", gap: 10, alignItems: "stretch", height: 300 }}>
        <div
          id="letterwrap"
          style={{ display: "flex", flexDirection: "column", width: wide ? "auto" : "100%", flex: wide ? "0 0 auto" : "1 1 auto", minHeight: 0 }}
        >
          <LetterPanel
            lines={lines}
            revealed={revealed}
            placedCount={placed}
            totalPieces={total}
            senderName={DEMO_DATA.senderName}
            reducedMotion={reduced}
            placeholder={`${DEMO_DATA.senderName} wrote this in ${total} pieces. Place one and it lands here.`}
            className={wide ? "w-[21rem] shrink-0 self-stretch" : "min-h-0 w-full flex-1 overflow-hidden"}
          />
        </div>

        {/* Fake board: dark, with a "hole" in the middle to check occlusion. */}
        <div id="board" style={{ position: "relative", flex: "1 1 auto", background: "#221E3A", borderRadius: 16, overflow: "hidden" }}>
          <div
            id="hole"
            style={{
              position: "absolute", left: "33%", top: "25%", width: "33%", height: "25%",
              border: "2px dashed #FB7185", borderRadius: 8,
            }}
          />
          <FinalPiecePanel
            message={DEMO_DATA.finalPieceMessage}
            showDebugRelease
            onRelease={() => setLog((l) => l.concat("onRelease()"))}
            onSelfServe={() => setLog((l) => l.concat("onSelfServe()"))}
            reducedMotion={reduced}
          />
        </div>
      </div>
    </div>
  );
}
