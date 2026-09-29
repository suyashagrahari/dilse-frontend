"use client";

// ─── Photos (editor) ─────────────────────────────────────────────────────────
//
// Upload → frame (drag / pinch / zoom, the Dedication adjuster) → replace →
// remove → reorder. Photo 1 is their profile picture; every photo becomes an
// offer banner and a polaroid on the success screen. Photos are compressed on
// the device and uploaded when the page is saved.

import { useRef, useState } from "react";
import PhotoAdjuster from "../../dedication/components/PhotoAdjuster";
import { compressImage } from "../../dedication/components/mediaUploads";
import { CROP_DEFAULT, type Crop, photoCrop } from "../../dedication/components/types";
import type { LovePhoto } from "../../_love/types";
import { MAX_PHOTOS } from "./types";
import { Photo, PINK, PINK_DEEP, MUTED } from "./ui";

const FRESH = { cropX: CROP_DEFAULT.x, cropY: CROP_DEFAULT.y, scale: CROP_DEFAULT.scale };

export default function PhotoField({ photos, onChange }: { photos: LovePhoto[]; onChange: (next: LovePhoto[]) => void }) {
  const addRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const replaceAt = useRef<number | null>(null);
  const [adjusting, setAdjusting] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const patch = (i: number, p: Partial<LovePhoto>) => onChange(photos.map((ph, idx) => (idx === i ? { ...ph, ...p } : ph)));

  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    setError("");
    setBusy(true);
    const room = MAX_PHOTOS - photos.length;
    const added: LovePhoto[] = [];
    for (const f of Array.from(files).slice(0, room)) {
      try {
        added.push({ url: await compressImage(f), ...FRESH });
      } catch (e) {
        setError(e instanceof Error ? e.message : "That photo couldn't be read");
      }
    }
    setBusy(false);
    if (files.length > room) setError(`Only ${MAX_PHOTOS} photos fit — the rest were skipped.`);
    if (!added.length) return;
    const next = [...photos, ...added];
    onChange(next);
    if (added.length === 1) setAdjusting(next.length - 1);
  };

  const replace = async (files: FileList | null) => {
    const i = replaceAt.current;
    if (i === null || !files?.[0]) return;
    try {
      patch(i, { url: await compressImage(files[0]), ...FRESH });
    } catch (e) {
      setError(e instanceof Error ? e.message : "That photo couldn't be read");
    }
  };

  const openReplace = (i: number) => {
    replaceAt.current = i;
    replaceRef.current?.click();
  };

  const makeFirst = (i: number) => {
    if (i === 0) return;
    const next = [...photos];
    const [p] = next.splice(i, 1);
    next.unshift(p);
    onChange(next);
  };

  const adj = adjusting !== null ? photos[adjusting] : null;

  return (
    <div>
      <div className="rce-photos">
        {photos.map((p, i) => (
          <div key={`${i}-${p.url.slice(-16)}`} className="rce-photo">
            <button type="button" className="rce-thumb" onClick={() => setAdjusting(i)} aria-label={`Crop and zoom photo ${i + 1}`}>
              <Photo photo={p} />
              {i === 0 ? <span className="rce-dp">profile pic</span> : null}
              <span className="rce-adj">✥ crop / zoom</span>
            </button>
            <div className="rce-photo-actions">
              <button type="button" onClick={() => openReplace(i)}>Replace</button>
              {i > 0 ? (
                <button type="button" onClick={() => makeFirst(i)} title="Use as profile pic">
                  Make DP
                </button>
              ) : null}
              <button type="button" onClick={() => onChange(photos.filter((_, idx) => idx !== i))} aria-label={`Remove photo ${i + 1}`} style={{ color: "#C0392B" }}>
                Remove
              </button>
            </div>
          </div>
        ))}
        {photos.length < MAX_PHOTOS ? (
          <button type="button" className="rce-add" onClick={() => addRef.current?.click()} disabled={busy}>
            <span style={{ fontSize: 26, lineHeight: 1 }}>{busy ? "⏳" : "＋"}</span>
            <span>{busy ? "adding…" : photos.length ? "Add more" : "Add photos"}</span>
            <small>
              {photos.length}/{MAX_PHOTOS}
            </small>
          </button>
        ) : null}
      </div>
      {error ? <p style={{ color: PINK_DEEP, fontSize: 12.5, margin: "8px 0 0" }}>{error}</p> : null}

      <input ref={addRef} type="file" accept="image/*" multiple hidden onChange={(e) => { void add(e.target.files); e.target.value = ""; }} />
      <input ref={replaceRef} type="file" accept="image/*" hidden onChange={(e) => { void replace(e.target.files); e.target.value = ""; }} />

      <PhotoAdjuster
        open={adj !== null}
        src={adj?.url ?? ""}
        crop={adj ? photoCrop(adj) : CROP_DEFAULT}
        title={adjusting === 0 ? "Frame their profile pic" : `Frame photo ${adjusting !== null ? adjusting + 1 : ""}`}
        onChange={(c: Crop) => adjusting !== null && patch(adjusting, { cropX: c.x, cropY: c.y, scale: c.scale })}
        onClose={() => setAdjusting(null)}
        onReplace={() => adjusting !== null && openReplace(adjusting)}
      />

      <style>{`
        .rce-photos { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
        @media (min-width: 520px) { .rce-photos { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
        .rce-photo { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
        .rce-thumb { position: relative; aspect-ratio: 1; border-radius: 14px; overflow: hidden; border: 0; padding: 0; background: #eee; cursor: pointer; }
        .rce-thumb img { position: absolute; inset: 0; }
        .rce-dp { position: absolute; top: 6px; left: 6px; font-size: 9.5px; font-weight: 800; padding: 3px 6px; border-radius: 6px; background: ${PINK}; color: #fff; letter-spacing: .03em; }
        .rce-adj { position: absolute; left: 0; right: 0; bottom: 0; padding: 5px 0; font-size: 10.5px; font-weight: 700; color: #fff; background: rgba(0,0,0,.5); }
        .rce-photo-actions { display: flex; flex-wrap: wrap; gap: 4px 8px; justify-content: center; }
        .rce-photo-actions button { border: 0; background: none; padding: 2px; font-size: 11.5px; font-weight: 700; color: ${MUTED}; cursor: pointer; }
        .rce-add { aspect-ratio: 1; border-radius: 14px; border: 2px dashed #F3A9C7; background: #FFF6FA; color: ${PINK_DEEP}; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; font-weight: 700; font-size: 12.5px; cursor: pointer; }
        .rce-add small { font-weight: 600; color: ${MUTED}; font-size: 10.5px; }
        .rce-add:disabled { opacity: .6; }
      `}</style>
    </div>
  );
}
