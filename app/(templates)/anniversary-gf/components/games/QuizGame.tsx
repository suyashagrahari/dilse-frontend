"use client";

import { useState, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import type { ContentData } from "../types";
import RomanticCard from "./RomanticCard";
import { CORRECT_MSGS, WRONG_MSGS, WIN_SHAYARI } from "./constants";

interface Props {
  questions: ContentData["quizQuestions"];
}

export default memo(function QuizGame({ questions }: Props) {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const handleAnswer = useCallback(
    (idx: number) => {
      if (selected !== null) return;
      setSelected(idx);
      const isCorrect = idx === questions[current].correct;
      if (isCorrect) {
        setScore((s) => s + 1);
        setFeedbackMsg(CORRECT_MSGS[current % CORRECT_MSGS.length]);
      } else {
        setFeedbackMsg(WRONG_MSGS[current % WRONG_MSGS.length]);
      }
      setTimeout(() => {
        if (current < questions.length - 1) {
          setCurrent((c) => c + 1);
          setSelected(null);
          setFeedbackMsg(null);
        } else {
          setDone(true);
        }
      }, 2000);
    },
    [selected, current, questions],
  );

  const restart = useCallback(() => {
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setDone(false);
    setFeedbackMsg(null);
  }, []);

  if (done) {
    const shayari = WIN_SHAYARI.find((s) => score >= s.score) || WIN_SHAYARI[WIN_SHAYARI.length - 1];
    const label = score === questions.length ? "Perfect Score!" : score >= 3 ? "Amazing!" : score >= 2 ? "Good Try!" : "Love Wins!";
    return (
      <RomanticCard
        emoji={shayari.emoji}
        title={`${score}/${questions.length} — ${label}`}
        body={shayari.text}
        onAction={restart}
        actionLabel="Play Again"
      />
    );
  }

  const q = questions[current];
  return (
    <div>
      <div className="flex gap-1.5 mb-6">
        {questions.map((_, i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full transition-all"
            style={{ background: i < current ? "#e11d48" : i === current ? "#fb7185" : "var(--anni-glass-border)" }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold" style={{ color: "#e11d48" }}>
          Question {current + 1} of {questions.length}
        </p>
        <p className="text-xs text-foreground/50 flex items-center gap-1">
          <Heart size={10} className="fill-rose-400 text-rose-400" /> {score} correct
        </p>
      </div>
      <h4 className="text-lg font-bold mb-5 text-foreground">{q.question}</h4>
      <div className="space-y-2.5">
        {q.options.map((opt, i) => {
          let bg = "bg-muted/50 border-border text-foreground";
          if (selected !== null) {
            if (i === q.correct) bg = "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-200 dark:ring-emerald-800";
            else if (i === selected) bg = "bg-red-50 dark:bg-red-900/30 border-red-400 text-red-600 dark:text-red-400";
            else bg = "bg-muted/30 border-border/50 opacity-40";
          }
          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={selected !== null}
              className={`w-full text-left px-4 py-3.5 rounded-2xl border-2 text-sm font-medium transition-all active:scale-[0.97] ${bg}`}
            >
              {opt}
              {selected !== null && i === q.correct && <span className="float-right">✨</span>}
              {selected !== null && i === selected && i !== q.correct && <span className="float-right">💔</span>}
            </button>
          );
        })}
      </div>
      <AnimatePresence>
        {feedbackMsg && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 text-center">
            <p className="text-sm font-medium italic" style={{ color: "var(--anni-pink)" }}>{feedbackMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
