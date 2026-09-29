"use client";

// ─── Customer reviews — histogram, "Customers say", the review list ──────────
//
// Laid out the way the real page is: on a desktop a narrow left column with
// the average, the five-bar histogram and "Review this product", and a wide
// right column with the AI-style "Customers say" summary, the photo strip and
// "Top reviews from India". On a phone the same blocks stack.
//
// ── THE STARS DO NOT ROUND ───────────────────────────────────────────────────
// StarRating fills to the exact fraction. Mean of PUBLISHED stars only; the
// histogram percentages sum to exactly 100 (see aggregateOf in ./tokens).

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { C, FONT, SECTION_IDS, WRAP, spokenAverage, useCountUp, type Aggregate } from "./tokens";
import type { PhotoCrop, Review } from "./types";
import { Framed } from "./Gallery";
import { Stars } from "./Details";
import { IconCheck, IconCheckCircle, IconSparkle, IconUser } from "./icons";

const PAGE_SIZE = 5;
const STAR_ROWS = [5, 4, 3, 2, 1] as const;

export type SortMode = "top" | "recent";

/** Which gallery photos a seeded review borrows, by position. */
function photosForReview(i: number, total: number): number[] {
  const want = i === 0 ? [1, 2] : i === 2 ? [3] : i === 3 ? [4] : [];
  return want.filter((k) => k < total);
}

function useSeen<T extends Element>(): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    if (typeof IntersectionObserver === "undefined") {
      const t = window.setTimeout(() => setSeen(true), 0);
      return () => window.clearTimeout(t);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);
  return [ref, seen];
}

/* ── One review ────────────────────────────────────────────────────────────── */

function ReviewCard({
  review,
  isNew,
  isYours,
  variantLine,
  photos,
  onPhoto,
}: {
  review: Review;
  isNew: boolean;
  isYours: boolean;
  variantLine: string;
  photos: { src: string; crop?: PhotoCrop; index: number }[];
  onPhoto: (index: number) => void;
}) {
  const [voted, setVoted] = useState(false);
  const [reported, setReported] = useState(false);
  const [open, setOpen] = useState(false);
  const helpful = review.helpful + (voted ? 1 : 0);
  const long = review.body.length > 320;

  return (
    <li className={`lk-rv${isNew ? " lk-rv-new" : ""}${isYours ? " lk-rv-yours" : ""}`}>
      {isYours ? <p className="lk-rv-flag">Yours — waiting to be approved</p> : null}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span className="lk-rv-avatar" aria-hidden="true">
          <IconUser size={20} color="#fff" />
        </span>
        <span style={{ fontSize: 13, color: C.text, minWidth: 0, ...WRAP }}>{review.author}</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
        <Stars value={review.stars} size={15} />
        {review.title ? <span style={{ fontSize: 14, fontWeight: 700, color: C.text, minWidth: 0, ...WRAP }}>{review.title}</span> : null}
      </div>

      {review.ago ? <p style={{ margin: "6px 0 0", fontSize: 13, color: C.secondary, ...WRAP }}>{review.ago}</p> : null}

      <p style={{ margin: "4px 0 0", fontSize: 12, color: C.secondary }}>
        {variantLine ? <span>{variantLine}</span> : null}
        {variantLine && review.verified ? <span style={{ margin: "0 6px", color: C.border }}>|</span> : null}
        {review.verified ? <span style={{ fontWeight: 700, color: C.verified }}>Verified Purchase</span> : null}
      </p>

      {review.body ? (
        <p className={`lk-rv-body${long && !open ? " lk-rv-clip" : ""}`}>{review.body}</p>
      ) : null}
      {long ? (
        <button type="button" className="lk-link" style={{ fontSize: 13, marginTop: 2 }} onClick={() => setOpen((v) => !v)}>
          {open ? "Read less" : "Read more"}
        </button>
      ) : null}

      {photos.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          {photos.map((p) => (
            <button key={p.index} type="button" className="lk-rv-photo" onClick={() => onPhoto(p.index)} aria-label="Open customer photo">
              <Framed src={p.src} crop={p.crop} alt="" />
            </button>
          ))}
        </div>
      )}

      {helpful > 0 ? (
        <p style={{ margin: "10px 0 0", fontSize: 13, color: C.secondary }}>
          {helpful === 1 ? "One person found this helpful" : `${helpful.toLocaleString("en-IN")} people found this helpful`}
        </p>
      ) : null}

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 8, flexWrap: "wrap" }}>
        {voted ? (
          <span className="lk-rv-thanks">
            <IconCheck size={14} color={C.okGreen} /> Thank you for your feedback.
          </span>
        ) : (
          <button type="button" className="lk-helpful" onClick={() => setVoted(true)}>
            Helpful
          </button>
        )}
        <span style={{ color: C.border }}>|</span>
        <button type="button" className="lk-link" style={{ fontSize: 13, color: C.secondary }} onClick={() => setReported(true)} disabled={reported}>
          {reported ? "Reported. (We read it. We agreed with the review.)" : "Report"}
        </button>
      </div>
    </li>
  );
}

/* ── The section ───────────────────────────────────────────────────────────── */

export default function Reviews({
  reviews,
  aggregate,
  subjectFirstName,
  contributorPrompt,
  onWriteReview,
  writeReviewLabel = "Write a product review",
  arrivedIds,
  reduced,
  pinnedId,
  footer,
  customersSay,
  customersSayTags,
  variantLabel,
  variants,
  photos,
  crops,
  onPhoto,
}: {
  reviews: Review[];
  aggregate: Aggregate;
  subjectFirstName: string;
  contributorPrompt: string;
  onWriteReview: () => void;
  writeReviewLabel?: string;
  arrivedIds: readonly string[];
  reduced: boolean;
  pinnedId?: string;
  footer?: React.ReactNode;
  customersSay: string;
  customersSayTags: string[];
  variantLabel: string;
  variants: string[];
  photos: string[];
  crops: PhotoCrop[];
  onPhoto: (index: number) => void;
}) {
  const [sort, setSort] = useState<SortMode>("top");
  const [filter, setFilter] = useState<number | null>(null);
  const [shown, setShown] = useState(PAGE_SIZE);
  const [tag, setTag] = useState<string | null>(null);
  const [histRef, seen] = useSeen<HTMLDivElement>();

  const arrived = useMemo(() => new Set(arrivedIds), [arrivedIds]);
  const seedIndex = useMemo(() => new Map(reviews.map((r, i) => [r.id, i])), [reviews]);

  const ordered = useMemo(() => {
    const withIndex = reviews.map((r, i) => ({ r, i }));
    if (sort === "recent") withIndex.reverse();
    else withIndex.sort((a, b) => b.r.helpful - a.r.helpful || b.r.stars - a.r.stars || a.i - b.i);
    const list = withIndex.map((x) => x.r);
    const filtered = filter === null ? list : list.filter((r) => r.stars === filter);
    if (!pinnedId) return filtered;
    const mine = filtered.find((r) => r.id === pinnedId);
    return mine ? [mine, ...filtered.filter((r) => r.id !== pinnedId)] : filtered;
  }, [reviews, sort, filter, pinnedId]);

  const changeFilter = useCallback((star: number | null) => {
    setFilter(star);
    setShown(PAGE_SIZE);
  }, []);

  const avg = useCountUp(aggregate.average, seen && !reduced);
  const her = subjectFirstName.trim() || "her";

  const tagQuote = useMemo(() => {
    if (!tag) return "";
    const word = tag.toLowerCase().split(/\s+/)[0] ?? "";
    const hit = reviews.find((r) => word && `${r.title} ${r.body}`.toLowerCase().includes(word));
    const src = (hit ?? reviews[0])?.body ?? "";
    const sentence = src.split(/(?<=[.!?])\s+/)[0] ?? src;
    return sentence.length > 160 ? `${sentence.slice(0, 157)}…` : sentence;
  }, [tag, reviews]);

  const imageStrip = photos.slice(0, 6);

  return (
    <section id={SECTION_IDS.reviews} className="lk-sec" aria-labelledby="lk-rv-h">
      <div className="lk-rv-grid">
        {/* ── Left: the numbers ───────────────────────────────────────── */}
        <div>
          <h2 id="lk-rv-h" className="lk-h2" style={{ fontSize: 22 }}>
            Customer reviews
          </h2>

          {aggregate.count === 0 ? (
            <p style={{ margin: "6px 0 0", fontSize: 14, color: C.secondary }}>No ratings yet. Be the first.</p>
          ) : (
            <div ref={histRef}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                <Stars value={aggregate.average} size={20} />
                <span style={{ fontSize: 18, color: C.text }}>{spokenAverage(Math.round(avg * 10) / 10)} out of 5</span>
              </div>
              <p style={{ margin: "6px 0 14px", fontSize: 14, color: C.secondary }}>
                {aggregate.count.toLocaleString("en-IN")} global rating{aggregate.count === 1 ? "" : "s"}
              </p>
              <div role="list" style={{ display: "grid", gap: 10 }}>
                {STAR_ROWS.map((s) => {
                  const pct = aggregate.percents[s - 1];
                  const active = filter === s;
                  return (
                    <button
                      key={s}
                      role="listitem"
                      type="button"
                      className={`lk-hist${active ? " on" : ""}`}
                      onClick={() => changeFilter(active ? null : s)}
                      disabled={aggregate.buckets[s - 1] === 0}
                      aria-label={`${s} star, ${pct}%`}
                    >
                      <span className="lk-hist-l">{s} star</span>
                      <span className="lk-hist-track">
                        <span
                          className="lk-hist-fill"
                          style={{ width: seen || reduced ? `${pct}%` : "0%", transitionDelay: `${(5 - s) * 70}ms` }}
                        />
                      </span>
                      <span className="lk-hist-r">{pct}%</span>
                    </button>
                  );
                })}
              </div>
              <p style={{ margin: "12px 0 0", fontSize: 13 }}>
                <span className="lk-link">How are ratings calculated?</span>
              </p>
            </div>
          )}

          <hr className="lk-hr" style={{ margin: "20px 0" }} />
          <h3 className="lk-h3" style={{ fontSize: 18 }}>
            Review this product
          </h3>
          <p style={{ margin: "0 0 12px", fontSize: 14, color: C.text, ...WRAP }}>
            {contributorPrompt || `Know ${her}? Share your thoughts with other customers.`}
          </p>
          <button type="button" className="lk-cta lk-cta-ghost" onClick={onWriteReview} id={SECTION_IDS.writeReview}>
            {writeReviewLabel}
          </button>
          {footer ? <div style={{ marginTop: 16 }}>{footer}</div> : null}
        </div>

        {/* ── Right: the words ────────────────────────────────────────── */}
        <div style={{ minWidth: 0 }}>
          {customersSay ? (
            <div className="lk-say">
              <h3 className="lk-h3" style={{ fontSize: 18 }}>
                Customers say
              </h3>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: C.text, ...WRAP }}>{customersSay}</p>
              <p className="lk-say-ai">
                <IconSparkle size={14} color="#6E5CE6" /> Generated from the text of customer reviews (and one very biased seller)
              </p>
              {customersSayTags.length > 0 && (
                <>
                  <p style={{ margin: "12px 0 8px", fontSize: 14, fontWeight: 700 }}>Select to learn more</p>
                  <div className="lk-tags">
                    {customersSayTags.map((t) => (
                      <button key={t} type="button" className={`lk-tag${tag === t ? " on" : ""}`} onClick={() => setTag(tag === t ? null : t)} aria-pressed={tag === t}>
                        <IconCheckCircle size={15} color={C.okGreen} /> {t}
                      </button>
                    ))}
                  </div>
                  {tag ? (
                    <div key={tag} className="lk-tag-panel">
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Every customer mentions &ldquo;{tag}&rdquo; — all positive</p>
                      {tagQuote ? <p style={{ margin: "6px 0 0", fontSize: 14, color: C.text, fontStyle: "italic", ...WRAP }}>&ldquo;{tagQuote}&rdquo;</p> : null}
                    </div>
                  ) : null}
                </>
              )}
            </div>
          ) : null}

          {imageStrip.length > 1 && (
            <div style={{ marginTop: 22 }}>
              <h3 className="lk-h3">Reviews with images</h3>
              <div className="lk-imgstrip">
                {imageStrip.map((p, i) => (
                  <button key={`${p}-${i}`} type="button" className="lk-imgstrip-cell" onClick={() => onPhoto(i)} aria-label={`Customer image ${i + 1}`}>
                    <Framed src={p} crop={crops[i]} alt="" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
            <h3 className="lk-h3" style={{ margin: 0, fontSize: 18 }}>
              Top reviews from India
            </h3>
            <label style={{ fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span className="lk-sr">Sort reviews</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as SortMode)} className="lk-sort">
                <option value="top">Top reviews</option>
                <option value="recent">Most recent</option>
              </select>
            </label>
          </div>
          {filter !== null ? (
            <p style={{ margin: "8px 0 0", fontSize: 13 }}>
              Showing {filter}-star reviews ·{" "}
              <button type="button" className="lk-link" onClick={() => changeFilter(null)}>
                Clear filter
              </button>
            </p>
          ) : null}

          <ul style={{ margin: "6px 0 0", padding: 0 }}>
            {ordered.slice(0, shown).map((r) => {
              const si = seedIndex.get(r.id) ?? 99;
              const idxs = r.imageUrl ? [] : photosForReview(si, photos.length);
              const pics = r.imageUrl
                ? [{ src: r.imageUrl, index: -1 }]
                : idxs.map((k) => ({ src: photos[k] ?? "", crop: crops[k], index: k }));
              const v = variants.length ? variants[si % variants.length] : "";
              return (
                <ReviewCard
                  key={r.id}
                  review={r}
                  isNew={arrived.has(r.id)}
                  isYours={r.id === pinnedId}
                  variantLine={v ? `${variantLabel || "Style"}: ${v}` : ""}
                  photos={pics}
                  onPhoto={(k) => (k >= 0 ? onPhoto(k) : undefined)}
                />
              );
            })}
          </ul>
          {ordered.length > shown ? (
            <button type="button" className="lk-cta lk-cta-ghost" style={{ marginTop: 12, maxWidth: 260 }} onClick={() => setShown((n) => n + PAGE_SIZE)}>
              See more reviews
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function ReviewStyles() {
  return (
    <style>{`
      .lk-rv-grid { display: grid; gap: 26px; }
      @media (min-width: 900px) { .lk-rv-grid { grid-template-columns: minmax(260px, 1fr) 2.4fr; gap: 48px; } }
      .lk-hist { display: grid; grid-template-columns: 52px 1fr 40px; align-items: center; gap: 10px; border: 0; background: none; padding: 0; cursor: pointer; font: 400 14px ${FONT}; color: ${C.link}; text-align: left; }
      .lk-hist:disabled { cursor: default; color: ${C.secondary}; }
      .lk-hist:not(:disabled):hover .lk-hist-l, .lk-hist:not(:disabled):hover .lk-hist-r { color: ${C.linkHover}; text-decoration: underline; }
      .lk-hist:not(:disabled):hover .lk-hist-track { box-shadow: 0 0 0 1px #DE7921 inset; }
      .lk-hist.on .lk-hist-l { font-weight: 700; }
      .lk-hist-track { height: 22px; border-radius: 6px; background: ${C.track}; box-shadow: 0 0 0 1px #D5D9D9 inset; overflow: hidden; }
      .lk-hist-fill { display: block; height: 100%; background: ${C.star}; border-radius: 6px 0 0 6px; transition: width .9s cubic-bezier(.2,.8,.2,1); }
      .lk-hist-r { text-align: right; }

      .lk-say { background: #fff; }
      .lk-say-ai { display: flex; align-items: center; gap: 6px; margin: 10px 0 0; font-size: 12px; color: ${C.secondary}; }
      .lk-tags { display: flex; flex-wrap: wrap; gap: 8px; }
      .lk-tag {
        display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px; border-radius: 8px; cursor: pointer;
        background: #fff; border: 1px solid ${C.border}; box-shadow: 0 1px 2px rgba(15,17,17,.08); font: 400 14px ${FONT}; color: ${C.text};
        transition: background .15s ease, border-color .15s ease, transform .12s ease;
      }
      .lk-tag:hover { background: #F7FAFA; }
      .lk-tag:active { transform: scale(.96); }
      .lk-tag.on { border-color: ${C.chipEdge}; background: ${C.chipTint}; box-shadow: 0 0 0 1px ${C.chipEdge}; }
      .lk-tag-panel { margin-top: 10px; padding: 12px 14px; border-radius: 8px; background: #F7FAFA; border: 1px solid ${C.hairline}; animation: lk-rise .25s ease; }
      @keyframes lk-rise { from { opacity: 0; transform: translateY(6px); } }

      .lk-imgstrip { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; }
      .lk-imgstrip::-webkit-scrollbar { display: none; }
      .lk-imgstrip-cell { flex: 0 0 100px; aspect-ratio: 1 / 1; padding: 0; border: 0; border-radius: 8px; overflow: hidden; cursor: pointer; }

      .lk-sort { font: 400 13px ${FONT}; padding: 5px 8px; border-radius: 8px; border: 1px solid ${C.border}; background: #F0F2F2; box-shadow: 0 2px 5px rgba(213,217,217,.5); color: ${C.text}; }
      .lk-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }

      .lk-rv { list-style: none; padding: 18px 0; border-bottom: 1px solid ${C.hairline}; }
      .lk-rv-yours { border: 1px solid ${C.activeEdge}; background: ${C.activeTint}; border-radius: 8px; padding: 14px; margin: 10px 0; }
      .lk-rv-flag { margin: 0 0 8px; font-size: 12px; font-weight: 700; color: ${C.activeEdge}; }
      .lk-rv-new { animation: lk-arrive 1.6s ease; }
      @keyframes lk-arrive { 0% { background: #FFF6D6; transform: translateY(8px); opacity: 0; } 20% { opacity: 1; transform: none; } 100% { background: transparent; } }
      .lk-rv-avatar { width: 34px; height: 34px; flex: none; border-radius: 50%; background: #C9CCCC; display: grid; place-items: center; overflow: hidden; }
      .lk-rv-body { margin: 8px 0 0; font-size: 14px; line-height: 1.55; color: ${C.text}; white-space: pre-line; overflow-wrap: anywhere; }
      .lk-rv-clip { display: -webkit-box; -webkit-line-clamp: 5; -webkit-box-orient: vertical; overflow: hidden; }
      .lk-rv-photo { width: 88px; height: 88px; padding: 0; border: 0; border-radius: 6px; overflow: hidden; cursor: pointer; }
      .lk-helpful {
        min-width: 94px; padding: 5px 18px; border-radius: 100px; border: 1px solid ${C.border}; background: #fff; cursor: pointer;
        font: 400 13px ${FONT}; color: ${C.text}; box-shadow: 0 2px 5px rgba(213,217,217,.5); transition: background .12s ease, transform .12s ease;
      }
      .lk-helpful:hover { background: #F7FAFA; }
      .lk-helpful:active { transform: scale(.95); }
      .lk-rv-thanks { display: inline-flex; align-items: center; gap: 5px; font-size: 13px; color: ${C.okGreen}; animation: lk-rise .25s ease; }

      @media (prefers-reduced-motion: reduce) {
        .lk-rv-new, .lk-tag-panel, .lk-rv-thanks { animation: none; }
        .lk-hist-fill { transition: none; }
      }
    `}</style>
  );
}
