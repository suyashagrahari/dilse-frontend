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

import React, { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X, Eye, Lock, Plus, Trash2, ChevronUp, ChevronDown, Mic, Music4, Radio, Users,
  ScrollText, Check, AlertTriangle, Type,
} from "lucide-react";

import { parseYouTubeId, TAP_TARGET_PX, type Segment, type SongSegment, type VoiceSegment } from "./types";
import {
  MAX_SEGMENTS, MAX_NAME_LEN, MAX_CAPTION_LEN, MAX_DEDICATION_LEN, MAX_SIGNOFF_LEN,
  blankSong, blankVoice, type DedicationData, type EditMode,
} from "./showData";
import Booth, { type Recording } from "./Booth";

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

  return (
    <div className="space-y-2.5">
      <div>
        <Label>YouTube link</Label>
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
            voice recorded · {Math.round(seg.durationMs / 1000)}s
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
        <button
          type="button"
          onClick={() => setShowBooth(true)}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl font-bold text-[13px] text-white"
          style={{ minHeight: TAP_TARGET_PX, background: ACCENT_GRAD }}
        >
          <Mic size={15} /> record your voice
        </button>
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
   The sheet
   ══════════════════════════════════════════════════════════════════════════ */

export default function EditSheet({
  editMode, setEditMode, mf, updateMf, pagePassword, setPagePassword, onSave, saving,
}: EditSheetProps) {
  const open = editMode === "manual";

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
    (kind: "voice" | "song") => {
      if (mf.segments.length >= MAX_SEGMENTS) return;
      updateMf("segments", [...mf.segments, kind === "voice" ? blankVoice() : blankSong()]);
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
            className="absolute inset-x-0 bottom-0 rounded-t-3xl flex flex-col"
            style={{ background: "#FFFDFB", maxHeight: "92dvh" }}
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
                          background: seg.kind === "voice" ? "rgba(180,68,31,.12)" : "rgba(27,90,122,.1)",
                          color: seg.kind === "voice" ? ACCENT : "#1B5A7A",
                        }}
                      >
                        {seg.kind === "voice" ? <Mic size={13} /> : <Music4 size={13} />}
                      </span>
                      <span className="text-[12px] font-bold flex-1" style={{ color: INK }}>
                        {i + 1}. {seg.kind === "voice" ? "Voice" : "Song"}
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
