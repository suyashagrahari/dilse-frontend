export type TabId = "home" | "couple" | "events" | "gallery" | "blessings";
export type EditMode =
  | null
  | "choose"
  | "ai"
  | "ai-card"
  | "ai-text"
  | "ai-edit"
  | "manual"
  | "preview"
  | "password";

export interface Toast {
  id: number;
  type: "success" | "info" | "publish";
  title: string;
  message?: string;
  shareUrl?: string;
}

export const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: "home", label: "Card", emoji: "💌" },
  { id: "couple", label: "Us", emoji: "💑" },
  { id: "events", label: "Events", emoji: "📅" },
  { id: "gallery", label: "Gallery", emoji: "📸" },
  { id: "blessings", label: "Blessings", emoji: "🙏" },
];

export interface WeddingEvent {
  name: string;
  hindi: string;
  icon: string;
  date: string;
  time: string;
  venue: string;
  /** Shown in the event detail modal */
  details: string;
  accent: string;
  disabled?: boolean;
}

export interface Wish {
  name: string;
  message: string;
  /** URL from server after voice upload */
  voiceUrl?: string;
}

export interface CoupleInfo {
  name: string;
  role: string;
  roleHindi: string;
  description: string;
  photo: string;
  tags: { emoji: string; label: string }[];
}

export interface FamilyInfo {
  title: string;
  parents: string;
  grandparents: string;
}

export interface ShaadiData {
  brideName: string;
  groomName: string;
  weddingDate: string;
  venue: string;
  blessing: string;
  bride: CoupleInfo;
  groom: CoupleInfo;
  brideFamily: FamilyInfo;
  groomFamily: FamilyInfo;
  events: WeddingEvent[];
  galleryImages: { src: string; alt: string; span: string }[];
  wishes: Wish[];
  sharePhoto?: string;
}

// Re-export as WeddingData for hooks compatibility
export type WeddingData = ShaadiData;

export const DEMO_DATA: ShaadiData = {
  brideName: "Ananya",
  groomName: "Arjun",
  weddingDate: "2026-04-15T11:00:00+05:30",
  venue: "Udaipur",
  blessing: "ॐ शुभ विवाह",
  bride: {
    name: "Ananya Mehta",
    role: "The Bride",
    roleHindi: "दुल्हन",
    description:
      "A soul full of warmth and grace. Loves poetry, sunsets, and chai on rainy mornings.",
    photo: "",
    tags: [
      { emoji: "🎓", label: "MBA" },
      { emoji: "💼", label: "Designer" },
      { emoji: "🏙️", label: "Udaipur" },
    ],
  },
  groom: {
    name: "Arjun Kapoor",
    role: "The Groom",
    roleHindi: "दूल्हा",
    description:
      "A dreamer with a kind heart. Passionate about travel, music, and making people smile.",
    photo: "",
    tags: [
      { emoji: "🎓", label: "B.Tech" },
      { emoji: "💼", label: "Architect" },
      { emoji: "🏙️", label: "Mumbai" },
    ],
  },
  brideFamily: {
    title: "Bride's Family",
    parents: "Shri Deepak Mehta & Smt. Kavita Mehta",
    grandparents: "Shri Suresh Mehta & Smt. Laxmi Mehta",
  },
  groomFamily: {
    title: "Groom's Family",
    parents: "Shri Anil Kapoor & Smt. Ritu Kapoor",
    grandparents: "Shri Harbans Kapoor & Smt. Pushpa Kapoor",
  },
  events: [
    { name: "Haldi", hindi: "हल्दी", icon: "🌿", date: "13 Apr", time: "10 AM", venue: "Mehta Residence", details: "Turmeric ceremony with close family. Please wear comfortable yellow or pastel outfits.", accent: "from-yellow-500/20 to-yellow-600/5 border-yellow-500/30", disabled: false },
    { name: "Mehendi", hindi: "मेहंदी", icon: "🌸", date: "13 Apr", time: "6 PM", venue: "Rose Garden", details: "Music, mehendi artists, and dinner under the stars. Casual festive attire welcome.", accent: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/30", disabled: false },
    { name: "Sangeet", hindi: "संगीत", icon: "🎶", date: "14 Apr", time: "7 PM", venue: "Lake Palace Ballroom", details: "Performances, dance floor, and celebration night. Glamorous ethnic or fusion looks encouraged.", accent: "from-violet-500/20 to-violet-600/5 border-violet-500/30", disabled: false },
    { name: "Baraat", hindi: "बारात", icon: "🐴", date: "15 Apr", time: "9 AM", venue: "City Chowk", details: "Groom’s procession arrives at the venue. Guests may join the baraat or meet at the palace gates.", accent: "from-rose-500/20 to-rose-500/5 border-rose-500/30", disabled: false },
    { name: "Wedding", hindi: "विवाह", icon: "🔥", date: "15 Apr", time: "11 AM", venue: "Fateh Sagar Palace", details: "Sacred vows and rituals followed by lunch. Traditional Indian attire requested.", accent: "from-amber-500/20 to-amber-500/5 border-amber-500/30", disabled: false },
    { name: "Reception", hindi: "स्वागत", icon: "💃", date: "15 Apr", time: "7 PM", venue: "Grand Haveli Hall", details: "Dinner, speeches, and dancing. Formal or cocktail ethnic wear.", accent: "from-blue-500/20 to-blue-500/5 border-blue-500/30", disabled: false },
  ],
  galleryImages: [
    { src: "/assets/marriage/weeding.webp", alt: "Couple", span: "col-span-2 row-span-2" },
    { src: "/assets/couple1.webp", alt: "Bride", span: "" },
    { src: "/assets/couple2.webp", alt: "Groom", span: "" },
    { src: "/assets/couple3.webp", alt: "Decoration", span: "col-span-2" },
    { src: "/assets/couple4.webp", alt: "Pre-Wedding", span: "" },
    { src: "/assets/couple1.webp", alt: "Engagement", span: "" },
  ],
  wishes: [
    { name: "Rohit & Priya", message: "Bahut bahut badhai ho! Dono ko bohot saari khushiyan mile. 💕" },
    { name: "Sunita Aunty", message: "God bless this beautiful couple. Sada suhagan raho beta. 🙏" },
    { name: "Kabir Bhai", message: "Arey waah! Bohot khushi ki baat hai. Maza aayega shaadi mein! 🎉" },
  ],
};
