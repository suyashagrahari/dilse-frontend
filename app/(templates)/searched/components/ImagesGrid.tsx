"use client";

import React, { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { COPY, PALETTE, TIMING, UI } from "./types";
import { sameOrigin } from "./atoms";

/* ── Images tab ──────────────────────────────────────────────────────────────
 *
 * Masonry via CSS columns: 2 on a phone, 4 on desktop. Varied heights come from
 * the photographs themselves, which is the only honest way to do it — forcing
 * random heights on uniform crops looks staged.
 */

interface Img {
  url: string;
  caption?: string;
}

function Tile({
  img,
  index,
  reduced,
  onOpen,
}: {
  img: Img;
  index: number;
  reduced: boolean;
  onOpen: () => void;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <button
      type="button"
      onClick={onOpen}
      style={{
        display: "block",
        width: "100%",
        marginBottom: 10,
        padding: 0,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        breakInside: "avoid",
        animation: reduced ? "none" : `srch-fade 240ms ease-out ${Math.min(index, 10) * 40}ms both`,
      }}
    >
      <img
        src={sameOrigin(img.url, 500)}
        alt={img.caption ?? ""}
        loading="lazy"
        onError={() => setFailed(true)}
        style={{ width: "100%", height: "auto", display: "block", borderRadius: 6 }}
      />
      {img.caption && (
        <span
          style={{
            display: "block",
            fontFamily: UI,
            fontSize: 12,
            color: PALETTE.grey,
            textAlign: "left",
            marginTop: 4,
            lineHeight: 1.4,
          }}
        >
          {img.caption}
        </span>
      )}
    </button>
  );
}

export default function ImagesGrid({ images, reduced }: { images: Img[]; reduced: boolean }) {
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);

  useEffect(() => {
    if (open === null) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (images.length === 0) {
    return (
      <p style={{ fontFamily: UI, fontSize: 14, color: PALETTE.grey, padding: "26px 0" }}>
        {COPY.noImages}
      </p>
    );
  }

  const active = open !== null ? images[open] : null;

  return (
    <>
      <div className="srch-masonry" style={{ paddingTop: 18 }}>
        {images.map((img, i) => (
          <Tile key={`${img.url}-${i}`} img={img} index={i} reduced={reduced} onOpen={() => setOpen(i)} />
        ))}
      </div>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.caption || "Image"}
          onClick={close}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 300,
            background: "rgba(20,20,20,.92)",
            display: "grid",
            placeItems: "center",
            padding: 20,
            animation: reduced ? "none" : `srch-fade ${TIMING.pageSlideMs / 2}ms ease-out both`,
          }}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              width: 44,
              height: 44,
              display: "grid",
              placeItems: "center",
              border: "none",
              background: "transparent",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            <X size={22} strokeWidth={1.8} />
          </button>
          <figure style={{ margin: 0, maxWidth: 780, width: "100%", textAlign: "center" }}>
            <img
              src={sameOrigin(active.url, 900)}
              alt={active.caption ?? ""}
              style={{ maxWidth: "100%", maxHeight: "72vh", display: "block", margin: "0 auto", borderRadius: 4 }}
            />
            {active.caption && (
              <figcaption
                style={{ fontFamily: UI, fontSize: 13.5, color: "#e8eaed", marginTop: 14, lineHeight: 1.5 }}
              >
                {active.caption}
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </>
  );
}
