"use client";

// ─── The metadata row ────────────────────────────────────────────────────────
//
// Channel on the left, the actions on the right, and it WRAPS on a narrow
// screen rather than scrolling sideways — a row that runs off the edge of a
// 380px phone is the single most common way a layout like this fails.
//
// The jokes here are all in the affordances, and every one of them still does
// something honest: the subscribe pill really opens a menu, the like really
// counts, the share row really writes to the clipboard, the download really
// renders a card. Only the answers are funny.

import { useCallback, useState } from "react";
import Sheet from "./Sheet";
import type { WatchData } from "./types";
import {
  BellGlyph,
  DownloadGlyph,
  FONT,
  InitialsAvatar,
  LinkGlyph,
  MoreGlyph,
  SafeImage,
  ShareGlyph,
  T,
  ThumbGlyph,
  bumpCount,
} from "./theme";

export interface MetaRowProps {
  channel: WatchData["channel"];
  likes: string;
  /** Absent in the editor preview: there is no link to copy until it is live. */
  shareUrl?: string | null;
  onToast: (message: string) => void;
  onDownload: () => void;
  downloading: boolean;
}

export default function MetaRow({
  channel,
  likes,
  shareUrl,
  onToast,
  onDownload,
  downloading,
}: MetaRowProps) {
  const [liked, setLiked] = useState(false);
  const [bounce, setBounce] = useState(false);
  const [menu, setMenu] = useState<null | "bell" | "share" | "more">(null);
  const [copied, setCopied] = useState(false);

  const shown = liked ? bumpCount(likes) : likes;

  const like = useCallback(() => {
    setLiked((was) => !was);
    setBounce(true);
    window.setTimeout(() => setBounce(false), 320);
  }, []);

  const copy = useCallback(async () => {
    const link = shareUrl || (typeof window !== "undefined" ? window.location.href : "");
    if (!link) {
      onToast("nothing to copy yet — publish it first.");
      return;
    }
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
      onToast("Link copied.");
    } catch {
      onToast("Couldn't copy — long-press the link instead.");
    }
  }, [shareUrl, onToast]);

  return (
    <div className="wt-meta">
      <div className="wt-meta-left">
        <SafeImage
          src={channel.avatarUrl}
          alt=""
          fallback={<InitialsAvatar name={channel.name} size={40} />}
          style={{ width: 40, height: 40, flex: "none", borderRadius: "50%", objectFit: "cover" }}
        />
        <div className="wt-meta-names">
          <p className="wt-meta-channel">{channel.name}</p>
          <p className="wt-meta-subs">{channel.subscribers}</p>
        </div>
        <button
          type="button"
          className="wt-pill wt-subbed"
          onClick={() => setMenu("bell")}
          aria-pressed="true"
          title="all notifications on"
        >
          Subscribed
          <BellGlyph size={17} color={T.ink} filled />
          <span className="wt-visually-hidden">all notifications on</span>
        </button>
      </div>

      <div className="wt-meta-right">
        <div className="wt-segment">
          <button
            type="button"
            className="wt-segment-half"
            onClick={like}
            aria-pressed={liked}
            aria-label={liked ? "Remove like" : "Like"}
          >
            <span className={`wt-thumb${bounce ? " is-bouncing" : ""}`}>
              <ThumbGlyph size={19} color={liked ? T.accent : T.ink} filled={liked} />
            </span>
            <span className="wt-segment-count">{shown}</span>
          </button>
          <span className="wt-segment-divider" aria-hidden="true" />
          <button
            type="button"
            className="wt-segment-half wt-segment-half--icon"
            onClick={() => onToast("that is not an option here.")}
            aria-label="Dislike"
          >
            <ThumbGlyph size={19} color={T.ink} down />
          </button>
        </div>

        <button type="button" className="wt-pill" onClick={() => setMenu("share")}>
          <ShareGlyph size={18} color={T.ink} />
          Share
        </button>

        <button type="button" className="wt-pill" onClick={onDownload} disabled={downloading}>
          <DownloadGlyph size={18} color={T.ink} />
          {downloading ? "Making…" : "Download"}
        </button>

        <button type="button" className="wt-pill wt-pill--icon" onClick={() => setMenu("more")} aria-label="More actions">
          <MoreGlyph size={18} color={T.ink} />
        </button>
      </div>

      <Sheet open={menu === "bell"} title={channel.name} onClose={() => setMenu(null)}>
        <p className="wt-sheet-note">All notifications are on. They have been since the day you subscribed.</p>
        <button
          type="button"
          className="wt-sheet-item"
          onClick={() => {
            setMenu(null);
            onToast("no.");
          }}
        >
          <BellGlyph size={19} color={T.ink} />
          Unsubscribe
        </button>
      </Sheet>

      <Sheet open={menu === "share"} title="Share" onClose={() => setMenu(null)}>
        <button type="button" className="wt-sheet-item" onClick={copy}>
          <LinkGlyph size={19} color={T.ink} />
          <span style={{ minWidth: 0, flex: 1 }}>
            <span style={{ display: "block", fontWeight: 600 }}>{copied ? "Copied" : "Copy link"}</span>
            <span className="wt-sheet-link">{shareUrl || "publish it and the link lands here"}</span>
          </span>
        </button>
      </Sheet>

      <Sheet open={menu === "more"} title="More" onClose={() => setMenu(null)}>
        <button
          type="button"
          className="wt-sheet-item"
          onClick={() => {
            setMenu(null);
            onToast("saved to a playlist of one.");
          }}
        >
          Save
        </button>
        <button
          type="button"
          className="wt-sheet-item"
          onClick={() => {
            setMenu(null);
            onToast("reported. to her.");
          }}
        >
          Report
        </button>
      </Sheet>
    </div>
  );
}

export const META_CSS = `
.wt-meta {
  display: flex; flex-wrap: wrap; align-items: center; gap: 12px;
  margin-top: 12px; font-family: ${FONT};
}
.wt-meta-left { display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1 1 260px; }
.wt-meta-names { min-width: 0; }
.wt-meta-channel {
  margin: 0; font-size: 16px; font-weight: 500; color: ${T.ink};
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.wt-meta-subs { margin: 1px 0 0; font-size: 12px; color: ${T.inkSoft}; }
.wt-meta-right { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.wt-pill {
  display: inline-flex; align-items: center; justify-content: center; gap: 7px;
  height: 36px; padding: 0 15px; border-radius: 18px; border: 0;
  background: ${T.chip}; color: ${T.ink};
  font-family: ${FONT}; font-size: 14px; font-weight: 500;
  cursor: pointer; white-space: nowrap; touch-action: manipulation;
}
.wt-pill:hover { background: ${T.chipHi}; }
.wt-pill:disabled { opacity: 0.6; cursor: default; }
.wt-pill--icon { width: 36px; padding: 0; }
.wt-subbed { gap: 8px; }
.wt-segment {
  display: inline-flex; align-items: stretch; height: 36px;
  border-radius: 18px; background: ${T.chip}; overflow: hidden;
}
.wt-segment-half {
  display: inline-flex; align-items: center; gap: 8px; border: 0; background: transparent;
  padding: 0 15px; color: ${T.ink}; font-family: ${FONT}; font-size: 14px; font-weight: 500;
  cursor: pointer; touch-action: manipulation;
}
.wt-segment-half:hover { background: ${T.chipHi}; }
.wt-segment-half--icon { padding: 0 14px; }
.wt-segment-divider { width: 1px; flex: none; background: ${T.line}; margin: 6px 0; }
.wt-segment-count { font-variant-numeric: tabular-nums; }
.wt-thumb { display: inline-flex; }
.wt-thumb.is-bouncing { animation: wt-thumb-pop 300ms ease-in-out; }
.wt-sheet-link {
  display: block; font-size: 12px; color: ${T.inkSoft};
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.wt-visually-hidden {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}
@keyframes wt-thumb-pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.25); }
  100% { transform: scale(1); }
}
@media (prefers-reduced-motion: reduce) {
  .wt-thumb.is-bouncing { animation: none; }
}
`;
