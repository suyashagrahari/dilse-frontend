"use client";

// ─── The small pieces the drafts screen is built from ────────────────────────
//
// Chips, bars, the warning banner and the two functions that turn machine values into English.
// Extracted so the row and the detail panel render the SAME progress bar and
// the SAME reason chip — when they were inline in one 1,050-line file they had
// already started to differ by a pixel and a font weight.

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { REASON_META } from "./types";

/**
 * The bare address out of a Reply-To header value.
 *
 * The server sends it with a display name — `SubhSandesh <inbox@…>` — which is
 * right for the email header and wrong to print in a sentence.
 */
export function replyAddressOf(value?: string): string {
  if (!value) return "";
  const angled = value.match(/<([^>]+)>/);
  return (angled ? angled[1] : value).trim();
}

export function when(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.round(mins / 60)}h ago`;
  if (mins < 43200) return `${Math.round(mins / 1440)}d ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function ReasonChip({ reason, small = false }: { reason: string; small?: boolean }) {
  const m = REASON_META[reason] || { label: reason, color: BRAND.muted, bg: "rgba(61,12,17,0.06)" };
  return (
    <span
      style={{
        fontSize: small ? 10 : 10.5, fontWeight: 800, padding: small ? "3px 7px" : "4px 9px",
        borderRadius: 99, background: m.bg, color: m.color, flex: "none", whiteSpace: "nowrap",
      }}
    >
      {m.label}
    </span>
  );
}

/** How much of the template got filled in, as a bar and a number. */
export function Progress({ value, width = 46 }: { value: number; width?: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, flex: "none" }}>
      <span
        style={{
          width, height: 5, borderRadius: 99, background: "rgba(61,12,17,0.08)",
          overflow: "hidden", display: "block",
        }}
      >
        <motion.span
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(2, Math.min(100, value))}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            display: "block", height: "100%", borderRadius: 99,
            background: value >= 70 ? BRAND.ok : value >= 30 ? BRAND.gold : BRAND.danger,
          }}
        />
      </span>
      <span style={{ fontSize: 10.5, fontWeight: 700, color: BRAND.faint, minWidth: 26 }}>{value}%</span>
    </span>
  );
}

/**
 * What they never filled in.
 *
 * ── WHY THIS IS THE MOST USEFUL LINE ON THE ROW ────────────────────────────
 *
 * "46% filled" says how far somebody got. It does not say what stopped them,
 * and those are different questions with different answers. A draft missing
 * only "Photo" is one upload from done; a draft missing the message, the
 * recipient and the date was abandoned in the first thirty seconds. Both read
 * as "46%".
 *
 * Field NAMES only, never values — the same rule the rest of this screen
 * follows. Naming an empty field discloses nothing, because there is nothing in
 * it; that is precisely why this list can name the recipient field while the
 * filled-field list deliberately cannot.
 */
export function MissingFields({
  fields,
  total,
  max = 3,
  compact = false,
}: {
  fields: string[];
  /** The exact count, which can exceed `fields.length` — the server caps the names at 40. */
  total: number;
  max?: number;
  compact?: boolean;
}) {
  if (total <= 0) {
    return (
      <span
        style={{
          display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5,
          fontWeight: 700, color: BRAND.ok,
        }}
      >
        Every field filled
      </span>
    );
  }

  const shown = fields.slice(0, max);
  const rest = total - shown.length;

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, flexWrap: "wrap", minWidth: 0 }}>
      {!compact && (
        <span style={{ fontSize: 10.5, fontWeight: 800, color: BRAND.faint, letterSpacing: "0.03em" }}>
          MISSING
        </span>
      )}
      {shown.map((f) => (
        <span
          key={f}
          style={{
            fontSize: 10.5, fontWeight: 600, padding: "2px 7px", borderRadius: 6,
            background: "rgba(61,12,17,0.05)", color: BRAND.muted,
            border: `1px dashed ${BRAND.border}`, whiteSpace: "nowrap",
          }}
        >
          {f}
        </span>
      ))}
      {rest > 0 && (
        <span style={{ fontSize: 10.5, fontWeight: 700, color: BRAND.faint }}>+{rest} more</span>
      )}
    </span>
  );
}

/** The red banner shape both errors and the SES warning use. */
export function Warn({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      role="alert"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: "flex", gap: 8, alignItems: "flex-start", padding: "9px 12px", borderRadius: 13,
        background: "rgba(161,53,64,0.08)", border: "1px solid rgba(161,53,64,0.22)", minWidth: 0,
      }}
    >
      <AlertTriangle size={14} style={{ color: BRAND.danger, flex: "none", marginTop: 2 }} />
      <span style={{ fontSize: 12.5, color: BRAND.text, lineHeight: 1.5, minWidth: 0, overflowWrap: "anywhere" }}>
        {children}
      </span>
    </motion.div>
  );
}
