"use client";

import { memo, useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, RotateCcw, Send, CheckCircle2 } from "lucide-react";
import type { ContentData, QuizQuestion } from "./types";

const WARM = "rgb(108, 74, 46)";
const WARM_BORDER = "rgba(158, 126, 97, 0.22)";
const CREAM_CARD = "rgba(250, 248, 242, 0.95)";
const CREAM_SOLID = "rgba(245, 240, 232, 0.98)";
const CURSIVE = "'Dancing Script', 'Brush Script MT', cursive";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const QUIZ_POOL: QuizQuestion[] = [
  { question: "What's their favorite thing about you?", options: ["Your smile 😊", "Your laugh 😄", "Your kindness 💗", "Your eyes 👀"], correct: 0 },
  { question: "Where is your dream date?", options: ["Paris 🗼", "Bali 🌴", "Maldives 🏖️", "Local cafe ☕"], correct: 2 },
  { question: "What's the most romantic thing they did?", options: ["Surprise visit 🚗", "Love letter 💌", "Cooked dinner 🍝", "Star walk 🌟"], correct: 1 },
  { question: "What's their love language?", options: ["Words of affirmation", "Quality time", "Physical touch", "Acts of service"], correct: 1 },
  { question: "What's their favorite season?", options: ["Spring 🌸", "Summer ☀️", "Autumn 🍂", "Winter ❄️"], correct: 0 },
  { question: "Who said 'I love you' first?", options: ["I did! 🙋", "They did 🥰", "We both did! 💕", "Still waiting 😅"], correct: 0 },
  { question: "What's their comfort food?", options: ["Pizza 🍕", "Ice cream 🍦", "Chocolate 🍫", "Home cooking 🥘"], correct: 3 },
  { question: "What do they do when stressed?", options: ["Listen to music 🎵", "Take a walk 🚶", "Talk to you 💬", "Sleep it off 😴"], correct: 2 },
  { question: "What's their hidden talent?", options: ["Singing 🎤", "Cooking 👩‍🍳", "Dancing 💃", "Making you laugh 😂"], correct: 3 },
  { question: "What's their favorite movie genre?", options: ["Romance 💕", "Comedy 😂", "Action 💥", "Thriller 🔍"], correct: 0 },
  { question: "What do they like most about weekends?", options: ["Sleeping in 😴", "Date time 💕", "Lazy mornings ☕", "Adventures 🏔️"], correct: 1 },
  { question: "What's their zodiac sign?", options: ["Fire sign ♈", "Earth sign ♉", "Air sign ♊", "Water sign ♋"], correct: 0 },
  { question: "What's their favorite flower?", options: ["Roses 🌹", "Sunflowers 🌻", "Tulips 🌷", "Lilies 🌺"], correct: 0 },
  { question: "How do they show love?", options: ["Hugs & kisses 🤗", "Thoughtful gifts 🎁", "Cooking for you 🍳", "Sweet texts 💌"], correct: 0 },
  { question: "What's their favorite holiday?", options: ["Valentine's Day 💕", "Christmas 🎄", "New Year's 🎆", "Their birthday 🎂"], correct: 0 },
];

const CORRECT_MSGS = [
  "You know me so well! 💕", "Are you reading my mind? ✨", "Perfect match! 💗",
  "You really pay attention! 🥰", "Soulmate energy! 💫", "That's exactly right! 🎯",
];

const WRONG_MSGS = [
  "Close but not quite! Let's try again 😘", "Someone needs a study date! 💌",
  "Aww, we need more pillow talks! 🛋️", "Guess we need another date night! 🌙",
];

function pickRandom<T>(arr: T[], count: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, count);
}

function LoveQuiz({ questions: customQs }: { questions: QuizQuestion[] }) {
  const [sessionQs, setSessionQs] = useState<QuizQuestion[]>([]);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const pool = customQs.length >= 10 ? customQs : QUIZ_POOL;
    setSessionQs(pickRandom(pool, 10));
  }, [customQs]);

  const q = sessionQs[step];

  const handleAnswer = useCallback((i: number) => {
    if (selected !== null || !q) return;
    setSelected(i);
    const isCorrect = i === q.correct;
    if (isCorrect) { setScore((s) => s + 1); setFeedback(CORRECT_MSGS[Math.floor(Math.random() * CORRECT_MSGS.length)]); }
    else { setFeedback(WRONG_MSGS[Math.floor(Math.random() * WRONG_MSGS.length)]); }
    setTimeout(() => {
      setFeedback("");
      if (step + 1 < sessionQs.length) { setStep((s) => s + 1); setSelected(null); }
      else setDone(true);
    }, 1500);
  }, [selected, q, step, sessionQs.length]);

  const restart = () => {
    setSessionQs(pickRandom(QUIZ_POOL, 10));
    setStep(0); setScore(0); setSelected(null); setDone(false); setFeedback("");
  };

  if (!q) return null;

  if (done) {
    const pct = score / sessionQs.length;
    const emoji = pct === 1 ? "👑" : pct >= 0.7 ? "💕" : pct >= 0.4 ? "💖" : "💝";
    const msg = pct === 1 ? "PERFECT! You know each other inside out!" : pct >= 0.7 ? "Amazing! You two are soulmates!" : pct >= 0.4 ? "Pretty good! More date nights coming!" : "Time for some heart-to-hearts! 💌";
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ fontSize: 48, display: "inline-block", marginBottom: 8 }}>{emoji}</motion.span>
        <h3 style={{ fontFamily: CURSIVE, fontSize: 20, fontWeight: 700, color: WARM, margin: 0 }}>{score}/{sessionQs.length}</h3>
        <p style={{ fontFamily: CURSIVE, fontSize: 13, color: "rgba(108,74,46,0.60)", margin: "4px 0 20px" }}>{msg}</p>
        <button onClick={restart}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "10px 20px", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg, rgb(180,100,80), rgb(160,70,60))",
            color: "rgba(250,248,242,0.95)", fontFamily: CURSIVE, fontSize: 13, fontWeight: 700,
            cursor: "pointer", boxShadow: "0 4px 14px rgba(80,50,20,0.22)",
          }}>
          <RotateCcw size={13} /> New Round 💕
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontFamily: CURSIVE, fontSize: 11, color: "rgba(108,74,46,0.55)" }}>Question {step + 1} of {sessionQs.length}</span>
        <span style={{ fontFamily: CURSIVE, fontSize: 11, color: "rgba(108,74,46,0.55)", display: "flex", alignItems: "center", gap: 4 }}>
          <Heart size={9} style={{ fill: WARM, color: WARM }} />{score}
        </span>
      </div>

      <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
        {sessionQs.map((_, i) => (
          <div key={i} style={{
            height: 4, flex: 1, borderRadius: 999,
            background: i < step ? WARM : i === step ? "rgba(108,74,46,0.45)" : "rgba(158,126,97,0.18)",
            transition: "all 0.3s",
          }} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }}>
          <p style={{ fontFamily: CURSIVE, fontSize: 15, fontWeight: 700, color: WARM, marginBottom: 16 }}>{q.question}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {q.options.map((opt, i) => {
              let bg = "rgba(250,248,242,0.60)";
              let border = WARM_BORDER;
              let color = "rgb(90,60,35)";
              if (selected !== null) {
                if (i === q.correct) { bg = "rgba(120,160,100,0.18)"; border = "rgba(100,140,80,0.50)"; color = "rgb(70,120,60)"; }
                else if (selected === i) { bg = "rgba(180,80,60,0.14)"; border = "rgba(160,60,40,0.40)"; color = "rgb(160,60,40)"; }
                else { bg = "rgba(250,248,242,0.25)"; border = "rgba(158,126,97,0.08)"; color = "rgba(90,60,35,0.35)"; }
              }
              return (
                <motion.button key={i} whileTap={{ scale: 0.96 }} onClick={() => handleAnswer(i)}
                  style={{
                    padding: "10px 14px", borderRadius: 12, textAlign: "left",
                    border: `1px solid ${border}`, background: bg,
                    fontFamily: CURSIVE, fontSize: 12, fontWeight: 500, color,
                    cursor: "pointer", transition: "all 0.2s",
                  }}>
                  {opt}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {feedback && (
          <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              fontFamily: CURSIVE, fontSize: 12, fontStyle: "italic",
              textAlign: "center", marginTop: 12,
              color: selected !== null && q && selected === q.correct ? "rgb(70,120,60)" : WARM,
            }}>
            {feedback}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

const TRUTHS = [
  "What's your favorite memory of us? 💭",
  "What made you fall for me? 💕",
  "What's your biggest dream for us? 🌟",
  "What song reminds you of me? 🎵",
  "What's one thing you love most about me? 💖",
  "When did you first know you loved me? 🥰",
  "What's the funniest thing I've done? 😂",
  "What do you miss most when we're apart? 💔",
  "What's your favorite date we've had? 🌹",
  "If you could relive one moment with us, which? ✨",
  "Describe me in three words 💕",
  "What's something you've never told me? 🤫",
  "What do you love about our relationship? 🌸",
  "What's your favorite thing we do together? 🥂",
];

const DARES = [
  "Send me a voice message saying 'I love you' right now! 🎤",
  "Change your profile pic to a photo of us for 24 hours! 📸",
  "Write me a 3-line poem! 📝",
  "Do your best impression of me! 🎭",
  "Send me 5 heart emojis one by one! 🤗",
  "Call me and sing the first line of our song! 🎵",
  "List 5 things you love about me right now! ✍️",
  "Post a story tagging me with a heart! 📱",
  "Give me your best pick-up line! 💬",
  "Plan our next date in the next 2 minutes! 📅",
  "Send me the cutest selfie you can take! 🤳",
  "Screen-record yourself doing a silly dance! 💃",
  "Make me laugh using only emojis! 😂",
  "Write a text to my bestie about how much you love me! 📱",
];

const DARE_COMPLETIONS = [
  "Done! That felt amazing! 🔥",
  "I crushed it! 💪",
  "Challenge accepted & completed! ⚡",
  "Consider it done, my love! 💕",
  "That was wild but I did it! 🫶",
];

interface HistoryEntry {
  id: number;
  type: "truth" | "dare";
  prompt: string;
  answer: string;
}

function TruthOrDare({ shareId }: { shareId: string | null }) {
  const [mode, setMode] = useState<"truth" | "dare" | null>(null);
  const [card, setCard] = useState("");
  const [used, setUsed] = useState<Set<string>>(new Set());
  const [answer, setAnswer] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dareCompleted, setDareCompleted] = useState(false);
  const [completionMsg, setCompletionMsg] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<"all" | "truth" | "dare">("all");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const pick = useCallback((m: "truth" | "dare") => {
    setMode(m);
    const arr = m === "truth" ? TRUTHS : DARES;
    const available = arr.filter((t) => !used.has(t));
    const pool = available.length > 0 ? available : arr;
    const choice = pool[Math.floor(Math.random() * pool.length)];
    setCard(choice);
    setUsed((prev) => new Set(prev).add(choice));
    setAnswer("");
    setSaved(false);
    setDareCompleted(false);
    setCompletionMsg("");
    setTimeout(() => textareaRef.current?.focus(), 300);
  }, [used]);

  const addToHistory = useCallback((type: "truth" | "dare", prompt: string, ans: string) => {
    setHistory((prev) => [{ id: Date.now(), type, prompt, answer: ans }, ...prev]);
  }, []);

  const handleSave = useCallback(async () => {
    if (!answer.trim() || !card) return;
    setSaving(true);
    try {
      if (shareId) {
        await fetch(`${API_URL}/love-gf-pages/share/${shareId}/game-response`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: mode, prompt: card, answer: answer.trim() }),
        });
      }
      addToHistory(mode ?? "truth", card, answer.trim());
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }, [answer, card, mode, shareId, addToHistory]);

  const handleDareComplete = useCallback(() => {
    const msg = DARE_COMPLETIONS[Math.floor(Math.random() * DARE_COMPLETIONS.length)];
    setCompletionMsg(msg);
    setDareCompleted(true);
    const note = answer.trim() || "Dare completed! 🔥";
    addToHistory("dare", card, note);
    if (shareId && card) {
      fetch(`${API_URL}/love-gf-pages/share/${shareId}/game-response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "dare", prompt: card, answer: note }),
      }).catch(() => {});
    }
  }, [shareId, card, answer, addToHistory]);

  // Instantly pick a random truth or dare — no spinner
  const nextCard = useCallback(() => {
    const chosen: "truth" | "dare" = Math.random() < 0.5 ? "truth" : "dare";
    pick(chosen);
  }, [pick]);

  const reset = useCallback(() => {
    setUsed(new Set()); setCard(""); setMode(null);
    setAnswer(""); setSaved(false); setDareCompleted(false); setCompletionMsg("");
  }, []);

  const filteredHistory = history.filter((h) => historyFilter === "all" || h.type === historyFilter);
  const truthCount = history.filter((h) => h.type === "truth").length;
  const dareCount = history.filter((h) => h.type === "dare").length;

  return (
    <div>
      {/* Picker buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => pick("truth")}
          style={{
            flex: 1, padding: "10px 0", borderRadius: 12,
            background: mode === "truth" ? "rgba(140,100,180,0.18)" : "rgba(180,140,200,0.10)",
            border: mode === "truth" ? "1.5px solid rgba(140,100,180,0.35)" : "1px solid rgba(150,100,180,0.20)",
            fontFamily: CURSIVE, fontSize: 13, fontWeight: 700, color: "rgb(100,60,140)",
            cursor: "pointer", boxShadow: mode === "truth" ? "0 3px 12px rgba(140,100,180,0.15)" : "none",
          }}>
          💭 Truth {truthCount > 0 && <span style={{ fontSize: 10, opacity: 0.7 }}>({truthCount})</span>}
        </motion.button>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => pick("dare")}
          style={{
            flex: 1, padding: "10px 0", borderRadius: 12,
            background: mode === "dare" ? "rgba(200,130,60,0.18)" : "rgba(200,160,80,0.10)",
            border: mode === "dare" ? "1.5px solid rgba(200,130,60,0.35)" : "1px solid rgba(180,140,60,0.20)",
            fontFamily: CURSIVE, fontSize: 13, fontWeight: 700, color: "rgb(160,90,30)",
            cursor: "pointer", boxShadow: mode === "dare" ? "0 3px 12px rgba(200,130,60,0.15)" : "none",
          }}>
          🎯 Dare {dareCount > 0 && <span style={{ fontSize: 10, opacity: 0.7 }}>({dareCount})</span>}
        </motion.button>
      </div>

      {/* Active card area */}
      <AnimatePresence mode="wait">
          {!card ? (
          <motion.div key="empty"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              borderRadius: 16, border: `1px solid ${WARM_BORDER}`,
              background: "rgba(250,248,242,0.50)",
              padding: "28px 20px", textAlign: "center",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            }}
          >
            <span style={{ fontSize: 32 }}>🎴</span>
            <p style={{ fontFamily: CURSIVE, fontSize: 13, color: "rgba(108,74,46,0.50)", margin: 0 }}>
              Pick Truth or Dare to start 💕
            </p>
          </motion.div>
        ) : (
          <motion.div key={card}
            initial={{ scale: 0.88, opacity: 0, rotateY: -15 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            exit={{ scale: 0.88, opacity: 0 }}
            transition={{ type: "spring", stiffness: 250, damping: 22 }}
          >
            {/* Card */}
            <div style={{
              borderRadius: 16,
              border: mode === "truth" ? "1.5px solid rgba(140,100,180,0.28)" : "1.5px solid rgba(200,130,60,0.28)",
              background: mode === "truth" ? "rgba(160,120,200,0.10)" : "rgba(220,160,80,0.10)",
              padding: "16px 20px", marginBottom: 14,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{
                  fontFamily: CURSIVE, fontSize: 10, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.12em",
                  color: mode === "truth" ? "rgb(100,60,140)" : "rgb(160,90,30)",
                  background: mode === "truth" ? "rgba(140,100,180,0.14)" : "rgba(200,130,60,0.14)",
                  padding: "2px 10px", borderRadius: 999,
                }}>
                  {mode === "truth" ? "💭 Truth" : "🎯 Dare"}
                </span>
              </div>
              <p style={{ fontFamily: CURSIVE, fontWeight: 700, color: WARM, fontSize: 15, margin: 0, lineHeight: 1.5 }}>
                {card}
              </p>
            </div>

            {/* Truth: answer textarea */}
            {mode === "truth" && !saved && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <label style={{
                  fontFamily: CURSIVE, fontSize: 10, fontWeight: 700,
                  color: "rgba(108,74,46,0.55)", textTransform: "uppercase",
                  letterSpacing: "0.08em", display: "block", marginBottom: 6,
                }}>
                  Your honest answer ✍️
                </label>
                <textarea
                  ref={textareaRef}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={3}
                  placeholder="Write your honest answer here... 💕"
                  style={{
                    width: "100%", resize: "none",
                    background: "rgba(250,248,242,0.70)",
                    border: "1.5px solid rgba(140,100,180,0.25)",
                    borderRadius: 12, padding: "10px 12px",
                    fontFamily: CURSIVE, fontSize: 13, color: WARM,
                    outline: "none", lineHeight: 1.6, boxSizing: "border-box",
                  }}
                  onFocus={(e) => { e.currentTarget.style.border = "1.5px solid rgba(140,100,180,0.50)"; }}
                  onBlur={(e) => { e.currentTarget.style.border = "1.5px solid rgba(140,100,180,0.25)"; }}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={handleSave} disabled={!answer.trim() || saving}
                    style={{
                      flex: 1, padding: "10px 0", borderRadius: 12, border: "none",
                      background: answer.trim() ? "linear-gradient(135deg, rgb(120,80,160), rgb(100,60,140))" : "rgba(158,126,97,0.15)",
                      color: answer.trim() ? "rgba(250,248,242,0.95)" : "rgba(108,74,46,0.40)",
                      fontFamily: CURSIVE, fontSize: 13, fontWeight: 700,
                      cursor: answer.trim() ? "pointer" : "not-allowed",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      boxShadow: answer.trim() ? "0 4px 12px rgba(100,60,140,0.25)" : "none",
                    }}>
                    <Send size={12} /> {saving ? "Saving..." : "Save Answer 💕"}
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={nextCard}
                    style={{
                      padding: "10px 16px", borderRadius: 12,
                      border: `1px solid ${WARM_BORDER}`, background: "rgba(250,248,242,0.60)",
                      fontFamily: CURSIVE, fontSize: 12, color: WARM, cursor: "pointer",
                    }}>
                    Skip →
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Truth: saved confirmation */}
            {mode === "truth" && saved && (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                style={{
                  borderRadius: 14, border: "1.5px solid rgba(100,160,80,0.30)",
                  background: "rgba(100,160,80,0.10)",
                  padding: "12px 16px", textAlign: "center", marginBottom: 10,
                }}>
                <CheckCircle2 size={18} color="rgb(80,140,60)" style={{ margin: "0 auto 4px" }} />
                <p style={{ fontFamily: CURSIVE, fontSize: 13, fontWeight: 700, color: "rgb(70,120,50)", margin: 0 }}>
                  Answer saved! 💚
                </p>
                <p style={{
                  fontFamily: CURSIVE, fontSize: 12, color: "rgba(70,120,50,0.80)",
                  fontStyle: "italic", marginTop: 4, lineHeight: 1.5,
                }}>
                  &ldquo;{answer}&rdquo;
                </p>
              </motion.div>
            )}

            {/* Dare: how did it go + I did it button */}
            {mode === "dare" && !dareCompleted && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <label style={{
                  fontFamily: CURSIVE, fontSize: 10, fontWeight: 700,
                  color: "rgba(108,74,46,0.55)", textTransform: "uppercase",
                  letterSpacing: "0.08em", display: "block", marginBottom: 6,
                }}>
                  How did it go? (optional) ✍️
                </label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={2}
                  placeholder="Tell me how you did the dare... 😜"
                  style={{
                    width: "100%", resize: "none",
                    background: "rgba(250,248,242,0.70)",
                    border: "1.5px solid rgba(200,130,60,0.25)",
                    borderRadius: 12, padding: "10px 12px",
                    fontFamily: CURSIVE, fontSize: 13, color: WARM,
                    outline: "none", lineHeight: 1.6, boxSizing: "border-box",
                    marginBottom: 10,
                  }}
                  onFocus={(e) => { e.currentTarget.style.border = "1.5px solid rgba(200,130,60,0.50)"; }}
                  onBlur={(e) => { e.currentTarget.style.border = "1.5px solid rgba(200,130,60,0.25)"; }}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <motion.button whileTap={{ scale: 0.92 }} whileHover={{ scale: 1.02 }} onClick={handleDareComplete}
                    style={{
                      flex: 1, padding: "12px 0", borderRadius: 12, border: "none",
                      background: "linear-gradient(135deg, rgb(200,130,60), rgb(180,100,40))",
                      color: "rgba(250,248,242,0.95)",
                      fontFamily: CURSIVE, fontSize: 14, fontWeight: 700, cursor: "pointer",
                      boxShadow: "0 4px 16px rgba(180,100,40,0.30)",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    }}>
                    🔥 I Did It!
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={nextCard}
                    style={{
                      padding: "12px 16px", borderRadius: 12,
                      border: `1px solid ${WARM_BORDER}`, background: "rgba(250,248,242,0.60)",
                      fontFamily: CURSIVE, fontSize: 12, color: WARM, cursor: "pointer",
                    }}>
                    Skip →
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Dare: completed celebration */}
            {mode === "dare" && dareCompleted && (
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{
                  borderRadius: 14, border: "1.5px solid rgba(200,130,60,0.35)",
                  background: "rgba(220,160,80,0.12)",
                  padding: "16px", textAlign: "center", marginBottom: 10,
                }}>
                <motion.span
                  animate={{ rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.2, 1.2, 1] }}
                  transition={{ duration: 0.6 }}
                  style={{ fontSize: 32, display: "inline-block", marginBottom: 6 }}
                >🔥</motion.span>
                <p style={{ fontFamily: CURSIVE, fontSize: 14, fontWeight: 700, color: "rgb(160,90,30)", margin: 0 }}>
                  {completionMsg}
                </p>
              </motion.div>
            )}

            {/* Next challenge — shown after truth saved or dare completed */}
            {((mode === "truth" && saved) || (mode === "dare" && dareCompleted)) && (
              <motion.button
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.95 }}
                onClick={nextCard}
                style={{
                  width: "100%", padding: "13px 0", borderRadius: 14, border: "none",
                  background: "linear-gradient(135deg, rgb(160,80,70), rgb(130,55,45))",
                  color: "rgba(250,248,242,0.95)",
                  fontFamily: CURSIVE, fontSize: 15, fontWeight: 700, cursor: "pointer",
                  boxShadow: "0 6px 20px rgba(80,50,20,0.28)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  marginTop: 4,
                }}>
                <span>🎲</span> Next Challenge <span style={{ color: "rgba(255,220,100,0.9)" }}>✦</span>
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset */}
      {used.size > 0 && (
        <button onClick={reset}
          style={{
            marginTop: 8, display: "flex", alignItems: "center", gap: 4, margin: "8px auto 0",
            background: "none", border: "none", fontFamily: CURSIVE, fontSize: 10,
            color: "rgba(108,74,46,0.40)", cursor: "pointer",
          }}>
          ↺ Reset all
        </button>
      )}

      {/* ── Game Journal / History ── */}
      {history.length > 0 && (
        <div style={{ marginTop: 20 }}>
          {/* Journal header */}
          <button
            onClick={() => setShowHistory((v) => !v)}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "none", border: "none", cursor: "pointer", padding: "0 2px 10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: CURSIVE, fontSize: 14, fontWeight: 700, color: WARM }}>
                📖 Our Game Journal
              </span>
              <span style={{
                fontFamily: CURSIVE, fontSize: 10, fontWeight: 700,
                background: "rgba(158,126,97,0.18)", color: WARM,
                padding: "2px 8px", borderRadius: 999,
              }}>
                {history.length}
              </span>
            </div>
            <motion.span
              animate={{ rotate: showHistory ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              style={{ fontFamily: CURSIVE, fontSize: 12, color: "rgba(108,74,46,0.55)" }}
            >
              ▾
            </motion.span>
          </button>

          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                style={{ overflow: "hidden" }}
              >
                {/* Filter tabs */}
                <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                  {(["all", "truth", "dare"] as const).map((f) => (
                    <button key={f} onClick={() => setHistoryFilter(f)}
                      style={{
                        padding: "4px 12px", borderRadius: 999,
                        border: historyFilter === f ? `1.5px solid ${WARM_BORDER}` : "1px solid transparent",
                        background: historyFilter === f ? "rgba(158,126,97,0.14)" : "transparent",
                        fontFamily: CURSIVE, fontSize: 11, fontWeight: historyFilter === f ? 700 : 400,
                        color: historyFilter === f ? WARM : "rgba(108,74,46,0.50)",
                        cursor: "pointer", transition: "all 0.15s",
                      }}>
                      {f === "all" ? `All (${history.length})` : f === "truth" ? `💭 Truths (${truthCount})` : `🎯 Dares (${dareCount})`}
                    </button>
                  ))}
                </div>

                {/* History entries */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <AnimatePresence>
                    {filteredHistory.map((entry, idx) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 12 }}
                        transition={{ delay: idx * 0.04 }}
                        style={{
                          borderRadius: 14,
                          border: entry.type === "truth"
                            ? "1px solid rgba(140,100,180,0.22)"
                            : "1px solid rgba(200,130,60,0.22)",
                          background: entry.type === "truth"
                            ? "rgba(160,120,200,0.07)"
                            : "rgba(220,160,80,0.07)",
                          padding: "12px 14px",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        {/* Subtle left accent bar */}
                        <div style={{
                          position: "absolute", top: 0, left: 0, width: 3, bottom: 0,
                          borderRadius: "14px 0 0 14px",
                          background: entry.type === "truth"
                            ? "rgba(140,100,180,0.50)"
                            : "rgba(200,130,60,0.50)",
                        }} />

                        <div style={{ paddingLeft: 8 }}>
                          {/* Badge */}
                          <span style={{
                            fontFamily: CURSIVE, fontSize: 9, fontWeight: 700,
                            textTransform: "uppercase", letterSpacing: "0.1em",
                            color: entry.type === "truth" ? "rgb(100,60,140)" : "rgb(160,90,30)",
                            background: entry.type === "truth" ? "rgba(140,100,180,0.12)" : "rgba(200,130,60,0.12)",
                            padding: "2px 8px", borderRadius: 999, display: "inline-block",
                            marginBottom: 6,
                          }}>
                            {entry.type === "truth" ? "💭 Truth" : "🎯 Dare"}
                          </span>

                          {/* Question/Dare prompt */}
                          <p style={{
                            fontFamily: CURSIVE, fontSize: 12, fontWeight: 600,
                            color: WARM, margin: "0 0 6px", lineHeight: 1.4,
                          }}>
                            {entry.prompt}
                          </p>

                          {/* Divider */}
                          <div style={{
                            height: 1, background: entry.type === "truth"
                              ? "rgba(140,100,180,0.15)" : "rgba(200,130,60,0.15)",
                            margin: "6px 0",
                          }} />

                          {/* Answer */}
                          <p style={{
                            fontFamily: CURSIVE, fontSize: 12, fontStyle: "italic",
                            color: "rgba(90,60,35,0.85)", margin: 0, lineHeight: 1.55,
                          }}>
                            {entry.type === "truth" ? `"${entry.answer}"` : `✓ ${entry.answer}`}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

const GAMES = [
  { id: "quiz", label: "Love Quiz", emoji: "🧠", desc: "10 random questions each round!" },
  { id: "tod", label: "Truth or Dare", emoji: "🎲", desc: "New challenges every time!" },
];

interface Props { data: ContentData; shareId?: string | null; }

export default memo(function GamesSection({ data, shareId = null }: Props) {
  const [activeGame, setActiveGame] = useState("quiz");

  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
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
            Love Games 🎮
          </h2>
          <p style={{ fontFamily: CURSIVE, fontSize: 13, color: "rgba(108,74,46,0.55)", marginTop: 4 }}>Play together, grow closer</p>
        </div>

        <div className="lg:flex lg:gap-8 lg:items-start">
          {/* Game picker */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}
            className="lg:flex lg:flex-col lg:w-52 lg:shrink-0 lg:mb-0 lg:gap-3"
          >
            {GAMES.map((g) => {
              const isActive = activeGame === g.id;
              return (
                <motion.button key={g.id} whileTap={{ scale: 0.97 }} onClick={() => setActiveGame(g.id)}
                  style={{
                    borderRadius: 16,
                    border: isActive ? "1.5px solid rgba(158,126,97,0.45)" : `1px solid ${WARM_BORDER}`,
                    padding: "14px 16px", textAlign: "left",
                    background: isActive ? CREAM_SOLID : "rgba(250,248,242,0.55)",
                    boxShadow: isActive ? "0 6px 20px rgba(80,50,20,0.16), inset 0 1px 0 rgba(255,255,255,0.5)" : "none",
                    cursor: "pointer", transition: "all 0.2s",
                  }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{g.emoji}</div>
                  <p style={{
                    fontFamily: CURSIVE, fontWeight: 700, fontSize: 14,
                    color: isActive ? WARM : "rgba(108,74,46,0.70)", margin: 0,
                  }}>{g.label}</p>
                  <p style={{ fontFamily: CURSIVE, fontSize: 10, color: "rgba(108,74,46,0.50)", marginTop: 2 }}>{g.desc}</p>
                  {isActive && (
                    <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${WARM}, transparent)`, borderRadius: 999, marginTop: 8 }} />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Game content */}
          <motion.div key={activeGame} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{
              borderRadius: 20, border: `1px solid ${WARM_BORDER}`,
              background: CREAM_CARD, padding: 16,
              boxShadow: "0 6px 24px rgba(80,50,20,0.12)",
            }}
            className="lg:p-6 lg:flex-1"
          >
            {activeGame === "quiz"
              ? <LoveQuiz questions={data.quizQuestions} />
              : <TruthOrDare shareId={shareId} />
            }
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
});
