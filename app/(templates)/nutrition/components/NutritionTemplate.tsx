"use client";

// ─── Nutrition Facts — the composition ───────────────────────────────────────
//
// Three things stacked in one column, and the whole template is about the
// relationship between them:
//
//   1. The package (PackageFrame) wrapping the panel (NutritionLabel).
//   2. THE MESSAGE, below the package, OUTSIDE the frame, in a serif at a size
//      a person actually reads at.
//   3. Nothing else.
//
// ── THE TONAL BREAK IS THE PRODUCT ───────────────────────────────────────────
//
// Everything above the message is 8px regulatory density: capitals, hard rules,
// right-aligned percentages, a voice with no feelings in it. The message is
// 15px Georgia with a 1.85 line-height and a lot of air around it. That jump —
// from something that looks like it was printed by a compliance department to
// something that reads like a person writing — IS the emotional payload. Any
// change that narrows the gap (a serif on the label, a border on the message, a
// heading over it, matching type sizes) takes the template apart. The message
// is not "the caption under the graphic". The graphic is the setup.
//
// ── SCALE, NEVER REFLOW ──────────────────────────────────────────────────────
//
// The panel is a FIXED 300px block (LABEL_WIDTH). At 380px, at 320px, on a
// desktop, it is always the same 300px block — it is fitted with a CSS
// `transform: scale()` on the wrapper, exactly the way a real label is a real
// physical size. Nothing here uses a breakpoint, and no descendant may reflow:
// a panel that re-lays-out at a narrow width stops looking printed instantly.
// The natural size is measured rather than assumed, so PackageFrame is free to
// change its own padding without touching this file.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { exportNodeToPng, fileSlug, toDataUrl } from "@/lib/exportPng";
import { NutritionLabel } from "./NutritionLabel";
import { PackageFrame } from "./PackageFrame";
import ShareCard, { SHARE_H, SHARE_W } from "./ShareCard";
import type { NutritionData } from "./types";

/**
 * Helvetica, then Arial. Deliberately NOT a webfont.
 *
 * A real panel is set in Helvetica, and the system stack gets that on macOS
 * devices and the near-identical Arial everywhere else — with no network
 * request, no layout shift, and no chance of `html-to-image` capturing the
 * fallback face because a webfont had not landed yet.
 */
export const NF_SANS = 'Helvetica, "Helvetica Neue", Arial, "Liberation Sans", sans-serif';

/** The other voice. Also a system face, for the same capture reason. */
export const NF_SERIF = 'Georgia, "Times New Roman", Times, serif';

/** The card stock behind the package. Warm, paper-ish, deliberately dull. */
export const NF_SURROUND = "#E7E4DC";
export const NF_INK = "#111111";
export const NF_MUTED = "#6B6B6B";

/** Reading measure for the message. Wider than this and the serif falls apart. */
const MESSAGE_MAX = 440;

/** Horizontal breathing room kept on either side of the package at any width. */
const GUTTER = 16;

/** Every tappable row label on the panel, for the capture-time force-open. */
function allRowLabels(data: NutritionData): string[] {
  return [
    ...data.nutrients.map((n) => n.label),
    ...data.vitamins.map((v) => v.label),
  ].filter(Boolean);
}

export function NutritionTemplate({
  data,
  capture = false,
  mode = "preview",
}: {
  data: NutritionData;
  /** Export mode: every row forced open, no scaling, no chrome. */
  capture?: boolean;
  /** `"live"` is the recipient's page and is the only mode with the brand badge. */
  mode?: "preview" | "live";
  shareId?: string;
  hasPassword?: boolean;
}) {
  // ── The one interaction in the template ───────────────────────────────────
  // A Set, not a single id: more than one row may be open at a time, because a
  // panel where opening the second note closes the first reads as a broken
  // accordion rather than as annotations on a document.
  const [openRows, setOpenRows] = useState<Set<string>>(() => new Set());

  const onToggleRow = useCallback((label: string) => {
    setOpenRows((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }, []);

  /**
   * On export, EVERY row is open.
   *
   * A shared PNG of the panel with the notes collapsed is a picture of a joke
   * with the punchlines removed — the notes are where the sender's writing is.
   */
  const effectiveOpenRows = useMemo(
    () => (capture ? new Set(allRowLabels(data)) : openRows),
    [capture, data, openRows],
  );

  // ── Fit-to-viewport lives in PackageFrame, not here ───────────────────────
  // See the note at the render site below: a second scale layer at this level
  // fed back into PackageFrame's own measurement and shrank the panel to
  // nothing. PackageFrame measures the width it is given and scales once.

  // ── PNG export ────────────────────────────────────────────────────────────
  const [cardNode, setCardNode] = useState<HTMLDivElement | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveNote, setSaveNote] = useState("");

  /**
   * A remote photo taints the export canvas and the whole PNG throws, so it is
   * inlined as a data URL before it ever enters the captured node.
   */
  const [photoData, setPhotoData] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    if (!data.photoUrl) {
      setPhotoData(null);
      return;
    }
    toDataUrl(data.photoUrl).then((url) => {
      if (alive) setPhotoData(url);
    });
    return () => {
      alive = false;
    };
  }, [data.photoUrl]);

  const saveImage = useCallback(async () => {
    if (!cardNode || saving) return;
    setSaving(true);
    setSaveNote("");
    // One frame so the off-screen card has painted with its final scale.
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    const result = await exportNodeToPng(cardNode, {
      width: SHARE_W,
      height: SHARE_H,
      pixelRatio: 3,
      backgroundColor: "#FFFFFF",
      filename: `nutrition-facts-${fileSlug(data.productName)}`,
    });
    setSaveNote(result.message);
    setSaving(false);
  }, [cardNode, saving, data.productName]);

  const hasMessage = data.message.some((line) => line.trim().length > 0);
  const hasTappableRow =
    data.nutrients.some((n) => n.note) || data.vitamins.some((v) => v.note);

  // ── Capture render ────────────────────────────────────────────────────────
  // No scaling, no chrome, no message: this is the package alone at true size,
  // for ShareCard to place and scale itself.
  if (capture) {
    return (
      <PackageFrame data={data} capture>
        <NutritionLabel data={data} openRows={effectiveOpenRows} onToggleRow={onToggleRow} capture />
      </PackageFrame>
    );
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: NF_SURROUND,
        fontFamily: NF_SANS,
        color: NF_INK,
        // The panel is a fixed block; the page around it must never scroll
        // sideways just because a desktop window is narrow.
        overflowX: "hidden",
      }}
    >
      <NutritionStyles />

      {mode === "live" ? <BrandBadge /> : null}

      <div
        style={{
          paddingTop: mode === "preview" ? 64 : 22,
          paddingBottom: 56,
          paddingLeft: GUTTER,
          paddingRight: GUTTER,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* The only affordance. There is no chevron on the rows — a panel with
            disclosure arrows on it is a UI, and this has to be a label. */}
        {hasTappableRow ? (
          <p
            style={{
              margin: "0 0 10px",
              fontFamily: NF_SANS,
              fontSize: 10,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: NF_MUTED,
              textAlign: "center",
            }}
          >
            Tap any line
          </p>
        ) : null}

        {/* ── ONE SCALE LAYER, AND IT LIVES IN PackageFrame ──────────────────
            There used to be a second `transform: scale()` here as well. It
            compounded catastrophically: this wrapper set its LAYOUT width to
            `natural.w * scale`, PackageFrame then measured that already-shrunk
            `host.clientWidth` and scaled itself again, and because each side
            had its own ResizeObserver watching the other's box, every pass
            ratcheted the product down — the 300px panel ended up rendering at
            roughly 7x12 CSS pixels, i.e. invisible.
            PackageFrame fits itself to whatever width it is handed, so the
            correct number of scale layers here is zero. Do not add one back. */}
        <div style={{ width: "100%" }}>
          <PackageFrame data={data} capture={capture}>
            <NutritionLabel data={data} openRows={effectiveOpenRows} onToggleRow={onToggleRow} />
          </PackageFrame>
        </div>

        {/* ── THE MESSAGE ──────────────────────────────────────────────────
            Outside the package. Serif, 15px, 1.85 leading, a lot of space
            above it. Nothing about this block is allowed to match the label. */}
        {hasMessage ? (
          <div
            style={{
              width: "100%",
              maxWidth: MESSAGE_MAX,
              marginTop: 56,
              fontFamily: NF_SERIF,
            }}
          >
            {data.message
              .filter((line) => line.trim().length > 0)
              .map((line, i) => (
                <p
                  key={i}
                  style={{
                    margin: i === 0 ? 0 : "22px 0 0",
                    fontFamily: NF_SERIF,
                    fontSize: 15,
                    lineHeight: 1.85,
                    letterSpacing: "0.005em",
                    color: "#25231F",
                  }}
                >
                  {line}
                </p>
              ))}
          </div>
        ) : null}

        <div style={{ marginTop: hasMessage ? 40 : 32, textAlign: "center" }}>
          <button
            type="button"
            onClick={saveImage}
            disabled={saving}
            className="nf-save"
            style={{
              fontFamily: NF_SANS,
              fontSize: 10,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: NF_MUTED,
              background: "transparent",
              border: `1px solid ${NF_MUTED}`,
              borderRadius: 2,
              padding: "9px 16px",
              minHeight: 36,
              cursor: saving ? "default" : "pointer",
              opacity: saving ? 0.55 : 1,
            }}
          >
            {saving ? "Saving…" : "Save as image"}
          </button>
          <p
            aria-live="polite"
            style={{
              margin: "8px 0 0",
              fontFamily: NF_SANS,
              fontSize: 10,
              color: NF_MUTED,
              minHeight: 12,
            }}
          >
            {saveNote}
          </p>
        </div>
      </div>

      {/* Off-screen and always mounted, so an export never waits on a render. */}
      <ShareCard data={data} photoData={photoData} attach={setCardNode} />
    </div>
  );
}

export default NutritionTemplate;

/**
 * The recipient's way to make one of their own.
 *
 * Sits outside the package on purpose — a SubhSandesh badge printed on the
 * carton would be the one element on the panel that admits it is a website.
 */
function BrandBadge() {
  return (
    <Link
      href="/templates"
      aria-label="Create your own on SubhSandesh"
      style={{
        position: "fixed",
        top: 10,
        right: 10,
        zIndex: 95,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        minHeight: 32,
        padding: "6px 10px",
        borderRadius: 6,
        background: "#FFFFFF",
        border: "1px solid #C9C4B8",
        textDecoration: "none",
      }}
    >
      <Image src="/logo.webp" alt="" width={16} height={16} style={{ borderRadius: 4 }} />
      <span style={{ fontFamily: NF_SANS, fontSize: 11, fontWeight: 600, color: NF_INK }}>
        SubhSandesh
      </span>
    </Link>
  );
}

/**
 * The only stylesheet in the template, and it is four rules long.
 *
 * `prefers-reduced-motion` is honoured by having almost nothing to reduce: the
 * single transition here is the save button's hover, and it is switched off
 * outright rather than shortened.
 */
function NutritionStyles() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
.nf-save { transition: color .15s ease, border-color .15s ease; }
.nf-save:hover:not(:disabled) { color: #111111; border-color: #111111; }
.nf-save:focus-visible { outline: 2px solid #111111; outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) {
  .nf-save { transition: none; }
}
`,
      }}
    />
  );
}
