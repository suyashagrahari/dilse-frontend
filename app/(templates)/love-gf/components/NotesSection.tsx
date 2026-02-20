"use client";

import { memo, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Heart, X } from "lucide-react";

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
      className="w-full text-left rounded-2xl border border-pink-200/40 dark:border-pink-800/20 bg-white dark:bg-slate-900 p-3.5 lg:p-4 shadow-sm hover:shadow-md active:scale-[0.98] transition-all"
    >
      <div className="flex items-center justify-between mb-1.5 lg:mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 lg:w-9 lg:h-9 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-sm lg:text-base">{note.mood}</div>
          <span className="font-semibold text-xs lg:text-sm text-foreground">{note.from}</span>
        </div>
        <span className="text-[9px] lg:text-[11px] text-muted-foreground">{note.time}</span>
      </div>
      <p className="text-[11px] lg:text-sm text-foreground/60 leading-relaxed line-clamp-2">{note.message}</p>
      <span className="text-[9px] lg:text-xs text-pink-500 font-medium mt-1.5 inline-block">Read full note →</span>
    </button>
  );
});

const NoteModal = memo(function NoteModal({ note, onClose }: { note: Note; onClose: () => void }) {
  const stopProp = useCallback((e: React.MouseEvent) => e.stopPropagation(), []);
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }}
    >
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 10 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        onClick={stopProp}
        className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-pink-200/30 dark:border-pink-800/20 overflow-hidden"
      >
        <div className="h-20 flex items-center justify-center relative"
          style={{ background: "linear-gradient(135deg, #fce7f3, #fdf2f8, #ede9fe)" }}>
          <span className="text-4xl">{note.mood}</span>
          <button onClick={onClose} className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/70 dark:bg-slate-800/70 flex items-center justify-center shadow-sm">
            <X size={13} className="text-foreground/60" />
          </button>
        </div>

        <div className="dark:hidden absolute top-0 left-0 right-0 h-20" style={{ background: "linear-gradient(135deg, #fce7f3, #fdf2f8, #ede9fe)" }} />
        
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-base">{note.mood}</div>
              <p className="text-sm font-bold text-foreground">{note.from}</p>
            </div>
            <span className="text-[10px] text-muted-foreground bg-pink-50 dark:bg-pink-900/20 px-2 py-0.5 rounded-full">{note.time}</span>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1 bg-pink-200/40 dark:bg-pink-800/20" />
            <span className="text-pink-400 text-[10px]">♡</span>
            <div className="h-px flex-1 bg-pink-200/40 dark:bg-pink-800/20" />
          </div>

          <p className="text-sm text-foreground/75 leading-relaxed italic">&ldquo;{note.message}&rdquo;</p>

          <div className="flex items-center gap-2 mt-3">
            <div className="h-px flex-1 bg-pink-200/40 dark:bg-pink-800/20" />
            <span className="text-pink-400 text-[10px]">♡</span>
            <div className="h-px flex-1 bg-pink-200/40 dark:bg-pink-800/20" />
          </div>
        </div>

        <div className="px-6 pb-5 text-center">
          <button onClick={onClose} className="px-5 py-2 rounded-xl border border-pink-200/40 dark:border-pink-800/20 text-xs font-medium text-muted-foreground hover:bg-pink-50/50 dark:hover:bg-pink-900/10 transition-colors">
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
      className={`w-9 h-9 lg:w-11 lg:h-11 rounded-xl text-base lg:text-lg flex items-center justify-center border transition-all active:scale-90 ${
        active ? "border-pink-400 bg-pink-100 dark:bg-pink-900/30 dark:border-pink-600 scale-110 shadow-sm" : "border-pink-200/30 dark:border-pink-800/20 bg-pink-50/50 dark:bg-white/5"
      }`}
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="h-screen flex flex-col overflow-y-auto overflow-x-hidden"
    >
      <div className="flex-1 px-4 pt-7 pb-24 lg:pt-10 lg:max-w-5xl xl:max-w-6xl lg:mx-auto lg:w-full lg:px-8">
        <div className="text-center mb-5 lg:mb-8">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-0.5"
            style={{ background: "linear-gradient(135deg, #e11d48, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Love Notes 💌
          </h2>
          <p className="text-muted-foreground text-[11px] lg:text-sm">Send a sweet surprise note</p>
        </div>

        <div className="lg:grid lg:grid-cols-2 lg:gap-8 space-y-5 lg:space-y-0">
          <div className="rounded-2xl border border-pink-200/40 dark:border-pink-800/20 bg-white dark:bg-slate-900 shadow-sm p-4 lg:p-6">
            <p className="text-xs lg:text-sm font-semibold text-foreground mb-3 lg:mb-4 flex items-center gap-1.5">
              <Send size={12} className="text-pink-500" /> Write a Note
            </p>

            <div className="mb-3">
              <label className="text-[10px] font-medium text-muted-foreground mb-1 block">From (optional)</label>
              <input value={from} onChange={handleFromChange} placeholder="Your name or nickname"
                className="w-full bg-pink-50/50 dark:bg-white/5 border border-pink-200/40 dark:border-pink-800/20 rounded-xl px-3 py-2.5 lg:py-3 text-xs lg:text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-pink-300/50 dark:focus:ring-pink-700/30 transition-all" />
            </div>

            <div className="mb-3">
              <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Mood</label>
              <div className="flex gap-1.5 flex-wrap">
                {MOODS.map((m) => (
                  <MoodButton key={m.emoji} emoji={m.emoji} active={mood === m.emoji} onSelect={handleMoodSelect} />
                ))}
              </div>
            </div>

            <div className="mb-2">
              <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Your Message</label>
              <textarea value={message} onChange={handleMsgChange} rows={3} placeholder="Pour your heart out here..."
                className="w-full bg-pink-50/50 dark:bg-white/5 border border-pink-200/40 dark:border-pink-800/20 rounded-xl px-3 py-2.5 lg:py-3 text-xs lg:text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-pink-300/50 dark:focus:ring-pink-700/30 transition-all resize-none lg:rows-5" />
            </div>

            <button onClick={useTemplate} className="text-[10px] text-pink-500 font-medium hover:underline mb-3 block">
              ✨ Use a love template
            </button>

            <button onClick={handleSend}
              className="w-full py-2.5 rounded-xl text-white text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-transform shadow-md"
              style={{ background: "linear-gradient(135deg, #e11d48, #ec4899)" }}>
              <Heart size={12} className="fill-current" />
              {sent ? "Sent with Love! 💕" : "Send Love Note 💌"}
            </button>

            {sent && (
              <p className="text-center text-[10px] text-pink-500 font-medium mt-2 animate-fade-in">
                Your love note is flying! 💌✨
              </p>
            )}
          </div>

          <div>
            <p className="text-[10px] font-semibold text-muted-foreground mb-2.5 px-0.5 uppercase tracking-wider">Love Notes · {notes.length}</p>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-0.5">
              {noteCards}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedNote && <NoteModal note={selectedNote} onClose={closeModal} />}
      </AnimatePresence>

      <style jsx>{`
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </motion.div>
  );
});
