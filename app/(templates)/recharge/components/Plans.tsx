"use client";

// ─── Plan card + plan details sheet ──────────────────────────────────────────
//
// Phone: the classic stacked card — price and a radio up top, three columns
// (Validity + the first two rows), benefit chips, then "View details". From
// 1024px the same card lays out as the web list row: price | columns | Select.

import { parseRow, type Plan } from "./types";
import { Price, Sheet, priceLabel, PINK_DEEP, MUTED, INK, LINE, FAINT, GREEN_DEEP } from "./ui";
import { IconCheck, IconChevronRight, IconHeartFill, IconSparkle } from "./icons";

export function PlanCard({
  plan,
  selected,
  onSelect,
  onDetails,
  index = 0,
}: {
  plan: Plan;
  selected: boolean;
  onSelect: (p: Plan) => void;
  onDetails: (p: Plan) => void;
  index?: number;
}) {
  const rows = plan.rows.map(parseRow);
  const cols = [
    { label: "Validity", value: plan.validity || "—" },
    ...rows.slice(0, 2).map((r) => ({ label: r.label || "Benefit", value: r.value })),
  ];
  const chips = plan.benefits.slice(0, 2);
  const more = plan.benefits.length - chips.length + Math.max(0, rows.length - 2);
  const off = !!plan.disabled;

  return (
    <div
      role="button"
      tabIndex={off ? -1 : 0}
      aria-pressed={selected}
      aria-disabled={off}
      aria-label={`${priceLabel(plan.price)} plan, validity ${plan.validity}${off ? ", unavailable" : ""}`}
      className={`rc-plan${selected ? " on" : ""}${off ? " off" : ""}`}
      style={{ animationDelay: `${Math.min(index, 6) * 50}ms` }}
      onClick={() => !off && onSelect(plan)}
      onKeyDown={(e) => {
        if (off) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(plan);
        }
      }}
    >
      {plan.badge ? <span className="rc-badge">{plan.badge}</span> : null}

      <div className="rc-plan-top">
        <div style={{ opacity: off ? 0.5 : 1 }}>
          <Price price={plan.price} size={28} strike={off} />
          {off ? (
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "#A12A2D", marginTop: 6 }}>Unavailable</div>
          ) : null}
        </div>
        {!off ? (
          <span className="rc-radio" aria-hidden="true">
            {selected ? <IconCheck size={14} stroke={3} /> : null}
          </span>
        ) : null}
      </div>

      <div className="rc-plan-body" style={{ opacity: off ? 0.55 : 1, minWidth: 0 }}>
        <div className="rc-cols">
          {cols.map((c, i) => (
            <div key={i} className="rc-col">
              <small>{c.label}</small>
              <b>{c.value}</b>
            </div>
          ))}
        </div>
        {chips.length && !off ? (
          <div className="rc-chips">
            {chips.map((b, i) => (
              <span key={i} className="rc-chip">
                <IconHeartFill size={11} />
                <span>{b}</span>
              </span>
            ))}
            {more > 0 ? <span className="rc-chip" style={{ background: "#F4F2F8", color: MUTED }}>+{more} more</span> : null}
          </div>
        ) : null}
      </div>

      {!off ? (
        <button
          type="button"
          className="rc-btn rc-btn-pink rc-plan-cta"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(plan);
          }}
        >
          {selected ? (
            <>
              <IconCheck size={16} stroke={2.6} /> Selected
            </>
          ) : (
            "Select"
          )}
        </button>
      ) : null}

      {off ? (
        <div className="rc-off-note" style={{ gridColumn: "1 / -1" }}>
          {plan.disabledReason}
        </div>
      ) : (
        <div className="rc-plan-foot">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <IconSparkle size={13} /> {plan.rows.length + plan.benefits.length} benefits included
          </span>
          <button
            type="button"
            className="rc-link"
            onClick={(e) => {
              e.stopPropagation();
              onDetails(plan);
            }}
          >
            View details <IconChevronRight size={14} stroke={2.4} />
          </button>
        </div>
      )}
    </div>
  );
}

export function PlanSkeleton() {
  return (
    <div className="rc-skel" aria-hidden="true">
      <span className="rc-shimmer" style={{ width: 70, height: 22 }} />
      <div style={{ display: "flex", gap: 14 }}>
        <span className="rc-shimmer" style={{ flex: 1 }} />
        <span className="rc-shimmer" style={{ flex: 1 }} />
        <span className="rc-shimmer" style={{ flex: 1 }} />
      </div>
      <span className="rc-shimmer" style={{ width: "60%" }} />
    </div>
  );
}

export function PlanDetails({
  plan,
  onClose,
  onChoose,
}: {
  plan: Plan | null;
  onClose: () => void;
  onChoose: (p: Plan) => void;
}) {
  const rows = plan ? plan.rows.map(parseRow) : [];
  return (
    <Sheet
      open={!!plan}
      onClose={onClose}
      label="Plan details"
      title="Plan details"
      footer={
        plan && !plan.disabled ? (
          <button type="button" className="rc-btn rc-btn-pink" style={{ width: "100%" }} onClick={() => onChoose(plan)}>
            Recharge for {priceLabel(plan.price)}
          </button>
        ) : null
      }
    >
      {plan ? (
        <>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, padding: "6px 0 14px" }}>
            <div>
              <Price price={plan.price} size={38} />
              <div style={{ fontSize: 13, color: MUTED, marginTop: 6 }}>
                Validity <b style={{ color: INK }}>{plan.validity || "—"}</b>
              </div>
            </div>
            {plan.badge ? (
              <span className="rc-badge" style={{ position: "static", transform: "rotate(3deg)" }}>
                {plan.badge}
              </span>
            ) : null}
          </div>

          {rows.length ? (
            <div style={{ borderTop: `1px solid ${LINE}` }}>
              {rows.map((r, i) => (
                <div key={i} style={{ padding: "12px 0", borderBottom: `1px solid ${LINE}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 14 }}>
                    <span style={{ color: MUTED }}>{r.label || "Benefit"}</span>
                    <b style={{ textAlign: "right", fontWeight: 700 }}>{r.value}</b>
                  </div>
                  {r.note ? <div style={{ fontSize: 12.5, color: FAINT, marginTop: 4, lineHeight: 1.45 }}>{r.note}</div> : null}
                </div>
              ))}
            </div>
          ) : null}

          {plan.benefits.length ? (
            <>
              <div className="rc-sec">Additional benefits</div>
              <div style={{ display: "grid", gap: 10 }}>
                {plan.benefits.map((b, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, lineHeight: 1.45 }}>
                    <span
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 8,
                        background: "#FFE8F1",
                        color: PINK_DEEP,
                        display: "grid",
                        placeItems: "center",
                        flex: "none",
                      }}
                    >
                      <IconHeartFill size={12} />
                    </span>
                    {b}
                  </div>
                ))}
              </div>
            </>
          ) : null}

          {plan.disabled ? <div className="rc-off-note">{plan.disabledReason}</div> : null}

          <p style={{ fontSize: 11.5, color: FAINT, lineHeight: 1.5, margin: "18px 0 0" }}>
            <span style={{ color: GREEN_DEEP, fontWeight: 700 }}>No hidden charges.</span> Plan benefits are subject to
            feelings. Hugs are non-refundable and non-transferable. Fair usage policy does not apply to love.
          </p>
        </>
      ) : null}
    </Sheet>
  );
}
