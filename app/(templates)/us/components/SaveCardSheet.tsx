"use client";

// ─── Us — save the card ──────────────────────────────────────────────────────
//
// The export sequence, in the order it has to happen. Every step here exists
// because skipping it produces a PNG that quietly disagrees with the screen:
//
//   1. Convert every photo in the card to a data URL. A cross-origin <img>
//      taints the canvas and `toPng` throws — one dead photo would otherwise
//      cost the whole export. Anything that fails to convert resolves to "" and
//      draws the grey fallback cell, so the card is always produced.
//   2. Wait two frames for the swapped sources to paint.
//   3. `await document.fonts.ready` — html-to-image snapshots what is painted,
//      and an unloaded face is captured as the fallback face. (`exportNodeToPng`
//      also awaits it; doing it here too costs nothing and keeps the ordering
//      explicit.)
//   4. Freeze the subtree. `.us-frozen` kills every animation and transition
//      inside the card, so a half-played fade is not baked into the file.
//   5. Capture at pixelRatio 3 → 1620 × 2880.
//
// The preview is rendered on screen rather than parked off-canvas at
// `left: -9999px`, which is the other way people do this and which loses to
// lazy loading: an image that never entered a viewport never started fetching.

import { useCallback, useRef, useState } from "react";
import { exportNodeToPng, fileSlug, toDataUrl } from "@/lib/exportPng";
import ShareCard, { CARD_H, CARD_W } from "./ShareCard";
import { DownloadIcon, SpinnerIcon } from "./icons";
import { anim } from "./styles";
import { METRICS, PALETTE, type Post, type ProfileData } from "./types";

/** Two frames, so a source swap is painted before anything measures it. */
const nextPaint = (): Promise<void> =>
  new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

export interface SaveCardSheetProps {
  data: ProfileData;
  posts: Post[];
  reduced: boolean;
  onClose: () => void;
  onToast: (message: string) => void;
}

export default function SaveCardSheet({ data, posts, reduced, onClose, onToast }: SaveCardSheetProps) {
  const [busy, setBusy] = useState(false);
  const [frozen, setFrozen] = useState(false);
  // Original URL → data URL. Empty until a capture is requested, so the preview
  // shows the real photos over the network and only the capture pays for base64.
  const [resolved, setResolved] = useState<Record<string, string>>({});

  // An attach callback, not a RefObject handed out of a hook. Read only from
  // the async click handler below — never during render.
  const node = useRef<HTMLDivElement | null>(null);
  const attach = useCallback((el: HTMLDivElement | null) => {
    node.current = el;
  }, []);

  const download = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      const urls = Array.from(
        new Set([data.avatarUrl, ...posts.slice(0, 9).map((p) => p.imageUrl)].filter(Boolean)),
      );
      const pairs = await Promise.all(
        urls.map(async (u) => [u, (await toDataUrl(u)) ?? ""] as const),
      );
      const map: Record<string, string> = {};
      for (const [url, dataUrl] of pairs) if (dataUrl) map[url] = dataUrl;

      setResolved(map);
      await nextPaint();
      await document.fonts.ready;

      setFrozen(true);
      await nextPaint();

      const result = await exportNodeToPng(node.current, {
        width: CARD_W,
        height: CARD_H,
        pixelRatio: 3,
        backgroundColor: PALETTE.bg,
        filename: `${fileSlug(data.handle, "us")}-profile`,
      });
      onToast(result.message);
    } finally {
      setFrozen(false);
      setBusy(false);
    }
  }, [busy, data.avatarUrl, data.handle, posts, onToast]);

  // Pure arithmetic, no measurement: the card is 540 wide and the sheet gives it
  // a 288px slot, so the preview is always the same fraction of the real thing.
  const previewW = 288;
  const scale = previewW / CARD_W;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 165,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        background: "rgba(0,0,0,0.45)",
        animation: anim(reduced, "us-fade-in", 160),
      }}
    >
      <div
        role="dialog"
        aria-label="Save profile card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: METRICS.desktopColumn,
          maxHeight: "92dvh",
          overflowY: "auto",
          background: PALETTE.bg,
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          paddingBottom: "max(16px, env(safe-area-inset-bottom, 0px))",
          animation: anim(reduced, "us-sheet-up", 240, "cubic-bezier(0.16,1,0.3,1)"),
        }}
      >
        <div style={{ display: "grid", placeItems: "center", padding: "10px 0 2px" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: PALETTE.border }} />
        </div>

        <div
          style={{
            padding: "10px 16px 12px",
            fontSize: 15,
            fontWeight: 600,
            textAlign: "center",
            borderBottom: `1px solid ${PALETTE.border}`,
          }}
        >
          Save profile card
        </div>

        {/* The captured node, scaled for display only. `exportNodeToPng`
            neutralises this transform, so the file is full size. */}
        <div style={{ display: "grid", placeItems: "center", padding: "16px 0 4px" }}>
          <div style={{ width: previewW, height: CARD_H * scale, overflow: "hidden" }}>
            <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
              <div className={frozen ? "us-frozen" : undefined}>
                <ShareCard data={data} posts={posts} resolved={resolved} attachRef={attach} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: "12px 16px 4px" }}>
          <button
            type="button"
            className="us-tap"
            onClick={download}
            disabled={busy}
            style={{
              width: "100%",
              height: 44,
              borderRadius: METRICS.buttonRadius,
              background: busy ? PALETTE.button : PALETTE.actionBlue,
              color: busy ? PALETTE.grey : "#FFFFFF",
              fontSize: 15,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {busy ? <SpinnerIcon size={18} /> : <DownloadIcon size={17} />}
            {busy ? "Saving…" : "Save as image"}
          </button>
          <button
            type="button"
            className="us-tap"
            onClick={onClose}
            style={{
              width: "100%",
              height: 44,
              marginTop: 4,
              fontSize: 15,
              fontWeight: 600,
              color: PALETTE.grey,
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
