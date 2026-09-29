"use client";

// ─── PhotoGrid — upload → frame (drag / pinch / zoom) → replace → remove ─────
//
// The gallery's photos as a grid of square tiles, each drawn with the same
// crop the listing uses. Tap a tile to frame it in the shared PhotoAdjuster;
// the tile's little bar has Cover (make it the hero), Replace and Remove.
// Sample photos from the demo carry a "sample" tag and are swept away the
// moment the sender adds a real one.

import { useRef, useState } from "react";
import PhotoAdjuster from "../../dedication/components/PhotoAdjuster";
import { compressImage } from "../../dedication/components/mediaUploads";
import { C, FONT, cropCss } from "./tokens";
import { CROP_CENTER, DEMO_DATA, MAX_PHOTOS, type PhotoCrop } from "./types";

export const isSamplePhoto = (url: string): boolean => DEMO_DATA.subject.photos.includes(url);

export default function PhotoGrid({
  photos,
  crops,
  onChange,
}: {
  photos: string[];
  crops: PhotoCrop[];
  onChange: (photos: string[], crops: PhotoCrop[]) => void;
}) {
  const addRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const replaceAt = useRef<number | null>(null);
  const [adjusting, setAdjusting] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const allSamples = photos.length > 0 && photos.every(isSamplePhoto);
  const cropOf = (i: number) => crops[i] ?? CROP_CENTER;
  const aligned = () => photos.map((_, i) => cropOf(i));

  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    setError("");
    setBusy(true);
    // Real photos replace the samples wholesale.
    const basePhotos = allSamples ? [] : photos;
    const baseCrops = allSamples ? [] : aligned();
    const room = MAX_PHOTOS - basePhotos.length;
    const added: string[] = [];
    for (const f of Array.from(files).slice(0, room)) {
      try {
        added.push(await compressImage(f));
      } catch (e) {
        setError(e instanceof Error ? e.message : "That photo couldn't be read");
      }
    }
    setBusy(false);
    if (files.length > room) setError(`Only ${MAX_PHOTOS} photos fit — the rest were skipped.`);
    if (!added.length) return;
    const next = [...basePhotos, ...added];
    onChange(next, [...baseCrops, ...added.map(() => ({ ...CROP_CENTER }))]);
    if (added.length === 1) setAdjusting(next.length - 1);
  };

  const replace = async (files: FileList | null) => {
    const i = replaceAt.current;
    if (i === null || !files?.[0]) return;
    try {
      const url = await compressImage(files[0]);
      onChange(
        photos.map((p, k) => (k === i ? url : p)),
        aligned().map((c, k) => (k === i ? { ...CROP_CENTER } : c))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "That photo couldn't be read");
    }
  };

  const remove = (i: number) => {
    onChange(
      photos.filter((_, k) => k !== i),
      aligned().filter((_, k) => k !== i)
    );
    setAdjusting(null);
  };

  const makeCover = (i: number) => {
    if (i === 0) return;
    const p = [...photos];
    const c = aligned();
    const [pp] = p.splice(i, 1);
    const [cc] = c.splice(i, 1);
    onChange([pp as string, ...p], [cc as PhotoCrop, ...c]);
  };

  const openReplace = (i: number) => {
    replaceAt.current = i;
    replaceRef.current?.click();
  };

  return (
    <div style={{ fontFamily: FONT }}>
      {allSamples && (
        <p className="pg-note">
          These are <strong>sample photos</strong>. Add hers — they&apos;ll replace the samples. The first one is the main listing photo.
        </p>
      )}
      <div className="pg-grid">
        {photos.map((url, i) => (
          <div key={`${i}-${url.slice(-16)}`} className={`pg-tile${i === 0 ? " pg-cover" : ""}`}>
            <button type="button" className="pg-img" onClick={() => setAdjusting(i)} aria-label={`Frame photo ${i + 1}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" draggable={false} style={cropCss(cropOf(i))} />
              {isSamplePhoto(url) ? <span className="pg-sample">sample</span> : null}
              {i === 0 ? <span className="pg-badge">Main photo</span> : null}
              <span className="pg-frame">✥ frame</span>
            </button>
            <div className="pg-bar">
              {i !== 0 && (
                <button type="button" onClick={() => makeCover(i)} aria-label={`Make photo ${i + 1} the main photo`}>
                  ★
                </button>
              )}
              <button type="button" onClick={() => openReplace(i)} aria-label={`Replace photo ${i + 1}`}>
                ↻
              </button>
              <button type="button" onClick={() => remove(i)} aria-label={`Remove photo ${i + 1}`}>
                ✕
              </button>
            </div>
          </div>
        ))}
        {(allSamples || photos.length < MAX_PHOTOS) && (
          <button type="button" className="pg-add" onClick={() => addRef.current?.click()} disabled={busy}>
            <span style={{ fontSize: 26, lineHeight: 1 }}>{busy ? "…" : "+"}</span>
            <span>{busy ? "adding" : allSamples ? "Add her photos" : `Add (${photos.length}/${MAX_PHOTOS})`}</span>
          </button>
        )}
      </div>
      {error ? <p style={{ margin: "8px 0 0", fontSize: 12.5, color: C.priceRed }}>{error}</p> : null}

      <input ref={addRef} type="file" accept="image/*" multiple hidden onChange={(e) => { void add(e.target.files); e.target.value = ""; }} />
      <input ref={replaceRef} type="file" accept="image/*" hidden onChange={(e) => { void replace(e.target.files); e.target.value = ""; }} />

      <PhotoAdjuster
        open={adjusting !== null && !!photos[adjusting]}
        src={adjusting !== null ? photos[adjusting] ?? "" : ""}
        crop={adjusting !== null ? cropOf(adjusting) : CROP_CENTER}
        title={`Frame photo ${adjusting !== null ? adjusting + 1 : ""}`}
        onChange={(c) => {
          if (adjusting === null) return;
          onChange(photos, aligned().map((old, k) => (k === adjusting ? { x: c.x, y: c.y, scale: c.scale } : old)));
        }}
        onClose={() => setAdjusting(null)}
        onReplace={() => adjusting !== null && openReplace(adjusting)}
      />

      <style>{`
        .pg-note { margin: 0 0 10px; padding: 9px 12px; border-radius: 10px; background: #FFF6E5; border: 1px solid #F5DDA8; font-size: 13px; line-height: 1.45; color: #5A4300; }
        .pg-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 10px; }
        .pg-tile { position: relative; border-radius: 12px; overflow: hidden; border: 1px solid ${C.border}; background: #F3F3F3; }
        .pg-cover { border: 2px solid ${C.activeEdge}; }
        .pg-img { position: relative; display: block; width: 100%; aspect-ratio: 1 / 1; padding: 0; border: 0; overflow: hidden; cursor: pointer; background: #eee; }
        .pg-sample { position: absolute; top: 6px; left: 6px; padding: 2px 7px; border-radius: 100px; background: rgba(0,0,0,.6); color: #fff; font-size: 10px; font-weight: 700; letter-spacing: .04em; }
        .pg-badge { position: absolute; top: 6px; right: 6px; padding: 2px 7px; border-radius: 100px; background: ${C.activeEdge}; color: #fff; font-size: 10px; font-weight: 700; }
        .pg-frame { position: absolute; left: 0; right: 0; bottom: 0; padding: 4px 0; background: rgba(0,0,0,.5); color: #fff; font-size: 11px; font-weight: 700; text-align: center; }
        .pg-bar { display: flex; border-top: 1px solid ${C.border}; background: #fff; }
        .pg-bar button { flex: 1; height: 34px; border: 0; background: #fff; cursor: pointer; font-size: 14px; color: ${C.text}; }
        .pg-bar button + button { border-left: 1px solid ${C.hairline}; }
        .pg-bar button:hover { background: #F7FAFA; }
        .pg-add {
          aspect-ratio: 1 / 1.3; border-radius: 12px; border: 2px dashed ${C.love}; background: #FFF5F8; color: ${C.love};
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; font: 700 13px ${FONT}; cursor: pointer;
        }
        .pg-add:disabled { opacity: .6; }
      `}</style>
    </div>
  );
}
