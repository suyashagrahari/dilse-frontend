"use client";

// ─── Photos for a Valentine's-week page (editor) ─────────────────────────────
//
// One card per photo: the thumbnail framed EXACTLY as the day shows it (the
// day's aspect + the stored crop) with a big "Adjust" pill that opens the
// PhotoCropper, a caption, an optional little note, and reorder / replace /
// remove. Photos are compressed on the phone (progress shown) and uploaded when
// the page is published — the crop model (cropX / cropY / scale) is unchanged.

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { compressImage } from "../../dedication/components/mediaUploads";
import { MAX_CAPTION_LEN, MAX_NOTE_LEN, type LovePhoto } from "../../_love/types";
import PhotoCropper, { CROP_DEFAULT, clampCrop, cropImgStyle, type Crop } from "./PhotoCropper";

const cropOf = (p: LovePhoto): Crop => clampCrop({ x: p.cropX ?? 50, y: p.cropY ?? 50, scale: p.scale ?? 100 });
const FRESH = { cropX: CROP_DEFAULT.x, cropY: CROP_DEFAULT.y, scale: CROP_DEFAULT.scale };

export default function VwPhotos({
  photos,
  onChange,
  max,
  aspect,
  captionHint,
  noteHint,
  themeStyle,
}: {
  photos: LovePhoto[];
  onChange: (next: LovePhoto[]) => void;
  max: number;
  aspect: number;
  captionHint: string;
  noteHint: string;
  themeStyle?: CSSProperties;
}) {
  const addRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const replaceIndex = useRef<number | null>(null);
  const [adjusting, setAdjusting] = useState<number | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState("");
  const [notesOpen, setNotesOpen] = useState<Record<number, boolean>>({});
  const latest = useRef(photos);
  useLayoutEffect(() => {
    latest.current = photos;
  });

  const patch = (i: number, p: Partial<LovePhoto>) => onChange(latest.current.map((ph, idx) => (idx === i ? { ...ph, ...p } : ph)));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= photos.length) return;
    const next = [...photos];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const remove = (i: number) => onChange(photos.filter((_, idx) => idx !== i));

  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    setError("");
    const room = max - latest.current.length;
    const picked = Array.from(files).slice(0, Math.max(0, room));
    if (!picked.length) {
      setError(`This page shows up to ${max} photos.`);
      return;
    }
    setProgress({ done: 0, total: picked.length });
    const added: LovePhoto[] = [];
    for (const [k, f] of picked.entries()) {
      try {
        added.push({ url: await compressImage(f), ...FRESH });
      } catch (e) {
        setError(e instanceof Error ? e.message : "That photo couldn't be read — try a JPG or PNG.");
      }
      setProgress({ done: k + 1, total: picked.length });
    }
    setProgress(null);
    if (files.length > picked.length) setError(`Only ${max} photos fit on this page — the rest were skipped.`);
    if (!added.length) return;
    const next = [...latest.current, ...added];
    onChange(next);
    // One new photo goes straight to framing.
    if (added.length === 1) setAdjusting(next.length - 1);
  };

  const replace = async (files: FileList | null) => {
    const i = replaceIndex.current;
    if (i === null || !files?.[0]) return;
    setProgress({ done: 0, total: 1 });
    try {
      patch(i, { url: await compressImage(files[0]), ...FRESH });
    } catch (e) {
      setError(e instanceof Error ? e.message : "That photo couldn't be read");
    }
    setProgress(null);
  };
  const openReplace = (i: number) => {
    replaceIndex.current = i;
    replaceRef.current?.click();
  };

  const adj = adjusting !== null ? photos[adjusting] : null;
  const full = photos.length >= max;

  return (
    <div className="vp">
      {photos.length === 0 && !progress && (
        <button type="button" className="vp-empty" onClick={() => addRef.current?.click()}>
          <span className="vp-emptyIcon" aria-hidden>📷</span>
          <b>Add your photos together</b>
          <small>Up to {max}. You can frame each one exactly how it shows.</small>
        </button>
      )}

      <ol className="vp-grid">
        {photos.map((p, i) => {
          const noteOpen = notesOpen[i] || !!p.note;
          return (
            <li key={`${i}-${p.url.slice(-16)}`} className="vp-card">
              <div className="vp-thumbCol">
                <button type="button" className="vp-thumb" style={{ aspectRatio: String(aspect) }} onClick={() => setAdjusting(i)} aria-label={`Adjust how photo ${i + 1} is framed`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt="" draggable={false} style={cropImgStyle(cropOf(p))} />
                  <span className="vp-num" aria-hidden>{i + 1}</span>
                  <span className="vp-adjust" aria-hidden>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20" /></svg>
                    Adjust
                  </span>
                </button>
                <div className="vp-order">
                  <button type="button" className="vp-icon" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move photo ${i + 1} earlier`} title="Move earlier">↑</button>
                  <button type="button" className="vp-icon" onClick={() => move(i, 1)} disabled={i === photos.length - 1} aria-label={`Move photo ${i + 1} later`} title="Move later">↓</button>
                  <button type="button" className="vp-icon" onClick={() => openReplace(i)} aria-label={`Replace photo ${i + 1}`} title="Replace">⇄</button>
                  <button type="button" className="vp-icon is-danger" onClick={() => remove(i)} aria-label={`Remove photo ${i + 1}`} title="Remove">✕</button>
                </div>
              </div>

              <div className="vp-body">
                <div className="vp-row">
                  <label className="vp-lab" htmlFor={`vp-cap-${i}`}>Caption</label>
                  <span className="vs-count">{(p.caption ?? "").length}/{MAX_CAPTION_LEN}</span>
                </div>
                <input
                  id={`vp-cap-${i}`}
                  className="vs-input vp-in"
                  value={p.caption ?? ""}
                  maxLength={MAX_CAPTION_LEN}
                  placeholder={captionHint}
                  onChange={(e) => patch(i, { caption: e.target.value.slice(0, MAX_CAPTION_LEN) })}
                />
                {noteOpen ? (
                  <>
                    <div className="vp-row">
                      <label className="vp-lab" htmlFor={`vp-note-${i}`}>💌 Little note</label>
                      <span className="vs-count">{(p.note ?? "").length}/{MAX_NOTE_LEN}</span>
                    </div>
                    <textarea
                      id={`vp-note-${i}`}
                      className="vs-input vs-area vp-in"
                      rows={2}
                      value={p.note ?? ""}
                      maxLength={MAX_NOTE_LEN}
                      placeholder={noteHint}
                      onChange={(e) => patch(i, { note: e.target.value.slice(0, MAX_NOTE_LEN) })}
                    />
                  </>
                ) : (
                  <button type="button" className="vp-link" onClick={() => setNotesOpen((s) => ({ ...s, [i]: true }))}>＋ Add a little note <small>(opens with the photo)</small></button>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {progress && (
        <div className="vp-progress" role="status" aria-live="polite">
          <span>
            Shrinking photo {Math.min(progress.done + 1, progress.total)} of {progress.total} on your phone…
          </span>
          <span className="vp-bar"><i style={{ width: `${Math.round(((progress.done + 0.5) / progress.total) * 100)}%` }} /></span>
        </div>
      )}

      {photos.length > 0 && !full && !progress && (
        <button type="button" className="vs-add vp-addMore" onClick={() => addRef.current?.click()}>
          ＋ Add more photos <small>({photos.length}/{max})</small>
        </button>
      )}
      {full && <p className="vs-hint">That&apos;s all {max} — the most this page shows. Remove one to swap it.</p>}
      {error && <p className="vs-err" role="alert">{error}</p>}

      <input ref={addRef} type="file" accept="image/*" multiple className="vs-sr" aria-hidden tabIndex={-1} onChange={(e) => { void add(e.target.files); e.target.value = ""; }} />
      <input ref={replaceRef} type="file" accept="image/*" className="vs-sr" aria-hidden tabIndex={-1} onChange={(e) => { void replace(e.target.files); e.target.value = ""; }} />

      <PhotoCropper
        open={adj !== null}
        src={adj?.url ?? ""}
        crop={adj ? cropOf(adj) : CROP_DEFAULT}
        aspect={aspect}
        title={`Frame photo ${adjusting !== null ? adjusting + 1 : ""}`}
        themeStyle={themeStyle}
        onChange={(c) => adjusting !== null && patch(adjusting, { cropX: Math.round(c.x * 10) / 10, cropY: Math.round(c.y * 10) / 10, scale: Math.round(c.scale) })}
        onClose={() => setAdjusting(null)}
        onReplace={() => adjusting !== null && openReplace(adjusting)}
      />
    </div>
  );
}

export const PHOTOS_CSS = `
.vs-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.vp { display: grid; gap: 12px; }
.vp-empty { display: grid; justify-items: center; gap: 4px; padding: 26px 16px; border-radius: 20px; border: 2px dashed var(--vw-accent); background: color-mix(in srgb, var(--vw-soft) 55%, #fff); color: var(--vw-paper-ink); cursor: pointer; font-family: inherit; }
.vp-empty b { font-size: 15px; }
.vp-empty small { font-size: 12.5px; opacity: .7; }
.vp-emptyIcon { font-size: 30px; }
.vp-grid { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; }
@media (min-width: 1100px) { .vs-sheet.is-wide .vp-grid { grid-template-columns: 1fr 1fr; } }
.vp-card { display: flex; gap: 12px; padding: 10px; border-radius: 20px; border: 2px solid var(--vw-edge); background: #fff; min-width: 0; }
.vp-thumbCol { flex: none; display: grid; gap: 6px; align-content: start; width: 108px; }
.vp-thumb { position: relative; display: block; width: 100%; padding: 0; border: 0; border-radius: 14px; overflow: hidden; background: var(--vw-soft); cursor: pointer; box-shadow: 0 6px 14px -8px rgba(0,0,0,.4); }
.vp-thumb:focus-visible { outline: 3px solid var(--vw-accent); outline-offset: 2px; }
.vp-num { position: absolute; top: 6px; left: 6px; min-width: 22px; height: 22px; padding: 0 6px; border-radius: 99px; display: grid; place-items: center; background: rgba(255,255,255,.92); color: #2a1a22; font-size: 12px; font-weight: 800; }
.vp-adjust { position: absolute; left: 6px; right: 6px; bottom: 6px; display: flex; align-items: center; justify-content: center; gap: 5px; padding: 6px 0; border-radius: 10px; background: rgba(20,8,16,.66); color: #fff; font-size: 12px; font-weight: 700; backdrop-filter: blur(4px); }
.vp-order { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.vp-icon.is-danger { color: #b3261e; }
.vp-icon { height: 44px; border-radius: 11px; border: 2px solid var(--vw-edge); background: #fff; color: var(--vw-paper-ink); cursor: pointer; font-size: 15px; font-weight: 700; }
.vp-icon:disabled { opacity: .3; cursor: default; }
.vp-body { flex: 1; min-width: 0; display: grid; gap: 6px; align-content: start; }
.vp-row { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
.vp-lab { font-size: 12.5px; font-weight: 700; }
.vp-lab small { font-weight: 500; opacity: .6; }
.vp-in { padding: 10px 12px; }
.vp-link small { font-weight: 500; opacity: .7; }
.vp-link { justify-self: start; padding: 6px 0; min-height: 36px; border: 0; background: none; color: var(--vw-accent-deep); font: 700 13px var(--vw-font-ui); cursor: pointer; }
.vp-acts { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 2px; }
.vp-chip { min-height: 36px; padding: 0 12px; border-radius: 99px; border: 1.5px solid var(--vw-edge); background: color-mix(in srgb, var(--vw-soft) 40%, #fff); color: var(--vw-paper-ink); font: 600 12.5px var(--vw-font-ui); cursor: pointer; }
.vp-chip.is-danger { color: #b3261e; }
.vp-progress { display: grid; gap: 6px; padding: 12px 14px; border-radius: 16px; background: var(--vw-soft); font-size: 13px; font-weight: 600; }
.vp-bar { height: 6px; border-radius: 6px; background: rgba(255,255,255,.8); overflow: hidden; }
.vp-bar i { display: block; height: 100%; background: var(--vw-accent); border-radius: 6px; transition: width .3s; }
`;
