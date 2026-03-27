"use client";

import { memo, useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, RotateCcw, Send, CheckCircle2 } from "lucide-react";
import type { ContentData, QuizQuestion, TruthDareItem } from "./types";
import MiniAudioPlayer from "./MiniAudioPlayer";

const WARM = "rgb(108, 74, 46)";
const WARM_BORDER = "rgba(158, 126, 97, 0.22)";
const CREAM_CARD = "rgba(250, 248, 242, 0.95)";
const CREAM_SOLID = "rgba(245, 240, 232, 0.98)";
const CURSIVE = "'Dancing Script', 'Brush Script MT', cursive";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface QuizAttemptRecord {
  score: number;
  total: number;
  playedAt: string;
}

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
  { question: "What's our favorite thing to cook together?", options: ["Pasta 🍝", "Desserts 🍰", "Breakfast 🍳", "Anything, just together"], correct: 3 },
  { question: "What's the first thing I noticed about you?", options: ["Your smile 😊", "Your eyes ✨", "Your laugh 😄", "Your kindness 💗"], correct: 1 },
  { question: "What's your superpower in our relationship?", options: ["Making me laugh", "Always knowing how I feel", "Cheering me up", "Being endlessly patient"], correct: 1 },
  { question: "What do you think I dream about most?", options: ["Adventures together", "A cozy life with you", "Our future family", "All of the above 💕"], correct: 3 },
  { question: "Which emoji best describes me?", options: ["🌸 Soft & sweet", "✨ Bright & bubbly", "🌙 Dreamy & calm", "🔥 Passionate & bold"], correct: 1 },
  { question: "If we were a song, we'd be...?", options: ["A love ballad 🎵", "An upbeat pop anthem", "A slow dance tune", "A playlist of everything"], correct: 3 },
  { question: "What's my favorite way to be surprised?", options: ["Surprise date 🌹", "Handwritten note 💌", "Unexpected cuddles 🤗", "Small thoughtful gifts"], correct: 0 },
  { question: "On a rainy day, I'd rather...?", options: ["Stay in with you 🏠", "Watch rain from a café ☕", "Cuddle and watch movies", "Read books together 📚"], correct: 2 },
  { question: "What do I love most about you?", options: ["Your warmth & care", "How you make me laugh", "That you always listen", "Everything 💕"], correct: 3 },
  { question: "What's our 'thing'?", options: ["Late night talks 🌙", "Inside jokes 😂", "Long drives together 🚗", "Random adventures 🗺️"], correct: 0 },
  { question: "What do I secretly smile about?", options: ["Funny memories of us", "Your texts out of nowhere", "Watching you laugh", "Thinking of our future"], correct: 3 },
  { question: "How would I describe our relationship in one word?", options: ["Home 🏡", "Adventure 🌟", "Forever 💕", "Magic ✨"], correct: 0 },
  { question: "What's my favourite time we spent together?", options: ["Our first date 🌹", "A trip we took together ✈️", "A random Tuesday that turned magical ✨", "Every single day 💕"], correct: 2 },
  { question: "When I'm sad, what always helps?", options: ["Your voice calling me", "A tight hug from you 🤗", "Funny videos you send", "Just knowing you're there"], correct: 1 },
  { question: "What would I say is the best thing about us?", options: ["We make each other better 💖", "We laugh together constantly", "We're each other's safe space", "We never stop choosing each other"], correct: 3 },
];

const CORRECT_MSGS = [
  "You know me so well! 💕", "Are you reading my mind? ✨", "Perfect match! 💗",
  "You really pay attention! 🥰", "Soulmate energy! 💫", "That's exactly right! 🎯",
];

const WRONG_MSGS = [
  "Almost! But close to perfect, just like you 😘",
  "Hmm... guess we need more pillow talks! 🛋️",
  "Not quite! But your smile makes up for it 💕",
  "Wrong answer... but you're still my favorite person 🥰",
  "Oops! Looks like we need another date night to figure that out 🌙",
  "So close! But loving you is never wrong 💗",
];

function pickRandom<T>(arr: T[], count: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, count);
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

interface LoveQuizProps {
  questions: QuizQuestion[];
  shareId: string | null;
  initialAttempts: QuizAttemptRecord[];
}

function LoveQuiz({ questions: customQs, shareId, initialAttempts }: LoveQuizProps) {
  const [sessionQs, setSessionQs] = useState<QuizQuestion[]>([]);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [attempts, setAttempts] = useState<QuizAttemptRecord[]>(initialAttempts || []);
  const [showHistory, setShowHistory] = useState(false);
  const [savingAttempt, setSavingAttempt] = useState(false);

  useEffect(() => {
    const pool = customQs.length >= 5 ? customQs : QUIZ_POOL;
    setSessionQs(pickRandom(pool, Math.min(10, pool.length)));
  }, [customQs]);

  const q = sessionQs[step];

  const handleAnswer = useCallback((i: number) => {
    if (selected !== null || !q) return;
    setSelected(i);
    const isCorrect = i === q.correct;
    if (isCorrect) {
      setScore((s) => s + 1);
      setFeedback(CORRECT_MSGS[Math.floor(Math.random() * CORRECT_MSGS.length)]);
    } else {
      setFeedback(WRONG_MSGS[Math.floor(Math.random() * WRONG_MSGS.length)]);
    }
    setTimeout(() => {
      setFeedback("");
      if (step + 1 < sessionQs.length) { setStep((s) => s + 1); setSelected(null); }
      else setDone(true);
    }, 1800);
  }, [selected, q, step, sessionQs.length]);

  const finishAndSave = useCallback(async (finalScore: number, total: number) => {
    const newAttempt: QuizAttemptRecord = {
      score: finalScore,
      total,
      playedAt: new Date().toISOString(),
    };
    setAttempts((prev) => [newAttempt, ...prev]);
    if (shareId) {
      setSavingAttempt(true);
      try {
        await fetch(`${API_URL}/love-gf-pages/share/${shareId}/quiz-attempt`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ score: finalScore, total }),
        });
      } catch {
        // ignore
      } finally {
        setSavingAttempt(false);
      }
    }
  }, [shareId]);

  // Save attempt when done
  useEffect(() => {
    if (done && sessionQs.length > 0) {
      finishAndSave(score, sessionQs.length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const restart = () => {
    const pool = customQs.length >= 5 ? customQs : QUIZ_POOL;
    setSessionQs(pickRandom(pool, Math.min(10, pool.length)));
    setStep(0); setScore(0); setSelected(null); setDone(false); setFeedback("");
  };

  if (!q && !done) return null;

  if (done) {
    const total = sessionQs.length;
    const pct = total > 0 ? score / total : 0;
    const emoji = pct === 1 ? "👑" : pct >= 0.7 ? "💕" : pct >= 0.4 ? "💖" : "💝";
    const msg = pct === 1
      ? "PERFECT! You know each other inside out!"
      : pct >= 0.7 ? "Amazing! You two are soulmates!"
      : pct >= 0.4 ? "Pretty good! More date nights coming!"
      : "Time for some heart-to-hearts! 💌";

    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <motion.span
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          style={{ fontSize: 52, display: "inline-block", marginBottom: 8 }}
        >
          {emoji}
        </motion.span>
        <h3 style={{ fontFamily: CURSIVE, fontSize: 24, fontWeight: 700, color: WARM, margin: 0 }}>
          {score} / {total}
        </h3>
        <p style={{ fontFamily: CURSIVE, fontSize: 13, color: "rgba(108,74,46,0.60)", margin: "4px 0 20px" }}>{msg}</p>
        <button onClick={restart}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "10px 24px", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg, rgb(180,100,80), rgb(160,70,60))",
            color: "rgba(250,248,242,0.95)", fontFamily: CURSIVE, fontSize: 13, fontWeight: 700,
            cursor: "pointer", boxShadow: "0 4px 14px rgba(80,50,20,0.22)",
          }}>
          <RotateCcw size={13} /> Play Again 💕
        </button>
        {savingAttempt && (
          <p style={{ fontFamily: CURSIVE, fontSize: 11, color: "rgba(108,74,46,0.45)", marginTop: 8 }}>Saving...</p>
        )}

        {/* Quiz History */}
        {attempts.length > 0 && (
          <div style={{ marginTop: 24, textAlign: "left" }}>
            <button
              onClick={() => setShowHistory((v) => !v)}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "rgba(158,126,97,0.06)", border: `1px solid ${WARM_BORDER}`,
                borderRadius: 10, padding: "8px 14px", cursor: "pointer",
              }}
            >
              <span style={{ fontFamily: CURSIVE, fontSize: 13, fontWeight: 700, color: WARM }}>
                🏆 Your Quiz History ({attempts.length})
              </span>
              <span style={{ fontFamily: CURSIVE, fontSize: 12, color: "rgba(108,74,46,0.50)" }}>
                {showHistory ? "▲" : "▼"}
              </span>
            </button>
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: "hidden" }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                    {attempts.map((a, idx) => {
                      const p = a.total > 0 ? a.score / a.total : 0;
                      const em = p === 1 ? "👑" : p >= 0.7 ? "💕" : p >= 0.4 ? "💖" : "💝";
                      return (
                        <div key={idx} style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "8px 12px", borderRadius: 8,
                          background: "rgba(255,252,246,0.7)", border: `1px solid ${WARM_BORDER}`,
                        }}>
                          <span style={{ fontFamily: CURSIVE, fontSize: 12, color: "rgba(108,74,46,0.60)" }}>
                            {formatDate(a.playedAt)}
                          </span>
                          <span style={{ fontFamily: CURSIVE, fontSize: 14, fontWeight: 700, color: WARM }}>
                            {em} {a.score}/{a.total}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
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

// ── Default Truth/Dare pools ─────────────────────────────────────────────────

const DEFAULT_TRUTHS = [
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

const DEFAULT_DARES = [
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
  mediaUrl?: string;
}

export interface ServerGameResponse {
  type: "truth" | "dare";
  prompt: string;
  answer: string;
  savedAt?: string;
  mediaUrl?: string;
}

interface TruthOrDareProps {
  shareId: string | null;
  customTruthDare: TruthDareItem[];
  initialResponses?: ServerGameResponse[];
}

function TruthOrDare({ shareId, customTruthDare, initialResponses = [] }: TruthOrDareProps) {
  type ActiveCard = { text: string; photoUrl?: string; audioUrl?: string };
  const [mode, setMode] = useState<"truth" | "dare" | null>(null);
  const [card, setCard] = useState<ActiveCard | null>(null);
  const [used, setUsed] = useState<Set<string>>(new Set());
  const [answer, setAnswer] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dareCompleted, setDareCompleted] = useState(false);
  const [completionMsg, setCompletionMsg] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>(() =>
    initialResponses.map((r, i) => ({
      id: -(i + 1), // negative IDs for server entries to avoid collision
      type: r.type,
      prompt: r.prompt,
      answer: r.answer,
      mediaUrl: r.mediaUrl,
    }))
  );
  const [showHistory, setShowHistory] = useState(initialResponses.length > 0);
  const [historyFilter, setHistoryFilter] = useState<"all" | "truth" | "dare">("all");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [responseAudioUrl, setResponseAudioUrl] = useState("");
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioFileInputRef = useRef<HTMLInputElement | null>(null);
  const [responsePhotoUrl, setResponsePhotoUrl] = useState("");
  const responsePhotoInputRef = useRef<HTMLInputElement | null>(null);

  const getTruths = useCallback((): ActiveCard[] => {
    const customs = customTruthDare.filter((q) => q.type === "truth").map((q) => ({ text: q.text }));
    const defaults = DEFAULT_TRUTHS.map((t) => ({ text: t }));
    return [...customs, ...defaults];
  }, [customTruthDare]);

  const getDares = useCallback((): ActiveCard[] => {
    const customs = customTruthDare.filter((q) => q.type === "dare").map((q) => ({
      text: q.text, photoUrl: q.photoUrl || "", audioUrl: q.audioUrl || "",
    }));
    const defaults = DEFAULT_DARES.map((t) => ({ text: t }));
    return [...customs, ...defaults];
  }, [customTruthDare]);

  const pick = useCallback((m: "truth" | "dare") => {
    setMode(m);
    const arr = m === "truth" ? getTruths() : getDares();
    const available = arr.filter((t) => !used.has(t.text));
    const pool = available.length > 0 ? available : arr;
    const choice = pool[Math.floor(Math.random() * pool.length)];
    setCard(choice);
    setUsed((prev) => new Set(prev).add(choice.text));
    setAnswer("");
    setSaved(false);
    setDareCompleted(false);
    setCompletionMsg("");
    setResponseAudioUrl("");
    setResponsePhotoUrl("");
    setTimeout(() => textareaRef.current?.focus(), 300);
  }, [used, getTruths, getDares]);

  const addToHistory = useCallback((type: "truth" | "dare", prompt: string, ans: string, mediaUrl?: string) => {
    setHistory((prev) => [{ id: Date.now(), type, prompt, answer: ans, ...(mediaUrl && { mediaUrl }) }, ...prev]);
  }, []);

  // Load an audio file chosen from device storage as a base64 data URL
  const loadAudioFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => setResponseAudioUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const startRecording = useCallback(async () => {
    let stream: MediaStream;
    // If getUserMedia is not available at all, go straight to file picker
    if (!navigator.mediaDevices?.getUserMedia) {
      audioFileInputRef.current?.click();
      return;
    }
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      // Mic denied / not found — silently open audio file picker instead
      audioFileInputRef.current?.click();
      return;
    }
    // Pick best supported mimeType
    let mimeType = "";
    const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];
    for (const c of candidates) {
      try {
        if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(c)) {
          mimeType = c; break;
        }
      } catch { /* ignore */ }
    }
    let recorder: MediaRecorder;
    try {
      recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    } catch {
      try { recorder = new MediaRecorder(stream); } catch {
        stream.getTracks().forEach((t) => t.stop());
        // Fall back to file picker
        audioFileInputRef.current?.click();
        return;
      }
    }
    const effectiveMime = recorder.mimeType || mimeType || "audio/webm";
    recordChunksRef.current = [];
    recorder.ondataavailable = (e) => { if (e.data.size > 0) recordChunksRef.current.push(e.data); };
    recorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(recordChunksRef.current, { type: effectiveMime });
      const reader = new FileReader();
      reader.onload = (ev) => setResponseAudioUrl(ev.target?.result as string);
      reader.readAsDataURL(blob);
    };
    recorder.start(200);
    recorderRef.current = recorder;
    setRecording(true);
    setRecordSeconds(0);
    recordTimerRef.current = setInterval(() => setRecordSeconds((s) => s + 1), 1000);
  }, []);

  const stopRecording = useCallback(() => {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setRecording(false);
    if (recordTimerRef.current) { clearInterval(recordTimerRef.current); recordTimerRef.current = null; }
  }, []);

  const handleSave = useCallback(async () => {
    if (!answer.trim() || !card) return;
    setSaving(true);
    try {
      if (shareId) {
        await fetch(`${API_URL}/love-gf-pages/share/${shareId}/game-response`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: mode, prompt: card.text, answer: answer.trim() }),
        });
      }
      addToHistory(mode ?? "truth", card.text, answer.trim());
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }, [answer, card, mode, shareId, addToHistory]);

  const handleDareComplete = useCallback(() => {
    if (!card) return;
    const msg = DARE_COMPLETIONS[Math.floor(Math.random() * DARE_COMPLETIONS.length)];
    setCompletionMsg(msg);
    setDareCompleted(true);
    const note = answer.trim() || "Dare completed! 🔥";
    const mediaUrl = responseAudioUrl || responsePhotoUrl || undefined;
    addToHistory("dare", card.text, note, mediaUrl);
    if (shareId && card) {
      const body: Record<string, string> = { type: "dare", prompt: card.text, answer: note };
      if (responseAudioUrl) body.mediaUrl = responseAudioUrl;
      else if (responsePhotoUrl) body.mediaUrl = responsePhotoUrl;
      fetch(`${API_URL}/love-gf-pages/share/${shareId}/game-response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).catch(() => {});
    }
    setResponseAudioUrl("");
    setResponsePhotoUrl("");
  }, [shareId, card, answer, addToHistory, responseAudioUrl, responsePhotoUrl]);

  const nextCard = useCallback(() => {
    const chosen: "truth" | "dare" = Math.random() < 0.5 ? "truth" : "dare";
    pick(chosen);
  }, [pick]);

  const reset = useCallback(() => {
    setUsed(new Set()); setCard(null); setMode(null);
    setAnswer(""); setSaved(false); setDareCompleted(false); setCompletionMsg("");
    setResponseAudioUrl(""); setResponsePhotoUrl("");
    if (recorderRef.current) { recorderRef.current.stop(); recorderRef.current = null; }
    setRecording(false);
    if (recordTimerRef.current) { clearInterval(recordTimerRef.current); recordTimerRef.current = null; }
  }, []);

  const filteredHistory = history.filter((h) => historyFilter === "all" || h.type === historyFilter);
  const truthCount = history.filter((h) => h.type === "truth").length;
  const dareCount = history.filter((h) => h.type === "dare").length;

  return (
    <div>
      <style>{`@keyframes lgf-rec-dot{0%,100%{opacity:1}50%{opacity:0.25}}`}</style>
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
        {!card || !card.text ? (
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
          <motion.div key={card.text}
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
                  textTransform: "uppercase" as const, letterSpacing: "0.12em",
                  color: mode === "truth" ? "rgb(100,60,140)" : "rgb(160,90,30)",
                  background: mode === "truth" ? "rgba(140,100,180,0.14)" : "rgba(200,130,60,0.14)",
                  padding: "2px 10px", borderRadius: 999,
                }}>
                  {mode === "truth" ? "💭 Truth" : "🎯 Dare"}
                </span>
              </div>
              <p style={{ fontFamily: CURSIVE, fontWeight: 700, color: WARM, fontSize: 15, margin: 0, lineHeight: 1.5 }}>
                {card.text}
              </p>
            </div>

            {/* Creator's attached media */}
            {mode === "dare" && card && (card.photoUrl || card.audioUrl) && (
              <div style={{ marginBottom: 12 }}>
                {card.photoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={card.photoUrl}
                    alt=""
                    style={{
                      width: "100%", maxHeight: 200, objectFit: "cover",
                      borderRadius: 12, marginBottom: card.audioUrl ? 8 : 0,
                    }}
                  />
                )}
                {card.audioUrl && (
                  <div style={{ marginBottom: 4 }}>
                    <p style={{ fontFamily: CURSIVE, fontSize: 11, color: "rgb(160,90,30)", margin: "0 0 6px" }}>
                      🎤 Listen first...
                    </p>
                    <MiniAudioPlayer src={card.audioUrl} />
                  </div>
                )}
              </div>
            )}

            {/* Truth: answer textarea */}
            {mode === "truth" && !saved && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <label style={{
                  fontFamily: CURSIVE, fontSize: 10, fontWeight: 700,
                  color: "rgba(108,74,46,0.55)", textTransform: "uppercase" as const,
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
                {/* Viewer response media */}
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  {/* Audio response */}
                  {/* Audio response — MediaRecorder, no file picker */}
                  {responseAudioUrl ? (
                    <div style={{ flex: 1 }}>
                      <MiniAudioPlayer
                        src={responseAudioUrl}
                        onRemove={() => setResponseAudioUrl("")}
                      />
                    </div>
                  ) : recording ? (
                    <button onClick={stopRecording} style={{
                      flex: 1, padding: "9px 14px", borderRadius: 10,
                      border: "1.5px solid rgba(200,60,60,0.40)",
                      background: "rgba(220,60,60,0.08)", cursor: "pointer",
                      fontFamily: CURSIVE, fontSize: 12, color: "rgb(180,50,50)",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                    }}>
                      <span style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: "rgb(220,50,50)", display: "inline-block", flexShrink: 0,
                        animation: "lgf-rec-dot 1s ease-in-out infinite",
                      }} />
                      {String(Math.floor(recordSeconds / 60)).padStart(2, "0")}:{String(recordSeconds % 60).padStart(2, "0")} · Stop
                    </button>
                  ) : (
                    <button onClick={startRecording} style={{
                      flex: 1, padding: "9px 0", borderRadius: 10,
                      border: "1.5px dashed rgba(200,130,60,0.35)",
                      background: "rgba(200,130,60,0.05)", cursor: "pointer",
                      fontFamily: CURSIVE, fontSize: 12, color: "rgb(160,90,30)",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                    }}>
                      🎤 Record voice
                    </button>
                  )}
                  {/* Photo response */}
                  {responsePhotoUrl ? (
                    <div style={{ position: "relative" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={responsePhotoUrl} alt="" style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover" }} />
                      <button onClick={() => setResponsePhotoUrl("")} style={{
                        position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: "50%",
                        background: "rgba(180,60,50,0.85)", border: "none", cursor: "pointer",
                        fontFamily: CURSIVE, fontSize: 10, color: "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>×</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => responsePhotoInputRef.current?.click()}
                      style={{
                        padding: "8px 12px", borderRadius: 10,
                        border: "1.5px dashed rgba(200,130,60,0.35)",
                        background: "rgba(200,130,60,0.05)", cursor: "pointer",
                        fontFamily: CURSIVE, fontSize: 12, color: "rgb(160,90,30)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>📸</button>
                  )}
                </div>
                <input
                  ref={responsePhotoInputRef}
                  type="file" accept="image/*" style={{ display: "none" }}
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    // compress
                    const canvas = document.createElement("canvas");
                    const img = new window.Image();
                    const url = URL.createObjectURL(f);
                    img.onload = () => {
                      const ratio = Math.min(600 / img.width, 600 / img.height, 1);
                      canvas.width = img.width * ratio; canvas.height = img.height * ratio;
                      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
                      setResponsePhotoUrl(canvas.toDataURL("image/jpeg", 0.80));
                      URL.revokeObjectURL(url);
                    };
                    img.src = url;
                    e.target.value = "";
                  }}
                />
                {/* Hidden audio file picker — fallback when mic is blocked */}
                <input
                  ref={audioFileInputRef}
                  type="file"
                  accept="audio/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) loadAudioFile(f);
                    e.target.value = "";
                  }}
                />
                <label style={{
                  fontFamily: CURSIVE, fontSize: 10, fontWeight: 700,
                  color: "rgba(108,74,46,0.55)", textTransform: "uppercase" as const,
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
                        <div style={{
                          position: "absolute", top: 0, left: 0, width: 3, bottom: 0,
                          borderRadius: "14px 0 0 14px",
                          background: entry.type === "truth"
                            ? "rgba(140,100,180,0.50)"
                            : "rgba(200,130,60,0.50)",
                        }} />

                        <div style={{ paddingLeft: 8 }}>
                          <span style={{
                            fontFamily: CURSIVE, fontSize: 9, fontWeight: 700,
                            textTransform: "uppercase" as const, letterSpacing: "0.1em",
                            color: entry.type === "truth" ? "rgb(100,60,140)" : "rgb(160,90,30)",
                            background: entry.type === "truth" ? "rgba(140,100,180,0.12)" : "rgba(200,130,60,0.12)",
                            padding: "2px 8px", borderRadius: 999, display: "inline-block",
                            marginBottom: 6,
                          }}>
                            {entry.type === "truth" ? "💭 Truth" : "🎯 Dare"}
                          </span>

                          <p style={{
                            fontFamily: CURSIVE, fontSize: 12, fontWeight: 600,
                            color: WARM, margin: "0 0 6px", lineHeight: 1.4,
                          }}>
                            {entry.prompt}
                          </p>

                          <div style={{
                            height: 1, background: entry.type === "truth"
                              ? "rgba(140,100,180,0.15)" : "rgba(200,130,60,0.15)",
                            margin: "6px 0",
                          }} />

                          <p style={{
                            fontFamily: CURSIVE, fontSize: 12, fontStyle: "italic",
                            color: "rgba(90,60,35,0.85)", margin: 0, lineHeight: 1.55,
                          }}>
                            {entry.type === "truth" ? `"${entry.answer}"` : `✓ ${entry.answer}`}
                          </p>

                          {/* Media response */}
                          {entry.mediaUrl && (
                            <div style={{ marginTop: 8 }}>
                              {entry.mediaUrl.startsWith("data:image/") || /\.(webp|jpg|jpeg|png|gif)(\?|$)/i.test(entry.mediaUrl) ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={entry.mediaUrl}
                                  alt="response"
                                  style={{
                                    width: "100%", maxHeight: 140,
                                    objectFit: "cover", borderRadius: 10,
                                  }}
                                />
                              ) : (
                                <MiniAudioPlayer src={entry.mediaUrl!} />
                              )}
                            </div>
                          )}
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
  { id: "quiz", label: "Love Quiz", emoji: "🎯", desc: "Personalized questions each round!" },
  { id: "tod", label: "Truth or Dare", emoji: "🎲", desc: "New challenges every time!" },
];

interface Props {
  data: ContentData;
  shareId?: string | null;
  quizAttempts?: QuizAttemptRecord[];
  initialGameResponses?: ServerGameResponse[];
}

export default memo(function GamesSection({ data, shareId = null, quizAttempts = [], initialGameResponses = [] }: Props) {
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
              ? <LoveQuiz questions={data.quizQuestions || []} shareId={shareId} initialAttempts={quizAttempts} />
              : <TruthOrDare shareId={shareId} customTruthDare={data.truthDareQuestions || []} initialResponses={initialGameResponses} />
            }
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
});
