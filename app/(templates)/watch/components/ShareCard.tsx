"use client";

// ─── The share card ──────────────────────────────────────────────────────────
//
// 9:16, because it is going straight into a status. Rendered off-screen at
// 360×640 and captured at pixelRatio 3, which lands on 1080×1920.
//
// ── THE PLAYER CANNOT BE CAPTURED ────────────────────────────────────────────
//
// html-to-image walks the DOM and re-draws it. A cross-origin iframe is not
// DOM it can see, so capturing the page itself would produce a black rectangle
// where the video is. The card is therefore its OWN component with the still
// frame substituted for the embed — the picture people expected, and the only
// one that can exist.
//
// ── THE THINGS THAT SILENTLY RUIN AN EXPORT ──────────────────────────────────
//
//   • Fonts still loading  → `document.fonts.ready` is awaited first.
//   • An animation mid-flight → everything is frozen for the duration of the
//     capture and released in a `finally`, so a thrown capture cannot leave the
//     page paused.
//   • An image the browser will not hand over → `imagePlaceholder` turns that
//     into one missing picture instead of a rejected promise, and the card is
//     built so a missing still still reads as a card.

import { toPng } from "html-to-image";
import type { Comment, WatchData } from "./types";
import { FONT, InitialsAvatar, SERIF, SafeImage, T, posterUrls } from "./theme";

/** A 1×1 transparent pixel. Stands in for anything the browser will not release. */
const BLANK_PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

export const SHARE_CARD_W = 360;
export const SHARE_CARD_H = 640;

export interface ShareCardProps {
  data: WatchData;
  /** The three that go on the card. Passed in so the caller decides "top". */
  topComments: readonly Comment[];
  nodeRef: React.RefObject<HTMLDivElement | null>;
}

export default function ShareCard({ data, topComments, nodeRef }: ShareCardProps) {
  const film = !data.video.youtubeId;
  const [ytPoster, ytPosterAlt] = posterUrls(data.video.youtubeId);
  const poster = film ? (data.photos[0]?.url ?? "") : ytPoster;
  const posterAlt = film ? undefined : ytPosterAlt;
  const avatar = data.channel.avatarUrl || data.photos[0]?.url || "";

  return (
    <div className="wt-card-stage" aria-hidden="true">
      <div ref={nodeRef} className="wt-sharecard">
        <div className="wt-sc-thumb">
          <SafeImage
            src={poster}
            altSrc={posterAlt}
            alt=""
            crossOrigin={film ? undefined : "anonymous"}
            fallback={<span className="wt-sc-thumb-blank" />}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        <p className="wt-sc-title">{data.video.title}</p>
        <p className="wt-sc-stats">
          {data.video.views}
          {data.video.views && data.video.postedAgo ? " · " : ""}
          {data.video.postedAgo}
        </p>

        <div className="wt-sc-channel">
          <SafeImage
            src={avatar}
            alt=""
            crossOrigin={data.channel.avatarUrl ? "anonymous" : undefined}
            fallback={<InitialsAvatar name={data.channel.name} size={34} />}
            style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", flex: "none" }}
          />
          <div style={{ minWidth: 0 }}>
            <p className="wt-sc-channel-name">{data.channel.name}</p>
            <p className="wt-sc-channel-subs">{data.channel.subscribers}</p>
          </div>
        </div>

        <ul className="wt-sc-comments">
          {topComments.slice(0, 3).map((c) => (
            <li key={c.id}>
              <span className="wt-sc-c-author">{c.author}</span>
              <span className="wt-sc-c-text">{c.text}</span>
            </li>
          ))}
        </ul>

        <div className="wt-sc-foot">
          <span className="wt-sc-mark">SubhSandesh</span>
          <span className="wt-sc-domain">subhsandesh.com</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Capture and download. Resolves to false rather than throwing — a failed
 * export is a toast, never a broken page.
 */
export async function exportShareCard(node: HTMLElement | null, filename: string): Promise<boolean> {
  if (!node) return false;
  const root = document.documentElement;
  root.classList.add("wt-freeze");
  try {
    if (document.fonts?.ready) await document.fonts.ready;
    const url = await toPng(node, {
      pixelRatio: 3,
      cacheBust: true,
      backgroundColor: T.page,
      width: SHARE_CARD_W,
      height: SHARE_CARD_H,
      imagePlaceholder: BLANK_PIXEL,
    });
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    return true;
  } catch {
    return false;
  } finally {
    root.classList.remove("wt-freeze");
  }
}

export const SHARE_CARD_CSS = `
.wt-card-stage {
  position: fixed; top: 0; left: -10000px; width: ${SHARE_CARD_W}px; height: ${SHARE_CARD_H}px;
  pointer-events: none; z-index: -1;
}
.wt-sharecard {
  width: ${SHARE_CARD_W}px; height: ${SHARE_CARD_H}px; box-sizing: border-box;
  background: ${T.page}; color: ${T.ink}; font-family: ${FONT};
  padding: 22px 20px; display: flex; flex-direction: column; gap: 12px;
}
.wt-sc-thumb {
  position: relative; width: 100%; aspect-ratio: 16 / 9; border-radius: 10px;
  overflow: hidden; background: ${T.chip}; flex: none;
}
.wt-sc-thumb-blank {
  position: absolute; inset: 0;
  background: linear-gradient(135deg, ${T.chip} 0%, ${T.raised} 100%);
}
.wt-sc-title {
  margin: 0; font-size: 17px; line-height: 22px; font-weight: 700;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
  overflow-wrap: anywhere;
}
.wt-sc-stats { margin: -6px 0 0; font-size: 12px; color: ${T.inkSoft}; }
.wt-sc-channel { display: flex; align-items: center; gap: 10px; }
.wt-sc-channel-name { margin: 0; font-size: 14px; font-weight: 600; }
.wt-sc-channel-subs { margin: 1px 0 0; font-size: 11px; color: ${T.inkSoft}; }
.wt-sc-comments {
  list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px;
  flex: 1; overflow: hidden;
}
.wt-sc-comments li {
  background: ${T.chip}; border-radius: 10px; padding: 9px 11px;
}
.wt-sc-c-author { display: block; font-size: 11.5px; font-weight: 600; color: ${T.accent}; }
.wt-sc-c-text {
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
  font-family: ${SERIF}; font-size: 12.5px; line-height: 17px; color: ${T.ink};
  overflow-wrap: anywhere; margin-top: 2px;
}
.wt-sc-foot {
  display: flex; align-items: baseline; justify-content: space-between; gap: 8px; flex: none;
}
.wt-sc-mark { font-size: 13px; font-weight: 700; letter-spacing: -0.01em; }
.wt-sc-domain { font-size: 11px; color: ${T.inkSoft}; }
.wt-freeze *, .wt-freeze *::before, .wt-freeze *::after {
  animation-play-state: paused !important;
  transition: none !important;
}
`;
