"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { exportNodeToPng, fileSlug } from "@/lib/exportPng";
import {
  COPY,
  PALETTE,
  TAB_EMPTY_COPY,
  TAP_TARGET_PX,
  TIMING,
  UI,
  type SearchData,
  type SearchResult,
  type Tab,
} from "./types";
import { isWrongName } from "./demoData";
import { Snippet, Toast, Wordmark } from "./atoms";
import SearchBox from "./SearchBox";
import ResultRow from "./ResultRow";
import PeopleAlsoAsk from "./PeopleAlsoAsk";
import KnowledgePanel from "./KnowledgePanel";
import ImagesGrid from "./ImagesGrid";
import ArticlePage from "./ArticlePage";
import ShareCard, { SHARE_CARD_H, SHARE_CARD_W } from "./ShareCard";
import { usePrefersReducedMotion } from "./useMotion";

/* ════════════════════════════════════════════════════════════════════════════
   Searched
   ════════════════════════════════════════════════════════════════════════════

   The recipient types their OWN name into an empty box. That is the hook, and
   it is why nothing here pre-fills the query in either mode.

   Three screens, one component: the landing, the results page, and the fake
   page that slides over it. The knowledge panel is FIRST in the DOM so that a
   phone puts it above the results.

   House style, restated because it is the thing that decays: this must look
   boring. Greyscale, one 1px border on the search box and on the panel, no
   gradients, no shadows, no accent fills. The only colour on the page is the
   wordmark and the link violet. Every ornament added here costs a laugh.
   ═══════════════════════════════════════════════════════════════════════════ */

const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "images", label: "Images" },
  { id: "news", label: "News" },
  { id: "videos", label: "Videos" },
  { id: "shopping", label: "Shopping" },
  { id: "more", label: "More" },
];

type View = { kind: "landing" } | { kind: "results" } | { kind: "article"; id: string };

export interface SearchedTemplateProps {
  data: SearchData;
  /** "demo" is the gallery preview under the editor toolbar. "live" is theirs. */
  mode: "demo" | "live";
  shareId?: string;
  hasPassword?: boolean;
}

export default function SearchedTemplate({ data, mode }: SearchedTemplateProps) {
  const reduced = usePrefersReducedMotion();

  const [stack, setStack] = useState<View[]>([{ kind: "landing" }]);
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [altTerm, setAltTerm] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const view = stack[stack.length - 1];

  // ── History. Each screen is a real back step, and the browser button works.
  const pushedRef = useRef(0);
  const savedScrollRef = useRef(0);
  const pendingScrollRef = useRef<number | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const toastTimer = useRef<number | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), TIMING.toastMs);
  }, []);

  const pushView = useCallback((v: View) => {
    setStack((prev) => [...prev, v]);
    try {
      window.history.pushState({ searchedDepth: Date.now() }, "");
      pushedRef.current += 1;
    } catch {
      // A blocked pushState only costs the browser back button; the in-page
      // Back control falls through to popping our own stack.
    }
  }, []);

  const popView = useCallback(() => {
    setStack((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.slice(0, -1);
      if (next[next.length - 1].kind === "results") pendingScrollRef.current = savedScrollRef.current;
      return next;
    });
  }, []);

  useEffect(() => {
    const onPop = () => {
      pushedRef.current = Math.max(0, pushedRef.current - 1);
      popView();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [popView]);

  // Coming back from a fake page must land on the same pixel they left from.
  useEffect(() => {
    if (view.kind !== "results" || pendingScrollRef.current === null) return;
    const y = pendingScrollRef.current;
    pendingScrollRef.current = null;
    const id = window.requestAnimationFrame(() => window.scrollTo(0, y));
    return () => window.cancelAnimationFrame(id);
  }, [view]);

  useEffect(
    () => () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  // ── Search ────────────────────────────────────────────────────────────────

  const runSearch = useCallback(
    (raw: string) => {
      const q = raw.trim();
      if (!q) {
        showToast(COPY.emptySearch);
        return;
      }
      setSubmitted(q);
      setAltTerm(null);
      setTab("all");
      if (view.kind === "landing") pushView({ kind: "results" });
      window.scrollTo(0, 0);
    },
    [view.kind, pushView, showToast],
  );

  // Lucky goes straight past the results to the panel. It is the only shortcut
  // on the page and it exists because some people will not scroll.
  const runLucky = useCallback(() => {
    const q = query.trim() || data.recipient.name;
    setQuery(q);
    setSubmitted(q);
    setAltTerm(null);
    setTab("all");
    if (view.kind === "landing") pushView({ kind: "results" });
    window.requestAnimationFrame(() => {
      const el = panelRef.current;
      if (el) el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
      else window.scrollTo(0, 0);
    });
  }, [query, data.recipient.name, view.kind, pushView, reduced]);

  const openResult = useCallback(
    (result: SearchResult) => {
      if (!result.page) {
        showToast(COPY.privateResult);
        return;
      }
      savedScrollRef.current = window.scrollY;
      pushView({ kind: "article", id: result.id });
    },
    [pushView, showToast],
  );

  const goBackFromArticle = useCallback(() => {
    if (pushedRef.current > 0) window.history.back();
    else popView();
  }, [popView]);

  const chooseRelated = useCallback(
    (term: string) => {
      setQuery(term);
      setSubmitted(term);
      setAltTerm(data.alternateResults[term] ? term : null);
      setTab("all");
      window.scrollTo(0, 0);
    },
    [data.alternateResults],
  );

  // ── Derived ───────────────────────────────────────────────────────────────

  const shownResults = altTerm ? (data.alternateResults[altTerm] ?? data.results) : data.results;
  const wrongName = useMemo(
    () => !altTerm && isWrongName(submitted, data.recipient.name),
    [altTerm, submitted, data.recipient.name],
  );
  const articlePage =
    view.kind === "article" ? data.results.find((r) => r.id === view.id)?.page ?? null : null;

  // PAA goes after the third result, which is where it actually appears.
  const paaAfter = Math.min(2, Math.max(0, shownResults.length - 1));

  // ── Share card ────────────────────────────────────────────────────────────

  const attachCard = useCallback((el: HTMLDivElement | null) => {
    cardRef.current = el;
  }, []);

  const saveCard = useCallback(async () => {
    const node = cardRef.current;
    if (!node) return;
    // Freeze every animation and transition on the capture subtree first — a
    // mid-flight frame is exactly how a card exports half-faded.
    node.classList.add("srch-freeze");
    // `exportNodeToPng` awaits document.fonts.ready before it snapshots.
    const res = await exportNodeToPng(node, {
      width: SHARE_CARD_W,
      height: SHARE_CARD_H,
      filename: `${fileSlug(data.recipient.name)}-searched`,
      backgroundColor: PALETTE.bg,
      pixelRatio: 3,
    });
    node.classList.remove("srch-freeze");
    showToast(res.message);
  }, [data.recipient.name, showToast]);

  // ── Render ────────────────────────────────────────────────────────────────

  const landing = view.kind === "landing";

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: PALETTE.bg,
        fontFamily: UI,
        color: PALETTE.ink,
        // The editor's floating Back/Create bar sits over the top of the demo.
        paddingTop: mode === "demo" ? 60 : 0,
      }}
    >
      <TemplateStyles />

      {mode === "live" && (
        <Link
          href="/"
          style={{
            position: "absolute",
            top: 10,
            right: 12,
            zIndex: 90,
            fontFamily: UI,
            fontSize: 11.5,
            color: PALETTE.greyLight,
            textDecoration: "none",
          }}
        >
          SubhSandesh
        </Link>
      )}

      {landing ? (
        <Landing
          data={data}
          query={query}
          setQuery={setQuery}
          onSearch={runSearch}
          onLucky={runLucky}
          reduced={reduced}
        />
      ) : (
        <>
          {/* ── Header: compact wordmark, the query still editable, tab row ── */}
          <header style={{ borderBottom: `1px solid ${PALETTE.border}`, background: PALETTE.bg }}>
            <div
              style={{
                maxWidth: 1180,
                margin: "0 auto",
                padding: "12px 16px 0",
                display: "flex",
                alignItems: "center",
                // Wraps rather than crushing the box: a 25-character wordmark
                // at 380px will otherwise leave the input zero pixels wide.
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setStack([{ kind: "landing" }]);
                  setQuery("");
                  setSubmitted("");
                  setAltTerm(null);
                }}
                aria-label="Back to the search page"
                style={{
                  border: "none",
                  background: "transparent",
                  padding: 0,
                  cursor: "pointer",
                  flex: "0 1 auto",
                  maxWidth: "45%",
                  minWidth: 0,
                  overflow: "hidden",
                }}
                className="srch-mark"
              >
                <Wordmark name={data.recipient.name} size={20} nowrap />
              </button>
              <div style={{ flex: "1 1 220px", minWidth: 200, maxWidth: 620 }}>
                <SearchBox
                  value={query}
                  onChange={setQuery}
                  onSubmit={runSearch}
                  suggestions={data.autocomplete}
                  recipientName={data.recipient.name}
                  variant="header"
                  reduced={reduced}
                />
              </div>
            </div>

            <nav
              aria-label="Result types"
              style={{ maxWidth: 1180, margin: "0 auto", padding: "0 16px", overflowX: "auto" }}
            >
              <ul style={{ display: "flex", gap: 4, listStyle: "none", margin: "10px 0 0", padding: 0 }}>
                {TABS.map((t) => {
                  const on = tab === t.id;
                  return (
                    <li key={t.id}>
                      <button
                        type="button"
                        onClick={() => setTab(t.id)}
                        aria-current={on ? "page" : undefined}
                        style={{
                          minHeight: 38,
                          padding: "0 12px",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          fontFamily: UI,
                          fontSize: 13.5,
                          whiteSpace: "nowrap",
                          color: on ? PALETTE.link : PALETTE.grey,
                          borderBottom: on ? `3px solid ${PALETTE.link}` : "3px solid transparent",
                        }}
                      >
                        {t.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </header>

          <main style={{ maxWidth: 1180, margin: "0 auto", padding: "0 16px 80px" }}>
            {tab === "all" && (
              <div className="srch-cols">
                {/* FIRST in the DOM on purpose: above the results on a phone,
                    the right column on a desktop via row-reverse. */}
                <div className="srch-panel" ref={panelRef}>
                  <div style={{ paddingTop: 18 }}>
                    <KnowledgePanel
                      panel={data.knowledgePanel}
                      name={data.recipient.name}
                      photoUrl={data.recipient.photoUrl}
                    />
                    <button
                      type="button"
                      onClick={saveCard}
                      style={{
                        marginTop: 12,
                        width: "100%",
                        minHeight: TAP_TARGET_PX,
                        border: `1px solid ${PALETTE.border}`,
                        borderRadius: 6,
                        background: "#fff",
                        cursor: "pointer",
                        fontFamily: UI,
                        fontSize: 13.5,
                        color: PALETTE.url,
                      }}
                    >
                      Save this as an image
                    </button>
                  </div>
                </div>

                <div className="srch-results">
                  <p
                    style={{
                      fontFamily: UI,
                      fontSize: 13,
                      color: PALETTE.grey,
                      margin: "14px 0 18px",
                    }}
                  >
                    {COPY.resultsLine(data.resultCount, data.searchSeconds)}
                  </p>

                  {wrongName && (
                    <p style={{ fontFamily: UI, fontSize: 14, color: PALETTE.ink, margin: "0 0 16px" }}>
                      {COPY.wrongName(data.recipient.name)}
                    </p>
                  )}

                  {!altTerm && data.didYouMean && (
                    <p style={{ margin: "0 0 18px" }}>
                      <button
                        type="button"
                        onClick={() => showToast(COPY.refuseCorrection)}
                        className="srch-link"
                        style={{
                          fontFamily: UI,
                          fontSize: 14.5,
                          fontStyle: "italic",
                          color: PALETTE.link,
                          background: "transparent",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                        }}
                      >
                        {COPY.didYouMean(data.didYouMean)}
                      </button>
                    </p>
                  )}

                  {shownResults.map((r, i) => (
                    <React.Fragment key={r.id}>
                      <ResultRow result={r} index={i} reduced={reduced} onOpen={openResult} />
                      {/* PAA lives inside the results column, after the third
                          result, and only on the real search. */}
                      {!altTerm && i === paaAfter && (
                        <PeopleAlsoAsk paa={data.paa} reserve={data.paaReserve} reduced={reduced} />
                      )}
                    </React.Fragment>
                  ))}

                  {shownResults.length === 0 && (
                    <Snippet text={COPY.privateResult} lines={0} />
                  )}

                  {data.relatedSearches.length > 0 && (
                    <section aria-label="Related searches" style={{ marginTop: 34 }}>
                      <h2
                        style={{
                          fontFamily: UI,
                          fontSize: 19,
                          fontWeight: 400,
                          color: PALETTE.ink,
                          margin: "0 0 14px",
                        }}
                      >
                        Related searches
                      </h2>
                      <ul className="srch-related">
                        {data.relatedSearches.map((term) => (
                          <li key={term}>
                            <button
                              type="button"
                              onClick={() => chooseRelated(term)}
                              className="srch-pill"
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                width: "100%",
                                minHeight: TAP_TARGET_PX,
                                padding: "0 16px",
                                borderRadius: 22,
                                border: "none",
                                background: PALETTE.hover,
                                cursor: "pointer",
                                textAlign: "left",
                              }}
                            >
                              <Search size={15} strokeWidth={1.8} color={PALETTE.grey} aria-hidden />
                              <span
                                style={{
                                  fontFamily: UI,
                                  fontSize: 14,
                                  color: PALETTE.ink,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {term}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                </div>
              </div>
            )}

            {tab === "images" && <ImagesGrid images={data.images} reduced={reduced} />}

            {tab !== "all" && tab !== "images" && (
              <p style={{ fontFamily: UI, fontSize: 15, color: PALETTE.grey, padding: "34px 0" }}>
                {TAB_EMPTY_COPY[tab]}
              </p>
            )}
          </main>
        </>
      )}

      {articlePage && <ArticlePage page={articlePage} onBack={goBackFromArticle} reduced={reduced} />}

      {toast && <Toast message={toast} />}

      <ShareCard data={data} attach={attachCard} />
    </div>
  );
}

/* ── Screen 1 ──────────────────────────────────────────────────────────────
   Clean, centred, mostly empty. The box is EMPTY: they type their own name,
   and being complicit in the reveal is the entire joke. */

function Landing({
  data,
  query,
  setQuery,
  onSearch,
  onLucky,
  reduced,
}: {
  data: SearchData;
  query: string;
  setQuery: (v: string) => void;
  onSearch: (q: string) => void;
  onLucky: () => void;
  reduced: boolean;
}) {
  return (
    <div
      style={{
        minHeight: "72dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px 60px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 560, textAlign: "center" }}>
        <div style={{ marginBottom: 30 }}>
          <Wordmark name={data.recipient.name} size="clamp(32px, 11vw, 56px)" />
        </div>

        <SearchBox
          value={query}
          onChange={setQuery}
          onSubmit={onSearch}
          suggestions={data.autocomplete}
          recipientName={data.recipient.name}
          variant="landing"
          reduced={reduced}
          autoFocus
        />

        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: 28,
          }}
        >
          <button
            type="button"
            onClick={() => onSearch(query)}
            style={buttonStyle}
          >
            {COPY.search}
          </button>
          <button type="button" onClick={onLucky} style={buttonStyle}>
            {COPY.lucky}
          </button>
        </div>
      </div>
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  minHeight: TAP_TARGET_PX,
  padding: "0 18px",
  borderRadius: 4,
  border: "1px solid transparent",
  background: "#f4f4f4",
  cursor: "pointer",
  fontFamily: UI,
  fontSize: 14,
  color: PALETTE.url,
};

/* ── The only stylesheet. Keyframes, hovers and the two-column flip. ─────── */

function TemplateStyles() {
  return (
    <style>{`
@keyframes srch-rise { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
@keyframes srch-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes srch-slide-in { from { transform: translateX(100%); } to { transform: none; } }
/* The nudge. Once, ever, and barely there — some people do not know to look down. */
@keyframes srch-pulse {
  0%, 100% { background-color: transparent; }
  35%      { background-color: ${PALETTE.hover}; }
}

.srch-row:hover { background-color: ${PALETTE.hover}; }
.srch-nudge { animation: srch-pulse 900ms ease-in-out 1 both !important; }
.srch-link:hover { text-decoration: underline; }
.srch-mark:hover { opacity: .85; }
.srch-pill:hover { filter: brightness(.97); }

.srch-masonry { column-count: 2; column-gap: 10px; }
.srch-related { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: 1fr; gap: 8px; }

/* Phone: knowledge panel above the results (source order). */
.srch-cols { display: flex; flex-direction: column; }
.srch-panel { min-width: 0; }
.srch-results { min-width: 0; }

@media (min-width: 640px) {
  .srch-related { grid-template-columns: 1fr 1fr; gap: 8px 20px; }
}

@media (min-width: 1024px) {
  /* Desktop: results ~65% on the left, panel ~32% on the right. */
  .srch-cols { flex-direction: row-reverse; align-items: flex-start; gap: 3%; }
  .srch-panel { flex: 0 0 32%; }
  .srch-results { flex: 1 1 65%; max-width: 65%; }
  .srch-masonry { column-count: 4; }
}

/* Capture subtree: nothing may be mid-animation when html-to-image snapshots. */
.srch-freeze, .srch-freeze * { animation: none !important; transition: none !important; }

@media (prefers-reduced-motion: reduce) {
  .srch-row, .srch-nudge, .srch-masonry button, [class*="srch-"] { animation: none !important; }
}
`}</style>
  );
}
