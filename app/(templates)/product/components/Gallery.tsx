"use client";

// ─── Gallery — thumb rail + hover zoom on desktop, snap carousel on phones ───
//
//   POINTER, ≥1024  → the vertical 40px thumb rail on the left (hover changes
//                     the photo, exactly like the real one), a square hero with
//                     a lens, and the 2.5× zoom panel that opens over the
//                     details column. Click opens the immersive viewer.
//   TOUCH / NARROW  → a full-bleed square snap carousel with the round heart +
//                     share buttons in the top-right corner and dots under it.
//                     Tap opens the full-screen viewer.
//
// Every photo is drawn with the sender's crop (focal point + zoom), and a photo
// that has not loaded yet sits on a shimmer, never a white hole.

import { useCallback, useEffect, useRef, useState } from "react";
import { C, FONT, cropCss, useCanHover, useMinWidth } from "./tokens";
import { CROP_CENTER, type PhotoCrop } from "./types";
import { IconHeart, IconShare } from "./icons";

const ZOOM = 2.5;

/** One framed photo filling its parent. Shimmers until it loads. */
export function Framed({
  src,
  crop,
  alt,
  eager,
}: {
  src: string;
  crop?: PhotoCrop;
  alt: string;
  eager?: boolean;
}) {
  // No "loaded" state on purpose: an image that finished before hydration
  // never fires onLoad in React, and would stay invisible forever. The shimmer
  // sits BEHIND the photo instead, and the photo simply paints over it.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = !src || failedSrc === src;

  return (
    <span className={`lk-framed${failed ? "" : " lk-shimmer"}`}>
      {failed ? (
        <span className="lk-framed-dead" role="img" aria-label={alt || "Photo unavailable"}>
          ♡
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          draggable={false}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onError={() => setFailedSrc(src)}
          style={{ ...cropCss(crop ?? CROP_CENTER), position: "relative", zIndex: 1 }}
        />
      )}
    </span>
  );
}

export default function Gallery({
  photos,
  crops,
  subjectName,
  active,
  onActive,
  wished,
  onWish,
  onShare,
  onOpenViewer,
}: {
  photos: string[];
  crops: PhotoCrop[];
  subjectName: string;
  active: number;
  onActive: (i: number) => void;
  wished: boolean;
  onWish: () => void;
  onShare: () => void;
  onOpenViewer: (i: number) => void;
}) {
  const list = photos.length > 0 ? photos : [""];
  const index = Math.min(Math.max(0, active), list.length - 1);
  const [lens, setLens] = useState<{ x: number; y: number } | null>(null);

  const canHover = useCanHover();
  const wide = useMinWidth(1024);
  const desktop = canHover && wide;

  const railRef = useRef<HTMLDivElement | null>(null);
  const fromScroll = useRef(false);

  // Follow `active` when it is changed from outside (a variant chip).
  useEffect(() => {
    if (desktop) return;
    const el = railRef.current;
    if (!el) return;
    if (fromScroll.current) {
      fromScroll.current = false;
      return;
    }
    const target = index * el.clientWidth;
    if (Math.abs(el.scrollLeft - target) > 4) el.scrollTo({ left: target, behavior: "smooth" });
  }, [index, desktop]);

  const onCarouselScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      const next = Math.round(el.scrollLeft / (el.clientWidth || 1));
      if (next !== index) {
        fromScroll.current = true;
        onActive(Math.max(0, Math.min(next, list.length - 1)));
      }
    },
    [index, list.length, onActive]
  );

  const cropOf = (i: number) => crops[i] ?? CROP_CENTER;

  if (!desktop) {
    return (
      <section aria-label={`Photos of ${subjectName}`} className="lk-gal-m">
        <div style={{ position: "relative" }}>
          <div ref={railRef} className="lk-carousel" onScroll={onCarouselScroll}>
            {list.map((url, i) => (
              <button
                type="button"
                key={`${url}-${i}`}
                className="lk-carousel-cell"
                onClick={() => onOpenViewer(i)}
                aria-label={`Open photo ${i + 1} full screen`}
              >
                <Framed src={url} crop={cropOf(i)} alt={`${subjectName}, photo ${i + 1}`} eager={i === 0} />
              </button>
            ))}
          </div>
          <div className="lk-gal-actions">
            <button type="button" className={`lk-round${wished ? " lk-round-on" : ""}`} onClick={onWish} aria-label="Add to wish list" aria-pressed={wished}>
              <IconHeart size={21} color={wished ? C.love : "#0F1111"} fill={wished ? C.love : "none"} />
            </button>
            <button type="button" className="lk-round" onClick={onShare} aria-label="Share">
              <IconShare size={20} color="#0F1111" />
            </button>
          </div>
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
                onClick={() => onActive(i)}
                className={`lk-dot${i === index ? " lk-dot-on" : ""}`}
              />
            ))}
          </div>
        )}
      </section>
    );
  }

  // ── Desktop ────────────────────────────────────────────────────────────────
  const src = list[index] ?? "";
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!src) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    setLens({ x, y });
  };

  return (
    <section aria-label={`Photos of ${subjectName}`} style={{ fontFamily: FONT, position: "relative" }} className="lk-gal-d">
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div role="tablist" aria-label="Choose a photo" className="lk-rail">
          {list.map((url, i) => (
            <button
              key={`${url}-thumb-${i}`}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Photo ${i + 1}`}
              onMouseEnter={() => onActive(i)}
              onFocus={() => onActive(i)}
              onClick={() => onActive(i)}
              className={`lk-thumb${i === index ? " lk-thumb-on" : ""}`}
            >
              <Framed src={url} crop={cropOf(i)} alt="" />
            </button>
          ))}
        </div>

        <div style={{ flex: "1 1 auto", minWidth: 0 }}>
          <div
            onMouseMove={onMove}
            onMouseLeave={() => setLens(null)}
            onClick={() => onOpenViewer(index)}
            className="lk-hero"
            style={{ cursor: src ? "crosshair" : "default" }}
          >
            <div key={src} className="lk-hero-in">
              <Framed src={src} crop={cropOf(index)} alt={subjectName} eager />
            </div>
            {lens && src && (
              <span
                aria-hidden="true"
                className="lk-lens"
                style={{
                  width: `${100 / ZOOM}%`,
                  height: `${100 / ZOOM}%`,
                  left: `${lens.x * (100 - 100 / ZOOM)}%`,
                  top: `${lens.y * (100 - 100 / ZOOM)}%`,
                }}
              />
            )}
            <div className="lk-gal-actions lk-gal-actions-d">
              <button
                type="button"
                className={`lk-round${wished ? " lk-round-on" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onWish();
                }}
                aria-label="Add to wish list"
                aria-pressed={wished}
              >
                <IconHeart size={20} color={wished ? C.love : "#0F1111"} fill={wished ? C.love : "none"} />
              </button>
              <button
                type="button"
                className="lk-round"
                onClick={(e) => {
                  e.stopPropagation();
                  onShare();
                }}
                aria-label="Share"
              >
                <IconShare size={19} color="#0F1111" />
              </button>
            </div>
          </div>
          <p style={{ margin: "10px 0 0", fontSize: 14, color: C.secondary, textAlign: "center" }}>
            Roll over image to zoom in · click to see her full view
          </p>
        </div>
      </div>

      {lens && src && (
        <div aria-hidden="true" className="lk-zoom">
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: `scale(${ZOOM})`,
              transformOrigin: `${lens.x * 100}% ${lens.y * 100}%`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" style={cropCss(cropOf(index))} />
          </div>
        </div>
      )}
    </section>
  );
}

/** Full-screen photo viewer — the "immersive view". Swipe or arrow through. */
export function PhotoViewer({
  photos,
  crops,
  start,
  subjectName,
  onClose,
}: {
  photos: string[];
  crops: PhotoCrop[];
  start: number;
  subjectName: string;
  onClose: () => void;
}) {
  const [i, setI] = useState(start);
  const n = photos.length;
  const go = useCallback((d: number) => setI((v) => (v + d + n) % n), [n]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [go, onClose]);

  const touch = useRef<number | null>(null);

  return (
    <div className="lk-viewer" role="dialog" aria-modal="true" aria-label={`Photos of ${subjectName}`}>
      <div className="lk-viewer-top">
        <span style={{ fontWeight: 700 }}>
          {i + 1} / {n}
        </span>
        <button type="button" onClick={onClose} className="lk-viewer-x" aria-label="Close">
          ✕
        </button>
      </div>
      <div
        className="lk-viewer-stage"
        onTouchStart={(e) => (touch.current = e.touches[0]?.clientX ?? null)}
        onTouchEnd={(e) => {
          const s = touch.current;
          const end = e.changedTouches[0]?.clientX;
          touch.current = null;
          if (s === null || end === undefined) return;
          if (end - s > 40) go(-1);
          else if (s - end > 40) go(1);
        }}
      >
        <div key={i} className="lk-viewer-photo">
          <Framed src={photos[i] ?? ""} crop={crops[i]} alt={`${subjectName}, photo ${i + 1}`} eager />
        </div>
        {n > 1 && (
          <>
            <button type="button" className="lk-viewer-nav" style={{ left: 8 }} onClick={() => go(-1)} aria-label="Previous photo">
              ‹
            </button>
            <button type="button" className="lk-viewer-nav" style={{ right: 8 }} onClick={() => go(1)} aria-label="Next photo">
              ›
            </button>
          </>
        )}
      </div>
      <div className="lk-viewer-strip">
        {photos.map((p, k) => (
          <button key={`${p}-${k}`} type="button" onClick={() => setI(k)} className={`lk-viewer-thumb${k === i ? " on" : ""}`} aria-label={`Photo ${k + 1}`}>
            <Framed src={p} crop={crops[k]} alt="" />
          </button>
        ))}
      </div>
    </div>
  );
}

export function GalleryStyles() {
  return (
    <style>{`
      .lk-framed { position: relative; display: block; width: 100%; height: 100%; overflow: hidden; background: #F3F3F3; }
      .lk-framed-dead { display: grid; place-items: center; width: 100%; height: 100%; color: #c9c9c9; font-size: 34px; }
      .lk-shimmer::before {
        content: ""; position: absolute; inset: 0; z-index: 0;
        background: linear-gradient(100deg, transparent 20%, rgba(255,255,255,.75) 50%, transparent 80%);
        background-size: 200% 100%; animation: lk-shim 1.1s linear 4;
      }
      @keyframes lk-shim { from { background-position: 150% 0; } to { background-position: -50% 0; } }

      .lk-gal-m { margin: 0 -14px; }
      .lk-carousel {
        display: flex; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none;
        -webkit-overflow-scrolling: touch; background: #fff;
      }
      .lk-carousel::-webkit-scrollbar { display: none; }
      .lk-carousel-cell { flex: 0 0 100%; aspect-ratio: 1 / 1; scroll-snap-align: center; min-width: 0; padding: 0; border: 0; background: #fff; cursor: zoom-in; }
      .lk-gal-actions { position: absolute; top: 12px; right: 12px; display: flex; flex-direction: column; gap: 10px; z-index: 2; }
      .lk-gal-actions-d { top: 10px; right: 10px; flex-direction: row; opacity: 0; transition: opacity .2s ease; }
      .lk-hero:hover .lk-gal-actions-d { opacity: 1; }
      .lk-round {
        width: 42px; height: 42px; border-radius: 50%; border: 0; background: rgba(255,255,255,.94); display: grid; place-items: center;
        box-shadow: 0 1px 4px rgba(0,0,0,.18); cursor: pointer; transition: transform .18s cubic-bezier(.2,1.6,.4,1);
        -webkit-tap-highlight-color: transparent;
      }
      .lk-round:active { transform: scale(.88); }
      .lk-round-on { animation: lk-heart-pop .5s cubic-bezier(.2,1.6,.4,1); }
      @keyframes lk-heart-pop { 0% { transform: scale(.8); } 45% { transform: scale(1.22); } 100% { transform: scale(1); } }

      .lk-dots { display: flex; justify-content: center; gap: 0; padding: 8px 0 2px; }
      .lk-dot { width: 20px; height: 20px; padding: 0; cursor: pointer; border: none; background: transparent; position: relative; -webkit-tap-highlight-color: transparent; }
      .lk-dot::after { content: ""; position: absolute; inset: 6px; border-radius: 50%; background: #fff; border: 1px solid #888; transition: transform .2s ease; }
      .lk-dot-on::after { background: #0F1111; border-color: #0F1111; transform: scale(1.1); }

      .lk-rail { display: flex; flex-direction: column; gap: 10px; flex: none; width: 42px; }
      .lk-thumb {
        width: 42px; height: 50px; padding: 0; border-radius: 6px; overflow: hidden; cursor: pointer; background: #fff;
        border: 1px solid #888C8C; transition: box-shadow .15s ease;
      }
      .lk-thumb:hover { box-shadow: 0 0 3px 2px rgba(228,121,17,.5); }
      .lk-thumb-on { border-color: ${C.activeEdge}; box-shadow: 0 0 3px 2px rgba(228,121,17,.5); }
      .lk-hero { position: relative; width: 100%; aspect-ratio: 1 / 1; overflow: hidden; border-radius: 2px; }
      .lk-hero-in { position: absolute; inset: 0; animation: lk-fade .28s ease; }
      @keyframes lk-fade { from { opacity: .35; } }
      .lk-lens { position: absolute; background: rgba(255,255,255,.35); border: 1px solid rgba(0,0,0,.25); pointer-events: none; box-shadow: 0 0 0 9999px rgba(0,0,0,.08); }
      .lk-zoom {
        position: absolute; left: calc(100% + 16px); top: 0; width: min(115%, 640px); aspect-ratio: 1 / 1; z-index: 55; overflow: hidden;
        border: 1px solid ${C.border}; background: #fff; box-shadow: 0 4px 22px rgba(15,17,17,.2);
      }

      .lk-viewer { position: fixed; inset: 0; z-index: 400; background: #fff; display: flex; flex-direction: column; font-family: ${FONT}; color: ${C.text}; animation: lk-fade .2s ease; }
      .lk-viewer-top { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid ${C.hairline}; font-size: 14px; }
      .lk-viewer-x { width: 38px; height: 38px; border-radius: 50%; border: 0; background: #F0F2F2; cursor: pointer; font-size: 16px; }
      .lk-viewer-stage { position: relative; flex: 1 1 auto; min-height: 0; display: grid; place-items: center; padding: 12px; }
      .lk-viewer-photo { width: min(100%, calc(100dvh - 190px)); aspect-ratio: 1 / 1; animation: lk-fade .25s ease; }
      .lk-viewer-nav { position: absolute; top: 50%; transform: translateY(-50%); width: 44px; height: 44px; border-radius: 50%; border: 1px solid ${C.border}; background: #fff; font-size: 26px; line-height: 1; cursor: pointer; box-shadow: 0 1px 4px rgba(0,0,0,.12); }
      .lk-viewer-strip { display: flex; gap: 8px; justify-content: center; padding: 10px 12px calc(14px + env(safe-area-inset-bottom, 0px)); overflow-x: auto; }
      .lk-viewer-thumb { flex: none; width: 54px; height: 54px; padding: 0; border-radius: 6px; overflow: hidden; border: 1px solid ${C.border}; cursor: pointer; }
      .lk-viewer-thumb.on { border: 2px solid ${C.activeEdge}; }

      @media (prefers-reduced-motion: reduce) {
        .lk-shimmer::before, .lk-hero-in, .lk-round-on, .lk-viewer, .lk-viewer-photo { animation: none; }
      }
    `}</style>
  );
}
