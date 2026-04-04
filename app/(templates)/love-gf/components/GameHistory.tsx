"use client";

import { memo, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MiniAudioPlayer from "./MiniAudioPlayer";

const CURSIVE = "'Dancing Script', 'Brush Script MT', cursive";
const WARM = "rgb(108, 74, 46)";
const WARM_DIM = "rgba(108, 74, 46, 0.50)";
const WARM_FAINT = "rgba(108, 74, 46, 0.30)";

export interface HistoryEntry {
  id: number;
  type: "truth" | "dare";
  prompt: string;
  answer: string;
  mediaUrl?: string;
  savedAt?: string;
}

export interface QuizRecord {
  score: number;
  total: number;
  playedAt: string;
}

type FilterType = "all" | "truth" | "dare" | "quiz";

interface Props {
  history: HistoryEntry[];
  quizAttempts: QuizRecord[];
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

function isAudioUrl(url: string) {
  return (
    url.startsWith("data:audio/") ||
    /\.(mp3|wav|webm|ogg|m4a|aac)(\?|$)/i.test(url)
  );
}

function isImageUrl(url: string) {
  return (
    url.startsWith("data:image/") ||
    /\.(webp|jpg|jpeg|png|gif|avif)(\?|$)/i.test(url)
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = memo(function StatCard({
  emoji, value, label, color,
}: { emoji: string; value: string | number; label: string; color: string }) {
  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
      gap: 3, padding: "10px 4px", borderRadius: 14,
      background: "rgba(250,248,242,0.85)",
      border: "1px solid rgba(158,126,97,0.14)",
      boxShadow: "0 2px 8px rgba(80,50,20,0.06)",
    }}>
      <span style={{ fontSize: 20 }}>{emoji}</span>
      <span style={{ fontFamily: CURSIVE, fontSize: 20, fontWeight: 700, color, lineHeight: 1 }}>
        {value}
      </span>
      <span style={{ fontFamily: CURSIVE, fontSize: 9, color: WARM_DIM, textAlign: "center" }}>
        {label}
      </span>
    </div>
  );
});

// ── TOD entry card ─────────────────────────────────────────────────────────────
const TodCard = memo(function TodCard({
  entry, index,
}: { entry: HistoryEntry; index: number }) {
  const isTruth = entry.type === "truth";
  const truthColor = { accent: "rgb(120,80,170)", bg: "rgba(140,100,180,0.07)", border: "rgba(140,100,180,0.18)", bar: "rgba(140,100,180,0.50)" };
  const dareColor  = { accent: "rgb(180,110,30)", bg: "rgba(200,130,60,0.07)",  border: "rgba(200,130,60,0.18)",  bar: "rgba(200,130,60,0.50)"  };
  const c = isTruth ? truthColor : dareColor;

  const hasAudio = !!entry.mediaUrl && isAudioUrl(entry.mediaUrl);
  const hasImage = !!entry.mediaUrl && isImageUrl(entry.mediaUrl);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: index * 0.035, type: "spring", stiffness: 320, damping: 26 }}
      style={{
        borderRadius: 16, border: `1px solid ${c.border}`,
        background: c.bg, padding: "12px 14px",
        position: "relative", overflow: "hidden",
      }}
    >
      {/* Left accent bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, width: 3, bottom: 0,
        borderRadius: "16px 0 0 16px", background: c.bar,
      }} />

      <div style={{ paddingLeft: 10 }}>
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{
            fontFamily: CURSIVE, fontSize: 9, fontWeight: 700,
            textTransform: "uppercase" as const, letterSpacing: "0.12em",
            color: c.accent, background: `${c.accent}18`,
            padding: "2px 10px", borderRadius: 999,
          }}>
            {isTruth ? "💭 Truth" : "🎯 Dare"}
          </span>
          {entry.savedAt && (
            <span style={{ fontFamily: CURSIVE, fontSize: 9, color: WARM_FAINT }}>
              {formatTime(entry.savedAt)}
            </span>
          )}
        </div>

        {/* Prompt */}
        <p style={{
          fontFamily: CURSIVE, fontSize: 12, fontWeight: 700,
          color: WARM, margin: "0 0 6px", lineHeight: 1.45,
        }}>
          {entry.prompt}
        </p>

        {/* Divider */}
        <div style={{ height: 1, background: `${c.accent}14`, margin: "6px 0" }} />

        {/* Answer */}
        <p style={{
          fontFamily: CURSIVE, fontSize: 12, fontStyle: "italic",
          color: "rgba(90,60,35,0.85)", margin: 0, lineHeight: 1.55,
        }}>
          {isTruth ? `"${entry.answer}"` : `✓ ${entry.answer}`}
        </p>

        {/* Audio */}
        {hasAudio && (
          <div style={{ marginTop: 10 }}>
            <MiniAudioPlayer
              src={entry.mediaUrl!}
              accentColor={c.accent}
              bgColor={`${c.accent}08`}
              borderColor={c.border}
            />
          </div>
        )}

        {/* Photo */}
        {hasImage && (
          <div style={{ marginTop: 8, borderRadius: 10, overflow: "hidden" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={entry.mediaUrl}
              alt="response"
              loading="lazy"
              style={{ width: "100%", maxHeight: 180, objectFit: "cover", display: "block" }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
});

// ── Quiz entry card ────────────────────────────────────────────────────────────
const QuizCard = memo(function QuizCard({
  attempt, index,
}: { attempt: QuizRecord; index: number }) {
  const pct = attempt.total > 0 ? attempt.score / attempt.total : 0;
  const emoji = pct === 1 ? "👑" : pct >= 0.7 ? "💕" : pct >= 0.4 ? "💖" : "💝";
  const msg   = pct === 1 ? "Perfect score!" : pct >= 0.7 ? "Amazing!" : pct >= 0.4 ? "Good try!" : "Keep going!";
  const green = "rgb(55,125,75)";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: index * 0.035, type: "spring", stiffness: 320, damping: 26 }}
      style={{
        borderRadius: 16, border: "1px solid rgba(55,125,75,0.20)",
        background: "rgba(55,160,95,0.06)", padding: "12px 14px",
        position: "relative", overflow: "hidden",
        display: "flex", alignItems: "center", gap: 12,
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, width: 3, bottom: 0, borderRadius: "16px 0 0 16px", background: "rgba(55,125,75,0.50)" }} />

      <span style={{ fontSize: 28, flexShrink: 0, paddingLeft: 10 }}>{emoji}</span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{
            fontFamily: CURSIVE, fontSize: 9, fontWeight: 700,
            textTransform: "uppercase" as const, letterSpacing: "0.12em",
            color: green, background: "rgba(55,125,75,0.10)", padding: "2px 10px", borderRadius: 999,
          }}>🏆 Quiz</span>
          {attempt.playedAt && (
            <span style={{ fontFamily: CURSIVE, fontSize: 9, color: WARM_FAINT }}>
              {formatTime(attempt.playedAt)}
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
          <span style={{ fontFamily: CURSIVE, fontSize: 20, fontWeight: 700, color: green, lineHeight: 1 }}>
            {attempt.score}/{attempt.total}
          </span>
          <span style={{ fontFamily: CURSIVE, fontSize: 11, color: "rgba(55,125,75,0.65)" }}>{msg}</span>
        </div>

        {/* Score bar */}
        <div style={{ height: 4, borderRadius: 999, background: "rgba(55,125,75,0.14)", overflow: "hidden" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct * 100}%` }}
            transition={{ duration: 0.9, delay: index * 0.035 + 0.2, ease: "easeOut" }}
            style={{ height: "100%", borderRadius: 999, background: green }}
          />
        </div>
      </div>
    </motion.div>
  );
});

// ── Main GameHistory ────────────────────────────────────────────────────────────
const FILTER_TABS: { id: FilterType; label: string; emoji: string }[] = [
  { id: "all",   label: "All",   emoji: "✨" },
  { id: "truth", label: "Truth", emoji: "💭" },
  { id: "dare",  label: "Dare",  emoji: "🎯" },
  { id: "quiz",  label: "Quiz",  emoji: "🏆" },
];

const GameHistory = memo(function GameHistory({ history, quizAttempts }: Props) {
  const [filter, setFilter] = useState<FilterType>("all");

  const truthCount = useMemo(() => history.filter(h => h.type === "truth").length, [history]);
  const dareCount  = useMemo(() => history.filter(h => h.type === "dare").length,  [history]);
  const bestQuiz   = useMemo(() => {
    if (!quizAttempts.length) return null;
    const best = quizAttempts.reduce((b, a) =>
      a.total > 0 && a.score / a.total > b.score / b.total ? a : b
    );
    return `${best.score}/${best.total}`;
  }, [quizAttempts]);

  type TodItem  = { kind: "tod";  entry: HistoryEntry };
  type QuizItem = { kind: "quiz"; attempt: QuizRecord; idx: number };

  const timeline = useMemo<(TodItem | QuizItem)[]>(() => {
    const items: (TodItem | QuizItem)[] = [];

    if (filter !== "quiz") {
      const filtered = filter === "all" ? history : history.filter(h => h.type === filter);
      filtered.forEach(entry => items.push({ kind: "tod", entry }));
    }
    if (filter !== "truth" && filter !== "dare") {
      quizAttempts.forEach((attempt, idx) => items.push({ kind: "quiz", attempt, idx }));
    }

    return items;
  }, [history, quizAttempts, filter]);

  const total = history.length + quizAttempts.length;

  if (total === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: "center", padding: "36px 16px" }}
      >
        <span style={{ fontSize: 52, display: "block", marginBottom: 12 }}>📖</span>
        <p style={{ fontFamily: CURSIVE, fontSize: 17, fontWeight: 700, color: WARM, margin: "0 0 8px" }}>
          No history yet
        </p>
        <p style={{ fontFamily: CURSIVE, fontSize: 13, color: WARM_DIM, margin: 0, lineHeight: 1.6 }}>
          Play some Truth or Dare and Quizzes together — your story will appear here ♡
        </p>
      </motion.div>
    );
  }

  return (
    <div>
      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", gap: 8, marginBottom: 16 }}
      >
        <StatCard emoji="🎮" value={total}          label="Total games" color={WARM} />
        <StatCard emoji="💭" value={truthCount}     label="Truths"      color="rgb(120,80,170)" />
        <StatCard emoji="🎯" value={dareCount}      label="Dares"       color="rgb(180,110,30)" />
        <StatCard emoji="🏆" value={bestQuiz ?? "--"} label="Best quiz" color="rgb(55,125,75)" />
      </motion.div>

      {/* Filter pills */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto", paddingBottom: 2 }}>
        {FILTER_TABS.map(tab => (
          <motion.button
            key={tab.id}
            whileTap={{ scale: 0.93 }}
            onClick={() => setFilter(tab.id)}
            style={{
              flexShrink: 0, padding: "6px 16px", borderRadius: 999,
              border: filter === tab.id
                ? "1.5px solid rgba(158,126,97,0.45)"
                : "1px solid rgba(158,126,97,0.18)",
              background: filter === tab.id ? "rgba(158,126,97,0.14)" : "transparent",
              fontFamily: CURSIVE, fontSize: 12,
              fontWeight: filter === tab.id ? 700 : 400,
              color: filter === tab.id ? WARM : WARM_DIM,
              cursor: "pointer", transition: "all 0.15s",
            }}
          >
            {tab.emoji} {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Timeline */}
      <AnimatePresence mode="popLayout">
        {timeline.length === 0 ? (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ fontFamily: CURSIVE, fontSize: 13, color: WARM_DIM, textAlign: "center", padding: "20px 0" }}
          >
            No {filter} entries yet ♡
          </motion.p>
        ) : (
          <motion.div key="list" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {timeline.map((item, i) =>
              item.kind === "tod"
                ? <TodCard  key={`t-${item.entry.id}`}   entry={item.entry}         index={i} />
                : <QuizCard key={`q-${item.idx}`}         attempt={item.attempt}     index={i} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default GameHistory;
