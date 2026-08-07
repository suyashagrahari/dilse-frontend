"use client";

// ─── SCREEN 2 — payment ──────────────────────────────────────────────────────
//
// An order summary, a stack of radio rows, a promo field and one button pinned
// to the bottom. The summary's "Total Payable" is the selected plan's PRICE
// STRING copied verbatim — there is no arithmetic anywhere on this screen, so a
// price of "∞" totals to "∞" instead of to "NaN".
//
// The promo field accepts anything. That is the joke and it is also the only
// interactive comedy on the screen, so it gets a real input, a real button and
// a real applied state rather than a punchline in placeholder text.

import { useCallback, useState } from "react";
import {
  ACCENT,
  ACCENT_TINT,
  BORDER,
  CHIP,
  DIVIDER,
  DotRow,
  FAINT,
  FONT,
  IconChevron,
  INK,
  MethodGlyph,
  MUTED,
  priceLabel,
  SECTION,
} from "./ui";
import type { Plan, RechargeData } from "./types";

const PROMO_APPLIED = "code applied: you were always going to get this free.";

export default function PaymentScreen({
  data,
  plan,
  methodId,
  onMethod,
  onPay,
  onBack,
  topInset,
}: {
  data: RechargeData;
  plan: Plan;
  methodId: string;
  onMethod: (id: string) => void;
  onPay: () => void;
  onBack: () => void;
  topInset: number;
}) {
  const [promo, setPromo] = useState("");
  const [applied, setApplied] = useState(false);

  // Any code works. There is no validation to fail, so there is no error state.
  const apply = useCallback(() => {
    if (!promo.trim()) return;
    setApplied(true);
  }, [promo]);

  return (
    <div style={{ background: SECTION, minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          background: "#FFFFFF",
          borderBottom: `1px solid ${BORDER}`,
          paddingTop: topInset,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 10px 10px 6px" }}>
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to plans"
            style={{
              width: 44,
              height: 44,
              minHeight: 44,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
              border: "none",
              color: INK,
              cursor: "pointer",
            }}
          >
            <IconChevron size={18} />
          </button>
          <span style={{ fontFamily: FONT, fontSize: 15, fontWeight: 600, color: INK }}>Payment</span>
        </div>
      </div>

      <div style={{ flex: "1 1 auto", padding: "14px 16px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Order summary */}
        <section
          style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16 }}
          aria-label="Order summary"
        >
          <p style={{ margin: "0 0 12px", fontFamily: FONT, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: MUTED }}>
            ORDER SUMMARY
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            <DotRow label="Plan" value={priceLabel(plan.price)} />
            <DotRow label="Validity" value={plan.validity || "—"} />
            <DotRow label="Number" value={data.subscriber.number} />
          </div>
          <div style={{ borderTop: `1px solid ${BORDER}`, marginTop: 13, paddingTop: 13 }}>
            {/* Copied, not computed. */}
            <DotRow label="Total Payable" value={priceLabel(plan.price)} strong size={14} />
          </div>
        </section>

        {/* Methods */}
        <section aria-label="Payment method">
          <p style={{ margin: "0 0 8px", fontFamily: FONT, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: MUTED }}>
            PAY USING
          </p>
          <div
            role="radiogroup"
            aria-label="Payment method"
            style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}
          >
            {data.payment.methods.map((m, i) => {
              const on = m.id === methodId;
              return (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => onMethod(m.id)}
                  style={{
                    width: "100%",
                    minHeight: 56,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "0 14px",
                    background: on ? ACCENT_TINT : "#FFFFFF",
                    border: "none",
                    borderTop: i === 0 ? "none" : `1px solid ${DIVIDER}`,
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ color: on ? ACCENT : MUTED, display: "inline-flex", flex: "0 0 auto" }}>
                    <MethodGlyph label={m.label} id={m.id} />
                  </span>
                  <span style={{ flex: "1 1 auto", minWidth: 0, padding: "9px 0" }}>
                    <span
                      style={{
                        display: "block",
                        fontFamily: FONT,
                        fontSize: 13.5,
                        fontWeight: 600,
                        color: INK,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {m.label}
                    </span>
                    {m.sub ? (
                      <span style={{ display: "block", fontFamily: FONT, fontSize: 11.5, lineHeight: 1.4, color: MUTED }}>
                        {m.sub}
                      </span>
                    ) : null}
                  </span>
                  <span
                    aria-hidden="true"
                    style={{
                      flex: "0 0 auto",
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      border: `1px solid ${on ? ACCENT : BORDER}`,
                      background: "#FFFFFF",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {on ? <span style={{ width: 9, height: 9, borderRadius: 5, background: ACCENT }} /> : null}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Promo */}
        <section aria-label="Promo code">
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={promo}
              onChange={(e) => {
                setPromo(e.target.value);
                setApplied(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") apply();
              }}
              placeholder="Promo code"
              aria-label="Promo code"
              style={{
                flex: "1 1 auto",
                minWidth: 0,
                height: 44,
                borderRadius: 8,
                border: `1px solid ${BORDER}`,
                background: "#FFFFFF",
                padding: "0 12px",
                fontFamily: FONT,
                fontSize: 13,
                color: INK,
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={apply}
              disabled={!promo.trim()}
              style={{
                flex: "0 0 auto",
                minWidth: 84,
                height: 44,
                borderRadius: 8,
                border: `1px solid ${ACCENT}`,
                background: "#FFFFFF",
                color: ACCENT,
                fontFamily: FONT,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.1em",
                opacity: promo.trim() ? 1 : 0.45,
                cursor: promo.trim() ? "pointer" : "default",
              }}
            >
              APPLY
            </button>
          </div>
          {applied ? (
            <p
              aria-live="polite"
              style={{
                margin: "8px 0 0",
                background: CHIP,
                borderRadius: 8,
                padding: "9px 10px",
                fontFamily: FONT,
                fontSize: 12,
                lineHeight: 1.5,
                color: MUTED,
              }}
            >
              {PROMO_APPLIED}
            </p>
          ) : null}
        </section>

        <p style={{ margin: 0, fontFamily: FONT, fontSize: 11, lineHeight: 1.5, color: FAINT }}>
          By continuing you agree to nothing in particular. Charges, if any, are between the two of you.
        </p>
      </div>

      {/* Pinned to the bottom of the column on every viewport. */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          background: "#FFFFFF",
          borderTop: `1px solid ${BORDER}`,
          padding: "10px 16px",
          paddingBottom: "calc(10px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <button
          type="button"
          onClick={onPay}
          style={{
            width: "100%",
            height: 48,
            minHeight: 48,
            borderRadius: 8,
            border: `1px solid ${ACCENT}`,
            background: ACCENT,
            color: "#FFFFFF",
            fontFamily: FONT,
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: "0.1em",
            cursor: "pointer",
          }}
        >
          PAY {priceLabel(plan.price)}
        </button>
      </div>
    </div>
  );
}
