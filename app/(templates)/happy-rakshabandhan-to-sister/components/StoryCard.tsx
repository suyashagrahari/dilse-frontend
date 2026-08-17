"use client";

import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { toDataUrl, fileSlug } from "@/lib/exportPng";
import { encodeQr, qrPath, qrExtent } from "@/lib/share/qr";
import { RS } from "./theme";
import { rakhiStyle, sisterWord, type SisterData } from "./types";
import { Rangoli, ThreadRule } from "./Ornaments";

// ─── The shareable card ──────────────────────────────────────────────────────
//
// 1080×1920 — the true Instagram Story size, so it uploads without Instagram
// re-cropping it and softening every edge.
//
// ── WHY THIS FILE MATTERS MORE THAN ANY SCREEN IN THE TEMPLATE ──────────────
//
// For this class of product the IMAGE spreads, not the link. A link dropped into
// a family group gets one tap from the person it was sent to; a picture gets
// forwarded, screenshotted and re-posted. And WhatsApp's stricter privacy
// settings disable link previews outright for a growing share of users, so a
// forwarded link can arrive as a bare grey URL with nothing to look at — in which
// case this PNG is the only artefact that travels at all.
//
// So it is composed as a poster and not as a receipt, and it is composed to read
// at THUMBNAIL size, because that is the size at which somebody decides whether
// to open it. Her name is the largest object on it by a wide margin, the photo is
// the second, and everything else is support. If a future edit adds a fourth
// competing element, something else has to come off.
//
// ── WHAT IS ON IT AND WHY ───────────────────────────────────────────────────
//
//   her name       — who it is for, and the only word readable at 120px wide
//   the rakhi      — the one she actually chose and tied, drawn from her pick
//   one vow line   — the strongest one; see `strongestVow` below
//   the photograph — the two of them
//   the QR + URL   — the way back to the page
//
// This DOES print a line of his vow, which is a deliberate departure from the
// brother template's card (that one prints no vachan at all, because there the
// promise was written privately TO the sharer). Here the sharer is the sister and
// the vow is the thing she was given — a sister posting "Ghar tera bhi hai" with
// her brother's name under it is the entire appeal of the page, and withholding
// it would leave a card that says only "Happy Raksha Bandhan".
//
// ── FIVE TRAPS, ALL OF THEM LIVE IN THIS FILE ───────────────────────────────
//
// 1. COLOUR FUNCTIONS. `html-to-image` serialises computed style, and Tailwind's
//    palette utilities compile to `oklch()`, which the serialiser cannot parse —
//    the capture throws or silently drops the colour. EVERY colour inside the
//    captured node is an explicit hex from `RS`. No `text-*`, no `bg-*`. The only
//    classes used inside it are the three font classes, which carry no colour.
//
// 2. ANIMATION. The capture snapshots whichever frame happens to be painted, so
//    an ornament caught mid-rotation bakes a crooked mandala into the PNG. The
//    rangoli is passed `still`, and nothing else in the node moves at all.
//
// 3. CORS. The photo lives on the CDN and a cross-origin <img> taints the canvas,
//    which throws the whole export. Remote images are inlined to a data URL first
//    (`toDataUrl`) and the node reports `ready: false` until that finishes.
//
// 4. FONTS. The capture awaits `document.fonts.ready`, which is why the faces are
//    registered `display:"swap"` and not `"optional"` — "optional" lets the
//    browser decline the face and the PNG comes out in Times.
//
// 5. SCALE. The node is a true 1080px wide. `pixelRatio: 1` and an explicit
//    `transform: none` during capture; a multiplier would give 3240×5760.
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

/**
 * The line of his vow that goes on the card.
 *
 * The LAST non-empty line, not the first. `types.ts` places the strongest
 * sentence last by construction — the right-of-return line, "Ghar tera bhi hai" —
 * with a comment saying nothing follows it well, and both `SAMPLE` and `DEMO`
 * follow that. Taking `vow[0]` would print the joke instead of the promise.
 */
function strongestVow(vow: string[]): string {
  for (let i = vow.length - 1; i >= 0; i -= 1) {
    const line = vow[i]?.trim();
    if (line) return line;
  }
  return "";
}

/**
 * Her name at the size it can actually be set at. A three-letter name and a
 * hyphenated twelve-letter one cannot share a font size on a 1080px card — the
 * first looks lost and the second wraps into the photograph.
 */
function nameSize(name: string): number {
  const n = name.length;
  if (n <= 7) return 132;
  if (n <= 11) return 108;
  if (n <= 16) return 84;
  return 66;
}

/**
 * The rakhi she chose, drawn rather than composed from an ornament.
 *
 * `Marigold` and `ThreadRule` are the wrong objects for this: what has to be
 * recognisable at thumbnail size is a BEAD ON A THREAD, which is the silhouette
 * of a rakhi and of nothing else. Static by construction — see trap 2.
 */
function RakhiMark({
  size,
  colorA,
  colorB,
  bead,
  glyph,
}: {
  size: number;
  colorA: string;
  colorB: string;
  bead: string;
  glyph: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      {/* Two thread ends leaving the pendant, in antiphase — one wave reads as a
          squiggle, two read as plies twisted together. */}
      <path
        d="M2 50 q10 -9 20 0 q10 9 20 0"
        fill="none"
        stroke={colorA}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M2 50 q10 9 20 0 q10 -9 20 0"
        fill="none"
        stroke={colorB}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M58 50 q10 -9 20 0 q10 9 20 0"
        fill="none"
        stroke={colorA}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M58 50 q10 9 20 0 q10 -9 20 0"
        fill="none"
        stroke={colorB}
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Eight petals, then the bead. */}
      {Array.from({ length: 8 }, (_, i) => (
        <ellipse
          key={i}
          cx="50"
          cy="32"
          rx="7"
          ry="15"
          fill={i % 2 === 0 ? colorA : colorB}
          transform={`rotate(${i * 45} 50 50)`}
          opacity="0.95"
        />
      ))}
      <circle cx="50" cy="50" r="17" fill={bead} stroke={RS.brass} strokeWidth="2.5" />
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="18"
        fill={RS.ink}
      >
        {glyph}
      </text>
    </svg>
  );
}

interface CardProps {
  data: SisterData;
  /** Already inlined to a data URL, or null if there is no photo / it failed. */
  photo: string | null;
  /** QR for the published page, as an SVG path in module units. Null in preview. */
  qr: { path: string; extent: number } | null;
  /** Printed under the QR. Host + path, no scheme. */
  linkLabel: string | null;
}

/**
 * The card itself, rendered off-screen at full size and captured by ref. Split
 * out so the export node is unambiguous — the ref points at exactly the 1080×1920
 * box and nothing else.
 */
const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { data, photo, qr, linkLabel },
  ref
) {
  const her = data.sisterName || sisterWord(data);
  const him = data.brotherName || "Bhai";
  const date = fmtDate(data.festivalDate);
  const vowLine = strongestVow(data.vow);

  /**
   * Only draw the rakhi she actually tied.
   *
   * `rakhiStyle("")` falls back to the first style in the list, which is correct
   * for a screen that needs a colour but a small lie on a card — printing "Phool"
   * under a rakhi she never chose is worse than printing no rakhi at all. So the
   * mark appears only once `rakhiPicked` is set, which is the moment she tied one.
   */
  const picked = data.rakhiPicked ? rakhiStyle(data.rakhiPicked) : null;

  return (
    <div
      ref={ref}
      className="rs-storycard"
      style={{
        width: W,
        height: H,
        background: `linear-gradient(168deg, ${RS.paper} 0%, ${RS.paperDeep} 64%, #f3dfc6 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "104px 76px 84px",
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
            borderTop: `4px solid ${RS.brass}`,
            borderLeft: `4px solid ${RS.brass}`,
            transform: `rotate(${deg}deg)`,
            opacity: 0.5,
          }}
        />
      ))}

      {/* Texture. `still` — nothing inside an export node may animate. */}
      <div
        style={{
          position: "absolute",
          top: 470,
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <Rangoli size={900} opacity={0.05} petals={20} still />
      </div>

      {/* ── Head: who it is for ─────────────────────────────────────────────
       *
       * Her name, and nothing competing with it. The festival is named in 36px
       * above it because at thumbnail size only one line survives and it should
       * be the name — anyone looking already knows what day it is. */}
      <div style={{ textAlign: "center", width: "100%", position: "relative" }}>
        <p
          className="rs-deva"
          style={{ fontSize: 38, color: RS.brass, margin: "0 0 10px" }}
        >
          रक्षा बंधन
        </p>
        <p
          className="rs-display"
          style={{
            fontSize: 34,
            color: RS.muted,
            margin: "0 0 6px",
            letterSpacing: 3,
          }}
        >
          {sisterWord(data).toUpperCase()}
        </p>
        <h1
          className="rs-display"
          style={{
            fontSize: nameSize(her),
            lineHeight: 1.02,
            fontWeight: 700,
            color: RS.rani,
            margin: 0,
            overflowWrap: "anywhere",
          }}
        >
          {her}
        </h1>

        {/* The rakhi she tied, with its name. */}
        {picked ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 20,
              marginTop: 24,
            }}
          >
            <RakhiMark
              size={104}
              colorA={picked.threadA}
              colorB={picked.threadB}
              bead={picked.bead}
              glyph={picked.glyph}
            />
            <div style={{ textAlign: "left" }}>
              <p
                className="rs-display"
                style={{ fontSize: 34, fontWeight: 700, color: RS.ink, margin: 0 }}
              >
                {picked.name}
              </p>
              <p className="rs-deva" style={{ fontSize: 28, color: RS.brass, margin: "4px 0 0" }}>
                {picked.hindi} · बंध गई
              </p>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", placeItems: "center", marginTop: 24 }}>
            <ThreadRule width={420} />
          </div>
        )}
      </div>

      {/* ── The photograph ──────────────────────────────────────────────────── */}
      <div
        style={{
          width: 640,
          height: 640,
          borderRadius: 26,
          overflow: "hidden",
          background: RS.paperDeep,
          border: `10px solid ${RS.surface}`,
          boxShadow: "0 26px 60px rgba(51,32,43,0.24)",
          flexShrink: 0,
          display: "grid",
          placeItems: "center",
        }}
      >
        {photo ? (
          // Plain <img>: next/image would inject a srcset and a lazy loader that
          // html-to-image then has to resolve. This src is already a data URL, so
          // there is nothing left to optimise.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt=""
            width={640}
            height={640}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          /* No photo. A drawn panel rather than an empty frame, so the card is
             still a poster and not a placeholder. */
          <div style={{ textAlign: "center", padding: 44 }}>
            <div style={{ display: "grid", placeItems: "center" }}>
              <RakhiMark
                size={230}
                colorA={picked?.threadA ?? RS.rani}
                colorB={picked?.threadB ?? RS.haldi}
                bead={picked?.bead ?? RS.brass}
                glyph={picked?.glyph ?? "ॐ"}
              />
            </div>
            <p
              className="rs-display"
              style={{ fontSize: 40, color: RS.brass, margin: "20px 0 0", fontWeight: 700 }}
            >
              {her} &amp; {him}
            </p>
          </div>
        )}
      </div>

      {/* ── His vow, one line, signed ───────────────────────────────────────
       *
       * One line. The temptation is to print all four and make the card a
       * summary of the page — which spoils the page and, worse, buries the line
       * that would have made somebody open it. */}
      <div style={{ textAlign: "center", width: "100%" }}>
        {vowLine ? (
          <>
            <p
              className="rs-hand"
              style={{
                fontSize: 46,
                lineHeight: 1.36,
                color: RS.ink,
                margin: "0 auto",
                maxWidth: 800,
                overflowWrap: "anywhere",
              }}
            >
              &ldquo;{vowLine}&rdquo;
            </p>
            <p
              className="rs-display"
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: RS.rani,
                margin: "20px 0 0",
                letterSpacing: 1,
              }}
            >
              — {him}
              {data.vowSince ? (
                <span style={{ color: RS.muted, fontWeight: 400 }}>, {data.vowSince}</span>
              ) : null}
            </p>
          </>
        ) : (
          <p
            className="rs-display"
            style={{ fontSize: 46, fontWeight: 700, color: RS.ink, margin: 0 }}
          >
            {her} &amp; {him}
          </p>
        )}
      </div>

      {/* ── Foot: the way back to the page ─────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 30,
          padding: "22px 30px",
          borderRadius: 30,
          background: "rgba(255,253,248,0.9)",
          border: `2px solid ${RS.hairline}`,
          maxWidth: "100%",
        }}
      >
        {qr && (
          <div
            style={{
              width: 168,
              height: 168,
              flexShrink: 0,
              background: "#ffffff",
              borderRadius: 16,
              padding: 10,
              boxSizing: "border-box",
            }}
          >
            {/* Drawn inline rather than loaded — an <img> inside the export node is
                one more thing html-to-image has to resolve before it can capture,
                and this symbol is two dozen path commands. */}
            <svg
              width="148"
              height="148"
              viewBox={`0 0 ${qr.extent} ${qr.extent}`}
              shapeRendering="crispEdges"
              aria-hidden
            >
              <rect width={qr.extent} height={qr.extent} fill="#ffffff" />
              <path d={qr.path} fill={RS.ink} />
            </svg>
          </div>
        )}

        <div style={{ textAlign: "left", minWidth: 0 }}>
          {date && (
            <p style={{ fontSize: 26, color: RS.brass, margin: "0 0 10px", letterSpacing: 2 }}>
              {date.toUpperCase()}
            </p>
          )}
          <p
            className="rs-display"
            style={{
              fontSize: 34,
              fontWeight: 700,
              color: RS.ink,
              margin: 0,
              lineHeight: 1.25,
              overflowWrap: "anywhere",
            }}
          >
            {linkLabel || "subhsandesh.in"}
          </p>
          <p style={{ fontSize: 24, color: RS.muted, margin: "8px 0 0" }}>
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
    // Insecure origin, a denied permission, or a browser that no longer considers
    // the user gesture active.
    return false;
  }
}

/**
 * Off-screen host. Kept mounted (not `display: none`) because html-to-image
 * cannot capture a node with no layout — it would produce a 0×0 canvas.
 */
export function useStoryCard(data: SisterData, shareUrl: string | null) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  /**
   * The inlined photo, tagged with the source it came from.
   *
   * ── WHY IT CARRIES ITS OWN SOURCE, AND WHY `ready` IS DERIVED ────────────
   *
   * The obvious version is two pieces of state — `photo` and `ready` — with the
   * effect calling `setReady(false)` before it starts fetching. That is a
   * synchronous `setState` in an effect body, which `react-hooks/set-state-in-effect`
   * rejects and which fails the build in this repo.
   *
   * Keeping the source alongside the result makes both values derivable instead:
   * if the tag does not match the photo currently on the data, the inline is
   * stale, which is precisely the state `ready: false` was describing. The effect
   * then only ever sets state from inside an async callback, which the rule
   * allows and which also removes a cascading render.
   */
  const [inlined, setInlined] = useState<{ src: string; url: string | null } | null>(null);

  const src = data.photoUrl;
  const fresh = !!inlined && inlined.src === src;
  const photo = fresh ? inlined.url : null;
  const ready = !src || fresh;

  useEffect(() => {
    if (!src || (inlined && inlined.src === src)) return;
    let live = true;
    toDataUrl(src).then((url) => {
      // null is fine — the card falls back to its drawn panel rather than baking
      // a broken image into the PNG.
      if (live) setInlined({ src, url });
    });
    return () => {
      live = false;
    };
  }, [src, inlined]);

  // The route back to the page, printed and encoded on the card. `useMemo`
  // because `encodeQr` walks the full Reed–Solomon path and this hook re-runs on
  // every keystroke in the builder preview.
  //
  // A null `shareUrl` means nothing is published yet, and then NO QR is drawn at
  // all — a scannable code pointing at a 404 is worse than a card without one.
  const qr = useMemo(() => {
    if (!shareUrl) return null;
    // "medium" rather than "high": nothing is drawn over this symbol, and the
    // lower level keeps the version — and so the module count — small enough that
    // each module is still about 6px at 148px in the exported PNG.
    const matrix = encodeQr(shareUrl, "medium");
    if (!matrix) return null;
    return { path: qrPath(matrix, 2), extent: qrExtent(matrix, 2) };
  }, [shareUrl]);

  const linkLabel = useMemo(
    () => (shareUrl ? shareUrl.replace(/^https?:\/\//, "").replace(/\/$/, "") : null),
    [shareUrl]
  );

  const filename = `raksha-bandhan-${fileSlug(
    `${data.sisterName || "behna"}-${data.brotherName || "bhai"}`
  )}`;

  const capture = async (): Promise<Blob | null> => {
    const node = nodeRef.current;
    if (!node) return null;
    try {
      // Trap 4 — never capture before the faces are in.
      await document.fonts.ready;
      const { toBlob } = await import("html-to-image");
      return await toBlob(node, {
        pixelRatio: 1, // already 1080×1920 — a multiplier would give 3240×5760
        cacheBust: true,
        backgroundColor: RS.paper,
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
    // on their behalf. What we can do is make it a paste instead of a retype.
    //
    // The order is not cosmetic. `navigator.share` moves focus to the OS sheet,
    // and Safari refuses a clipboard write once the document has lost focus, so
    // the copy has to land while the page is still active.
    const copiedLink = await copyToClipboard(shareUrl);

    // canShare({files}) is the only reliable check — plenty of browsers expose
    // navigator.share and then reject a file payload outright.
    if (typeof navigator !== "undefined" && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "Happy Raksha Bandhan",
          // WhatsApp, Telegram and Messages accept text beside a file and will
          // send the link with the picture. Instagram ignores it, which costs
          // nothing.
          ...(shareUrl ? { text: shareUrl } : {}),
        });
        setBusy(false);
        return {
          ok: true,
          message: copiedLink ? "Link copied — add it as a Link sticker" : "",
        };
      } catch {
        // Almost always the sheet being dismissed. Not an error, and it must not
        // be reported as one.
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
   * The off-screen node. `left: -99999px` rather than `display: none` or
   * `visibility: hidden` — both of those remove layout and html-to-image would
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
