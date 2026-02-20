"use client";

import { useState, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ContentData } from "./types";
import { GLASS_BTN, GLASS_BAR } from "./styles";
import { GAMES } from "./games/constants";
import GameModal from "./games/GameModal";
import type { GameId } from "./types";

export default memo(function GamesTab({ data }: { data: ContentData }) {
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const closeGame = useCallback(() => setActiveGame(null), []);

  return (
    <motion.div
      key="games"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="px-4 pt-5 pb-24 h-screen flex flex-col overflow-hidden relative z-10 lg:items-center lg:pt-8"
    >
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 30%, var(--anni-radial-alt) 0%, transparent 70%)" }}
      />

      {["🎮", "💗", "✨", "🕹️", "🌸"].map((e, i) => (
        <span
          key={i}
          className="absolute pointer-events-none text-2xl float-emoji"
          style={{ left: `${12 + i * 18}%`, top: `${12 + (i % 3) * 28}%`, animationDelay: `${i * 0.7}s`, animationDuration: `${4 + i * 0.5}s` }}
        >
          {e}
        </span>
      ))}

      <div className="text-center mb-4 relative z-10 lg:mb-6">
        <h3
          className="font-script text-2xl lg:text-3xl"
          style={{ color: "var(--anni-text)", textShadow: "var(--anni-glow)" }}
        >
          Love Arcade 🕹️
        </h3>
        <p className="text-[11px] lg:text-xs font-medium" style={{ color: "var(--anni-text-muted)", textShadow: "var(--anni-glow-subtle)" }}>
          Tap a game to play together 💕
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 flex-1 relative z-10 lg:w-full lg:max-w-3xl xl:max-w-4xl lg:gap-4 lg:max-h-[65vh] lg:flex-initial">
        {GAMES.map((game, i) => (
          <motion.button
            key={game.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.06, type: "spring", stiffness: 300 }}
            onClick={() => setActiveGame(game.id)}
            className="flex flex-col items-center justify-center gap-2 active:scale-93 active:opacity-90 transition-all rounded-2xl p-3 lg:rounded-3xl lg:gap-3"
            style={GLASS_BTN}
          >
            <span className="text-4xl lg:text-5xl game-pulse" style={{ animationDelay: `${i * 0.2}s` }}>
              {game.emoji}
            </span>
            <span
              className="text-xs lg:text-sm font-bold whitespace-pre-line text-center leading-tight"
              style={{ color: "var(--anni-text)", textShadow: "var(--anni-glow-subtle)" }}
            >
              {game.label}
            </span>
          </motion.button>
        ))}
      </div>

      <motion.div
        className="flex items-center justify-center gap-3 py-3 mt-2 relative z-10 rounded-xl lg:w-full lg:max-w-md lg:mx-auto lg:mt-4"
        style={GLASS_BAR}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <span className="text-xl bounce-y">🎮</span>
        <p className="font-script text-sm lg:text-base" style={{ color: "var(--anni-text)", textShadow: "var(--anni-glow-subtle)" }}>
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

      <AnimatePresence>
        {activeGame && <GameModal gameId={activeGame} data={data} onClose={closeGame} />}
      </AnimatePresence>
    </motion.div>
  );
});
