"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import { ARTICLE, PALETTE, TAP_TARGET_PX, TIMING, UI, type FakePage } from "./types";
import { sameOrigin } from "./atoms";

/* ── The fake page ───────────────────────────────────────────────────────────
 *
 * Deliberately plain. A personal blog from 2011: one column, Times-ish serif,
 * a rule under the title, no cards, no chips, no author avatar. The contrast
 * with the tidy search UI is a large part of the joke, so the temptation to
 * "improve" this screen should be resisted every single time.
 *
 * One of these pages is the actual letter. It is not styled differently, and
 * that is the point.
 */

export default function ArticlePage({
  page,
  onBack,
  reduced,
}: {
  page: FakePage;
  onBack: () => void;
  reduced: boolean;
}) {
  return (
    <div
      role="document"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "#fff",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        animation: reduced ? "none" : `srch-slide-in ${TIMING.pageSlideMs}ms ease-out both`,
      }}
    >
      {/* The address bar. It is the only thing tying this page back to the
          results, so it stays stuck to the top. */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 12px",
          background: "#f8f8f8",
          borderBottom: `1px solid ${PALETTE.border}`,
        }}
      >
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to results"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            minHeight: TAP_TARGET_PX,
            padding: "0 10px 0 4px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontFamily: UI,
            fontSize: 13.5,
            color: PALETTE.url,
            flex: "0 0 auto",
          }}
        >
          <ArrowLeft size={18} strokeWidth={1.8} />
          Back
        </button>
        <span
          style={{
            fontFamily: UI,
            fontSize: 12.5,
            color: PALETTE.greyLight,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {page.url}
        </span>
      </div>

      <article
        style={{
          maxWidth: 680,
          margin: "0 auto",
          padding: "30px 20px 90px",
          fontFamily: ARTICLE,
          color: "#111",
        }}
      >
        <h1
          style={{
            fontFamily: ARTICLE,
            fontSize: 30,
            fontWeight: 700,
            lineHeight: 1.22,
            margin: "0 0 10px",
            overflowWrap: "anywhere",
          }}
        >
          {page.title}
        </h1>
        <hr style={{ border: "none", borderTop: `1px solid ${PALETTE.border}`, margin: "0 0 22px" }} />

        {page.imageUrl && (
          <img
            src={sameOrigin(page.imageUrl, 750)}
            alt=""
            style={{ width: "100%", height: "auto", display: "block", margin: "0 0 22px" }}
          />
        )}

        {page.body.map((para, i) => (
          <p
            key={i}
            style={{
              fontFamily: ARTICLE,
              fontSize: 17.5,
              lineHeight: 1.72,
              margin: "0 0 18px",
            }}
          >
            {para}
          </p>
        ))}
      </article>
    </div>
  );
}
