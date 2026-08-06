// ─── The poem ────────────────────────────────────────────────────────────────
//
// Both columns of daily words, chronological, unpunctuated. It is not really a
// poem and everyone knows that — it works because it is EVIDENCE. Two people
// each said one true word a day for four months and this is what came out.
//
// A day where only one of them checked in KEEPS ITS ROW with the other side
// blank. Skipping it would quietly rewrite the record into something tidier
// than what happened, and the gaps are half of what makes it read as real.

"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { exportNodeToPng, fileSlug } from "@/lib/exportPng";
import { PALETTE, SERIF, UI, buildPoem, truncWord, type StreakData } from "./types";
import { ARCHIVE_COPY } from "./archiveCopy";

/** 9:16 at 360 logical px → 1080 × 1920 at pixelRatio 3. */
export const CARD_W = 360;
export const CARD_H = 640;

/**
 * How many rows fit the 9:16 card.
 *
 * 640 logical px minus 72 of padding, ~80 of header and ~20 of footer leaves
 * ~468, and each row is 15px × 1.85 ≈ 27.8. Sixteen rows fills it without the
 * last one being sliced in half by the bottom edge — which is what 22 did.
 */
const CARD_ROWS = 16;

/**
 * `truncWord` caps at `LIMITS.word` (20) and the contract does not expose a
 * shorter cap, so the card's narrow columns clip in CSS rather than by
 * re-truncating — which also keeps an emoji-only word from being cut mid-pair.
 */
const cardWord: React.CSSProperties = {
  fontFamily: SERIF,
  fontSize: 15,
  lineHeight: 1.85,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export interface PoemProps {
  data: StreakData;
  onBack: () => void;
  onToast: (message: string) => void;
}

export default function Poem({ data, onBack, onToast }: PoemProps) {
  const rows = useMemo(() => buildPoem(data), [data]);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [saving, setSaving] = useState(false);

  const save = useCallback(async () => {
    setSaving(true);
    // Pausing the subtree first is what keeps a half-faded row out of the file.
    // `exportNodeToPng` already awaits `document.fonts.ready`.
    const node = cardRef.current;
    node?.classList.add("streak-frozen");
    const result = await exportNodeToPng(node, {
      width: CARD_W,
      height: CARD_H,
      pixelRatio: 3,
      backgroundColor: PALETTE.paper,
      filename: `${fileSlug(data.pair.a.name)}-${fileSlug(data.pair.b.name)}-poem`,
    });
    node?.classList.remove("streak-frozen");
    setSaving(false);
    onToast(result.message);
  }, [data.pair.a.name, data.pair.b.name, onToast]);

  const cardRows = rows.slice(-CARD_ROWS);

  return (
    <div className="w-full flex flex-col items-center gap-5" style={{ maxWidth: 360 }}>
      <div className="w-full flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-full px-3"
          style={{
            minHeight: 44,
            fontFamily: UI,
            fontSize: 13,
            color: PALETTE.inkSoft,
            background: "transparent",
            border: `1px solid ${PALETTE.edge}`,
          }}
        >
          <ArrowLeft size={15} /> {ARCHIVE_COPY.archive.back}
        </button>
        <span className="flex-1" />
        <h2 style={{ fontFamily: SERIF, fontSize: 19, color: PALETTE.ink }}>{ARCHIVE_COPY.poem.title}</h2>
      </div>

      {rows.length === 0 ? (
        <p className="text-center" style={{ fontFamily: SERIF, fontSize: 17, color: PALETTE.inkSoft }}>
          {ARCHIVE_COPY.poem.empty}
        </p>
      ) : (
        <>
          <p style={{ fontFamily: UI, fontSize: 11.5, letterSpacing: "0.07em", color: PALETTE.inkFaint }}>
            {ARCHIVE_COPY.poem.subtitle}
          </p>

          <div className="w-full flex" style={{ gap: 18 }}>
            <span className="flex-1" style={{ fontFamily: UI, fontSize: 10.5, letterSpacing: "0.08em", color: PALETTE.inkFaint, textAlign: "right" }}>
              {data.pair.a.name}
            </span>
            <span style={{ width: 1 }} />
            <span className="flex-1" style={{ fontFamily: UI, fontSize: 10.5, letterSpacing: "0.08em", color: PALETTE.inkFaint }}>
              {data.pair.b.name}
            </span>
          </div>

          <div className="w-full flex" style={{ gap: 18 }}>
            <div className="flex-1" style={{ textAlign: "right" }}>
              {rows.map((r) => (
                // Generous line height. The empty rows are the point, so they
                // are rendered as a full-height blank rather than collapsed.
                <p
                  key={`a-${r.date}`}
                  style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 2.1, color: r.a ? PALETTE.ink : PALETTE.edge }}
                >
                  {r.a ? truncWord(r.a) : "·"}
                </p>
              ))}
            </div>
            <div style={{ width: 1, background: PALETTE.edge }} />
            <div className="flex-1">
              {rows.map((r) => (
                <p
                  key={`b-${r.date}`}
                  style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 2.1, color: r.b ? PALETTE.ink : PALETTE.edge }}
                >
                  {r.b ? truncWord(r.b) : "·"}
                </p>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full px-4"
            style={{
              minHeight: 44,
              fontFamily: UI,
              fontSize: 13,
              color: PALETTE.paper,
              background: PALETTE.ink,
              border: "none",
            }}
          >
            <Download size={15} /> {saving ? ARCHIVE_COPY.share.saving : ARCHIVE_COPY.share.save}
          </button>
        </>
      )}

      {/* ── The 9:16 card. Rendered off-screen at true size, never scaled: a
             transform on the captured node is trap 2 in `lib/exportPng`. ── */}
      <div style={{ position: "fixed", left: -10000, top: 0, pointerEvents: "none" }} aria-hidden="true">
        <div
          ref={cardRef}
          style={{
            width: CARD_W,
            height: CARD_H,
            background: PALETTE.paper,
            padding: "36px 28px",
            display: "flex",
            flexDirection: "column",
            boxSizing: "border-box",
          }}
        >
          <p style={{ fontFamily: UI, fontSize: 10, letterSpacing: "0.16em", color: PALETTE.inkFaint, textAlign: "center" }}>
            {data.pair.a.name.toUpperCase()} &nbsp;·&nbsp; {data.pair.b.name.toUpperCase()}
          </p>
          <p style={{ fontFamily: SERIF, fontSize: 22, color: PALETTE.ink, textAlign: "center", marginTop: 6 }}>
            {ARCHIVE_COPY.poem.title}
          </p>
          <div style={{ flex: 1, display: "flex", gap: 16, marginTop: 20, overflow: "hidden" }}>
            <div style={{ flex: 1, textAlign: "right" }}>
              {cardRows.map((r) => (
                <p key={`ca-${r.date}`} style={{ ...cardWord, color: r.a ? PALETTE.ink : PALETTE.edge }}>
                  {r.a ? truncWord(r.a) : "·"}
                </p>
              ))}
            </div>
            <div style={{ width: 1, background: PALETTE.edge }} />
            <div style={{ flex: 1 }}>
              {cardRows.map((r) => (
                <p key={`cb-${r.date}`} style={{ ...cardWord, color: r.b ? PALETTE.ink : PALETTE.edge }}>
                  {r.b ? truncWord(r.b) : "·"}
                </p>
              ))}
            </div>
          </div>
          <p style={{ fontFamily: UI, fontSize: 9.5, letterSpacing: "0.14em", color: PALETTE.inkFaint, textAlign: "center" }}>
            SUBHSANDESH
          </p>
        </div>
      </div>
    </div>
  );
}
