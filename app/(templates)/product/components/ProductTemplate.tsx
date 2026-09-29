"use client";

// ─── ProductTemplate — the whole listing ─────────────────────────────────────
//
//   "preview" — the sender's live demo and, after Save, their own page. No
//               polling, no brand strip; the editor's own chrome floats above.
//   "live"    — what the recipient opens. Polls the published contributions,
//               merges them into the review list, animates the arrivals, and
//               carries the SubhSandesh strip top-right.
//
// ── LAYOUT ───────────────────────────────────────────────────────────────────
// One DOM, three grids, named areas (see TemplateStyles):
//   phone    head / gallery / price / buy / rest         — the app
//   tablet   gallery | head, price, buy, rest            — two columns
//   desktop  gallery | head, price, rest | buy box       — the classic three
// Everything else (bundle, A+ content, product information, Q&A, reviews)
// runs full width underneath.
//
// ── THE PURCHASE ─────────────────────────────────────────────────────────────
// Add to Cart flies her photo into the visible cart icon and opens "Added to
// cart"; Buy Now / Proceed to Buy open checkout; Place your order ends on the
// success screen, which opens the letter. Every timer is cleared on unmount.

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import LetterPop from "../../_love/LetterPop";
import Chrome, { Breadcrumb, ChromeStyles, type AppTab } from "./Chrome";
import { DetailsHead, DetailsPrice, DetailsRest, DetailsStyles } from "./Details";
import BuyBox, { BuyBoxStyles } from "./BuyBox";
import Gallery, { GalleryStyles, PhotoViewer } from "./Gallery";
import QandA, { QaStyles } from "./QandA";
import Reviews, { ReviewStyles } from "./Reviews";
import ShareCardPanel from "./ShareCard";
import { FrequentlyBoughtTogether, FromTheSeller, SectionStyles, SpecTable } from "./Sections";
import { AddedToCart, CartStyles, Checkout, FlyingPhoto, visibleCartTarget, type Flight } from "./Cart";
import { Wordmark } from "./Chrome";
import { useLiveReviews } from "./contribApi";
import {
  C,
  FONT,
  SECTION_IDS,
  aggregateOf,
  cropAt,
  normalizeProductData,
  useMinWidth,
  useReducedMotion,
  useScrollToSection,
} from "./tokens";
import { CROP_CENTER, type PhotoCrop, type ProductData, type Review } from "./types";

export interface ProductTemplateProps {
  data: ProductData;
  mode: "preview" | "live";
  shareId?: string;
  hasPassword?: boolean;
  /** The contributor's own review, merged before anybody has approved it. */
  extraReviews?: readonly Review[];
  /** Forced to the top of the list and badged. Usually the contributor's own. */
  pinnedReviewId?: string;
  /** Overrides [Write a review]. Defaults to scrolling to the review block. */
  onWriteReview?: () => void;
  writeReviewLabel?: string;
  /** Rendered under "Review this product". The sender's collect-more strip. */
  reviewsFooter?: React.ReactNode;
  /** Set on the sender's side once published — enables the share-card panel. */
  showShareCard?: boolean;
  /** Space above the store chrome, in px, and the offset the chrome sticks at. */
  topOffset?: number;
  /** The app bar's back arrow. Defaults to scrolling to the top. */
  onBack?: () => void;
  /** Hide the letter (e.g. while the editor sheet is open). */
  hideLetter?: boolean;
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
  onBack,
  hideLetter = false,
}: ProductTemplateProps) {
  const data = useMemo(() => normalizeProductData(rawData), [rawData]);
  const photos = data.subject.photos;
  const crops: PhotoCrop[] = useMemo(() => photos.map((_, i) => cropAt(data, i)), [photos, data]);

  const reduced = useReducedMotion();
  const scrollTo = useScrollToSection(reduced);
  const wide = useMinWidth(768);

  const live = useLiveReviews(shareId, mode === "live" && !!shareId);

  /* ── Reviews ────────────────────────────────────────────────────────────── */

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
  const topReview = useMemo(
    () => (published.length ? [...published].sort((a, b) => b.helpful - a.helpful || b.stars - a.stars)[0] ?? null : null),
    [published]
  );

  /* ── Toasts + timers ────────────────────────────────────────────────────── */

  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);
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
      setToasts((prev) => [...prev.slice(-1), { id, text }]);
      later(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 2800);
    },
    [later]
  );

  /* ── Gallery + variants ─────────────────────────────────────────────────── */

  const [active, setActive] = useState(0);
  const [variant, setVariant] = useState(0);
  const [viewer, setViewer] = useState<number | null>(null);
  const [wished, setWished] = useState(false);

  const pickVariant = useCallback(
    (i: number) => {
      setVariant(i);
      if (photos.length) setActive(i % photos.length);
    },
    [photos.length]
  );

  /* ── The purchase ───────────────────────────────────────────────────────── */

  const [cartCount, setCartCount] = useState(0);
  const [bumping, setBumping] = useState(false);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [addedOpen, setAddedOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [letterForce, setLetterForce] = useState(false);

  const bump = useCallback(() => {
    setBumping(true);
    later(() => setBumping(false), 600);
  }, [later]);

  const addToCart = useCallback(
    (from: HTMLElement) => {
      if (cartCount > 0) {
        bump();
        toast("She's already in your cart. Limit: 1 per lifetime 💛");
        return;
      }
      // Fly from the photo on screen — the hero on desktop, the carousel on a phone.
      const heroEl =
        (Array.from(document.querySelectorAll<HTMLElement>(".lk-hero, .lk-carousel")).find((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight;
        }) as HTMLElement | undefined) ?? from;
      const r = heroEl.getBoundingClientRect();
      const to = visibleCartTarget();
      if (!to) {
        setCartCount(1);
        bump();
        setAddedOpen(true);
        return;
      }
      const w = heroEl === from ? 90 : Math.min(r.width, 320);
      setFlight({
        id: Date.now(),
        src: photos[active] ?? photos[0] ?? "",
        crop: crops[active] ?? CROP_CENTER,
        from: { x: r.left + (r.width - w) / 2, y: r.top + Math.max(0, (r.height - w) / 2), w, h: w },
        to,
      });
    },
    [cartCount, bump, toast, photos, crops, active]
  );

  const landed = useCallback(() => {
    setFlight(null);
    setCartCount(1);
    bump();
    later(() => setAddedOpen(true), 260);
  }, [bump, later]);

  const buyNow = useCallback(() => {
    setAddedOpen(false);
    setCheckoutOpen(true);
  }, []);

  const openLetter = useCallback(() => {
    setCheckoutOpen(false);
    setLetterForce(true);
    later(() => setLetterForce(false), 80);
  }, [later]);

  const share = useCallback(async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: data.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast("Link copied. Send it to her group chat.");
    } catch {
      /* the share sheet was dismissed */
    }
  }, [data.title, toast]);

  const onTab = useCallback(
    (tab: AppTab) => {
      if (tab === "home") window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
      else if (tab === "you") toast(`You: 1 order, placed ${data.reviews[0]?.ago.replace(/^Reviewed( in India)? on /, "on ") || "forever ago"}. Still the best one.`);
      else if (tab === "us") scrollTo(SECTION_IDS.reviews);
      else if (tab === "cart") {
        if (cartCount > 0) setAddedOpen(true);
        else toast("Your cart is empty. Add her. 🛒");
      } else toast("Menu: 1 category. Her.");
    },
    [reduced, toast, data.reviews, scrollTo, cartCount]
  );

  const writeReview = useCallback(() => {
    if (onWriteReview) onWriteReview();
    else scrollTo(SECTION_IDS.reviews);
  }, [onWriteReview, scrollTo]);

  const subjectName = `${data.subject.firstName} ${data.subject.lastName}`.trim() || data.subject.firstName;
  // LetterPop writes its own "Dear <name>," — drop a salutation line the
  // sender (or the AI) already put at the top so it never reads twice.
  const letterText = data.letter.trim().replace(/^(dear\s+)?[^\n,]{1,32},[ \t]*\n+/i, "");
  const hasLetter = !!letterText;
  const lastPhoto = photos[photos.length - 1] ?? "";

  return (
    <div
      className="lk-root"
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
      <DetailsStyles />
      <BuyBoxStyles />
      <SectionStyles />
      <QaStyles />
      <ReviewStyles />
      <CartStyles />
      <TemplateStyles />

      {mode === "live" && (
        <div className="lk-brandstrip">
          <span style={{ fontSize: 12, color: C.secondary }}>a gift for {data.subject.firstName || "you"} 💛</span>
          <Link href="/templates" aria-label="Made with SubhSandesh — make your own" className="lk-brandpill">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.webp" alt="" width={20} height={20} style={{ borderRadius: 5, display: "block" }} />
            <span>SubhSandesh</span>
            <span className="lk-brandpill-cta">Make one</span>
          </Link>
        </div>
      )}

      <Chrome
        recipientFirstName={data.subject.firstName}
        senderFirstName={data.sender.firstName}
        cartCount={cartCount}
        cartBumping={bumping}
        onBack={onBack ?? (() => window.scrollTo({ top: 0, behavior: "smooth" }))}
        onTab={onTab}
      />

      <main className="lk-shell">
        <Breadcrumb subjectName={subjectName} />

        <div className="lk-grid">
          <div className="lk-a-head">
            <DetailsHead data={data} aggregate={aggregate} onJumpToReviews={() => scrollTo(SECTION_IDS.reviews)} />
          </div>
          <div className="lk-a-gal">
            <Gallery
              photos={photos}
              crops={crops}
              subjectName={subjectName}
              active={active}
              onActive={setActive}
              wished={wished}
              onWish={() => {
                setWished((w) => !w);
                toast(wished ? "Removed from Wish List. (Why would you.)" : "Added to Wish List: “Forever” 💛");
              }}
              onShare={() => void share()}
              onOpenViewer={setViewer}
            />
          </div>
          <div className="lk-a-price">
            <DetailsPrice
              data={data}
              crops={crops}
              variant={variant}
              onVariant={pickVariant}
              onOffer={(label, text) => toast(`${label} applied ✓ ${text.length > 70 ? `${text.slice(0, 68)}…` : text}`)}
            />
          </div>
          <div className="lk-a-buy">
            <BuyBox
              data={data}
              inCart={cartCount > 0}
              onAddToCart={addToCart}
              onBuyNow={buyNow}
              onWishList={() => {
                setWished(true);
                toast("Added to Wish List: “Forever” 💛");
              }}
              onQuantity={() => toast("Qty limited to 1 per customer. Permanently.")}
            />
          </div>
          <div className="lk-a-rest">
            <DetailsRest data={data} />
          </div>
        </div>

        <FrequentlyBoughtTogether data={data} heroCrop={crops[0]} onAddAll={addToCart} />
      </main>

      <main className="lk-shell">
        <FromTheSeller about={data.aboutSection} photo={lastPhoto} crop={crops[photos.length - 1]} sender={data.sender.firstName} />
        <SpecTable specs={data.specs} />
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
          customersSay={data.customersSay}
          customersSayTags={data.customersSayTags}
          variantLabel={data.variantLabel}
          variants={data.variants}
          photos={photos}
          crops={crops}
          onPhoto={setViewer}
        />

        {showShareCard && (
          <div style={{ maxWidth: 340, margin: "18px 0 4px" }}>
            <ShareCardPanel data={data} aggregate={aggregate} topReview={topReview} />
          </div>
        )}
      </main>

      <footer className="lk-foot">
        <button type="button" className="lk-foot-top" onClick={() => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })}>
          Back to top
        </button>
        <div className="lk-foot-cols">
          {[
            ["Get to Know Us", ["About Us (since day one)", "Careers: full-time boyfriend", "Press Releases: none, we're private"]],
            ["Connect with Us", ["Late-night calls", "Voice notes", "The good-morning text"]],
            ["Let Us Help You", ["Your Account (hers)", "Returns Centre (closed)", "100% Purchase Protection"]],
          ].map(([h, items]) => (
            <div key={h as string}>
              <p className="lk-foot-h">{h as string}</p>
              {(items as string[]).map((t) => (
                <p key={t} className="lk-foot-i">
                  {t}
                </p>
              ))}
            </div>
          ))}
        </div>
        <div className="lk-foot-base">
          <Wordmark scale={0.9} />
          <p style={{ margin: "10px 0 0", fontSize: 12, color: "#DDD" }}>
            © forever, a {data.sender.firstName || "one"} &amp; {data.subject.firstName || "only"} company. Not a real store. A real feeling.
          </p>
          <Link href="/templates" className="lk-foot-make">
            Made with SubhSandesh · make one for someone
          </Link>
        </div>
      </footer>

      {/* ── Overlays ───────────────────────────────────────────────────── */}
      {flight && <FlyingPhoto key={flight.id} flight={flight} onLanded={landed} />}
      {addedOpen && (
        <AddedToCart
          data={data}
          crop={crops[0]}
          onProceed={buyNow}
          onClose={() => setAddedOpen(false)}
        />
      )}
      {checkoutOpen && (
        <Checkout data={data} crop={crops[0]} hasLetter={hasLetter} onOpenLetter={openLetter} onClose={() => setCheckoutOpen(false)} />
      )}
      {viewer !== null && photos.length > 0 && (
        <PhotoViewer photos={photos} crops={crops} start={Math.min(viewer, photos.length - 1)} subjectName={subjectName} onClose={() => setViewer(null)} />
      )}

      {hasLetter && !hideLetter && (
        <LetterPop
          letter={letterText}
          from={data.sender.firstName || undefined}
          to={data.subject.firstName || undefined}
          question={data.lockQuestion || undefined}
          answer={data.lockAnswer || undefined}
          accent={C.love}
          accent2="#FF9900"
          paper="#FFFDF8"
          ink={C.text}
          bottom={wide ? 22 : 74}
          delay={2400}
          teaser={`a note came with your order 💌`}
          sign="forever in your cart,"
          zIndex={250}
          forceOpen={letterForce}
          variant="product"
          photos={photos}
        />
      )}

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
      .lk-root { overflow-x: clip; }
      .lk-shell { width: 100%; max-width: 1500px; margin: 0 auto; padding: 0 14px; }
      @media (min-width: 768px) { .lk-shell { padding: 0 20px; } }

      .lk-grid {
        display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; align-items: start; padding-top: 6px;
        grid-template-areas: "head" "gal" "price" "buy" "rest";
      }
      .lk-a-head { grid-area: head; min-width: 0; }
      .lk-a-gal { grid-area: gal; min-width: 0; }
      .lk-a-price { grid-area: price; min-width: 0; }
      .lk-a-buy { grid-area: buy; min-width: 0; }
      .lk-a-rest { grid-area: rest; min-width: 0; }
      @media (min-width: 768px) {
        .lk-gal-m { margin: 0; }
        .lk-grid {
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); column-gap: 26px; row-gap: 0; padding-top: 0;
          grid-template-areas: "gal head" "gal price" "gal buy" "gal rest";
          grid-template-rows: auto auto auto 1fr;
        }
        .lk-a-gal { position: sticky; top: calc(var(--lk-chrome-top, 0px) + 110px); align-self: start; }
        .lk-a-buy { margin-top: 16px; }
      }
      @media (min-width: 1024px) {
        .lk-grid {
          grid-template-columns: minmax(0, 40fr) minmax(0, 38fr) minmax(250px, 22fr); column-gap: 28px;
          grid-template-areas: "gal head buy" "gal price buy" "gal rest buy";
          grid-template-rows: auto auto 1fr;
        }
        .lk-a-buy { margin-top: 0; position: sticky; top: calc(var(--lk-chrome-top, 0px) + 112px); align-self: start; }
      }

      .lk-brandstrip { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 6px 12px; background: #fff; border-bottom: 1px solid ${C.hairline}; font-family: ${FONT}; }
      .lk-brandpill { display: inline-flex; align-items: center; gap: 7px; padding: 3px 4px 3px 4px; border-radius: 100px; background: #fff; border: 1px solid ${C.border}; text-decoration: none; font-size: 12px; font-weight: 700; color: ${C.text}; }
      .lk-brandpill-cta { background: ${C.ctaYellow}; border-radius: 100px; padding: 3px 9px; font-size: 11.5px; }

      .lk-foot { margin-top: 36px; font-family: ${FONT}; padding-bottom: calc(64px + env(safe-area-inset-bottom, 0px)); background: #232F3E; }
      @media (min-width: 768px) { .lk-foot { padding-bottom: 0; } }
      .lk-foot-top { width: 100%; border: 0; background: #37475A; color: #fff; font: 400 13px ${FONT}; padding: 15px; cursor: pointer; }
      .lk-foot-top:hover { background: #485769; }
      .lk-foot-cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 18px; max-width: 1000px; margin: 0 auto; padding: 34px 20px 26px; }
      .lk-foot-h { margin: 0 0 10px; color: #fff; font-weight: 700; font-size: 16px; }
      .lk-foot-i { margin: 0 0 8px; color: #DDD; font-size: 14px; }
      .lk-foot-base { border-top: 1px solid #3A4553; background: #131A22; padding: 26px 20px 30px; display: flex; flex-direction: column; align-items: center; text-align: center; }
      .lk-foot-make { margin-top: 12px; color: #FEBD69; font-size: 13px; font-weight: 700; text-decoration: none; }
      .lk-foot-make:hover { text-decoration: underline; }

      .lk-toasts {
        position: fixed; left: 50%; bottom: calc(80px + env(safe-area-inset-bottom, 0px)); transform: translateX(-50%);
        z-index: 450; display: flex; flex-direction: column; gap: 8px; align-items: center; pointer-events: none; width: max-content; max-width: 92vw;
      }
      @media (min-width: 768px) { .lk-toasts { bottom: 28px; } }
      .lk-toast {
        background: #232F3E; color: #fff; font-family: ${FONT}; font-size: 14px; padding: 11px 18px; border-radius: 10px;
        box-shadow: 0 6px 20px rgba(15,17,17,.3); animation: lk-toast-in 260ms cubic-bezier(.2,1.3,.4,1) both;
        overflow-wrap: anywhere; text-align: center;
      }
      @keyframes lk-toast-in { from { opacity: 0; transform: translateY(10px) scale(.96); } to { opacity: 1; transform: none; } }
      @media (prefers-reduced-motion: reduce) { .lk-toast { animation: none; } }
    `}</style>
  );
}
