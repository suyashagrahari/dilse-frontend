"use client";

import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { toDataUrl, fileSlug } from "@/lib/exportPng";
import { encodeQr, qrPath, qrExtent } from "@/lib/share/qr";
import { GC } from "./theme";
import { Marigold, Modak, Rays, Thali } from "./Ornaments";
import { formatFestivalDate, type GaneshData } from "./types";

// ─── The shareable card ──────────────────────────────────────────────────────
//
// 1080×1920 — the true Instagram Story size, so it uploads without Instagram
// re-cropping it and softening every edge.
//
// ── WHAT GOES ON IT: THE COVER, AND THE WAY BACK ────────────────────────────
//
// This card is the front door, not a summary. It carries the photograph, both
// names, the greeting's first line, the date, and a code plus the printed URL —
// and nothing else.
//
// It does NOT carry the reader's reply, the wish list or the aarti line. Two
// reasons. It spoils the thing the link is for: someone who has read the whole
// page off a story has no reason to open the page itself. And the reply is
// something one person wrote to ANOTHER — it lands very differently pasted
// across a public story than it does at the end of a page only they opened.
//
// So: the cover, and a route to the rest. Anything you are tempted to add here
// is something you are taking off the page.
//
// ── FOUR TRAPS, ALL OF THEM LIVE HERE ───────────────────────────────────────
//
// 1. ANIMATION OF ANY KIND. `html-to-image` serialises whichever frame is
//    painted at that instant — that goes for a GIF and equally for a CSS
//    rotation. `shubhkamnaye.gif` stays in the hero and never comes near this
//    node, and `Rays` is rendered here with `className=""` to strip its
//    `gc-rays` rotation. If you add an animated source you get a random frame,
//    and it will look deliberate enough that nobody notices it is wrong.
//
// 2. CORS. The devotee photo lives on the CDN, and a cross-origin <img> taints
//    the canvas and makes the whole export throw. Every remote image is inlined
//    to a data URL first (`toDataUrl`), and `ready` stays false until that
//    finishes so nothing can capture a half-built node.
//
// 3. Fonts. The capture awaits `document.fonts.ready`, which is why the faces in
//    the root layout are `display:"swap"` and not `"optional"` — "optional" lets
//    the browser decline the face and the PNG would come out in Times.
//
// 4. Scale. The node is 1080px wide and previewed with a CSS transform. The
//    capture neutralises that transform; never bake the preview scale in.
//
// ── WHY THE MURTI IS NOT ON THE CARD ────────────────────────────────────────
//
// `bappa.webp` would have to be inlined to a data URL like the photo, which
// means a 232 KB base64 string inside the export node on every keystroke in the
// builder — the card re-renders as the sender types. The thali, the marigolds
// and the rays are SVG and come through the rasteriser exactly as painted, at
// any size, for nothing.
//
// Its absence is also the right composition: the card is about the two people,
// and the page behind the code is where the murti is.
//
// ── INSTAGRAM ───────────────────────────────────────────────────────────────
//
// There is no web API that posts to a Story, from anyone, at all. What works is
// `navigator.share({ files })` — the OS sheet, with Instagram in it, one tap to
// "Add to story". `canShare({files})` is the only reliable capability check;
// plenty of browsers expose `navigator.share` and then reject file payloads.
// Desktop has no such path, so it downloads and says so.

const W = 1080;
const H = 1920;

interface CardProps {
  data: GaneshData;
  /** Already inlined to a data URL, or null if there is no photo / it failed. */
  photo: string | null;
  /** QR for the published page, as an SVG path in module units. Null in preview. */
  qr: { path: string; extent: number } | null;
  /** Printed under the QR. Host + path, no scheme. */
  linkLabel: string | null;
}

/**
 * The card itself. Rendered off-screen at full size and captured by ref.
 * Split out so the export node is unambiguous — the ref points at exactly the
 * 1080×1920 box and nothing else.
 */
const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { data, photo, qr, linkLabel },
  ref
) {
  const date = formatFestivalDate(data.festivalDate);
  const greeting = data.greeting.find((l) => l.trim());

  return (
    <div
      ref={ref}
      className="gc-storycard"
      style={{
        width: W,
        height: H,
        background: `linear-gradient(172deg, #FFFDF9 0%, ${GC.paper} 46%, ${GC.paperDeep} 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "104px 78px 84px",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Corner rules — geometric, drawn, not an emoji border. */}
      {(
        [
          { pos: { top: 44, left: 44 }, deg: 0 },
          { pos: { top: 44, right: 44 }, deg: 90 },
          { pos: { bottom: 44, right: 44 }, deg: 180 },
          { pos: { bottom: 44, left: 44 }, deg: 270 },
        ] as const
      ).map(({ pos, deg }, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            ...pos,
            width: 84,
            height: 84,
            borderTop: `2px solid ${GC.gold}`,
            borderLeft: `2px solid ${GC.gold}`,
            transform: `rotate(${deg}deg)`,
            opacity: 0.6,
          }}
        />
      ))}

      {/* The aarti's own rays, held still. `className=""` removes `gc-rays`:
          nothing inside an export node may animate, or the capture bakes in
          whatever angle it happened to be at. */}
      <div style={{ position: "absolute", top: 430, left: "50%", transform: "translateX(-50%)", opacity: 0.28 }}>
        <Rays size={940} count={72} className="" />
      </div>

      {/* ── Head ── */}
      <div style={{ textAlign: "center", width: "100%", position: "relative" }}>
        <p
          style={{
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: GC.gold,
            margin: "0 0 22px",
          }}
        >
          Ganesh Chaturthi
        </p>
        <h1
          className="gc-display"
          style={{
            fontSize: 84,
            lineHeight: 1.05,
            fontWeight: 700,
            color: GC.maroon,
            margin: 0,
            overflowWrap: "anywhere",
          }}
        >
          Happy Ganesh
          <br />
          Chaturthi
        </h1>
        {/* The same garland the page hangs, so the card reads as the same
            object rather than as a separate graphic. */}
        <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 24 }}>
          {Array.from({ length: 13 }, (_, i) => (
            <Marigold key={i} size={24} />
          ))}
        </div>
      </div>

      {/* ── Photo ── */}
      {/* Round, and gold-ringed, because that is the frame the page puts this
          same photograph in. A square here and a circle there reads as two
          different designs. */}
      <div
        style={{
          position: "relative",
          width: 620,
          height: 620,
          borderRadius: "50%",
          overflow: "hidden",
          background: GC.paperDeep,
          boxShadow: `0 0 0 3px ${GC.gold}, 0 0 0 22px ${GC.paper}, 0 0 0 24px ${GC.goldSoft}, 0 30px 70px rgba(46,33,25,0.2)`,
          flexShrink: 0,
          display: "grid",
          placeItems: "center",
        }}
      >
        {photo ? (
          // Plain <img>: next/image would inject a srcset and a lazy loader that
          // html-to-image has to resolve. This src is already a data URL, so
          // there is nothing left to optimise.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt=""
            width={620}
            height={620}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          // The drawn fallback. A card with a hole in it is worse than a card
          // that was clearly designed without a photograph.
          // The drawn fallback, for a page with no photograph. Just the thali,
          // large enough to be the subject of a 620px circle — at 210px it read
          // as a small icon lost in a lot of cream. No names inside it either:
          // they are printed directly below the frame, and having them twice
          // 60px apart looked like a mistake.
          <div style={{ display: "grid", placeItems: "center", width: "100%" }}>
            <Thali size={380} />
          </div>
        )}
      </div>

      {/* ── Names + one line ── */}
      <div style={{ textAlign: "center", width: "100%" }}>
        <div style={{ display: "grid", placeItems: "center", marginBottom: 18 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {Array.from({ length: 3 }, (_, i) => (
              <Modak key={i} size={44} />
            ))}
          </div>
        </div>

        <p
          className="gc-display"
          style={{
            fontSize: 58,
            lineHeight: 1.2,
            fontWeight: 600,
            color: GC.ink,
            margin: 0,
            overflowWrap: "anywhere",
          }}
        >
          {data.recipientName || "To your house"}
          {data.senderName && (
            <>
              <span style={{ color: GC.gold }}> &amp; </span>
              {data.senderName}
            </>
          )}
        </p>

        {/* ONE line of theirs, not the reply and not the wish list. See
            the note at the top of the file about what this card is and is not. */}
        {greeting && (
          <p
            className="gc-quote"
            style={{
              fontSize: 40,
              lineHeight: 1.42,
              color: GC.muted,
              margin: "26px auto 0",
              maxWidth: 800,
            }}
          >
            “{greeting}”
          </p>
        )}
      </div>

      {/* ── Foot: the way back to the page ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 30,
          padding: "22px 30px",
          borderRadius: 30,
          background: "rgba(255,253,247,0.9)",
          border: `1px solid ${GC.hairline}`,
          maxWidth: "100%",
        }}
      >
        {qr && (
          <div
            style={{
              width: 168,
              height: 168,
              flexShrink: 0,
              background: "#fff",
              borderRadius: 16,
              padding: 10,
              boxSizing: "border-box",
            }}
          >
            {/* Drawn inline rather than loaded — an <img> inside the export node
                is one more thing html-to-image has to resolve before the
                capture, and this symbol is two dozen path commands. */}
            <svg
              width="148"
              height="148"
              viewBox={`0 0 ${qr.extent} ${qr.extent}`}
              shapeRendering="crispEdges"
              aria-hidden
            >
              <rect width={qr.extent} height={qr.extent} fill="#ffffff" />
              <path d={qr.path} fill={GC.ink} />
            </svg>
          </div>
        )}

        <div style={{ textAlign: "left", minWidth: 0 }}>
          {date && (
            <p style={{ fontSize: 24, color: GC.gold, margin: "0 0 10px", letterSpacing: 3 }}>
              {date.toUpperCase()}
            </p>
          )}
          <p
            className="gc-display"
            style={{
              fontSize: 34,
              fontWeight: 700,
              color: GC.ink,
              margin: 0,
              lineHeight: 1.25,
              overflowWrap: "anywhere",
            }}
          >
            {linkLabel || "subhsandesh.in"}
          </p>
          <p style={{ fontSize: 24, color: GC.muted, margin: "8px 0 0" }}>
            {qr ? "scan the code, or type the link" : "make yours in a minute"}
          </p>
        </div>
      </div>
    </div>
  );
});

/** Never throws, and reports whether it actually landed. */
async function copyToClipboard(text: string | null | undefined): Promise<boolean> {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Insecure origin, a denied permission, or a browser that requires the
    // write to happen inside a user gesture it no longer considers active.
    return false;
  }
}

/**
 * Off-screen host for the card, plus the two actions.
 *
 * Returns `element`, which the caller MUST render — the node has to be in the
 * document with real layout for `html-to-image` to capture it.
 */
export function useStoryCard(data: GaneshData, shareUrl?: string | null) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  // The route back to the page, printed and encoded on the card. `useMemo`
  // because `encodeQr` walks the full Reed–Solomon path and the card re-renders
  // on every keystroke in the builder.
  const qr = useMemo(() => {
    if (!shareUrl) return null;
    // "medium" rather than "high": nothing is drawn over this symbol, and the
    // lower level keeps the version — and therefore the module count — small
    // enough that each module is still ~6px at 148px on the exported PNG.
    const matrix = encodeQr(shareUrl, "medium");
    if (!matrix) return null;
    return { path: qrPath(matrix, 2), extent: qrExtent(matrix, 2) };
  }, [shareUrl]);

  const linkLabel = useMemo(
    () => (shareUrl ? shareUrl.replace(/^https?:\/\//, "").replace(/\/$/, "") : null),
    [shareUrl]
  );

  useEffect(() => {
    let live = true;
    if (!data.photoUrl) {
      setPhoto(null);
      setReady(true);
      return;
    }
    setReady(false);
    void toDataUrl(data.photoUrl).then((url) => {
      if (!live) return;
      // null is fine — the card falls back to the drawn thali rather than
      // rendering a broken image into the PNG.
      setPhoto(url);
      setReady(true);
    });
    return () => {
      live = false;
    };
  }, [data.photoUrl]);

  const filename = `ganesh-chaturthi-${fileSlug(
    `${data.senderName || "from"}-${data.recipientName || "home"}`
  )}`;

  const capture = async (): Promise<Blob | null> => {
    const node = nodeRef.current;
    if (!node) return null;
    try {
      await document.fonts.ready;
      const { toBlob } = await import("html-to-image");
      return await toBlob(node, {
        pixelRatio: 1, // already 1080×1920 — a multiplier would give 3240×5760
        cacheBust: true,
        backgroundColor: GC.paper,
        width: W,
        height: H,
        style: { transform: "none", transformOrigin: "top left" },
      });
    } catch {
      return null;
    }
  };

  const download = async () => {
    if (busy) return { ok: false, message: "Still working…" };
    setBusy(true);
    const blob = await capture();
    setBusy(false);
    if (!blob) return { ok: false, message: "Couldn't save — try a screenshot instead" };

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.png`;
    a.click();
    // Revoking immediately can cancel the download in some browsers.
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
    return { ok: true, message: "Saved — ready for your story" };
  };

  const share = async () => {
    if (busy) return { ok: false, message: "Still working…" };
    setBusy(true);
    const blob = await capture();
    if (!blob) {
      setBusy(false);
      return { ok: false, message: "Couldn't make the card — try a screenshot" };
    }

    const file = new File([blob], `${filename}.png`, { type: "image/png" });

    // ── The link goes to the clipboard BEFORE the share sheet opens ─────────
    //
    // Instagram will not let this image carry a tappable destination — the Link
    // sticker is added by the poster, inside the app, and no API can attach one
    // for them. What we can do is make it a paste instead of a retype.
    //
    // The order matters and is not cosmetic. `navigator.share` moves focus to
    // the OS sheet, and Safari refuses a clipboard write once the document has
    // lost focus. Copying first means it lands while the page is still active.
    const copiedLink = await copyToClipboard(shareUrl);

    // canShare({files}) is the only reliable check — plenty of browsers expose
    // navigator.share and then reject a file payload outright.
    if (typeof navigator !== "undefined" && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "Happy Ganesh Chaturthi",
          // Some targets (WhatsApp, Telegram, Messages) DO accept text beside a
          // file and will send the link with the picture. Instagram ignores it,
          // which costs nothing.
          ...(shareUrl ? { text: shareUrl } : {}),
        });
        setBusy(false);
        return {
          ok: true,
          message: copiedLink ? "Link copied — add it as a Link sticker" : "",
        };
      } catch {
        // Almost always the reader dismissing the sheet. Not an error, and it
        // must not be reported as one.
        setBusy(false);
        return { ok: true, message: "" };
      }
    }

    setBusy(false);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
    return {
      ok: true,
      message: copiedLink
        ? "Saved, and the link is copied — post it and add a Link sticker"
        : "Saved — open Instagram and add it to your story",
    };
  };

  /**
   * The off-screen node. `left:-99999px` rather than `display:none` or
   * `visibility:hidden` — both of those remove layout and html-to-image would
   * capture a 0×0 canvas.
   */
  const element = (
    <div
      aria-hidden
      style={{ position: "fixed", left: -99999, top: 0, pointerEvents: "none", opacity: 0 }}
    >
      <Card ref={nodeRef} data={data} photo={photo} qr={qr} linkLabel={linkLabel} />
    </div>
  );

  return { element, download, share, ready, busy };
}

export default Card;
