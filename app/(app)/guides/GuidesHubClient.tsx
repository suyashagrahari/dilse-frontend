"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Play, FileText, Clock, ListChecks, ArrowRight, Search, X } from "lucide-react";
import type { ProductGuide } from "@/types/product-guide";
import { GUIDE_CATEGORIES } from "@/data/guide-registry";
import { guideVideoSet } from "@/lib/templateMedia";
import { formatDuration, stepCount } from "@/lib/guides";

const GOLD = "#c9a84c";
const INK = "#2a0a0e";
const MAROON = "#3d0c11";
const MUTED = "#7a5555";

/**
 * The tab set.
 *
 * "All" first, then the two *format* tabs, then the subject categories. That
 * order is deliberate and it is not the obvious one — the obvious layout is
 * subject tabs only, with format as a filter chip somewhere.
 *
 * It is wrong here because format is the axis people actually arrive on. The
 * question in someone's head is "is there a video for this?", not "show me the
 * festival ones" — there are two festival guides and they can see both without
 * a tab. Video vs. written is the choice that changes what they do next, so it
 * gets the prominent position. Subject tabs are there to keep the shape right
 * as the list grows past a screenful.
 */
type Tab = { id: string; label: string; emoji?: string; icon?: React.ReactNode };

export default function GuidesHubClient({ guides }: { guides: ProductGuide[] }) {
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");

  const tabs: Tab[] = useMemo(() => {
    const present = new Set(guides.map((g) => g.category));
    return [
      { id: "all", label: "All guides", emoji: "✦" },
      { id: "video", label: "Video", icon: <Play size={12} fill="currentColor" strokeWidth={0} /> },
      { id: "docs", label: "Written", icon: <FileText size={12} /> },
      ...GUIDE_CATEGORIES.filter((c) => present.has(c.id)).map((c) => ({
        id: c.id, label: c.label, emoji: c.emoji,
      })),
    ];
  }, [guides]);

  const shown = useMemo(() => {
    let list = guides;
    if (tab === "video") list = list.filter((g) => g.video);
    // Every guide has written steps, so the Written tab is not a filter on
    // existence — it is a filter on *sufficiency*. It shows guides you can
    // complete without watching anything, which is all of them, but sorted so
    // the most thoroughly documented come first.
    else if (tab === "docs") list = [...list].sort((a, b) => stepCount(b) - stepCount(a));
    else if (tab !== "all") list = list.filter((g) => g.category === tab);

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((g) =>
        [g.title, g.tagline, g.summary, g.templateName, ...g.sections.map((s) => s.title)]
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }
    return list;
  }, [guides, tab, query]);

  return (
    <>
      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <div className="mt-8 md:mt-10">
        <div
          className="flex items-center gap-1.5 overflow-x-auto pb-2 -mx-3 px-3 md:mx-0 md:px-0 md:justify-center"
          style={{ scrollbarWidth: "none" }}
          role="tablist"
          aria-label="Guide categories"
        >
          {tabs.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  flexShrink: 0, cursor: "pointer",
                  padding: "9px 15px", borderRadius: 999,
                  fontSize: 12, fontWeight: 700,
                  letterSpacing: "0.06em", textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  color: active ? "#f5ede6" : INK,
                  background: active
                    ? `linear-gradient(180deg,${MAROON},${INK})`
                    : "rgba(255,255,255,0.72)",
                  border: active
                    ? `1px solid ${GOLD}`
                    : "1px solid rgba(61,12,17,0.14)",
                  boxShadow: active ? "0 6px 18px rgba(61,12,17,0.22)" : "none",
                  transition: "all 180ms ease",
                }}
              >
                {t.icon ?? <span aria-hidden style={{ fontSize: 12 }}>{t.emoji}</span>}
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Search sits under the tabs rather than beside them: on a phone a
            search field competing with a scrolling tab strip for the same row
            leaves neither usable. */}
        <div className="mt-4 flex justify-center">
          <div
            style={{
              position: "relative", display: "flex", alignItems: "center",
              width: "min(420px, 100%)", height: 42, borderRadius: 999,
              background: "rgba(255,255,255,0.82)",
              border: "1px solid rgba(61,12,17,0.14)",
            }}
          >
            <Search size={14} style={{ position: "absolute", left: 15, color: "#9a7070" }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search guides, steps, templates…"
              aria-label="Search guides"
              style={{
                width: "100%", height: "100%", paddingLeft: 38, paddingRight: 38,
                fontSize: 13.5, background: "transparent", border: "none",
                outline: "none", color: INK, borderRadius: 999,
              }}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear search"
                style={{
                  position: "absolute", right: 12, width: 19, height: 19,
                  borderRadius: "50%", background: "#9a7070", color: "#f5ede6",
                  display: "grid", placeItems: "center", border: "none", cursor: "pointer",
                }}
              >
                <X size={11} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Grid ───────────────────────────────────────────────────────────── */}
      <div className="mt-8 md:mt-10">
        <AnimatePresence mode="popLayout">
          {shown.length === 0 ? (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center py-16"
              style={{ color: MUTED, fontSize: 15 }}
            >
              No guide matches that yet. Every template still has step-by-step help on its own
              page — and you can{" "}
              <Link href="/contact-us" style={{ color: GOLD, fontWeight: 700 }}>ask us for one</Link>.
            </motion.p>
          ) : (
            <motion.div
              key={`${tab}-${query}`}
              layout
              className="grid gap-5 md:gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {shown.map((g, i) => (
                <GuideCard key={g.slug} guide={g} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

function GuideCard({ guide, index }: { guide: ProductGuide; index: number }) {
  const media = guideVideoSet(guide.slug);
  const steps = stepCount(guide);
  // A poster that 404s must not leave a dead grey rectangle where the most
  // eye-catching part of the card should be. This happens for real: the media
  // lives in S3 and the code ships ahead of the upload, so between a deploy and
  // an `upload:guide-media` run every poster is missing. Falling back to the
  // guide's emoji on the same gradient the docs-only cards use keeps the grid
  // looking deliberate instead of broken.
  const [posterFailed, setPosterFailed] = useState(false);
  const video = guide.video;
  const posterRef = useRef<HTMLImageElement>(null);

  // ── WHY onError ALONE IS NOT ENOUGH ────────────────────────────────────────
  //
  // The <img> is server-rendered, so the browser begins fetching it during HTML
  // parse — long before React hydrates and attaches the onError handler. On a
  // fast failure (a 403 from S3 for a key that has not been uploaded yet) the
  // error event has already fired and gone by the time anything is listening,
  // and the card is left showing a dead grey rectangle forever.
  //
  // So the handler covers failures *after* hydration, and this effect covers the
  // ones that already happened: a decoded image reports complete && naturalWidth
  // > 0, whereas one that failed reports complete && naturalWidth === 0. Checking
  // once on mount catches exactly the case onError structurally cannot.
  useEffect(() => {
    const el = posterRef.current;
    if (el && el.complete && el.naturalWidth === 0) setPosterFailed(true);
  }, []);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay: Math.min(index * 0.05, 0.3), ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/guides/${guide.slug}`}
        className="group block h-full"
        style={{ textDecoration: "none" }}
      >
        <div
          className="h-full flex flex-col overflow-hidden rounded-3xl transition-transform duration-300 group-hover:-translate-y-1"
          style={{
            border: "1px solid rgba(61,12,17,0.14)",
            background: "rgba(255,255,255,0.86)",
            boxShadow: "0 8px 24px rgba(61,12,17,0.07)",
          }}
        >
          {/* Poster. The whole reason a video guide reads differently from a
              written one at a glance — you can see the actual product in it. */}
          <div style={{ position: "relative", aspectRatio: "16 / 9", background: "#efe4d8", overflow: "hidden" }}>
            {video && !posterFailed ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={posterRef}
                  src={media.poster}
                  alt=""
                  aria-hidden
                  onError={() => setPosterFailed(true)}
                  loading={index < 3 ? "eager" : "lazy"}
                  className="transition-transform duration-500 group-hover:scale-[1.04]"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
                <span
                  style={{
                    position: "absolute", inset: 0, display: "grid", placeItems: "center",
                    background: "linear-gradient(180deg,rgba(26,5,8,0.05),rgba(26,5,8,0.42))",
                  }}
                >
                  <span
                    style={{
                      width: 52, height: 52, borderRadius: "50%", display: "grid",
                      placeItems: "center", background: "rgba(245,237,230,0.94)",
                      border: `1px solid ${GOLD}`, color: MAROON, paddingLeft: 4,
                      boxShadow: "0 8px 22px rgba(0,0,0,0.3)",
                    }}
                  >
                    <Play size={21} fill={MAROON} strokeWidth={0} />
                  </span>
                </span>
                <span
                  style={{
                    position: "absolute", right: 10, bottom: 10,
                    fontSize: 11, fontWeight: 700, fontVariantNumeric: "tabular-nums",
                    color: "#f5ede6", background: "rgba(26,5,8,0.74)",
                    padding: "3px 8px", borderRadius: 6, letterSpacing: "0.03em",
                  }}
                >
                  {formatDuration(video.seconds)}
                </span>
              </>
            ) : (
              <>
                <span
                  style={{
                    position: "absolute", inset: 0, display: "grid", placeItems: "center",
                    background: `linear-gradient(140deg,${guide.accent}18,rgba(201,168,76,0.14))`,
                    fontSize: 46,
                  }}
                >
                  {guide.emoji}
                </span>
                {video && (
                  <>
                    <span
                      style={{
                        position: "absolute", inset: 0, display: "grid", placeItems: "center",
                      }}
                    >
                      <span
                        style={{
                          width: 52, height: 52, borderRadius: "50%", display: "grid",
                          placeItems: "center", background: "rgba(245,237,230,0.94)",
                          border: `1px solid ${GOLD}`, color: MAROON, paddingLeft: 4,
                          boxShadow: "0 8px 22px rgba(61,12,17,0.18)",
                        }}
                      >
                        <Play size={21} fill={MAROON} strokeWidth={0} />
                      </span>
                    </span>
                    <span
                      style={{
                        position: "absolute", right: 10, bottom: 10,
                        fontSize: 11, fontWeight: 700, fontVariantNumeric: "tabular-nums",
                        color: "#f5ede6", background: "rgba(26,5,8,0.74)",
                        padding: "3px 8px", borderRadius: 6, letterSpacing: "0.03em",
                      }}
                    >
                      {formatDuration(video.seconds)}
                    </span>
                  </>
                )}
              </>
            )}
          </div>

          <div style={{ height: 3, background: `linear-gradient(90deg,${MAROON},${guide.accent},${GOLD})` }} />

          <div className="flex flex-col flex-1 p-5 md:p-6">
            <p style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: GOLD, margin: 0 }}>
              {guide.emoji} {guide.tagline}
            </p>

            <h2
              className="mt-2.5"
              style={{
                fontFamily: "'Playfair Display', serif", fontWeight: 700,
                fontSize: "clamp(20px, 2.2vw, 24px)", lineHeight: 1.14,
                letterSpacing: "-0.02em", color: INK, margin: 0,
              }}
            >
              {guide.title}
            </h2>

            <p className="mt-2.5" style={{ fontSize: 13.5, lineHeight: 1.62, color: MUTED, margin: 0 }}>
              {guide.summary}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-3.5 gap-y-2" style={{ marginTop: "auto", paddingTop: 16 }}>
              <Meta icon={<ListChecks size={12} />} label={`${steps} steps`} />
              <Meta icon={<Clock size={12} />} label={guide.buildTime.replace("About ", "")} />
              {guide.video && <Meta icon={<Play size={11} fill="currentColor" strokeWidth={0} />} label="Video" />}
            </div>

            <span
              className="mt-4 inline-flex items-center gap-1.5"
              style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: MAROON }}
            >
              Open guide
              <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

function Meta({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 600, color: MUTED }}>
      <span style={{ color: GOLD, display: "inline-flex" }}>{icon}</span>
      {label}
    </span>
  );
}
