"use client";

// ─── Four photos from the night ──────────────────────────────────────────────
//
// Once the date is over, either of them can pin a photo to one of the stops
// and give it a title. Four in total, shared — so every one of them counts.
// Each person can take down only their own.

import { useRef, useState } from "react";

import { ACCENT, GRAD, GROTESK, INK, INK_FAINT, INK_SOFT, ITALIC, PAPER_EDGE } from "./dateTheme";
import type { Memory } from "./types";

export interface MemoryStop {
  id: string;
  name: string;
}

export default function Memories({
  memories,
  stops,
  max,
  me,
  senderName,
  recipientName,
  onAdd,
  onRemove,
  reduceMotion,
}: {
  memories: Memory[];
  stops: MemoryStop[];
  max: number;
  /** Who is looking. null → can view but not add (e.g. still loading). */
  me: "sender" | "recipient" | null;
  senderName: string;
  recipientName: string;
  /** Resolves to an error message, or null on success. */
  onAdd: (file: File, stopId: string, title: string) => Promise<string | null>;
  onRemove: (id: string) => Promise<void>;
  reduceMotion: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [composing, setComposing] = useState(false);
  const [stopId, setStopId] = useState(stops[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const remaining = Math.max(0, max - memories.length);
  const stopName = (id: string) => stops.find((s) => s.id === id)?.name ?? "";
  const nameOf = (by: Memory["by"]) => (by === "sender" ? senderName : recipientName);

  const reset = () => {
    setComposing(false);
    setTitle("");
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview("");
    setError("");
  };

  const pick = (f: File | undefined) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("That's not a photo");
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError("");
  };

  const save = async () => {
    if (!file || !stopId) return;
    setBusy(true);
    setError("");
    const err = await onAdd(file, stopId, title.trim());
    setBusy(false);
    if (err) setError(err);
    else reset();
  };

  return (
    <section className="mt-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-[18px] font-extrabold" style={{ color: INK, fontFamily: GROTESK, letterSpacing: "-0.01em" }}>
          our four photos 📸
        </h3>
        <span
          className="rounded-full px-2.5 py-0.5 text-[12px] font-bold"
          style={{ fontFamily: GROTESK, background: remaining ? "#ffe8f0" : "#eaffc2", color: remaining ? ACCENT : "#3b5a00" }}
        >
          {memories.length}/{max}
        </span>
      </div>
      <p className="mt-1 text-[13px] leading-[1.45]" style={{ color: INK_SOFT, fontFamily: GROTESK }}>
        Both of you can add one — pin it to the place it was taken and give it a title. Only four, so pick the best ones.
      </p>

      {/* The board: four polaroid slots, filled or waiting. */}
      <ul className="mt-4 grid list-none grid-cols-2 gap-3 p-1">
        {Array.from({ length: max }, (_, i) => {
          const m = memories[i];
          const tilt = [-2.2, 1.8, 1.4, -1.6][i % 4];
          if (!m) {
            return (
              <li
                key={`empty-${i}`}
                className="grid place-items-center rounded-[14px] text-center"
                style={{
                  aspectRatio: "4 / 5",
                  border: `2px dashed ${PAPER_EDGE}`,
                  color: INK_FAINT,
                  fontFamily: ITALIC,
                  fontStyle: "italic",
                  fontSize: 15,
                  transform: `rotate(${tilt}deg)`,
                }}
              >
                a moment
                <br />
                goes here
              </li>
            );
          }
          const mine = me !== null && m.by === me;
          return (
            <li
              key={m.id || i}
              className={`relative ${reduceMotion ? "" : "di-pop-in"}`}
              style={{
                background: "#fff",
                padding: "8px 8px 10px",
                borderRadius: 10,
                boxShadow: "0 12px 24px -12px rgba(36,31,27,.55)",
                transform: `rotate(${tilt}deg)`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={m.url}
                alt={m.title || `A photo at ${stopName(m.stopId)}`}
                className="block w-full rounded-[6px] object-cover"
                style={{ aspectRatio: "1 / 1" }}
                loading="lazy"
              />
              <p
                className="mt-2 line-clamp-2 text-[14px] leading-[1.2]"
                style={{ color: INK, fontFamily: ITALIC, fontStyle: "italic", overflowWrap: "anywhere" }}
              >
                {m.title || "untitled, perfect anyway"}
              </p>
              <p className="mt-1 truncate text-[10.5px] font-bold uppercase tracking-[0.12em]" style={{ color: ACCENT, fontFamily: GROTESK }}>
                📍 {stopName(m.stopId) || "somewhere good"}
              </p>
              <p className="text-[10.5px] font-semibold" style={{ color: INK_FAINT, fontFamily: GROTESK }}>
                by {nameOf(m.by)}
              </p>
              {mine && (
                <button
                  type="button"
                  onClick={() => void onRemove(m.id)}
                  aria-label="Remove my photo"
                  className="absolute -right-2 -top-2 grid place-items-center rounded-full text-[16px] leading-none"
                  style={{ width: 30, height: 30, background: INK, color: "#fff", fontFamily: GROTESK, boxShadow: "0 6px 12px -6px rgba(0,0,0,.6)" }}
                >
                  &times;
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          pick(e.target.files?.[0]);
          e.target.value = "";
        }}
        className="sr-only"
        aria-hidden
        tabIndex={-1}
      />

      {me && remaining > 0 && !composing && (
        <button
          type="button"
          onClick={() => {
            setComposing(true);
            setStopId((cur) => cur || stops[0]?.id || "");
          }}
          className="mt-5 w-full rounded-full px-5 text-[15px] font-bold transition-transform active:scale-[0.985]"
          style={{ minHeight: 52, color: INK, background: "#fff", border: `2px dashed ${ACCENT}`, fontFamily: GROTESK }}
        >
          ＋ add a photo from tonight
        </button>
      )}

      {me && composing && (
        <div className={`mt-5 rounded-[20px] p-4 ${reduceMotion ? "" : "di-pop-in"}`} style={{ background: "#fff", border: `1px solid ${PAPER_EDGE}` }}>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="relative grid w-full place-items-center overflow-hidden rounded-[14px]"
            style={{ aspectRatio: preview ? "1 / 1" : "16 / 7", background: "#fff4f8", border: `2px dashed ${PAPER_EDGE}` }}
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <span className="text-[14px] font-bold" style={{ color: ACCENT, fontFamily: GROTESK }}>
                📷 choose a photo
              </span>
            )}
          </button>

          <p className="mt-4 text-[11px] font-extrabold uppercase tracking-[0.16em]" style={{ color: INK_SOFT, fontFamily: GROTESK }}>
            where was it?
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {stops.map((s) => {
              const on = s.id === stopId;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStopId(s.id)}
                  aria-pressed={on}
                  className="rounded-full px-3 py-2 text-[13px] font-bold"
                  style={{
                    fontFamily: GROTESK,
                    minHeight: 40,
                    background: on ? GRAD : "#fff",
                    color: on ? "#fff" : INK,
                    border: on ? "none" : `1px solid ${PAPER_EDGE}`,
                  }}
                >
                  📍 {s.name}
                </button>
              );
            })}
          </div>

          <label className="mt-4 block">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.16em]" style={{ color: INK_SOFT, fontFamily: GROTESK }}>
              give it a title
            </span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 80))}
              placeholder="the moment you laughed at my joke"
              className="mt-2 w-full rounded-full px-4 outline-none"
              style={{ minHeight: 46, border: `1px solid ${PAPER_EDGE}`, fontFamily: GROTESK, fontSize: 16, color: INK, background: "#fdfaf3" }}
            />
          </label>

          {error && (
            <p className="mt-3 text-[13px] font-semibold" style={{ color: ACCENT, fontFamily: GROTESK }}>
              {error}
            </p>
          )}

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={reset}
              className="flex-1 rounded-full text-[14px] font-bold"
              style={{ minHeight: 48, border: `1px solid ${PAPER_EDGE}`, color: INK_SOFT, fontFamily: GROTESK, background: "#fff" }}
            >
              cancel
            </button>
            <button
              type="button"
              onClick={() => void save()}
              disabled={!file || !stopId || busy}
              className="di-cta flex-[2] rounded-full text-[15px] font-extrabold text-white disabled:opacity-50"
              style={{ minHeight: 48, background: GRAD, fontFamily: GROTESK, border: "none" }}
            >
              {busy ? "pinning it…" : "pin this memory 📌"}
            </button>
          </div>
        </div>
      )}

      {remaining === 0 && (
        <p className="mt-4 text-center text-[14px]" style={{ color: INK_SOFT, fontFamily: ITALIC, fontStyle: "italic", fontSize: 17 }}>
          four photos, one perfect night ✨
        </p>
      )}
    </section>
  );
}
