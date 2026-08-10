"use client";

// ─── AppTemplate — the composer ──────────────────────────────────────────────
//
// Assembles the listing out of the section components and owns the only three
// pieces of state the page has: the install pill, the version-history panel,
// and the toast. Nothing here fetches, and nothing here reads storage — the
// recipient's render holds all of its own state in memory, because a gift page
// that remembers you across visits is a gift page that wrote to your device.
//
// ── THE INSTALL GUARD ────────────────────────────────────────────────────────
//
// GET is the most-tapped thing on the page and it is a 2s animation, so it is
// also the easiest thing to break: tap it four times and four timers race, the
// pill flickers between states, and the last one to land wins. The transition is
// guarded on `installState !== "idle"` so only the first tap starts anything,
// and the timer is cleared on unmount so a preview that remounts on save cannot
// fire into a dead component.
//
// ── THE RATING IS DERIVED, NEVER TRUSTED ─────────────────────────────────────
//
// `data.reviews` is filtered to `published` before it reaches `Reviews`, and the
// histogram is recomputed from that same filtered list. A stored distribution
// that disagrees with the reviews printed under it is the cheapest possible tell
// that a page is a mock-up, and it is the first thing anybody checks.
//
// ── SPACING ──────────────────────────────────────────────────────────────────
//
// Sections are separated by SECTION_GAP and nothing tightens it. Listings
// breathe; cramped vertical rhythm is the fastest way to make this read as fake.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Only SECTION_GAP is pulled from the theme here. Every colour on this file's
// own chrome — the desktop surround and the toast — is stated locally so the
// composer has no opinion about the section palette.
import { SECTION_GAP } from "./theme";
import { TopBar } from "./TopBar";
import { HeaderBlock } from "./HeaderBlock";
import { StatsStrip } from "./StatsStrip";
import { Screenshots } from "./Screenshots";
import { DescriptionBlock } from "./DescriptionBlock";
import { WhatsNew } from "./WhatsNew";
import { VersionHistory } from "./VersionHistory";
import { Reviews } from "./Reviews";
import { InfoTable } from "./InfoTable";
import { ReviewQueue } from "./ReviewQueue";

import { aggregateOf, publishedReviews } from "./demo";
import type { AppData, AppRating, InstallState } from "./types";

/** Deep indigo. Belongs to no storefront, which is the entire point. */
const ACCENT = "#4B3FA7";
/** The neutral the letterboxed column floats on at desktop widths. */
const SURROUND = "#E8E6EF";
const PAGE = "#FFFFFF";
const INK = "#16141F";

/** The listing never reflows wide. It letterboxes in this column and stops. */
const COLUMN = 420;

/** How long the install pill spends in `installing`. */
const INSTALL_MS = 2000;

/**
 * "Sharma Family Enterprises" → "Sharma Store".
 *
 * The chrome pill is the sender's own store, built from the developer name they
 * typed. It falls back to her name so the bar is never a bare word.
 */
function storeNameFrom(data: AppData): string {
  const firstWord = data.app.developer.trim().split(/\s+/)[0] ?? "";
  const base = firstWord || data.app.name.trim();
  return base ? `${base} Store` : "Store";
}

export function AppTemplate({
  data,
  shareId,
  capture = false,
}: {
  data: AppData;
  /** Present only on the sender's own view. Gates the moderation queue. */
  shareId?: string;
  /** True while a PNG is being taken: no animation, no chrome, no panels. */
  capture?: boolean;
}) {
  const [installState, setInstallState] = useState<InstallState>("idle");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const installTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (installTimer.current) clearTimeout(installTimer.current);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    []
  );

  const say = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  /**
   * THE GUARD. Anything other than `idle` means an install is already running or
   * has finished, so the tap is swallowed rather than starting a second timer.
   */
  const handleInstall = useCallback(() => {
    if (installState !== "idle") return;
    setInstallState("installing");
    if (installTimer.current) clearTimeout(installTimer.current);
    installTimer.current = setTimeout(() => {
      setInstallState("installed");
      installTimer.current = null;
    }, INSTALL_MS);
  }, [installState]);

  const handleOpen = useCallback(() => {
    say("Already open. She has been open the whole time.");
  }, [say]);

  const handleShare = useCallback(() => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    const title = `${data.app.name} — ${data.app.subtitle}`;
    if (typeof navigator !== "undefined" && "share" in navigator) {
      navigator.share({ title, url }).catch(() => {});
      return;
    }
    // Reached through `window` rather than the bare global: the guard above
    // narrows the bare `navigator` to `never` on this branch, and widening the
    // guard instead would lose the feature check that makes it correct.
    window.navigator.clipboard
      ?.writeText(url)
      .then(() => say("Link copied."))
      .catch(() => say("Copy the address bar — that's the link."));
  }, [data.app.name, data.app.subtitle, say]);

  const handleWriteReview = useCallback(() => {
    say("Reviews come from her friends. Ask whoever sent you this for the link.");
  }, [say]);

  const published = useMemo(() => publishedReviews(data), [data]);

  /**
   * The rating as rendered. `average` and `distribution` are recomputed from the
   * published reviews so the histogram can never contradict them; `count` stays
   * the sender's own display string ("8,472"), because it is a label and not a
   * quantity. No published reviews means an EMPTY aggregate, which the sections
   * draw as "No Ratings Yet" — never as "0.0".
   */
  const rating: AppRating = useMemo(() => {
    if (published.length === 0) {
      return { average: 0, count: "", distribution: [0, 0, 0, 0, 0] };
    }
    const agg = aggregateOf(published);
    return {
      average: agg.average,
      count: data.rating.count || String(agg.count),
      distribution: agg.distribution,
    };
  }, [published, data.rating.count]);

  const openHistory = useCallback(() => setHistoryOpen(true), []);
  const closeHistory = useCallback(() => setHistoryOpen(false), []);

  return (
    <div
      className={capture ? "ap-still" : undefined}
      style={{
        minHeight: "100dvh",
        background: SURROUND,
        display: "flex",
        justifyContent: "center",
        color: INK,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: COLUMN,
          minHeight: "100dvh",
          background: PAGE,
          position: "relative",
          // The letterbox edges. Invisible below 420px, where the column simply
          // fills the viewport.
          boxShadow: "0 0 0 1px rgba(22,20,31,0.08)",
          overflowX: "hidden",
        }}
      >
        <TopBar storeName={storeNameFrom(data)} onShare={handleShare} />

        <main
          style={{
            display: "flex",
            flexDirection: "column",
            gap: SECTION_GAP,
            paddingBottom: `calc(${SECTION_GAP}px + env(safe-area-inset-bottom, 0px))`,
          }}
        >
          <HeaderBlock
            app={data.app}
            installState={installState}
            onInstall={handleInstall}
            onOpen={handleOpen}
          />

          <StatsStrip app={data.app} rating={rating} />

          <Screenshots shots={data.screenshots} />

          <DescriptionBlock description={data.description} developer={data.app.developer} />

          <WhatsNew whatsNew={data.whatsNew} onOpenHistory={openHistory} />

          <Reviews rating={rating} reviews={published} onWriteReview={handleWriteReview} />

          <InfoTable rows={data.info} />

          {/*
            The sender's own view only. `shareId` is the read capability for a
            published page, so its presence is what distinguishes "I am looking
            at my own gift" from "I am the person it was sent to" — and the
            recipient must never see a queue of things her friends said about her
            before they were approved.
          */}
          {shareId && !capture ? <ReviewQueue shareId={shareId} /> : null}
        </main>

        {!capture ? (
          <VersionHistory versions={data.versionHistory} open={historyOpen} onClose={closeHistory} />
        ) : null}

        {toast && !capture ? (
          <div
            role="status"
            aria-live="polite"
            className="ap-toast"
            style={{
              position: "fixed",
              left: "50%",
              bottom: "calc(20px + env(safe-area-inset-bottom, 0px))",
              transform: "translateX(-50%)",
              zIndex: 400,
              maxWidth: "min(92vw, 380px)",
              padding: "11px 16px",
              borderRadius: 14,
              background: ACCENT,
              color: "#fff",
              fontSize: 13.5,
              lineHeight: 1.45,
              fontWeight: 500,
              textAlign: "center",
              boxShadow: "0 10px 30px rgba(22,20,31,0.28)",
              overflowWrap: "anywhere",
            }}
          >
            {toast}
          </div>
        ) : null}
      </div>

      <style>{`
        /* Pauses every animation under the capture subtree, so a PNG can never
           catch a bar mid-grow or a ring mid-sweep. */
        .ap-still, .ap-still * {
          animation: none !important;
          animation-play-state: paused !important;
          transition: none !important;
        }
        .ap-toast { animation: apToastIn 180ms ease-out both; }
        @keyframes apToastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ap-toast { animation: none; }
        }
      `}</style>
    </div>
  );
}

export default AppTemplate;
