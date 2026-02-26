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
  { id: "home", label: "Home", emoji: "🏠" },
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
  accent: string;
  disabled?: boolean;
}

export interface Wish {
  name: string;
  message: string;
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

export interface WeddingData {
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
}

export const DEMO_DATA: WeddingData = {
  brideName: "Priya",
  groomName: "Rahul",
  weddingDate: "2026-03-15T11:00:00+05:30",
  venue: "Jaipur",
  blessing: "ॐ शुभ विवाह",
  bride: {
    name: "Priya Sharma",
    role: "The Bride",
    roleHindi: "दुल्हन",
    description:
      "A soul who paints the world with kindness. Loves chai, mountains, and her family.",
    photo: "",
    tags: [
      { emoji: "🎓", label: "MBA" },
      { emoji: "💼", label: "Designer" },
      { emoji: "🏙️", label: "Jaipur" },
    ],
  },
  groom: {
    name: "Rahul Verma",
    role: "The Groom",
    roleHindi: "दूल्हा",
    description:
      "A gentleman with a golden heart. Lives for cricket, code, and creating memories.",
    photo: "",
    tags: [
      { emoji: "🎓", label: "B.Tech" },
      { emoji: "💼", label: "Engineer" },
      { emoji: "🏙️", label: "Delhi" },
    ],
  },
  brideFamily: {
    title: "Bride's Family",
    parents: "Shri Rajesh Sharma & Smt. Sunita Sharma",
    grandparents: "Shri Anil Sharma & Smt. Kamla Sharma",
  },
  groomFamily: {
    title: "Groom's Family",
    parents: "Shri Vikram Verma & Smt. Meena Verma",
    grandparents: "Shri Hari Verma & Smt. Savitri Verma",
  },
  events: [
    { name: "Haldi", hindi: "हल्दी", icon: "🌿", date: "13 Mar", time: "10 AM", venue: "Sharma Residence", accent: "from-yellow-500/20 to-yellow-600/5 border-yellow-500/30", disabled: false },
    { name: "Mehendi", hindi: "मेहंदी", icon: "🌸", date: "13 Mar", time: "6 PM", venue: "Royal Garden", accent: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/30", disabled: false },
    { name: "Sangeet", hindi: "संगीत", icon: "🎶", date: "14 Mar", time: "7 PM", venue: "Grand Ballroom", accent: "from-violet-500/20 to-violet-600/5 border-violet-500/30", disabled: false },
    { name: "Baraat", hindi: "बारात", icon: "🐴", date: "15 Mar", time: "9 AM", venue: "City Palace Road", accent: "from-rose-500/20 to-rose-500/5 border-rose-500/30", disabled: false },
    { name: "Wedding", hindi: "विवाह", icon: "🔥", date: "15 Mar", time: "11 AM", venue: "Jaipur Palace Lawns", accent: "from-amber-500/20 to-amber-500/5 border-amber-500/30", disabled: false },
    { name: "Reception", hindi: "स्वागत", icon: "💃", date: "15 Mar", time: "7 PM", venue: "Grand Hall", accent: "from-blue-500/20 to-blue-500/5 border-blue-500/30", disabled: false },
  ],
  galleryImages: [
    { src: "/assets/marriage/weeding.png", alt: "Couple", span: "col-span-2 row-span-2" },
    { src: "/assets/couple1.jpeg", alt: "Bride", span: "" },
    { src: "/assets/couple2.jpeg", alt: "Groom", span: "" },
    { src: "/assets/couple3.jpeg", alt: "Decoration", span: "col-span-2" },
    { src: "/assets/couple4.jpeg", alt: "Pre-Wedding", span: "" },
    { src: "/assets/couple1.jpeg", alt: "Engagement", span: "" },
  ],
  wishes: [
    { name: "Amit & Neha", message: "Bahut bahut badhai ho! Dono ko bohot saari khushiyan mile. 💕" },
    { name: "Pooja Aunty", message: "God bless this beautiful couple. Sada suhagan raho beta. 🙏" },
    { name: "Vikash Bhai", message: "Arey waah! Bohot khushi ki baat hai. Maza aayega shaadi mein! 🎉" },
  ],
};
