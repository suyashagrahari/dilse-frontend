"use client";

import { useEffect, useMemo, useRef, useState, forwardRef } from "react";
import { toDataUrl, fileSlug } from "@/lib/exportPng";
import { encodeQr, qrPath, qrExtent } from "@/lib/share/qr";
import { RB, charmGlyph } from "./theme";
import type { RakhiData } from "./types";
import { RakhiCharm, Rangoli, ThreadDivider } from "./Ornaments";

// ─── The shareable card ──────────────────────────────────────────────────────
//
// 1080×1920 — the true Instagram Story size, so it uploads without Instagram
// re-cropping it and softening every edge.
//
// ── WHAT GOES ON IT: THE COVER, AND THE WAY BACK ────────────────────────────
//
// This card is the front door, not a summary. It carries what screen 1 carries —
// their photograph, "Happy Raksha Bandhan, <name>", her rakhi, one line of hers
// — plus a QR and the printed URL, and nothing else.
//
// It used to also print his vachan, the distance line and the ledger. That is
// the entire page flattened onto one image, and it has two problems. It spoils
// the thing the link is for: a viewer who has already read his promise off a
// story has no reason to open the page and watch him make it. And the vachan is
// something he wrote to HER, which lands differently pasted across a public
// story than it does at the end of a page only he opened.
//
// So: the cover, and a route to the rest. Anything you are tempted to add here
// is something you are taking off the page.
//
// ── FOUR TRAPS, ALL OF THEM LIVE HERE ───────────────────────────────────────
//
// 1. GIFs. `html-to-image` serialises whichever frame is painted at that
//    instant. NOTHING in this card is a GIF — the ritual animations stay on
//    their own screens. If you add one here you get a random frame, and it will
//    look deliberate enough that nobody notices it is wrong.
//
// 2. CORS. Her photo lives on S3, and a cross-origin <img> taints the canvas and
//    makes the whole export throw. Every remote image is inlined to a data URL
//    first (`toDataUrl`), and the card does not render until that finishes.
//
// 3. Fonts. `exportNodeToPng` awaits `document.fonts.ready`, which is why the
//    faces in layout.tsx are `display:"swap"` and not `"optional"` — "optional"
//    lets the browser decline the face and the PNG would come out in Times.
//
// 4. Scale. The node is 1080px wide and previewed with a CSS transform. The
//    capture neutralises that transform; never bake the preview scale in.
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

function fmtDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

interface CardProps {
  data: RakhiData;
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
  const date = fmtDate(data.festivalDate);
  const greeting = data.greeting.find((l) => l.trim());

  return (
    <div
      ref={ref}
      className="rb-storycard"
      style={{
        width: W,
        height: H,
        background: `linear-gradient(168deg, ${RB.paper} 0%, ${RB.paperDeep} 62%, #f0dcc0 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "110px 78px 88px",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Corner rules — geometric, drawn, not an emoji border. */}
      {(
        [
          { pos: { top: 46, left: 46 }, deg: 0 },
          { pos: { top: 46, right: 46 }, deg: 90 },
          { pos: { bottom: 46, right: 46 }, deg: 180 },
          { pos: { bottom: 46, left: 46 }, deg: 270 },
        ] as const
      ).map(({ pos, deg }, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            ...pos,
            width: 84,
            height: 84,
            borderTop: `4px solid ${RB.brass}`,
            borderLeft: `4px solid ${RB.brass}`,
            transform: `rotate(${deg}deg)`,
            opacity: 0.55,
          }}
        />
      ))}

      {/* Rangoli texture. `still` — nothing in an export node may animate. */}
      <div style={{ position: "absolute", top: 520, left: "50%", transform: "translateX(-50%)" }}>
        <Rangoli size={900} opacity={0.05} petals={20} still />
      </div>

      {/* ── Head ── */}
      <div style={{ textAlign: "center", width: "100%", position: "relative" }}>
        <p
          className="rb-deva"
          style={{ fontSize: 40, color: RB.brass, margin: "0 0 14px", letterSpacing: 1 }}
        >
          रक्षा बंधन
        </p>
        <h1
          className="rb-display"
          style={{
            fontSize: 82,
            lineHeight: 1.06,
            fontWeight: 700,
            color: RB.red,
            margin: 0,
            overflowWrap: "anywhere",
          }}
        >
          Happy Raksha
          <br />
          Bandhan
        </h1>
        <div style={{ display: "grid", placeItems: "center", marginTop: 22 }}>
          <ThreadDivider
            colorA={data.rakhi.threadColorA}
            colorB={data.rakhi.threadColorB}
            width={420}
          />
        </div>
      </div>

      {/* ── Photo ── */}
      <div
        style={{
          width: 660,
          height: 660,
          borderRadius: 26,
          overflow: "hidden",
          background: RB.paperDeep,
          border: `10px solid ${RB.surface}`,
          boxShadow: "0 26px 60px rgba(61,35,23,0.24)",
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
            width={660}
            height={660}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{ textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 150, lineHeight: 1 }}>🪢</div>
            <p className="rb-display" style={{ fontSize: 34, color: RB.brass, marginTop: 18 }}>
              {data.sisterName || "Behen"} &amp; {data.brotherName}
            </p>
          </div>
        )}
      </div>

      {/* ── Names + the rakhi she designed ── */}
      <div style={{ textAlign: "center", width: "100%" }}>
        {/* Her actual rakhi, drawn as SVG so it is crisp at 1080px. */}
        <div style={{ display: "grid", placeItems: "center", marginBottom: 18 }}>
          <RakhiCharm
            size={104}
            colorA={data.rakhi.threadColorA}
            colorB={data.rakhi.threadColorB}
            bead={data.rakhi.beadColor}
            glyph={charmGlyph[data.rakhi.charm] ?? "ॐ"}
          />
          {data.rakhi.pendantText && (
            <p
              className="rb-hand"
              style={{ fontSize: 34, color: RB.brass, margin: "8px 0 0" }}
            >
              {data.rakhi.pendantText}
            </p>
          )}
        </div>

        <p
          className="rb-display"
          style={{
            fontSize: 58,
            lineHeight: 1.2,
            fontWeight: 600,
            color: RB.ink,
            margin: 0,
            overflowWrap: "anywhere",
          }}
        >
          {data.sisterName || "Behen"}
          <span style={{ color: RB.brass }}> &amp; </span>
          {data.brotherName}
        </p>

        {/* ONE line of hers, not the vachan and not the ledger. See the note at
            the top of the file about what this card is and is not. */}
        {greeting && (
          <p
            className="rb-hand"
            style={{
              fontSize: 40,
              lineHeight: 1.4,
              color: RB.muted,
              margin: "26px auto 0",
              maxWidth: 780,
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
          background: "rgba(255,253,248,0.9)",
          border: `2px solid ${RB.hairline}`,
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
                is one more thing html-to-image has to resolve before the capture,
                and this symbol is two dozen path commands. */}
            <svg
              width="148"
              height="148"
              viewBox={`0 0 ${qr.extent} ${qr.extent}`}
              shapeRendering="crispEdges"
              aria-hidden
            >
              <rect width={qr.extent} height={qr.extent} fill="#ffffff" />
              <path d={qr.path} fill={RB.ink} />
            </svg>
          </div>
        )}

        <div style={{ textAlign: "left", minWidth: 0 }}>
          {date && (
            <p style={{ fontSize: 26, color: RB.brass, margin: "0 0 10px", letterSpacing: 2 }}>
              {date.toUpperCase()}
            </p>
          )}
          <p
            className="rb-display"
            style={{
              fontSize: 34,
              fontWeight: 700,
              color: RB.ink,
              margin: 0,
              lineHeight: 1.25,
              overflowWrap: "anywhere",
            }}
          >
            {linkLabel || "subhsandesh.in"}
          </p>
          <p style={{ fontSize: 24, color: RB.muted, margin: "8px 0 0" }}>
            {qr ? "scan or tap the link to open it" : "make yours in a minute"}
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
    // Insecure origin, a denied permission, or a browser that requires the write
    // to happen inside a user gesture it no longer considers active.
    return false;
  }
}

export interface StoryCardHandle {
  /** Download the PNG. Never throws. */
  download: () => Promise<{ ok: boolean; message: string }>;
  /** Native share sheet if the device has one; otherwise falls back to download. */
  share: () => Promise<{ ok: boolean; message: string }>;
  /** True once the photo has been inlined and the node is safe to capture. */
  ready: boolean;
}

/**
 * Off-screen host. Kept mounted (not `display:none`) because html-to-image
 * cannot capture a node with no layout — it would produce a 0×0 canvas.
 */
export function useStoryCard(data: RakhiData, shareUrl?: string | null) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  // The route back to the page, printed and encoded on the card. `useMemo`
  // because encodeQr walks the full Reed–Solomon path and the card re-renders on
  // every keystroke in the builder.
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
    toDataUrl(data.photoUrl).then((url) => {
      if (!live) return;
      // null is fine — the card falls back to the emoji panel rather than
      // rendering a broken image into the PNG.
      setPhoto(url);
      setReady(true);
    });
    return () => {
      live = false;
    };
  }, [data.photoUrl]);

  const filename = `raksha-bandhan-${fileSlug(
    `${data.sisterName || "behen"}-${data.brotherName || "bhai"}`
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
        backgroundColor: RB.paper,
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
          title: "Happy Raksha Bandhan",
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
        // Almost always the user dismissing the sheet. Not an error, and it
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
