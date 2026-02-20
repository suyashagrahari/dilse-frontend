export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

export interface MusicTrack {
  title: string;
  artist: string;
  duration: string;
}

export interface ContentData {
  recipientName: string;
  senderName: string;
  personalMessage: string;
  anniversaryDate: string;
  quizQuestions: QuizQuestion[];
  spinItems: string[];
  galleryPhotos: string[];
  musicTracks: MusicTrack[];
}

export type EditMode = null | "choose" | "ai" | "manual" | "preview" | "password";

export type GameId = "quiz" | "spin" | "maze" | "memory";

export interface Toast {
  id: number;
  type: "success" | "info" | "publish";
  title: string;
  message?: string;
  shareUrl?: string;
}

export const DEMO_CONTENT: ContentData = {
  recipientName: "My Love",
  senderName: "Your Forever ❤️",
  anniversaryDate: "2023-02-15T00:00:00",
  personalMessage:
    "Another year of us, another year of beautiful memories. You make my world complete. Here's to forever and beyond with you by my side.\n\nEvery moment we share becomes a treasure I hold close to my heart. Thank you for being the reason I smile every single day.",
  quizQuestions: [
    {
      question: "What's our special song?",
      options: [
        "Perfect — Ed Sheeran",
        "All of Me — John Legend",
        "A Thousand Years",
        "Thinking Out Loud",
      ],
      correct: 0,
    },
    {
      question: "Where was our first date?",
      options: ["Coffee Shop", "Park", "Restaurant", "Movie Theater"],
      correct: 2,
    },
    {
      question: "What do I love most about you?",
      options: ["Your Smile", "Your Kindness", "Everything!", "Your Eyes"],
      correct: 2,
    },
    {
      question: "Our dream vacation?",
      options: ["Paris", "Maldives", "Tokyo", "Anywhere with you"],
      correct: 3,
    },
  ],
  spinItems: [
    "Movie Night 🎬",
    "Cook Together 👨‍🍳",
    "Dance Party 💃",
    "Love Letter 💌",
    "Stargazing 🌟",
    "Surprise Date ❤️",
  ],
  galleryPhotos: [],
  musicTracks: [
    { title: "Perfect", artist: "Ed Sheeran", duration: "4:23" },
    { title: "All of Me", artist: "John Legend", duration: "4:29" },
    { title: "A Thousand Years", artist: "Christina Perri", duration: "4:45" },
    { title: "Thinking Out Loud", artist: "Ed Sheeran", duration: "4:41" },
    {
      title: "Can't Help Falling in Love",
      artist: "Elvis Presley",
      duration: "3:00",
    },
  ],
};

export const TABS = [
  { id: "cover", label: "Love" },
  { id: "games", label: "Games" },
  { id: "gallery", label: "Gallery" },
  { id: "music", label: "Music" },
] as const;

export type TabId = (typeof TABS)[number]["id"];

export const FLOAT_SEEDS = [
  { id: 0, emoji: "💍", left: 8, delay: 0, dur: 14, size: 18 },
  { id: 1, emoji: "💕", left: 22, delay: 3, dur: 12, size: 16 },
  { id: 2, emoji: "✨", left: 38, delay: 7, dur: 10, size: 14 },
  { id: 3, emoji: "🥂", left: 52, delay: 1, dur: 16, size: 20 },
  { id: 4, emoji: "💖", left: 66, delay: 5, dur: 11, size: 15 },
  { id: 5, emoji: "💕", left: 80, delay: 9, dur: 13, size: 17 },
  { id: 6, emoji: "💍", left: 15, delay: 4, dur: 15, size: 16 },
  { id: 7, emoji: "✨", left: 45, delay: 8, dur: 12, size: 14 },
  { id: 8, emoji: "💖", left: 58, delay: 2, dur: 14, size: 19 },
  { id: 9, emoji: "🌹", left: 72, delay: 6, dur: 10, size: 22 },
  { id: 10, emoji: "💗", left: 30, delay: 11, dur: 16, size: 15 },
  { id: 11, emoji: "🥂", left: 88, delay: 1, dur: 13, size: 18 },
];
