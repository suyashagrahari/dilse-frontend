"use client";

// ─── Photos, added afterwards ────────────────────────────────────────────────
//
// AGENT 3. Local only. A `<input type="file">`, `FileReader` to data URLs, and
// previews. Nothing is uploaded and nothing survives a refresh.
//
// TODO(server): upload the photos. They should go to
// POST /date-invitation-pages/share/:shareId/photos as multipart, and the page
// should store URLs rather than data URLs — twelve base64 images in the page
// document is not a wire format anyone wants to keep. Until that endpoint
// exists these are React state and they do not reach the sender.

import React, { useRef, useState } from "react";

import { ACCENT, GROTESK, INK, INK_FAINT, INK_SOFT, PAPER_EDGE } from "./dateTheme";

/** The wire format keeps 12 (`dbToDateInviteData` slices there). Match it. */
export const MAX_PHOTOS = 12;
/** Anything larger is a burst-mode RAW or a video someone renamed. Skip it. */
export const MAX_BYTES = 8 * 1024 * 1024;

export interface PhotoStripProps {
  /** Session state from the router. Data URLs. */
  photos: string[];
  /** Appends to the router's list, capped at 12 there as well. */
  onAddPhotos: (dataUrls: string[]) => void;
  reduceMotion: boolean;
}

const readAsDataUrl = (file: File): Promise<string | null> =>
  new Promise((resolve) => {
    const fr = new FileReader();
    fr.onload = () => resolve(typeof fr.result === "string" ? fr.result : null);
    fr.onerror = () => resolve(null);
    fr.onabort = () => resolve(null);
    fr.readAsDataURL(file);
  });

export default function PhotoStrip({ photos, onAddPhotos }: PhotoStripProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  // The router owns the list and exposes no remove handler, so a deletion is
  // recorded here as a hidden entry rather than by reaching around it.
  // TODO(server): DELETE the photo instead, once there is somewhere to delete it from.
  const [hidden, setHidden] = useState<string[]>([]);

  const visible = photos.filter((p) => !hidden.includes(p));
  const remaining = Math.max(0, MAX_PHOTOS - visible.length);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    // Let the same file be chosen again after a delete.
    e.target.value = "";
    if (picked.length === 0) return;

    setBusy(true);
    setNotice("");

    let skippedBig = 0;
    let skippedFull = 0;
    const room = remaining;
    const accepted: File[] = [];

    for (const f of picked) {
      if (f.size > MAX_BYTES) {
        skippedBig += 1;
        continue;
      }
      if (accepted.length >= room) {
        skippedFull += 1;
        continue;
      }
      accepted.push(f);
    }

    const urls = (await Promise.all(accepted.map(readAsDataUrl))).filter(
      (u): u is string => typeof u === "string" && u.length > 0,
    );

    if (urls.length > 0) {
      // A previously deleted photo re-added should reappear.
      setHidden((h) => h.filter((x) => !urls.includes(x)));
      onAddPhotos(urls);
    }

    // Quiet, factual, no exclamation marks. This is not a place for an error state.
    const bits: string[] = [];
    if (skippedBig > 0) bits.push(`${skippedBig} ${skippedBig === 1 ? "photo was" : "photos were"} too big to keep here`);
    if (skippedFull > 0) bits.push(`${skippedFull} didn't fit — ${MAX_PHOTOS} is the limit`);
    setNotice(bits.join(" · "));
    setBusy(false);
  }

  const remove = (url: string) => setHidden((h) => (h.includes(url) ? h : [...h, url]));

  return (
    <section className="mt-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-[18px] font-extrabold" style={{ color: INK, fontFamily: GROTESK, letterSpacing: "-0.01em" }}>
          photo dump 📷
        </h3>
        {visible.length > 0 && (
          <span className="text-[12px] font-semibold" style={{ color: INK_FAINT, fontFamily: GROTESK }}>
            {visible.length} of {MAX_PHOTOS}
          </span>
        )}
      </div>

      {visible.length > 0 && (
        <ul className="mt-4 grid list-none grid-cols-3 gap-3 p-1">
          {visible.map((url, i) => (
            <li
              key={`${i}-${url.slice(-24)}`}
              className="relative overflow-hidden rounded-[14px]"
              style={{
                aspectRatio: "1 / 1",
                background: PAPER_EDGE,
                border: "4px solid #fff",
                boxShadow: "0 8px 18px -10px rgba(36,31,27,.55)",
                transform: `rotate(${[-2.5, 1.8, -1.2, 2.4, -1.8, 1.2][i % 6]}deg)`,
              }}
            >
              {/* Local data URLs. next/image would want a loader and a domain. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="h-full w-full object-cover"
                style={{ display: "block" }}
              />
              <button
                type="button"
                onClick={() => remove(url)}
                aria-label={`Remove photo ${i + 1}`}
                className="absolute right-1 top-1 flex items-center justify-center rounded-full text-[18px] leading-none"
                style={{
                  width: 32,
                  height: 32,
                  color: INK,
                  background: "rgba(253,250,243,0.94)",
                  border: `1px solid ${PAPER_EDGE}`,
                  fontFamily: GROTESK,
                }}
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={onPick}
        className="sr-only"
        aria-hidden
        tabIndex={-1}
      />

      <button
        type="button"
        disabled={busy || remaining === 0}
        onClick={() => inputRef.current?.click()}
        className="mt-4 w-full rounded-full px-5 text-[15px] font-bold transition-transform active:scale-[0.985] disabled:opacity-55"
        style={{
          minHeight: 52,
          color: remaining === 0 ? INK_SOFT : INK,
          background: "#fff",
          border: `2px dashed ${remaining === 0 ? PAPER_EDGE : ACCENT}`,
          fontFamily: GROTESK,
        }}
      >
        {busy ? "reading…" : remaining === 0 ? "that's twelve" : "＋ add photos from tonight"}
      </button>

      {notice && (
        <p className="mt-2 text-[12.5px] leading-[1.5]" style={{ color: INK_SOFT, fontFamily: GROTESK }}>
          {notice}
        </p>
      )}

      <p className="mt-2 text-center text-[12px] leading-[1.5]" style={{ color: INK_FAINT, fontFamily: GROTESK }}>
        These stay on this device for now.
      </p>
    </section>
  );
}
