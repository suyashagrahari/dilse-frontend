"use client";

import { memo, useState, useCallback, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, RotateCcw, Send, CheckCircle2 } from "lucide-react";
import type { ContentData, QuizQuestion, TruthDareItem } from "./types";
import MiniAudioPlayer from "./MiniAudioPlayer";
import GameHistory, { type HistoryEntry, type QuizRecord } from "./GameHistory";
import { API_URL } from "@/lib/config";

const ROSE = "rgb(201, 144, 106)";
const ROSE_BORDER = "rgba(201, 144, 106, 0.22)";
const DARK_CARD = "rgba(12, 6, 20, 0.85)";
const DARK_SOLID = "rgba(18, 8, 28, 0.95)";
const CURSIVE = "'Dancing Script', 'Brush Script MT', cursive";

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
  attempts: QuizAttemptRecord[];
  onAttemptAdded: (a: QuizAttemptRecord) => void;
}

function LoveQuiz({ questions: customQs, shareId, attempts, onAttemptAdded }: LoveQuizProps) {
  const [sessionQs, setSessionQs] = useState<QuizQuestion[]>([]);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState("");
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
    onAttemptAdded(newAttempt);
    if (shareId) {
      setSavingAttempt(true);
      try {
        await fetch(`${API_URL}/darling-pages/share/${shareId}/quiz-attempt`, {
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
  }, [shareId, onAttemptAdded]);

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
        <h3 style={{ fontFamily: CURSIVE, fontSize: 24, fontWeight: 700, color: "rgb(250, 240, 230)", margin: 0 }}>
          {score} / {total}
        </h3>
        <p style={{ fontFamily: CURSIVE, fontSize: 13, color: "rgba(250,240,230,0.60)", margin: "4px 0 20px" }}>{msg}</p>
        <button onClick={restart}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "10px 24px", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg, rgb(201,144,106), rgb(160,100,65))",
            color: "rgba(250,240,230,0.95)", fontFamily: CURSIVE, fontSize: 13, fontWeight: 700,
            cursor: "pointer", boxShadow: "0 4px 14px rgba(201,144,106,0.35)",
          }}>
          <RotateCcw size={13} /> Play Again 💕
        </button>
        {savingAttempt && (
          <p style={{ fontFamily: CURSIVE, fontSize: 11, color: "rgba(201,144,106,0.55)", marginTop: 8 }}>Saving...</p>
        )}

        {/* Quiz History */}
        {attempts.length > 0 && (
          <div style={{ marginTop: 24, textAlign: "left" }}>
            <button
              onClick={() => setShowHistory((v) => !v)}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "rgba(201,144,106,0.06)", border: `1px solid ${ROSE_BORDER}`,
                borderRadius: 10, padding: "8px 14px", cursor: "pointer",
              }}
            >
              <span style={{ fontFamily: CURSIVE, fontSize: 13, fontWeight: 700, color: "rgb(250, 240, 230)" }}>
                🏆 Your Quiz History ({attempts.length})
              </span>
              <span style={{ fontFamily: CURSIVE, fontSize: 12, color: "rgba(250,240,230,0.50)" }}>
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
                          background: "rgba(12,6,20,0.75)", border: `1px solid ${ROSE_BORDER}`,
                        }}>
                          <span style={{ fontFamily: CURSIVE, fontSize: 12, color: "rgba(250,240,230,0.60)" }}>
                            {formatDate(a.playedAt)}
                          </span>
                          <span style={{ fontFamily: CURSIVE, fontSize: 14, fontWeight: 700, color: "rgb(250, 240, 230)" }}>
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
        <span style={{ fontFamily: CURSIVE, fontSize: 11, color: "rgba(250,240,230,0.55)" }}>Question {step + 1} of {sessionQs.length}</span>
        <span style={{ fontFamily: CURSIVE, fontSize: 11, color: "rgba(250,240,230,0.55)", display: "flex", alignItems: "center", gap: 4 }}>
          <Heart size={9} style={{ fill: ROSE, color: ROSE }} />{score}
        </span>
      </div>

      <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
        {sessionQs.map((_, i) => (
          <div key={i} style={{
            height: 4, flex: 1, borderRadius: 999,
            background: i < step ? ROSE : i === step ? "rgba(201,144,106,0.45)" : "rgba(201,144,106,0.18)",
            transition: "all 0.3s",
          }} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }}>
          <p style={{ fontFamily: CURSIVE, fontSize: 15, fontWeight: 700, color: "rgb(250, 240, 230)", marginBottom: 16 }}>{q.question}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {q.options.map((opt, i) => {
              let bg = "rgba(12,6,20,0.60)";
              let border = ROSE_BORDER;
              let color = "rgba(250,240,230,0.85)";
              if (selected !== null) {
                if (i === q.correct) { bg = "rgba(120,160,100,0.18)"; border = "rgba(100,140,80,0.50)"; color = "rgb(140,200,120)"; }
                else if (selected === i) { bg = "rgba(180,80,60,0.14)"; border = "rgba(160,60,40,0.40)"; color = "rgb(200,100,80)"; }
                else { bg = "rgba(12,6,20,0.25)"; border = "rgba(201,144,106,0.08)"; color = "rgba(250,240,230,0.35)"; }
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
              color: selected !== null && q && selected === q.correct ? "rgb(140,200,120)" : ROSE,
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
  history: HistoryEntry[];
  onAddToHistory: (type: "truth" | "dare", prompt: string, ans: string, mediaUrl?: string, savedAt?: string) => void;
  onUpdateMediaUrl: (id: number, url: string) => void;
}

function TruthOrDare({ shareId, customTruthDare, history, onAddToHistory, onUpdateMediaUrl }: TruthOrDareProps) {
  type ActiveCard = { text: string; photoUrl?: string; audioUrl?: string };
  const [mode, setMode] = useState<"truth" | "dare" | null>(null);
  const [card, setCard] = useState<ActiveCard | null>(null);
  const [used, setUsed] = useState<Set<string>>(new Set());
  const [answer, setAnswer] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dareCompleted, setDareCompleted] = useState(false);
  const [completionMsg, setCompletionMsg] = useState("");
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

  const loadAudioFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => setResponseAudioUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const startRecording = useCallback(async () => {
    let stream: MediaStream;
    if (!navigator.mediaDevices?.getUserMedia) {
      audioFileInputRef.current?.click();
      return;
    }
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      audioFileInputRef.current?.click();
      return;
    }
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
    const savedAt = new Date().toISOString();
    onAddToHistory(mode ?? "truth", card.text, answer.trim(), undefined, savedAt);
    setSaved(true);
    setSaving(false);
    if (shareId) {
      fetch(`${API_URL}/darling-pages/share/${shareId}/game-response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: mode, prompt: card.text, answer: answer.trim() }),
      }).catch(() => {});
    }
  }, [answer, card, mode, shareId, onAddToHistory]);

  const handleDareComplete = useCallback(async () => {
    if (!card) return;
    const msg = DARE_COMPLETIONS[Math.floor(Math.random() * DARE_COMPLETIONS.length)];
    setCompletionMsg(msg);
    setDareCompleted(true);
    const note = answer.trim() || "Dare completed! 🔥";
    const localMediaUrl = responseAudioUrl || responsePhotoUrl || undefined;
    const savedAt = new Date().toISOString();
    const entryId = Date.now();
    onAddToHistory("dare", card.text, note, localMediaUrl, savedAt);
    if (shareId) {
      const body: Record<string, string> = { type: "dare", prompt: card.text, answer: note };
      if (responseAudioUrl) body.mediaUrl = responseAudioUrl;
      else if (responsePhotoUrl) body.mediaUrl = responsePhotoUrl;
      try {
        const res = await fetch(`${API_URL}/darling-pages/share/${shareId}/game-response`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const result = await res.json();
        if (result?.data?.mediaUrl && result.data.mediaUrl !== localMediaUrl) {
          onUpdateMediaUrl(entryId, result.data.mediaUrl);
        }
      } catch { /* ignore */ }
    }
    setResponseAudioUrl("");
    setResponsePhotoUrl("");
  }, [shareId, card, answer, onAddToHistory, onUpdateMediaUrl, responseAudioUrl, responsePhotoUrl]);

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

  const truthCount = useMemo(() => history.filter((h) => h.type === "truth").length, [history]);
  const dareCount  = useMemo(() => history.filter((h) => h.type === "dare").length,  [history]);

  return (
    <div>
      <style>{`@keyframes drl-rec-dot{0%,100%{opacity:1}50%{opacity:0.25}}`}</style>
      {/* Picker buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => pick("truth")}
          style={{
            flex: 1, padding: "10px 0", borderRadius: 12,
            background: mode === "truth" ? "rgba(140,100,180,0.18)" : "rgba(180,140,200,0.08)",
            border: mode === "truth" ? "1.5px solid rgba(140,100,180,0.35)" : "1px solid rgba(150,100,180,0.18)",
            fontFamily: CURSIVE, fontSize: 13, fontWeight: 700, color: "rgb(160,120,210)",
            cursor: "pointer", boxShadow: mode === "truth" ? "0 3px 12px rgba(140,100,180,0.15)" : "none",
          }}>
          💭 Truth {truthCount > 0 && <span style={{ fontSize: 10, opacity: 0.7 }}>({truthCount})</span>}
        </motion.button>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => pick("dare")}
          style={{
            flex: 1, padding: "10px 0", borderRadius: 12,
            background: mode === "dare" ? "rgba(201,144,106,0.18)" : "rgba(201,144,106,0.08)",
            border: mode === "dare" ? "1.5px solid rgba(201,144,106,0.35)" : "1px solid rgba(201,144,106,0.18)",
            fontFamily: CURSIVE, fontSize: 13, fontWeight: 700, color: ROSE,
            cursor: "pointer", boxShadow: mode === "dare" ? "0 3px 12px rgba(201,144,106,0.15)" : "none",
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
              borderRadius: 16, border: `1px solid ${ROSE_BORDER}`,
              background: "rgba(12,6,20,0.50)",
              padding: "28px 20px", textAlign: "center",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            }}
          >
            <span style={{ fontSize: 32 }}>🎴</span>
            <p style={{ fontFamily: CURSIVE, fontSize: 13, color: "rgba(201,144,106,0.60)", margin: 0 }}>
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
              border: mode === "truth" ? "1.5px solid rgba(140,100,180,0.28)" : "1.5px solid rgba(201,144,106,0.28)",
              background: mode === "truth" ? "rgba(140,100,180,0.08)" : "rgba(201,144,106,0.08)",
              padding: "16px 20px", marginBottom: 14,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{
                  fontFamily: CURSIVE, fontSize: 10, fontWeight: 700,
                  textTransform: "uppercase" as const, letterSpacing: "0.12em",
                  color: mode === "truth" ? "rgb(160,120,210)" : ROSE,
                  background: mode === "truth" ? "rgba(140,100,180,0.14)" : "rgba(201,144,106,0.14)",
                  padding: "2px 10px", borderRadius: 999,
                }}>
                  {mode === "truth" ? "💭 Truth" : "🎯 Dare"}
                </span>
              </div>
              <p style={{ fontFamily: CURSIVE, fontWeight: 700, color: "rgb(250, 240, 230)", fontSize: 15, margin: 0, lineHeight: 1.5 }}>
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
                    <p style={{ fontFamily: CURSIVE, fontSize: 11, color: ROSE, margin: "0 0 6px" }}>
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
                  color: "rgba(201,144,106,0.65)", textTransform: "uppercase" as const,
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
                    background: "rgba(12,6,20,0.70)",
                    border: "1.5px solid rgba(140,100,180,0.25)",
                    borderRadius: 12, padding: "10px 12px",
                    fontFamily: CURSIVE, fontSize: 13, color: "rgb(250, 240, 230)",
                    outline: "none", lineHeight: 1.6, boxSizing: "border-box",
                  }}
                  onFocus={(e) => { e.currentTarget.style.border = "1.5px solid rgba(140,100,180,0.50)"; }}
                  onBlur={(e) => { e.currentTarget.style.border = "1.5px solid rgba(140,100,180,0.25)"; }}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={handleSave} disabled={!answer.trim() || saving}
                    style={{
                      flex: 1, padding: "10px 0", borderRadius: 12, border: "none",
                      background: answer.trim() ? "linear-gradient(135deg, rgb(140,100,180), rgb(110,70,150))" : "rgba(201,144,106,0.15)",
                      color: answer.trim() ? "rgba(250,240,230,0.95)" : "rgba(201,144,106,0.40)",
                      fontFamily: CURSIVE, fontSize: 13, fontWeight: 700,
                      cursor: answer.trim() ? "pointer" : "not-allowed",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      boxShadow: answer.trim() ? "0 4px 12px rgba(140,100,180,0.30)" : "none",
                    }}>
                    <Send size={12} /> {saving ? "Saving..." : "Save Answer 💕"}
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={nextCard}
                    style={{
                      padding: "10px 16px", borderRadius: 12,
                      border: `1px solid ${ROSE_BORDER}`, background: "rgba(12,6,20,0.60)",
                      fontFamily: CURSIVE, fontSize: 12, color: ROSE, cursor: "pointer",
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
                <CheckCircle2 size={18} color="rgb(140,200,120)" style={{ margin: "0 auto 4px" }} />
                <p style={{ fontFamily: CURSIVE, fontSize: 13, fontWeight: 700, color: "rgb(140,200,120)", margin: 0 }}>
                  Answer saved! 💚
                </p>
                <p style={{
                  fontFamily: CURSIVE, fontSize: 12, color: "rgba(140,200,120,0.80)",
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
                      fontFamily: CURSIVE, fontSize: 12, color: "rgb(220,100,80)",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                    }}>
                      <span style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: "rgb(220,50,50)", display: "inline-block", flexShrink: 0,
                        animation: "drl-rec-dot 1s ease-in-out infinite",
                      }} />
                      {String(Math.floor(recordSeconds / 60)).padStart(2, "0")}:{String(recordSeconds % 60).padStart(2, "0")} · Stop
                    </button>
                  ) : (
                    <button onClick={startRecording} style={{
                      flex: 1, padding: "9px 0", borderRadius: 10,
                      border: "1.5px dashed rgba(201,144,106,0.35)",
                      background: "rgba(201,144,106,0.05)", cursor: "pointer",
                      fontFamily: CURSIVE, fontSize: 12, color: ROSE,
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
                        border: "1.5px dashed rgba(201,144,106,0.35)",
                        background: "rgba(201,144,106,0.05)", cursor: "pointer",
                        fontFamily: CURSIVE, fontSize: 12, color: ROSE,
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
                  color: "rgba(201,144,106,0.65)", textTransform: "uppercase" as const,
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
                    background: "rgba(12,6,20,0.70)",
                    border: "1.5px solid rgba(201,144,106,0.25)",
                    borderRadius: 12, padding: "10px 12px",
                    fontFamily: CURSIVE, fontSize: 13, color: "rgb(250, 240, 230)",
                    outline: "none", lineHeight: 1.6, boxSizing: "border-box",
                    marginBottom: 10,
                  }}
                  onFocus={(e) => { e.currentTarget.style.border = "1.5px solid rgba(201,144,106,0.50)"; }}
                  onBlur={(e) => { e.currentTarget.style.border = "1.5px solid rgba(201,144,106,0.25)"; }}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <motion.button whileTap={{ scale: 0.92 }} whileHover={{ scale: 1.02 }} onClick={handleDareComplete}
                    style={{
                      flex: 1, padding: "12px 0", borderRadius: 12, border: "none",
                      background: "linear-gradient(135deg, rgb(201,144,106), rgb(160,100,65))",
                      color: "rgba(250,240,230,0.95)",
                      fontFamily: CURSIVE, fontSize: 14, fontWeight: 700, cursor: "pointer",
                      boxShadow: "0 4px 16px rgba(201,144,106,0.35)",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    }}>
                    🔥 I Did It!
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={nextCard}
                    style={{
                      padding: "12px 16px", borderRadius: 12,
                      border: `1px solid ${ROSE_BORDER}`, background: "rgba(12,6,20,0.60)",
                      fontFamily: CURSIVE, fontSize: 12, color: ROSE, cursor: "pointer",
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
                  borderRadius: 14, border: "1.5px solid rgba(201,144,106,0.35)",
                  background: "rgba(201,144,106,0.10)",
                  padding: "16px", textAlign: "center", marginBottom: 10,
                }}>
                <motion.span
                  animate={{ rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.2, 1.2, 1] }}
                  transition={{ duration: 0.6 }}
                  style={{ fontSize: 32, display: "inline-block", marginBottom: 6 }}
                >🔥</motion.span>
                <p style={{ fontFamily: CURSIVE, fontSize: 14, fontWeight: 700, color: ROSE, margin: 0 }}>
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
                  background: "linear-gradient(135deg, rgb(201,144,106), rgb(160,100,65))",
                  color: "rgba(250,240,230,0.95)",
                  fontFamily: CURSIVE, fontSize: 15, fontWeight: 700, cursor: "pointer",
                  boxShadow: "0 6px 20px rgba(201,144,106,0.35)",
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
            color: "rgba(201,144,106,0.40)", cursor: "pointer",
          }}>
          ↺ Reset all
        </button>
      )}
    </div>
  );
}

const GAMES = [
  { id: "quiz",    label: "Love Quiz",    emoji: "🎯", desc: "Personalized questions each round!" },
  { id: "tod",     label: "Truth or Dare", emoji: "🎲", desc: "New challenges every time!" },
  { id: "history", label: "Our Story",    emoji: "📖", desc: "All your game moments together!" },
];

interface Props {
  data: ContentData;
  shareId?: string | null;
  quizAttempts?: QuizAttemptRecord[];
  initialGameResponses?: ServerGameResponse[];
}

export default memo(function GamesSection({ data, shareId = null, quizAttempts: initialQA = [], initialGameResponses = [] }: Props) {
  const [activeGame, setActiveGame] = useState("quiz");

  // Lifted history state — shared between TruthOrDare and GameHistory tab
  const [history, setHistory] = useState<HistoryEntry[]>(() =>
    initialGameResponses.map((r, i) => ({
      id: -(i + 1),
      type: r.type,
      prompt: r.prompt,
      answer: r.answer,
      mediaUrl: r.mediaUrl,
      savedAt: r.savedAt,
    }))
  );

  // Lifted quiz attempts state — controlled here so self-fetch can update it
  const [quizAttempts, setQuizAttempts] = useState<QuizAttemptRecord[]>(initialQA);

  // Self-fetch on mount to guarantee fresh data after refresh
  useEffect(() => {
    if (!shareId) return;
    fetch(`${API_URL}/darling-pages/share/${shareId}`)
      .then((r) => r.json())
      .then((result) => {
        if (!result.success || !result.data) return;
        const responses: ServerGameResponse[] = Array.isArray(result.data.gameResponses)
          ? result.data.gameResponses : [];
        const attempts: QuizAttemptRecord[] = Array.isArray(result.data.quizAttempts)
          ? result.data.quizAttempts : [];
        setHistory(responses.map((r, i) => ({
          id: -(i + 1),
          type: r.type,
          prompt: r.prompt,
          answer: r.answer,
          mediaUrl: r.mediaUrl,
          savedAt: r.savedAt,
        })));
        setQuizAttempts(attempts);
      })
      .catch(() => {});
  }, [shareId]);

  const addToHistory = useCallback((
    type: "truth" | "dare", prompt: string, ans: string, mediaUrl?: string, savedAt?: string
  ) => {
    const id = Date.now();
    setHistory((prev) => [{
      id, type, prompt, answer: ans,
      ...(mediaUrl  && { mediaUrl }),
      ...(savedAt   && { savedAt }),
    }, ...prev]);
  }, []);

  const updateHistoryMediaUrl = useCallback((id: number, url: string) => {
    setHistory((prev) => prev.map((e) => e.id === id ? { ...e, mediaUrl: url } : e));
  }, []);

  const addQuizAttempt = useCallback((attempt: QuizAttemptRecord) => {
    setQuizAttempts((prev) => [attempt, ...prev]);
  }, []);

  // Convert QuizAttemptRecord[] to QuizRecord[] (same shape, just different name)
  const quizRecords = quizAttempts as QuizRecord[];

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
            fontWeight: 700, color: "rgb(250, 240, 230)", margin: 0,
            textShadow: "0 2px 8px rgba(0,0,0,0.4)",
          }}>
            Love Games 🎮
          </h2>
          <p style={{ fontFamily: CURSIVE, fontSize: 13, color: "rgba(201,144,106,0.70)", marginTop: 4 }}>Play together, grow closer</p>
        </div>

        <div className="lg:flex lg:gap-8 lg:items-start">
          {/* Game picker */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 16 }}
            className="lg:flex lg:flex-col lg:w-52 lg:shrink-0 lg:mb-0 lg:gap-3"
          >
            {GAMES.map((g) => {
              const isActive = activeGame === g.id;
              return (
                <motion.button key={g.id} whileTap={{ scale: 0.97 }} onClick={() => setActiveGame(g.id)}
                  style={{
                    borderRadius: 16,
                    border: isActive ? "1.5px solid rgba(201,144,106,0.45)" : `1px solid ${ROSE_BORDER}`,
                    padding: "14px 16px", textAlign: "left",
                    background: isActive ? DARK_SOLID : "rgba(12,6,20,0.55)",
                    boxShadow: isActive ? "0 6px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(201,144,106,0.12)" : "none",
                    cursor: "pointer", transition: "all 0.2s",
                  }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{g.emoji}</div>
                  <p style={{
                    fontFamily: CURSIVE, fontWeight: 700, fontSize: 14,
                    color: isActive ? "rgb(250, 240, 230)" : "rgba(250,240,230,0.70)", margin: 0,
                  }}>{g.label}</p>
                  <p style={{ fontFamily: CURSIVE, fontSize: 10, color: "rgba(201,144,106,0.55)", marginTop: 2 }}>{g.desc}</p>
                  {isActive && (
                    <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${ROSE}, transparent)`, borderRadius: 999, marginTop: 8 }} />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Game content */}
          <motion.div key={activeGame} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{
              borderRadius: 20, border: `1px solid ${ROSE_BORDER}`,
              background: DARK_CARD, padding: 16,
              boxShadow: "0 6px 24px rgba(0,0,0,0.30)",
            }}
            className="lg:p-6 lg:flex-1"
          >
            {activeGame === "quiz" && (
              <LoveQuiz questions={data.quizQuestions || []} shareId={shareId} attempts={quizAttempts} onAttemptAdded={addQuizAttempt} />
            )}
            {activeGame === "tod" && (
              <TruthOrDare
                shareId={shareId}
                customTruthDare={data.truthDareQuestions || []}
                history={history}
                onAddToHistory={addToHistory}
                onUpdateMediaUrl={updateHistoryMediaUrl}
              />
            )}
            {activeGame === "history" && (
              <GameHistory history={history} quizAttempts={quizRecords} />
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
});
