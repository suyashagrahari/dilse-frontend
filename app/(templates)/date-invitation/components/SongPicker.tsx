"use client";

// ─── Pick their song ─────────────────────────────────────────────────────────
//
// The same hand-picked love songs the Dedication template offers (English
// first), a "no song" option, and a box for any YouTube link.

import { useState } from "react";

import { SONG_LIBRARY, ytThumb } from "../../dedication/components/songLibrary";
import { ACCENT, ACCENT_WASH, INK, INK_FAINT, INK_SOFT, PAPER_EDGE, UI } from "./dateTheme";

/** youtu.be/ID, watch?v=ID, /shorts/ID, /embed/ID, or a bare 11-character id. */
export function youtubeIdOf(input: string): string {
  const s = input.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  const m = s.match(/(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/|\/live\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : "";
}

export default function SongPicker({
  songId,
  songTitle,
  onChange,
}: {
  songId: string;
  songTitle: string;
  onChange: (id: string, title: string) => void;
}) {
  const inLibrary = SONG_LIBRARY.some((s) => s.youtubeId === songId);
  const [link, setLink] = useState(songId && !inLibrary ? `https://youtu.be/${songId}` : "");
  const [linkError, setLinkError] = useState("");

  const applyLink = (value: string) => {
    setLink(value);
    if (!value.trim()) {
      setLinkError("");
      return;
    }
    const id = youtubeIdOf(value);
    if (!id) {
      setLinkError("That doesn't look like a YouTube link");
      return;
    }
    setLinkError("");
    const known = SONG_LIBRARY.find((s) => s.youtubeId === id);
    onChange(id, known ? `${known.title} — ${known.artist}` : songTitle && songId === id ? songTitle : "our song");
  };

  return (
    <div>
      <p className="text-[12px] mb-3" style={{ color: INK_SOFT, fontFamily: UI, lineHeight: 1.5 }}>
        It starts playing the moment they open the invitation 🎶
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => {
            onChange("", "");
            setLink("");
          }}
          aria-pressed={!songId}
          className="rounded-xl p-2 text-left flex items-center gap-2"
          style={{
            minHeight: 56,
            border: `1.5px solid ${!songId ? ACCENT : PAPER_EDGE}`,
            background: !songId ? ACCENT_WASH : "#fff",
            fontFamily: UI,
          }}
        >
          <span className="w-10 h-10 rounded-lg grid place-items-center text-lg shrink-0" style={{ background: "#f3efe6" }}>
            🔇
          </span>
          <span className="text-[12.5px] font-semibold" style={{ color: INK }}>
            No song
          </span>
        </button>
        {SONG_LIBRARY.map((s) => {
          const on = s.youtubeId === songId;
          return (
            <button
              key={s.youtubeId}
              type="button"
              onClick={() => {
                onChange(s.youtubeId, `${s.title} — ${s.artist}`);
                setLink("");
                setLinkError("");
              }}
              aria-pressed={on}
              className="rounded-xl p-2 text-left flex items-center gap-2 min-w-0"
              style={{
                minHeight: 56,
                border: `1.5px solid ${on ? ACCENT : PAPER_EDGE}`,
                background: on ? ACCENT_WASH : "#fff",
                fontFamily: UI,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ytThumb(s.youtubeId)} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" loading="lazy" />
              <span className="min-w-0">
                <span className="block text-[12.5px] font-semibold truncate" style={{ color: INK }}>
                  {on ? "▶ " : ""}
                  {s.title}
                </span>
                <span className="block text-[11px] truncate" style={{ color: INK_FAINT }}>
                  {s.artist}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <label className="block mt-3">
        <span className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: INK_SOFT, fontFamily: UI }}>
          …or paste any YouTube link
        </span>
        <input
          value={link}
          onChange={(e) => applyLink(e.target.value)}
          placeholder="https://youtu.be/…"
          aria-label="YouTube link"
          inputMode="url"
          className="mt-1.5 w-full rounded-md px-3.5 outline-none"
          style={{ minHeight: 46, border: `1px solid ${linkError ? ACCENT : PAPER_EDGE}`, fontFamily: UI, fontSize: 16, color: INK, background: "#fff" }}
        />
      </label>
      {linkError && (
        <p className="mt-1 text-[11.5px]" style={{ color: ACCENT, fontFamily: UI }}>
          {linkError}
        </p>
      )}
      {songId && !inLibrary && !linkError && (
        <label className="block mt-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: INK_SOFT, fontFamily: UI }}>
            song name
          </span>
          <input
            value={songTitle}
            onChange={(e) => onChange(songId, e.target.value.slice(0, 120))}
            placeholder="Our song"
            aria-label="Song name"
            className="mt-1.5 w-full rounded-md px-3.5 outline-none"
            style={{ minHeight: 46, border: `1px solid ${PAPER_EDGE}`, fontFamily: UI, fontSize: 16, color: INK, background: "#fff" }}
          />
        </label>
      )}
    </div>
  );
}
