// ─── Ratings & Reviews ───────────────────────────────────────────────────────
//
// The aggregate on top, the friends' reviews under it, and the sender's replies
// indented beneath those. Everything here is fed by the moderation queue, so the
// `reviews` array that arrives is PUBLISHED ONLY — the parent filters, this
// component never sees a pending item and must never be taught to.
//
// ── THE TWO NUMBERS THAT GIVE THIS AWAY IF THEY ARE WRONG ───────────────────
//
// 1. THE AVERAGE. It is drawn with the shared partial-fill star widget, which
//    clips the orange at the exact fraction. A 4.9 rendered as five solid stars
//    is the single fastest way to make a page read as a mock-up, and once the
//    stars are not believed the reviews under them are not believed either.
//
// 2. THE HISTOGRAM. Five percentages that add up to 99 or 101 is the classic
//    tell of a naive `Math.round(count / total * 100)` per row, and it is
//    visible: the bars do not fill the block. So the percentages are computed
//    with a largest-remainder pass, which distributes the rounding shortfall to
//    the rows with the biggest discarded fractions and therefore sums to
//    exactly 100 by construction rather than by luck.
//
// ── ZERO REVIEWS IS NOT ZERO STARS ──────────────────────────────────────────
//
// With no published reviews the block says "No Ratings Yet" and the histogram
// is gone. It never says "0.0". A zero rating is a claim — it says people came
// and hated it — and a page that makes that claim about someone's partner on
// the day it is opened is worse than a page that shows nothing. An absent
// rating is a fact. The "Write a Review" link stays, because the empty state is
// exactly the moment the affordance matters most.

"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import StarRating from "@/components/contrib/StarRating";
import type { AppRating, AppReview } from "./types";
import { AP, SECTION_GAP } from "./theme";

/** 44px floor — every one of these is pressed with a thumb. */
const TAP = 44;

/** Card width in the snap scroller. Fits a 380px viewport with a peek. */
const CARD_W = 280;

/** Lines of body copy before "more" appears. */
const CLAMP_LINES = 5;

/** `as const` so this stays a 4-tuple and satisfies the easing type, not number[]. */
const EASE_OUT = [0.32, 0.72, 0, 1] as const;

/** The classic five-point star, in a 24×24 box. Inline — no icon library. */
const STAR_PATH =
  "M12 1.6l3.09 6.26 6.91 1.01-5 4.87 1.18 6.88L12 17.35l-6.18 3.27L7 13.74l-5-4.87 6.91-1.01L12 1.6z";

const STAR_FILL = "#F5A623";

/**
 * Percentages that sum to exactly 100.
 *
 * Floor every share, then hand the leftover points one at a time to the rows
 * with the largest discarded fraction. Ties break on index so the output is
 * deterministic — two rows with identical counts must not swap places between
 * renders. Returns all zeroes for an empty distribution rather than dividing by
 * zero and painting five `NaN%` bars.
 */
function largestRemainderPercents(counts: readonly number[]): number[] {
  const safe = counts.map((c) => (Number.isFinite(c) && c > 0 ? c : 0));
  const total = safe.reduce((a, b) => a + b, 0);
  if (total <= 0) return safe.map(() => 0);

  const exact = safe.map((c) => (c / total) * 100);
  const out = exact.map((v) => Math.floor(v));
  let leftover = 100 - out.reduce((a, b) => a + b, 0);

  const order = exact
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac || a.i - b.i);

  for (let k = 0; k < order.length && leftover > 0; k += 1, leftover -= 1) {
    const idx = order[k]!.i;
    out[idx] = (out[idx] ?? 0) + 1;
  }
  return out;
}

/**
 * "4.9". Clamped and guarded, because a corrupt average printed at 56px is the
 * loudest possible place for the string "NaN" to appear.
 */
function oneDecimal(n: number): string {
  return (Number.isFinite(n) ? Math.min(5, Math.max(0, n)) : 0).toFixed(1);
}

/** `n` small filled stars — the histogram's row label, not a rating. */
function StarGlyphs({ n }: { n: number }) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-flex",
        gap: 1,
        justifyContent: "flex-end",
        width: 46,
        flex: "none",
        lineHeight: 0,
      }}
    >
      {Array.from({ length: n }, (_, i) => (
        <svg key={i} width={8} height={8} viewBox="0 0 24 24" focusable="false">
          <path d={STAR_PATH} fill={AP.inkSoft} />
        </svg>
      ))}
    </span>
  );
}

function Histogram({
  distribution,
  reduced,
}: {
  distribution: readonly number[];
  reduced: boolean;
}) {
  const percents = largestRemainderPercents(distribution);

  /**
   * The bars grow from nothing on first paint. `mounted` flips one frame later
   * so there is a "from" value to interpolate out of; without it the widths are
   * already correct on the first paint and nothing animates. It never flips
   * back, so nothing here loops.
   */
  const [grown, setGrown] = useState(reduced);
  useEffect(() => {
    if (reduced) return;
    const raf = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  // `distribution` is 1★…5★ in index order; the block reads 5★ down to 1★.
  const rows = [5, 4, 3, 2, 1];

  return (
    <div style={{ flex: "1 1 auto", minWidth: 0 }}>
      {rows.map((star, row) => {
        const pct = percents[star - 1] ?? 0;
        return (
          <div
            key={star}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: row === 0 ? 0 : 7,
            }}
          >
            <StarGlyphs n={star} />
            <div
              role="img"
              aria-label={`${star} star, ${pct} percent`}
              style={{
                flex: "1 1 auto",
                minWidth: 0,
                height: 4,
                borderRadius: 2,
                background: AP.edge,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${grown ? pct : 0}%`,
                  borderRadius: 2,
                  background: AP.accent,
                  transition: reduced
                    ? "none"
                    : `width 560ms cubic-bezier(0.32, 0.72, 0, 1) ${row * 40}ms`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ReviewCard({
  review,
  index,
  stacked,
  reduced,
}: {
  review: AppReview;
  index: number;
  stacked: boolean;
  reduced: boolean;
}) {
  const bodyRef = useRef<HTMLParagraphElement | null>(null);
  const [expanded, setExpanded] = useState(false);

  /**
   * "more" only appears when there is actually more. Measured rather than
   * guessed from character count, because a 200-character body at 15px is two
   * lines in one card and six in another depending on where the words break.
   */
  const [clipped, setClipped] = useState(false);
  useEffect(() => {
    const el = bodyRef.current;
    if (!el || expanded) return;
    const measure = () => setClipped(el.scrollHeight > el.clientHeight + 1);
    measure();
    // Fonts land after first paint and change the line count under us.
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [expanded, review.body]);

  return (
    <motion.article
      initial={reduced ? false : { opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={
        reduced
          ? { duration: 0 }
          : { duration: 0.42, delay: Math.min(index, 6) * 0.05, ease: EASE_OUT }
      }
      style={{
        flex: stacked ? "none" : `0 0 ${CARD_W}px`,
        width: stacked ? "100%" : CARD_W,
        scrollSnapAlign: "start",
        background: AP.card,
        borderRadius: 12,
        padding: 16,
        // A 200-character review with no spaces in it is a single "word" as far
        // as the line breaker is concerned. Without this it pushes the card
        // wider than the scroller and the whole row jumps.
        overflowWrap: "anywhere",
        wordBreak: "break-word",
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: 15,
          fontWeight: 600,
          lineHeight: 1.33,
          color: AP.ink,
          overflowWrap: "anywhere",
        }}
      >
        {review.title}
      </h3>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 6,
          marginTop: 6,
          fontSize: 13,
          color: AP.inkSoft,
        }}
      >
        <StarRating
          rating={review.stars}
          size={12}
          fillColor={STAR_FILL}
          emptyColor={AP.edge}
          label={`${review.stars} out of 5 stars`}
        />
        <span style={{ overflowWrap: "anywhere" }}>
          <span aria-hidden="true">· </span>
          {review.ago}
          <span aria-hidden="true"> · </span>
          {review.author}
        </span>
      </div>

      <p
        ref={bodyRef}
        style={{
          margin: "10px 0 0",
          fontSize: 15,
          lineHeight: 1.47,
          color: AP.ink,
          overflowWrap: "anywhere",
          ...(expanded
            ? {}
            : {
                display: "-webkit-box",
                WebkitBoxOrient: "vertical" as const,
                WebkitLineClamp: CLAMP_LINES,
                overflow: "hidden",
              }),
        }}
      >
        {review.body}
      </p>

      {clipped && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          style={{
            minHeight: TAP,
            display: "inline-flex",
            alignItems: "center",
            padding: "0 4px",
            marginLeft: -4,
            border: "none",
            background: "transparent",
            color: AP.accent,
            font: "inherit",
            fontSize: 13,
            cursor: "pointer",
            touchAction: "manipulation",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          more
        </button>
      )}

      {review.developerResponse && (
        <div
          style={{
            marginTop: 12,
            paddingLeft: 12,
            borderLeft: `2px solid ${AP.edge}`,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: AP.ink }}>
            Developer Response
          </div>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 15,
              lineHeight: 1.47,
              color: AP.ink,
              overflowWrap: "anywhere",
            }}
          >
            {review.developerResponse.text}
          </p>
          <div style={{ fontSize: 13, color: AP.inkSoft, marginTop: 4 }}>
            {review.developerResponse.ago}
          </div>
        </div>
      )}
    </motion.article>
  );
}

/** The two accent links under the block. Shared styling, different jobs. */
function FootLink({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: TAP,
        display: "inline-flex",
        alignItems: "center",
        padding: "0 4px",
        marginLeft: -4,
        border: "none",
        background: "transparent",
        color: AP.accent,
        font: "inherit",
        fontSize: 15,
        cursor: "pointer",
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {children}
    </button>
  );
}

export function Reviews({
  rating,
  reviews,
  onWriteReview,
}: {
  rating: AppRating;
  reviews: AppReview[];
  onWriteReview: () => void;
}) {
  const reduced = useReducedMotion() ?? false;

  /**
   * "See All" turns the snap scroller into a vertical stack rather than pushing
   * a new screen. The reviews are the payload of this template and a route
   * change to read three more of them is a tax on the only thing the recipient
   * came for.
   */
  const [seeAll, setSeeAll] = useState(false);

  // Published-only in, so an empty array IS "nobody has reviewed this yet".
  const noRatings = reviews.length === 0;

  return (
    <section
      aria-labelledby="reviews-heading"
      style={{ fontFamily: AP.font, marginTop: SECTION_GAP }}
    >
      {/*
        Scoped scrollbar suppression. The row is a touch surface with a visible
        peek of the next card as its affordance; a desktop scrollbar under it
        adds 15px of grey that never goes away.
      */}
      <style>{`.reviews-rail::-webkit-scrollbar{display:none}`}</style>

      <div
        style={{
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          minHeight: TAP,
        }}
      >
        <h2
          id="reviews-heading"
          style={{
            margin: 0,
            fontSize: 19,
            fontWeight: 700,
            lineHeight: 1.2,
            color: AP.ink,
            letterSpacing: "-0.01em",
          }}
        >
          Ratings &amp; Reviews
        </h2>

        {!noRatings && (
          <button
            type="button"
            onClick={() => setSeeAll((v) => !v)}
            aria-expanded={seeAll}
            style={{
              minHeight: TAP,
              display: "inline-flex",
              alignItems: "center",
              flex: "none",
              padding: "0 4px",
              marginRight: -4,
              border: "none",
              background: "transparent",
              color: AP.accent,
              font: "inherit",
              fontSize: 15,
              cursor: "pointer",
              touchAction: "manipulation",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {seeAll ? "Show Less" : "See All"}
          </button>
        )}
      </div>

      {noRatings ? (
        <div style={{ padding: "8px 16px 0" }}>
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: AP.ink,
              letterSpacing: "-0.01em",
            }}
          >
            No Ratings Yet
          </div>
          <p style={{ margin: "6px 0 0", fontSize: 15, lineHeight: 1.47, color: AP.inkSoft }}>
            Nobody has written one. Somebody has to go first.
          </p>
        </div>
      ) : (
        <>
          <div
            style={{
              padding: "10px 16px 0",
              display: "flex",
              alignItems: "flex-start",
              gap: 20,
            }}
          >
            <div style={{ flex: "none" }}>
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 700,
                  lineHeight: 1,
                  color: AP.ink,
                  letterSpacing: "-0.03em",
                }}
              >
                {oneDecimal(rating.average)}
              </div>
              <div style={{ marginTop: 8 }}>
                <StarRating
                  rating={rating.average}
                  size={14}
                  fillColor={STAR_FILL}
                  emptyColor={AP.edge}
                  label={`Average ${oneDecimal(rating.average)} out of 5 stars`}
                />
              </div>
              <div style={{ fontSize: 13, color: AP.inkSoft, marginTop: 6 }}>
                out of 5
              </div>
            </div>

            <div style={{ flex: "1 1 auto", minWidth: 0 }}>
              <Histogram distribution={rating.distribution} reduced={reduced} />
              <div
                style={{
                  fontSize: 13,
                  color: AP.inkSoft,
                  textAlign: "right",
                  marginTop: 8,
                }}
              >
                {rating.count} Ratings
              </div>
            </div>
          </div>

          <div
            className={seeAll ? undefined : "reviews-rail"}
            style={
              seeAll
                ? { display: "flex", flexDirection: "column", gap: 12, padding: "16px 16px 0" }
                : {
                    display: "flex",
                    gap: 12,
                    padding: "16px 16px 0",
                    overflowX: "auto",
                    overflowY: "hidden",
                    scrollSnapType: "x mandatory",
                    scrollPaddingLeft: 16,
                    scrollbarWidth: "none",
                    WebkitOverflowScrolling: "touch",
                  }
            }
          >
            {reviews.map((r, i) => (
              <ReviewCard
                key={r.id}
                review={r}
                index={i}
                stacked={seeAll}
                reduced={reduced}
              />
            ))}
          </div>
        </>
      )}

      <div
        style={{
          padding: "6px 16px 0",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          columnGap: 20,
        }}
      >
        <FootLink onClick={onWriteReview}>Write a Review</FootLink>
        <FootLink
          onClick={() =>
            toast("Support request noted.", {
              description: "Estimated response time: whenever the developer feels like it.",
            })
          }
        >
          App Support
        </FootLink>
      </div>
    </section>
  );
}

export default Reviews;
