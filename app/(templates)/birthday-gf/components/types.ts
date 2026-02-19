export interface ContentData {
  recipientName: string;
  senderName: string;
  personalMessage: string;
  wishes: string[];
  photos: string[];
  theme: "romantic" | "elegant" | "playful";
}

export const DEMO_CONTENT: ContentData = {
  recipientName: "My Love",
  senderName: "Your Forever ❤️",
  personalMessage:
    "Every moment with you is a gift. On your special day, I want you to know how much you mean to me. You make my world brighter, my heart fuller, and my life more beautiful than I ever imagined.\n\nThank you for being you — for your smile that lights up every room, for your laugh that fills my heart with joy, and for your love that makes everything worthwhile.\n\nHere's to another year of love, laughter, and beautiful memories together. I love you more than words could ever express.",
  wishes: [
    "May all your dreams come true! ✨",
    "Wishing you endless happiness and joy 🌟",
    "Here's to amazing adventures together 🎈",
    "You deserve all the love in the world 💝",
  ],
  photos: [],
  theme: "romantic",
};

export const FLOAT_SEEDS = [
  { id: 0, emoji: "🎈", left: 8, delay: 0, dur: 12, size: 18 },
  { id: 1, emoji: "🎉", left: 22, delay: 3, dur: 14, size: 16 },
  { id: 2, emoji: "✨", left: 38, delay: 7, dur: 10, size: 14 },
  { id: 3, emoji: "🎊", left: 52, delay: 1, dur: 16, size: 20 },
  { id: 4, emoji: "⭐", left: 66, delay: 5, dur: 11, size: 15 },
  { id: 5, emoji: "💕", left: 80, delay: 9, dur: 13, size: 17 },
  { id: 6, emoji: "🎀", left: 15, delay: 4, dur: 15, size: 16 },
  { id: 7, emoji: "🌟", left: 45, delay: 8, dur: 12, size: 14 },
  { id: 8, emoji: "💖", left: 58, delay: 2, dur: 14, size: 19 },
  { id: 9, emoji: "🎂", left: 72, delay: 6, dur: 10, size: 22 },
  { id: 10, emoji: "🧁", left: 30, delay: 11, dur: 16, size: 15 },
  { id: 11, emoji: "🎁", left: 88, delay: 1, dur: 13, size: 18 },
  { id: 12, emoji: "💐", left: 48, delay: 10, dur: 11, size: 16 },
  { id: 13, emoji: "🦋", left: 92, delay: 7, dur: 15, size: 17 },
];

export const TABS = [
  { id: "cover", label: "Wish" },
  { id: "letter", label: "Letter" },
  { id: "final", label: "Surprise" },
] as const;

export type TabId = (typeof TABS)[number]["id"];
