// ─── Catch — visual language ─────────────────────────────────────────────────
//
// A cute, candy-coloured arcade: dreamy pastel sky, chunky 3D buttons, a rounded
// display face (Fredoka, declared by the root layout) and bubblegum accents.
// Think a polished App Store casual game that happens to be a love letter.

export const C = {
  ink: "#2A1640",
  inkSoft: "#6B5A80",
  pink: "#FF4F9A",
  pinkDeep: "#D12A72",
  grape: "#7C5CFF",
  grapeDeep: "#5638D6",
  sun: "#FFD84D",
  sunDeep: "#E8A800",
  mint: "#2ED3A0",
  mintDeep: "#14A077",
  sky: "#8EC5FF",
  cream: "#FFF8F1",
  white: "#FFFFFF",
  red: "#FF4D5E",
} as const;

export const DISPLAY = `var(--font-fredoka), "Baloo 2", "Nunito", system-ui, sans-serif`;
export const BODY = `var(--font-outfit), system-ui, -apple-system, "Segoe UI", sans-serif`;
export const HAND = `var(--font-ct-hand), "Caveat", "Segoe Print", cursive`;

/** Sky per level: [top, middle, bottom]. The world warms as the run goes on. */
export const SKIES: readonly (readonly [string, string, string])[] = [
  ["#9FD3FF", "#C8B8FF", "#FFD0E8"],
  ["#FFB8D9", "#FFC9A8", "#FFE9A8"],
  ["#7A5CFF", "#D66BFF", "#FF9CC8"],
];

/** Gen-Z level names — the relationship, levelling up. */
export const LEVELS = [
  { name: "talking stage", sub: "easy does it" },
  { name: "situationship", sub: "things speed up 👀" },
  { name: "hard launch", sub: "final level · go go go" },
] as const;

/** What the combo counter shouts at each milestone. */
export const COMBO_WORDS: readonly [number, string][] = [
  [3, "cute!"],
  [5, "obsessed"],
  [8, "down bad 😩"],
  [12, "soulmate era"],
  [16, "UNREAL"],
  [20, "LEGENDARY 👑"],
];

export const comboWord = (n: number): string | null => {
  for (const [k, w] of COMBO_WORDS) if (n === k) return w;
  return null;
};

export const HIT_WORDS = ["ouch 💔", "rude!!", "not the ick", "blocked 🙅", "ew, no"];
export const PERFECT_WORDS = ["PERFECT!", "NAILED IT", "clean ✨", "SO smooth"];

export const initialOf = (name: string): string => {
  const t = (name || "").trim();
  return t ? t[0].toUpperCase() : "♥";
};

/** Emoji palette the editor offers for letter pieces. */
export const PIECE_EMOJIS = ["💌", "☕", "🧥", "🎧", "🍜", "🎵", "🐕", "📷", "🕯️", "🌧️", "✈️", "📚", "🍕", "🎮", "🌙", "🌻", "🧸", "💍", "🚲", "🍦", "🎬", "🏖️", "🍫", "⭐"] as const;
export const BAD_EMOJIS = ["💬", "👀", "🚩", "🥱", "📱", "⏰", "🙄", "🧊"] as const;
