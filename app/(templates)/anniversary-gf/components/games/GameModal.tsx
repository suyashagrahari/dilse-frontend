"use client";

import { memo, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Loader2 } from "lucide-react";
import type { ContentData, GameId } from "../types";
import { GAMES, HEADER_BG } from "./constants";

const QuizGame = lazy(() => import("./QuizGame"));
const SpinGame = lazy(() => import("./SpinGame"));
const MazeGame = lazy(() => import("./MazeGame"));
const MemoryGame = lazy(() => import("./MemoryGame"));

function GameFallback() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 size={24} className="animate-spin text-rose-400" />
    </div>
  );
}

interface Props {
  gameId: GameId;
  data: ContentData;
  onClose: () => void;
}

export default memo(function GameModal({ gameId, data, onClose }: Props) {
  const game = GAMES.find((g) => g.id === gameId)!;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed inset-x-0 bottom-0 top-8 z-50 bg-background rounded-t-3xl shadow-2xl overflow-hidden flex flex-col lg:inset-x-[15%] xl:inset-x-[20%] lg:top-12 lg:bottom-4 lg:rounded-3xl"
      >
        <div
          className="px-5 py-4 flex items-center gap-3 shrink-0 text-white"
          style={{ background: HEADER_BG[gameId] }}
        >
          <span className="text-2xl">{game.emoji}</span>
          <div className="flex-1">
            <h3 className="font-bold lg:text-lg">{game.label.replace("\n", " ")}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 lg:p-8 lg:flex lg:justify-center">
          <div className="lg:w-full lg:max-w-lg">
            <Suspense fallback={<GameFallback />}>
              {gameId === "quiz" && <QuizGame questions={data.quizQuestions} />}
              {gameId === "spin" && <SpinGame items={data.spinItems} />}
              {gameId === "maze" && <MazeGame />}
              {gameId === "memory" && <MemoryGame />}
            </Suspense>
          </div>
        </div>
      </motion.div>
    </>
  );
});
