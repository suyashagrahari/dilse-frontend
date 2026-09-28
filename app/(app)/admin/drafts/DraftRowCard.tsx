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
//
// The hover lift is on the WRAPPER (`.ad-row` in page.tsx), not the button, so
// the link rides up with the card instead of sliding out from under the cursor
// on its way to being clicked.

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Clock, IndianRupee, UserRound } from "lucide-react";
import { A, rise } from "../adminKit";
import type { Row } from "./types";
import { REASON_META } from "./types";
import { MissingFields, Progress, ReasonChip, when } from "./parts";

export default function DraftRowCard({
  row,
  isOpen,
  onOpen,
  index = 0,
}: {
  row: Row;
  isOpen: boolean;
  onOpen: () => void;
  /** Position in the list, for the entry stagger. */
  index?: number;
}) {
  const accent = REASON_META[row.reason]?.color || A.muted;
  return (
    <motion.div className="ad-row" {...rise(index)} style={{ ["--ad-acc" as string]: accent }}>
      <button
        type="button"
        className="adk-card ad-row-btn"
        data-on={isOpen ? "1" : "0"}
        onClick={onOpen}
        style={{ padding: row.profileUserId ? "10px 86px 10px 14px" : "10px 12px 10px 14px" }}
      >
        {/* The reason's colour, as a stripe down the left edge. */}
        <span aria-hidden className="ad-row-stripe" />

        {/* Line 1 — what it is and why it stopped. */}
        <span style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", minWidth: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: A.ink, minWidth: 0, overflowWrap: "anywhere" }}>
            {row.templateLabel}
          </span>
          <ReasonChip reason={row.reason} small />
          {row.isPaid && (
            <span
              style={{
                display: "inline-flex", alignItems: "center", fontSize: 10.5,
                fontWeight: 800, color: A.goldDeep,
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
                fontSize: 10.5, color: A.ok, fontWeight: 800,
              }}
            >
              <Check size={11} /> contacted
            </span>
          )}
        </span>

        {/* Line 2 — who. The email ellipsizes rather than wrapping the card. */}
        <span style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, minWidth: 0 }}>
          <span
            style={{
              fontSize: 11.5, fontWeight: 700, color: A.ink, flex: "0 1 auto", minWidth: 0,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "45%",
            }}
          >
            {row.userName || "—"}
          </span>
          <span
            title={row.userEmail}
            style={{
              fontSize: 11.5, color: A.muted, flex: "1 1 auto", minWidth: 0,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}
          >
            {row.userEmail}
          </span>
          <span
            style={{
              display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10.5,
              color: A.muted, flex: "none", whiteSpace: "nowrap",
            }}
          >
            <Clock size={10} /> {when(row.createdAt)}
          </span>
        </span>

        {/* Line 3 — how far they got, and what they never filled in. One
            wrapping row: side by side on a wide list, stacked on a phone. */}
        <span
          style={{
            display: "flex", alignItems: "center", gap: "5px 10px", flexWrap: "wrap",
            marginTop: 6, minWidth: 0,
          }}
        >
          <Progress value={row.completeness} />
          <span style={{ fontSize: 10.5, color: A.muted, whiteSpace: "nowrap" }}>
            {row.wordCount}w · {row.photoCount} photo{row.photoCount === 1 ? "" : "s"} · idle{" "}
            {row.daysIdle}d
          </span>
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
          className="ad-row-profile"
        >
          <UserRound size={11} /> profile
        </Link>
      )}
    </motion.div>
  );
}
