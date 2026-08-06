"use client";

import React from "react";
import { ARTICLE, COPY, PALETTE, UI, type SearchData } from "./types";
import { SafePhoto, sameOrigin, Wordmark } from "./atoms";

/* ── The share card ──────────────────────────────────────────────────────────
 *
 * 9:16, built around the knowledge panel because that is the block that stands
 * alone. Rendered at 360×640 CSS px and captured at pixelRatio 3 → 1080×1920.
 *
 * The results-count line sits at the very top: without it the card is just a
 * photo and a fact table, and the fact table is only funny once you know it
 * came off a search page.
 */

export const SHARE_CARD_W = 360;
export const SHARE_CARD_H = 640;

export default function ShareCard({
  data,
  attach,
}: {
  data: SearchData;
  attach: (el: HTMLDivElement | null) => void;
}) {
  const { recipient, knowledgePanel: kp } = data;
  const facts = kp.facts.slice(0, 5);
  const nameSize = recipient.name.length > 24 ? 26 : recipient.name.length > 17 ? 32 : 38;

  return (
    // Two elements on purpose. The OUTER one is off-screen; the INNER one — the
    // one handed to the exporter — is statically positioned at 0,0 inside it.
    // `html-to-image` clones the node it is given into a foreignObject at the
    // origin, so a `position: fixed; left: -20000px` on the captured node
    // itself renders the whole card outside the canvas and the PNG comes out
    // blank at exactly the right dimensions. That is a silent failure and it
    // has already cost one export.
    <div
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: -20000,
        width: SHARE_CARD_W,
        height: SHARE_CARD_H,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
    <div
      ref={attach}
      style={{
        position: "relative",
        width: SHARE_CARD_W,
        height: SHARE_CARD_H,
        background: PALETTE.bg,
        display: "flex",
        flexDirection: "column",
        padding: 22,
        boxSizing: "border-box",
      }}
    >
      <p style={{ fontFamily: UI, fontSize: 11, color: PALETTE.grey, margin: 0 }}>
        {COPY.resultsLine(data.resultCount, data.searchSeconds)}
      </p>

      <div
        style={{
          marginTop: 12,
          border: `1px solid ${PALETTE.border}`,
          borderRadius: 10,
          background: "#fff",
          padding: 16,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <SafePhoto src={sameOrigin(recipient.photoUrl, 640)} name={recipient.name} size={230} radius={8} />

        <h1
          style={{
            fontFamily: ARTICLE,
            fontSize: nameSize,
            fontWeight: 400,
            lineHeight: 1.12,
            color: PALETTE.ink,
            margin: "14px 0 0",
            overflowWrap: "anywhere",
          }}
        >
          {recipient.name}
        </h1>
        {kp.subtitle && (
          <p style={{ fontFamily: UI, fontSize: 12.5, color: PALETTE.grey, margin: "5px 0 0" }}>
            {kp.subtitle}
          </p>
        )}

        <dl style={{ margin: "14px 0 0", display: "grid", gap: 7 }}>
          {facts.map((f, i) => (
            <div key={`${f.label}-${i}`} style={{ display: "flex", gap: 7, alignItems: "baseline" }}>
              <dt style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: PALETTE.ink, flex: "0 0 auto" }}>
                {f.label}
                {f.label ? ":" : ""}
              </dt>
              <dd style={{ fontFamily: UI, fontSize: 12, color: PALETTE.grey, margin: 0, minWidth: 0 }}>
                {f.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10, marginTop: 12 }}>
        <Wordmark name={recipient.name} size={15} />
        <span style={{ fontFamily: UI, fontSize: 10, color: PALETTE.greyLight, whiteSpace: "nowrap" }}>
          SubhSandesh
        </span>
      </div>
    </div>
    </div>
  );
}
