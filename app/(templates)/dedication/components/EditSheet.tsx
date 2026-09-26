"use client";

// ─── The edit sheet ──────────────────────────────────────────────────────────
//
// Ordinary product chrome. The radio typography belongs to the show, not to the
// form the sender fills in at 1am.
//
// THE ONE RULE THAT MATTERS HERE: a YouTube link is validated the moment it is
// typed, with the same `parseYouTubeId` the player will use. A link that turns
// out to be unusable during playback is a dead radio and the sender is not
// around to fix it. Green tick or red line, right under the field, immediately.

import React, { useCallback, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X, Eye, Lock, Plus, Trash2, ChevronUp, ChevronDown, Mic, Music4, Radio, Users,
  ScrollText, Check, AlertTriangle, Type, Film, Images, Upload, Heart, Loader2, Library, Crop,
} from "lucide-react";

import {
  parseYouTubeId, TAP_TARGET_PX, CROP_DEFAULT, cropStyle, photoCrop,
  type ClipSegment, type Photo, type Segment, type SongSegment, type VoiceSegment,
} from "./types";
import PhotoAdjuster from "./PhotoAdjuster";
import {
  MAX_SEGMENTS, MAX_NAME_LEN, MAX_CAPTION_LEN, MAX_DEDICATION_LEN, MAX_SIGNOFF_LEN,
  MAX_CLIPS, MAX_PHOTOS, MAX_PHOTO_CAPTION_LEN, MAX_PHOTO_NOTE_LEN, MAX_LETTER_LEN,
  blankClip, blankSong, blankVoice, isDemoPhoto, type DedicationData, type EditMode,
} from "./showData";
import Booth, { type Recording } from "./Booth";
import { SONG_LIBRARY, ytThumb } from "./songLibrary";
import { audioDurationMs, checkVideoFile, compressImage, holdVideo, uploadVideo } from "./mediaUploads";
import { readAudioFile, looksPickableAsAudio } from "@/lib/media/readAudioFile";

const ACCENT = "#B4441F";
const ACCENT_GRAD = "linear-gradient(135deg,#C2551F,#8c3b2a)";
const INK = "#2A1A12";
const MUTED = "#8A776A";
const RULE = "#EDDCC9";
const DANGER = "#B3261E";

/** 16px everywhere: anything smaller makes iOS zoom the page on focus. */
const INPUT_STYLE: React.CSSProperties = { fontSize: 16 };
const INPUT_CLS =
  "w-full px-3.5 py-3 rounded-xl bg-muted/40 border border-border/50 focus:outline-none focus:border-orange-400/60 transition-all min-h-[48px]";

export interface EditSheetProps {
  editMode: EditMode;
  setEditMode: (m: EditMode) => void;
  mf: DedicationData;
  updateMf: <K extends keyof DedicationData>(key: K, val: DedicationData[K]) => void;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  onSave: () => void;
  saving: boolean;
  /** Present when signed in — videos then upload the moment they're picked. */
  accessToken?: string | null;
  notify?: (title: string, message?: string) => void;
}

function Section({
  icon, title, blurb, right, children,
}: {
  icon: React.ReactNode;
  title: string;
  blurb: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl p-3.5" style={{ background: "rgba(253,246,238,.7)", border: `1px solid ${RULE}` }}>
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="min-w-0">
          <h4 className="text-sm font-bold flex items-center gap-1.5" style={{ color: INK }}>
            <span style={{ color: ACCENT }} aria-hidden>{icon}</span>
            {title}
          </h4>
          <p className="text-[11px] mt-0.5 leading-snug" style={{ color: MUTED }}>{blurb}</p>
        </div>
        {right && <div className="shrink-0">{right}</div>}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: MUTED }}>
      {children}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   A song row
   ══════════════════════════════════════════════════════════════════════════ */

function SongRow({
  seg, index, onChange,
}: {
  seg: SongSegment;
  index: number;
  onChange: (next: SongSegment) => void;
}) {
  // The raw text the sender typed. Kept separate from the parsed id so the
  // field does not fight them mid-paste.
  const [raw, setRaw] = useState(seg.youtubeId ? `https://youtu.be/${seg.youtubeId}` : "");
  const parsed = useMemo(() => parseYouTubeId(raw), [raw]);
  const touched = raw.trim().length > 0;

  const commitLink = useCallback(
    (value: string) => {
      setRaw(value);
      onChange({ ...seg, youtubeId: parseYouTubeId(value) ?? "" });
    },
    [seg, onChange],
  );

  const pick = (id: string) => {
    const song = SONG_LIBRARY.find((x) => x.youtubeId === id);
    if (!song) return;
    setRaw(`https://youtu.be/${song.youtubeId}`);
    onChange({
      ...seg,
      youtubeId: song.youtubeId,
      title: song.title,
      artist: song.artist,
      ...(song.startSeconds ? { startSeconds: song.startSeconds } : {}),
    });
  };

  return (
    <div className="space-y-2.5">
      <div>
        <Label>
          <span className="inline-flex items-center gap-1"><Library size={11} /> Pick a love song</span>
        </Label>
        <div
          className="-mx-1 px-1 flex gap-2 overflow-x-auto pb-1.5 snap-x"
          style={{ scrollbarWidth: "thin", overscrollBehaviorX: "contain" }}
        >
          {SONG_LIBRARY.map((song) => {
            const on = seg.youtubeId === song.youtubeId;
            return (
              <button
                key={song.youtubeId}
                type="button"
                onClick={() => pick(song.youtubeId)}
                className="shrink-0 snap-start text-left rounded-xl overflow-hidden transition-transform active:scale-95"
                style={{
                  width: 132,
                  background: "#fff",
                  border: on ? `2px solid ${ACCENT}` : `1px solid ${RULE}`,
                  boxShadow: on ? "0 6px 16px -8px rgba(180,68,31,.6)" : "none",
                }}
                aria-pressed={on}
              >
                <span className="relative block" style={{ aspectRatio: "16 / 9", background: "#eee" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ytThumb(song.youtubeId)} alt="" loading="lazy" className="w-full h-full object-cover" />
                  {on && (
                    <span
                      className="absolute top-1 right-1 grid place-items-center rounded-full"
                      style={{ width: 20, height: 20, background: ACCENT, color: "#fff" }}
                    >
                      <Check size={12} />
                    </span>
                  )}
                </span>
                <span className="block px-2 pt-1.5 text-[12px] font-bold truncate" style={{ color: INK }}>{song.title}</span>
                <span className="block px-2 pb-2 text-[10px] truncate" style={{ color: MUTED }}>{song.vibe}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Label>…or paste any YouTube link</Label>
        <input
          type="url"
          inputMode="url"
          value={raw}
          onChange={(e) => commitLink(e.target.value)}
          placeholder="youtu.be/… or youtube.com/watch?v=…"
          className={INPUT_CLS}
          style={INPUT_STYLE}
          aria-invalid={touched && !parsed}
          aria-describedby={`link-note-${index}`}
        />
        <p
          id={`link-note-${index}`}
          className="text-[11px] mt-1 flex items-center gap-1"
          style={{ color: !touched ? MUTED : parsed ? "#1B7A3D" : DANGER }}
        >
          {!touched ? (
            "youtu.be, /watch?v=, /shorts/ and /embed/ all work"
          ) : parsed ? (
            <>
              <Check size={12} /> link reads as {parsed}
            </>
          ) : (
            <>
              <AlertTriangle size={12} /> that isn&apos;t a YouTube video link
            </>
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Title</Label>
          <input
            value={seg.title}
            onChange={(e) => onChange({ ...seg, title: e.target.value.slice(0, 80) })}
            placeholder="Song"
            className={INPUT_CLS}
            style={INPUT_STYLE}
          />
        </div>
        <div>
          <Label>Artist</Label>
          <input
            value={seg.artist}
            onChange={(e) => onChange({ ...seg, artist: e.target.value.slice(0, 80) })}
            placeholder="Artist"
            className={INPUT_CLS}
            style={INPUT_STYLE}
          />
        </div>
      </div>

      <div>
        <Label>Dedication — the card that slides up</Label>
        <textarea
          value={seg.dedication}
          onChange={(e) => onChange({ ...seg, dedication: e.target.value.slice(0, MAX_DEDICATION_LEN) })}
          placeholder="This one goes out to Meera in Bengaluru, from Arjun."
          rows={2}
          className={INPUT_CLS}
          style={INPUT_STYLE}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Start at (sec)</Label>
          <input
            type="number"
            min={0}
            value={seg.startSeconds ?? ""}
            onChange={(e) => {
              const n = Number(e.target.value);
              onChange({ ...seg, startSeconds: Number.isFinite(n) && n > 0 ? Math.floor(n) : undefined });
            }}
            placeholder="0"
            className={INPUT_CLS}
            style={INPUT_STYLE}
          />
        </div>
        <div>
          <Label>Stop at (sec)</Label>
          <input
            type="number"
            min={0}
            value={seg.endSeconds ?? ""}
            onChange={(e) => {
              const n = Number(e.target.value);
              onChange({ ...seg, endSeconds: Number.isFinite(n) && n > 0 ? Math.floor(n) : undefined });
            }}
            placeholder="whole song"
            className={INPUT_CLS}
            style={INPUT_STYLE}
          />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   A voice row — the booth, or the text card
   ══════════════════════════════════════════════════════════════════════════ */

function VoiceRow({ seg, onChange }: { seg: VoiceSegment; onChange: (next: VoiceSegment) => void }) {
  const [showBooth, setShowBooth] = useState(false);
  const audioInput = useRef<HTMLInputElement>(null);
  const [reading, setReading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  /** A song, a voice memo, a recorded poem — any audio they already have. */
  const onAudioFile = async (file: File) => {
    setAudioError(null);
    if (!looksPickableAsAudio(file)) {
      setAudioError("That doesn't look like an audio file.");
      return;
    }
    setReading(true);
    try {
      const read = await readAudioFile(file);
      if (!read.ok) {
        setAudioError(read.error);
        return;
      }
      const durationMs = await audioDurationMs(read.dataUrl);
      onChange({ ...seg, audioUrl: read.dataUrl, durationMs });
    } finally {
      setReading(false);
    }
  };

  const keep = useCallback(
    (rec: Recording) => {
      // The DATA url, never the blob url. `resolveAudioUrl` on the server sees
      // the `data:` prefix, pushes the bytes to S3 and stores the https URL it
      // gets back; a non-data value is passed through untouched, so re-saving
      // an already-published show does not re-upload anything.
      onChange({ ...seg, audioUrl: rec.dataUrl, durationMs: rec.durationMs });
      setShowBooth(false);
    },
    [seg, onChange],
  );

  return (
    <div className="space-y-2.5">
      {seg.audioUrl ? (
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2.5"
          style={{ background: "rgba(27,122,61,.08)", border: "1px solid rgba(27,122,61,.25)" }}
        >
          <Check size={15} style={{ color: "#1B7A3D" }} className="shrink-0" />
          <span className="text-[12px] flex-1" style={{ color: INK }}>
            audio added · {Math.round(seg.durationMs / 1000)}s
          </span>
          <button
            type="button"
            onClick={() => onChange({ ...seg, audioUrl: "", durationMs: 8000 })}
            className="text-[11px] font-bold px-2 py-1 rounded-lg"
            style={{ color: DANGER, minHeight: 32 }}
          >
            remove
          </button>
        </div>
      ) : showBooth ? (
        <Booth onKeep={keep} onUseText={() => setShowBooth(false)} heading="Record this intro" />
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setShowBooth(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl font-bold text-[13px] text-white"
            style={{ minHeight: TAP_TARGET_PX, background: ACCENT_GRAD }}
          >
            <Mic size={15} /> record voice
          </button>
          <button
            type="button"
            onClick={() => audioInput.current?.click()}
            disabled={reading}
            className="inline-flex items-center justify-center gap-2 rounded-xl font-bold text-[13px] disabled:opacity-60"
            style={{ minHeight: TAP_TARGET_PX, color: ACCENT, border: `1.5px solid ${ACCENT}55`, background: "#fff" }}
          >
            {reading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />} upload audio
          </button>
          <input
            ref={audioInput}
            type="file"
            accept="audio/*,video/mp4,.m4a,.mp3,.wav,.ogg,.aac"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f) void onAudioFile(f);
            }}
          />
          {audioError && (
            <p className="col-span-2 text-[11px] flex items-center gap-1" style={{ color: DANGER }}>
              <AlertTriangle size={12} /> {audioError}
            </p>
          )}
        </div>
      )}

      <div>
        <Label>
          {seg.audioUrl ? "Caption — subtitles for this bit" : "Or write it, and we'll show it as a card"}
        </Label>
        <textarea
          value={seg.caption ?? ""}
          onChange={(e) => onChange({ ...seg, caption: e.target.value.slice(0, MAX_CAPTION_LEN) })}
          placeholder="Good evening. You're on 98.3…"
          rows={2}
          className={INPUT_CLS}
          style={INPUT_STYLE}
        />
        <p className="text-[11px] mt-1 flex items-center gap-1" style={{ color: MUTED }}>
          <Type size={11} />
          {seg.audioUrl
            ? "shown under the radio while you talk"
            : "no recording? this plays as an on-screen card. your voice is better."}
        </p>
      </div>

      {!seg.audioUrl && (
        <div>
          <Label>Hold the card for (sec)</Label>
          <input
            type="number"
            min={2}
            max={60}
            value={Math.round(seg.durationMs / 1000)}
            onChange={(e) => {
              const n = Number(e.target.value);
              onChange({ ...seg, durationMs: Math.min(60, Math.max(2, Number.isFinite(n) ? n : 8)) * 1000 });
            }}
            className={INPUT_CLS}
            style={INPUT_STYLE}
          />
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   A video row — one of their own clips (max 3, 10MB each)
   ══════════════════════════════════════════════════════════════════════════ */

function ClipRow({
  seg, onChange, accessToken,
}: {
  seg: ClipSegment;
  onChange: (next: ClipSegment) => void;
  accessToken?: string | null;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ f: number; stage: "uploading" | "compressing" } | null>(null);
  const segRef = useRef(seg);
  segRef.current = seg;

  const onFile = async (file: File) => {
    setError(null);
    const bad = checkVideoFile(file);
    if (bad) {
      setError(bad);
      return;
    }
    // Preview straight away from the local file.
    const local = holdVideo(file);
    onChange({ ...segRef.current, videoUrl: local, posterUrl: undefined });
    if (!accessToken) return; // uploaded at publish, after sign-in
    setProgress({ f: 0, stage: "uploading" });
    try {
      const up = await uploadVideo(file, accessToken, (f, stage) => setProgress({ f, stage }));
      if (segRef.current.videoUrl === local) {
        onChange({ ...segRef.current, videoUrl: up.url, ...(up.posterUrl ? { posterUrl: up.posterUrl } : {}) });
      }
    } catch (e) {
      // The local copy stays; publish will try the upload again.
      setError(e instanceof Error ? `${e.message} We'll retry when you publish.` : "Upload failed — we'll retry on publish.");
    } finally {
      setProgress(null);
    }
  };

  const uploaded = seg.videoUrl.startsWith("https://");

  return (
    <div className="space-y-2.5">
      {seg.videoUrl ? (
        <div className="relative rounded-xl overflow-hidden" style={{ background: "#000", aspectRatio: "16 / 9" }}>
          <video
            src={seg.videoUrl}
            poster={seg.posterUrl}
            controls
            playsInline
            preload="metadata"
            className="w-full h-full"
            style={{ objectFit: "contain" }}
          />
          {progress && (
            <div className="absolute inset-x-0 bottom-0 p-2" style={{ background: "linear-gradient(transparent, rgba(0,0,0,.8))" }}>
              <p className="text-[11px] font-bold text-white flex items-center gap-1.5">
                <Loader2 size={12} className="animate-spin" />
                {progress.stage === "compressing" ? "compressing for fast playback…" : `uploading · ${Math.round(progress.f * 100)}%`}
              </p>
              <div className="mt-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.25)" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${progress.stage === "compressing" ? 100 : Math.round(progress.f * 100)}%`, background: "#F0A63C" }}
                />
              </div>
            </div>
          )}
        </div>
      ) : null}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={Boolean(progress)}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl font-bold text-[13px] text-white disabled:opacity-60"
          style={{ minHeight: TAP_TARGET_PX, background: "linear-gradient(135deg,#6d3bb4,#3b1f7a)" }}
        >
          <Film size={15} /> {seg.videoUrl ? "change video" : "upload a video"}
        </button>
      </div>
      <input
        ref={input}
        type="file"
        accept="video/mp4,video/quicktime,video/webm,video/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) void onFile(f);
        }}
      />
      <p className="text-[11px] flex items-center gap-1" style={{ color: error ? DANGER : MUTED }}>
        {error ? (
          <><AlertTriangle size={12} /> {error}</>
        ) : seg.videoUrl ? (
          uploaded ? <><Check size={12} style={{ color: "#1B7A3D" }} /> uploaded & compressed</> : "saved on this device — uploads when you publish"
        ) : (
          "max 10MB · mp4 or mov · we shrink it for smooth playback"
        )}
      </p>

      <div>
        <Label>Title (optional)</Label>
        <input
          value={seg.title}
          onChange={(e) => onChange({ ...seg, title: e.target.value.slice(0, 80) })}
          placeholder="Goa, 2 am"
          className={INPUT_CLS}
          style={INPUT_STYLE}
        />
      </div>
      <div>
        <Label>Dedication — slides up while it plays</Label>
        <textarea
          value={seg.dedication}
          onChange={(e) => onChange({ ...seg, dedication: e.target.value.slice(0, MAX_DEDICATION_LEN) })}
          placeholder="Remember this? I watch it every time I miss you."
          rows={2}
          className={INPUT_CLS}
          style={INPUT_STYLE}
        />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   The photo reel — up to 12 small cards on the radio's face
   ══════════════════════════════════════════════════════════════════════════ */

function PhotosEditor({
  photos, onChange, notify,
}: {
  photos: Photo[];
  onChange: (next: Photo[]) => void;
  notify?: (title: string, message?: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const replaceInput = useRef<HTMLInputElement>(null);
  const replaceIdx = useRef<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [adjusting, setAdjusting] = useState<number | null>(null);
  const allDemo = photos.length > 0 && photos.every((p) => isDemoPhoto(p.url));
  // The adjuster edits whatever is at `adjusting` right now; a ref keeps the
  // latest list so rapid slider changes never write into a stale copy.
  const photosRef = useRef(photos);
  photosRef.current = photos;

  const set = (i: number, patch: Partial<Photo>) =>
    onChange(photosRef.current.map((p, j) => (j === i ? { ...p, ...patch } : p)));

  const addFiles = async (files: File[]) => {
    // The first real photo replaces the whole sample reel.
    let next = allDemo ? [] : photos.slice();
    const room = MAX_PHOTOS - next.length;
    if (room <= 0) return;
    setBusy(true);
    try {
      for (const f of files.slice(0, room)) {
        try {
          next = [...next, { url: await compressImage(f) }];
        } catch (e) {
          notify?.("Couldn't add a photo", e instanceof Error ? e.message : undefined);
        }
      }
      onChange(next);
      if (files.length > room) notify?.("Reel is full", `Up to ${MAX_PHOTOS} photos.`);
      // One new photo: frame it straight away.
      if (files.length === 1 && next.length) setAdjusting(next.length - 1);
    } finally {
      setBusy(false);
    }
  };

  const replaceFile = async (file: File) => {
    const i = replaceIdx.current;
    replaceIdx.current = null;
    if (i === null) return;
    try {
      const url = await compressImage(file);
      set(i, { url, cropX: undefined, cropY: undefined, scale: undefined });
      setAdjusting(i);
    } catch (e) {
      notify?.("Couldn't use that photo", e instanceof Error ? e.message : undefined);
    }
  };

  const askReplace = (i: number) => {
    replaceIdx.current = i;
    replaceInput.current?.click();
  };

  const move = (i: number, d: number) => {
    const to = i + d;
    if (to < 0 || to >= photos.length) return;
    const next = photos.slice();
    [next[i], next[to]] = [next[to], next[i]];
    onChange(next);
  };

  const current = adjusting !== null ? photos[adjusting] : undefined;

  return (
    <div className="space-y-3">
      {allDemo && (
        <p className="text-[11px] rounded-lg px-2.5 py-1.5" style={{ background: "rgba(240,166,60,.14)", color: "#8a5c1e" }}>
          These are sample photos with sample letters — your first upload replaces them.
        </p>
      )}

      {photos.map((p, i) => (
        <div
          key={`${p.url.slice(-24)}-${i}`}
          className="rounded-2xl p-2.5 flex gap-3"
          style={{ background: "#fff", border: `1px solid ${RULE}`, boxShadow: "0 6px 16px -12px rgba(42,26,18,.35)" }}
        >
          {/* the polaroid, exactly as framed */}
          <div className="shrink-0" style={{ width: 104 }}>
            <button
              type="button"
              onClick={() => setAdjusting(i)}
              className="relative block w-full overflow-hidden"
              style={{ aspectRatio: "4 / 5", borderRadius: 8, background: "#f2ebe3" }}
              aria-label={`Adjust photo ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt="" draggable={false} style={cropStyle(photoCrop(p))} />
              <span
                className="absolute inset-x-0 bottom-0 py-1 text-[10px] font-bold text-white flex items-center justify-center gap-1"
                style={{ background: "linear-gradient(transparent, rgba(0,0,0,.72))" }}
              >
                <Crop size={11} /> adjust
              </span>
            </button>
            <div className="mt-1.5 grid grid-cols-3 gap-1">
              <MiniBtn label="Move earlier" onClick={() => move(i, -1)} disabled={i === 0}>
                <ChevronUp size={13} />
              </MiniBtn>
              <MiniBtn label="Move later" onClick={() => move(i, 1)} disabled={i === photos.length - 1}>
                <ChevronDown size={13} />
              </MiniBtn>
              <MiniBtn label="Remove photo" onClick={() => onChange(photos.filter((_, j) => j !== i))} danger>
                <Trash2 size={12} />
              </MiniBtn>
            </div>
            <button
              type="button"
              onClick={() => askReplace(i)}
              className="mt-1 w-full text-[10px] font-bold rounded-lg py-1.5"
              style={{ color: ACCENT, background: "rgba(180,68,31,.08)" }}
            >
              change photo
            </button>
          </div>

          {/* caption + its letter */}
          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <Label>Photo {i + 1} · caption</Label>
              <input
                value={p.caption ?? ""}
                onChange={(e) => set(i, { caption: e.target.value.slice(0, MAX_PHOTO_CAPTION_LEN) })}
                placeholder="the first date"
                className="w-full px-3 py-2 rounded-lg bg-muted/40 border border-border/50 focus:outline-none focus:border-orange-400/60"
                style={{ fontSize: 16 }}
              />
            </div>
            <div>
              <Label>
                <span className="inline-flex items-center gap-1">💌 A letter for this photo</span>
              </Label>
              <GrowText
                value={p.note ?? ""}
                onChange={(v) => set(i, { note: v.slice(0, MAX_PHOTO_NOTE_LEN) })}
                placeholder="What do you remember about this moment?"
                minRows={3}
                compact
              />
              <p className="text-[10px] text-right mt-0.5 tabular-nums" style={{ color: MUTED }}>
                {(p.note ?? "").length}/{MAX_PHOTO_NOTE_LEN}
              </p>
            </div>
          </div>
        </div>
      ))}

      {photos.length < MAX_PHOTOS && (
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={busy}
          className="w-full rounded-2xl flex items-center justify-center gap-2 font-bold text-[13px] disabled:opacity-60"
          style={{ minHeight: 56, border: `1.5px dashed ${ACCENT}77`, color: ACCENT, background: "rgba(180,68,31,.04)" }}
        >
          {busy ? <Loader2 size={17} className="animate-spin" /> : <Plus size={17} />}
          {busy ? "adding…" : allDemo ? "add your photos" : `add photos · ${photos.length}/${MAX_PHOTOS}`}
        </button>
      )}

      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (files.length) void addFiles(files);
        }}
      />
      <input
        ref={replaceInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) void replaceFile(f);
        }}
      />

      <PhotoAdjuster
        open={Boolean(current)}
        src={current?.url ?? ""}
        crop={current ? photoCrop(current) : CROP_DEFAULT}
        title={`Frame photo ${(adjusting ?? 0) + 1}`}
        onChange={(c) => adjusting !== null && set(adjusting, { cropX: c.x, cropY: c.y, scale: c.scale })}
        onClose={() => setAdjusting(null)}
        onReplace={adjusting !== null ? () => askReplace(adjusting) : undefined}
      />
    </div>
  );
}

function MiniBtn({
  label, onClick, disabled, danger, children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="grid place-items-center rounded-lg disabled:opacity-25"
      style={{ height: 28, background: "#faf5ef", color: danger ? DANGER : INK, border: `1px solid ${RULE}` }}
    >
      {children}
    </button>
  );
}

/** A textarea that grows with the letter instead of scrolling inside itself. */
function GrowText({
  value, onChange, placeholder, minRows = 6, compact = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  minRows?: number;
  compact?: boolean;
}) {
  const ref = useCallback(
    (el: HTMLTextAreaElement | null) => {
      if (!el) return;
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight + 2}px`;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value],
  );
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={minRows}
      className={compact ? "w-full px-3 py-2 rounded-lg bg-muted/40 border border-border/50 focus:outline-none focus:border-orange-400/60" : INPUT_CLS}
      style={{ ...INPUT_STYLE, resize: "none", lineHeight: 1.5, overflow: "hidden" }}
    />
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   The sheet
   ══════════════════════════════════════════════════════════════════════════ */

export default function EditSheet({
  editMode, setEditMode, mf, updateMf, pagePassword, setPagePassword, onSave, saving, accessToken, notify,
}: EditSheetProps) {
  const open = editMode === "manual";
  const clipCount = mf.segments.filter((s) => s.kind === "clip").length;

  const setSegment = useCallback(
    (index: number, next: Segment) => {
      const segments = mf.segments.slice();
      segments[index] = next;
      updateMf("segments", segments);
    },
    [mf.segments, updateMf],
  );

  const move = useCallback(
    (index: number, delta: number) => {
      const to = index + delta;
      if (to < 0 || to >= mf.segments.length) return;
      const segments = mf.segments.slice();
      [segments[index], segments[to]] = [segments[to], segments[index]];
      updateMf("segments", segments);
    },
    [mf.segments, updateMf],
  );

  const remove = useCallback(
    (index: number) => {
      updateMf("segments", mf.segments.filter((_, i) => i !== index));
    },
    [mf.segments, updateMf],
  );

  const add = useCallback(
    (kind: "voice" | "song" | "clip") => {
      if (mf.segments.length >= MAX_SEGMENTS) return;
      if (kind === "clip" && mf.segments.filter((s) => s.kind === "clip").length >= MAX_CLIPS) return;
      updateMf("segments", [
        ...mf.segments,
        kind === "voice" ? blankVoice() : kind === "clip" ? blankClip() : blankSong(),
      ]);
    },
    [mf.segments, updateMf],
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="ded-sheet"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200]"
          style={{ background: "rgba(26,10,4,.55)", backdropFilter: "blur(4px)" }}
          onClick={() => setEditMode("preview")}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-x-0 bottom-0 mx-auto w-full rounded-t-3xl flex flex-col"
            style={{ background: "#FFFDFB", maxHeight: "92dvh", maxWidth: 640 }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 shrink-0"
              style={{ borderBottom: `1px solid ${RULE}` }}
            >
              <h3 className="text-base font-bold flex items-center gap-2" style={{ color: INK }}>
                <Radio size={17} style={{ color: ACCENT }} /> Build the show
              </h3>
              <button
                type="button"
                onClick={() => setEditMode("preview")}
                aria-label="Close"
                className="grid place-items-center rounded-full"
                style={{ width: 40, height: 40, color: MUTED }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5" style={{ overscrollBehavior: "contain" }}>
              <Section icon={<Radio size={14} />} title="The station" blurb="What lights up in the display.">
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <div>
                    <Label>Station name</Label>
                    <input
                      value={mf.stationName}
                      onChange={(e) => updateMf("stationName", e.target.value.slice(0, 28))}
                      placeholder="RADIO MEERA"
                      className={INPUT_CLS}
                      style={INPUT_STYLE}
                    />
                  </div>
                  <div style={{ width: 108 }}>
                    <Label>Frequency</Label>
                    <input
                      value={mf.stationFrequency}
                      onChange={(e) => updateMf("stationFrequency", e.target.value.slice(0, 6))}
                      placeholder="98.3"
                      inputMode="decimal"
                      className={INPUT_CLS}
                      style={INPUT_STYLE}
                    />
                  </div>
                </div>
                <p className="text-[11px]" style={{ color: MUTED }}>
                  Use the date you met if you like — 14.3 works. The dial finds it either way.
                </p>
              </Section>

              <Section icon={<Users size={14} />} title="Who" blurb="Printed on the request slip.">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>For</Label>
                    <input
                      value={mf.recipientName}
                      onChange={(e) => updateMf("recipientName", e.target.value.slice(0, MAX_NAME_LEN))}
                      placeholder="Meera"
                      className={INPUT_CLS}
                      style={INPUT_STYLE}
                    />
                  </div>
                  <div>
                    <Label>Their city</Label>
                    <input
                      value={mf.recipientCity}
                      onChange={(e) => updateMf("recipientCity", e.target.value.slice(0, MAX_NAME_LEN))}
                      placeholder="Bengaluru"
                      className={INPUT_CLS}
                      style={INPUT_STYLE}
                    />
                  </div>
                  <div>
                    <Label>From</Label>
                    <input
                      value={mf.senderName}
                      onChange={(e) => updateMf("senderName", e.target.value.slice(0, MAX_NAME_LEN))}
                      placeholder="Arjun"
                      className={INPUT_CLS}
                      style={INPUT_STYLE}
                    />
                  </div>
                  <div>
                    <Label>Your city</Label>
                    <input
                      value={mf.senderCity}
                      onChange={(e) => updateMf("senderCity", e.target.value.slice(0, MAX_NAME_LEN))}
                      placeholder="Pune"
                      className={INPUT_CLS}
                      style={INPUT_STYLE}
                    />
                  </div>
                </div>
              </Section>

              <Section
                icon={<Images size={14} />}
                title="Photos & little letters"
                blurb="Frame each photo, and write a note that opens when they tap it on the reel."
                right={<span className="text-[10px] tabular-nums" style={{ color: MUTED }}>{mf.photos.length}/{MAX_PHOTOS}</span>}
              >
                <PhotosEditor photos={mf.photos} onChange={(v) => updateMf("photos", v)} notify={notify} />
              </Section>

              <Section
                icon={<Heart size={14} />}
                title="Love letter"
                blurb="Sealed until they tune in — then it unfolds under the radio."
                right={<span className="text-[10px] tabular-nums" style={{ color: MUTED }}>{mf.letter.length}/{MAX_LETTER_LEN}</span>}
              >
                <GrowText
                  value={mf.letter}
                  onChange={(v) => updateMf("letter", v.slice(0, MAX_LETTER_LEN))}
                  placeholder={"Meera,\n\nI never know how to say these things out loud, so I built you a radio instead…"}
                />
              </Section>

              <Section
                icon={<Music4 size={14} />}
                title="The running order"
                blurb="Segments play in order. Your voice between the songs is the gift."
                right={
                  <span className="text-[10px] tabular-nums" style={{ color: MUTED }}>
                    {mf.segments.length}/{MAX_SEGMENTS}
                  </span>
                }
              >
                {mf.segments.map((seg, i) => (
                  <div key={i} className="rounded-xl p-3" style={{ background: "#fff", border: `1px solid ${RULE}` }}>
                    <div className="flex items-center gap-2 mb-2.5">
                      <span
                        className="grid place-items-center rounded-lg shrink-0"
                        style={{
                          width: 26, height: 26,
                          background: seg.kind === "voice" ? "rgba(180,68,31,.12)" : seg.kind === "clip" ? "rgba(109,59,180,.12)" : "rgba(27,90,122,.1)",
                          color: seg.kind === "voice" ? ACCENT : seg.kind === "clip" ? "#6d3bb4" : "#1B5A7A",
                        }}
                      >
                        {seg.kind === "voice" ? <Mic size={13} /> : seg.kind === "clip" ? <Film size={13} /> : <Music4 size={13} />}
                      </span>
                      <span className="text-[12px] font-bold flex-1" style={{ color: INK }}>
                        {i + 1}. {seg.kind === "voice" ? "Voice / audio" : seg.kind === "clip" ? "Your video" : "Song"}
                      </span>
                      <button
                        type="button" aria-label="Move up" onClick={() => move(i, -1)} disabled={i === 0}
                        className="grid place-items-center rounded-lg disabled:opacity-25"
                        style={{ width: 34, height: 34, color: MUTED }}
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        type="button" aria-label="Move down" onClick={() => move(i, 1)}
                        disabled={i === mf.segments.length - 1}
                        className="grid place-items-center rounded-lg disabled:opacity-25"
                        style={{ width: 34, height: 34, color: MUTED }}
                      >
                        <ChevronDown size={16} />
                      </button>
                      <button
                        type="button" aria-label="Delete segment" onClick={() => remove(i)}
                        className="grid place-items-center rounded-lg"
                        style={{ width: 34, height: 34, color: DANGER }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {seg.kind === "voice" ? (
                      <VoiceRow seg={seg} onChange={(next) => setSegment(i, next)} />
                    ) : seg.kind === "clip" ? (
                      <ClipRow seg={seg} onChange={(next) => setSegment(i, next)} accessToken={accessToken} />
                    ) : (
                      <SongRow seg={seg} index={i} onChange={(next) => setSegment(i, next)} />
                    )}
                  </div>
                ))}

                <div className="flex items-center gap-2">
                  <button
                    type="button" onClick={() => add("voice")} disabled={mf.segments.length >= MAX_SEGMENTS}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl text-[12px] font-bold disabled:opacity-40"
                    style={{ minHeight: TAP_TARGET_PX, color: ACCENT, border: `1px dashed ${ACCENT}66` }}
                  >
                    <Plus size={14} /> voice
                  </button>
                  <button
                    type="button" onClick={() => add("song")} disabled={mf.segments.length >= MAX_SEGMENTS}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl text-[12px] font-bold disabled:opacity-40"
                    style={{ minHeight: TAP_TARGET_PX, color: "#1B5A7A", border: "1px dashed #1B5A7A66" }}
                  >
                    <Plus size={14} /> song
                  </button>
                  <button
                    type="button" onClick={() => add("clip")}
                    disabled={mf.segments.length >= MAX_SEGMENTS || clipCount >= MAX_CLIPS}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl text-[12px] font-bold disabled:opacity-40"
                    style={{ minHeight: TAP_TARGET_PX, color: "#6d3bb4", border: "1px dashed #6d3bb466" }}
                  >
                    <Plus size={14} /> video {clipCount}/{MAX_CLIPS}
                  </button>
                </div>
              </Section>

              <Section icon={<ScrollText size={14} />} title="Sign-off" blurb="The last thing before the static.">
                <textarea
                  value={mf.signOff}
                  onChange={(e) => updateMf("signOff", e.target.value.slice(0, MAX_SIGNOFF_LEN))}
                  placeholder="same frequency, same time, whenever you want."
                  rows={2}
                  className={INPUT_CLS}
                  style={INPUT_STYLE}
                />
              </Section>

              <Section icon={<Lock size={14} />} title="Password" blurb="Optional. Only they get in.">
                <input
                  type="text"
                  value={pagePassword}
                  onChange={(e) => setPagePassword(e.target.value)}
                  placeholder="leave blank for no lock"
                  className={INPUT_CLS}
                  style={INPUT_STYLE}
                  autoComplete="off"
                />
              </Section>
            </div>

            {/* Footer */}
            <div
              className="px-4 py-3 shrink-0"
              style={{ borderTop: `1px solid ${RULE}`, paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
            >
              <button
                type="button"
                onClick={onSave}
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl font-bold text-white text-[14px] disabled:opacity-60"
                style={{ minHeight: TAP_TARGET_PX, background: ACCENT_GRAD }}
              >
                <Eye size={16} /> Save & tune in
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
