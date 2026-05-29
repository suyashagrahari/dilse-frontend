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
  url: string;    // base64 data URL
  letter: string; // love letter / caption
  cropX: number;  // 0-100 for CSS object-position-x
  cropY: number;  // 0-100 for CSS object-position-y
  scale: number;  // 100-200 zoom %
}

export interface HomeCoverPhoto {
  url: string;
  cropX: number;
  cropY: number;
  scale: number;
}

export interface HomePhoto {
  url: string;
  cropX: number;  // 0–100 object-position-x
  cropY: number;  // 0–100 object-position-y
  scale: number;  // 100–200 zoom %
}

export const EMPTY_HOME_PHOTO: HomePhoto = { url: "", cropX: 50, cropY: 50, scale: 100 };

export function normalizeHomePhoto(p: unknown): HomePhoto {
  if (typeof p === "string") return { url: p, cropX: 50, cropY: 50, scale: 100 };
  const o = p as Record<string, unknown>;
  return {
    url:   String(o.url   ?? ""),
    cropX: Number.isFinite(Number(o.cropX)) ? Number(o.cropX) : 50,
    cropY: Number.isFinite(Number(o.cropY)) ? Number(o.cropY) : 50,
    scale: Number.isFinite(Number(o.scale))
      ? Math.min(200, Math.max(100, Number(o.scale))) : 100,
  };
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
  duration: string;
  src?: string;
}

export interface ContentData {
  recipientName: string;
  senderName: string;
  personalMessage: string;
  wishMessage: string;
  loveDate: string;
  homeCoverPhoto: HomeCoverPhoto;
  homePhotos: HomePhoto[];
  galleryPhotos: PhotoItem[];  // up to 10 gallery photos with letter + crop
  quizQuestions: QuizQuestion[];
  truthDareQuestions: TruthDareItem[];
  spinItems: string[];
  musicTracks: MusicTrack[];
}

export function loveGfUsesCircleOnly(data: Pick<ContentData, "homeCoverPhoto">): boolean {
  return Boolean(data.homeCoverPhoto?.url?.trim());
}

export function getLoveGfCircleCover(data: ContentData): HomeCoverPhoto {
  if (data.homeCoverPhoto?.url?.trim()) return clampHomeCoverCrop(data.homeCoverPhoto);
  return EMPTY_HOME_COVER;
}

export type EditMode = null | "choose" | "ai" | "ai-review" | "manual" | "preview" | "password";

export type TabId = "home" | "wish" | "gallery" | "music" | "games" | "notes";

export interface Toast {
  id: number;
  type: "success" | "info" | "publish";
  title: string;
  message?: string;
  shareUrl?: string;
}

export const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "home",    label: "Home",   icon: "♡" },
  { id: "wish",    label: "Wish",   icon: "✦" },
  { id: "gallery", label: "Photos", icon: "📷" },
  { id: "music",   label: "Music",  icon: "♫" },
  { id: "games",   label: "Games",  icon: "✿" },
  { id: "notes",   label: "Notes",  icon: "✉" },
];

export const DEMO_CONTENT: ContentData = {
  recipientName: "My Love",
  senderName: "Always Yours",
  personalMessage:
    "Every moment with you is a treasure I hold close to my heart. You are my sunshine on cloudy days, my laughter in silent rooms, and my home wherever we are. I love you more than words can say, and I'll keep showing you that every single day.",
  wishMessage:
    "To the one who holds my heart — thank you for every laugh, every hug, every quiet moment that felt like the whole world. You are my favourite person. Love you to the moon and back ♡",
  loveDate: "",
  homeCoverPhoto: { ...EMPTY_HOME_COVER },
  homePhotos: [] as HomePhoto[],
  galleryPhotos: [],
  truthDareQuestions: [],
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
  musicTracks: [
    { title: "Perfect",           artist: "Ed Sheeran",      duration: "4:23", src: "/assets/LoveGf/music/perfect.mp3" },
    { title: "All of Me",         artist: "John Legend",     duration: "4:29", src: "/assets/LoveGf/music/allofme.mp3" },
    { title: "A Thousand Years",  artist: "Christina Perri", duration: "4:46", src: "/assets/LoveGf/music/a-thousand-years.mp3" },
    { title: "Thinking Out Loud", artist: "Ed Sheeran",      duration: "4:41", src: "/assets/LoveGf/music/thinkingoutloud.mp3" },
    { title: "Until I Found Her", artist: "Michael Bublé",   duration: "3:32", src: "/assets/LoveGf/music/untillifoundher.mp3" },
    { title: "Lover",             artist: "Taylor Swift",    duration: "3:41", src: "/assets/LoveGf/music/lover.mp3" },
  ],
};
