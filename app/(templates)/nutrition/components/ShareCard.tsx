"use client";

// ─── The share card ──────────────────────────────────────────────────────────
//
// 9:16 — 360×640 CSS px, captured at pixelRatio 3 → 1080×1920. This is the
// portrait image that gets posted, so it is COMPOSED rather than cropped out of
// the page: photo on top if there is one, the package alone in the middle at the
// biggest size that fits, watermark in the corner.
//
// ── THE THREE THINGS THAT WOULD MAKE THIS EXPORT WRONG ───────────────────────
//
//   1. COLLAPSED ROWS. Every note is forced open here. A PNG of this panel with
//      the notes shut is a picture of a joke with the punchlines deleted — the
//      notes are the sender's actual writing, and they are the reason to share
//      it at all.
//   2. A CAPTURED NODE THAT IS ITSELF OFF-SCREEN. html-to-image clones the node
//      it is handed into a foreignObject at the origin, so `position: fixed;
//      left: -20000px` ON THE CAPTURED NODE renders the card outside the canvas
//      and the PNG comes out blank at exactly the right dimensions. Hence two
//      elements: the outer one hides, the inner one — the one `attach` hands to
//      the exporter — is statically positioned at 0,0 inside it.
//   3. A REMOTE PHOTO. A cross-origin <img> taints the canvas and the export
//      throws. NutritionTemplate inlines the photo as a data URL and passes it
//      in as `photoData`; the raw `photoUrl` never reaches this file.
//
// The watermark sits OUTSIDE the package. On the label it would be the one
// element admitting this is a website, which is the joke's only load-bearing
// lie.

import { useEffect, useMemo, useRef, useState } from "react";
import { NutritionLabel } from "./NutritionLabel";
import { PackageFrame } from "./PackageFrame";
import type { NutritionData } from "./types";

export const SHARE_W = 360;
export const SHARE_H = 640;

const PAD = 22;
const PHOTO = 92;
const SANS = 'Helvetica, "Helvetica Neue", Arial, "Liberation Sans", sans-serif';
const MUTED = "#8A8A8A";

const noop = () => {};

export default function ShareCard({
  data,
  photoData,
  attach,
}: {
  data: NutritionData;
  /** The product photo, already inlined as a data URL. Null when there is none. */
  photoData: string | null;
  attach: (el: HTMLDivElement | null) => void;
}) {
  /** Everything open. See trap 1 above. */
  const openRows = useMemo(
    () =>
      new Set(
        [...data.nutrients.map((n) => n.label), ...data.vitamins.map((v) => v.label)].filter(Boolean),
      ),
    [data.nutrients, data.vitamins],
  );

  // The panel is a fixed block and is fitted, never reflowed — same rule as the
  // page. Both sides of the ratio are measured because PackageFrame owns its own
  // padding and the panel's height depends on how much the sender wrote.
  const areaRef = useRef<HTMLDivElement>(null);
  const packRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const area = areaRef.current;
    const pack = packRef.current;
    if (!area || !pack) return;

    const measure = () => {
      const aw = area.clientWidth;
      const ah = area.clientHeight;
      // offsetWidth/offsetHeight are layout values and ignore the transform, so
      // this cannot feed back into itself.
      const pw = pack.offsetWidth;
      const ph = pack.offsetHeight;
      if (aw > 0 && ah > 0 && pw > 0 && ph > 0) {
        setScale(Math.min(1, aw / pw, ah / ph));
      }
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(pack);
    ro.observe(area);
    return () => ro.disconnect();
  }, [data]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: -20000,
        width: SHARE_W,
        height: SHARE_H,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <div
        ref={attach}
        style={{
          position: "relative",
          width: SHARE_W,
          height: SHARE_H,
          background: "var(--lv-base, #FFFFFF)",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          padding: PAD,
          fontFamily: SANS,
        }}
      >
        {photoData ? (
          <div style={{ flex: "0 0 auto", display: "flex", justifyContent: "center", marginBottom: 16 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoData}
              alt=""
              width={PHOTO}
              height={PHOTO}
              style={{
                width: PHOTO,
                height: PHOTO,
                objectFit: "cover",
                border: "1px solid #111111",
                display: "block",
              }}
            />
          </div>
        ) : null}

        {/* The package, alone, as big as it goes. */}
        <div ref={areaRef} style={{ flex: "1 1 auto", minHeight: 0, position: "relative" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              overflow: "hidden",
            }}
          >
            <div
              ref={packRef}
              style={{
                flex: "0 0 auto",
                width: "max-content",
                transform: `scale(${scale})`,
                transformOrigin: "top center",
              }}
            >
              <PackageFrame data={data} capture>
                <NutritionLabel data={data} openRows={openRows} onToggleRow={noop} capture />
              </PackageFrame>
            </div>
          </div>
        </div>

        {/* Watermark. Outside the package, small, bottom-right. */}
        <div
          style={{
            flex: "0 0 auto",
            marginTop: 14,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "baseline",
          }}
        >
          <span
            style={{
              fontFamily: SANS,
              fontSize: 9,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--lv-faint, " + MUTED + ")",
              whiteSpace: "nowrap",
            }}
          >
            SubhSandesh
          </span>
        </div>
      </div>
    </div>
  );
}
