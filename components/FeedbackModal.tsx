"use client";

// ─── "How was making this?" ───────────────────────────────────────────────────
//
// Shown once, when the creator taps Share — after the page is already published
// and before the share sheet that carries the link.
//
// ── WHY ON SHARE AND NOT ON PUBLISH ─────────────────────────────────────────
//
// Asking at publish put a form over the confirmation that the thing had worked,
// which is the one message somebody actually needs at that second. It also
// asked people who had not finished: publish is not the end of the session,
// because the next thing many creators do is edit and publish again.
//
// Tapping Share IS the end. They are done, they are leaving for WhatsApp, and
// they have asked us for something — so asking once in return is a fair trade
// and reads as a step on the way out rather than an interruption.
//
// It is also the ONLY door: the publish toast no longer carries the link or a
// copy button, so there is no path to the URL that skips this. See
// scripts/feedback-coverage.mjs, which fails the build if one reappears.
//
// ─── THE THREE-BEAT ASK ──────────────────────────────────────────────────────
//
// Dismissing does not close this. It advances a small state machine:
//
//     ask ──dismiss──▸ please ──dismiss──▸ pleasePlease ──dismiss──▸ imFine ─▸ out
//      │                 │                     │
//      └── submit ───────┴─────────────────────┴──▸ thanks ─▸ seeYou ─▸ out
//
// A mascot pleads a little harder at each step, and at the third it gives up,
// says it is fine (it is visibly not fine), and lets go.
//
// ── WHY THIS IS A JOKE AND NOT A TOLL GATE ──────────────────────────────────
//
// The difference between a bit somebody enjoys and a dark pattern is entirely in
// whether the exit keeps working, so every one of these is true and has to stay
// true:
//
//   · The way out is in the same place, the same size and the same colour at
//     every beat. Nothing shrinks, moves, greys out or waits on a timer. The
//     dismissal target never drops below the 44px WCAG floor.
//   · The escalation is bounded at three and SAYS so — the second beat's eyebrow
//     reads "Last one, promise", because an unbounded guilt loop is where a gag
//     turns into a hostage situation. Somebody who wants out is out in three
//     taps, and knows it by the second.
//   · Escape leaves IMMEDIATELY, from any beat, with no mascot. A keyboard or
//     screen-reader user gets a real escape hatch rather than a comedy routine
//     they cannot see, and that path is exercised by the bus's own test.
//   · Every terminal beat carries a visible "go now" button, so the closing
//     animations are a gift and never a wait.
//   · The mascot is sad about ITSELF, never accusing. "I'm fine" is the penguin
//     being dramatic; there is no version of this that tells somebody they did
//     something wrong by leaving.
//
// The prior version of this file ended the ask at the first dismissal and is
// preserved in the `ask` beat exactly as it was — same eyebrow, same headline,
// same one-tap line. Nobody who intends to rate ever sees a penguin.
//
// ── WHY EVERY EXIT PATH STILL CALLS onDone ──────────────────────────────────
//
// Because the share link is behind this modal. Escape, the third dismissal, a
// failed network request, a 500 — all of them let the person through. The only
// things that ever hold are the short closing beats, and each of those can be
// skipped by hand. Losing feedback is a cost; standing between a creator and the
// link they came for is a bug.

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Star, X } from "lucide-react";
import { API_URL, IS_NGROK } from "@/lib/config";
import RatingFace from "./feedback/RatingFace";
import MascotStage from "./feedback/MascotStage";
import { MASCOTS, preloadMascot, type MascotKey } from "@/lib/feedback/feedbackArt";
import { BRAND } from "@/lib/brand";
import { templateList, webpageTemplateList } from "@/data/template-registry";
import type { FeedbackContext } from "@/lib/feedback/feedbackBus";

const COMMENT_MAX = 2000;

/**
 * How long each closing beat holds.
 *
 * 2.2s, not the 2–3s that was asked for, and the difference is deliberate: two
 * beats play back to back on the thank-you path, so 3s each is 6s of animation
 * between somebody and the link they came for, which is long enough to feel
 * like a loading screen. 2.2s twice is 4.4s, still reads as unhurried, and both
 * can be cut short by the button underneath.
 */
const BEAT_MS = 2200;

/** What each star means, in the creator's language rather than ours. */
const RATING_COPY: Record<number, { label: string; placeholder: string }> = {
  1: { label: "Something went wrong", placeholder: "What broke? We read these the same day." },
  2: { label: "Not great", placeholder: "What got in your way?" },
  3: { label: "It was okay", placeholder: "What would have made this a five?" },
  4: { label: "Pretty good", placeholder: "What was the one thing that could be better?" },
  5: { label: "Loved it", placeholder: "What worked? (Optional — the stars are plenty.)" },
};

type Stage = "ask" | "please" | "pleasePlease" | "imFine" | "thanks" | "seeYou";

/** The beats that still show the form. The rest are animations on the way out. */
const IS_ASKING: Record<Stage, boolean> = {
  ask: true,
  please: true,
  pleasePlease: true,
  imFine: false,
  thanks: false,
  seeYou: false,
};

/** Where a dismissal goes from here. `null` means leave for real. */
const NEXT_ON_DISMISS: Record<Stage, Stage | null> = {
  ask: "please",
  please: "pleasePlease",
  pleasePlease: "imFine",
  imFine: null,
  thanks: null,
  seeYou: null,
};

/**
 * The per-beat dressing: which mascot, what colour behind it, and the words.
 *
 * Tones are read straight off the brand palette rather than invented here, so
 * the glow behind a penguin cannot drift away from the rest of the product.
 */
const STAGE_ART: Record<Exclude<Stage, "ask">, { mascot: MascotKey; tone: string }> = {
  please: { mascot: "please", tone: BRAND.gold },
  pleasePlease: { mascot: "pleasePlease", tone: "#c2557a" },
  imFine: { mascot: "imFine", tone: "#6f8fb0" },
  thanks: { mascot: "thankYou", tone: BRAND.ok },
  seeYou: { mascot: "seeYou", tone: BRAND.gold },
};

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
  const [stage, setStage] = useState<Stage>("ask");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const firstStarRef = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Guards against a double-close: without it, a submit followed by an Escape
  // would call `onDone` twice and open the share sheet on a payload that has
  // already been consumed.
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

  // ── Warm the next beat, never the current one ─────────────────────────────
  //
  // Fetched one step ahead so a dismissal cuts to a drawn penguin instead of an
  // empty slot, and so somebody who rates immediately — the majority, and the
  // outcome we actually want — pays for none of it. `thankYou` is warmed as soon
  // as a star is picked, because that is the moment submitting became likely.
  useEffect(() => {
    if (stage === "ask") preloadMascot("please");
    else if (stage === "please") preloadMascot("pleasePlease");
    else if (stage === "pleasePlease") preloadMascot("imFine");
    else if (stage === "thanks") preloadMascot("seeYou");
  }, [stage]);

  useEffect(() => {
    if (rating > 0) preloadMascot("thankYou");
  }, [rating]);

  // ── The closing beats advance themselves ──────────────────────────────────
  useEffect(() => {
    if (stage === "imFine") {
      const t = setTimeout(finish, BEAT_MS);
      return () => clearTimeout(t);
    }
    if (stage === "thanks") {
      const t = setTimeout(() => setStage("seeYou"), BEAT_MS);
      return () => clearTimeout(t);
    }
    if (stage === "seeYou") {
      const t = setTimeout(finish, BEAT_MS);
      return () => clearTimeout(t);
    }
  }, [stage, finish]);

  /**
   * A dismissal — the X, the Skip button, or the backdrop.
   *
   * This is the escalation, and it is the ONLY thing that escalates. Escape
   * deliberately does not route through here.
   */
  const dismiss = useCallback(() => {
    if (busy) return;
    const next = NEXT_ON_DISMISS[stage];
    if (next === null) {
      finish();
      return;
    }
    // A different, softer tick than the star's — this one is the mascot
    // reacting, not a control confirming a tap.
    try {
      navigator.vibrate?.([8, 40, 8]);
    } catch {
      /* no haptics here, and nothing to do about it */
    }
    setStage(next);
  }, [stage, busy, finish]);

  // ── Escape, and a focus trap ──────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Straight out, from any beat, with no escalation. The bit is for
        // people who can see it; a keyboard escape hatch has to stay an escape
        // hatch.
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
    // Five targets across a phone screen are small, and the most common mis-tap
    // is landing on the neighbour of the star you meant. A tick confirms the tap
    // by touch, before the eye has moved. Short on purpose: anything longer
    // reads as an error buzz.
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
    setStage("thanks");
  };

  const copy = RATING_COPY[rating];
  const what = nameFor(ctx);
  const asking = IS_ASKING[stage];
  const art = stage === "ask" ? null : STAGE_ART[stage];
  /** The beat's colour, used by both the mascot's halo and the card behind it. */
  const tone = art ? art.tone : BRAND.gold;

  // ── The words for this beat ───────────────────────────────────────────────
  //
  // Assembled here rather than in a lookup table because three of the six read
  // differently once a star has been picked, and a table of functions returning
  // strings is harder to scan than the thing it replaces.
  let eyebrow = "";
  let title = "";
  let sub = "";
  let skipLabel = "";

  if (stage === "ask") {
    eyebrow = "Before you share";
    title = `How was making ${what}?`;
    sub = "One tap is plenty. We read every single one.";
    skipLabel = rating > 0 ? "Skip" : "Skip, take me to my link";
  } else if (stage === "please") {
    eyebrow = "Oh. Okay.";
    title = rating > 0 ? "You were so close!" : "Wait — one tap?";
    sub =
      rating > 0
        ? `You already picked ${rating}. One tap on Send and you're out of here, promise.`
        : "You just made something for someone you love. We'd really like to know if it felt good to make.";
    skipLabel = "Sorry, I have to go";
  } else if (stage === "pleasePlease") {
    eyebrow = "Last one, promise";
    title = "Pretty please?";
    sub =
      rating > 0
        ? `${rating} stars is genuinely all we need. The button is RIGHT THERE.`
        : "It's a very small team back here, and your one tap is honestly how we decide what to build next.";
    skipLabel = "Still going 🏃";
  } else if (stage === "imFine") {
    title = "I'm fine.";
    sub = "Totally fine. Completely fine. Go on — send your page. It's a good one.";
  } else if (stage === "thanks") {
    title = rating >= 4 ? "Thank you!!" : "Thank you — really.";
    sub =
      rating <= 3
        ? "Someone will read this properly today. That's a person, not an auto-reply."
        : "You just made our whole day. Genuinely.";
  } else {
    title = "See you next time!";
    sub = "Your link is ready. Go make someone's day 💛";
  }

  return (
    <div
      role="presentation"
      onClick={(e) => {
        // Backdrop only. It escalates like any other dismissal — a stray tap
        // outside the card is the same intent as tapping Skip.
        if (e.target === e.currentTarget && !busy) dismiss();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1200,
        background: "rgba(26,5,7,0.62)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        // ── LAYOUT LIVES IN THE STYLESHEET, NOT HERE ──────────────────────
        //
        // `alignItems`, `justifyContent` and `padding` are set in the class
        // below rather than inline. An inline style attribute outranks any
        // rule in a <style> tag, media query or not, so an inline
        // `alignItems: stretch` silently beat the 640px override and the card
        // grew to fill every desktop viewport — 860px of card holding 420px of
        // content. Anything a breakpoint needs to change cannot be set here.
        animation: "ssFeedbackFade 180ms ease-out both",
      }}
      className="ssFeedbackHost"
    >
      <style>{`
        /* Phone: full bleed. The media query below takes over at 640px. */
        .ssFeedbackHost {
          align-items: stretch;
          justify-content: center;
          padding: 0;
        }
        /* ── PHONE: THE WHOLE SCREEN ───────────────────────────────────────
           This beat is a performance and it wants the room. A bottom sheet on
           a phone left the mascot competing with a half-visible editor behind
           it, and the artwork is the message here. */
        .ssFeedbackCard {
          width: 100%;
          min-height: 100dvh;
          border-radius: 0;
          border: none;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        /* ── TABLET AND UP: A CARD AGAIN ───────────────────────────────────
           640px is where a full-bleed panel starts looking like a broken page
           rather than a considered screen. From here it is a floating card,
           and it stays one at every larger size — a modal that grows with a
           27" monitor is a modal nobody reads. */
        @media (min-width: 640px) {
          .ssFeedbackHost { align-items: center; padding: 20px }
          .ssFeedbackCard {
            min-height: 0;
            max-width: 420px;
            max-height: calc(100dvh - 40px);
            border-radius: 26px;
            border: 1px solid ${BRAND.border};
          }
        }
        /* A short landscape phone — the one case where vertical centring
           pushes the Send button off the bottom. Let it scroll from the top. */
        @media (max-height: 560px) {
          .ssFeedbackCard { justify-content: flex-start }
        }
      `}</style>

      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ss-feedback-title"
        style={{
          // The dismiss affordance is absolutely positioned inside this card.
          position: "relative",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          // ── A WASH BEHIND THE MASCOT ──────────────────────────────────────
          //
          // Full screen on a phone means roughly 300px of empty card above the
          // artwork and as much below it, and flat cream across all of that
          // read as an unfinished page rather than a composed one. A wide, very
          // faint bloom in the beat's own colour, falling off before it reaches
          // the stars, gives the space a reason to be there and carries the
          // colour change from beat to beat across the whole screen instead of
          // only behind the artwork itself.
          background: `radial-gradient(125% 48% at 50% 4%, ${tone}1f 0%, ${tone}00 64%), ${BRAND.surface}`,
          transition: "background 420ms ease",
          boxShadow: BRAND.shadowElevated,
          // The bottom padding clears the iOS home bar, which sits ON TOP of a
          // full-height panel rather than beside it.
          padding: "56px 22px calc(26px + env(safe-area-inset-bottom, 0px))",
          textAlign: "center",
          animation: "ssFeedbackRise 260ms cubic-bezier(0.16,1,0.3,1) both",
        }}
        className="ssFeedbackCard"
      >
        {/* ── The way out ───────────────────────────────────────────────────
            Same corner, same size, same colour at every beat including the
            closing ones, where it reads as "go now" rather than "cancel".
            48px, comfortably over the 44px floor, because this is the control
            that must never be a struggle to hit. */}
        <button
          type="button"
          onClick={dismiss}
          aria-label={asking ? "Skip, and go to my link" : "Go to my link now"}
          disabled={busy}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 48,
            height: 48,
            borderRadius: 14,
            border: "none",
            background: "rgba(61,12,17,0.04)",
            color: BRAND.faint,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: busy ? "default" : "pointer",
            touchAction: "manipulation",
          }}
        >
          <X size={18} />
        </button>

        {/* ── The mascot, or the reacting face ──────────────────────────────
            `beat` re-keys the stage so the entrance animation replays on every
            change; without it the slot is the same DOM node and the new
            character simply appears. */}
        <MascotStage tone={tone} beat={stage}>
          {art ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={MASCOTS[art.mascot].src}
              alt={MASCOTS[art.mascot].alt}
              width={MASCOTS[art.mascot].width}
              height={MASCOTS[art.mascot].height}
            />
          ) : (
            <RatingFace rating={rating} size={148} />
          )}
        </MascotStage>

        {eyebrow ? (
          <p
            style={{
              margin: "18px 0 0",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.09em",
              textTransform: "uppercase",
              color: BRAND.gold,
            }}
          >
            {eyebrow}
          </p>
        ) : null}

        <h2
          id="ss-feedback-title"
          style={{
            margin: eyebrow ? "8px 0 6px" : "18px 0 6px",
            fontSize: 22,
            lineHeight: 1.28,
            fontWeight: 700,
            color: BRAND.text,
            fontFamily: "var(--font-lora), Georgia, serif",
          }}
        >
          {title}
        </h2>

        {/* One line, carrying both the prompt and the `aria-live` announcement
            — the half a sighted reader never notices and a screen-reader user
            depends on. `minHeight` because the states are different lengths,
            and without it tapping a star reflows the card taller and moves the
            Send button out from under a thumb already travelling toward it. */}
        <p
          aria-live="polite"
          style={{
            margin: "0 auto 18px",
            maxWidth: 330,
            minHeight: asking ? 44 : 0,
            fontSize: 13.5,
            color: BRAND.muted,
            lineHeight: 1.62,
          }}
        >
          {asking && rating > 0 && stage === "ask" ? (
            <>
              <span style={{ color: BRAND.text, fontWeight: 700 }}>{copy.label}</span>
              {rating >= 4 ? " — thank you." : " — tell us what happened?"}
            </>
          ) : (
            sub
          )}
        </p>

        {asking ? (
          <>
            {/* ── The stars ────────────────────────────────────────────────
                52px targets — the WCAG floor is 44 and these sit edge to edge
                in a five-across row, so the common mis-tap is the neighbour of
                the one you meant. Arrow keys move the rating, because a row of
                five buttons is miserable to Tab through. */}
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
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 0,
                marginBottom: 10,
                touchAction: "manipulation",
              }}
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
                      width: 52,
                      height: 52,
                      border: "none",
                      background: "transparent",
                      // Without this, mobile Safari waits ~300ms on every tap to
                      // see whether it was a double-tap zoom. On the row that IS
                      // the interaction, that delay reads as lag.
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
                    minHeight: 50,
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
              onClick={dismiss}
              disabled={busy}
              style={{
                marginTop: rating > 0 ? 10 : 4,
                background: "none",
                border: "none",
                // Padded to a 44px-tall target even though it reads as a link.
                padding: "12px 14px",
                color: BRAND.faint,
                fontSize: 12.5,
                fontWeight: 600,
                cursor: busy ? "default" : "pointer",
                touchAction: "manipulation",
              }}
            >
              {skipLabel}
            </button>
          </>
        ) : (
          // ── A closing beat ────────────────────────────────────────────────
          //
          // The animation plays for BEAT_MS and then moves on by itself. This
          // button is here so it is never a wait — anybody who does not want
          // the send-off can take the link immediately.
          //
          // It calls `finish` from EVERY beat including thank-you, where it
          // first advanced to the see-you beat instead. A button that says
          // "Take me to my link" and plays another animation is a small lie,
          // and it is the exact lie this whole flow can least afford: the one
          // promise holding the escalation up is that the way out always works.
          <button
            type="button"
            onClick={finish}
            style={{
              marginTop: 4,
              background: "none",
              border: "none",
              padding: "12px 14px",
              color: BRAND.faint,
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
              touchAction: "manipulation",
            }}
          >
            Take me to my link →
          </button>
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
