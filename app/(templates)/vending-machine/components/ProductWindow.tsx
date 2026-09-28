"use client";

// ─── The glass ───────────────────────────────────────────────────────────────
//
// Three shelves, six slots each. Every slot is a coil with a product standing on
// the front of it, tilted by itemTiltFor so the shelf looks stocked by a human
// rather than laid out by a grid.

import { itemTiltFor, shelfLabel, type Slot } from "./types";
import Coil from "./Coil";
import {
  C,
  COIL_H,
  EDGE_H,
  FRAME,
  ITEM_H,
  ITEM_W,
  ITEM_X,
  OSWALD,
  ROW_H,
  SLOT_H,
  SLOT_W,
  WINDOW_H,
  WINDOW_PAD,
} from "./machine";

const KIND_TAG: Record<string, string> = {
  compliment: "CMP",
  memory: "MEM",
  voucher: "VCH",
  empty: "—",
};

export function ProductFace({ slot, tilt }: { slot: Slot; tilt: number }) {
  return (
    <div
      style={{
        width: ITEM_W,
        height: ITEM_H,
        transform: `rotate(${tilt}deg)`,
        transformOrigin: "50% 100%",
        background: "linear-gradient(155deg,#efeade 0%,#ded8c8 48%,#c8c2b0 100%)",
        border: "1px solid #4b4a42",
        borderRadius: 2,
        boxShadow: "0 1px 2px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.55)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          height: 7,
          flex: "0 0 auto",
          background: C.bodyDarker,
          color: "#fff",
          fontFamily: OSWALD,
          fontSize: 4.4,
          letterSpacing: "0.12em",
          lineHeight: "7px",
          textAlign: "center",
        }}
      >
        {KIND_TAG[slot.kind] ?? "—"}
      </div>
      <div
        style={{
          flex: 1,
          padding: "1.5px 1.5px 0",
          fontFamily: OSWALD,
          fontWeight: 500,
          fontSize: 5.2,
          lineHeight: 1.24,
          letterSpacing: "0.005em",
          color: C.paperInk,
          textAlign: "center",
          overflow: "hidden",
          wordBreak: "break-word",
        }}
      >
        {shelfLabel(slot.label)}
      </div>
    </div>
  );
}

interface ProductWindowProps {
  slots: Slot[];
  /** Code whose shelf copy is currently airborne and must not be drawn twice. */
  hiddenCode: string | null;
  /** Code whose coil is turning. */
  activeCode: string | null;
  coilMs: number;
}

export default function ProductWindow({ slots, hiddenCode, activeCode, coilMs }: ProductWindowProps) {
  const byCode = new Map(slots.map((s) => [s.code, s]));
  const rows = ["A", "B", "C"];

  return (
    <div
      style={{
        position: "relative",
        height: WINDOW_H + FRAME * 2,
        padding: FRAME,
        background: `linear-gradient(180deg, ${C.well2} 0%, ${C.well} 50%, ${C.well2} 100%)`,
        border: `1px solid ${C.edge}`,
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,.05), 0 2px 6px rgba(0,0,0,.5)",
      }}
    >
      <div
        style={{
          position: "relative",
          height: WINDOW_H,
          padding: WINDOW_PAD,
          background: `radial-gradient(120% 80% at 50% 0%, ${C.glassHi} 0%, ${C.glass} 78%)`,
          overflow: "hidden",
        }}
      >
        {rows.map((row, rowIndex) => (
          <div key={row} style={{ position: "relative", height: ROW_H }}>
            {/* the slots */}
            <div style={{ position: "relative", height: SLOT_H, display: "flex" }}>
              {[1, 2, 3, 4, 5, 6].map((col) => {
                const code = `${row}${col}`;
                const slot = byCode.get(code);
                if (!slot) return <div key={code} style={{ width: SLOT_W }} />;
                const live = activeCode === code;
                return (
                  <div
                    key={code}
                    className={live ? "vm-coil-live" : undefined}
                    style={
                      {
                        position: "relative",
                        width: SLOT_W,
                        height: SLOT_H,
                        ["--vm-coil-ms" as string]: `${coilMs}ms`,
                      } as React.CSSProperties
                    }
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: 2,
                        bottom: 4,
                        width: SLOT_W - 4,
                        height: COIL_H,
                        zIndex: 1,
                      }}
                    >
                      <Coil code={code} w={SLOT_W - 4} h={COIL_H} dim={slot.soldOut} />
                    </div>

                    {!slot.soldOut && (
                      <div
                        data-item={code}
                        style={{
                          position: "absolute",
                          left: ITEM_X,
                          top: 4,
                          zIndex: 2,
                          visibility: hiddenCode === code ? "hidden" : "visible",
                        }}
                      >
                        <ProductFace slot={slot} tilt={itemTiltFor(code, rowIndex * 6 + col)} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* shelf edge */}
            <div
              style={{
                height: EDGE_H,
                display: "flex",
                background: "linear-gradient(180deg,#121212 0%,#000 100%)",
                borderTop: "1px solid #2a3a3a",
                boxShadow: "0 2px 4px rgba(0,0,0,.6)",
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((col) => {
                const code = `${row}${col}`;
                const slot = byCode.get(code);
                return (
                  <div
                    key={code}
                    style={{
                      width: SLOT_W,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 3,
                      borderRight: col < 6 ? "1px solid #1e1e1e" : undefined,
                      fontFamily: OSWALD,
                      lineHeight: 1,
                    }}
                  >
                    <span style={{ fontSize: 7, letterSpacing: "0.08em", color: "#f2f2f2" }}>{code}</span>
                    {slot?.soldOut ? (
                      <span
                        style={{
                          fontSize: 4.6,
                          letterSpacing: "0.06em",
                          color: "#fff",
                          background: C.red,
                          padding: "1px 2px",
                          borderRadius: 1,
                        }}
                      >
                        SOLD OUT
                      </span>
                    ) : (
                      <span style={{ fontSize: 6.4, letterSpacing: "0.04em", color: "#d8d8d8" }}>
                        ₹{slot?.price ?? 1}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* GLASS — sits above the falling item, never takes a pointer event */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: FRAME,
          zIndex: 8,
          pointerEvents: "none",
          backgroundImage: [
            "linear-gradient(112deg, rgba(255,255,255,0) 18%, rgba(255,255,255,.06) 30%, rgba(255,255,255,0) 42%, rgba(255,255,255,0) 62%, rgba(255,255,255,.045) 71%, rgba(255,255,255,0) 80%)",
            "radial-gradient(38% 26% at 22% 74%, rgba(255,255,255,.04) 0%, rgba(255,255,255,0) 100%)",
            "radial-gradient(30% 22% at 79% 26%, rgba(255,255,255,.04) 0%, rgba(255,255,255,0) 100%)",
          ].join(","),
          boxShadow: "inset 0 0 22px rgba(0,0,0,.55)",
        }}
      />
    </div>
  );
}
