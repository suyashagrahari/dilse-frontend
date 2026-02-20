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
  loveDate: string;
  quizQuestions: QuizQuestion[];
  spinItems: string[];
  galleryPhotos: string[];
  musicTracks: MusicTrack[];
}

export type EditMode = null | "choose" | "ai" | "manual" | "preview" | "password";

export type TabId = "home" | "gallery" | "music" | "games" | "notes";

export interface Toast {
  id: number;
  type: "success" | "info" | "publish";
  title: string;
  message?: string;
  shareUrl?: string;
}

export const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: "home", label: "Home", emoji: "🏠" },
  { id: "gallery", label: "Gallery", emoji: "📸" },
  { id: "music", label: "Music", emoji: "🎵" },
  { id: "games", label: "Games", emoji: "🎮" },
  { id: "notes", label: "Notes", emoji: "💌" },
];

export const DEMO_CONTENT: ContentData = {
  recipientName: "Jamie",
  senderName: "Alex",
  loveDate: "2022-08-14T00:00:00",
  personalMessage:
    "My dearest Jamie, every day with you feels like a beautiful dream. You are my sunshine on cloudy days, my laughter in silent rooms, and my home wherever we are. I love you more than words can say, and I'll keep showing you that every single day. You are my forever. 💕",
  quizQuestions: [
    {
      question: "What's their favorite thing about you?",
      options: ["Your smile 😊", "Your laugh 😄", "Your kindness 💗", "Your eyes 👀"],
      correct: 0,
    },
    {
      question: "Where is your dream date?",
      options: ["Paris, France 🗼", "Bali, Indonesia 🌴", "Maldives 🏖️", "Local cafe ☕"],
      correct: 2,
    },
    {
      question: "What's the most romantic thing they did?",
      options: ["Surprise visit 🚗", "Love letter 💌", "Cooked dinner 🍝", "Star walk 🌟"],
      correct: 1,
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
    { title: "Can't Help Falling in Love", artist: "Elvis Presley", duration: "3:02" },
    { title: "A Thousand Years", artist: "Christina Perri", duration: "4:46" },
    { title: "Thinking Out Loud", artist: "Ed Sheeran", duration: "4:41" },
  ],
};
