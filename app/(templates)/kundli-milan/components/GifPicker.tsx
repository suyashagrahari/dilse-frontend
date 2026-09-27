"use client";

// ─── GIF picker ──────────────────────────────────────────────────────────────
//
// Up to three: tap our hand-picked cute GIFs (all on our CDN, so they never
// vanish), or paste any https GIF link from Giphy / Tenor / anywhere.

import { useState } from "react";
import { Check, X } from "lucide-react";

import { GIF_LIBRARY, MAX_GIFS } from "./types";

const ACCENT = "#d0245f";

/** Giphy/Tenor page links → the direct media file where we can tell. */
export function normaliseGifUrl(input: string): string {
  const s = input.trim();
  if (!/^https:\/\/\S+$/i.test(s)) return "";
  const giphy = s.match(/giphy\.com\/(?:gifs|stickers)\/(?:.*-)?([A-Za-z0-9]{8,})/);
  if (giphy) return `https://media.giphy.com/media/${giphy[1]}/giphy.gif`;
  return s;
}

export default function GifPicker({ gifs, onChange }: { gifs: string[]; onChange: (next: string[]) => void }) {
  const [link, setLink] = useState("");
  const [err, setErr] = useState("");
  const full = gifs.length >= MAX_GIFS;

  const toggle = (url: string) => {
    if (gifs.includes(url)) onChange(gifs.filter((g) => g !== url));
    else if (!full) onChange([...gifs, url]);
  };

  const addLink = () => {
    const url = normaliseGifUrl(link);
    if (!url) {
      setErr("Paste an https link to a GIF");
      return;
    }
    if (full) {
      setErr(`Only ${MAX_GIFS} GIFs — remove one first`);
      return;
    }
    if (!gifs.includes(url)) onChange([...gifs, url]);
    setLink("");
    setErr("");
  };

  const custom = gifs.filter((g) => !GIF_LIBRARY.some((l) => l.url === g));

  return (
    <div>
      <p className="text-[12px] text-muted-foreground mb-2">
        Pick up to {MAX_GIFS} — they float on the page as your relationship&apos;s mood board. ({gifs.length}/{MAX_GIFS})
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {GIF_LIBRARY.map((g) => {
          const on = gifs.includes(g.url);
          return (
            <button
              key={g.url}
              type="button"
              onClick={() => toggle(g.url)}
              aria-pressed={on}
              aria-label={g.label}
              disabled={!on && full}
              className="relative rounded-xl overflow-hidden border-2 bg-white disabled:opacity-40"
              style={{ aspectRatio: "1 / 1", borderColor: on ? ACCENT : "#f1d9e2" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.url} alt="" loading="lazy" className="w-full h-full object-contain" />
              {on && (
                <span className="absolute top-1 right-1 w-5 h-5 rounded-full grid place-items-center text-white" style={{ background: ACCENT }}>
                  <Check size={12} />
                </span>
              )}
              <span className="absolute inset-x-0 bottom-0 text-[9.5px] font-semibold text-white py-0.5 truncate px-1" style={{ background: "rgba(0,0,0,.45)" }}>
                {g.label}
              </span>
            </button>
          );
        })}
      </div>

      {custom.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {custom.map((g) => (
            <span key={g} className="relative w-16 h-16 rounded-xl overflow-hidden border-2" style={{ borderColor: ACCENT }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onChange(gifs.filter((x) => x !== g))}
                aria-label="Remove this GIF"
                className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full grid place-items-center text-white"
                style={{ background: "rgba(0,0,0,.6)" }}
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <input
          value={link}
          onChange={(e) => {
            setLink(e.target.value);
            setErr("");
          }}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLink())}
          placeholder="…or paste a GIF link (Giphy, Tenor)"
          aria-label="GIF link"
          inputMode="url"
          className="flex-1 min-w-0 px-3 py-2 rounded-lg border outline-none bg-white"
          style={{ borderColor: err ? ACCENT : "#f1d9e2", fontSize: 16 }}
        />
        <button type="button" onClick={addLink} className="px-4 rounded-lg text-sm font-bold text-white" style={{ background: ACCENT, minHeight: 44 }}>
          add
        </button>
      </div>
      {err && <p className="text-[12px] mt-1" style={{ color: ACCENT }}>{err}</p>}
    </div>
  );
}
