"use client";

// ─── "How was making this?" ───────────────────────────────────────────────────
//
// Shown once, centred, immediately after a page publishes and before the share
// sheet. Five stars, and — once a star is picked — a box for words.
//
// ── WHY IT IS CENTRED AND NOT A BOTTOM SHEET ────────────────────────────────
//
// Every other modal in this app is a bottom sheet on a phone, because every
// other one is a TASK: pay, share, edit. Those want a thumb and want the page
// behind them still visible, because the page is the context.
//
// This is a question, and it is the only thing on screen that matters for the
// four seconds it is up. Centred, with the page dimmed behind it, is what reads
// as "we are asking you something" rather than "here is another panel of
// controls". It is also the one shape that is identical on a phone, a laptop and
// a desktop, which is what was asked for.
//
// ── WHY THE TEXTAREA IS NOT THERE FROM THE START ────────────────────────────
//
// A rating plus an empty box is a form, and a form after publishing something is
// a wall. Stars alone is one tap. The box appears only once a star is picked, by
// which point the person has already engaged and the box reads as an invitation
// rather than an obligation — and its placeholder can then be specific to the
// rating, which is worth far more than a generic prompt.
//
// ── WHY EVERY EXIT PATH CALLS onDone ────────────────────────────────────────
//
// Because the share link is behind this modal. Skip, Escape, backdrop, a failed
// network request, a 500 — all of them let the person through to their link. The
// only thing that ever blocks is the ~1.1s thank-you beat after a successful
// submit. Losing feedback is a cost; standing between a creator and the link
// they came for is a bug.

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Loader2, Star, X } from "lucide-react";
import { API_URL, IS_NGROK } from "@/lib/config";
import RatingFace from "./feedback/RatingFace";
import { BRAND } from "@/lib/brand";
import { templateList, webpageTemplateList } from "@/data/template-registry";
import type { FeedbackContext } from "@/lib/feedback/feedbackBus";

const COMMENT_MAX = 2000;

/** How long the thank-you stays up before the share sheet arrives. */
const THANKS_MS = 1100;

/**
 * What each star means, in the creator's language rather than ours.
 *
 * Naming the rating back to them does two things: it confirms the tap landed on
 * the star they meant (thumbs are imprecise on a 5-across row), and it sets up
 * the placeholder below, so a one-star and a five-star are visibly different
 * conversations rather than the same box.
 */
const RATING_COPY: Record<number, { label: string; placeholder: string }> = {
  1: {
    label: "Something went wrong",
    placeholder: "What broke? We read these the same day.",
  },
  2: {
    label: "Not great",
    placeholder: "What got in your way?",
  },
  3: {
    label: "It was okay",
    placeholder: "What would have made this a five?",
  },
  4: {
    label: "Pretty good",
    placeholder: "What was the one thing that could be better?",
  },
  5: {
    label: "Loved it",
    placeholder: "What worked? (Optional — the stars are plenty.)",
  },
};

/**
 * The template's own name, for the headline: "How was making your Holi page?".
 *
 * Resolved here from the slug rather than passed in by each editor. Ten of the
 * forty-three raise this modal from their own publish handler, and asking each
 * of them to hand over a display title is ten strings to keep in step with the
 * gallery — which is exactly how one of them ends up saying "your page" while
 * the other forty-two name themselves.
 *
 * `templateTitle` on the context still wins when it is given, because the share
 * payload's `cardTitle` is often warmer than the catalog's ("Happy Raksha
 * Bandhan" against "Rakhi for Bhai").
 */
const TITLE_BY_SLUG = new Map(
  [...templateList, ...webpageTemplateList].map((t) => [t.slug, t.title])
);

function nameFor(ctx: FeedbackContext): string {
  const explicit = (ctx.templateTitle || "").trim();
  if (explicit) return `your ${explicit} page`;
  const fromCatalog = TITLE_BY_SLUG.get((ctx.templateSlug || "").trim());
  return fromCatalog ? `your ${fromCatalog} page` : "your page";
}

function token(): string | null {
  try {
    return (
      window.sessionStorage.getItem("gifts_impersonation_token") ||
      window.localStorage.getItem("gifts_access_token")
    );
  } catch {
    return null;
  }
}

export default function FeedbackModal({
  ctx,
  onDone,
}: {
  ctx: FeedbackContext;
  /** Closes the modal and releases whatever was waiting behind it. */
  onDone: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const firstStarRef = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Guards the thank-you timer against a double-close: without it, a submit
  // followed by an Escape would call `onDone` twice and open the share sheet on
  // a payload that has already been consumed.
  const closedRef = useRef(false);

  const finish = useCallback(() => {
    if (closedRef.current) return;
    closedRef.current = true;
    onDone();
  }, [onDone]);

  // ── Scroll lock ───────────────────────────────────────────────────────────
  //
  // The page behind is a template editor, often a long one. Without this, a
  // scroll gesture aimed at the textarea scrolls the editor underneath and the
  // modal appears to drift.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // Focus the first star, so a keyboard user lands on the actual question.
  useEffect(() => {
    const t = setTimeout(() => firstStarRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, []);

  // ── Escape, and a focus trap ──────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        finish();
        return;
      }
      if (e.key !== "Tab") return;

      // Tab must not walk out of the dialog into the editor behind it, which is
      // still in the document and still focusable.
      const focusables = cardRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), textarea, [href], input, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [finish]);

  const pick = (value: number) => {
    setRating(value);

    // ── A 12ms tick, on phones that support it ──────────────────────────────
    //
    // Five targets across a phone screen are small, and the most common
    // mis-tap is landing on the neighbour of the star you meant. A tick
    // confirms the tap by touch, before the eye has moved. Short on purpose:
    // anything longer reads as an error buzz.
    //
    // Wrapped because Safari does not implement it and some Android builds
    // throw rather than returning false.
    try {
      navigator.vibrate?.(12);
    } catch {
      /* no haptics here, and nothing to do about it */
    }
    // Move to the box they can now see. Not on a phone: focusing a textarea
    // there throws the keyboard up over the stars they just tapped, before they
    // have had a chance to see the rating land.
    if (window.matchMedia("(min-width: 640px)").matches) {
      setTimeout(() => textareaRef.current?.focus(), 220);
    }
  };

  const submit = async () => {
    if (!rating || busy) return;
    setBusy(true);

    try {
      const res = await fetch(`${API_URL}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
          ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
        },
        body: JSON.stringify({
          rating,
          comment: comment.trim().slice(0, COMMENT_MAX),
          templateSlug: ctx.templateSlug,
          pageUrl: ctx.pageUrl,
        }),
      });

      // ── Why a failure is not shown to them ──────────────────────────────
      //
      // They did us a favour and are on their way to sending a gift. An error
      // banner on a form they did not have to fill in, standing between them and
      // their link, would make being generous feel like a mistake. It is logged
      // for us and it looks like success to them — the one case where that is
      // the right trade, because there is nothing for them to do about it.
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        console.error("[feedback] submit failed", res.status, body);
      }
    } catch (err) {
      console.error("[feedback] submit threw", err);
    }

    setBusy(false);
    setSent(true);
    setTimeout(finish, THANKS_MS);
  };

  const copy = RATING_COPY[rating];
  const what = nameFor(ctx);

  return (
    <div
      role="presentation"
      onClick={(e) => {
        // Backdrop only, and never while the thank-you is showing.
        if (e.target === e.currentTarget && !busy && !sent) finish();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1200,
        background: "rgba(26,5,7,0.62)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        // ── A SHEET ON A PHONE, A CARD ON A DESKTOP ───────────────────────
        //
        // `flex-end` on a phone so the card rises from the bottom edge, which
        // puts the stars inside thumb reach instead of halfway up a screen
        // nobody can reach the middle of one-handed. The same pattern
        // `PaymentModal` already uses, so the two sheets in this product behave
        // alike.
        alignItems: "flex-end",
        justifyContent: "center",
        padding: 0,
        animation: "ssFeedbackFade 180ms ease-out both",
      }}
      className="ssFeedbackHost"
    >
      <style>{`
        /* From 640px there is room to centre it, and a full-width sheet on a
           desktop looks like a mistake. The bottom corners round only once it
           is floating — while it meets the screen edge, rounding them leaves
           two slivers of backdrop under the card. */
        @media (min-width: 640px) {
          .ssFeedbackHost { align-items: center; padding: 16px }
          .ssFeedbackCard { --ss-r-bottom: 24px; max-width: 400px }
        }
      `}</style>
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ss-feedback-title"
        style={{
          // The skip affordance is absolutely positioned inside this card.
          position: "relative",
          width: "100%",
          // Never taller than the viewport: a rotated phone with the keyboard
          // up leaves very little room, and a card that overflows loses its
          // buttons off the bottom. `dvh` rather than `vh` because iOS Safari's
          // toolbars make `vh` taller than what you can actually see.
          maxHeight: "calc(100dvh - 24px)",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          background: BRAND.surface,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderBottomLeftRadius: "var(--ss-r-bottom, 0px)",
          borderBottomRightRadius: "var(--ss-r-bottom, 0px)",
          border: `1px solid ${BRAND.border}`,
          boxShadow: BRAND.shadowElevated,
          // The bottom padding clears the iOS home bar, which sits ON TOP of a
          // sheet rather than beside it.
          padding: "10px 20px calc(18px + env(safe-area-inset-bottom, 0px))",
          textAlign: "center",
          animation: "ssFeedbackRise 240ms cubic-bezier(0.16,1,0.3,1) both",
        }}
        className="ssFeedbackCard"
      >
        {/* A grab handle. It is not draggable, and it is here anyway: without
            one, a panel flush against the bottom edge reads as a stuck dialog
            rather than something that came up and can go away. */}
        <div
          aria-hidden="true"
          style={{
            width: 38,
            height: 4,
            borderRadius: 99,
            background: "rgba(61,12,17,0.14)",
            margin: "4px auto 10px",
          }}
        />
        {sent ? (
          // ── Thank-you ──────────────────────────────────────────────────────
          <div style={{ padding: "22px 0 16px" }}>
            <div
              style={{
                width: 52,
                height: 52,
                margin: "0 auto 16px",
                borderRadius: "50%",
                background: "rgba(58,167,109,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Check size={26} strokeWidth={2.6} style={{ color: BRAND.ok }} />
            </div>
            <p
              style={{
                margin: "0 0 6px",
                fontSize: 18,
                fontWeight: 700,
                color: BRAND.text,
                fontFamily: "var(--font-lora), Georgia, serif",
              }}
            >
              Thank you
            </p>
            <p style={{ margin: 0, fontSize: 13, color: BRAND.muted, lineHeight: 1.6 }}>
              {rating <= 3
                ? "Someone on the team will read this properly."
                : "That genuinely helps. Now go send it."}
            </p>
          </div>
        ) : (
          <>
            {/* Skip, as an affordance rather than a hidden gesture. Top-right
                and quiet: the way out has to be visible or the modal reads as
                a trap, but it should not compete with the stars. */}
            <button
              type="button"
              onClick={finish}
              aria-label="Skip, and go to my link"
              disabled={busy}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                width: 34,
                height: 34,
                borderRadius: 12,
                border: "none",
                background: "transparent",
                color: BRAND.faint,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X size={16} />
            </button>

            <p
              style={{
                margin: "0 0 8px",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.09em",
                textTransform: "uppercase",
                color: BRAND.gold,
              }}
            >
              Published 🎉
            </p>

            {/* The face goes above the question, because it is the thing that
                makes someone look at all — and it is the thing that rewards the
                first tap. See components/feedback/RatingFace.tsx. */}
            <RatingFace rating={rating} size={100} />

            <h2
              id="ss-feedback-title"
              style={{
                margin: "10px 0 6px",
                fontSize: 20,
                lineHeight: 1.3,
                fontWeight: 700,
                color: BRAND.text,
                fontFamily: "var(--font-lora), Georgia, serif",
              }}
            >
              How was making {what}?
            </h2>

            {/* ── WHY THIS LINE CHANGES ONCE THEY TAP ────────────────────────
                Before: the smallest possible ask, naming the cost ("one tap")
                because the honest objection is "how long will this take".
                After: their own rating named back to them, which confirms the
                tap landed on the star they meant — thumbs are imprecise on a
                five-across row — and turns the box below into an invitation
                rather than a form. */}
            {/* ── ONE line, not two ──────────────────────────────────────────
                A second, fixed-height paragraph used to sit below the stars
                printing the same rating label — the identical words twice once
                a star was tapped. This one carries both jobs, including the
                `aria-live` announcement, which is the half a sighted reader
                never notices and a screen-reader user depends on.

                `minHeight` because the two states are different lengths, and
                without it tapping a star reflows the card taller and moves the
                Send button out from under the thumb already travelling toward
                it. */}
            <p
              aria-live="polite"
              style={{
                margin: "0 0 18px",
                minHeight: 40,
                fontSize: 13,
                color: BRAND.muted,
                lineHeight: 1.6,
              }}
            >
              {rating === 0 ? (
                <>One tap is plenty. We read every single one.</>
              ) : (
                <>
                  <span style={{ color: BRAND.text, fontWeight: 700 }}>{copy.label}</span>
                  {rating >= 4 ? " — thank you." : " — tell us what happened?"}
                </>
              )}
            </p>

            {/* ── The stars ──────────────────────────────────────────────────
                44px targets, which is the minimum a thumb hits reliably, and
                laid out with `justify-content: center` rather than a grid so
                they stay centred at every width. Arrow keys move the rating,
                because a five-across row of buttons is miserable to Tab
                through. */}
            <div
              role="radiogroup"
              aria-label="Rating, 1 to 5 stars"
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                  e.preventDefault();
                  pick(Math.min(5, (rating || 0) + 1));
                } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                  e.preventDefault();
                  pick(Math.max(1, (rating || 6) - 1));
                }
              }}
              style={{ display: "flex", justifyContent: "center", gap: 0, marginBottom: 10, touchAction: "manipulation" }}
            >
              {[1, 2, 3, 4, 5].map((value) => {
                const on = value <= rating;
                return (
                  <button
                    key={value}
                    ref={value === 1 ? firstStarRef : undefined}
                    type="button"
                    role="radio"
                    aria-checked={rating === value}
                    aria-label={`${value} star${value === 1 ? "" : "s"} — ${RATING_COPY[value].label}`}
                    onClick={() => pick(value)}
                    disabled={busy}
                    style={{
                      // 52px, up from 46. The WCAG floor is 44 and the stars
                      // sit edge to edge in a five-across row, so the common
                      // mis-tap is the neighbour of the one you meant.
                      width: 52,
                      height: 52,
                      border: "none",
                      background: "transparent",
                      // Without this, mobile Safari waits ~300ms on every tap
                      // to see whether it was a double-tap zoom. On the row
                      // that IS the interaction, that delay reads as lag.
                      touchAction: "manipulation",
                      cursor: busy ? "default" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      // The chosen star lifts. A scale on the whole row would
                      // reflow it; on one item inside a flex row it does not.
                      transform: on ? "scale(1.06)" : "scale(1)",
                      transition: "transform 160ms cubic-bezier(0.16,1,0.3,1)",
                    }}
                  >
                    <Star
                      size={34}
                      strokeWidth={1.75}
                      style={{
                        color: on ? BRAND.gold : "rgba(61,12,17,0.22)",
                        fill: on ? BRAND.gold : "transparent",
                        transition: "color 140ms ease, fill 140ms ease",
                      }}
                    />
                  </button>
                );
              })}
            </div>

            {rating > 0 && (
              <div style={{ animation: "ssFeedbackFade 200ms ease-out both" }}>
                <textarea
                  ref={textareaRef}
                  value={comment}
                  onChange={(e) => setComment(e.target.value.slice(0, COMMENT_MAX))}
                  placeholder={copy?.placeholder}
                  rows={3}
                  maxLength={COMMENT_MAX}
                  disabled={busy}
                  style={{
                    width: "100%",
                    resize: "none",
                    borderRadius: 14,
                    border: `1px solid ${BRAND.border}`,
                    background: BRAND.bgAlt,
                    padding: "11px 13px",
                    // 16px exactly: anything smaller and iOS Safari zooms the
                    // whole page on focus, which off-centres the dialog.
                    fontSize: 16,
                    lineHeight: 1.55,
                    color: BRAND.text,
                    outline: "none",
                    fontFamily: "inherit",
                    marginBottom: 12,
                    textAlign: "left",
                  }}
                />

                <button
                  type="button"
                  onClick={submit}
                  disabled={busy}
                  style={{
                    width: "100%",
                    minHeight: 48,
                    borderRadius: 14,
                    border: "none",
                    background: BRAND.gradient,
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: busy ? "default" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    boxShadow: "0 8px 20px -8px rgba(61,12,17,0.5)",
                  }}
                >
                  {busy ? <Loader2 size={16} className="animate-spin" /> : null}
                  {busy ? "Sending" : "Send feedback"}
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={finish}
              disabled={busy}
              style={{
                marginTop: rating > 0 ? 10 : 0,
                background: "none",
                border: "none",
                padding: "8px 10px",
                color: BRAND.faint,
                fontSize: 12.5,
                fontWeight: 600,
                cursor: busy ? "default" : "pointer",
              }}
            >
              {rating > 0 ? "Skip" : "Skip, take me to my link"}
            </button>
          </>
        )}
      </div>

      {/* Scoped, and both animations are dropped entirely under
          prefers-reduced-motion rather than merely shortened — a modal that
          appears instantly is correct there, not broken. */}
      <style>{`
        @keyframes ssFeedbackFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes ssFeedbackRise {
          from { opacity: 0; transform: translateY(14px) scale(0.97) }
          to   { opacity: 1; transform: translateY(0) scale(1) }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes ssFeedbackFade { from { opacity: 1 } to { opacity: 1 } }
          @keyframes ssFeedbackRise { from { opacity: 1 } to { opacity: 1 } }
        }
      `}</style>
    </div>
  );
}
