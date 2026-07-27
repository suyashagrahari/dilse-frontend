"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, Check, Upload, Link2, VolumeX, Music, Trash2 } from "lucide-react";
import { MU_SONGS, findSong } from "./assets";
import { LIGHT } from "./theme";

const INDIGO = LIGHT.indigoStrong;

interface Props {
  /** Current selection: a preset src, a custom data:audio URL, or "" for silent. */
  value: string;
  onChange: (src: string) => void;
}

// Lets the sender pick a background song from a curated catalogue — with a ▶ to
// LISTEN right in the form — or bring their own via upload / paste-URL. Exactly one
// preview plays at a time; nothing here touches the live template's player.
export default function SongPicker({ value, onChange }: Props) {
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteUrl, setPasteUrl] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const preset = findSong(value);
  const isCustom = !!value && !preset;

  useEffect(() => () => { audioRef.current?.pause(); audioRef.current = null; }, []);

  const stopPreview = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    setPreviewId(null);
  };

  const togglePreview = (id: string, src: string) => {
    if (previewId === id) { stopPreview(); return; }
    audioRef.current?.pause();
    const el = new Audio(src);
    el.volume = 0.85;
    el.onended = () => setPreviewId((p) => (p === id ? null : p));
    audioRef.current = el;
    el.play().catch(() => {});
    setPreviewId(id);
  };

  const select = (src: string) => { stopPreview(); onChange(src); };

  const handleFile = (file?: File) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert("Song too large — please keep it under 10MB."); return; }
    const reader = new FileReader();
    reader.onload = (e) => { stopPreview(); onChange((e.target?.result as string) || ""); };
    reader.readAsDataURL(file);
  };

  const applyPaste = () => {
    const v = pasteUrl.trim();
    if (!v) return;
    select(v);
    setPasteUrl("");
    setPasteOpen(false);
  };

  const rowBase = "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl border text-left transition-colors";

  return (
    <div className="space-y-2">
      {/* None / silent */}
      <button
        type="button"
        onClick={() => select("")}
        className={rowBase}
        style={{ background: !value ? "rgba(86,70,201,.08)" : "#fff", borderColor: !value ? INDIGO : LIGHT.border }}
      >
        <span className="grid h-8 w-8 place-items-center rounded-full shrink-0" style={{ background: LIGHT.surfaceAlt, color: LIGHT.muted }}>
          <VolumeX size={15} />
        </span>
        <span className="flex-1 text-sm font-semibold" style={{ color: LIGHT.muted }}>No music (silent)</span>
        {!value && <Check size={16} style={{ color: INDIGO }} />}
      </button>

      {/* Curated catalogue */}
      {MU_SONGS.map((s) => {
        const selected = preset?.id === s.id;
        const playing = previewId === s.id;
        return (
          <div
            key={s.id}
            className={rowBase}
            style={{ background: selected ? "rgba(86,70,201,.08)" : "#fff", borderColor: selected ? INDIGO : LIGHT.border, cursor: "default" }}
          >
            <button
              type="button"
              onClick={() => togglePreview(s.id, s.src)}
              aria-label={playing ? `Stop ${s.title}` : `Listen to ${s.title}`}
              className="grid h-8 w-8 place-items-center rounded-full text-white shrink-0"
              style={{ background: playing ? LIGHT.pinkDark : INDIGO }}
            >
              {playing ? <Pause size={14} /> : <Play size={14} className="translate-x-[1px]" />}
            </button>
            <button type="button" onClick={() => select(s.src)} className="flex-1 min-w-0 text-left">
              <span className="block text-sm font-semibold truncate" style={{ color: selected ? INDIGO : "#2b2440" }}>{s.title}</span>
              <span className="block text-[11px] truncate" style={{ color: LIGHT.muted }}>{s.artist}</span>
            </button>
            {selected ? (
              <Check size={16} style={{ color: INDIGO }} className="shrink-0" />
            ) : (
              <button type="button" onClick={() => select(s.src)} className="text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0" style={{ color: INDIGO, border: `1px solid ${LIGHT.border}` }}>
                Use
              </button>
            )}
          </div>
        );
      })}

      {/* Custom upload chip (shown when the current song isn't a preset) */}
      {isCustom && (
        <div className={rowBase} style={{ background: "rgba(247,37,133,.06)", borderColor: LIGHT.pinkDark }}>
          <button
            type="button"
            onClick={() => togglePreview("custom", value)}
            aria-label={previewId === "custom" ? "Stop your song" : "Listen to your song"}
            className="grid h-8 w-8 place-items-center rounded-full text-white shrink-0"
            style={{ background: previewId === "custom" ? INDIGO : LIGHT.pinkDark }}
          >
            {previewId === "custom" ? <Pause size={14} /> : <Play size={14} className="translate-x-[1px]" />}
          </button>
          <span className="flex-1 text-sm font-semibold truncate" style={{ color: LIGHT.pinkDark }}>Your own song ✓</span>
          <button type="button" onClick={() => select("")} aria-label="Remove your song" className="w-8 h-8 rounded-full grid place-items-center shrink-0" style={{ color: LIGHT.pinkDark, border: `1px solid ${LIGHT.border}` }}>
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {/* Bring your own */}
      <div className="flex flex-wrap items-center gap-2 pt-0.5">
        <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold" style={{ color: INDIGO, background: LIGHT.surfaceAlt, border: `1.5px solid ${LIGHT.border}` }}>
          <Upload size={13} /> Upload a song
        </button>
        <button type="button" onClick={() => setPasteOpen((v) => !v)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold" style={{ color: LIGHT.muted, background: "#fff", border: `1px solid ${LIGHT.border}` }}>
          <Link2 size={13} /> Paste a link
        </button>
      </div>
      {pasteOpen && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Music size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={pasteUrl}
              onChange={(e) => setPasteUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") applyPaste(); }}
              placeholder="https://…/song.mp3"
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-muted/50 border border-border/50 focus:outline-none text-sm"
            />
          </div>
          <button type="button" onClick={applyPaste} className="px-3 py-2 rounded-lg text-xs font-bold text-white" style={{ background: INDIGO }}>Add</button>
        </div>
      )}

      <input ref={fileRef} type="file" accept="audio/*" className="hidden" onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }} />
    </div>
  );
}
