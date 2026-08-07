"use client";

// ─── The review section — the actual product ─────────────────────────────────
//
// Everything above this on the page is scaffolding for it. Somebody's friends
// wrote these, one line each, from a link in a group chat, and this block is
// where that arrives.
//
// ── THE STARS DO NOT ROUND ───────────────────────────────────────────────────
// `StarRating` is imported from components/contrib and is the only star widget
// on this page. It fills to the exact fraction: a 4.7 is four stars and seven
// tenths of a fifth, never five. A page that says 4.7 and draws five solid
// stars is a page nobody believes, and once the stars are not believed the
// reviews under them are not believed either.
//
// ── THE ARITHMETIC ───────────────────────────────────────────────────────────
// Mean of PUBLISHED stars only, one decimal, half-up. Histogram percentages are
// per-star counts over the total, floored, with the leftover points handed to
// the largest discarded fractions so the column sums to EXACTLY 100. Zero
// published reviews prints "No ratings yet. Be the first." and hides the
// histogram completely — never 0.0, never five empty bars.
//
// ── ALL-SAME-STAR ────────────────────────────────────────────────────────────
// 100% on one row and a hairline on the other four, not four blank rows. An
// empty track with nothing in it reads as a broken component.

import { useCallback, useMemo, useState } from "react";
import StarRating from "@/components/contrib/StarRating";
import {
  C,
  FONT,
  LinkText,
  SECTION_IDS,
  WRAP,
  avatarColour,
  spokenAverage,
  useCountUp,
  type Aggregate,
} from "./tokens";
import { initialsOf } from "@/lib/contrib/types";
import type { Review } from "./types";

const PAGE_SIZE = 5;
const STAR_ROWS = [5, 4, 3, 2, 1] as const;

export type SortMode = "top" | "recent";

/* ── One review ────────────────────────────────────────────────────────────── */

function ReviewRow({
  review,
  isNew,
  isYours,
}: {
  review: Review;
  isNew: boolean;
  isYours: boolean;
}) {
  const [extra, setExtra] = useState(0);
  const [voted, setVoted] = useState(false);
  const [reported, setReported] = useState(false);
  const helpful = review.helpful + extra;

  return (
    <li
      className={isNew ? "lk-rv lk-rv-new" : "lk-rv"}
      style={{
        listStyle: "none",
        padding: isYours ? "14px" : "16px 0",
        borderTop: isYours ? "none" : `1px solid ${C.border}`,
        border: isYours ? `1px solid ${C.activeEdge}` : undefined,
        borderRadius: isYours ? 8 : undefined,
        background: isYours ? C.activeTint : undefined,
        marginBottom: isYours ? 10 : undefined,
      }}
    >
      {isYours ? (
        <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: C.activeEdge }}>
          Yours — waiting to be approved
        </p>
      ) : null}
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <span
          aria-hidden="true"
          style={{
            width: 30,
            height: 30,
            flex: "none",
            borderRadius: "50%",
            background: avatarColour(review.author),
            color: "#fff",
            display: "grid",
            placeItems: "center",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {initialsOf(review.author)}
        </span>
        <span style={{ fontSize: 13, color: C.text, minWidth: 0, ...WRAP }}>{review.author}</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 7, flexWrap: "wrap" }}>
        <StarRating rating={review.stars} size={15} label={`${review.stars} out of 5 stars`} />
        {review.title ? (
          <span style={{ fontSize: 14, fontWeight: 700, color: C.text, minWidth: 0, ...WRAP }}>
            {review.title}
          </span>
        ) : null}
      </div>

      {review.ago ? (
        <p style={{ margin: "5px 0 0", fontSize: 12, color: C.secondary, ...WRAP }}>{review.ago}</p>
      ) : null}

      {review.verified ? (
        <p style={{ margin: "4px 0 0", fontSize: 12, fontWeight: 700, color: C.priceRed }}>
          Verified Purchase
        </p>
      ) : null}

      <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: "20px", color: C.text, ...WRAP }}>
        {review.body}
      </p>

      {review.imageUrl ? (
        <span
          style={{
            display: "block",
            width: 92,
            height: 92,
            marginTop: 10,
            border: `1px solid ${C.border}`,
            borderRadius: 4,
            overflow: "hidden",
            background: C.section,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={review.imageUrl}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </span>
      ) : null}

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
        {helpful > 0 && (
          <span style={{ fontSize: 12, color: C.secondary }}>
            {helpful} {helpful === 1 ? "person" : "people"} found this helpful
          </span>
        )}
        <button
          type="button"
          disabled={voted}
          onClick={() => {
            setVoted(true);
            setExtra(1);
          }}
          style={{
            minHeight: 29,
            padding: "4px 14px",
            borderRadius: 100,
            border: `1px solid ${C.border}`,
            background: voted ? C.section : "#fff",
            color: voted ? C.secondary : C.text,
            fontFamily: FONT,
            fontSize: 13,
            cursor: voted ? "default" : "pointer",
            boxShadow: voted ? "none" : "0 1px 2px rgba(15,17,17,0.08)",
            touchAction: "manipulation",
          }}
        >
          {voted ? "Marked helpful" : "Helpful"}
        </button>
        {reported ? (
          <span style={{ fontSize: 12, color: C.secondary }} aria-live="polite">
            Reported. Nothing will come of it.
          </span>
        ) : (
          <LinkText onClick={() => setReported(true)} size={12}>
            Report
          </LinkText>
        )}
      </div>
    </li>
  );
}

/* ── Histogram ─────────────────────────────────────────────────────────────── */

function Histogram({
  aggregate,
  filter,
  onFilter,
  animateKey,
  reduced,
}: {
  aggregate: Aggregate;
  filter: number | null;
  onFilter: (star: number | null) => void;
  animateKey: number;
  reduced: boolean;
}) {
  return (
    <div key={animateKey} style={{ display: "grid", gap: 5, marginTop: 12 }}>
      {STAR_ROWS.map((star) => {
        const pct = aggregate.percents[star - 1];
        const on = filter === star;
        return (
          <button
            key={star}
            type="button"
            onClick={() => onFilter(on ? null : star)}
            aria-pressed={on}
            aria-label={`${star} star, ${pct} per cent. ${on ? "Showing only these." : "Show only these."}`}
            style={{
              display: "grid",
              gridTemplateColumns: "52px minmax(0,1fr) 40px",
              alignItems: "center",
              gap: 10,
              width: "100%",
              padding: "2px 4px",
              border: `1px solid ${on ? C.activeEdge : "transparent"}`,
              borderRadius: 6,
              background: on ? C.activeTint : "transparent",
              cursor: "pointer",
              fontFamily: FONT,
              textAlign: "left",
              touchAction: "manipulation",
            }}
          >
            <span style={{ fontSize: 13, color: C.link }}>{star} star</span>
            <span
              style={{
                display: "block",
                height: 20,
                borderRadius: 4,
                background: C.track,
                border: `1px solid ${C.border}`,
                overflow: "hidden",
              }}
            >
              <span
                className={reduced ? undefined : "lk-bar"}
                style={{
                  display: "block",
                  height: "100%",
                  // A zero row keeps a hairline rather than vanishing — five
                  // rows where four are invisible reads as a broken widget.
                  width: pct > 0 ? `${pct}%` : "3px",
                  minWidth: 3,
                  background: C.star,
                  borderRadius: 3,
                }}
              />
            </span>
            <span style={{ fontSize: 13, color: C.text, textAlign: "right" }}>{pct}%</span>
          </button>
        );
      })}
    </div>
  );
}

/* ── The section ───────────────────────────────────────────────────────────── */

export default function Reviews({
  reviews,
  aggregate,
  subjectFirstName,
  contributorPrompt,
  onWriteReview,
  writeReviewLabel = "Write a review",
  arrivedIds,
  reduced,
  pinnedId,
  footer,
}: {
  /** Published only. Ordered oldest → newest; contributed rows are appended. */
  reviews: Review[];
  aggregate: Aggregate;
  subjectFirstName: string;
  contributorPrompt: string;
  onWriteReview: () => void;
  writeReviewLabel?: string;
  arrivedIds: readonly string[];
  reduced: boolean;
  /** Forced to the top of the list, whatever the sort says. The contributor's own. */
  pinnedId?: string;
  /** Anything the caller wants under the list — the collect-more-reviews strip. */
  footer?: React.ReactNode;
}) {
  const [sort, setSort] = useState<SortMode>("top");
  const [filter, setFilter] = useState<number | null>(null);
  const [shown, setShown] = useState(PAGE_SIZE);

  const arrived = useMemo(() => new Set(arrivedIds), [arrivedIds]);

  const ordered = useMemo(() => {
    const withIndex = reviews.map((r, i) => ({ r, i }));
    if (sort === "recent") {
      // The list arrives oldest first — seeded rows, then contributions in
      // arrival order — so "most recent" is that order, reversed.
      withIndex.reverse();
    } else {
      withIndex.sort((a, b) => b.r.helpful - a.r.helpful || b.r.stars - a.r.stars || a.i - b.i);
    }
    const list = withIndex.map((x) => x.r);
    const filtered = filter === null ? list : list.filter((r) => r.stars === filter);
    if (!pinnedId) return filtered;
    // The contributor has just written this one. It goes first, whatever the
    // sort control says — they came back to this page to see it.
    const mine = filtered.find((r) => r.id === pinnedId);
    return mine ? [mine, ...filtered.filter((r) => r.id !== pinnedId)] : filtered;
  }, [reviews, sort, filter, pinnedId]);

  const changeFilter = useCallback((star: number | null) => {
    setFilter(star);
    setShown(PAGE_SIZE);
  }, []);

  const changeSort = useCallback((next: SortMode) => {
    setSort(next);
    setShown(PAGE_SIZE);
  }, []);

  const empty = aggregate.count === 0;

  // Count up on the average and the total whenever a new review lands. Held to
  // the target instantly when the visitor asked for less movement.
  const animatedAvg = useCountUp(aggregate.average, !reduced);
  const animatedCount = useCountUp(aggregate.count, !reduced);

  // Changing this restarts the bar animation. Derived from what is actually on
  // screen, so the bars re-run exactly when the numbers move and never on an
  // unrelated re-render.
  const barsKey = aggregate.percents.reduce((acc, p, i) => acc + p * (i + 1) * 97, aggregate.count);

  return (
    <section
      id={SECTION_IDS.reviews}
      style={{ borderTop: `1px solid ${C.border}`, padding: "20px 0 8px", fontFamily: FONT }}
    >
      <h2 style={{ margin: "0 0 14px", fontSize: 20, fontWeight: 700, color: C.text }}>
        Customer reviews
      </h2>

      <div className="lk-rv-top">
        {/* Aggregate + histogram */}
        <div style={{ minWidth: 0 }}>
          {empty ? (
            <>
              <p style={{ margin: 0, fontSize: 20, color: C.text }}>No ratings yet. Be the first.</p>
              <p style={{ margin: "6px 0 0", fontSize: 13.5, color: C.secondary, ...WRAP }}>
                Nothing has been published on this listing yet. The first line somebody writes about{" "}
                {subjectFirstName} goes right here.
              </p>
            </>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <StarRating
                  rating={animatedAvg}
                  size={22}
                  label={`${spokenAverage(aggregate.average)} out of 5 stars`}
                />
                <span style={{ fontSize: 28, lineHeight: 1.1, color: C.text }}>
                  {spokenAverage(Math.round(animatedAvg * 10) / 10)} out of 5
                </span>
              </div>
              <p style={{ margin: "6px 0 0", fontSize: 13.5, color: C.secondary }} aria-live="polite">
                {Math.round(animatedCount)} global rating{aggregate.count === 1 ? "" : "s"}
              </p>

              <Histogram
                aggregate={aggregate}
                filter={filter}
                onFilter={changeFilter}
                animateKey={barsKey}
                reduced={reduced}
              />

              {filter !== null && (
                <p style={{ margin: "10px 0 0" }}>
                  <LinkText onClick={() => changeFilter(null)} size={13}>
                    Clear the {filter}-star filter — show all {aggregate.count}
                  </LinkText>
                </p>
              )}
            </>
          )}
        </div>

        {/* Review this person */}
        <div style={{ minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: C.text }}>Review this person</h3>
          <p style={{ margin: "8px 0 14px", fontSize: 13.5, lineHeight: 1.55, color: C.secondary, ...WRAP }}>
            {contributorPrompt}
          </p>
          <button
            type="button"
            onClick={onWriteReview}
            style={{
              width: "100%",
              maxWidth: 320,
              minHeight: 31,
              padding: "6px 16px",
              borderRadius: 100,
              border: `1px solid ${C.border}`,
              background: "#fff",
              color: C.text,
              fontFamily: FONT,
              fontSize: 13.5,
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(15,17,17,0.1)",
              touchAction: "manipulation",
            }}
          >
            {writeReviewLabel}
          </button>
        </div>
      </div>

      {/* The list */}
      {!empty && (
        <div style={{ marginTop: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, color: C.secondary }}>
              {filter === null
                ? `Showing ${Math.min(shown, ordered.length)} of ${ordered.length} reviews`
                : `${ordered.length} review${ordered.length === 1 ? "" : "s"} with ${filter} star${filter === 1 ? "" : "s"}`}
            </span>
            <label style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 13, color: C.secondary }}>Sort by</span>
              <select
                value={sort}
                onChange={(e) => changeSort(e.target.value === "recent" ? "recent" : "top")}
                aria-label="Sort reviews"
                style={{
                  fontFamily: FONT,
                  fontSize: 13,
                  color: C.text,
                  padding: "5px 8px",
                  borderRadius: 8,
                  border: `1px solid ${C.border}`,
                  background: C.section,
                  cursor: "pointer",
                }}
              >
                <option value="top">Top reviews</option>
                <option value="recent">Most recent</option>
              </select>
            </label>
          </div>

          {ordered.length === 0 ? (
            <p style={{ margin: "18px 0 0", fontSize: 14, color: C.secondary }}>
              Nobody gave {filter} star{filter === 1 ? "" : "s"}. That is on brand.
            </p>
          ) : (
            <ul style={{ margin: "6px 0 0", padding: 0 }}>
              {ordered.slice(0, shown).map((r) => (
                <ReviewRow key={r.id} review={r} isNew={arrived.has(r.id)} isYours={r.id === pinnedId} />
              ))}
            </ul>
          )}

          {shown < ordered.length && (
            <p style={{ margin: "14px 0 0" }}>
              <LinkText onClick={() => setShown((n) => n + PAGE_SIZE)} size={13.5}>
                See more reviews
              </LinkText>
            </p>
          )}
        </div>
      )}

      {footer ? <div style={{ marginTop: 20 }}>{footer}</div> : null}
    </section>
  );
}

export function ReviewStyles() {
  return (
    <style>{`
      .lk-rv-top { display: grid; gap: 26px; }
      @media (min-width: 900px) {
        .lk-rv-top { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 48px; align-items: start; }
      }

      .lk-bar { animation: lk-bar-grow 520ms cubic-bezier(.22,.68,.36,1) both; transform-origin: left center; }
      @keyframes lk-bar-grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }

      .lk-rv-new { animation: lk-rv-in 420ms ease-out both; }
      @keyframes lk-rv-in {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: none; }
      }

      @media (prefers-reduced-motion: reduce) {
        .lk-bar, .lk-rv-new { animation: none; transform: none; }
      }
    `}</style>
  );
}
