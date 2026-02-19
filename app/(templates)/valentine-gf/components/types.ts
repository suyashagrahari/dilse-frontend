export interface ValentineData {
  recipientName: string;
  senderName: string;
  personalMessage: string;
  promises: string[];
  photos: string[];
  theme: "romantic" | "elegant" | "playful";
}

export const DEMO_CONTENT: ValentineData = {
  recipientName: "My Darling",
  senderName: "Forever Yours 💝",
  personalMessage:
    "In a world full of ordinary, you are my extraordinary. My heart beats for you, today and always.\n\nEvery moment I spend with you feels like a beautiful dream I never want to wake up from. You are my first thought in the morning and my last wish at night.\n\nYou are not just my Valentine — you are my everything. My heart, my soul, my forever love. I promise to love you more with each passing day.\n\nHappy Valentine's Day, my love.",
  promises: [
    "I promise to love you endlessly 💕",
    "You are my today and all of my tomorrows 🌅",
    "With you, every moment is magic ✨",
    "My heart beats only for you 💓",
  ],
  photos: [],
  theme: "romantic",
};

export const FLOAT_SEEDS = [
  { id: 0, emoji: "💕", left: 6, delay: 0, dur: 13, size: 16 },
  { id: 1, emoji: "💗", left: 20, delay: 3, dur: 15, size: 14 },
  { id: 2, emoji: "✨", left: 35, delay: 7, dur: 11, size: 12 },
  { id: 3, emoji: "💖", left: 50, delay: 1, dur: 16, size: 18 },
  { id: 4, emoji: "🌹", left: 65, delay: 5, dur: 12, size: 16 },
  { id: 5, emoji: "💘", left: 78, delay: 9, dur: 14, size: 15 },
  { id: 6, emoji: "❤️", left: 12, delay: 4, dur: 15, size: 14 },
  { id: 7, emoji: "✨", left: 42, delay: 8, dur: 12, size: 12 },
  { id: 8, emoji: "💝", left: 56, delay: 2, dur: 14, size: 17 },
  { id: 9, emoji: "🌹", left: 70, delay: 6, dur: 11, size: 20 },
  { id: 10, emoji: "💕", left: 28, delay: 11, dur: 16, size: 14 },
  { id: 11, emoji: "💗", left: 85, delay: 1, dur: 13, size: 16 },
  { id: 12, emoji: "💘", left: 48, delay: 10, dur: 12, size: 15 },
  { id: 13, emoji: "❤️", left: 92, delay: 7, dur: 15, size: 14 },
];

export const TABS = [
  { id: "cover", label: "Love" },
  { id: "letter", label: "Feelings" },
  { id: "final", label: "Forever" },
] as const;

export type TabId = (typeof TABS)[number]["id"];
