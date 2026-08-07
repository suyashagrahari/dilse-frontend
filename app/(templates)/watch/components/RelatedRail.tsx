"use client";

// ─── The related rail ────────────────────────────────────────────────────────
//
// 400px down the right on a wide screen, and BELOW the comments on a phone —
// not above them. On a phone the comments are the second thing anybody wants
// after the video itself, and a rail of six thumbnails between the two is a
// wall.
//
// A card either has an embed id or it does not, and that difference is the
// whole interaction: one loads into the player, the other is a video that only
// exists as a joke and says so when you tap it.

import type { RelatedVideo } from "./types";
import { FONT, SafeImage, T, ThumbFallback } from "./theme";

const CHIPS = ["All", "From us", "Music", "Live"] as const;

export interface RelatedRailProps {
  items: readonly RelatedVideo[];
  onPick: (item: RelatedVideo) => void;
  /** Highlighted while its video is the one loaded in the player. */
  activeId?: string | null;
  chip: string;
  onChip: (chip: string) => void;
}

export default function RelatedRail({ items, onPick, activeId, chip, onChip }: RelatedRailProps) {
  return (
    <aside className="wt-rail" aria-label="More from this channel">
      <div className="wt-chips">
        {CHIPS.map((c) => (
          <button
            key={c}
            type="button"
            className={`wt-chip${chip === c ? " is-on" : ""}`}
            onClick={() => onChip(c)}
            aria-pressed={chip === c}
          >
            {c}
          </button>
        ))}
      </div>

      <ul className="wt-rail-list">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={`wt-card${activeId === item.id ? " is-on" : ""}`}
              onClick={() => onPick(item)}
            >
              <span className="wt-card-thumb">
                <SafeImage
                  src={item.thumbnailUrl}
                  alt=""
                  fallback={<ThumbFallback radius={8} />}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                />
                {item.duration ? <span className="wt-card-duration">{item.duration}</span> : null}
              </span>
              <span className="wt-card-meta">
                <span className="wt-card-title">{item.title}</span>
                <span className="wt-card-channel">{item.channel}</span>
                <span className="wt-card-stats">
                  {item.views}
                  {item.views && item.ago ? " · " : ""}
                  {item.ago}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export const RAIL_CSS = `
.wt-rail { font-family: ${FONT}; }
.wt-chips { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; }
.wt-chips::-webkit-scrollbar { display: none; }
.wt-chip {
  height: 32px; padding: 0 12px; border-radius: 8px; border: 0; flex: none;
  background: ${T.chip}; color: ${T.ink};
  font-family: ${FONT}; font-size: 14px; font-weight: 500; cursor: pointer; white-space: nowrap;
}
.wt-chip.is-on { background: ${T.ink}; color: ${T.page}; }
.wt-rail-list { list-style: none; margin: 12px 0 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.wt-card {
  display: flex; gap: 8px; width: 100%; padding: 6px; border: 0; border-radius: 10px;
  background: transparent; cursor: pointer; text-align: left; align-items: flex-start;
}
.wt-card:hover { background: ${T.raised}; }
.wt-card.is-on { background: ${T.raised}; box-shadow: inset 2px 0 0 ${T.accent}; }
.wt-card-thumb {
  position: relative; display: block; flex: none;
  width: 168px; aspect-ratio: 168 / 94; border-radius: 8px; overflow: hidden; background: ${T.chip};
}
.wt-card-duration {
  position: absolute; right: 4px; bottom: 4px; padding: 1px 4px; border-radius: 4px;
  background: rgba(0,0,0,0.8); color: #FFFFFF; font-size: 12px; line-height: 15px;
  font-variant-numeric: tabular-nums;
}
.wt-card-meta { min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.wt-card-title {
  font-size: 14px; line-height: 19px; font-weight: 500; color: ${T.ink};
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  overflow-wrap: anywhere;
}
.wt-card-channel { font-size: 12px; color: ${T.inkSoft}; overflow-wrap: anywhere; }
.wt-card-stats { font-size: 12px; color: ${T.inkSoft}; }
@media (max-width: 999px) {
  .wt-card { flex-direction: column; gap: 8px; }
  .wt-card-thumb { width: 100%; aspect-ratio: 16 / 9; }
  .wt-card-title { -webkit-line-clamp: 2; }
}
`;
