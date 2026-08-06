"use client";

// ─── Collection tray ─────────────────────────────────────────────────────────
//
// A recess with a top-hinged flap. The flap has a visible pivot rod along its
// top edge and swings INWARD on impact — the swing, the thunk and the whole-body
// jolt are all triggered from the same synchronous callback so they land on the
// same frame.

import { itemTiltFor, type Slot } from "./types";
import { ProductFace } from "./ProductWindow";
import { C, ITEM_H, ITEM_W, OSWALD, TRAY_H } from "./machine";

const TAP = 44;
const OVERLAP = 12;

interface CollectionTrayProps {
  items: Slot[];
  /**
   * The flap is swung imperatively from the impact callback rather than by a
   * React state change, so the swing, the thunk and the body jolt are dispatched
   * in one synchronous call and cannot drift apart by a frame.
   */
  flapRef: React.RefObject<HTMLDivElement | null>;
  expanded: boolean;
  onToggleExpanded: () => void;
  onOpen: (code: string) => void;
}

export default function CollectionTray({
  items,
  flapRef,
  expanded,
  onToggleExpanded,
  onOpen,
}: CollectionTrayProps) {
  const collapsed = items.length > 4 && !expanded;
  const shown = collapsed ? items.slice(-3) : items;

  return (
    <div
      style={{
        position: "relative",
        height: TRAY_H,
        perspective: 260,
        background: "linear-gradient(180deg,#0a1719 0%,#050e0f 62%,#0a1719 100%)",
        border: "1px solid #061214",
        boxShadow: "inset 0 6px 14px rgba(0,0,0,.9), inset 0 -2px 0 rgba(255,255,255,.04)",
        overflow: "hidden",
      }}
    >
      {/* the landing point the fall is measured against */}
      <div
        data-tray-floor
        aria-hidden="true"
        style={{ position: "absolute", left: 0, right: 0, bottom: 10, height: 1 }}
      />

      {/* delivered items */}
      <div
        style={{
          position: "absolute",
          left: 10,
          right: 10,
          bottom: 8,
          height: TAP,
          display: "flex",
          alignItems: "flex-end",
          overflowX: expanded ? "auto" : "hidden",
          zIndex: 4,
        }}
      >
        {shown.map((slot, i) => (
          <button
            key={slot.code}
            type="button"
            onClick={() => onOpen(slot.code)}
            aria-label={`Open coupon ${slot.code}`}
            style={{
              flex: "0 0 auto",
              width: TAP,
              height: TAP,
              marginLeft: i === 0 ? 0 : -OVERLAP,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              touchAction: "manipulation",
            }}
          >
            <span
              style={{
                display: "block",
                width: ITEM_W,
                height: ITEM_H,
                transform: `rotate(${itemTiltFor(slot.code, i) * 1.8}deg)`,
                filter: "drop-shadow(0 2px 3px rgba(0,0,0,.7))",
              }}
            >
              <ProductFace slot={slot} tilt={0} />
            </span>
          </button>
        ))}

        {collapsed && (
          <button
            type="button"
            onClick={onToggleExpanded}
            style={{
              flex: "0 0 auto",
              marginLeft: 6,
              height: TAP,
              padding: "0 8px",
              fontFamily: OSWALD,
              fontSize: 8,
              letterSpacing: "0.1em",
              color: C.ink,
              background: "rgba(255,255,255,.06)",
              border: "1px solid rgba(255,255,255,.14)",
              borderRadius: 2,
            }}
          >
            {items.length} ITEMS — TAP TO VIEW
          </button>
        )}

        {expanded && items.length > 4 && (
          <button
            type="button"
            onClick={onToggleExpanded}
            style={{
              flex: "0 0 auto",
              marginLeft: 8,
              height: TAP,
              padding: "0 8px",
              fontFamily: OSWALD,
              fontSize: 8,
              letterSpacing: "0.1em",
              color: C.inkDim,
              border: "1px solid rgba(255,255,255,.12)",
              borderRadius: 2,
            }}
          >
            COLLAPSE
          </button>
        )}
      </div>

      {/* the flap */}
      <div
        ref={flapRef}
        aria-hidden="true"
        style={
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: Math.round(TRAY_H * 0.56),
            transformOrigin: "50% 0%",
            transformStyle: "preserve-3d",
            background:
              "linear-gradient(180deg, rgba(28,52,54,.94) 0%, rgba(16,34,36,.86) 60%, rgba(10,24,26,.72) 100%)",
            borderBottom: "1px solid #0a1a1c",
            boxShadow: "0 4px 10px rgba(0,0,0,.65)",
            zIndex: 6,
          } as React.CSSProperties
        }
      >
        {/* the pivot rod, visible along the hinge */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 6,
            right: 6,
            height: 3,
            background: "linear-gradient(180deg,#8b9d9b 0%,#3c5150 55%,#16292b 100%)",
            borderRadius: 2,
            boxShadow: "0 1px 2px rgba(0,0,0,.7)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 5,
            textAlign: "center",
            fontFamily: OSWALD,
            fontSize: 7,
            letterSpacing: "0.28em",
            color: "rgba(217,230,227,.5)",
          }}
        >
          PUSH
        </div>
      </div>

      {/* recess lip */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,.05)",
          zIndex: 8,
        }}
      />
    </div>
  );
}
