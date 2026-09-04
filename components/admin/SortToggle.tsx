"use client";

// ─── Newest first, or oldest first ───────────────────────────────────────────
//
// One control, shared by the four admin lists that have an order: drafts,
// feedback, conversations and contact inquiries. All four were hardcoded to
// newest-first, which is the right default and the wrong only-option — "what
// just came in" and "what has been waiting longest" are different questions,
// and the second one is how a backlog gets cleared rather than grown.
//
// ── WHY IT IS TWO BUTTONS AND NOT A <select> ────────────────────────────────
//
// With exactly two mutually exclusive states, a select costs a tap to open, a
// tap to choose, and hides the state you are not in. Two segmented buttons show
// both options and the current one at a glance, and each is a single tap. The
// native control earns its place at four or more options, not at two.
//
// It is a radiogroup rather than a pair of toggles because the two are one
// choice, and a screen reader should hear "Oldest first, 2 of 2", not two
// unrelated pressed/unpressed buttons.

import { BRAND } from "@/lib/brand";
import { ArrowDownWideNarrow, ArrowUpNarrowWide } from "lucide-react";

export type SortOrder = "newest" | "oldest";

/**
 * `labels` exists because "newest" does not mean the same thing on every list.
 * On conversations the order is by last message, so the honest words are
 * "Latest reply" and "Waiting longest" — calling that "Newest" would say the
 * thread was opened recently, which is exactly what it does not mean.
 */
export default function SortToggle({
  value,
  onChange,
  labels = { newest: "Newest", oldest: "Oldest" },
  size = "md",
}: {
  value: SortOrder;
  onChange: (v: SortOrder) => void;
  labels?: { newest: string; oldest: string };
  size?: "md" | "sm";
}) {
  const h = size === "sm" ? 32 : 36;
  const fs = size === "sm" ? 12 : 12.5;

  return (
    <div
      role="radiogroup"
      aria-label="Sort order"
      style={{
        display: "inline-flex", gap: 3, padding: 3, borderRadius: 99,
        background: "rgba(61,12,17,0.05)", border: `1px solid ${BRAND.border}`,
        flex: "none",
      }}
    >
      {([
        { key: "newest" as const, label: labels.newest, Icon: ArrowDownWideNarrow },
        { key: "oldest" as const, label: labels.oldest, Icon: ArrowUpNarrowWide },
      ]).map(({ key, label, Icon }) => {
        const on = value === key;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(key)}
            style={{
              height: h - 6, padding: "0 11px", borderRadius: 99, border: "none",
              background: on ? BRAND.surface : "transparent",
              boxShadow: on ? "0 1px 4px rgba(61,12,17,0.10)" : "none",
              color: on ? BRAND.text : BRAND.muted,
              fontSize: fs, fontWeight: on ? 800 : 600, cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 5,
              fontFamily: "inherit", touchAction: "manipulation", whiteSpace: "nowrap",
            }}
          >
            <Icon size={13} style={{ flex: "none" }} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
