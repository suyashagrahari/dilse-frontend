"use client";

// ─── The three closing screens ───────────────────────────────────────────────
//
// `declined`, `reschedule`, `expired`. Same paper, same ornaments, far less on
// them. All three take the narrowed `InviteHeaderView`, so none of them can
// leak the plan.
//
// DECLINED is the one that has to be exactly right.
//
// The banned list, in full: "are you sure", "he'll be disappointed", "maybe
// next time" used as a nag, a sad emoji, an undo button, a retry button, a
// "change your mind?" link, any mention of how the sender feels about the no,
// and any count of how long he spent planning it. There is no button on that
// screen at all — not a quiet one, not a small one. A no is a complete answer
// and the page's only job is to accept it and stop talking.
//
// EXPIRED is not an error. No red, no warning glyph, no "expired" chrome. It is
// a note left on a table.

import type { ReactNode } from "react";

import { CornerFlourishes, Rule } from "./Ornaments";
import {
  ACCENT,
  CARD_MAX_W,
  CARD_RADIUS,
  CARD_SHADOW,
  DISPLAY,
  INK,
  INK_SOFT,
  PAPER,
  PAPER_EDGE,
  SERIF,
  fmtDateLong,
} from "./dateTheme";
import type { InviteHeaderView } from "./viewModel";

/**
 * The shared paper. One shell, three screens, so a closing screen can never
 * drift out of the same physical stock as the invitation it followed.
 */
function ClosingCard({
  eyebrow,
  headline,
  children,
  label,
}: {
  /** Small letter-spaced caps above the headline. Quiet by default. */
  eyebrow: string;
  headline: string;
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center px-4 py-12" style={{ background: PAPER }}>
      <article
        aria-label={label}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: CARD_MAX_W,
          background: PAPER,
          border: `1px solid ${PAPER_EDGE}`,
          borderRadius: CARD_RADIUS,
          boxShadow: CARD_SHADOW,
          padding: "40px 24px 38px",
          textAlign: "center",
        }}
      >
        <CornerFlourishes inset={9} size={30} />

        <p
          style={{
            margin: 0,
            fontFamily: DISPLAY,
            fontSize: 10.5,
            letterSpacing: "0.36em",
            textIndent: "0.36em",
            textTransform: "uppercase",
            color: INK_SOFT,
          }}
        >
          {eyebrow}
        </p>

        <h1
          style={{
            margin: "12px 0 0",
            fontFamily: DISPLAY,
            fontSize: "clamp(26px, 8vw, 34px)",
            fontWeight: 500,
            lineHeight: 1.18,
            color: INK,
            overflowWrap: "anywhere",
          }}
        >
          {headline}
        </h1>

        <div style={{ margin: "22px 0 20px" }}>
          <Rule width={80} />
        </div>

        {children}
      </article>
    </div>
  );
}

/** Body copy. SERIF, generous line height, centred, readable at arm's length. */
function Line({ children, soft = false, italic = false }: { children: ReactNode; soft?: boolean; italic?: boolean }) {
  return (
    <p
      style={{
        margin: "0 0 12px",
        fontFamily: SERIF,
        fontStyle: italic ? "italic" : "normal",
        fontSize: soft ? 15 : 16.5,
        lineHeight: 1.68,
        color: soft ? INK_SOFT : INK,
      }}
    >
      {children}
    </p>
  );
}

// ─── declined ────────────────────────────────────────────────────────────────

/**
 * A no, received. Nothing is asked for here and nothing is offered — there is
 * deliberately no interactive element on this screen.
 */
export function DeclinedScreen({ view }: { view: InviteHeaderView }) {
  return (
    <ClosingCard eyebrow="Answered" headline={view.recipientName} label="Your answer">
      <Line>Thank you for answering. That&rsquo;s all this page needed.</Line>
      <Line soft italic>
        Nothing is pending. Take care of yourself.
      </Line>
    </ClosingCard>
  );
}

// ─── reschedule ──────────────────────────────────────────────────────────────

/**
 * A counter-proposal, sent. Calm and hopeful: the ball is with the sender and
 * the copy says so, without putting a clock on him.
 */
export function RescheduleScreen({
  view,
  /** ISO date the recipient counter-proposed. */
  proposedDate,
}: {
  view: InviteHeaderView;
  proposedDate: string;
}) {
  // TODO(server): notify the sender of the counter-proposal.
  const when = fmtDateLong(proposedDate);

  return (
    <ClosingCard
      eyebrow="Sent"
      headline={when || "A different day"}
      label={`A different day suggested to ${view.senderName}`}
    >
      <Line>
        {when ? (
          <>You suggested {when} instead.</>
        ) : (
          <>You suggested a different day instead.</>
        )}
      </Line>
      <Line>
        Waiting for <span style={{ color: ACCENT }}>{view.senderName}</span> to confirm.
      </Line>
      <Line soft italic>
        No rush on either side.
      </Line>
    </ClosingCard>
  );
}

// ─── expired ─────────────────────────────────────────────────────────────────

/** Not an error. A note left on a table, found later. */
export function ExpiredScreen({ view }: { view: InviteHeaderView }) {
  const when = fmtDateLong(view.startsAt);

  return (
    <ClosingCard eyebrow="From" headline={view.senderName} label="This invitation has passed">
      <Line>This one passed.</Line>
      <Line soft>
        {when ? <>The invitation was for {when}.</> : <>The day it was for has already gone by.</>}
      </Line>
      <Line soft italic>
        It&rsquo;s a note left on the table now — nothing to answer.
      </Line>
    </ClosingCard>
  );
}
