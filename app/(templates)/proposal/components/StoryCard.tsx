"use client";

// ─── Proposal — the shareable card ───────────────────────────────────────────
//
// 1080×1920, the true Instagram Story size, so it uploads without Instagram
// re-cropping it and softening every edge.
//
// ── WHAT GOES ON IT, AND WHAT DOES NOT ──────────────────────────────────────
//
// The answer and the way back. Their two names, the fact that the answer was
// yes, one photo of theirs, a QR and the printed URL.
//
// The letter is NOT on it, and that is deliberate. It is the one thing on the
// page written to ONE person, and it reads completely differently pasted
// across a public story than it does at the end of a link only they opened.
// Putting it here would also spoil the link: a viewer who has already read it
// off a story has no reason to open the page. The same argument is made at
// greater length on the rakhi card, which is where this pattern comes from.
//
// ── THE GIF TRAP ────────────────────────────────────────────────────────────
//
// `html-to-image` serialises whichever frame happens to be painted. Every piece
// of character art in this template is an animated GIF or animated WebP, so
// NONE of it is on this card — a random mid-frame of a penguin would look
// deliberate enough that nobody would notice it was wrong.
//
// What is here instead is the sender's own first memory photo, which is a still
// image they uploaded, and a ring drawn in SVG. The photo is also simply the
// better choice: it is the part of the card that is actually theirs.
//
// ── CORS ────────────────────────────────────────────────────────────────────
//
// The photo may live on the CDN, and a cross-origin <img> taints the canvas and
// makes the whole export throw. Every remote image is inlined to a data URL
// first (`toDataUrl`) and the card does not capture until that has finished.
//
// ── INSTAGRAM ───────────────────────────────────────────────────────────────
//
// There is no web API that posts to a Story, from anyone, at all. What works is
// `navigator.share({ files })` — the OS sheet, with Instagram in it, one tap to
// "Add to story". `canShare({files})` is the only reliable capability check;
// plenty of browsers expose `navigator.share` and then reject file payloads.
// Desktop has no such path, so it downloads and says so.

import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { toDataUrl, fileSlug } from "@/lib/exportPng";
import { encodeQr, qrPath, qrExtent } from "@/lib/share/qr";
import { copyFor } from "./copy";
import { daysSince, type ProposalData } from "./types";
import { CREAM, DISPLAY, INK, INK_SOFT, PINK, PINK_DEEP, SCRIPT } from "./theme";

const W = 1080;
const H = 1920;

interface CardProps {
  data: ProposalData;
  /** Already inlined to a data URL, or null if there is no photo / it failed. */
  photo: string | null;
  /** QR for the published page, as an SVG path in module units. Null in preview. */
  qr: { path: string; extent: number } | null;
  /** Printed under the QR. Host and path, no scheme. */
  linkLabel: string | null;
}

/** A ring, drawn rather than loaded, so it cannot be a half-rendered frame. */
function Ring({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <defs>
        <linearGradient id="psBand" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffd98a" />
          <stop offset="55%" stopColor="#e8b45c" />
          <stop offset="100%" stopColor="#c9913c" />
        </linearGradient>
        <linearGradient id="psStone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#d9ecff" />
          <stop offset="100%" stopColor="#9fc9f2" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="62" r="26" fill="none" stroke="url(#psBand)" strokeWidth="7" />
      <path d="M50 14l13 13-13 14-13-14z" fill="url(#psStone)" stroke="#bcd9f5" strokeWidth="1.2" />
      <path d="M37 27h26" stroke="#ffffff" strokeWidth="1.4" opacity=".75" />
    </svg>
  );
}

/**
 * The card itself. Rendered off-screen at full size and captured by ref.
 * Split out so the export node is unambiguous: the ref points at exactly the
 * 1080×1920 box and nothing else.
 */
const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { data, photo, qr, linkLabel },
  ref,
) {
  const voice = copyFor(data.perspective);
  const days = daysSince(data.metDate);
  const pair = [data.senderName, data.recipientName].filter(Boolean).join(" & ");

  return (
    <div
      ref={ref}
      style={{
        width: W,
        height: H,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "96px 84px",
        boxSizing: "border-box",
        // Flat gradients only. The template's PAGE_BG stacks four radial
        // gradients and html-to-image renders those inconsistently across
        // engines; this is the one place where "looks the same everywhere"
        // matters more than depth.
        background: `linear-gradient(168deg, ${CREAM} 0%, #fff1f6 42%, #f6edff 100%)`,
        fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
      }}
    >
      {/* Soft corner washes, drawn as plain elements rather than background
          layers so every engine paints them identically. */}
      <div
        style={{
          position: "absolute",
          top: -220,
          left: -160,
          width: 720,
          height: 720,
          borderRadius: "50%",
          background: "rgba(255,190,214,.42)",
          filter: "blur(10px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -260,
          right: -180,
          width: 760,
          height: 760,
          borderRadius: "50%",
          background: "rgba(206,188,255,.38)",
          filter: "blur(10px)",
        }}
      />

      <div style={{ position: "relative", width: "100%", textAlign: "center" }}>
        <p
          style={{
            display: "inline-block",
            margin: "0 0 34px",
            padding: "14px 34px",
            borderRadius: 999,
            background: "rgba(255,255,255,.8)",
            border: "2px solid rgba(255,190,214,.9)",
            fontFamily: DISPLAY,
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: 2,
            color: PINK_DEEP,
          }}
        >
          {voice.storyHeadline.toUpperCase()}
        </p>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 26 }}>
          <Ring size={132} />
        </div>

        <h1
          style={{
            fontFamily: DISPLAY,
            fontSize: 96,
            lineHeight: 1.08,
            fontWeight: 700,
            color: INK,
            margin: "0 0 18px",
            letterSpacing: "-0.02em",
          }}
        >
          {data.recipientName || "They"} said yes
        </h1>

        {pair && (
          <p style={{ fontFamily: SCRIPT, fontSize: 58, color: PINK_DEEP, margin: "0 0 44px" }}>
            {pair}
          </p>
        )}

        {/* Their photo, in a polaroid. Held to a fixed box so a portrait and a
            landscape shot both produce the same card. */}
        <div
          style={{
            width: 620,
            margin: "0 auto 44px",
            padding: "26px 26px 34px",
            background: "#fff",
            borderRadius: 18,
            boxShadow: "0 30px 60px -28px rgba(160,90,120,.55)",
            transform: "rotate(-1.6deg)",
          }}
        >
          <div
            style={{
              width: "100%",
              height: 520,
              borderRadius: 10,
              overflow: "hidden",
              background: "linear-gradient(150deg,#ffe7ef,#f2ebff)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span style={{ fontSize: 150 }}>💗</span>
            )}
          </div>
          <p
            style={{
              fontFamily: SCRIPT,
              fontSize: 36,
              color: INK_SOFT,
              margin: "22px 0 0",
              textAlign: "center",
            }}
          >
            {days !== null ? `${days.toLocaleString()} days and counting` : "and that's the story"}
          </p>
        </div>
      </div>

      {/* The way back: QR and the printed link. */}
      <div
        style={{
          position: "absolute",
          left: 84,
          right: 84,
          bottom: 92,
          display: "flex",
          alignItems: "center",
          gap: 32,
        }}
      >
        {qr && (
          <div
            style={{
              width: 168,
              height: 168,
              flex: "none",
              background: "#fff",
              borderRadius: 20,
              padding: 12,
              boxSizing: "border-box",
              boxShadow: "0 16px 34px -18px rgba(160,90,120,.5)",
            }}
          >
            <svg
              viewBox={`0 0 ${qr.extent} ${qr.extent}`}
              width="100%"
              height="100%"
              shapeRendering="crispEdges"
            >
              <path d={qr.path} fill={INK} />
            </svg>
          </div>
        )}
        <div style={{ textAlign: "left", minWidth: 0 }}>
          <p
            style={{
              fontFamily: DISPLAY,
              fontSize: 34,
              fontWeight: 700,
              color: INK,
              margin: 0,
              lineHeight: 1.25,
              overflowWrap: "anywhere",
            }}
          >
            {linkLabel || "subhsandesh.in"}
          </p>
          <p style={{ fontSize: 26, color: INK_SOFT, margin: "10px 0 0" }}>
            {qr ? "scan or tap the link to see the whole thing" : "make yours in a minute"}
          </p>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 22,
          color: PINK,
          letterSpacing: 1,
        }}
      >
        made on SubhSandesh
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
 * Off-screen host plus the two actions.
 *
 * The node is kept MOUNTED (not `display:none`) because html-to-image cannot
 * capture a node with no layout — it would produce a 0×0 canvas.
 */
export function useStoryCard(data: ProposalData, shareUrl?: string | null) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  // `useMemo` because encodeQr walks the full Reed–Solomon path and this
  // re-renders on every keystroke in the builder.
  const qr = useMemo(() => {
    if (!shareUrl) return null;
    // "medium" rather than "high": nothing is drawn over this symbol, and the
    // lower level keeps the module count small enough that each module is still
    // several pixels wide at 168px on the exported PNG.
    const matrix = encodeQr(shareUrl, "medium");
    if (!matrix) return null;
    return { path: qrPath(matrix, 2), extent: qrExtent(matrix, 2) };
  }, [shareUrl]);

  const linkLabel = useMemo(
    () => (shareUrl ? shareUrl.replace(/^https?:\/\//, "").replace(/\/$/, "") : null),
    [shareUrl],
  );

  const source = data.memories.find((m) => m.imageUrl.trim())?.imageUrl ?? "";

  useEffect(() => {
    let live = true;
    if (!source) {
      setPhoto(null);
      setReady(true);
      return;
    }
    setReady(false);
    void toDataUrl(source).then((url) => {
      if (!live) return;
      // null is fine — the card falls back to the heart panel rather than
      // rendering a broken image into the PNG.
      setPhoto(url);
      setReady(true);
    });
    return () => {
      live = false;
    };
  }, [source]);

  const filename = `proposal-${fileSlug(
    `${data.senderName || "us"}-${data.recipientName || "forever"}`,
  )}`;

  const capture = async (): Promise<Blob | null> => {
    const node = nodeRef.current;
    if (!node) return null;
    try {
      // The faces in layout.tsx are display:"swap" rather than "optional" for
      // this: "optional" lets the browser decline the face and the PNG would
      // come out in Times.
      await document.fonts.ready;
      const { toBlob } = await import("html-to-image");
      return await toBlob(node, {
        pixelRatio: 1, // already 1080×1920 — a multiplier would give 3240×5760
        cacheBust: true,
        backgroundColor: CREAM,
        width: W,
        height: H,
        style: { transform: "none", transformOrigin: "top left" },
      });
    } catch {
      return null;
    }
  };

  const saveBlob = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.png`;
    a.click();
    // Revoking immediately can cancel the download in some browsers.
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  };

  const download = async () => {
    if (busy) return { ok: false, message: "Still working…" };
    setBusy(true);
    const blob = await capture();
    setBusy(false);
    if (!blob) return { ok: false, message: "Couldn't save — try a screenshot instead" };
    saveBlob(blob);
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
    // Instagram will not let this image carry a tappable destination: the Link
    // sticker is added by the poster, inside the app, and no API can attach one
    // for them. What we can do is make it a paste instead of a retype.
    //
    // The order matters and is not cosmetic. `navigator.share` moves focus to
    // the OS sheet, and Safari refuses a clipboard write once the document has
    // lost focus. Copying first means it lands while the page is still active.
    const copiedLink = await copyToClipboard(shareUrl);

    if (typeof navigator !== "undefined" && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: copyFor(data.perspective).storyHeadline,
          // Some targets (WhatsApp, Telegram, Messages) DO accept text beside a
          // file and will send the link with the picture. Instagram ignores it,
          // which costs nothing.
          ...(shareUrl ? { text: shareUrl } : {}),
        });
        setBusy(false);
        return { ok: true, message: copiedLink ? "Link copied — add it as a Link sticker" : "" };
      } catch {
        // Almost always the user dismissing the sheet. Not an error, and it
        // must not be reported as one.
        setBusy(false);
        return { ok: true, message: "" };
      }
    }

    setBusy(false);
    saveBlob(blob);
    return {
      ok: true,
      message: copiedLink
        ? "Saved, and the link is copied — post it and add a Link sticker"
        : "Saved — open Instagram and add it to your story",
    };
  };

  /**
   * `left:-99999px` rather than `display:none` or `visibility:hidden` — both of
   * those remove layout and html-to-image would capture a 0×0 canvas.
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
