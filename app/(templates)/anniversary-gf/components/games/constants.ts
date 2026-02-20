import type { GameId } from "../types";

export const GAMES: { id: GameId; emoji: string; label: string }[] = [
  { id: "quiz", emoji: "💝", label: "Love\nQuiz" },
  { id: "spin", emoji: "🎡", label: "Spin The\nWheel" },
  { id: "maze", emoji: "🌹", label: "Love\nMaze" },
  { id: "memory", emoji: "🧠", label: "Memory\nMatch" },
];

export const HEADER_BG: Record<GameId, string> = {
  quiz: "linear-gradient(90deg, #e11d48, #ec4899)",
  spin: "linear-gradient(90deg, #f59e0b, #f97316)",
  maze: "linear-gradient(90deg, #c026d3, #8b5cf6)",
  memory: "linear-gradient(90deg, #10b981, #14b8a6)",
};

export const CORRECT_MSGS = [
  "You know me so well! 💕",
  "Perfect, just like our love! 💍",
  "That's my soulmate! ✨",
  "Correct! Our bond is magical 🌟",
];

export const WRONG_MSGS = [
  "Oops! But even your mistakes make me smile 😘",
  "Wrong answer, right love! We'll learn together 💕",
  "That's okay! Your love score is still perfect 💖",
  "A little wrong, but always adorable 🌸",
];

export const WIN_SHAYARI = [
  { score: 4, text: "Every answer perfect, every moment true,\nNo one in this world knows love like you do 💕", emoji: "🏆" },
  { score: 3, text: "Almost perfect, just like our journey so far,\nYou're my moon, my sun, my brightest star ✨", emoji: "🌟" },
  { score: 2, text: "Half right, half to discover yet,\nOur love story is one I'll never forget 💖", emoji: "💖" },
  { score: 1, text: "The answers may miss, but this I know,\nMy love for you will forever grow 🌹", emoji: "🌹" },
  { score: 0, text: "Wrong answers don't mean wrong love, my dear,\nWith you beside me, I have nothing to fear 💗", emoji: "💗" },
];

export const SPIN_LETTERS = [
  "My dearest love, this moment is just for us.\nLet's make it magical — like every second with you 💕",
  "Promise me we'll do this together.\nYou make even the smallest things feel extraordinary ✨",
  "Every moment spent with you becomes\nmy new favorite memory. I love you endlessly 💍",
  "You turned my ordinary world into\na beautiful love story. Let's write another chapter 🌹",
];

export const MAZE_WIN_MSG =
  "Through every twist and turn, love finds a way.\nJust like us — always finding our way back to each other 💕";

export const MEMORY_WIN_MSG =
  "Every pair matched, every memory treasured.\nOur love is the greatest match of all 💍";

export const MAZE_GRID = [
  [0, 0, 1, 0, 0, 0, 0],
  [1, 0, 1, 0, 1, 1, 0],
  [0, 0, 0, 0, 0, 1, 0],
  [0, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 0, 1, 0],
  [1, 1, 0, 0, 0, 1, 0],
  [0, 0, 0, 1, 0, 0, 0],
];

export const MEMORY_EMOJIS = ["💕", "💍", "🌹", "💖", "✨", "🥂"];
