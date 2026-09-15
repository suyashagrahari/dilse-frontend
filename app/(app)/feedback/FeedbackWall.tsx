"use client";

// ─── The wall ────────────────────────────────────────────────────────────────
//
// Everything creators said, readable by anybody, signed in or not.
//
// ── THE ORDER THINGS APPEAR IN ──────────────────────────────────────────────
//
// Summary, then filters, then the wall. The summary is first because it is the
// only part that answers the question most people arrive with — "is this any
// good?" — in one glance, and because a filter bar above a number nobody has
// seen yet is chrome in front of the content.
//
// ── WHY THE AVERAGE DOES NOT MOVE WHEN YOU FILTER ───────────────────────────
//
// The stats come from the server over ALL feedback, never the filtered slice.
// An average that becomes 5.0 the moment you tap "5 stars" is not an average,
// it is a tautology, and a summary that agrees with whatever you just clicked
// is worth nothing. The bars are filters; the number above them is the truth
// about the whole body of feedback and stays put.
//
// ── THE BARS ARE THE RATING FILTER ──────────────────────────────────────────
//
// Rather than a row of chips repeating what the bars already show. A
// distribution bar is the one control where the affordance and the data are the
// same object: the row that says "5 stars, 218" IS the button for "show me
// those". Tapping the active one clears it, so there is no dead end and no
// separate All chip to hunt for.
//
// ── ON NAMES AND FACES ──────────────────────────────────────────────────────
//
// A first name and a coloured initial, never a photo and never a surname. The
// server only sends a first name, so this could not show more if it wanted to;
// the initial is drawn here rather than fetched so the wall has no third-party
// image requests, no broken avatars, and one consistent look. Somebody who
// signed up to make a birthday card did not sign up to have their face on a
// marketing page.
//
// ── RESPONSIVE ──────────────────────────────────────────────────────────────
//
// Measured, not assumed: one column to 680, two to 1010, three above that, and
// the container stops at 1240 so three is the ceiling however wide the monitor
// is. A 320px floor rather than 280 is a deliberate typographic choice — 280
// gave four columns of 285px at 1280, and 285px is a cramped measure for a
// paragraph somebody wrote by hand. The summary flips from stacked to side by
// side at 600.
//
// All of it lives in the stylesheet below, never inline: an inline style
// outranks every media query, which is the trap documented at length in
// components/feedback/MascotStage.tsx.

import { useCallback, useMemo, useRef, useState } from "react";
import { User } from "lucide-react";

import { BRAND } from "@/lib/brand";
import {
  fetchPublicFeedback,
  type FeedbackSort,
  type PublicFeedbackItem,
  type PublicFeedbackPage,
} from "@/lib/feedback/publicFeedback";

const PAGE_SIZE = 24;

/** Stable per-name colours, so the same person is the same colour everywhere. */
const AVATAR_TONES = ["#c9a84c", "#a8823a", "#8b5a2b", "#3aa76d", "#6f8fb0", "#c2557a", "#a13540"];

function toneFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) % 100000;
  return AVATAR_TONES[h % AVATAR_TONES.length];
}

/** "2 days ago". Coarse on purpose — an exact timestamp is not the point. */
function whenever(iso: string): string {
  const then = Date.parse(iso);
  if (!Number.isFinite(then)) return "";
  const days = Math.floor((Date.now() - then) / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "last week";
  if (days < 60) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  const years = Math.floor(days / 365);
  return years === 1 ? "a year ago" : `${years} years ago`;
}

function Stars({ value, size = 15 }: { value: number; size?: number }) {
  return (
    <span className="fbStars" aria-label={`${value} out of 5 stars`} style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= value ? "on" : "off"} aria-hidden="true">
          ★
        </span>
      ))}
    </span>
  );
}

export interface FeedbackWallProps {
  /** Server-rendered first page, so the wall has content before any JS runs. */
  initial: PublicFeedbackPage;
}

export default function FeedbackWall({ initial }: FeedbackWallProps) {
  const [sort, setSort] = useState<FeedbackSort>("recent");
  const [rating, setRating] = useState<string>("all");
  const [words, setWords] = useState(false);

  const [page, setPage] = useState<PublicFeedbackPage>(initial);
  const [items, setItems] = useState<PublicFeedbackItem[]>(initial.items);
  const [busy, setBusy] = useState(false);
  const [more, setMore] = useState(false);

  const requestId = useRef(0);

  // ── WHY THE FETCH HANGS OFF THE CONTROLS, NOT OFF AN EFFECT ─────────────
  //
  // The obvious shape is `useEffect(load, [sort, rating, words])`, and it is
  // the one React now lints against: the effect body calls `setBusy(true)`
  // synchronously, which schedules a cascading render on every filter change,
  // and it also has to carry a ref to stop itself re-fetching the page the
  // server already rendered.
  //
  // Changing a filter is a user event, not a synchronisation problem. Every
  // control below routes through here, so the state and the request are set in
  // the same handler and cannot drift — and the server-rendered first page is
  // simply never re-fetched, with no guard needed to say so.
  const apply = useCallback(
    async (next: { sort?: FeedbackSort; rating?: string; words?: boolean }) => {
      const q = {
        sort: next.sort ?? sort,
        rating: next.rating ?? rating,
        words: next.words ?? words,
      };
      if (next.sort !== undefined) setSort(next.sort);
      if (next.rating !== undefined) setRating(next.rating);
      if (next.words !== undefined) setWords(next.words);

      const mine = ++requestId.current;
      setBusy(true);
      const res = await fetchPublicFeedback({ ...q, limit: PAGE_SIZE });
      // A slow earlier request must not overwrite a faster later one.
      if (mine !== requestId.current) return;
      setPage(res);
      setItems(res.items);
      setBusy(false);
    },
    [sort, rating, words]
  );

  const loadMore = useCallback(async () => {
    setMore(true);
    const next = await fetchPublicFeedback({ sort, rating, words, limit: PAGE_SIZE, skip: items.length });
    setItems((prev) => [...prev, ...next.items]);
    setPage((prev) => ({ ...prev, hasMore: next.hasMore }));
    setMore(false);
  }, [sort, rating, words, items.length]);

  const { stats } = page;
  const peak = useMemo(
    () => Math.max(1, ...[1, 2, 3, 4, 5].map((n) => stats.counts[String(n)] ?? 0)),
    [stats]
  );

  const filtered = rating !== "all" || words;

  return (
    <div className="fbWrap">
      {/* ── Summary ──────────────────────────────────────────────────────── */}
      <section className="fbSummary" aria-label="Rating summary">
        <div className="fbScore">
          <div className="fbBig">{stats.total ? stats.average.toFixed(1) : "—"}</div>
          <Stars value={Math.round(stats.average)} size={19} />
          <p className="fbScoreNote">
            {stats.total === 0
              ? "No ratings yet"
              : `${stats.total.toLocaleString("en-IN")} ${stats.total === 1 ? "rating" : "ratings"}`}
          </p>
        </div>

        <div className="fbBars">
          {[5, 4, 3, 2, 1].map((n) => {
            const count = stats.counts[String(n)] ?? 0;
            const active = rating === String(n);
            return (
              <button
                key={n}
                type="button"
                className={`fbBar${active ? " is-active" : ""}`}
                aria-pressed={active}
                // Tapping the active row clears it, so the bars are the whole
                // rating filter and there is nothing to get stuck in.
                onClick={() => void apply({ rating: active ? "all" : String(n) })}
                disabled={count === 0 && !active}
              >
                <span className="fbBarLabel">
                  {n} <span aria-hidden="true">★</span>
                </span>
                <span className="fbBarTrack">
                  <span className="fbBarFill" style={{ width: `${(count / peak) * 100}%` }} />
                </span>
                <span className="fbBarCount">{count}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <div className="fbControls">
        <div className="fbSeg" role="group" aria-label="Sort">
          <button
            type="button"
            className={sort === "recent" ? "is-on" : ""}
            aria-pressed={sort === "recent"}
            onClick={() => void apply({ sort: "recent" })}
          >
            Recent
          </button>
          <button
            type="button"
            className={sort === "rating" ? "is-on" : ""}
            aria-pressed={sort === "rating"}
            onClick={() => void apply({ sort: "rating" })}
          >
            Highest rated
          </button>
        </div>

        <button
          type="button"
          className={`fbToggle${words ? " is-on" : ""}`}
          aria-pressed={words}
          onClick={() => void apply({ words: !words })}
        >
          Only with words
        </button>

        {filtered && (
          <button
            type="button"
            className="fbClear"
            onClick={() => void apply({ rating: "all", words: false })}
          >
            Clear filters
          </button>
        )}

        <span className="fbCount" aria-live="polite">
          {busy ? "Loading…" : `${page.matched.toLocaleString("en-IN")} shown`}
        </span>
      </div>

      {/* ── The wall ─────────────────────────────────────────────────────── */}
      {busy && items.length === 0 ? (
        <div className="fbGrid" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="fbCard fbSkeleton">
              <div className="fbSkLine" style={{ width: "40%" }} />
              <div className="fbSkLine" style={{ width: "92%" }} />
              <div className="fbSkLine" style={{ width: "78%" }} />
              <div className="fbSkLine" style={{ width: "55%" }} />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="fbEmpty">
          <p className="fbEmptyTitle">Nothing here yet</p>
          <p className="fbEmptySub">
            {filtered
              ? "No feedback matches those filters."
              : "The first ratings will show up here as people publish."}
          </p>
        </div>
      ) : (
        <>
          <ul className="fbGrid">
            {items.map((it) => (
              <li key={it.id} className="fbCard">
                <div className="fbCardTop">
                  <Stars value={it.rating} />
                  <span className="fbWhen">{whenever(it.createdAt)}</span>
                </div>

                {it.comment ? (
                  <p className="fbQuote">{it.comment}</p>
                ) : (
                  <p className="fbQuote fbQuiet">Rated {it.rating} out of 5</p>
                )}

                <div className="fbWho">
                  {/* A "?" over a bright colour reads as an error. Somebody
                      whose stored name was not a usable one gets a neutral
                      mark instead — it is not a missing initial, there was
                      simply never a name to show. */}
                  <span
                    className={`fbAvatar${it.name ? "" : " is-anon"}`}
                    style={it.name ? { background: toneFor(it.name) } : undefined}
                    aria-hidden="true"
                  >
                    {it.name ? it.name.charAt(0).toUpperCase() : <User size={14} strokeWidth={2.4} />}
                  </span>
                  <span className="fbName">{it.name || "A creator"}</span>
                  {it.template && <span className="fbChip">{it.template}</span>}
                </div>
              </li>
            ))}
          </ul>

          {page.hasMore && (
            <div className="fbMoreRow">
              <button type="button" className="fbMore" onClick={loadMore} disabled={more}>
                {more ? "Loading…" : "Show more"}
              </button>
            </div>
          )}
        </>
      )}

      <style>{`
        /* The bottom padding clears the fixed BottomNav, which is ~68px tall
           and floats above the page on phones — without this the last row of
           cards sits underneath it and looks cut off. It drops back at 1024,
           where the nav is the top bar instead. */
        .fbWrap { width: 100%; max-width: 1240px; margin: 0 auto; padding: 0 16px 132px }
        @media (min-width: 600px) { .fbWrap { padding: 0 24px 132px } }
        @media (min-width: 1024px) { .fbWrap { padding: 0 32px 88px } }

        /* ── Summary ───────────────────────────────────────────────────────
           Stacked on a phone, side by side from 600. The score column is
           fixed-ish so the bars get every remaining pixel — they are the part
           that carries information at a glance. */
        .fbSummary {
          display: grid;
          gap: 20px;
          padding: 20px;
          border-radius: 20px;
          background: ${BRAND.surface};
          border: 1px solid ${BRAND.border};
          box-shadow: ${BRAND.shadow};
        }
        @media (min-width: 600px) {
          .fbSummary {
            grid-template-columns: minmax(150px, 210px) 1fr;
            align-items: center;
            gap: 32px;
            padding: 26px 30px;
          }
        }

        .fbScore { text-align: center }
        @media (min-width: 600px) {
          .fbScore { border-right: 1px solid ${BRAND.border}; padding-right: 28px }
        }
        .fbBig {
          font-size: 46px;
          line-height: 1;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: ${BRAND.text};
        }
        @media (min-width: 600px) { .fbBig { font-size: 54px } }
        .fbScoreNote { margin: 8px 0 0; font-size: 13px; color: ${BRAND.muted} }

        .fbStars { letter-spacing: 1px; white-space: nowrap; display: inline-block }
        .fbStars .on { color: ${BRAND.gold} }
        .fbStars .off { color: rgba(61,12,17,0.16) }

        /* ── Distribution, which is also the rating filter ─────────────── */
        /* Capped, and left-aligned against the score column. Allowed to take
           the full remaining width, a 1680px monitor draws a metre-long 5-star
           bar, which reads as decoration rather than data. */
        .fbBars { display: flex; flex-direction: column; gap: 7px; max-width: 560px }
        .fbBar {
          display: grid;
          grid-template-columns: 38px 1fr 40px;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 4px 6px;
          border: 1px solid transparent;
          border-radius: 10px;
          background: none;
          cursor: pointer;
          font: inherit;
          color: ${BRAND.muted};
          text-align: left;
          transition: background 140ms ease, border-color 140ms ease;
        }
        .fbBar:hover:not(:disabled) { background: ${BRAND.surfaceAlt} }
        .fbBar:disabled { cursor: default; opacity: 0.55 }
        .fbBar.is-active { border-color: ${BRAND.gold}; background: ${BRAND.surfaceAlt} }
        .fbBar:focus-visible { outline: 2px solid ${BRAND.gold}; outline-offset: 2px }
        .fbBarLabel { font-size: 13px; font-variant-numeric: tabular-nums; color: ${BRAND.text} }
        .fbBarLabel span { color: ${BRAND.gold} }
        .fbBarTrack {
          height: 8px;
          border-radius: 999px;
          background: rgba(61,12,17,0.07);
          overflow: hidden;
        }
        .fbBarFill {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, ${BRAND.gold}, ${BRAND.goldDeep});
          transition: width 420ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .fbBarCount { font-size: 12px; text-align: right; font-variant-numeric: tabular-nums }

        /* ── Controls ──────────────────────────────────────────────────────
           Wraps rather than scrolls: a horizontally scrolling filter bar hides
           its own options, and there are only three here. */
        .fbControls {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
          margin: 22px 0 18px;
        }
        .fbSeg {
          display: inline-flex;
          padding: 3px;
          border-radius: 999px;
          background: ${BRAND.surfaceAlt};
          border: 1px solid ${BRAND.border};
        }
        .fbSeg button {
          border: none;
          background: none;
          font: inherit;
          font-size: 13px;
          font-weight: 600;
          color: ${BRAND.muted};
          padding: 7px 15px;
          border-radius: 999px;
          cursor: pointer;
          transition: background 160ms ease, color 160ms ease;
        }
        .fbSeg button.is-on {
          background: ${BRAND.surface};
          color: ${BRAND.text};
          box-shadow: ${BRAND.shadow};
        }
        .fbSeg button:focus-visible { outline: 2px solid ${BRAND.gold}; outline-offset: 2px }

        .fbToggle, .fbClear, .fbMore {
          font: inherit;
          font-size: 13px;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 999px;
          cursor: pointer;
          border: 1px solid ${BRAND.border};
          background: ${BRAND.surface};
          color: ${BRAND.muted};
          transition: border-color 160ms ease, color 160ms ease, background 160ms ease;
        }
        .fbToggle:hover, .fbClear:hover, .fbMore:hover { border-color: ${BRAND.borderStrong}; color: ${BRAND.text} }
        .fbToggle.is-on { border-color: ${BRAND.gold}; color: ${BRAND.text}; background: ${BRAND.surfaceAlt} }
        .fbClear { border-color: transparent; background: none }
        .fbToggle:focus-visible, .fbClear:focus-visible, .fbMore:focus-visible {
          outline: 2px solid ${BRAND.gold}; outline-offset: 2px;
        }

        .fbCount { margin-left: auto; font-size: 12.5px; color: ${BRAND.faint} }

        /* ── The wall ──────────────────────────────────────────────────────
           auto-fill with a 320px floor: 1 column to 680, 2 to 1010, 3 above,
           capped at 3 by the container. One rule instead of a breakpoint
           ladder that would need keeping in sync with the summary's.
           align-items: start so a short card does not stretch to match a long
           neighbour. */
        .fbGrid {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 14px;
          grid-template-columns: 1fr;
          align-items: start;
        }
        @media (min-width: 600px) {
          .fbGrid { grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px }
        }

        .fbCard {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 18px;
          border-radius: 16px;
          background: ${BRAND.surface};
          border: 1px solid ${BRAND.border};
          box-shadow: ${BRAND.shadow};
        }
        .fbCardTop { display: flex; align-items: center; justify-content: space-between; gap: 10px }
        .fbWhen { font-size: 12px; color: ${BRAND.faint}; white-space: nowrap }

        .fbQuote {
          margin: 0;
          font-size: 14.5px;
          line-height: 1.58;
          color: ${BRAND.text};
          /* Long words and pasted links cannot widen the card past its column. */
          overflow-wrap: anywhere;
        }
        .fbQuiet { color: ${BRAND.faint}; font-style: italic; font-size: 13.5px }

        .fbWho { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 2px }
        .fbAvatar {
          width: 26px; height: 26px;
          flex: none;
          border-radius: 50%;
          display: grid;
          place-items: center;
          color: #fff;
          font-size: 12px;
          font-weight: 700;
        }
        .fbAvatar.is-anon { background: rgba(61,12,17,0.14); color: ${BRAND.muted} }
        .fbName { font-size: 13px; font-weight: 600; color: ${BRAND.text} }
        .fbChip {
          font-size: 11px;
          padding: 3px 9px;
          border-radius: 999px;
          background: ${BRAND.surfaceAlt};
          color: ${BRAND.muted};
          border: 1px solid ${BRAND.border};
        }

        /* ── Skeleton, empty, more ─────────────────────────────────────── */
        .fbSkeleton { gap: 12px }
        .fbSkLine {
          height: 11px;
          border-radius: 6px;
          background: linear-gradient(90deg, rgba(61,12,17,0.06), rgba(61,12,17,0.11), rgba(61,12,17,0.06));
          background-size: 200% 100%;
          animation: fbShimmer 1250ms linear infinite;
        }
        @keyframes fbShimmer { from { background-position: 200% 0 } to { background-position: -200% 0 } }

        .fbEmpty {
          text-align: center;
          padding: 56px 20px;
          border-radius: 16px;
          background: ${BRAND.surface};
          border: 1px dashed ${BRAND.borderStrong};
        }
        .fbEmptyTitle { margin: 0; font-size: 16px; font-weight: 700; color: ${BRAND.text} }
        .fbEmptySub { margin: 6px 0 0; font-size: 13.5px; color: ${BRAND.muted} }

        .fbMoreRow { display: flex; justify-content: center; margin-top: 26px }
        .fbMore { padding: 11px 26px }

        @media (prefers-reduced-motion: reduce) {
          .fbBarFill { transition: none }
          .fbSkLine { animation: none }
        }
      `}</style>
    </div>
  );
}
