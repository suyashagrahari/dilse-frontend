"use client";

import { useState, useCallback, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw, Heart } from "lucide-react";
import { type ContentData } from "./types";

type GameId = "quiz" | "spin" | "maze" | "memory";

const textGlow = "0 0 16px rgba(255,255,255,1), 0 0 6px rgba(255,255,255,1), 0 1px 4px rgba(255,255,255,1)";
const subtleGlow = "0 0 12px rgba(255,255,255,1), 0 0 4px rgba(255,255,255,1)";

const GAMES: { id: GameId; emoji: string; label: string }[] = [
  { id: "quiz", emoji: "💝", label: "Love\nQuiz" },
  { id: "spin", emoji: "🎡", label: "Spin The\nWheel" },
  { id: "maze", emoji: "🌹", label: "Love\nMaze" },
  { id: "memory", emoji: "🧠", label: "Memory\nMatch" },
];

const HEADER_BG: Record<GameId, string> = {
  quiz: "linear-gradient(90deg, #e11d48, #ec4899)",
  spin: "linear-gradient(90deg, #f59e0b, #f97316)",
  maze: "linear-gradient(90deg, #c026d3, #8b5cf6)",
  memory: "linear-gradient(90deg, #10b981, #14b8a6)",
};

const GLASS_BTN = {
  background: "rgba(255,255,255,0.15)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1.5px solid rgba(255,255,255,0.3)",
  boxShadow: "0 4px 20px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.3)",
} as const;

const GLASS_BAR = {
  background: "rgba(255,255,255,0.12)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.25)",
} as const;

const CORRECT_MSGS = ["You know me so well! 💕", "Perfect, just like our love! 💍", "That's my soulmate! ✨", "Correct! Our bond is magical 🌟"];
const WRONG_MSGS = ["Oops! But even your mistakes make me smile 😘", "Wrong answer, right love! We'll learn together 💕", "That's okay! Your love score is still perfect 💖", "A little wrong, but always adorable 🌸"];
const WIN_SHAYARI = [
  { score: 4, text: "Every answer perfect, every moment true,\nNo one in this world knows love like you do 💕", emoji: "🏆" },
  { score: 3, text: "Almost perfect, just like our journey so far,\nYou're my moon, my sun, my brightest star ✨", emoji: "🌟" },
  { score: 2, text: "Half right, half to discover yet,\nOur love story is one I'll never forget 💖", emoji: "💖" },
  { score: 1, text: "The answers may miss, but this I know,\nMy love for you will forever grow 🌹", emoji: "🌹" },
  { score: 0, text: "Wrong answers don't mean wrong love, my dear,\nWith you beside me, I have nothing to fear 💗", emoji: "💗" },
];
const SPIN_LETTERS = [
  "My dearest love, this moment is just for us.\nLet's make it magical — like every second with you 💕",
  "Promise me we'll do this together.\nYou make even the smallest things feel extraordinary ✨",
  "Every moment spent with you becomes\nmy new favorite memory. I love you endlessly 💍",
  "You turned my ordinary world into\na beautiful love story. Let's write another chapter 🌹",
];
const MAZE_WIN_MSG = "Through every twist and turn, love finds a way.\nJust like us — always finding our way back to each other 💕";
const MEMORY_WIN_MSG = "Every pair matched, every memory treasured.\nOur love is the greatest match of all 💍";

export default function GamesTab({ data }: { data: ContentData }) {
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const closeGame = useCallback(() => setActiveGame(null), []);

  return (
    <motion.div
      key="games"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="px-4 pt-5 pb-24 h-screen flex flex-col overflow-hidden relative z-10"
    >
      {/* Soft radial bg */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(251,207,232,0.35) 0%, transparent 70%)" }}
      />

      {/* Floating emojis — CSS only */}
      {["🎮", "💗", "✨", "🕹️", "🌸"].map((e, i) => (
        <span
          key={i}
          className="absolute pointer-events-none text-2xl float-emoji"
          style={{ left: `${12 + i * 18}%`, top: `${12 + (i % 3) * 28}%`, animationDelay: `${i * 0.7}s`, animationDuration: `${4 + i * 0.5}s` }}
        >
          {e}
        </span>
      ))}

      {/* Header */}
      <div className="text-center mb-4 relative z-10">
        <h3
          className="font-script text-2xl"
          style={{ color: "#881337", textShadow: textGlow }}
        >
          Love Arcade 🕹️
        </h3>
        <p className="text-[11px] font-medium" style={{ color: "rgba(136,19,55,0.6)", textShadow: subtleGlow }}>
          Tap a game to play together 💕
        </p>
      </div>

      {/* Game grid — 2 cols, fills space */}
      <div className="grid grid-cols-2 gap-2.5 flex-1 relative z-10">
        {GAMES.map((game, i) => (
          <motion.button
            key={game.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.06, type: "spring", stiffness: 300 }}
            onClick={() => setActiveGame(game.id)}
            className="flex flex-col items-center justify-center gap-2 active:scale-93 active:opacity-90 transition-all rounded-2xl p-3"
            style={GLASS_BTN}
          >
            <span className="text-4xl game-pulse" style={{ animationDelay: `${i * 0.2}s` }}>
              {game.emoji}
            </span>
            <span
              className="text-xs font-bold whitespace-pre-line text-center leading-tight"
              style={{ color: "#881337", textShadow: subtleGlow }}
            >
              {game.label}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Bottom bar — Player 1 + Player 2 */}
      <motion.div
        className="flex items-center justify-center gap-3 py-3 mt-2 relative z-10 rounded-xl"
        style={GLASS_BAR}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <span className="text-xl bounce-y">🎮</span>
        <p className="font-script text-sm" style={{ color: "#881337", textShadow: subtleGlow }}>
          Player 1 + Player 2
        </p>
        <span className="text-xl bounce-y" style={{ animationDelay: "0.3s" }}>💖</span>
      </motion.div>

      <style jsx>{`
        .float-emoji { opacity: 0.2; animation: fe 4s ease-in-out infinite; }
        @keyframes fe {
          0%,100% { transform: translateY(0) rotate(0deg); opacity: 0.15; }
          25% { transform: translateY(-12px) rotate(8deg); opacity: 0.3; }
          75% { transform: translateY(-15px) rotate(-8deg); opacity: 0.3; }
        }
        .game-pulse { animation: gp 2.5s ease-in-out infinite; display: inline-block; }
        @keyframes gp { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }
        .bounce-y { animation: by 1.5s ease-in-out infinite; display: inline-block; }
        @keyframes by { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
      `}</style>

      {/* Game Modal */}
      <AnimatePresence>
        {activeGame && <GameModal gameId={activeGame} data={data} onClose={closeGame} />}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Game Modal ─── */
function GameModal({ gameId, data, onClose }: { gameId: GameId; data: ContentData; onClose: () => void }) {
  const game = GAMES.find((g) => g.id === gameId)!;
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed inset-x-0 bottom-0 top-8 z-50 bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl overflow-hidden flex flex-col lg:inset-x-[15%] lg:top-12 lg:bottom-4 lg:rounded-3xl"
      >
        <div className="px-5 py-4 flex items-center gap-3 shrink-0 text-white" style={{ background: HEADER_BG[gameId] }}>
          <span className="text-2xl">{game.emoji}</span>
          <div className="flex-1">
            <h3 className="font-bold">{game.label.replace("\n", " ")}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white"><X size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 lg:p-8">
          {gameId === "quiz" && <QuizGame questions={data.quizQuestions} />}
          {gameId === "spin" && <SpinGame items={data.spinItems} />}
          {gameId === "maze" && <MazeGame />}
          {gameId === "memory" && <MemoryGame />}
        </div>
      </motion.div>
    </>
  );
}

/* ─── Romantic Result Card ─── */
function RomanticCard({ emoji, title, body, onAction, actionLabel }: {
  emoji: string; title: string; body: string; onAction: () => void; actionLabel: string;
}) {
  return (
    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200 }} className="text-center py-4">
      <div className="rounded-3xl p-6 border relative overflow-hidden" style={{ background: "linear-gradient(135deg, #fff1f2, #fce7f3, #fee2e2)", borderColor: "rgba(236,72,153,0.15)" }}>
        <div className="absolute top-2 right-3 opacity-20 text-lg">💕</div>
        <div className="absolute bottom-2 left-3 opacity-20 text-lg">✨</div>
        <motion.span className="text-5xl block mb-3 relative z-10" initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", delay: 0.2 }}>{emoji}</motion.span>
        <h3 className="text-lg font-bold mb-2 relative z-10" style={{ color: "#881337" }}>{title}</h3>
        <p className="text-sm leading-relaxed whitespace-pre-line italic relative z-10" style={{ color: "rgba(136,19,55,0.7)" }}>&ldquo;{body}&rdquo;</p>
        <div className="flex justify-center gap-1 my-3 relative z-10">
          {[0, 1, 2].map((i) => (<span key={i} className="heart-beat text-rose-400" style={{ animationDelay: `${i * 0.2}s`, fontSize: 10 }}>♥</span>))}
        </div>
      </div>
      <button onClick={onAction} className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-white font-semibold text-sm active:scale-95 transition-transform" style={{ background: "linear-gradient(90deg, #e11d48, #ec4899)", boxShadow: "0 4px 15px rgba(225,29,72,0.25)" }}>
        <RotateCcw size={14} /> {actionLabel}
      </button>
      <style jsx>{`
        .heart-beat { animation: hb 1.5s ease-in-out infinite; display: inline-block; }
        @keyframes hb { 0%,100% { transform: scale(1); } 50% { transform: scale(1.3); } }
      `}</style>
    </motion.div>
  );
}

/* ─── LOVE QUIZ ─── */
function QuizGame({ questions }: { questions: ContentData["quizQuestions"] }) {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const isCorrect = idx === questions[current].correct;
    if (isCorrect) { setScore((s) => s + 1); setFeedbackMsg(CORRECT_MSGS[current % CORRECT_MSGS.length]); }
    else { setFeedbackMsg(WRONG_MSGS[current % WRONG_MSGS.length]); }
    setTimeout(() => {
      if (current < questions.length - 1) { setCurrent((c) => c + 1); setSelected(null); setFeedbackMsg(null); }
      else { setDone(true); }
    }, 2000);
  };

  const restart = () => { setCurrent(0); setScore(0); setSelected(null); setDone(false); setFeedbackMsg(null); };

  if (done) {
    const shayari = WIN_SHAYARI.find((s) => score >= s.score) || WIN_SHAYARI[WIN_SHAYARI.length - 1];
    return <RomanticCard emoji={shayari.emoji} title={`${score}/${questions.length} — ${score === questions.length ? "Perfect Score!" : score >= 3 ? "Amazing!" : score >= 2 ? "Good Try!" : "Love Wins!"}`} body={shayari.text} onAction={restart} actionLabel="Play Again" />;
  }

  const q = questions[current];
  return (
    <div>
      <div className="flex gap-1.5 mb-6">{questions.map((_, i) => (<div key={i} className="h-1.5 flex-1 rounded-full transition-all" style={{ background: i < current ? "#e11d48" : i === current ? "#fb7185" : "#f3f4f6" }} />))}</div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold" style={{ color: "#e11d48" }}>Question {current + 1} of {questions.length}</p>
        <p className="text-xs text-foreground/50 flex items-center gap-1"><Heart size={10} className="fill-rose-400 text-rose-400" /> {score} correct</p>
      </div>
      <h4 className="text-lg font-bold mb-5 text-foreground">{q.question}</h4>
      <div className="space-y-2.5">
        {q.options.map((opt, i) => {
          let bg = "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-foreground";
          if (selected !== null) {
            if (i === q.correct) bg = "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-200 dark:ring-emerald-800";
            else if (i === selected) bg = "bg-red-50 dark:bg-red-900/30 border-red-400 text-red-600 dark:text-red-400";
            else bg = "bg-gray-50/50 dark:bg-gray-800/30 border-gray-200/50 dark:border-gray-700/50 opacity-40";
          }
          return (
            <button key={i} onClick={() => handleAnswer(i)} disabled={selected !== null} className={`w-full text-left px-4 py-3.5 rounded-2xl border-2 text-sm font-medium transition-all active:scale-[0.97] ${bg}`}>
              {opt}
              {selected !== null && i === q.correct && <span className="float-right">✨</span>}
              {selected !== null && i === selected && i !== q.correct && <span className="float-right">💔</span>}
            </button>
          );
        })}
      </div>
      <AnimatePresence>
        {feedbackMsg && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 text-center"><p className="text-sm font-medium italic" style={{ color: "#ec4899" }}>{feedbackMsg}</p></motion.div>)}
      </AnimatePresence>
    </div>
  );
}

/* ─── SPIN THE WHEEL ─── */
function SpinGame({ items }: { items: string[] }) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [showCard, setShowCard] = useState(false);

  const segAngle = 360 / items.length;
  const colors = ["#e11d48", "#f97316", "#a855f7", "#3b82f6", "#10b981", "#eab308"];

  const spin = () => {
    if (spinning) return;
    setSpinning(true); setResult(null); setShowCard(false);
    const newRot = rotation + 1800 + Math.random() * 360;
    setRotation(newRot);
    setTimeout(() => {
      const normDeg = newRot % 360;
      const idx = Math.floor(normDeg / segAngle) % items.length;
      setResult(items[items.length - 1 - idx]);
      setSpinning(false);
      setTimeout(() => setShowCard(true), 400);
    }, 3200);
  };

  const letterIdx = result ? items.indexOf(result) % SPIN_LETTERS.length : 0;

  return (
    <div className="flex flex-col items-center gap-5 py-4">
      <div className="relative">
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
          <div style={{ width: 0, height: 0, borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderTop: "16px solid #e11d48", filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.2))" }} />
        </div>
        <svg width="240" height="240" viewBox="-120 -120 240 240" className="drop-shadow-xl" style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? "transform 3s cubic-bezier(0.15, 0.8, 0.25, 1)" : "none" }}>
          {items.map((item, i) => {
            const startA = i * segAngle - 90;
            const endA = startA + segAngle;
            const sR = (startA * Math.PI) / 180;
            const eR = (endA * Math.PI) / 180;
            const x1 = Math.cos(sR) * 110; const y1 = Math.sin(sR) * 110;
            const x2 = Math.cos(eR) * 110; const y2 = Math.sin(eR) * 110;
            const midA = (((startA + endA) / 2) * Math.PI) / 180;
            const tX = Math.cos(midA) * 70; const tY = Math.sin(midA) * 70;
            const emoji = item.match(/\p{Emoji_Presentation}/u)?.[0] || "💕";
            return (<g key={i}><path d={`M 0 0 L ${x1} ${y1} A 110 110 0 0 1 ${x2} ${y2} Z`} fill={colors[i % colors.length]} stroke="white" strokeWidth="2" /><text x={tX} y={tY} textAnchor="middle" dominantBaseline="central" fontSize="24">{emoji}</text></g>);
          })}
          <circle cx="0" cy="0" r="24" fill="white" />
          <circle cx="0" cy="0" r="21" fill="#e11d48" />
          <text x="0" y="1" textAnchor="middle" dominantBaseline="central" fill="white" fontSize="8" fontWeight="bold">SPIN</text>
        </svg>
      </div>
      <button onClick={spin} disabled={spinning} className="px-8 py-3 rounded-full text-white font-bold text-sm disabled:opacity-50 active:scale-95 transition-transform" style={{ background: "linear-gradient(90deg, #e11d48, #ec4899)", boxShadow: "0 4px 15px rgba(225,29,72,0.3)" }}>
        {spinning ? "Spinning..." : "🎡 Spin!"}
      </button>
      <AnimatePresence>
        {showCard && result && (
          <motion.div initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ type: "spring" }} className="w-full">
            <div className="rounded-3xl p-5 border text-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, #fff1f2, #fce7f3, #fee2e2)", borderColor: "rgba(236,72,153,0.15)" }}>
              <p className="text-xs font-semibold mb-2 uppercase tracking-wider relative z-10" style={{ color: "#e11d48" }}>Your Surprise Activity</p>
              <p className="text-xl font-bold mb-3 relative z-10" style={{ color: "#881337" }}>{result}</p>
              <div className="w-10 h-[1px] mx-auto mb-3" style={{ background: "rgba(236,72,153,0.3)" }} />
              <p className="text-xs leading-relaxed italic whitespace-pre-line relative z-10" style={{ color: "rgba(136,19,55,0.6)" }}>&ldquo;{SPIN_LETTERS[letterIdx]}&rdquo;</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── LOVE MAZE ─── */
const MAZE_GRID = [[0,0,1,0,0,0,0],[1,0,1,0,1,1,0],[0,0,0,0,0,1,0],[0,1,1,1,0,0,0],[0,0,0,1,0,1,0],[1,1,0,0,0,1,0],[0,0,0,1,0,0,0]];

function MazeGame() {
  const [pos, setPos] = useState<[number, number]>([0, 0]);
  const [won, setWon] = useState(false);
  const [moves, setMoves] = useState(0);

  const move = useCallback((dr: number, dc: number) => {
    if (won) return;
    setPos(([r, c]) => {
      const nr = r + dr; const nc = c + dc;
      if (nr < 0 || nr >= 7 || nc < 0 || nc >= 7 || MAZE_GRID[nr][nc] === 1) return [r, c];
      setMoves((m) => m + 1);
      if (nr === 6 && nc === 6) setWon(true);
      return [nr, nc];
    });
  }, [won]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "ArrowUp") move(-1,0); else if (e.key === "ArrowDown") move(1,0); else if (e.key === "ArrowLeft") move(0,-1); else if (e.key === "ArrowRight") move(0,1); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [move]);

  const restart = () => { setPos([0, 0]); setWon(false); setMoves(0); };
  if (won) return <RomanticCard emoji="🌹" title={`Found Love in ${moves} moves!`} body={MAZE_WIN_MSG} onAction={restart} actionLabel="Play Again" />;

  const cellSize = 38;
  return (
    <div className="flex flex-col items-center gap-5 py-2">
      <p className="text-xs text-foreground/50 flex items-center gap-1"><Heart size={10} className="fill-rose-400 text-rose-400" /> Moves: {moves}</p>
      <div className="rounded-2xl overflow-hidden" style={{ width: cellSize * 7, height: cellSize * 7, border: "2px solid rgba(168,85,247,0.3)", boxShadow: "0 8px 25px rgba(139,92,246,0.15)" }}>
        {MAZE_GRID.map((row, r) => (<div key={r} className="flex">{row.map((cell, c) => {
          const isPlayer = pos[0] === r && pos[1] === c;
          const isGoal = r === 6 && c === 6;
          return (<div key={c} className="flex items-center justify-center text-sm" style={{ width: cellSize, height: cellSize, background: cell === 1 ? "#d8b4fe" : "#fff" }}>{isPlayer && <motion.span layout transition={{ type: "spring", stiffness: 500, damping: 30 }}>💕</motion.span>}{isGoal && !isPlayer && <span className="game-pulse inline-block">🌹</span>}</div>);
        })}</div>))}
      </div>
      <div className="grid grid-cols-3 gap-1.5 w-[130px]">
        <div /><button onClick={() => move(-1, 0)} className="w-10 h-10 rounded-xl text-white flex items-center justify-center active:scale-90 transition-transform mx-auto" style={{ background: "linear-gradient(180deg, #c026d3, #8b5cf6)" }}><ArrowUp size={18} /></button><div />
        <button onClick={() => move(0, -1)} className="w-10 h-10 rounded-xl text-white flex items-center justify-center active:scale-90 transition-transform mx-auto" style={{ background: "linear-gradient(180deg, #c026d3, #8b5cf6)" }}><ArrowLeft size={18} /></button>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto text-xs" style={{ background: "rgba(168,85,247,0.1)" }}>💕</div>
        <button onClick={() => move(0, 1)} className="w-10 h-10 rounded-xl text-white flex items-center justify-center active:scale-90 transition-transform mx-auto" style={{ background: "linear-gradient(180deg, #c026d3, #8b5cf6)" }}><ArrowRight size={18} /></button>
        <div /><button onClick={() => move(1, 0)} className="w-10 h-10 rounded-xl text-white flex items-center justify-center active:scale-90 transition-transform mx-auto" style={{ background: "linear-gradient(180deg, #c026d3, #8b5cf6)" }}><ArrowDown size={18} /></button><div />
      </div>
      <style jsx>{`
        .game-pulse { animation: gp 1.5s ease-in-out infinite; }
        @keyframes gp { 0%,100% { transform: scale(1); } 50% { transform: scale(1.2); } }
      `}</style>
    </div>
  );
}

/* ─── MEMORY MATCH ─── */
const MEMORY_EMOJIS = ["💕", "💍", "🌹", "💖", "✨", "🥂"];

function MemoryGame() {
  const [cards, setCards] = useState<{ emoji: string; flipped: boolean; matched: boolean }[]>([]);
  const [flippedIdx, setFlippedIdx] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  const initGame = useCallback(() => {
    const deck = [...MEMORY_EMOJIS, ...MEMORY_EMOJIS].sort(() => Math.random() - 0.5).map((emoji) => ({ emoji, flipped: false, matched: false }));
    setCards(deck); setFlippedIdx([]); setMoves(0); setWon(false);
  }, []);

  useEffect(() => { initGame(); }, [initGame]);

  const handleFlip = (idx: number) => {
    if (flippedIdx.length >= 2 || cards[idx].flipped || cards[idx].matched) return;
    const next = cards.map((c, i) => (i === idx ? { ...c, flipped: true } : c));
    setCards(next);
    const nf = [...flippedIdx, idx];
    setFlippedIdx(nf);
    if (nf.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = nf;
      if (next[a].emoji === next[b].emoji) {
        setTimeout(() => { setCards((p) => { const u = p.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c)); if (u.every((c) => c.matched)) setWon(true); return u; }); setFlippedIdx([]); }, 500);
      } else {
        setTimeout(() => { setCards((p) => p.map((c, i) => (i === a || i === b ? { ...c, flipped: false } : c))); setFlippedIdx([]); }, 800);
      }
    }
  };

  if (won) return <RomanticCard emoji="🎉" title={`Matched in ${moves} moves!`} body={MEMORY_WIN_MSG} onAction={initGame} actionLabel="Play Again" />;

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <p className="text-xs text-foreground/50 flex items-center gap-1"><Heart size={10} className="fill-rose-400 text-rose-400" /> Moves: {moves}</p>
      <div className="grid grid-cols-4 gap-2.5 w-full max-w-[280px] lg:max-w-[320px]">
        {cards.map((card, i) => (
          <button key={i} onClick={() => handleFlip(i)} className="aspect-square rounded-xl relative" style={{ perspective: "600px" }}>
            <div className="w-full h-full transition-transform duration-500 relative" style={{ transformStyle: "preserve-3d", transform: card.flipped || card.matched ? "rotateY(180deg)" : "rotateY(0)" }}>
              <div className="absolute inset-0 rounded-xl flex items-center justify-center" style={{ backfaceVisibility: "hidden", background: "linear-gradient(135deg, #e11d48, #ec4899)", boxShadow: "0 4px 12px rgba(225,29,72,0.2)" }}>
                <Heart size={16} className="text-white" style={{ fill: "rgba(255,255,255,0.5)" }} />
              </div>
              <div className={`absolute inset-0 rounded-xl flex items-center justify-center ${card.matched ? "bg-emerald-50 dark:bg-emerald-900/30 border-2 border-emerald-400" : "bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-gray-700"}`} style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
                <span className="text-2xl">{card.emoji}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
