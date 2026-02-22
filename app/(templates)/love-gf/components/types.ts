export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

export interface MusicTrack {
  title: string;
  artist: string;
  duration: string;
  src?: string;
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
    { title: "Perfect", artist: "Ed Sheeran", duration: "4:23", src: "/assets/LoveGf/music/perfect.mp3" },
    { title: "All of Me", artist: "John Legend", duration: "4:29", src: "/assets/LoveGf/music/allofme.mp3" },
    { title: "A Thousand Years", artist: "Christina Perri", duration: "4:46", src: "/assets/LoveGf/music/a-thousand-years.mp3" },
    { title: "Thinking Out Loud", artist: "Ed Sheeran", duration: "4:41", src: "/assets/LoveGf/music/thinkingoutloud.mp3" },
    { title: "Lover", artist: "Taylor Swift", duration: "3:41", src: "/assets/LoveGf/music/lover.mp3" },
    { title: "Until I Found Her", artist: "Stephen Sanchez", duration: "3:12", src: "/assets/LoveGf/music/untillifoundher.mp3" },
  ],
};
