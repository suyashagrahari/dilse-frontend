"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { wallCaption, wallDate, builderHref } from "@/lib/wall/format";
import type { WallEntry } from "@/lib/wall/types";
import WallPreview from "./WallPreview";
import WallSheet from "./WallSheet";
import { UI } from "./ui";

// ─── The grid ────────────────────────────────────────────────────────────────
//
// A gallery, not a feed. Nothing loops, nothing auto-refreshes, nothing slides
// in on a timer. The only motion is a one-off stagger as the cards first paint.
//
// ── THE SPARSE LAYOUT IS THE POINT ──────────────────────────────────────────
//
// Under six entries the grid becomes a single column of large cards. Same data,
// different composition — five cards laid out as five large ones reads as
// curated, where the same five spread across a four-column grid reads as
// abandoned. This is the honest answer to "the Wall looks empty": change the
// layout, not the number of rows.

const SPARSE_THRESHOLD = 6;

const GRID_CSS = `
.wall-grid {
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
@media (min-width: 700px)  { .wall-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (min-width: 1100px) { .wall-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 22px; } }

/*
  Few entries: a narrow centred column instead of a wide sparse row.

  Capped at 320px rather than the full column width. A 4:5 card at 460px is
  575px tall — one entry fills a laptop screen, and two look like a mistake.
  At 320px the same card reads as a considered single column, and the page
  still scrolls like a gallery rather than a slideshow.
*/
.wall-grid--sparse {
  grid-template-columns: minmax(0, 1fr);
  max-width: 300px;
  margin: 0 auto;
  gap: 22px;
}
@media (min-width: 700px) { .wall-grid--sparse { max-width: 320px; } }

.wall-card {
  display: block;
  text-decoration: none;
  color: inherit;
  border: 1px solid ${UI.border};
  border-radius: 12px;
  overflow: hidden;
  background: ${UI.surface};
  cursor: pointer;
  text-align: left;
  padding: 0;
  width: 100%;
  font: inherit;
  transition: border-color 160ms ease, transform 160ms ease;
}
.wall-card:hover { border-color: rgba(61,12,17,0.34); transform: translateY(-2px); }
@media (prefers-reduced-motion: reduce) {
  .wall-card { transition: none; }
  .wall-card:hover { transform: none; }
}
`;

export default function WallGrid({ entries, now }: { entries: WallEntry[]; now: number }) {
  const [open, setOpen] = useState<WallEntry | null>(null);
  const reduce = useReducedMotion();
  const sparse = entries.length < SPARSE_THRESHOLD;

  return (
    <>
      <style>{GRID_CSS}</style>

      <div className={`wall-grid${sparse ? " wall-grid--sparse" : ""}`}>
        {entries.map((entry, i) => {
          const c = wallCaption(entry);
          return (
            <motion.div
              key={entry.id}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                reduce
                  ? { duration: 0 }
                  : // Capped so a full page of cards does not end with a card
                    // appearing two seconds after the first.
                    { duration: 0.32, delay: Math.min(i * 0.035, 0.5), ease: [0.22, 1, 0.36, 1] }
              }
            >
              {/*
                A real link to the builder, so this works with JavaScript off —
                which is also how a crawler sees it. With JS on, the click opens
                the detail sheet instead, and the sheet's own CTA goes to the
                same place. Nothing is reachable only through the overlay.
              */}
              <a
                className="wall-card"
                href={builderHref(entry.templateSlug)}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                  e.preventDefault();
                  setOpen(entry);
                }}
              >
                {/* "md" even in the sparse column: that column is capped at
                    320px, so the large type sized for the sheet would overflow
                    a two-word pair of names. */}
                <WallPreview entry={entry} size="md" />

                <div style={{ padding: "13px 15px 15px" }}>
                  <div
                    style={{
                      fontSize: 14,
                      lineHeight: 1.4,
                      color: UI.text,
                      overflowWrap: "anywhere",
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{c.lead}</span>
                    <span style={{ color: UI.textMuted }}>{c.joiner}</span>
                    <span style={{ fontWeight: 600 }}>{c.trail}</span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 9,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        padding: "3px 8px",
                        borderRadius: 999,
                        border: `1px solid ${UI.border}`,
                        color: UI.textMuted,
                      }}
                    >
                      {entry.templateName}
                    </span>

                    {/* Team-made entries say so, every time they are rendered.
                        They are also excluded from every count on the page. */}
                    {entry.isExample && (
                      <span
                        style={{
                          fontSize: 11,
                          padding: "3px 8px",
                          borderRadius: 999,
                          border: `1px solid ${UI.accent}`,
                          color: "#6b5416",
                          background: "rgba(201,168,76,0.14)",
                          fontWeight: 600,
                        }}
                      >
                        Example
                      </span>
                    )}

                    <span style={{ fontSize: 12, color: UI.textFaint, marginLeft: "auto" }}>
                      {wallDate(entry.createdAt, now)}
                    </span>
                  </div>
                </div>
              </a>
            </motion.div>
          );
        })}
      </div>

      <WallSheet entry={open} now={now} onClose={() => setOpen(null)} />
    </>
  );
}
