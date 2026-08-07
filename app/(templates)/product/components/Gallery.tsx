"use client";

// ─── Gallery — thumb rail, square hero, hover zoom ───────────────────────────
//
// Two completely different controls behind one component, chosen at runtime
// rather than with `display: none`, so a phone never downloads five photos
// twice:
//
//   POINTER, WIDE   → a 40px vertical thumb strip on the left, a square hero,
//                     and a 2× zoom panel that opens to the right on hover.
//   TOUCH, NARROW   → a snap carousel with dots. No zoom — there is no "roll
//                     over" on a touch screen, and a zoom panel there only eats
//                     the tap that was meant to change the photo.
//
// ── THE PHOTOS ARE NOT TRUSTED ───────────────────────────────────────────────
// A dead URL becomes a grey cell with an image glyph, never a broken-image
// icon, and the zoom panel refuses to open over one. Non-square photos are
// covered, not letterboxed — a listing hero is square and a portrait shot has
// to fill it.

import { useCallback, useRef, useState } from "react";
import { C, FONT, Photo, useCanHover, useMinWidth } from "./tokens";

const ZOOM = 2;

export default function Gallery({ photos, subjectName }: { photos: string[]; subjectName: string }) {
  const list = photos.length > 0 ? photos : [""];
  const [active, setActive] = useState(0);
  const [broken, setBroken] = useState<Record<string, true>>({});
  const [lens, setLens] = useState<{ x: number; y: number } | null>(null);

  const canHover = useCanHover();
  const wide = useMinWidth(1024);
  const desktop = canHover && wide;

  const index = Math.min(active, list.length - 1);
  const src = list[index] ?? "";
  const heroBroken = !src || broken[src] === true;

  const railRef = useRef<HTMLDivElement | null>(null);

  /** Reports a dead URL up here so the zoom panel can refuse to open over it. */
  const markBroken = useCallback((url: string) => {
    if (!url) return;
    setBroken((prev) => (prev[url] ? prev : { ...prev, [url]: true }));
  }, []);

  // ── Mobile carousel ────────────────────────────────────────────────────────
  const onCarouselScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const w = el.clientWidth || 1;
    const next = Math.round(el.scrollLeft / w);
    setActive((prev) => (prev === next ? prev : Math.max(0, Math.min(next, el.childElementCount - 1))));
  }, []);

  const scrollToDot = useCallback((i: number) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "auto" });
    setActive(i);
  }, []);

  if (!desktop) {
    return (
      <section aria-label={`Photos of ${subjectName}`} style={{ fontFamily: FONT }}>
        <div ref={railRef} className="lk-carousel" onScroll={onCarouselScroll}>
          {list.map((url, i) => (
            <div key={`${url}-${i}`} className="lk-carousel-cell">
              <PhotoCell url={url} alt={`${subjectName}, photo ${i + 1}`} onBroken={markBroken} />
            </div>
          ))}
        </div>

        {list.length > 1 && (
          <div className="lk-dots" role="tablist" aria-label="Choose a photo">
            {list.map((url, i) => (
              <button
                key={`${url}-dot-${i}`}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Photo ${i + 1} of ${list.length}`}
                onClick={() => scrollToDot(i)}
                className={`lk-dot${i === index ? " lk-dot-on" : ""}`}
              />
            ))}
          </div>
        )}
      </section>
    );
  }

  // ── Desktop ────────────────────────────────────────────────────────────────
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (heroBroken) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    setLens({ x, y });
  };

  return (
    <section aria-label={`Photos of ${subjectName}`} style={{ fontFamily: FONT, position: "relative" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        {/* Thumb rail — 40px, vertical, orange edge + tint on the active one. */}
        <div
          role="tablist"
          aria-label="Choose a photo"
          style={{ display: "flex", flexDirection: "column", gap: 8, flex: "none", width: 40 }}
        >
          {list.map((url, i) => (
            <button
              key={`${url}-thumb-${i}`}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Photo ${i + 1}`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              style={{
                width: 40,
                height: 40,
                padding: 1,
                borderRadius: 4,
                cursor: "pointer",
                overflow: "hidden",
                background: i === index ? C.activeTint : "#fff",
                border: `1px solid ${i === index ? C.activeEdge : C.border}`,
                boxShadow: i === index ? `0 0 0 1px ${C.activeEdge}` : "none",
              }}
            >
              <PhotoCell url={url} alt="" radius={3} onBroken={markBroken} />
            </button>
          ))}
        </div>

        {/* Hero — square, covered, with the zoom lens over it. */}
        <div style={{ flex: "1 1 auto", minWidth: 0 }}>
          <div
            onMouseMove={onMove}
            onMouseLeave={() => setLens(null)}
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "1 / 1",
              overflow: "hidden",
              cursor: heroBroken ? "default" : "crosshair",
            }}
          >
            <PhotoCell url={src} alt={subjectName} onBroken={markBroken} />
            {lens && !heroBroken && (
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  width: `${100 / ZOOM}%`,
                  height: `${100 / ZOOM}%`,
                  left: `${lens.x * (100 - 100 / ZOOM)}%`,
                  top: `${lens.y * (100 - 100 / ZOOM)}%`,
                  background: "rgba(255,255,255,0.28)",
                  border: `1px solid ${C.border}`,
                  pointerEvents: "none",
                }}
              />
            )}
          </div>

          <p style={{ margin: "8px 0 0", fontSize: 12, color: C.secondary, textAlign: "center" }}>
            Roll over image to zoom in
          </p>
        </div>
      </div>

      {/* The 2× panel. Sits over the details column, which is what a real one does. */}
      {lens && !heroBroken && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "calc(100% + 14px)",
            top: 0,
            width: "112%",
            aspectRatio: "1 / 1",
            zIndex: 55,
            border: `1px solid ${C.border}`,
            background: `#fff url("${src}") no-repeat`,
            backgroundSize: `${ZOOM * 100}% ${ZOOM * 100}%`,
            backgroundPosition: `${lens.x * 100}% ${lens.y * 100}%`,
            boxShadow: "0 2px 12px rgba(15,17,17,0.18)",
          }}
        />
      )}
    </section>
  );
}

/** One square cell. Fills its parent; reports a dead URL upward. */
function PhotoCell({
  url,
  alt,
  radius = 0,
  onBroken,
}: {
  url: string;
  alt: string;
  radius?: number;
  onBroken: (url: string) => void;
}) {
  const [failed, setFailed] = useState(false);
  const dead = !url || failed;

  if (dead) {
    return (
      <span style={{ display: "block", width: "100%", height: "100%", aspectRatio: "1 / 1" }}>
        <Photo src="" alt={alt || "Photo unavailable"} radius={radius} />
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      onError={() => {
        setFailed(true);
        onBroken(url);
      }}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        aspectRatio: "1 / 1",
        objectFit: "cover",
        borderRadius: radius,
        background: C.section,
      }}
    />
  );
}

export function GalleryStyles() {
  return (
    <style>{`
      .lk-carousel {
        display: flex; overflow-x: auto; scroll-snap-type: x mandatory;
        scrollbar-width: none; -webkit-overflow-scrolling: touch;
        border: 1px solid ${C.border}; background: #fff;
      }
      .lk-carousel::-webkit-scrollbar { display: none; }
      .lk-carousel-cell { flex: 0 0 100%; scroll-snap-align: center; min-width: 0; }
      .lk-dots { display: flex; justify-content: center; gap: 2px; padding: 6px 0 2px; }
      /* 24px tap target, 8px dot. A 8px button is not a button on a thumb. */
      .lk-dot {
        width: 24px; height: 24px; padding: 0; cursor: pointer;
        border: none; background: transparent; position: relative;
        touch-action: manipulation; -webkit-tap-highlight-color: transparent;
      }
      .lk-dot::after {
        content: ""; position: absolute; inset: 8px; border-radius: 50%;
        background: #fff; border: 1px solid ${C.border};
      }
      .lk-dot-on::after { background: ${C.activeEdge}; border-color: ${C.activeEdge}; }
    `}</style>
  );
}
