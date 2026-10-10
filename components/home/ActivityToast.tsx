"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import { API_URL } from "@/lib/config";
import { templateList } from "@/data/template-registry";

// ─── Homepage activity toast ─────────────────────────────────────────────────
//
// A card in the top-right corner that changes every 10–20 seconds.
//
// ── EVERY LINE IT SHOWS IS TRUE ─────────────────────────────────────────────
//
// There is no name list in this file, no country table, no random person and no
// invented timestamp. Three kinds of card, in order of how much the data lets
// us say:
//
//   recent   a template published in the last 48 hours
//            "Someone made a Bouquet page — today"
//   count    a template with real published pages behind it
//            "Bouquet — made 14 times"
//   promo    no data at all yet
//            "Make a Bouquet page →"
//
// The third is why this needs no fiction. The reason a fake feed is tempting is
// the gap when nothing real has happened; filling that gap with an honest
// advertisement for the template solves the same problem — the corner is never
// empty — and it converts better than a stranger's name, because it is
// addressed to the reader rather than about somebody else.
//
// ── WHY "SOMEONE" AND NOT A NAME ────────────────────────────────────────────
//
// The people who made these pages never agreed to appear in an advert. Their
// names are not fetched here and the API does not return them, so this cannot
// start showing them by accident.
//
// ── WHY THERE IS NO FLAG ────────────────────────────────────────────────────
//
// We do not know where anyone is. PageView declares a `country` column that
// nothing has ever written, and no geo header is configured on the proxy. A flag
// would be invented decoration dressed as data. If real capture is added at
// creation time, a `country` field on the API response is all this needs.

interface Highlight {
  slug: string;
  count: number;
  lastCreatedAt: string | null;
}

type Card =
  | { kind: "recent"; slug: string; title: string; emoji: string; when: string }
  | { kind: "count"; slug: string; title: string; emoji: string; count: number }
  | { kind: "promo"; slug: string; title: string; emoji: string };

const MIN_MS = 10_000;
const MAX_MS = 20_000;
const FIRST_DELAY_MS = 4_000;
const RECENT_WINDOW_MS = 48 * 60 * 60 * 1000;

const BY_SLUG = new Map(templateList.map((t) => [t.slug, t]));

/** Coarse buckets only — see the note on dates in the Wall's format helper. */
function bucket(iso: string, now: number): string {
  const age = now - new Date(iso).getTime();
  if (!Number.isFinite(age)) return "recently";
  if (age < 24 * 60 * 60 * 1000) return "today";
  return "yesterday";
}

function buildCards(highlights: Highlight[], now: number): Card[] {
  const cards: Card[] = [];

  for (const h of highlights) {
    const t = BY_SLUG.get(h.slug);
    if (!t) continue; // server knows a template this build does not — skip it
    const base = { slug: h.slug, title: t.title, emoji: t.emoji };

    if (h.lastCreatedAt && now - new Date(h.lastCreatedAt).getTime() < RECENT_WINDOW_MS) {
      cards.push({ ...base, kind: "recent", when: bucket(h.lastCreatedAt, now) });
    } else if (h.count > 0) {
      cards.push({ ...base, kind: "count", count: h.count });
    }
  }

  // Nothing published yet, or the API was unreachable. Promote the templates
  // that lead the gallery — true, useful, and never empty.
  if (cards.length === 0) {
    for (const t of templateList.filter((x) => x.coverImage).slice(0, 8)) {
      cards.push({ kind: "promo", slug: t.slug, title: t.title, emoji: t.emoji });
    }
  }

  return cards;
}

export default function ActivityToast() {
  // Highlights and the instant they were read, together. The clock is stamped
  // in the fetch callback rather than during render — a component that reads
  // Date.now() while rendering is impure, and a card's "today" bucket must not
  // change underneath it between renders.
  const [data, setData] = useState<{ highlights: Highlight[]; now: number } | null>(null);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const reduce = useReducedMotion();

  // Read once. A ticker that re-polls would be a live feed, which is a much
  // stronger claim than this data supports.
  useEffect(() => {
    let live = true;
    fetch(`${API_URL}/activity/highlights`)
      .then((r) => r.json())
      .then((j) => {
        if (!live) return;
        setData({
          highlights: j?.success ? j.data?.highlights ?? [] : [],
          now: Date.now(),
        });
      })
      .catch(() => {
        // Fall through to the promo cards, which need no network at all.
        if (live) setData({ highlights: [], now: Date.now() });
      });
    return () => {
      live = false;
    };
  }, []);

  const cards = useMemo(
    () => (data === null ? [] : buildCards(data.highlights, data.now)),
    [data]
  );

  // Rotate: appear, hold, disappear, pause, next. The pause is what keeps this
  // a periodic notice rather than a carousel demanding attention.
  useEffect(() => {
    if (dismissed || cards.length === 0) return;

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));

    const cycle = (first: boolean) => {
      if (cancelled) return;
      at(first ? FIRST_DELAY_MS : 0, () => {
        setVisible(true);
        // Visible for 6s, then a gap of 4–14s before the next one.
        at(6_000, () => {
          setVisible(false);
          const gap = MIN_MS - 6_000 + Math.random() * (MAX_MS - MIN_MS);
          at(gap, () => {
            setIndex((i) => (i + 1) % cards.length);
            cycle(false);
          });
        });
      });
    };

    cycle(true);
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
    // `index` is deliberately absent: it is advanced by this effect via the
    // functional updater, and depending on it would tear the timer chain down
    // and restart it on every rotation.
  }, [cards.length, dismissed]);

  if (dismissed || cards.length === 0) return null;
  const card = cards[index % cards.length];
  if (!card) return null;

  return (
    <div
      aria-live="polite"
      className="activity-toast hidden sm:block"
      style={{ position: "fixed", top: 96, right: 18, zIndex: 60, pointerEvents: "none" }}
    >
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={`${card.slug}-${card.kind}-${index}`}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: 24, scale: 0.97 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, x: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: 16, scale: 0.98 }}
            transition={{ duration: reduce ? 0.15 : 0.34, ease: [0.22, 1, 0.36, 1] }}
            style={{ pointerEvents: "auto" }}
          >
            <Link
              href={`/${card.slug}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                width: 292,
                padding: "11px 13px",
                borderRadius: 14,
                textDecoration: "none",
                background: "rgba(255,252,248,0.95)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(61,12,17,0.14)",
                boxShadow: "0 10px 26px rgba(42,10,14,0.13)",
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 38,
                  height: 38,
                  flexShrink: 0,
                  borderRadius: 11,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 20,
                  background: "rgba(201,168,76,0.16)",
                }}
              >
                {card.emoji}
              </span>

              <span style={{ flex: 1, minWidth: 0 }}>
                <span
                  style={{
                    display: "block",
                    fontSize: 13,
                    lineHeight: 1.35,
                    color: "#2a0a0e",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {card.kind === "recent" && (
                    <>
                      Someone made a <strong style={{ fontWeight: 600 }}>{card.title}</strong> page
                    </>
                  )}
                  {card.kind === "count" && (
                    <strong style={{ fontWeight: 600 }}>{card.title}</strong>
                  )}
                  {card.kind === "promo" && (
                    <>
                      Make a <strong style={{ fontWeight: 600 }}>{card.title}</strong> page
                    </>
                  )}
                </span>
                <span style={{ display: "block", fontSize: 11.5, color: "#7a5555", marginTop: 2 }}>
                  {card.kind === "recent" && card.when}
                  {card.kind === "count" &&
                    `made ${card.count.toLocaleString("en-IN")} time${card.count === 1 ? "" : "s"}`}
                  {card.kind === "promo" && "takes about two minutes"}
                </span>
              </span>

              <ArrowUpRight size={15} style={{ color: "#9d7b7b", flexShrink: 0 }} />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {visible && (
        <button
          onClick={() => setDismissed(true)}
          aria-label="Stop showing these"
          style={{
            position: "absolute",
            top: -8,
            right: -8,
            // 24px is the WCAG 2.2 minimum target size (Lighthouse "target-size");
            // at 22px this was the only failing audit in desktop Accessibility.
            width: 24,
            height: 24,
            borderRadius: 999,
            border: "1px solid rgba(61,12,17,0.16)",
            background: "#fffcf8",
            color: "#7a5555",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            pointerEvents: "auto",
          }}
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}
