"use client";

// ─── Photos & little letters (editor) ────────────────────────────────────────
//
// One card per photo: the framed thumbnail (tap to move / zoom it — the same
// adjuster Dedication uses, with pinch, drag, slider and nudges), a caption,
// and a little letter that opens when they tap the photo. Photos are
// compressed on the device and uploaded when the page is saved.

import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Move, RefreshCw, Trash2 } from "lucide-react";

import PhotoAdjuster from "../../dedication/components/PhotoAdjuster";
import { compressImage } from "../../dedication/components/mediaUploads";
import { CROP_DEFAULT, cropStyle, photoCrop, type Crop } from "../../dedication/components/types";
import { MAX_CAPTION_LEN, MAX_NOTE_LEN, MAX_PHOTOS, type LovePhoto } from "../types";

const ACCENT = "#d0245f";

export default function PhotosEditor({
  photos,
  onChange,
  captionHint = "caption — e.g. the first sunset",
  noteHint = "You said the sky looked like mango lassi…",
}: {
  photos: LovePhoto[];
  onChange: (next: LovePhoto[]) => void;
  captionHint?: string;
  noteHint?: string;
}) {
  const addRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const replaceIndex = useRef<number | null>(null);
  const [adjusting, setAdjusting] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const patch = (i: number, p: Partial<LovePhoto>) => onChange(photos.map((ph, idx) => (idx === i ? { ...ph, ...p } : ph)));
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
    setBusy(true);
    const room = MAX_PHOTOS - photos.length;
    const picked = Array.from(files).slice(0, room);
    const added: LovePhoto[] = [];
    for (const f of picked) {
      try {
        added.push({ url: await compressImage(f), ...CROP_DEFAULT_PHOTO });
      } catch (e) {
        setError(e instanceof Error ? e.message : "That photo couldn't be read");
      }
    }
    setBusy(false);
    if (files.length > room) setError(`Only ${MAX_PHOTOS} photos fit — the rest were skipped.`);
    if (!added.length) return;
    const next = [...photos, ...added];
    onChange(next);
    // A single new photo goes straight to framing.
    if (added.length === 1) setAdjusting(next.length - 1);
  };

  const replace = async (files: FileList | null) => {
    const i = replaceIndex.current;
    if (i === null || !files?.[0]) return;
    try {
      patch(i, { url: await compressImage(files[0]), ...CROP_DEFAULT_PHOTO });
    } catch (e) {
      setError(e instanceof Error ? e.message : "That photo couldn't be read");
    }
  };

  const openReplace = (i: number) => {
    replaceIndex.current = i;
    replaceRef.current?.click();
  };

  const adj = adjusting !== null ? photos[adjusting] : null;

  return (
    <div className="space-y-3">
      {photos.map((p, i) => (
        <div key={`${i}-${p.url.slice(-12)}`} className="rounded-2xl border p-3 flex gap-3" style={{ borderColor: "#f1d9e2", background: "#fffafc" }}>
          <div className="shrink-0 flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={() => setAdjusting(i)}
              aria-label={`Adjust photo ${i + 1}`}
              className="relative overflow-hidden rounded-xl"
              style={{ width: 96, aspectRatio: "4 / 5", background: "#eee" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt="" draggable={false} style={cropStyle(photoCrop(p))} />
              <span className="absolute inset-x-0 bottom-0 py-1 text-[10px] font-bold text-white flex items-center justify-center gap-1" style={{ background: "rgba(0,0,0,.55)" }}>
                <Move size={10} /> adjust
              </span>
            </button>
            <div className="flex gap-1">
              <Mini label="Move up" onClick={() => move(i, -1)} disabled={i === 0}>
                <ArrowUp size={13} />
              </Mini>
              <Mini label="Move down" onClick={() => move(i, 1)} disabled={i === photos.length - 1}>
                <ArrowDown size={13} />
              </Mini>
              <Mini label="Remove photo" onClick={() => remove(i)}>
                <Trash2 size={13} />
              </Mini>
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: ACCENT }}>
                photo {i + 1}
              </span>
              <button type="button" onClick={() => openReplace(i)} className="text-[11px] font-semibold inline-flex items-center gap-1 text-muted-foreground">
                <RefreshCw size={11} /> change photo
              </button>
            </div>
            <input
              value={p.caption ?? ""}
              onChange={(e) => patch(i, { caption: e.target.value.slice(0, MAX_CAPTION_LEN) })}
              placeholder={captionHint}
              aria-label={`Caption for photo ${i + 1}`}
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none bg-white"
              style={{ borderColor: "#f1d9e2", fontSize: 16 }}
            />
            <label className="block">
              <span className="text-[11px] font-semibold text-muted-foreground">💌 a little letter for this photo</span>
              <textarea
                value={p.note ?? ""}
                onChange={(e) => patch(i, { note: e.target.value.slice(0, MAX_NOTE_LEN) })}
                placeholder={noteHint}
                aria-label={`Letter for photo ${i + 1}`}
                rows={3}
                className="mt-1 w-full px-3 py-2 rounded-lg border text-sm outline-none bg-white resize-y"
                style={{ borderColor: "#f1d9e2", fontSize: 16, minHeight: 76 }}
              />
              <span className="block text-right text-[10px] text-muted-foreground tabular-nums">
                {(p.note ?? "").length}/{MAX_NOTE_LEN}
              </span>
            </label>
          </div>
        </div>
      ))}

      {photos.length < MAX_PHOTOS && (
        <button
          type="button"
          onClick={() => addRef.current?.click()}
          disabled={busy}
          className="w-full rounded-2xl border-2 border-dashed py-4 text-sm font-bold inline-flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ borderColor: ACCENT, color: ACCENT, background: "#fff5f8", minHeight: 56 }}
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
          {busy ? "adding…" : photos.length ? `add more photos (${photos.length}/${MAX_PHOTOS})` : "add your photos"}
        </button>
      )}
      {error && <p className="text-[12px] font-medium" style={{ color: ACCENT }}>{error}</p>}

      <input ref={addRef} type="file" accept="image/*" multiple className="sr-only" aria-hidden tabIndex={-1} onChange={(e) => { void add(e.target.files); e.target.value = ""; }} />
      <input ref={replaceRef} type="file" accept="image/*" className="sr-only" aria-hidden tabIndex={-1} onChange={(e) => { void replace(e.target.files); e.target.value = ""; }} />

      <PhotoAdjuster
        open={adj !== null}
        src={adj?.url ?? ""}
        crop={adj ? photoCrop(adj) : CROP_DEFAULT}
        title={`Frame photo ${adjusting !== null ? adjusting + 1 : ""}`}
        onChange={(c: Crop) => adjusting !== null && patch(adjusting, { cropX: c.x, cropY: c.y, scale: c.scale })}
        onClose={() => setAdjusting(null)}
        onReplace={() => adjusting !== null && openReplace(adjusting)}
      />
    </div>
  );
}

const CROP_DEFAULT_PHOTO = { cropX: CROP_DEFAULT.x, cropY: CROP_DEFAULT.y, scale: CROP_DEFAULT.scale };

function Mini({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="w-8 h-8 rounded-lg grid place-items-center border bg-white disabled:opacity-35"
      style={{ borderColor: "#f1d9e2", color: "#5b4450" }}
    >
      {children}
    </button>
  );
}
