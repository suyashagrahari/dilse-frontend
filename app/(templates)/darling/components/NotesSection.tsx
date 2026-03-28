"use client";

import { memo, useState, useCallback, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Heart, X } from "lucide-react";
import MiniAudioPlayer from "./MiniAudioPlayer";
import { API_URL } from "@/lib/config";

const ROSE = "#ff3d6b";
const ROSE_BORDER = "rgba(255, 61, 107, 0.18)";
const DARK_CARD = "rgba(255,255,255,0.06)";
const GRAD_LINE = "linear-gradient(135deg, #ff3d6b 0%, #a855f7 100%)";
const CURSIVE = "system-ui, sans-serif";

const MOODS = [
  { emoji: "💕", label: "Love" }, { emoji: "🥺", label: "Miss You" }, { emoji: "😊", label: "Happy" },
  { emoji: "🌙", label: "Goodnight" }, { emoji: "☀️", label: "Morning" }, { emoji: "🤗", label: "Hug" },
];

const TEMPLATES = [
  "You make every day brighter just by being in it 💕",
  "I fall in love with you more every single day 🌹",
  "You're my favorite person in the whole world ✨",
  "Distance means nothing when someone means everything 💌",
  "I love you to the moon and back, always 🌙",
  "You're the reason I smile for no reason 😊",
  "Every heartbeat whispers your name 💗",
  "Home is wherever I'm with you 🏡",
];

export interface ServerNote {
  from: string;
  message: string;
  mood: string;
  mediaUrl?: string;
  mediaType?: "audio" | "image" | "";
  savedAt?: string;
}

interface Note {
  id: number;
  from: string;
  message: string;
  mood: string;
  mediaUrl?: string;
  mediaType?: "audio" | "image" | "";
  savedAt?: string;
}

function formatTime(iso?: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const now = Date.now();
    const diff = now - d.getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    if (days === 1) return "yesterday";
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch { return ""; }
}

// ── Note Card ────────────────────────────────────────────────────────────────
const NoteCard = memo(function NoteCard({ note, onSelect }: { note: Note; onSelect: (n: Note) => void }) {
  const handleClick = useCallback(() => onSelect(note), [onSelect, note]);
  return (
    <button
      onClick={handleClick}
      style={{
        width: "100%", textAlign: "left", borderRadius: 16,
        border: `1px solid ${ROSE_BORDER}`,
        background: DARK_CARD,
        padding: "14px 16px",
        boxShadow: "0 3px 12px rgba(0,0,0,0.28)",
        cursor: "pointer", transition: "all 0.15s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "rgba(255,61,107,0.14)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
          }}>{note.mood}</div>
          <span style={{ fontFamily: CURSIVE, fontWeight: 700, fontSize: 13, color: ROSE }}>{note.from}</span>
        </div>
        <span style={{ fontFamily: CURSIVE, fontSize: 10, color: "rgba(255,61,107,0.45)" }}>{formatTime(note.savedAt)}</span>
      </div>
      <p style={{
        fontFamily: CURSIVE, fontSize: 12, color: "#fff", lineHeight: 1.6,
        overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical", margin: 0,
      }}>{note.message}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
        {note.mediaType === "audio" && <span style={{ fontFamily: CURSIVE, fontSize: 10, color: "rgba(255,61,107,0.55)" }}>🎤 Voice note</span>}
        {note.mediaType === "image" && <span style={{ fontFamily: CURSIVE, fontSize: 10, color: "rgba(255,61,107,0.55)" }}>📸 Photo</span>}
        <span style={{ fontFamily: CURSIVE, fontSize: 11, fontWeight: 600, color: ROSE, marginLeft: "auto" }}>
          Read →
        </span>
      </div>
    </button>
  );
});

// ── Note Modal ───────────────────────────────────────────────────────────────
const NoteModal = memo(function NoteModal({ note, onClose }: { note: Note; onClose: () => void }) {
  const stopProp = useCallback((e: React.MouseEvent) => e.stopPropagation(), []);
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        background: "rgba(4, 2, 10, 0.72)", backdropFilter: "blur(8px)",
      }}
    >
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 10 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        onClick={stopProp}
        style={{
          width: "100%", maxWidth: 360,
          background: "rgba(18, 8, 28, 0.97)",
          borderRadius: 24,
          boxShadow: "0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,61,107,0.18)",
          border: `1px solid ${ROSE_BORDER}`,
          overflow: "hidden",
        }}
      >
        <div style={{
          height: 72, display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative",
          background: "linear-gradient(135deg, rgba(255,61,107,0.18), rgba(160,100,65,0.12), rgba(255,61,107,0.14))",
        }}>
          <span style={{ fontSize: 32 }}>{note.mood}</span>
          <button onClick={onClose} style={{
            position: "absolute", top: 10, right: 10,
            width: 28, height: 28, borderRadius: "50%",
            background: "rgba(255,255,255,0.06)", border: `1px solid ${ROSE_BORDER}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
          }}>
            <X size={12} color={ROSE} />
          </button>
        </div>

        <div style={{ padding: "16px 24px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontFamily: CURSIVE, fontSize: 14, fontWeight: 700, color: ROSE }}>{note.from}</span>
            <span style={{
              fontFamily: CURSIVE, fontSize: 10, color: "rgba(255,61,107,0.60)",
              background: "rgba(255,61,107,0.10)", padding: "2px 10px", borderRadius: 999,
            }}>{formatTime(note.savedAt)}</span>
          </div>

          <div style={{ height: 1, background: ROSE_BORDER, margin: "0 0 12px" }} />

          <p style={{ fontFamily: CURSIVE, fontSize: 14, color: "#fff", lineHeight: 1.75, fontStyle: "italic", margin: "0 0 14px" }}>
            &ldquo;{note.message}&rdquo;
          </p>

          {note.mediaType === "audio" && note.mediaUrl && (
            <div style={{ marginBottom: 14 }}>
              <MiniAudioPlayer src={note.mediaUrl} accentColor={ROSE} bgColor="rgba(255,61,107,0.06)" borderColor={ROSE_BORDER} />
            </div>
          )}

          {note.mediaType === "image" && note.mediaUrl && (
            <div style={{ borderRadius: 12, overflow: "hidden", marginBottom: 14 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={note.mediaUrl} alt="" style={{ width: "100%", maxHeight: 200, objectFit: "cover", display: "block" }} />
            </div>
          )}

          <div style={{ height: 1, background: ROSE_BORDER, margin: "0 0 14px" }} />

          <button onClick={onClose}
            style={{
              width: "100%", padding: "10px 0", borderRadius: 12,
              border: `1px solid ${ROSE_BORDER}`,
              background: "rgba(255,61,107,0.08)",
              fontFamily: CURSIVE, fontSize: 12, fontWeight: 600, color: ROSE,
              cursor: "pointer",
            }}>
            Close 💕
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
});

const MoodButton = memo(function MoodButton({
  emoji, active, onSelect, compact,
}: { emoji: string; active: boolean; onSelect: (e: string) => void; compact?: boolean }) {
  const handleClick = useCallback(() => onSelect(emoji), [onSelect, emoji]);
  const s = compact ? 30 : 36;
  return (
    <button onClick={handleClick}
      style={{
        width: s, height: s, borderRadius: compact ? 8 : 10, fontSize: compact ? 14 : 16,
        display: "flex", alignItems: "center", justifyContent: "center",
        border: active ? `1.5px solid rgba(255,61,107,0.50)` : `1px solid ${ROSE_BORDER}`,
        background: active ? "rgba(255,61,107,0.16)" : "rgba(255,255,255,0.04)",
        transform: active ? "scale(1.06)" : "scale(1)",
        cursor: "pointer", transition: "all 0.15s",
      }}
    >{emoji}</button>
  );
});

interface NotesSectionProps {
  shareId?: string | null;
  titleInTopBar?: boolean;
}

export default memo(function NotesSection({ shareId, titleInTopBar = false }: NotesSectionProps = {}) {
  const [notes, setNotes]       = useState<Note[]>([]);
  const [loading, setLoading]   = useState(!!shareId);
  const [from, setFrom]         = useState("");
  const [message, setMessage]   = useState("");
  const [mood, setMood]         = useState("💕");
  const [sending, setSending]   = useState(false);
  const [sent, setSent]         = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  // Voice recording
  const [recording, setRecording]         = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [voiceUrl, setVoiceUrl]           = useState("");
  const recorderRef      = useRef<MediaRecorder | null>(null);
  const recordChunksRef  = useRef<Blob[]>([]);
  const recordTimerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioFileInputRef = useRef<HTMLInputElement | null>(null);

  // Photo
  const [photoUrl, setPhotoUrl]         = useState("");
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  // ── Load notes from server on mount ──────────────────────────────────────
  useEffect(() => {
    if (!shareId) return;
    setLoading(true);
    fetch(`${API_URL}/darling-pages/share/${shareId}`)
      .then((r) => r.json())
      .then((result) => {
        if (!result.success || !result.data) return;
        const raw: ServerNote[] = Array.isArray(result.data.notes) ? result.data.notes : [];
        setNotes(raw.map((n, i) => ({
          id: -(i + 1),
          from: n.from,
          message: n.message,
          mood: n.mood,
          mediaUrl: n.mediaUrl || undefined,
          mediaType: (n.mediaType as Note["mediaType"]) || undefined,
          savedAt: n.savedAt,
        })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [shareId]);

  // ── Voice recording ───────────────────────────────────────────────────────
  const loadAudioFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => setVoiceUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const startRecording = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) { audioFileInputRef.current?.click(); return; }
    let stream: MediaStream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
    catch { audioFileInputRef.current?.click(); return; }

    const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];
    let mimeType = "";
    for (const c of candidates) {
      try { if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(c)) { mimeType = c; break; } } catch { /* */ }
    }
    let recorder: MediaRecorder;
    try { recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream); }
    catch { stream.getTracks().forEach((t) => t.stop()); audioFileInputRef.current?.click(); return; }

    const effectiveMime = recorder.mimeType || mimeType || "audio/webm";
    recordChunksRef.current = [];
    recorder.ondataavailable = (e) => { if (e.data.size > 0) recordChunksRef.current.push(e.data); };
    recorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(recordChunksRef.current, { type: effectiveMime });
      const reader = new FileReader();
      reader.onload = (ev) => setVoiceUrl(ev.target?.result as string);
      reader.readAsDataURL(blob);
    };
    recorder.start(200);
    recorderRef.current = recorder;
    setRecording(true); setRecordSeconds(0);
    recordTimerRef.current = setInterval(() => setRecordSeconds((s) => s + 1), 1000);
  }, []);

  const stopRecording = useCallback(() => {
    recorderRef.current?.stop(); recorderRef.current = null;
    setRecording(false);
    if (recordTimerRef.current) { clearInterval(recordTimerRef.current); recordTimerRef.current = null; }
  }, []);

  // ── Send note ─────────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    if (!message.trim()) return;
    setSending(true);

    const mediaPayload = voiceUrl || photoUrl || undefined;
    const mediaTypePayload = voiceUrl ? "audio" : photoUrl ? "image" : undefined;

    // Optimistic update
    const tempNote: Note = {
      id: Date.now(),
      from: from.trim() || "Anonymous 💕",
      message: message.trim(),
      mood,
      mediaUrl: mediaPayload,
      mediaType: mediaTypePayload,
      savedAt: new Date().toISOString(),
    };
    setNotes((prev) => [tempNote, ...prev]);
    setMessage(""); setFrom(""); setVoiceUrl(""); setPhotoUrl("");
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setSending(false);

    // Persist to server
    if (shareId) {
      const body: Record<string, string> = {
        from: tempNote.from,
        message: tempNote.message,
        mood: tempNote.mood,
      };
      if (mediaPayload) { body.mediaUrl = mediaPayload; body.mediaType = mediaTypePayload!; }

      fetch(`${API_URL}/darling-pages/share/${shareId}/note`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => r.json()).then((result) => {
        // If server returned an S3 URL, update the note in state
        if (result?.data?.mediaUrl && result.data.mediaUrl !== mediaPayload) {
          setNotes((prev) => prev.map((n) =>
            n.id === tempNote.id ? { ...n, mediaUrl: result.data.mediaUrl } : n
          ));
        }
      }).catch(() => {});
    }
  }, [from, message, mood, voiceUrl, photoUrl, shareId]);

  const useTemplate = useCallback(() => {
    setMessage(TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)]);
  }, []);

  const noteCards = useMemo(() =>
    notes.map((note) => <NoteCard key={note.id} note={note} onSelect={setSelectedNote} />),
    [notes],
  );

  const inputStyle = {
    width: "100%", background: "rgba(255,255,255,0.04)",
    border: `1px solid ${ROSE_BORDER}`, borderRadius: titleInTopBar ? 10 : 12,
    padding: titleInTopBar ? "8px 10px" : "10px 12px",
    fontFamily: CURSIVE, fontSize: titleInTopBar ? 12.5 : 13, color: "#fff",
    outline: "none", transition: "all 0.15s",
  } as React.CSSProperties;

  const labelStyle = {
    fontFamily: CURSIVE, fontSize: 10, fontWeight: 700,
    color: "rgba(255,61,107,0.55)", letterSpacing: "0.08em",
    textTransform: "uppercase" as const, display: "block", marginBottom: 4,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        height: "100svh",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        overflowX: "hidden",
        position: "relative",
        zIndex: 10,
        background: "#0d0b18",
      }}
    >
      <style>{`@keyframes drl-rec-dot{0%,100%{opacity:1}50%{opacity:0.25}}`}</style>

      <div
        style={{
          flex: 1,
          padding: titleInTopBar
            ? "max(46px, calc(env(safe-area-inset-top, 0px) + 34px)) 12px 92px"
            : "28px 16px 96px",
        }}
        className="lg:pt-10 lg:max-w-5xl lg:mx-auto lg:w-full lg:px-8"
      >
        {titleInTopBar ? (
          <>
            <div
              className="lg:hidden"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                width: "100%",
                marginBottom: 14,
                paddingLeft: 16,
                paddingRight: 16,
                boxSizing: "border-box",
              }}
            >
              <p
                style={{
                  fontFamily: CURSIVE,
                  fontSize: 12,
                  color: "rgba(255,255,255,0.55)",
                  margin: 0,
                  lineHeight: 1.45,
                  textAlign: "center",
                  maxWidth: 300,
                  width: "100%",
                }}
              >
                Shared notes — everyone can read them ♡
              </p>
              <div
                aria-hidden
                style={{
                  height: 3,
                  width: 72,
                  marginTop: 10,
                  borderRadius: 999,
                  background: GRAD_LINE,
                  opacity: 0.7,
                  flexShrink: 0,
                }}
              />
            </div>
            <div className="hidden lg:block" style={{ textAlign: "center", marginBottom: 20 }}>
              <h2 style={{
                fontFamily: CURSIVE, fontSize: "clamp(22px, 5.5vw, 32px)",
                fontWeight: 800, margin: 0,
                background: GRAD_LINE,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                Love Notes 💌
              </h2>
              <p style={{ fontFamily: CURSIVE, fontSize: 13, color: "rgba(255,61,107,0.55)", marginTop: 4 }}>
                Shared notes — everyone who opens this page can read them ♡
              </p>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <h2 style={{
              fontFamily: CURSIVE, fontSize: "clamp(22px, 5.5vw, 32px)",
              fontWeight: 800, margin: 0,
              background: GRAD_LINE,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              Love Notes 💌
            </h2>
            <p style={{ fontFamily: CURSIVE, fontSize: 13, color: "rgba(255,61,107,0.55)", marginTop: 4 }}>
              Shared notes — everyone who opens this page can read them ♡
            </p>
          </div>
        )}

        <div className={`flex flex-col lg:grid lg:grid-cols-2 lg:gap-8 ${titleInTopBar ? "gap-3" : "gap-4"}`}>
          {/* Write a note */}
          <div style={{
            borderRadius: titleInTopBar ? 16 : 20,
            border: `1px solid ${ROSE_BORDER}`,
            background: DARK_CARD,
            padding: titleInTopBar ? 12 : 16,
            boxShadow: "0 4px 20px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.04)",
          }} className="lg:p-6">
            <p style={{
              fontFamily: CURSIVE,
              fontSize: titleInTopBar ? 12 : 13,
              fontWeight: 700,
              color: ROSE,
              marginBottom: titleInTopBar ? 10 : 14,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}>
              <Send size={titleInTopBar ? 11 : 12} color={ROSE} /> Write a Note
            </p>

            <div style={{ marginBottom: titleInTopBar ? 8 : 12 }}>
              <label style={labelStyle}>From (optional)</label>
              <input
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="Your name or nickname"
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.border = `1.5px solid rgba(255,61,107,0.45)`; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                onBlur={(e) => { e.currentTarget.style.border = `1px solid ${ROSE_BORDER}`; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
              />
            </div>

            <div style={{ marginBottom: titleInTopBar ? 8 : 12 }}>
              <label style={labelStyle}>Mood</label>
              <div style={{ display: "flex", gap: titleInTopBar ? 5 : 6, flexWrap: "wrap" }}>
                {MOODS.map((m) => (
                  <MoodButton key={m.emoji} emoji={m.emoji} active={mood === m.emoji} onSelect={setMood} compact={titleInTopBar} />
                ))}
              </div>
            </div>

            <div style={{ marginBottom: titleInTopBar ? 6 : 8 }}>
              <label style={labelStyle}>Your Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Pour your heart out here..."
                style={{ ...inputStyle, resize: "none" }}
                onFocus={(e) => { e.currentTarget.style.border = `1.5px solid rgba(255,61,107,0.45)`; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                onBlur={(e) => { e.currentTarget.style.border = `1px solid ${ROSE_BORDER}`; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
              />
            </div>

            {/* Voice + Photo row */}
            <div style={{ display: "flex", gap: titleInTopBar ? 6 : 8, marginBottom: titleInTopBar ? 8 : 10 }}>
              {/* Voice */}
              {voiceUrl ? (
                <div style={{ flex: 1 }}>
                  <MiniAudioPlayer src={voiceUrl} accentColor={ROSE} bgColor="rgba(255,61,107,0.06)" borderColor={ROSE_BORDER} onRemove={() => setVoiceUrl("")} />
                </div>
              ) : recording ? (
                <button onClick={stopRecording} style={{
                  flex: 1, padding: "9px 14px", borderRadius: 10,
                  border: "1.5px solid rgba(200,60,60,0.40)", background: "rgba(220,60,60,0.08)",
                  cursor: "pointer", fontFamily: CURSIVE, fontSize: 12, color: "rgb(220,120,110)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: "50%", background: "rgb(220,80,70)",
                    display: "inline-block", flexShrink: 0,
                    animation: "drl-rec-dot 1s ease-in-out infinite",
                  }} />
                  {String(Math.floor(recordSeconds / 60)).padStart(2, "0")}:{String(recordSeconds % 60).padStart(2, "0")} · Stop
                </button>
              ) : (
                <button onClick={startRecording} style={{
                  flex: 1, padding: "9px 0", borderRadius: 10,
                  border: "1.5px dashed rgba(255,61,107,0.35)", background: "rgba(255,61,107,0.05)",
                  cursor: "pointer", fontFamily: CURSIVE, fontSize: 12, color: ROSE,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                }}>
                  🎤 Voice note
                </button>
              )}

              {/* Photo */}
              {photoUrl ? (
                <div style={{ position: "relative" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoUrl} alt="" style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover" }} />
                  <button onClick={() => setPhotoUrl("")} style={{
                    position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: "50%",
                    background: "rgba(180,60,50,0.85)", border: "none", cursor: "pointer",
                    fontFamily: CURSIVE, fontSize: 10, color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>×</button>
                </div>
              ) : (
                <button
                  onClick={() => photoInputRef.current?.click()}
                  style={{
                    padding: "8px 12px", borderRadius: 10,
                    border: "1.5px dashed rgba(255,61,107,0.35)", background: "rgba(255,61,107,0.05)",
                    cursor: "pointer", fontFamily: CURSIVE, fontSize: 12, color: ROSE,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>📸</button>
              )}
            </div>

            {/* Hidden inputs */}
            <input ref={audioFileInputRef} type="file" accept="audio/*" style={{ display: "none" }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) loadAudioFile(f); e.target.value = ""; }} />
            <input ref={photoInputRef} type="file" accept="image/*" style={{ display: "none" }}
              onChange={async (e) => {
                const f = e.target.files?.[0]; if (!f) return;
                const canvas = document.createElement("canvas");
                const img = new window.Image();
                const url = URL.createObjectURL(f);
                img.onload = () => {
                  const ratio = Math.min(600 / img.width, 600 / img.height, 1);
                  canvas.width = img.width * ratio; canvas.height = img.height * ratio;
                  canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
                  setPhotoUrl(canvas.toDataURL("image/jpeg", 0.80));
                  URL.revokeObjectURL(url);
                };
                img.src = url; e.target.value = "";
              }} />

            <button onClick={useTemplate}
              style={{ fontFamily: CURSIVE, fontSize: 10.5, color: ROSE, background: "none", border: "none", cursor: "pointer", marginBottom: titleInTopBar ? 8 : 12, fontWeight: 600 }}>
              ✨ Use a love template
            </button>

            <button onClick={handleSend} disabled={!message.trim() || sending}
              style={{
                width: "100%", padding: titleInTopBar ? "9px 0" : "11px 0", borderRadius: titleInTopBar ? 10 : 12, border: "none",
                background: message.trim()
                  ? "linear-gradient(135deg, #ff3d6b 0%, #a855f7 100%)"
                  : "rgba(255,61,107,0.12)",
                color: message.trim() ? "rgba(255,255,255,0.95)" : "rgba(255,61,107,0.35)",
                fontFamily: CURSIVE, fontSize: titleInTopBar ? 12 : 13, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                cursor: message.trim() ? "pointer" : "not-allowed",
                boxShadow: message.trim() ? "0 4px 14px rgba(255,61,107,0.28)" : "none",
              }}>
              <Heart size={12} style={{ fill: message.trim() ? "rgba(255,255,255,0.95)" : "rgba(255,61,107,0.35)", color: "inherit" }} />
              {sent ? "Note shared! 💕" : sending ? "Sending..." : "Share Note 💌"}
            </button>

            {sent && (
              <p style={{ fontFamily: CURSIVE, textAlign: "center", fontSize: 11, color: ROSE, fontWeight: 600, marginTop: 8 }}>
                Everyone who opens this page can now see it! ✨
              </p>
            )}
          </div>

          {/* Notes list */}
          <div>
            <p style={{
              fontFamily: CURSIVE, fontSize: 10, fontWeight: 700,
              color: "rgba(255,61,107,0.55)", letterSpacing: "0.08em",
              textTransform: "uppercase", marginBottom: 10,
            }}>
              Love Notes · {notes.length}
            </p>

            {loading ? (
              <div style={{ textAlign: "center", padding: "32px 16px" }}>
                <p style={{ fontFamily: CURSIVE, fontSize: 14, color: "rgba(255,61,107,0.45)", margin: 0 }}>loading notes...</p>
              </div>
            ) : notes.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 16px" }}>
                <span style={{ fontSize: 36, display: "block", marginBottom: 10 }}>💌</span>
                <p style={{ fontFamily: CURSIVE, fontSize: 14, fontWeight: 700, color: ROSE, margin: "0 0 6px" }}>
                  No notes yet
                </p>
                <p style={{ fontFamily: CURSIVE, fontSize: 12, color: "rgba(255,61,107,0.55)", margin: 0, lineHeight: 1.6 }}>
                  Be the first to leave a love note ♡
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "60vh", overflowY: "auto" }}
                className="no-scrollbar"
              >
                {noteCards}
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedNote && <NoteModal note={selectedNote} onClose={() => setSelectedNote(null)} />}
      </AnimatePresence>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </motion.div>
  );
});
