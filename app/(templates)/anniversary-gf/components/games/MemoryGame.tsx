"use client";

import { useState, useCallback, useEffect, memo } from "react";
import { Heart } from "lucide-react";
import RomanticCard from "./RomanticCard";
import { MEMORY_EMOJIS, MEMORY_WIN_MSG } from "./constants";

interface Card {
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

export default memo(function MemoryGame() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIdx, setFlippedIdx] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  const initGame = useCallback(() => {
    const deck = [...MEMORY_EMOJIS, ...MEMORY_EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji) => ({ emoji, flipped: false, matched: false }));
    setCards(deck);
    setFlippedIdx([]);
    setMoves(0);
    setWon(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleFlip = useCallback(
    (idx: number) => {
      if (flippedIdx.length >= 2 || cards[idx].flipped || cards[idx].matched) return;
      const next = cards.map((c, i) => (i === idx ? { ...c, flipped: true } : c));
      setCards(next);
      const nf = [...flippedIdx, idx];
      setFlippedIdx(nf);
      if (nf.length === 2) {
        setMoves((m) => m + 1);
        const [a, b] = nf;
        if (next[a].emoji === next[b].emoji) {
          setTimeout(() => {
            setCards((p) => {
              const u = p.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c));
              if (u.every((c) => c.matched)) setWon(true);
              return u;
            });
            setFlippedIdx([]);
          }, 500);
        } else {
          setTimeout(() => {
            setCards((p) => p.map((c, i) => (i === a || i === b ? { ...c, flipped: false } : c)));
            setFlippedIdx([]);
          }, 800);
        }
      }
    },
    [flippedIdx, cards],
  );

  if (won) {
    return <RomanticCard emoji="🎉" title={`Matched in ${moves} moves!`} body={MEMORY_WIN_MSG} onAction={initGame} actionLabel="Play Again" />;
  }

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <p className="text-xs text-foreground/50 flex items-center gap-1">
        <Heart size={10} className="fill-rose-400 text-rose-400" /> Moves: {moves}
      </p>
      <div className="grid grid-cols-4 gap-2.5 w-full max-w-[280px] lg:max-w-[320px]">
        {cards.map((card, i) => (
          <button key={i} onClick={() => handleFlip(i)} className="aspect-square rounded-xl relative" style={{ perspective: "600px" }}>
            <div
              className="w-full h-full transition-transform duration-500 relative"
              style={{ transformStyle: "preserve-3d", transform: card.flipped || card.matched ? "rotateY(180deg)" : "rotateY(0)" }}
            >
              <div
                className="absolute inset-0 rounded-xl flex items-center justify-center"
                style={{
                  backfaceVisibility: "hidden",
                  background: "linear-gradient(135deg, #e11d48, #ec4899)",
                  boxShadow: "0 4px 12px rgba(225,29,72,0.2)",
                }}
              >
                <Heart size={16} className="text-white" style={{ fill: "rgba(255,255,255,0.5)" }} />
              </div>
              <div
                className={`absolute inset-0 rounded-xl flex items-center justify-center ${
                  card.matched
                    ? "bg-emerald-50 dark:bg-emerald-900/30 border-2 border-emerald-400 dark:border-emerald-600"
                    : "bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-gray-700"
                }`}
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              >
                <span className="text-2xl">{card.emoji}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});
