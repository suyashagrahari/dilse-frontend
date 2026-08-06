"use client";

import { useCallback, useState } from "react";
import DetailSheet from "./DetailSheet";
import HeroBanner from "./HeroBanner";
import RowRail from "./RowRail";
import Top10Rail from "./Top10Rail";
import { BG, FONT_BODY, HIDE_SCROLLBAR_CLASS, TEXT } from "./theme";
import type { LoveflixData, RowItem } from "./types";

// ─── Screen 3: browse ────────────────────────────────────────────────────────
//
// Hero still, then rail after rail after rail. The density is the point — a
// catalogue with air between the rows reads as a mockup, so the vertical rhythm
// here is deliberately tight: at 380px the second rail is already peeking under
// the hero, and a 1440px laptop gets the whole catalogue at once.

export interface BrowseScreenProps {
  data: LoveflixData;
  onPlay: () => void;
  reducedMotion: boolean;
}

/**
 * Injected here rather than in the global stylesheet: the rails are the only
 * thing in the app that needs it, and `app/globals.css` is shared with every
 * other template. One <style> element, rendered once, used by every rail.
 */
const RAIL_SCROLLBAR_CSS = `
.${HIDE_SCROLLBAR_CLASS}{scrollbar-width:none;-ms-overflow-style:none;}
.${HIDE_SCROLLBAR_CLASS}::-webkit-scrollbar{display:none;width:0;height:0;}
`;

interface OpenedItem {
  item: RowItem;
  rowTitle: string;
}

export default function BrowseScreen({ data, onPlay, reducedMotion }: BrowseScreenProps) {
  // The detail sheet lives here so it can name the rail an item came from.
  // `null` is closed — there is no separate open flag to fall out of sync.
  const [opened, setOpened] = useState<OpenedItem | null>(null);
  const closeSheet = useCallback(() => setOpened(null), []);

  const rows = data.rows ?? [];

  return (
    <div
      style={{
        background: BG,
        color: TEXT,
        fontFamily: FONT_BODY,
        minHeight: "100%",
        // The last rail must not sit flush against the viewport edge.
        paddingBottom: "clamp(56px, 9vh, 96px)",
      }}
    >
      <style>{RAIL_SCROLLBAR_CSS}</style>

      <HeroBanner data={data} onPlay={onPlay} reducedMotion={reducedMotion} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "clamp(14px, 2vw, 26px)",
          marginTop: "clamp(6px, 1.2vw, 16px)",
        }}
      >
        {rows.map((row, i) =>
          row.kind === "top10" ? (
            <Top10Rail
              key={`${row.title}-${i}`}
              row={row}
              reducedMotion={reducedMotion}
              onOpenItem={(item) => setOpened({ item, rowTitle: row.title })}
            />
          ) : (
            <RowRail
              key={`${row.title}-${i}`}
              row={row}
              reducedMotion={reducedMotion}
              onOpenItem={(item) => setOpened({ item, rowTitle: row.title })}
            />
          ),
        )}
      </div>

      <DetailSheet
        item={opened?.item ?? null}
        rowTitle={opened?.rowTitle ?? ""}
        onClose={closeSheet}
        reducedMotion={reducedMotion}
      />
    </div>
  );
}
