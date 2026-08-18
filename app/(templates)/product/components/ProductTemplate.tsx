"use client";

// ─── ProductTemplate — the whole listing ─────────────────────────────────────
//
// One component, two modes:
//
//   "preview" — the sender's live demo and, after Save, their own page. No
//               polling, no brand badge; the editor's own chrome floats above.
//   "live"    — what the recipient opens. Polls the published contributions
//               every five seconds, merges them into the review list, animates
//               the arrivals, and carries the SubhSandesh badge top-right which
//               doubles as the recipient's "make your own" path.
//
// ── ORDER IS THE MOBILE SPEC ─────────────────────────────────────────────────
// gallery → details → buy box → bundle → specs → about → Q&A → reviews. That is
// the DOM order, so the phone gets it for free; the desktop grid only lifts the
// first three into three columns and everything else stays full width.
//
// ── THE TWO BUTTON JOKES ─────────────────────────────────────────────────────
// Add to Cart runs the header count 1 → 2, toasts "she is already yours." and
// puts it back. Buy Now scrolls to the reviews. Both timers are owned here and
// both are cleared on unmount — a `setTimeout` calling `setState` after the
// component has gone is the classic way this page starts warning in console.

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Chrome, { Breadcrumb, ChromeStyles } from "./Chrome";
import Details from "./Details";
import BuyBox from "./BuyBox";
import Gallery, { GalleryStyles } from "./Gallery";
import QandA, { QaStyles } from "./QandA";
import Reviews, { ReviewStyles } from "./Reviews";
import ShareCardPanel from "./ShareCard";
import { FrequentlyBoughtTogether, FromTheSeller, SectionStyles, SpecTable } from "./Sections";
import { useLiveReviews } from "./contribApi";
import {
  C,
  FONT,
  LinkText,
  SECTION_IDS,
  WRAP,
  aggregateOf,
  normalizeProductData,
  useReducedMotion,
  useScrollToSection,
} from "./tokens";
import type { ProductData, Review } from "./types";

export interface ProductTemplateProps {
  data: ProductData;
  mode: "preview" | "live";
  shareId?: string;
  hasPassword?: boolean;
  /**
   * Reviews to merge on top of what the server published — the contributor's
   * own, immediately after they submit it, before anybody has approved it.
   */
  extraReviews?: readonly Review[];
  /** Forced to the top of the list and badged. Usually the contributor's own. */
  pinnedReviewId?: string;
  /** Overrides [Write a review]. Defaults to scrolling to the review block. */
  onWriteReview?: () => void;
  writeReviewLabel?: string;
  /** Rendered under the review list. The sender's collect-more-reviews strip. */
  reviewsFooter?: React.ReactNode;
  /** Set on the sender's side once published — enables the share-card panel. */
  showShareCard?: boolean;
  /**
   * Space above the store chrome, in px, and the offset the chrome sticks at.
   * The editor passes its floating bar's height so the two never overlap.
   */
  topOffset?: number;
}

interface Toast {
  id: number;
  text: string;
}

export default function ProductTemplate({
  data: rawData,
  mode,
  shareId,
  extraReviews,
  pinnedReviewId,
  onWriteReview,
  writeReviewLabel,
  reviewsFooter,
  showShareCard = false,
  topOffset = 0,
}: ProductTemplateProps) {
  // Tolerates a form (or an AI fill) that left `specs`/`qa` as flat strings.
  const data = useMemo(() => normalizeProductData(rawData), [rawData]);

  const reduced = useReducedMotion();
  const scrollTo = useScrollToSection(reduced);

  const live = useLiveReviews(shareId, mode === "live" && !!shareId);

  /* ── Reviews on the page ────────────────────────────────────────────────── */

  const published = useMemo(() => {
    const seen = new Set<string>();
    const out: Review[] = [];
    const push = (r: Review) => {
      if (seen.has(r.id)) return;
      seen.add(r.id);
      out.push(r);
    };
    for (const r of data.reviews) if (r.status === "published") push(r);
    for (const r of live.reviews) push(r);
    for (const r of extraReviews ?? []) push(r);
    return out;
  }, [data.reviews, live.reviews, extraReviews]);

  const aggregate = useMemo(() => aggregateOf(published), [published]);

  const topReview = useMemo(() => {
    if (published.length === 0) return null;
    return [...published].sort((a, b) => b.helpful - a.helpful || b.stars - a.stars)[0] ?? null;
  }, [published]);

  /* ── Toasts ─────────────────────────────────────────────────────────────── */

  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const remember = useCallback((t: ReturnType<typeof setTimeout>) => {
    timers.current.push(t);
  }, []);

  // Every timer this component starts is cleared here. Nothing is left to fire
  // a setState into a component that has gone.
  useEffect(
    () => () => {
      for (const t of timers.current) clearTimeout(t);
      timers.current = [];
    },
    []
  );

  const toast = useCallback(
    (text: string) => {
      const id = ++toastId.current;
      setToasts((prev) => [...prev, { id, text }]);
      remember(setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 2600));
    },
    [remember]
  );

  /* ── The cart joke ──────────────────────────────────────────────────────── */

  const [cartCount, setCartCount] = useState(1);
  const [bumping, setBumping] = useState(false);

  const addToCart = useCallback(() => {
    setCartCount(2);
    setBumping(true);
    toast("she is already yours.");
    remember(setTimeout(() => setBumping(false), 480));
    remember(setTimeout(() => setCartCount(1), 1700));
  }, [toast, remember]);

  const buyNow = useCallback(() => scrollTo(SECTION_IDS.reviews), [scrollTo]);

  const writeReview = useCallback(() => {
    if (onWriteReview) {
      onWriteReview();
      return;
    }
    scrollTo(SECTION_IDS.reviews);
  }, [onWriteReview, scrollTo]);

  const subjectName = `${data.subject.firstName} ${data.subject.lastName}`.trim() || data.subject.firstName;

  return (
    <div
      style={{
        background: C.page,
        minHeight: "100dvh",
        fontFamily: FONT,
        color: C.text,
        paddingTop: topOffset,
        ["--lk-chrome-top" as string]: `${topOffset}px`,
      }}
    >
      <ChromeStyles />
      <GalleryStyles />
      <SectionStyles />
      <QaStyles />
      <ReviewStyles />
      <TemplateStyles />

      {/* The recipient's way to make one of their own. Live pages only.
          In flow, above the store chrome, so it never sits on top of the nav —
          and repeated as a small fixed corner link that survives the scroll. */}
      {mode === "live" && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "6px 14px",
            background: C.section,
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <Link
            href="/templates"
            aria-label="Made with SubhSandesh — make your own"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "3px 10px 3px 4px",
              borderRadius: 100,
              background: "#fff",
              border: `1px solid ${C.border}`,
              textDecoration: "none",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.webp" alt="" width={20} height={20} style={{ borderRadius: 5, display: "block" }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>SubhSandesh</span>
          </Link>
        </div>
      )}

      <Chrome recipientFirstName={data.subject.firstName} cartCount={cartCount} cartBumping={bumping} />

      <main className="lk-shell">
        <Breadcrumb subjectName={subjectName} />

        <div className="lk-grid">
          <div style={{ minWidth: 0 }}>
            <Gallery photos={data.subject.photos} subjectName={subjectName} />
          </div>
          <div style={{ minWidth: 0 }}>
            <Details data={data} aggregate={aggregate} onJumpToReviews={buyNow} />
          </div>
          <div style={{ minWidth: 0 }}>
            <BuyBox
              data={data}
              onAddToCart={addToCart}
              onBuyNow={buyNow}
              onWishList={() => toast("She is already on it. Top of it.")}
            />
          </div>
        </div>

        <FrequentlyBoughtTogether data={data} onAddAll={addToCart} />
        <SpecTable specs={data.specs} />
      </main>

      <FromTheSeller about={data.aboutSection} />

      <main className="lk-shell">
        <QandA qa={data.qa} />

        <Reviews
          reviews={published}
          aggregate={aggregate}
          subjectFirstName={data.subject.firstName}
          contributorPrompt={data.contributorPrompt}
          onWriteReview={writeReview}
          writeReviewLabel={writeReviewLabel}
          arrivedIds={live.arrivedIds}
          reduced={reduced}
          pinnedId={pinnedReviewId}
          footer={reviewsFooter}
        />

        {showShareCard && (
          <div style={{ maxWidth: 340, margin: "18px 0 4px" }}>
            <ShareCardPanel data={data} aggregate={aggregate} topReview={topReview} />
          </div>
        )}

        <footer
          style={{
            borderTop: `1px solid ${C.border}`,
            marginTop: 26,
            padding: "20px 0 40px",
            fontSize: 12,
            color: C.secondary,
            ...WRAP,
          }}
        >
          <p style={{ margin: 0 }}>
            Listed by {data.sender.firstName}. One unit, never restocked, not for sale.
          </p>
          <p style={{ margin: "6px 0 0" }}>
            <LinkText href="/templates" size={12}>
              Make one for someone
            </LinkText>
          </p>
        </footer>
      </main>

      {/* Persistent corner affordance — the one that survives the scroll. */}
      {mode === "live" && (
        <Link href="/templates" className="lk-corner">
          Make one for someone
        </Link>
      )}

      {/* Toasts */}
      <div className="lk-toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <span key={t.id} className="lk-toast">
            {t.text}
          </span>
        ))}
      </div>
    </div>
  );
}

function TemplateStyles() {
  return (
    <style>{`
      .lk-shell { width: 100%; max-width: 1400px; margin: 0 auto; padding: 0 14px; }

      .lk-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 22px; align-items: start; }
      @media (min-width: 1024px) {
        .lk-grid { grid-template-columns: 40% 38% 22%; gap: 24px; }
      }

      .lk-corner {
        position: fixed; right: 12px; bottom: 14px; z-index: 80;
        display: inline-flex; align-items: center;
        padding: 7px 14px; border-radius: 100px;
        background: ${C.ctaYellow}; border: 1px solid #E7B93C;
        color: ${C.text}; font-family: ${FONT}; font-size: 12.5px; font-weight: 700;
        text-decoration: none; box-shadow: 0 2px 10px rgba(15,17,17,0.2);
      }

      .lk-toasts {
        position: fixed; left: 50%; bottom: 68px; transform: translateX(-50%);
        z-index: 90; display: flex; flex-direction: column; gap: 8px;
        align-items: center; pointer-events: none; width: max-content; max-width: 92vw;
      }
      .lk-toast {
        background: ${C.header}; color: #fff; font-family: ${FONT};
        font-size: 13.5px; padding: 9px 16px; border-radius: 100px;
        box-shadow: 0 3px 14px rgba(15,17,17,0.28);
        animation: lk-toast-in 220ms ease-out both;
        overflow-wrap: anywhere; text-align: center;
      }
      @keyframes lk-toast-in {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: none; }
      }
      @media (prefers-reduced-motion: reduce) {
        .lk-toast { animation: none; }
      }
    `}</style>
  );
}
