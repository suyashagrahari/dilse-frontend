"use client";

// One photo slot: upload → frame (drag / pinch / zoom, the Dedication
// adjuster) → replace → remove. The thumbnail uses the same crop rule every
// surface renders with, so what they frame here is what the recipient sees.

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Move, RefreshCw, Trash2 } from "lucide-react";
import PhotoAdjuster from "../../dedication/components/PhotoAdjuster";
import { compressImage } from "../../dedication/components/mediaUploads";
import { cropStyle } from "./theme";
import { CROP_CENTER, type Crop } from "./types";

export default function PhotoField({
  label,
  url,
  crop,
  aspect = "1 / 1",
  round,
  onChange,
  compact,
}: {
  label: string;
  url: string;
  crop: Crop;
  aspect?: string;
  round?: boolean;
  compact?: boolean;
  onChange: (url: string, crop: Crop) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [adjust, setAdjust] = useState(false);

  const pick = async (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    setErr("");
    setBusy(true);
    try {
      const data = await compressImage(f, 1280);
      onChange(data, CROP_CENTER);
      setAdjust(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "That photo couldn't be read");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`es-photo${compact ? " is-compact" : ""}`}>
      <span className="es-label">{label}</span>
      {url ? (
        <div className="es-photo-filled">
          <button
            type="button"
            className="es-photo-frame"
            style={{ aspectRatio: aspect, borderRadius: round ? 10 : 8 }}
            onClick={() => setAdjust(true)}
            aria-label={`Adjust ${label}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" draggable={false} style={cropStyle(crop)} />
            <span className="es-photo-adjust">
              <Move size={12} /> adjust
            </span>
          </button>
          <div className="es-photo-acts">
            <button type="button" onClick={() => input.current?.click()} aria-label={`Replace ${label}`}>
              <RefreshCw size={13} /> Replace
            </button>
            <button type="button" onClick={() => onChange("", CROP_CENTER)} aria-label={`Remove ${label}`}>
              <Trash2 size={13} /> Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="es-photo-empty"
          style={{ aspectRatio: aspect, borderRadius: round ? 10 : 8 }}
          onClick={() => input.current?.click()}
          disabled={busy}
        >
          {busy ? <Loader2 size={20} className="animate-spin" /> : <ImagePlus size={20} />}
          <span>{busy ? "Adding…" : "Add photo"}</span>
        </button>
      )}
      {err && <span className="es-err">{err}</span>}
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          void pick(e.target.files);
          e.target.value = "";
        }}
      />
      <PhotoAdjuster
        open={adjust && !!url}
        src={url}
        crop={crop}
        title={`Frame: ${label}`}
        onChange={(c) => onChange(url, { x: c.x, y: c.y, scale: c.scale })}
        onClose={() => setAdjust(false)}
        onReplace={() => input.current?.click()}
      />
    </div>
  );
}
