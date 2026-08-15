export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

export interface TruthDareItem {
  type: "truth" | "dare";
  text: string;
  photoUrl?: string;
  audioUrl?: string;
}

export interface PhotoItem {
  url: string;
  caption: string;
  cropX: number;
  cropY: number;
}

export interface HomeCoverPhoto {
  url: string;
  cropX: number;
  cropY: number;
  scale: number;
}

export const EMPTY_HOME_COVER: HomeCoverPhoto = {
  url: "",
  cropX: 50,
  cropY: 50,
  scale: 100,
};

export function clampHomeCoverCrop(c: HomeCoverPhoto): HomeCoverPhoto {
  return {
    url: c.url,
    cropX: Math.min(100, Math.max(0, Number.isFinite(c.cropX) ? c.cropX : 50)),
    cropY: Math.min(100, Math.max(0, Number.isFinite(c.cropY) ? c.cropY : 50)),
    scale: Math.min(200, Math.max(100, Number.isFinite(c.scale) ? c.scale : 100)),
  };
}

export interface MusicTrack {
  title: string;
  artist: string;
  src?: string;
}

export interface BirthdayData {
  recipientName: string;
  senderName: string;
  birthdayDate: string;
  birthdayWish: string;
  personalMessage: string;
  homeCoverPhoto: HomeCoverPhoto;
  homePhoto1: string; // top-right polaroid
  homePhoto2: string; // bottom-left polaroid
  galleryPhotos: PhotoItem[];
  musicTracks: MusicTrack[];
  quizQuestions: QuizQuestion[];
  truthDareQuestions: TruthDareItem[];
  surprisePhoto: string;
  surpriseAudioUrl: string;
  sharePhoto: string;
}

export type EditMode =
  | null
  | "choose"
  | "ai"
  | "ai-review"
  | "manual"
  | "preview"
  | "password";
export type TabId = "home" | "gallery" | "songs" | "games" | "surprise";

export interface Toast {
  id: number;
  message: string;
  title?: string;
  type?: "success" | "error" | "info" | "publish";
  shareUrl?: string;
}

export const DEMO_DATA: BirthdayData = {
  recipientName: "Samira Hadid",
  senderName: "Your Friend",
  birthdayDate: "",
  birthdayWish:
    "Wishing you a birthday filled with love, laughter, and cherished memories to last a lifetime.",
  personalMessage:
    "You bring so much joy and light into the world. May this special day be as wonderful as you are!",
  homeCoverPhoto: { url: "", cropX: 50, cropY: 50, scale: 100 },
  homePhoto1: "",
  homePhoto2: "",
  galleryPhotos: [],
  musicTracks: [
    { title: "Celebration", artist: "Kool & The Gang", src: "https://cdn.subhsandesh.in/gifts-media/assets/Birthday1/celebration.mp3" },
    { title: "Best Day of My Life", artist: "American Authors", src: "https://cdn.subhsandesh.in/gifts-media/assets/Birthday1/bestdayofmylife.mp3" },
    { title: "Dynamite", artist: "BTS", src: "https://cdn.subhsandesh.in/gifts-media/assets/Birthday1/dynamite.mp3" },
    { title: "Firework", artist: "Katy Perry", src: "https://cdn.subhsandesh.in/gifts-media/assets/Birthday1/firework.mp3" },
    { title: "Good Time", artist: "Owl City & Carly Rae Jepsen", src: "https://cdn.subhsandesh.in/gifts-media/assets/Birthday1/GoodTime.mp3" },
  ],
  quizQuestions: [
    {
      question: "What is the birthday person's favourite colour?",
      options: ["Pink", "Blue", "Green", "Purple"],
      correct: 0,
    },
    {
      question: "What would the birthday person pick as a birthday dessert?",
      options: ["Chocolate cake", "Ice cream", "Cheesecake", "Cupcakes"],
      correct: 0,
    },
    {
      question: "What superpower would the birthday person choose?",
      options: ["Flying", "Teleportation", "Mind reading", "Time travel"],
      correct: 3,
    },
  ],
  truthDareQuestions: [
    {
      type: "truth",
      text: "What is the most embarrassing thing that happened to you this year?",
    },
    {
      type: "truth",
      text: "What is your biggest dream for this coming year?",
    },
    { type: "dare", text: "Sing Happy Birthday to yourself right now!" },
    {
      type: "dare",
      text: "Do your best birthday dance move for 10 seconds!",
    },
    { type: "truth", text: "Who is the last person you texted today?" },
    {
      type: "dare",
      text: "Make a birthday wish out loud — share it with everyone!",
    },
  ],
  surprisePhoto: "",
  surpriseAudioUrl: "",
  sharePhoto: "",
};
