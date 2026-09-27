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

import { GRAD, GROTESK, ITALIC, MOON, MOON_SOFT, fmtDateLong } from "./dateTheme";
import { Eyebrow, Glass } from "./NightKit";
import type { InviteHeaderView } from "./viewModel";

/**
 * The shared shell. One frosted card on the same night sky, three screens, so
 * a closing screen never drifts out of the world of the invitation.
 */
function ClosingCard({
  eyebrow,
  headline,
  emoji,
  children,
  label,
}: {
  eyebrow: string;
  headline: string;
  emoji: string;
  children: ReactNode;
  label: string;
}) {
  return (
    <div
      className="relative z-[1] flex min-h-[100dvh] w-full items-center justify-center px-4"
      style={{ paddingTop: 96, paddingBottom: 96 }}
    >
      <Glass style={{ width: "100%", maxWidth: 480, padding: "40px 26px 34px", textAlign: "center", borderRadius: 30 }}>
        <article aria-label={label}>
          <span
            aria-hidden
            className="di-float"
            style={{
              display: "inline-grid",
              placeItems: "center",
              width: 68,
              height: 68,
              borderRadius: 22,
              background: GRAD,
              fontSize: 32,
              transform: "rotate(-6deg)",
              boxShadow: "0 18px 36px -16px rgba(255,79,139,.9)",
            }}
          >
            {emoji}
          </span>
          <Eyebrow style={{ marginTop: 22 }}>{eyebrow}</Eyebrow>
          <h1
            style={{
              margin: "10px 0 18px",
              fontFamily: GROTESK,
              fontWeight: 800,
              fontSize: "clamp(32px, 9vw, 46px)",
              lineHeight: 1.02,
              letterSpacing: "-0.035em",
              color: MOON,
              overflowWrap: "anywhere",
            }}
          >
            {headline}
          </h1>
          {children}
        </article>
      </Glass>
    </div>
  );
}

/** Body copy on the sky. */
function Line({ children, soft = false, italic = false }: { children: ReactNode; soft?: boolean; italic?: boolean }) {
  return (
    <p
      style={{
        margin: "0 0 10px",
        fontFamily: italic ? ITALIC : GROTESK,
        fontStyle: italic ? "italic" : "normal",
        fontSize: italic ? 20 : 16,
        fontWeight: italic ? 400 : 500,
        lineHeight: 1.55,
        color: soft ? MOON_SOFT : MOON,
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
    <ClosingCard eyebrow="answered" emoji="🌙" headline={view.recipientName} label="Your answer">
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
      eyebrow="sent ✈️"
      emoji="📅"
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
        Waiting for <span style={{ color: "#ffb3cc", fontWeight: 700 }}>{view.senderName}</span> to confirm.
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
    <ClosingCard eyebrow="from" emoji="🕰️" headline={view.senderName} label="This invitation has passed">
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
