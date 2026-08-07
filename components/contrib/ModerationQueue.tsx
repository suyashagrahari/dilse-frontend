// ─── ModerationQueue — the sender decides what goes on their page ────────────
//
// Nothing a stranger writes appears on a published page until the person who
// made it says so. This is where they say so: one row per contribution, one tap
// to approve, one to reject, and an "Approve all" for the common case where
// everything is fine and there are nine of them.
//
// ── THE FLAG IS A NUDGE, NOT A JUDGEMENT ─────────────────────────────────────
//
// The profanity pre-filter runs on submit and marks what it does not like. It
// does not block, it does not hide, and it is often wrong — a filter cannot
// tell an insult from the thing two friends have called each other since school.
// So the flagged row sits in the queue like every other row, in the same order,
// with a marker that says "read this one properly". The decision was never the
// filter's to make; its only job is to make sure the one that needed a second
// look is not the one that got skimmed.
//
// ── THE EMPTY STATE IS NOT AN ERROR ──────────────────────────────────────────
//
// An empty queue is the normal state of a page in its first hour, and most
// senders will see it before they see anything else. "No items" reads like
// something broke. It says instead that this is where things will land, and
// that nobody sees them first.
//
// ── MOTION ───────────────────────────────────────────────────────────────────
//
// Rows fade in as they arrive from the poll. Under `prefers-reduced-motion:
// reduce` they simply appear. No count-up on the pending total — it is a number
// that changes while you are looking at it, and animating it makes it unreadable
// at exactly the moment it matters.

"use client";

import type { ReactNode } from "react";
import StarRating from "./StarRating";
import {
  CONTRIB_TAP,
  initialsOf,
  resolveTheme,
  type Contribution,
  type ContribTheme,
} from "@/lib/contrib/types";

export interface ModerationQueueProps {
  /** Every status. The component splits them; the caller does not have to. */
  items: readonly Contribution[];
  /** First load only. A poll refreshing underneath must not blank the list. */
  loading?: boolean;
  /** Ids with a decision in flight — those rows go quiet and un-pressable. */
  busyIds?: readonly string[];

  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  /** Omit and the bulk action is not offered. Only shown for 2+ pending anyway. */
  onApproveAll?: () => void;
  approvingAll?: boolean;

  /** Warm by default — see the note above before changing these. */
  emptyTitle?: string;
  emptyBody?: string;

  /**
   * Render the body yourself when the template shows something we cannot —
   * a voice note, an attached photo. Falls back to the plain text.
   */
  renderBody?: (item: Contribution) => ReactNode;

  theme?: Partial<ContribTheme>;
  className?: string;
}

/** "3 Aug, 19:04". Locale-formatted in the browser only — never on the server. */
function when(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  return new Date(t).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** The "read this one properly" marker. Amber, not red — it is a suggestion. */
function FlagMarker({ reason, t }: { reason?: string; t: ContribTheme }) {
  const label = reason ? `Worth a look — ${reason}` : "Worth a look";
  return (
    <span
      title={label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "2px 8px",
        borderRadius: 999,
        border: `1px solid ${t.warn}`,
        color: t.warn,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.03em",
        whiteSpace: "nowrap",
      }}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          d="M12 3l9 16H3l9-16z"
          fill="none"
          stroke={t.warn}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M12 9v5" stroke={t.warn} strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="16.6" r="1.05" fill={t.warn} />
      </svg>
      {label}
    </span>
  );
}

function DecisionButton({
  children,
  onClick,
  disabled,
  tone,
  t,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone: "approve" | "reject";
  t: ContribTheme;
}) {
  const accent = tone === "approve" ? t.ok : t.danger;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: 1,
        minHeight: CONTRIB_TAP,
        padding: "0 14px",
        borderRadius: 12,
        border: `1px solid ${disabled ? t.edge : accent}`,
        background: tone === "approve" && !disabled ? accent : "transparent",
        color: disabled ? t.inkFaint : tone === "approve" ? t.accentInk : accent,
        fontFamily: t.font,
        fontSize: 14.5,
        fontWeight: 600,
        cursor: disabled ? "default" : "pointer",
        touchAction: "manipulation",
      }}
    >
      {children}
    </button>
  );
}

function Row({
  item,
  busy,
  onApprove,
  onReject,
  renderBody,
  t,
}: {
  item: Contribution;
  busy: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  renderBody?: (item: Contribution) => ReactNode;
  t: ContribTheme;
}) {
  const decided = item.status !== "pending";
  const stamp = when(item.createdAt);

  return (
    <li
      className="contrib-mq-row"
      style={{
        listStyle: "none",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: 14,
        borderRadius: 16,
        border: `1px solid ${item.flagged ? t.warn : t.edge}`,
        background: t.paper,
        opacity: busy ? 0.55 : 1,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          aria-hidden="true"
          style={{
            width: 34,
            height: 34,
            flex: "none",
            borderRadius: "50%",
            background: t.paperDeep,
            border: `1px solid ${t.edge}`,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12.5,
            fontWeight: 600,
            color: t.inkSoft,
          }}
        >
          {initialsOf(item.author)}
        </span>

        <div style={{ minWidth: 0, flex: 1 }}>
          <p
            style={{
              margin: 0,
              fontSize: 14.5,
              fontWeight: 600,
              color: t.ink,
              overflowWrap: "anywhere",
            }}
          >
            {item.author}
          </p>
          {stamp ? (
            <p style={{ margin: "2px 0 0", fontSize: 12, color: t.inkFaint }}>{stamp}</p>
          ) : null}
        </div>

        {typeof item.rating === "number" ? (
          <StarRating rating={item.rating} size={13} label={`${item.rating} out of 5 stars`} />
        ) : null}
      </div>

      {item.flagged ? <FlagMarker reason={item.flagReason} t={t} /> : null}

      {item.title ? (
        <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: t.ink }}>{item.title}</p>
      ) : null}

      <div
        style={{
          margin: 0,
          fontFamily: t.serif,
          fontSize: 15,
          lineHeight: 1.55,
          color: t.inkSoft,
          overflowWrap: "anywhere",
        }}
      >
        {renderBody ? renderBody(item) : item.body}
      </div>

      {decided ? (
        // Already dealt with. The row stays so the sender can see what they did
        // and change their mind — the opposite decision is still one tap away.
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              color: item.status === "approved" ? t.ok : t.inkFaint,
            }}
          >
            {item.status === "approved" ? "On the page" : "Not shown"}
          </span>
          <button
            type="button"
            onClick={() => (item.status === "approved" ? onReject(item.id) : onApprove(item.id))}
            disabled={busy}
            style={{
              minHeight: CONTRIB_TAP,
              padding: "0 12px",
              marginLeft: "auto",
              borderRadius: 12,
              border: `1px solid ${t.edge}`,
              background: "transparent",
              color: t.inkSoft,
              fontFamily: t.font,
              fontSize: 13.5,
              cursor: busy ? "default" : "pointer",
              touchAction: "manipulation",
            }}
          >
            {item.status === "approved" ? "Take it down" : "Put it up"}
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 10 }}>
          <DecisionButton tone="approve" onClick={() => onApprove(item.id)} disabled={busy} t={t}>
            Approve
          </DecisionButton>
          <DecisionButton tone="reject" onClick={() => onReject(item.id)} disabled={busy} t={t}>
            Reject
          </DecisionButton>
        </div>
      )}
    </li>
  );
}

export default function ModerationQueue({
  items,
  loading = false,
  busyIds,
  onApprove,
  onReject,
  onApproveAll,
  approvingAll = false,
  emptyTitle,
  emptyBody,
  renderBody,
  theme,
  className,
}: ModerationQueueProps) {
  const t = resolveTheme(theme);
  const busy = new Set(busyIds ?? []);

  // Pending first, and inside each group newest first. The sender opened this
  // to deal with what is waiting, not to browse what they already dealt with.
  const pending = items.filter((c) => c.status === "pending");
  const decided = items.filter((c) => c.status !== "pending");

  if (loading && items.length === 0) {
    return (
      <p className={className} style={{ fontFamily: t.font, fontSize: 14, color: t.inkFaint }}>
        Loading…
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <section
        className={className}
        style={{
          padding: "26px 20px",
          borderRadius: 18,
          border: `1px dashed ${t.edge}`,
          background: t.paperDeep,
          fontFamily: t.font,
        }}
      >
        <h3
          style={{
            margin: 0,
            fontFamily: t.serif,
            fontSize: 19,
            fontWeight: 500,
            color: t.ink,
          }}
        >
          {emptyTitle ?? "Nothing waiting yet"}
        </h3>
        <p style={{ margin: "8px 0 0", fontSize: 14.5, lineHeight: 1.55, color: t.inkSoft }}>
          {emptyBody ??
            "When someone adds something, it lands here first — you see it before anyone else, and nothing goes on the page until you say so."}
        </p>
      </section>
    );
  }

  return (
    <section className={className} style={{ fontFamily: t.font }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          minHeight: CONTRIB_TAP,
          marginBottom: 12,
        }}
      >
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: t.ink }}>
          {pending.length > 0
            ? `${pending.length} waiting for you`
            : "All caught up"}
        </h3>
        {onApproveAll && pending.length > 1 ? (
          <button
            type="button"
            onClick={onApproveAll}
            disabled={approvingAll}
            style={{
              marginLeft: "auto",
              minHeight: CONTRIB_TAP,
              padding: "0 14px",
              borderRadius: 12,
              border: `1px solid ${t.edge}`,
              background: "transparent",
              color: approvingAll ? t.inkFaint : t.ink,
              fontFamily: t.font,
              fontSize: 13.5,
              fontWeight: 600,
              cursor: approvingAll ? "default" : "pointer",
              touchAction: "manipulation",
            }}
          >
            {approvingAll ? "Approving…" : "Approve all"}
          </button>
        ) : null}
      </header>

      <ul style={{ display: "flex", flexDirection: "column", gap: 12, margin: 0, padding: 0 }}>
        {[...pending, ...decided].map((item) => (
          <Row
            key={item.id}
            item={item}
            busy={busy.has(item.id)}
            onApprove={onApprove}
            onReject={onReject}
            renderBody={renderBody}
            t={t}
          />
        ))}
      </ul>

      <style>{`
        .contrib-mq-row { animation: contrib-mq-in 180ms ease-out both; }
        @keyframes contrib-mq-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .contrib-mq-row { animation: none; }
        }
      `}</style>
    </section>
  );
}
