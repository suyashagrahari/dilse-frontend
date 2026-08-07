"use client";

// ─── SCREEN 1 — plan selection ───────────────────────────────────────────────
//
// The whole screen is a straight copy of a prepaid recharge grid: a tinted
// header with the number on it, one elevated card overlapping the header's
// bottom edge, a scrolling rail of category chips, and a stack of plan cards
// with a price, a validity, a dot-leader table and a row of benefit chips.
//
// Nothing here is decorated. The recommended card is marked by a 2px accent
// border and by NOTHING else — no scale, no shadow, no tint — because the
// moment a plan card starts looking designed the reader stops reading it as a
// plan card and the joke in the copy has nowhere to land.

import { useMemo } from "react";
import {
  ACCENT,
  ACCENT_TINT,
  BORDER,
  CHIP,
  DIVIDER,
  DotRow,
  FAINT,
  FONT,
  INK,
  MUTED,
  OperatorMark,
  priceParts,
  SECTION,
} from "./ui";
import { plansInCategory, type Plan, type RechargeData } from "./types";

/* ── Header ───────────────────────────────────────────────────────────────── */

/** `"Expires in 3 days"` and `"3 days"` both have to read as one sentence. */
function expiryLine(raw: string): string {
  const v = raw.trim();
  if (!v) return "Current plan is expiring";
  if (/^expires?\b/i.test(v)) return `Current plan ${v.charAt(0).toLowerCase()}${v.slice(1)}`;
  return `Current plan expires in ${v}`;
}

function Header({ data, topInset }: { data: RechargeData; topInset: number }) {
  return (
    <div style={{ background: ACCENT_TINT, paddingTop: topInset }}>
      <div style={{ padding: "14px 16px 34px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: ACCENT }}>
          <OperatorMark size={22} />
          <span style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, letterSpacing: "0.01em", color: ACCENT }}>
            {data.operator.name}
          </span>
          <span style={{ fontFamily: FONT, fontSize: 11, color: MUTED, opacity: 0.9, marginLeft: 2 }}>
            {data.operator.tagline}
          </span>
        </div>

        <p style={{ margin: "16px 0 2px", fontFamily: FONT, fontSize: 12, color: MUTED }}>Recharge for</p>
        <p style={{ margin: 0, fontFamily: FONT, fontSize: 20, fontWeight: 600, color: INK, letterSpacing: "0.01em" }}>
          {data.subscriber.number}
        </p>
        <p style={{ margin: "3px 0 0", fontFamily: FONT, fontSize: 13, color: INK, opacity: 0.8 }}>
          {data.subscriber.name}
          {data.subscriber.circle ? ` · ${data.subscriber.circle}` : ""}
        </p>
      </div>
    </div>
  );
}

/**
 * The one card in the template that overlaps anything, and the one element
 * carrying the one shadow. Everything else is a hard 1px border.
 */
function CurrentPlanCard({ data }: { data: RechargeData }) {
  return (
    <div style={{ padding: "0 16px", marginTop: -22, position: "relative", zIndex: 2 }}>
      <div
        style={{
          background: "#FFFFFF",
          border: `1px solid ${BORDER}`,
          borderRadius: 12,
          padding: "13px 14px",
          boxShadow: "0 2px 10px rgba(26,32,38,0.08)",
        }}
      >
        <p style={{ margin: 0, fontFamily: FONT, fontSize: 14, fontWeight: 600, color: INK }}>
          {expiryLine(data.currentPlan.expiresIn)}
        </p>
        {data.currentPlan.note ? (
          <p style={{ margin: "5px 0 0", fontFamily: FONT, fontSize: 12, lineHeight: 1.5, color: MUTED }}>
            {data.currentPlan.note}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/* ── Category rail ────────────────────────────────────────────────────────── */

function CategoryRail({
  data,
  active,
  onPick,
}: {
  data: RechargeData;
  active: string;
  onPick: (id: string) => void;
}) {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 3,
        background: "#FFFFFF",
        borderBottom: `1px solid ${BORDER}`,
        marginTop: 16,
      }}
    >
      <div
        className="rc-rail"
        role="tablist"
        aria-label="Plan categories"
        style={{ display: "flex", gap: 8, overflowX: "auto", padding: "8px 16px", WebkitOverflowScrolling: "touch" }}
      >
        {data.categories.map((c) => {
          const on = c.id === active;
          return (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => onPick(c.id)}
              style={{
                flex: "0 0 auto",
                height: 36,
                minHeight: 36,
                padding: "0 14px",
                borderRadius: 16,
                border: `1px solid ${on ? ACCENT : BORDER}`,
                background: on ? ACCENT : CHIP,
                color: on ? "#FFFFFF" : "#5A6570",
                fontFamily: FONT,
                fontSize: 12.5,
                fontWeight: on ? 600 : 500,
                whiteSpace: "nowrap",
                cursor: "pointer",
              }}
            >
              {c.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Plan card ────────────────────────────────────────────────────────────── */

function PlanCard({
  plan,
  recommended,
  index,
  onRecharge,
}: {
  plan: Plan;
  recommended: boolean;
  index: number;
  onRecharge: (plan: Plan) => void;
}) {
  const off = plan.disabled === true;
  const price = priceParts(plan.price);
  return (
    <div
      className="rc-in"
      style={{
        animationDelay: `${index * 60}ms`,
        position: "relative",
        marginTop: plan.badge ? 8 : 0,
        background: "#FFFFFF",
        border: recommended ? `2px solid ${ACCENT}` : `1px solid ${BORDER}`,
        borderRadius: 12,
        padding: 16,
        opacity: off ? 0.6 : 1,
      }}
    >
      {plan.badge ? (
        <span
          style={{
            position: "absolute",
            top: -8,
            right: 12,
            background: ACCENT,
            color: "#FFFFFF",
            fontFamily: FONT,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "3px 7px",
            borderRadius: 4,
            whiteSpace: "nowrap",
          }}
        >
          {plan.badge}
        </span>
      ) : null}

      {/* Price left, validity right. The price is a STRING and is printed as
          given — "∞" is a legal value and nothing on this screen parses it. */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 2, minWidth: 0 }}>
          <span style={{ fontFamily: FONT, fontSize: 16, fontWeight: 600, color: INK, flex: "0 0 auto" }}>
            {price.symbol}
          </span>
          <span
            style={{
              fontFamily: FONT,
              fontSize: 28,
              fontWeight: 700,
              lineHeight: 1.05,
              color: INK,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {price.amount}
          </span>
        </div>
        {plan.validity ? (
          <div style={{ textAlign: "right", flex: "0 0 auto", maxWidth: "52%" }}>
            <p style={{ margin: 0, fontFamily: FONT, fontSize: 11, color: MUTED }}>Validity</p>
            <p
              style={{
                margin: 0,
                fontFamily: FONT,
                fontSize: 14,
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

      {plan.rows.length > 0 ? (
        <>
          <div style={{ height: 1, background: DIVIDER, margin: "13px 0" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {plan.rows.map((r, i) => (
              <DotRow key={`${r.label}-${i}`} label={r.label} value={r.value} note={r.note} />
            ))}
          </div>
        </>
      ) : null}

      {/* Zero benefits hides the row entirely — no empty gap, no stray margin. */}
      {plan.benefits.length > 0 ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 13 }}>
          {plan.benefits.map((b, i) => (
            <span
              key={`${b.slice(0, 12)}-${i}`}
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

      <div style={{ marginTop: 14 }}>
        {off ? (
          <>
            <div
              style={{
                width: "100%",
                minHeight: 44,
                borderRadius: 8,
                background: CHIP,
                color: FAINT,
                fontFamily: FONT,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.1em",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ALREADY ACTIVE
            </div>
            {plan.disabledReason ? (
              <p style={{ margin: "7px 0 0", fontFamily: FONT, fontSize: 11, lineHeight: 1.5, color: FAINT }}>
                {plan.disabledReason}
              </p>
            ) : null}
          </>
        ) : (
          <button
            type="button"
            onClick={() => onRecharge(plan)}
            style={{
              width: "100%",
              minHeight: 44,
              height: 44,
              borderRadius: 8,
              border: `1px solid ${ACCENT}`,
              background: ACCENT,
              color: "#FFFFFF",
              fontFamily: FONT,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.1em",
              cursor: "pointer",
            }}
          >
            RECHARGE
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Screen ───────────────────────────────────────────────────────────────── */

export default function PlanScreen({
  data,
  activeCategory,
  onCategory,
  onRecharge,
  recommendedId,
  topInset,
}: {
  data: RechargeData;
  activeCategory: string;
  onCategory: (id: string) => void;
  onRecharge: (plan: Plan) => void;
  recommendedId: string | null;
  topInset: number;
}) {
  const plans = useMemo(() => plansInCategory(data, activeCategory), [data, activeCategory]);

  return (
    <div style={{ background: "#FFFFFF" }}>
      <Header data={data} topInset={topInset} />
      <CurrentPlanCard data={data} />
      <CategoryRail data={data} active={activeCategory} onPick={onCategory} />

      <div style={{ background: SECTION, padding: "16px 16px 40px", minHeight: "40vh" }}>
        {plans.length === 0 ? (
          <p style={{ margin: "24px 0", textAlign: "center", fontFamily: FONT, fontSize: 13, color: MUTED }}>
            no plans here. try Popular.
          </p>
        ) : (
          // Keyed on the tab so a switch re-runs the 60ms stagger rather than
          // swapping the contents of cards that are already on screen.
          <div key={activeCategory} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {plans.map((p, i) => (
              <PlanCard
                key={p.id}
                plan={p}
                index={i}
                recommended={p.id === recommendedId}
                onRecharge={onRecharge}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
