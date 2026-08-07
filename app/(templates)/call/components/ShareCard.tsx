// ─── The share card ──────────────────────────────────────────────────────────
//
// A 9:16 recreation of the incoming-call screen — 360 × 640 logical pixels,
// captured at pixelRatio 3, which is a 1080 × 1920 PNG and exactly the frame a
// story wants. Photo, name, the full identification card with the real tag and
// the real count, watermark bottom-right.
//
// Four things make the file match the screen:
//
//   1. `await document.fonts.ready` before capture. Handled inside
//      `exportNodeToPng`.
//   2. The captured node is rendered OFF-SCREEN AT TRUE SIZE and never scaled.
//      html-to-image copies computed style, so a `transform: scale()` on the
//      captured node produces a shrunken artifact in the corner of a correct
//      canvas. The on-screen preview is a SECOND copy that carries no ref.
//   3. THE RINGS ARE PAUSED FIRST. `call-frozen` on <body> zeroes every
//      animation in the template; a capture taken mid-pulse bakes a half-faded
//      ring into the file. The card itself draws a static ring, but the live
//      screen behind the overlay is still animating and html-to-image walks the
//      document.
//   4. The photo is inlined as a data URL before capture. A cross-origin <img>
//      taints the canvas and takes the whole export with it — Unsplash sends
//      permissive CORS headers, but a sender's own uploaded photo may not.

"use client";

import { useCallback, useEffect, useState } from "react";
import { exportNodeToPng, fileSlug, toDataUrl } from "@/lib/exportPng";
import { CheckGlyph, CheckBadgeGlyph, CloseGlyph, DownloadGlyph, PinGlyph, ShieldGlyph, TagGlyph } from "./icons";
import { DARK, FONT, TAP, initialsOf, seededInk } from "./theme";
import { heroTag } from "./IncomingScreen";
import { WORDMARK, spamLabel, type CallData, type CallerTag } from "./types";

export const CARD_W = 360;
export const CARD_H = 640;

export interface ShareCardProps {
  data: CallData;
  tags: readonly CallerTag[];
  onClose: () => void;
  onToast: (message: string) => void;
}

export default function ShareCard({ data, tags, onClose, onToast }: ShareCardProps) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [node, setNode] = useState<HTMLDivElement | null>(null);

  // Inline the photo once, on open. `alive` guards the setState against an
  // overlay that was closed while the fetch was in flight.
  useEffect(() => {
    let alive = true;
    void toDataUrl(data.caller.photoUrl).then((url) => {
      if (alive) setPhoto(url);
    });
    return () => {
      alive = false;
    };
  }, [data.caller.photoUrl]);

  const save = useCallback(async () => {
    setSaving(true);
    document.body.classList.add("call-frozen");
    const result = await exportNodeToPng(node, {
      width: CARD_W,
      height: CARD_H,
      pixelRatio: 3,
      backgroundColor: DARK.bg,
      filename: `${fileSlug(data.caller.name)}-incoming-call`,
    });
    document.body.classList.remove("call-frozen");
    setSaving(false);
    onToast(result.message);
  }, [node, data.caller.name, onToast]);

  const top = heroTag(tags);

  const card = (captured: boolean) => (
    <div
      ref={captured ? setNode : undefined}
      style={{
        width: CARD_W,
        height: CARD_H,
        boxSizing: "border-box",
        background: DARK.bg,
        color: DARK.text,
        fontFamily: FONT,
        padding: "38px 26px 26px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 12,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: DARK.dim,
        }}
      >
        Incoming call
      </p>

      {/* Static ring — the card is a still, so the pulse is a fixed halo. */}
      <div style={{ position: "relative", width: 128, height: 128, marginTop: 26 }}>
        <span
          style={{
            position: "absolute",
            inset: -14,
            borderRadius: "50%",
            border: `2px solid ${DARK.accentWarm}`,
            opacity: 0.22,
          }}
        />
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt={data.caller.name}
            style={{
              width: 128,
              height: 128,
              borderRadius: "50%",
              objectFit: "cover",
              boxShadow: `0 0 0 2px ${DARK.accentWarm}`,
            }}
          />
        ) : (
          <span
            style={{
              width: 128,
              height: 128,
              borderRadius: "50%",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: seededInk(data.caller.name),
              color: "rgba(255,255,255,0.86)",
              fontSize: 44,
              fontWeight: 600,
              boxShadow: `0 0 0 2px ${DARK.accentWarm}`,
            }}
          >
            {initialsOf(data.caller.name)}
          </span>
        )}
      </div>

      <p
        style={{
          margin: "20px 0 0",
          fontSize: data.caller.name.length > 18 ? 24 : 29,
          fontWeight: 600,
          lineHeight: 1.15,
          textAlign: "center",
          overflowWrap: "anywhere",
        }}
      >
        {data.caller.name}
      </p>
      <p style={{ margin: "6px 0 0", fontSize: 14, color: DARK.dim, textAlign: "center" }}>
        {data.caller.number}
      </p>

      <section
        style={{
          width: "100%",
          marginTop: 22,
          padding: 16,
          borderRadius: 14,
          background: DARK.card,
          border: `1px solid ${DARK.edge}`,
          boxSizing: "border-box",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "3px 8px 3px 7px",
            borderRadius: 999,
            background: "rgba(29,163,98,0.14)",
            border: "1px solid rgba(29,163,98,0.34)",
            color: DARK.accentWarm,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.04em",
            marginBottom: 10,
          }}
        >
          <CheckGlyph size={11} color={DARK.accentWarm} />
          {WORDMARK}
        </span>

        <div style={{ display: "flex", gap: 9, alignItems: "flex-start", padding: "5px 0" }}>
          <CheckBadgeGlyph size={18} color={DARK.accentWarm} />
          <span style={{ fontSize: 13.5, color: DARK.accentWarm, fontWeight: 600 }}>Verified</span>
        </div>

        <div style={{ display: "flex", gap: 9, alignItems: "flex-start", padding: "7px 0" }}>
          <span style={{ flex: "none", marginTop: 1 }}>
            <TagGlyph size={18} color={DARK.dim} />
          </span>
          <span style={{ fontSize: 14.5, lineHeight: 1.4, color: DARK.dim, overflowWrap: "anywhere" }}>
            {top ? (
              <>
                Tagged by {top.count.toLocaleString("en-IN")} {top.count === 1 ? "person" : "people"} as{" "}
                <span style={{ color: DARK.accentWarm, fontWeight: 600 }}>&ldquo;{top.label}&rdquo;</span>
              </>
            ) : (
              <>Not yet tagged. Be the first.</>
            )}
          </span>
        </div>

        <div style={{ display: "flex", gap: 9, alignItems: "flex-start", padding: "5px 0" }}>
          <span style={{ flex: "none", marginTop: 1 }}>
            <ShieldGlyph size={18} color={DARK.dim} />
          </span>
          <span style={{ fontSize: 13.5, color: DARK.dim }}>{spamLabel(data)}</span>
        </div>

        <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: DARK.accentWarm, opacity: 0.85 }} />
          ))}
        </div>

        <div style={{ display: "flex", gap: 9, alignItems: "flex-start", padding: "9px 0 0" }}>
          <span style={{ flex: "none", marginTop: 1 }}>
            <PinGlyph size={18} color={DARK.dim} />
          </span>
          <span style={{ fontSize: 13.5, color: DARK.dim, overflowWrap: "anywhere" }}>{data.caller.location}</span>
        </div>
      </section>

      <div style={{ flex: 1 }} />

      <p
        style={{
          alignSelf: "flex-end",
          margin: 0,
          fontSize: 11,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "rgba(154,164,174,0.66)",
        }}
      >
        SubhSandesh
      </p>
    </div>
  );

  return (
    <div
      role="dialog"
      aria-label="Save the call screen"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 320,
        background: "rgba(7,9,11,0.9)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: 18,
        fontFamily: FONT,
      }}
    >
      {/* The preview: scaled to fit, and deliberately not the captured node. */}
      <div style={{ transform: "scale(0.72)", transformOrigin: "center", borderRadius: 18, overflow: "hidden" }}>
        {card(false)}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          style={{
            minHeight: TAP,
            padding: "0 20px",
            borderRadius: 12,
            border: "none",
            background: DARK.accentWarm,
            color: "#fff",
            fontFamily: FONT,
            fontSize: 15,
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            cursor: saving ? "default" : "pointer",
            opacity: saving ? 0.6 : 1,
            touchAction: "manipulation",
          }}
        >
          <DownloadGlyph size={17} color="#fff" />
          {saving ? "Saving…" : "Save PNG"}
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            minHeight: TAP,
            width: TAP,
            borderRadius: 12,
            border: `1px solid ${DARK.edge}`,
            background: "transparent",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            touchAction: "manipulation",
          }}
        >
          <CloseGlyph size={18} color={DARK.dim} />
        </button>
      </div>

      {/* Off-screen, true size. This is the one the canvas sees. */}
      <div aria-hidden="true" style={{ position: "fixed", left: -9999, top: 0, pointerEvents: "none" }}>
        {card(true)}
      </div>
    </div>
  );
}
