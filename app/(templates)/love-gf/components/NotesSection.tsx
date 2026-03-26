"use client";

import { memo, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Heart, X } from "lucide-react";

const WARM = "rgb(108, 74, 46)";
const WARM_BORDER = "rgba(158, 126, 97, 0.22)";
const CREAM_CARD = "rgba(250, 248, 242, 0.90)";
const CURSIVE = "'Dancing Script', 'Brush Script MT', cursive";

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

interface Note { id: number; from: string; message: string; mood: string; time: string; }

const DEFAULT_NOTES: Note[] = [
  { id: 1, from: "Your Love", message: "Good morning beautiful! You were in my dreams last night 🌅", mood: "☀️", time: "8:30 AM" },
  { id: 2, from: "Secret Admirer", message: "You make my heart do the most embarrassing things 💕", mood: "💕", time: "2:15 PM" },
  { id: 3, from: "Your Sunshine", message: "Can't stop thinking about you. You're my everything 🌙", mood: "🥺", time: "11:42 PM" },
];

const NoteCard = memo(function NoteCard({ note, onSelect }: { note: Note; onSelect: (n: Note) => void }) {
  const handleClick = useCallback(() => onSelect(note), [onSelect, note]);
  return (
    <button
      onClick={handleClick}
      style={{
        width: "100%", textAlign: "left", borderRadius: 16,
        border: `1px solid ${WARM_BORDER}`,
        background: CREAM_CARD,
        padding: "14px 16px",
        boxShadow: "0 3px 12px rgba(80,50,20,0.09)",
        cursor: "pointer", transition: "all 0.15s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "rgba(158,126,97,0.14)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14,
          }}>{note.mood}</div>
          <span style={{ fontFamily: CURSIVE, fontWeight: 700, fontSize: 13, color: WARM }}>{note.from}</span>
        </div>
        <span style={{ fontFamily: CURSIVE, fontSize: 10, color: "rgba(108,74,46,0.45)" }}>{note.time}</span>
      </div>
      <p style={{
        fontFamily: CURSIVE, fontSize: 12, color: "rgb(90,60,35)", lineHeight: 1.6,
        overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical", margin: 0,
      }}>{note.message}</p>
      <span style={{ fontFamily: CURSIVE, fontSize: 11, fontWeight: 600, color: WARM, marginTop: 6, display: "inline-block" }}>
        Read full note →
      </span>
    </button>
  );
});

const NoteModal = memo(function NoteModal({ note, onClose }: { note: Note; onClose: () => void }) {
  const stopProp = useCallback((e: React.MouseEvent) => e.stopPropagation(), []);
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        background: "rgba(40,22,8,0.50)", backdropFilter: "blur(8px)",
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
          background: CREAM_CARD,
          borderRadius: 24,
          boxShadow: "0 30px 80px rgba(40,22,8,0.30), 0 0 0 1px rgba(158,126,97,0.18)",
          border: `1px solid ${WARM_BORDER}`,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          height: 80, display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative",
          background: "linear-gradient(135deg, rgba(220,190,160,0.50), rgba(240,220,190,0.40), rgba(210,185,165,0.45))",
        }}>
          <span style={{ fontSize: 36 }}>{note.mood}</span>
          <button onClick={onClose} style={{
            position: "absolute", top: 12, right: 12,
            width: 28, height: 28, borderRadius: "50%",
            background: "rgba(250,248,242,0.75)", border: `1px solid ${WARM_BORDER}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", boxShadow: "0 2px 6px rgba(80,50,20,0.12)",
          }}>
            <X size={12} color={WARM} />
          </button>
        </div>

        <div style={{ padding: "16px 24px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 30, height: 30, borderRadius: "50%",
                background: "rgba(158,126,97,0.14)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
              }}>{note.mood}</div>
              <p style={{ fontFamily: CURSIVE, fontSize: 14, fontWeight: 700, color: WARM, margin: 0 }}>{note.from}</p>
            </div>
            <span style={{
              fontFamily: CURSIVE, fontSize: 10, color: "rgba(108,74,46,0.60)",
              background: "rgba(158,126,97,0.12)", padding: "2px 10px", borderRadius: 999,
            }}>{note.time}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ height: 1, flex: 1, background: WARM_BORDER }} />
            <span style={{ fontFamily: CURSIVE, fontSize: 12, color: WARM, opacity: 0.6 }}>♡</span>
            <div style={{ height: 1, flex: 1, background: WARM_BORDER }} />
          </div>

          <p style={{ fontFamily: CURSIVE, fontSize: 14, color: "rgb(90,60,35)", lineHeight: 1.75, fontStyle: "italic" }}>
            &ldquo;{note.message}&rdquo;
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "12px 0" }}>
            <div style={{ height: 1, flex: 1, background: WARM_BORDER }} />
            <span style={{ fontFamily: CURSIVE, fontSize: 12, color: WARM, opacity: 0.6 }}>♡</span>
            <div style={{ height: 1, flex: 1, background: WARM_BORDER }} />
          </div>
        </div>

        <div style={{ padding: "0 24px 20px", textAlign: "center" }}>
          <button onClick={onClose}
            style={{
              padding: "10px 24px", borderRadius: 12,
              border: `1px solid ${WARM_BORDER}`,
              background: "rgba(158,126,97,0.08)",
              fontFamily: CURSIVE, fontSize: 12, fontWeight: 600, color: WARM,
              cursor: "pointer", transition: "all 0.15s",
            }}>
            Close 💕
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
});

const MoodButton = memo(function MoodButton({ emoji, active, onSelect }: { emoji: string; active: boolean; onSelect: (e: string) => void }) {
  const handleClick = useCallback(() => onSelect(emoji), [onSelect, emoji]);
  return (
    <button onClick={handleClick}
      style={{
        width: 36, height: 36, borderRadius: 10,
        fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
        border: active ? `1.5px solid rgba(158,126,97,0.50)` : `1px solid ${WARM_BORDER}`,
        background: active ? "rgba(158,126,97,0.16)" : "rgba(250,248,242,0.60)",
        transform: active ? "scale(1.08)" : "scale(1)",
        boxShadow: active ? "0 2px 8px rgba(80,50,20,0.12)" : "none",
        cursor: "pointer", transition: "all 0.15s",
      }}
    >{emoji}</button>
  );
});

export default memo(function NotesSection() {
  const [from, setFrom] = useState("");
  const [message, setMessage] = useState("");
  const [mood, setMood] = useState("💕");
  const [notes, setNotes] = useState<Note[]>(DEFAULT_NOTES);
  const [sent, setSent] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const handleSend = useCallback(() => {
    if (!message.trim()) return;
    const newNote: Note = {
      id: Date.now(),
      from: from.trim() || "Anonymous 💕",
      message: message.trim(),
      mood,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setNotes((n) => [newNote, ...n]);
    setMessage(""); setFrom("");
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  }, [from, message, mood]);

  const useTemplate = useCallback(() => {
    setMessage(TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)]);
  }, []);

  const closeModal = useCallback(() => setSelectedNote(null), []);
  const handleFromChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setFrom(e.target.value), []);
  const handleMsgChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value), []);
  const handleMoodSelect = useCallback((emoji: string) => setMood(emoji), []);

  const noteCards = useMemo(() =>
    notes.map((note) => <NoteCard key={note.id} note={note} onSelect={setSelectedNote} />),
    [notes],
  );

  const inputStyle = {
    width: "100%", background: "rgba(250,248,242,0.55)",
    border: `1px solid ${WARM_BORDER}`, borderRadius: 12,
    padding: "10px 12px",
    fontFamily: CURSIVE, fontSize: 13, color: WARM,
    outline: "none", transition: "all 0.15s",
  } as React.CSSProperties;

  const labelStyle = {
    fontFamily: CURSIVE, fontSize: 10, fontWeight: 700,
    color: "rgba(108,74,46,0.55)", letterSpacing: "0.08em",
    textTransform: "uppercase" as const, display: "block", marginBottom: 4,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{ height: "100svh", display: "flex", flexDirection: "column", overflowY: "auto", overflowX: "hidden", position: "relative", zIndex: 10 }}
    >
      <div style={{ flex: 1, padding: "28px 16px 96px" }} className="lg:pt-10 lg:max-w-5xl lg:mx-auto lg:w-full lg:px-8">
        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <h2 style={{
            fontFamily: CURSIVE,
            fontSize: "clamp(22px, 5.5vw, 32px)",
            fontWeight: 700, color: WARM, margin: 0,
            textShadow: "0 2px 8px rgba(250,248,242,0.6)",
          }}>
            Love Notes 💌
          </h2>
          <p style={{ fontFamily: CURSIVE, fontSize: 13, color: "rgba(108,74,46,0.55)", marginTop: 4 }}>
            Send a sweet surprise note
          </p>
        </div>

        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Write a note card */}
          <div style={{
            borderRadius: 20, border: `1px solid ${WARM_BORDER}`,
            background: CREAM_CARD, padding: 16,
            boxShadow: "0 6px 24px rgba(80,50,20,0.11)",
          }}
            className="lg:p-6"
          >
            <p style={{ fontFamily: CURSIVE, fontSize: 13, fontWeight: 700, color: WARM, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
              <Send size={12} color={WARM} /> Write a Note
            </p>

            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>From (optional)</label>
              <input
                value={from} onChange={handleFromChange}
                placeholder="Your name or nickname"
                style={{ ...inputStyle }}
                onFocus={(e) => { e.currentTarget.style.border = `1.5px solid rgba(158,126,97,0.45)`; e.currentTarget.style.background = "rgba(250,248,242,0.80)"; }}
                onBlur={(e) => { e.currentTarget.style.border = `1px solid ${WARM_BORDER}`; e.currentTarget.style.background = "rgba(250,248,242,0.55)"; }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Mood</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {MOODS.map((m) => (
                  <MoodButton key={m.emoji} emoji={m.emoji} active={mood === m.emoji} onSelect={handleMoodSelect} />
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 8 }}>
              <label style={labelStyle}>Your Message</label>
              <textarea
                value={message} onChange={handleMsgChange} rows={3}
                placeholder="Pour your heart out here..."
                style={{ ...inputStyle, resize: "none" }}
                onFocus={(e) => { e.currentTarget.style.border = `1.5px solid rgba(158,126,97,0.45)`; e.currentTarget.style.background = "rgba(250,248,242,0.80)"; }}
                onBlur={(e) => { e.currentTarget.style.border = `1px solid ${WARM_BORDER}`; e.currentTarget.style.background = "rgba(250,248,242,0.55)"; }}
              />
            </div>

            <button onClick={useTemplate}
              style={{ fontFamily: CURSIVE, fontSize: 11, color: WARM, background: "none", border: "none", cursor: "pointer", marginBottom: 12, fontWeight: 600 }}>
              ✨ Use a love template
            </button>

            <button onClick={handleSend}
              style={{
                width: "100%", padding: "11px 0", borderRadius: 12, border: "none",
                background: "linear-gradient(135deg, rgb(160,80,70), rgb(130,55,45))",
                color: "rgba(250,248,242,0.95)", fontFamily: CURSIVE, fontSize: 13, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                cursor: "pointer", boxShadow: "0 4px 14px rgba(80,50,20,0.22)", transition: "all 0.15s",
              }}>
              <Heart size={12} style={{ fill: "rgba(250,248,242,0.95)", color: "rgba(250,248,242,0.95)" }} />
              {sent ? "Sent with Love! 💕" : "Send Love Note 💌"}
            </button>

            {sent && (
              <p style={{ fontFamily: CURSIVE, textAlign: "center", fontSize: 11, color: WARM, fontWeight: 600, marginTop: 8 }}>
                Your love note is flying! 💌✨
              </p>
            )}
          </div>

          {/* Notes list */}
          <div>
            <p style={{
              fontFamily: CURSIVE, fontSize: 10, fontWeight: 700,
              color: "rgba(108,74,46,0.55)", letterSpacing: "0.08em",
              textTransform: "uppercase", marginBottom: 10,
            }}>
              Love Notes · {notes.length}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "60vh", overflowY: "auto" }}
              className="no-scrollbar"
            >
              {noteCards}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedNote && <NoteModal note={selectedNote} onClose={closeModal} />}
      </AnimatePresence>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </motion.div>
  );
});
