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
}

/** Single circular home hero photo (same framing controls as gallery) */
export interface HomeCoverPhoto {
  url: string;
  cropX: number;
  cropY: number;
  /** 100 = default fill; higher zooms in within the circle */
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
  /** Legacy darling pages only; cleared when saving a new home cover */
  homePhotos: string[];
  galleryPhotos: PhotoItem[];  // up to 10 gallery photos with letter + crop
  quizQuestions: QuizQuestion[];
  truthDareQuestions: TruthDareItem[];
  spinItems: string[];
  musicTracks: MusicTrack[];
}

/** Template / preview: circular home when the creator has not uploaded yet (matches hero art) */
export const DARLING_HOME_DEFAULT_COVER: HomeCoverPhoto = {
  url: "/assets/hero-bg.jpeg",
  cropX: 50,
  cropY: 32,
  scale: 118,
};

/** True when the page has a real user upload (not the default template photo). */
export function hasDarlingUserHomeCover(
  data: Pick<ContentData, "homeCoverPhoto" | "homePhotos">
): boolean {
  const u = data.homeCoverPhoto?.url?.trim();
  if (u) return true;
  return Boolean((data.homePhotos || []).some((x) => typeof x === "string" && Boolean(x?.trim())));
}

/** Darling home: user cover → legacy slot → default demo circle for template preview */
export function getDarlingHomeCoverDisplay(
  data: Pick<ContentData, "homeCoverPhoto" | "homePhotos">
): HomeCoverPhoto {
  const saved = data.homeCoverPhoto ? clampHomeCoverCrop(data.homeCoverPhoto) : EMPTY_HOME_COVER;
  if (saved.url.trim()) return saved;
  const legacy = (data.homePhotos || []).find((x): x is string => typeof x === "string" && Boolean(x?.trim()));
  if (legacy) return { ...EMPTY_HOME_COVER, url: legacy.trim() };
  return { ...DARLING_HOME_DEFAULT_COVER };
}

/** Love GF: circle layout only when user chose the new single-photo home (not legacy polaroids) */
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
  homePhotos: [],
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
