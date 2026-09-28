"use client";

// ─── The wall ────────────────────────────────────────────────────────────────
//
// Everything creators said, readable by anybody, signed in or not.
//
// ── THE ORDER THINGS APPEAR IN ──────────────────────────────────────────────
//
// One maroon hero — who wrote these beside the summary — then the filters,
// then the wall. The summary is first because it is the
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
// separate All chip to hunt for — which is also why the phone layout can drop
// the "Clear filters" button entirely without stranding anybody.
//
// ── WHY "WITH WORDS" STARTS ON ──────────────────────────────────────────────
//
// Most people rate and leave. Open on everything and the first screen is a grid
// of bare stars — a chart drawn as cards, with nothing on it a stranger can
// read. The sentences are the entire value of this page to somebody deciding
// whether to try the product, so they are what the page opens on, and the
// toggle is there to widen it rather than to find it. The server component
// falls back to everything when nothing has been written yet; see the note
// there.
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
// is — a narrower column is a cramped measure for a paragraph somebody wrote by
// hand. The wall is a masonry (CSS columns) so short and long quotes pack
// without holes. The hero flips from stacked to side by side at 900, and the
// filter row is sized to stay on ONE line at 360px.
//
// All of it lives in the stylesheet below, never inline: an inline style
// outranks every media query, which is the trap documented at length in
// components/feedback/MascotStage.tsx. The one inline value here is a
// per-card animation delay, which is not a responsive property and which the
// reduced-motion block neutralises by removing the animation itself.

import { useCallback, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, Heart, MessageSquareQuote, Quote, Sparkles, User } from "lucide-react";

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

/**
 * How long the entrance stagger runs for.
 *
 * Capped at eight cards: past that the delay is longer than anybody waits, and
 * on "Show more" the twenty-fifth card would otherwise arrive a second and a
 * half after the button was pressed, which reads as jank rather than polish.
 */
const STAGGER_MS = 55;
const STAGGER_CAP = 8;

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
  /**
   * Whether that first page was the written-only view. Passed in rather than
   * assumed `true`, so the toggle always agrees with the rows underneath it
   * even on the fallback path where nothing has been written yet.
   */
  initialWords?: boolean;
}

export default function FeedbackWall({ initial, initialWords = true }: FeedbackWallProps) {
  const [sort, setSort] = useState<FeedbackSort>("recent");
  const [rating, setRating] = useState<string>("all");
  const [words, setWords] = useState(initialWords);

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

  // "Clear" is about getting back to the view the page opens on, which now has
  // the words toggle ON — so a switched-off toggle counts as a filter too.
  const filtered = rating !== "all" || !words;

  return (
    <div className="fbWrap">
      {/* ── Hero: who wrote these, and the summary ─────────────────────────
          One maroon card instead of a centred headline over a separate white
          summary box: the claim ("real people, unedited") and the evidence
          (the average and every star, low ones included) sit side by side,
          which is the whole argument of the page in one glance. */}
      <section className="fbHero" aria-label="Rating summary">
        <span className="fbHeroShine" aria-hidden="true" />
        <span className="fbHeroOrb" aria-hidden="true" />
        <span className="fbHeroSpark s1" aria-hidden="true">✦</span>
        <span className="fbHeroSpark s2" aria-hidden="true">♥</span>
        <span className="fbHeroSpark s3" aria-hidden="true">✦</span>

        <div className="fbHeroCopy">
          <p className="fbBadge">
            <span className="fbBadgeDot" aria-hidden="true" />
            Real reviews from real creators
          </p>
          <h1 className="fbTitle">
            What creators <em>say</em>
          </h1>
          <p className="fbLead">
            Every review here was written by somebody who actually made a page and sent it to someone
            they love. We don&rsquo;t edit them, and we don&rsquo;t hide the low ones.
          </p>
          <ul className="fbTrust">
            <li><Check size={13} strokeWidth={3} aria-hidden="true" /> Real creators</li>
            <li><Check size={13} strokeWidth={3} aria-hidden="true" /> Unedited</li>
            <li><Check size={13} strokeWidth={3} aria-hidden="true" /> No sign-in needed</li>
          </ul>
        </div>

        <div className="fbScoreCard">
          <div className="fbScore">
            <div className="fbBig">
              {stats.total ? stats.average.toFixed(1) : "—"}
              <span className="fbBigOf">/5</span>
            </div>
            <div className="fbScoreMeta">
              <Stars value={Math.round(stats.average)} size={20} />
              <p className="fbScoreNote">
                {stats.total === 0
                  ? "No ratings yet"
                  : `from ${stats.total.toLocaleString("en-IN")} ${stats.total === 1 ? "rating" : "ratings"}`}
              </p>
            </div>
          </div>

          <div className="fbBars">
            {[5, 4, 3, 2, 1].map((n, i) => {
              const count = stats.counts[String(n)] ?? 0;
              const active = rating === String(n);
              return (
                <button
                  key={n}
                  type="button"
                  className={`fbBar${active ? " is-active" : ""}`}
                  aria-pressed={active}
                  aria-label={`${n} star ratings: ${count}`}
                  // Tapping the active row clears it, so the bars are the whole
                  // rating filter and there is nothing to get stuck in.
                  onClick={() => void apply({ rating: active ? "all" : String(n) })}
                  disabled={count === 0 && !active}
                >
                  <span className="fbBarLabel">
                    {n} <span aria-hidden="true">★</span>
                  </span>
                  <span className="fbBarTrack">
                    <span
                      className="fbBarFill"
                      style={{ width: `${(count / peak) * 100}%`, animationDelay: `${120 + i * 70}ms` }}
                    />
                  </span>
                  <span className="fbBarCount">{count}</span>
                </button>
              );
            })}
            <p className="fbBarsHint">Tap a row to see only those reviews</p>
          </div>
        </div>
      </section>

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <div className="fbControls">
        <div className="fbSeg" role="group" aria-label="Sort">
          {(["recent", "rating"] as const).map((k) => (
            <button
              key={k}
              type="button"
              className={sort === k ? "is-on" : ""}
              aria-pressed={sort === k}
              onClick={() => void apply({ sort: k })}
            >
              {sort === k && (
                <motion.span
                  layoutId="fb-seg-pill"
                  className="fbSegPill"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="fbSegLabel">{k === "recent" ? "Recent" : "Top rated"}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          className={`fbToggle${words ? " is-on" : ""}`}
          aria-pressed={words}
          aria-label="Show only feedback that includes written words"
          onClick={() => void apply({ words: !words })}
        >
          <span className="fbSwitch" aria-hidden="true">
            <span className="fbKnob" />
          </span>
          With words
        </button>

        {/* Desktop only. On a phone the row has to stay on one line, and the
            bars already clear themselves on a second tap. */}
        {filtered && (
          <button
            type="button"
            className="fbClear"
            onClick={() => void apply({ rating: "all", words: true, sort: "recent" })}
          >
            Clear filters
          </button>
        )}

        <span className="fbCount" aria-live="polite">
          {busy ? (
            <span className="fbSpin" aria-hidden="true" />
          ) : (
            <MessageSquareQuote size={13} aria-hidden="true" />
          )}
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
          <span className="fbEmptyIc" aria-hidden="true">
            <Sparkles size={22} />
          </span>
          <p className="fbEmptyTitle">Nothing here yet</p>
          <p className="fbEmptySub">
            {filtered
              ? "No feedback matches those filters."
              : "The first ratings will show up here as people publish."}
          </p>
        </div>
      ) : (
        <>
          <ul className={`fbGrid${busy ? " is-busy" : ""}`}>
            {items.map((it, i) => (
              <li
                key={it.id}
                // `is-quiet` rather than a line of apologetic italics where the
                // quote would be. Somebody who rated without writing did not
                // leave a gap to explain away; the card is simply shorter and
                // a shade flatter, which reads as a rating rather than as a
                // review that failed to load.
                className={`fbCard${it.comment ? "" : " is-quiet"}${it.rating === 5 ? " is-loved" : ""}`}
                style={{ animationDelay: `${Math.min(i, STAGGER_CAP) * STAGGER_MS}ms` }}
              >
                <div className="fbCardTop">
                  <span className="fbRate">
                    <Stars value={it.rating} />
                    <b>{it.rating}.0</b>
                  </span>
                  {it.rating === 5 ? (
                    <span className="fbLoved">
                      <Heart size={11} fill="currentColor" aria-hidden="true" /> Loved it
                    </span>
                  ) : (
                    <span className="fbWhen">{whenever(it.createdAt)}</span>
                  )}
                </div>

                {it.comment && (
                  <blockquote className="fbQuote">
                    <Quote className="fbQuoteMark" size={18} aria-hidden="true" />
                    {it.comment}
                  </blockquote>
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
                  <span className="fbWhoText">
                    <span className="fbName">{it.name || "A creator"}</span>
                    {it.rating === 5 && <span className="fbWhoWhen">{whenever(it.createdAt)}</span>}
                  </span>
                  {it.template && <span className="fbChip">{it.template}</span>}
                </div>
              </li>
            ))}
          </ul>

          {page.hasMore && (
            <div className="fbMoreRow">
              <button type="button" className="fbMore" onClick={loadMore} disabled={more}>
                {more ? <span className="fbSpin" aria-hidden="true" /> : <Sparkles size={15} aria-hidden="true" />}
                {more ? "Loading…" : "Show more reviews"}
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
        .fbWrap { width: 100%; max-width: 1240px; margin: 0 auto; padding: 14px 14px 132px }
        @media (min-width: 600px) { .fbWrap { padding: 22px 24px 132px } }
        /* 768, not 1024: the desktop nav is a fixed pill drawn OVER the page
           from Tailwind's md breakpoint, and its lower edge sits at 74px. */
        @media (min-width: 768px) { .fbWrap { padding-top: 92px } }
        @media (min-width: 1024px) { .fbWrap { padding: 92px 32px 88px } }

        /* ── Hero ──────────────────────────────────────────────────────────
           Stacked on a phone; copy and score side by side from 900. */
        .fbHero {
          position: relative;
          overflow: hidden;
          display: grid;
          gap: 18px;
          padding: 20px 16px 16px;
          border-radius: 24px;
          color: #f5ede6;
          background: radial-gradient(120% 140% at 0% 0%, #6b1a22 0%, #3d0c11 55%, #240609 100%);
          box-shadow: ${BRAND.shadowElevated};
          animation: fbRise 600ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @media (min-width: 600px) { .fbHero { padding: 28px 28px 24px } }
        @media (min-width: 900px) {
          .fbHero { grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); align-items: center; gap: 32px; padding: 34px 36px }
        }
        .fbHeroShine {
          position: absolute; top: -60px; bottom: -60px; width: 80px; pointer-events: none;
          background: linear-gradient(90deg, transparent, rgba(255,236,190,0.14), transparent);
          animation: fbShine 6s ease-in-out infinite;
        }
        @keyframes fbShine { from { transform: translateX(-160%) rotate(12deg) } to { transform: translateX(1600%) rotate(12deg) } }
        .fbHeroOrb {
          position: absolute; right: -90px; top: -110px; width: 320px; height: 320px; border-radius: 50%; pointer-events: none;
          background: radial-gradient(circle, rgba(201,168,76,0.26), transparent 65%);
        }
        .fbHeroSpark { position: absolute; color: #ffe3a3; opacity: 0.5; pointer-events: none; animation: fbFloat 5s ease-in-out infinite }
        .fbHeroSpark.s1 { top: 18px; right: 22px; font-size: 14px }
        .fbHeroSpark.s2 { bottom: 20px; left: 46%; font-size: 12px; color: #ffb3c4; animation-delay: 1.2s }
        .fbHeroSpark.s3 { top: 46%; left: 10px; font-size: 10px; animation-delay: 2.4s }
        @keyframes fbFloat { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }

        .fbHeroCopy { position: relative; min-width: 0; text-align: left }
        .fbBadge {
          display: inline-flex; align-items: center; gap: 8px; margin: 0 0 12px;
          padding: 6px 13px 6px 10px; border-radius: 999px;
          background: rgba(255,227,163,0.12); border: 1px solid rgba(255,227,163,0.3);
          font-size: 11.5px; font-weight: 700; letter-spacing: 0.04em; color: #ffe3a3;
        }
        .fbBadgeDot {
          width: 7px; height: 7px; flex: none; border-radius: 50%; background: #7ddc96;
          animation: fbPulse 2400ms ease-out infinite;
        }
        @keyframes fbPulse {
          0%   { box-shadow: 0 0 0 0 rgba(125,220,150,0.6) }
          70%  { box-shadow: 0 0 0 7px rgba(125,220,150,0) }
          100% { box-shadow: 0 0 0 0 rgba(125,220,150,0) }
        }
        .fbTitle {
          margin: 0; font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(30px, 7vw, 50px); line-height: 1.04; font-weight: 800; letter-spacing: -0.02em; color: #fff6e6;
        }
        .fbTitle em { font-style: italic; color: #ffe3a3 }
        .fbLead { margin: 12px 0 0; max-width: 52ch; font-size: 14px; line-height: 1.6; color: rgba(255,236,210,0.82) }
        @media (min-width: 600px) { .fbLead { font-size: 15px } }
        .fbTrust { list-style: none; display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0 0; padding: 0 }
        .fbTrust li {
          display: inline-flex; align-items: center; gap: 5px; white-space: nowrap;
          padding: 5px 11px 5px 9px; border-radius: 999px; font-size: 12px; font-weight: 700;
          background: rgba(255,255,255,0.07); border: 1px solid rgba(255,236,190,0.16); color: #f5e6d6;
        }
        .fbTrust li svg { color: #7ddc96 }

        /* The score card: glass on maroon. */
        .fbScoreCard {
          position: relative; min-width: 0; display: grid; gap: 14px;
          padding: 16px; border-radius: 18px;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,236,190,0.16);
          backdrop-filter: blur(6px);
        }
        @media (min-width: 600px) { .fbScoreCard { grid-template-columns: auto minmax(0,1fr); align-items: center; gap: 22px; padding: 20px 22px } }
        .fbScore { display: flex; align-items: center; gap: 14px }
        @media (min-width: 600px) {
          .fbScore { display: block; text-align: center; padding-right: 22px; border-right: 1px solid rgba(255,236,190,0.16) }
        }
        .fbBig {
          font-family: 'Playfair Display', Georgia, serif; font-size: 50px; line-height: 1; font-weight: 800;
          letter-spacing: -0.02em; color: #ffe3a3; text-shadow: 0 6px 24px rgba(255,210,120,0.35);
        }
        .fbBigOf { font-size: 16px; font-weight: 700; color: rgba(255,236,210,0.6); margin-left: 3px; font-family: inherit }
        @media (min-width: 600px) { .fbBig { font-size: 58px } }
        .fbScoreMeta { min-width: 0 }
        .fbScoreNote { margin: 6px 0 0; font-size: 12.5px; color: rgba(255,236,210,0.72) }

        .fbStars { letter-spacing: 1.5px; white-space: nowrap; display: inline-block }
        .fbStars .on { color: ${BRAND.gold}; text-shadow: 0 1px 1px rgba(168,130,58,0.28) }
        .fbStars .off { color: rgba(61,12,17,0.16) }
        .fbHero .fbStars .on { color: #ffd66b; text-shadow: 0 0 10px rgba(255,214,107,0.45) }
        .fbHero .fbStars .off { color: rgba(255,236,190,0.22) }

        /* ── Distribution, which is also the rating filter ─────────────── */
        .fbBars { display: flex; flex-direction: column; gap: 3px; min-width: 0 }
        .fbBar {
          display: grid; grid-template-columns: 30px minmax(0,1fr) 30px; align-items: center; gap: 10px;
          width: 100%; padding: 4px 6px; border: 1px solid transparent; border-radius: 10px;
          background: none; cursor: pointer; font: inherit; color: rgba(255,236,210,0.75); text-align: left;
          transition: background 140ms ease, border-color 140ms ease, transform 140ms ease;
        }
        .fbBar:hover:not(:disabled) { background: rgba(255,255,255,0.07); transform: translateX(2px) }
        .fbBar:disabled { cursor: default; opacity: 0.45 }
        .fbBar.is-active { border-color: rgba(255,227,163,0.7); background: rgba(255,227,163,0.12) }
        .fbBar:focus-visible { outline: 2px solid #ffe3a3; outline-offset: 2px }
        .fbBarLabel { font-size: 12.5px; font-weight: 700; font-variant-numeric: tabular-nums; color: #fff6e6 }
        .fbBarLabel span { color: #ffd66b }
        .fbBarTrack { height: 8px; border-radius: 999px; background: rgba(255,255,255,0.1); overflow: hidden }
        .fbBarFill {
          display: block; height: 100%; border-radius: inherit;
          background: linear-gradient(90deg, #c9a84c, #ffe3a3);
          box-shadow: 0 0 12px rgba(255,214,107,0.35);
          transform-origin: left;
          animation: fbGrow 800ms cubic-bezier(0.22, 1, 0.36, 1) both;
          transition: width 420ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        @keyframes fbGrow { from { transform: scaleX(0) } to { transform: scaleX(1) } }
        .fbBarCount { font-size: 12px; font-weight: 700; text-align: right; font-variant-numeric: tabular-nums }
        .fbBarsHint { margin: 4px 6px 0; font-size: 10.5px; color: rgba(255,236,210,0.5) }

        /* ── Controls ──────────────────────────────────────────────────────
           ONE line on a phone: sort + switch + count fit a 360px viewport;
           below 400px the count drops out first, because the cards underneath
           already tell you. */
        .fbControls { display: flex; flex-wrap: nowrap; align-items: center; gap: 8px; margin: 16px 0 14px }
        @media (min-width: 600px) { .fbControls { flex-wrap: wrap; gap: 10px; margin: 22px 0 18px } }
        .fbSeg {
          display: inline-flex; flex: none; padding: 3px; border-radius: 999px;
          background: ${BRAND.surface}; border: 1px solid ${BRAND.border}; box-shadow: ${BRAND.shadow};
        }
        .fbSeg button {
          position: relative; border: none; background: none; font: inherit; font-size: 12.5px; font-weight: 700;
          color: ${BRAND.muted}; padding: 7px 13px; border-radius: 999px; cursor: pointer; white-space: nowrap;
          transition: color 180ms ease;
        }
        @media (min-width: 600px) { .fbSeg button { font-size: 13px; padding: 8px 16px } }
        .fbSeg button.is-on { color: #fff6e6 }
        .fbSegPill { position: absolute; inset: 0; border-radius: 999px; background: ${BRAND.gradient}; box-shadow: 0 6px 14px -6px rgba(61,12,17,0.7) }
        .fbSegLabel { position: relative; z-index: 1 }
        .fbSeg button:focus-visible { outline: 2px solid ${BRAND.gold}; outline-offset: 2px }

        .fbToggle, .fbClear, .fbMore {
          font: inherit; font-size: 12.5px; font-weight: 700; padding: 7px 13px 7px 8px; border-radius: 999px; cursor: pointer;
          border: 1px solid ${BRAND.border}; background: ${BRAND.surface}; color: ${BRAND.muted}; white-space: nowrap;
          box-shadow: ${BRAND.shadow};
          transition: border-color 160ms ease, color 160ms ease, background 160ms ease, transform 160ms ease;
        }
        @media (min-width: 600px) { .fbToggle, .fbClear, .fbMore { font-size: 13px; padding: 8px 16px 8px 9px } }
        .fbToggle { display: inline-flex; align-items: center; gap: 8px; flex: none }
        /* The switch is the state: knob right and maroon when words-only is on. */
        .fbSwitch {
          position: relative; width: 30px; height: 18px; flex: none; border-radius: 99px;
          background: rgba(61,12,17,0.14); transition: background 200ms ease;
        }
        .fbKnob {
          position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; border-radius: 50%; background: #fff;
          box-shadow: 0 1px 3px rgba(0,0,0,0.25); transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .fbToggle.is-on { border-color: rgba(201,168,76,0.55); color: ${BRAND.text} }
        .fbToggle.is-on .fbSwitch { background: ${BRAND.gradient} }
        .fbToggle.is-on .fbKnob { transform: translateX(12px); background: #ffe3a3 }
        .fbToggle:hover, .fbClear:hover, .fbMore:hover { border-color: ${BRAND.borderStrong}; color: ${BRAND.text}; transform: translateY(-1px) }
        .fbClear { display: none; border-color: transparent; background: none; box-shadow: none; padding-left: 12px }
        @media (min-width: 600px) { .fbClear { display: inline-block } }
        .fbToggle:focus-visible, .fbClear:focus-visible, .fbMore:focus-visible { outline: 2px solid ${BRAND.gold}; outline-offset: 2px }

        .fbCount { margin-left: auto; display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600; color: ${BRAND.faint}; white-space: nowrap }
        @media (max-width: 399px) { .fbCount { display: none } }
        .fbSpin {
          width: 12px; height: 12px; border-radius: 50%; border: 2px solid rgba(61,12,17,0.15); border-top-color: ${BRAND.gold};
          animation: fbSpin 800ms linear infinite; display: inline-block;
        }
        @keyframes fbSpin { to { transform: rotate(360deg) } }

        /* ── The wall ──────────────────────────────────────────────────────
           A masonry of quotes: CSS columns, so a two-line review does not leave
           a hole beside a ten-line one. 1 column on a phone, 2 from 680, 3
           from 1010, capped at 3 by the container. */
        .fbGrid { list-style: none; margin: 0; padding: 0; columns: 1; column-gap: 14px; transition: opacity 200ms ease }
        .fbGrid.is-busy { opacity: 0.55 }
        @media (min-width: 680px) { .fbGrid { columns: 2; column-gap: 16px } }
        @media (min-width: 1010px) { .fbGrid { columns: 3 } }

        /* ── The card ──────────────────────────────────────────────────────
           Warm paper, a gold quote mark, a maroon-to-gold hairline that draws
           itself on hover, a sheen sweep and a staggered rise on entry. The
           lift is behind "hover: hover" so a phone tap does not stick. */
        .fbCard {
          position: relative; overflow: hidden; break-inside: avoid; display: flex; flex-direction: column; gap: 11px;
          margin: 0 0 14px; padding: 16px 16px 14px; border-radius: 20px;
          background: linear-gradient(180deg, #fffdfb 0%, #fff6ee 100%);
          border: 1px solid ${BRAND.border};
          box-shadow: 0 1px 0 rgba(61,12,17,0.03), 0 10px 24px -18px rgba(61,12,17,0.4);
          animation: fbRise 560ms cubic-bezier(0.22, 1, 0.36, 1) backwards;
          transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 260ms ease, border-color 260ms ease;
        }
        @media (min-width: 680px) { .fbCard { margin-bottom: 16px; padding: 18px 18px 15px } }
        .fbCard::before {
          content: ""; position: absolute; left: 0; right: 0; top: 0; height: 3px;
          background: linear-gradient(90deg, #3d0c11, #c9a84c, #ffe3a3);
          transform: scaleX(0); transform-origin: left; transition: transform 380ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .fbCard::after {
          content: ""; position: absolute; top: 0; bottom: 0; left: -45%; width: 35%; pointer-events: none;
          background: linear-gradient(100deg, transparent, rgba(255,236,190,0.45), transparent); transform: skewX(-14deg); opacity: 0;
        }
        /* 5★: a warm gold edge, so the loved ones glow a little. */
        .fbCard.is-loved { border-color: rgba(201,168,76,0.32); background: linear-gradient(180deg, #fffdf8 0%, #fff3e2 100%) }
        @media (hover: hover) {
          .fbCard:hover { transform: translateY(-5px); border-color: rgba(201,168,76,0.6); box-shadow: 0 22px 40px -20px rgba(61,12,17,0.5) }
          .fbCard:hover::before { transform: scaleX(1) }
          .fbCard:hover::after { opacity: 1; left: 130%; transition: left 800ms ease, opacity 200ms ease }
          .fbCard:hover .fbAvatar { transform: scale(1.1) rotate(-6deg) }
          .fbCard:hover .fbQuoteMark { transform: scale(1.15) rotate(-8deg) }
        }
        @keyframes fbRise { from { opacity: 0; transform: translateY(16px) scale(0.98) } to { opacity: 1; transform: none } }

        /* A rating with no words: shorter, flatter, no quote. */
        .fbCard.is-quiet { gap: 12px; padding: 14px 16px; background: linear-gradient(180deg, ${BRAND.surface} 0%, ${BRAND.surfaceAlt} 100%) }

        .fbCardTop { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; gap: 10px }
        .fbRate { display: inline-flex; align-items: center; gap: 7px }
        .fbRate b { font-size: 11.5px; font-weight: 800; color: #8b5a2b; padding: 2px 7px; border-radius: 99px; background: rgba(201,168,76,0.14) }
        .fbWhen { font-size: 11.5px; color: ${BRAND.faint}; white-space: nowrap }
        .fbLoved {
          display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 99px; white-space: nowrap;
          font-size: 10.5px; font-weight: 800; letter-spacing: 0.02em; color: #fff6e6; background: ${BRAND.gradient};
          box-shadow: 0 4px 10px -4px rgba(61,12,17,0.6);
        }
        .fbLoved svg { color: #ff8fa8 }

        .fbQuote {
          position: relative; z-index: 1; margin: 0; padding-left: 26px;
          font-size: 14.5px; line-height: 1.62; font-weight: 500; color: ${BRAND.text};
          /* Long words and pasted links cannot widen the card past its column. */
          overflow-wrap: anywhere;
        }
        @media (min-width: 680px) { .fbQuote { font-size: 15px } }
        .fbQuoteMark {
          position: absolute; left: 0; top: 2px; color: ${BRAND.gold}; fill: rgba(201,168,76,0.22);
          transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .fbWho {
          position: relative; z-index: 1; display: flex; align-items: center; gap: 9px; flex-wrap: wrap;
          margin-top: 2px; padding-top: 11px; border-top: 1px dashed ${BRAND.border};
        }
        .fbCard.is-quiet .fbWho { border-top: none; padding-top: 0 }
        .fbAvatar {
          width: 30px; height: 30px; flex: none; border-radius: 50%; display: grid; place-items: center;
          color: #fff; font-size: 12.5px; font-weight: 800;
          box-shadow: 0 0 0 2px #fffdfb, 0 0 0 3.5px rgba(201,168,76,0.55);
          transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .fbAvatar.is-anon { background: rgba(61,12,17,0.14); color: ${BRAND.muted} }
        .fbWhoText { display: flex; flex-direction: column; min-width: 0; line-height: 1.2 }
        .fbName { font-size: 13px; font-weight: 800; color: ${BRAND.text} }
        .fbWhoWhen { font-size: 11px; color: ${BRAND.faint}; margin-top: 1px }
        .fbChip {
          margin-left: auto; max-width: 60%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          font-size: 10.5px; font-weight: 800; padding: 3px 9px; border-radius: 999px;
          background: rgba(61,12,17,0.06); color: #5a1520; border: 1px solid rgba(61,12,17,0.1);
        }

        /* ── Skeleton, empty, more ─────────────────────────────────────── */
        .fbSkeleton { gap: 12px; animation: none }
        .fbSkeleton::before, .fbSkeleton::after { content: none }
        .fbSkLine {
          height: 11px; border-radius: 6px;
          background: linear-gradient(90deg, rgba(61,12,17,0.06), rgba(61,12,17,0.11), rgba(61,12,17,0.06));
          background-size: 200% 100%; animation: fbShimmer 1250ms linear infinite;
        }
        @keyframes fbShimmer { from { background-position: 200% 0 } to { background-position: -200% 0 } }

        .fbEmpty {
          text-align: center; padding: 50px 20px; border-radius: 20px;
          background: linear-gradient(180deg, #fffdfb, #fff6ee); border: 1px dashed ${BRAND.borderStrong};
        }
        .fbEmptyIc { width: 50px; height: 50px; margin: 0 auto 10px; border-radius: 16px; display: grid; place-items: center; color: #ffe3a3; background: ${BRAND.gradient} }
        .fbEmptyTitle { margin: 0; font-size: 16px; font-weight: 800; color: ${BRAND.text} }
        .fbEmptySub { margin: 6px 0 0; font-size: 13.5px; color: ${BRAND.muted} }

        .fbMoreRow { display: flex; justify-content: center; margin-top: 18px }
        .fbMore {
          display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; border: none;
          color: #fff6e6; background: ${BRAND.gradient}; box-shadow: 0 12px 26px -12px rgba(61,12,17,0.7);
        }
        .fbMore:hover { color: #fff; transform: translateY(-2px) }
        .fbMore svg { color: #ffe3a3 }
        .fbMore .fbSpin { border-color: rgba(255,255,255,0.25); border-top-color: #ffe3a3 }

        @media (prefers-reduced-motion: reduce) {
          .fbHero, .fbCard, .fbBarFill { animation: none }
          .fbHeroShine, .fbHeroSpark, .fbBadgeDot, .fbSkLine { animation: none }
          .fbCard, .fbAvatar, .fbKnob, .fbSwitch, .fbQuoteMark, .fbCard::before { transition: none }
        }
      `}</style>
    </div>
  );
}
