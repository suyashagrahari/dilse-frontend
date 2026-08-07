"use client";

// ─── SCREEN 4 — success + receipt ────────────────────────────────────────────
//
// One success animation, played once and never again: a circle scaling in and a
// checkmark drawn by its own stroke over 400ms. No confetti, nothing looping.
// The screen it lands on has to look like a transaction record, and a record
// that celebrates itself for four seconds is not one.
//
// The receipt card is transaction data — sans labels, monospace values, dot
// leaders, a serial that carries their date. The message underneath it is
// OUTSIDE the card, in a serif, with room around it. That shift, from a table
// of fields into somebody's actual handwriting, is the payload of the whole
// template; everything above it exists to make the change of register land.

import { useCallback, useState } from "react";
import { exportNodeToPng, fileSlug } from "@/lib/exportPng";
import {
  ACCENT,
  BORDER,
  DIVIDER,
  DotRow,
  FAINT,
  FONT,
  IconDownload,
  IconRepeat,
  INK,
  MONO,
  MUTED,
  priceLabel,
  SECTION,
  SERIF,
  fmtStamp,
  splitReceipt,
} from "./ui";
import type { Plan, RechargeData } from "./types";

function SuccessMark() {
  return (
    <div
      className="rc-pop"
      style={{
        width: 64,
        height: 64,
        borderRadius: 32,
        background: ACCENT,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width={34} height={34} viewBox="0 0 34 34" fill="none" aria-hidden="true" focusable="false">
        <path
          className="rc-draw"
          d="M9 17.6 14.6 23 25 12"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export default function ReceiptScreen({
  data,
  plan,
  methodLabel,
  stamp,
  onAgain,
  onSaveCard,
  savingCard,
  topInset,
}: {
  data: RechargeData;
  plan: Plan;
  methodLabel: string;
  stamp: Date;
  onAgain: () => void;
  onSaveCard: () => void;
  savingCard: boolean;
  topInset: number;
}) {
  const { txnId, amountNote, body } = splitReceipt(data.receipt.message, data);

  // Callback ref into state, not a RefObject: `react-hooks/refs` forbids
  // reading a ref during render and the export needs the node in a handler.
  const [receiptNode, setReceiptNode] = useState<HTMLDivElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const download = useCallback(async () => {
    if (!receiptNode || busy) return;
    setBusy(true);
    // Freeze everything under the capture subtree first — html-to-image clones
    // computed style, and a clone caught mid-keyframe exports a half-drawn tick.
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    const result = await exportNodeToPng(receiptNode, {
      width: receiptNode.offsetWidth,
      height: receiptNode.offsetHeight,
      pixelRatio: 3,
      backgroundColor: "#FFFFFF",
      filename: `recharge-receipt-${fileSlug(data.subscriber.name)}`,
    });
    setBusy(false);
    setMsg(result.message);
  }, [receiptNode, busy, data.subscriber.name]);

  return (
    <div className={busy || savingCard ? "rc-static" : undefined} style={{ background: "#FFFFFF", minHeight: "100dvh" }}>
      <div style={{ paddingTop: topInset }} />

      <div style={{ padding: "26px 20px 8px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <SuccessMark />
        <h1 style={{ margin: "16px 0 0", fontFamily: FONT, fontSize: 22, fontWeight: 700, color: INK }}>
          Recharge Successful
        </h1>
        <p style={{ margin: "6px 0 0", fontFamily: FONT, fontSize: 13.5, lineHeight: 1.55, color: MUTED }}>
          {/* The price is a string. Printed, never totalled. */}
          {priceLabel(plan.price)} recharged for{" "}
          <span style={{ color: INK, fontWeight: 600 }}>{data.subscriber.number}</span>
        </p>
      </div>

      {/* The receipt */}
      <div style={{ padding: "18px 16px 0" }}>
        <div
          ref={setReceiptNode}
          style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16 }}
        >
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
            <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: MUTED }}>
              TRANSACTION RECEIPT
            </span>
            <span style={{ fontFamily: MONO, fontSize: 10.5, color: FAINT }}>{data.operator.name}</span>
          </div>

          <div style={{ height: 1, background: DIVIDER, margin: "12px 0 13px" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            <DotRow label="Transaction ID" value={txnId} monoValue />
            <DotRow label="Date & Time" value={fmtStamp(stamp)} monoValue />
            <DotRow label="Operator" value={data.operator.name} monoValue />
            <DotRow label="Plan" value={`${priceLabel(plan.price)} · ${plan.validity || "—"}`} monoValue />
            <DotRow label="Payment Method" value={methodLabel} monoValue />
            {amountNote ? <DotRow label="Amount Debited" value={amountNote} monoValue /> : null}
          </div>

          <div style={{ height: 1, background: DIVIDER, margin: "13px 0" }} />

          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
            <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: INK }}>Status</span>
            <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", color: ACCENT }}>
              SUCCESS
            </span>
          </div>
        </div>
      </div>

      {/* Outside the card, in a serif, with room. */}
      {body.length > 0 ? (
        <div style={{ padding: "34px 24px 8px" }}>
          {body.map((line, i) => (
            <p
              key={`${i}-${line.slice(0, 14)}`}
              style={{
                margin: i === 0 ? 0 : "20px 0 0",
                fontFamily: SERIF,
                fontSize: 17,
                lineHeight: 1.75,
                color: INK,
              }}
            >
              {line}
            </p>
          ))}
        </div>
      ) : null}

      <div style={{ padding: "28px 16px 44px", display: "flex", flexDirection: "column", gap: 10 }}>
        <button
          type="button"
          onClick={download}
          disabled={busy}
          style={{
            width: "100%",
            height: 44,
            minHeight: 44,
            borderRadius: 8,
            border: `1px solid ${ACCENT}`,
            background: ACCENT,
            color: "#FFFFFF",
            fontFamily: FONT,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.08em",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            opacity: busy ? 0.6 : 1,
            cursor: busy ? "default" : "pointer",
          }}
        >
          <IconDownload />
          {busy ? "Saving…" : "Download Receipt"}
        </button>

        <button
          type="button"
          onClick={onAgain}
          style={{
            width: "100%",
            height: 44,
            minHeight: 44,
            borderRadius: 8,
            border: `1px solid ${BORDER}`,
            background: "#FFFFFF",
            color: INK,
            fontFamily: FONT,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.08em",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            cursor: "pointer",
          }}
        >
          <IconRepeat />
          Recharge Again
        </button>

        <button
          type="button"
          onClick={onSaveCard}
          disabled={savingCard}
          style={{
            width: "100%",
            minHeight: 44,
            background: "transparent",
            border: "none",
            color: MUTED,
            fontFamily: FONT,
            fontSize: 12,
            textDecoration: "underline",
            textUnderlineOffset: 3,
            cursor: savingCard ? "default" : "pointer",
          }}
        >
          {savingCard ? "Saving…" : "Save the plan card (9:16)"}
        </button>

        {msg ? (
          <p
            aria-live="polite"
            style={{
              margin: 0,
              background: SECTION,
              borderRadius: 8,
              padding: "9px 10px",
              textAlign: "center",
              fontFamily: FONT,
              fontSize: 12,
              color: MUTED,
            }}
          >
            {msg}
          </p>
        ) : null}
      </div>
    </div>
  );
}
