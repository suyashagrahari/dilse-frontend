"use client";

import { useState, useCallback, useEffect, memo } from "react";
import { motion } from "framer-motion";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Heart } from "lucide-react";
import RomanticCard from "./RomanticCard";
import { MAZE_GRID, MAZE_WIN_MSG } from "./constants";

const CELL_SIZE = 38;
const GRID_SIZE = 7;
const GOAL: [number, number] = [6, 6];
const MAZE_BTN_STYLE = { background: "linear-gradient(180deg, #c026d3, #8b5cf6)" };

export default memo(function MazeGame() {
  const [pos, setPos] = useState<[number, number]>([0, 0]);
  const [won, setWon] = useState(false);
  const [moves, setMoves] = useState(0);

  const move = useCallback(
    (dr: number, dc: number) => {
      if (won) return;
      setPos(([r, c]) => {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE || MAZE_GRID[nr][nc] === 1) return [r, c];
        setMoves((m) => m + 1);
        if (nr === GOAL[0] && nc === GOAL[1]) setWon(true);
        return [nr, nc];
      });
    },
    [won],
  );

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") move(-1, 0);
      else if (e.key === "ArrowDown") move(1, 0);
      else if (e.key === "ArrowLeft") move(0, -1);
      else if (e.key === "ArrowRight") move(0, 1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [move]);

  const restart = useCallback(() => {
    setPos([0, 0]);
    setWon(false);
    setMoves(0);
  }, []);

  if (won) {
    return <RomanticCard emoji="🌹" title={`Found Love in ${moves} moves!`} body={MAZE_WIN_MSG} onAction={restart} actionLabel="Play Again" />;
  }

  return (
    <div className="flex flex-col items-center gap-5 py-2">
      <p className="text-xs text-foreground/50 flex items-center gap-1">
        <Heart size={10} className="fill-rose-400 text-rose-400" /> Moves: {moves}
      </p>
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          width: CELL_SIZE * GRID_SIZE,
          height: CELL_SIZE * GRID_SIZE,
          border: "2px solid rgba(168,85,247,0.3)",
          boxShadow: "0 8px 25px rgba(139,92,246,0.15)",
        }}
      >
        {MAZE_GRID.map((row, r) => (
          <div key={r} className="flex">
            {row.map((cell, c) => {
              const isPlayer = pos[0] === r && pos[1] === c;
              const isGoal = r === GOAL[0] && c === GOAL[1];
              return (
                <div
                  key={c}
                  className="flex items-center justify-center text-sm"
                  style={{
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    background: cell === 1 ? "var(--anni-maze-wall)" : "var(--anni-maze-cell)",
                  }}
                >
                  {isPlayer && (
                    <motion.span layout transition={{ type: "spring", stiffness: 500, damping: 30 }}>
                      💕
                    </motion.span>
                  )}
                  {isGoal && !isPlayer && <span className="game-pulse inline-block">🌹</span>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-1.5 w-[130px]">
        <div />
        <button onClick={() => move(-1, 0)} className="w-10 h-10 rounded-xl text-white flex items-center justify-center active:scale-90 transition-transform mx-auto" style={MAZE_BTN_STYLE}><ArrowUp size={18} /></button>
        <div />
        <button onClick={() => move(0, -1)} className="w-10 h-10 rounded-xl text-white flex items-center justify-center active:scale-90 transition-transform mx-auto" style={MAZE_BTN_STYLE}><ArrowLeft size={18} /></button>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto text-xs" style={{ background: "rgba(168,85,247,0.1)" }}>💕</div>
        <button onClick={() => move(0, 1)} className="w-10 h-10 rounded-xl text-white flex items-center justify-center active:scale-90 transition-transform mx-auto" style={MAZE_BTN_STYLE}><ArrowRight size={18} /></button>
        <div />
        <button onClick={() => move(1, 0)} className="w-10 h-10 rounded-xl text-white flex items-center justify-center active:scale-90 transition-transform mx-auto" style={MAZE_BTN_STYLE}><ArrowDown size={18} /></button>
        <div />
      </div>
      <style jsx>{`
        .game-pulse { animation: gp 1.5s ease-in-out infinite; }
        @keyframes gp { 0%,100% { transform: scale(1); } 50% { transform: scale(1.2); } }
      `}</style>
    </div>
  );
});
