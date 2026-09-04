"use client";

// ─── One draft in the list ───────────────────────────────────────────────────
//
// Four short lines and no prose: what it is and why it stopped, who made it,
// how far they got, and what they never filled in. The sentence explaining the
// reason lives in the panel, where somebody is deciding what to write — here
// they are scanning for which draft to open, and a paragraph per row makes six
// drafts a scroll instead of a glance.
//
// ── WHY THE PROFILE LINK IS A SIBLING, NOT A CHILD ──────────────────────────
//
// An <a> nested inside a <button> is invalid HTML — interactive elements cannot
// nest — and browsers disagree about what a click, a Tab press and a screen
// reader should each do with it. `stopPropagation` makes the mouse behave and
// fixes none of the rest. So the row button and the profile link are siblings
// in a positioned wrapper: the button opens the draft, the link opens the
// account, and neither needs to know about the other. The button carries extra
// right padding when the link is there so long text never runs underneath it.

import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { Check, Clock, IndianRupee, UserRound } from "lucide-react";
import type { Row } from "./types";
import { MissingFields, Progress, ReasonChip, when } from "./parts";

export default function DraftRowCard({
  row,
  isOpen,
  onOpen,
}: {
  row: Row;
  isOpen: boolean;
  onOpen: () => void;
}) {
  return (
    <div className="ad-row">
      <button
        type="button"
        className="ad-row-btn"
        onClick={onOpen}
        style={{
          padding: row.profileUserId ? "11px 92px 11px 12px" : "11px 12px",
          border: `1px solid ${isOpen ? BRAND.accentStrong : BRAND.border}`,
          boxShadow: isOpen ? "0 2px 12px rgba(61,12,17,0.08)" : "none",
        }}
      >
        {/* Line 1 — what it is and why it stopped. */}
        <span style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: BRAND.text }}>
            {row.templateLabel}
          </span>
          <ReasonChip reason={row.reason} />
          {row.isPaid && (
            <span
              style={{
                display: "inline-flex", alignItems: "center", fontSize: 10.5,
                fontWeight: 700, color: BRAND.accent,
              }}
            >
              <IndianRupee size={10} />
              {Math.round(row.finalPricePaise / 100)}
            </span>
          )}
          {row.nudgedAt && (
            <span
              style={{
                display: "inline-flex", alignItems: "center", gap: 3,
                fontSize: 10.5, color: BRAND.ok, fontWeight: 700,
              }}
            >
              <Check size={11} /> contacted
            </span>
          )}
        </span>

        {/* Line 2 — who. */}
        <span style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: BRAND.text }}>
            {row.userName || "—"}
          </span>
          <span style={{ fontSize: 11.5, color: BRAND.faint, minWidth: 0, overflowWrap: "anywhere" }}>
            {row.userEmail}
          </span>
          <span
            style={{
              display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10.5,
              color: BRAND.faint,
            }}
          >
            <Clock size={10} /> {when(row.createdAt)}
          </span>
        </span>

        {/* Line 3 — how far they got. */}
        <span style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 7 }}>
          <Progress value={row.completeness} />
          <span style={{ fontSize: 10.5, color: BRAND.faint }}>
            {row.wordCount}w · {row.photoCount} photo{row.photoCount === 1 ? "" : "s"} · idle{" "}
            {row.daysIdle}d
          </span>
        </span>

        {/* Line 4 — and what they never filled in. */}
        <span style={{ display: "block", marginTop: 7 }}>
          <MissingFields fields={row.missingFields} total={row.missingCount} />
        </span>
      </button>

      {/* Only when the server resolved a live account. A link built from a
          dangling ref opens a 404, which reads as this panel being broken
          rather than as the account being gone. */}
      {row.profileUserId && (
        <Link
          href={`/admin/users/${row.profileUserId}`}
          title={`Open ${row.userName || row.userEmail}'s profile`}
          aria-label="Open this person's profile"
          style={{
            position: "absolute", top: 9, right: 9,
            display: "inline-flex", alignItems: "center", gap: 4,
            minHeight: 26, padding: "4px 9px", borderRadius: 99,
            border: `1px solid ${BRAND.border}`, background: BRAND.bgAlt,
            fontSize: 10.5, fontWeight: 800, color: BRAND.accent, textDecoration: "none",
          }}
        >
          <UserRound size={11} /> profile
        </Link>
      )}
    </div>
  );
}
