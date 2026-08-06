"use client";

// ─── share this plan with a friend ───────────────────────────────────────────
//
// AGENT 2. A bottom sheet opened from the countdown.
//
// Telling a friend where you are going is what everybody already does over
// text before a first date. Being the product that makes it one tap is a safety
// feature and a distribution loop wearing the same button, and the copy has to
// carry that lightly: matter-of-fact, warm, and completely unalarmed. Nothing
// in here says "in case", "just to be safe", or "let someone know where you
// are" — she has thought about it more than we have, and a card that turns
// solemn on her is a card she closes.
//
// WHAT THE FRIEND GETS: where she is meeting him, when, and who with. That is
// all. Not the stops, not the note, not the dress code — the friend gets LESS
// than she does, never more. `view` is an `InviteHeaderView`, which has no
// `stops` property at all, so that is a fact about the type and not a promise
// about this file.

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import {
  ACCENT,
  ACCENT_WASH,
  CARD_MAX_W,
  CARD_RADIUS,
  INK,
  INK_FAINT,
  INK_SOFT,
  MONO,
  PAPER,
  PAPER_EDGE,
  SERIF,
  TAP,
  fmtDateLong,
  fmtTime,
} from "./dateTheme";
import { Rule } from "./Ornaments";
import { copyToClipboard } from "./StaticMap";
import type { InviteHeaderView } from "./viewModel";
import useReducedMotion from "./useReducedMotion";

/**
 * TODO(server): mint a read-only plan link.
 *   POST /date-invitation-pages/share/:shareId/plan-link → { url }
 * It should return a short-lived, read-only page containing exactly the three
 * rows previewed below and nothing else — no RSVP controls, no itinerary, no
 * ability to see the page update as the evening goes on.
 *
 * Until that exists we copy THIS, which is deliberately not a working URL. A
 * plausible-looking link that 404s for her friend is worse than an honest
 * placeholder, so the shape says `preview` and the sheet says so in words.
 */
const PLACEHOLDER_LINK = "https://subhsandesh.com/plan/preview";

export interface SharePlanSheetProps {
  view: InviteHeaderView;
  open: boolean;
  onClose: () => void;
}

export default function SharePlanSheet({ view, open, onClose }: SharePlanSheetProps) {
  const reduceMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [copied, setCopied] = useState(false);
  // Drives the one-shot slide. Starts false on the render that mounts the sheet
  // so there is a frame to transition FROM.
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!open) {
      setShown(false);
      setCopied(false);
      return;
    }
    const raf = requestAnimationFrame(() => setShown(true));
    panelRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    // Stop the invitation scrolling behind the sheet. Restored exactly, and no
    // storage involved.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const onCopy = useCallback(() => {
    // TODO(server): copy the minted link instead of the placeholder.
    void copyToClipboard(PLACEHOLDER_LINK).then((ok) => setCopied(ok));
  }, []);

  if (!open) return null;

  const whenDate = fmtDateLong(view.startsAt);
  const whenTime = fmtTime(view.startsAt);
  const place = view.meetingPoint;
  const slide = shown || reduceMotion ? "translateY(0)" : "translateY(14px)";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 90,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      {/* Backdrop. Tapping it closes, like every sheet she has ever used. */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(36,31,27,0.42)",
          border: "none",
          padding: 0,
          cursor: "pointer",
          opacity: shown || reduceMotion ? 1 : 0,
          transition: reduceMotion ? "none" : "opacity 200ms ease-out",
        }}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-plan-title"
        tabIndex={-1}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: CARD_MAX_W,
          maxHeight: "88dvh",
          overflowY: "auto",
          background: PAPER,
          borderTopLeftRadius: 14,
          borderTopRightRadius: 14,
          border: `1px solid ${PAPER_EDGE}`,
          borderBottom: "none",
          boxShadow: "0 -18px 44px -22px rgba(58,44,32,0.5)",
          padding: "10px 22px calc(22px + env(safe-area-inset-bottom))",
          outline: "none",
          transform: slide,
          opacity: shown || reduceMotion ? 1 : 0,
          transition: reduceMotion ? "none" : "transform 240ms cubic-bezier(0.2,0.8,0.3,1), opacity 200ms ease-out",
        }}
      >
        {/* Grab handle */}
        <div
          aria-hidden
          style={{
            width: 40,
            height: 4,
            borderRadius: 2,
            background: PAPER_EDGE,
            margin: "0 auto 16px",
          }}
        />

        <h2
          id="share-plan-title"
          style={{
            margin: 0,
            fontFamily: SERIF,
            fontSize: 20,
            fontWeight: 600,
            color: INK,
            letterSpacing: "0.01em",
          }}
        >
          Send this to a friend
        </h2>
        <p
          style={{
            margin: "8px 0 0",
            fontFamily: SERIF,
            fontSize: 14.5,
            lineHeight: 1.6,
            color: INK_SOFT,
          }}
        >
          The where and the when, in one link. It&rsquo;s what you&rsquo;d text them anyway.
        </p>

        <div style={{ margin: "18px 0 14px", display: "flex", justifyContent: "center" }}>
          <Rule width={120} />
        </div>

        {/* Exactly what would be shared. Three rows, and no fourth. */}
        <p
          style={{
            margin: "0 0 10px",
            fontFamily: SERIF,
            fontSize: 10.5,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: INK_FAINT,
          }}
        >
          They would see
        </p>

        <dl
          style={{
            margin: 0,
            padding: "16px 18px",
            background: ACCENT_WASH,
            border: `1px solid ${PAPER_EDGE}`,
            borderRadius: CARD_RADIUS,
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            columnGap: 16,
            rowGap: 12,
            alignItems: "baseline",
          }}
        >
          <Term>Where</Term>
          <Detail>
            <span style={{ display: "block", color: INK, fontWeight: 600 }}>{place.name}</span>
            {place.address ? (
              <span style={{ display: "block", marginTop: 2, color: INK_SOFT, fontSize: 13.5 }}>
                {place.address}
              </span>
            ) : null}
          </Detail>

          <Term>When</Term>
          <Detail>
            {whenDate}
            {/* Monospace is for times and the countdown. The date is not a time. */}
            {whenTime ? (
              <span style={{ fontFamily: MONO, fontSize: 13 }}>&nbsp;&middot; {whenTime}</span>
            ) : null}
          </Detail>

          <Term>With</Term>
          <Detail>{view.senderName}</Detail>
        </dl>

        <p
          style={{
            margin: "14px 0 0",
            fontFamily: SERIF,
            fontSize: 13.5,
            lineHeight: 1.6,
            color: INK_SOFT,
            fontStyle: "italic",
          }}
        >
          That&rsquo;s the whole of it. The rest of the evening stays yours &mdash; your friend
          can&rsquo;t see the plan, and neither can you yet.
        </p>

        <div style={{ margin: "20px 0 14px", display: "flex", justifyContent: "center" }}>
          <Rule width={120} />
        </div>

        {/* The honest placeholder. */}
        <p
          style={{
            margin: 0,
            fontFamily: MONO,
            fontSize: 12.5,
            color: INK_SOFT,
            overflowWrap: "anywhere",
            padding: "10px 12px",
            border: `1px dashed ${PAPER_EDGE}`,
            borderRadius: CARD_RADIUS,
            background: "rgba(227,216,194,0.16)",
          }}
        >
          {PLACEHOLDER_LINK}
        </p>
        <p
          style={{
            margin: "8px 0 0",
            fontFamily: SERIF,
            fontSize: 12.5,
            lineHeight: 1.55,
            color: INK_FAINT,
          }}
        >
          A placeholder for now &mdash; real read-only links arrive with the backend.
        </p>

        <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={onCopy}
            style={{
              flex: "1 1 170px",
              minHeight: TAP,
              minWidth: TAP,
              borderRadius: CARD_RADIUS,
              border: `1.4px solid ${ACCENT}`,
              background: copied ? ACCENT : "transparent",
              color: copied ? PAPER : ACCENT,
              fontFamily: SERIF,
              fontSize: 12.5,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            {copied ? "copied" : "copy the link"}
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: "0 1 110px",
              minHeight: TAP,
              minWidth: TAP,
              borderRadius: CARD_RADIUS,
              border: `1px solid ${PAPER_EDGE}`,
              background: "transparent",
              color: INK_SOFT,
              fontFamily: SERIF,
              fontSize: 12.5,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            close
          </button>
        </div>
      </div>
    </div>
  );
}

function Term({ children }: { children: ReactNode }) {
  return (
    <dt
      style={{
        fontFamily: SERIF,
        fontSize: 10.5,
        letterSpacing: "0.26em",
        textTransform: "uppercase",
        color: INK_FAINT,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </dt>
  );
}

function Detail({ children, mono = false }: { children: ReactNode; mono?: boolean }) {
  return (
    <dd
      style={{
        margin: 0,
        fontFamily: mono ? MONO : SERIF,
        fontSize: mono ? 13 : 14.5,
        lineHeight: 1.45,
        color: INK,
        minWidth: 0,
        overflowWrap: "anywhere",
      }}
    >
      {children}
    </dd>
  );
}
