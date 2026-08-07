"use client";

// ─── The share card ──────────────────────────────────────────────────────────
//
// 9:16, 360×640 CSS px, captured at pixelRatio 3 → 1080×1920. This is the
// portrait screenshot the template exists for, so it is composed rather than
// cropped: the RECOMMENDED plan card alone at a size it never gets on the plan
// grid, the operator wordmark above it, the number beneath.
//
// One card, one accent, one border weight. The card is the only thing with a
// stroke on this canvas — the surround is flat so the eye has nowhere else to
// go, which is the whole reason it reads at thumbnail size in a chat list.

import { ACCENT, ACCENT_TINT, BORDER, CHIP, DIVIDER, FAINT, FONT, INK, LEADER, MUTED, OperatorMark, priceParts } from "./ui";
import type { Plan, RechargeData } from "./types";

export const SHARE_W = 360;
export const SHARE_H = 640;

/** The card is a fixed height, so the table is capped rather than scrolled. */
const MAX_CARD_ROWS = 6;
const MAX_CARD_CHIPS = 3;

function Leader({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 7, minWidth: 0 }}>
      <span
        style={{
          flex: "0 1 auto",
          minWidth: 0,
          fontFamily: FONT,
          fontSize: 13,
          color: MUTED,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {label}
      </span>
      <span
        aria-hidden="true"
        style={{ flex: "1 1 auto", minWidth: 10, alignSelf: "flex-end", marginBottom: 3, borderBottom: `1px dotted ${LEADER}` }}
      />
      <span
        style={{
          flex: "0 0 auto",
          maxWidth: "58%",
          textAlign: "right",
          fontFamily: FONT,
          fontSize: 13,
          fontWeight: 500,
          color: INK,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default function ShareCard({
  data,
  plan,
  attach,
}: {
  data: RechargeData;
  plan: Plan | null;
  attach: (el: HTMLDivElement | null) => void;
}) {
  const rows = plan ? plan.rows.slice(0, MAX_CARD_ROWS) : [];
  const price = priceParts(plan ? plan.price : "—");
  const chips = plan ? plan.benefits.slice(0, MAX_CARD_CHIPS) : [];

  return (
    // Two elements on purpose. The OUTER one is what sits off-screen; the INNER
    // one — the node handed to the exporter — is statically positioned at 0,0
    // inside it. html-to-image clones the node it is given into a foreignObject
    // at the origin, so a `position: fixed; left: -20000px` on the captured node
    // itself renders the card outside the canvas and the PNG comes out blank at
    // exactly the right dimensions. Silent failure, already paid for once.
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: -20000,
        width: SHARE_W,
        height: SHARE_H,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <div
        ref={attach}
        style={{
          position: "relative",
          width: SHARE_W,
          height: SHARE_H,
          background: "#FFFFFF",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          padding: 24,
        }}
      >
        {/* Wordmark above */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: ACCENT }}>
          <OperatorMark size={24} />
          <span style={{ fontFamily: FONT, fontSize: 17, fontWeight: 700, color: ACCENT }}>{data.operator.name}</span>
        </div>
        <p style={{ margin: "4px 0 0", fontFamily: FONT, fontSize: 12, color: MUTED }}>{data.operator.tagline}</p>

        {/* The card, alone */}
        <div
          style={{
            flex: "1 1 auto",
            marginTop: 20,
            minHeight: 0,
            position: "relative",
            background: "#FFFFFF",
            border: `2px solid ${ACCENT}`,
            borderRadius: 14,
            padding: 20,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {plan?.badge ? (
            <span
              style={{
                position: "absolute",
                top: -10,
                right: 16,
                background: ACCENT,
                color: "#FFFFFF",
                fontFamily: FONT,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                padding: "4px 9px",
                borderRadius: 4,
                whiteSpace: "nowrap",
              }}
            >
              {plan.badge}
            </span>
          ) : null}

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 3, minWidth: 0 }}>
              {/* The price is a string and is printed as given. Never parsed. */}
              <span style={{ fontFamily: FONT, fontSize: 22, fontWeight: 600, color: INK, flex: "0 0 auto" }}>
                {price.symbol}
              </span>
              <span
                style={{
                  fontFamily: FONT,
                  fontSize: 46,
                  fontWeight: 700,
                  lineHeight: 1,
                  color: INK,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {price.amount}
              </span>
            </div>
            {plan?.validity ? (
              <div style={{ textAlign: "right", flex: "0 0 auto", maxWidth: "50%" }}>
                <p style={{ margin: 0, fontFamily: FONT, fontSize: 11, color: MUTED }}>Validity</p>
                <p
                  style={{
                    margin: 0,
                    fontFamily: FONT,
                    fontSize: 15,
                    fontWeight: 600,
                    color: INK,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {plan.validity}
                </p>
              </div>
            ) : null}
          </div>

          {rows.length > 0 ? (
            <>
              <div style={{ height: 1, background: DIVIDER, margin: "14px 0" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {rows.map((r, i) => (
                  <Leader key={`${r.label}-${i}`} label={r.label} value={r.value} />
                ))}
              </div>
            </>
          ) : null}

          {chips.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
              {chips.map((b, i) => (
                <span
                  key={`${b.slice(0, 10)}-${i}`}
                  style={{
                    background: CHIP,
                    color: MUTED,
                    fontFamily: FONT,
                    fontSize: 11,
                    lineHeight: 1.45,
                    padding: "4px 8px",
                    borderRadius: 6,
                  }}
                >
                  {b}
                </span>
              ))}
            </div>
          ) : null}

          <div style={{ flex: "1 1 auto" }} />

          <div
            style={{
              marginTop: 14,
              height: 42,
              borderRadius: 8,
              background: ACCENT_TINT,
              border: `1px solid ${ACCENT}`,
              color: ACCENT,
              fontFamily: FONT,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.12em",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            RECHARGED
          </div>
        </div>

        {/* Number beneath */}
        <div style={{ marginTop: 18, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontFamily: FONT, fontSize: 11, color: MUTED }}>Recharged for</p>
            <p
              style={{
                margin: "2px 0 0",
                fontFamily: FONT,
                fontSize: 18,
                fontWeight: 600,
                color: INK,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {data.subscriber.number}
            </p>
            <p
              style={{
                margin: "2px 0 0",
                fontFamily: FONT,
                fontSize: 12,
                color: MUTED,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {data.subscriber.name}
              {data.subscriber.circle ? ` · ${data.subscriber.circle}` : ""}
            </p>
          </div>
          <span style={{ fontFamily: FONT, fontSize: 10, color: FAINT, whiteSpace: "nowrap", paddingBottom: 2 }}>
            SubhSandesh
          </span>
        </div>

        <div style={{ marginTop: 14, height: 1, background: BORDER }} />
      </div>
    </div>
  );
}
