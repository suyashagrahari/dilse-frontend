"use client";

import React from "react";
import { ARTICLE, PALETTE, UI, type KnowledgePanel as Panel } from "./types";
import { InitialCircle, SafePhoto, sameOrigin } from "./atoms";
import { firstNameOf } from "./demoData";

/* ── The knowledge panel ─────────────────────────────────────────────────────
 *
 * The primary share card, and the one block on the page designed to stand
 * alone. It is FIRST in the DOM: on a phone that puts it above the results,
 * which is both the correct convention and the best screenshot.
 *
 * One 1px border. No shadow, no gradient, no accent bar. It is a card of facts.
 */

export default function KnowledgePanel({
  panel,
  name,
  photoUrl,
}: {
  panel: Panel;
  name: string;
  photoUrl: string;
}) {
  const hasFacts = panel.facts.length > 0;
  const hasAlso = panel.alsoSearchFor.length > 0;
  const first = firstNameOf(name) || name;
  // 25+ character names have to stay on the card, so the size gives way first.
  const nameSize = name.length > 24 ? 22 : name.length > 17 ? 26 : 30;

  return (
    <aside
      aria-label={`About ${name}`}
      style={{
        border: `1px solid ${PALETTE.border}`,
        borderRadius: 10,
        background: "#fff",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: 16 }}>
        <SafePhoto src={sameOrigin(photoUrl, 640)} name={name} size={196} radius={8} />
      </div>

      <div style={{ padding: "0 16px 16px" }}>
        <h2
          style={{
            fontFamily: ARTICLE,
            fontSize: nameSize,
            fontWeight: 400,
            lineHeight: 1.15,
            color: PALETTE.ink,
            margin: 0,
            overflowWrap: "anywhere",
          }}
        >
          {name}
        </h2>
        {panel.subtitle && (
          <p style={{ fontFamily: UI, fontSize: 13.5, color: PALETTE.grey, margin: "5px 0 0" }}>
            {panel.subtitle}
          </p>
        )}

        {panel.description && (
          <p
            style={{
              fontFamily: UI,
              fontSize: 14,
              lineHeight: 1.62,
              color: PALETTE.ink,
              margin: "14px 0 0",
            }}
          >
            {panel.description}
          </p>
        )}

        {hasFacts && (
          <dl style={{ margin: "16px 0 0", display: "grid", gap: 9 }}>
            {panel.facts.map((f, i) => (
              <div key={`${f.label}-${i}`} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                {/* No dot leaders. A label and a value, like a spec sheet. */}
                <dt
                  style={{
                    fontFamily: UI,
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: PALETTE.ink,
                    flex: "0 0 auto",
                  }}
                >
                  {f.label}
                  {f.label ? ":" : ""}
                </dt>
                <dd style={{ fontFamily: UI, fontSize: 13.5, color: PALETTE.grey, margin: 0, minWidth: 0 }}>
                  {f.value}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {panel.quote && (
          <figure style={{ margin: "18px 0 0", paddingTop: 14, borderTop: `1px solid ${PALETTE.border}` }}>
            <blockquote
              style={{
                fontFamily: ARTICLE,
                fontStyle: "italic",
                fontSize: 16,
                lineHeight: 1.5,
                color: PALETTE.ink,
                margin: 0,
              }}
            >
              &ldquo;{panel.quote}&rdquo;
            </blockquote>
            <figcaption style={{ fontFamily: UI, fontSize: 12, color: PALETTE.greyLight, marginTop: 7 }}>
              — {first}, on the evening in question
            </figcaption>
          </figure>
        )}
      </div>

      {hasAlso && (
        <div style={{ borderTop: `1px solid ${PALETTE.border}`, padding: "14px 16px 16px" }}>
          <h3
            style={{
              fontFamily: UI,
              fontSize: 13,
              fontWeight: 700,
              color: PALETTE.ink,
              margin: "0 0 11px",
            }}
          >
            People also search for
          </h3>
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              gap: 16,
              overflowX: "auto",
            }}
          >
            {panel.alsoSearchFor.map((who) => (
              <li key={who} style={{ textAlign: "center", flex: "0 0 auto", width: 56 }}>
                <InitialCircle name={who} size={44} />
                <p
                  style={{
                    fontFamily: UI,
                    fontSize: 11.5,
                    color: PALETTE.grey,
                    margin: "6px 0 0",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {who}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
