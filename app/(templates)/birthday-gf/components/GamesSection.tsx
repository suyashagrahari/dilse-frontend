"use client";

import { memo, useState, useCallback, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Send, CheckCircle2 } from "lucide-react";
import type { BirthdayData, QuizQuestion, TruthDareItem } from "./types";
import { API_URL } from "@/lib/config";
import FlowerBackground from "./FlowerBackground";
import MiniAudioPlayer from "./MiniAudioPlayer";

const BROWN = "#5D3F31";
const WARM = "rgb(108, 74, 46)";
const TERRACOTTA = "#AD684A";
const WARM_BORDER = "rgba(173, 104, 74, 0.22)";
const CREAM_CARD = "rgba(250, 248, 242, 0.95)";
const CREAM_SOLID = "rgba(245, 237, 224, 0.98)";
const CURSIVE = "'Great Vibes', cursive";
const SERIF = "'Cormorant Garamond', Georgia, serif";

export interface QuizAttemptRecord {
  score: number;
  total: number;
  playedAt: string;
}

export interface QuizAnswerRecord {
  question: string;
  options: string[];
  selected: number;
  correct: number;
  isCorrect: boolean;
  answeredAt: string;
}

export interface ServerGameResponse {
  type: "truth" | "dare";
  prompt: string;
  answer: string;
  savedAt?: string;
  mediaUrl?: string;
}

export interface ServerQuizAnswer {
  question: string;
  options: string[];
  selected: number;
  correct: number;
  isCorrect: boolean;
  answeredAt?: string;
}

export interface HistoryEntry {
  id: number;
  type: "truth" | "dare";
  prompt: string;
  answer: string;
  mediaUrl?: string;
  savedAt?: string;
}

const QUIZ_POOL: QuizQuestion[] = [
  { question: "What is the birthday person's favourite colour?", options: ["Pink 🌸", "Blue 💙", "Yellow 🌟", "Purple 💜"], correct: 0 },
  { question: "What would be their dream birthday cake?", options: ["Chocolate fudge 🍫", "Strawberry cream 🍓", "Red velvet ❤️", "Lemon drizzle 🍋"], correct: 0 },
  { question: "What's their idea of a perfect birthday?", options: ["Party with friends 🎉", "Cozy day at home 🏠", "Adventure trip 🌍", "Fancy dinner 🍽️"], correct: 0 },
  { question: "What gift would make them happiest?", options: ["Surprise trip ✈️", "Heartfelt letter 💌", "Spa day 💆", "Tech gadget 📱"], correct: 0 },
  { question: "What decade were they born in?", options: ["90s 🎵", "2000s 💻", "80s 🕺", "70s 🌈"], correct: 0 },
  { question: "What's their go-to celebration drink?", options: ["Champagne 🥂", "Mocktail 🍹", "Hot chocolate ☕", "Fresh juice 🍊"], correct: 0 },
  { question: "What's their favourite birthday tradition?", options: ["Midnight countdown 🕛", "Birthday breakfast in bed 🥞", "Candle wish 🕯️", "Birthday song surprise 🎂"], correct: 0 },
  { question: "What's their hidden talent they rarely show?", options: ["Singing 🎤", "Cooking 👨‍🍳", "Dancing 💃", "Drawing 🎨"], correct: 0 },
  { question: "What emoji best describes them on their birthday?", options: ["🥳 Party mode", "😊 Grateful & happy", "😍 Feeling loved", "🤩 Absolutely thrilled"], correct: 0 },
  { question: "What would they wish for if they could have anything?", options: ["World peace 🌍", "Endless adventures ✈️", "Good health always 💪", "More birthdays like this 🎂"], correct: 0 },
];

const CORRECT_MSGS = [
  "Birthday genius! 🎂",
  "You know them so well! 🎉",
  "Perfect! Just like this birthday! 🥳",
  "Spot on, birthday expert! 🎯",
  "Amazing! You're the best gift! 🎁",
  "Right on the candles! 🕯️",
];

const WRONG_MSGS = [
  "Almost! But the birthday vibes are still perfect! 🎊",
  "Oops! Time for more birthday chats! 🎈",
  "Not quite — but you're still invited to the party! 🥳",
  "Wrong answer, but you're still amazing! 🎂",
  "Hmm! Guess you need more cake and more chats! 🍰",
  "So close! But every guess is wrapped with love! 🎁",
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

function formatTime(iso?: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    if (days === 1) return "yesterday";
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch { return ""; }
}

function isAudioUrl(url: string) {
  return url.startsWith("data:audio/") || /\.(mp3|wav|webm|ogg|m4a|aac)(\?|$)/i.test(url);
}

function isImageUrl(url: string) {
  return url.startsWith("data:image/") || /\.(webp|jpg|jpeg|png|gif|avif)(\?|$)/i.test(url);
}

// ── Inline GameHistory ────────────────────────────────────────────────────────

type FilterType = "all" | "truth" | "dare" | "quiz";

const FILTER_TABS: { id: FilterType; label: string; emoji: string }[] = [
  { id: "all",   label: "All",   emoji: "🎂" },
  { id: "truth", label: "Truth", emoji: "💭" },
  { id: "dare",  label: "Dare",  emoji: "🎲" },
  { id: "quiz",  label: "Quiz",  emoji: "🏆" },
];

function QuizAnswerCard({ answer, idx, delay }: { answer: QuizAnswerRecord; idx: number; delay: number }) {
  const [open, setOpen] = useState(false);
  const isCorrect = answer.isCorrect;
  const accent = isCorrect ? "rgb(55,125,75)" : TERRACOTTA;
  const bg = isCorrect ? "rgba(55,160,95,0.05)" : "rgba(173,104,74,0.05)";
  const border = isCorrect ? "rgba(55,125,75,0.18)" : "rgba(173,104,74,0.20)";
  const bar = isCorrect ? "rgba(55,125,75,0.45)" : "rgba(173,104,74,0.50)";
  return (
    <motion.div layout key={`qa-${idx}`}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 340, damping: 28 }}
      style={{ borderRadius: 12, border: `1px solid ${border}`, background: bg, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 3, bottom: 0, borderRadius: "12px 0 0 12px", background: bar }} />
      <button onClick={() => setOpen(v => !v)} style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "9px 12px 9px 16px", display: "flex", alignItems: "center", gap: 10, textAlign: "left" }}>
        <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, background: isCorrect ? "rgba(55,125,75,0.14)" : "rgba(173,104,74,0.14)", color: accent }}>
          {isCorrect ? "✓" : "✗"}
        </span>
        <span style={{ flex: 1, fontFamily: SERIF, fontSize: 13, fontWeight: 600, color: WARM, lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: open ? undefined : 2, WebkitBoxOrient: "vertical" as const }}>
          {answer.question}
        </span>
        <span style={{ fontSize: 9, color: "rgba(108,74,46,0.38)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.18s", display: "inline-block", flexShrink: 0 }}>▼</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2, ease: "easeInOut" }} style={{ overflow: "hidden" }}>
            <div style={{ borderTop: `1px solid ${border}`, padding: "8px 16px 10px" }}>
              {answer.options.map((opt, oi) => {
                const isSel = oi === answer.selected;
                const isRight = oi === answer.correct;
                let optBg = "transparent"; let optColor = "rgba(90,60,35,0.38)"; let w = 400;
                if (isRight) { optBg = "rgba(55,125,75,0.09)"; optColor = "rgb(45,115,65)"; w = 700; }
                else if (isSel && !isRight) { optBg = "rgba(173,104,74,0.09)"; optColor = TERRACOTTA; w = 600; }
                return (
                  <div key={oi} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 8px", borderRadius: 8, background: optBg }}>
                    <span style={{ fontSize: 11, color: optColor, fontWeight: 700, flexShrink: 0 }}>{isRight ? "✓" : isSel ? "✗" : "·"}</span>
                    <span style={{ fontFamily: SERIF, fontSize: 12, color: optColor, fontWeight: w, lineHeight: 1.4 }}>{opt}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function GameHistory({ entries, quizRecords, quizAnswers = [] }: { entries: HistoryEntry[]; quizRecords: QuizAttemptRecord[]; quizAnswers?: QuizAnswerRecord[] }) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [expandedAttempts, setExpandedAttempts] = useState<Set<number>>(new Set());

  const toggleExpand = (key: string) => setExpandedKeys(prev => {
    const next = new Set(prev); if (next.has(key)) next.delete(key); else next.add(key); return next;
  });
  const toggleAttempt = (idx: number) => setExpandedAttempts(prev => {
    const next = new Set(prev); if (next.has(idx)) next.delete(idx); else next.add(idx); return next;
  });

  const truthCount = useMemo(() => entries.filter(e => e.type === "truth").length, [entries]);
  const dareCount  = useMemo(() => entries.filter(e => e.type === "dare").length,  [entries]);
  const bestQuiz   = useMemo(() => {
    if (!quizRecords.length) return null;
    const best = quizRecords.reduce((b, a) => a.total > 0 && a.score / a.total > b.score / b.total ? a : b);
    return `${best.score}/${best.total}`;
  }, [quizRecords]);

  // Group quiz answers by session (each attempt.total answers belong to one session)
  const quizSessions = useMemo(() => {
    const sessions: QuizAnswerRecord[][] = [];
    let offset = 0;
    quizRecords.forEach(attempt => {
      sessions.push(quizAnswers.slice(offset, offset + attempt.total));
      offset += attempt.total;
    });
    return sessions;
  }, [quizAnswers, quizRecords]);

  const total = entries.length + quizRecords.length;
  if (total === 0 && quizAnswers.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", padding: "36px 16px" }}>
        <span style={{ fontSize: 52, display: "block", marginBottom: 12 }}>🎮</span>
        <p style={{ fontFamily: CURSIVE, fontSize: 22, color: WARM, margin: "0 0 8px" }}>No history yet</p>
        <p style={{ fontFamily: SERIF, fontSize: 14, color: "rgba(108,74,46,0.55)", margin: 0, lineHeight: 1.6 }}>
          Play Birthday Truth or Dare and Quizzes — your story appears here 🎂
        </p>
      </motion.div>
    );
  }

  const todEntries = filter === "quiz" ? [] : filter === "all" ? entries : entries.filter(e => e.type === filter);
  const showQuiz = filter === "all" || filter === "quiz";

  return (
    <div>
      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[
          { emoji: "🎮", value: entries.length + quizRecords.length, label: "Total",    color: WARM },
          { emoji: "💭", value: truthCount,                          label: "Truths",   color: BROWN },
          { emoji: "🎲", value: dareCount,                           label: "Dares",    color: TERRACOTTA },
          { emoji: "🏆", value: bestQuiz ?? "--",                    label: "Best quiz",color: "rgb(55,125,75)" },
        ].map((s) => (
          <div key={s.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "10px 4px", borderRadius: 14, background: "rgba(250,245,237,0.85)", border: `1px solid ${WARM_BORDER}`, boxShadow: "0 2px 8px rgba(80,50,20,0.06)" }}>
            <span style={{ fontSize: 18 }}>{s.emoji}</span>
            <span style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</span>
            <span style={{ fontFamily: SERIF, fontSize: 10, color: "rgba(108,74,46,0.50)", textAlign: "center" }}>{s.label}</span>
          </div>
        ))}
      </motion.div>

      {/* Filter pills */}
      <style>{`.bgf-filter-scroll::-webkit-scrollbar{height:3px}.bgf-filter-scroll::-webkit-scrollbar-track{background:transparent}.bgf-filter-scroll::-webkit-scrollbar-thumb{background:rgba(173,104,74,0.28);border-radius:999px}.bgf-filter-scroll{scrollbar-width:thin;scrollbar-color:rgba(173,104,74,0.28) transparent}`}</style>
      <div className="bgf-filter-scroll" style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto", paddingBottom: 4 , marginTop: 16}}>
        {FILTER_TABS.map(tab => (
          <motion.button key={tab.id} whileTap={{ scale: 0.93 }} onClick={() => setFilter(tab.id)}
            style={{ flexShrink: 0, padding: "6px 16px", borderRadius: 999, border: filter === tab.id ? `1.5px solid rgba(173,104,74,0.45)` : `1px solid ${WARM_BORDER}`, background: filter === tab.id ? "rgba(173,104,74,0.14)" : "transparent", fontFamily: SERIF, fontSize: 12, fontWeight: filter === tab.id ? 700 : 400, color: filter === tab.id ? WARM : "rgba(108,74,46,0.50)", cursor: "pointer", transition: "all 0.15s" }}>
            {tab.emoji} {tab.label}
          </motion.button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* ── Quiz attempt cards (each expandable to show its Q&A) ── */}
        {showQuiz && quizRecords.map((attempt, ai) => {
          const pct = attempt.total > 0 ? attempt.score / attempt.total : 0;
          const em = pct === 1 ? "👑" : pct >= 0.7 ? "🎉" : pct >= 0.4 ? "🎂" : "🎊";
          const msg = pct === 1 ? "Perfect score!" : pct >= 0.7 ? "Amazing!" : pct >= 0.4 ? "Good try!" : "Keep going!";
          const green = "rgb(55,125,75)";
          const isOpen = expandedAttempts.has(ai);
          const sessionAnswers = quizSessions[ai] || [];
          return (
            <motion.div key={`qa-session-${ai}`} layout
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: ai * 0.04, type: "spring", stiffness: 320, damping: 26 }}
              style={{ borderRadius: 14, border: "1px solid rgba(55,125,75,0.20)", background: "rgba(55,160,95,0.05)", overflow: "hidden", position: "relative" }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: 3, bottom: 0, borderRadius: "14px 0 0 14px", background: "rgba(55,125,75,0.45)" }} />
              {/* Summary row — click to expand */}
              <button onClick={() => toggleAttempt(ai)}
                style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "12px 14px 12px 18px", display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>{em}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontFamily: SERIF, fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: green, background: "rgba(55,125,75,0.10)", padding: "2px 9px", borderRadius: 999 }}>🏆 Quiz</span>
                    {attempt.playedAt && <span style={{ fontFamily: SERIF, fontSize: 10, color: "rgba(108,74,46,0.38)" }}>{formatTime(attempt.playedAt)}</span>}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 5 }}>
                    <span style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: green }}>{attempt.score}/{attempt.total}</span>
                    <span style={{ fontFamily: SERIF, fontSize: 11, color: "rgba(55,125,75,0.65)" }}>{msg}</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 999, background: "rgba(55,125,75,0.12)", overflow: "hidden" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct * 100}%` }} transition={{ duration: 0.8, delay: ai * 0.04 + 0.2, ease: "easeOut" }}
                      style={{ height: "100%", borderRadius: 999, background: green }} />
                  </div>
                </div>
                {sessionAnswers.length > 0 && (
                  <span style={{ fontSize: 9, color: "rgba(55,125,75,0.50)", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.18s", display: "inline-block", flexShrink: 0 }}>▼</span>
                )}
              </button>
              {/* Expandable Q&A list for this session */}
              <AnimatePresence>
                {isOpen && sessionAnswers.length > 0 && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: "easeInOut" }} style={{ overflow: "hidden" }}>
                    <div style={{ borderTop: "1px solid rgba(55,125,75,0.14)", padding: "10px 12px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
                      {sessionAnswers.map((ans, qi) => (
                        <QuizAnswerCard key={qi} answer={ans} idx={qi} delay={qi * 0.025} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {/* ── Truth / Dare accordion cards ── */}
        {todEntries.map((entry, i) => {
          const isTruth = entry.type === "truth";
          const c = isTruth
            ? { accent: BROWN, bg: "rgba(93,63,49,0.05)", border: "rgba(93,63,49,0.16)", bar: "rgba(93,63,49,0.45)" }
            : { accent: TERRACOTTA, bg: "rgba(173,104,74,0.05)", border: "rgba(173,104,74,0.18)", bar: "rgba(173,104,74,0.50)" };
          const key = `t-${entry.id}`;
          const isOpen = expandedKeys.has(key);
          return (
            <motion.div key={key} layout
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
              transition={{ delay: i * 0.025, type: "spring", stiffness: 340, damping: 28 }}
              style={{ borderRadius: 14, border: `1px solid ${c.border}`, background: c.bg, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: 3, bottom: 0, borderRadius: "14px 0 0 14px", background: c.bar }} />
              <button onClick={() => toggleExpand(key)}
                style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "10px 12px 10px 18px", display: "flex", alignItems: "center", gap: 10, textAlign: "left" }}>
                <span style={{ flexShrink: 0, fontFamily: SERIF, fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: c.accent, background: `${c.accent}16`, padding: "3px 9px", borderRadius: 999 }}>
                  {isTruth ? "💭 Truth" : "🎲 Dare"}
                </span>
                <span style={{ flex: 1, fontFamily: SERIF, fontSize: 13, fontWeight: 600, color: WARM, lineHeight: 1.45, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: isOpen ? undefined : 2, WebkitBoxOrient: "vertical" as const }}>
                  {entry.prompt}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  {entry.savedAt && <span style={{ fontFamily: SERIF, fontSize: 10, color: "rgba(108,74,46,0.38)" }}>{formatTime(entry.savedAt)}</span>}
                  <span style={{ fontSize: 9, color: "rgba(108,74,46,0.38)", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.18s", display: "inline-block" }}>▼</span>
                </div>
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: "easeInOut" }} style={{ overflow: "hidden" }}>
                    <div style={{ borderTop: `1px solid ${c.border}`, padding: "10px 18px 12px" }}>
                      <p style={{ fontFamily: SERIF, fontSize: 13, fontStyle: "italic", color: "rgba(80,55,30,0.85)", margin: 0, lineHeight: 1.65 }}>
                        {isTruth ? `"${entry.answer}"` : `✓ ${entry.answer}`}
                      </p>
                      {entry.mediaUrl && isAudioUrl(entry.mediaUrl) && (
                        <div style={{ marginTop: 10 }}>
                          <MiniAudioPlayer src={entry.mediaUrl} accentColor={c.accent} bgColor={`${c.accent}08`} borderColor={c.border} />
                        </div>
                      )}
                      {entry.mediaUrl && isImageUrl(entry.mediaUrl) && (
                        <div style={{ marginTop: 8, borderRadius: 10, overflow: "hidden" }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={entry.mediaUrl} alt="response" loading="lazy" style={{ width: "100%", maxHeight: 180, objectFit: "cover", display: "block" }} />
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {/* Empty state */}
        {todEntries.length === 0 && (!showQuiz || quizRecords.length === 0) && (
          <p style={{ fontFamily: SERIF, fontSize: 13, color: "rgba(108,74,46,0.50)", textAlign: "center", padding: "20px 0" }}>
            No {filter} entries yet 🎂
          </p>
        )}
      </div>
    </div>
  );
}

// ── Birthday Quiz ────────────────────────────────────────────────────────────

interface BirthdayQuizProps {
  questions: QuizQuestion[];
  shareId: string | null;
  attempts: QuizAttemptRecord[];
  onAttemptAdded: (a: QuizAttemptRecord) => void;
  onAnswerAdded: (a: QuizAnswerRecord) => void;
}

function BirthdayQuiz({ questions: customQs, shareId, attempts, onAttemptAdded, onAnswerAdded }: BirthdayQuizProps) {
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
    onAnswerAdded({ question: q.question, options: q.options, selected: i, correct: q.correct, isCorrect, answeredAt: new Date().toISOString() });
    setTimeout(() => {
      setFeedback("");
      if (step + 1 < sessionQs.length) { setStep((s) => s + 1); setSelected(null); }
      else setDone(true);
    }, 1800);
  }, [selected, q, step, sessionQs.length, onAnswerAdded]);

  const finishAndSave = useCallback(async (finalScore: number, total: number) => {
    const newAttempt: QuizAttemptRecord = { score: finalScore, total, playedAt: new Date().toISOString() };
    onAttemptAdded(newAttempt);
    if (shareId) {
      setSavingAttempt(true);
      try {
        await fetch(`${API_URL}/birthday-gf-pages/share/${shareId}/quiz-attempt`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ score: finalScore, total }),
        });
      } catch { /* ignore */ } finally { setSavingAttempt(false); }
    }
  }, [shareId, onAttemptAdded]);

  useEffect(() => {
    if (done && sessionQs.length > 0) finishAndSave(score, sessionQs.length);
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
    const emoji = pct === 1 ? "🎂" : pct >= 0.7 ? "🎉" : pct >= 0.4 ? "🥳" : "🎊";
    const msg = pct === 1 ? "PERFECT! Birthday expert supreme!" : pct >= 0.7 ? "Amazing! You really know them!" : pct >= 0.4 ? "Pretty good! More birthday chats needed!" : "Time for some birthday trivia practice! 🎈";
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ fontSize: 52, display: "inline-block", marginBottom: 8 }}>{emoji}</motion.span>
        <h3 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, color: WARM, margin: 0 }}>{score} / {total}</h3>
        <p style={{ fontFamily: SERIF, fontSize: 13, color: "rgba(108,74,46,0.60)", margin: "4px 0 20px" }}>{msg}</p>
        <button onClick={restart}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "10px 24px", borderRadius: 12, border: "none",
            background: `linear-gradient(135deg, ${TERRACOTTA}, ${BROWN})`,
            color: "rgba(250,245,237,0.95)", fontFamily: SERIF, fontSize: 13, fontWeight: 700,
            cursor: "pointer", boxShadow: "0 4px 14px rgba(80,50,20,0.22)",
          }}>
          <RotateCcw size={13} /> Play Again 🎂
        </button>
        {savingAttempt && <p style={{ fontFamily: SERIF, fontSize: 11, color: "rgba(108,74,46,0.45)", marginTop: 8 }}>Saving...</p>}

        {attempts.length > 0 && (
          <div style={{ marginTop: 24, textAlign: "left" }}>
            <button onClick={() => setShowHistory((v) => !v)}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "rgba(173,104,74,0.06)", border: `1px solid ${WARM_BORDER}`,
                borderRadius: 10, padding: "8px 14px", cursor: "pointer",
              }}>
              <span style={{ fontFamily: SERIF, fontSize: 13, fontWeight: 700, color: WARM }}>🏆 Your Quiz History ({attempts.length})</span>
              <span style={{ fontFamily: SERIF, fontSize: 12, color: "rgba(108,74,46,0.50)" }}>{showHistory ? "▲" : "▼"}</span>
            </button>
            <AnimatePresence>
              {showHistory && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                    {attempts.map((a, idx) => {
                      const p = a.total > 0 ? a.score / a.total : 0;
                      const em = p === 1 ? "🎂" : p >= 0.7 ? "🎉" : p >= 0.4 ? "🥳" : "🎊";
                      return (
                        <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: 8, background: "rgba(255,252,246,0.7)", border: `1px solid ${WARM_BORDER}` }}>
                          <span style={{ fontFamily: SERIF, fontSize: 12, color: "rgba(108,74,46,0.60)" }}>{formatDate(a.playedAt)}</span>
                          <span style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 700, color: WARM }}>{em} {a.score}/{a.total}</span>
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontFamily: SERIF, fontSize: 13, fontWeight: 600, color: WARM, letterSpacing: "0.02em" }}>Question {step + 1} of {sessionQs.length}</span>
        <span style={{ fontFamily: SERIF, fontSize: 13, fontWeight: 600, color: TERRACOTTA, display: "flex", alignItems: "center", gap: 4 }}>Score: {score}</span>
      </div>
      <div style={{ display: "flex", gap: 3, marginBottom: 18 }}>
        {sessionQs.map((_, i) => (
          <div key={i} style={{ height: 4, flex: 1, borderRadius: 999, background: i < step ? TERRACOTTA : i === step ? "rgba(173,104,74,0.45)" : "rgba(173,104,74,0.18)", transition: "all 0.3s" }} />
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }}>
          <div style={{
            background: "rgba(93,63,49,0.06)", borderRadius: 14,
            border: `1px solid rgba(93,63,49,0.12)`,
            padding: "14px 16px", marginBottom: 18,
          }}>
            <p style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, color: WARM, margin: 0, lineHeight: 1.55 }}>{q.question}</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {q.options.map((opt, i) => {
              const letters = ["A", "B", "C", "D"];
              let bg = "rgba(250,245,237,0.60)";
              let border = WARM_BORDER;
              let color = "rgb(90,60,35)";
              let letterBg = "rgba(173,104,74,0.10)";
              if (selected !== null) {
                if (i === q.correct) { bg = "rgba(120,160,100,0.18)"; border = "rgba(100,140,80,0.50)"; color = "rgb(70,120,60)"; letterBg = "rgba(100,140,80,0.20)"; }
                else if (selected === i) { bg = "rgba(173,104,74,0.18)"; border = "rgba(173,104,74,0.50)"; color = BROWN; letterBg = "rgba(173,104,74,0.20)"; }
                else { bg = "rgba(250,245,237,0.25)"; border = "rgba(173,104,74,0.08)"; color = "rgba(90,60,35,0.35)"; letterBg = "rgba(173,104,74,0.05)"; }
              }
              return (
                <motion.button key={i} whileTap={{ scale: 0.97 }} onClick={() => handleAnswer(i)}
                  style={{
                    padding: "12px 14px", borderRadius: 12, textAlign: "left",
                    border: `1.5px solid ${border}`, background: bg,
                    fontFamily: SERIF, fontSize: 14, fontWeight: 500, color,
                    cursor: "pointer", transition: "all 0.2s",
                    display: "flex", alignItems: "center", gap: 12,
                  }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: 8, display: "flex",
                    alignItems: "center", justifyContent: "center", flexShrink: 0,
                    background: letterBg, fontFamily: SERIF, fontSize: 13,
                    fontWeight: 700, color,
                  }}>{letters[i] || i + 1}</span>
                  <span style={{ lineHeight: 1.5 }}>{opt}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
      <AnimatePresence>
        {feedback && (
          <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 600, textAlign: "center", marginTop: 14, padding: "10px 16px", borderRadius: 10, background: selected !== null && q && selected === q.correct ? "rgba(120,160,100,0.12)" : "rgba(173,104,74,0.08)", color: selected !== null && q && selected === q.correct ? "rgb(70,120,60)" : WARM }}>
            {feedback}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Default Truth/Dare pools ─────────────────────────────────────────────────

const DEFAULT_TRUTHS = [
  "What's your favourite memory of the birthday person? 🎂",
  "What quality do you admire most about them? 💛",
  "What's the funniest thing they've ever done? 😂",
  "What gift would you give them if money was no object? 🎁",
  "What's one birthday wish you'd make for them? 🕯️",
  "What's something they've taught you? 🌟",
  "Describe them in three birthday-themed words! 🥳",
  "What's your favourite inside joke with them? 🤫",
  "If you wrote them a birthday card right now, what would it say? 💌",
  "What's one adventure you'd love to go on with them? ✈️",
  "What birthday tradition do you love sharing with them? 🎉",
  "What makes them the best person to celebrate birthdays with? 🎈",
];

const DEFAULT_DARES = [
  "Sing Happy Birthday in the most dramatic way possible! 🎤",
  "Do your best impression of the birthday person right now! 🎭",
  "Send them a voice note saying why they're amazing! 🎙️",
  "List 5 reasons they deserve the best birthday! ✍️",
  "Do a birthday dance move for 10 seconds! 💃",
  "Make a birthday toast out loud — be heartfelt! 🥂",
  "Call or text them a birthday surprise message right now! 📱",
  "Take the most festive selfie you can and show everyone! 🤳",
  "Plan their perfect birthday day in 60 seconds! ⏱️",
  "Dedicate a birthday song to them — sing the chorus! 🎵",
  "Write a birthday limerick about them on the spot! 📝",
  "Give them your best birthday wish using only emojis! 🎊",
];

const DARE_COMPLETIONS = [
  "Birthday legend! That was epic! 🎂",
  "Challenge crushed! 💪",
  "Absolutely nailed it! 🎉",
  "The birthday star would be proud! 🥳",
  "That was amazing — you're the gift! 🎁",
];

// ── Truth or Dare ─────────────────────────────────────────────────────────────

interface TruthOrDareProps {
  shareId: string | null;
  customTruthDare: TruthDareItem[];
  history: HistoryEntry[];
  onAddToHistory: (type: "truth" | "dare", prompt: string, ans: string, mediaUrl?: string, savedAt?: string) => void;
  onUpdateMediaUrl: (id: number, url: string) => void;
  onRecordingChange?: (active: boolean) => void;
}

function TruthOrDare({ shareId, customTruthDare, history, onAddToHistory, onUpdateMediaUrl, onRecordingChange }: TruthOrDareProps) {
  type ActiveCard = { text: string };
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
    return [...customs, ...DEFAULT_TRUTHS.map((t) => ({ text: t }))];
  }, [customTruthDare]);

  const getDares = useCallback((): ActiveCard[] => {
    const customs = customTruthDare.filter((q) => q.type === "dare").map((q) => ({ text: q.text }));
    return [...customs, ...DEFAULT_DARES.map((t) => ({ text: t }))];
  }, [customTruthDare]);

  const loadAudioFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => setResponseAudioUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const startRecording = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      audioFileInputRef.current?.click();
      return;
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      audioFileInputRef.current?.click();
      return;
    }
    let mimeType = "";
    for (const c of ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"]) {
      try { if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(c)) { mimeType = c; break; } } catch {}
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
    onRecordingChange?.(true);
    setRecordSeconds(0);
    recordTimerRef.current = setInterval(() => setRecordSeconds((s) => s + 1), 1000);
  }, [onRecordingChange]);

  const stopRecording = useCallback(() => {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setRecording(false);
    onRecordingChange?.(false);
    if (recordTimerRef.current) { clearInterval(recordTimerRef.current); recordTimerRef.current = null; }
  }, [onRecordingChange]);

  const pick = useCallback((m: "truth" | "dare") => {
    setMode(m);
    const arr = m === "truth" ? getTruths() : getDares();
    const available = arr.filter((t) => !used.has(t.text));
    const pool = available.length > 0 ? available : arr;
    const choice = pool[Math.floor(Math.random() * pool.length)];
    setCard(choice);
    setUsed((prev) => new Set(prev).add(choice.text));
    setAnswer(""); setSaved(false); setDareCompleted(false); setCompletionMsg("");
    setResponseAudioUrl(""); setResponsePhotoUrl("");
    setTimeout(() => textareaRef.current?.focus(), 300);
  }, [used, getTruths, getDares]);

  const handleSave = useCallback(async () => {
    if (!answer.trim() || !card) return;
    setSaving(true);
    const savedAt = new Date().toISOString();
    const localMediaUrl = responseAudioUrl || responsePhotoUrl || undefined;
    const entryId = Date.now();
    onAddToHistory(mode ?? "truth", card.text, answer.trim(), localMediaUrl, savedAt);
    setSaved(true);
    setSaving(false);
    if (shareId) {
      const body: Record<string, string> = { type: mode ?? "truth", prompt: card.text, answer: answer.trim() };
      if (responseAudioUrl) body.mediaUrl = responseAudioUrl;
      else if (responsePhotoUrl) body.mediaUrl = responsePhotoUrl;
      try {
        const res = await fetch(`${API_URL}/birthday-gf-pages/share/${shareId}/game-response`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const result = await res.json();
        if (result?.data?.mediaUrl && result.data.mediaUrl !== localMediaUrl) {
          onUpdateMediaUrl(entryId, result.data.mediaUrl);
        }
      } catch {}
    }
    setResponseAudioUrl("");
    setResponsePhotoUrl("");
  }, [answer, card, mode, shareId, onAddToHistory, onUpdateMediaUrl, responseAudioUrl, responsePhotoUrl]);

  const handleDareComplete = useCallback(async () => {
    if (!card) return;
    const msg = DARE_COMPLETIONS[Math.floor(Math.random() * DARE_COMPLETIONS.length)];
    setCompletionMsg(msg);
    setDareCompleted(true);
    const note = answer.trim() || "Dare completed! 🎉";
    const localMediaUrl = responseAudioUrl || responsePhotoUrl || undefined;
    const savedAt = new Date().toISOString();
    const entryId = Date.now();
    onAddToHistory("dare", card.text, note, localMediaUrl, savedAt);
    if (shareId) {
      const body: Record<string, string> = { type: "dare", prompt: card.text, answer: note };
      if (responseAudioUrl) body.mediaUrl = responseAudioUrl;
      else if (responsePhotoUrl) body.mediaUrl = responsePhotoUrl;
      try {
        const res = await fetch(`${API_URL}/birthday-gf-pages/share/${shareId}/game-response`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const result = await res.json();
        if (result?.data?.mediaUrl && result.data.mediaUrl !== localMediaUrl) {
          onUpdateMediaUrl(entryId, result.data.mediaUrl);
        }
      } catch {}
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
      <style>{`@keyframes bgf-rec-dot{0%,100%{opacity:1}50%{opacity:0.25}}`}</style>
      {/* Picker buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => pick("truth")}
          style={{
            flex: 1, padding: "12px 0", borderRadius: 12,
            background: mode === "truth" ? "rgba(93,63,49,0.18)" : "rgba(93,63,49,0.08)",
            border: mode === "truth" ? `1.5px solid rgba(93,63,49,0.35)` : `1px solid rgba(93,63,49,0.15)`,
            fontFamily: SERIF, fontSize: 14, fontWeight: 700, color: BROWN,
            cursor: "pointer", boxShadow: mode === "truth" ? "0 3px 12px rgba(93,63,49,0.15)" : "none",
          }}>
          💭 Truth {truthCount > 0 && <span style={{ fontSize: 11, opacity: 0.7 }}>({truthCount})</span>}
        </motion.button>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => pick("dare")}
          style={{
            flex: 1, padding: "12px 0", borderRadius: 12,
            background: mode === "dare" ? "rgba(173,104,74,0.18)" : "rgba(173,104,74,0.08)",
            border: mode === "dare" ? `1.5px solid rgba(173,104,74,0.35)` : `1px solid rgba(173,104,74,0.18)`,
            fontFamily: SERIF, fontSize: 14, fontWeight: 700, color: TERRACOTTA,
            cursor: "pointer", boxShadow: mode === "dare" ? "0 3px 12px rgba(173,104,74,0.18)" : "none",
          }}>
          🎲 Dare {dareCount > 0 && <span style={{ fontSize: 11, opacity: 0.7 }}>({dareCount})</span>}
        </motion.button>
      </div>

      {/* Active card area */}
      <AnimatePresence mode="wait">
        {!card || !card.text ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ borderRadius: 16, border: `1px solid ${WARM_BORDER}`, background: "rgba(250,245,237,0.50)", padding: "28px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 32 }}>🎴</span>
            <p style={{ fontFamily: SERIF, fontSize: 13, color: "rgba(108,74,46,0.50)", margin: 0 }}>Pick Truth or Dare to start 🎂</p>
          </motion.div>
        ) : (
          <motion.div key={card.text} initial={{ scale: 0.88, opacity: 0, rotateY: -15 }} animate={{ scale: 1, opacity: 1, rotateY: 0 }} exit={{ scale: 0.88, opacity: 0 }} transition={{ type: "spring", stiffness: 250, damping: 22 }}>
            {/* Card */}
            <div style={{
              borderRadius: 16,
              border: mode === "truth" ? `1.5px solid rgba(93,63,49,0.28)` : `1.5px solid rgba(173,104,74,0.30)`,
              background: mode === "truth" ? "rgba(93,63,49,0.06)" : "rgba(173,104,74,0.06)",
              padding: "18px 20px", marginBottom: 14,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{
                  fontFamily: SERIF, fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em",
                  color: mode === "truth" ? BROWN : TERRACOTTA,
                  background: mode === "truth" ? "rgba(93,63,49,0.12)" : "rgba(173,104,74,0.14)",
                  padding: "3px 12px", borderRadius: 999,
                }}>
                  {mode === "truth" ? "💭 Truth" : "🎲 Dare"}
                </span>
              </div>
              <p style={{ fontFamily: SERIF, fontWeight: 600, color: WARM, fontSize: 16, margin: 0, lineHeight: 1.6 }}>{card.text}</p>
            </div>

            {/* Truth: answer textarea */}
            {mode === "truth" && !saved && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <label style={{ fontFamily: SERIF, fontSize: 12, fontWeight: 700, color: "rgba(108,74,46,0.65)", textTransform: "uppercase" as const, letterSpacing: "0.06em", display: "block", marginBottom: 8 }}>
                  Your honest answer ✍️
                </label>
                <textarea
                  ref={textareaRef}
                  value={answer} onChange={(e) => setAnswer(e.target.value)} rows={3}
                  placeholder="Write your answer here... 🎂"
                  style={{ width: "100%", resize: "none", background: "rgba(250,245,237,0.70)", border: `1.5px solid rgba(93,63,49,0.22)`, borderRadius: 12, padding: "12px 14px", fontFamily: SERIF, fontSize: 14, color: WARM, outline: "none", lineHeight: 1.6, boxSizing: "border-box" }}
                  onFocus={(e) => { e.currentTarget.style.border = `1.5px solid rgba(93,63,49,0.50)`; }}
                  onBlur={(e) => { e.currentTarget.style.border = `1.5px solid rgba(93,63,49,0.22)`; }}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 10, marginBottom: 10 }}>
                  {responseAudioUrl ? (
                    <div style={{ flex: 1 }}>
                      <MiniAudioPlayer src={responseAudioUrl} onRemove={() => setResponseAudioUrl("")} />
                    </div>
                  ) : recording ? (
                    <button onClick={stopRecording} style={{
                      flex: 1, padding: "9px 14px", borderRadius: 10,
                      border: "1.5px solid rgba(200,60,60,0.40)",
                      background: "rgba(220,60,60,0.08)", cursor: "pointer",
                      fontFamily: SERIF, fontSize: 12, color: "rgb(180,50,50)",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                    }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "rgb(220,50,50)", display: "inline-block", flexShrink: 0, animation: "bgf-rec-dot 1s ease-in-out infinite" }} />
                      {String(Math.floor(recordSeconds / 60)).padStart(2, "0")}:{String(recordSeconds % 60).padStart(2, "0")} · Stop
                    </button>
                  ) : (
                    <button onClick={startRecording} style={{
                      flex: 1, padding: "9px 0", borderRadius: 10,
                      border: "1.5px dashed rgba(173,104,74,0.35)",
                      background: "rgba(173,104,74,0.05)", cursor: "pointer",
                      fontFamily: SERIF, fontSize: 12, color: TERRACOTTA,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                    }}>
                      🎤 Record voice
                    </button>
                  )}
                  {responsePhotoUrl ? (
                    <div style={{ position: "relative" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={responsePhotoUrl} alt="" style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover" }} />
                      <button onClick={() => setResponsePhotoUrl("")} style={{
                        position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: "50%",
                        background: "rgba(180,60,50,0.85)", border: "none", cursor: "pointer",
                        fontSize: 10, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                      }}>×</button>
                    </div>
                  ) : (
                    <button onClick={() => responsePhotoInputRef.current?.click()} style={{
                      padding: "8px 12px", borderRadius: 10,
                      border: "1.5px dashed rgba(173,104,74,0.35)",
                      background: "rgba(173,104,74,0.05)", cursor: "pointer",
                      fontFamily: SERIF, fontSize: 12, color: TERRACOTTA,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>📸</button>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={handleSave} disabled={!answer.trim() || saving}
                    style={{
                      flex: 1, padding: "10px 0", borderRadius: 12, border: "none",
                      background: answer.trim() ? `linear-gradient(135deg, ${TERRACOTTA}, ${BROWN})` : "rgba(173,104,74,0.15)",
                      color: answer.trim() ? "rgba(250,245,237,0.95)" : "rgba(108,74,46,0.40)",
                      fontFamily: SERIF, fontSize: 13, fontWeight: 700, cursor: answer.trim() ? "pointer" : "not-allowed",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      boxShadow: answer.trim() ? "0 4px 12px rgba(93,63,49,0.25)" : "none",
                    }}>
                    <Send size={12} /> {saving ? "Saving..." : "Save Answer 🎂"}
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={nextCard}
                    style={{ padding: "10px 16px", borderRadius: 12, border: `1px solid ${WARM_BORDER}`, background: "rgba(250,245,237,0.60)", fontFamily: SERIF, fontSize: 12, color: WARM, cursor: "pointer" }}>
                    Skip →
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Truth: saved */}
            {mode === "truth" && saved && (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                style={{ borderRadius: 14, border: "1.5px solid rgba(100,160,80,0.30)", background: "rgba(100,160,80,0.10)", padding: "12px 16px", textAlign: "center", marginBottom: 10 }}>
                <CheckCircle2 size={18} color="rgb(80,140,60)" style={{ margin: "0 auto 4px" }} />
                <p style={{ fontFamily: SERIF, fontSize: 13, fontWeight: 700, color: "rgb(70,120,50)", margin: 0 }}>Answer saved! 🎂</p>
                <p style={{ fontFamily: SERIF, fontSize: 12, color: "rgba(70,120,50,0.80)", fontStyle: "italic", marginTop: 4, lineHeight: 1.5 }}>&ldquo;{answer}&rdquo;</p>
              </motion.div>
            )}

            {/* Dare: how did it go */}
            {mode === "dare" && !dareCompleted && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <label style={{ fontFamily: SERIF, fontSize: 12, fontWeight: 700, color: "rgba(108,74,46,0.65)", textTransform: "uppercase" as const, letterSpacing: "0.06em", display: "block", marginBottom: 8 }}>
                  How did it go? (optional) ✍️
                </label>
                <textarea
                  value={answer} onChange={(e) => setAnswer(e.target.value)} rows={2}
                  placeholder="Tell everyone how you did it... 🎉"
                  style={{ width: "100%", resize: "none", background: "rgba(250,245,237,0.70)", border: `1.5px solid rgba(173,104,74,0.22)`, borderRadius: 12, padding: "12px 14px", fontFamily: SERIF, fontSize: 14, color: WARM, outline: "none", lineHeight: 1.6, boxSizing: "border-box" }}
                  onFocus={(e) => { e.currentTarget.style.border = `1.5px solid rgba(173,104,74,0.50)`; }}
                  onBlur={(e) => { e.currentTarget.style.border = `1.5px solid rgba(173,104,74,0.22)`; }}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 10, marginBottom: 10 }}>
                  {responseAudioUrl ? (
                    <div style={{ flex: 1 }}>
                      <MiniAudioPlayer src={responseAudioUrl} onRemove={() => setResponseAudioUrl("")} />
                    </div>
                  ) : recording ? (
                    <button onClick={stopRecording} style={{
                      flex: 1, padding: "9px 14px", borderRadius: 10,
                      border: "1.5px solid rgba(200,60,60,0.40)",
                      background: "rgba(220,60,60,0.08)", cursor: "pointer",
                      fontFamily: SERIF, fontSize: 12, color: "rgb(180,50,50)",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                    }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "rgb(220,50,50)", display: "inline-block", flexShrink: 0, animation: "bgf-rec-dot 1s ease-in-out infinite" }} />
                      {String(Math.floor(recordSeconds / 60)).padStart(2, "0")}:{String(recordSeconds % 60).padStart(2, "0")} · Stop
                    </button>
                  ) : (
                    <button onClick={startRecording} style={{
                      flex: 1, padding: "9px 0", borderRadius: 10,
                      border: "1.5px dashed rgba(173,104,74,0.35)",
                      background: "rgba(173,104,74,0.05)", cursor: "pointer",
                      fontFamily: SERIF, fontSize: 12, color: TERRACOTTA,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                    }}>
                      🎤 Record voice
                    </button>
                  )}
                  {responsePhotoUrl ? (
                    <div style={{ position: "relative" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={responsePhotoUrl} alt="" style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover" }} />
                      <button onClick={() => setResponsePhotoUrl("")} style={{
                        position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: "50%",
                        background: "rgba(180,60,50,0.85)", border: "none", cursor: "pointer",
                        fontSize: 10, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                      }}>×</button>
                    </div>
                  ) : (
                    <button onClick={() => responsePhotoInputRef.current?.click()} style={{
                      padding: "8px 12px", borderRadius: 10,
                      border: "1.5px dashed rgba(173,104,74,0.35)",
                      background: "rgba(173,104,74,0.05)", cursor: "pointer",
                      fontFamily: SERIF, fontSize: 12, color: TERRACOTTA,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>📸</button>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <motion.button whileTap={{ scale: 0.92 }} whileHover={{ scale: 1.02 }} onClick={handleDareComplete}
                    style={{
                      flex: 1, padding: "12px 0", borderRadius: 12, border: "none",
                      background: `linear-gradient(135deg, ${TERRACOTTA}, ${BROWN})`,
                      color: "rgba(250,245,237,0.95)", fontFamily: SERIF, fontSize: 14, fontWeight: 700, cursor: "pointer",
                      boxShadow: "0 4px 16px rgba(93,63,49,0.30)",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    }}>
                    🎉 I Did It!
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={nextCard}
                    style={{ padding: "12px 16px", borderRadius: 12, border: `1px solid ${WARM_BORDER}`, background: "rgba(250,245,237,0.60)", fontFamily: SERIF, fontSize: 12, color: WARM, cursor: "pointer" }}>
                    Skip →
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Dare: completed */}
            {mode === "dare" && dareCompleted && (
              <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{ borderRadius: 14, border: `1.5px solid rgba(173,104,74,0.35)`, background: "rgba(173,104,74,0.10)", padding: "16px", textAlign: "center", marginBottom: 10 }}>
                <motion.span animate={{ rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.2, 1.2, 1] }} transition={{ duration: 0.6 }} style={{ fontSize: 32, display: "inline-block", marginBottom: 6 }}>🎉</motion.span>
                <p style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 700, color: TERRACOTTA, margin: 0 }}>{completionMsg}</p>
              </motion.div>
            )}

            {/* Next challenge */}
            {((mode === "truth" && saved) || (mode === "dare" && dareCompleted)) && (
              <motion.button initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} whileTap={{ scale: 0.95 }} onClick={nextCard}
                style={{
                  width: "100%", padding: "13px 0", borderRadius: 14, border: "none",
                  background: `linear-gradient(135deg, ${TERRACOTTA}, ${BROWN})`,
                  color: "rgba(250,245,237,0.95)", fontFamily: SERIF, fontSize: 15, fontWeight: 700, cursor: "pointer",
                  boxShadow: "0 6px 20px rgba(80,50,20,0.28)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4,
                }}>
                <span>🎲</span> Next Challenge <span style={{ color: "rgba(255,220,100,0.9)" }}>✦</span>
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {used.size > 0 && (
        <button onClick={reset}
          style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 4, margin: "8px auto 0", background: "none", border: "none", fontFamily: SERIF, fontSize: 12, color: "rgba(108,74,46,0.45)", cursor: "pointer" }}>
          ↺ Reset all
        </button>
      )}

      {/* Always-mounted hidden file inputs so refs work in both truth & dare modes */}
      <input ref={audioFileInputRef} type="file" accept="audio/*" style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) loadAudioFile(f); e.target.value = ""; }} />
      <input ref={responsePhotoInputRef} type="file" accept="image/*" style={{ display: "none" }}
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
        }} />
    </div>
  );
}

// ── GAMES config ─────────────────────────────────────────────────────────────

const GAMES = [
  { id: "quiz",    label: "Birthday Quiz",  emoji: "🎯", desc: "How well do you know the birthday star?" },
  { id: "tod",     label: "Truth or Dare",  emoji: "🎲", desc: "Birthday edition fun challenges!" },
  { id: "history", label: "Game History",   emoji: "🎂", desc: "All your birthday game moments!" },
];

// ── Main GamesSection ─────────────────────────────────────────────────────────

interface Props {
  data: BirthdayData;
  shareId?: string | null;
  quizAttempts?: QuizAttemptRecord[];
  initialGameResponses?: ServerGameResponse[];
  initialQuizAnswers?: ServerQuizAnswer[];
  onRecordingChange?: (active: boolean) => void;
}

export default memo(function GamesSection({ data, shareId = null, quizAttempts: initialQA = [], initialGameResponses = [], initialQuizAnswers = [], onRecordingChange }: Props) {
  const [activeGame, setActiveGame] = useState("quiz");

  const [history, setHistory] = useState<HistoryEntry[]>(() =>
    initialGameResponses.map((r, i) => ({
      id: -(i + 1), type: r.type, prompt: r.prompt, answer: r.answer, mediaUrl: r.mediaUrl, savedAt: r.savedAt,
    }))
  );
  const [quizAttempts, setQuizAttempts] = useState<QuizAttemptRecord[]>(initialQA);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswerRecord[]>(() =>
    initialQuizAnswers.map((a) => ({ ...a, answeredAt: a.answeredAt || new Date().toISOString() }))
  );

  // Self-fetch on mount to guarantee fresh data
  useEffect(() => {
    if (!shareId) return;
    fetch(`${API_URL}/birthday-gf-pages/share/${shareId}`)
      .then((r) => r.json())
      .then((result) => {
        if (!result.success || !result.data) return;
        const responses: ServerGameResponse[] = Array.isArray(result.data.gameResponses) ? result.data.gameResponses : [];
        const attempts: QuizAttemptRecord[] = Array.isArray(result.data.quizAttempts) ? result.data.quizAttempts : [];
        const answers: ServerQuizAnswer[] = Array.isArray(result.data.quizAnswers) ? result.data.quizAnswers : [];
        setHistory(responses.map((r, i) => ({ id: -(i + 1), type: r.type, prompt: r.prompt, answer: r.answer, mediaUrl: r.mediaUrl, savedAt: r.savedAt })));
        setQuizAttempts(attempts);
        setQuizAnswers(answers.map((a) => ({ ...a, answeredAt: a.answeredAt || new Date().toISOString() })));
      })
      .catch(() => {});
  }, [shareId]);

  const addToHistory = useCallback((type: "truth" | "dare", prompt: string, ans: string, mediaUrl?: string, savedAt?: string) => {
    const id = Date.now();
    setHistory((prev) => [{
      id, type, prompt, answer: ans,
      ...(mediaUrl && { mediaUrl }),
      ...(savedAt && { savedAt }),
    }, ...prev]);
  }, []);

  const updateHistoryMediaUrl = useCallback((id: number, url: string) => {
    setHistory((prev) => prev.map((e) => e.id === id ? { ...e, mediaUrl: url } : e));
  }, []);

  const addQuizAttempt = useCallback((attempt: QuizAttemptRecord) => {
    setQuizAttempts((prev) => [attempt, ...prev]);
  }, []);

  const addQuizAnswer = useCallback((answer: QuizAnswerRecord) => {
    setQuizAnswers((prev) => [...prev, answer]);
    if (shareId) {
      fetch(`${API_URL}/birthday-gf-pages/share/${shareId}/quiz-answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answer),
      }).catch(() => {});
    }
  }, [shareId]);

  return (
    <FlowerBackground>
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -60 }}
        style={{ minHeight: "100%", display: "flex", flexDirection: "column", position: "relative" }}
      >
        <div style={{ flex: 1, padding: "28px 16px 100px" }} className="lg:pt-10 lg:max-w-5xl lg:mx-auto lg:w-full lg:px-8">
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <h2 style={{ fontFamily: CURSIVE, fontSize: "clamp(28px, 7vw, 42px)", fontWeight: 400, color: BROWN, margin: 0 }}>
              Birthday Games
            </h2>
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: TERRACOTTA, marginTop: 6, opacity: 0.7 }}>Play together, celebrate together</p>
          </div>

          <div className="lg:flex lg:gap-8 lg:items-start">
            {/* Game selector — 1-col horizontal cards on mobile, vertical sidebar on desktop */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}
              className="lg:w-56 lg:shrink-0 lg:mb-0 lg:gap-2 lg:sticky lg:top-8">
              {GAMES.map((g) => {
                const isActive = activeGame === g.id;
                return (
                  <motion.button key={g.id} whileTap={{ scale: 0.98 }} onClick={() => setActiveGame(g.id)}
                    style={{
                      borderRadius: 16, border: isActive ? `1.5px solid rgba(173,104,74,0.42)` : `1px solid ${WARM_BORDER}`,
                      padding: "14px 18px", textAlign: "left",
                      background: isActive ? "rgba(253,248,240,0.95)" : "rgba(253,248,240,0.60)",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                      boxShadow: isActive ? "0 6px 22px rgba(80,50,20,0.14), inset 0 1px 0 rgba(255,255,255,0.65)" : "none",
                      cursor: "pointer", transition: "all 0.2s",
                      display: "flex", alignItems: "center", gap: 14,
                      width: "100%",
                    }}>
                    {/* Emoji badge */}
                    <div style={{
                      width: 46, height: 46, borderRadius: 13, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: isActive ? `rgba(173,104,74,0.12)` : "rgba(173,104,74,0.06)",
                      fontSize: 22,
                      transition: "all 0.2s",
                    }}>{g.emoji}</div>
                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 700, color: isActive ? WARM : "rgba(108,74,46,0.70)", margin: 0, lineHeight: 1.2 }}>{g.label}</p>
                      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12, color: "rgba(108,74,46,0.45)", marginTop: 3, lineHeight: 1.4, margin: "3px 0 0" }}>{g.desc}</p>
                    </div>
                    {/* Active indicator */}
                    {isActive && (
                      <div style={{ width: 4, height: 32, borderRadius: 999, background: `linear-gradient(180deg, ${TERRACOTTA}, ${BROWN})`, flexShrink: 0 }} />
                    )}
                  </motion.button>
                );
              })}
            </div>

            <motion.div key={activeGame} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              style={{ borderRadius: 20, border: `1px solid ${WARM_BORDER}`, background: "rgba(253,248,240,0.92)", backdropFilter: "blur(12px)", padding: 16, boxShadow: "0 8px 32px rgba(80,50,20,0.12)" }}
              className="lg:p-8 lg:flex-1">
              {activeGame === "quiz" && (
                <BirthdayQuiz questions={data.quizQuestions || []} shareId={shareId} attempts={quizAttempts} onAttemptAdded={addQuizAttempt} onAnswerAdded={addQuizAnswer} />
              )}
              {activeGame === "tod" && (
                <TruthOrDare shareId={shareId} customTruthDare={data.truthDareQuestions || []} history={history} onAddToHistory={addToHistory} onUpdateMediaUrl={updateHistoryMediaUrl} onRecordingChange={onRecordingChange} />
              )}
              {activeGame === "history" && (
                <GameHistory entries={history} quizRecords={quizAttempts} quizAnswers={quizAnswers} />
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </FlowerBackground>
  );
});
