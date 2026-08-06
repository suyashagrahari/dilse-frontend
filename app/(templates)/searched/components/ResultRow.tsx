"use client";

import React from "react";
import { PALETTE, TIMING, UI, type SearchResult } from "./types";
import { InitialCircle, Snippet } from "./atoms";

/* ── One organic result ──────────────────────────────────────────────────────
 *
 * The hierarchy is the whole recognition, and it is the hierarchy people get
 * backwards: URL breadcrumb FIRST in small dark grey, then the title in the
 * link colour, then the grey snippet. Title-first reads as a blog listing.
 *
 * The favicon is a generated initial circle. Never a fetched one — a real
 * favicon request would leak the recipient's page to a third party and would
 * also, most of the time, 404 into a broken square.
 */

export default function ResultRow({
  result,
  index,
  reduced,
  onOpen,
}: {
  result: SearchResult;
  index: number;
  reduced: boolean;
  onOpen: (result: SearchResult) => void;
}) {
  const host = (result.url || "").split("›")[0].trim() || result.title;

  return (
    <article
      style={{
        marginBottom: 28,
        animation: reduced
          ? "none"
          : `srch-rise 260ms ease-out ${index * TIMING.resultStaggerMs}ms both`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        {result.badge && (
          <span
            style={{
              fontFamily: UI,
              fontSize: 11.5,
              fontWeight: 700,
              color: PALETTE.ink,
              border: `1px solid ${PALETTE.border}`,
              borderRadius: 3,
              padding: "1px 5px",
              lineHeight: 1.5,
              flex: "0 0 auto",
            }}
          >
            {result.badge}
          </span>
        )}
        <InitialCircle name={host} size={26} fontScale={0.5} />
        <span
          style={{
            fontFamily: UI,
            fontSize: 12.5,
            lineHeight: 1.3,
            color: PALETTE.url,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {result.url}
        </span>
      </div>

      <h3 style={{ margin: "0 0 4px" }}>
        <button
          type="button"
          onClick={() => onOpen(result)}
          className="srch-link"
          style={{
            fontFamily: UI,
            fontSize: 20,
            lineHeight: 1.3,
            fontWeight: 400,
            color: PALETTE.link,
            background: "transparent",
            border: "none",
            padding: 0,
            textAlign: "left",
            cursor: "pointer",
          }}
        >
          {result.title}
        </button>
      </h3>

      <Snippet text={result.snippet} lines={2} />
    </article>
  );
}
